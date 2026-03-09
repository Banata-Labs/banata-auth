"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Copy, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type DomainVerification = {
	id: string;
	organizationId: string;
	domain: string;
	state: "pending" | "verified" | "failed" | "expired";
	method: "dns_txt";
	txtRecord: { name: string; value: string };
	verifiedAt: number | null;
	expiresAt: number | null;
	lastCheckedAt: number | null;
	checkCount: number;
	createdAt: number;
	updatedAt: number;
};

function stateVariant(state: DomainVerification["state"]) {
	if (state === "verified") return "default" as const;
	if (state === "pending") return "secondary" as const;
	return "destructive" as const;
}

function formatTimestamp(value: number | null) {
	if (!value) return "-";
	return new Date(value).toLocaleString();
}

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
	const response = await fetch(path, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || `Request failed: ${response.status}`);
	}
	return (await response.json()) as T;
}

export default function DomainVerificationPage() {
	const [projectId, setProjectId] = useState("");
	const [organizationId, setOrganizationId] = useState("");
	const [domain, setDomain] = useState("");
	const [records, setRecords] = useState<DomainVerification[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function refreshRecords() {
		if (!projectId || !organizationId) {
			setRecords([]);
			return;
		}
		try {
			setIsLoading(true);
			setError(null);
			const payload = await request<{ data?: DomainVerification[] }>(
				"/api/auth/banata/domains/list",
				{ projectId, organizationId },
			);
			setRecords(Array.isArray(payload.data) ? payload.data : []);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to load domain verifications.");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (!projectId || !organizationId) return;
		void (async () => {
			try {
				setIsLoading(true);
				setError(null);
				const payload = await request<{ data?: DomainVerification[] }>(
					"/api/auth/banata/domains/list",
					{ projectId, organizationId },
				);
				setRecords(Array.isArray(payload.data) ? payload.data : []);
			} catch (caught) {
				setError(caught instanceof Error ? caught.message : "Unable to load domain verifications.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [projectId, organizationId]);

	async function handleCreate() {
		try {
			setIsSubmitting(true);
			setError(null);
			if (!projectId || !organizationId || !domain.trim()) {
				throw new Error("Project ID, organization ID, and domain are required.");
			}
			await request<DomainVerification>("/api/auth/banata/domains/create", {
				projectId,
				organizationId,
				domain: domain.trim().toLowerCase(),
			});
			setDomain("");
			await refreshRecords();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to create domain verification.");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleVerify(id: string) {
		try {
			setBusyId(id);
			setError(null);
			await request<DomainVerification>("/api/auth/banata/domains/verify", { projectId, id });
			await refreshRecords();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to verify domain.");
		} finally {
			setBusyId(null);
		}
	}

	async function handleDelete(id: string) {
		if (!window.confirm("Delete this domain verification?")) {
			return;
		}
		try {
			setBusyId(id);
			setError(null);
			await request<{ success: boolean }>("/api/auth/banata/domains/delete", { projectId, id });
			await refreshRecords();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Unable to delete domain verification.");
		} finally {
			setBusyId(null);
		}
	}

	async function copyValue(value: string) {
		await navigator.clipboard.writeText(value);
	}

	return (
		<section className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Domain Verification</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage DNS TXT verification records for enterprise domain routing.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Create verification</CardTitle>
					<CardDescription>
						Generate the TXT record Banata expects before marking a domain as verified.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="grid gap-2">
						<Label htmlFor="project-id">Project ID</Label>
						<Input
							id="project-id"
							placeholder="proj_123"
							value={projectId}
							onChange={(event) => setProjectId(event.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="organization-id">Organization ID</Label>
						<Input
							id="organization-id"
							placeholder="org_123"
							value={organizationId}
							onChange={(event) => setOrganizationId(event.target.value)}
						/>
					</div>
					<div className="grid gap-2 md:col-span-2">
						<Label htmlFor="domain">Domain</Label>
						<Input
							id="domain"
							placeholder="acme.com"
							value={domain}
							onChange={(event) => setDomain(event.target.value)}
						/>
					</div>
					<div className="md:col-span-2 flex flex-wrap gap-2">
						<Button type="button" onClick={() => void handleCreate()} disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create verification"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() => void refreshRecords()}
							disabled={isLoading}
						>
							<RefreshCw className="mr-2 size-4" />
							Refresh
						</Button>
					</div>
					{error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
				</CardContent>
			</Card>

			{records.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">TXT record instructions</CardTitle>
						<CardDescription>
							Publish these values in DNS, then run verification again.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						{records.map((record) => (
							<div key={record.id} className="grid gap-3 rounded-lg border p-3">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="text-sm font-medium">{record.domain}</p>
										<p className="text-xs text-muted-foreground">{record.organizationId}</p>
									</div>
									<Badge variant={stateVariant(record.state)}>{record.state}</Badge>
								</div>
								<div className="rounded-md border px-3 py-2">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="text-xs uppercase tracking-wide text-muted-foreground">
												TXT name
											</p>
											<p className="mt-1 break-all font-mono text-xs">{record.txtRecord.name}</p>
										</div>
										<Button
											type="button"
											size="sm"
											variant="outline"
											onClick={() => void copyValue(record.txtRecord.name)}
										>
											<Copy className="size-4" />
										</Button>
									</div>
								</div>
								<div className="rounded-md border px-3 py-2">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="text-xs uppercase tracking-wide text-muted-foreground">
												TXT value
											</p>
											<p className="mt-1 break-all font-mono text-xs">{record.txtRecord.value}</p>
										</div>
										<Button
											type="button"
											size="sm"
											variant="outline"
											onClick={() => void copyValue(record.txtRecord.value)}
										>
											<Copy className="size-4" />
										</Button>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			) : null}

			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader>
					<CardTitle className="text-base">Verification records</CardTitle>
					<CardDescription>Entries returned by `/api/auth/banata/domains/list`.</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Domain</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Checks</TableHead>
								<TableHead>Verified</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
										Loading verification records...
									</TableCell>
								</TableRow>
							) : records.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
										<div className="flex flex-col items-center gap-2">
											<ShieldCheck className="size-5 text-muted-foreground/50" />
											<p>No domain verifications found.</p>
											<p className="text-xs">Create a record above to start DNS verification.</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								records.map((record) => {
									const isBusy = busyId === record.id;
									return (
										<TableRow key={record.id}>
											<TableCell>
												<div className="grid gap-1">
													<p className="font-medium">{record.domain}</p>
													<p className="font-mono text-xs text-muted-foreground">{record.id}</p>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={stateVariant(record.state)}>{record.state}</Badge>
											</TableCell>
											<TableCell>{record.checkCount}</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{formatTimestamp(record.verifiedAt)}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{formatTimestamp(record.expiresAt)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														type="button"
														size="sm"
														variant="outline"
														disabled={isBusy}
														onClick={() => void handleVerify(record.id)}
													>
														Verify
													</Button>
													<Button
														type="button"
														size="sm"
														variant="outline"
														disabled={isBusy}
														onClick={() => void handleDelete(record.id)}
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</section>
	);
}
