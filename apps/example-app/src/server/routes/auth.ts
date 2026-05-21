import { proxyBanataAuth } from "@server/lib/banata";
import { Hono } from "hono";

export const authRoutes = new Hono();

authRoutes.all("/*", async (c) => proxyBanataAuth(c));
