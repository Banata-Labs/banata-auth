import { createApi } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import type { GenericDataModel } from "convex/server";
import schema from "./component/schema";

type BanataAuthAdapterApi = ReturnType<typeof createApi<typeof schema>>;

/**
 * Build the local adapter functions needed by the installed Banata component.
 *
 * Consumers can keep a tiny local `convex/banataAuth/adapter.ts` when they
 * want one, but the packaged child component also exports its own adapter
 * functions so runtime auth paths work without extra wiring.
 */
export function createBanataAuthAdapter<TDataModel extends GenericDataModel>(
	createAuthOptions: (ctx: GenericCtx<TDataModel>) => BetterAuthOptions,
): BanataAuthAdapterApi {
	return createApi(schema, createAuthOptions);
}

export { createApi, schema as banataAuthSchema };
