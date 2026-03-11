"use client";

import { ProjectAuthLogo } from "@/components/project-branding";
import { Button } from "@/components/ui/button";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import Link from "next/link";

export default function ErrorPage() {
	const { config, scopedPath } = useProjectAuthConfig();
	const params =
		typeof window === "undefined"
			? new URLSearchParams()
			: new URLSearchParams(window.location.search);
	const message = params.get("message") ?? "Unexpected authentication error";

	return (
		<AuthCard
			title="Unable to continue"
			description="The sign-in flow returned an error."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<p className="text-sm text-destructive">{message}</p>
			<Button asChild variant="outline">
				<Link href={scopedPath("/sign-in")}>Back to sign in</Link>
			</Button>
		</AuthCard>
	);
}
