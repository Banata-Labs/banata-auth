"use client";

import { ProjectEnvironmentProvider } from "@/components/project-environment-provider";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronRight, Moon, Search, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const breadcrumbMap: Record<string, string> = {
	"/": "Overview",
	"/users": "Users",
	"/organizations": "Organizations",
	"/connections": "SSO Connections",
	"/directories": "Directory Sync",
	"/authentication": "Authentication",
	"/authentication/methods": "Methods",
	"/authentication/providers": "Providers",
	"/authentication/features": "Features",
	"/authentication/sessions": "Sessions",
	"/authentication/addons": "Add-ons",
	"/authorization": "Authorization",
	"/authorization/roles": "Roles",
	"/authorization/permissions": "Permissions",
	"/authorization/resource-types": "Resource Types",
	"/authorization/configuration": "Configuration",
	"/radar": "Radar",
	"/audit-logs": "Audit Logs",
	"/api-keys": "API Keys",
	"/webhooks": "Webhooks",
	"/domains": "Domains",
	"/redirects": "Redirects",
	"/branding": "Branding",
	"/emails": "Emails",
	"/emails/events": "Events",
	"/emails/providers": "Providers",
	"/emails/configuration": "Configuration",
	"/events": "Events",
	"/actions": "Actions",
	"/notifications": "Notifications",
	"/settings": "Settings",
	"/settings/general": "General",
	"/settings/auth-overview": "Auth Overview",
	"/settings/team": "Team",
	"/settings/danger-zone": "Danger Zone",
	"/account": "Account",
	"/account/profile": "Profile",
	"/account/security": "Security",
	"/sign-in": "Sign In",
};

function Breadcrumbs() {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) {
		return (
			<div className="flex items-center gap-1.5 text-sm">
				<span className="font-medium text-foreground">Overview</span>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-1.5 text-sm">
			{segments.map((segment: string, index: number) => {
				const href = `/${segments.slice(0, index + 1).join("/")}`;
				const label =
					breadcrumbMap[href] ||
					segment.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
				const isLast = index === segments.length - 1;
				return (
					<span key={href} className="flex items-center gap-1.5">
						{index > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50" />}
						<span className={cn(isLast ? "font-medium text-foreground" : "text-muted-foreground")}>
							{label}
						</span>
					</span>
				);
			})}
		</div>
	);
}

function ThemeToggle() {
	const [theme, setTheme] = useState<"dark" | "light">("dark");
	useEffect(() => {
		if (document.documentElement.classList.contains("light")) setTheme("light");
	}, []);
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			className="text-muted-foreground"
			onClick={() => {
				const root = document.documentElement;
				if (theme === "dark") {
					root.classList.remove("dark");
					root.classList.add("light");
					setTheme("light");
				} else {
					root.classList.remove("light");
					root.classList.add("dark");
					setTheme("dark");
				}
			}}
		>
			{theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
		</Button>
	);
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
	return (
		<ProjectEnvironmentProvider>
			<div className="min-h-screen bg-background">
				<Sidebar />
				<div className="pl-60">
					<header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
						<div className="flex items-center gap-3">
							<Breadcrumbs />
						</div>

						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								className="h-8 gap-2 px-2.5 text-muted-foreground"
								disabled
								title="Search — Coming soon"
							>
								<Search className="size-4" />
								<span>Search</span>
							</Button>
							<Separator orientation="vertical" className="mx-1 h-5" />
							<ThemeToggle />
						</div>
					</header>
					<main className="px-6 py-6">{children}</main>
				</div>
			</div>
		</ProjectEnvironmentProvider>
	);
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

	if (isAuthPage) return <>{children}</>;

	return <ProtectedContent>{children}</ProtectedContent>;
}
