import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options } from "rehype-pretty-code";

/**
 * rehype-pretty-code configuration.
 * Uses "vitesse-dark" theme for consistency with the dark-first design.
 */
const prettyCodeOptions: Options = {
	theme: "vitesse-dark",
	keepBackground: true,
	defaultLang: "typescript",
};

/**
 * MDX options shared between compileMDX and the RSC renderer.
 * We export these so [slug]/page.tsx can pass them to MDXRemote.
 *
 * Note: We cast to `any` for the rehype-pretty-code plugin tuple
 * because the unified/rehype types don't perfectly align with
 * next-mdx-remote's expected types, but it works at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxOptions: any = {
	remarkPlugins: [remarkGfm],
	rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
};
