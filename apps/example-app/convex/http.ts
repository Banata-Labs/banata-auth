/**
 * Convex HTTP router for the example app.
 *
 * Registers Better Auth HTTP routes so the auth endpoints
 * are accessible at the Convex .site URL.
 */
import { registerBanataAuthNodeProxyRoutes } from "@banata-auth/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { createAuth } from "./banataAuth/auth";

const http = httpRouter();

// Register all Better Auth routes (sign-in, sign-up, OAuth, JWKS, etc.)
registerBanataAuthNodeProxyRoutes(http, createAuth, internal.authNode.handleAuthRequest);

export default http;
