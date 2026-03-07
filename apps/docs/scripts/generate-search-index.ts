/**
 * Build-time search index generator.
 *
 * Reads all MDX docs, extracts headings and snippets, and writes a static
 * TypeScript index file that the client-side search component can import
 * for instant local matching before falling back to the RAG pipeline.
 *
 * Usage:
 *   bun run scripts/generate-search-index.ts
 *
 * Output:
 *   src/lib/search-index.ts  (auto-generated, do not edit manually)
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

const DOCS_DIR = join(import.meta.dirname, "..", "content", "docs");
const OUTPUT_PATH = join(import.meta.dirname, "..", "src", "lib", "search-index.ts");

interface HeadingEntry {
	level: number;
	text: string;
	anchor: string;
	snippet: string;
}

interface DocIndexEntry {
	slug: string;
	title: string;
	description: string;
	section: string;
	headings: HeadingEntry[];
	/** Flattened searchable text: title + description + all headings + all snippets */
	searchText: string;
}

/** Convert heading text to a URL-safe anchor */
function toAnchor(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/** Extract the first meaningful sentence/paragraph after a heading */
function extractSnippet(content: string, headingIndex: number): string {
	const afterHeading = content.slice(headingIndex);
	const newlinePos = afterHeading.indexOf("\n");
	if (newlinePos === -1) return "";

	const rest = afterHeading.slice(newlinePos + 1).trimStart();

	const lines: string[] = [];
	let charCount = 0;
	for (const line of rest.split("\n")) {
		if (/^#{1,4}\s/.test(line)) break;
		if (line.startsWith("```")) break;
		if (line.startsWith("|") || line.startsWith("<")) continue;
		if (!line.trim()) {
			if (lines.length > 0) break;
			continue;
		}

		const cleaned = line
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/\*\*([^*]+)\*\*/g, "$1")
			.replace(/`([^`]+)`/g, "$1")
			.replace(/^\s*[-*]\s+/, "")
			.replace(/^\s*\d+\.\s+/, "")
			.trim();

		if (cleaned) {
			lines.push(cleaned);
			charCount += cleaned.length;
			if (charCount >= 150) break;
		}
	}

	return lines.join(" ").slice(0, 200);
}

function processDoc(filePath: string, slug: string): DocIndexEntry {
	const raw = readFileSync(filePath, "utf-8");
	const { data, content } = matter(raw);

	const title = (data.title as string) ?? slug;
	const description = (data.description as string) ?? "";
	const section = (data.section as string) ?? "Uncategorized";

	const headings: HeadingEntry[] = [];

	const headingRegex = /^(#{2,3})\s+(.+)$/gm;
	let match: RegExpExecArray | null;

	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const text = match[2]
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/`([^`]+)`/g, "$1")
			.replace(/\*\*([^*]+)\*\*/g, "$1")
			.trim();

		const snippet = extractSnippet(content, match.index);

		headings.push({
			level,
			text,
			anchor: toAnchor(text),
			snippet,
		});
	}

	const searchParts = [title, description];
	for (const h of headings) {
		searchParts.push(h.text);
		if (h.snippet) searchParts.push(h.snippet);
	}
	const searchText = searchParts.join(" ").toLowerCase();

	return { slug, title, description, section, headings, searchText };
}

function main() {
	if (!existsSync(DOCS_DIR)) {
		console.log("No docs directory found, writing empty index.");
		writeFileSync(
			OUTPUT_PATH,
			`/**\n * Auto-generated search index (empty -- no docs found).\n */\n\nexport interface SearchIndexHeading {\n\tlevel: number;\n\ttext: string;\n\tanchor: string;\n\tsnippet: string;\n}\n\nexport interface SearchIndexEntry {\n\tslug: string;\n\ttitle: string;\n\tdescription: string;\n\tsection: string;\n\theadings: SearchIndexHeading[];\n\tsearchText: string;\n}\n\nexport const SEARCH_INDEX: SearchIndexEntry[] = [];\n`,
			"utf-8",
		);
		return;
	}

	const files = readdirSync(DOCS_DIR).filter((f: string) => f.endsWith(".mdx"));
	const index: DocIndexEntry[] = [];

	for (const file of files) {
		const slug = file.replace(/\.mdx$/, "");
		const entry = processDoc(join(DOCS_DIR, file), slug);
		index.push(entry);
		console.log(`  ${slug}: ${entry.headings.length} headings`);
	}

	// Sort by section order (match docs-nav.ts order)
	const sectionOrder: Record<string, number> = {
		"Getting Started": 0,
		Authentication: 1,
		Organizations: 2,
		Infrastructure: 3,
		Packages: 4,
		Deployment: 5,
	};
	index.sort((a, b) => (sectionOrder[a.section] ?? 99) - (sectionOrder[b.section] ?? 99));

	const output = `/**
 * Auto-generated search index for client-side instant search.
 *
 * DO NOT EDIT MANUALLY -- regenerate with:
 *   bun run scripts/generate-search-index.ts
 *
 * Pages: ${index.length}
 * Total headings: ${index.reduce((n, e) => n + e.headings.length, 0)}
 */

export interface SearchIndexHeading {
	level: number;
	text: string;
	anchor: string;
	snippet: string;
}

export interface SearchIndexEntry {
	slug: string;
	title: string;
	description: string;
	section: string;
	headings: SearchIndexHeading[];
	/** Flattened lowercase text for fast substring matching */
	searchText: string;
}

export const SEARCH_INDEX: SearchIndexEntry[] = ${JSON.stringify(index, null, 2)};
`;

	writeFileSync(OUTPUT_PATH, output, "utf-8");
	console.log(`\nWrote ${OUTPUT_PATH}`);
	console.log(
		`  ${index.length} pages, ${index.reduce((n, e) => n + e.headings.length, 0)} headings`,
	);
}

main();
