import { defineApp } from "convex/server";
import banataAuth from "./banataAuth/convex.config";

const app: ReturnType<typeof defineApp> = defineApp();
app.use(banataAuth);

export default app;
