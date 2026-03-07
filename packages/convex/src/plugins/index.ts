// Convex-specific Better Auth plugins.
// These extend Better Auth's plugin system with Convex-native functionality.
//
// Planned plugins:
// - radar: Bot detection and abuse prevention
// - fga: Fine-grained authorization engine

export {
	auditLog,
	logAuditEvent,
	type AuditLogPluginOptions,
	type LogAuditEventParams,
} from "./audit";
export {
	webhookSystem,
	signWebhookPayload,
	verifyWebhookSignature,
	dispatchWebhookEvent,
	type WebhookPluginOptions,
} from "./webhook";
export { configPlugin, type ConfigPluginOptions } from "./config";
export {
	banataProtection,
	type BanataProtectionOptions,
	type BotVerifyFn,
	type BotVerificationResult,
} from "./protection";
export {
	banataEmail,
	createAutoEmailCallbacks,
	type BanataEmailOptions,
} from "./email";
export { domainsPlugin } from "./domains";
export { eventsPlugin } from "./events";
export {
	vaultPlugin,
	type VaultPluginOptions,
} from "./vault";
export {
	projectsPlugin,
	type ProjectsPluginOptions,
} from "./projects";
export { enterpriseProvisioningPlugin } from "./enterprise";
export { portalPlugin } from "./portal";
export { organizationRbacPlugin } from "./organization-rbac";
export { userManagementPlugin } from "./user-management";
export {
	renderEmail,
	getTemplateSubject,
	getPreviewData,
	type EmailBranding,
	type EmailData,
	type EmailTemplateType,
	type RenderedEmail,
	type VerificationEmailData,
	type PasswordResetEmailData,
	type MagicLinkEmailData,
	type EmailOtpData,
	type InvitationEmailData,
	type WelcomeEmailData,
} from "./email-templates";
export {
	sendEmail,
	validateCredentials,
	type EmailProviderId,
	type EmailMessage,
	type EmailProviderCredentials,
	type SendResult,
} from "./email-sender";

// Re-export scope helpers for consumers
export {
	projectScopeSchema,
	getProjectScope,
	getEffectiveProjectPermissions,
	requireProjectPermission,
} from "./types";

// Re-export shared plugin types for consumers
export type {
	PluginDBAdapter,
	PluginAuthContext,
	PluginEndpointContext,
	PluginHookContext,
	WhereClause,
	SortBy,
	SessionUser,
	SessionRecord,
	AuditEventRow,
	WebhookEndpointRow,
	WebhookDeliveryRow,
	RoleDefinitionRow,
	PermissionDefinitionRow,
	BrandingConfigRow,
	EmailConfigRow,
	EmailTemplateRow,
	ProjectRow,
} from "./types";
