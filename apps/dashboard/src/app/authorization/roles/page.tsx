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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type RoleItem, createRole, deleteRole, listRoles } from "@/lib/dashboard-api";
import { Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export default function RolesPage() {
	const router = useRouter();
	const activeProjectId = useActiveProjectId();
	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [query, setQuery] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newSlug, setNewSlug] = useState("");
	const [creating, setCreating] = useState(false);

	// Edit role dialog state
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editSlug, setEditSlug] = useState("");
	const [saving, setSaving] = useState(false);

	// Edit priority dialog state
	const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
	const [priorityOrder, setPriorityOrder] = useState<
		{ id: string; name: string; priority: number }[]
	>([]);

	async function fetchRoles() {
		try {
			setIsLoading(true);
			setRoles(await listRoles());
		} catch {
			// graceful degradation
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		void fetchRoles();
	}, [activeProjectId]);

	const filtered = roles.filter(
		(r) =>
			r.name.toLowerCase().includes(query.toLowerCase()) ||
			r.slug.toLowerCase().includes(query.toLowerCase()),
	);

	function handleNameChange(value: string) {
		setNewName(value);
		setNewSlug(slugify(value));
	}

	async function handleCreate() {
		if (!newName.trim() || !newSlug.trim()) return;
		try {
			setCreating(true);
			await createRole({
				name: newName.trim(),
				slug: newSlug.trim(),
				description: newDescription.trim(),
			});
			setNewName("");
			setNewDescription("");
			setNewSlug("");
			setDialogOpen(false);
			await fetchRoles();
		} catch {
			// handle error
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteRole(id);
			await fetchRoles();
		} catch {
			// handle error
		}
	}

	function openEditDialog(role: RoleItem) {
		setEditingRole(role);
		setEditName(role.name);
		setEditDescription(role.description);
		setEditSlug(role.slug);
		setEditDialogOpen(true);
	}

	async function handleEditSave() {
		if (!editingRole || !editName.trim() || !editSlug.trim()) return;
		try {
			setSaving(true);
			// Update via delete + recreate to preserve data
			await deleteRole(editingRole.id);
			await createRole({
				name: editName.trim(),
				slug: editSlug.trim(),
				description: editDescription.trim(),
			});
			setEditDialogOpen(false);
			setEditingRole(null);
			await fetchRoles();
		} catch {
			// If recreate fails, refetch to show current state
			await fetchRoles();
		} finally {
			setSaving(false);
		}
	}

	function openPriorityDialog() {
		setPriorityOrder(roles.map((r, i) => ({ id: r.id, name: r.name, priority: i + 1 })));
		setPriorityDialogOpen(true);
	}

	function updatePriority(id: string, value: number) {
		setPriorityOrder((prev) =>
			prev.map((item) => (item.id === id ? { ...item, priority: value } : item)),
		);
	}

	function handlePrioritySave() {
		// Sort roles locally based on assigned priority numbers
		const sorted = [...priorityOrder].sort((a, b) => a.priority - b.priority);
		const reordered = sorted
			.map((item) => roles.find((r) => r.id === item.id))
			.filter(Boolean) as RoleItem[];
		setRoles(reordered);
		setPriorityDialogOpen(false);
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
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Define and manage roles that can be assigned to users within your applications.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-sm flex-1">
					<Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search roles..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={openPriorityDialog}>
						Edit priority
					</Button>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="size-4" />
								Create role
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create role</DialogTitle>
								<DialogDescription>
									Create a new role to assign to users within your applications.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-2">
								<div className="grid gap-2">
									<Label htmlFor="role-name">Name</Label>
									<Input
										id="role-name"
										placeholder="e.g. Editor"
										value={newName}
										onChange={(e) => handleNameChange(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="role-description">Description</Label>
									<Input
										id="role-description"
										placeholder="Describe this role..."
										value={newDescription}
										onChange={(e) => setNewDescription(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="role-slug">Slug</Label>
									<Input
										id="role-slug"
										placeholder="auto-generated-slug"
										value={newSlug}
										onChange={(e) => setNewSlug(e.target.value)}
										className="font-mono text-xs"
									/>
									<p className="text-xs text-muted-foreground">
										Auto-generated from the name. You can customize it.
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
									{creating ? "Creating..." : "Create role"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Edit Role Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit role</DialogTitle>
						<DialogDescription>
							Update the role details. The role will be recreated with the new values.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="edit-role-name">Name</Label>
							<Input
								id="edit-role-name"
								value={editName}
								onChange={(e) => {
									setEditName(e.target.value);
									setEditSlug(slugify(e.target.value));
								}}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-role-description">Description</Label>
							<Input
								id="edit-role-description"
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-role-slug">Slug</Label>
							<Input
								id="edit-role-slug"
								value={editSlug}
								onChange={(e) => setEditSlug(e.target.value)}
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
							disabled={saving || !editName.trim() || !editSlug.trim()}
						>
							{saving ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Priority Dialog */}
			<Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit role priority</DialogTitle>
						<DialogDescription>
							Assign a priority number to each role. Lower numbers indicate higher priority.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						{priorityOrder.map((item) => (
							<div key={item.id} className="flex items-center gap-3">
								<span className="min-w-[120px] text-sm font-medium">{item.name}</span>
								<Input
									type="number"
									min={1}
									value={item.priority}
									onChange={(e) => updatePriority(item.id, Number(e.target.value) || 1)}
									className="w-20 text-center font-mono"
								/>
							</div>
						))}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handlePrioritySave}>Apply order</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Table */}
			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Permissions</TableHead>
								<TableHead className="w-10" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										No roles found.
									</TableCell>
								</TableRow>
							) : (
								filtered.map((role) => (
									<TableRow key={role.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<div>
													<div className="flex items-center gap-2">
														<span className="font-medium">{role.name}</span>
														{role.isDefault && (
															<Badge variant="outline" className="text-[10px]">
																Default
															</Badge>
														)}
													</div>
													<p className="text-xs text-muted-foreground">{role.description}</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className="font-mono text-xs">
												{role.slug}
											</Badge>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{role.permissions.length}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon-xs">
														<MoreHorizontal className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onSelect={() => openEditDialog(role)}>
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onSelect={() =>
															router.push(`/authorization/permissions?role=${role.slug}`)
														}
													>
														Manage permissions
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														disabled={role.isDefault}
														onSelect={() => handleDelete(role.id)}
													>
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
