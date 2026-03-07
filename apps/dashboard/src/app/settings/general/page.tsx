"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useProjectEnvironment } from "@/components/project-environment-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton, SkeletonCard, SkeletonHeader, SkeletonInput } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/dashboard-api";
import { Check, Copy, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function GeneralSettingsPage() {
	const { activeProject, isLoading, refresh } = useProjectEnvironment();
	const { reportError } = useBackendStatus();

	const [saving, setSaving] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Editable fields — synced from activeProject
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");

	// Sync local state when activeProject changes
	useEffect(() => {
		if (activeProject) {
			setProjectName(activeProject.name);
			setProjectDescription(activeProject.description ?? "");
		}
	}, [activeProject]);

	const handleSave = useCallback(async () => {
		if (!activeProject) return;
		setSaving(true);
		try {
			await updateProject(activeProject.id, {
				name: projectName,
				description: projectDescription,
			});
			await refresh();
			toast.success("Project settings saved");
		} catch (err) {
			reportError(err);
			toast.error("Failed to save project settings");
		} finally {
			setSaving(false);
		}
	}, [activeProject, projectName, projectDescription, refresh, reportError]);

	const copyToClipboard = useCallback((value: string, field: string) => {
		navigator.clipboard.writeText(value);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	}, []);

	const hasChanges =
		activeProject &&
		(projectName !== activeProject.name ||
			projectDescription !== (activeProject.description ?? ""));

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<SkeletonCard lines={0}>
					<div className="grid gap-4">
						<SkeletonInput />
						<SkeletonInput />
					</div>
				</SkeletonCard>
				<SkeletonCard lines={0}>
					<SkeletonInput />
				</SkeletonCard>
				<SkeletonCard lines={0}>
					<SkeletonInput width="w-[200px]" />
				</SkeletonCard>
				<Skeleton className="ml-auto h-9 w-28 rounded-md" />
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">General</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage your project name and description.
				</p>
			</div>

			{/* Project Identity */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Project Identity</CardTitle>
					<CardDescription>
						Your project name and description are shown in the dashboard and used for
						identification.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="project-name">Project name</Label>
							<Input
								id="project-name"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								placeholder="My Banata Project"
								maxLength={100}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="project-description">Description</Label>
							<Textarea
								id="project-description"
								value={projectDescription}
								onChange={(e) => setProjectDescription(e.target.value)}
								placeholder="A short description of your project..."
								maxLength={500}
								rows={3}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Project ID */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Project ID</CardTitle>
					<CardDescription>
						A read-only identifier for your project. Used by SDKs to identify which project to
						connect to.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						<Input
							value={activeProject?.id ?? ""}
							readOnly
							className="font-mono text-sm bg-muted"
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => activeProject?.id && copyToClipboard(activeProject.id, "projectId")}
							title="Copy project ID"
						>
							{copiedField === "projectId" ? (
								<Check className="size-4 text-emerald-500" />
							) : (
								<Copy className="size-4" />
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Save */}
			<Separator />
			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={saving || !hasChanges}>
					{saving ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save changes"
					)}
				</Button>
			</div>
		</div>
	);
}
