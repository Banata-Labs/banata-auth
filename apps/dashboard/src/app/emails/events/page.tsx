"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { SkeletonHeader, SkeletonTable } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { listAuditEvents } from "@/lib/dashboard-api";
import { formatRelativeTime } from "@/lib/utils";
import type { AuditEvent } from "@banata-auth/shared";
import { Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const EMAIL_ACTION_KEYWORDS = [
	"email",
	"verification",
	"magic-link",
	"otp",
	"password-reset",
	"invitation",
];

function isEmailEvent(event: AuditEvent): boolean {
	const action = event.action.toLowerCase();
	return EMAIL_ACTION_KEYWORDS.some((keyword) => action.includes(keyword));
}

export default function EmailEventsPage() {
	const [events, setEvents] = useState<AuditEvent[]>([]);
	const [loading, setLoading] = useState(true);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		if (!activeProjectId) {
			setEvents([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		listAuditEvents()
			.then((allEvents) => {
				setEvents(allEvents.filter(isEmailEvent));
			})
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setLoading(false));
	}, [activeProjectId, reportError]);

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Email Events</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Track email delivery, opens, and bounces.
				</p>
			</div>

			{loading ? (
				<>
					<SkeletonTable cols={3} rows={6} />
				</>
			) : events.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<Mail className="size-6 text-muted-foreground" />
					</div>
					<h3 className="mt-4 text-sm font-medium">No email events found</h3>
					<p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
						No email events found in the last 30 days. Events will appear here once emails are sent
						through your configured provider.
					</p>
				</div>
			) : (
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Event</TableHead>
								<TableHead>Recipient</TableHead>
								<TableHead className="text-right">Time</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{events.map((event) => (
								<TableRow key={event.id}>
									<TableCell>
										<Badge variant="secondary">{event.action}</Badge>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{event.actor.email ?? "—"}
									</TableCell>
									<TableCell className="text-right text-sm text-muted-foreground">
										{formatRelativeTime(event.occurredAt)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
