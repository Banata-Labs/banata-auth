"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

export default function SsoSetupPage() {
	const [provider, setProvider] = useState("okta");
	const [projectId, setProjectId] = useState("");
	const [organizationId, setOrganizationId] = useState("");
	const [connectionName, setConnectionName] = useState("");
	const [domain, setDomain] = useState("");
	const [connections, setConnections] = useState<
		Array<{ id: string; name: string; type: string; active: boolean; domain: string | null }>
	>([]);
	const [error, setError] = useState<string | null>(null);

	async function refreshConnections() {
		if (!projectId) {
			setConnections([]);
			return;
		}
		const response = await fetch("/api/auth/banata/sso/list-providers", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ projectId }),
		});
		if (!response.ok) {
			throw new Error("Unable to load SSO connections");
		}
		const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
		const list = Array.isArray(payload.data) ? payload.data : [];
		setConnections(
			list
				.filter((item) => typeof item.id === "string")
				.map((item) => ({
					id: item.id as string,
					name: typeof item.name === "string" ? item.name : "Unnamed",
					type: item.type === "saml" ? "saml" : "oidc",
					active: item.active !== false,
					domain: typeof item.domain === "string" ? item.domain : null,
				})),
		);
	}

	useEffect(() => {
		if (!projectId) return;
		void (async () => {
			try {
				const response = await fetch("/api/auth/banata/sso/list-providers", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ projectId }),
				});
				if (!response.ok) {
					throw new Error("Unable to load SSO connections");
				}
				const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
				const list = Array.isArray(payload.data) ? payload.data : [];
				setConnections(
					list
						.filter((item) => typeof item.id === "string")
						.map((item) => ({
							id: item.id as string,
							name: typeof item.name === "string" ? item.name : "Unnamed",
							type: item.type === "saml" ? "saml" : "oidc",
							active: item.active !== false,
							domain: typeof item.domain === "string" ? item.domain : null,
						})),
				);
			} catch {
				setError("Unable to load SSO connections.");
			}
		})();
	}, [projectId]);

	return (
		<section className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">SSO Setup Wizard</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Step through metadata collection and test your first enterprise login.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Identity provider</CardTitle>
					<CardDescription>Choose your provider to generate setup instructions.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3">
					<Label htmlFor="provider">Provider</Label>
					<Select value={provider} onValueChange={setProvider}>
						<SelectTrigger id="provider">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="okta">Okta</SelectItem>
							<SelectItem value="azure">Azure AD</SelectItem>
						</SelectContent>
					</Select>
					<Label htmlFor="organization-id">Organization ID</Label>
					<Input
						id="organization-id"
						value={organizationId}
						onChange={(event) => setOrganizationId(event.target.value)}
						placeholder="org_123"
					/>
					<Label htmlFor="project-id">Project ID</Label>
					<Input
						id="project-id"
						value={projectId}
						onChange={(event) => setProjectId(event.target.value)}
						placeholder="proj_123"
					/>
					<Label htmlFor="connection-name">Connection name</Label>
					<Input
						id="connection-name"
						value={connectionName}
						onChange={(event) => setConnectionName(event.target.value)}
						placeholder="Acme SSO"
					/>
					<Label htmlFor="domain">Routing domain</Label>
					<Input
						id="domain"
						value={domain}
						onChange={(event) => setDomain(event.target.value)}
						placeholder="acme.com"
					/>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							onClick={async () => {
								try {
									setError(null);
									if (!projectId) {
										throw new Error("Project ID is required");
									}
									const type = provider === "okta" ? "saml" : "oidc";
									const response = await fetch("/api/auth/banata/sso/register", {
										method: "POST",
										headers: { "content-type": "application/json" },
										body: JSON.stringify({
											projectId,
											organizationId,
											name: connectionName,
											type,
											domain,
										}),
									});
									if (!response.ok) {
										throw new Error("Unable to create connection");
									}
									await refreshConnections();
								} catch {
									setError("Unable to create SSO connection.");
								}
							}}
						>
							Create connection
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() =>
								void refreshConnections().catch(() =>
									setError("Unable to refresh SSO connections."),
								)
							}
						>
							Refresh
						</Button>
					</div>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
				</CardContent>
			</Card>
			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader>
					<CardTitle className="text-base">Live SSO connections</CardTitle>
					<CardDescription>
						These values come from project-scoped Banata enterprise SSO providers.
					</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Domain</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{connections.map((connection) => (
								<TableRow key={connection.id}>
									<TableCell>{connection.name}</TableCell>
									<TableCell>
										<Badge variant="secondary">{connection.type}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={connection.active ? "default" : "destructive"}>
											{connection.active ? "active" : "inactive"}
										</Badge>
									</TableCell>
									<TableCell className="font-mono text-xs">{connection.domain ?? "-"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</section>
	);
}
