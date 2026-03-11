"use client";

import { useBackendStatus } from "@/components/backend-status";
import { ProviderIcon, providerMeta } from "@/components/provider-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, Settings, Trash2 } from "lucide-react";
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
	const [managingProvider, setManagingProvider] = useState<string | null>(null);

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
				setManagingProvider(null);
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
				setManagingProvider(null);
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

	const managingProviderDef = providerDefs.find((p) => p.id === managingProvider);

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
					enable the providers you want to expose on the hosted auth flow.
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
							const enabled = config?.socialProviders[provider.id]?.enabled ?? false;
							const isConfigured = !!info;

							return (
								<div
									key={provider.id}
									className="flex items-center justify-between gap-4 px-6 py-4"
								>
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-full bg-muted">
											<ProviderIcon
												provider={provider.id}
												size={22}
												className={providerMeta[provider.id]?.color}
											/>
										</div>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-sm font-medium">{provider.name}</span>
												{isConfigured ? (
													<Badge variant="outline" className="text-[11px]">
														Configured
													</Badge>
												) : null}
											</div>
											<p className="text-xs text-muted-foreground">{provider.description}</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground">
												{enabled ? "On" : "Off"}
											</span>
											<Switch
												checked={enabled}
												disabled={!isConfigured || !!togglingProviders[provider.id]}
												onCheckedChange={() => handleToggle(provider.id, enabled)}
											/>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setManagingProvider(provider.id)}
										>
											<Settings className="size-4" />
											Manage
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Manage Provider Dialog */}
			<Dialog
				open={!!managingProvider}
				onOpenChange={(open) => {
					if (!open) setManagingProvider(null);
				}}
			>
				{managingProviderDef && (
					<DialogContent>
						<DialogHeader>
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-full bg-muted">
									<ProviderIcon
										provider={managingProviderDef.id}
										size={22}
										className={providerMeta[managingProviderDef.id]?.color}
									/>
								</div>
								<div>
									<DialogTitle>{managingProviderDef.name}</DialogTitle>
									<DialogDescription>{managingProviderDef.description}</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						{(() => {
							const providerId = managingProviderDef.id;
							const info = credentials[providerId];
							const draft = drafts[providerId] ?? {
								clientId: "",
								clientSecret: "",
								tenantId: "",
							};
							const isConfigured = !!info;
							const isBusy = savingProvider === providerId || deletingProvider === providerId;

							return (
								<div className="grid gap-4">
									{isConfigured && info?.clientId && (
										<div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
											<p className="text-xs text-muted-foreground">
												Stored client ID: <span className="font-mono">{info.clientId}</span>
											</p>
											{info?.tenantId && (
												<p className="text-xs text-muted-foreground">
													Tenant ID: <span className="font-mono">{info.tenantId}</span>
												</p>
											)}
										</div>
									)}

									<div className="grid gap-3">
										<div className="grid gap-2">
											<Label htmlFor={`${providerId}-client-id`}>Client ID</Label>
											<Input
												id={`${providerId}-client-id`}
												value={draft.clientId}
												onChange={(event) =>
													handleDraftChange(providerId, { clientId: event.target.value })
												}
												placeholder="Enter the OAuth client ID"
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor={`${providerId}-client-secret`}>Client secret</Label>
											<Input
												id={`${providerId}-client-secret`}
												type="password"
												value={draft.clientSecret}
												onChange={(event) =>
													handleDraftChange(providerId, { clientSecret: event.target.value })
												}
												placeholder={
													info?.hasClientSecret
														? "Stored securely. Enter a new secret to rotate."
														: "Enter the OAuth client secret"
												}
											/>
										</div>
										{managingProviderDef.tenantLabel && (
											<div className="grid gap-2">
												<Label htmlFor={`${providerId}-tenant-id`}>
													{managingProviderDef.tenantLabel}
												</Label>
												<Input
													id={`${providerId}-tenant-id`}
													value={draft.tenantId}
													onChange={(event) =>
														handleDraftChange(providerId, { tenantId: event.target.value })
													}
													placeholder="Optional tenant identifier"
												/>
											</div>
										)}
									</div>

									<DialogFooter className="gap-2 sm:justify-between">
										{isConfigured ? (
											<Button
												variant="outline"
												onClick={() => handleDelete(providerId)}
												disabled={isBusy}
												className="text-destructive hover:bg-destructive/10 hover:text-destructive"
											>
												{deletingProvider === providerId ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<Trash2 className="size-4" />
												)}
												Remove
											</Button>
										) : (
											<div />
										)}
										<Button
											onClick={() => handleSave(providerId)}
											disabled={isBusy || !draft.clientId.trim()}
										>
											{savingProvider === providerId ? (
												<Loader2 className="size-4 animate-spin" />
											) : null}
											Save credentials
										</Button>
									</DialogFooter>
								</div>
							);
						})()}
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}
