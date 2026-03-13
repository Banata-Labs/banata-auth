"use client";

import type { RuntimeBrandingConfig } from "@banata-auth/shared";

const BRANDING_STYLE_ID = "banata-auth-custom-css";
const BRANDING_FONT_LINK_ID = "banata-auth-font";
const BRANDING_VAR_DATASET_KEY = "banataBrandingVars";
const BRANDING_VAR_NAMES = [
	"--background",
	"--foreground",
	"--card",
	"--card-foreground",
	"--popover",
	"--popover-foreground",
	"--primary",
	"--primary-foreground",
	"--secondary",
	"--secondary-foreground",
	"--muted",
	"--muted-foreground",
	"--accent",
	"--accent-foreground",
	"--destructive",
	"--border",
	"--input",
	"--ring",
	"--radius",
	"--font-app-sans",
] as const;
const FONT_STYLESHEET_URLS: Record<string, string | null> = {
	inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
	system: null,
	roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
	"open-sans":
		"https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
	lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
	poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
};

function normalizeFontChoice(font: string | null | undefined): string {
	const normalized = font?.trim().toLowerCase().replace(/\s+/g, "-");
	if (!normalized || normalized === "general-sans") {
		return "inter";
	}
	return normalized in FONT_STYLESHEET_URLS ? normalized : "system";
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result?.[1] || !result[2] || !result[3]) {
		return null;
	}

	const r = Number.parseInt(result[1], 16) / 255;
	const g = Number.parseInt(result[2], 16) / 255;
	const b = Number.parseInt(result[3], 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) {
		return { h: 0, s: 0, l };
	}

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h = 0;
	if (max === r) {
		h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
	} else if (max === g) {
		h = ((b - r) / d + 2) / 6;
	} else {
		h = ((r - g) / d + 4) / 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

function getFontStack(font: string): string {
	switch (normalizeFontChoice(font)) {
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

export function deriveBrandingCssVariables(
	branding: RuntimeBrandingConfig,
): Record<string, string> {
	const primary = hexToHsl(branding.primaryColor) ?? { h: 238, s: 84, l: 67 };
	const background = hexToHsl(branding.bgColor) ?? { h: 0, s: 0, l: 4 };
	const fontStack = getFontStack(branding.font);

	if (branding.darkMode) {
		return {
			"--background": `${background.h} ${background.s}% ${background.l}%`,
			"--foreground": "0 0% 95%",
			"--card": `${background.h} ${background.s}% ${Math.min(background.l + 4, 100)}%`,
			"--card-foreground": "0 0% 95%",
			"--popover": `${background.h} ${background.s}% ${Math.min(background.l + 4, 100)}%`,
			"--popover-foreground": "0 0% 95%",
			"--primary": `${primary.h} ${primary.s}% ${primary.l}%`,
			"--primary-foreground": "0 0% 100%",
			"--secondary": `${background.h} ${background.s}% ${Math.min(background.l + 10, 100)}%`,
			"--secondary-foreground": "0 0% 95%",
			"--muted": `${background.h} ${background.s}% ${Math.min(background.l + 8, 100)}%`,
			"--muted-foreground": "0 0% 64%",
			"--accent": `${background.h} ${background.s}% ${Math.min(background.l + 10, 100)}%`,
			"--accent-foreground": "0 0% 95%",
			"--destructive": "0 72% 51%",
			"--border": `${background.h} ${background.s}% ${Math.min(background.l + 15, 100)}%`,
			"--input": `${background.h} ${background.s}% ${Math.min(background.l + 15, 100)}%`,
			"--ring": `${primary.h} ${primary.s}% ${primary.l}%`,
			"--radius": `${branding.borderRadius}px`,
			"--font-app-sans": fontStack,
		};
	}

	return {
		"--background": `${background.h} ${background.s}% ${Math.max(background.l, 96)}%`,
		"--foreground": "0 0% 4%",
		"--card": "0 0% 100%",
		"--card-foreground": "0 0% 4%",
		"--popover": "0 0% 100%",
		"--popover-foreground": "0 0% 4%",
		"--primary": `${primary.h} ${primary.s}% ${primary.l}%`,
		"--primary-foreground": "0 0% 100%",
		"--secondary": "0 0% 96%",
		"--secondary-foreground": "0 0% 9%",
		"--muted": "0 0% 96%",
		"--muted-foreground": "0 0% 45%",
		"--accent": "0 0% 96%",
		"--accent-foreground": "0 0% 9%",
		"--destructive": "0 84% 60%",
		"--border": "0 0% 90%",
		"--input": "0 0% 90%",
		"--ring": `${primary.h} ${primary.s}% ${primary.l}%`,
		"--radius": `${branding.borderRadius}px`,
		"--font-app-sans": fontStack,
	};
}

function updateBrandingFont(font: string | null | undefined) {
	if (typeof document === "undefined") {
		return;
	}

	const normalizedFont = normalizeFontChoice(font);
	const href = FONT_STYLESHEET_URLS[normalizedFont] ?? null;
	const existing = document.getElementById(BRANDING_FONT_LINK_ID) as HTMLLinkElement | null;
	if (!href) {
		existing?.remove();
		return;
	}

	if (existing) {
		existing.href = href;
		return;
	}

	const link = document.createElement("link");
	link.id = BRANDING_FONT_LINK_ID;
	link.rel = "stylesheet";
	link.href = href;
	document.head.appendChild(link);
}

export function parseBrandingCssVariables(css: string): Record<string, string> {
	const vars: Record<string, string> = {};
	const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
	for (let match = regex.exec(css); match !== null; match = regex.exec(css)) {
		if (match[1] && match[2]) {
			vars[`--${match[1]}`] = match[2].trim();
		}
	}
	return vars;
}

export function applyBrandingToDocument(branding: RuntimeBrandingConfig | null | undefined) {
	if (typeof document === "undefined") {
		return;
	}

	const root = document.documentElement;
	let styleEl = document.getElementById(BRANDING_STYLE_ID) as HTMLStyleElement | null;
	if (!styleEl) {
		styleEl = document.createElement("style");
		styleEl.id = BRANDING_STYLE_ID;
		document.head.appendChild(styleEl);
	}
	const previousNames = root.dataset[BRANDING_VAR_DATASET_KEY]
		?.split(",")
		.map((name) => name.trim())
		.filter(Boolean) ?? [...BRANDING_VAR_NAMES];
	for (const name of previousNames) {
		root.style.removeProperty(name);
	}

	if (!branding) {
		root.classList.remove("dark");
		root.classList.add("light");
		delete root.dataset[BRANDING_VAR_DATASET_KEY];
		updateBrandingFont("system");
		styleEl.textContent = "";
		return;
	}

	root.classList.toggle("dark", branding.darkMode);
	root.classList.toggle("light", !branding.darkMode);

	const derivedVars = deriveBrandingCssVariables(branding);
	const overrides = branding.customCss ? parseBrandingCssVariables(branding.customCss) : {};
	const appliedVariables = { ...derivedVars, ...overrides };
	for (const [name, value] of Object.entries(appliedVariables)) {
		root.style.setProperty(name, value);
	}
	root.dataset[BRANDING_VAR_DATASET_KEY] = Object.keys(appliedVariables).join(",");

	updateBrandingFont(branding.font);
	styleEl.textContent = branding.customCss || "";
}
