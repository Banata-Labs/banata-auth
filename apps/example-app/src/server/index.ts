import { serve } from "@hono/node-server";
import { env } from "@server/lib/env";
import { appRoutes } from "@server/routes/app";
import { authRoutes } from "@server/routes/auth";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

app.route("/api/auth", authRoutes);
app.route("/api/app", appRoutes);

app.get("/health", (c) => c.json({ status: "ok" }));

if (process.env.NODE_ENV === "production") {
	app.use("/*", serveStatic({ root: "./dist/client" }));
	app.get("*", serveStatic({ path: "./dist/client/index.html" }));
}

serve({
	fetch: app.fetch,
	port: env.port,
});

console.log(`Banata example server listening on http://localhost:${env.port}`);
