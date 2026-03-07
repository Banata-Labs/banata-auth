"use client";

import { LogoMark } from "@/components/logo";
import { ProjectSwitcher } from "@/components/project-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Bell,
	BookOpen,
	Building,
	Building2,
	ChevronsUpDown,
	Globe,
	Key,
	LayoutDashboard,
	Link2 as LinkIcon,
	Lock,
	LogOut,
	Mail,
	Paintbrush,
	Radar,
	ScrollText,
	Settings,
	Shield,
	User,
	UserCog,
	Users,
	Webhook,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string;
	disabled?: boolean;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const navSections: NavSection[] = [
	{
		title: "",
		items: [
			{ label: "Overview", href: "/", icon: LayoutDashboard },
			{ label: "Organizations", href: "/organizations", icon: Building2 },
			{ label: "Users", href: "/users", icon: Users },
		],
	},
	{
		title: "Products",
		items: [
			{ label: "Authentication", href: "/authentication", icon: Lock },
			{ label: "Authorization", href: "/authorization", icon: Shield },
			{ label: "Radar", href: "/radar", icon: Radar },
			{ label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
		],
	},
	{
		title: "Enterprise",
		items: [
			{ label: "SSO Connections", href: "/connections", icon: Building },
			{ label: "Directory Sync", href: "/directories", icon: Users },
			{
				label: "IdP Attributes",
				href: "/idp-attributes",
				icon: UserCog,
				badge: "Soon",
				disabled: true,
			},
		],
	},
	{
		title: "Developer",
		items: [
			{ label: "Domains", href: "/domains", icon: Globe },
			{ label: "Redirects", href: "/redirects", icon: LinkIcon },
			{ label: "API Keys", href: "/api-keys", icon: Key },
			{ label: "Branding", href: "/branding", icon: Paintbrush },
			{ label: "Emails", href: "/emails", icon: Mail },
			{ label: "Events", href: "/events", icon: BarChart3 },
			{ label: "Actions", href: "/actions", icon: Zap },
			{ label: "Webhooks", href: "/webhooks", icon: Webhook },
		],
	},
	{
		title: "",
		items: [
			{ label: "Notifications", href: "/notifications", icon: Bell },
			{ label: "Settings", href: "/settings", icon: Settings },
		],
	},
];

function NavItemLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
	const Icon = item.icon;
	if (item.disabled) {
		return (
			<span
				className={cn(
					"flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium",
					"cursor-not-allowed text-sidebar-foreground/50",
				)}
			>
				<Icon className="size-4 shrink-0" />
				<span className="truncate">{item.label}</span>
				{item.badge ? (
					<Badge variant="secondary" className="ml-auto h-5 rounded px-1.5 text-[10px] font-medium">
						{item.badge}
					</Badge>
				) : null}
			</span>
		);
	}
	return (
		<Link
			href={item.href}
			className={cn(
				"flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
				isActive
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
			)}
		>
			<Icon className="size-4 shrink-0" />
			<span className="truncate">{item.label}</span>
			{item.badge ? (
				<Badge variant="secondary" className="ml-auto h-5 rounded px-1.5 text-[10px] font-medium">
					{item.badge}
				</Badge>
			) : null}
		</Link>
	);
}

export function Sidebar() {
	const pathname = usePathname();
	const { data } = authClient.useSession();
	const userName = data?.user?.name ?? "User";
	const userEmail = data?.user?.email ?? "user@example.com";
	const userInitial = userName.charAt(0).toUpperCase();

	const isPathActive = (href: string) => {
		if (href === "/") return pathname === "/";
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-sidebar-border bg-sidebar">
			{/* Header */}
			<div className="border-b border-border">
				<div className="flex h-14 items-center gap-2 px-4">
					<LogoMark size={24} className="shrink-0 text-sidebar-primary" />
					<span className="truncate text-[18px] font-semibold text-sidebar-foreground">
						Banata Auth
					</span>
				</div>
				<div className="border-t border-border px-3 py-3">
					<ProjectSwitcher className="w-full" />
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-3 py-4">
				<div className="flex flex-col gap-6">
					{navSections.map((section, sectionIdx) => (
						<div key={section.title || `section-${sectionIdx}`}>
							{section.title && (
								<div className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
									{section.title}
								</div>
							)}
							<div className="flex flex-col gap-1">
								{section.items.map((item) => (
									<NavItemLink key={item.label} item={item} isActive={isPathActive(item.href)} />
								))}
							</div>
						</div>
					))}
				</div>
			</nav>

			{/* Footer */}
			<div className="mt-auto">
				<div className="px-3 pb-2">
					<Link
						href="https://docs.banata.dev"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
						title="Documentation"
					>
						<BookOpen className="size-4 shrink-0" />
						<span>Help & Docs</span>
					</Link>
				</div>
				<div className="border-t border-sidebar-border px-3 py-3">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-auto w-full justify-start gap-2.5 px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
							>
								<Avatar size="sm">
									<AvatarFallback className="bg-primary/20 text-[10px] font-bold text-primary">
										{userInitial}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-1 flex-col items-start truncate">
									<span className="truncate text-[13px] font-medium leading-tight text-sidebar-primary">
										{userName}
									</span>
									<span className="truncate text-[11px] leading-tight text-sidebar-foreground/50">
										Workspace
									</span>
								</div>
								<ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="top" align="start" className="w-[220px]">
							<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
								{userEmail}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem
									onSelect={() => {
										window.location.href = "/account/profile";
									}}
								>
									<User className="size-4" />
									Account
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => {
										window.location.href = "/settings/general";
									}}
								>
									<UserCog className="size-4" />
									Settings
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onSelect={async () => {
									await authClient.signOut();
									window.location.href = "/sign-in";
								}}
							>
								<LogOut className="size-4" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</aside>
	);
}
