export { banataAuthProxy, banataAuthMiddleware } from "./middleware";
export type { BanataAuthMiddlewareOptions } from "./middleware";
export { createRouteHandler } from "./route-handler";

// Re-export from better-auth/cookies so consumers can use it directly
// in proxy.ts without needing better-auth as a direct dependency.
export { getSessionCookie } from "better-auth/cookies";
