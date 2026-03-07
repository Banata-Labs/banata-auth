"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard, SkeletonListRow } from "@/components/ui/skeleton";
import { listAuditEvents } from "@/lib/dashboard-api";
import { formatRelativeTime } from "@/lib/utils";
import type { AuditEvent } from "@banata-auth/shared";
import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const IMPORTANT_ACTIONS = [
	"user.created",
	"user.deleted",
	"password.changed",
	"mfa.enabled",
	"organization.created",
	"organization.deleted",
	"member.invited",
	"member.removed",
	"api-key.created",
	"webhook.created",
];

function isImportantEvent(event: AuditEvent): boolean {
	return IMPORTANT_ACTIONS.some((action) => event.action.includes(action));
}

function actorLabel(event: AuditEvent): string {
	return event.actor.name || event.actor.email || event.actor.id;
}

export default function NotificationsPage() {
	const activeProjectId = useActiveProjectId();
	const [notifications, setNotifications] = useState<AuditEvent[]>([]);
	const [loading, setLoading] = useState(true);

	const { reportError } = useBackendStatus();

	useEffect(() => {
		listAuditEvents()
			.then((events) => {
				setNotifications(events.filter(isImportantEvent));
			})
			.catch((err) => {
				reportError(err);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [activeProjectId]);

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
				<p className="mt-1 text-sm text-muted-foreground">View system notifications and alerts.</p>
			</div>

			{loading ? (
				<SkeletonCard lines={0}>
					<div className="space-y-3">
						{Array.from({ length: 6 }, (_, i) => (
							<SkeletonListRow key={i} />
						))}
					</div>
				</SkeletonCard>
			) : notifications.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<Bell className="size-6 text-muted-foreground" />
					</div>
					<h3 className="mt-4 text-sm font-medium">No notifications</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						You&apos;re all caught up. Check back later for updates.
					</p>
				</div>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Activity</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4">
						{notifications.map((event) => (
							<div
								key={event.id}
								className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
							>
								<div className="flex items-center gap-3 min-w-0">
									<Badge variant="secondary" className="shrink-0">
										{event.action}
									</Badge>
									<span className="truncate text-sm text-muted-foreground">
										{actorLabel(event)}
									</span>
								</div>
								<span className="shrink-0 text-xs text-muted-foreground">
									{formatRelativeTime(event.occurredAt)}
								</span>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
