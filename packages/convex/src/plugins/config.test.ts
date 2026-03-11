import { describe, expect, it } from "vitest";
import { __configPluginTesting } from "./config";

describe("configPlugin dashboard config merge", () => {
	it("merges nested email password policy overrides", () => {
		const config = __configPluginTesting.buildStaticConfig(undefined, "project");

		__configPluginTesting.deepMergeConfig(config, {
			emailPassword: {
				requireEmailVerification: false,
				autoSignIn: false,
				minPasswordLength: 12,
				maxPasswordLength: 64,
			},
		});

		expect(config.emailPassword).toEqual({
			requireEmailVerification: false,
			autoSignIn: false,
			minPasswordLength: 12,
			maxPasswordLength: 64,
		});
	});
});
