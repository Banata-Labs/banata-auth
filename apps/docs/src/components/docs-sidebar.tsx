"use client";

import { docsNav } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function DocsSidebar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Mobile toggle */}
			<button
				onClick={() => setOpen(!open)}
				className="fixed bottom-4 right-4 z-50 lg:hidden size-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-lg"
				aria-label="Toggle sidebar"
			>
				{open ? <X className="size-5" /> : <Menu className="size-5" />}
			</button>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-14 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto z-40 transition-transform duration-200 docs-scrollbar",
					open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
				)}
			>
				<nav className="py-8 px-5">
					{docsNav.map((section) => (
						<div key={section.section} className="mb-6">
							<h4 className="text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 mb-2 px-2">
								{section.section}
							</h4>
							<ul className="space-y-1">
								{section.items.map((item) => {
									const isActive = pathname === `/docs/${item.slug}`;
									return (
										<li key={item.slug}>
											<Link
												href={`/docs/${item.slug}`}
												onClick={() => setOpen(false)}
												className={cn(
													"block text-[13px] px-3 py-2 transition-colors",
													isActive
														? "text-sidebar-primary bg-sidebar-accent border-l-2 border-primary rounded-r-md"
														: "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50 rounded-md",
												)}
											>
												{item.title}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>
			</aside>

			{/* Mobile overlay */}
			{open && (
				<div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
			)}
		</>
	);
}
