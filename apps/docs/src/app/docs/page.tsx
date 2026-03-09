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
	"Getting Started": <BookOpen className="size-4" />,
	Authentication: <KeyRound className="size-4" />,
	Organizations: <Users className="size-4" />,
	Infrastructure: <Server className="size-4" />,
	Packages: <Package className="size-4" />,
	Deployment: <Rocket className="size-4" />,
};

const sectionDescriptions: Record<string, string> = {
	"Getting Started":
		"Choose your integration path: dashboard-first with API keys, or self-hosted on Convex.",
	Authentication:
		"Email/password, social OAuth, magic links, and multi-factor authentication.",
	Organizations:
		"Multi-tenant B2B patterns with invitations, roles, and permissions.",
	Infrastructure:
		"Webhooks, audit logging, and API key management for production apps.",
	Packages:
		"Dashboard-first SDK and app helpers, plus separate self-hosted Convex packages.",
	Deployment:
		"Environment variables, production deployment, and custom domains.",
};

export default function DocsPage() {
	return (
		<div>
			<header className="mb-10 pb-6 border-b border-border">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Documentation
				</h1>
				<p className="mt-2 text-muted-foreground text-lg">
					Start with the dashboard and project-scoped API keys for the managed
					service path, or use the self-hosted Convex guides if you want to run
					the auth runtime yourself.
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
