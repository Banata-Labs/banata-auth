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
import {
	type PermissionItem,
	createPermission,
	deletePermission,
	listPermissions,
} from "@/lib/dashboard-api";
import { Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export default function PermissionsPage() {
	const activeProjectId = useActiveProjectId();
	const [permissions, setPermissions] = useState<PermissionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [query, setQuery] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newSlug, setNewSlug] = useState("");
	const [creating, setCreating] = useState(false);

	// Edit permission dialog state
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingPerm, setEditingPerm] = useState<PermissionItem | null>(null);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editSlug, setEditSlug] = useState("");
	const [saving, setSaving] = useState(false);

	async function fetchPermissions() {
		try {
			setIsLoading(true);
			setPermissions(await listPermissions());
		} catch {
			// graceful degradation
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		void fetchPermissions();
	}, [activeProjectId]);

	const filtered = permissions.filter(
		(p) =>
			p.name.toLowerCase().includes(query.toLowerCase()) ||
			p.slug.toLowerCase().includes(query.toLowerCase()),
	);

	function handleNameChange(value: string) {
		setNewName(value);
		setNewSlug(slugify(value));
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
			await fetchPermissions();
		} catch {
			// handle error
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await deletePermission(id);
			await fetchPermissions();
		} catch {
			// handle error
		}
	}

	function openEditDialog(perm: PermissionItem) {
		setEditingPerm(perm);
		setEditName(perm.name);
		setEditDescription(perm.description);
		setEditSlug(perm.slug);
		setEditDialogOpen(true);
	}

	async function handleEditSave() {
		if (!editingPerm || !editName.trim() || !editSlug.trim()) return;
		try {
			setSaving(true);
			// Update via delete + recreate
			await deletePermission(editingPerm.id);
			await createPermission({
				name: editName.trim(),
				slug: editSlug.trim(),
				description: editDescription.trim(),
			});
			setEditDialogOpen(false);
			setEditingPerm(null);
			await fetchPermissions();
		} catch {
			// If recreate fails, refetch to show current state
			await fetchPermissions();
		} finally {
			setSaving(false);
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
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Define and manage permissions that can gate features within your applications.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-sm flex-1">
					<Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search permissions..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
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
								Create a new permission to gate features within your applications.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-2">
							<div className="grid gap-2">
								<Label htmlFor="perm-name">Name</Label>
								<Input
									id="perm-name"
									placeholder="e.g. Edit posts"
									value={newName}
									onChange={(e) => handleNameChange(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="perm-description">Description</Label>
								<Input
									id="perm-description"
									placeholder="Describe this permission..."
									value={newDescription}
									onChange={(e) => setNewDescription(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="perm-slug">Slug</Label>
								<Input
									id="perm-slug"
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
								{creating ? "Creating..." : "Create permission"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Edit Permission Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit permission</DialogTitle>
						<DialogDescription>
							Update the permission details. The permission will be recreated with the new values.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="edit-perm-name">Name</Label>
							<Input
								id="edit-perm-name"
								value={editName}
								onChange={(e) => {
									setEditName(e.target.value);
									setEditSlug(slugify(e.target.value));
								}}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-perm-description">Description</Label>
							<Input
								id="edit-perm-description"
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-perm-slug">Slug</Label>
							<Input
								id="edit-perm-slug"
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

			{/* Table */}
			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead className="w-10" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="text-center text-muted-foreground">
										No permissions found.
									</TableCell>
								</TableRow>
							) : (
								filtered.map((perm) => (
									<TableRow key={perm.id}>
										<TableCell>
											<div>
												<span className="font-medium">{perm.name}</span>
												<p className="text-xs text-muted-foreground">{perm.description}</p>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className="font-mono text-xs">
												{perm.slug}
											</Badge>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon-xs">
														<MoreHorizontal className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onSelect={() => openEditDialog(perm)}>
														Edit
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onSelect={() => handleDelete(perm.id)}
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
