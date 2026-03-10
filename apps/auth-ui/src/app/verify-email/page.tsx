"use client";

import { Button } from "@/components/ui/button";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import Link from "next/link";

export default function VerifyEmailPage() {
	const { scopedPath } = useProjectAuthConfig();

	return (
		<AuthCard
			title="Check your inbox"
			description="Use the verification link to continue account setup."
		>
			<p className="text-sm text-muted-foreground">
				This screen supports brand customization and i18n in later phases.
			</p>
			<Button asChild variant="outline">
				<Link href={scopedPath("/sign-in")}>Back to sign in</Link>
			</Button>
		</AuthCard>
	);
}
