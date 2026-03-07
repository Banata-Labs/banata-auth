import { DirectoriesPanel } from "@/components/directories-panel";

export default function DirectoriesPage() {
	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Directory Sync</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage project-scoped SCIM directories, tokens, and provisioning endpoints.
				</p>
			</div>
			<DirectoriesPanel />
		</div>
	);
}
