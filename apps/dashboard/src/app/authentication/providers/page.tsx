"use client";

import { useBackendStatus } from "@/components/backend-status";
import { ProviderIcon, providerMeta } from "@/components/provider-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonHeader, SkeletonProviderRow } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	type DashboardConfig,
	type SocialProviderCredentials,
	deleteSocialProviderCredential,
	getDashboardConfig,
	getSocialProviderCredentials,
	saveSocialProviderCredential,
	toggleSocialProvider,
} from "@/lib/dashboard-api";
import { Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ProviderDef {
	id: string;
	name: string;
	description: string;
	tenantLabel?: string;
}

interface ProviderDraft {
	clientId: string;
	clientSecret: string;
	tenantId: string;
}

const providerDefs: ProviderDef[] = [
	{ id: "google", name: "Google", description: "OAuth login for Google accounts." },
	{
		id: "microsoft",
		name: "Microsoft",
		description: "OAuth login for Microsoft Entra ID and Microsoft accounts.",
		tenantLabel: "Tenant ID",
	},
	{ id: "github", name: "GitHub", description: "OAuth login for GitHub users." },
	{ id: "apple", name: "Sign in with Apple", description: "Apple ID authentication." },
	{ id: "gitlab", name: "GitLab", description: "OAuth login for GitLab users." },
	{ id: "linkedin", name: "LinkedIn", description: "OAuth login for LinkedIn users." },
	{ id: "discord", name: "Discord", description: "OAuth login for Discord communities." },
	{ id: "twitter", name: "Twitter", description: "OAuth login for X / Twitter users." },
	{ id: "slack", name: "Slack", description: "OAuth login for Slack workspaces." },
];

function toDrafts(credentials: SocialProviderCredentials): Record<string, ProviderDraft> {
	return Object.fromEntries(
		Object.entries(credentials).map(([providerId, value]) => [
			providerId,
			{
				clientId: value.clientId,
				clientSecret: "",
				tenantId: value.tenantId ?? "",
			},
		]),
	);
}

export default function ProvidersPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [credentials, setCredentials] = useState<SocialProviderCredentials>({});
	const [drafts, setDrafts] = useState<Record<string, ProviderDraft>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [savingProvider, setSavingProvider] = useState<string | null>(null);
	const [deletingProvider, setDeletingProvider] = useState<string | null>(null);
	const [togglingProviders, setTogglingProviders] = useState<Record<string, boolean>>({});

	const { reportError } = useBackendStatus();

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		Promise.all([getDashboardConfig(), getSocialProviderCredentials()])
			.then(([dashboardConfig, providerCredentials]) => {
				if (cancelled) return;
				setConfig(dashboardConfig);
				setCredentials(providerCredentials);
				setDrafts(toDrafts(providerCredentials));
			})
			.catch((error) => {
				if (!cancelled) reportError(error);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [reportError]);

	const enabledCount = useMemo(
		() =>
			Object.values(config?.socialProviders ?? {}).filter((provider) => provider.enabled).length,
		[config],
	);
	const configuredCount = useMemo(() => Object.keys(credentials).length, [credentials]);

	const handleDraftChange = useCallback((providerId: string, patch: Partial<ProviderDraft>) => {
		setDrafts((prev) => ({
			...prev,
			[providerId]: {
				clientId: prev[providerId]?.clientId ?? "",
				clientSecret: prev[providerId]?.clientSecret ?? "",
				tenantId: prev[providerId]?.tenantId ?? "",
				...patch,
			},
		}));
	}, []);

	const handleSave = useCallback(
		async (providerId: string) => {
			const draft = drafts[providerId] ?? { clientId: "", clientSecret: "", tenantId: "" };
			if (!draft.clientId.trim()) {
				toast.error("Client ID is required");
				return;
			}

			setSavingProvider(providerId);
			try {
				const result = await saveSocialProviderCredential({
					providerId,
					clientId: draft.clientId.trim(),
					clientSecret: draft.clientSecret.trim() || undefined,
					tenantId: draft.tenantId.trim() || undefined,
					enabled: credentials[providerId]?.enabled ?? false,
				});
				setConfig(result.config);
				setCredentials(result.providers);
				setDrafts((prev) => ({
					...prev,
					[providerId]: {
						clientId: result.providers[providerId]?.clientId ?? draft.clientId.trim(),
						clientSecret: "",
						tenantId: result.providers[providerId]?.tenantId ?? draft.tenantId.trim(),
					},
				}));
				toast.success("Provider credentials saved");
			} catch (error) {
				reportError(error);
				toast.error("Failed to save provider credentials");
			} finally {
				setSavingProvider(null);
			}
		},
		[credentials, drafts, reportError],
	);

	const handleDelete = useCallback(
		async (providerId: string) => {
			setDeletingProvider(providerId);
			try {
				const result = await deleteSocialProviderCredential(providerId);
				setConfig(result.config);
				setCredentials(result.providers);
				setDrafts((prev) => {
					const next = { ...prev };
					delete next[providerId];
					return next;
				});
				toast.success("Provider credentials removed");
			} catch (error) {
				reportError(error);
				toast.error("Failed to remove provider credentials");
			} finally {
				setDeletingProvider(null);
			}
		},
		[reportError],
	);

	const handleToggle = useCallback(
		async (providerId: string, enabled: boolean) => {
			setTogglingProviders((prev) => ({ ...prev, [providerId]: true }));
			try {
				const updatedConfig = await toggleSocialProvider(providerId, !enabled);
				setConfig(updatedConfig);
				setCredentials((prev) => {
					if (!prev[providerId]) {
						return prev;
					}
					return {
						...prev,
						[providerId]: { ...prev[providerId], enabled: !enabled },
					};
				});
				toast.success("Social provider updated");
			} catch (error) {
				reportError(error);
				toast.error("Failed to update social provider");
			} finally {
				setTogglingProviders((prev) => ({ ...prev, [providerId]: false }));
			}
		},
		[reportError],
	);

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="rounded-lg border border-border">
					{["provider-1", "provider-2", "provider-3", "provider-4", "provider-5", "provider-6"].map(
						(key) => (
							<SkeletonProviderRow key={key} />
						),
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Providers</h1>
				<p className="mt-1 max-w-3xl text-sm text-muted-foreground">
					Configure provider credentials for this project, store them securely in the vault, then
					enable the providers you want to expose on the hosted auth flow for this app.
				</p>
				<p className="mt-2 text-xs text-muted-foreground">
					Configured: {configuredCount} · Enabled: {enabledCount}
				</p>
			</div>

			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<div className="divide-y divide-border">
						{providerDefs.map((provider) => {
							const info = credentials[provider.id];
							const draft = drafts[provider.id] ?? {
								clientId: "",
								clientSecret: "",
								tenantId: "",
							};
							const enabled = config?.socialProviders[provider.id]?.enabled ?? false;
							const isConfigured = !!info;
							const isBusy =
								savingProvider === provider.id ||
								deletingProvider === provider.id ||
								!!togglingProviders[provider.id];

							return (
								<div key={provider.id} className="px-6 py-5">
									<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												<div className="flex size-10 items-center justify-center rounded-full bg-muted">
													<ProviderIcon
														provider={provider.id}
														size={22}
														className={providerMeta[provider.id]?.color}
													/>
												</div>
												<div className="space-y-1">
													<div className="flex flex-wrap items-center gap-2">
														<span className="text-sm font-medium">{provider.name}</span>
														<Badge variant={enabled ? "default" : "secondary"}>
															{enabled ? "Enabled" : "Disabled"}
														</Badge>
														{isConfigured ? (
															<Badge variant="outline">Credentials stored</Badge>
														) : (
															<Badge variant="outline">Not configured</Badge>
														)}
													</div>
													<p className="text-sm text-muted-foreground">{provider.description}</p>
												</div>
											</div>

											<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
												<div className="space-y-2">
													<Label htmlFor={`${provider.id}-client-id`}>Client ID</Label>
													<Input
														id={`${provider.id}-client-id`}
														value={draft.clientId}
														onChange={(event) =>
															handleDraftChange(provider.id, { clientId: event.target.value })
														}
														placeholder="Enter the OAuth client ID"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor={`${provider.id}-client-secret`}>Client secret</Label>
													<Input
														id={`${provider.id}-client-secret`}
														type="password"
														value={draft.clientSecret}
														onChange={(event) =>
															handleDraftChange(provider.id, { clientSecret: event.target.value })
														}
														placeholder={
															info?.hasClientSecret
																? "Stored securely. Enter a new secret to rotate it."
																: "Enter the OAuth client secret"
														}
													/>
												</div>
												{provider.tenantLabel ? (
													<div className="space-y-2">
														<Label htmlFor={`${provider.id}-tenant-id`}>
															{provider.tenantLabel}
														</Label>
														<Input
															id={`${provider.id}-tenant-id`}
															value={draft.tenantId}
															onChange={(event) =>
																handleDraftChange(provider.id, { tenantId: event.target.value })
															}
															placeholder="Optional tenant identifier"
														/>
													</div>
												) : null}
											</div>

											<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
												{info?.clientId ? <span>Stored client ID: {info.clientId}</span> : null}
												{info?.tenantId ? <span>Tenant ID: {info.tenantId}</span> : null}
											</div>
										</div>

										<div className="flex min-w-[220px] flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
											<div className="flex items-center justify-between gap-4">
												<div className="space-y-1">
													<p className="text-sm font-medium">Expose on hosted auth</p>
													<p className="text-xs text-muted-foreground">
														Users can only sign in with this provider after credentials are saved
														for this project.
													</p>
												</div>
												<Switch
													checked={enabled}
													disabled={!isConfigured || !!togglingProviders[provider.id]}
													onCheckedChange={() => handleToggle(provider.id, enabled)}
												/>
											</div>

											<Button
												onClick={() => handleSave(provider.id)}
												disabled={isBusy || !draft.clientId.trim()}
											>
												{savingProvider === provider.id ? (
													<Loader2 className="size-4 animate-spin" />
												) : null}
												Save credentials
											</Button>

											<Button
												variant="outline"
												onClick={() => handleDelete(provider.id)}
												disabled={!isConfigured || isBusy}
											>
												{deletingProvider === provider.id ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<Trash2 className="size-4" />
												)}
												Remove credentials
											</Button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
