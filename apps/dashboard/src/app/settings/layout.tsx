"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
	AlertTriangle,
	Bell,
	Globe,
	KeyRound,
	Paintbrush,
	Settings as SettingsIcon,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: SubNavItem[] = [
	{ label: "General", href: "/settings/general", icon: SettingsIcon },
	{ label: "Auth Overview", href: "/settings/auth-overview", icon: KeyRound },
	{ label: "Team", href: "/settings/team", icon: Users },
	{ label: "Danger Zone", href: "/settings/danger-zone", icon: AlertTriangle },
];

const relatedItems: SubNavItem[] = [
	{ label: "Branding", href: "/branding", icon: Paintbrush },
	{ label: "Domains", href: "/domains", icon: Globe },
	{ label: "Notifications", href: "/notifications", icon: Bell },
];

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const isActive = (href: string) => {
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<div className="flex gap-6">
			{/* Sub-navigation sidebar */}
			<aside className="w-[200px] shrink-0">
				<div className="sticky top-20">
					<h2 className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
						Settings
					</h2>
					<nav className="flex flex-col gap-0.5">
						{mainNavItems.map((item) => {
							const Icon = item.icon;
							const active = isActive(item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
										active
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
									)}
								>
									<Icon className="size-4 shrink-0" />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>

					<Separator className="my-4" />

					<h2 className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
						Related
					</h2>
					<nav className="flex flex-col gap-0.5">
						{relatedItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
								>
									<Icon className="size-4 shrink-0" />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</div>
			</aside>

			{/* Page content */}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
