"use client";

import { useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────

export interface BrandingValues {
	primaryColor: string;
	bgColor: string;
	borderRadius: number;
	darkMode: boolean;
	font: string;
	logoUrl: string;
	customCss: string;
}

export type CanvasView = "sign-in" | "sign-up" | "email";

export type EmailTemplateId =
	| "verification"
	| "password-reset"
	| "magic-link"
	| "email-otp"
	| "invitation"
	| "welcome";

// ─── Email Template Metadata ───────────────────────────────────────

interface EmailTemplateMeta {
	id: EmailTemplateId;
	label: string;
	subject: string;
	description: string;
}

export const EMAIL_TEMPLATES: EmailTemplateMeta[] = [
	{
		id: "verification",
		label: "Verification",
		subject: "Verify your email",
		description: "Sent when a user signs up",
	},
	{
		id: "password-reset",
		label: "Password Reset",
		subject: "Reset your password",
		description: "Sent when a user requests a reset",
	},
	{
		id: "magic-link",
		label: "Magic Link",
		subject: "Sign in to your account",
		description: "Passwordless sign-in link",
	},
	{
		id: "email-otp",
		label: "OTP Code",
		subject: "Your verification code",
		description: "One-time passcode for sign-in",
	},
	{
		id: "invitation",
		label: "Invitation",
		subject: "You've been invited",
		description: "Organization membership invite",
	},
	{
		id: "welcome",
		label: "Welcome",
		subject: "Welcome aboard",
		description: "Sent after account creation",
	},
];

// ─── CSS Variable Derivation ───────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result?.[1] || !result[2] || !result[3]) return null;
	const r = Number.parseInt(result[1], 16) / 255;
	const g = Number.parseInt(result[2], 16) / 255;
	const b = Number.parseInt(result[3], 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, s: 0, l };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h = 0;
	if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
	else if (max === g) h = ((b - r) / d + 2) / 6;
	else h = ((r - g) / d + 4) / 6;
	return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function deriveCssVariables(branding: BrandingValues): Record<string, string> {
	const primary = hexToHsl(branding.primaryColor) ?? { h: 238, s: 84, l: 67 };
	const bg = hexToHsl(branding.bgColor) ?? { h: 0, s: 0, l: 4 };
	const fontStack = getFontStack(branding.font);

	if (branding.darkMode) {
		return {
			"--background": `${bg.h} ${bg.s}% ${bg.l}%`,
			"--foreground": "0 0% 95%",
			"--card": `${bg.h} ${bg.s}% ${Math.min(bg.l + 4, 100)}%`,
			"--card-foreground": "0 0% 95%",
			"--primary": `${primary.h} ${primary.s}% ${primary.l}%`,
			"--primary-foreground": "0 0% 100%",
			"--secondary": `${bg.h} ${bg.s}% ${Math.min(bg.l + 10, 100)}%`,
			"--secondary-foreground": "0 0% 95%",
			"--muted": `${bg.h} ${bg.s}% ${Math.min(bg.l + 8, 100)}%`,
			"--muted-foreground": "0 0% 64%",
			"--border": `${bg.h} ${bg.s}% ${Math.min(bg.l + 15, 100)}%`,
			"--input": `${bg.h} ${bg.s}% ${Math.min(bg.l + 15, 100)}%`,
			"--ring": `${primary.h} ${primary.s}% ${primary.l}%`,
			"--radius": `${branding.borderRadius}px`,
			"--font-sans": fontStack,
		};
	}
	return {
		"--background": `${bg.h} ${bg.s}% ${Math.max(bg.l, 96)}%`,
		"--foreground": "0 0% 4%",
		"--card": "0 0% 100%",
		"--card-foreground": "0 0% 4%",
		"--primary": `${primary.h} ${primary.s}% ${primary.l}%`,
		"--primary-foreground": "0 0% 100%",
		"--secondary": "0 0% 96%",
		"--secondary-foreground": "0 0% 9%",
		"--muted": "0 0% 96%",
		"--muted-foreground": "0 0% 45%",
		"--border": "0 0% 90%",
		"--input": "0 0% 90%",
		"--ring": `${primary.h} ${primary.s}% ${primary.l}%`,
		"--radius": `${branding.borderRadius}px`,
		"--font-sans": fontStack,
	};
}

function getFontStack(font: string): string {
	switch (font) {
		case "inter":
			return '"Inter", system-ui, sans-serif';
		case "system":
			return "system-ui, -apple-system, sans-serif";
		case "roboto":
			return '"Roboto", system-ui, sans-serif';
		case "open-sans":
			return '"Open Sans", system-ui, sans-serif';
		case "lato":
			return '"Lato", system-ui, sans-serif';
		case "poppins":
			return '"Poppins", system-ui, sans-serif';
		default:
			return "system-ui, sans-serif";
	}
}

export function parseCssVariables(css: string): Record<string, string> {
	const vars: Record<string, string> = {};
	const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
	for (let match = regex.exec(css); match !== null; match = regex.exec(css)) {
		if (match[1] && match[2]) vars[`--${match[1]}`] = match[2].trim();
	}
	return vars;
}

// ─── Shared Mock Primitives ────────────────────────────────────────

function MockInput({
	label,
	placeholder,
	type = "text",
}: { label: string; placeholder: string; type?: string }) {
	return (
		<div style={{ display: "grid", gap: 6 }}>
			<span style={{ fontSize: 14, fontWeight: 500, color: "hsl(var(--foreground))" }}>
				{label}
			</span>
			<input
				type={type}
				placeholder={placeholder}
				readOnly
				style={{
					height: 40,
					width: "100%",
					borderRadius: "var(--radius)",
					padding: "0 12px",
					fontSize: 14,
					outline: "none",
					backgroundColor: "hsl(var(--background))",
					border: "1px solid hsl(var(--input))",
					color: "hsl(var(--foreground))",
					boxSizing: "border-box",
				}}
			/>
		</div>
	);
}

function MockBtn({ label, primary, r }: { label: string; primary?: boolean; r: number }) {
	return (
		<button
			type="button"
			style={{
				marginTop: 4,
				display: "inline-flex",
				height: 40,
				width: "100%",
				cursor: "default",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: `${r}px`,
				fontSize: 14,
				fontWeight: 600,
				border: primary ? "none" : "1px solid hsl(var(--input))",
				backgroundColor: primary ? "hsl(var(--primary))" : "hsl(var(--background))",
				color: primary ? "#fff" : "hsl(var(--foreground))",
			}}
		>
			{label}
		</button>
	);
}

function MockSocial({ icon, label, r }: { icon: string; label: string; r: number }) {
	return (
		<button
			type="button"
			style={{
				display: "inline-flex",
				height: 40,
				width: "100%",
				cursor: "default",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
				borderRadius: `${r}px`,
				fontSize: 14,
				fontWeight: 500,
				border: "1px solid hsl(var(--input))",
				backgroundColor: "hsl(var(--background))",
				color: "hsl(var(--foreground))",
			}}
		>
			<span
				style={{
					display: "inline-flex",
					width: 18,
					height: 18,
					alignItems: "center",
					justifyContent: "center",
					fontSize: 11,
					fontWeight: 700,
					borderRadius: 4,
					backgroundColor: "hsl(var(--muted))",
					color: "hsl(var(--muted-foreground))",
				}}
			>
				{icon}
			</span>
			{label}
		</button>
	);
}

function OrDivider() {
	return (
		<div style={{ position: "relative", margin: "4px 0" }}>
			<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
				<span style={{ width: "100%", borderTop: "1px solid hsl(var(--border))" }} />
			</div>
			<div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
				<span
					style={{
						padding: "0 12px",
						fontSize: 12,
						textTransform: "uppercase",
						backgroundColor: "hsl(var(--card))",
						color: "hsl(var(--muted-foreground))",
					}}
				>
					or
				</span>
			</div>
		</div>
	);
}

// ─── Auth Form Mocks ───────────────────────────────────────────────

function MockSignIn({ b }: { b: BrandingValues }) {
	const logo = b.logoUrl ? (
		<div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
			<img
				src={b.logoUrl}
				alt="Logo"
				style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }}
			/>
		</div>
	) : null;

	return (
		<div style={cardStyle}>
			{logo}
			<div style={{ textAlign: "center", marginBottom: 24 }}>
				<h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "hsl(var(--foreground))" }}>
					Sign in
				</h2>
				<p style={{ margin: "8px 0 0", fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
					Welcome back to your account
				</p>
			</div>
			<div style={{ display: "grid", gap: 16 }}>
				<MockInput label="Email" placeholder="you@example.com" />
				<MockInput label="Password" placeholder="Password" type="password" />
				<MockBtn label="Continue" primary r={b.borderRadius} />
				<OrDivider />
				<MockSocial icon="G" label="Continue with Google" r={b.borderRadius} />
				<MockSocial icon="GH" label="Continue with GitHub" r={b.borderRadius} />
				<div
					style={{
						paddingTop: 8,
						textAlign: "center",
						fontSize: 14,
						color: "hsl(var(--muted-foreground))",
					}}
				>
					Don't have an account?{" "}
					<span style={{ color: "hsl(var(--primary))", cursor: "pointer" }}>Sign up</span>
				</div>
			</div>
		</div>
	);
}

function MockSignUp({ b }: { b: BrandingValues }) {
	const logo = b.logoUrl ? (
		<div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
			<img
				src={b.logoUrl}
				alt="Logo"
				style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }}
			/>
		</div>
	) : null;

	return (
		<div style={cardStyle}>
			{logo}
			<div style={{ textAlign: "center", marginBottom: 24 }}>
				<h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "hsl(var(--foreground))" }}>
					Create account
				</h2>
				<p style={{ margin: "8px 0 0", fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
					Get started with your new account
				</p>
			</div>
			<div style={{ display: "grid", gap: 16 }}>
				<MockInput label="Full name" placeholder="Your name" />
				<MockInput label="Email" placeholder="you@example.com" />
				<MockInput label="Password" placeholder="Create a password" type="password" />
				<MockBtn label="Create account" primary r={b.borderRadius} />
				<div
					style={{
						paddingTop: 8,
						textAlign: "center",
						fontSize: 14,
						color: "hsl(var(--muted-foreground))",
					}}
				>
					Already have an account?{" "}
					<span style={{ color: "hsl(var(--primary))", cursor: "pointer" }}>Sign in</span>
				</div>
			</div>
		</div>
	);
}

const cardStyle: React.CSSProperties = {
	borderRadius: 16,
	border: "1px solid hsl(var(--border))",
	backgroundColor: "hsl(var(--card))",
	padding: 32,
	boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.04)",
};

// ─── Email Template Mock ───────────────────────────────────────────

function EmailBody({ t, b }: { t: EmailTemplateId; b: BrandingValues }) {
	const pc = b.primaryColor;
	const r = b.borderRadius;

	const cta = (label: string) => (
		<div style={{ textAlign: "center", margin: "20px 0" }}>
			<span
				style={{
					display: "inline-block",
					padding: "10px 28px",
					backgroundColor: pc,
					color: "#fff",
					fontSize: 14,
					fontWeight: 600,
					borderRadius: r,
					lineHeight: 1.2,
				}}
			>
				{label}
			</span>
		</div>
	);

	const divider = (
		<hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e2e8f0" }} />
	);
	const subtle = (text: string) => (
		<p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{text}</p>
	);
	const body = (text: string) => (
		<p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "#475569" }}>{text}</p>
	);
	const heading = (text: string) => (
		<h3
			style={{
				margin: "0 0 8px",
				fontSize: 20,
				fontWeight: 700,
				textAlign: "center",
				color: "#0f172a",
				lineHeight: 1.3,
			}}
		>
			{text}
		</h3>
	);

	switch (t) {
		case "verification":
			return (
				<>
					{heading("Verify your email address")}
					{body("Hi Jane,")}
					{body(
						"Thanks for signing up! Please verify your email address by clicking the button below.",
					)}
					{cta("Verify Email")}
					{divider}
					{subtle("If the button doesn't work, copy and paste this URL into your browser:")}
					<p style={{ margin: "4px 0 0", fontSize: 12, color: pc, wordBreak: "break-all" }}>
						https://app.example.com/verify?token=abc123
					</p>
				</>
			);
		case "password-reset":
			return (
				<>
					{heading("Reset your password")}
					{body("Hi Jane,")}
					{body(
						"We received a request to reset your password. Click the button below to choose a new password.",
					)}
					{cta("Reset Password")}
					{divider}
					{subtle(
						"This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.",
					)}
				</>
			);
		case "magic-link":
			return (
				<>
					{heading("Sign in to your account")}
					{body("Hi there,")}
					{body(
						"Click the button below to sign in to your account. This link expires in 10 minutes.",
					)}
					{cta("Sign In")}
					{divider}
					{subtle("If you didn't request this link, you can safely ignore this email.")}
				</>
			);
		case "email-otp":
			return (
				<>
					{heading("Your verification code")}
					{body("Use the code below to verify your identity. It expires in 10 minutes.")}
					<div style={{ textAlign: "center", margin: "24px 0" }}>
						<div
							style={{
								display: "inline-block",
								padding: "16px 32px",
								backgroundColor: "#f1f5f9",
								border: "1px solid #e2e8f0",
								borderRadius: 8,
								fontFamily: "'Courier New', monospace",
								fontSize: 28,
								fontWeight: 700,
								letterSpacing: 6,
								color: "#0f172a",
							}}
						>
							847291
						</div>
					</div>
					{divider}
					{subtle("If you didn't request this code, you can safely ignore this email.")}
				</>
			);
		case "invitation":
			return (
				<>
					{heading("You've been invited")}
					<p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "#475569" }}>
						<strong>John Smith</strong> has invited you to join <strong>Acme Corp</strong>.
					</p>
					{cta("Accept Invitation")}
					{divider}
					<p style={{ margin: 0, fontSize: 12, color: pc, wordBreak: "break-all" }}>
						https://app.example.com/invite/accept?id=inv_abc123
					</p>
				</>
			);
		case "welcome":
			return (
				<>
					{heading("Welcome aboard")}
					{body("Hi Jane,")}
					{body("Your account has been created successfully. You're all set to get started.")}
					{cta("Go to Dashboard")}
					{divider}
					{subtle("If you didn't create this account, please contact support.")}
				</>
			);
	}
}

function MockEmail({ b, templateId }: { b: BrandingValues; templateId: EmailTemplateId }) {
	const meta = EMAIL_TEMPLATES.find((tpl) => tpl.id === templateId) ?? EMAIL_TEMPLATES[0];

	return (
		<div
			style={{
				borderRadius: 16,
				overflow: "hidden",
				backgroundColor: "#ffffff",
				boxShadow:
					"0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08), 0 20px 50px rgba(0,0,0,0.12)",
				maxWidth: 600,
				margin: "0 auto",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			}}
		>
			{/* Window chrome */}
			<div
				style={{
					padding: "12px 16px",
					backgroundColor: "#fafafa",
					borderBottom: "1px solid #f0f0f0",
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				<div style={{ display: "flex", gap: 6 }}>
					<span
						style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ff5f57" }}
					/>
					<span
						style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#febc2e" }}
					/>
					<span
						style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#28c840" }}
					/>
				</div>
			</div>
			{/* From / Subject */}
			<div
				style={{
					padding: "14px 24px",
					borderBottom: "1px solid #f0f0f0",
					fontSize: 13,
					lineHeight: 1.7,
				}}
			>
				<div>
					<span style={{ color: "#9ca3af", fontSize: 12 }}>From</span>{" "}
					<span style={{ color: "#1f2937" }}>noreply@yourapp.com</span>
				</div>
				<div>
					<span style={{ color: "#9ca3af", fontSize: 12 }}>Subject</span>{" "}
					<span style={{ color: "#1f2937", fontWeight: 600 }}>{meta?.subject}</span>
				</div>
			</div>
			{/* Email body area */}
			<div style={{ padding: "32px 32px", backgroundColor: "#f8fafc" }}>
				<div
					style={{
						maxWidth: 480,
						margin: "0 auto",
						padding: 32,
						backgroundColor: "#ffffff",
						border: "1px solid #e2e8f0",
						borderRadius: 12,
					}}
				>
					{b.logoUrl && (
						<div style={{ textAlign: "center", marginBottom: 16 }}>
							<img src={b.logoUrl} alt="Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
						</div>
					)}
					<EmailBody t={templateId} b={b} />
				</div>
				<p
					style={{
						textAlign: "center",
						fontSize: 11,
						color: "#94a3b8",
						marginTop: 20,
						marginBottom: 0,
						lineHeight: 1.5,
					}}
				>
					This email was sent by Your App. If you didn't expect this, you can safely ignore it.
				</p>
			</div>
		</div>
	);
}

// ─── Canvas ────────────────────────────────────────────────────────

export function BrandingCanvas({
	branding,
	view,
	emailTemplate,
}: {
	branding: BrandingValues;
	view: CanvasView;
	emailTemplate: EmailTemplateId;
}) {
	const cssVars = useMemo(() => {
		const derived = deriveCssVariables(branding);
		if (branding.customCss) {
			const overrides = parseCssVariables(branding.customCss);
			return { ...derived, ...overrides };
		}
		return derived;
	}, [branding]);

	const containerStyle = useMemo(() => {
		const style: Record<string, string> = {};
		for (const [key, value] of Object.entries(cssVars)) {
			style[key] = value;
		}
		return style;
	}, [cssVars]);

	if (view === "email") {
		// Email templates render on a neutral light-gray bg (like a real email client)
		return (
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "40px 24px",
				}}
			>
				<div style={{ width: "100%", maxWidth: 600 }}>
					<MockEmail b={branding} templateId={emailTemplate} />
				</div>
			</div>
		);
	}

	// Auth forms render inside CSS variable scope for live theming
	return (
		<div
			style={{
				...containerStyle,
				fontFamily: containerStyle["--font-sans"] ?? "system-ui, sans-serif",
				height: "100%",
				width: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "40px 24px",
			}}
		>
			<div style={{ width: "100%", maxWidth: 420 }}>
				{view === "sign-in" && <MockSignIn b={branding} />}
				{view === "sign-up" && <MockSignUp b={branding} />}
			</div>
		</div>
	);
}
