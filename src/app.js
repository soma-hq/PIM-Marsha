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
const { ROUTES, PATHS } = require("./utils/constants");

module.exports = function buildApp(container) {
	const app = express();
	app.disable("x-powered-by");

	const allowedOrigins = parseAllowedOrigins(container.config.corsOrigin);

	app.use((_req, res, next) => {
		applySecurityHeaders(res);
		next();
	});

	app.use(
		cors({
			origin: buildCorsOriginResolver(allowedOrigins),
			credentials: true,
		}),
	);
	app.use(express.json({ limit: container.config.api.payloadLimit }));
	app.use(cookieParser());

	app.use(ROUTES.API, buildApi(container));
	app.use(
		ROUTES.ASSETS,
		express.static(path.join(process.cwd(), PATHS.PUBLIC_ASSETS)),
	);
	app.use(
		ROUTES.LOGOS,
		express.static(path.join(process.cwd(), PATHS.PUBLIC_LOGOS)),
	);
	app.use(
		ROUTES.BUNDLE,
		express.static(path.join(process.cwd(), PATHS.WINDOWS_BUNDLE)),
	);
	app.use(express.static(path.join(process.cwd(), PATHS.WINDOWS_ROOT)));

	return app;
};
