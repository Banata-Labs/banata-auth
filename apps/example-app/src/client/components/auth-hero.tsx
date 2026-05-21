export function AuthHero() {
	return (
		<div className="hidden min-h-screen flex-col justify-between border-r border-border/60 bg-black/12 p-12 lg:flex">
			<div className="space-y-6">
				<span className="inline-flex rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
					Support Desk
				</span>
				<div className="space-y-4">
					<h1 className="max-w-lg text-4xl font-semibold leading-tight text-white">
						Keep every customer issue in one calm, searchable queue.
					</h1>
					<p className="max-w-xl text-sm leading-7 text-muted-foreground">
						A compact ticketing workspace for intake, assignment, replies, and role-based access.
						Authentication stays in the background so the product can stay focused on support work.
					</p>
				</div>
				<div className="grid max-w-xl gap-3">
					<div className="rounded-2xl border border-border/70 bg-card/60 p-4">
						<p className="text-sm font-medium text-foreground">Inside this workspace</p>
						<div className="mt-4 grid grid-cols-3 gap-3 text-sm">
							<div className="rounded-xl border border-border/60 bg-background/70 p-3">
								<p className="text-xl font-semibold text-white">Inbox</p>
								<p className="mt-1 text-xs text-muted-foreground">Review and triage requests</p>
							</div>
							<div className="rounded-xl border border-border/60 bg-background/70 p-3">
								<p className="text-xl font-semibold text-white">Replies</p>
								<p className="mt-1 text-xs text-muted-foreground">Track every internal update</p>
							</div>
							<div className="rounded-xl border border-border/60 bg-background/70 p-3">
								<p className="text-xl font-semibold text-white">Roles</p>
								<p className="mt-1 text-xs text-muted-foreground">Admins, agents, customers</p>
							</div>
						</div>
					</div>
					<div className="rounded-2xl border border-border/70 bg-card/40 p-4">
						<p className="text-sm font-medium text-foreground">Authentication</p>
						<p className="mt-2 text-sm leading-7 text-muted-foreground">
							The sign-in options on the right come from your project configuration. If email or
							GitHub is enabled there, it appears here automatically.
						</p>
					</div>
				</div>
			</div>
			<div className="rounded-2xl border border-border/70 bg-card/40 p-4">
				<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Design goal</p>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">
					Dark, quiet, and practical. One accent color, low-contrast surfaces, and no demo-style
					marketing noise.
				</p>
			</div>
		</div>
	);
}
