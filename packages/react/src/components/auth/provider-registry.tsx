"use client";

import type { ReactNode, SVGProps } from "react";
import type { SocialProvider } from "./types";

interface ProviderDescriptor {
	label: string;
	icon: (props: IconProps) => ReactNode;
}

interface IconProps extends SVGProps<SVGSVGElement> {
	size?: number;
}

export interface ResolvedSocialProvider {
	id: string;
	label: string;
	icon?: ReactNode;
}

function Svg({
	size = 18,
	viewBox = "0 0 24 24",
	children,
	...props
}: IconProps & { children: ReactNode }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox={viewBox}
			fill="none"
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	);
}

function GoogleIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.13-1.43.36-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</Svg>
	);
}

function GitHubIcon(props: IconProps) {
	return (
		<Svg {...props} viewBox="0 0 24 24">
			<path
				d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
				fill="currentColor"
			/>
		</Svg>
	);
}

function MicrosoftIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M3 3h8.5v8.5H3z" fill="#F25022" />
			<path d="M12.5 3H21v8.5h-8.5z" fill="#7FBA00" />
			<path d="M3 12.5h8.5V21H3z" fill="#00A4EF" />
			<path d="M12.5 12.5H21V21h-8.5z" fill="#FFB900" />
		</Svg>
	);
}

function AppleIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path
				d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.64-2.2.46-3.06-.4C3.79 16.17 4.36 9.43 8.7 9.21c1.26.06 2.14.7 2.88.75.9-.18 1.77-.86 2.75-.78 1.17.1 2.05.56 2.64 1.43-2.42 1.45-1.85 4.62.38 5.5-.46 1.2-.98 2.38-2.1 3.45l-.2-.28zM12.03 9.15c-.13-2.27 1.67-4.2 3.82-4.38.28 2.5-2.27 4.57-3.82 4.38z"
				fill="currentColor"
			/>
		</Svg>
	);
}

function FacebookIcon(props: IconProps) {
	return (
		<Svg {...props} viewBox="0 0 24 24">
			<path
				d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.438H7.078v-3.49h3.047V9.412c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.236 2.686.236v2.953h-1.514c-1.491 0-1.956.927-1.956 1.878v2.257h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z"
				fill="#1877F2"
			/>
			<path
				d="M16.671 15.562l.532-3.49h-3.328V9.815c0-.952.465-1.879 1.956-1.879h1.514V4.983s-1.373-.236-2.686-.236c-2.741 0-4.533 1.662-4.533 4.669v2.656H7.078v3.49h3.047V24a12.1 12.1 0 0 0 3.75 0v-8.438h2.796z"
				fill="#fff"
			/>
		</Svg>
	);
}

function DiscordIcon(props: IconProps) {
	return (
		<Svg {...props} viewBox="0 0 24 24">
			<path
				d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
				fill="#5865F2"
			/>
		</Svg>
	);
}

function LinkedInIcon(props: IconProps) {
	return (
		<Svg {...props} viewBox="0 0 24 24">
			<path
				d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.914 20.452H3.727V9h3.187v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
				fill="#0A66C2"
			/>
		</Svg>
	);
}

function SlackIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path
				d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
				fill="#E01E5A"
			/>
			<path
				d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
				fill="#36C5F0"
			/>
			<path
				d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312z"
				fill="#2EB67D"
			/>
			<path
				d="M15.165 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.527 2.527 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.522h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z"
				fill="#ECB22E"
			/>
		</Svg>
	);
}

function TwitterIcon(props: IconProps) {
	return (
		<Svg {...props} viewBox="0 0 24 24">
			<path
				d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
				fill="currentColor"
			/>
		</Svg>
	);
}

function GitLabIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="m12 21.42-3.27-10.06h6.54L12 21.42z" fill="#E24329" />
			<path d="m12 21.42-3.27-10.06H2.68L12 21.42z" fill="#FC6D26" />
			<path
				d="M2.68 11.36 1.29 15.63a.94.94 0 0 0 .34 1.05L12 21.42 2.68 11.36z"
				fill="#FCA326"
			/>
			<path
				d="M2.68 11.36h6.05L6.2 3.54a.47.47 0 0 0-.9 0L2.68 11.36z"
				fill="#E24329"
			/>
			<path d="m12 21.42 3.27-10.06h6.05L12 21.42z" fill="#FC6D26" />
			<path
				d="m21.32 11.36 1.39 4.27a.94.94 0 0 1-.34 1.05L12 21.42l9.32-10.06z"
				fill="#FCA326"
			/>
			<path
				d="M21.32 11.36h-6.05l2.53-7.82a.47.47 0 0 1 .9 0l2.62 7.82z"
				fill="#E24329"
			/>
		</Svg>
	);
}

function GenericProviderIcon({
	size = 18,
	label,
}: {
	size?: number;
	label: string;
}) {
	const initial = label.trim().charAt(0).toUpperCase() || "?";
	return (
		<span
			aria-hidden="true"
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: size,
				height: size,
				borderRadius: 999,
				backgroundColor: "var(--muted, #e5e7eb)",
				color: "var(--foreground, #111827)",
				fontSize: Math.max(10, Math.floor(size * 0.55)),
				fontWeight: 700,
				lineHeight: 1,
			}}
		>
			{initial}
		</span>
	);
}

const SOCIAL_PROVIDER_REGISTRY: Record<string, ProviderDescriptor> = {
	google: { label: "Google", icon: GoogleIcon },
	github: { label: "GitHub", icon: GitHubIcon },
	microsoft: { label: "Microsoft", icon: MicrosoftIcon },
	apple: { label: "Apple", icon: AppleIcon },
	facebook: { label: "Facebook", icon: FacebookIcon },
	discord: { label: "Discord", icon: DiscordIcon },
	linkedin: { label: "LinkedIn", icon: LinkedInIcon },
	slack: { label: "Slack", icon: SlackIcon },
	twitter: { label: "X", icon: TwitterIcon },
	gitlab: { label: "GitLab", icon: GitLabIcon },
};

function humanizeProviderId(id: string): string {
	return id
		.split(/[_-]+/g)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

export function resolveSocialProvider(provider: SocialProvider): ResolvedSocialProvider {
	const descriptor = SOCIAL_PROVIDER_REGISTRY[provider.id];
	const label = provider.label ?? descriptor?.label ?? humanizeProviderId(provider.id);
	return {
		id: provider.id,
		label,
		icon: provider.icon ?? (descriptor ? descriptor.icon({ size: 18 }) : <GenericProviderIcon label={label} />),
	};
}

export function resolveSocialProviders(providers: SocialProvider[]): ResolvedSocialProvider[] {
	return providers.map(resolveSocialProvider);
}
