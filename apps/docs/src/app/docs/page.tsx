import type { Metadata } from "next";
import Link from "next/link";
import { docsNav } from "@/lib/docs-nav";
import {
	ArrowRight,
	BookOpen,
	KeyRound,
	Users,
	Server,
	Package,
	Rocket,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Documentation",
	description:
		"Learn how to add enterprise-grade authentication to your application with Banata Auth.",
};

const sectionIcons: Record<string, React.ReactNode> = {
	"Start Here": <BookOpen className="size-4" />,
	"Build Your App": <Package className="size-4" />,
	"Configure Authentication": <KeyRound className="size-4" />,
	"Organizations & RBAC": <Users className="size-4" />,
	"Operate Your Project": <Server className="size-4" />,
	Enterprise: <Users className="size-4" />,
	"Platform Operators": <Rocket className="size-4" />,
};

const sectionDescriptions: Record<string, string> = {
	"Start Here":
		"Understand the product model, create a project, mint an API key, and connect your first app.",
	"Build Your App":
		"Use the app-side packages that proxy auth through your app while Banata stays the system of record.",
	"Configure Authentication":
		"Turn on methods, connect providers, and understand each authentication flow.",
	"Organizations & RBAC":
		"Set up organizations, invitations, custom roles, permissions, and resource types.",
	"Operate Your Project":
		"Run email delivery, webhooks, domains, redirects, settings, and security features in production.",
	Enterprise:
		"Configure SSO, SCIM, and encrypted secret storage for enterprise customers.",
	"Platform Operators":
		"Deploy and operate the Banata platform itself if you are self-hosting.",
};

export default function DocsPage() {
	return (
		<div>
			<header className="mb-10 pb-6 border-b border-border">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Documentation
				</h1>
				<p className="mt-2 text-muted-foreground text-lg">
					Start with the dashboard, a project, and a project-scoped API key. Then
					connect your app with the client packages and keep all auth data,
					configuration, and user records inside Banata.
				</p>
			</header>

			<div className="space-y-10">
				{docsNav.map((section) => (
					<div key={section.section}>
						<div className="flex items-center gap-2 mb-4">
							<span className="text-primary">
								{sectionIcons[section.section]}
							</span>
							<h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
								{section.section}
							</h2>
						</div>
						{sectionDescriptions[section.section] && (
							<p className="text-sm text-muted-foreground/70 mb-4">
								{sectionDescriptions[section.section]}
							</p>
						)}
						<div className="grid gap-3 sm:grid-cols-2">
							{section.items.map((item) => (
								<Link
									key={item.slug}
									href={`/docs/${item.slug}`}
									className="group flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors"
								>
									<span className="text-sm text-card-foreground">
										{item.title}
									</span>
									<ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
