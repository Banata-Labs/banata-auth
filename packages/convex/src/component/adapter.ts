/**
 * Re-export `createApi` from @convex-dev/better-auth for consumers.
 *
 * Per the Convex component pattern, consumers call `createApi` directly
 * in their local `convex/banataAuth/adapter.ts` to generate the CRUD
 * functions (create, findOne, findMany, updateOne, updateMany, deleteOne,
 * deleteMany) needed by the component adapter.
 *
 * @example
 * ```ts
 * // convex/banataAuth/adapter.ts
 * import { createApi } from "@banata-auth/convex/adapter";
 * import { createAuthOptions } from "./auth";
 * import schema from "./schema";
 *
 * export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany }
 *   = createApi(schema, createAuthOptions);
 * ```
 */

export { createApi } from "@convex-dev/better-auth";
