import { describe, expect, it } from "vitest";
import { eventsPlugin, toEventPayload } from "./events";
import type { AuditEventRow } from "./types";

describe("Events plugin", () => {
	// ─── Plugin Factory ─────────────────────────────────────────────────

	describe("eventsPlugin()", () => {
		const plugin = eventsPlugin();

		it("returns a plugin with the correct id", () => {
			expect(plugin.id).toBe("banata-events");
		});

		it("registers a listEvents endpoint", () => {
			expect(plugin.endpoints).toBeDefined();
			expect(plugin.endpoints!.listEvents).toBeDefined();
		});

		it("does not define additional schema (uses auditEvent table)", () => {
			expect(plugin.schema).toBeUndefined();
		});
	});

	// ─── toEventPayload ─────────────────────────────────────────────────

	describe("toEventPayload()", () => {
		const baseRow: AuditEventRow = {
			id: "evt_01",
			action: "user.login",
			version: 1,
			actorType: "user",
			actorId: "usr_01",
			actorName: "Alice",
			actorEmail: "alice@example.com",
			actorMetadata: null,
			targets: null,
			organizationId: "org_01",
			ipAddress: "127.0.0.1",
			userAgent: "Test/1.0",
			requestId: "req_01",
			changes: null,
			idempotencyKey: null,
			metadata: null,
			occurredAt: 1700000000000,
			createdAt: 1700000000000,
		};

		it("maps id, type, and createdAt correctly", () => {
			const result = toEventPayload(baseRow);
			expect(result.id).toBe("evt_01");
			expect(result.type).toBe("user.login");
			expect(result.createdAt).toBe(1700000000000);
		});

		it("maps actor fields into data", () => {
			const result = toEventPayload(baseRow);
			const data = result.data as Record<string, unknown>;
			expect(data.actorType).toBe("user");
			expect(data.actorId).toBe("usr_01");
			expect(data.actorName).toBe("Alice");
			expect(data.actorEmail).toBe("alice@example.com");
			expect(data.organizationId).toBe("org_01");
			expect(data.ipAddress).toBe("127.0.0.1");
			expect(data.userAgent).toBe("Test/1.0");
		});

		it("parses JSON targets when present", () => {
			const row: AuditEventRow = {
				...baseRow,
				targets: JSON.stringify([{ type: "user", id: "usr_02" }]),
			};
			const result = toEventPayload(row);
			const data = result.data as Record<string, unknown>;
			expect(data.targets).toEqual([{ type: "user", id: "usr_02" }]);
		});

		it("returns raw string for malformed JSON targets", () => {
			const row: AuditEventRow = {
				...baseRow,
				targets: "{not-json}",
			};
			const result = toEventPayload(row);
			const data = result.data as Record<string, unknown>;
			expect(data.targets).toBe("{not-json}");
		});

		it("parses JSON changes when present", () => {
			const row: AuditEventRow = {
				...baseRow,
				changes: JSON.stringify({ name: { from: "old", to: "new" } }),
			};
			const result = toEventPayload(row);
			const data = result.data as Record<string, unknown>;
			expect(data.changes).toEqual({ name: { from: "old", to: "new" } });
		});

		it("leaves undefined for null targets, changes, metadata", () => {
			const result = toEventPayload(baseRow);
			const data = result.data as Record<string, unknown>;
			expect(data.targets).toBeUndefined();
			expect(data.changes).toBeUndefined();
			expect(data.metadata).toBeUndefined();
		});

		it("uses occurredAt for createdAt field", () => {
			const row: AuditEventRow = {
				...baseRow,
				occurredAt: 1700000001000,
				createdAt: 1700000000000,
			};
			const result = toEventPayload(row);
			expect(result.createdAt).toBe(1700000001000);
		});
	});
});
