export { BanataAuth } from "./client";
export type { BanataAuthOptions } from "./client";
export { ApiKeys } from "./resources/api-keys";
export { UserManagement } from "./resources/user-management";
export { Organizations } from "./resources/organizations";
export { SSO } from "./resources/sso";
export { DirectorySync } from "./resources/directory-sync";
export {
	AuditLogs,
	type CreateAuditEventOptions,
	type ListAuditEventsOptions,
	type ExportAuditEventsOptions,
	type ExportAuditEventsResult,
} from "./resources/audit-logs";
export {
	Emails,
	type BuiltInEmailTemplateType,
	type SendEmailOptions,
	type SendEmailResult,
	type EmailPreview,
	type EmailTemplate,
	type EmailTemplateCategory,
	type CreateEmailTemplateOptions,
	type UpdateEmailTemplateOptions,
} from "./resources/emails";
export {
	Events,
	type ListEventsOptions,
	type EventPayload,
	type ListEventsResult,
} from "./resources/events";
export { Webhooks } from "./resources/webhooks";
export {
	Portal,
	type PortalIntent,
	type GeneratePortalLinkOptions,
	type PortalLinkResult,
} from "./resources/portal";
export { Vault } from "./resources/vault";
export { Domains } from "./resources/domains";
export { Rbac } from "./resources/rbac";
export {
	Projects,
	type SdkProject,
	type CreateProjectOptions,
	type UpdateProjectOptions,
} from "./resources/projects";

// Re-export types from shared
export type {
	User,
	Session,
	Organization,
	OrganizationMember,
	OrganizationInvitation,
	Team,
	SsoConnection,
	SsoProfile,
	Directory,
	DirectoryUser,
	DirectoryGroup,
	AuditEvent,
	WebhookEndpoint,
	WebhookEvent,
	VaultSecret,
	DomainVerification,
	ApiKey,
	PortalSession,
	PaginatedResult,
	ListMetadata,
	Project,
} from "@banata-auth/shared";

// Re-export errors
export {
	BanataAuthError,
	AuthenticationError,
	ForbiddenError,
	NotFoundError,
	ConflictError,
	ValidationError,
	RateLimitError,
	InternalError,
} from "@banata-auth/shared";
