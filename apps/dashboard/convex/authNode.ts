"use node";

import { createBanataNodeAuth, handleBanataNodeAuthRequest } from "@banata-auth/convex/node";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { v } from "convex/values";
import type { DataModel } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import authConfig from "./auth.config";
import { authComponent, getConfig } from "./banataAuth/auth";

const serializedHeader = v.object({
	key: v.string(),
	value: v.string(),
});

const createNodeAuth = (ctx: GenericCtx<DataModel>) =>
	createBanataNodeAuth(ctx, {
		authComponent,
		authConfig,
		config: getConfig(),
	});

export const handleAuthRequest = internalAction({
	args: {
		request: v.object({
			method: v.string(),
			url: v.string(),
			headers: v.array(serializedHeader),
			body: v.union(v.string(), v.null()),
		}),
	},
	returns: v.object({
		status: v.number(),
		headers: v.array(serializedHeader),
		body: v.union(v.string(), v.null()),
	}),
	handler: async (ctx, args) => {
		return await handleBanataNodeAuthRequest(ctx, createNodeAuth, args.request);
	},
});
