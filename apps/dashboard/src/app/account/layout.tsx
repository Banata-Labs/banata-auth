"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SubNavItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

const navItems: SubNavItem[] = [
	{ label: "Profile", href: "/account/profile", icon: User },
	{ label: "Security", href: "/account/security", icon: Shield },
];

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const isActive = (href: string) => {
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) router.back();
			}}
		>
			<DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
				{/* Accessible title — visually hidden */}
				<DialogTitle className="sr-only">Account Settings</DialogTitle>
				<DialogDescription className="sr-only">
					Manage your profile information and security settings.
				</DialogDescription>

				<div className="flex min-h-[520px] max-h-[80vh]">
					{/* Sidebar */}
					<aside className="w-[180px] shrink-0 border-r border-border bg-muted/30 p-4">
						<h2 className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
							Account
						</h2>
						<nav className="flex flex-col gap-0.5">
							{navItems.map((item) => {
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
					</aside>

					{/* Content */}
					<div className="flex-1 overflow-y-auto p-6">{children}</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
