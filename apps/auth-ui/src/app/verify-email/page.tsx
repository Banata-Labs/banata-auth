"use client";

import { ProjectAuthLogo } from "@/components/project-branding";
import { Button } from "@/components/ui/button";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import Link from "next/link";

export default function VerifyEmailPage() {
	const { config, scopedPath } = useProjectAuthConfig();

	return (
		<AuthCard
			title="Check your inbox"
			description="Use the verification link to continue account setup."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<p className="text-sm text-muted-foreground">
				Once verification completes, Banata will continue the hosted sign-in flow.
			</p>
			<Button asChild variant="outline">
				<Link href={scopedPath("/sign-in")}>Back to sign in</Link>
			</Button>
		</AuthCard>
	);
}
