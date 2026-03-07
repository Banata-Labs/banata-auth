import { getAuthConfigProvider } from "@banata-auth/convex/auth-config";
import type { AuthConfig } from "convex/server";

export default {
	providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
