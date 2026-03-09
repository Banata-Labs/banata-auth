"use client";

import { OrganizationsPanel } from "@/components/organizations-panel";
import { listOrganizations } from "@/lib/dashboard-api";
import type { Organization } from "@banata-auth/shared";
import { useEffect, useState } from "react";

export default function OrganizationsPage() {
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		listOrganizations()
			.then((orgs) => {
				if (!cancelled) {
					setOrganizations(orgs);
					setLoading(false);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setOrganizations([]);
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Organization settings and policy controls from live API data.
				</p>
			</div>
			{!loading && organizations.length === 0 && (
				<p className="text-sm text-muted-foreground">No organizations found for this project.</p>
			)}
			<OrganizationsPanel initial={organizations} />
		</div>
	);
}
