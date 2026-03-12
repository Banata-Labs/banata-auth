/**
 * Email template block types for the block-based email editor.
 *
 * Each email template is stored as an ordered array of typed blocks.
 * These blocks map 1:1 to React Email components and are rendered
 * at design time in the dashboard (live preview) and at send time
 * via `@react-email/render` to produce final HTML.
 *
 * The block schema is the single source of truth shared across:
 * - Dashboard editor (visual editing)
 * - SDK (programmatic template CRUD)
 * - Convex backend (storage + send-time rendering)
 */

// ─── Style Types ───────────────────────────────────────────────────

/** Common inline style properties for email blocks. */
export interface EmailBlockStyle {
	color?: string;
	backgroundColor?: string;
	fontSize?: number;
	fontWeight?: "normal" | "bold" | "600" | "700";
	fontStyle?: "normal" | "italic";
	textAlign?: "left" | "center" | "right";
	lineHeight?: number | string;
	padding?: string;
	margin?: string;
	borderRadius?: number;
	width?: string;
	maxWidth?: string;
	paddingTop?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	paddingRight?: number;
	textDecoration?: "none" | "underline" | "line-through";
}

// ─── Block Definitions ─────────────────────────────────────────────

/** Base properties shared by all blocks. */
interface BaseBlock {
	/** Unique block ID (UUID). */
	id: string;
	/** Display label for the editor sidebar (optional override). */
	label?: string;
}

/** Heading block — maps to React Email `<Heading>`. */
export interface HeadingBlock extends BaseBlock {
	type: "heading";
	/** Heading level: h1–h6. */
	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	/** The heading text. Supports {{variable}} interpolation. */
	text: string;
	style?: EmailBlockStyle;
}

/** Text/paragraph block — maps to React Email `<Text>`. */
export interface TextBlock extends BaseBlock {
	type: "text";
	/** The paragraph text. Supports {{variable}} interpolation and basic HTML. */
	text: string;
	style?: EmailBlockStyle;
}

/** Button (CTA) block — maps to React Email `<Button>`. */
export interface ButtonBlock extends BaseBlock {
	type: "button";
	/** Button label text. */
	text: string;
	/** URL the button links to. Supports {{variable}} interpolation. */
	href: string;
	/** Variant style. */
	variant?: "primary" | "secondary" | "outline";
	style?: EmailBlockStyle;
}

/** Image block — maps to React Email `<Img>`. */
export interface ImageBlock extends BaseBlock {
	type: "image";
	/** Image source URL. */
	src: string;
	/** Alt text for accessibility. */
	alt: string;
	/** Width in pixels. */
	width?: number;
	/** Height in pixels. */
	height?: number;
	style?: EmailBlockStyle;
}

/** Divider/horizontal rule — maps to React Email `<Hr>`. */
export interface DividerBlock extends BaseBlock {
	type: "divider";
	style?: EmailBlockStyle;
}

/** Spacer block — empty space with configurable height. */
export interface SpacerBlock extends BaseBlock {
	type: "spacer";
	/** Height in pixels. */
	height: number;
}

/** Link block — maps to React Email `<Link>`. */
export interface LinkBlock extends BaseBlock {
	type: "link";
	/** Link text. */
	text: string;
	/** URL. Supports {{variable}} interpolation. */
	href: string;
	style?: EmailBlockStyle;
}

/** Code block — styled monospace text for OTPs, tokens, etc. */
export interface CodeBlock extends BaseBlock {
	type: "code";
	/** The code/OTP text. Supports {{variable}} interpolation. */
	text: string;
	style?: EmailBlockStyle;
}

/** Column definition inside a columns block. */
export interface ColumnDef {
	/** Width as CSS value (e.g. "50%", "200px"). */
	width?: string;
	/** Blocks nested inside this column. */
	blocks: EmailBlock[];
}

/** Columns (multi-column layout) — maps to React Email `<Row>` + `<Column>`. */
export interface ColumnsBlock extends BaseBlock {
	type: "columns";
	/** Column definitions (2–4 columns). */
	columns: ColumnDef[];
}

// ─── Union Type ────────────────────────────────────────────────────

/** Any email block. Discriminated union on `type`. */
export type EmailBlock =
	| HeadingBlock
	| TextBlock
	| ButtonBlock
	| ImageBlock
	| DividerBlock
	| SpacerBlock
	| LinkBlock
	| CodeBlock
	| ColumnsBlock;

/** All possible block type strings. */
export type EmailBlockType = EmailBlock["type"];

// ─── Template Definition ───────────────────────────────────────────

/** Category for organizing templates. */
export type EmailTemplateCategory =
	| "auth"
	| "marketing"
	| "transactional"
	| "onboarding"
	| "notification"
	| "custom";

/**
 * A complete email template definition.
 * Stored as JSON in the database and editable through the dashboard.
 */
export interface EmailTemplateDefinition {
	/** Unique template ID (generated). */
	id: string;
	/** Human-readable template name (e.g. "Welcome Email", "Marketing Blast"). */
	name: string;
	/** URL-safe slug for SDK usage (e.g. "welcome-email", "marketing-blast"). */
	slug: string;
	/** Email subject line. Supports {{variable}} interpolation. */
	subject: string;
	/** Preview text shown in inbox (optional). */
	previewText?: string;
	/** Template category for organization. */
	category: EmailTemplateCategory;
	/** Description of what this template is for. */
	description?: string;
	/** The ordered array of content blocks. */
	blocks: EmailBlock[];
	/** Variables this template expects (for documentation / SDK hints). */
	variables?: EmailTemplateVariable[];
	/** Whether this is a built-in auth template (not deletable). */
	builtIn?: boolean;
	/** The built-in email type this template overrides (if any). */
	builtInType?:
		| "verification"
		| "password-reset"
		| "magic-link"
		| "email-otp"
		| "invitation"
		| "welcome";
	/** Timestamps. */
	createdAt: number;
	updatedAt: number;
}

/** Variable definition for template documentation. */
export interface EmailTemplateVariable {
	/** Variable name (without braces, e.g. "userName"). */
	name: string;
	/** Human-readable description. */
	description?: string;
	/** Default value for previews. */
	defaultValue?: string;
	/** Whether this variable is required. */
	required?: boolean;
}

// ─── Block Palette Metadata ────────────────────────────────────────

/** Metadata for the editor's block palette (drag source). */
export interface BlockPaletteMeta {
	type: EmailBlockType;
	label: string;
	description: string;
	icon: string; // Lucide icon name
}

/** Default palette entries for the editor sidebar. */
export const BLOCK_PALETTE: BlockPaletteMeta[] = [
	{ type: "heading", label: "Heading", description: "Title or section heading", icon: "Heading" },
	{
		type: "text",
		label: "Text",
		description: "Paragraph of body text",
		icon: "AlignLeft",
	},
	{
		type: "button",
		label: "Button",
		description: "Call-to-action button link",
		icon: "MousePointerClick",
	},
	{
		type: "image",
		label: "Image",
		description: "Inline image",
		icon: "Image",
	},
	{
		type: "divider",
		label: "Divider",
		description: "Horizontal separator line",
		icon: "Minus",
	},
	{
		type: "spacer",
		label: "Spacer",
		description: "Empty vertical space",
		icon: "Space",
	},
	{
		type: "code",
		label: "Code",
		description: "Monospace code or OTP display",
		icon: "Code",
	},
	{
		type: "link",
		label: "Link",
		description: "Inline hyperlink",
		icon: "Link",
	},
	{
		type: "columns",
		label: "Columns",
		description: "Multi-column layout (2–4)",
		icon: "Columns2",
	},
];

// ─── Factory Helpers ───────────────────────────────────────────────

/** Create a new block with a unique ID. Uses crypto.randomUUID where available. */
function makeId(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	// Fallback: simple random hex string
	return `blk_${Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

/** Create a default block of the given type. */
export function createDefaultBlock(type: EmailBlockType): EmailBlock {
	const id = makeId();

	switch (type) {
		case "heading":
			return { id, type: "heading", as: "h1", text: "Heading" };
		case "text":
			return {
				id,
				type: "text",
				text: "Start writing your email content here...",
			};
		case "button":
			return {
				id,
				type: "button",
				text: "Click Here",
				href: "https://example.com",
				variant: "primary",
			};
		case "image":
			return {
				id,
				type: "image",
				src: "https://placehold.co/600x200/e2e8f0/64748b?text=Image",
				alt: "Image",
				width: 600,
			};
		case "divider":
			return { id, type: "divider" };
		case "spacer":
			return { id, type: "spacer", height: 24 };
		case "code":
			return { id, type: "code", text: "123456" };
		case "link":
			return {
				id,
				type: "link",
				text: "Click here",
				href: "https://example.com",
			};
		case "columns":
			return {
				id,
				type: "columns",
				columns: [
					{ width: "50%", blocks: [] },
					{ width: "50%", blocks: [] },
				],
			};
	}
}

// ─── Variable Interpolation ────────────────────────────────────────

/**
 * Replace `{{variableName}}` placeholders in a string with values from a map.
 * Unmatched variables are left as-is.
 */
export function interpolateVariables(text: string, variables: Record<string, string>): string {
	return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
		return variables[name] ?? match;
	});
}

/**
 * Extract all `{{variableName}}` references from an array of blocks.
 * Returns a deduplicated list of variable names.
 */
export function extractVariables(blocks: EmailBlock[]): string[] {
	const vars = new Set<string>();
	const regex = /\{\{(\w+)\}\}/g;

	function scan(text: string) {
		for (let m = regex.exec(text); m !== null; m = regex.exec(text)) {
			if (m[1]) vars.add(m[1]);
		}
	}

	function walk(blockList: EmailBlock[]) {
		for (const block of blockList) {
			switch (block.type) {
				case "heading":
				case "text":
				case "code":
					scan(block.text);
					break;
				case "button":
					scan(block.text);
					scan(block.href);
					break;
				case "link":
					scan(block.text);
					scan(block.href);
					break;
				case "image":
					scan(block.src);
					break;
				case "columns":
					for (const col of block.columns) {
						walk(col.blocks);
					}
					break;
			}
		}
	}

	walk(blocks);
	return [...vars];
}

// ─── Built-in Template Defaults ────────────────────────────────────

/**
 * Default block definitions for the 6 built-in auth email templates.
 * These serve as starting points that users can customize.
 */
export function getBuiltInTemplateBlocks(
	type: "verification" | "password-reset" | "magic-link" | "email-otp" | "invitation" | "welcome",
): EmailBlock[] {
	switch (type) {
		case "verification":
			return [
				{ id: makeId(), type: "heading", as: "h1", text: "Verify your email address" },
				{ id: makeId(), type: "text", text: "Hi {{userName}}," },
				{
					id: makeId(),
					type: "text",
					text: "Thanks for signing up! Please verify your email address by clicking the button below.",
				},
				{
					id: makeId(),
					type: "button",
					text: "Verify Email",
					href: "{{verificationUrl}}",
					variant: "primary",
				},
				{ id: makeId(), type: "divider" },
				{
					id: makeId(),
					type: "text",
					text: "If the button doesn't work, copy and paste this URL into your browser:",
					style: { fontSize: 12, color: "#94a3b8" },
				},
				{
					id: makeId(),
					type: "link",
					text: "{{verificationUrl}}",
					href: "{{verificationUrl}}",
					style: { fontSize: 12 },
				},
			];
		case "password-reset":
			return [
				{ id: makeId(), type: "heading", as: "h1", text: "Reset your password" },
				{ id: makeId(), type: "text", text: "Hi {{userName}}," },
				{
					id: makeId(),
					type: "text",
					text: "We received a request to reset your password. Click the button below to choose a new password.",
				},
				{
					id: makeId(),
					type: "button",
					text: "Reset Password",
					href: "{{resetUrl}}",
					variant: "primary",
				},
				{ id: makeId(), type: "divider" },
				{
					id: makeId(),
					type: "text",
					text: "This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.",
					style: { fontSize: 12, color: "#94a3b8" },
				},
			];
		case "magic-link":
			return [
				{ id: makeId(), type: "heading", as: "h1", text: "Sign in to your account" },
				{ id: makeId(), type: "text", text: "Hi there," },
				{
					id: makeId(),
					type: "text",
					text: "Click the button below to sign in to your account. This link expires in 10 minutes.",
				},
				{
					id: makeId(),
					type: "button",
					text: "Sign In",
					href: "{{magicLinkUrl}}",
					variant: "primary",
				},
				{ id: makeId(), type: "divider" },
				{
					id: makeId(),
					type: "text",
					text: "If you didn't request this link, you can safely ignore this email.",
					style: { fontSize: 12, color: "#94a3b8" },
				},
			];
		case "email-otp":
			return [
				{ id: makeId(), type: "heading", as: "h1", text: "Your verification code" },
				{
					id: makeId(),
					type: "text",
					text: "Use the code below to verify your identity. It expires in 10 minutes.",
				},
				{ id: makeId(), type: "code", text: "{{otp}}" },
				{ id: makeId(), type: "divider" },
				{
					id: makeId(),
					type: "text",
					text: "If you didn't request this code, you can safely ignore this email. Never share this code with anyone.",
					style: { fontSize: 12, color: "#94a3b8" },
				},
			];
		case "invitation":
			return [
				{ id: makeId(), type: "heading", as: "h1", text: "You've been invited" },
				{
					id: makeId(),
					type: "text",
					text: "<strong>{{inviterName}}</strong> has invited you to join <strong>{{organizationName}}</strong>.",
				},
				{
					id: makeId(),
					type: "button",
					text: "Accept Invitation",
					href: "{{acceptUrl}}",
					variant: "primary",
				},
				{ id: makeId(), type: "divider" },
				{
					id: makeId(),
					type: "link",
					text: "{{acceptUrl}}",
					href: "{{acceptUrl}}",
					style: { fontSize: 12 },
				},
			];
		case "welcome":
			return [
				{ id: makeId(), type: "heading", as: "h1", text: "Welcome to {{appName}}" },
				{ id: makeId(), type: "text", text: "Hi {{userName}}," },
				{
					id: makeId(),
					type: "text",
					text: "Your account has been created successfully. You're all set to get started.",
				},
				{
					id: makeId(),
					type: "button",
					text: "Go to Dashboard",
					href: "{{dashboardUrl}}",
					variant: "primary",
				},
				{ id: makeId(), type: "divider" },
				{
					id: makeId(),
					type: "text",
					text: "If you didn't create this account, please contact support.",
					style: { fontSize: 12, color: "#94a3b8" },
				},
			];
	}
}

// ─── Blank Template Starter ────────────────────────────────────────

/** Create a blank set of starter blocks for new custom templates. */
export function getBlankTemplateBlocks(): EmailBlock[] {
	return [
		createDefaultBlock("heading"),
		createDefaultBlock("text"),
	];
}

// ─── System Template Variables ─────────────────────────────────────

/** Variable definitions for each built-in system template type. */
export const SYSTEM_TEMPLATE_VARIABLES: Record<
	string,
	Array<{ name: string; description: string; example: string }>
> = {
	verification: [
		{ name: "userName", description: "The user's display name", example: "Jane Doe" },
		{ name: "appName", description: "Your application name", example: "Acme App" },
		{ name: "verificationUrl", description: "Email verification link", example: "https://app.example.com/verify?token=abc123" },
	],
	"password-reset": [
		{ name: "userName", description: "The user's display name", example: "Jane Doe" },
		{ name: "appName", description: "Your application name", example: "Acme App" },
		{ name: "resetUrl", description: "Password reset link", example: "https://app.example.com/reset?token=xyz789" },
	],
	"magic-link": [
		{ name: "appName", description: "Your application name", example: "Acme App" },
		{ name: "magicLinkUrl", description: "Passwordless sign-in link", example: "https://app.example.com/magic?token=mlk456" },
	],
	"email-otp": [
		{ name: "appName", description: "Your application name", example: "Acme App" },
		{ name: "otp", description: "One-time passcode", example: "847291" },
	],
	invitation: [
		{ name: "inviterName", description: "Name of the person who sent the invite", example: "John Smith" },
		{ name: "organizationName", description: "Organization being joined", example: "Acme Corp" },
		{ name: "appName", description: "Your application name", example: "Acme App" },
		{ name: "acceptUrl", description: "Invitation acceptance link", example: "https://app.example.com/invite/accept?id=inv_abc123" },
	],
	welcome: [
		{ name: "userName", description: "The user's display name", example: "Jane Doe" },
		{ name: "appName", description: "Your application name", example: "Acme App" },
		{ name: "dashboardUrl", description: "Link to dashboard or app", example: "https://app.example.com/dashboard" },
	],
};
