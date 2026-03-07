"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type PortalUser = {
	id: string;
	email: string;
	role: string;
	banned: boolean;
};

export default function UsersPage() {
	const [users, setUsers] = useState<PortalUser[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		void (async () => {
			try {
				const response = await fetch("/api/auth/admin/list-users", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: "{}",
				});
				if (!response.ok) {
					throw new Error("Unable to load users");
				}
				const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
				const list = Array.isArray(payload.data) ? payload.data : [];
				setUsers(
					list
						.filter((item) => typeof item.id === "string" && typeof item.email === "string")
						.map((item) => ({
							id: item.id as string,
							email: item.email as string,
							role: typeof item.role === "string" ? item.role : "user",
							banned: item.banned === true,
						})),
				);
			} catch {
				setError("Unable to load portal users.");
			}
		})();
	}, []);

	return (
		<section className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">User Access</h1>
				<p className="mt-1 text-sm text-muted-foreground">Manage JIT-provisioned users and grant scoped access to the admin portal.</p>
			</div>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader>
					<CardTitle className="text-base">Portal users</CardTitle>
					<CardDescription>Invite IT admins, reset MFA enrollment, and disable suspended users.</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.email}>
									<TableCell className="font-mono text-xs">{user.email}</TableCell>
									<TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
									<TableCell>
										<Badge variant={user.banned ? "destructive" : "default"}>{user.banned ? "banned" : "active"}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</section>
	);
}
