/**
 * Adapter CRUD functions for the Banata Auth component.
 *
 * These are the database operations that Better Auth calls internally.
 * The `createApi` function generates Convex mutation/query functions
 * that the adapter uses to read/write auth data.
 */
import { createApi } from "@convex-dev/better-auth";
import { createAuthOptions } from "./auth";
import schema from "./schema";

const adapterApi = createApi(schema, createAuthOptions);

export const create: typeof adapterApi.create = adapterApi.create;
export const findOne: typeof adapterApi.findOne = adapterApi.findOne;
export const findMany: typeof adapterApi.findMany = adapterApi.findMany;
export const updateOne: typeof adapterApi.updateOne = adapterApi.updateOne;
export const updateMany: typeof adapterApi.updateMany = adapterApi.updateMany;
export const deleteOne: typeof adapterApi.deleteOne = adapterApi.deleteOne;
export const deleteMany: typeof adapterApi.deleteMany = adapterApi.deleteMany;
