import { describe, expect, it, vi } from "vitest";
import { auditLog, logAuditEvent } from "./audit";

describe("auditLog", () => {
	it("registers tamper-evident audit hash fields", () => {
		const plugin = auditLog();

		expect(plugin.schema?.auditEvent?.fields?.hash).toMatchObject({
			type: "string",
			required: false,
		});
		expect(plugin.schema?.auditEvent?.fields?.previousHash).toMatchObject({
			type: "string",
			required: false,
		});
		expect(plugin.schema?.auditEvent?.fields?.externalSinkStatus).toMatchObject({
			type: "string",
			required: false,
		});
	});

	it("links audit events with the previous project hash", async () => {
		const create = vi.fn().mockImplementation(async ({ data }) => ({ id: "aud_2", ...data }));
		const findMany = vi.fn().mockResolvedValue([{ id: "aud_1", hash: "prev_hash" }]);

		await logAuditEvent(
			{ create, findMany },
			{
				projectId: "proj_123",
				action: "api_key.created",
				actorType: "admin",
				actorId: "usr_123",
			},
		);

		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "auditEvent",
				where: [{ field: "projectId", value: "proj_123" }],
				limit: 1,
			}),
		);
		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "auditEvent",
				data: expect.objectContaining({
					previousHash: "prev_hash",
					hash: expect.any(String),
					externalSinkStatus: "pending",
				}),
			}),
		);
	});
});
