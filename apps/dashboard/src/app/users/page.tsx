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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { banUser, createUser, getCachedUsers, listUsers, unbanUser } from "@/lib/dashboard-api";
import { formatDate } from "@/lib/utils";
import type { User } from "@banata-auth/shared";
import { Eye, EyeOff, Filter, Mail, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function generatePassword(length = 16): string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
	const arr = new Uint8Array(length);
	crypto.getRandomValues(arr);
	return Array.from(arr, (byte) => chars[byte % chars.length]).join("");
}

type TabValue = "users" | "invitations";

export default function UsersPage() {
	const router = useRouter();
	const activeProjectId = useActiveProjectId();
	const [users, setUsers] = useState<User[]>(() => getCachedUsers() ?? []);
	const [isLoading, setIsLoading] = useState(() => getCachedUsers() === null);
	const [query, setQuery] = useState("");
	const [activeTab, setActiveTab] = useState<TabValue>("users");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

	// Create user dialog state
	const [createOpen, setCreateOpen] = useState(false);
	const [createEmail, setCreateEmail] = useState("");
	const [createPassword, setCreatePassword] = useState("");
	const [createExternalId, setCreateExternalId] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [creating, setCreating] = useState(false);

	const refreshUsers = useCallback(async () => {
		try {
			const cachedUsers = getCachedUsers();
			if (cachedUsers) {
				setUsers(cachedUsers);
				setIsLoading(false);
			} else {
				setIsLoading(true);
			}
			setUsers(await listUsers());
		} catch {
			toast.error("Unable to load users");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!activeProjectId) {
			return;
		}
		void refreshUsers();
	}, [activeProjectId, refreshUsers]);

	const filtered = users
		.filter((u) => {
			if (statusFilter === "active" && u.banned) return false;
			if (statusFilter === "banned" && !u.banned) return false;
			return true;
		})
		.filter(
			(u) =>
				u.email.toLowerCase().includes(query.toLowerCase()) ||
				u.name.toLowerCase().includes(query.toLowerCase()),
		);

	async function handleCreateUser(e: React.FormEvent) {
		e.preventDefault();
		try {
			setCreating(true);
			await createUser({
				email: createEmail,
				password: createPassword,
				name: createExternalId || undefined,
			});
			setCreateOpen(false);
			setCreateEmail("");
			setCreatePassword("");
			setCreateExternalId("");
			await refreshUsers();
			toast.success("User created");
		} catch {
			toast.error("Unable to create user");
		} finally {
			setCreating(false);
		}
	}

	return (
		<div className="grid gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Users</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage users from Better Auth admin endpoints.
					</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Plus className="size-4" />
							Create user
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create user</DialogTitle>
							<DialogDescription>
								Add a new user to your application. They will receive a welcome email.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreateUser} className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="create-email">Email address</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="create-email"
										type="email"
										placeholder="user@example.com"
										value={createEmail}
										onChange={(e) => setCreateEmail(e.target.value)}
										className="pl-9"
										required
									/>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="create-password">Password</Label>
								<div className="flex gap-2">
									<div className="relative flex-1">
										<Input
											id="create-password"
											type={showPassword ? "text" : "password"}
											placeholder="Enter a password"
											value={createPassword}
											onChange={(e) => setCreatePassword(e.target.value)}
											className="pr-10 font-mono text-xs"
											required
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
										</button>
									</div>
									<Button
										type="button"
										variant="outline"
										size="default"
										className="shrink-0 gap-1.5"
										onClick={() => setCreatePassword(generatePassword())}
									>
										<RefreshCw className="size-3.5" />
										Generate
									</Button>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="create-external-id">
									External ID <span className="text-muted-foreground">(optional)</span>
								</Label>
								<Input
									id="create-external-id"
									type="text"
									placeholder="ext_1234"
									value={createExternalId}
									onChange={(e) => setCreateExternalId(e.target.value)}
									className="font-mono text-xs"
								/>
							</div>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={creating}>
									{creating ? "Creating..." : "Create user"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-1 border-b border-border">
				<button
					type="button"
					onClick={() => setActiveTab("users")}
					className={`relative px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "users"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Users
					{activeTab === "users" && (
						<span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("invitations")}
					className={`relative px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "invitations"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Invitations
					{activeTab === "invitations" && (
						<span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
					)}
				</button>
			</div>

			{activeTab === "users" && (
				<>
					{/* Search & filters */}
					<div className="flex items-center gap-3">
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by email or name..."
							className="max-w-sm"
						/>
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={() =>
								setStatusFilter((prev) =>
									prev === "all" ? "active" : prev === "active" ? "banned" : "all",
								)
							}
						>
							<Filter className="size-3.5" />
							{statusFilter === "all"
								? "+ Status"
								: statusFilter === "active"
									? "Active"
									: "Banned"}
						</Button>
						{statusFilter !== "all" && (
							<Button variant="ghost" size="xs" onClick={() => setStatusFilter("all")}>
								Clear
							</Button>
						)}
					</div>

					{isLoading ? <p className="text-sm text-muted-foreground">Loading users...</p> : null}

					<Card className="gap-0 overflow-hidden py-0">
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Email</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filtered.length === 0 && !isLoading ? (
										<TableRow>
											<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
												No users found.
											</TableCell>
										</TableRow>
									) : null}
									{filtered.map((user) => (
										<TableRow
											key={user.id}
											className="cursor-pointer"
											onClick={() => router.push(`/users/${user.id}`)}
										>
											<TableCell className="font-mono text-xs">{user.email}</TableCell>
											<TableCell>{user.name}</TableCell>
											<TableCell>
												<Badge variant="secondary">{user.role}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={user.banned ? "destructive" : "default"}>
													{user.banned ? "Banned" : "Active"}
												</Badge>
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{formatDate(user.createdAt)}
											</TableCell>
											<TableCell className="text-right">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={async (e) => {
														e.stopPropagation();
														try {
															if (user.banned) {
																await unbanUser(user.id);
																toast.success("User unbanned");
															} else {
																await banUser(user.id);
																toast.success("User banned");
															}
															await refreshUsers();
														} catch {
															toast.error("Failed to update user");
														}
													}}
												>
													{user.banned ? "Unban" : "Ban"}
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</>
			)}

			{activeTab === "invitations" && (
				<Card className="gap-0 overflow-hidden py-0">
					<CardContent className="px-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Organization</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Invited</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
										No pending invitations.
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
