import { defineComponent } from "convex/server";

/**
 * Banata Auth Convex component definition.
 *
 * This creates an isolated namespace within Convex for all auth tables.
 * The component is registered in the consumer's convex.config.ts via:
 *
 * ```ts
 * import banataAuth from "@banata-auth/convex/convex.config";
 * app.use(banataAuth);
 * ```
 */
const component = defineComponent("banataAuth");
export default component;
