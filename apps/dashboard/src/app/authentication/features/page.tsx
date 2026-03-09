"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkeletonHeader, SkeletonMethodCard } from "@/components/ui/skeleton";
import { type DashboardConfig, getDashboardConfig, toggleFeature } from "@/lib/dashboard-api";
import { Globe, Languages, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface FeatureDef {
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	title: string;
	description: string;
	configKey: keyof DashboardConfig["features"];
	action: "manage" | "enable";
}

const featureDefs: FeatureDef[] = [
	{
		id: "hosted-ui",
		icon: Globe,
		iconColor: "text-cyan-400",
		title: "Hosted UI",
		description:
			"A pre-built, hosted authentication UI that handles sign-in, sign-up, and password reset flows.",
		configKey: "hostedUi",
		action: "manage",
	},
	{
		id: "sign-up",
		icon: UserPlus,
		iconColor: "text-green-400",
		title: "Sign-up",
		description: "Allow users to sign up and create new accounts in your application.",
		configKey: "signUp",
		action: "manage",
	},
	{
		id: "mfa",
		icon: ShieldCheck,
		iconColor: "text-amber-400",
		title: "Multi-factor auth",
		description: "Require non-SSO users to set up MFA for enhanced account security.",
		configKey: "mfa",
		action: "enable",
	},
	{
		id: "localization",
		icon: Languages,
		iconColor: "text-purple-400",
		title: "Localization",
		description: "Auto-display authentication UI in the user's browser language.",
		configKey: "localization",
		action: "manage",
	},
];

export default function FeaturesPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [togglingFeatures, setTogglingFeatures] = useState<Record<string, boolean>>({});

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		if (!activeProjectId) {
			setConfig(null);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		getDashboardConfig()
			.then(setConfig)
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setIsLoading(false));
	}, [activeProjectId, reportError]);

	const handleToggle = useCallback(
		async (configKey: keyof DashboardConfig["features"], currentlyEnabled: boolean) => {
			setTogglingFeatures((prev) => ({ ...prev, [configKey]: true }));
			try {
				const updatedConfig = await toggleFeature(configKey, !currentlyEnabled);
				setConfig(updatedConfig);
				toast.success("Feature updated");
			} catch {
				toast.error("Failed to update feature");
			} finally {
				setTogglingFeatures((prev) => ({ ...prev, [configKey]: false }));
			}
		},
		[],
	);

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid gap-4">
					{["feature-1", "feature-2", "feature-3", "feature-4"].map((key) => (
						<SkeletonMethodCard key={key} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Features</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Toggle and configure authentication features for your application.
				</p>
			</div>

			<div className="grid gap-4">
				{featureDefs.map((feature) => {
					const Icon = feature.icon;
					const enabled = config?.features[feature.configKey] ?? false;
					const details: { label: string; value: string }[] = [];
					if (feature.id === "hosted-ui" && enabled) {
						details.push({ label: "Hosted URL", value: "auth.your-app.com" });
					}
					if (feature.id === "localization" && enabled) {
						details.push({
							label: "Fallback language",
							value: "English (US)",
						});
					}
					return (
						<Card key={feature.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-4">
										<div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
											<Icon className={`size-5 ${feature.iconColor}`} />
										</div>
										<div className="space-y-1">
											<CardTitle className="text-sm">{feature.title}</CardTitle>
											<CardDescription className="max-w-md">{feature.description}</CardDescription>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant={enabled ? "default" : "secondary"}>
											{enabled ? "Enabled" : "Disabled"}
										</Badge>
										<Button
											variant="outline"
											size="sm"
											disabled={!!togglingFeatures[feature.configKey]}
											onClick={() => handleToggle(feature.configKey, enabled)}
										>
											{togglingFeatures[feature.configKey] ? (
												<Loader2 className="mr-1.5 size-3.5 animate-spin" />
											) : null}
											{enabled ? (feature.action === "manage" ? "Manage" : "Disable") : "Enable"}
										</Button>
									</div>
								</div>
							</CardHeader>
							{details.length > 0 && (
								<CardContent>
									<Separator className="mb-4" />
									<div className="flex gap-8">
										{details.map((detail) => (
											<div key={detail.label} className="space-y-0.5">
												<p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
													{detail.label}
												</p>
												<p className="text-sm font-medium">{detail.value}</p>
											</div>
										))}
									</div>
								</CardContent>
							)}
						</Card>
					);
				})}
			</div>
		</div>
	);
}
