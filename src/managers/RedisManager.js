const { EventEmitter } = require("events");
const RedisClient = require("ioredis");
const isJson = require("../utils/isJson");

module.exports = class RedisManager extends EventEmitter {
	constructor(app) {
		super();

		this.app = app;
		this.redisSetter = null;
		this.redisPublisher = null;
		this.redisSubscriber = null;
		this._connectionOptions = null;
	}

	get cache() {
		return this.redisSetter;
	}

	get config() {
		return this.app.config.redis;
	}

	get logger() {
		return this.app.logger;
	}

	get prefix() {
		return this.config.prefix || "";
	}

	_getConnectionOptions() {
		if (this._connectionOptions) return this._connectionOptions;

		this._connectionOptions = {
			db: this.config.db,
			password: this.config.password,
			reconnectOnError: (err) =>
				!(
					err.message.includes("NOAUTH") ||
					err.message.includes("ERR")
				),
			enableReadyCheck: true,
			lazyConnect: true,
			retryStrategy: (times) => Math.min(times * 50, 2000),
			maxRetriesPerRequest: 3,
			commandTimeout: 5000,
		};

		return this._connectionOptions;
	}

	async _createClient(purpose = "generic") {
		const client = new RedisClient(
			this.config.port,
			this.config.host,
			this._getConnectionOptions(),
		);

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`Redis ${purpose} client connection timeout`));
			}, 10000);

			const onEvent = (err) => {
				clearTimeout(timeout);
				client.removeListener("error", onEvent);
				client.removeListener("ready", onEvent);

				if (err) {
					this.logger.error(
						`Redis ${purpose} connection error:`,
						err,
					);
					return reject(err);
				}

				return resolve(client);
			};

			client.once("error", onEvent);
			client.once("ready", onEvent);
			client.connect().catch((err) => onEvent(err));
		});
	}

	async connect() {
		if (!this.config.enabled) {
			this.logger.warn("Redis disabled by configuration");
			return this;
		}

		this.redisSetter = await this._createClient("setter");
		this._setupHeartbeat(this.redisSetter);
		return this;
	}

	_setupHeartbeat(client) {
		const interval = setInterval(() => {
			if (client.status === "ready") {
				client
					.ping()
					.catch((err) =>
						this.logger.warn(
							"Redis heartbeat failed:",
							err.message,
						),
					);
			}
		}, 30000);

		client.once("end", () => clearInterval(interval));
	}

	_initListener() {
		if (!this.redisSubscriber) return;

		this.redisSubscriber.removeAllListeners("message");

		this.redisSubscriber.on("message", (channel, message) => {
			try {
				this.emit("message", channel, message);

				if (!isJson(message)) return;
				const data = JSON.parse(message);

				const syncConfig = this.app.database?.config?.synchronize;
				if (syncConfig?.status && channel === syncConfig.event)
					this.app.database.listener(data);
			} catch (error) {
				this.logger.error("Error processing Redis message:", error);
			}
		});

		this.redisSubscriber.on("reconnecting", () => {
			this.logger.warn("Redis subscriber reconnecting...");
		});
	}

	async subscribe(channel) {
		if (!this.config.enabled) return;

		if (!channel)
			throw new Error("Channel name is required for subscription");

		if (!this.redisSubscriber) {
			this.redisSubscriber = await this._createClient("subscriber");
			this._initListener();
		}

		await this.redisSubscriber.subscribe(channel);
		this.logger.debug(`Subscribed to Redis channel: ${channel}`);
	}

	async publish(channel, message) {
		if (!this.config.enabled) return 0;

		if (!channel)
			throw new Error("Channel name is required for publishing");

		const payload =
			typeof message === "object"
				? JSON.stringify(message)
				: String(message);

		if (!this.redisPublisher)
			this.redisPublisher = await this._createClient("publisher");

		const recipients = await this.redisPublisher.publish(channel, payload);
		this.logger.debug(
			`Published message to ${channel}, received by ${recipients} clients`,
		);
		return recipients;
	}

	async findKeys(match, options = {}) {
		if (!this.cache)
			throw new Error(
				"Redis cache not initialized, call connect() first",
			);

		const count = options.count || 1000;
		const limit = options.limit || 0;

		const stream = this.cache.scanStream({ match, count });
		const keys = [];

		await new Promise((resolve, reject) => {
			stream.on("error", reject);
			stream.on("end", resolve);
			stream.on("data", (batch) => {
				if (!batch.length) return;
				keys.push(...batch);

				if (limit > 0 && keys.length >= limit) {
					stream.close();
					resolve();
				}
			});
		});

		return limit > 0 ? keys.slice(0, limit) : keys;
	}

	async disconnect() {
		const clients = [
			this.redisSetter,
			this.redisPublisher,
			this.redisSubscriber,
		].filter(Boolean);

		await Promise.all(
			clients.map(async (client) => {
				try {
					await client.disconnect();
				} catch (error) {
					this.logger.warn(
						"Error disconnecting Redis client:",
						error.message,
					);
				}
			}),
		);

		this.redisSetter = null;
		this.redisPublisher = null;
		this.redisSubscriber = null;
		this._connectionOptions = null;
	}
};
