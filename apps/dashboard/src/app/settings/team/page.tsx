"use client";

import { useProjectEnvironment } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Shield, Users } from "lucide-react";

export default function TeamSettingsPage() {
	const { data: session } = authClient.useSession();
	const { activeProject } = useProjectEnvironment();
	const userName = session?.user?.name ?? "Current User";
	const userEmail = session?.user?.email ?? "";
	const userId = session?.user?.id ?? null;
	const userRole = (session?.user as { role?: string } | undefined)?.role ?? "admin";
	const isProjectOwner = activeProject?.ownerId === userId;

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Team</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Review who currently has dashboard access for the active project.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Your Account</CardTitle>
					<CardDescription>
						This is the identity currently managing{" "}
						<span className="font-medium text-foreground">
							{activeProject?.name ?? "this project"}
						</span>
						.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
								{userName.charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-sm font-medium">{userName}</p>
								<p className="text-xs text-muted-foreground">{userEmail}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{isProjectOwner ? <Badge>Owner</Badge> : null}
							<Badge className="capitalize">{userRole}</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Access Model</CardTitle>
					<CardDescription>
						Project access is currently controlled by the project owner and platform-level admin
						roles.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-10">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted">
							<Shield className="size-6 text-muted-foreground" />
						</div>
						<h3 className="mt-4 text-sm font-medium">Project access is scoped and active</h3>
						<p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
							Use project ownership, RBAC, and organization membership to control what authenticated
							users can manage. The dashboard no longer advertises invite controls that are not
							wired to a live flow.
						</p>
						<div className="mt-6 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
							<Users className="size-4 text-muted-foreground" />
							<span>
								{activeProject ? `Active project: ${activeProject.name}` : "No active project"}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
