"use client";

import { ProjectAuthLogo } from "@/components/project-branding";
import { AuthCard } from "@banata-auth/react";
import type { RuntimeBrandingConfig } from "@banata-auth/shared";
import Link from "next/link";

function renderLogo(branding?: RuntimeBrandingConfig | null) {
	return <ProjectAuthLogo branding={branding} />;
}

export function MissingProjectScopeCard({
	branding,
}: { branding?: RuntimeBrandingConfig | null } = {}) {
	return (
		<AuthCard
			title="Project scope required"
			description="This hosted auth UI only works when a Banata project is selected."
			logo={renderLogo(branding)}
		>
			<p className="text-sm text-muted-foreground">
				Open this page with a <code>client_id</code> or <code>project_id</code> query parameter so
				Banata can load the correct customer configuration.
			</p>
		</AuthCard>
	);
}

export function LoadingProjectAuthCard({
	title,
	branding,
}: {
	title: string;
	branding?: RuntimeBrandingConfig | null;
}) {
	return (
		<AuthCard
			title={title}
			description="Loading project auth configuration."
			logo={renderLogo(branding)}
		>
			<p className="text-sm text-muted-foreground">
				Fetching the enabled methods and providers for this project.
			</p>
		</AuthCard>
	);
}

export function ProjectAuthErrorCard({
	title,
	message,
	branding,
}: {
	title: string;
	message: string;
	branding?: RuntimeBrandingConfig | null;
}) {
	return (
		<AuthCard
			title={title}
			description="Unable to load this project's auth configuration."
			logo={renderLogo(branding)}
		>
			<p className="text-sm text-destructive">{message}</p>
		</AuthCard>
	);
}

export function DisabledAuthMethodCard({
	title,
	description,
	backHref,
	backLabel,
	branding,
}: {
	title: string;
	description: string;
	backHref: string;
	backLabel?: string;
	branding?: RuntimeBrandingConfig | null;
}) {
	return (
		<AuthCard title={title} description={description} logo={renderLogo(branding)}>
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
