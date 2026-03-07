import { describe, expect, it } from "vitest";
import {
	getArrayFromPayload,
	parseAuditEvent,
	parseConnection,
	parseDirectory,
	parseOrganization,
	parseUser,
} from "./normalizers";

describe("normalizers", () => {
	it("extracts arrays from common payload wrappers", () => {
		expect(getArrayFromPayload({ data: [1, 2] })).toEqual([1, 2]);
		expect(getArrayFromPayload({ users: ["a"] })).toEqual(["a"]);
		expect(getArrayFromPayload(["x"])).toEqual(["x"]);
		expect(getArrayFromPayload({ nope: true })).toEqual([]);
	});

	it("parses users safely", () => {
		const parsed = parseUser({
			id: "usr_1",
			email: "owner@example.com",
			role: "admin",
			name: "Owner",
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		});
		expect(parsed?.id).toBe("usr_1");
		expect(parsed?.role).toBe("admin");
		expect(parseUser({ id: "x" })).toBeNull();
	});

	it("parses organizations with defaults", () => {
		const parsed = parseOrganization({
			id: "org_1",
			name: "Acme",
			slug: "acme",
			allowedEmailDomains: ["acme.com"],
		});
		expect(parsed?.slug).toBe("acme");
		expect(parsed?.allowedEmailDomains).toEqual(["acme.com"]);
	});

	it("parses sso connections and falls back to draft state", () => {
		const parsed = parseConnection({
			id: "conn_1",
			organizationId: "org_1",
			type: "saml",
			state: "active",
			domains: ["acme.com"],
		});
		expect(parsed?.type).toBe("saml");
		expect(parsed?.state).toBe("active");

		const fallback = parseConnection({ id: "conn_2", organizationId: "org_1" });
		expect(fallback?.state).toBe("draft");
	});

	it("parses directory and audit event records", () => {
		const directory = parseDirectory({
			id: "dir_1",
			organizationId: "org_1",
			provider: "okta",
			state: "linked",
			userCount: 12,
			groupCount: 4,
		});
		expect(directory?.provider).toBe("okta");
		expect(directory?.userCount).toBe(12);

		const event = parseAuditEvent({
			id: "evt_1",
			action: "user.banned",
			actor: { type: "admin", id: "usr_admin" },
			occurredAt: "2026-01-01T00:00:00.000Z",
		});
		expect(event?.id).toBe("evt_1");
		expect(event?.actor.type).toBe("admin");
	});
});
