export default function LoadingDashboard() {
	return (
		<div className="grid gap-6">
			<div className="space-y-2">
				<div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="rounded-lg border border-border bg-card p-4">
						<div className="mb-2 h-3 w-24 animate-pulse rounded bg-muted" />
						<div className="h-8 w-16 animate-pulse rounded bg-muted" />
					</div>
				))}
			</div>
		</div>
	);
}
