const AppContainer = require("./core/AppContainer");
const buildApp = require("./app");

async function start() {
	// App wiring
	const container = new AppContainer();
	await container.init();

	// Http server
	const app = buildApp(container);
	const port = container.config.port;
	// Http boot
	const server = app.listen(port, () => {
		container.logger.info(`PIM Marsha running on http://localhost:${port}`);
	});

	// Startup guard
	server.once("error", (error) => {
		if (error.code === "EADDRINUSE") {
			container.logger.error(
				`Port ${port} deja utilise. Ce projet est configure pour utiliser uniquement ce port.`,
			);
			process.exit(1);
			return;
		}

		container.logger.error(error);
		process.exit(1);
	});
}

// Fail fast
start().catch((error) => {
	console.error(error);
	process.exit(1);
});
