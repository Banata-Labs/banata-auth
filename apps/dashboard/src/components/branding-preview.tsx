"use client";

import { ProviderIcon } from "@/components/provider-icons";
import { useEffect, useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────

export interface BrandingValues {
	primaryColor: string;
	bgColor: string;
	borderRadius: number;
	darkMode: boolean;
	font: string;
	logoUrl: string;
	customCss: string;
	cardWidth?: number;
}

export type CanvasView = "sign-in" | "sign-up" | "email";

export interface AuthPreviewConfig {
	emailPasswordEnabled: boolean;
	magicLinkEnabled: boolean;
	emailOtpEnabled: boolean;
	passkeyEnabled: boolean;
	enabledSocialProviders: { id: string; label?: string }[];
}

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

/** Compute a contrasting foreground color for a given background hex. */
function contrastForeground(hex: string): string {
	const hsl = hexToHsl(hex);
	if (!hsl) return "#ffffff";
	// Use WCAG relative luminance heuristic: light bg → dark text, dark bg → light text
	return hsl.l > 55 ? "#000000" : "#ffffff";
}

export function deriveCssVariables(branding: BrandingValues): Record<string, string> {
	const primary = hexToHsl(branding.primaryColor) ?? { h: 238, s: 84, l: 67 };
	const bg = hexToHsl(branding.bgColor) ?? { h: 0, s: 0, l: 4 };
	const fontStack = getFontStack(branding.font);
	// Compute primary foreground based on primary lightness
	const primaryFg = primary.l > 55 ? "0 0% 0%" : "0 0% 100%";

	if (branding.darkMode) {
		return {
			"--background": `${bg.h} ${bg.s}% ${bg.l}%`,
			"--foreground": "0 0% 95%",
			"--card": `${bg.h} ${bg.s}% ${Math.min(bg.l + 4, 100)}%`,
			"--card-foreground": "0 0% 95%",
			"--primary": `${primary.h} ${primary.s}% ${primary.l}%`,
			"--primary-foreground": primaryFg,
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
		"--primary-foreground": primaryFg,
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

// ─── Inline SVG Icons ──────────────────────────────────────────────

function FingerprintIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
			<path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
			<path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
			<path d="M2 12a10 10 0 0 1 18-6" />
			<path d="M2 16h.01" />
			<path d="M21.8 16c.2-2 .131-5.354 0-6" />
			<path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
			<path d="M8.65 22c.21-.66.45-1.32.57-2" />
			<path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
		</svg>
	);
}

function MailIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="20" height="16" x="2" y="4" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</svg>
	);
}

function KeyIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
			<path d="m21 2-9.6 9.6" />
			<circle cx="7.5" cy="15.5" r="5.5" />
		</svg>
	);
}

// ─── Shared Mock Primitives ────────────────────────────────────────

function MockInput({
	label,
	placeholder,
	type = "text",
	icon,
}: { label: string; placeholder: string; type?: string; icon?: React.ReactNode }) {
	return (
		<div style={{ display: "grid", gap: 6 }}>
			<span
				style={{
					fontSize: 13,
					fontWeight: 500,
					color: "hsl(var(--foreground))",
					letterSpacing: "-0.01em",
				}}
			>
				{label}
			</span>
			<div style={{ position: "relative" }}>
				{icon && (
					<span
						style={{
							position: "absolute",
							left: 12,
							top: "50%",
							transform: "translateY(-50%)",
							color: "hsl(var(--muted-foreground))",
							display: "inline-flex",
							opacity: 0.5,
						}}
					>
						{icon}
					</span>
				)}
				<input
					type={type}
					placeholder={placeholder}
					readOnly
					tabIndex={-1}
					style={{
						height: 42,
						width: "100%",
						borderRadius: "var(--radius)",
						padding: icon ? "0 12px 0 36px" : "0 12px",
						fontSize: 14,
						outline: "none",
						backgroundColor: "hsl(var(--background))",
						border: "1px solid hsl(var(--input))",
						color: "hsl(var(--foreground))",
						boxSizing: "border-box",
						transition: "border-color 0.15s",
					}}
				/>
			</div>
		</div>
	);
}

function MockBtn({
	label,
	primary,
	r,
	icon,
	outline,
}: { label: string; primary?: boolean; r: number; icon?: React.ReactNode; outline?: boolean }) {
	const isPrimary = primary && !outline;
	return (
		<button
			type="button"
			tabIndex={-1}
			style={{
				marginTop: 2,
				display: "inline-flex",
				height: 42,
				width: "100%",
				cursor: "default",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
				borderRadius: `${r}px`,
				fontSize: 14,
				fontWeight: 600,
				letterSpacing: "-0.01em",
				border: isPrimary ? "none" : "1px solid hsl(var(--border))",
				backgroundColor: isPrimary ? "hsl(var(--primary))" : "transparent",
				color: isPrimary ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
				transition: "all 0.15s",
			}}
		>
			{icon}
			{label}
		</button>
	);
}

function MockSocial({ providerId, label, r }: { providerId: string; label: string; r: number }) {
	return (
		<button
			type="button"
			tabIndex={-1}
			style={{
				display: "inline-flex",
				height: 42,
				width: "100%",
				cursor: "default",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
				borderRadius: `${r}px`,
				fontSize: 14,
				fontWeight: 500,
				border: "1px solid hsl(var(--border))",
				backgroundColor: "transparent",
				color: "hsl(var(--foreground))",
				transition: "all 0.15s",
			}}
		>
			<ProviderIcon provider={providerId} size={18} />
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

// ─── Loading Skeleton ──────────────────────────────────────────────

function MockCardSkeleton({ b }: { b: BrandingValues }) {
	const bar = (w: string, h = 10) => (
		<div
			style={{
				width: w,
				height: h,
				borderRadius: 4,
				backgroundColor: "hsl(var(--muted))",
				opacity: 0.5,
			}}
		/>
	);
	const field = () => (
		<div style={{ display: "grid", gap: 6 }}>
			{bar("60px", 8)}
			<div
				style={{
					height: 42,
					width: "100%",
					borderRadius: `${b.borderRadius}px`,
					backgroundColor: "hsl(var(--muted))",
					opacity: 0.3,
				}}
			/>
		</div>
	);

	return (
		<div style={getCardStyle(b)}>
			<div style={{ textAlign: "center", marginBottom: 24 }}>
				<div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
					{bar("100px", 14)}
				</div>
				<div style={{ display: "flex", justifyContent: "center" }}>{bar("180px", 10)}</div>
			</div>
			<div style={{ display: "grid", gap: 16 }}>
				{field()}
				{field()}
				<div
					style={{
						height: 42,
						width: "100%",
						borderRadius: `${b.borderRadius}px`,
						backgroundColor: "hsl(var(--primary))",
						opacity: 0.3,
					}}
				/>
				<OrDivider />
				<div
					style={{
						height: 42,
						width: "100%",
						borderRadius: `${b.borderRadius}px`,
						backgroundColor: "hsl(var(--muted))",
						opacity: 0.2,
					}}
				/>
			</div>
		</div>
	);
}

// ─── Auth Form Mocks ───────────────────────────────────────────────

function MockSignIn({ b, authConfig }: { b: BrandingValues; authConfig?: AuthPreviewConfig }) {
	// While loading (authConfig not yet set), show skeleton
	if (!authConfig) {
		return <MockCardSkeleton b={b} />;
	}

	const logo = b.logoUrl ? (
		<div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
			<img
				src={b.logoUrl}
				alt="Logo"
				style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }}
			/>
		</div>
	) : null;

	const socialProviders = authConfig.enabledSocialProviders;
	const showEmail = authConfig.emailPasswordEnabled;
	const showMagicLink = authConfig.magicLinkEnabled;
	const showOtp = authConfig.emailOtpEnabled;
	const showPasskey = authConfig.passkeyEnabled;
	const showEmailField = showEmail || showMagicLink || showOtp;
	const showPasswordField = showEmail;
	const hasTopSection = showEmailField || showPasskey;
	const hasAnySections = hasTopSection || socialProviders.length > 0;

	return (
		<div style={getCardStyle(b)}>
			{logo}
			<div style={{ textAlign: "center", marginBottom: 24 }}>
				<h2
					style={{
						margin: 0,
						fontSize: 22,
						fontWeight: 700,
						color: "hsl(var(--foreground))",
						letterSpacing: "-0.02em",
					}}
				>
					Sign in
				</h2>
				<p style={{ margin: "8px 0 0", fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
					Welcome back to your account
				</p>
			</div>
			<div style={{ display: "grid", gap: 14 }}>
				{showEmailField && (
					<MockInput label="Email" placeholder="you@example.com" icon={<MailIcon />} />
				)}
				{showPasswordField && (
					<>
						<MockInput label="Password" placeholder="Password" type="password" icon={<KeyIcon />} />
						<div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
							<span style={{ fontSize: 13, color: "hsl(var(--primary))", cursor: "pointer" }}>
								Forgot password?
							</span>
						</div>
					</>
				)}
				{showEmailField && (
					<MockBtn
						label={
							showEmail ? "Continue" : showMagicLink ? "Send magic link" : "Send verification code"
						}
						primary
						r={b.borderRadius}
					/>
				)}
				{showPasskey && (
					<MockBtn
						label="Sign in with passkey"
						primary={!showEmailField}
						outline={showEmailField}
						r={b.borderRadius}
						icon={<FingerprintIcon />}
					/>
				)}
				{hasTopSection && socialProviders.length > 0 && <OrDivider />}
				{socialProviders.map((p) => (
					<MockSocial
						key={p.id}
						providerId={p.id}
						label={`Continue with ${p.label ?? p.id.charAt(0).toUpperCase() + p.id.slice(1)}`}
						r={b.borderRadius}
					/>
				))}
				{!hasAnySections && (
					<div
						style={{
							textAlign: "center",
							padding: "24px 16px",
							fontSize: 13,
							color: "hsl(var(--muted-foreground))",
							backgroundColor: "hsl(var(--muted))",
							borderRadius: `${b.borderRadius}px`,
							lineHeight: 1.5,
						}}
					>
						No auth methods enabled.
						<br />
						<span style={{ fontSize: 12, opacity: 0.7 }}>
							Enable methods in Authentication to preview them here.
						</span>
					</div>
				)}
				<div
					style={{
						paddingTop: 4,
						textAlign: "center",
						fontSize: 14,
						color: "hsl(var(--muted-foreground))",
					}}
				>
					Don't have an account?{" "}
					<span style={{ color: "hsl(var(--primary))", cursor: "pointer", fontWeight: 500 }}>
						Sign up
					</span>
				</div>
			</div>
		</div>
	);
}

function MockSignUp({ b, authConfig }: { b: BrandingValues; authConfig?: AuthPreviewConfig }) {
	if (!authConfig) {
		return <MockCardSkeleton b={b} />;
	}

	const logo = b.logoUrl ? (
		<div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
			<img
				src={b.logoUrl}
				alt="Logo"
				style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }}
			/>
		</div>
	) : null;

	const socialProviders = authConfig.enabledSocialProviders;
	const showEmail = authConfig.emailPasswordEnabled;
	const showMagicLink = authConfig.magicLinkEnabled;
	const showOtp = authConfig.emailOtpEnabled;
	const showPasskey = authConfig.passkeyEnabled;
	const showEmailField = showEmail || showMagicLink || showOtp;
	const showPasswordField = showEmail;
	const hasTopSection = showEmailField || showPasskey;
	const hasAnySections = hasTopSection || socialProviders.length > 0;

	return (
		<div style={getCardStyle(b)}>
			{logo}
			<div style={{ textAlign: "center", marginBottom: 24 }}>
				<h2
					style={{
						margin: 0,
						fontSize: 22,
						fontWeight: 700,
						color: "hsl(var(--foreground))",
						letterSpacing: "-0.02em",
					}}
				>
					Create account
				</h2>
				<p style={{ margin: "8px 0 0", fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
					Get started with your new account
				</p>
			</div>
			<div style={{ display: "grid", gap: 14 }}>
				{showEmailField && (
					<>
						{showEmail && <MockInput label="Full name" placeholder="Your name" />}
						<MockInput label="Email" placeholder="you@example.com" icon={<MailIcon />} />
					</>
				)}
				{showPasswordField && (
					<MockInput
						label="Password"
						placeholder="Create a password"
						type="password"
						icon={<KeyIcon />}
					/>
				)}
				{showEmailField && (
					<MockBtn
						label={
							showEmail
								? "Create account"
								: showMagicLink
									? "Send magic link"
									: "Send verification code"
						}
						primary
						r={b.borderRadius}
					/>
				)}
				{showPasskey && (
					<MockBtn
						label="Sign up with passkey"
						primary={!showEmailField}
						outline={showEmailField}
						r={b.borderRadius}
						icon={<FingerprintIcon />}
					/>
				)}
				{hasTopSection && socialProviders.length > 0 && <OrDivider />}
				{socialProviders.map((p) => (
					<MockSocial
						key={p.id}
						providerId={p.id}
						label={`Continue with ${p.label ?? p.id.charAt(0).toUpperCase() + p.id.slice(1)}`}
						r={b.borderRadius}
					/>
				))}
				{!hasAnySections && (
					<div
						style={{
							textAlign: "center",
							padding: "24px 16px",
							fontSize: 13,
							color: "hsl(var(--muted-foreground))",
							backgroundColor: "hsl(var(--muted))",
							borderRadius: `${b.borderRadius}px`,
							lineHeight: 1.5,
						}}
					>
						No auth methods enabled.
						<br />
						<span style={{ fontSize: 12, opacity: 0.7 }}>
							Enable methods in Authentication to preview them here.
						</span>
					</div>
				)}
				<div
					style={{
						paddingTop: 4,
						textAlign: "center",
						fontSize: 14,
						color: "hsl(var(--muted-foreground))",
					}}
				>
					Already have an account?{" "}
					<span style={{ color: "hsl(var(--primary))", cursor: "pointer", fontWeight: 500 }}>
						Sign in
					</span>
				</div>
			</div>
		</div>
	);
}

const staticCardStyle: React.CSSProperties = {
	border: "1px solid hsl(var(--border))",
	backgroundColor: "hsl(var(--card))",
	padding: "36px 32px 28px",
	boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.04)",
};

function getCardStyle(b: BrandingValues): React.CSSProperties {
	return { ...staticCardStyle, borderRadius: Math.max(b.borderRadius, 8) };
}

// ─── Email Template Mock ───────────────────────────────────────────

function EmailBody({ t, b }: { t: EmailTemplateId; b: BrandingValues }) {
	const pc = b.primaryColor;
	const pcFg = contrastForeground(pc);
	const r = b.borderRadius;

	const cta = (label: string) => (
		<div style={{ textAlign: "center", margin: "20px 0" }}>
			<span
				style={{
					display: "inline-block",
					padding: "12px 32px",
					backgroundColor: pc,
					color: pcFg,
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
	authConfig,
}: {
	branding: BrandingValues;
	view: CanvasView;
	emailTemplate: EmailTemplateId;
	authConfig?: AuthPreviewConfig;
}) {
	const cssVars = useMemo(() => {
		const derived = deriveCssVariables(branding);
		if (branding.customCss) {
			const overrides = parseCssVariables(branding.customCss);
			return { ...derived, ...overrides };
		}
		return derived;
	}, [branding]);

	// Dynamically load Google Fonts for the preview
	useEffect(() => {
		const fontMap: Record<string, string> = {
			inter: "Inter:wght@400;500;600;700",
			roboto: "Roboto:wght@400;500;700",
			"open-sans": "Open+Sans:wght@400;600;700",
			lato: "Lato:wght@400;700",
			poppins: "Poppins:wght@400;500;600;700",
		};
		const fontParam = fontMap[branding.font];
		if (!fontParam) return; // "system" or unknown — no loading needed

		const linkId = "branding-preview-font";
		let link = document.getElementById(linkId) as HTMLLinkElement | null;
		const href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;

		if (link) {
			if (link.href === href) return; // already loaded
			link.href = href;
		} else {
			link = document.createElement("link");
			link.id = linkId;
			link.rel = "stylesheet";
			link.href = href;
			document.head.appendChild(link);
		}

		return () => {
			// Cleanup on unmount
			const el = document.getElementById(linkId);
			if (el) el.remove();
		};
	}, [branding.font]);

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
			<div style={{ width: "100%", maxWidth: branding.cardWidth ?? 420 }}>
				{view === "sign-in" && <MockSignIn b={branding} authConfig={authConfig} />}
				{view === "sign-up" && <MockSignUp b={branding} authConfig={authConfig} />}
			</div>
		</div>
	);
}
