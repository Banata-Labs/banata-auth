import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDocBySlug, getAllDocSlugs } from "@/lib/docs";
import { mdxOptions } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { useMDXComponents } from "../../../../mdx-components";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	const slugs = getAllDocSlugs();
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const doc = getDocBySlug(slug);
	if (!doc) return {};

	return {
		title: doc.frontmatter.title,
		description: doc.frontmatter.description,
		alternates: {
			canonical: `/docs/${slug}`,
		},
	};
}

export default async function DocPage({ params }: Props) {
	const { slug } = await params;
	const doc = getDocBySlug(slug);

	if (!doc) {
		notFound();
	}

	const components = useMDXComponents({});

	return (
		<div>
			<header className="mb-8 pb-6 border-b border-border">
				<p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
					{doc.frontmatter.section}
				</p>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					{doc.frontmatter.title}
				</h1>
				{doc.frontmatter.description && (
					<p className="mt-2 text-muted-foreground text-lg">
						{doc.frontmatter.description}
					</p>
				)}
			</header>
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			<div className="prose">
				<MDXRemote
					source={doc.content}
					components={components}
					options={{ mdxOptions: mdxOptions as any }}
				/>
			</div>
		</div>
	);
}
