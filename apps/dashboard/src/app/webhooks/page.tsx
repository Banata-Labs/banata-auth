"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
	createWebhookEndpoint,
	deleteWebhookEndpoint,
	listWebhookEndpoints,
	updateWebhookEndpoint,
} from "@/lib/dashboard-api";
import type { WebhookEndpoint } from "@banata-auth/shared";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const AVAILABLE_WEBHOOK_EVENTS = [
	"user.created",
	"user.updated",
	"user.deleted",
	"session.created",
	"session.revoked",
	"organization.created",
	"organization.updated",
	"organization.deleted",
	"member.invited",
	"member.joined",
	"member.removed",
	"api_key.created",
	"api_key.deleted",
	"audit.event.created",
] as const;

export default function WebhooksPage() {
	const [url, setUrl] = useState("");
	const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
	const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<{ id: string; url: string } | null>(null);
	const [editingEndpoint, setEditingEndpoint] = useState<WebhookEndpoint | null>(null);
	const [editingEvents, setEditingEvents] = useState<string[]>([]);

	const refreshEndpoints = useCallback(async () => {
		setEndpoints(await listWebhookEndpoints());
	}, []);

	useEffect(() => {
		void refreshEndpoints().catch(() => {
			toast.error("Unable to load webhooks");
		});
	}, [refreshEndpoints]);

	async function handleDelete(endpointId: string) {
		setDeletingId(endpointId);
		try {
			await deleteWebhookEndpoint(endpointId);
			setEndpoints((prev) => prev.filter((ep) => ep.id !== endpointId));
			toast.success("Webhook endpoint deleted");
			setConfirmDelete(null);
		} catch {
			toast.error("Failed to delete webhook endpoint");
		} finally {
			setDeletingId(null);
		}
	}

	async function handleUpdateEvents() {
		if (!editingEndpoint) return;
		try {
			await updateWebhookEndpoint({ id: editingEndpoint.id, eventTypes: editingEvents });
			await refreshEndpoints();
			setEditingEndpoint(null);
			setEditingEvents([]);
			toast.success("Webhook events updated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update webhook events");
		}
	}

	const toggleEvent = (value: string, current: string[], setCurrent: (next: string[]) => void) => {
		setCurrent(current.includes(value) ? current.filter((e) => e !== value) : [...current, value]);
	};

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage webhook endpoints for real-time event delivery.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Add Endpoint</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								await createWebhookEndpoint(url, selectedEvents);
								setUrl("");
								setSelectedEvents([]);
								await refreshEndpoints();
								toast.success("Webhook endpoint created");
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Unable to create webhook");
							}
						}}
						className="grid gap-3"
					>
						<div className="flex gap-3">
							<Input
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="https://your-app.com/webhooks"
								required
								className="flex-1"
							/>
							<Button type="submit">Add</Button>
						</div>
						<div className="grid gap-2">
							<p className="text-xs text-muted-foreground">Events (optional, defaults to all)</p>
							<div className="flex flex-wrap gap-2">
								{AVAILABLE_WEBHOOK_EVENTS.map((event) => {
									const selected = selectedEvents.includes(event);
									return (
										<Button
											key={event}
											type="button"
											variant={selected ? "default" : "outline"}
											size="sm"
											onClick={() => toggleEvent(event, selectedEvents, setSelectedEvents)}
										>
											{event}
										</Button>
									);
								})}
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>URL</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Events</TableHead>
								<TableHead>Deliveries</TableHead>
								<TableHead className="w-[160px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{endpoints.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
										No webhook endpoints configured.
									</TableCell>
								</TableRow>
							) : (
								endpoints.map((ep) => (
									<TableRow key={ep.id}>
										<TableCell className="font-mono text-xs">{ep.url}</TableCell>
										<TableCell>
											<Badge variant={ep.enabled ? "default" : "secondary"}>
												{ep.enabled ? "Active" : "Disabled"}
											</Badge>
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{ep.eventTypes.length === 0 ? "All events" : ep.eventTypes.join(", ")}
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{ep.successCount} ok / {ep.failureCount} failed
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setEditingEndpoint(ep);
														setEditingEvents(ep.eventTypes);
													}}
												>
													Edit events
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="size-8 text-muted-foreground hover:text-destructive"
													disabled={deletingId === ep.id}
													onClick={() => setConfirmDelete({ id: ep.id, url: ep.url })}
												>
													<Trash2 className="size-4" />
													<span className="sr-only">Delete endpoint</span>
												</Button>
											</div>
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
						<DialogTitle>Delete webhook endpoint?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. Endpoint URL: {confirmDelete?.url}
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
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={!!editingEndpoint} onOpenChange={(open) => !open && setEditingEndpoint(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit webhook events</DialogTitle>
						<DialogDescription>Select which events this endpoint should receive.</DialogDescription>
					</DialogHeader>
					<div className="flex flex-wrap gap-2">
						{AVAILABLE_WEBHOOK_EVENTS.map((event) => {
							const selected = editingEvents.includes(event);
							return (
								<Button
									key={event}
									type="button"
									variant={selected ? "default" : "outline"}
									size="sm"
									onClick={() => toggleEvent(event, editingEvents, setEditingEvents)}
								>
									{event}
								</Button>
							);
						})}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingEndpoint(null)}>
							Cancel
						</Button>
						<Button onClick={() => void handleUpdateEvents()} disabled={!editingEndpoint}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
