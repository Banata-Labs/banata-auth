import type { AuditEvent, PaginatedResult } from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface CreateAuditEventOptions {
	action: string;
	actorType: AuditEvent["actor"]["type"];
	actorId: string;
	actorName?: string;
	actorEmail?: string;
	targets?: AuditEvent["targets"];
	organizationId?: string;
	ipAddress?: string;
	userAgent?: string;
	changes?: AuditEvent["changes"];
	idempotencyKey?: string;
	metadata?: Record<string, string>;
	occurredAt?: Date;
}

export interface ListAuditEventsOptions {
	organizationId?: string;
	/** Filter by a single action string. */
	action?: string;
	actorId?: string;
	after?: string;
	before?: string;
	limit?: number;
}

export interface ExportAuditEventsOptions {
	organizationId?: string;
	format: "csv" | "json";
	/** Start of the date range (converted to epoch ms). */
	startDate?: Date;
	/** End of the date range (converted to epoch ms). */
	endDate?: Date;
	/** Filter by a single action string. */
	action?: string;
	limit?: number;
	/** Cursor for pagination (epoch ms number from the backend). */
	cursor?: number;
}

export interface ExportAuditEventsResult {
	data: AuditEvent[];
	count: number;
	/** Cursor for next page (epoch ms number). */
	nextCursor?: number;
}

export class AuditLogs {
	constructor(private readonly http: HttpClient) {}

	async createEvent(options: CreateAuditEventOptions): Promise<AuditEvent> {
		return this.http.post<AuditEvent>("/api/auth/banata/audit-logs/create", {
			action: options.action,
			actorType: options.actorType,
			actorId: options.actorId,
			actorName: options.actorName,
			actorEmail: options.actorEmail,
			targets: options.targets ? JSON.stringify(options.targets) : undefined,
			organizationId: options.organizationId,
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			changes: options.changes ? JSON.stringify(options.changes) : undefined,
			idempotencyKey: options.idempotencyKey,
			metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
			occurredAt: options.occurredAt?.getTime(),
		});
	}

	async listEvents(options?: ListAuditEventsOptions): Promise<PaginatedResult<AuditEvent>> {
		return this.http.post<PaginatedResult<AuditEvent>>("/api/auth/banata/audit-logs/list", {
			organizationId: options?.organizationId,
			action: options?.action,
			actorId: options?.actorId,
			after: options?.after,
			before: options?.before,
			limit: options?.limit,
		});
	}

	async exportEvents(options: ExportAuditEventsOptions): Promise<ExportAuditEventsResult> {
		return this.http.post<ExportAuditEventsResult>("/api/auth/banata/audit-logs/export", {
			organizationId: options.organizationId,
			format: options.format,
			startDate: options.startDate?.getTime(),
			endDate: options.endDate?.getTime(),
			action: options.action,
			limit: options.limit,
			cursor: options.cursor,
		});
	}
}
