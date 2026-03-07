/**
 * Auth API route handler.
 *
 * Proxies auth requests from Next.js to the Convex .site URL
 * where Better Auth HTTP routes are registered.
 */
import { handler } from "@/lib/auth-server";

export const { GET, POST } = handler;
