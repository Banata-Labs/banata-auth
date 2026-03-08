"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useProjectEnvironment } from "./project-environment-provider";

export function ProjectSwitcher({ className }: { className?: string }) {
	const { projects, activeProject, setActiveProjectId, isLoading, error, refresh } =
		useProjectEnvironment();
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [projectSlug, setProjectSlug] = useState("");

	const suggestedSlug = useMemo(
		() =>
			projectName
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.trim()
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-"),
		[projectName],
	);

	const handleCreateProject = async () => {
		const name = projectName.trim();
		const slug = (projectSlug.trim() || suggestedSlug).trim();
		if (!name || !slug) {
			toast.error("Project name and slug are required");
			return;
		}

		try {
			setCreating(true);
			const result = await createProject({ name, slug });
			await refresh();
			if (result?.project?.id) {
				setActiveProjectId(result.project.id);
			}
			setProjectName("");
			setProjectSlug("");
			setCreateOpen(false);
			toast.success("Project created");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create project");
		} finally {
			setCreating(false);
		}
	};

	if (isLoading) {
		return (
			<div
				className={cn(
					"flex items-center gap-2 text-[13px] font-medium text-sidebar-foreground/50",
					className,
				)}
			>
				<FolderKanban className="size-4 shrink-0" />
				<span className="truncate">Loading...</span>
			</div>
		);
	}

	const triggerLabel = activeProject?.name ?? (projects.length > 0 ? "Select project" : "No project");

	const emptyState = !activeProject && projects.length === 0;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							"flex h-10 w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3",
							"text-[14px] font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60",
							"outline-none focus-visible:ring-2 focus-visible:ring-ring",
							className,
						)}
					>
						<FolderKanban className="size-4 shrink-0 text-sidebar-primary" />
						<span className="truncate flex-1 text-left">{triggerLabel}</span>
						<ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" className="w-[260px]">
					<DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
						Projects
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{error ? (
						<>
							<div className="px-2 py-2 text-xs text-destructive">{error}</div>
							<DropdownMenuItem
								className="flex items-center gap-2.5 py-2"
								onSelect={() => {
									void refresh();
								}}
							>
								<span className="text-[13px] font-medium">Retry loading projects</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
						</>
					) : null}
					{emptyState ? (
						<div className="px-2 py-2 text-xs text-muted-foreground">
							No project is active yet. Create one to start configuring auth for an app.
						</div>
					) : null}
					{projects.map((project) => {
						const isActive = project.id === activeProject?.id;
						return (
							<DropdownMenuItem
								key={project.id}
								className="flex items-center gap-2.5 py-2"
								onSelect={() => {
									if (!isActive) {
										setActiveProjectId(project.id);
									}
								}}
							>
								<FolderKanban className="size-4 shrink-0 text-muted-foreground" />
								<div className="flex flex-1 flex-col truncate">
									<span className="truncate text-[13px] font-medium">{project.name}</span>
									<span className="truncate text-[11px] text-muted-foreground">{project.slug}</span>
								</div>
								{isActive && <Check className="size-3.5 shrink-0 text-foreground" />}
							</DropdownMenuItem>
						);
					})}
					{projects.length > 0 ? <DropdownMenuSeparator /> : null}
					<DropdownMenuItem
						className="flex items-center gap-2.5 py-2 text-muted-foreground"
						onSelect={() => setCreateOpen(true)}
					>
						<Plus className="size-4 shrink-0" />
						<span className="text-[13px] font-medium">New Project</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create project</DialogTitle>
						<DialogDescription>
							Create a new project with isolated environments and configuration.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="project-name">Name</Label>
							<Input
								id="project-name"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								placeholder="My Project"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="project-slug">Slug</Label>
							<Input
								id="project-slug"
								value={projectSlug}
								onChange={(e) => setProjectSlug(e.target.value)}
								placeholder={suggestedSlug || "my-project"}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
							Cancel
						</Button>
						<Button onClick={handleCreateProject} disabled={creating}>
							{creating ? "Creating..." : "Create Project"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
