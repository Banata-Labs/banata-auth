"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { ProviderIcon, providerMeta } from "@/components/provider-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonHeader, SkeletonProviderRow } from "@/components/ui/skeleton";
import { type DashboardConfig, getDashboardConfig } from "@/lib/dashboard-api";
import { useEffect, useMemo, useState } from "react";

interface ProviderDef {
	id: string;
	name: string;
}

const providerDefs: ProviderDef[] = [
	{ id: "google", name: "Google" },
	{ id: "microsoft", name: "Microsoft" },
	{ id: "github", name: "GitHub" },
	{ id: "apple", name: "Sign in with Apple" },
	{ id: "gitlab", name: "GitLab" },
	{ id: "linkedin", name: "LinkedIn" },
	{ id: "discord", name: "Discord" },
	{ id: "twitter", name: "Twitter" },
	{ id: "slack", name: "Slack" },
];

export default function ProvidersPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		getDashboardConfig()
			.then(setConfig)
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setIsLoading(false));
	}, [activeProjectId, reportError]);

	const enabledCount = useMemo(
		() => Object.values(config?.socialProviders ?? {}).filter((provider) => provider.enabled).length,
		[config],
	);

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="rounded-lg border border-border">
					{Array.from({ length: 9 }, (_, i) => (
						<SkeletonProviderRow key={i} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Providers</h1>
				<p className="mt-1 max-w-3xl text-sm text-muted-foreground">
					Social OAuth availability is derived from your runtime Banata auth config and Convex
					environment variables. To change this list, update the provider credentials in your app
					configuration and redeploy.
				</p>
			</div>

			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					{enabledCount === 0 ? (
						<div className="px-6 py-8 text-sm text-muted-foreground">
							No social providers are configured in the current runtime.
						</div>
					) : null}
					<div className="divide-y divide-border">
						{providerDefs.map((provider) => {
							const info = config?.socialProviders[provider.id];
							const enabled = info?.enabled ?? false;
							const demo = info?.demo ?? false;
							return (
								<div key={provider.id} className="flex items-center justify-between gap-4 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex size-8 items-center justify-center rounded-full bg-muted">
											<ProviderIcon
												provider={provider.id}
												size={20}
												className={providerMeta[provider.id]?.color}
											/>
										</div>
										<div className="space-y-0.5">
											<div className="flex items-center gap-2.5">
												<span className="text-sm font-medium">{provider.name}</span>
												{demo ? (
													<Badge variant="outline" className="text-[10px]">
														Demo credentials
													</Badge>
												) : null}
											</div>
											<p className="text-xs text-muted-foreground">
												{enabled
													? "Configured in the current runtime."
													: "Not configured in the current runtime."}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant={enabled ? "default" : "secondary"}>
											{enabled ? "Enabled" : "Disabled"}
										</Badge>
										<Badge variant="outline">Managed in runtime</Badge>
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
