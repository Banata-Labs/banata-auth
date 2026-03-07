import type { HttpClient } from "../client";

export interface ListEventsOptions {
	/** Filter by one or more event types (action strings). */
	eventTypes?: string[];
	/** Cursor for forward pagination. */
	after?: string;
	/** Maximum number of events to return. Default: 50, max: 200. */
	limit?: number;
	/** Filter by organization. */
	organizationId?: string;
	/** Range start date. */
	rangeStart?: Date;
	/** Range end date. */
	rangeEnd?: Date;
}

export interface EventPayload {
	id: string;
	type: string;
	data: Record<string, unknown>;
	createdAt: number;
}

export interface ListEventsResult {
	data: EventPayload[];
	cursor?: string;
	hasMore: boolean;
}

/**
 * Events resource.
 *
 * Provides a pollable, unified event stream sourced from audit log records.
 * Use this as an alternative to webhooks for consuming auth events.
 */
export class Events {
	constructor(private readonly http: HttpClient) {}

	/**
	 * List events with optional filters and cursor-based pagination.
	 */
	async listEvents(options?: ListEventsOptions): Promise<ListEventsResult> {
		return this.http.post<ListEventsResult>("/api/auth/banata/events/list", {
			eventTypes: options?.eventTypes,
			after: options?.after,
			limit: options?.limit,
			organizationId: options?.organizationId,
			rangeStart: options?.rangeStart?.getTime(),
			rangeEnd: options?.rangeEnd?.getTime(),
		});
	}
}
