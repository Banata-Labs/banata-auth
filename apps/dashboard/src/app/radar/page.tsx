"use client";

import { useBackendStatus } from "@/components/backend-status";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton, SkeletonCard, SkeletonStatCard } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type BotProvider,
	type BotProviderCredentials,
	type RadarConfig,
	getRadarConfig,
	saveRadarConfig,
} from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Check,
	CheckCircle2,
	ExternalLink,
	Info,
	Key,
	LineChart,
	Loader2,
	Radar as RadarIcon,
	Shield,
	ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const features = [
	"Blocks impossible travel",
	"Detections tailored to your app",
	"Advanced device fingerprinting",
	"Combine signals with Actions",
];

function getDefaultConfig(): RadarConfig {
	return {
		enabled: false,
		blockImpossibleTravel: true,
		deviceFingerprinting: true,
		rateLimiting: false,
		botDetection: false,
		botProvider: null,
		botProviderCredentials: {},
	};
}

interface DetectionStat {
	label: string;
	value: number;
	color: string;
}

interface BotProviderInfo {
	id: BotProvider;
	name: string;
	description: string;
	docsUrl: string;
	fields: { key: keyof BotProviderCredentials; label: string; placeholder: string }[];
}

const BOT_PROVIDERS: BotProviderInfo[] = [
	{
		id: "botid",
		name: "Vercel BotID",
		description:
			"Invisible CAPTCHA by Vercel. No user friction, works automatically on Vercel deployments.",
		docsUrl: "https://vercel.com/docs/security/bot-protection",
		fields: [{ key: "apiKey", label: "BotID API Key", placeholder: "botid_..." }],
	},
	{
		id: "turnstile",
		name: "Cloudflare Turnstile",
		description:
			"Privacy-focused CAPTCHA alternative by Cloudflare. Works on any hosting provider.",
		docsUrl: "https://developers.cloudflare.com/turnstile/",
		fields: [
			{ key: "siteKey", label: "Site Key", placeholder: "0x..." },
			{ key: "secretKey", label: "Secret Key", placeholder: "0x..." },
		],
	},
	{
		id: "recaptcha",
		name: "Google reCAPTCHA",
		description: "Google's bot detection service. Supports invisible and v3 challenge modes.",
		docsUrl: "https://developers.google.com/recaptcha",
		fields: [
			{ key: "siteKey", label: "Site Key", placeholder: "6L..." },
			{ key: "secretKey", label: "Secret Key", placeholder: "6L..." },
		],
	},
	{
		id: "hcaptcha",
		name: "hCaptcha",
		description: "Privacy-first CAPTCHA service. Drop-in reCAPTCHA replacement.",
		docsUrl: "https://docs.hcaptcha.com/",
		fields: [
			{ key: "siteKey", label: "Site Key", placeholder: "your-site-key" },
			{ key: "secretKey", label: "Secret Key", placeholder: "0x..." },
		],
	},
];

export default function RadarPage() {
	const activeProjectId = useActiveProjectId();
	const [config, setConfig] = useState<RadarConfig>(getDefaultConfig);
	const [loading, setLoading] = useState(true);
	const [chartType, setChartType] = useState<"bar" | "line">("bar");
	const [savingCredentials, setSavingCredentials] = useState(false);
	const [credentialsSaved, setCredentialsSaved] = useState(false);

	// Local credential editing state
	const [editCredentials, setEditCredentials] = useState<BotProviderCredentials>({});

	const { reportError } = useBackendStatus();

	useEffect(() => {
		getRadarConfig()
			.then((data) => {
				setConfig(data);
				setEditCredentials(data.botProviderCredentials ?? {});
			})
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setLoading(false));
	}, [activeProjectId]);

	const updateConfig = useCallback(
		async (updates: Partial<RadarConfig>) => {
			const optimistic = { ...config, ...updates };
			setConfig(optimistic);
			try {
				const saved = await saveRadarConfig(updates);
				setConfig(saved);
				toast.success("Radar configuration saved");
			} catch {
				setConfig(config);
				toast.error("Failed to save Radar configuration");
			}
		},
		[config],
	);

	const toggleProtection = () => {
		updateConfig({ enabled: !config.enabled });
	};

	const handleProviderChange = (value: string) => {
		const provider = value === "none" ? null : (value as BotProvider);
		setEditCredentials({});
		updateConfig({ botProvider: provider, botProviderCredentials: {} });
	};

	const handleSaveCredentials = useCallback(async () => {
		setSavingCredentials(true);
		try {
			const saved = await saveRadarConfig({ botProviderCredentials: editCredentials });
			setConfig(saved);
			setEditCredentials(saved.botProviderCredentials ?? {});
			setCredentialsSaved(true);
			setTimeout(() => setCredentialsSaved(false), 2000);
			toast.success("Bot provider credentials saved");
		} catch {
			toast.error("Failed to save credentials");
		} finally {
			setSavingCredentials(false);
		}
	}, [editCredentials]);

	const selectedProvider = BOT_PROVIDERS.find((p) => p.id === config.botProvider);

	const detectionStats: DetectionStat[] = [
		{ label: "Total Detections", value: 0, color: "text-foreground" },
		{ label: "Allowed", value: 0, color: "text-emerald-400" },
		{ label: "Challenged", value: 0, color: "text-amber-400" },
		{ label: "Blocked", value: 0, color: "text-red-400" },
	];

	if (loading) {
		return (
			<div className="grid gap-6">
				{/* Hero card skeleton */}
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center gap-3 mb-4">
						<Skeleton className="size-10 rounded-lg" />
						<Skeleton className="h-7 w-24" />
					</div>
					<Skeleton className="mb-2 h-5 w-72" />
					<Skeleton className="mb-4 h-4 w-96" />
					<Skeleton className="h-9 w-40 rounded-md" />
				</div>
				{/* Tab bar skeleton */}
				<Skeleton className="h-9 w-56 rounded-md" />
				{/* Stats row */}
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<SkeletonStatCard />
					<SkeletonStatCard />
					<SkeletonStatCard />
					<SkeletonStatCard />
				</div>
				{/* Chart card */}
				<SkeletonCard lines={0} className="h-64" />
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			{/* Hero Section */}
			<Card
				className={cn(
					"border-0 bg-gradient-to-br via-transparent",
					config.enabled
						? "from-emerald-500/10 to-green-500/10"
						: "from-violet-500/10 to-blue-500/10",
				)}
			>
				<CardContent>
					<div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex size-10 items-center justify-center rounded-lg",
										config.enabled ? "bg-emerald-500/20" : "bg-violet-500/20",
									)}
								>
									{config.enabled ? (
										<ShieldCheck className="size-5 text-emerald-400" />
									) : (
										<RadarIcon className="size-5 text-violet-400" />
									)}
								</div>
								<div className="flex items-center gap-3">
									<h1 className="text-2xl font-semibold tracking-tight">Radar</h1>
									{config.enabled && (
										<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
											Protection enabled
										</Badge>
									)}
								</div>
							</div>
							<div className="space-y-2">
								<h2 className="text-lg font-medium">
									{config.enabled
										? "Your application is protected"
										: "Protect against bots, fraud, and abuse"}
								</h2>
								<p className="max-w-lg text-sm text-muted-foreground">
									{config.enabled
										? "Radar is actively monitoring authentication attempts. Connect to a real threat detection service for live stats."
										: "Radar uses advanced machine learning and device fingerprinting to detect and prevent fraudulent authentication attempts in real-time."}
								</p>
							</div>
							{!config.enabled && (
								<ul className="space-y-2">
									{features.map((feature) => (
										<li key={feature} className="flex items-center gap-2 text-sm">
											<CheckCircle2 className="size-4 text-emerald-400" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							)}
							<div className="flex items-center gap-3 pt-2">
								<Button onClick={toggleProtection} variant={config.enabled ? "outline" : "default"}>
									<Shield className="size-4" />
									{config.enabled ? "Disable protection" : "Enable protection"}
								</Button>
								<Button variant="ghost" size="sm" asChild>
									<a href="https://vercel.com/docs/botid" target="_blank" rel="noopener noreferrer">
										Learn more
										<ExternalLink className="size-3.5" />
									</a>
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="configuration">Configuration</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-4">
					<div className="grid gap-4">
						{/* Detection Stats */}
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							{detectionStats.map((stat) => (
								<Card key={stat.label}>
									<CardHeader>
										<CardDescription>{stat.label}</CardDescription>
										<CardTitle className={cn("text-3xl tracking-tight", stat.color)}>
											{stat.value}
										</CardTitle>
									</CardHeader>
								</Card>
							))}
						</div>

						{config.enabled && config.botProvider && (
							<div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
								<Info className="size-4 shrink-0 text-blue-400" />
								<p className="text-sm text-blue-300">
									Bot detection powered by{" "}
									<strong>{selectedProvider?.name ?? config.botProvider}</strong>. Bot detection is
									enforced on sign-in and sign-up routes.
								</p>
							</div>
						)}

						{config.enabled && !config.botProvider && (
							<div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
								<Info className="size-4 shrink-0 text-amber-400" />
								<p className="text-sm text-amber-300">
									No bot detection provider configured. Go to the <strong>Configuration</strong> tab
									to select a provider and add your credentials.
								</p>
							</div>
						)}

						{/* Chart area */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-sm">Detection Activity</CardTitle>
									<div className="flex items-center rounded-lg border p-0.5">
										<button
											type="button"
											onClick={() => setChartType("bar")}
											className={cn(
												"rounded-md p-1.5 transition-colors",
												chartType === "bar"
													? "bg-muted text-foreground"
													: "text-muted-foreground hover:text-foreground",
											)}
										>
											<BarChart3 className="size-4" />
										</button>
										<button
											type="button"
											onClick={() => setChartType("line")}
											className={cn(
												"rounded-md p-1.5 transition-colors",
												chartType === "line"
													? "bg-muted text-foreground"
													: "text-muted-foreground hover:text-foreground",
											)}
										>
											<LineChart className="size-4" />
										</button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col items-center justify-center py-16">
									<div className="flex size-12 items-center justify-center rounded-full bg-muted">
										{chartType === "bar" ? (
											<BarChart3 className="size-6 text-muted-foreground" />
										) : (
											<LineChart className="size-6 text-muted-foreground" />
										)}
									</div>
									<h3 className="mt-4 text-sm font-medium">
										{config.enabled ? "Waiting for data" : "No detections yet"}
									</h3>
									<p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
										{config.enabled
											? "Radar is active and monitoring. Detection data will appear here once events are processed."
											: "Enable Radar protection to start monitoring authentication attempts for suspicious activity."}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="configuration" className="mt-4">
					{!config.enabled ? (
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Radar Configuration</CardTitle>
								<CardDescription>Configure detection rules and response actions.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col items-center justify-center py-12">
									<p className="text-sm text-muted-foreground">
										Enable Radar to configure detection settings.
									</p>
									<Button className="mt-4" variant="outline" size="sm" onClick={toggleProtection}>
										<Shield className="size-4" />
										Enable protection
									</Button>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{/* Detection Rules */}
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Detection Rules</CardTitle>
									<CardDescription>
										Configure which detection mechanisms are active.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<Label>Impossible travel detection</Label>
												<p className="text-xs text-muted-foreground">
													Flag sign-ins from geographically impossible locations within short time
													windows.
												</p>
											</div>
											<Switch
												checked={config.blockImpossibleTravel}
												onCheckedChange={(checked) =>
													updateConfig({
														blockImpossibleTravel: checked,
													})
												}
											/>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<Label>Device fingerprinting</Label>
												<p className="text-xs text-muted-foreground">
													Track device characteristics to identify suspicious sign-in patterns.
												</p>
											</div>
											<Switch
												checked={config.deviceFingerprinting}
												onCheckedChange={(checked) =>
													updateConfig({
														deviceFingerprinting: checked,
													})
												}
											/>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<Label>Rate limiting</Label>
												<p className="text-xs text-muted-foreground">
													Limit authentication attempts from a single IP address or user account.
												</p>
											</div>
											<Switch
												checked={config.rateLimiting}
												onCheckedChange={(checked) => updateConfig({ rateLimiting: checked })}
											/>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<Label>Bot detection</Label>
												<p className="text-xs text-muted-foreground">
													Use behavioral analysis to detect automated sign-in attempts.
												</p>
											</div>
											<Switch
												checked={config.botDetection}
												onCheckedChange={(checked) => updateConfig({ botDetection: checked })}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Bot Detection Provider */}
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Key className="size-4 text-muted-foreground" />
										<div>
											<CardTitle className="text-sm">Bot Detection Provider</CardTitle>
											<CardDescription>
												Select a bot detection provider and supply your credentials. These are used
												by{" "}
												<code className="rounded bg-muted px-1 py-0.5 text-xs">
													@banata-auth/nextjs/bot-protection
												</code>{" "}
												to verify requests.
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="grid gap-2">
											<Label>Provider</Label>
											<Select
												value={config.botProvider ?? "none"}
												onValueChange={handleProviderChange}
											>
												<SelectTrigger className="w-[280px]">
													<SelectValue placeholder="Select a provider..." />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{BOT_PROVIDERS.map((provider) => (
														<SelectItem key={provider.id} value={provider.id!}>
															{provider.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{selectedProvider && (
											<>
												<div className="rounded-lg border bg-muted/30 px-4 py-3">
													<p className="text-sm text-muted-foreground">
														{selectedProvider.description}
													</p>
													<a
														href={selectedProvider.docsUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
													>
														View provider docs
														<ExternalLink className="size-3" />
													</a>
												</div>

												<Separator />

												<div className="space-y-3">
													{selectedProvider.fields.map((field) => (
														<div key={field.key} className="grid gap-2">
															<Label htmlFor={`cred-${field.key}`}>{field.label}</Label>
															<Input
																id={`cred-${field.key}`}
																type="password"
																value={editCredentials[field.key] ?? ""}
																onChange={(e) =>
																	setEditCredentials((prev) => ({
																		...prev,
																		[field.key]: e.target.value,
																	}))
																}
																placeholder={field.placeholder}
																className="font-mono text-sm"
															/>
														</div>
													))}
												</div>

												<div className="flex items-center gap-3">
													<Button
														onClick={handleSaveCredentials}
														disabled={savingCredentials}
														size="sm"
													>
														{savingCredentials ? (
															<>
																<Loader2 className="size-4 animate-spin" />
																Saving...
															</>
														) : credentialsSaved ? (
															<>
																<Check className="size-4" />
																Saved
															</>
														) : (
															"Save credentials"
														)}
													</Button>
													<p className="text-xs text-muted-foreground">
														Credentials are stored securely and never exposed via the API.
													</p>
												</div>
											</>
										)}
									</div>
								</CardContent>
							</Card>

							<div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
								<Info className="size-4 shrink-0 text-blue-400" />
								<p className="text-sm text-blue-300">
									{config.botProvider
										? `Bot detection is powered by ${selectedProvider?.name ?? config.botProvider}. Use the @banata-auth/nextjs/bot-protection package to enforce verification on your auth routes.`
										: "Select a bot detection provider above to enable invisible bot protection on your auth routes. No user friction — the challenge runs automatically in the background."}
								</p>
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
