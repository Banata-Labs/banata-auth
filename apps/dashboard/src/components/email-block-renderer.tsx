"use client";

/**
 * React Email block renderer.
 *
 * Renders EmailBlock[] as actual React Email components for live preview
 * in the dashboard's design studio. Each block type maps 1:1 to a
 * React Email component.
 *
 * This component is used in two contexts:
 * 1. Live preview in the editor canvas (rendered as React components)
 * 2. Server-side rendering to HTML via the API route (using @react-email/render)
 */

import type {
	ButtonBlock,
	CodeBlock,
	ColumnsBlock,
	DividerBlock,
	EmailBlock,
	EmailBlockStyle,
	HeadingBlock,
	ImageBlock,
	LinkBlock,
	SpacerBlock,
	TextBlock,
} from "@banata-auth/shared";
import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Text,
} from "@react-email/components";
import type React from "react";

// ─── Types ─────────────────────────────────────────────────────────

export interface EmailBrandingProps {
	appName?: string;
	primaryColor?: string;
	bgColor?: string;
	logoUrl?: string;
	borderRadius?: number;
	fontFamily?: string;
	darkMode?: boolean;
}

interface BlockRendererProps {
	blocks: EmailBlock[];
	branding: EmailBrandingProps;
	/** Variable values for interpolation in preview mode. */
	variables?: Record<string, string>;
}

// ─── Variable Interpolation ────────────────────────────────────────

function interp(text: string, vars?: Record<string, string>): string {
	if (!vars) return text;
	return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => vars[name] ?? match);
}

// ─── Block Style Helpers ───────────────────────────────────────────

function toReactStyle(style?: EmailBlockStyle): React.CSSProperties {
	if (!style) return {};
	const s: React.CSSProperties = {};
	if (style.color) s.color = style.color;
	if (style.backgroundColor) s.backgroundColor = style.backgroundColor;
	if (style.fontSize) s.fontSize = style.fontSize;
	if (style.fontWeight) s.fontWeight = style.fontWeight;
	if (style.fontStyle) s.fontStyle = style.fontStyle;
	if (style.textAlign) s.textAlign = style.textAlign;
	if (style.lineHeight) s.lineHeight = style.lineHeight;
	if (style.padding) s.padding = style.padding;
	if (style.margin) s.margin = style.margin;
	if (style.borderRadius) s.borderRadius = style.borderRadius;
	if (style.width) s.width = style.width;
	if (style.maxWidth) s.maxWidth = style.maxWidth;
	if (style.paddingTop != null) s.paddingTop = `${style.paddingTop}px`;
	if (style.paddingBottom != null) s.paddingBottom = `${style.paddingBottom}px`;
	if (style.paddingLeft != null) s.paddingLeft = `${style.paddingLeft}px`;
	if (style.paddingRight != null) s.paddingRight = `${style.paddingRight}px`;
	if (style.textDecoration) s.textDecoration = style.textDecoration;
	return s;
}

// ─── Individual Block Renderers ────────────────────────────────────

function RenderHeading({
	block,
	branding,
	vars,
}: { block: HeadingBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	const dk = branding.darkMode ?? false;
	const defaultColor = dk ? "#e2e8f0" : "#0f172a";

	return (
		<Heading
			as={block.as}
			style={{
				margin: "0 0 8px",
				fontSize: block.as === "h1" ? 22 : block.as === "h2" ? 18 : 16,
				fontWeight: 700,
				color: defaultColor,
				textAlign: "center",
				lineHeight: "1.3",
				...toReactStyle(block.style),
			}}
		>
			{interp(block.text, vars)}
		</Heading>
	);
}

function RenderText({
	block,
	branding,
	vars,
}: { block: TextBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	const dk = branding.darkMode ?? false;
	const defaultColor = dk ? "#94a3b8" : "#475569";
	const text = interp(block.text, vars);

	// Text blocks support basic inline HTML (bold, italic, links) set via the editor.
	return (
		<Text
			style={{
				margin: "0 0 16px",
				fontSize: 14,
				lineHeight: "1.6",
				color: defaultColor,
				...toReactStyle(block.style),
			}}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: email text blocks allow basic HTML formatting
			dangerouslySetInnerHTML={{ __html: text }}
		/>
	);
}

function RenderButton({
	block,
	branding,
	vars,
}: { block: ButtonBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	const pc = branding.primaryColor ?? "#6366f1";
	const br = branding.borderRadius ?? 8;
	const variant = block.variant ?? "primary";

	const bg = variant === "primary" ? pc : "transparent";
	// Compute contrast color for primary buttons so text stays readable on light backgrounds
	const pcHsl = (() => {
		const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(pc);
		if (!m?.[1] || !m[2] || !m[3]) return null;
		const rv = Number.parseInt(m[1], 16) / 255;
		const gv = Number.parseInt(m[2], 16) / 255;
		const bv = Number.parseInt(m[3], 16) / 255;
		const mx = Math.max(rv, gv, bv);
		const mn = Math.min(rv, gv, bv);
		return { l: ((mx + mn) / 2) * 100 };
	})();
	const color = variant === "primary" ? (pcHsl && pcHsl.l > 55 ? "#000000" : "#ffffff") : pc;
	const border = variant === "outline" ? `1px solid ${pc}` : "none";

	return (
		<Section style={{ margin: "24px 0", textAlign: "center" }}>
			<Button
				href={interp(block.href, vars)}
				style={{
					display: "inline-block",
					padding: "12px 32px",
					backgroundColor: bg,
					color,
					fontSize: 14,
					fontWeight: 600,
					textDecoration: "none",
					borderRadius: br,
					border,
					lineHeight: "1.2",
					...toReactStyle(block.style),
				}}
			>
				{interp(block.text, vars)}
			</Button>
		</Section>
	);
}

function RenderImage({
	block,
	branding,
	vars,
}: { block: ImageBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	const br = branding.borderRadius ?? 8;

	return (
		<Img
			src={interp(block.src, vars)}
			alt={block.alt}
			width={block.width ?? 600}
			height={block.height}
			style={{
				display: "block",
				margin: "16px auto",
				maxWidth: "100%",
				borderRadius: br,
				...toReactStyle(block.style),
			}}
		/>
	);
}

function RenderDivider({ block, branding }: { block: DividerBlock; branding: EmailBrandingProps }) {
	const dk = branding.darkMode ?? false;
	const borderColor = dk ? "#334155" : "#e2e8f0";

	return (
		<Hr
			style={{
				margin: "24px 0",
				border: "none",
				borderTop: `1px solid ${borderColor}`,
				...toReactStyle(block.style),
			}}
		/>
	);
}

function RenderSpacer({ block }: { block: SpacerBlock }) {
	return <Section style={{ height: block.height, margin: 0, padding: 0 }} />;
}

function RenderCode({
	block,
	branding,
	vars,
}: { block: CodeBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	const dk = branding.darkMode ?? false;
	const codeBg = dk ? "#1e293b" : "#f1f5f9";
	const codeBorder = dk ? "#334155" : "#e2e8f0";
	const codeColor = dk ? "#e2e8f0" : "#0f172a";

	return (
		<Section style={{ margin: "24px 0", textAlign: "center" }}>
			<Text
				style={{
					display: "inline-block",
					padding: "16px 32px",
					backgroundColor: codeBg,
					border: `1px solid ${codeBorder}`,
					borderRadius: 8,
					fontFamily: "'Courier New', monospace",
					fontSize: 28,
					fontWeight: 700,
					letterSpacing: 6,
					color: codeColor,
					...toReactStyle(block.style),
				}}
			>
				{interp(block.text, vars)}
			</Text>
		</Section>
	);
}

function RenderLink({
	block,
	branding,
	vars,
}: { block: LinkBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	const pc = branding.primaryColor ?? "#6366f1";

	return (
		<Text
			style={{
				margin: "0 0 8px",
				fontSize: 14,
				...toReactStyle(block.style),
			}}
		>
			<Link
				href={interp(block.href, vars)}
				style={{
					color: block.style?.color ?? pc,
					textDecoration: "underline",
					wordBreak: "break-all",
				}}
			>
				{interp(block.text, vars)}
			</Link>
		</Text>
	);
}

function RenderColumns({
	block,
	branding,
	vars,
}: { block: ColumnsBlock; branding: EmailBrandingProps; vars?: Record<string, string> }) {
	return (
		<Row>
			{block.columns.map((col, i) => (
				<Column
					key={`col-${block.id}-${i}`}
					style={{
						width: col.width ?? `${Math.floor(100 / block.columns.length)}%`,
						verticalAlign: "top",
						padding: "0 8px",
					}}
				>
					<BlockRenderer blocks={col.blocks} branding={branding} variables={vars} />
				</Column>
			))}
		</Row>
	);
}

// ─── Main Block Renderer ───────────────────────────────────────────

/**
 * Render an array of EmailBlock[] as React Email components.
 * Used for both live preview and server-side HTML rendering.
 */
export function BlockRenderer({ blocks, branding, variables }: BlockRendererProps) {
	return (
		<>
			{blocks.map((block) => {
				switch (block.type) {
					case "heading":
						return (
							<RenderHeading key={block.id} block={block} branding={branding} vars={variables} />
						);
					case "text":
						return <RenderText key={block.id} block={block} branding={branding} vars={variables} />;
					case "button":
						return (
							<RenderButton key={block.id} block={block} branding={branding} vars={variables} />
						);
					case "image":
						return (
							<RenderImage key={block.id} block={block} branding={branding} vars={variables} />
						);
					case "divider":
						return <RenderDivider key={block.id} block={block} branding={branding} />;
					case "spacer":
						return <RenderSpacer key={block.id} block={block} />;
					case "code":
						return <RenderCode key={block.id} block={block} branding={branding} vars={variables} />;
					case "link":
						return <RenderLink key={block.id} block={block} branding={branding} vars={variables} />;
					case "columns":
						return (
							<RenderColumns key={block.id} block={block} branding={branding} vars={variables} />
						);
					default:
						return null;
				}
			})}
		</>
	);
}

// ─── Full Email Template Renderer ──────────────────────────────────

/**
 * Render a complete email template with React Email wrapper components.
 * This produces a full `<Html>` document suitable for `@react-email/render`.
 */
export function EmailTemplateRenderer({
	blocks,
	branding,
	variables,
	previewText,
}: BlockRendererProps & { previewText?: string }) {
	const b = {
		appName: branding.appName ?? "Banata Auth",
		primaryColor: branding.primaryColor ?? "#6366f1",
		bgColor: branding.bgColor ?? "#f8fafc",
		logoUrl: branding.logoUrl,
		borderRadius: branding.borderRadius ?? 8,
		fontFamily:
			branding.fontFamily ??
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		darkMode: branding.darkMode ?? false,
	};

	const cardBg = b.darkMode ? "#1a1a2e" : "#ffffff";
	const cardBorder = b.darkMode ? "#2a2a3e" : "#e2e8f0";
	const footerColor = b.darkMode ? "#64748b" : "#94a3b8";

	return (
		<Html lang="en">
			<Head />
			{previewText && <Preview>{interp(previewText, variables)}</Preview>}
			<Body
				style={{
					margin: 0,
					padding: 0,
					backgroundColor: b.bgColor,
					fontFamily: b.fontFamily,
					WebkitFontSmoothing: "antialiased",
				}}
			>
				<Container style={{ padding: "40px 16px" }}>
					<Section
						style={{
							maxWidth: 480,
							margin: "0 auto",
							padding: 32,
							backgroundColor: cardBg,
							border: `1px solid ${cardBorder}`,
							borderRadius: 12,
						}}
					>
						{b.logoUrl && (
							<Img
								src={b.logoUrl}
								alt={b.appName}
								width={48}
								height={48}
								style={{
									display: "block",
									margin: "0 auto 16px",
									borderRadius: 8,
								}}
							/>
						)}
						<BlockRenderer blocks={blocks} branding={b} variables={variables} />
					</Section>
					<Text
						style={{
							margin: "24px 0 0",
							textAlign: "center",
							fontSize: 12,
							lineHeight: "1.5",
							color: footerColor,
						}}
					>
						This email was sent by {b.appName}. If you didn't expect this email, you can safely
						ignore it.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
