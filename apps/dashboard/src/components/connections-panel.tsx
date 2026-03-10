"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	createSsoConnection,
	deleteSsoConnection,
	listConnections,
	listOrganizations,
	setSsoConnectionActive,
} from "@/lib/dashboard-api";
import type { Organization, SsoConnection } from "@banata-auth/shared";
import { ExternalLink, Link2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_OIDC_SCOPES = "openid,email,profile";

function toDomainList(value: string) {
	return value
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
}

function toScopes(value: string) {
	return value
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function connectionStatusVariant(connection: SsoConnection) {
	if (connection.state === "active") return "default" as const;
	if (connection.state === "inactive") return "destructive" as const;
	return "secondary" as const;
}

function buildConnectionInput(params: {
	effectiveOrganizationId: string;
	type: "oidc" | "saml";
	name: string;
	domains: string[];
	oidcIssuer: string;
	oidcClientId: string;
	oidcClientSecret: string;
	oidcScopes: string;
	oidcDiscoveryUrl: string;
	samlEntityId: string;
	samlSsoUrl: string;
	samlCertificate: string;
	samlSpEntityId: string;
	samlNameIdFormat: string;
	signRequest: boolean;
}) {
	const { effectiveOrganizationId, type, name, domains } = params;
	if (type === "oidc") {
		return {
			organizationId: effectiveOrganizationId,
			type: "oidc" as const,
			name: name.trim(),
			domains,
			oidcConfig: {
				issuer: params.oidcIssuer.trim(),
				clientId: params.oidcClientId.trim(),
				clientSecret: params.oidcClientSecret,
				scopes: toScopes(params.oidcScopes),
				discoveryUrl: params.oidcDiscoveryUrl.trim() || undefined,
			},
		};
	}

	return {
		organizationId: effectiveOrganizationId,
		type: "saml" as const,
		name: name.trim(),
		domains,
		samlConfig: {
			idpEntityId: params.samlEntityId.trim(),
			idpSsoUrl: params.samlSsoUrl.trim(),
			idpCertificate: params.samlCertificate.trim(),
			spEntityId: params.samlSpEntityId.trim() || undefined,
			nameIdFormat: params.samlNameIdFormat.trim() || undefined,
			signRequest: params.signRequest,
		},
	};
}

function ProvisioningDetailsCard({ connection }: { connection: SsoConnection | null }) {
	if (!connection) {
		return null;
	}

	return (
		<Card className="border-primary/20 bg-primary/5">
			<CardHeader>
				<CardTitle className="text-sm text-primary">Provisioning details</CardTitle>
				<CardDescription>
					Use these values in your IdP to finish setting up "{connection.name}".
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-3 text-sm">
				{connection.type === "saml" && connection.spMetadataUrl && (
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">SP metadata URL</p>
						<a
							href={connection.spMetadataUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 font-mono text-xs text-primary underline-offset-4 hover:underline"
						>
							{connection.spMetadataUrl}
							<ExternalLink className="size-3" />
						</a>
					</div>
				)}
				{connection.type === "saml" && connection.samlConfig?.spAcsUrl && (
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">ACS URL</p>
						<code className="block rounded bg-muted px-2 py-1 font-mono text-xs">
							{connection.samlConfig.spAcsUrl}
						</code>
					</div>
				)}
				{connection.type === "oidc" && connection.oidcConfig?.issuer && (
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">OIDC issuer</p>
						<code className="block rounded bg-muted px-2 py-1 font-mono text-xs">
							{connection.oidcConfig.issuer}
						</code>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function useConnectionsPanelModel(organizationId?: string) {
	const activeProjectId = useActiveProjectId();
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [connections, setConnections] = useState<SsoConnection[]>([]);
	const [selectedOrganizationId, setSelectedOrganizationId] = useState(organizationId ?? "");
	const [name, setName] = useState("");
	const [type, setType] = useState<"oidc" | "saml">("oidc");
	const [domains, setDomains] = useState("");
	const [oidcIssuer, setOidcIssuer] = useState("");
	const [oidcClientId, setOidcClientId] = useState("");
	const [oidcClientSecret, setOidcClientSecret] = useState("");
	const [oidcScopes, setOidcScopes] = useState(DEFAULT_OIDC_SCOPES);
	const [oidcDiscoveryUrl, setOidcDiscoveryUrl] = useState("");
	const [samlEntityId, setSamlEntityId] = useState("");
	const [samlSsoUrl, setSamlSsoUrl] = useState("");
	const [samlCertificate, setSamlCertificate] = useState("");
	const [samlSpEntityId, setSamlSpEntityId] = useState("");
	const [samlNameIdFormat, setSamlNameIdFormat] = useState("");
	const [signRequest, setSignRequest] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [busyConnectionId, setBusyConnectionId] = useState<string | null>(null);
	const [lastCreated, setLastCreated] = useState<SsoConnection | null>(null);
	const [error, setError] = useState<string | null>(null);

	const resetForm = useCallback(() => {
		setName("");
		setDomains("");
		setOidcIssuer("");
		setOidcClientId("");
		setOidcClientSecret("");
		setOidcScopes(DEFAULT_OIDC_SCOPES);
		setOidcDiscoveryUrl("");
		setSamlEntityId("");
		setSamlSsoUrl("");
		setSamlCertificate("");
		setSamlSpEntityId("");
		setSamlNameIdFormat("");
		setSignRequest(false);
	}, []);

	useEffect(() => {
		setSelectedOrganizationId(organizationId ?? "");
	}, [organizationId]);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [orgs, currentConnections] = await Promise.all([
				listOrganizations(),
				listConnections(),
			]);
			setOrganizations(orgs);
			setConnections(currentConnections);
			if (!organizationId && !selectedOrganizationId && orgs.length > 0) {
				setSelectedOrganizationId(orgs[0]!.id);
			}
		} catch {
			setError("Unable to load enterprise SSO data.");
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

	const visibleConnections = useMemo(
		() =>
			organizationId
				? connections.filter((connection) => connection.organizationId === organizationId)
				: connections,
		[connections, organizationId],
	);

	const effectiveOrganizationId = organizationId ?? selectedOrganizationId;

	const handleCreateConnection = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			try {
				setIsSubmitting(true);
				setError(null);
				const normalizedDomains = toDomainList(domains);
				if (!effectiveOrganizationId) {
					throw new Error("Select an organization first.");
				}
				if (normalizedDomains.length === 0) {
					throw new Error("At least one routing domain is required.");
				}

				const createdConnection = await createSsoConnection(
					buildConnectionInput({
						effectiveOrganizationId,
						type,
						name,
						domains: normalizedDomains,
						oidcIssuer,
						oidcClientId,
						oidcClientSecret,
						oidcScopes,
						oidcDiscoveryUrl,
						samlEntityId,
						samlSsoUrl,
						samlCertificate,
						samlSpEntityId,
						samlNameIdFormat,
						signRequest,
					}),
				);

				setLastCreated(createdConnection);
				resetForm();
				await loadData();
			} catch (caught) {
				setError(caught instanceof Error ? caught.message : "Unable to create SSO connection.");
			} finally {
				setIsSubmitting(false);
			}
		},
		[
			effectiveOrganizationId,
			loadData,
			name,
			domains,
			oidcIssuer,
			oidcClientId,
			oidcClientSecret,
			oidcScopes,
			oidcDiscoveryUrl,
			resetForm,
			samlEntityId,
			samlSsoUrl,
			samlCertificate,
			samlSpEntityId,
			samlNameIdFormat,
			signRequest,
			type,
		],
	);

	const handleSetActive = useCallback(
		async (connectionId: string, active: boolean) => {
			try {
				setBusyConnectionId(connectionId);
				setError(null);
				await setSsoConnectionActive(connectionId, active);
				await loadData();
			} catch {
				setError(
					active ? "Unable to activate SSO connection." : "Unable to deactivate SSO connection.",
				);
			} finally {
				setBusyConnectionId(null);
			}
		},
		[loadData],
	);

	const handleDelete = useCallback(
		async (connectionId: string) => {
			if (!window.confirm("Delete this SSO connection?")) {
				return;
			}
			try {
				setBusyConnectionId(connectionId);
				setError(null);
				await deleteSsoConnection(connectionId);
				setLastCreated((current) => (current?.id === connectionId ? null : current));
				await loadData();
			} catch {
				setError("Unable to delete SSO connection.");
			} finally {
				setBusyConnectionId(null);
			}
		},
		[loadData],
	);

	return {
		organizations,
		availableOrganizations,
		visibleConnections,
		selectedOrganizationId,
		setSelectedOrganizationId,
		name,
		setName,
		type,
		setType,
		domains,
		setDomains,
		oidcIssuer,
		setOidcIssuer,
		oidcClientId,
		setOidcClientId,
		oidcClientSecret,
		setOidcClientSecret,
		oidcScopes,
		setOidcScopes,
		oidcDiscoveryUrl,
		setOidcDiscoveryUrl,
		samlEntityId,
		setSamlEntityId,
		samlSsoUrl,
		setSamlSsoUrl,
		samlCertificate,
		setSamlCertificate,
		samlSpEntityId,
		setSamlSpEntityId,
		samlNameIdFormat,
		setSamlNameIdFormat,
		signRequest,
		setSignRequest,
		isLoading,
		isSubmitting,
		busyConnectionId,
		lastCreated,
		error,
		loadData,
		handleCreateConnection,
		handleSetActive,
		handleDelete,
	};
}

export function ConnectionsPanel({ organizationId }: { organizationId?: string }) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const model = useConnectionsPanelModel(organizationId);
	const {
		organizations,
		availableOrganizations,
		visibleConnections,
		selectedOrganizationId,
		setSelectedOrganizationId,
		name,
		setName,
		type,
		setType,
		domains,
		setDomains,
		oidcIssuer,
		setOidcIssuer,
		oidcClientId,
		setOidcClientId,
		oidcClientSecret,
		setOidcClientSecret,
		oidcScopes,
		setOidcScopes,
		oidcDiscoveryUrl,
		setOidcDiscoveryUrl,
		samlEntityId,
		setSamlEntityId,
		samlSsoUrl,
		setSamlSsoUrl,
		samlCertificate,
		setSamlCertificate,
		samlSpEntityId,
		setSamlSpEntityId,
		samlNameIdFormat,
		setSamlNameIdFormat,
		signRequest,
		setSignRequest,
		isLoading,
		isSubmitting,
		busyConnectionId,
		lastCreated,
		error,
		loadData,
		handleCreateConnection,
		handleSetActive,
		handleDelete,
	} = model;

	return (
		<div className="grid gap-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={() => setShowCreateDialog(true)}
					disabled={availableOrganizations.length === 0}
				>
					<Plus className="size-4" />
					Create Connection
				</Button>
				<Button variant="outline" onClick={() => void loadData()} disabled={isLoading}>
					<RefreshCw className="size-4" />
					Refresh
				</Button>
				{availableOrganizations.length === 0 && !isLoading && (
					<p className="text-sm text-muted-foreground">
						Create an organization first before adding enterprise SSO.
					</p>
				)}
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}

			<ProvisioningDetailsCard connection={lastCreated} />

			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader>
					<CardTitle className="text-base">Connections</CardTitle>
					<CardDescription>
						{organizationId
							? "SSO connections scoped to the selected organization."
							: "All enterprise SSO connections for this project."}
					</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Connection</TableHead>
								<TableHead>Organization</TableHead>
								<TableHead>Domains</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
										Loading connections...
									</TableCell>
								</TableRow>
							) : visibleConnections.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="py-12 text-center">
										<div className="flex flex-col items-center gap-3 text-muted-foreground">
											<Link2 className="size-8 opacity-40" />
											<div className="space-y-1">
												<p className="text-sm font-medium">No SSO connections</p>
												<p className="text-xs">
													Create your first enterprise SSO connection.
												</p>
											</div>
										</div>
									</TableCell>
								</TableRow>
							) : (
								visibleConnections.map((connection) => (
									<TableRow key={connection.id}>
										<TableCell>
											<div className="grid gap-0.5">
												<div className="flex items-center gap-2">
													<p className="font-medium">{connection.name}</p>
													<Badge variant="outline" className="text-[11px] uppercase">
														{connection.type}
													</Badge>
												</div>
												<p className="font-mono text-xs text-muted-foreground">
													{connection.id}
												</p>
											</div>
										</TableCell>
										<TableCell className="text-sm">
											{organizations.find((o) => o.id === connection.organizationId)?.name ??
												connection.organizationId}
										</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{connection.domains.join(", ")}
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1.5">
												<Badge variant={connectionStatusVariant(connection)}>
													{connection.state}
												</Badge>
												<Badge variant={connection.domainVerified ? "default" : "secondary"}>
													{connection.domainVerified ? "verified" : "pending"}
												</Badge>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													disabled={busyConnectionId === connection.id}
													onClick={() =>
														void handleSetActive(connection.id, connection.state !== "active")
													}
												>
													{connection.state === "active" ? "Disable" : "Activate"}
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="size-8 text-muted-foreground hover:text-destructive"
													disabled={busyConnectionId === connection.id}
													onClick={() => void handleDelete(connection.id)}
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Create Connection Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-xl">
					<DialogHeader>
						<DialogTitle>Create SSO Connection</DialogTitle>
						<DialogDescription>
							Set up an enterprise SSO connection with OIDC or SAML.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							await handleCreateConnection(e);
							if (!error) setShowCreateDialog(false);
						}}
						className="grid gap-4"
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="connection-organization">Organization</Label>
								{organizationId ? (
									<Input id="connection-organization" value={organizationId} disabled />
								) : (
									<Select
										value={selectedOrganizationId}
										onValueChange={setSelectedOrganizationId}
									>
										<SelectTrigger id="connection-organization">
											<SelectValue placeholder="Select organization" />
										</SelectTrigger>
										<SelectContent>
											{availableOrganizations.map((org) => (
												<SelectItem key={org.id} value={org.id}>
													{org.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
							<div className="grid gap-2">
								<Label htmlFor="connection-name">Connection name</Label>
								<Input
									id="connection-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder="Acme Workforce"
									required
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="connection-domains">Routing domains</Label>
							<Input
								id="connection-domains"
								value={domains}
								onChange={(event) => setDomains(event.target.value)}
								placeholder="acme.com, login.acme.com"
								required
							/>
						</div>

						<Tabs value={type} onValueChange={(value) => setType(value as "oidc" | "saml")}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="oidc">OIDC</TabsTrigger>
								<TabsTrigger value="saml">SAML</TabsTrigger>
							</TabsList>
							<TabsContent value="oidc" className="grid gap-3">
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="grid gap-2">
										<Label htmlFor="oidc-issuer">Issuer</Label>
										<Input
											id="oidc-issuer"
											value={oidcIssuer}
											onChange={(event) => setOidcIssuer(event.target.value)}
											placeholder="https://acme.okta.com/oauth2/default"
											required={type === "oidc"}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="oidc-client-id">Client ID</Label>
										<Input
											id="oidc-client-id"
											value={oidcClientId}
											onChange={(event) => setOidcClientId(event.target.value)}
											placeholder="client_123"
											required={type === "oidc"}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="oidc-client-secret">Client secret</Label>
										<Input
											id="oidc-client-secret"
											type="password"
											value={oidcClientSecret}
											onChange={(event) => setOidcClientSecret(event.target.value)}
											placeholder="secret_123"
											required={type === "oidc"}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="oidc-scopes">Scopes</Label>
										<Input
											id="oidc-scopes"
											value={oidcScopes}
											onChange={(event) => setOidcScopes(event.target.value)}
											placeholder={DEFAULT_OIDC_SCOPES}
										/>
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="oidc-discovery-url">Discovery URL (optional)</Label>
									<Input
										id="oidc-discovery-url"
										value={oidcDiscoveryUrl}
										onChange={(event) => setOidcDiscoveryUrl(event.target.value)}
										placeholder="https://acme.okta.com/.well-known/openid-configuration"
									/>
								</div>
							</TabsContent>
							<TabsContent value="saml" className="grid gap-3">
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="grid gap-2">
										<Label htmlFor="saml-entity-id">IdP entity ID</Label>
										<Input
											id="saml-entity-id"
											value={samlEntityId}
											onChange={(event) => setSamlEntityId(event.target.value)}
											placeholder="http://www.okta.com/exk123"
											required={type === "saml"}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="saml-sso-url">IdP SSO URL</Label>
										<Input
											id="saml-sso-url"
											value={samlSsoUrl}
											onChange={(event) => setSamlSsoUrl(event.target.value)}
											placeholder="https://acme.okta.com/app/.../sso/saml"
											required={type === "saml"}
										/>
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="saml-certificate">X.509 certificate</Label>
									<Textarea
										id="saml-certificate"
										value={samlCertificate}
										onChange={(event) => setSamlCertificate(event.target.value)}
										placeholder="-----BEGIN CERTIFICATE-----"
										rows={5}
										required={type === "saml"}
									/>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="grid gap-2">
										<Label htmlFor="saml-sp-entity-id">SP entity ID (optional)</Label>
										<Input
											id="saml-sp-entity-id"
											value={samlSpEntityId}
											onChange={(event) => setSamlSpEntityId(event.target.value)}
											placeholder="urn:banata:acme"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="saml-name-id-format">NameID format (optional)</Label>
										<Input
											id="saml-name-id-format"
											value={samlNameIdFormat}
											onChange={(event) => setSamlNameIdFormat(event.target.value)}
											placeholder="urn:oasis:names:tc:SAML:1.1:..."
										/>
									</div>
								</div>
								<div className="flex items-center justify-between rounded-lg border px-3 py-2">
									<div>
										<p className="text-sm font-medium">Sign authn requests</p>
										<p className="text-xs text-muted-foreground">
											Enable when your IdP requires signed requests.
										</p>
									</div>
									<Switch checked={signRequest} onCheckedChange={setSignRequest} />
								</div>
							</TabsContent>
						</Tabs>

						{error && <p className="text-sm text-destructive">{error}</p>}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowCreateDialog(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Connection"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
