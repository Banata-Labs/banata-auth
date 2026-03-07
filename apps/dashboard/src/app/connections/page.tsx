import { ConnectionsPanel } from "@/components/connections-panel";

export default function ConnectionsPage() {
	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">SSO Connections</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Configure project-scoped OIDC and SAML connections for enterprise sign-in.
				</p>
			</div>
			<ConnectionsPanel />
		</div>
	);
}
