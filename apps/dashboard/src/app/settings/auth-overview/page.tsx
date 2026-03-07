"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	SkeletonCard,
	SkeletonHeader,
	SkeletonListRow,
	SkeletonStatCard,
} from "@/components/ui/skeleton";
import { type DashboardConfig, getDashboardConfig } from "@/lib/dashboard-api";
import {
	Check,
	KeyRound,
	Loader2,
	Lock,
	Mail,
	Shield,
	Smartphone,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MethodRow {
	label: string;
	key: string;
	enabled: boolean;
	icon: React.ComponentType<{ className?: string }>;
}

export default function AuthOverviewPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [loading, setLoading] = useState(true);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		getDashboardConfig()
			.then(setConfig)
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setLoading(false));
	}, [activeProjectId]);

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid grid-cols-3 gap-4">
					<SkeletonStatCard />
					<SkeletonStatCard />
					<SkeletonStatCard />
				</div>
				<SkeletonCard lines={0}>
					<div className="space-y-3">
						{Array.from({ length: 5 }, (_, i) => (
							<SkeletonListRow key={i} />
						))}
					</div>
				</SkeletonCard>
				<SkeletonCard lines={0}>
					<div className="space-y-3">
						{Array.from({ length: 3 }, (_, i) => (
							<SkeletonListRow key={i} />
						))}
					</div>
				</SkeletonCard>
				<SkeletonCard lines={0}>
					<div className="space-y-3">
						{Array.from({ length: 3 }, (_, i) => (
							<SkeletonListRow key={i} />
						))}
					</div>
				</SkeletonCard>
			</div>
		);
	}

	if (!config) {
		return (
			<div className="flex items-center justify-center py-24">
				<p className="text-sm text-muted-foreground">Failed to load configuration.</p>
			</div>
		);
	}

	const methods: MethodRow[] = [
		{
			label: "Email & Password",
			key: "emailPassword",
			enabled: config.authMethods.emailPassword,
			icon: Mail,
		},
		{
			label: "Magic Link",
			key: "magicLink",
			enabled: config.authMethods.magicLink,
			icon: Mail,
		},
		{
			label: "Email OTP",
			key: "emailOtp",
			enabled: config.authMethods.emailOtp,
			icon: KeyRound,
		},
		{
			label: "Passkey (WebAuthn)",
			key: "passkey",
			enabled: config.authMethods.passkey,
			icon: Smartphone,
		},
		{
			label: "Two-Factor Auth",
			key: "twoFactor",
			enabled: config.authMethods.twoFactor,
			icon: Shield,
		},
		{
			label: "Organizations",
			key: "organization",
			enabled: config.authMethods.organization,
			icon: Users,
		},
		{
			label: "Anonymous Users",
			key: "anonymous",
			enabled: config.authMethods.anonymous,
			icon: UserPlus,
		},
		{
			label: "Username",
			key: "username",
			enabled: config.authMethods.username,
			icon: UserPlus,
		},
		{
			label: "Enterprise SSO",
			key: "sso",
			enabled: config.authMethods.sso,
			icon: Lock,
		},
	];

	const enabledCount = methods.filter((m) => m.enabled).length;
	const socialProviderEntries = Object.entries(config.socialProviders).filter(([, v]) => v.enabled);

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Auth Overview</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					A read-only summary of enabled authentication methods and providers. Configure these in
					the{" "}
					<a
						href="/authentication/methods"
						className="text-primary underline underline-offset-4 hover:text-primary/80"
					>
						Authentication
					</a>{" "}
					section.
				</p>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardDescription>Auth Methods</CardDescription>
						<CardTitle className="text-3xl tracking-tight">{enabledCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Social Providers</CardDescription>
						<CardTitle className="text-3xl tracking-tight">
							{socialProviderEntries.length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Features</CardDescription>
						<CardTitle className="text-3xl tracking-tight">
							{Object.values(config.features).filter(Boolean).length}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Auth Methods */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Authentication Methods</CardTitle>
					<CardDescription>
						{enabledCount} of {methods.length} methods are enabled.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{methods.map((method) => {
							const Icon = method.icon;
							return (
								<div key={method.key} className="flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<Icon className="size-4 text-muted-foreground" />
										<span className="text-sm">{method.label}</span>
									</div>
									{method.enabled ? (
										<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
											<Check className="mr-1 size-3" />
											Enabled
										</Badge>
									) : (
										<Badge variant="secondary" className="text-muted-foreground">
											<X className="mr-1 size-3" />
											Disabled
										</Badge>
									)}
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Social Providers */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Social Providers</CardTitle>
					<CardDescription>
						{socialProviderEntries.length > 0
							? `${socialProviderEntries.length} provider${socialProviderEntries.length > 1 ? "s" : ""} enabled.`
							: "No social providers configured."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{socialProviderEntries.length > 0 ? (
						<div className="space-y-3">
							{socialProviderEntries.map(([provider, providerConfig]) => (
								<div key={provider} className="flex items-center justify-between">
									<span className="text-sm capitalize">{provider}</span>
									<div className="flex items-center gap-2">
										{providerConfig.demo && (
											<Badge
												variant="outline"
												className="text-xs text-amber-400 border-amber-500/30"
											>
												Demo
											</Badge>
										)}
										<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
											<Check className="mr-1 size-3" />
											Enabled
										</Badge>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground py-4 text-center">
							No social providers have been configured. Visit{" "}
							<a
								href="/authentication/providers"
								className="text-primary underline underline-offset-4"
							>
								Providers
							</a>{" "}
							to set them up.
						</p>
					)}
				</CardContent>
			</Card>

			{/* Session Config */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Session Configuration</CardTitle>
					<CardDescription>Current session lifetime and token settings.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Max Session Length</p>
							<p className="text-sm font-mono">{config.sessions.maxSessionLength}</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Access Token Duration</p>
							<p className="text-sm font-mono">{config.sessions.accessTokenDuration}</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Inactivity Timeout</p>
							<p className="text-sm font-mono">{config.sessions.inactivityTimeout}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
