"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type RoleItem,
	createOrganization,
	inviteOrganizationMember,
	listOrganizations,
	listRoles,
} from "@/lib/dashboard-api";
import type { Organization } from "@banata-auth/shared";
import { Building2, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function OrganizationsPanel({ initial }: { initial: Organization[] }) {
	const router = useRouter();
	const activeProjectId = useActiveProjectId();
	const [organizations, setOrganizations] = useState<Organization[]>(initial);
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteOrg, setInviteOrg] = useState("");
	const [inviteRole, setInviteRole] = useState("super_admin");
	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showInviteDialog, setShowInviteDialog] = useState(false);

	const refreshRoles = useCallback(async () => {
		const available = await listRoles().catch(() => [] as RoleItem[]);
		setRoles(available);
		if (available.length > 0) {
			setInviteRole((current) =>
				available.some((r) => r.slug === current) ? current : (available[0]?.slug ?? "super_admin"),
			);
		}
	}, []);

	useEffect(() => {
		if (activeProjectId === undefined) {
			return;
		}
		void refreshRoles();
	}, [activeProjectId, refreshRoles]);

	useEffect(() => {
		setOrganizations(initial);
	}, [initial]);

	async function refresh() {
		setOrganizations(await listOrganizations());
	}

	return (
		<div className="grid gap-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="size-4" />
					Create Organization
				</Button>
				<Button variant="outline" onClick={() => setShowInviteDialog(true)}>
					<UserPlus className="size-4" />
					Invite Member
				</Button>
			</div>

			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>SSO Policy</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{organizations.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="py-12 text-center">
										<div className="flex flex-col items-center gap-3 text-muted-foreground">
											<Building2 className="size-8 opacity-40" />
											<div className="space-y-1">
												<p className="text-sm font-medium">No organizations yet</p>
												<p className="text-xs">Create your first organization to get started.</p>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="mt-1"
												onClick={() => setShowCreateDialog(true)}
											>
												<Plus className="size-4" />
												Create Organization
											</Button>
										</div>
									</TableCell>
								</TableRow>
							) : (
								organizations.map((org) => (
									<TableRow
										key={org.id}
										className="cursor-pointer"
										onClick={() => router.push(`/organizations/${org.id}`)}
									>
										<TableCell className="font-medium">{org.name}</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{org.slug}
										</TableCell>
										<TableCell>
											<Badge variant={org.ssoEnforced ? "default" : "secondary"}>
												{org.ssoEnforced ? "Enforced" : "Optional"}
											</Badge>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Create Organization Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Organization</DialogTitle>
						<DialogDescription>Add a new organization to your project.</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								await createOrganization({ name, slug });
								setName("");
								setSlug("");
								setShowCreateDialog(false);
								await refresh();
								toast.success("Organization created");
							} catch {
								toast.error("Unable to create organization");
							}
						}}
						className="grid gap-4"
					>
						<div className="grid gap-2">
							<Label htmlFor="org-name">Name</Label>
							<Input
								id="org-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Acme Inc."
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="org-slug">Slug</Label>
							<Input
								id="org-slug"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder="acme-inc"
								required
							/>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
								Cancel
							</Button>
							<Button type="submit">Create</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Invite Member Dialog */}
			<Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite Member</DialogTitle>
						<DialogDescription>Send an invitation to join an organization.</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								await inviteOrganizationMember({
									organizationId: inviteOrg,
									email: inviteEmail,
									role: inviteRole,
								});
								setInviteEmail("");
								setShowInviteDialog(false);
								toast.success("Invitation sent");
							} catch {
								toast.error("Unable to send invitation");
							}
						}}
						className="grid gap-4"
					>
						<div className="grid gap-2">
							<Label htmlFor="invite-org">Organization</Label>
							<Select value={inviteOrg} onValueChange={setInviteOrg}>
								<SelectTrigger id="invite-org">
									<SelectValue placeholder="Choose organization" />
								</SelectTrigger>
								<SelectContent>
									{organizations.map((org) => (
										<SelectItem key={org.id} value={org.id}>
											{org.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="invite-email">Email address</Label>
							<Input
								id="invite-email"
								type="email"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								placeholder="user@company.com"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="invite-role">Role</Label>
							<Select value={inviteRole} onValueChange={setInviteRole}>
								<SelectTrigger id="invite-role">
									<SelectValue placeholder="Choose role" />
								</SelectTrigger>
								<SelectContent>
									{roles.length === 0 ? (
										<SelectItem value="super_admin">super_admin</SelectItem>
									) : (
										roles.map((role) => (
											<SelectItem key={role.id} value={role.slug}>
												{role.slug}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={!inviteOrg}>
								Send Invite
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
