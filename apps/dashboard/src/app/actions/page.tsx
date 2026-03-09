"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SkeletonHeader, SkeletonTable } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type ActionItem, createAction, deleteAction, listActions } from "@/lib/dashboard-api";
import { Loader2, Plus, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const TRIGGER_EVENTS = [
	"user.created",
	"user.updated",
	"user.deleted",
	"session.created",
	"session.revoked",
	"organization.created",
	"organization.updated",
	"email.verified",
	"password.changed",
	"mfa.enabled",
] as const;

type TriggerEvent = (typeof TRIGGER_EVENTS)[number];

interface Action {
	id: string;
	name: string;
	description: string;
	triggerEvent: TriggerEvent;
	webhookUrl: string;
	createdAt: string;
}

function mapItem(item: ActionItem): Action {
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		triggerEvent: item.triggerEvent as TriggerEvent,
		webhookUrl: item.webhookUrl,
		createdAt: item.createdAt,
	};
}

export default function ActionsPage() {
	const [actions, setActions] = useState<Action[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [triggerEvent, setTriggerEvent] = useState<TriggerEvent | "">("");
	const [webhookUrl, setWebhookUrl] = useState("");

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	const fetchActions = useCallback(async () => {
		if (!activeProjectId) {
			setActions([]);
			setLoading(false);
			return;
		}

		try {
			const items = await listActions();
			setActions(items.map(mapItem));
		} catch (err) {
			reportError(err);
		} finally {
			setLoading(false);
		}
	}, [activeProjectId, reportError]);

	useEffect(() => {
		fetchActions();
	}, [fetchActions]);

	const resetForm = () => {
		setName("");
		setDescription("");
		setTriggerEvent("");
		setWebhookUrl("");
	};

	const handleCreate = async () => {
		if (!name.trim() || !triggerEvent || !webhookUrl.trim()) return;
		setCreating(true);
		try {
			const item = await createAction({
				name: name.trim(),
				description: description.trim(),
				triggerEvent,
				webhookUrl: webhookUrl.trim(),
			});
			setActions((prev) => [...prev, mapItem(item)]);
			toast.success("Action created");
			resetForm();
			setDialogOpen(false);
		} catch {
			toast.error("Failed to create action");
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteAction(id);
			setActions((prev) => prev.filter((a) => a.id !== id));
			toast.success("Action deleted");
		} catch {
			toast.error("Failed to delete action");
		} finally {
			setDeletingId(null);
		}
	};

	const isFormValid = name.trim() && triggerEvent && webhookUrl.trim();

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader withButton />
				<SkeletonTable cols={5} rows={5} />
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Actions</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Configure automated actions triggered by events.
					</p>
				</div>
				<Button onClick={() => setDialogOpen(true)}>
					<Plus className="size-4" />
					Create action
				</Button>
			</div>

			{actions.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<Zap className="size-6 text-muted-foreground" />
					</div>
					<h3 className="mt-4 text-sm font-medium">No actions configured</h3>
					<p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
						Actions allow you to automate workflows based on events in your application. Create your
						first action to get started.
					</p>
					<Button className="mt-4" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
						<Plus className="size-4" />
						Create action
					</Button>
				</div>
			) : (
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Trigger Event</TableHead>
								<TableHead>Webhook URL</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="w-[60px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{actions.map((action) => (
								<TableRow key={action.id}>
									<TableCell className="font-medium">{action.name}</TableCell>
									<TableCell>
										<Badge variant="secondary">{action.triggerEvent}</Badge>
									</TableCell>
									<TableCell>
										<code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
											{action.webhookUrl}
										</code>
									</TableCell>
									<TableCell className="text-muted-foreground max-w-[200px] truncate">
										{action.description || "\u2014"}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											disabled={deletingId === action.id}
											onClick={() => handleDelete(action.id)}
										>
											{deletingId === action.id ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Trash2 className="size-4 text-destructive" />
											)}
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Create Action Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create action</DialogTitle>
						<DialogDescription>
							Define an automated action that triggers a webhook when an event occurs.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="action-name">Name</Label>
							<Input
								id="action-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Sync new users to CRM"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="action-description">
								Description <span className="text-muted-foreground">(optional)</span>
							</Label>
							<Input
								id="action-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Brief description of what this action does"
							/>
						</div>

						<div className="grid gap-2">
							<Label>Trigger Event</Label>
							<Select
								value={triggerEvent}
								onValueChange={(val) => setTriggerEvent(val as TriggerEvent)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a trigger event" />
								</SelectTrigger>
								<SelectContent>
									{TRIGGER_EVENTS.map((event) => (
										<SelectItem key={event} value={event}>
											{event}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="action-webhook">Webhook URL</Label>
							<Input
								id="action-webhook"
								value={webhookUrl}
								onChange={(e) => setWebhookUrl(e.target.value)}
								placeholder="https://api.example.com/webhook"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="ghost"
							onClick={() => {
								resetForm();
								setDialogOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={!isFormValid || creating}>
							{creating && <Loader2 className="size-4 animate-spin" />}
							Create action
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
