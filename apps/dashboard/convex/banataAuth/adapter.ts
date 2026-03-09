import { createBanataAuthAdapter } from "@banata-auth/convex/adapter";
import { createAuthOptions } from "./auth";

const adapterApi = createBanataAuthAdapter(createAuthOptions);

export const create: typeof adapterApi.create = adapterApi.create;
export const findOne: typeof adapterApi.findOne = adapterApi.findOne;
export const findMany: typeof adapterApi.findMany = adapterApi.findMany;
export const updateOne: typeof adapterApi.updateOne = adapterApi.updateOne;
export const updateMany: typeof adapterApi.updateMany = adapterApi.updateMany;
export const deleteOne: typeof adapterApi.deleteOne = adapterApi.deleteOne;
export const deleteMany: typeof adapterApi.deleteMany = adapterApi.deleteMany;
