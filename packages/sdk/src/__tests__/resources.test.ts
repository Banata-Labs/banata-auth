import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BanataAuth } from "../client";
import { AuditLogs } from "../resources/audit-logs";
import { DirectorySync } from "../resources/directory-sync";
import { Domains } from "../resources/domains";
import { Events } from "../resources/events";
import { Organizations } from "../resources/organizations";
import { Portal } from "../resources/portal";
import { Rbac } from "../resources/rbac";
import { SSO } from "../resources/sso";
import { UserManagement } from "../resources/user-management";
import { Vault } from "../resources/vault";
import { Webhooks } from "../resources/webhooks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch() {
	const fn = vi.fn().mockResolvedValue({
		ok: true,
		status: 200,
		headers: new Headers({ "content-type": "application/json" }),
		json: vi.fn().mockResolvedValue({}),
	});
	vi.stubGlobal("fetch", fn);
	return fn;
}

function createClient(): BanataAuth {
	return new BanataAuth({
		apiKey: "sk_test_resources",
		baseUrl: "https://api.test.com",
	});
}

function expectMethodsExist(resource: unknown, methodNames: string[]) {
	for (const name of methodNames) {
		it(`has ${name}() method`, () => {
			expect(typeof (resource as Record<string, unknown>)[name]).toBe("function");
		});
	}
}

// ─── Resource Instantiation ──────────────────────────────────────────────────

describe("Resource modules", () => {
	let client: BanataAuth;

	beforeEach(() => {
		mockFetch();
		client = createClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	// ─── UserManagement ─────────────────────────────────────────────────

	describe("UserManagement", () => {
		it("is an instance of UserManagement", () => {
			expect(client.userManagement).toBeInstanceOf(UserManagement);
		});

		expectMethodsExist(
			// We need to create a fresh instance here since beforeEach hasn't run
			// during test definition. Use a getter that defers to the prototype.
			UserManagement.prototype,
			[
				"listUsers",
				"getUser",
				"createUser",
				"updateUser",
				"deleteUser",
				"banUser",
				"unbanUser",
				"listUserSessions",
				"impersonateUser",
				"stopImpersonating",
				"revokeSession",
				"revokeAllSessions",
				"setRole",
				"setUserPassword",
				"hasPermission",
			],
		);
	});

	// ─── Organizations ──────────────────────────────────────────────────

	describe("Organizations", () => {
		it("is an instance of Organizations", () => {
			expect(client.organizations).toBeInstanceOf(Organizations);
		});

		expectMethodsExist(Organizations.prototype, [
			"listOrganizations",
			"getOrganization",
			"createOrganization",
			"updateOrganization",
			"deleteOrganization",
			"listMembers",
			"removeMember",
			"updateMemberRole",
			"sendInvitation",
			"revokeInvitation",
			"listInvitations",
		]);
	});

	// ─── SSO ────────────────────────────────────────────────────────────

	describe("SSO", () => {
		it("is an instance of SSO", () => {
			expect(client.sso).toBeInstanceOf(SSO);
		});

		expectMethodsExist(SSO.prototype, [
			"getAuthorizationUrl",
			"getProfileAndToken",
			"listConnections",
			"getConnection",
			"createConnection",
			"updateConnection",
			"deleteConnection",
			"activateConnection",
			"deactivateConnection",
		]);
	});

	// ─── DirectorySync ──────────────────────────────────────────────────

	describe("DirectorySync", () => {
		it("is an instance of DirectorySync", () => {
			expect(client.directorySync).toBeInstanceOf(DirectorySync);
		});

		expectMethodsExist(DirectorySync.prototype, [
			"listDirectories",
			"getDirectory",
			"createDirectory",
			"deleteDirectory",
			"listUsers",
			"getUser",
			"listGroups",
			"getGroup",
		]);
	});

	// ─── AuditLogs ──────────────────────────────────────────────────────

	describe("AuditLogs", () => {
		it("is an instance of AuditLogs", () => {
			expect(client.auditLogs).toBeInstanceOf(AuditLogs);
		});

		expectMethodsExist(AuditLogs.prototype, ["createEvent", "listEvents", "exportEvents"]);
	});

	// ─── Events ─────────────────────────────────────────────────────────

	describe("Events", () => {
		it("is an instance of Events", () => {
			expect(client.events).toBeInstanceOf(Events);
		});

		expectMethodsExist(Events.prototype, ["listEvents"]);
	});

	// ─── Webhooks ───────────────────────────────────────────────────────

	describe("Webhooks", () => {
		it("is an instance of Webhooks", () => {
			expect(client.webhooks).toBeInstanceOf(Webhooks);
		});

		expectMethodsExist(Webhooks.prototype, [
			"listEndpoints",
			"createEndpoint",
			"updateEndpoint",
			"deleteEndpoint",
			"constructEvent",
			"verifySignature",
		]);
	});

	// ─── Portal ─────────────────────────────────────────────────────────

	describe("Portal", () => {
		it("is an instance of Portal", () => {
			expect(client.portal).toBeInstanceOf(Portal);
		});

		expectMethodsExist(Portal.prototype, ["generateLink"]);
	});

	// ─── Vault ──────────────────────────────────────────────────────────

	describe("Vault", () => {
		it("is an instance of Vault", () => {
			expect(client.vault).toBeInstanceOf(Vault);
		});

		expectMethodsExist(Vault.prototype, ["encrypt", "decrypt", "list", "delete", "rotateKey"]);
	});

	// ─── Domains ────────────────────────────────────────────────────────

	describe("Domains", () => {
		it("is an instance of Domains", () => {
			expect(client.domains).toBeInstanceOf(Domains);
		});

		expectMethodsExist(Domains.prototype, [
			"createVerification",
			"getVerification",
			"verify",
			"list",
			"delete",
		]);
	});

	// ─── Rbac ───────────────────────────────────────────────────────────

	describe("Rbac", () => {
		it("is an instance of Rbac", () => {
			expect(client.rbac).toBeInstanceOf(Rbac);
		});

		expectMethodsExist(Rbac.prototype, [
			"listRoles",
			"checkPermission",
			"checkPermissions",
			"assignRole",
			"revokeRole",
		]);
	});
});
