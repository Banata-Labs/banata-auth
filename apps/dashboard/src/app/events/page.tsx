"use client";

import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { listAuditEvents } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@banata-auth/shared";
import { Activity, Calendar, ChevronRight, Filter, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

function formatTime(date: Date) {
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

export default function EventsPage() {
	const activeProjectId = useActiveProjectId();
	const [events, setEvents] = useState<AuditEvent[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchEvents() {
			try {
				setIsLoading(true);
				setError(null);
				const data = await listAuditEvents();
				setEvents(data);
				if (data.length > 0 && data[0] !== undefined) {
					setSelectedEvent(data[0]);
				}
			} catch {
				setError("Unable to load events.");
			} finally {
				setIsLoading(false);
			}
		}
		void fetchEvents();
	}, [activeProjectId]);

	const filteredEvents = events.filter((event) =>
		event.action.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Events</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Monitor real-time events from your authentication and authorization systems.
				</p>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}

			{/* Filters */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search events..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Button variant="outline" size="sm">
					<Filter className="size-4" />
					Event type
				</Button>
				<Button variant="outline" size="sm">
					<Calendar className="size-4" />
					Date range
				</Button>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="size-5 animate-spin text-muted-foreground" />
				</div>
			)}

			{/* Two-panel layout */}
			{!isLoading && (
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
					{/* Left panel - Event list */}
					<Card className="gap-0 overflow-hidden py-0">
						<div className="grid grid-cols-[1fr_auto] border-b px-4 py-2.5">
							<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Event
							</span>
							<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Date and time
							</span>
						</div>
						<div className="max-h-[520px] overflow-y-auto">
							{filteredEvents.map((event) => (
								<button
									key={event.id}
									onClick={() => setSelectedEvent(event)}
									className={cn(
										"flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50",
										selectedEvent?.id === event.id && "bg-muted",
									)}
								>
									<div className="flex items-center gap-2">
										<Activity className="size-3.5 text-muted-foreground" />
										<span className="text-sm font-mono">{event.action}</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs text-muted-foreground">
											{formatTime(event.occurredAt)}
										</span>
										<ChevronRight className="size-3.5 text-muted-foreground" />
									</div>
								</button>
							))}
							{filteredEvents.length === 0 && (
								<div className="flex items-center justify-center py-12">
									<p className="text-sm text-muted-foreground">
										{events.length === 0
											? "No events recorded yet. Events will appear as users interact with your app."
											: "No events match your search."}
									</p>
								</div>
							)}
						</div>
					</Card>

					{/* Right panel - Event detail */}
					<Card className="gap-0 py-0">
						{selectedEvent ? (
							<>
								<CardHeader className="py-4">
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm font-mono">{selectedEvent.action}</CardTitle>
										<Badge variant="secondary" className="text-xs">
											{selectedEvent.id}
										</Badge>
									</div>
								</CardHeader>
								<Separator />
								<CardContent className="py-4">
									<div className="space-y-6">
										{/* Metadata */}
										<div>
											<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Metadata
											</h3>
											<div className="space-y-2">
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Timestamp</span>
													<span className="font-mono text-xs">
														{selectedEvent.occurredAt.toISOString()}
													</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Event ID</span>
													<span className="font-mono text-xs">{selectedEvent.id}</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Actor</span>
													<span className="font-mono text-xs">
														{selectedEvent.actor.name ??
															selectedEvent.actor.email ??
															selectedEvent.actor.id}{" "}
														<Badge variant="outline" className="text-[10px]">
															{selectedEvent.actor.type}
														</Badge>
													</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Version</span>
													<span className="font-mono text-xs">{selectedEvent.version}</span>
												</div>
											</div>
										</div>

										<Separator />

										{/* Webhooks */}
										<div>
											<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Webhooks
											</h3>
											<p className="text-sm text-muted-foreground">
												No webhook deliveries for this event.
											</p>
										</div>

										<Separator />

										{/* Details */}
										<div>
											<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Details
											</h3>
											<pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs font-mono leading-relaxed">
												{JSON.stringify(
													{
														action: selectedEvent.action,
														actor: selectedEvent.actor,
														targets: selectedEvent.targets,
														context: selectedEvent.context,
														changes: selectedEvent.changes,
														metadata: selectedEvent.metadata,
													},
													null,
													2,
												)}
											</pre>
										</div>
									</div>
								</CardContent>
							</>
						) : (
							<div className="flex items-center justify-center py-16">
								<p className="text-sm text-muted-foreground">Select an event to view details.</p>
							</div>
						)}
					</Card>
				</div>
			)}
		</div>
	);
}
