import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/code-block";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: (props) => (
			<h1
				className="text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground"
				{...props}
			/>
		),
		h2: (props) => (
			<h2
				className="text-2xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-border text-foreground"
				{...props}
			/>
		),
		h3: (props) => (
			<h3
				className="text-xl font-semibold tracking-tight mt-8 mb-3 text-foreground"
				{...props}
			/>
		),
		h4: (props) => (
			<h4
				className="text-lg font-semibold mt-6 mb-2 text-foreground"
				{...props}
			/>
		),
		p: (props) => (
			<p
				className="text-muted-foreground leading-7 mb-4"
				{...props}
			/>
		),
		a: (props) => (
			<a
				className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
				{...props}
			/>
		),
		ul: (props) => (
			<ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground" {...props} />
		),
		ol: (props) => (
			<ol className="list-decimal list-inside mb-4 space-y-1 text-muted-foreground" {...props} />
		),
		li: (props) => (
			<li className="leading-7" {...props} />
		),
		blockquote: (props) => (
			<blockquote
				className="border-l-2 border-primary/40 pl-4 my-4 text-muted-foreground italic"
				{...props}
			/>
		),
		code: (props) => {
			// Inline code (not inside a pre -- rehype-pretty-code wraps code blocks differently)
			return (
				<code
					className="font-mono text-[0.875em] bg-muted px-1.5 py-0.5 border border-border rounded-sm text-foreground"
					{...props}
				/>
			);
		},
		pre: (props) => {
			// rehype-pretty-code wraps code in <pre data-language="...">
			const { children, ...rest } = props;
			const language = (rest as Record<string, string>)["data-language"];
			const raw = (rest as Record<string, string>)["data-raw"];

			return (
				<CodeBlock data-language={language} raw={raw} {...rest}>
					{children}
				</CodeBlock>
			);
		},
		// rehype-pretty-code uses figure > pre for code blocks
		figure: (props) => {
			const attrs = props as Record<string, unknown>;
			if (attrs["data-rehype-pretty-code-figure"] !== undefined) {
				return <figure className="mb-4 not-prose" {...props} />;
			}
			return <figure {...props} />;
		},
		table: (props) => (
			<div className="overflow-x-auto mb-4">
				<table className="w-full text-sm border-collapse" {...props} />
			</div>
		),
		th: (props) => (
			<th
				className="border border-border px-3 py-2 text-left font-semibold bg-muted text-foreground"
				{...props}
			/>
		),
		td: (props) => (
			<td
				className="border border-border px-3 py-2 text-left text-muted-foreground"
				{...props}
			/>
		),
		hr: () => (
			<hr className="border-t border-border my-8" />
		),
		strong: (props) => (
			<strong className="font-semibold text-foreground" {...props} />
		),
		...components,
	};
}
