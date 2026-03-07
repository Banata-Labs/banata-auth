"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SkeletonCard, SkeletonHeader, SkeletonInput } from "@/components/ui/skeleton";
import { type RedirectsData, getRedirects, saveRedirects } from "@/lib/dashboard-api";
import { Check, Loader2, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RedirectSettingConfig {
	key: string;
	title: string;
	description: string;
	isMulti?: boolean; // supports multiple URIs (like redirect URIs, sign-out redirects)
}

const redirectSettingConfigs: RedirectSettingConfig[] = [
	{
		key: "redirectUris",
		title: "Redirect URIs",
		description: "Where users are redirected when they sign in.",
		isMulti: true,
	},
	{
		key: "appHomepage",
		title: "App homepage URL",
		description: "Link to your app homepage in AuthKit pages and emails.",
	},
	{
		key: "signInEndpoint",
		title: "Sign-in endpoint",
		description: "An endpoint at your app that redirects to the authorize endpoint.",
	},
	{
		key: "signOutRedirects",
		title: "Sign-out redirect",
		description: "Where users are redirected when they sign out.",
		isMulti: true,
	},
	{
		key: "externalSignUp",
		title: "External sign-up URI",
		description: "An optional external page where users can sign up for your app.",
	},
	{
		key: "userInvitation",
		title: "User invitation URL",
		description: "Where to navigate the user from the user invitation email.",
	},
	{
		key: "passwordReset",
		title: "Password reset URL",
		description: "Where to navigate the user from the password reset email.",
	},
];

interface AdminPortalRedirect {
	label: string;
	key: string;
}

const adminPortalRedirectConfigs: AdminPortalRedirect[] = [
	{ label: "Logo URI", key: "logoUri" },
	{ label: "SSO success URI", key: "ssoSuccess" },
	{ label: "Directory Sync success URI", key: "dirSyncSuccess" },
	{ label: "Log Streams success URI", key: "logStreamsSuccess" },
	{ label: "Domain Verification success URI", key: "domainVerifySuccess" },
];

function getDefaultData(): RedirectsData {
	const data: RedirectsData = {};
	for (const config of redirectSettingConfigs) {
		data[config.key] = config.isMulti ? [] : "";
	}
	for (const config of adminPortalRedirectConfigs) {
		data[config.key] = "";
	}
	return data;
}

// Single-value redirect setting card
function SingleRedirectCard({
	config,
	value,
	onSave,
}: {
	config: RedirectSettingConfig;
	value: string;
	onSave: (val: string) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);

	const handleSave = () => {
		onSave(draft.trim());
		setEditing(false);
	};

	const handleCancel = () => {
		setDraft(value);
		setEditing(false);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-sm">{config.title}</CardTitle>
						<CardDescription className="max-w-lg">{config.description}</CardDescription>
					</div>
					{!editing && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setDraft(value);
								setEditing(true);
							}}
						>
							<Pencil className="size-4" />
							{value ? "Edit" : `Edit ${config.title.toLowerCase()}`}
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{editing ? (
					<div className="flex items-center gap-2">
						<Input
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							placeholder={`Enter ${config.title.toLowerCase()}`}
							className="max-w-md"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") handleCancel();
							}}
							autoFocus
						/>
						<Button size="sm" onClick={handleSave}>
							<Check className="size-4" />
							Save
						</Button>
						<Button size="sm" variant="ghost" onClick={handleCancel}>
							Cancel
						</Button>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">{value || "Not configured"}</p>
				)}
			</CardContent>
		</Card>
	);
}

// Multi-value redirect setting card
function MultiRedirectCard({
	config,
	values,
	onSave,
}: {
	config: RedirectSettingConfig;
	values: string[];
	onSave: (vals: string[]) => void;
}) {
	const [adding, setAdding] = useState(false);
	const [newUri, setNewUri] = useState("");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editDraft, setEditDraft] = useState("");

	const handleAdd = () => {
		const trimmed = newUri.trim();
		if (!trimmed) return;
		onSave([...values, trimmed]);
		setNewUri("");
		setAdding(false);
	};

	const handleRemove = (index: number) => {
		onSave(values.filter((_, i) => i !== index));
	};

	const handleEditSave = (index: number) => {
		const trimmed = editDraft.trim();
		if (!trimmed) return;
		const updated = [...values];
		updated[index] = trimmed;
		onSave(updated);
		setEditingIndex(null);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-sm">{config.title}</CardTitle>
						<CardDescription className="max-w-lg">{config.description}</CardDescription>
					</div>
					<Button variant="outline" size="sm" onClick={() => setAdding(true)}>
						<Plus className="size-4" />
						Add {config.title.toLowerCase().replace(/s$/, "")}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{values.length === 0 && !adding && (
					<p className="text-sm text-muted-foreground">No URIs configured.</p>
				)}
				{values.length > 0 && (
					<div className="space-y-2">
						{values.map((uri, index) => (
							<div key={index} className="flex items-center gap-2">
								{editingIndex === index ? (
									<>
										<Input
											value={editDraft}
											onChange={(e) => setEditDraft(e.target.value)}
											className="max-w-md"
											onKeyDown={(e) => {
												if (e.key === "Enter") handleEditSave(index);
												if (e.key === "Escape") setEditingIndex(null);
											}}
											autoFocus
										/>
										<Button size="sm" onClick={() => handleEditSave(index)}>
											<Check className="size-4" />
										</Button>
										<Button size="sm" variant="ghost" onClick={() => setEditingIndex(null)}>
											Cancel
										</Button>
									</>
								) : (
									<>
										<code className="rounded-md bg-muted px-2.5 py-1 text-sm font-mono">{uri}</code>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setEditingIndex(index);
												setEditDraft(uri);
											}}
										>
											<Pencil className="size-3.5" />
										</Button>
										<Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
											<X className="size-3.5 text-destructive" />
										</Button>
									</>
								)}
							</div>
						))}
					</div>
				)}
				{adding && (
					<div className="mt-2 flex items-center gap-2">
						<Input
							value={newUri}
							onChange={(e) => setNewUri(e.target.value)}
							placeholder="https://example.com/callback"
							className="max-w-md"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleAdd();
								if (e.key === "Escape") {
									setAdding(false);
									setNewUri("");
								}
							}}
							autoFocus
						/>
						<Button size="sm" onClick={handleAdd}>
							<Check className="size-4" />
							Add
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => {
								setAdding(false);
								setNewUri("");
							}}
						>
							Cancel
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default function RedirectsPage() {
	const activeProjectId = useActiveProjectId();
	const [data, setData] = useState<RedirectsData>(getDefaultData);
	const [loading, setLoading] = useState(true);
	const [editingAdmin, setEditingAdmin] = useState(false);
	const [adminDrafts, setAdminDrafts] = useState<Record<string, string>>({});

	const { reportError } = useBackendStatus();

	useEffect(() => {
		getRedirects()
			.then((remote) => {
				setData({ ...getDefaultData(), ...remote });
			})
			.catch((err) => {
				reportError(err);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [activeProjectId]);

	const updateField = async (key: string, value: string | string[]) => {
		const updated = { ...data, [key]: value };
		setData(updated);
		try {
			await saveRedirects(updated);
			toast.success("Redirect setting saved");
		} catch {
			toast.error("Failed to save redirect setting");
		}
	};

	const startEditingAdmin = () => {
		const drafts: Record<string, string> = {};
		for (const config of adminPortalRedirectConfigs) {
			drafts[config.key] = (data[config.key] as string) || "";
		}
		setAdminDrafts(drafts);
		setEditingAdmin(true);
	};

	const saveAdminEdits = async () => {
		const updated = { ...data };
		for (const config of adminPortalRedirectConfigs) {
			updated[config.key] = adminDrafts[config.key]?.trim() || "";
		}
		setData(updated);
		setEditingAdmin(false);
		try {
			await saveRedirects(updated);
			toast.success("Admin Portal redirects saved");
		} catch {
			toast.error("Failed to save Admin Portal redirects");
		}
	};

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid gap-4">
					{Array.from({ length: 7 }, (_, i) => (
						<SkeletonCard key={i} lines={0}>
							<SkeletonInput />
						</SkeletonCard>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Redirects</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Configure redirect URIs and endpoints for authentication flows.
				</p>
			</div>

			<div className="grid gap-4">
				{redirectSettingConfigs.map((config) =>
					config.isMulti ? (
						<MultiRedirectCard
							key={config.key}
							config={config}
							values={(data[config.key] as string[]) || []}
							onSave={(vals) => updateField(config.key, vals)}
						/>
					) : (
						<SingleRedirectCard
							key={config.key}
							config={config}
							value={(data[config.key] as string) || ""}
							onSave={(val) => updateField(config.key, val)}
						/>
					),
				)}

				{/* Admin Portal redirects */}
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<CardTitle className="text-sm">Admin Portal redirects</CardTitle>
								<CardDescription className="max-w-lg">
									Configure redirect URIs for the Admin Portal setup flow.
								</CardDescription>
							</div>
							{editingAdmin ? (
								<div className="flex gap-2">
									<Button size="sm" onClick={saveAdminEdits}>
										<Check className="size-4" />
										Save
									</Button>
									<Button size="sm" variant="ghost" onClick={() => setEditingAdmin(false)}>
										Cancel
									</Button>
								</div>
							) : (
								<Button variant="outline" size="sm" onClick={startEditingAdmin}>
									<Pencil className="size-4" />
									Edit Admin Portal redirects
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{adminPortalRedirectConfigs.map((redirect, index) => (
								<div key={redirect.key}>
									{index > 0 && <Separator className="mb-3" />}
									<div className="flex items-center justify-between gap-4">
										<span className="text-sm font-medium">{redirect.label}</span>
										{editingAdmin ? (
											<Input
												value={adminDrafts[redirect.key] || ""}
												onChange={(e) =>
													setAdminDrafts((prev) => ({
														...prev,
														[redirect.key]: e.target.value,
													}))
												}
												placeholder="https://..."
												className="max-w-xs"
											/>
										) : (
											<span className="text-sm text-muted-foreground">
												{(data[redirect.key] as string) || "No redirect"}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
