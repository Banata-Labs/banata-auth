"use client";

import { useProjectEnvironment } from "@/components/project-environment-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { deleteProject } from "@/lib/dashboard-api";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function DangerZonePage() {
	const { activeProject, projects, refresh } = useProjectEnvironment();
	const [confirmText, setConfirmText] = useState("");
	const [resetConfirmText, setResetConfirmText] = useState("");
	const [deleting, setDeleting] = useState(false);

	const handleDeleteProject = useCallback(async () => {
		if (!activeProject) return;

		// Safety: don't allow deleting the last project
		if (projects.length <= 1) {
			toast.error("Cannot delete the only project. Create another project first.");
			return;
		}

		setDeleting(true);
		try {
			await deleteProject(activeProject.id);
			toast.success(`Project "${activeProject.name}" deleted`);
			setConfirmText("");
			// Refresh will pick the next available project
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to delete project");
		} finally {
			setDeleting(false);
		}
	}, [activeProject, projects.length, refresh]);

	const handleResetData = () => {
		toast.error("Data reset is not yet available. Contact support for assistance.");
	};

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Danger Zone</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Irreversible actions that affect your entire project. Proceed with caution.
				</p>
			</div>

			<div className="rounded-lg border border-red-500/30 bg-red-500/5">
				<div className="flex items-center gap-2.5 border-b border-red-500/20 px-4 py-3">
					<AlertTriangle className="size-4 text-red-400" />
					<span className="text-sm font-medium text-red-400">Destructive Actions</span>
				</div>

				<div className="p-4 space-y-6">
					{/* Reset Configuration */}
					<Card className="border-red-500/20">
						<CardHeader>
							<CardTitle className="text-sm">Reset Configuration</CardTitle>
							<CardDescription>
								Reset all dashboard configuration to defaults. This clears branding, email settings,
								detection rules, and all custom configuration. User data is preserved.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								<div className="grid gap-2">
									<Label htmlFor="reset-confirm" className="text-xs text-muted-foreground">
										Type <span className="font-mono font-bold text-red-400">RESET</span> to confirm
									</Label>
									<Input
										id="reset-confirm"
										value={resetConfirmText}
										onChange={(e) => setResetConfirmText(e.target.value)}
										placeholder="RESET"
										className="max-w-[200px]"
									/>
								</div>
								<div>
									<Button
										variant="destructive"
										size="sm"
										disabled={resetConfirmText !== "RESET"}
										onClick={handleResetData}
									>
										Reset configuration
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Separator className="bg-red-500/20" />

					{/* Delete Project */}
					<Card className="border-red-500/20">
						<CardHeader>
							<CardTitle className="text-sm">
								Delete Project
								{activeProject ? (
									<span className="ml-1 font-normal text-muted-foreground">
										({activeProject.name})
									</span>
								) : null}
							</CardTitle>
							<CardDescription>
								Permanently delete this project and all associated data including users,
								organizations, sessions, API keys, webhooks, and configuration. This action cannot
								be undone.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								{projects.length <= 1 && (
									<p className="text-xs text-amber-400">
										You cannot delete the only remaining project. Create another project first.
									</p>
								)}
								<div className="grid gap-2">
									<Label htmlFor="delete-confirm" className="text-xs text-muted-foreground">
										Type <span className="font-mono font-bold text-red-400">DELETE MY PROJECT</span>{" "}
										to confirm
									</Label>
									<Input
										id="delete-confirm"
										value={confirmText}
										onChange={(e) => setConfirmText(e.target.value)}
										placeholder="DELETE MY PROJECT"
										className="max-w-[250px]"
										disabled={projects.length <= 1}
									/>
								</div>
								<div>
									<Button
										variant="destructive"
										size="sm"
										disabled={
											confirmText !== "DELETE MY PROJECT" || deleting || projects.length <= 1
										}
										onClick={handleDeleteProject}
									>
										{deleting ? (
											<>
												<Loader2 className="size-4 animate-spin" />
												Deleting...
											</>
										) : (
											<>
												<Trash2 className="size-4" />
												Delete project permanently
											</>
										)}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
