import type {
	AddCommentInput,
	BootstrapPayload,
	CreateOrganizationInput,
	CreateTicketInput,
	InviteMemberInput,
	TicketRecord,
	UpdateMemberRoleInput,
	UpdateTicketInput,
} from "@shared/contracts";

export class ApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(path, {
		credentials: "include",
		headers: {
			"content-type": "application/json",
			...(init?.headers ?? {}),
		},
		...init,
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new ApiError(text || response.statusText, response.status);
	}

	if (response.status === 204) {
		return null as T;
	}

	return response.json() as Promise<T>;
}

export const api = {
	bootstrap: () => request<BootstrapPayload>("/api/app/bootstrap"),
	createOrganization: (input: CreateOrganizationInput) =>
		request<{ success: boolean; organizationId?: string }>("/api/app/organizations", {
			method: "POST",
			body: JSON.stringify(input),
		}),
	switchOrganization: (organizationId: string) =>
		request<{ success: boolean }>("/api/app/organizations/active", {
			method: "POST",
			body: JSON.stringify({ organizationId }),
		}),
	listTickets: (organizationId: string) =>
		request<{ tickets: TicketRecord[] }>(
			`/api/app/tickets?organizationId=${encodeURIComponent(organizationId)}`,
		),
	createTicket: (input: CreateTicketInput) =>
		request<{ success: boolean; ticketId: string }>("/api/app/tickets", {
			method: "POST",
			body: JSON.stringify(input),
		}),
	updateTicket: (ticketId: string, input: UpdateTicketInput) =>
		request<{ success: boolean }>(`/api/app/tickets/${ticketId}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		}),
	deleteTicket: (ticketId: string, organizationId: string) =>
		request<{ success: boolean }>(
			`/api/app/tickets/${ticketId}?organizationId=${encodeURIComponent(organizationId)}`,
			{
				method: "DELETE",
			},
		),
	addComment: (ticketId: string, input: AddCommentInput) =>
		request<{ success: boolean }>(`/api/app/tickets/${ticketId}/comments`, {
			method: "POST",
			body: JSON.stringify(input),
		}),
	inviteMember: (input: InviteMemberInput) =>
		request<{ success: boolean }>("/api/app/members/invite", {
			method: "POST",
			body: JSON.stringify(input),
		}),
	updateMemberRole: (input: UpdateMemberRoleInput) =>
		request<{ success: boolean }>("/api/app/members/role", {
			method: "PATCH",
			body: JSON.stringify(input),
		}),
};
