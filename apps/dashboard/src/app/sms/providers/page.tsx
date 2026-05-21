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
	type SmsProviderConfig,
	getSmsProviderConfig,
	saveSmsProviderConfig,
} from "@/lib/dashboard-api";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type CredentialKey =
	| "apiKey"
	| "apiSecret"
	| "accountSid"
	| "authToken"
	| "fromNumber"
	| "senderId"
	| "username"
	| "phoneNumberId"
	| "templateName"
	| "templateLanguage"
	| "apiBaseUrl";

interface ProviderMeta {
	id: string;
	name: string;
	description: string;
	channel: "SMS" | "WhatsApp" | "SMS + WhatsApp";
	docsUrl: string;
	fields: Array<{
		key: CredentialKey;
		label: string;
		placeholder: string;
		type?: "text" | "password";
	}>;
}

const PROVIDERS: ProviderMeta[] = [
	{
		id: "twilio",
		name: "Twilio",
		description: "SMS and WhatsApp OTP delivery through Twilio Messaging.",
		channel: "SMS + WhatsApp",
		docsUrl: "https://www.twilio.com/docs/messaging/api/message-resource",
		fields: [
			{ key: "accountSid", label: "Account SID", placeholder: "ACxxxxxxxx..." },
			{ key: "authToken", label: "Auth Token", placeholder: "xxxxxxxx...", type: "password" },
			{ key: "fromNumber", label: "Sender Number", placeholder: "+15551234567" },
		],
	},
	{
		id: "messagebird",
		name: "MessageBird",
		description: "Global SMS delivery with a MessageBird access key.",
		channel: "SMS",
		docsUrl: "https://developers.messagebird.com/api/sms-messaging/",
		fields: [
			{ key: "apiKey", label: "API Key", placeholder: "live_xxxxxxxx...", type: "password" },
			{ key: "senderId", label: "Originator", placeholder: "Banata" },
		],
	},
	{
		id: "vonage",
		name: "Vonage",
		description: "SMS delivery through the Vonage SMS API.",
		channel: "SMS",
		docsUrl: "https://developer.vonage.com/en/messaging/sms/overview",
		fields: [
			{ key: "apiKey", label: "API Key", placeholder: "xxxxxxxx" },
			{ key: "apiSecret", label: "API Secret", placeholder: "xxxxxxxx...", type: "password" },
			{ key: "senderId", label: "Sender", placeholder: "Banata" },
		],
	},
	{
		id: "africas_talking",
		name: "Africa's Talking",
		description: "SMS delivery for African markets with sender ID support.",
		channel: "SMS",
		docsUrl: "https://developers.africastalking.com/docs/sms/sending",
		fields: [
			{ key: "username", label: "Username", placeholder: "sandbox or production username" },
			{ key: "apiKey", label: "API Key", placeholder: "xxxxxxxx...", type: "password" },
			{ key: "senderId", label: "Sender ID", placeholder: "Banata" },
		],
	},
	{
		id: "termii",
		name: "Termii",
		description: "SMS OTP delivery through Termii's messaging API.",
		channel: "SMS",
		docsUrl: "https://developers.termii.com/",
		fields: [
			{ key: "apiKey", label: "API Key", placeholder: "xxxxxxxx...", type: "password" },
			{ key: "senderId", label: "Sender ID", placeholder: "Banata" },
		],
	},
	{
		id: "mobitech",
		name: "Mobitech",
		description: "Bulk SMS and transactional OTP delivery through Mobitech Technologies.",
		channel: "SMS",
		docsUrl: "https://mobitechtechnologies.com/bulksms",
		fields: [
			{ key: "apiKey", label: "API Key", placeholder: "xxxxxxxx...", type: "password" },
			{ key: "senderId", label: "Sender ID", placeholder: "Banata" },
			{
				key: "apiBaseUrl",
				label: "API URL",
				placeholder: "https://bulk.mobitechtechnologies.com/api/sms/send",
			},
		],
	},
	{
		id: "meta_whatsapp",
		name: "Meta WhatsApp Cloud API",
		description: "WhatsApp OTP delivery through a Meta WhatsApp sender.",
		channel: "WhatsApp",
		docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages",
		fields: [
			{ key: "apiKey", label: "Access Token", placeholder: "EAA...", type: "password" },
			{ key: "phoneNumberId", label: "Phone Number ID", placeholder: "1234567890" },
			{ key: "templateName", label: "Template Name", placeholder: "otp_code" },
			{ key: "templateLanguage", label: "Template Language", placeholder: "en_US" },
		],
	},
];

export default function SmsProvidersPage() {
	const activeProjectId = useActiveProjectId();
	const [config, setConfig] = useState<SmsProviderConfig>({
		providers: {},
		activeProvider: null,
		defaultChannel: "sms",
	});
	const [loading, setLoading] = useState(true);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [savingId, setSavingId] = useState<string | null>(null);
	const [draftValues, setDraftValues] = useState<Record<string, string>>({});
	const { reportError } = useBackendStatus();

	useEffect(() => {
		let cancelled = false;
		if (!activeProjectId) {
			setConfig({ providers: {}, activeProvider: null, defaultChannel: "sms" });
			setDraftValues({});
			setLoading(false);
			return;
		}
		(async () => {
			try {
				const remote = await getSmsProviderConfig();
				if (cancelled) return;
				setConfig(remote);
				const values: Record<string, string> = {};
				for (const [id, entry] of Object.entries(remote.providers)) {
					for (const key of Object.keys(entry) as CredentialKey[]) {
						const value = entry[key];
						if (typeof value === "string") values[`${id}.${key}`] = value;
					}
				}
				setDraftValues(values);
			} catch (err) {
				if (!cancelled) reportError(err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [activeProjectId, reportError]);

	const isProviderEnabled = useCallback(
		(id: string) => !!config.providers[id]?.enabled,
		[config.providers],
	);

	const handleToggleProvider = useCallback(
		async (id: string) => {
			const enabled = !isProviderEnabled(id);
			const updatedProvider = { ...(config.providers[id] ?? { enabled: false }), enabled };
			const updatedProviders = {
				...config.providers,
				[id]: updatedProvider,
			};
			const activeProvider = enabled ? id : config.activeProvider === id ? null : config.activeProvider;
			const previous = config;
			setTogglingId(id);
			setConfig({ ...config, providers: updatedProviders, activeProvider });
			try {
				const saved = await saveSmsProviderConfig({
					providers: { [id]: updatedProvider },
					activeProvider,
					defaultChannel: config.defaultChannel,
				});
				setConfig(saved);
				toast.success("SMS provider updated");
			} catch {
				setConfig(previous);
				toast.error("Failed to update SMS provider");
			} finally {
				setTogglingId(null);
			}
		},
		[config, isProviderEnabled],
	);

	const handleSaveProvider = useCallback(
		async (meta: ProviderMeta) => {
			const providerConfig = { ...(config.providers[meta.id] ?? {}), enabled: isProviderEnabled(meta.id) };
			for (const field of meta.fields) {
				const value = draftValues[`${meta.id}.${field.key}`]?.trim();
				if (value) providerConfig[field.key] = value;
			}
			setSavingId(meta.id);
			try {
				const saved = await saveSmsProviderConfig({
					providers: { [meta.id]: providerConfig },
					activeProvider: config.activeProvider,
					defaultChannel: config.defaultChannel,
				});
				setConfig(saved);
				toast.success("Provider credentials saved");
			} catch {
				toast.error("Failed to save provider credentials");
			} finally {
				setSavingId(null);
			}
		},
		[config, draftValues, isProviderEnabled],
	);

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader withButton />
				<div className="grid gap-4">
					{["sms-provider-1", "sms-provider-2", "sms-provider-3"].map((key) => (
						<SkeletonMethodCard key={key} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">SMS Providers</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Configure SMS and WhatsApp delivery for phone OTP.
				</p>
			</div>

			<div className="grid gap-4">
				{PROVIDERS.map((meta) => {
					const enabled = isProviderEnabled(meta.id);
					const active = config.activeProvider === meta.id;
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
												<Badge variant="outline">{meta.channel}</Badge>
												{active && <Badge>Active</Badge>}
												{enabled && !active && <Badge variant="secondary">Enabled</Badge>}
											</div>
											<CardDescription>{meta.description}</CardDescription>
										</div>
									</div>
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
							</CardHeader>

							{enabled && (
								<CardContent>
									<Separator className="mb-4" />
									<div className="grid gap-3 md:grid-cols-3">
										{meta.fields.map((field) => (
											<div key={field.key} className="space-y-1.5">
												<label
													htmlFor={`${meta.id}-${field.key}`}
													className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60"
												>
													{field.label}
												</label>
												<Input
													id={`${meta.id}-${field.key}`}
													type={field.type ?? "text"}
													placeholder={field.placeholder}
													value={draftValues[`${meta.id}.${field.key}`] ?? ""}
													onChange={(e) =>
														setDraftValues((prev) => ({
															...prev,
															[`${meta.id}.${field.key}`]: e.target.value,
														}))
													}
													className="font-mono text-xs"
												/>
											</div>
										))}
									</div>
									<div className="mt-4 flex items-center gap-3">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleSaveProvider(meta)}
											disabled={savingId === meta.id}
										>
											{savingId === meta.id ? (
												<Loader2 className="mr-1 size-3.5 animate-spin" />
											) : null}
											Save credentials
										</Button>
										<p className="text-xs text-muted-foreground">
											Get provider credentials from{" "}
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
								</CardContent>
							)}
						</Card>
					);
				})}
			</div>
		</div>
	);
}
