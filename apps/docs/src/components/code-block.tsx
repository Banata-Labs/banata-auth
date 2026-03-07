"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
	children: ReactNode;
	/** data-language attribute set by rehype-pretty-code */
	"data-language"?: string;
	/** raw code text for clipboard copy (set by rehype-pretty-code via data-raw) */
	raw?: string;
	className?: string;
}

/**
 * Wrapper for `<pre>` code blocks in MDX.
 * Adds a language badge and copy-to-clipboard button.
 */
export function CodeBlock({
	children,
	"data-language": language,
	raw,
	className = "",
	...props
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);
	const preRef = useRef<HTMLPreElement>(null);

	const handleCopy = useCallback(async () => {
		const text = raw || preRef.current?.textContent || "";
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [raw]);

	return (
		<div className="group relative mb-4 rounded-lg overflow-hidden border border-border">
			{/* Language badge + Copy button */}
			<div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
				{language && (
					<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
						{language}
					</span>
				)}
				{!language && <span />}
				<button
					onClick={handleCopy}
					className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
					aria-label={copied ? "Copied" : "Copy code"}
				>
					{copied ? (
						<>
							<Check className="size-3" />
							Copied
						</>
					) : (
						<>
							<Copy className="size-3" />
							Copy
						</>
					)}
				</button>
			</div>
			<pre
				ref={preRef}
				className={`overflow-x-auto bg-[oklch(0.12_0.005_286)] p-5 font-mono text-sm leading-7 ${className}`}
				{...props}
			>
				{children}
			</pre>
		</div>
	);
}
