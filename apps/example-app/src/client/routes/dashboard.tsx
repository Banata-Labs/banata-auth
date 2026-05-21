import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { useUser } from "@banata-auth/react";
import type { AppRole, TicketStatus } from "@shared/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function statusVariant(status: TicketStatus) {
	switch (status) {
		case "resolved":
			return "success";
		case "in_progress":
			return "default";
		case "waiting_on_customer":
			return "warning";
		default:
			return "outline";
	}
}

function roleCanManageTickets(role: AppRole | null) {
	return role === "admin" || role === "agent";
}

function roleCanManageTeam(role: AppRole | null) {
	return role === "admin";
}

export function DashboardPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, isAuthenticated, isLoading } = useUser();
	const [activeView, setActiveView] = useState<"tickets" | "team">("tickets");
	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
	const [ticketForm, setTicketForm] = useState({
		title: "",
		description: "",
		priority: "medium" as const,
	});
	const [workspaceName, setWorkspaceName] = useState("");
	const [inviteEmail, setInviteEmail] = useState("");
	const [commentBody, setCommentBody] = useState("");

	const bootstrapQuery = useQuery({
		queryKey: ["bootstrap"],
		queryFn: api.bootstrap,
		retry: false,
	});

	const activeOrganizationId = bootstrapQuery.data?.activeOrganization?.id ?? null;
	const ticketsQuery = useQuery({
		queryKey: ["tickets", activeOrganizationId],
		queryFn: () => api.listTickets(activeOrganizationId!),
		enabled: Boolean(activeOrganizationId),
	});

	const tickets = ticketsQuery.data?.tickets ?? [];
	const selectedTicket =
		tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0] ?? null;

	const createWorkspaceMutation = useMutation({
		mutationFn: api.createOrganization,
		onSuccess: async () => {
			setWorkspaceName("");
			await queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
		},
	});

	const switchWorkspaceMutation = useMutation({
		mutationFn: api.switchOrganization,
		onSuccess: async () => {
			setSelectedTicketId(null);
			await queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
			await queryClient.invalidateQueries({ queryKey: ["tickets"] });
		},
	});

	const createTicketMutation = useMutation({
		mutationFn: api.createTicket,
		onSuccess: async () => {
			setTicketForm({ title: "", description: "", priority: "medium" });
			await queryClient.invalidateQueries({ queryKey: ["tickets"] });
		},
	});

	const updateTicketMutation = useMutation({
		mutationFn: ({
			ticketId,
			payload,
		}: { ticketId: string; payload: Parameters<typeof api.updateTicket>[1] }) =>
			api.updateTicket(ticketId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tickets"] });
		},
	});

	const deleteTicketMutation = useMutation({
		mutationFn: ({ ticketId, organizationId }: { ticketId: string; organizationId: string }) =>
			api.deleteTicket(ticketId, organizationId),
		onSuccess: async () => {
			setSelectedTicketId(null);
			await queryClient.invalidateQueries({ queryKey: ["tickets"] });
		},
	});

	const addCommentMutation = useMutation({
		mutationFn: ({
			ticketId,
			organizationId,
			body,
		}: { ticketId: string; organizationId: string; body: string }) =>
			api.addComment(ticketId, { organizationId, body }),
		onSuccess: async () => {
			setCommentBody("");
			await queryClient.invalidateQueries({ queryKey: ["tickets"] });
		},
	});

	const inviteMemberMutation = useMutation({
		mutationFn: api.inviteMember,
		onSuccess: async () => {
			setInviteEmail("");
			await queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
		},
	});

	const updateMemberRoleMutation = useMutation({
		mutationFn: api.updateMemberRole,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
		},
	});

	const counts = useMemo(
		() => ({
			open: tickets.filter((ticket) => ticket.status === "open").length,
			inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
			resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
		}),
		[tickets],
	);

	if (!isLoading && !isAuthenticated) {
		navigate("/sign-in", { replace: true });
	}

	if (bootstrapQuery.isLoading || !user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
				Loading workspace...
			</div>
		);
	}

	if (bootstrapQuery.error instanceof ApiError && bootstrapQuery.error.status === 401) {
		navigate("/sign-in", { replace: true });
		return null;
	}

	const bootstrap = bootstrapQuery.data;
	if (!bootstrap) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
				Unable to load workspace.
			</div>
		);
	}

	const activeOrg = bootstrap.activeOrganization;

	return (
		<DashboardShell
			user={bootstrap.user}
			organizations={bootstrap.organizations}
			activeOrganizationId={activeOrg?.id ?? null}
			appRole={bootstrap.appRole}
			activeView={activeView}
			onChangeView={setActiveView}
			onSwitchOrganization={async (organizationId) => {
				await switchWorkspaceMutation.mutateAsync(organizationId);
			}}
		>
			{!activeOrg ? (
				<Card className="mx-auto max-w-2xl border-border/70 bg-card/70">
					<CardHeader>
						<CardTitle>Create your first workspace</CardTitle>
						<CardDescription>
							Create a workspace, invite teammates, and start tracking incoming issues.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="workspace-name">Workspace name</Label>
							<Input
								id="workspace-name"
								value={workspaceName}
								onChange={(event) => setWorkspaceName(event.target.value)}
							/>
						</div>
						<Button
							onClick={() => createWorkspaceMutation.mutate({ name: workspaceName })}
							disabled={!workspaceName.trim() || createWorkspaceMutation.isPending}
						>
							Create workspace
						</Button>
					</CardContent>
				</Card>
			) : (
				<Tabs
					value={activeView}
					onValueChange={(value) => setActiveView(value as "tickets" | "team")}
				>
					<TabsList className="mb-6">
						<TabsTrigger value="tickets">Tickets</TabsTrigger>
						<TabsTrigger value="team">Team</TabsTrigger>
					</TabsList>

					<TabsContent value="tickets" className="space-y-6">
						<div className="grid gap-4 md:grid-cols-3">
							<Card className="border-border/70 bg-card/70">
								<CardHeader>
									<CardDescription>Open tickets</CardDescription>
									<CardTitle>{counts.open}</CardTitle>
								</CardHeader>
							</Card>
							<Card className="border-border/70 bg-card/70">
								<CardHeader>
									<CardDescription>In progress</CardDescription>
									<CardTitle>{counts.inProgress}</CardTitle>
								</CardHeader>
							</Card>
							<Card className="border-border/70 bg-card/70">
								<CardHeader>
									<CardDescription>Resolved</CardDescription>
									<CardTitle>{counts.resolved}</CardTitle>
								</CardHeader>
							</Card>
						</div>

						<div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
							<Card className="border-border/70 bg-card/70">
								<CardHeader className="flex flex-row items-center justify-between gap-3">
									<div>
										<CardTitle>Ticket inbox</CardTitle>
										<CardDescription>
											{bootstrap.appRole === "customer"
												? "You only see tickets you created."
												: "Agents and admins can work across the whole queue."}
										</CardDescription>
									</div>
									<Dialog>
										<DialogTrigger asChild>
											<Button>
												<Plus className="mr-2 h-4 w-4" />
												New ticket
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Create ticket</DialogTitle>
												<DialogDescription>
													Log a new issue manually and drop it into the queue.
												</DialogDescription>
											</DialogHeader>
											<div className="grid gap-4">
												<div className="grid gap-2">
													<Label htmlFor="ticket-title">Title</Label>
													<Input
														id="ticket-title"
														value={ticketForm.title}
														onChange={(event) =>
															setTicketForm((current) => ({
																...current,
																title: event.target.value,
															}))
														}
													/>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="ticket-description">Description</Label>
													<Textarea
														id="ticket-description"
														value={ticketForm.description}
														onChange={(event) =>
															setTicketForm((current) => ({
																...current,
																description: event.target.value,
															}))
														}
													/>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="ticket-priority">Priority</Label>
													<Select
														value={ticketForm.priority}
														onValueChange={(value) =>
															setTicketForm((current) => ({
																...current,
																priority: value as typeof current.priority,
															}))
														}
													>
														<SelectTrigger id="ticket-priority">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="low">Low</SelectItem>
															<SelectItem value="medium">Medium</SelectItem>
															<SelectItem value="high">High</SelectItem>
															<SelectItem value="urgent">Urgent</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<Button
													onClick={() =>
														createTicketMutation.mutate({
															organizationId: activeOrg.id,
															title: ticketForm.title,
															description: ticketForm.description,
															priority: ticketForm.priority,
														})
													}
													disabled={
														!ticketForm.title ||
														!ticketForm.description ||
														createTicketMutation.isPending
													}
												>
													Create ticket
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</CardHeader>
								<CardContent className="grid gap-3">
									{tickets.map((ticket) => (
										<button
											key={ticket.id}
											type="button"
											onClick={() => setSelectedTicketId(ticket.id)}
											className={cn(
												"rounded-xl border p-4 text-left transition-colors",
												selectedTicket?.id === ticket.id
													? "border-primary/40 bg-primary/8"
													: "border-border/70 bg-background/50 hover:border-primary/30",
											)}
										>
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="font-medium">{ticket.title}</p>
													<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
														{ticket.description}
													</p>
												</div>
												<Badge variant={statusVariant(ticket.status)}>
													{ticket.status.replaceAll("_", " ")}
												</Badge>
											</div>
											<div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
												<span>{ticket.priority}</span>
												<span>{formatDate(ticket.updatedAt)}</span>
											</div>
										</button>
									))}
									{tickets.length === 0 ? (
										<div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
											No tickets yet. Create one to start your queue.
										</div>
									) : null}
								</CardContent>
							</Card>

							<Card className="border-border/70 bg-card/70">
								<CardHeader>
									<CardTitle>{selectedTicket ? selectedTicket.title : "Select a ticket"}</CardTitle>
									<CardDescription>
										{selectedTicket
											? `Opened ${formatDate(selectedTicket.createdAt)} by ${selectedTicket.createdByName}`
											: "Replies, assignment, and ticket actions show up here."}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-5">
									{selectedTicket ? (
										<>
											<div className="flex flex-wrap items-center gap-2">
												<Badge variant={statusVariant(selectedTicket.status)}>
													{selectedTicket.status.replaceAll("_", " ")}
												</Badge>
												<Badge variant="outline">{selectedTicket.priority}</Badge>
												{selectedTicket.assigneeName ? (
													<Badge variant="secondary">
														Assigned to {selectedTicket.assigneeName}
													</Badge>
												) : null}
											</div>
											<p className="text-sm leading-7 text-muted-foreground">
												{selectedTicket.description}
											</p>

											{roleCanManageTickets(bootstrap.appRole) ? (
												<div className="grid gap-4 rounded-xl border border-border/70 bg-background/60 p-4">
													<p className="text-sm font-medium">Workflow controls</p>
													<div className="grid gap-3 md:grid-cols-3">
														<Select
															value={selectedTicket.status}
															onValueChange={(value) =>
																updateTicketMutation.mutate({
																	ticketId: selectedTicket.id,
																	payload: {
																		organizationId: activeOrg.id,
																		status: value as TicketStatus,
																	},
																})
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="open">Open</SelectItem>
																<SelectItem value="in_progress">In progress</SelectItem>
																<SelectItem value="waiting_on_customer">
																	Waiting on customer
																</SelectItem>
																<SelectItem value="resolved">Resolved</SelectItem>
															</SelectContent>
														</Select>
														<Select
															value={selectedTicket.priority}
															onValueChange={(value) =>
																updateTicketMutation.mutate({
																	ticketId: selectedTicket.id,
																	payload: {
																		organizationId: activeOrg.id,
																		priority: value as "low" | "medium" | "high" | "urgent",
																	},
																})
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="low">Low</SelectItem>
																<SelectItem value="medium">Medium</SelectItem>
																<SelectItem value="high">High</SelectItem>
																<SelectItem value="urgent">Urgent</SelectItem>
															</SelectContent>
														</Select>
														<Select
															value={selectedTicket.assigneeUserId ?? "__unassigned__"}
															onValueChange={(value) =>
																updateTicketMutation.mutate({
																	ticketId: selectedTicket.id,
																	payload: {
																		organizationId: activeOrg.id,
																		assigneeUserId: value === "__unassigned__" ? null : value,
																	},
																})
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="__unassigned__">Unassigned</SelectItem>
																{activeOrg.members.map((member) => (
																	<SelectItem key={member.userId} value={member.userId}>
																		{member.user.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											) : null}

											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<p className="text-sm font-medium">Conversation</p>
													{bootstrap.appRole === "admin" ? (
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																deleteTicketMutation.mutate({
																	ticketId: selectedTicket.id,
																	organizationId: activeOrg.id,
																})
															}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</Button>
													) : null}
												</div>
												{selectedTicket.comments.length === 0 ? (
													<div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
														No comments yet.
													</div>
												) : (
													selectedTicket.comments.map((comment) => (
														<div
															key={comment.id}
															className="rounded-xl border border-border/70 bg-background/45 p-4"
														>
															<div className="flex items-center justify-between gap-3">
																<p className="text-sm font-medium">{comment.authorName}</p>
																<span className="text-xs text-muted-foreground">
																	{formatDate(comment.createdAt)}
																</span>
															</div>
															<p className="mt-2 text-sm text-muted-foreground">{comment.body}</p>
														</div>
													))
												)}
											</div>

											<div className="grid gap-3">
												<Label htmlFor="comment-body">Add comment</Label>
												<Textarea
													id="comment-body"
													value={commentBody}
													onChange={(event) => setCommentBody(event.target.value)}
													placeholder="Share an update with the workspace"
												/>
												<Button
													onClick={() =>
														addCommentMutation.mutate({
															ticketId: selectedTicket.id,
															organizationId: activeOrg.id,
															body: commentBody,
														})
													}
													disabled={!commentBody.trim() || addCommentMutation.isPending}
												>
													<MessageSquarePlus className="mr-2 h-4 w-4" />
													Post update
												</Button>
											</div>
										</>
									) : (
										<div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
											Choose a ticket to review replies, ownership, and status.
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="team">
						<div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
							<Card className="border-border/70 bg-card/70">
								<CardHeader>
									<CardTitle>Members</CardTitle>
									<CardDescription>
										Use app roles to decide who can manage the queue and who can only submit issues.
									</CardDescription>
								</CardHeader>
								<CardContent className="grid gap-3">
									{activeOrg.members.map((member) => (
										<div
											key={member.userId}
											className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/45 p-4 md:flex-row md:items-center md:justify-between"
										>
											<div>
												<p className="font-medium">{member.user.name}</p>
												<p className="text-sm text-muted-foreground">{member.user.email}</p>
												<p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
													Workspace role: {member.role}
												</p>
											</div>
											<div className="flex items-center gap-3">
												<Badge variant="outline">{member.appRole}</Badge>
												{roleCanManageTeam(bootstrap.appRole) ? (
													<Select
														value={member.appRole}
														onValueChange={(value) =>
															updateMemberRoleMutation.mutate({
																organizationId: activeOrg.id,
																userId: member.userId,
																role: value as AppRole,
															})
														}
													>
														<SelectTrigger className="w-[160px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="admin">Admin</SelectItem>
															<SelectItem value="agent">Agent</SelectItem>
															<SelectItem value="customer">Customer</SelectItem>
														</SelectContent>
													</Select>
												) : null}
											</div>
										</div>
									))}
								</CardContent>
							</Card>

							<Card className="border-border/70 bg-card/70">
								<CardHeader>
									<CardTitle>Invite teammate</CardTitle>
									<CardDescription>
										Send an invitation, then adjust their app role after they join.
									</CardDescription>
								</CardHeader>
								<CardContent className="grid gap-4">
									<div className="grid gap-2">
										<Label htmlFor="invite-email">Email address</Label>
										<Input
											id="invite-email"
											value={inviteEmail}
											onChange={(event) => setInviteEmail(event.target.value)}
										/>
									</div>
									<Button
										disabled={!roleCanManageTeam(bootstrap.appRole) || !inviteEmail}
										onClick={() =>
											inviteMemberMutation.mutate({
												organizationId: activeOrg.id,
												email: inviteEmail,
											})
										}
									>
										Send invitation
									</Button>
									<div className="rounded-xl border border-border/70 bg-background/50 p-4 text-sm text-muted-foreground">
										<p className="font-medium text-foreground">Role model</p>
										<ul className="mt-3 space-y-2">
											<li>Customers can open tickets and reply on their own issues.</li>
											<li>Agents can triage, assign, and resolve tickets across the queue.</li>
											<li>Admins can manage roles and delete tickets.</li>
										</ul>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			)}
		</DashboardShell>
	);
}
