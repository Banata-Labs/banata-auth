import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocFrontmatter {
	title: string;
	description: string;
	section: string;
	order: number;
}

export interface DocEntry {
	slug: string;
	frontmatter: DocFrontmatter;
	content: string;
}

/**
 * Get a single doc by its slug.
 * Returns null if the file does not exist.
 */
export function getDocBySlug(slug: string): DocEntry | null {
	const filePath = path.join(DOCS_DIR, `${slug}.mdx`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const raw = fs.readFileSync(filePath, "utf-8");
	const { data, content } = matter(raw);

	return {
		slug,
		frontmatter: {
			title: (data.title as string) ?? slug,
			description: (data.description as string) ?? "",
			section: (data.section as string) ?? "Uncategorized",
			order: (data.order as number) ?? 99,
		},
		content,
	};
}

/**
 * Get all docs sorted by section order then page order.
 */
export function getAllDocs(): DocEntry[] {
	if (!fs.existsSync(DOCS_DIR)) {
		return [];
	}

	const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".mdx"));

	const docs: DocEntry[] = [];

	for (const file of files) {
		const slug = file.replace(/\.mdx$/, "");
		const doc = getDocBySlug(slug);
		if (doc) {
			docs.push(doc);
		}
	}

	return docs.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

/**
 * Get all valid slugs for static param generation.
 */
export function getAllDocSlugs(): string[] {
	if (!fs.existsSync(DOCS_DIR)) {
		return [];
	}

	return fs
		.readdirSync(DOCS_DIR)
		.filter((f) => f.endsWith(".mdx"))
		.map((f) => f.replace(/\.mdx$/, ""));
}
