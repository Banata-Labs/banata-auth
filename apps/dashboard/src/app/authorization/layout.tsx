"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavItems = [
	{ label: "Roles", href: "/authorization/roles" },
	{ label: "Permissions", href: "/authorization/permissions" },
	{ label: "Resource Types", href: "/authorization/resource-types" },
	{ label: "Configuration", href: "/authorization/configuration" },
];

export default function AuthorizationLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<div className="flex gap-8">
			{/* Sub-navigation sidebar */}
			<aside className="w-[200px] shrink-0">
				<div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
					Authorization
				</div>
				<nav className="flex flex-col gap-0.5">
					{subNavItems.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
									isActive
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>
			</aside>

			{/* Main content */}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
