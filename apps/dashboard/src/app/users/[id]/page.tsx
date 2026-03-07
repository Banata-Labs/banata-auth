"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	type SessionInfo,
	type UserAccount,
	banUser,
	getUser,
	listOrganizationMembers,
	listOrganizations,
	listUserAccounts,
	listUserSessions,
	revokeUserSession,
	unbanUser,
} from "@/lib/dashboard-api";
import { formatDate } from "@/lib/utils";
import type { User } from "@banata-auth/shared";
import type { Organization } from "@banata-auth/shared";
import { ArrowLeft, Calendar, ChevronRight, Clock, Fingerprint, Mail, Shield } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TabValue = "profile" | "sessions" | "auth-methods" | "organizations";

interface UserOrgMembership {
	organization: Organization;
	role: string;
	joinedAt: Date;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function formatProviderName(providerId: string): string {
	const names: Record<string, string> = {
		credential: "Email + Password",
		google: "Google",
		github: "GitHub",
		apple: "Apple",
		microsoft: "Microsoft",
		facebook: "Facebook",
		twitter: "Twitter / X",
		discord: "Discord",
		slack: "Slack",
		linkedin: "LinkedIn",
		gitlab: "GitLab",
		bitbucket: "Bitbucket",
		passkey: "Passkey",
		"magic-link": "Magic Link",
		"email-otp": "Email OTP",
	};
	return names[providerId] ?? providerId.charAt(0).toUpperCase() + providerId.slice(1);
}

export default function UserDetailPage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;
	const activeProjectId = useActiveProjectId();
	const initialProjectRef = useRef(activeProjectId);

	// Redirect back to users list when the project changes —
	// the user entity from the old project won't exist in the new one
	useEffect(() => {
		if (initialProjectRef.current !== null && activeProjectId !== initialProjectRef.current) {
			router.push("/users");
		}
	}, [activeProjectId, router]);

	const [user, setUser] = useState<User | null>(null);
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [userOrgMemberships, setUserOrgMemberships] = useState<UserOrgMembership[]>([]);
	const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabValue>("profile");

	async function fetchUser() {
		try {
			setIsLoading(true);
			setError(null);
			const found = await getUser(userId);
			if (!found) {
				setError("User not found.");
			}
			setUser(found);
		} catch {
			setError("Unable to load user details.");
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchSessions() {
		try {
			const data = await listUserSessions(userId);
			setSessions(data);
		} catch {
			// Sessions may not be available — graceful degradation
			setSessions([]);
		}
	}

	async function fetchUserOrgs() {
		try {
			const allOrgs = await listOrganizations();
			// Fetch members for each org in parallel, then filter to orgs where this user is a member
			const memberResults = await Promise.all(
				allOrgs.map(async (org) => {
					try {
						const members = await listOrganizationMembers(org.id);
						const userMember = members.find((m) => m.userId === userId);
						if (userMember) {
							return {
								organization: org,
								role: userMember.role,
								joinedAt: userMember.createdAt,
							} as UserOrgMembership;
						}
						return null;
					} catch {
						return null;
					}
				}),
			);
			setUserOrgMemberships(memberResults.filter((m): m is UserOrgMembership => m !== null));
		} catch {
			setUserOrgMemberships([]);
		}
	}

	async function fetchUserAccounts() {
		try {
			const accounts = await listUserAccounts(userId);
			setUserAccounts(accounts);
		} catch {
			setUserAccounts([]);
		}
	}

	useEffect(() => {
		void fetchUser();
		void fetchSessions();
		void fetchUserOrgs();
		void fetchUserAccounts();
	}, [userId]);

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<p className="text-sm text-muted-foreground">Loading user...</p>
			</div>
		);
	}

	if (error || !user) {
		return (
			<div className="grid gap-6">
				<Button
					variant="ghost"
					size="sm"
					className="w-fit gap-2"
					onClick={() => router.push("/users")}
				>
					<ArrowLeft className="size-4" />
					Back to Users
				</Button>
				<p className="text-sm text-destructive">{error ?? "User not found."}</p>
			</div>
		);
	}

	const tabs: { value: TabValue; label: string }[] = [
		{ value: "profile", label: "Profile" },
		{ value: "sessions", label: "Sessions" },
		{ value: "auth-methods", label: "Authentication Methods" },
		{ value: "organizations", label: "Organizations" },
	];

	// Build the list of auth methods to display.
	// If the API returned account data, use it.
	// Otherwise, fall back to showing "Email + Password" since the user must
	// have at least one auth method to exist.
	const displayAccounts: { providerId: string; accountId: string; createdAt: Date }[] =
		userAccounts.length > 0
			? userAccounts.map((a) => ({
					providerId: a.providerId,
					accountId: a.accountId,
					createdAt: a.createdAt,
				}))
			: [
					{
						providerId: "credential",
						accountId: user.email,
						createdAt: user.createdAt,
					},
				];

	return (
		<div className="grid gap-6">
			{/* Breadcrumb */}
			<div className="flex items-center gap-1.5 text-sm">
				<button
					type="button"
					onClick={() => router.push("/users")}
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					Users
				</button>
				<ChevronRight className="size-3.5 text-muted-foreground/50" />
				<span className="font-medium text-foreground">{user.name || user.email}</span>
			</div>

			{/* User header */}
			<div className="flex items-start gap-4">
				<Avatar size="lg">
					{user.image && <AvatarImage src={user.image} alt={user.name} />}
					<AvatarFallback>
						{user.name ? getInitials(user.name) : user.email[0]?.toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold tracking-tight">{user.name || "Unnamed User"}</h1>
						<Badge variant={user.banned ? "destructive" : "default"}>
							{user.banned ? "Banned" : "Active"}
						</Badge>
						<Badge variant="secondary">{user.role}</Badge>
					</div>
					<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Mail className="size-3.5" />
							{user.email}
						</span>
						<span className="flex items-center gap-1.5 font-mono text-xs">
							<Fingerprint className="size-3.5" />
							{user.id}
						</span>
						<span className="flex items-center gap-1.5">
							<Calendar className="size-3.5" />
							Created {formatDate(user.createdAt)}
						</span>
					</div>
				</div>
				<div className="flex shrink-0 gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={async () => {
							if (user.banned) {
								await unbanUser(user.id);
							} else {
								await banUser(user.id);
							}
							await fetchUser();
						}}
					>
						{user.banned ? "Unban User" : "Ban User"}
					</Button>
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
						className={`relative px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === tab.value
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab.label}
						{activeTab === tab.value && (
							<span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
						)}
					</button>
				))}
			</div>

			{/* Tab content */}
			{activeTab === "profile" && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">User Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							{[
								{ label: "Name", value: user.name || "\u2014" },
								{ label: "Email", value: user.email },
								{ label: "Username", value: user.username || "\u2014" },
								{ label: "Phone", value: user.phoneNumber || "\u2014" },
								{ label: "Role", value: user.role },
								{
									label: "Status",
									value: user.banned ? "Banned" : "Active",
								},
								{
									label: "Email Verified",
									value: user.emailVerified ? "Yes" : "No",
								},
								{
									label: "2FA Enabled",
									value: user.twoFactorEnabled ? "Yes" : "No",
								},
								{
									label: "Created",
									value: formatDate(user.createdAt),
								},
								{
									label: "Updated",
									value: formatDate(user.updatedAt),
								},
							].map((field) => (
								<div
									key={field.label}
									className="grid grid-cols-3 gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
								>
									<span className="text-sm text-muted-foreground">{field.label}</span>
									<span className="col-span-2 text-sm font-medium">{field.value}</span>
								</div>
							))}
							{user.metadata && (
								<div className="grid grid-cols-3 gap-4">
									<span className="text-sm text-muted-foreground">Metadata</span>
									<pre className="col-span-2 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
										{JSON.stringify(user.metadata, null, 2)}
									</pre>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{activeTab === "sessions" && (
				<Card className="gap-0 overflow-hidden py-0">
					<CardContent className="px-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Session ID</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead>User Agent</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead className="text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessions.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
											<div className="flex flex-col items-center gap-2">
												<Clock className="size-5 text-muted-foreground/50" />
												<p>No active sessions found for this user.</p>
												<p className="text-xs">Sessions will appear here when the user signs in.</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									sessions.map((session) => (
										<TableRow key={session.id}>
											<TableCell className="font-mono text-xs">
												{session.id.slice(0, 12)}...
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{session.ipAddress ?? "\u2014"}
											</TableCell>
											<TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
												{session.userAgent ?? "\u2014"}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{formatDate(session.createdAt)}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{formatDate(session.expiresAt)}
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="outline"
													size="sm"
													onClick={async () => {
														await revokeUserSession(session.id);
														await fetchSessions();
													}}
												>
													Revoke
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{activeTab === "auth-methods" && (
				<Card className="gap-0 overflow-hidden py-0">
					<CardContent className="px-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Provider</TableHead>
									<TableHead>Account ID</TableHead>
									<TableHead>Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{displayAccounts.map((account) => (
									<TableRow key={`${account.providerId}-${account.accountId}`}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Shield className="size-4 text-muted-foreground" />
												<span className="font-medium">
													{formatProviderName(account.providerId)}
												</span>
											</div>
										</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{account.accountId}
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{formatDate(account.createdAt)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{activeTab === "organizations" && (
				<Card className="gap-0 overflow-hidden py-0">
					<CardContent className="px-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Organization</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Joined</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{userOrgMemberships.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
											<div className="flex flex-col items-center gap-2">
												<p>This user is not a member of any organization.</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									userOrgMemberships.map((membership) => (
										<TableRow
											key={membership.organization.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => router.push(`/organizations/${membership.organization.id}`)}
										>
											<TableCell>
												<div className="flex items-center gap-2">
													<span className="font-medium">{membership.organization.name}</span>
													<span className="text-xs text-muted-foreground">
														{membership.organization.slug}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="secondary">{membership.role}</Badge>
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{formatDate(membership.joinedAt)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
