import { createApi } from "@convex-dev/better-auth";
import { options } from "./authOptions";
import schema from "./schema";

type ComponentAdapterApi = ReturnType<typeof createApi<typeof schema>>;

const adapterApi: ComponentAdapterApi = createApi(schema, () => options);

export const create: typeof adapterApi.create = adapterApi.create;
export const findOne: typeof adapterApi.findOne = adapterApi.findOne;
export const findMany: typeof adapterApi.findMany = adapterApi.findMany;
export const updateOne: typeof adapterApi.updateOne = adapterApi.updateOne;
export const updateMany: typeof adapterApi.updateMany = adapterApi.updateMany;
export const deleteOne: typeof adapterApi.deleteOne = adapterApi.deleteOne;
export const deleteMany: typeof adapterApi.deleteMany = adapterApi.deleteMany;
