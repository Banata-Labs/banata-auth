"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonCard, SkeletonHeader, SkeletonInput } from "@/components/ui/skeleton";
import {
	type DomainConfigItem,
	type ProjectDomainItem,
	addProjectDomain,
	deleteDomain,
	listDomains,
	listProjectDomains,
	removeProjectDomain,
	saveDomain,
} from "@/lib/dashboard-api";
import { Check, Info, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_DOMAINS: Omit<DomainConfigItem, "id">[] = [
	{
		domainKey: "email",
		title: "Email",
		description:
			"Domain used in sender address for Admin Portal invitations and authentication flows.",
		value: "banata.dev",
		isDefault: true,
	},
	{
		domainKey: "admin-portal",
		title: "Admin Portal",
		description: "Domain to use for Admin Portal.",
		value: "setup.banata.dev",
		isDefault: true,
	},
	{
		domainKey: "auth-api",
		title: "Authentication API",
		description: "Domain to use for authentication requests.",
		value: "auth.banata.dev",
		isDefault: true,
	},
	{
		domainKey: "authkit",
		title: "AuthKit",
		description: "Domain for hosted authentication UI.",
		value: "auth-ui.banata.dev",
		isDefault: true,
	},
];

export default function DomainsPage() {
	const activeProjectId = useActiveProjectId();
	const [domains, setDomains] = useState<DomainConfigItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingId, setSavingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState("");
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [addingDomain, setAddingDomain] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newValue, setNewValue] = useState("");
	const [projectDomains, setProjectDomains] = useState<ProjectDomainItem[]>([]);
	const [projectOrigin, setProjectOrigin] = useState("");
	const [savingProjectOrigin, setSavingProjectOrigin] = useState(false);
	const [removingProjectOrigin, setRemovingProjectOrigin] = useState<string | null>(null);

	const { reportError } = useBackendStatus();

	const fetchDomains = useCallback(async () => {
		if (!activeProjectId) {
			setDomains([]);
			setLoading(false);
			return;
		}

		try {
			const [initialItems, origins] = await Promise.all([listDomains(), listProjectDomains()]);
			let items = initialItems;

			// Seed defaults on first load if backend is empty
			if (items.length === 0) {
				await Promise.all(DEFAULT_DOMAINS.map((d) => saveDomain(d)));
				items = await listDomains();
			}

			setDomains(items);
			setProjectDomains(origins);
		} catch (err) {
			reportError(err);
		} finally {
			setLoading(false);
		}
	}, [activeProjectId, reportError]);

	useEffect(() => {
		fetchDomains();
	}, [fetchDomains]);

	const startEditing = (domain: DomainConfigItem) => {
		setEditingId(domain.domainKey);
		setEditDraft(domain.value);
	};

	const handleSave = async (domainKey: string) => {
		const trimmed = editDraft.trim();
		if (!trimmed) return;

		const domain = domains.find((d) => d.domainKey === domainKey);
		if (!domain) return;

		setSavingId(domainKey);
		try {
			await saveDomain({
				domainKey: domain.domainKey,
				title: domain.title,
				description: domain.description,
				value: trimmed,
				isDefault: domain.isDefault,
			});
			setDomains((prev) =>
				prev.map((d) => (d.domainKey === domainKey ? { ...d, value: trimmed } : d)),
			);
			setEditingId(null);
			toast.success("Domain updated");
		} catch {
			toast.error("Failed to save domain");
		} finally {
			setSavingId(null);
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditDraft("");
	};

	const handleAdd = async () => {
		if (!newTitle.trim() || !newValue.trim()) return;

		const domainKey = crypto.randomUUID();
		setAddingDomain(true);
		try {
			await saveDomain({
				domainKey,
				title: newTitle.trim(),
				description: newDescription.trim(),
				value: newValue.trim(),
				isDefault: false,
			});
			// Re-fetch so we get the server-assigned id
			const items = await listDomains();
			setDomains(items);
			setNewTitle("");
			setNewDescription("");
			setNewValue("");
			setAddDialogOpen(false);
			toast.success("Domain added");
		} catch {
			toast.error("Failed to add domain");
		} finally {
			setAddingDomain(false);
		}
	};

	const handleDelete = async (domainKey: string) => {
		setDeletingId(domainKey);
		try {
			await deleteDomain(domainKey);
			setDomains((prev) => prev.filter((d) => d.domainKey !== domainKey));
			toast.success("Domain deleted");
		} catch {
			toast.error("Failed to delete domain");
		} finally {
			setDeletingId(null);
		}
	};

	const handleAddProjectDomain = async () => {
		const trimmed = projectOrigin.trim();
		if (!trimmed) return;

		setSavingProjectOrigin(true);
		try {
			await addProjectDomain(trimmed);
			const items = await listProjectDomains();
			setProjectDomains(items);
			setProjectOrigin("");
			toast.success("Project domain added");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to add project domain");
		} finally {
			setSavingProjectOrigin(false);
		}
	};

	const handleRemoveProjectDomain = async (origin: string) => {
		setRemovingProjectOrigin(origin);
		try {
			await removeProjectDomain(origin);
			setProjectDomains((prev) => prev.filter((item) => item.origin !== origin));
			toast.success("Project domain removed");
		} catch {
			toast.error("Failed to remove project domain");
		} finally {
			setRemovingProjectOrigin(null);
		}
	};

	const isAddFormValid = newTitle.trim() && newValue.trim();

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader withButton />
				<div className="grid gap-4">
					{["domain-1", "domain-2", "domain-3", "domain-4"].map((key) => (
						<SkeletonCard key={key} lines={0}>
							<SkeletonInput width="w-64" />
						</SkeletonCard>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Configure domains for authentication services and email delivery.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
					<Plus className="size-4" />
					Add domain
				</Button>
			</div>

			<div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
				<Info className="size-4 shrink-0 text-blue-400" />
				<p className="text-sm text-blue-300">
					Domains are customized in production environments only.
				</p>
			</div>

			<div className="grid gap-4">
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-1">
								<CardTitle className="text-sm">Project OAuth origins</CardTitle>
								<CardDescription className="max-w-xl">
									HTTPS app origins used to build social provider callback URLs.
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								value={projectOrigin}
								onChange={(e) => setProjectOrigin(e.target.value)}
								placeholder="https://kasilabs.com"
								disabled={savingProjectOrigin}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleAddProjectDomain();
								}}
							/>
							<Button
								className="shrink-0"
								onClick={handleAddProjectDomain}
								disabled={!projectOrigin.trim() || savingProjectOrigin}
							>
								{savingProjectOrigin ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Plus className="size-4" />
								)}
								Add origin
							</Button>
						</div>

						{projectDomains.length > 0 ? (
							<div className="grid gap-3">
								{projectDomains.map((domain) => (
									<div
										key={domain.origin}
										className="rounded-md border border-border bg-muted/20 px-3 py-3"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 space-y-2">
												<div className="flex items-center gap-2">
													<code className="truncate rounded bg-muted px-2 py-1 text-sm">
														{domain.origin}
													</code>
													<Badge variant="secondary">Verified</Badge>
												</div>
												<div className="grid gap-1">
													{domain.oauthCallbackUrls.map((url) => (
														<code
															key={url}
															className="block truncate text-xs text-muted-foreground"
														>
															{url}
														</code>
													))}
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveProjectDomain(domain.origin)}
												disabled={removingProjectOrigin === domain.origin}
											>
												{removingProjectOrigin === domain.origin ? (
													<Loader2 className="size-3.5 animate-spin" />
												) : (
													<Trash2 className="size-3.5 text-destructive" />
												)}
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No project OAuth origins have been added.
							</p>
						)}
					</CardContent>
				</Card>

				{domains.map((domain) => (
					<Card key={domain.domainKey}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="text-sm">{domain.title}</CardTitle>
									<CardDescription className="max-w-lg">{domain.description}</CardDescription>
								</div>
								<div className="flex gap-1">
									{editingId !== domain.domainKey && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => startEditing(domain)}
											disabled={savingId === domain.domainKey || deletingId === domain.domainKey}
										>
											<Pencil className="size-3.5" />
										</Button>
									)}
									{!domain.isDefault && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(domain.domainKey)}
											disabled={deletingId === domain.domainKey}
										>
											{deletingId === domain.domainKey ? (
												<Loader2 className="size-3.5 animate-spin" />
											) : (
												<Trash2 className="size-3.5 text-destructive" />
											)}
										</Button>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{editingId === domain.domainKey ? (
								<div className="flex items-center gap-2">
									<Input
										value={editDraft}
										onChange={(e) => setEditDraft(e.target.value)}
										placeholder="Enter domain"
										className="max-w-sm"
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSave(domain.domainKey);
											if (e.key === "Escape") handleCancel();
										}}
										autoFocus
										disabled={savingId === domain.domainKey}
									/>
									<Button
										size="sm"
										onClick={() => handleSave(domain.domainKey)}
										disabled={savingId === domain.domainKey}
									>
										{savingId === domain.domainKey ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Check className="size-4" />
										)}
										Save
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={handleCancel}
										disabled={savingId === domain.domainKey}
									>
										Cancel
									</Button>
								</div>
							) : (
								<div className="flex items-center gap-3">
									<code className="rounded-md bg-muted px-2.5 py-1 text-sm font-mono">
										{domain.value}
									</code>
									{domain.isDefault && <Badge variant="secondary">Default</Badge>}
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Add Domain Dialog */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add domain</DialogTitle>
						<DialogDescription>
							Add a new domain configuration for your authentication services.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="domain-title">Title</Label>
							<Input
								id="domain-title"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								placeholder="e.g., Custom API"
								disabled={addingDomain}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="domain-description">
								Description <span className="text-muted-foreground">(optional)</span>
							</Label>
							<Input
								id="domain-description"
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
								placeholder="What this domain is used for"
								disabled={addingDomain}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="domain-value">Domain</Label>
							<Input
								id="domain-value"
								value={newValue}
								onChange={(e) => setNewValue(e.target.value)}
								placeholder="e.g., api.example.com"
								disabled={addingDomain}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="ghost"
							disabled={addingDomain}
							onClick={() => {
								setNewTitle("");
								setNewDescription("");
								setNewValue("");
								setAddDialogOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button onClick={handleAdd} disabled={!isAddFormValid || addingDomain}>
							{addingDomain && <Loader2 className="size-4 animate-spin" />}
							Add domain
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
