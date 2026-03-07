/**
 * Auth-related Convex functions for the example app.
 *
 * These are Convex query/mutation functions that use
 * ctx.auth.getUserIdentity() for JWT-validated auth.
 */
import { query } from "./_generated/server";

/**
 * Get the currently authenticated user's identity.
 * Returns null if not authenticated.
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		return identity;
	},
});
