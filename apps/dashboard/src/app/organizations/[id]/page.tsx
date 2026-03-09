"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type OrgMember,
	type RoleItem,
	inviteOrganizationMember,
	listConnections,
	listDirectories,
	listOrganizationMembers,
	listOrganizations,
	listRoles,
	removeOrganizationMember,
} from "@/lib/dashboard-api";
import { formatDate } from "@/lib/utils";
import type { Directory, Organization, SsoConnection } from "@banata-auth/shared";
import {
	ArrowLeft,
	Building2,
	Calendar,
	ChevronRight,
	Fingerprint,
	FolderSync,
	Globe,
	KeyRound,
	Plus,
	Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type TabValue = "members" | "sso" | "domains" | "directory-sync";

export default function OrganizationDetailPage() {
	const params = useParams();
	const router = useRouter();
	const orgId = params.id as string;
	const activeProjectId = useActiveProjectId();
	const initialProjectRef = useRef(activeProjectId);

	// Redirect back to organizations list when the project changes —
	// the org entity from the old project won't exist in the new one
	useEffect(() => {
		if (initialProjectRef.current !== null && activeProjectId !== initialProjectRef.current) {
			router.push("/organizations");
		}
	}, [activeProjectId, router]);

	const [org, setOrg] = useState<Organization | null>(null);
	const [connections, setConnections] = useState<SsoConnection[]>([]);
	const [directories, setDirectories] = useState<Directory[]>([]);
	const [members, setMembers] = useState<OrgMember[]>([]);
	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabValue>("members");

	// Invite member dialog state
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("super_admin");
	const [inviting, setInviting] = useState(false);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const [orgs, conns, dirs, mems, availableRoles] = await Promise.all([
				listOrganizations(),
				listConnections(),
				listDirectories(),
				listOrganizationMembers(orgId).catch(() => [] as OrgMember[]),
				listRoles().catch(() => [] as RoleItem[]),
			]);
			const found = orgs.find((o) => o.id === orgId) ?? null;
			if (!found) {
				setError("Organization not found.");
			}
			setOrg(found);
			setConnections(conns.filter((c) => c.organizationId === orgId));
			setDirectories(dirs.filter((d) => d.organizationId === orgId));
			setMembers(mems);
			setRoles(availableRoles);
			if (availableRoles.length > 0) {
				setInviteRole((current) =>
					availableRoles.some((r) => r.slug === current)
						? current
						: (availableRoles[0]?.slug ?? "super_admin"),
				);
			}
		} catch {
			setError("Unable to load organization details.");
		} finally {
			setIsLoading(false);
		}
	}, [orgId]);

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	async function handleInviteMember(e: React.FormEvent) {
		e.preventDefault();
		try {
			setInviting(true);
			await inviteOrganizationMember({
				organizationId: orgId,
				email: inviteEmail,
				role: inviteRole,
			});
			setInviteOpen(false);
			setInviteEmail("");
			setInviteRole(roles[0]?.slug ?? "super_admin");
			await fetchData();
		} catch {
			setError("Unable to send invitation.");
		} finally {
			setInviting(false);
		}
	}

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<p className="text-sm text-muted-foreground">Loading organization...</p>
			</div>
		);
	}

	if (error || !org) {
		return (
			<div className="grid gap-6">
				<Button
					variant="ghost"
					size="sm"
					className="w-fit gap-2"
					onClick={() => router.push("/organizations")}
				>
					<ArrowLeft className="size-4" />
					Back to Organizations
				</Button>
				<p className="text-sm text-destructive">{error ?? "Organization not found."}</p>
			</div>
		);
	}

	const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
		{ value: "members", label: "Members", icon: Users },
		{ value: "sso", label: "SSO Connections", icon: KeyRound },
		{ value: "domains", label: "Domains", icon: Globe },
		{ value: "directory-sync", label: "Directory Sync", icon: FolderSync },
	];

	return (
		<div className="grid gap-6">
			{/* Breadcrumb */}
			<div className="flex items-center gap-1.5 text-sm">
				<button
					type="button"
					onClick={() => router.push("/organizations")}
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					Organizations
				</button>
				<ChevronRight className="size-3.5 text-muted-foreground/50" />
				<span className="font-medium text-foreground">{org.name}</span>
			</div>

			{/* Org header */}
			<div className="flex items-start gap-4">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Building2 className="size-6" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
						<Badge variant={org.ssoEnforced ? "default" : "secondary"}>
							{org.ssoEnforced ? "SSO Enforced" : "SSO Optional"}
						</Badge>
						{org.requireMfa && <Badge variant="outline">MFA Required</Badge>}
					</div>
					<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5 font-mono text-xs">
							<Fingerprint className="size-3.5" />
							{org.id}
						</span>
						<span className="flex items-center gap-1.5">
							<Globe className="size-3.5" />
							{org.slug}
						</span>
						<span className="flex items-center gap-1.5">
							<Calendar className="size-3.5" />
							Created {formatDate(org.createdAt)}
						</span>
					</div>
					{org.allowedEmailDomains && org.allowedEmailDomains.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1.5">
							{org.allowedEmailDomains.map((domain) => (
								<Badge key={domain} variant="outline" className="font-mono text-xs">
									{domain}
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>

			<Separator />

			{/* Tabs */}
			<div className="flex items-center gap-1 border-b border-border">
				{tabs.map((tab) => (
					<button
						key={tab.value}
						type="button"
						onClick={() => setActiveTab(tab.value)}
						className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === tab.value
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<tab.icon className="size-3.5" />
						{tab.label}
						{activeTab === tab.value && (
							<span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
						)}
					</button>
				))}
			</div>

			{/* Tab content */}
			{activeTab === "members" && (
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Organization members and their roles.</p>
						<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
							<DialogTrigger asChild>
								<Button size="sm" className="gap-2">
									<Plus className="size-4" />
									Invite member
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite member</DialogTitle>
									<DialogDescription>Send an invitation to join {org.name}.</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleInviteMember} className="grid gap-4">
									<div className="grid gap-2">
										<Label htmlFor="invite-email">Email address</Label>
										<Input
											id="invite-email"
											type="email"
											placeholder="user@company.com"
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
											required
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="invite-role">Role</Label>
										<Select value={inviteRole} onValueChange={setInviteRole}>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
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
										<Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
											Cancel
										</Button>
										<Button type="submit" disabled={inviting}>
											{inviting ? "Sending..." : "Send invitation"}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
					<Card className="gap-0 overflow-hidden py-0">
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Email</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{members.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
												<div className="flex flex-col items-center gap-2">
													<Users className="size-5 text-muted-foreground/50" />
													<p>No members found.</p>
													<p className="text-xs">
														Invite members to this organization to see them here.
													</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										members.map((member) => (
											<TableRow key={member.id}>
												<TableCell className="font-mono text-xs">{member.email}</TableCell>
												<TableCell>{member.name || "—"}</TableCell>
												<TableCell>
													<Badge variant="secondary">{member.role}</Badge>
												</TableCell>
												<TableCell className="text-xs text-muted-foreground">
													{formatDate(member.createdAt)}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="outline"
														size="sm"
														onClick={async (e) => {
															e.stopPropagation();
															try {
																await removeOrganizationMember({
																	organizationId: orgId,
																	memberIdOrUserId: member.userId || member.id,
																});
																await fetchData();
															} catch {
																setError("Unable to remove member.");
															}
														}}
													>
														Remove
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			)}

			{activeTab === "sso" && (
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">SSO connections for this organization.</p>
						<Button size="sm" className="gap-2" onClick={() => router.push("/connections")}>
							<Plus className="size-4" />
							Manage connections
						</Button>
					</div>
					<Card className="gap-0 overflow-hidden py-0">
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>State</TableHead>
										<TableHead>Domains</TableHead>
										<TableHead>Created</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{connections.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
												<div className="flex flex-col items-center gap-2">
													<KeyRound className="size-5 text-muted-foreground/50" />
													<p>No SSO connections configured.</p>
													<p className="text-xs">
														Add a SAML or OIDC connection to enable enterprise SSO.
													</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										connections.map((conn) => (
											<TableRow key={conn.id}>
												<TableCell className="font-medium">{conn.name}</TableCell>
												<TableCell>
													<Badge variant="outline">{conn.type.toUpperCase()}</Badge>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															conn.state === "active"
																? "default"
																: conn.state === "inactive"
																	? "destructive"
																	: "secondary"
														}
													>
														{conn.state}
													</Badge>
												</TableCell>
												<TableCell className="font-mono text-xs text-muted-foreground">
													{conn.domains.join(", ") || "—"}
												</TableCell>
												<TableCell className="text-xs text-muted-foreground">
													{formatDate(conn.createdAt)}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			)}

			{activeTab === "domains" && (
				<div className="grid gap-4">
					<p className="text-sm text-muted-foreground">Verified domains for this organization.</p>
					<Card className="gap-0 overflow-hidden py-0">
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Domain</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Verified</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{org.allowedEmailDomains && org.allowedEmailDomains.length > 0 ? (
										org.allowedEmailDomains.map((domain) => (
											<TableRow key={domain}>
												<TableCell className="font-mono text-xs font-medium">{domain}</TableCell>
												<TableCell>
													<Badge variant="default">Allowed</Badge>
												</TableCell>
												<TableCell className="text-xs text-muted-foreground">—</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
												<div className="flex flex-col items-center gap-2">
													<Globe className="size-5 text-muted-foreground/50" />
													<p>No domains configured.</p>
													<p className="text-xs">
														Add allowed email domains to restrict membership.
													</p>
												</div>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			)}

			{activeTab === "directory-sync" && (
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							SCIM directories linked to this organization.
						</p>
						<Button size="sm" className="gap-2" onClick={() => router.push("/directories")}>
							<Plus className="size-4" />
							Manage directories
						</Button>
					</div>
					<Card className="gap-0 overflow-hidden py-0">
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Provider</TableHead>
										<TableHead>State</TableHead>
										<TableHead>Users</TableHead>
										<TableHead>Groups</TableHead>
										<TableHead>Last Sync</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{directories.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
												<div className="flex flex-col items-center gap-2">
													<FolderSync className="size-5 text-muted-foreground/50" />
													<p>No SCIM directories linked.</p>
													<p className="text-xs">
														Connect a directory provider like Okta or Azure AD to sync users.
													</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										directories.map((dir) => (
											<TableRow key={dir.id}>
												<TableCell className="font-medium">{dir.name}</TableCell>
												<TableCell>
													<Badge variant="outline">{dir.provider}</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={dir.state === "linked" ? "default" : "destructive"}>
														{dir.state}
													</Badge>
												</TableCell>
												<TableCell>{dir.userCount}</TableCell>
												<TableCell>{dir.groupCount}</TableCell>
												<TableCell className="text-xs text-muted-foreground">
													{dir.lastSyncAt ? formatDate(dir.lastSyncAt) : "Never"}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
