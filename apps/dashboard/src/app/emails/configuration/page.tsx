"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkeletonCard, SkeletonHeader, SkeletonToggleRow } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { type EmailToggle, getEmailConfig, toggleEmail } from "@/lib/dashboard-api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface EmailConfig {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
}

const authEmailsInit: EmailConfig[] = [
	{
		id: "magic-auth",
		name: "Magic Auth",
		description: "Magic link and OTP authentication emails.",
		enabled: true,
	},
	{
		id: "user-invitation",
		name: "User invitation",
		description: "Invitation emails sent to new users.",
		enabled: true,
	},
	{
		id: "email-verification",
		name: "Email verification",
		description: "Email verification for new sign-ups and email changes.",
		enabled: true,
	},
	{
		id: "password-reset",
		name: "Password reset",
		description: "Password reset request emails.",
		enabled: true,
	},
];

const orgEmailsInit: EmailConfig[] = [
	{
		id: "critical-notifications",
		name: "Critical notifications",
		description: "Important system notifications sent to organization admins.",
		enabled: true,
	},
	{
		id: "invitations",
		name: "Invitations",
		description: "Organization membership invitation emails.",
		enabled: true,
	},
];

function applyRemoteConfig(local: EmailConfig[], remote: EmailToggle[]): EmailConfig[] {
	const remoteMap = new Map(remote.map((r) => [r.id, r]));
	return local.map((item) => {
		const match = remoteMap.get(item.id);
		return match ? { ...item, enabled: match.enabled } : item;
	});
}

export default function EmailConfigurationPage() {
	const [authEmails, setAuthEmails] = useState(authEmailsInit);
	const [orgEmails, setOrgEmails] = useState(orgEmailsInit);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	// Load persisted config on mount
	useEffect(() => {
		let cancelled = false;
		getEmailConfig()
			.then((remote) => {
				if (cancelled) return;
				if (remote.length > 0) {
					setAuthEmails((prev) => applyRemoteConfig(prev, remote));
					setOrgEmails((prev) => applyRemoteConfig(prev, remote));
				}
			})
			.catch((err) => {
				reportError(err);
			})
			.finally(() => {
				if (!cancelled) setLoaded(true);
			});
		return () => {
			cancelled = true;
		};
	}, [activeProjectId]);

	const handleToggle = useCallback(
		async (
			id: string,
			currentEnabled: boolean,
			setter: React.Dispatch<React.SetStateAction<EmailConfig[]>>,
		) => {
			const newEnabled = !currentEnabled;
			setTogglingId(id);

			// Optimistic update
			setter((prev) =>
				prev.map((email) => (email.id === id ? { ...email, enabled: newEnabled } : email)),
			);

			try {
				const remote = await toggleEmail(id, newEnabled);
				if (remote.length > 0) {
					setAuthEmails((prev) => applyRemoteConfig(prev, remote));
					setOrgEmails((prev) => applyRemoteConfig(prev, remote));
				}
			} catch {
				toast.error("Failed to update email configuration");
				// Revert on failure
				setter((prev) =>
					prev.map((email) => (email.id === id ? { ...email, enabled: currentEnabled } : email)),
				);
			} finally {
				setTogglingId(null);
			}
		},
		[],
	);

	if (!loaded) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<SkeletonCard lines={0}>
					<div className="space-y-1">
						{Array.from({ length: 4 }, (_, i) => (
							<SkeletonToggleRow key={i} />
						))}
					</div>
				</SkeletonCard>
				<SkeletonCard lines={0}>
					<div className="space-y-1">
						{Array.from({ length: 2 }, (_, i) => (
							<SkeletonToggleRow key={i} />
						))}
					</div>
				</SkeletonCard>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Email Configuration</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Configure which authentication emails are sent to your users.
				</p>
			</div>

			{/* Authentication Emails */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Authentication emails</CardTitle>
					<CardDescription>Emails sent during authentication flows.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-1">
						{authEmails.map((email, index) => (
							<div key={email.id}>
								{index > 0 && <Separator className="my-4" />}
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">{email.name}</span>
											<Badge
												variant={email.enabled ? "default" : "secondary"}
												className="text-[10px]"
											>
												{email.enabled ? "Enabled" : "Disabled"}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">{email.description}</p>
									</div>
									<Switch
										checked={email.enabled}
										disabled={togglingId === email.id}
										onCheckedChange={() => handleToggle(email.id, email.enabled, setAuthEmails)}
									/>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Organization Emails */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Other emails</CardTitle>
					<CardDescription>Emails sent to organization administrators.</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Organization admins
						</h4>
						<div className="space-y-1">
							{orgEmails.map((email, index) => (
								<div key={email.id}>
									{index > 0 && <Separator className="my-4" />}
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">{email.name}</span>
												<Badge
													variant={email.enabled ? "default" : "secondary"}
													className="text-[10px]"
												>
													{email.enabled ? "Enabled" : "Disabled"}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{email.description}</p>
										</div>
										<Switch
											checked={email.enabled}
											disabled={togglingId === email.id}
											onCheckedChange={() => handleToggle(email.id, email.enabled, setOrgEmails)}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
