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
		section: "Start Here",
		items: [
			{ slug: "introduction", title: "Introduction" },
			{ slug: "quickstart", title: "Quick Start" },
			{ slug: "api-keys", title: "API Keys" },
			{ slug: "projects-environments", title: "Projects" },
			{ slug: "project-structure", title: "Project Structure" },
		],
	},
	{
		section: "Build Your App",
		items: [
			{ slug: "nextjs", title: "Next.js" },
			{ slug: "react", title: "React" },
			{ slug: "sdk", title: "SDK Reference" },
		],
	},
	{
		section: "Configure Authentication",
		items: [
			{ slug: "auth-configuration", title: "Auth Configuration" },
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
		section: "Organizations & RBAC",
		items: [
			{ slug: "organizations-overview", title: "Overview" },
			{ slug: "roles-permissions", title: "Roles & Permissions" },
			{ slug: "resource-types", title: "Resource Types" },
			{ slug: "invitations", title: "Invitations" },
		],
	},
	{
		section: "Operate Your Project",
		items: [
			{ slug: "emails", title: "Emails" },
			{ slug: "email-templates", title: "Email Templates" },
			{ slug: "webhooks", title: "Webhooks" },
			{ slug: "audit-logs", title: "Audit Logs" },
			{ slug: "notifications", title: "Notifications" },
			{ slug: "settings", title: "Settings" },
			{ slug: "domains", title: "Domains" },
			{ slug: "redirects", title: "Redirects" },
			{ slug: "account", title: "Account Management" },
			{ slug: "radar", title: "Radar" },
			{ slug: "bot-protection", title: "Bot Protection" },
			{ slug: "addons", title: "Add-ons" },
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
		section: "Platform Operators",
		items: [
			{ slug: "convex", title: "Convex Integration" },
			{ slug: "shared", title: "Shared Package" },
			{ slug: "env-vars", title: "Environment Variables" },
			{ slug: "deploy", title: "Deploy to Production" },
			{ slug: "self-hosting", title: "Self-Hosting" },
			{ slug: "hosted-ui", title: "Hosted Sign-In" },
		],
	},
];
