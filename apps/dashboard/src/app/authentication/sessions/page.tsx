"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SkeletonHeader, SkeletonMethodCard } from "@/components/ui/skeleton";
import { type DashboardConfig, getDashboardConfig, saveDashboardConfig } from "@/lib/dashboard-api";
import { Clock, FileCode2, Globe, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SessionsPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [editingCard, setEditingCard] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [editValues, setEditValues] = useState<Record<string, string>>({});

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		getDashboardConfig()
			.then(setConfig)
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setIsLoading(false));
	}, [activeProjectId]);

	const startEditing = (cardId: string) => {
		if (cardId === "session-lifetime" && config?.sessions) {
			setEditValues({
				maxSessionLength: config.sessions.maxSessionLength ?? "7d",
				accessTokenDuration: config.sessions.accessTokenDuration ?? "15m",
				inactivityTimeout: config.sessions.inactivityTimeout ?? "2d",
			});
		}
		setEditingCard(cardId);
	};

	const cancelEditing = () => {
		setEditingCard(null);
		setEditValues({});
	};

	const handleSave = async () => {
		if (editingCard !== "session-lifetime") return;
		setIsSaving(true);
		try {
			const updatedConfig = await saveDashboardConfig({
				sessions: {
					...config!.sessions,
					maxSessionLength: editValues.maxSessionLength ?? "",
					accessTokenDuration: editValues.accessTokenDuration ?? "",
					inactivityTimeout: editValues.inactivityTimeout ?? "",
				},
			});
			setConfig(updatedConfig);
			setEditingCard(null);
			setEditValues({});
			toast.success("Session settings saved");
		} catch {
			toast.error("Failed to save session settings");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<SkeletonMethodCard key={i} />
					))}
				</div>
			</div>
		);
	}

	const sessions = config?.sessions;

	const sessionConfigs = [
		{
			id: "session-lifetime",
			icon: Clock,
			iconColor: "text-blue-400",
			title: "Session lifetime",
			description: "Configure how long sessions remain active and when they expire.",
			details: [
				{
					label: "Max session length",
					value: sessions?.maxSessionLength ?? "7 days",
				},
				{
					label: "Access token duration",
					value: sessions?.accessTokenDuration ?? "15 minutes",
				},
				{
					label: "Inactivity timeout",
					value: sessions?.inactivityTimeout ?? "2 days",
				},
			],
		},
		{
			id: "jwt-template",
			icon: FileCode2,
			iconColor: "text-emerald-400",
			title: "JWT template",
			description: "Augment session tokens with custom metadata and claims.",
			details: [] as { label: string; value: string }[],
		},
		{
			id: "cors",
			icon: Globe,
			iconColor: "text-orange-400",
			title: "Cross-Origin Resource Sharing (CORS)",
			description: "Define which web origins can interact with the API.",
			details: [
				{
					label: "Allowed web origins",
					value:
						sessions?.corsOrigins && sessions.corsOrigins.length > 0
							? sessions.corsOrigins.join(", ")
							: "None",
				},
			],
		},
	];

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Configure session behavior, token templates, and CORS policies.
				</p>
			</div>

			<div className="grid gap-4">
				{sessionConfigs.map((cfg) => {
					const Icon = cfg.icon;
					const isEditing = editingCard === cfg.id;
					const isEditable = cfg.id === "session-lifetime";
					return (
						<Card key={cfg.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-4">
										<div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
											<Icon className={`size-5 ${cfg.iconColor}`} />
										</div>
										<div className="space-y-1">
											<CardTitle className="text-sm">{cfg.title}</CardTitle>
											<CardDescription className="max-w-md">{cfg.description}</CardDescription>
										</div>
									</div>
									{isEditing ? (
										<div className="flex items-center gap-2">
											<Button variant="ghost" size="sm" disabled={isSaving} onClick={cancelEditing}>
												Cancel
											</Button>
											<Button size="sm" disabled={isSaving} onClick={handleSave}>
												{isSaving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
												Save
											</Button>
										</div>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={isEditable ? () => startEditing(cfg.id) : undefined}
										>
											Manage
										</Button>
									)}
								</div>
							</CardHeader>
							{isEditing && cfg.id === "session-lifetime" ? (
								<CardContent>
									<Separator className="mb-4" />
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
										{[
											{ key: "maxSessionLength", label: "Max session length" },
											{ key: "accessTokenDuration", label: "Access token duration" },
											{ key: "inactivityTimeout", label: "Inactivity timeout" },
										].map((field) => (
											<div key={field.key} className="space-y-1.5">
												<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
													{field.label}
												</label>
												<Input
													value={editValues[field.key] ?? ""}
													placeholder="e.g. 7d, 1h, 15m"
													disabled={isSaving}
													onChange={(e) =>
														setEditValues((prev) => ({
															...prev,
															[field.key]: e.target.value,
														}))
													}
												/>
											</div>
										))}
									</div>
								</CardContent>
							) : cfg.details.length > 0 ? (
								<CardContent>
									<Separator className="mb-4" />
									<div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
										{cfg.details.map((detail) => (
											<div key={detail.label} className="space-y-0.5">
												<p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
													{detail.label}
												</p>
												<p className="text-sm font-medium">{detail.value}</p>
											</div>
										))}
									</div>
								</CardContent>
							) : null}
						</Card>
					);
				})}
			</div>
		</div>
	);
}
