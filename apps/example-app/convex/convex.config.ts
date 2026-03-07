/**
 * Convex app configuration for the example app.
 *
 * Registers the Banata Auth component as a local component.
 */
import { defineApp } from "convex/server";
import banataAuth from "./banataAuth/convex.config";

const app: ReturnType<typeof defineApp> = defineApp();

app.use(banataAuth);

export default app;
