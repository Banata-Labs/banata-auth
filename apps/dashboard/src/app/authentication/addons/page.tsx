"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonHeader, SkeletonMethodCard } from "@/components/ui/skeleton";
import { getAddonConfig, saveAddonConfig } from "@/lib/dashboard-api";
import { Activity, BarChart3, Cable, CreditCard, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ── Static addon definitions ─────────────────────────────────────────

interface AddonDef {
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	title: string;
	description: string;
}

const ADDONS: AddonDef[] = [
	{
		id: "google-analytics",
		icon: BarChart3,
		iconColor: "text-amber-400",
		title: "Google Analytics",
		description:
			"Attribute sign-ups to traffic sources and measure authentication funnel performance.",
	},
	{
		id: "segment",
		icon: Cable,
		iconColor: "text-green-400",
		title: "Segment",
		description: "Send AuthKit events to Segment destinations for centralized analytics.",
	},
	{
		id: "stripe",
		icon: CreditCard,
		iconColor: "text-violet-400",
		title: "Stripe",
		description:
			"Provision access tokens with entitlements and sync seat counts to Stripe subscriptions.",
	},
	{
		id: "posthog",
		icon: Activity,
		iconColor: "text-blue-400",
		title: "PostHog",
		description: "Send AuthKit events to PostHog for product analytics and feature flagging.",
	},
];

// ── Page component ───────────────────────────────────────────────────

export default function AddonsPage() {
	const [addonStates, setAddonStates] = useState<Record<string, { enabled: boolean }>>({});
	const [loading, setLoading] = useState(true);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	// Fetch addon config on mount
	useEffect(() => {
		if (!activeProjectId) {
			setAddonStates({});
			setLoading(false);
			return;
		}

		setLoading(true);
		getAddonConfig()
			.then((config) => setAddonStates(config.addons ?? {}))
			.catch((err) => reportError(err))
			.finally(() => setLoading(false));
	}, [activeProjectId, reportError]);

	const handleToggle = useCallback(
		async (addonId: string) => {
			const currentEnabled = addonStates[addonId]?.enabled ?? false;
			const newEnabled = !currentEnabled;

			setTogglingId(addonId);
			try {
				const updated = await saveAddonConfig({
					[addonId]: { enabled: newEnabled },
				});
				setAddonStates(updated.addons ?? {});
				toast.success(
					`${ADDONS.find((a) => a.id === addonId)?.title ?? addonId} ${newEnabled ? "enabled" : "disabled"}`,
				);
			} catch {
				toast.error("Failed to update addon configuration");
			} finally {
				setTogglingId(null);
			}
		},
		[addonStates],
	);

	// ── Loading state ────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid gap-4">
					{["addon-1", "addon-2", "addon-3", "addon-4"].map((key) => (
						<SkeletonMethodCard key={key} />
					))}
				</div>
			</div>
		);
	}

	// ── Render ───────────────────────────────────────────────────────

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Add-ons</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Connect third-party integrations to extend authentication capabilities.
				</p>
			</div>

			<div className="grid gap-4">
				{ADDONS.map((addon) => {
					const Icon = addon.icon;
					const enabled = addonStates[addon.id]?.enabled ?? false;
					const isToggling = togglingId === addon.id;

					return (
						<Card key={addon.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-4">
										<div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
											<Icon className={`size-5 ${addon.iconColor}`} />
										</div>
										<div className="space-y-1">
											<CardTitle className="text-sm">{addon.title}</CardTitle>
											<CardDescription className="max-w-md">{addon.description}</CardDescription>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant={enabled ? "default" : "secondary"}>
											{enabled ? "Enabled" : "Disabled"}
										</Badge>
										<Button
											variant="outline"
											size="sm"
											disabled={isToggling}
											onClick={() => handleToggle(addon.id)}
										>
											{isToggling && <Loader2 className="mr-2 size-3 animate-spin" />}
											{enabled ? "Disable" : "Enable"}
										</Button>
									</div>
								</div>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
