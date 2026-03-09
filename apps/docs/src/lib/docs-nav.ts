export interface DocNavItem {
	slug: string;
	title: string;
}

export interface DocNavSection {
	section: string;
	items: DocNavItem[];
}

export const docsNav: DocNavSection[] = [
	{
		section: "Getting Started",
		items: [
			{ slug: "introduction", title: "Introduction" },
			{ slug: "quickstart", title: "Self-Hosted Quick Start" },
			{ slug: "project-structure", title: "Project Structure" },
		],
	},
	{
		section: "Authentication",
		items: [
			{ slug: "email-password", title: "Email & Password" },
			{ slug: "social-oauth", title: "Social OAuth" },
			{ slug: "magic-links", title: "Magic Links" },
			{ slug: "email-otp", title: "Email OTP" },
			{ slug: "passkeys", title: "Passkeys" },
			{ slug: "anonymous-auth", title: "Anonymous Auth" },
			{ slug: "username-auth", title: "Username Auth" },
			{ slug: "mfa", title: "Multi-Factor Auth" },
		],
	},
	{
		section: "Organizations",
		items: [
			{ slug: "organizations-overview", title: "Overview" },
			{ slug: "invitations", title: "Invitations" },
			{ slug: "roles-permissions", title: "Roles & Permissions" },
			{ slug: "resource-types", title: "Resource Types" },
			{ slug: "auth-configuration", title: "Auth Configuration" },
		],
	},
	{
		section: "Infrastructure",
		items: [
			{ slug: "projects-environments", title: "Projects" },
			{ slug: "emails", title: "Emails" },
			{ slug: "email-templates", title: "Email Templates" },
			{ slug: "webhooks", title: "Webhooks" },
			{ slug: "audit-logs", title: "Audit Logs" },
			{ slug: "notifications", title: "Notifications" },
			{ slug: "api-keys", title: "API Keys" },
		],
	},
	{
		section: "Enterprise",
		items: [
			{ slug: "sso", title: "Single Sign-On (SSO)" },
			{ slug: "scim", title: "Directory Sync (SCIM)" },
			{ slug: "vault", title: "Vault & Encryption" },
		],
	},
	{
		section: "Configuration",
		items: [
			{ slug: "account", title: "Account Management" },
			{ slug: "settings", title: "Settings" },
			{ slug: "domains", title: "Domains" },
			{ slug: "redirects", title: "Redirects" },
			{ slug: "radar", title: "Radar (Dashboard Feature)" },
			{ slug: "bot-protection", title: "Bot Protection SDK (Next.js)" },
			{ slug: "addons", title: "Add-ons" },
		],
	},
	{
		section: "Packages",
		items: [
			{ slug: "sdk", title: "@banata-auth/sdk" },
			{ slug: "react", title: "@banata-auth/react" },
			{ slug: "nextjs", title: "@banata-auth/nextjs" },
			{ slug: "convex", title: "@banata-auth/convex" },
			{ slug: "shared", title: "@banata-auth/shared" },
		],
	},
	{
		section: "Deployment",
		items: [
			{ slug: "env-vars", title: "Self-Hosted Environment Variables" },
			{ slug: "deploy", title: "Deploying the Self-Hosted Stack" },
			{ slug: "self-hosting", title: "Self-Hosting" },
		],
	},
];
