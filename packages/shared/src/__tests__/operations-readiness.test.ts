import { describe, expect, it } from "vitest";
import {
	requiredAuthAlertRoutes,
	requiredAuthMonitoringSignals,
	requiredCustomerReadinessControls,
	requiredIncidentDrills,
	requiredRetentionSubjects,
	validateOperationsReadinessEvidence,
} from "../operations-readiness";

function completeEvidence() {
	return {
		environment: "production" as const,
		monitoringSignals: requiredAuthMonitoringSignals.map((id) => ({
			id,
			status: "verified" as const,
			owner: "platform-oncall",
			alertThreshold: "page when above production threshold for 5 minutes",
			dashboardUrl: `https://monitoring.example.com/${id}`,
		})),
		alertRoutes: requiredAuthAlertRoutes.map((id) => ({
			id,
			status: "verified" as const,
			owner: "platform-oncall",
			escalationTarget: "security-lead",
			responseTimeMinutes: 15,
		})),
		incidentDrills: requiredIncidentDrills.map((id) => ({
			id,
			status: "verified" as const,
			owner: "security",
			runbookUrl: `https://runbooks.example.com/${id}`,
			lastDrilledAt: "2026-05-21T00:00:00.000Z",
		})),
		retentionPolicies: requiredRetentionSubjects.map((subject) => ({
			subject,
			status: "verified" as const,
			retentionDays: subject === "audit_logs" ? 365 : 90,
			deletionRunbookUrl: `https://runbooks.example.com/retention/${subject}`,
			exportSupported: subject !== "otp_attempts",
		})),
		customerReadinessControls: requiredCustomerReadinessControls.map((id) => ({
			id,
			status: "verified" as const,
			owner: "platform-product",
			evidenceUrl: `https://evidence.example.com/customer-readiness/${id}`,
			notes: `Verified ${id} for customer onboarding.`,
		})),
		statusPageUrl: "https://status.example.com",
		releaseApprovalRunbookUrl: "https://runbooks.example.com/release-approval",
		customerSupportToolingUrl: "https://support.example.com/auth",
		environmentSeparationEvidenceUrl: "https://evidence.example.com/env-separation",
	};
}

describe("operations readiness evidence", () => {
	it("accepts complete production operations evidence", () => {
		const evidence = validateOperationsReadinessEvidence(completeEvidence());

		expect(evidence.monitoringSignals).toHaveLength(requiredAuthMonitoringSignals.length);
		expect(evidence.alertRoutes).toHaveLength(requiredAuthAlertRoutes.length);
		expect(evidence.incidentDrills).toHaveLength(requiredIncidentDrills.length);
		expect(evidence.retentionPolicies).toHaveLength(requiredRetentionSubjects.length);
		expect(evidence.customerReadinessControls).toHaveLength(
			requiredCustomerReadinessControls.length,
		);
	});

	it("rejects missing monitoring signals", () => {
		const evidence = completeEvidence();
		evidence.monitoringSignals = evidence.monitoringSignals.filter(
			(signal) => signal.id !== "audit_sink_failures",
		);

		expect(() => validateOperationsReadinessEvidence(evidence)).toThrow(/audit_sink_failures/);
	});

	it("rejects duplicate alert routes", () => {
		const evidence = completeEvidence();
		const firstRoute = evidence.alertRoutes[0];
		if (!firstRoute) {
			throw new Error("Missing alert route fixture.");
		}
		evidence.alertRoutes = [...evidence.alertRoutes, firstRoute];

		expect(() => validateOperationsReadinessEvidence(evidence)).toThrow(/Duplicate alertRoutes/);
	});

	it("rejects incomplete retention coverage", () => {
		const evidence = completeEvidence();
		evidence.retentionPolicies = evidence.retentionPolicies.filter(
			(policy) => policy.subject !== "deleted_customer_projects",
		);

		expect(() => validateOperationsReadinessEvidence(evidence)).toThrow(
			/deleted_customer_projects/,
		);
	});

	it("requires production status, release, support, and environment separation evidence", () => {
		const { statusPageUrl: _statusPageUrl, ...evidence } = completeEvidence();

		expect(() => validateOperationsReadinessEvidence(evidence)).toThrow(/statusPageUrl/);
	});

	it("rejects incomplete customer-facing readiness controls", () => {
		const evidence = completeEvidence();
		evidence.customerReadinessControls = evidence.customerReadinessControls.filter(
			(control) => control.id !== "redirect_uri_validation",
		);

		expect(() => validateOperationsReadinessEvidence(evidence)).toThrow(
			/redirect_uri_validation/,
		);
	});
});
