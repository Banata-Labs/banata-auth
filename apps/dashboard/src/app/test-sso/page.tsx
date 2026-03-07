import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FlaskConical, Play } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// ORIGINAL IMPLEMENTATION (restore when SSO plugin is available)
// ──────────────────────────────────────────────────────────────────────
// "use client";
//
// import { useEffect, useState, useCallback } from "react";
// import type { Organization, SsoConnection } from "@banata-auth/shared";
// import { listOrganizations, listConnections } from "@/lib/dashboard-api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { FlaskConical, Play, CheckCircle2, XCircle } from "lucide-react";
//
// interface TestResult {
// 	status: "success" | "error";
// 	message: string;
// 	details?: Record<string, unknown>;
// }
//
// export default function TestSSOPage() {
// 	const [organizations, setOrganizations] = useState<Organization[]>([]);
// 	const [connections, setConnections] = useState<SsoConnection[]>([]);
// 	const [selectedOrg, setSelectedOrg] = useState("");
// 	const [selectedConnection, setSelectedConnection] = useState("");
// 	const [testing, setTesting] = useState(false);
// 	const [result, setResult] = useState<TestResult | null>(null);
//
// 	const loadData = useCallback(async () => {
// 		try {
// 			const [orgs, conns] = await Promise.all([
// 				listOrganizations(),
// 				listConnections(),
// 			]);
// 			setOrganizations(orgs);
// 			setConnections(conns);
// 		} catch {
// 			// Failed to load data
// 		}
// 	}, []);
//
// 	useEffect(() => { void loadData(); }, [loadData]);
//
// 	const filteredConnections = selectedOrg
// 		? connections.filter((c) => c.organizationId === selectedOrg)
// 		: connections;
//
// 	const runTest = async () => {
// 		if (!selectedConnection) return;
// 		setTesting(true);
// 		setResult(null);
// 		try {
// 			const response = await fetch("/api/auth/sso/authorize", {
// 				method: "POST",
// 				credentials: "include",
// 				headers: { "content-type": "application/json" },
// 				body: JSON.stringify({
// 					connectionId: selectedConnection,
// 					redirectUri: window.location.href,
// 				}),
// 			});
// 			if (response.ok) {
// 				const data = (await response.json()) as Record<string, unknown>;
// 				setResult({
// 					status: "success",
// 					message: "SSO flow initiated successfully.",
// 					details: data,
// 				});
// 			} else {
// 				setResult({
// 					status: "error",
// 					message: `SSO test failed: ${response.status} ${response.statusText}`,
// 				});
// 			}
// 		} catch (err) {
// 			setResult({
// 				status: "error",
// 				message: err instanceof Error ? err.message : "Unknown error",
// 			});
// 		} finally {
// 			setTesting(false);
// 		}
// 	};
//
// 	return (
// 		<div className="grid gap-6">
// 			<div>
// 				<h1 className="text-2xl font-semibold tracking-tight">
// 					Test SSO
// 				</h1>
// 				<p className="mt-1 text-sm text-muted-foreground">
// 					Test your Single Sign-On connections before going live.
// 				</p>
// 			</div>
//
// 			<Card>
// 				<CardHeader>
// 					<CardTitle className="text-sm">
// 						<FlaskConical className="mr-2 inline size-4" />
// 						Test Configuration
// 					</CardTitle>
// 				</CardHeader>
// 				<CardContent className="grid gap-4">
// 					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// 						<Select
// 							value={selectedOrg}
// 							onValueChange={(val) => {
// 								setSelectedOrg(val);
// 								setSelectedConnection("");
// 							}}
// 						>
// 							<SelectTrigger>
// 								<SelectValue placeholder="Select organization" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								{organizations.map((org) => (
// 									<SelectItem key={org.id} value={org.id}>
// 										{org.name}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 						<Select
// 							value={selectedConnection}
// 							onValueChange={setSelectedConnection}
// 						>
// 							<SelectTrigger>
// 								<SelectValue placeholder="Select connection" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								{filteredConnections.map((c) => (
// 									<SelectItem key={c.id} value={c.id}>
// 										{c.name} ({c.type.toUpperCase()})
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 					<Button
// 						onClick={() => void runTest()}
// 						disabled={!selectedConnection || testing}
// 						className="w-fit"
// 					>
// 						<Play className="mr-2 size-4" />
// 						{testing ? "Testing..." : "Run Test"}
// 					</Button>
// 				</CardContent>
// 			</Card>
//
// 			{result && (
// 				<Card>
// 					<CardHeader>
// 						<CardTitle className="flex items-center gap-2 text-sm">
// 							{result.status === "success" ? (
// 								<CheckCircle2 className="size-4 text-green-500" />
// 							) : (
// 								<XCircle className="size-4 text-destructive" />
// 							)}
// 							Test Result
// 						</CardTitle>
// 					</CardHeader>
// 					<CardContent>
// 						<p className="text-sm">{result.message}</p>
// 						{result.details && (
// 							<pre className="mt-3 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
// 								{JSON.stringify(result.details, null, 2)}
// 							</pre>
// 						)}
// 					</CardContent>
// 				</Card>
// 			)}
// 		</div>
// 	);
// }
// ──────────────────────────────────────────────────────────────────────

export default function TestSSOPage() {
	return (
		<div className="grid gap-6">
			<div>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-semibold tracking-tight">Test SSO</h1>
					<Badge variant="secondary">Coming Soon</Badge>
				</div>
				<p className="mt-1 text-sm text-muted-foreground">
					Test your Single Sign-On connections before going live.
				</p>
			</div>

			<Card className="border-dashed">
				<CardHeader className="items-center text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<FlaskConical className="size-6 text-muted-foreground" />
					</div>
					<CardTitle className="text-base">SSO Connection Testing</CardTitle>
					<CardDescription className="max-w-md">
						Select an organization and SSO connection to run an end-to-end authentication test.
						Verify SAML/OIDC flows, attribute mapping, and JIT provisioning before enabling for
						users.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center gap-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div className="flex items-center gap-2 rounded-md border px-3 py-2">
							<Play className="size-4 text-muted-foreground" />
							<span className="text-sm">Flow Testing</span>
						</div>
						<div className="flex items-center gap-2 rounded-md border px-3 py-2">
							<CheckCircle2 className="size-4 text-muted-foreground" />
							<span className="text-sm">Validation</span>
						</div>
						<div className="flex items-center gap-2 rounded-md border px-3 py-2">
							<FlaskConical className="size-4 text-muted-foreground" />
							<span className="text-sm">Sandbox</span>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						This feature depends on SSO Connections and will be available when enterprise SSO
						launches.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
