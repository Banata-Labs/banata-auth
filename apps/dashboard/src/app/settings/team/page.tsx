"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { UserPlus, Users } from "lucide-react";

export default function TeamSettingsPage() {
	const { data: session } = authClient.useSession();
	const userName = session?.user?.name ?? "Current User";
	const userEmail = session?.user?.email ?? "";
	const userRole = (session?.user as { role?: string } | undefined)?.role ?? "admin";

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Team</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage team members who can access the Banata Auth dashboard.
				</p>
			</div>

			{/* Current User */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Your Account</CardTitle>
					<CardDescription>You are signed in and have full dashboard access.</CardDescription>
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
						<Badge className="capitalize">{userRole}</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Team Members — Coming Soon */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm">Team Members</CardTitle>
							<CardDescription>Invite others to manage your Banata Auth project.</CardDescription>
						</div>
						<Button disabled size="sm">
							<UserPlus className="size-4" />
							Invite member
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted">
							<Users className="size-6 text-muted-foreground" />
						</div>
						<h3 className="mt-4 text-sm font-medium">Team management coming soon</h3>
						<p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
							You will be able to invite team members with specific roles and permissions to
							collaborate on your Banata Auth project.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
