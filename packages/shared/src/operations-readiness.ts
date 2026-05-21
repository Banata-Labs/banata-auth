import { z } from "zod";

export const requiredAuthMonitoringSignals = [
	"auth_request_error_rate",
	"auth_request_latency_p95",
	"token_issuance_failures",
	"otp_delivery_failures",
	"webhook_delivery_failures",
	"webhook_dead_letter_count",
	"scim_sync_failures",
	"sso_callback_failures",
	"audit_sink_failures",
	"oauth_provider_callback_failures",
] as const;

export type AuthMonitoringSignal = (typeof requiredAuthMonitoringSignals)[number];

export const requiredAuthAlertRoutes = [
	"auth_outage",
	"key_compromise",
	"provider_outage",
	"webhook_dead_letter_growth",
	"audit_sink_failure",
	"otp_provider_failure",
] as const;

export type AuthAlertRoute = (typeof requiredAuthAlertRoutes)[number];

export const requiredIncidentDrills = [
	"signing_key_compromise",
	"api_key_leak",
	"oauth_provider_compromise",
	"webhook_outage",
	"audit_sink_failure",
	"account_takeover",
] as const;

export type AuthIncidentDrill = (typeof requiredIncidentDrills)[number];

export const requiredRetentionSubjects = [
	"users",
	"sessions",
	"devices",
	"audit_logs",
	"webhook_deliveries",
	"scim_sync_state",
	"otp_attempts",
	"deleted_customer_projects",
] as const;

export type AuthRetentionSubject = (typeof requiredRetentionSubjects)[number];

export const requiredCustomerReadinessControls = [
	"project_setup_wizard",
	"redirect_uri_validation",
	"provider_setup_checklists",
	"environment_separation",
	"api_key_rotation",
	"audit_export",
	"status_page",
	"data_retention_policy",
] as const;

export type CustomerReadinessControl = (typeof requiredCustomerReadinessControls)[number];

const statusSchema = z.enum(["pending", "verified", "blocked"]);

export const monitoringSignalSchema = z.object({
	id: z.enum(requiredAuthMonitoringSignals),
	status: statusSchema,
	owner: z.string().trim().min(1),
	dashboardUrl: z.string().url().optional(),
	alertThreshold: z.string().trim().min(1),
});

export const alertRouteSchema = z.object({
	id: z.enum(requiredAuthAlertRoutes),
	status: statusSchema,
	owner: z.string().trim().min(1),
	escalationTarget: z.string().trim().min(1),
	responseTimeMinutes: z.number().int().positive().max(240),
});

export const incidentDrillSchema = z.object({
	id: z.enum(requiredIncidentDrills),
	status: statusSchema,
	owner: z.string().trim().min(1),
	runbookUrl: z.string().url(),
	lastDrilledAt: z.string().datetime().optional(),
});

export const retentionPolicySchema = z.object({
	subject: z.enum(requiredRetentionSubjects),
	status: statusSchema,
	retentionDays: z.number().int().positive().max(3650),
	deletionRunbookUrl: z.string().url(),
	exportSupported: z.boolean(),
});

export const customerReadinessControlSchema = z.object({
	id: z.enum(requiredCustomerReadinessControls),
	status: statusSchema,
	owner: z.string().trim().min(1),
	evidenceUrl: z.string().url().optional(),
	notes: z.string().trim().min(1),
});

export const operationsReadinessEvidenceSchema = z
	.object({
		environment: z.enum(["staging", "production"]),
		monitoringSignals: z.array(monitoringSignalSchema),
		alertRoutes: z.array(alertRouteSchema),
		incidentDrills: z.array(incidentDrillSchema),
		retentionPolicies: z.array(retentionPolicySchema),
		customerReadinessControls: z.array(customerReadinessControlSchema).default([]),
		statusPageUrl: z.string().url().optional(),
		releaseApprovalRunbookUrl: z.string().url().optional(),
		customerSupportToolingUrl: z.string().url().optional(),
		environmentSeparationEvidenceUrl: z.string().url().optional(),
	})
	.superRefine((evidence, ctx) => {
		validateCompleteSet(
			evidence.monitoringSignals,
			requiredAuthMonitoringSignals,
			"monitoringSignals",
			ctx,
		);
		validateCompleteSet(evidence.alertRoutes, requiredAuthAlertRoutes, "alertRoutes", ctx);
		validateCompleteSet(evidence.incidentDrills, requiredIncidentDrills, "incidentDrills", ctx);
		validateCompleteSet(
			evidence.retentionPolicies,
			requiredRetentionSubjects,
			"retentionPolicies",
			ctx,
			"subject",
		);
		validateCompleteSet(
			evidence.customerReadinessControls,
			requiredCustomerReadinessControls,
			"customerReadinessControls",
			ctx,
		);

		if (evidence.environment === "production") {
			for (const field of [
				"statusPageUrl",
				"releaseApprovalRunbookUrl",
				"customerSupportToolingUrl",
				"environmentSeparationEvidenceUrl",
			] as const) {
				if (!evidence[field]) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Production operations evidence requires ${field}.`,
						path: [field],
					});
				}
			}
		}
	});

export type OperationsReadinessEvidence = z.infer<typeof operationsReadinessEvidenceSchema>;

export function validateOperationsReadinessEvidence(
	evidence: OperationsReadinessEvidence,
): OperationsReadinessEvidence {
	return operationsReadinessEvidenceSchema.parse(evidence);
}

function validateCompleteSet<T extends { id?: string; subject?: string }>(
	items: T[],
	required: readonly string[],
	path: string,
	ctx: z.RefinementCtx,
	key: "id" | "subject" = "id",
): void {
	const seen = new Set<string>();
	for (const item of items) {
		const value = item[key];
		if (!value) continue;
		if (seen.has(value)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Duplicate ${path} entry ${value}.`,
				path: [path],
			});
		}
		seen.add(value);
	}

	for (const requiredItem of required) {
		if (!seen.has(requiredItem)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Missing ${path} entry ${requiredItem}.`,
				path: [path],
			});
		}
	}
}
