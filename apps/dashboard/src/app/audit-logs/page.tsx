"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AuditEvent {
	id: string;
	action: string;
	actor: { type: string; id: string };
	occurredAt: Date;
}

export default function AuditLogsPage() {
	const [events, setEvents] = useState<AuditEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		if (!activeProjectId) {
			setEvents([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		listAuditEvents()
			.then(setEvents)
			.catch((err) => {
				reportError(err);
			})
			.finally(() => setIsLoading(false));
	}, [activeProjectId, reportError]);

	if (isLoading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<SkeletonTable cols={3} rows={6} />
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Review critical admin actions and compliance-relevant activity.
				</p>
			</div>
			{events.length === 0 && (
				<p className="text-sm text-muted-foreground">
					No audit events recorded yet. Events will appear here as actions occur.
				</p>
			)}
			<Card className="gap-0 overflow-hidden py-0">
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Action</TableHead>
								<TableHead>Actor</TableHead>
								<TableHead>Time</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{events.map((evt) => (
								<TableRow key={evt.id}>
									<TableCell>
										<Badge variant="secondary" className="font-mono">
											{evt.action}
										</Badge>
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{evt.actor.type}: {evt.actor.id}
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{evt.occurredAt.toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
