"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

	const refreshRoles = useCallback(async () => {
		const available = await listRoles().catch(() => [] as RoleItem[]);
		setRoles(available);
		if (available.length > 0) {
			setInviteRole((current) =>
				available.some((r) => r.slug === current) ? current : (available[0]?.slug ?? "super_admin"),
			);
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: activeProjectId triggers re-fetch on project switch
	}, [activeProjectId]);

	useEffect(() => {
		void refreshRoles();
	}, [refreshRoles]);

	// Sync organizations when parent provides new initial data (project switch)
	useEffect(() => {
		setOrganizations(initial);
	}, [initial]);

	async function refresh() {
		setOrganizations(await listOrganizations());
	}

	return (
		<div className="grid gap-6">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Create Organization</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								try {
									await createOrganization({ name, slug });
									setName("");
									setSlug("");
									await refresh();
									toast.success("Organization created");
								} catch {
									toast.error("Unable to create organization");
								}
							}}
							className="grid gap-3"
						>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Organization name"
								required
							/>
							<Input
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder="org-slug"
								required
							/>
							<Button type="submit">Create</Button>
						</form>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Invite Member</CardTitle>
					</CardHeader>
					<CardContent>
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
									toast.success("Invitation sent");
								} catch {
									toast.error("Unable to send invitation");
								}
							}}
							className="grid gap-3"
						>
							<Select value={inviteOrg} onValueChange={setInviteOrg}>
								<SelectTrigger>
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
							<Input
								type="email"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								placeholder="user@company.com"
								required
							/>
							<Select value={inviteRole} onValueChange={setInviteRole}>
								<SelectTrigger>
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
							<Button type="submit" variant="secondary" disabled={!inviteOrg}>
								Send Invite
							</Button>
						</form>
					</CardContent>
				</Card>
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
							{organizations.map((org) => (
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
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
