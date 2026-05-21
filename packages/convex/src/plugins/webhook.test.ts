import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatchWebhookEvent, webhookSystem } from "./webhook";

describe("webhookSystem", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("registers delivery replay and listing endpoints", () => {
		const plugin = webhookSystem();

		expect(plugin.endpoints?.listWebhookDeliveries).toBeDefined();
		expect(plugin.endpoints?.replayWebhookDelivery).toBeDefined();
		expect(plugin.schema?.webhookDelivery?.fields?.deadLetteredAt).toMatchObject({
			type: "number",
			required: false,
		});
		expect(plugin.schema?.webhookDelivery?.fields?.replayOfDeliveryId).toMatchObject({
			type: "string",
			required: false,
		});
	});

	it("updates webhook delivery rows after successful dispatch", async () => {
		const created: Record<string, unknown>[] = [];
		const updates: Record<string, unknown>[] = [];
		const adapter = {
			findMany: vi.fn().mockResolvedValue([
				{
					id: "wh_123",
					projectId: "proj_123",
					url: "https://example.com/webhook",
					secret: "whsec_test",
					eventTypes: JSON.stringify(["user.created"]),
					enabled: true,
					successCount: 0,
					failureCount: 0,
					consecutiveFailures: 0,
				},
			]),
			create: vi.fn().mockImplementation(async ({ data }) => {
				const row = { id: "whd_123", ...data };
				created.push(row);
				return row;
			}),
			update: vi.fn().mockImplementation(async ({ update }) => {
				updates.push(update);
				return { id: "updated", ...update };
			}),
		};
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("ok", { status: 200 })));

		await dispatchWebhookEvent(
			adapter,
			"user.created",
			{ userId: "usr_123" },
			{ projectId: "proj_123" },
		);

		expect(created[0]).toMatchObject({
			id: "whd_123",
			projectId: "proj_123",
			status: "pending",
			attempt: 1,
		});
		expect(updates).toContainEqual(
			expect.objectContaining({
				status: "success",
				httpStatus: 200,
				deliveredAt: expect.any(Number),
			}),
		);
	});
});
