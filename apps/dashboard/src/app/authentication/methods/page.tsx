"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonHeader, SkeletonMethodCard } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	type DashboardConfig,
	getDashboardConfig,
	toggleAuthMethod,
} from "@/lib/dashboard-api";
import { Fingerprint, KeyRound, Loader2, Mail, Shield, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthMethod {
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	title: string;
	description: string;
	configKey: keyof DashboardConfig["authMethods"];
	comingSoon?: boolean;
}

const methodDefs: AuthMethod[] = [
	{
		id: "sso",
		icon: Shield,
		iconColor: "text-blue-400",
		title: "Single Sign-On",
		description:
			"Enterprise SSO via SAML and OIDC protocols. Connect to identity providers like Okta, Microsoft Entra ID, and Google Workspace.",
		configKey: "sso",
	},
	{
		id: "email-password",
		icon: KeyRound,
		iconColor: "text-emerald-400",
		title: "Email + Password",
		description:
			"Traditional email and password authentication with configurable security policies.",
		configKey: "emailPassword",
	},
	{
		id: "passkeys",
		icon: Fingerprint,
		iconColor: "text-violet-400",
		title: "Passkeys",
		description:
			"Passwordless authentication using biometrics, security keys, or platform authenticators via WebAuthn.",
		configKey: "passkey",
	},
	{
		id: "magic-link",
		icon: Sparkles,
		iconColor: "text-amber-400",
		title: "Magic Link",
		description: "Send a one-time login link to the user's email address for passwordless sign-in.",
		configKey: "magicLink",
	},
	{
		id: "email-otp",
		icon: Mail,
		iconColor: "text-pink-400",
		title: "Email OTP",
		description:
			"Send a one-time passcode to the user's email for verification-based authentication.",
		configKey: "emailOtp",
	},
];

export default function MethodsPage() {
	const [config, setConfig] = useState<DashboardConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [togglingMethods, setTogglingMethods] = useState<Record<string, boolean>>({});

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

	const handleToggle = useCallback(
		async (method: keyof DashboardConfig["authMethods"], enabled: boolean) => {
			setTogglingMethods((prev) => ({ ...prev, [method]: true }));
			try {
				const updatedConfig = await toggleAuthMethod(method, !enabled);
				setConfig(updatedConfig);
				toast.success("Authentication method updated");
			} catch (error) {
				reportError(error);
				toast.error("Failed to update authentication method");
			} finally {
				setTogglingMethods((prev) => ({ ...prev, [method]: false }));
			}
		},
		[reportError],
	);

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid gap-4">
					{Array.from({ length: 5 }, (_, i) => (
						<SkeletonMethodCard key={i} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Methods</h1>
				<p className="mt-1 max-w-3xl text-sm text-muted-foreground">
					Turn authentication methods on or off from the dashboard. Changes are persisted
					immediately and applied on the next auth request.
				</p>
			</div>

			<div className="grid gap-4">
				{methodDefs.map((method) => {
					const Icon = method.icon;
					const enabled = config?.authMethods[method.configKey] ?? false;
					return (
						<Card key={method.id}>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-start gap-4">
										<div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
											<Icon className={`size-5 ${method.iconColor}`} />
										</div>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<CardTitle className="text-sm">{method.title}</CardTitle>
												{method.comingSoon ? (
													<Badge variant="outline" className="text-[10px]">
														Coming soon
													</Badge>
												) : null}
											</div>
											<CardDescription className="max-w-md">{method.description}</CardDescription>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant={enabled ? "default" : "secondary"}>
											{enabled ? "Enabled" : "Disabled"}
										</Badge>
										{togglingMethods[method.configKey] ? (
											<Loader2 className="size-4 animate-spin text-muted-foreground" />
										) : null}
										<Switch
											checked={enabled}
											disabled={!!togglingMethods[method.configKey]}
											onCheckedChange={() => handleToggle(method.configKey, enabled)}
										/>
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
