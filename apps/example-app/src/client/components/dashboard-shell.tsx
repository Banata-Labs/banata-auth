import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { clearAuthArtifacts } from "@/lib/hosted-auth";
import { cn } from "@/lib/utils";
import type { AppRole, AuthUser, OrganizationSummary } from "@shared/contracts";
import { LogOut, ShieldCheck, Ticket, Users } from "lucide-react";

interface DashboardShellProps {
	user: AuthUser;
	organizations: OrganizationSummary[];
	activeOrganizationId: string | null;
	appRole: AppRole | null;
	onSwitchOrganization: (organizationId: string) => Promise<void>;
	activeView: "tickets" | "team";
	onChangeView: (view: "tickets" | "team") => void;
	children: React.ReactNode;
}

const roleLabel: Record<AppRole, string> = {
	admin: "Admin",
	agent: "Agent",
	customer: "Customer",
};

export function DashboardShell({
	user,
	organizations,
	activeOrganizationId,
	appRole,
	onSwitchOrganization,
	activeView,
	onChangeView,
	children,
}: DashboardShellProps) {
	const activeOrganization =
		organizations.find((organization) => organization.id === activeOrganizationId) ??
		organizations[0] ??
		null;

	const signOut = async () => {
		await authClient.signOut().catch(() => null);
		clearAuthArtifacts();
		window.location.replace("/sign-in");
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-[1560px]">
				<aside className="hidden w-[286px] border-r border-border/70 bg-black/14 p-6 lg:flex lg:flex-col">
					<div className="space-y-5">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
								Support Desk
							</p>
							<h2 className="mt-3 text-2xl font-semibold text-white">
								Run a tighter support queue.
							</h2>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Keep intake, ownership, and internal replies in one workspace.
							</p>
						</div>

						<Select
							value={activeOrganization?.id ?? ""}
							onValueChange={(value) => void onSwitchOrganization(value)}
						>
							<SelectTrigger className="border-border/70 bg-card/70 text-white">
								<SelectValue placeholder="Select workspace" />
							</SelectTrigger>
							<SelectContent>
								{organizations.map((organization) => (
									<SelectItem key={organization.id} value={organization.id}>
										{organization.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="mt-10 grid gap-2">
						<button
							type="button"
							onClick={() => onChangeView("tickets")}
							className={cn(
								"flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
								activeView === "tickets"
									? "border-primary/30 bg-primary/12 text-white"
									: "border-transparent text-slate-300 hover:border-border/70 hover:bg-card/60 hover:text-white",
							)}
						>
							<Ticket className="h-4 w-4" />
							Tickets
						</button>
						<button
							type="button"
							onClick={() => onChangeView("team")}
							className={cn(
								"flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
								activeView === "team"
									? "border-primary/30 bg-primary/12 text-white"
									: "border-transparent text-slate-300 hover:border-border/70 hover:bg-card/60 hover:text-white",
							)}
						>
							<Users className="h-4 w-4" />
							Team & access
						</button>
					</div>

					<div className="mt-auto space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4">
						<div className="flex items-center gap-3">
							<Avatar>
								{user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
								<AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-white">{user.name}</p>
								<p className="truncate text-xs text-slate-400">{user.email}</p>
							</div>
						</div>
						<Separator className="bg-border/70" />
						<div className="flex items-center justify-between">
							<span className="text-xs uppercase tracking-[0.24em] text-slate-400">Access</span>
							{appRole ? (
								<Badge variant="success" className="gap-1">
									<ShieldCheck className="h-3 w-3" />
									{roleLabel[appRole]}
								</Badge>
							) : (
								<Badge variant="outline" className="text-slate-300">
									Unassigned
								</Badge>
							)}
						</div>
						<Button
							variant="outline"
							className="w-full border-border/70 bg-transparent text-white hover:bg-card"
							onClick={() => void signOut()}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign out
						</Button>
					</div>
				</aside>

				<div className="flex min-h-screen flex-1 flex-col">
					<header className="border-b border-border/70 bg-black/10 px-6 py-4 backdrop-blur">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-sm text-slate-400">Workspace</p>
								<h1 className="text-2xl font-semibold text-white">
									{activeOrganization?.name ?? "Set up your first workspace"}
								</h1>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<Badge variant="outline" className="text-slate-200">
									{organizations.length} workspace{organizations.length === 1 ? "" : "s"}
								</Badge>
								<Badge variant="outline" className="text-slate-200">
									{activeView === "tickets" ? "Ticket queue" : "Team access"}
								</Badge>
							</div>
						</div>
					</header>
					<main className="flex-1 p-6 md:p-8">{children}</main>
				</div>
			</div>
		</div>
	);
}
