"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { ProviderIcon } from "@/components/provider-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SkeletonHeader, SkeletonMethodCard } from "@/components/ui/skeleton";
import {
	type EmailProviderConfig,
	getEmailProviderConfig,
	saveEmailProviderConfig,
} from "@/lib/dashboard-api";
import { Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProviderMeta {
	id: string;
	name: string;
	description: string;
	keyLabel: string;
	keyPlaceholder: string;
	docsUrl: string;
}

const PROVIDERS: ProviderMeta[] = [
	{
		id: "resend",
		name: "Resend",
		description: "Modern email API built for developers.",
		keyLabel: "Resend API Key",
		keyPlaceholder: "re_xxxxxxxx...",
		docsUrl: "https://resend.com/api-keys",
	},
	{
		id: "sendgrid",
		name: "SendGrid",
		description: "Cloud-based email delivery service by Twilio.",
		keyLabel: "SendGrid API Key",
		keyPlaceholder: "SG.xxxxxxxx...",
		docsUrl: "https://app.sendgrid.com/settings/api_keys",
	},
	{
		id: "ses",
		name: "Amazon SES",
		description: "Scalable email service from AWS.",
		keyLabel: "AWS Access Key ID",
		keyPlaceholder: "AKIA...",
		docsUrl: "https://docs.aws.amazon.com/ses/latest/dg/send-email.html",
	},
	{
		id: "mailgun",
		name: "Mailgun",
		description: "Email API service for developers by Sinch.",
		keyLabel: "Mailgun API Key",
		keyPlaceholder: "key-xxxxxxxx...",
		docsUrl: "https://app.mailgun.com/settings/api_security",
	},
	{
		id: "postmark",
		name: "Postmark",
		description: "Fast, reliable transactional email delivery.",
		keyLabel: "Postmark Server Token",
		keyPlaceholder: "xxxxxxxx-xxxx...",
		docsUrl: "https://account.postmarkapp.com/servers",
	},
];

export default function EmailProvidersPage() {
	const activeProjectId = useActiveProjectId();
	const [config, setConfig] = useState<EmailProviderConfig>({
		providers: {},
		activeProvider: null,
	});
	const [loading, setLoading] = useState(true);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [savingKeyId, setSavingKeyId] = useState<string | null>(null);
	const [showTestDialog, setShowTestDialog] = useState(false);
	const [testEmail, setTestEmail] = useState("");
	const [sendingTest, setSendingTest] = useState(false);
	// Local draft API key values (per provider) before the user clicks "Save Key"
	const [draftKeys, setDraftKeys] = useState<Record<string, string>>({});

	const { reportError } = useBackendStatus();

	// Load config from backend on mount
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const remote = await getEmailProviderConfig();
				if (cancelled) return;
				setConfig(remote);
				// Seed draft keys from persisted values so the input shows the saved key
				const keys: Record<string, string> = {};
				for (const [id, entry] of Object.entries(remote.providers)) {
					if (entry.apiKey) keys[id] = entry.apiKey;
				}
				setDraftKeys(keys);
			} catch (err) {
				if (!cancelled) reportError(err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [activeProjectId]);

	const isProviderEnabled = useCallback(
		(id: string) => !!config.providers[id]?.enabled,
		[config.providers],
	);

	const handleToggleProvider = useCallback(
		async (id: string) => {
			const currentlyEnabled = isProviderEnabled(id);
			const newEnabled = !currentlyEnabled;
			setTogglingId(id);

			// Build the new config optimistically
			const updatedProviders = {
				...config.providers,
				[id]: { ...config.providers[id], enabled: newEnabled },
			};
			let newActive = config.activeProvider;
			if (newEnabled) {
				newActive = id;
			} else if (config.activeProvider === id) {
				newActive = null;
			}

			const previous = config;
			setConfig({ providers: updatedProviders, activeProvider: newActive });

			try {
				const saved = await saveEmailProviderConfig({
					providers: { [id]: { enabled: newEnabled, apiKey: updatedProviders[id]?.apiKey } },
					activeProvider: newActive,
				});
				setConfig(saved);
				toast.success("Email provider updated");
			} catch {
				toast.error("Failed to update email provider");
				setConfig(previous);
			} finally {
				setTogglingId(null);
			}
		},
		[config, isProviderEnabled],
	);

	const handleSaveKey = useCallback(
		async (id: string) => {
			const key = draftKeys[id]?.trim();
			if (!key) return;

			setSavingKeyId(id);
			try {
				const saved = await saveEmailProviderConfig({
					providers: { [id]: { enabled: isProviderEnabled(id), apiKey: key } },
					activeProvider: config.activeProvider,
				});
				setConfig(saved);
				toast.success("API key saved");
			} catch {
				toast.error("Failed to save API key");
			} finally {
				setSavingKeyId(null);
			}
		},
		[config, draftKeys, isProviderEnabled],
	);

	const handleSendTestEmail = useCallback(async () => {
		if (!testEmail.trim()) return;

		setSendingTest(true);
		try {
			const response = await fetch("/api/auth/banata/test-email", {
				method: "POST",
				credentials: "include",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ to: testEmail.trim() }),
			});

			if (response.ok) {
				toast.success("Test email sent");
				setTimeout(() => {
					setShowTestDialog(false);
					setTestEmail("");
				}, 1000);
			} else {
				const data = await response.json().catch(() => null);
				const message =
					(data as { message?: string } | null)?.message ?? `Failed to send (${response.status})`;
				toast.error(`Failed to send test email: ${message}`);
			}
		} catch {
			toast.error("Failed to send test email: Network error");
		} finally {
			setSendingTest(false);
		}
	}, [testEmail]);

	const activeProviderMeta = PROVIDERS.find((p) => p.id === config.activeProvider);

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader withButton />
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
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Email Providers</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Configure an email provider for transactional email delivery.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowTestDialog((v) => !v)}
					disabled={!activeProviderMeta}
					title={activeProviderMeta ? "Send a test email" : "Enable a provider first"}
				>
					<Send className="size-4" />
					Send test email
				</Button>
			</div>

			{/* Test email dialog */}
			{showTestDialog && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Send test email</CardTitle>
						<CardDescription>
							Send a test message via <strong>{activeProviderMeta?.name}</strong> to verify
							delivery.
						</CardDescription>
					</CardHeader>
					<div className="px-6 pb-6">
						<div className="flex items-center gap-2">
							<Input
								type="email"
								placeholder="recipient@example.com"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSendTestEmail();
								}}
								className="max-w-sm"
							/>
							<Button
								size="sm"
								onClick={handleSendTestEmail}
								disabled={sendingTest || !testEmail.trim()}
							>
								{sendingTest ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Send className="size-4" />
								)}
								{sendingTest ? "Sending..." : "Send"}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setShowTestDialog(false);
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				</Card>
			)}

			<div className="grid gap-4">
				{PROVIDERS.map((meta) => {
					const enabled = isProviderEnabled(meta.id);
					const isActive = config.activeProvider === meta.id;
					const draftKey = draftKeys[meta.id] ?? "";

					return (
						<Card key={meta.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-4">
										<div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
											<ProviderIcon provider={meta.id} size={20} />
										</div>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<CardTitle className="text-sm">{meta.name}</CardTitle>
												{isActive && <Badge variant="default">Active</Badge>}
												{enabled && !isActive && <Badge variant="secondary">Enabled</Badge>}
											</div>
											<CardDescription>{meta.description}</CardDescription>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Button
											variant="outline"
											size="sm"
											disabled={togglingId === meta.id}
											onClick={() => handleToggleProvider(meta.id)}
										>
											{togglingId === meta.id ? (
												<Loader2 className="mr-1 size-3.5 animate-spin" />
											) : null}
											{enabled ? "Disable" : "Enable"}
										</Button>
									</div>
								</div>
							</CardHeader>

							{/* API key configuration — shown when provider is enabled */}
							{enabled && (
								<CardContent>
									<Separator className="mb-4" />
									<div className="space-y-3">
										<div className="space-y-1.5">
											<label
												htmlFor={`api-key-${meta.id}`}
												className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60"
											>
												{meta.keyLabel}
											</label>
											<div className="flex gap-2">
												<Input
													id={`api-key-${meta.id}`}
													type="password"
													placeholder={meta.keyPlaceholder}
													value={draftKey}
													onChange={(e) =>
														setDraftKeys((prev) => ({
															...prev,
															[meta.id]: e.target.value,
														}))
													}
													className="max-w-md font-mono text-xs"
												/>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSaveKey(meta.id)}
													disabled={!draftKey.trim() || savingKeyId === meta.id}
												>
													{savingKeyId === meta.id ? (
														<Loader2 className="mr-1 size-3.5 animate-spin" />
													) : null}
													Save Key
												</Button>
											</div>
											<p className="text-xs text-muted-foreground">
												Your API key is stored securely on the server. Get your key from{" "}
												<a
													href={meta.docsUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="underline underline-offset-2 hover:text-foreground"
												>
													{new URL(meta.docsUrl).hostname}
												</a>
												.
											</p>
										</div>
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
