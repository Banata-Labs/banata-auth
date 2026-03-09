import { createApi } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import type { GenericDataModel } from "convex/server";
import schema from "./schema";

type BanataAuthAdapterApi = ReturnType<typeof createApi<typeof schema>>;

/**
 * Build the local adapter functions needed by the installed Banata component.
 *
 * Consumers still need a local `convex/banataAuth/adapter.ts` because the
 * adapter closes over the app's auth factory. The packaged component provides
 * the schema so the local file stays minimal.
 *
 * @example
 * ```ts
 * import { createBanataAuthAdapter } from "@banata-auth/convex/adapter";
 * import { createAuthOptions } from "./auth";
 *
 * export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
 *   createBanataAuthAdapter(createAuthOptions);
 * ```
 */
export function createBanataAuthAdapter<TDataModel extends GenericDataModel>(
	createAuthOptions: (ctx: GenericCtx<TDataModel>) => BetterAuthOptions,
): BanataAuthAdapterApi {
	return createApi(schema, createAuthOptions);
}

export { createApi, schema as banataAuthSchema };
