"use client";

import { useBackendStatus } from "@/components/backend-status";
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
import { SkeletonHeader, SkeletonTable } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type ResourceTypeItem,
	createResourceType,
	deleteResourceType,
	listResourceTypes,
} from "@/lib/dashboard-api";
import { Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export default function ResourceTypesPage() {
	const [resourceTypes, setResourceTypes] = useState<ResourceTypeItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newSlug, setNewSlug] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [creating, setCreating] = useState(false);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	const fetchResourceTypes = useCallback(async () => {
		try {
			setIsLoading(true);
			setResourceTypes(await listResourceTypes());
		} catch (err) {
			reportError(err);
		} finally {
			setIsLoading(false);
		}
	}, [activeProjectId]);

	useEffect(() => {
		void fetchResourceTypes();
	}, [fetchResourceTypes]);

	function handleNameChange(value: string) {
		setNewName(value);
		setNewSlug(slugify(value));
	}

	async function handleCreate() {
		if (!newName.trim() || !newSlug.trim()) return;
		try {
			setCreating(true);
			await createResourceType({
				name: newName.trim(),
				slug: newSlug.trim(),
				description: newDescription.trim(),
			});
			toast.success("Resource type created");
			setNewName("");
			setNewSlug("");
			setNewDescription("");
			setDialogOpen(false);
			await fetchResourceTypes();
		} catch {
			toast.error("Failed to create resource type");
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteResourceType(id);
			toast.success("Resource type deleted");
			await fetchResourceTypes();
		} catch {
			toast.error("Failed to delete resource type");
		}
	}

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader withButton />
				<SkeletonTable cols={4} rows={5} />
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Resource Types</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Define resource types for fine-grained authorization.
				</p>
			</div>

			{/* Create Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create resource type</DialogTitle>
						<DialogDescription>
							Define a new resource type for fine-grained authorization rules in your application.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="rt-name">Name</Label>
							<Input
								id="rt-name"
								placeholder="e.g. Document"
								value={newName}
								onChange={(e) => handleNameChange(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="rt-slug">Slug</Label>
							<Input
								id="rt-slug"
								placeholder="auto-generated-slug"
								value={newSlug}
								onChange={(e) => setNewSlug(e.target.value)}
								className="font-mono text-xs"
							/>
							<p className="text-xs text-muted-foreground">
								Auto-generated from the name. You can customize it.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="rt-description">Description</Label>
							<Input
								id="rt-description"
								placeholder="Describe this resource type..."
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
							/>
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
							{creating ? "Creating..." : "Create resource type"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{resourceTypes.length === 0 ? (
				/* Empty state */
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
							<Layers className="size-6 text-muted-foreground" />
						</div>
						<h3 className="text-sm font-medium">No resource types have been defined</h3>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							Resource types allow you to define fine-grained authorization rules for specific
							resources in your application.
						</p>
						<Button size="sm" className="mt-6" onClick={() => setDialogOpen(true)}>
							<Plus className="size-4" />
							Create resource type
						</Button>
					</CardContent>
				</Card>
			) : (
				/* Table */
				<>
					<div className="flex items-center justify-end">
						<Button size="sm" onClick={() => setDialogOpen(true)}>
							<Plus className="size-4" />
							Create resource type
						</Button>
					</div>
					<Card className="gap-0 overflow-hidden py-0">
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="w-10" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{resourceTypes.map((rt) => (
										<TableRow key={rt.id}>
											<TableCell>
												<span className="font-medium">{rt.name}</span>
											</TableCell>
											<TableCell>
												<Badge variant="secondary" className="font-mono text-xs">
													{rt.slug}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{rt.description || "—"}
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="icon-xs" onClick={() => handleDelete(rt.id)}>
													<Trash2 className="size-4 text-destructive" />
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
		</div>
	);
}
