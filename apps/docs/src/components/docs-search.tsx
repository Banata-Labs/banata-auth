"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, ArrowRight, Zap } from "lucide-react";
import { SEARCH_INDEX } from "@/lib/search-index";
import { docsNav } from "@/lib/docs-nav";

// ============================================================
// Types
// ============================================================

interface LocalResult {
	slug: string;
	title: string;
	section: string;
	heading: string;
	anchor: string;
	snippet: string;
}

// ============================================================
// Utilities
// ============================================================

function truncate(text: string, maxLen: number): string {
	const clean = text
		.replace(/^#{1,3}\s+.+$/gm, "")
		.replace(/\n+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (clean.length <= maxLen) return clean;
	return `${clean.slice(0, maxLen).replace(/\s\S*$/, "")}...`;
}

function norm(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function localSearch(query: string): LocalResult[] {
	const q = norm(query);
	if (q.length < 2) return [];

	const results: LocalResult[] = [];
	const seen = new Set<string>();

	function add(r: LocalResult) {
		const key = `${r.slug}::${r.anchor}`;
		if (seen.has(key)) return;
		seen.add(key);
		results.push(r);
	}

	// Pass 1: exact heading/title matches
	for (const entry of SEARCH_INDEX) {
		if (norm(entry.title) === q) {
			add({
				slug: entry.slug,
				title: entry.title,
				section: entry.section,
				heading: entry.title,
				anchor: "",
				snippet: entry.description,
			});
		}
		for (const h of entry.headings) {
			if (norm(h.text) === q) {
				add({
					slug: entry.slug,
					title: entry.title,
					section: entry.section,
					heading: `${entry.title} > ${h.text}`,
					anchor: h.anchor,
					snippet: h.snippet || entry.description,
				});
			}
		}
	}

	// Pass 2: heading/title contains query
	for (const entry of SEARCH_INDEX) {
		if (norm(entry.title).includes(q)) {
			add({
				slug: entry.slug,
				title: entry.title,
				section: entry.section,
				heading: entry.title,
				anchor: "",
				snippet: entry.description,
			});
		}
		for (const h of entry.headings) {
			if (norm(h.text).includes(q)) {
				add({
					slug: entry.slug,
					title: entry.title,
					section: entry.section,
					heading: `${entry.title} > ${h.text}`,
					anchor: h.anchor,
					snippet: h.snippet || entry.description,
				});
			}
		}
	}

	// Pass 3: description/snippet contains query
	for (const entry of SEARCH_INDEX) {
		if (norm(entry.description).includes(q)) {
			add({
				slug: entry.slug,
				title: entry.title,
				section: entry.section,
				heading: entry.title,
				anchor: "",
				snippet: entry.description,
			});
		}
		for (const h of entry.headings) {
			if (norm(h.snippet).includes(q)) {
				add({
					slug: entry.slug,
					title: entry.title,
					section: entry.section,
					heading: `${entry.title} > ${h.text}`,
					anchor: h.anchor,
					snippet: h.snippet || entry.description,
				});
			}
		}
	}

	return results.slice(0, 10);
}

// ============================================================
// Main component
// ============================================================

export function DocsSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [localResults, setLocalResults] = useState<LocalResult[]>([]);
	const router = useRouter();

	// Cmd+K / Ctrl+K shortcut
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((o) => !o);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	// Reset on close
	useEffect(() => {
		if (!open) {
			setQuery("");
			setLocalResults([]);
		}
	}, [open]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open]);

	const handleInputChange = useCallback((value: string) => {
		setQuery(value);
		const trimmed = value.trim();
		if (!trimmed || trimmed.length < 2) {
			setLocalResults([]);
			return;
		}
		const local = localSearch(trimmed);
		setLocalResults(local);
	}, []);

	const runCommand = useCallback(
		(href: string) => {
			setOpen(false);
			router.push(href);
		},
		[router],
	);

	const isQuerying = query.trim().length >= 2;
	const hasLocal = localResults.length > 0;

	const groupedLocal = useMemo(
		() =>
			localResults.reduce(
				(acc, r) => {
					const key = r.section || "Results";
					if (!acc[key]) acc[key] = [];
					acc[key].push(r);
					return acc;
				},
				{} as Record<string, LocalResult[]>,
			),
		[localResults],
	);

	// Static nav sections for browse mode
	const staticSections = useMemo(
		() =>
			docsNav.reduce(
				(acc, section) => {
					acc[section.section] = section.items;
					return acc;
				},
				{} as Record<string, typeof docsNav[0]["items"]>,
			),
		[],
	);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="flex items-center gap-2 border border-border bg-muted/50 hover:bg-muted transition-colors px-3 py-1.5 rounded-md text-muted-foreground text-xs"
			>
				<Search className="size-3.5" />
				<span className="hidden sm:inline">Search docs...</span>
				<kbd className="hidden sm:inline-flex items-center gap-0.5 bg-background px-1.5 py-0.5 text-[10px] font-mono border border-border rounded">
					<span className="text-[10px]">&#8984;</span>K
				</kbd>
			</button>

			{open && (
				<div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>

					{/* Dialog */}
					<div className="relative w-full max-w-lg mx-4 bg-popover border border-border rounded-lg shadow-2xl overflow-hidden">
						{/* Input */}
						<div className="flex items-center border-b border-border px-4">
							<Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
							<input
								value={query}
								onChange={(e) => handleInputChange(e.target.value)}
								placeholder="Search documentation..."
								className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/50 font-mono"
								autoFocus
							/>
						</div>

						{/* Results */}
						<div className="max-h-[50vh] overflow-y-auto">
							{/* Local results */}
							{isQuerying && hasLocal && (
								<div className="p-2">
									<div className="px-2 py-1.5 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
										<Zap className="size-3" />
										Matches
									</div>
									{Object.entries(groupedLocal).map(([section, items]) => (
										<div key={section}>
											<div className="px-2 py-1 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
												{section}
											</div>
											{items.map((r, j) => {
												const href = r.anchor
													? `/docs/${r.slug}#${r.anchor}`
													: `/docs/${r.slug}`;
												return (
													<button
														key={`${r.slug}-${r.anchor}-${j}`}
														onClick={() => runCommand(href)}
														className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-left transition-colors"
													>
														<FileText className="size-4 shrink-0 text-muted-foreground" />
														<div className="flex-1 min-w-0">
															<p className="font-mono text-[10px] text-muted-foreground truncate">
																{r.heading}
															</p>
															<p className="text-sm text-foreground/70 truncate leading-snug">
																{truncate(r.snippet, 120)}
															</p>
														</div>
														<ArrowRight className="size-3 text-muted-foreground/40" />
													</button>
												);
											})}
										</div>
									))}
								</div>
							)}

							{/* No results */}
							{isQuerying && !hasLocal && (
								<div className="px-4 py-8 text-center">
									<p className="text-sm text-muted-foreground">
										No results found for &ldquo;{query}&rdquo;
									</p>
									<p className="text-xs text-muted-foreground/60 mt-1">
										Try a different search term
									</p>
								</div>
							)}

							{/* Static browse mode */}
							{!isQuerying && (
								<div className="p-2">
									{Object.entries(staticSections).map(([section, items]) => (
										<div key={section}>
											<div className="px-2 py-1 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mt-2 first:mt-0">
												{section}
											</div>
											{items.map((item) => (
												<button
													key={item.slug}
													onClick={() =>
														runCommand(`/docs/${item.slug}`)
													}
													className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-left transition-colors"
												>
													<FileText className="size-4 text-muted-foreground" />
													<span className="text-sm font-medium truncate">
														{item.title}
													</span>
													<ArrowRight className="ml-auto size-3 text-muted-foreground/40" />
												</button>
											))}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
