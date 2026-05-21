export type AppRole = "admin" | "agent" | "customer";

export type TicketStatus = "open" | "in_progress" | "waiting_on_customer" | "resolved";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	image: string | null;
}

export interface AuthSession {
	id: string;
	userId: string;
	activeOrganizationId: string | null;
	expiresAt: string;
}

export interface OrganizationSummary {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
}

export interface OrganizationInvitation {
	id: string;
	email: string;
	role: string;
	status: "pending" | "accepted" | "expired" | "revoked";
	createdAt: string;
	expiresAt: string;
}

export interface OrganizationMember {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: string;
	user: AuthUser;
	appRole: AppRole;
}

export interface ActiveOrganization extends OrganizationSummary {
	members: OrganizationMember[];
	invitations: OrganizationInvitation[];
}

export interface BootstrapPayload {
	user: AuthUser;
	session: AuthSession;
	organizations: OrganizationSummary[];
	activeOrganization: ActiveOrganization | null;
	appRole: AppRole | null;
}

export interface TicketCommentRecord {
	id: string;
	ticketId: string;
	authorUserId: string;
	authorName: string;
	authorImage: string | null;
	body: string;
	createdAt: string;
}

export interface TicketRecord {
	id: string;
	organizationId: string;
	title: string;
	description: string;
	status: TicketStatus;
	priority: TicketPriority;
	createdByUserId: string;
	createdByName: string;
	createdByImage: string | null;
	assigneeUserId: string | null;
	assigneeName: string | null;
	assigneeImage: string | null;
	createdAt: string;
	updatedAt: string;
	comments: TicketCommentRecord[];
}

export interface CreateOrganizationInput {
	name: string;
}

export interface SwitchOrganizationInput {
	organizationId: string;
}

export interface InviteMemberInput {
	organizationId: string;
	email: string;
}

export interface UpdateMemberRoleInput {
	organizationId: string;
	userId: string;
	role: AppRole;
}

export interface CreateTicketInput {
	organizationId: string;
	title: string;
	description: string;
	priority: TicketPriority;
}

export interface UpdateTicketInput {
	organizationId: string;
	status?: TicketStatus;
	priority?: TicketPriority;
	assigneeUserId?: string | null;
}

export interface AddCommentInput {
	organizationId: string;
	body: string;
}

export interface ApiErrorPayload {
	error: string;
}
