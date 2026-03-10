"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createApiKey, deleteApiKey, listApiKeys } from "@/lib/dashboard-api";
import type { ApiKey } from "@banata-auth/shared";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ApiKeysPage() {
	const activeProjectId = useActiveProjectId();
	const [name, setName] = useState("");
	const [prefix, setPrefix] = useState("");
	const [keys, setKeys] = useState<ApiKey[]>([]);
	const [newKey, setNewKey] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

	const refreshKeys = useCallback(async () => {
		if (!activeProjectId) {
			setKeys([]);
			return;
		}
		setKeys(await listApiKeys());
	}, [activeProjectId]);

	useEffect(() => {
		void refreshKeys().catch(() => {
			toast.error("Unable to load API keys");
		});
	}, [refreshKeys]);

	async function handleDelete(keyId: string) {
		setDeletingId(keyId);
		try {
			await deleteApiKey(keyId);
			setKeys((prev) => prev.filter((k) => k.id !== keyId));
			setConfirmDelete(null);
			toast.success("API key revoked");
		} catch {
			toast.error("Failed to revoke API key");
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Create and manage API keys for programmatic access.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Create API Key</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								const result = await createApiKey(name, prefix || undefined);
								setNewKey(result.key);
								setName("");
								setPrefix("");
								await refreshKeys();
								toast.success("API key created");
							} catch (error) {
								toast.error(error instanceof Error ? error.message : "Unable to create API key");
							}
						}}
						className="flex gap-3"
					>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Key name (e.g. production)"
							required
							className="flex-1"
						/>
						<Input
							value={prefix}
							onChange={(e) => setPrefix(e.target.value)}
							placeholder="bk_"
							className="w-28 font-mono text-xs"
						/>
						<Button type="submit">Create Key</Button>
					</form>
				</CardContent>
			</Card>
			{newKey && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle className="text-sm text-primary">New API key created</CardTitle>
						<CardDescription>Copy it now - it will not be shown again.</CardDescription>
					</CardHeader>
					<CardContent>
						<code className="block break-all rounded bg-muted p-2 font-mono text-xs">{newKey}</code>
					</CardContent>
				</Card>
			)}
			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Key Prefix</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="w-[80px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{keys.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
										No API keys yet.
									</TableCell>
								</TableRow>
							) : (
								keys.map((k) => (
									<TableRow key={k.id}>
										<TableCell className="font-medium">{k.name}</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{k.prefix}...
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{k.createdAt.toLocaleString()}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												className="size-8 text-muted-foreground hover:text-destructive"
												disabled={deletingId === k.id}
												onClick={() => setConfirmDelete({ id: k.id, name: k.name })}
											>
												<Trash2 className="size-4" />
												<span className="sr-only">Revoke key</span>
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Revoke API key?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. Key name: {confirmDelete?.name}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmDelete(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => confirmDelete && void handleDelete(confirmDelete.id)}
							disabled={!confirmDelete || deletingId === confirmDelete.id}
						>
							Revoke
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
