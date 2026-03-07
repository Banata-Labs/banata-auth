import { cn } from "@/lib/utils";

/** Animated pulse placeholder block. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// ── Composable skeleton primitives ──────────────────────────────────

/** Page header: title line + description line. */
export function SkeletonHeader({ withButton = false }: { withButton?: boolean }) {
	return (
		<div className="flex items-start justify-between">
			<div className="space-y-2">
				<Skeleton className="h-7 w-52" />
				<Skeleton className="h-4 w-80" />
			</div>
			{withButton && <Skeleton className="h-8 w-28 rounded-md" />}
		</div>
	);
}

/** Single table row with N columns of varying widths. */
function SkeletonTableRow({ cols }: { cols: number }) {
	const widths = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-36"];
	return (
		<div className="flex items-center gap-4 border-b border-border px-4 py-3">
			{Array.from({ length: cols }, (_, i) => (
				<Skeleton key={i} className={cn("h-4", widths[i % widths.length])} />
			))}
		</div>
	);
}

/** Table skeleton: header row + N data rows. */
export function SkeletonTable({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) {
	return (
		<div className="rounded-lg border border-border">
			{/* Header */}
			<div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2.5">
				{Array.from({ length: cols }, (_, i) => (
					<Skeleton key={i} className="h-3 w-20" />
				))}
			</div>
			{/* Rows */}
			{Array.from({ length: rows }, (_, i) => (
				<SkeletonTableRow key={i} cols={cols} />
			))}
		</div>
	);
}

/** Card skeleton with optional content lines or custom children. */
export function SkeletonCard({
	lines = 2,
	className,
	children,
}: { lines?: number; className?: string; children?: React.ReactNode }) {
	return (
		<div className={cn("rounded-lg border border-border bg-card p-5", className)}>
			<Skeleton className="mb-3 h-4 w-32" />
			{children ?? (
				<div className="space-y-2">
					{Array.from({ length: lines }, (_, i) => (
						<Skeleton key={i} className={cn("h-3", i === 0 ? "w-full" : "w-3/4")} />
					))}
				</div>
			)}
		</div>
	);
}

/** Toggle row skeleton: label + description + switch. */
export function SkeletonToggleRow() {
	return (
		<div className="flex items-center justify-between py-3">
			<div className="space-y-1.5">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-5 w-14 rounded-full" />
				</div>
				<Skeleton className="h-3 w-56" />
			</div>
			<Skeleton className="h-5 w-9 rounded-full" />
		</div>
	);
}

/** Method/feature card skeleton: icon box + title + description + badge + button. */
export function SkeletonMethodCard() {
	return (
		<div className="rounded-lg border border-border bg-card p-5">
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3">
					<Skeleton className="size-10 rounded-lg" />
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="h-3 w-64" />
					</div>
				</div>
				<Skeleton className="h-8 w-20 rounded-md" />
			</div>
		</div>
	);
}

/** Stat card skeleton: label + large number. */
export function SkeletonStatCard() {
	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<Skeleton className="mb-2 h-3 w-24" />
			<Skeleton className="h-8 w-12" />
		</div>
	);
}

/** Form input skeleton: label + input box. */
export function SkeletonInput({ width = "w-full" }: { width?: string }) {
	return (
		<div className="space-y-2">
			<Skeleton className="h-3 w-20" />
			<Skeleton className={cn("h-9 rounded-md", width)} />
		</div>
	);
}

/** Provider row skeleton: circle icon + name + badge + button. */
export function SkeletonProviderRow() {
	return (
		<div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
			<div className="flex items-center gap-3">
				<Skeleton className="size-8 rounded-full" />
				<div className="space-y-1">
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-5 w-16 rounded-full" />
				<Skeleton className="h-8 w-16 rounded-md" />
			</div>
		</div>
	);
}

/** Session/account row skeleton: icon + text lines + action. */
export function SkeletonListRow() {
	return (
		<div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
			<div className="flex items-center gap-3">
				<Skeleton className="size-4 rounded" />
				<div className="space-y-1">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>
			<Skeleton className="h-7 w-16 rounded-md" />
		</div>
	);
}
