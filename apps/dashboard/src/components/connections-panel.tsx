"use client";

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
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
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

export function ConnectionsPanel({ organizationId }: { organizationId?: string }) {
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

	async function handleCreateConnection(event: React.FormEvent<HTMLFormElement>) {
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

			const createdConnection =
				type === "oidc"
					? await createSsoConnection({
							organizationId: effectiveOrganizationId,
							type: "oidc",
							name: name.trim(),
							domains: normalizedDomains,
							oidcConfig: {
								issuer: oidcIssuer.trim(),
								clientId: oidcClientId.trim(),
								clientSecret: oidcClientSecret,
								scopes: toScopes(oidcScopes),
								discoveryUrl: oidcDiscoveryUrl.trim() || undefined,
							},
						})
					: await createSsoConnection({
							organizationId: effectiveOrganizationId,
							type: "saml",
							name: name.trim(),
							domains: normalizedDomains,
							samlConfig: {
								idpEntityId: samlEntityId.trim(),
								idpSsoUrl: samlSsoUrl.trim(),
								idpCertificate: samlCertificate.trim(),
								spEntityId: samlSpEntityId.trim() || undefined,
								nameIdFormat: samlNameIdFormat.trim() || undefined,
								signRequest,
							},
						});

			setLastCreated(createdConnection);
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
			await loadData();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to create SSO connection.");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleSetActive(connectionId: string, active: boolean) {
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
	}

	async function handleDelete(connectionId: string) {
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
	}

	return (
		<div className="grid gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Create connection</CardTitle>
					<CardDescription>
						Create an enterprise SSO connection backed by the project-scoped Banata RBAC routes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleCreateConnection} className="grid gap-5">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="connection-organization">Organization</Label>
								{organizationId ? (
									<Input id="connection-organization" value={organizationId} disabled />
								) : (
									<Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
										<SelectTrigger id="connection-organization">
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
								<Label htmlFor="connection-name">Connection name</Label>
								<Input
									id="connection-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder="Acme Workforce"
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="connection-type">Protocol</Label>
								<Select value={type} onValueChange={(value) => setType(value as "oidc" | "saml")}>
									<SelectTrigger id="connection-type">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="oidc">OIDC</SelectItem>
										<SelectItem value="saml">SAML 2.0</SelectItem>
									</SelectContent>
								</Select>
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
						</div>

						<Tabs value={type} onValueChange={(value) => setType(value as "oidc" | "saml")}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="oidc">OIDC</TabsTrigger>
								<TabsTrigger value="saml">SAML</TabsTrigger>
							</TabsList>
							<TabsContent value="oidc" className="grid gap-4">
								<div className="grid gap-4 md:grid-cols-2">
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
							<TabsContent value="saml" className="grid gap-4">
								<div className="grid gap-4 md:grid-cols-2">
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
									<div className="grid gap-2 md:col-span-2">
										<Label htmlFor="saml-certificate">X.509 certificate</Label>
										<Textarea
											id="saml-certificate"
											value={samlCertificate}
											onChange={(event) => setSamlCertificate(event.target.value)}
											placeholder="-----BEGIN CERTIFICATE-----"
											rows={7}
											required={type === "saml"}
										/>
									</div>
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
											placeholder="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
										/>
									</div>
								</div>
								<div className="flex items-center justify-between rounded-lg border px-3 py-2">
									<div>
										<p className="text-sm font-medium">Sign authn requests</p>
										<p className="text-xs text-muted-foreground">
											Enable this when your IdP requires signed authentication requests.
										</p>
									</div>
									<Switch checked={signRequest} onCheckedChange={setSignRequest} />
								</div>
							</TabsContent>
						</Tabs>

						<div className="flex flex-wrap items-center gap-3">
							<Button type="submit" disabled={isSubmitting || availableOrganizations.length === 0}>
								{isSubmitting ? "Creating..." : "Create connection"}
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={() => void loadData()}
								disabled={isLoading}
							>
								<RefreshCw className="mr-2 size-4" />
								Refresh
							</Button>
							{availableOrganizations.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Create an organization first before adding enterprise SSO.
								</p>
							) : null}
						</div>
						{error ? <p className="text-sm text-destructive">{error}</p> : null}
					</form>
				</CardContent>
			</Card>

			{lastCreated ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Provisioning details</CardTitle>
						<CardDescription>
							Use these values in your IdP immediately after creating the connection.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm">
						<div className="rounded-lg border px-3 py-2">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">Connection</p>
							<p className="font-medium">{lastCreated.name}</p>
						</div>
						{lastCreated.type === "saml" && lastCreated.spMetadataUrl ? (
							<div className="rounded-lg border px-3 py-2">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									SP metadata URL
								</p>
								<a
									href={lastCreated.spMetadataUrl}
									target="_blank"
									rel="noreferrer"
									className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-primary underline-offset-4 hover:underline"
								>
									{lastCreated.spMetadataUrl}
									<ExternalLink className="size-3" />
								</a>
							</div>
						) : null}
						{lastCreated.type === "saml" && lastCreated.samlConfig?.spAcsUrl ? (
							<div className="rounded-lg border px-3 py-2">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">ACS URL</p>
								<p className="mt-1 font-mono text-xs">{lastCreated.samlConfig.spAcsUrl}</p>
							</div>
						) : null}
						{lastCreated.type === "oidc" && lastCreated.oidcConfig?.issuer ? (
							<div className="rounded-lg border px-3 py-2">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">OIDC issuer</p>
								<p className="mt-1 font-mono text-xs">{lastCreated.oidcConfig.issuer}</p>
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}

			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader>
					<CardTitle className="text-base">Live connections</CardTitle>
					<CardDescription>
						{organizationId
							? "Connections scoped to the selected organization."
							: "Connections scoped to the active project."}
					</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Connection</TableHead>
								<TableHead>Organization</TableHead>
								<TableHead>Routing</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Protocol details</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
										Loading enterprise connections...
									</TableCell>
								</TableRow>
							) : visibleConnections.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
										No SSO connections configured for this scope.
									</TableCell>
								</TableRow>
							) : (
								visibleConnections.map((connection) => {
									const organizationName =
										organizations.find(
											(organization) => organization.id === connection.organizationId,
										)?.name ?? connection.organizationId;
									const isBusy = busyConnectionId === connection.id;
									return (
										<TableRow key={connection.id}>
											<TableCell>
												<div className="grid gap-1">
													<div className="flex items-center gap-2">
														<p className="font-medium">{connection.name}</p>
														<Badge variant="outline" className="uppercase">
															{connection.type}
														</Badge>
													</div>
													<p className="font-mono text-xs text-muted-foreground">{connection.id}</p>
												</div>
											</TableCell>
											<TableCell>{organizationName}</TableCell>
											<TableCell className="font-mono text-xs text-muted-foreground">
												{connection.domains.join(", ")}
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-2">
													<Badge variant={connectionStatusVariant(connection)}>
														{connection.state}
													</Badge>
													<Badge variant={connection.domainVerified ? "default" : "secondary"}>
														{connection.domainVerified ? "domain verified" : "domain pending"}
													</Badge>
												</div>
											</TableCell>
											<TableCell>
												{connection.type === "oidc" ? (
													<div className="grid gap-1 text-xs">
														<p className="font-mono text-muted-foreground">
															{connection.oidcConfig?.issuer || "Issuer missing"}
														</p>
														<p className="text-muted-foreground">
															Client ID: {connection.oidcConfig?.clientId || "-"}
														</p>
													</div>
												) : (
													<div className="grid gap-1 text-xs">
														<p className="font-mono text-muted-foreground">
															{connection.samlConfig?.idpEntityId || "Entity ID missing"}
														</p>
														{connection.spMetadataUrl ? (
															<a
																href={connection.spMetadataUrl}
																target="_blank"
																rel="noreferrer"
																className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
															>
																SP metadata
																<ExternalLink className="size-3" />
															</a>
														) : null}
													</div>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														disabled={isBusy}
														onClick={() =>
															void handleSetActive(connection.id, connection.state !== "active")
														}
													>
														{connection.state === "active" ? "Disable" : "Activate"}
													</Button>
													<Button
														variant="outline"
														size="sm"
														disabled={isBusy}
														onClick={() => void handleDelete(connection.id)}
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
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
