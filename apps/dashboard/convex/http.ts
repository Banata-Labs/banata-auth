import { registerBanataAuthNodeProxyRoutes } from "@banata-auth/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { createAuth } from "./banataAuth/auth";

const http = httpRouter();

registerBanataAuthNodeProxyRoutes(http, createAuth, internal.authNode.handleAuthRequest);

export default http;
