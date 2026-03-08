"use client";

import { useProjectEnvironment } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listOrganizations, listUsers } from "@/lib/dashboard-api";
import { ArrowRight, Building, ExternalLink, KeyRound, ScrollText, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyEnvBlock } from "./copy-env-block";

const quickStartLinks = [
	{
		title: "Users",
		description: "Add authentication to your app in minutes",
		href: "/users",
		icon: Users,
	},
	{
		title: "Organizations",
		description: "Multi-tenant organization management",
		href: "/organizations",
		icon: Building,
	},
	{
		title: "API Keys",
		description: "Manage programmatic access keys",
		href: "/api-keys",
		icon: KeyRound,
	},
	{
		title: "Audit Logs",
		description: "Event tracking and compliance",
		href: "/audit-logs",
		icon: ScrollText,
	},
];

export default function HomePage() {
	const { activeProject } = useProjectEnvironment();
	const activeProjectId = activeProject?.id ?? null;
	const [stats, setStats] = useState({ users: 0, organizations: 0 });
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const [users, organizations] = await Promise.all([
					listUsers().catch(() => []),
					listOrganizations().catch(() => []),
				]);
				if (!cancelled) {
					setStats({ users: users.length, organizations: organizations.length });
					setError(null);
				}
			} catch {
				if (!cancelled) setError("Unable to load dashboard metrics.");
			}
		}
		void load();
		return () => {
			cancelled = true;
		};
	}, [activeProjectId]);

	const clientId = activeProject?.slug ?? "";

	return (
		<div className="grid gap-8">
			{/* Page header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Production dashboard for auth operations and enterprise controls.
				</p>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}

			{/* Section 1: Product Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{/* Users card */}
				<Card className="relative overflow-hidden">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
								<Users className="size-4" />
							</div>
							<CardTitle className="text-sm">Users</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-semibold tracking-tight">
							{stats.users}{" "}
							<span className="text-base font-normal text-muted-foreground">Total</span>
						</p>
					</CardContent>
				</Card>

				{/* Organizations card */}
				<Card className="relative overflow-hidden">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
								<Building className="size-4" />
							</div>
							<CardTitle className="text-sm">Organizations</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-semibold tracking-tight">
							{stats.organizations}{" "}
							<span className="text-base font-normal text-muted-foreground">Total</span>
						</p>
					</CardContent>
				</Card>

				{/* Single Sign-On card */}
				<Card className="relative overflow-hidden opacity-60">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
									<KeyRound className="size-4" />
								</div>
								<CardTitle className="text-sm">Single Sign-On</CardTitle>
							</div>
							<Badge variant="secondary" className="text-[10px]">
								Soon
							</Badge>
						</div>
						<CardDescription className="text-xs">Enterprise SSO with SAML & OIDC</CardDescription>
					</CardHeader>
				</Card>

				{/* Audit Logs card */}
				<Card className="relative overflow-hidden">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
								<ScrollText className="size-4" />
							</div>
							<CardTitle className="text-sm">Audit Logs</CardTitle>
						</div>
						<CardDescription className="text-xs">Event tracking and compliance</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" size="sm" className="gap-1.5" asChild>
							<Link href="/audit-logs">
								View Audit Logs
								<ArrowRight className="size-3.5" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Section 2: Quick Start */}
			<div>
				<h2 className="text-lg font-semibold tracking-tight">Quick Start</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Get up and running with Banata Auth in your project.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Left: Environment variables */}
				<CopyEnvBlock clientId={clientId} />

				{/* Right: Quick start docs */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Finish the quick start docs</CardTitle>
						<CardDescription>Follow the guides to integrate each product.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-2">
						{quickStartLinks.map((link) => (
							<Link
								key={link.title}
								href={link.href}
								className="group flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-muted/50"
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
									<link.icon className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">{link.title}</p>
									<p className="truncate text-xs text-muted-foreground">{link.description}</p>
								</div>
								<ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
							</Link>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
