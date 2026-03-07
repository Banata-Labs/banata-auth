"use client";

import { useBackendStatus } from "@/components/backend-status";
import { useActiveProjectId } from "@/components/project-environment-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard, SkeletonHeader, SkeletonToggleRow } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	type AuthConfigSettings,
	getAuthConfiguration,
	saveAuthConfiguration,
} from "@/lib/dashboard-api";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ConfigItem {
	key: keyof AuthConfigSettings;
	title: string;
	description: string;
}

const configItems: ConfigItem[] = [
	{
		key: "roleAssignment",
		title: "Role assignment in Admin Portal",
		description:
			"Allow organization admins to map user roles based on their identity provider groups.",
	},
	{
		key: "multipleRoles",
		title: "Multiple roles",
		description: "Allow users to have multiple roles within an organization.",
	},
	{
		key: "apiKeyPermissions",
		title: "Organization API key permissions",
		description: "Manage which permissions are available to organization API keys.",
	},
];

export default function ConfigurationPage() {
	const [config, setConfig] = useState<AuthConfigSettings>({
		roleAssignment: false,
		multipleRoles: false,
		apiKeyPermissions: false,
	});
	const [loading, setLoading] = useState(true);
	const [togglingKey, setTogglingKey] = useState<keyof AuthConfigSettings | null>(null);

	const { reportError } = useBackendStatus();
	const activeProjectId = useActiveProjectId();

	useEffect(() => {
		let cancelled = false;
		getAuthConfiguration()
			.then((remote) => {
				if (!cancelled) setConfig(remote);
			})
			.catch((err) => {
				reportError(err);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [activeProjectId]);

	const handleToggle = useCallback(
		async (key: keyof AuthConfigSettings) => {
			const previous = config[key];
			const newValue = !previous;
			setTogglingKey(key);

			// Optimistic update
			setConfig((prev) => ({ ...prev, [key]: newValue }));

			try {
				const saved = await saveAuthConfiguration({ [key]: newValue });
				setConfig(saved);
				toast.success("Configuration updated");
			} catch {
				toast.error("Failed to update configuration");
				// Revert on failure
				setConfig((prev) => ({ ...prev, [key]: previous }));
			} finally {
				setTogglingKey(null);
			}
		},
		[config],
	);

	if (loading) {
		return (
			<div className="grid gap-6">
				<SkeletonHeader />
				<div className="grid gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<SkeletonCard key={i} lines={0} className="py-4">
							<SkeletonToggleRow />
						</SkeletonCard>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Configuration</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Configure authorization settings for your applications.
				</p>
			</div>

			{/* Configuration cards */}
			<div className="grid gap-4">
				{configItems.map((item) => {
					const enabled = config[item.key];
					const toggling = togglingKey === item.key;

					return (
						<Card key={item.key}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="grid gap-1.5">
										<div className="flex items-center gap-2">
											<CardTitle className="text-sm">{item.title}</CardTitle>
											<Badge variant={enabled ? "default" : "secondary"} className="text-[10px]">
												{enabled ? "Enabled" : "Disabled"}
											</Badge>
										</div>
										<CardDescription>{item.description}</CardDescription>
									</div>
									<Switch
										checked={enabled}
										disabled={toggling}
										onCheckedChange={() => handleToggle(item.key)}
									/>
								</div>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
