const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const buildApi = require("./routes/api");
const {
	parseAllowedOrigins,
	applySecurityHeaders,
	buildCorsOriginResolver,
} = require("./services/httpSecurityService");

module.exports = function buildApp(container) {
	const app = express();
	app.disable("x-powered-by");

	// CORS allow list
	const allowedOrigins = parseAllowedOrigins(container.config.corsOrigin);

	app.use((req, res, next) => {
		// Security headers
		applySecurityHeaders(res);
		next();
	});

	app.use(
		cors({
			origin: buildCorsOriginResolver(allowedOrigins),
			credentials: true,
		}),
	);
	// Payload cap
	app.use(express.json({ limit: "2mb" }));
	app.use(cookieParser());

	app.use("/api", buildApi(container));
	app.use(
		"/assets",
		express.static(path.join(process.cwd(), "public/assets")),
	);
	app.use("/logos", express.static(path.join(process.cwd(), "public/logos")));
	app.use(
		"/bundle.js",
		express.static(path.join(process.cwd(), "src/windows/dist/bundle.js")),
	);
	app.use(express.static(path.join(process.cwd(), "src/windows")));

	return app;
};
