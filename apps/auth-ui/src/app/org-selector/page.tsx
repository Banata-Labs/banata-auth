"use client";

import { Button } from "@/components/ui/button";
import { postCrossDomainAuthJson, useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useEffect, useState } from "react";

type Org = { id: string; name: string; role?: string };

/**
 * Type-safe wrapper around Better Auth's organization client plugin.
 * The organization plugin adds `.organization.setActive()` at runtime,
 * but the base `createAuthClient` return type doesn't include it.
 */
interface OrganizationClient {
	organization: {
		setActive: (params: { organizationId: string }) => Promise<unknown>;
	};
}

export default function OrgSelectorPage() {
	const [orgs, setOrgs] = useState<Org[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { customerAuthBaseUrl, scopedPath } = useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	useEffect(() => {
		if (!customerAuthBaseUrl) {
			setError("Hosted auth is missing the customer app callback target.");
			setIsLoading(false);
			return;
		}
		void (async () => {
			try {
				const response = await postCrossDomainAuthJson(
					authClient,
					customerAuthBaseUrl,
					"/organization/list",
					{},
				);
				if (!response.ok) {
					throw new Error("Unable to load organizations");
				}
				const payload = (await response.json()) as { organizations?: Org[]; data?: Org[] } | Org[];
				const list = Array.isArray(payload)
					? payload
					: (payload.organizations ?? payload.data ?? []);
				setOrgs(list);
			} catch {
				setError("Unable to load organizations.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [authClient, customerAuthBaseUrl]);

	return (
		<div className="mt-14">
			<AuthCard
				title="Choose organization"
				description="Switch active org context for your session."
			>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">Loading organizations...</p>
				) : null}
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				{orgs.map((org) => (
					<Button
						key={org.id}
						variant="secondary"
						type="button"
						className="w-full justify-between"
						onClick={async () => {
							await (authClient as unknown as OrganizationClient).organization.setActive({
								organizationId: org.id,
							});
							window.location.href = scopedPath("/callback");
						}}
					>
						<span>{org.name}</span>
						<span className="text-xs text-muted-foreground">{org.role ?? "super_admin"}</span>
					</Button>
				))}
			</AuthCard>
		</div>
	);
}
