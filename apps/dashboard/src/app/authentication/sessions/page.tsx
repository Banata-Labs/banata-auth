"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SkeletonHeader, SkeletonMethodCard } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { type DashboardConfig, getDashboardConfig, saveDashboardConfig } from "@/lib/dashboard-api";
import { Clock, FileCode2, Globe, Loader2, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SessionConfigCard {
	id: string;
	icon: LucideIcon;
	iconColor: string;
	title: string;
	description: string;
	details: { label: string; value: string }[];
}

function parseCorsOrigins(raw: string | undefined): string[] {
	return raw
		? raw
				.split(/\r?\n|,/)
				.map((origin) => origin.trim())
				.filter(Boolean)
		: [];
}

function buildSessionsPatch(
	config: DashboardConfig | null,
	editingCard: string,
	editValues: Record<string, string>,
) {
	const baseSessions = {
		maxSessionLength: config?.sessions?.maxSessionLength ?? "7d",
		accessTokenDuration: config?.sessions?.accessTokenDuration ?? "15m",
		inactivityTimeout: config?.sessions?.inactivityTimeout ?? "2d",
		corsOrigins: config?.sessions?.corsOrigins ?? [],
	};

	if (editingCard === "cors") {
		return {
			...baseSessions,
			corsOrigins: parseCorsOrigins(editValues.corsOrigins),
		};
	}

	return {
		...baseSessions,
		maxSessionLength: editValues.maxSessionLength ?? "",
		accessTokenDuration: editValues.accessTokenDuration ?? "",
		inactivityTimeout: editValues.inactivityTimeout ?? "",
	};
}

function SessionConfigCardView({
	cfg,
	isEditing,
	isSaving,
	editValues,
	onStartEditing,
	onCancelEditing,
	onSave,
	onEditValue,
}: {
	cfg: SessionConfigCard;
	isEditing: boolean;
	isSaving: boolean;
	editValues: Record<string, string>;
	onStartEditing: (id: string) => void;
	onCancelEditing: () => void;
	onSave: () => void;
	onEditValue: (key: string, value: string) => void;
}) {
	const Icon = cfg.icon;
	const isEditable = cfg.id === "session-lifetime" || cfg.id === "cors";

	return (
		<Card>
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
							<Button variant="ghost" size="sm" disabled={isSaving} onClick={onCancelEditing}>
								Cancel
							</Button>
							<Button size="sm" disabled={isSaving} onClick={onSave}>
								{isSaving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
								Save
							</Button>
						</div>
					) : (
						<Button
							variant="outline"
							size="sm"
							disabled={!isEditable}
							onClick={isEditable ? () => onStartEditing(cfg.id) : undefined}
						>
							{isEditable ? "Manage" : "Coming soon"}
						</Button>
					)}
				</div>
			</CardHeader>
			<SessionConfigCardContent
				cfg={cfg}
				isEditing={isEditing}
				isSaving={isSaving}
				editValues={editValues}
				onEditValue={onEditValue}
			/>
		</Card>
	);
}

function SessionConfigCardContent({
	cfg,
	isEditing,
	isSaving,
	editValues,
	onEditValue,
}: {
	cfg: SessionConfigCard;
	isEditing: boolean;
	isSaving: boolean;
	editValues: Record<string, string>;
	onEditValue: (key: string, value: string) => void;
}) {
	if (isEditing && cfg.id === "session-lifetime") {
		return (
			<CardContent>
				<Separator className="mb-4" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{[
						{ key: "maxSessionLength", label: "Max session length" },
						{ key: "accessTokenDuration", label: "Access token duration" },
						{ key: "inactivityTimeout", label: "Inactivity timeout" },
					].map((field) => (
						<div key={field.key} className="space-y-1.5">
							<label
								htmlFor={`session-${field.key}`}
								className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60"
							>
								{field.label}
							</label>
							<Input
								id={`session-${field.key}`}
								value={editValues[field.key] ?? ""}
								placeholder="e.g. 7d, 1h, 15m"
								disabled={isSaving}
								onChange={(e) => onEditValue(field.key, e.target.value)}
							/>
						</div>
					))}
				</div>
			</CardContent>
		);
	}

	if (isEditing && cfg.id === "cors") {
		return (
			<CardContent>
				<Separator className="mb-4" />
				<div className="space-y-1.5">
					<label
						htmlFor="session-cors-origins"
						className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60"
					>
						Allowed web origins
					</label>
					<Textarea
						id="session-cors-origins"
						value={editValues.corsOrigins ?? ""}
						placeholder="https://app.example.com"
						disabled={isSaving}
						rows={5}
						onChange={(e) => onEditValue("corsOrigins", e.target.value)}
					/>
				</div>
			</CardContent>
		);
	}

	if (cfg.details.length === 0) return null;

	return (
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
	);
}

export default function SessionsPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [editingCard, setEditingCard] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [editValues, setEditValues] = useState<Record<string, string>>({});

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

	const startEditing = (cardId: string) => {
		if (cardId === "session-lifetime" && config?.sessions) {
			setEditValues({
				maxSessionLength: config.sessions.maxSessionLength ?? "7d",
				accessTokenDuration: config.sessions.accessTokenDuration ?? "15m",
				inactivityTimeout: config.sessions.inactivityTimeout ?? "2d",
			});
		}
		if (cardId === "cors") {
			setEditValues({
				corsOrigins: (config?.sessions?.corsOrigins ?? []).join("\n"),
			});
		}
		setEditingCard(cardId);
	};

	const cancelEditing = () => {
		setEditingCard(null);
		setEditValues({});
	};

	const handleSave = async () => {
		if (editingCard !== "session-lifetime" && editingCard !== "cors") return;
		setIsSaving(true);
		try {
			const updatedConfig = await saveDashboardConfig({
				sessions: buildSessionsPatch(config, editingCard, editValues),
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
					{["session-config-1", "session-config-2", "session-config-3"].map((key) => (
						<SkeletonMethodCard key={key} />
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
					return (
						<SessionConfigCardView
							key={cfg.id}
							cfg={cfg}
							isEditing={editingCard === cfg.id}
							isSaving={isSaving}
							editValues={editValues}
							onStartEditing={startEditing}
							onCancelEditing={cancelEditing}
							onSave={handleSave}
							onEditValue={(key, value) =>
								setEditValues((prev) => ({
									...prev,
									[key]: value,
								}))
							}
						/>
					);
				})}
			</div>
		</div>
	);
}
