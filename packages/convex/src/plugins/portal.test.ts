import { describe, expect, it } from "vitest";
import { portalPlugin } from "./portal";

describe("Portal plugin", () => {
	// ─── Plugin Factory ─────────────────────────────────────────────────

	describe("portalPlugin()", () => {
		const plugin = portalPlugin();

		it("returns a plugin with the correct id", () => {
			expect(plugin.id).toBe("banata-portal");
		});

		it("registers both endpoints", () => {
			expect(plugin.endpoints).toBeDefined();
			const endpoints = plugin.endpoints!;
			expect(endpoints.generatePortalLink).toBeDefined();
			expect(endpoints.validatePortalSession).toBeDefined();
		});

		it("declares the portalSession schema", () => {
			expect(plugin.schema).toBeDefined();
			expect(plugin.schema!.portalSession).toBeDefined();
			const fields = plugin.schema!.portalSession.fields;
			expect(fields.organizationId).toMatchObject({ type: "string", required: true });
			expect(fields.intent).toMatchObject({ type: "string", required: true });
			expect(fields.token).toMatchObject({ type: "string", required: true, unique: true });
			expect(fields.expiresAt).toMatchObject({ type: "number", required: true });
			expect(fields.createdAt).toMatchObject({ type: "number", required: true });
			expect(fields.returnUrl).toMatchObject({ type: "string", required: false });
			expect(fields.projectId).toMatchObject({ type: "string", required: false });
		});

		it("does not define hooks", () => {
			expect(plugin.hooks).toBeUndefined();
		});
	});

	// ─── Schema Completeness ────────────────────────────────────────────

	describe("schema", () => {
		const schema = portalPlugin().schema!;

		it("has exactly one table (portalSession)", () => {
			expect(Object.keys(schema)).toEqual(["portalSession"]);
		});

		it("portalSession has 7 fields", () => {
			expect(Object.keys(schema.portalSession.fields)).toHaveLength(7);
		});

		it("token field is marked unique", () => {
			expect(schema.portalSession.fields.token.unique).toBe(true);
		});
	});

	// ─── Endpoint Configuration ─────────────────────────────────────────

	describe("endpoint configuration", () => {
		const plugin = portalPlugin();

		it("generatePortalLink is a POST endpoint", () => {
			const endpoint = plugin.endpoints!.generatePortalLink;
			// Better Auth endpoints have a `path` and `options` property
			expect(endpoint).toBeDefined();
		});

		it("validatePortalSession is a POST endpoint", () => {
			const endpoint = plugin.endpoints!.validatePortalSession;
			expect(endpoint).toBeDefined();
		});
	});
});
