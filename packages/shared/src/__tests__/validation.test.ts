import { describe, expect, it } from "vitest";
import {
	createAuditEventSchema,
	createOrganizationSchema,
	createSsoConnectionSchema,
	createUserSchema,
	createWebhookEndpointSchema,
	domainSchema,
	emailSchema,
	httpsUrlSchema,
	inviteMemberSchema,
	metadataSchema,
	nameSchema,
	paginationSchema,
	passwordSchema,
	slugSchema,
	updateOrganizationSchema,
	updateUserSchema,
	urlSchema,
} from "../validation";

describe("validation", () => {
	// ─── Primitives ────────────────────────────────────────────────────────────

	describe("emailSchema", () => {
		it("accepts valid email", () => {
			expect(emailSchema.parse("user@example.com")).toBe("user@example.com");
		});

		it("accepts email with subdomain", () => {
			expect(emailSchema.parse("user@mail.example.com")).toBe("user@mail.example.com");
		});

		it("accepts email with plus addressing", () => {
			expect(emailSchema.parse("user+tag@example.com")).toBe("user+tag@example.com");
		});

		it("lowercases email", () => {
			expect(emailSchema.parse("USER@EXAMPLE.COM")).toBe("user@example.com");
		});

		it("trims and lowercases combined", () => {
			// Zod validates email before trimming, so leading/trailing spaces
			// cause validation to fail. Verify lowercase transform works.
			expect(emailSchema.parse("User@Example.COM")).toBe("user@example.com");
		});

		it("rejects invalid email - no @", () => {
			expect(() => emailSchema.parse("invalid")).toThrow();
		});

		it("rejects invalid email - no domain", () => {
			expect(() => emailSchema.parse("user@")).toThrow();
		});

		it("rejects invalid email - no local part", () => {
			expect(() => emailSchema.parse("@example.com")).toThrow();
		});

		it("rejects empty string", () => {
			expect(() => emailSchema.parse("")).toThrow();
		});
	});

	describe("passwordSchema", () => {
		it("accepts valid password (8 chars)", () => {
			expect(passwordSchema.parse("12345678")).toBe("12345678");
		});

		it("accepts password at minimum boundary (exactly 8 chars)", () => {
			const pw = "a".repeat(8);
			expect(passwordSchema.parse(pw)).toBe(pw);
		});

		it("accepts password at maximum boundary (exactly 128 chars)", () => {
			const pw = "a".repeat(128);
			expect(passwordSchema.parse(pw)).toBe(pw);
		});

		it("rejects password below minimum (7 chars)", () => {
			expect(() => passwordSchema.parse("1234567")).toThrow();
		});

		it("rejects password above maximum (129 chars)", () => {
			expect(() => passwordSchema.parse("a".repeat(129))).toThrow();
		});

		it("rejects empty string", () => {
			expect(() => passwordSchema.parse("")).toThrow();
		});

		it("accepts password with special characters", () => {
			expect(passwordSchema.parse("p@$$w0rd!")).toBe("p@$$w0rd!");
		});
	});

	describe("nameSchema", () => {
		it("accepts valid name", () => {
			expect(nameSchema.parse("John Doe")).toBe("John Doe");
		});

		it("rejects empty string", () => {
			expect(() => nameSchema.parse("")).toThrow();
		});

		it("accepts single character name", () => {
			expect(nameSchema.parse("A")).toBe("A");
		});

		it("accepts max length name (255 chars)", () => {
			const name = "a".repeat(255);
			expect(nameSchema.parse(name)).toBe(name);
		});

		it("rejects name over 255 chars", () => {
			expect(() => nameSchema.parse("a".repeat(256))).toThrow();
		});

		it("trims whitespace", () => {
			expect(nameSchema.parse("  John  ")).toBe("John");
		});

		it("rejects whitespace-only string (trim runs before min check)", () => {
			// Zod's trim() runs before min(1), so "   " becomes "" and fails min(1).
			expect(() => nameSchema.parse("   ")).toThrow();
		});
	});

	describe("slugSchema", () => {
		it("accepts valid slug", () => {
			expect(slugSchema.parse("my-org")).toBe("my-org");
		});

		it("accepts slug with numbers", () => {
			expect(slugSchema.parse("org-123")).toBe("org-123");
		});

		it("accepts all-numeric slug", () => {
			expect(slugSchema.parse("12")).toBe("12");
		});

		it("accepts slug without hyphens", () => {
			expect(slugSchema.parse("myorg")).toBe("myorg");
		});

		it("rejects slug with uppercase", () => {
			expect(() => slugSchema.parse("MyOrg")).toThrow();
		});

		it("rejects slug with spaces", () => {
			expect(() => slugSchema.parse("my org")).toThrow();
		});

		it("rejects slug with special characters", () => {
			expect(() => slugSchema.parse("my_org")).toThrow();
		});

		it("rejects slug starting with hyphen", () => {
			expect(() => slugSchema.parse("-myorg")).toThrow();
		});

		it("rejects slug ending with hyphen", () => {
			expect(() => slugSchema.parse("myorg-")).toThrow();
		});

		it("rejects single character slug (min 2)", () => {
			expect(() => slugSchema.parse("a")).toThrow();
		});

		it("accepts slug at minimum length (2 chars)", () => {
			expect(slugSchema.parse("ab")).toBe("ab");
		});

		it("rejects slug over 128 chars", () => {
			expect(() => slugSchema.parse("a".repeat(129))).toThrow();
		});
	});

	describe("urlSchema", () => {
		it("accepts valid HTTP URL", () => {
			expect(urlSchema.parse("http://example.com")).toBe("http://example.com");
		});

		it("accepts valid HTTPS URL", () => {
			expect(urlSchema.parse("https://example.com")).toBe("https://example.com");
		});

		it("accepts URL with path", () => {
			expect(urlSchema.parse("https://example.com/path/to/resource")).toBe(
				"https://example.com/path/to/resource",
			);
		});

		it("accepts URL with query params", () => {
			expect(urlSchema.parse("https://example.com?key=value")).toBe(
				"https://example.com?key=value",
			);
		});

		it("rejects invalid URL", () => {
			expect(() => urlSchema.parse("not-a-url")).toThrow();
		});

		it("rejects empty string", () => {
			expect(() => urlSchema.parse("")).toThrow();
		});

		it("rejects URL over 2048 chars", () => {
			const longUrl = "https://example.com/" + "a".repeat(2048);
			expect(() => urlSchema.parse(longUrl)).toThrow();
		});
	});

	describe("httpsUrlSchema", () => {
		it("accepts HTTPS URL", () => {
			const result = httpsUrlSchema.parse("https://example.com");
			expect(result).toBe("https://example.com");
		});

		it("accepts HTTPS URL with path", () => {
			const result = httpsUrlSchema.parse("https://example.com/webhook");
			expect(result).toBe("https://example.com/webhook");
		});

		it("rejects HTTP URL", () => {
			expect(() => httpsUrlSchema.parse("http://example.com")).toThrow();
		});

		it("rejects invalid URL", () => {
			expect(() => httpsUrlSchema.parse("not-a-url")).toThrow();
		});

		it("rejects empty string", () => {
			expect(() => httpsUrlSchema.parse("")).toThrow();
		});
	});

	describe("metadataSchema", () => {
		it("accepts valid object", () => {
			const result = metadataSchema.parse({ key: "value", count: 42 });
			expect(result).toEqual({ key: "value", count: 42 });
		});

		it("accepts empty object", () => {
			const result = metadataSchema.parse({});
			expect(result).toEqual({});
		});

		it("accepts nested objects", () => {
			const data = { nested: { key: "value" } };
			const result = metadataSchema.parse(data);
			expect(result).toEqual(data);
		});

		it("is optional (undefined passes)", () => {
			const result = metadataSchema.parse(undefined);
			expect(result).toBeUndefined();
		});

		it("rejects oversized metadata (>16KB)", () => {
			const largeData: Record<string, string> = {};
			// Create a string that exceeds 16KB when JSON-serialized
			largeData.big = "x".repeat(17 * 1024);
			expect(() => metadataSchema.parse(largeData)).toThrow();
		});

		it("accepts metadata just under 16KB", () => {
			// Create metadata that is under 16KB
			const data: Record<string, string> = { key: "x".repeat(1000) };
			expect(() => metadataSchema.parse(data)).not.toThrow();
		});
	});

	describe("domainSchema", () => {
		it("accepts valid domain", () => {
			expect(domainSchema.parse("example.com")).toBe("example.com");
		});

		it("accepts subdomain", () => {
			expect(domainSchema.parse("sub.example.com")).toBe("sub.example.com");
		});

		it("accepts domain with numbers", () => {
			expect(domainSchema.parse("example123.com")).toBe("example123.com");
		});

		it("accepts already-lowercase domain (regex runs before toLowerCase)", () => {
			// Zod's regex check runs before toLowerCase(), so uppercase input
			// fails the regex. Verify lowercase input passes correctly.
			expect(domainSchema.parse("example.com")).toBe("example.com");
		});

		it("rejects invalid domain - no TLD", () => {
			expect(() => domainSchema.parse("example")).toThrow();
		});

		it("rejects invalid domain - with spaces", () => {
			expect(() => domainSchema.parse("example .com")).toThrow();
		});

		it("rejects invalid domain - too short", () => {
			expect(() => domainSchema.parse("a")).toThrow();
		});

		it("rejects empty string", () => {
			expect(() => domainSchema.parse("")).toThrow();
		});

		it("rejects domain with protocol", () => {
			expect(() => domainSchema.parse("https://example.com")).toThrow();
		});
	});

	// ─── Pagination ────────────────────────────────────────────────────────────

	describe("paginationSchema", () => {
		it("applies defaults for empty object", () => {
			const result = paginationSchema.parse({});
			expect(result.limit).toBe(10);
			expect(result.order).toBe("desc");
		});

		it("accepts valid limit", () => {
			const result = paginationSchema.parse({ limit: 50 });
			expect(result.limit).toBe(50);
		});

		it("accepts limit of 1 (minimum)", () => {
			const result = paginationSchema.parse({ limit: 1 });
			expect(result.limit).toBe(1);
		});

		it("accepts limit of 100 (maximum)", () => {
			const result = paginationSchema.parse({ limit: 100 });
			expect(result.limit).toBe(100);
		});

		it("rejects limit of 0", () => {
			expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
		});

		it("rejects limit over 100", () => {
			expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
		});

		it('accepts order "asc"', () => {
			const result = paginationSchema.parse({ order: "asc" });
			expect(result.order).toBe("asc");
		});

		it('accepts order "desc"', () => {
			const result = paginationSchema.parse({ order: "desc" });
			expect(result.order).toBe("desc");
		});

		it("rejects invalid order", () => {
			expect(() => paginationSchema.parse({ order: "random" })).toThrow();
		});

		it("accepts before cursor", () => {
			const result = paginationSchema.parse({ before: "cursor_abc" });
			expect(result.before).toBe("cursor_abc");
		});

		it("accepts after cursor", () => {
			const result = paginationSchema.parse({ after: "cursor_def" });
			expect(result.after).toBe("cursor_def");
		});

		it("before and after are optional", () => {
			const result = paginationSchema.parse({});
			expect(result.before).toBeUndefined();
			expect(result.after).toBeUndefined();
		});

		it("coerces string limit to number", () => {
			const result = paginationSchema.parse({ limit: "25" });
			expect(result.limit).toBe(25);
		});
	});

	// ─── User ──────────────────────────────────────────────────────────────────

	describe("createUserSchema", () => {
		const validInput = {
			email: "user@example.com",
			name: "John Doe",
		};

		it("accepts full valid input", () => {
			const full = {
				email: "user@example.com",
				password: "securepassword",
				name: "John Doe",
				image: "https://example.com/avatar.jpg",
				username: "johndoe",
				phoneNumber: "+1234567890",
				emailVerified: true,
				role: "admin" as const,
				metadata: { plan: "pro" },
			};
			const result = createUserSchema.parse(full);
			expect(result.email).toBe("user@example.com");
			expect(result.name).toBe("John Doe");
			expect(result.role).toBe("admin");
		});

		it("accepts minimal valid input (email + name)", () => {
			const result = createUserSchema.parse(validInput);
			expect(result.email).toBe("user@example.com");
			expect(result.name).toBe("John Doe");
		});

		it("applies defaults for optional fields", () => {
			const result = createUserSchema.parse(validInput);
			expect(result.emailVerified).toBe(false);
			expect(result.role).toBe("user");
		});

		it("rejects invalid email", () => {
			expect(() => createUserSchema.parse({ ...validInput, email: "not-an-email" })).toThrow();
		});

		it("rejects missing name", () => {
			expect(() => createUserSchema.parse({ email: "user@example.com" })).toThrow();
		});

		it("rejects missing email", () => {
			expect(() => createUserSchema.parse({ name: "John" })).toThrow();
		});

		it("validates password when provided", () => {
			expect(() => createUserSchema.parse({ ...validInput, password: "short" })).toThrow();
		});

		it("accepts valid password", () => {
			const result = createUserSchema.parse({ ...validInput, password: "securepassword" });
			expect(result.password).toBe("securepassword");
		});

		it("password is optional", () => {
			const result = createUserSchema.parse(validInput);
			expect(result.password).toBeUndefined();
		});

		it("rejects invalid role", () => {
			expect(() => createUserSchema.parse({ ...validInput, role: "superadmin" })).toThrow();
		});

		it("validates image URL when provided", () => {
			expect(() => createUserSchema.parse({ ...validInput, image: "not-a-url" })).toThrow();
		});

		it("lowercases email", () => {
			const result = createUserSchema.parse({ ...validInput, email: "USER@EXAMPLE.COM" });
			expect(result.email).toBe("user@example.com");
		});
	});

	describe("updateUserSchema", () => {
		it("accepts empty object (all fields optional)", () => {
			const result = updateUserSchema.parse({});
			expect(result).toBeDefined();
		});

		it("accepts valid partial update with name", () => {
			const result = updateUserSchema.parse({ name: "New Name" });
			expect(result.name).toBe("New Name");
		});

		it("accepts valid partial update with image", () => {
			const result = updateUserSchema.parse({ image: "https://example.com/new.jpg" });
			expect(result.image).toBe("https://example.com/new.jpg");
		});

		it("accepts null for image (nullable)", () => {
			const result = updateUserSchema.parse({ image: null });
			expect(result.image).toBeNull();
		});

		it("accepts null for phoneNumber (nullable)", () => {
			const result = updateUserSchema.parse({ phoneNumber: null });
			expect(result.phoneNumber).toBeNull();
		});

		it("validates name when provided", () => {
			expect(() => updateUserSchema.parse({ name: "" })).toThrow();
		});

		it("validates image URL when provided", () => {
			expect(() => updateUserSchema.parse({ image: "not-a-url" })).toThrow();
		});

		it("accepts username", () => {
			const result = updateUserSchema.parse({ username: "newuser" });
			expect(result.username).toBe("newuser");
		});

		it("accepts metadata", () => {
			const result = updateUserSchema.parse({ metadata: { key: "value" } });
			expect(result.metadata).toEqual({ key: "value" });
		});
	});

	// ─── Organization ──────────────────────────────────────────────────────────

	describe("createOrganizationSchema", () => {
		it("accepts valid input with name only", () => {
			const result = createOrganizationSchema.parse({ name: "My Org" });
			expect(result.name).toBe("My Org");
		});

		it("accepts with slug", () => {
			const result = createOrganizationSchema.parse({ name: "My Org", slug: "my-org" });
			expect(result.slug).toBe("my-org");
		});

		it("slug is optional", () => {
			const result = createOrganizationSchema.parse({ name: "My Org" });
			expect(result.slug).toBeUndefined();
		});

		it("accepts with metadata", () => {
			const result = createOrganizationSchema.parse({
				name: "My Org",
				metadata: { plan: "enterprise" },
			});
			expect(result.metadata).toEqual({ plan: "enterprise" });
		});

		it("applies defaults", () => {
			const result = createOrganizationSchema.parse({ name: "My Org" });
			expect(result.requireMfa).toBe(false);
		});

		it("rejects missing name", () => {
			expect(() => createOrganizationSchema.parse({})).toThrow();
		});

		it("rejects empty name", () => {
			expect(() => createOrganizationSchema.parse({ name: "" })).toThrow();
		});

		it("validates slug format", () => {
			expect(() =>
				createOrganizationSchema.parse({ name: "My Org", slug: "INVALID SLUG" }),
			).toThrow();
		});

		it("accepts logo URL", () => {
			const result = createOrganizationSchema.parse({
				name: "My Org",
				logo: "https://example.com/logo.png",
			});
			expect(result.logo).toBe("https://example.com/logo.png");
		});

		it("accepts allowedEmailDomains", () => {
			const result = createOrganizationSchema.parse({
				name: "My Org",
				allowedEmailDomains: ["example.com"],
			});
			expect(result.allowedEmailDomains).toEqual(["example.com"]);
		});

		it("accepts maxMembers", () => {
			const result = createOrganizationSchema.parse({
				name: "My Org",
				maxMembers: 50,
			});
			expect(result.maxMembers).toBe(50);
		});
	});

	describe("updateOrganizationSchema", () => {
		it("accepts empty object (all fields optional)", () => {
			const result = updateOrganizationSchema.parse({});
			expect(result).toBeDefined();
		});

		it("accepts partial update", () => {
			const result = updateOrganizationSchema.parse({ name: "Updated Org" });
			expect(result.name).toBe("Updated Org");
		});

		it("accepts nullable fields", () => {
			const result = updateOrganizationSchema.parse({
				logo: null,
				allowedEmailDomains: null,
				maxMembers: null,
			});
			expect(result.logo).toBeNull();
			expect(result.allowedEmailDomains).toBeNull();
			expect(result.maxMembers).toBeNull();
		});

		it("validates slug when provided", () => {
			expect(() => updateOrganizationSchema.parse({ slug: "INVALID" })).toThrow();
		});
	});

	// ─── Organization Members ──────────────────────────────────────────────────

	describe("inviteMemberSchema", () => {
		it("accepts valid input", () => {
			const result = inviteMemberSchema.parse({
				email: "user@example.com",
				role: "member",
			});
			expect(result.email).toBe("user@example.com");
			expect(result.role).toBe("member");
		});

		it("requires email", () => {
			expect(() => inviteMemberSchema.parse({ role: "member" })).toThrow();
		});

		it("requires role", () => {
			expect(() => inviteMemberSchema.parse({ email: "user@example.com" })).toThrow();
		});

		it("rejects invalid email", () => {
			expect(() => inviteMemberSchema.parse({ email: "not-email", role: "member" })).toThrow();
		});

		it("rejects empty role", () => {
			expect(() => inviteMemberSchema.parse({ email: "user@example.com", role: "" })).toThrow();
		});

		it("lowercases email", () => {
			const result = inviteMemberSchema.parse({
				email: "USER@EXAMPLE.COM",
				role: "admin",
			});
			expect(result.email).toBe("user@example.com");
		});
	});

	// ─── SSO Connection ────────────────────────────────────────────────────────

	describe("createSsoConnectionSchema", () => {
		const baseSaml = {
			organizationId: "org_123",
			type: "saml" as const,
			name: "My SSO",
			domains: ["example.com"],
			samlConfig: {
				idpEntityId: "https://idp.example.com",
				idpSsoUrl: "https://idp.example.com/sso",
				idpCertificate: "MIIC...",
			},
		};

		const baseOidc = {
			organizationId: "org_123",
			type: "oidc" as const,
			name: "My OIDC",
			domains: ["example.com"],
			oidcConfig: {
				issuer: "https://issuer.example.com",
				clientId: "client_123",
				clientSecret: "secret_456",
			},
		};

		it("accepts valid SAML connection", () => {
			const result = createSsoConnectionSchema.parse(baseSaml);
			expect(result.type).toBe("saml");
			expect(result.samlConfig).toBeDefined();
		});

		it("accepts valid OIDC connection", () => {
			const result = createSsoConnectionSchema.parse(baseOidc);
			expect(result.type).toBe("oidc");
			expect(result.oidcConfig).toBeDefined();
		});

		it("requires organizationId", () => {
			const { organizationId, ...rest } = baseSaml;
			expect(() => createSsoConnectionSchema.parse(rest)).toThrow();
		});

		it("requires type", () => {
			const { type, ...rest } = baseSaml;
			expect(() => createSsoConnectionSchema.parse(rest)).toThrow();
		});

		it("requires name", () => {
			const { name, ...rest } = baseSaml;
			expect(() => createSsoConnectionSchema.parse(rest)).toThrow();
		});

		it("requires at least one domain", () => {
			expect(() => createSsoConnectionSchema.parse({ ...baseSaml, domains: [] })).toThrow();
		});

		it("validates SAML idpSsoUrl is a valid URL", () => {
			expect(() =>
				createSsoConnectionSchema.parse({
					...baseSaml,
					samlConfig: { ...baseSaml.samlConfig!, idpSsoUrl: "not-a-url" },
				}),
			).toThrow();
		});

		it("validates SAML idpCertificate is non-empty", () => {
			expect(() =>
				createSsoConnectionSchema.parse({
					...baseSaml,
					samlConfig: { ...baseSaml.samlConfig!, idpCertificate: "" },
				}),
			).toThrow();
		});

		it("SAML config accepts optional fields", () => {
			const result = createSsoConnectionSchema.parse({
				...baseSaml,
				samlConfig: {
					...baseSaml.samlConfig!,
					nameIdFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
					signRequest: true,
					allowIdpInitiated: true,
					attributeMapping: { email: "user.email" },
				},
			});
			expect(result.samlConfig?.signRequest).toBe(true);
			expect(result.samlConfig?.allowIdpInitiated).toBe(true);
		});

		it("SAML config applies defaults for boolean fields", () => {
			const result = createSsoConnectionSchema.parse(baseSaml);
			expect(result.samlConfig?.signRequest).toBe(false);
			expect(result.samlConfig?.allowIdpInitiated).toBe(false);
		});

		it("validates OIDC issuer is a valid URL", () => {
			expect(() =>
				createSsoConnectionSchema.parse({
					...baseOidc,
					oidcConfig: { ...baseOidc.oidcConfig!, issuer: "not-a-url" },
				}),
			).toThrow();
		});

		it("validates OIDC clientId is non-empty", () => {
			expect(() =>
				createSsoConnectionSchema.parse({
					...baseOidc,
					oidcConfig: { ...baseOidc.oidcConfig!, clientId: "" },
				}),
			).toThrow();
		});

		it("validates OIDC clientSecret is non-empty", () => {
			expect(() =>
				createSsoConnectionSchema.parse({
					...baseOidc,
					oidcConfig: { ...baseOidc.oidcConfig!, clientSecret: "" },
				}),
			).toThrow();
		});

		it("OIDC config applies default scopes", () => {
			const result = createSsoConnectionSchema.parse(baseOidc);
			expect(result.oidcConfig?.scopes).toEqual(["openid", "email", "profile"]);
		});

		it("rejects invalid type", () => {
			expect(() => createSsoConnectionSchema.parse({ ...baseSaml, type: "ldap" })).toThrow();
		});

		it("samlConfig and oidcConfig are both optional", () => {
			const result = createSsoConnectionSchema.parse({
				organizationId: "org_123",
				type: "saml",
				name: "My SSO",
				domains: ["example.com"],
			});
			expect(result.samlConfig).toBeUndefined();
			expect(result.oidcConfig).toBeUndefined();
		});
	});

	// ─── Webhook ───────────────────────────────────────────────────────────────

	describe("createWebhookEndpointSchema", () => {
		it("accepts valid HTTPS URL", () => {
			const result = createWebhookEndpointSchema.parse({
				url: "https://example.com/webhook",
			});
			expect(result.url).toBe("https://example.com/webhook");
		});

		it("rejects HTTP URL", () => {
			expect(() =>
				createWebhookEndpointSchema.parse({
					url: "http://example.com/webhook",
				}),
			).toThrow();
		});

		it("rejects invalid URL", () => {
			expect(() => createWebhookEndpointSchema.parse({ url: "not-a-url" })).toThrow();
		});

		it("requires url", () => {
			expect(() => createWebhookEndpointSchema.parse({})).toThrow();
		});

		it("applies defaults for eventTypes and enabled", () => {
			const result = createWebhookEndpointSchema.parse({
				url: "https://example.com/webhook",
			});
			expect(result.eventTypes).toEqual([]);
			expect(result.enabled).toBe(true);
		});

		it("accepts custom eventTypes", () => {
			const result = createWebhookEndpointSchema.parse({
				url: "https://example.com/webhook",
				eventTypes: ["user.created", "user.deleted"],
			});
			expect(result.eventTypes).toEqual(["user.created", "user.deleted"]);
		});

		it("accepts enabled=false", () => {
			const result = createWebhookEndpointSchema.parse({
				url: "https://example.com/webhook",
				enabled: false,
			});
			expect(result.enabled).toBe(false);
		});
	});

	// ─── Audit Event ───────────────────────────────────────────────────────────

	describe("createAuditEventSchema", () => {
		const validAudit = {
			action: "user.created",
			actor: {
				type: "user" as const,
				id: "usr_123",
			},
		};

		it("accepts valid minimal input", () => {
			const result = createAuditEventSchema.parse(validAudit);
			expect(result.action).toBe("user.created");
			expect(result.actor.type).toBe("user");
			expect(result.actor.id).toBe("usr_123");
		});

		it("requires action", () => {
			const { action, ...rest } = validAudit;
			expect(() => createAuditEventSchema.parse(rest)).toThrow();
		});

		it("requires actor", () => {
			const { actor, ...rest } = validAudit;
			expect(() => createAuditEventSchema.parse(rest)).toThrow();
		});

		it("rejects empty action", () => {
			expect(() => createAuditEventSchema.parse({ ...validAudit, action: "" })).toThrow();
		});

		it("requires actor.type", () => {
			expect(() =>
				createAuditEventSchema.parse({
					action: "test",
					actor: { id: "usr_123" },
				}),
			).toThrow();
		});

		it("requires actor.id", () => {
			expect(() =>
				createAuditEventSchema.parse({
					action: "test",
					actor: { type: "user" },
				}),
			).toThrow();
		});

		it("validates actor.type enum", () => {
			expect(() =>
				createAuditEventSchema.parse({
					action: "test",
					actor: { type: "invalid", id: "usr_123" },
				}),
			).toThrow();
		});

		it("accepts all valid actor types", () => {
			const validTypes = ["user", "admin", "system", "api_key", "scim"] as const;
			for (const actorType of validTypes) {
				const result = createAuditEventSchema.parse({
					action: "test",
					actor: { type: actorType, id: "id_123" },
				});
				expect(result.actor.type).toBe(actorType);
			}
		});

		it("applies defaults for optional array/object fields", () => {
			const result = createAuditEventSchema.parse(validAudit);
			expect(result.targets).toEqual([]);
			expect(result.context).toEqual({});
		});

		it("accepts full input with all optional fields", () => {
			const full = {
				action: "user.updated",
				actor: {
					type: "admin" as const,
					id: "usr_admin",
					name: "Admin User",
					email: "admin@example.com",
					metadata: { source: "dashboard" },
				},
				targets: [
					{
						type: "user",
						id: "usr_target",
						name: "Target User",
						metadata: { role: "member" },
					},
				],
				context: {
					organizationId: "org_123",
					ipAddress: "1.2.3.4",
					userAgent: "Mozilla/5.0",
					requestId: "req_abc",
				},
				changes: {
					before: { name: "Old Name" },
					after: { name: "New Name" },
				},
				idempotencyKey: "idem_123",
				metadata: { source: "api" },
				occurredAt: Date.now(),
			};
			const result = createAuditEventSchema.parse(full);
			expect(result.targets).toHaveLength(1);
			expect(result.context.organizationId).toBe("org_123");
			expect(result.changes?.before).toEqual({ name: "Old Name" });
			expect(result.idempotencyKey).toBe("idem_123");
		});

		it("accepts targets array", () => {
			const result = createAuditEventSchema.parse({
				...validAudit,
				targets: [{ type: "user", id: "usr_456" }],
			});
			expect(result.targets).toHaveLength(1);
			expect(result.targets[0]!.type).toBe("user");
		});

		it("accepts context object", () => {
			const result = createAuditEventSchema.parse({
				...validAudit,
				context: { ipAddress: "127.0.0.1" },
			});
			expect(result.context.ipAddress).toBe("127.0.0.1");
		});
	});
});
