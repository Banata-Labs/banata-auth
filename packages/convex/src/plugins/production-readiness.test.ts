import { describe, expect, it } from "vitest";
import { productionReadinessPlugin } from "./production-readiness";

describe("productionReadinessPlugin", () => {
	it("registers phone OTP and linked-device endpoints", () => {
		const plugin = productionReadinessPlugin();

		expect(plugin.id).toBe("banata-production-readiness");
		expect(plugin.endpoints?.phoneStart).toBeDefined();
		expect(plugin.endpoints?.phoneResend).toBeDefined();
		expect(plugin.endpoints?.phoneVerify).toBeDefined();
		expect(plugin.endpoints?.phoneLink).toBeDefined();
		expect(plugin.endpoints?.phoneUnlink).toBeDefined();
		expect(plugin.endpoints?.deviceStart).toBeDefined();
		expect(plugin.endpoints?.devicePoll).toBeDefined();
		expect(plugin.endpoints?.deviceApprove).toBeDefined();
		expect(plugin.endpoints?.deviceDeny).toBeDefined();
		expect(plugin.endpoints?.deviceRevoke).toBeDefined();
		expect(plugin.endpoints?.deviceIssueOfflineSnapshot).toBeDefined();
		expect(plugin.endpoints?.tokenRevoke).toBeDefined();
		expect(plugin.endpoints?.tokenRevocationCheck).toBeDefined();
		expect(plugin.endpoints?.deviceList).toBeDefined();
	});

	it("registers durable schema models for phone, device, and QR flows", () => {
		const plugin = productionReadinessPlugin();

		expect(plugin.schema?.phoneVerification?.fields?.otpHash).toMatchObject({
			type: "string",
			required: true,
		});
		expect(plugin.schema?.phoneIdentity?.fields?.phoneNumberE164).toMatchObject({
			type: "string",
			required: true,
		});
		expect(plugin.schema?.deviceAuthorization?.fields?.deviceCodeHash).toMatchObject({
			type: "string",
			required: true,
		});
		expect(plugin.schema?.device?.fields?.trustLevel).toMatchObject({
			type: "string",
			required: true,
		});
		expect(plugin.schema?.deviceSession?.fields?.permissionSnapshot).toMatchObject({
			type: "string",
			required: false,
		});
		expect(plugin.schema?.tokenRevocation?.fields?.subjectType).toMatchObject({
			type: "string",
			required: true,
		});
	});
});
