"use client";

import type { Directory, Organization } from "@banata-auth/shared";
import { useActiveProjectId } from "@/components/project-environment-provider";
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
import {
	createDirectory,
	deleteDirectory,
	listDirectories,
	listOrganizations,
} from "@/lib/dashboard-api";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PROVIDERS: Array<{ value: Directory["provider"]; label: string }> = [
	{ value: "okta", label: "Okta" },
	{ value: "azure_scim_v2", label: "Azure AD / Entra ID" },
	{ value: "google_workspace", label: "Google Workspace" },
	{ value: "onelogin", label: "OneLogin" },
	{ value: "jumpcloud", label: "JumpCloud" },
	{ value: "pingfederate", label: "PingFederate" },
	{ value: "generic_scim_v2", label: "Generic SCIM v2" },
];

function stateVariant(state: Directory["state"]) {
	return state === "linked" ? "default" : "destructive";
}

export function DirectoriesPanel({ organizationId }: { organizationId?: string }) {
	const activeProjectId = useActiveProjectId();
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [directories, setDirectories] = useState<Directory[]>([]);
	const [selectedOrganizationId, setSelectedOrganizationId] = useState(organizationId ?? "");
	const [name, setName] = useState("");
	const [provider, setProvider] = useState<Directory["provider"]>("okta");
	const [latestDirectory, setLatestDirectory] = useState<Directory | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [busyDirectoryId, setBusyDirectoryId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setSelectedOrganizationId(organizationId ?? "");
	}, [organizationId]);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [orgs, currentDirectories] = await Promise.all([listOrganizations(), listDirectories()]);
			setOrganizations(orgs);
			setDirectories(currentDirectories);
			if (!organizationId && !selectedOrganizationId && orgs.length > 0) {
				setSelectedOrganizationId(orgs[0]!.id);
			}
		} catch {
			setError("Unable to load SCIM directory data.");
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, selectedOrganizationId]);

	useEffect(() => {
		if (!activeProjectId) return;
		void loadData();
	}, [activeProjectId, loadData]);

	const availableOrganizations = useMemo(
		() =>
			organizationId
				? organizations.filter((organization) => organization.id === organizationId)
				: organizations,
		[organizationId, organizations],
	);

	const visibleDirectories = useMemo(
		() =>
			organizationId
				? directories.filter((directory) => directory.organizationId === organizationId)
				: directories,
		[directories, organizationId],
	);

	const effectiveOrganizationId = organizationId ?? selectedOrganizationId;

	async function handleCreateDirectory(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			setIsSubmitting(true);
			setError(null);
			if (!effectiveOrganizationId) {
				throw new Error("Select an organization first.");
			}
			const directory = await createDirectory({
				organizationId: effectiveOrganizationId,
				name: name.trim(),
				provider,
			});
			setLatestDirectory(directory);
			setName("");
			setProvider("okta");
			await loadData();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to create SCIM directory.");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteDirectory(directoryId: string) {
		if (!window.confirm("Delete this SCIM directory?")) {
			return;
		}
		try {
			setBusyDirectoryId(directoryId);
			setError(null);
			await deleteDirectory(directoryId);
			setLatestDirectory((current) => (current?.id === directoryId ? null : current));
			await loadData();
		} catch {
			setError("Unable to delete SCIM directory.");
		} finally {
			setBusyDirectoryId(null);
		}
	}

	async function copyValue(value: string) {
		await navigator.clipboard.writeText(value);
	}

	return (
		<div className="grid gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Create directory</CardTitle>
					<CardDescription>
						Provision a SCIM directory and issue the bearer token your IdP will use.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleCreateDirectory} className="grid gap-4 md:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="directory-organization">Organization</Label>
							{organizationId ? (
								<Input id="directory-organization" value={organizationId} disabled />
							) : (
								<Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
									<SelectTrigger id="directory-organization">
										<SelectValue placeholder="Select an organization" />
									</SelectTrigger>
									<SelectContent>
										{availableOrganizations.map((organization) => (
											<SelectItem key={organization.id} value={organization.id}>
												{organization.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="directory-name">Directory name</Label>
							<Input
								id="directory-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Acme Workforce SCIM"
								required
							/>
						</div>
						<div className="grid gap-2 md:col-span-2">
							<Label htmlFor="directory-provider">Provider</Label>
							<Select value={provider} onValueChange={(value) => setProvider(value as Directory["provider"])}>
								<SelectTrigger id="directory-provider">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PROVIDERS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="md:col-span-2 flex flex-wrap items-center gap-3">
							<Button type="submit" disabled={isSubmitting || availableOrganizations.length === 0}>
								{isSubmitting ? "Creating..." : "Create directory"}
							</Button>
							<Button type="button" variant="secondary" onClick={() => void loadData()} disabled={isLoading}>
								<RefreshCw className="mr-2 size-4" />
								Refresh
							</Button>
							{availableOrganizations.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Create an organization first before provisioning SCIM.
								</p>
							) : null}
						</div>
						{error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
					</form>
				</CardContent>
			</Card>

			{latestDirectory?.scimConfig ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">SCIM credentials</CardTitle>
						<CardDescription>
							The bearer token is only shown when the directory is created or rotated.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm">
						<div className="rounded-lg border px-3 py-2">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Base URL</p>
									<p className="mt-1 break-all font-mono text-xs">{latestDirectory.scimConfig.baseUrl}</p>
								</div>
								<Button type="button" variant="outline" size="sm" onClick={() => void copyValue(latestDirectory.scimConfig!.baseUrl)}>
									<Copy className="size-4" />
								</Button>
							</div>
						</div>
						<div className="rounded-lg border px-3 py-2">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Bearer token</p>
									<p className="mt-1 break-all font-mono text-xs">{latestDirectory.scimConfig.bearerToken}</p>
								</div>
								<Button type="button" variant="outline" size="sm" onClick={() => void copyValue(latestDirectory.scimConfig!.bearerToken)}>
									<Copy className="size-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			) : null}

			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader>
					<CardTitle className="text-base">Live directories</CardTitle>
					<CardDescription>
						{organizationId
							? "Directories scoped to the selected organization."
							: "Directories scoped to the active project."}
					</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Directory</TableHead>
								<TableHead>Organization</TableHead>
								<TableHead>Provider</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Sync health</TableHead>
								<TableHead>Users</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
										Loading directories...
									</TableCell>
								</TableRow>
							) : visibleDirectories.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
										No SCIM directories configured for this scope.
									</TableCell>
								</TableRow>
							) : (
								visibleDirectories.map((directory) => {
									const organizationName =
										organizations.find((organization) => organization.id === directory.organizationId)?.name ??
										directory.organizationId;
									const isBusy = busyDirectoryId === directory.id;
									return (
										<TableRow key={directory.id}>
											<TableCell>
												<div className="grid gap-1">
													<p className="font-medium">{directory.name}</p>
													<p className="font-mono text-xs text-muted-foreground">{directory.id}</p>
												</div>
											</TableCell>
											<TableCell>{organizationName}</TableCell>
											<TableCell>
												<Badge variant="outline">{directory.provider}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={stateVariant(directory.state)}>{directory.state}</Badge>
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{directory.lastSyncStatus ?? "Awaiting first sync"}
											</TableCell>
											<TableCell>{directory.userCount}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="outline"
													size="sm"
													disabled={isBusy}
													onClick={() => void handleDeleteDirectory(directory.id)}
												>
													<Trash2 className="size-4" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
