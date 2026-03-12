"use client";

/**
 * Visual email template editor.
 *
 * A block-based editor that lets users design email templates by adding,
 * reordering, editing, and removing blocks. Each block maps to a React
 * Email component. The editor provides:
 *
 * - Left palette: Drag blocks onto the canvas
 * - Center canvas: Live preview using real React Email components
 * - Right inspector: Edit properties of the selected block
 *
 * Templates are stored as JSON arrays of EmailBlock definitions.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type {
	ButtonBlock,
	CodeBlock,
	ColumnsBlock,
	EmailBlock,
	EmailBlockStyle,
	EmailBlockType,
	HeadingBlock,
	ImageBlock,
	LinkBlock,
	SpacerBlock,
	TextBlock,
} from "@banata-auth/shared";
import { BLOCK_PALETTE, createDefaultBlock } from "@banata-auth/shared";
import {
	AlignLeft,
	ArrowDown,
	ArrowUp,
	Code,
	Columns2,
	Copy,
	GripVertical,
	Heading,
	Image,
	Link,
	Minus,
	MousePointerClick,
	Plus,
	Space,
	Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { BlockRenderer, type EmailBrandingProps } from "./email-block-renderer";

// ─── Icon Map ──────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
	Heading: <Heading className="size-4" />,
	AlignLeft: <AlignLeft className="size-4" />,
	MousePointerClick: <MousePointerClick className="size-4" />,
	Image: <Image className="size-4" />,
	Minus: <Minus className="size-4" />,
	Space: <Space className="size-4" />,
	Code: <Code className="size-4" />,
	Link: <Link className="size-4" />,
	Columns2: <Columns2 className="size-4" />,
};

// ─── Types ─────────────────────────────────────────────────────────

interface EmailEditorProps {
	/** Current blocks array. */
	blocks: EmailBlock[];
	/** Callback when blocks change. */
	onBlocksChange: (blocks: EmailBlock[]) => void;
	/** Branding config for preview rendering. */
	branding: EmailBrandingProps;
	/** Preview variable values. */
	variables?: Record<string, string>;
}

// ─── Editor Component ──────────────────────────────────────────────

export function EmailEditor({ blocks, onBlocksChange, branding, variables }: EmailEditorProps) {
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

	const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;
	const selectedIndex = selectedBlock ? blocks.indexOf(selectedBlock) : -1;

	// ── Block operations ───────────────────────────────────────────

	const addBlock = useCallback(
		(type: EmailBlockType, insertIndex?: number) => {
			const block = createDefaultBlock(type);
			const idx = insertIndex ?? blocks.length;
			const updated = [...blocks.slice(0, idx), block, ...blocks.slice(idx)];
			onBlocksChange(updated);
			setSelectedBlockId(block.id);
		},
		[blocks, onBlocksChange],
	);

	const removeBlock = useCallback(
		(id: string) => {
			onBlocksChange(blocks.filter((b) => b.id !== id));
			if (selectedBlockId === id) setSelectedBlockId(null);
		},
		[blocks, onBlocksChange, selectedBlockId],
	);

	const duplicateBlock = useCallback(
		(id: string) => {
			const idx = blocks.findIndex((b) => b.id === id);
			if (idx === -1) return;
			const original = blocks[idx];
			if (!original) return;
			const clone = createDefaultBlock(original.type);
			// Copy properties from original
			const merged = { ...original, id: clone.id } as EmailBlock;
			const updated = [...blocks.slice(0, idx + 1), merged, ...blocks.slice(idx + 1)];
			onBlocksChange(updated);
			setSelectedBlockId(clone.id);
		},
		[blocks, onBlocksChange],
	);

	const moveBlock = useCallback(
		(id: string, direction: "up" | "down") => {
			const idx = blocks.findIndex((b) => b.id === id);
			if (idx === -1) return;
			const newIdx = direction === "up" ? idx - 1 : idx + 1;
			if (newIdx < 0 || newIdx >= blocks.length) return;
			const updated = [...blocks];
			const item = updated[idx];
			if (!item) return;
			updated.splice(idx, 1);
			updated.splice(newIdx, 0, item);
			onBlocksChange(updated);
		},
		[blocks, onBlocksChange],
	);

	const updateBlock = useCallback(
		(id: string, patch: Partial<EmailBlock>) => {
			onBlocksChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as EmailBlock) : b)));
		},
		[blocks, onBlocksChange],
	);

	// ── Layout ─────────────────────────────────────────────────────

	return (
		<div className="flex h-full overflow-hidden">
			{/* ── Left: Block Palette ── */}
			<div className="flex w-[200px] shrink-0 flex-col border-r border-border bg-background">
				<div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
					<Plus className="size-3.5 text-muted-foreground/50" />
					<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
						Add Block
					</span>
				</div>
				<div className="flex-1 overflow-y-auto p-2">
					<div className="grid gap-1">
						{BLOCK_PALETTE.map((meta) => (
							<button
								key={meta.type}
								type="button"
								onClick={() => addBlock(meta.type)}
								className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted/50"
							>
								<span className="text-muted-foreground">
									{ICON_MAP[meta.icon] ?? <Plus className="size-4" />}
								</span>
								<div>
									<div className="text-[11px] font-medium">{meta.label}</div>
									<div className="text-[9px] text-muted-foreground/60">{meta.description}</div>
								</div>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* ── Center: Canvas ── */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<div className="flex-1 overflow-y-auto bg-muted/10">
					<div className="mx-auto w-full max-w-[600px] p-6">
						{/* Email chrome wrapper */}
						<div
							className="overflow-hidden rounded-2xl border border-border bg-white"
							style={{
								boxShadow:
									"0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08), 0 20px 50px rgba(0,0,0,0.12)",
							}}
						>
							{/* Window chrome */}
							<div className="flex items-center gap-2 border-b border-border/50 bg-[#fafafa] px-4 py-3">
								<div className="flex gap-1.5">
									<span className="size-2.5 rounded-full bg-[#ff5f57]" />
									<span className="size-2.5 rounded-full bg-[#febc2e]" />
									<span className="size-2.5 rounded-full bg-[#28c840]" />
								</div>
							</div>

							{/* Email body area */}
							<div className="bg-[#f8fafc] p-8">
								{/* Card */}
								<div
									className="mx-auto max-w-[480px] rounded-xl border p-8"
									style={{
										backgroundColor: branding.darkMode ? "#1a1a2e" : "#ffffff",
										borderColor: branding.darkMode ? "#2a2a3e" : "#e2e8f0",
									}}
								>
									{branding.logoUrl && (
										<div className="mb-4 text-center">
											<img
												src={branding.logoUrl}
												alt="Logo"
												className="mx-auto size-12 rounded-lg"
											/>
										</div>
									)}

									{/* Blocks */}
									{blocks.length === 0 ? (
										<div className="py-16 text-center">
											<p className="text-sm text-muted-foreground/40">
												Click a block type on the left to start building your email
											</p>
										</div>
									) : (
										<div className="space-y-0">
											{blocks.map((block, idx) => (
												<div
													key={block.id}
													className={[
														"group relative -mx-2 rounded-lg px-2 transition-all",
														selectedBlockId === block.id
															? "outline-2 outline-dashed outline-primary/40 bg-primary/[0.02]"
															: "hover:outline-1 hover:outline-dashed hover:outline-border",
													].join(" ")}
												>
													{/* Block toolbar */}
													<div
														className={[
															"absolute -right-1 -top-1 z-10 flex items-center gap-0.5 rounded-md border border-border bg-background px-0.5 py-0.5 shadow-sm",
															selectedBlockId === block.id
																? "opacity-100"
																: "opacity-0 group-hover:opacity-100",
														].join(" ")}
													>
														<button
															type="button"
															onClick={() => setSelectedBlockId(block.id)}
															className="rounded p-0.5 text-muted-foreground hover:text-foreground"
															title="Select"
														>
															<GripVertical className="size-3" />
														</button>
														<button
															type="button"
															onClick={() => moveBlock(block.id, "up")}
															disabled={idx === 0}
															className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
															title="Move up"
														>
															<ArrowUp className="size-3" />
														</button>
														<button
															type="button"
															onClick={() => moveBlock(block.id, "down")}
															disabled={idx === blocks.length - 1}
															className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
															title="Move down"
														>
															<ArrowDown className="size-3" />
														</button>
														<button
															type="button"
															onClick={() => duplicateBlock(block.id)}
															className="rounded p-0.5 text-muted-foreground hover:text-foreground"
															title="Duplicate"
														>
															<Copy className="size-3" />
														</button>
														<button
															type="button"
															onClick={() => removeBlock(block.id)}
															className="rounded p-0.5 text-muted-foreground hover:text-destructive"
															title="Delete"
														>
															<Trash2 className="size-3" />
														</button>
													</div>

													{/* Clickable area to select — preventDefault stops <a> tags inside blocks from navigating */}
													<button
														type="button"
														className="block w-full cursor-pointer text-left"
														onClick={(e) => {
															e.preventDefault();
															setSelectedBlockId(block.id);
														}}
														onClickCapture={(e) => {
															// Prevent any nested <a> (e.g. Button blocks) from navigating
															if ((e.target as HTMLElement).closest("a")) {
																e.preventDefault();
															}
														}}
														onKeyDown={(e) => {
															if (e.key === "Delete" || e.key === "Backspace") {
																removeBlock(block.id);
															}
														}}
													>
														{/* Render the actual React Email block */}
														<BlockRenderer
															blocks={[block]}
															branding={branding}
															variables={variables}
														/>
													</button>

													{/* Insert point between blocks */}
													<div className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
														<button
															type="button"
															onClick={() => addBlock("text", idx + 1)}
															className="flex size-4 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:border-primary hover:text-primary"
															title="Insert block below"
														>
															<Plus className="size-2.5" />
														</button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Footer */}
								<p className="mt-5 text-center text-[11px] leading-relaxed text-[#94a3b8]">
									This email was sent by {branding.appName ?? "Your App"}. If you didn't expect
									this, you can safely ignore it.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ── Right: Block Inspector ── */}
			<div className="flex w-[260px] shrink-0 flex-col border-l border-border bg-background">
				<div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
						{selectedBlock ? `${selectedBlock.type} Block` : "Properties"}
					</span>
				</div>
				<div className="flex-1 overflow-y-auto">
					{selectedBlock ? (
						<BlockInspector
							block={selectedBlock}
							onChange={(patch) => updateBlock(selectedBlock.id, patch)}
						/>
					) : (
						<div className="flex h-full items-center justify-center p-4">
							<p className="text-center text-[11px] text-muted-foreground/40">
								Select a block to edit its properties
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Block Inspector ───────────────────────────────────────────────

function BlockInspector({
	block,
	onChange,
}: {
	block: EmailBlock;
	onChange: (patch: Partial<EmailBlock>) => void;
}) {
	switch (block.type) {
		case "heading":
			return <HeadingInspector block={block} onChange={onChange} />;
		case "text":
			return <TextInspector block={block} onChange={onChange} />;
		case "button":
			return <ButtonInspector block={block} onChange={onChange} />;
		case "image":
			return <ImageInspector block={block} onChange={onChange} />;
		case "divider":
			return <StyleInspector block={block} onChange={onChange} />;
		case "spacer":
			return <SpacerInspector block={block} onChange={onChange} />;
		case "code":
			return <CodeInspector block={block} onChange={onChange} />;
		case "link":
			return <LinkInspector block={block} onChange={onChange} />;
		case "columns":
			return <ColumnsInspector block={block} onChange={onChange} />;
		default:
			return null;
	}
}

// ─── Inspector Sub-components ──────────────────────────────────────

function InspectorField({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-1 px-3 py-1.5">
			<Label className="text-[10px] text-muted-foreground">{label}</Label>
			{children}
		</div>
	);
}

function VariableInsert({ text, onTextChange }: { text: string; onTextChange: (t: string) => void }) {
	return (
		<div className="grid gap-1 px-3 py-1.5">
			<Label className="text-[10px] text-muted-foreground">Insert Variable</Label>
			<Select
				value=""
				onValueChange={(varName) => {
					onTextChange(text + `{{${varName}}}`);
				}}
			>
				<SelectTrigger className="h-6 text-[10px]">
					<SelectValue placeholder="{{variable}}" />
				</SelectTrigger>
				<SelectContent>
					{["userName", "appName", "verificationUrl", "resetUrl", "magicLinkUrl", "otp", "inviterName", "organizationName", "acceptUrl", "dashboardUrl"].map(
						(v) => (
							<SelectItem key={v} value={v} className="text-[10px]">
								{`{{${v}}}`}
							</SelectItem>
						),
					)}
				</SelectContent>
			</Select>
		</div>
	);
}

function HeadingInspector({
	block,
	onChange,
}: { block: HeadingBlock; onChange: (p: Partial<HeadingBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Text">
				<Input
					value={block.text}
					onChange={(e) => onChange({ text: e.target.value })}
					className="h-7 text-[11px]"
				/>
			</InspectorField>
			<VariableInsert text={block.text} onTextChange={(t) => onChange({ text: t })} />
			<InspectorField label="Level">
				<Select value={block.as} onValueChange={(v) => onChange({ as: v as HeadingBlock["as"] })}>
					<SelectTrigger className="h-7 text-[11px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((h) => (
							<SelectItem key={h} value={h}>
								{h.toUpperCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</InspectorField>
			<Separator className="my-2" />
			<StyleInspector block={block} onChange={onChange} />
		</div>
	);
}

function TextInspector({
	block,
	onChange,
}: { block: TextBlock; onChange: (p: Partial<TextBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Content">
				<Textarea
					value={block.text}
					onChange={(e) => onChange({ text: e.target.value })}
					className="min-h-[100px] resize-y text-[11px]"
					placeholder="Supports {{variables}} and basic HTML (<strong>, <em>)"
				/>
			</InspectorField>
			<VariableInsert text={block.text} onTextChange={(t) => onChange({ text: t })} />
			<p className="px-3 text-[9px] leading-relaxed text-muted-foreground/50">
				Use {"{{variableName}}"} for dynamic content. Supports &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;
				HTML tags.
			</p>
			<Separator className="my-2" />
			<StyleInspector block={block} onChange={onChange} />
		</div>
	);
}

function ButtonInspector({
	block,
	onChange,
}: { block: ButtonBlock; onChange: (p: Partial<ButtonBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Label">
				<Input
					value={block.text}
					onChange={(e) => onChange({ text: e.target.value })}
					className="h-7 text-[11px]"
				/>
			</InspectorField>
			<InspectorField label="URL">
				<Input
					value={block.href}
					onChange={(e) => onChange({ href: e.target.value })}
					className="h-7 font-mono text-[11px]"
					placeholder="https://..."
				/>
			</InspectorField>
			<InspectorField label="Variant">
				<Select
					value={block.variant ?? "primary"}
					onValueChange={(v) => onChange({ variant: v as ButtonBlock["variant"] })}
				>
					<SelectTrigger className="h-7 text-[11px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="primary">Primary</SelectItem>
						<SelectItem value="secondary">Secondary</SelectItem>
						<SelectItem value="outline">Outline</SelectItem>
					</SelectContent>
				</Select>
			</InspectorField>
			<Separator className="my-2" />
			<StyleInspector block={block} onChange={onChange} />
		</div>
	);
}

function ImageInspector({
	block,
	onChange,
}: { block: ImageBlock; onChange: (p: Partial<ImageBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Image URL">
				<Input
					value={block.src}
					onChange={(e) => onChange({ src: e.target.value })}
					className="h-7 font-mono text-[11px]"
					placeholder="https://..."
				/>
			</InspectorField>
			<InspectorField label="Alt Text">
				<Input
					value={block.alt}
					onChange={(e) => onChange({ alt: e.target.value })}
					className="h-7 text-[11px]"
				/>
			</InspectorField>
			<InspectorField label="Width (px)">
				<Input
					type="number"
					value={block.width ?? 600}
					onChange={(e) => onChange({ width: Number(e.target.value) || undefined })}
					className="h-7 text-[11px]"
				/>
			</InspectorField>
			<InspectorField label="Height (px)">
				<Input
					type="number"
					value={block.height ?? ""}
					onChange={(e) => onChange({ height: Number(e.target.value) || undefined })}
					className="h-7 text-[11px]"
					placeholder="Auto"
				/>
			</InspectorField>
		</div>
	);
}

function SpacerInspector({
	block,
	onChange,
}: { block: SpacerBlock; onChange: (p: Partial<SpacerBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Height">
				<div className="flex items-center gap-2">
					<Slider
						value={[block.height]}
						onValueChange={([v]) => {
							if (v !== undefined) onChange({ height: v });
						}}
						min={4}
						max={120}
						className="flex-1"
					/>
					<span className="min-w-[28px] text-right font-mono text-[10px] text-muted-foreground">
						{block.height}px
					</span>
				</div>
			</InspectorField>
		</div>
	);
}

function CodeInspector({
	block,
	onChange,
}: { block: CodeBlock; onChange: (p: Partial<CodeBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Code / OTP">
				<Input
					value={block.text}
					onChange={(e) => onChange({ text: e.target.value })}
					className="h-7 font-mono text-[11px]"
					placeholder="123456 or {{otp}}"
				/>
			</InspectorField>
			<Separator className="my-2" />
			<StyleInspector block={block} onChange={onChange} />
		</div>
	);
}

function LinkInspector({
	block,
	onChange,
}: { block: LinkBlock; onChange: (p: Partial<LinkBlock>) => void }) {
	return (
		<div className="py-2">
			<InspectorField label="Link Text">
				<Input
					value={block.text}
					onChange={(e) => onChange({ text: e.target.value })}
					className="h-7 text-[11px]"
				/>
			</InspectorField>
			<InspectorField label="URL">
				<Input
					value={block.href}
					onChange={(e) => onChange({ href: e.target.value })}
					className="h-7 font-mono text-[11px]"
					placeholder="https://..."
				/>
			</InspectorField>
			<Separator className="my-2" />
			<StyleInspector block={block} onChange={onChange} />
		</div>
	);
}

function ColumnsInspector({
	block,
	onChange,
}: { block: ColumnsBlock; onChange: (p: Partial<ColumnsBlock>) => void }) {
	const colCount = block.columns.length;

	const setColumnCount = (count: number) => {
		const cols = [...block.columns];
		while (cols.length < count) {
			cols.push({ width: `${Math.floor(100 / count)}%`, blocks: [] });
		}
		while (cols.length > count) {
			cols.pop();
		}
		// Redistribute widths
		for (const col of cols) {
			col.width = `${Math.floor(100 / count)}%`;
		}
		onChange({ columns: cols });
	};

	return (
		<div className="py-2">
			<InspectorField label="Number of Columns">
				<Select value={String(colCount)} onValueChange={(v) => setColumnCount(Number(v))}>
					<SelectTrigger className="h-7 text-[11px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="2">2 Columns</SelectItem>
						<SelectItem value="3">3 Columns</SelectItem>
						<SelectItem value="4">4 Columns</SelectItem>
					</SelectContent>
				</Select>
			</InspectorField>
			<p className="px-3 text-[9px] leading-relaxed text-muted-foreground/50">
				Add content to columns by nesting blocks inside each column in the JSON editor (coming
				soon).
			</p>
		</div>
	);
}

// ─── Shared Style Inspector ────────────────────────────────────────

function StyleInspector<T extends EmailBlock & { style?: EmailBlockStyle }>({
	block,
	onChange,
}: {
	block: T;
	onChange: (p: Partial<T>) => void;
}) {
	const style = block.style ?? {};

	const updateStyle = (patch: Partial<EmailBlockStyle>) => {
		onChange({ style: { ...style, ...patch } } as Partial<T>);
	};

	return (
		<div>
			<div className="flex items-center gap-1.5 px-3 pb-1 pt-2">
				<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
					Style
				</span>
			</div>
			<InspectorField label="Font Size">
				<Input
					type="number"
					value={style.fontSize ?? ""}
					onChange={(e) =>
						updateStyle({
							fontSize: e.target.value ? Number(e.target.value) : undefined,
						})
					}
					className="h-7 text-[11px]"
					placeholder="Default"
				/>
			</InspectorField>
			<InspectorField label="Color">
				<div className="flex items-center gap-1.5">
					<div className="relative">
						<input
							type="color"
							value={style.color ?? "#000000"}
							onChange={(e) => updateStyle({ color: e.target.value })}
							className="absolute inset-0 cursor-pointer opacity-0"
						/>
						<div
							className="size-7 rounded-md border border-border"
							style={{ backgroundColor: style.color ?? "transparent" }}
						/>
					</div>
					<Input
						value={style.color ?? ""}
						onChange={(e) => updateStyle({ color: e.target.value || undefined })}
						className="h-7 flex-1 font-mono text-[10px]"
						placeholder="Default"
					/>
				</div>
			</InspectorField>
			<InspectorField label="Text Align">
				<Select
					value={style.textAlign ?? ""}
					onValueChange={(v) =>
						updateStyle({ textAlign: (v || undefined) as EmailBlockStyle["textAlign"] })
					}
				>
					<SelectTrigger className="h-7 text-[11px]">
						<SelectValue placeholder="Default" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="left">Left</SelectItem>
						<SelectItem value="center">Center</SelectItem>
						<SelectItem value="right">Right</SelectItem>
					</SelectContent>
				</Select>
			</InspectorField>
			<div className="grid gap-1 px-3 py-1.5">
				<Label className="text-[10px] text-muted-foreground">Decoration</Label>
				<div className="flex gap-1">
					<button
						type="button"
						className={`h-7 w-7 rounded-md border text-[11px] ${
							style.textDecoration === "underline" ? "border-primary bg-primary/10" : "border-border"
						}`}
						onClick={() =>
							updateStyle({
								textDecoration: style.textDecoration === "underline" ? "none" : "underline",
							})
						}
						title="Underline"
					>
						U̲
					</button>
					<button
						type="button"
						className={`h-7 w-7 rounded-md border text-[11px] ${
							style.fontWeight === "bold" || style.fontWeight === "700" ? "border-primary bg-primary/10" : "border-border"
						}`}
						onClick={() =>
							updateStyle({
								fontWeight: style.fontWeight === "bold" || style.fontWeight === "700" ? "normal" : "bold",
							})
						}
						title="Bold"
					>
						<strong>B</strong>
					</button>
				</div>
			</div>
			<div className="grid gap-1 px-3 py-1.5">
				<Label className="text-[10px] text-muted-foreground">Padding</Label>
				<div className="grid grid-cols-2 gap-1">
					{(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map(
						(side) => (
							<div key={side} className="flex items-center gap-1">
								<span className="text-[8px] text-muted-foreground/60 w-3">
									{side === "paddingTop" ? "T" : side === "paddingBottom" ? "B" : side === "paddingLeft" ? "L" : "R"}
								</span>
								<Input
									type="number"
									value={style[side] ?? ""}
									onChange={(e) =>
										updateStyle({
											[side]: e.target.value ? Number(e.target.value) : undefined,
										})
									}
									className="h-6 text-[10px] w-full"
									placeholder="0"
									min={0}
									max={60}
								/>
							</div>
						),
					)}
				</div>
			</div>
			<div className="grid gap-1 px-3 py-1.5">
				<Label className="text-[10px] text-muted-foreground">Background</Label>
				<div className="flex items-center gap-1.5">
					<div className="relative">
						<input
							type="color"
							value={style.backgroundColor ?? "#ffffff"}
							onChange={(e) =>
								updateStyle({ backgroundColor: e.target.value })
							}
							className="absolute inset-0 cursor-pointer opacity-0"
						/>
						<div
							className="size-6 rounded-md border border-border"
							style={{ backgroundColor: style.backgroundColor ?? "#ffffff" }}
						/>
					</div>
					<Input
						value={style.backgroundColor ?? ""}
						onChange={(e) =>
							updateStyle({ backgroundColor: e.target.value || undefined })
						}
						className="h-6 flex-1 font-mono text-[9px]"
						placeholder="transparent"
					/>
				</div>
			</div>
		</div>
	);
}
