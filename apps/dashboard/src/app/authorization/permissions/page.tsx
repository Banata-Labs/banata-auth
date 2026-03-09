"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type PermissionItem,
	type RoleItem,
	createPermission,
	deletePermission,
	listPermissions,
	listRoles,
	updatePermission,
	updateRole,
} from "@/lib/dashboard-api";
import { Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function sortStrings(values: string[]): string[] {
	return [...values].sort((a, b) => a.localeCompare(b));
}

export default function PermissionsPage() {
	const activeProjectId = useActiveProjectId();
	const searchParams = useSearchParams();
	const roleQuery = searchParams.get("role");

	const [permissions, setPermissions] = useState<PermissionItem[]>([]);
	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [query, setQuery] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newSlug, setNewSlug] = useState("");
	const [creating, setCreating] = useState(false);

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingPerm, setEditingPerm] = useState<PermissionItem | null>(null);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editSlug, setEditSlug] = useState("");
	const [savingPermission, setSavingPermission] = useState(false);

	const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>("");
	const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
	const [savingAssignments, setSavingAssignments] = useState(false);

	const loadData = useCallback(async () => {
		if (!activeProjectId) {
			setPermissions([]);
			setRoles([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const [permissionItems, roleItems] = await Promise.all([listPermissions(), listRoles()]);
			setPermissions(permissionItems);
			setRoles(roleItems);
		} catch {
			// graceful degradation
		} finally {
			setIsLoading(false);
		}
	}, [activeProjectId]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	useEffect(() => {
		if (roleQuery && roles.some((role) => role.slug === roleQuery)) {
			setSelectedRoleSlug(roleQuery);
			return;
		}
		setSelectedRoleSlug((current) => {
			if (current && roles.some((role) => role.slug === current)) {
				return current;
			}
			return "";
		});
	}, [roleQuery, roles]);

	const selectedRole = useMemo(
		() => roles.find((role) => role.slug === selectedRoleSlug) ?? null,
		[roles, selectedRoleSlug],
	);

	useEffect(() => {
		setAssignedPermissions(sortStrings(selectedRole?.permissions ?? []));
	}, [selectedRole]);

	const filtered = permissions.filter(
		(permission) =>
			permission.name.toLowerCase().includes(query.toLowerCase()) ||
			permission.slug.toLowerCase().includes(query.toLowerCase()),
	);

	const hasAssignmentChanges =
		selectedRole !== null &&
		JSON.stringify(sortStrings(selectedRole.permissions)) !==
			JSON.stringify(sortStrings(assignedPermissions));

	function handleNameChange(value: string) {
		setNewName(value);
		setNewSlug(slugify(value));
	}

	function openEditDialog(permission: PermissionItem) {
		setEditingPerm(permission);
		setEditName(permission.name);
		setEditDescription(permission.description);
		setEditSlug(permission.slug);
		setEditDialogOpen(true);
	}

	function toggleAssignedPermission(permissionSlug: string, enabled: boolean) {
		setAssignedPermissions((current) => {
			if (enabled) {
				return sortStrings([...current, permissionSlug]);
			}
			return current.filter((permission) => permission !== permissionSlug);
		});
	}

	async function handleCreate() {
		if (!newName.trim() || !newSlug.trim()) return;
		try {
			setCreating(true);
			await createPermission({
				name: newName.trim(),
				slug: newSlug.trim(),
				description: newDescription.trim(),
			});
			setNewName("");
			setNewDescription("");
			setNewSlug("");
			setDialogOpen(false);
			await loadData();
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await deletePermission(id);
			await loadData();
		} catch {
			// graceful degradation
		}
	}

	async function handleEditSave() {
		if (!editingPerm || !editName.trim() || !editSlug.trim()) return;
		try {
			setSavingPermission(true);
			await updatePermission({
				id: editingPerm.id,
				name: editName.trim(),
				slug: editSlug.trim(),
				description: editDescription.trim(),
			});
			setEditDialogOpen(false);
			setEditingPerm(null);
			await loadData();
		} catch {
			await loadData();
		} finally {
			setSavingPermission(false);
		}
	}

	async function handleAssignmentSave() {
		if (!selectedRole) return;
		try {
			setSavingAssignments(true);
			await updateRole({
				id: selectedRole.id,
				permissions: assignedPermissions,
			});
			await loadData();
		} finally {
			setSavingAssignments(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Define your permission catalog, then assign permission slugs directly to each custom role.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Role Assignment</CardTitle>
					<CardDescription>
						Choose a role to control which permission slugs it grants. Default system roles stay
						read-only.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="grid gap-2 md:max-w-sm">
						<Label htmlFor="role-selector">Role</Label>
						<Select value={selectedRoleSlug || undefined} onValueChange={setSelectedRoleSlug}>
							<SelectTrigger id="role-selector">
								<SelectValue placeholder="Choose a role to manage" />
							</SelectTrigger>
							<SelectContent>
								{roles.map((role) => (
									<SelectItem key={role.id} value={role.slug}>
										{role.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{selectedRole ? (
						<div className="grid gap-3 rounded-lg border border-border p-4">
							<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
								<div>
									<div className="flex items-center gap-2">
										<span className="font-medium">{selectedRole.name}</span>
										<Badge variant="secondary" className="font-mono text-xs">
											{selectedRole.slug}
										</Badge>
										{selectedRole.isDefault ? (
											<Badge variant="outline" className="text-[10px]">
												Default
											</Badge>
										) : null}
									</div>
									<p className="text-sm text-muted-foreground">
										{selectedRole.description || "No role description provided."}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										onClick={() => setAssignedPermissions(sortStrings(selectedRole.permissions))}
										disabled={!hasAssignmentChanges || savingAssignments}
									>
										Reset
									</Button>
									<Button
										onClick={handleAssignmentSave}
										disabled={!hasAssignmentChanges || savingAssignments || selectedRole.isDefault}
									>
										{savingAssignments ? "Saving..." : "Save role permissions"}
									</Button>
								</div>
							</div>
							{selectedRole.isDefault ? (
								<p className="text-xs text-muted-foreground">
									System roles are managed by Banata. You can inspect their permission set here, but
									you cannot change it from the dashboard.
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									Toggle each permission below, then save to update the selected role.
								</p>
							)}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							Select a role to manage its permission assignments.
						</p>
					)}
				</CardContent>
			</Card>

			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-sm flex-1">
					<Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search permissions..."
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						className="pl-9"
					/>
				</div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="size-4" />
							Create permission
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create permission</DialogTitle>
							<DialogDescription>
								Create a permission slug that can be assigned to one or more custom roles.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-2">
							<div className="grid gap-2">
								<Label htmlFor="perm-name">Name</Label>
								<Input
									id="perm-name"
									placeholder="e.g. Approve leave requests"
									value={newName}
									onChange={(event) => handleNameChange(event.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="perm-description">Description</Label>
								<Input
									id="perm-description"
									placeholder="Describe what this permission unlocks..."
									value={newDescription}
									onChange={(event) => setNewDescription(event.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="perm-slug">Slug</Label>
								<Input
									id="perm-slug"
									placeholder="leave.approve"
									value={newSlug}
									onChange={(event) => setNewSlug(event.target.value)}
									className="font-mono text-xs"
								/>
								<p className="text-xs text-muted-foreground">
									Use the same `resource.action` slug you will check from your app.
								</p>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleCreate}
								disabled={creating || !newName.trim() || !newSlug.trim()}
							>
								{creating ? "Creating..." : "Create permission"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit permission</DialogTitle>
						<DialogDescription>
							Update the permission catalog entry and keep existing role assignments in sync.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="edit-perm-name">Name</Label>
							<Input
								id="edit-perm-name"
								value={editName}
								onChange={(event) => {
									setEditName(event.target.value);
									setEditSlug(slugify(event.target.value));
								}}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-perm-description">Description</Label>
							<Input
								id="edit-perm-description"
								value={editDescription}
								onChange={(event) => setEditDescription(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-perm-slug">Slug</Label>
							<Input
								id="edit-perm-slug"
								value={editSlug}
								onChange={(event) => setEditSlug(event.target.value)}
								className="font-mono text-xs"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleEditSave}
							disabled={savingPermission || !editName.trim() || !editSlug.trim()}
						>
							{savingPermission ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>{selectedRole ? "Assigned" : "Status"}</TableHead>
								<TableHead className="w-10" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										No permissions found.
									</TableCell>
								</TableRow>
							) : (
								filtered.map((permission) => {
									const assigned = assignedPermissions.includes(permission.slug);
									return (
										<TableRow key={permission.id}>
											<TableCell>
												<div>
													<span className="font-medium">{permission.name}</span>
													<p className="text-xs text-muted-foreground">{permission.description}</p>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="secondary" className="font-mono text-xs">
													{permission.slug}
												</Badge>
												{permission.isBuiltIn ? (
													<Badge variant="outline" className="ml-2 text-[10px]">
														Built-in
													</Badge>
												) : null}
											</TableCell>
											<TableCell>
												{selectedRole ? (
													<div className="flex items-center gap-3">
														<Switch
															checked={assigned}
															disabled={selectedRole.isDefault || savingAssignments}
															onCheckedChange={(enabled) =>
																toggleAssignedPermission(permission.slug, enabled)
															}
														/>
														<span className="text-sm text-muted-foreground">
															{assigned ? "Assigned" : "Not assigned"}
														</span>
													</div>
												) : (
													<span className="text-sm text-muted-foreground">Catalog entry</span>
												)}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon-xs">
															<MoreHorizontal className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															disabled={permission.isBuiltIn}
															onSelect={() => openEditDialog(permission)}
														>
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant="destructive"
															disabled={permission.isBuiltIn}
															onSelect={() => handleDelete(permission.id)}
														>
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
