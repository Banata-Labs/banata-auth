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
import { type DomainConfigItem, deleteDomain, listDomains, saveDomain } from "@/lib/dashboard-api";
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

	const { reportError } = useBackendStatus();

	const fetchDomains = useCallback(async () => {
		try {
			let items = await listDomains();

			// Seed defaults on first load if backend is empty
			if (items.length === 0) {
				await Promise.all(DEFAULT_DOMAINS.map((d) => saveDomain(d)));
				items = await listDomains();
			}

			setDomains(items);
		} catch (err) {
			reportError(err);
		} finally {
			setLoading(false);
		}
	}, [activeProjectId]);

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

	const isAddFormValid = newTitle.trim() && newValue.trim();

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader withButton />
				<div className="grid gap-4">
					{Array.from({ length: 4 }, (_, i) => (
						<SkeletonCard key={i} lines={0}>
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
