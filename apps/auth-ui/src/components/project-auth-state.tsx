"use client";

import { AuthCard } from "@banata-auth/react";
import Link from "next/link";

export function MissingProjectScopeCard() {
	return (
		<AuthCard
			title="Project scope required"
			description="This hosted auth UI only works when a Banata project is selected."
		>
			<p className="text-sm text-muted-foreground">
				Open this page with a <code>client_id</code> or <code>project_id</code> query parameter so
				Banata can load the correct customer configuration.
			</p>
		</AuthCard>
	);
}

export function LoadingProjectAuthCard({ title }: { title: string }) {
	return (
		<AuthCard title={title} description="Loading project auth configuration.">
			<p className="text-sm text-muted-foreground">
				Fetching the enabled methods and providers for this project.
			</p>
		</AuthCard>
	);
}

export function ProjectAuthErrorCard({
	title,
	message,
}: {
	title: string;
	message: string;
}) {
	return (
		<AuthCard title={title} description="Unable to load this project's auth configuration.">
			<p className="text-sm text-destructive">{message}</p>
		</AuthCard>
	);
}

export function DisabledAuthMethodCard({
	title,
	description,
	backHref,
	backLabel,
}: {
	title: string;
	description: string;
	backHref: string;
	backLabel?: string;
}) {
	return (
		<AuthCard title={title} description={description}>
			<p className="text-sm text-muted-foreground">
				This method is disabled for the selected Banata project.
			</p>
			<p className="text-sm text-muted-foreground">
				<Link href={backHref} className="underline">
					{backLabel ?? "Back to sign in"}
				</Link>
			</p>
		</AuthCard>
	);
}
