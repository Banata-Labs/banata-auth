"use client";

import { cn } from "@/lib/utils";
import { Blocks, KeyRound, Shield, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

const subNavItems: SubNavItem[] = [
	{ label: "Roles", href: "/authorization/roles", icon: Shield },
	{ label: "Permissions", href: "/authorization/permissions", icon: KeyRound },
	{ label: "Resource Types", href: "/authorization/resource-types", icon: Blocks },
	{ label: "Configuration", href: "/authorization/configuration", icon: Settings2 },
];

export default function AuthorizationLayout({ children }: { children: React.ReactNode }) {
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
						Authorization
					</h2>
					<nav className="flex flex-col gap-0.5">
						{subNavItems.map((item) => {
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
				</div>
			</aside>

			{/* Main content */}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
