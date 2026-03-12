"use client";

import {
	BrandingCanvas,
	type BrandingValues,
	type CanvasView,
	type AuthPreviewConfig,
	deriveCssVariables,
	parseCssVariables,
} from "@/components/branding-preview";
import type { EmailBrandingProps } from "@/components/email-block-renderer";
import { EmailEditor } from "@/components/email-editor";
import { useActiveProjectId } from "@/components/project-environment-provider";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	type BrandingConfig,
	type EmailTemplate,
	createEmailTemplate,
	deleteEmailTemplate,
	getBrandingConfig,
	getDashboardConfig,
	getEnabledPublicSocialProviders,
	listEmailTemplates,
	saveBrandingConfig,
	updateEmailTemplate,
} from "@/lib/dashboard-api";
import type { EmailBlock, EmailBlockType, EmailTemplateCategory } from "@banata-auth/shared";
import { extractVariables, getBlankTemplateBlocks, getBuiltInTemplateBlocks, SYSTEM_TEMPLATE_VARIABLES } from "@banata-auth/shared";
import {
	Check,
	Code2,
	FilePlus,
	ImageIcon,
	Loader2,
	Lock,
	Mail,
	Monitor,
	Palette,
	PanelRight,
	Smartphone,
	Trash2,
	Type,
	Upload,
	UserPlus,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Built-in template definitions to seed on first load ───────────

const BUILT_IN_TEMPLATES: Array<{
	name: string;
	slug: string;
	subject: string;
	category: EmailTemplateCategory;
	description: string;
	builtInType:
		| "verification"
		| "password-reset"
		| "magic-link"
		| "email-otp"
		| "invitation"
		| "welcome";
}> = [
	{
		name: "Verification",
		slug: "verification",
		subject: "Verify your email — {{appName}}",
		category: "auth",
		description: "Sent when a user signs up to verify their email address",
		builtInType: "verification",
	},
	{
		name: "Password Reset",
		slug: "password-reset",
		subject: "Reset your password — {{appName}}",
		category: "auth",
		description: "Sent when a user requests a password reset",
		builtInType: "password-reset",
	},
	{
		name: "Magic Link",
		slug: "magic-link",
		subject: "Sign in to {{appName}}",
		category: "auth",
		description: "Passwordless sign-in link",
		builtInType: "magic-link",
	},
	{
		name: "OTP Code",
		slug: "email-otp",
		subject: "{{otp}} is your verification code — {{appName}}",
		category: "auth",
		description: "One-time passcode for sign-in",
		builtInType: "email-otp",
	},
	{
		name: "Invitation",
		slug: "invitation",
		subject: "{{inviterName}} invited you to {{organizationName}}",
		category: "auth",
		description: "Organization membership invitation",
		builtInType: "invitation",
	},
	{
		name: "Welcome",
		slug: "welcome",
		subject: "Welcome to {{appName}}",
		category: "auth",
		description: "Sent after account creation",
		builtInType: "welcome",
	},
];

// ─── View Definitions ──────────────────────────────────────────────

const VIEWS: { id: CanvasView; label: string; icon: React.ReactNode }[] = [
	{ id: "sign-in", label: "Sign In", icon: <Monitor className="size-3.5" /> },
	{ id: "sign-up", label: "Sign Up", icon: <UserPlus className="size-3.5" /> },
	{ id: "email", label: "Email", icon: <Mail className="size-3.5" /> },
];

// ─── Seed built-in templates if none exist ─────────────────────────

async function seedBuiltInTemplates(): Promise<EmailTemplate[]> {
	const seeded: EmailTemplate[] = [];
	for (const def of BUILT_IN_TEMPLATES) {
		try {
			const tpl = await createEmailTemplate({
				name: def.name,
				slug: def.slug,
				subject: def.subject,
				category: def.category,
				description: def.description,
				blocksJson: JSON.stringify(getBuiltInTemplateBlocks(def.builtInType)),
				builtInType: def.builtInType,
			});
			seeded.push(tpl);
		} catch (err) {
			// Template might already exist (slug conflict) — skip silently.
			// Log unexpected errors for debugging.
			const msg = err instanceof Error ? err.message : String(err);
			if (!msg.toLowerCase().includes("slug") && !msg.toLowerCase().includes("already exists")) {
				console.warn(`[seed] Failed to create built-in template "${def.slug}":`, msg);
			}
		}
	}
	return seeded;
}

// ─── Page ──────────────────────────────────────────────────────────

export default function BrandingPage() {
	const activeProjectId = useActiveProjectId();
	// Branding state
	const [primaryColor, setPrimaryColor] = useState("#6366f1");
	const [bgColor, setBgColor] = useState("#09090b");
	const [borderRadius, setBorderRadius] = useState([8]);
	const [darkMode, setDarkMode] = useState(true);
	const [customCss, setCustomCss] = useState("");
	const [font, setFont] = useState("inter");
	const [logoUrl, setLogoUrl] = useState("");
	const [cardWidth, setCardWidth] = useState(420);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Auth config for preview
	const [authConfig, setAuthConfig] = useState<AuthPreviewConfig | undefined>(undefined);

	// Canvas state
	const [view, setView] = useState<CanvasView>("sign-in");
	const [panelOpen, setPanelOpen] = useState(true);
	const [deviceWidth, setDeviceWidth] = useState<"desktop" | "mobile">("desktop");

	// Email template state
	const [templates, setTemplates] = useState<EmailTemplate[]>([]);
	const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
	const [blocks, setBlocks] = useState<EmailBlock[]>([]);
	const [templateName, setTemplateName] = useState("");
	const [templateSlug, setTemplateSlug] = useState("");
	const [templateSubject, setTemplateSubject] = useState("");
	const [templateCategory, setTemplateCategory] = useState<EmailTemplateCategory>("custom");
	const [isCreating, setIsCreating] = useState(false);
	const [isTemplateSaving, setIsTemplateSaving] = useState(false);
	const [templateSaved, setTemplateSaved] = useState(false);

	const activeTemplate = templates.find((t) => t.id === activeTemplateId) ?? null;

	// ── Load branding + templates ──────────────────────────────────

	useEffect(() => {
		if (!activeProjectId) {
			setIsLoading(false);
			return;
		}

		async function load() {
			try {
				const [brandingResult, templatesResult, dashboardConfigResult] = await Promise.allSettled([
					getBrandingConfig(),
					listEmailTemplates(),
					getDashboardConfig(),
				]);

				if (brandingResult.status === "fulfilled") {
					const c = brandingResult.value;
					setPrimaryColor(c.primaryColor);
					setBgColor(c.bgColor);
					setBorderRadius([c.borderRadius]);
					setDarkMode(c.darkMode);
					setCustomCss(c.customCss);
					setFont(c.font);
					setLogoUrl(c.logoUrl ?? "");
				}

				if (dashboardConfigResult.status === "fulfilled") {
					const cfg = dashboardConfigResult.value;
					const enabledProviders = getEnabledPublicSocialProviders(cfg);
					const methods = cfg.authMethods ?? {};
					setAuthConfig({
						emailPasswordEnabled: methods.emailPassword === true,
						magicLinkEnabled: methods.magicLink === true,
						emailOtpEnabled: methods.emailOtp === true,
						passkeyEnabled: methods.passkey === true,
						enabledSocialProviders: enabledProviders.map((p) => ({
							id: p.id,
							label: p.id.charAt(0).toUpperCase() + p.id.slice(1),
						})),
					});
				}

				let loadedTemplates: EmailTemplate[] = [];
				if (templatesResult.status === "fulfilled") {
					loadedTemplates = templatesResult.value;
				}

				// If no templates exist, seed the 6 built-in auth templates
				if (loadedTemplates.length === 0) {
					const seeded = await seedBuiltInTemplates();
					if (seeded.length > 0) {
						loadedTemplates = seeded;
					} else {
						// Retry listing in case they were already created
						try {
							loadedTemplates = await listEmailTemplates();
						} catch {
							// ignore
						}
					}
				}

				setTemplates(loadedTemplates);
				if (loadedTemplates.length > 0 && loadedTemplates[0]) {
					selectTemplate(loadedTemplates[0]);
				}
			} finally {
				setIsLoading(false);
			}
		}
		load();
	}, [activeProjectId]);

	function selectTemplate(tpl: EmailTemplate) {
		setActiveTemplateId(tpl.id);
		setTemplateName(tpl.name);
		setTemplateSlug(tpl.slug);
		setTemplateSubject(tpl.subject);
		setTemplateCategory(tpl.category as EmailTemplateCategory);
		try {
			setBlocks(JSON.parse(tpl.blocksJson) as EmailBlock[]);
		} catch {
			setBlocks([]);
		}
	}

	// ── Template operations ────────────────────────────────────────

	async function handleCreateTemplate() {
		setIsCreating(true);
		try {
			const newBlocks = getBlankTemplateBlocks();
			const tpl = await createEmailTemplate({
				name: "Untitled Template",
				slug: `template-${Date.now()}`,
				subject: "Your Subject Here",
				category: "custom",
				blocksJson: JSON.stringify(newBlocks),
			});
			setTemplates((prev) => [tpl, ...prev]);
			selectTemplate(tpl);
			toast.success("Template created");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to create template";
			toast.error(msg);
		} finally {
			setIsCreating(false);
		}
	}

	async function handleSaveTemplate() {
		if (!activeTemplateId) return;
		setIsTemplateSaving(true);
		setTemplateSaved(false);
		try {
			const updated = await updateEmailTemplate(activeTemplateId, {
				name: templateName,
				slug: templateSlug,
				subject: templateSubject,
				category: templateCategory,
				blocksJson: JSON.stringify(blocks),
			});
			setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
			setTemplateSaved(true);
			setTimeout(() => setTemplateSaved(false), 2000);
			toast.success("Template saved");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to save template";
			toast.error(msg);
		} finally {
			setIsTemplateSaving(false);
		}
	}

	async function handleDeleteTemplate() {
		if (!activeTemplateId || activeTemplate?.builtIn) return;
		try {
			await deleteEmailTemplate(activeTemplateId);
			const remaining = templates.filter((t) => t.id !== activeTemplateId);
			setTemplates(remaining);
			if (remaining.length > 0 && remaining[0]) {
				selectTemplate(remaining[0]);
			} else {
				setActiveTemplateId(null);
				setBlocks([]);
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to delete template";
			toast.error(msg);
		}
	}

	// ── Branding operations ────────────────────────────────────────

	function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") setLogoUrl(reader.result);
		};
		reader.readAsDataURL(file);
		e.target.value = "";
	}

	const handleSaveBranding = useCallback(async () => {
		try {
			setIsSaving(true);
			setSaved(false);
			const result = await saveBrandingConfig({
				primaryColor,
				bgColor,
				borderRadius: borderRadius[0],
				darkMode,
				customCss,
				font,
				logoUrl,
			});
			setPrimaryColor(result.primaryColor);
			setBgColor(result.bgColor);
			setBorderRadius([result.borderRadius]);
			setDarkMode(result.darkMode);
			setCustomCss(result.customCss);
			setFont(result.font);
			setLogoUrl(result.logoUrl ?? "");
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch {
			/* handled silently */
		} finally {
			setIsSaving(false);
		}
	}, [primaryColor, bgColor, borderRadius, darkMode, customCss, font, logoUrl]);

	const branding: BrandingValues = useMemo(
		() => ({
			primaryColor,
			bgColor,
			borderRadius: borderRadius[0] ?? 8,
			darkMode,
			font,
			logoUrl,
			customCss,
			cardWidth,
		}),
		[primaryColor, bgColor, borderRadius, darkMode, font, logoUrl, customCss, cardWidth],
	);

	const emailBranding: EmailBrandingProps = useMemo(
		() => ({
			appName: "Your App",
			primaryColor,
			bgColor: "#f8fafc", // Email body bg is always light
			logoUrl: logoUrl || undefined,
			borderRadius: borderRadius[0] ?? 8,
			darkMode: false, // Email preview always light for now
		}),
		[primaryColor, logoUrl, borderRadius],
	);

	const canvasBg = useMemo(() => {
		const vars = deriveCssVariables(branding);
		if (customCss) Object.assign(vars, parseCssVariables(customCss));
		return `hsl(${vars["--background"] ?? "0 0% 4%"})`;
	}, [branding, customCss]);

	// ── Loading ────────────────────────────────────────────────────

	if (isLoading) {
		return (
			<div className="-mx-6 -my-6 flex h-[calc(100vh-3.5rem)]">
				<div className="flex-1 bg-muted/20">
					<Skeleton className="m-auto mt-[25%] h-[420px] w-[380px] rounded-xl" />
				</div>
				<div className="w-[280px] shrink-0 border-l border-border p-4">
					{["logo", "colors", "style", "css"].map((s) => (
						<div key={s} className="mb-6 space-y-3">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-8 w-full rounded-md" />
						</div>
					))}
				</div>
			</div>
		);
	}

	// ── Email Editor View ──────────────────────────────────────────

	if (view === "email") {
		return (
			<div className="-mx-6 -my-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
				{/* ━━ Top bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
				<div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-3">
					{/* Left: view selector + template picker */}
					<div className="flex items-center gap-1">
						{VIEWS.map((v) => (
							<button
								key={v.id}
								type="button"
								onClick={() => setView(v.id)}
								className={[
									"flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
									view === v.id
										? "bg-muted text-foreground"
										: "text-muted-foreground hover:text-foreground",
								].join(" ")}
							>
								{v.icon}
								{v.label}
							</button>
						))}

						<Separator orientation="vertical" className="mx-1.5 h-4" />

						{/* Template selector */}
						<Select
							value={activeTemplateId ?? ""}
							onValueChange={(id) => {
								const tpl = templates.find((t) => t.id === id);
								if (tpl) selectTemplate(tpl);
							}}
						>
							<SelectTrigger className="h-7 w-auto max-w-[200px] gap-1.5 rounded-md border-border/50 bg-muted/50 px-2.5 text-[12px] font-medium">
								<SelectValue placeholder="Select template" />
							</SelectTrigger>
							<SelectContent align="start">
								{/* System templates */}
								{templates.filter(t => t.builtIn).length > 0 && (
									<>
										<div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
											System Templates
										</div>
										{templates.filter(t => t.builtIn).map((tpl) => (
											<SelectItem key={tpl.id} value={tpl.id}>
												<div className="flex items-center gap-2 text-[12px]">
													<Lock className="size-3 text-muted-foreground/40" />
													{tpl.name}
												</div>
											</SelectItem>
										))}
									</>
								)}
								{/* Custom templates */}
								{templates.filter(t => !t.builtIn).length > 0 && (
									<>
										<div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
											Custom Templates
										</div>
										{templates.filter(t => !t.builtIn).map((tpl) => (
											<SelectItem key={tpl.id} value={tpl.id}>
												<div className="flex items-center gap-2 text-[12px]">
													<span
														className="size-1.5 rounded-full"
														style={{ backgroundColor: "#10b981" }}
													/>
													{tpl.name}
												</div>
											</SelectItem>
										))}
									</>
								)}
							</SelectContent>
						</Select>

						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0"
							onClick={handleCreateTemplate}
							disabled={isCreating}
							title="New template"
						>
							{isCreating ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<FilePlus className="size-3.5" />
							)}
						</Button>
					</div>

					{/* Right: save + delete */}
					<div className="flex items-center gap-1">
						{activeTemplate && !activeTemplate.builtIn && (
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
								onClick={handleDeleteTemplate}
								title="Delete template"
							>
								<Trash2 className="size-3.5" />
							</Button>
						)}

						<Separator orientation="vertical" className="mx-1 h-4" />

						<Button
							size="sm"
							className="h-7 gap-1.5 px-3 text-[12px]"
							onClick={handleSaveTemplate}
							disabled={isTemplateSaving || !activeTemplateId}
						>
							{isTemplateSaving ? (
								<Loader2 className="size-3 animate-spin" />
							) : templateSaved ? (
								<Check className="size-3" />
							) : null}
							{isTemplateSaving ? "Saving" : templateSaved ? "Saved" : "Save Template"}
						</Button>
					</div>
				</div>

				{/* ━━ Editor (palette + canvas + inspector) ━━━━━━━━━━━━━ */}
				<div className="flex flex-1 overflow-hidden">
					{activeTemplateId ? (
						<>
							{/* Template meta sidebar (thin) */}
							<div className="flex w-[200px] shrink-0 flex-col border-r border-border bg-background">
								<div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
									<Mail className="size-3 text-muted-foreground/50" />
									<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
										Template
									</span>
								</div>
								<div className="flex-1 overflow-y-auto p-3">
									<div className="grid gap-2.5">
										<div className="grid gap-1">
											<Label className="text-[10px] text-muted-foreground">Name</Label>
											<Input
												value={templateName}
												onChange={(e) => setTemplateName(e.target.value)}
												className="h-7 text-[11px]"
											/>
										</div>
										<div className="grid gap-1">
											<Label className="text-[10px] text-muted-foreground">Slug</Label>
											<Input
												value={templateSlug}
												onChange={(e) => setTemplateSlug(e.target.value)}
												className="h-7 font-mono text-[10px]"
											/>
										</div>
										<div className="grid gap-1">
											<Label className="text-[10px] text-muted-foreground">Subject</Label>
											<Input
												value={templateSubject}
												onChange={(e) => setTemplateSubject(e.target.value)}
												className="h-7 text-[11px]"
												placeholder="{{appName}} — Subject"
											/>
										</div>
										<div className="grid gap-1">
											<Label className="text-[10px] text-muted-foreground">Type</Label>
											<div className="flex h-7 items-center">
												<span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${
													activeTemplate?.builtIn
														? "bg-blue-500/10 text-blue-500"
														: "bg-emerald-500/10 text-emerald-500"
												}`}>
													{activeTemplate?.builtIn ? (
														<><Lock className="size-2.5" /> System</>
													) : (
														"Custom"
													)}
												</span>
											</div>
										</div>
									</div>

									<Separator className="my-3" />

									<div className="space-y-2">
										<span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">
											SDK Usage
										</span>
										<div className="rounded-md border border-border bg-muted/30 p-2">
											<code className="block whitespace-pre-wrap font-mono text-[9px] leading-relaxed text-muted-foreground">
												{`await banataAuth.emails.send({\n  to: "user@example.com",\n  template: "${templateSlug}",\n  data: { ... },\n});`}
											</code>
										</div>
									</div>

									<Separator className="my-3" />

									<div className="space-y-2">
										<span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">
											Variables
										</span>
										{activeTemplate?.builtIn && activeTemplate.builtInType && SYSTEM_TEMPLATE_VARIABLES[activeTemplate.builtInType] ? (
											<div className="space-y-1.5">
												{SYSTEM_TEMPLATE_VARIABLES[activeTemplate.builtInType]!.map((v) => (
													<div key={v.name} className="rounded-md border border-border bg-muted/30 p-2">
														<code className="font-mono text-[10px] font-semibold text-foreground">
															{"{{" + v.name + "}}"}
														</code>
														<p className="mt-0.5 text-[9px] text-muted-foreground">{v.description}</p>
													</div>
												))}
											</div>
										) : (
											<div className="space-y-1.5">
												{extractVariables(blocks).length > 0 ? (
													extractVariables(blocks).map((varName) => (
														<div key={varName} className="rounded-md border border-border bg-muted/30 p-2">
															<code className="font-mono text-[10px] font-semibold text-foreground">
																{"{{" + varName + "}}"}
															</code>
														</div>
													))
												) : (
													<p className="text-[9px] text-muted-foreground/60">
														No variables detected. Use {"{{variableName}}"} syntax in text blocks.
													</p>
												)}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Email editor */}
							<div className="flex-1 overflow-hidden">
								<EmailEditor
									blocks={blocks}
									onBlocksChange={setBlocks}
									branding={emailBranding}
									variables={{
										userName: "Jane Doe",
										appName: "Your App",
										verificationUrl: "https://app.example.com/verify?token=abc123",
										resetUrl: "https://app.example.com/reset?token=xyz789",
										magicLinkUrl: "https://app.example.com/magic?token=mlk456",
										otp: "847291",
										inviterName: "John Smith",
										organizationName: "Acme Corp",
										acceptUrl: "https://app.example.com/invite/accept?id=inv_abc123",
										dashboardUrl: "https://app.example.com/dashboard",
									}}
								/>
							</div>
						</>
					) : (
						<div className="flex flex-1 items-center justify-center">
							<div className="text-center">
								<Mail className="mx-auto mb-3 size-10 text-muted-foreground/20" />
								<h3 className="text-sm font-medium text-muted-foreground">No templates yet</h3>
								<p className="mt-1 text-xs text-muted-foreground/60">
									Create your first email template to start designing
								</p>
								<Button
									size="sm"
									className="mt-4"
									onClick={handleCreateTemplate}
									disabled={isCreating}
								>
									{isCreating ? (
										<Loader2 className="mr-1.5 size-3.5 animate-spin" />
									) : (
										<FilePlus className="mr-1.5 size-3.5" />
									)}
									Create Template
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}

	// ── Studio layout (Sign In / Sign Up views) ────────────────────

	return (
		<div className="-mx-6 -my-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
			{/* ━━ Top bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
			<div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-3">
				{/* Left: view selector */}
				<div className="flex items-center gap-1">
					{VIEWS.map((v) => (
						<button
							key={v.id}
							type="button"
							onClick={() => setView(v.id)}
							className={[
								"flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
								view === v.id
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:text-foreground",
							].join(" ")}
						>
							{v.icon}
							{v.label}
						</button>
					))}
				</div>

				{/* Right: device toggles + panel toggle + save */}
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setDeviceWidth("desktop")}
						className={[
							"rounded-md p-1.5 transition-colors",
							deviceWidth === "desktop"
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground",
						].join(" ")}
						title="Desktop"
					>
						<Monitor className="size-3.5" />
					</button>
					<button
						type="button"
						onClick={() => setDeviceWidth("mobile")}
						className={[
							"rounded-md p-1.5 transition-colors",
							deviceWidth === "mobile"
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground",
						].join(" ")}
						title="Mobile"
					>
						<Smartphone className="size-3.5" />
					</button>

					<Separator orientation="vertical" className="mx-1 h-4" />

					<button
						type="button"
						onClick={() => setPanelOpen((p) => !p)}
						className={[
							"rounded-md p-1.5 transition-colors",
							panelOpen
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground",
						].join(" ")}
						title="Toggle inspector"
					>
						<PanelRight className="size-3.5" />
					</button>

					<Separator orientation="vertical" className="mx-1 h-4" />

					<Button
						size="sm"
						className="h-7 gap-1.5 px-3 text-[12px]"
						onClick={handleSaveBranding}
						disabled={isSaving}
					>
						{isSaving ? (
							<Loader2 className="size-3 animate-spin" />
						) : saved ? (
							<Check className="size-3" />
						) : null}
						{isSaving ? "Saving" : saved ? "Saved" : "Save"}
					</Button>
				</div>
			</div>

			{/* ━━ Canvas + Panel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
			<div className="flex flex-1 overflow-hidden">
				{/* Canvas */}
				<div
					className="relative flex flex-1 items-center justify-center overflow-auto"
					style={{ backgroundColor: canvasBg }}
				>
					{/* Dot grid overlay */}
					<div
						className="pointer-events-none absolute inset-0"
						style={{
							backgroundImage:
								"radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
							backgroundSize: "20px 20px",
						}}
					/>
					<div
						className="relative z-[1] h-full transition-all"
						style={{
							width: deviceWidth === "mobile" ? 375 : "100%",
							maxWidth: deviceWidth === "mobile" ? 375 : undefined,
						}}
					>
						<BrandingCanvas branding={branding} view={view} emailTemplate="verification" authConfig={authConfig} />
					</div>
				</div>

				{/* Inspector panel */}
				{panelOpen && (
					<div className="flex w-[280px] shrink-0 flex-col border-l border-border bg-background">
						<div className="flex-1 overflow-y-auto">
							{/* ── Logo ── */}
							<SectionHead icon={<ImageIcon className="size-3.5" />} label="Logo" />
							<div className="px-3 pb-3">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleLogoSelect}
								/>
								<div className="flex items-center gap-3">
									<div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
										{logoUrl ? (
											<>
												<img src={logoUrl} alt="Logo" className="size-full object-contain" />
												<button
													type="button"
													onClick={() => setLogoUrl("")}
													className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
												>
													<X className="size-2.5" />
												</button>
											</>
										) : (
											<ImageIcon className="size-3.5 text-muted-foreground/40" />
										)}
									</div>
									<div>
										<Button
											variant="outline"
											size="sm"
											className="h-6 px-2 text-[10px]"
											onClick={() => fileInputRef.current?.click()}
										>
											<Upload className="size-3" />
											{logoUrl ? "Change" : "Upload"}
										</Button>
									</div>
								</div>
							</div>
							<Separator />

							{/* ── Colors ── */}
							<SectionHead icon={<Palette className="size-3.5" />} label="Colors" />
							<div className="grid gap-2.5 px-3 pb-3">
								<ColorField label="Primary" value={primaryColor} onChange={setPrimaryColor} />
								<ColorField label="Background" value={bgColor} onChange={setBgColor} />
							</div>
							<Separator />

							{/* ── Style ── */}
							<SectionHead icon={<Type className="size-3.5" />} label="Style" />
							<div className="grid gap-2.5 px-3 pb-3">
								<div className="grid gap-1">
									<Label className="text-[10px] text-muted-foreground">Font</Label>
									<Select value={font} onValueChange={setFont}>
										<SelectTrigger className="h-7 text-[11px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="inter">Inter</SelectItem>
											<SelectItem value="system">System UI</SelectItem>
											<SelectItem value="roboto">Roboto</SelectItem>
											<SelectItem value="open-sans">Open Sans</SelectItem>
											<SelectItem value="lato">Lato</SelectItem>
											<SelectItem value="poppins">Poppins</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-1">
									<Label className="text-[10px] text-muted-foreground">Radius</Label>
									<div className="flex items-center gap-2">
										<Slider
											value={borderRadius}
											onValueChange={setBorderRadius}
											min={0}
											max={24}
											className="flex-1"
										/>
										<span className="min-w-[24px] text-right font-mono text-[10px] text-muted-foreground">
											{borderRadius[0]}
										</span>
									</div>
								</div>
								<div className="grid gap-1">
									<Label className="text-[10px] text-muted-foreground">Card Width</Label>
									<div className="flex items-center gap-2">
										<Slider
											value={[cardWidth]}
											onValueChange={([v]) => setCardWidth(v ?? 420)}
											min={320}
											max={560}
											className="flex-1"
										/>
										<span className="min-w-[24px] text-right font-mono text-[10px] text-muted-foreground">
											{cardWidth}
										</span>
									</div>
								</div>
								<div className="flex items-center justify-between py-0.5">
									<Label className="text-[10px] text-muted-foreground">Dark mode</Label>
									<Switch checked={darkMode} onCheckedChange={setDarkMode} />
								</div>
							</div>
							<Separator />

							{/* ── Custom CSS ── */}
							<SectionHead icon={<Code2 className="size-3.5" />} label="Custom CSS" />
							<div className="px-3 pb-3">
								<Textarea
									value={customCss}
									onChange={(e) => setCustomCss(e.target.value)}
									placeholder={":root {\n  --primary: 238 84% 67%;\n}"}
									className="min-h-[80px] resize-y font-mono text-[10px] leading-relaxed"
								/>
								<p className="mt-1.5 text-[9px] leading-relaxed text-muted-foreground/50">
									CSS variables are applied to auth components and injected into email templates at
									send time.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Sub-components ────────────────────────────────────────────────

function SectionHead({ icon, label }: { icon: React.ReactNode; label: string }) {
	return (
		<div className="flex items-center gap-1.5 px-3 pb-1 pt-3">
			<span className="text-muted-foreground/50">{icon}</span>
			<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
				{label}
			</span>
		</div>
	);
}

function ColorField({
	label,
	value,
	onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
	return (
		<div className="grid gap-1">
			<Label className="text-[10px] text-muted-foreground">{label}</Label>
			<div className="flex items-center gap-1.5">
				<div className="relative">
					<input
						type="color"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="absolute inset-0 cursor-pointer opacity-0"
					/>
					<div
						className="size-7 rounded-md border border-border"
						style={{ backgroundColor: value }}
					/>
				</div>
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="h-7 flex-1 font-mono text-[10px]"
				/>
			</div>
		</div>
	);
}
