"use client";

import { useSearchParams } from "next/navigation";
import React, { createElement } from "react";
import { useEffect, useState } from "react";

/**
 * Client-side utilities for Banata Auth + Next.js.
 *
 * Re-exports `usePreloadedAuthQuery` from `@convex-dev/better-auth/nextjs/client`
 * so consumers don't need that package as a direct dependency.
 */
export { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";

export interface CompleteHostedAuthOptions {
	apiPath?: string;
	next?: string | null;
}

function normalizeApiPath(path: string): string {
	return path.endsWith("/") ? path.slice(0, -1) : path;
}

export async function completeHostedAuth({
	apiPath = "/api/auth",
	next,
}: CompleteHostedAuthOptions = {}): Promise<{
	next: string;
}> {
	if (typeof window === "undefined") {
		throw new Error("completeHostedAuth() can only run in the browser.");
	}

	const url = new URL(window.location.href);
	const token = url.searchParams.get("ott");
	if (!token) {
		throw new Error("Missing hosted auth handoff token.");
	}

	const nextTarget =
		next ??
		url.searchParams.get("next") ??
		url.searchParams.get("redirect_url") ??
		"/";

	const response = await fetch(`${normalizeApiPath(apiPath)}/cross-domain/one-time-token/verify`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ token }),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(
			`Unable to complete hosted auth handoff: ${response.status} ${response.statusText}${text ? ` - ${text.slice(0, 200)}` : ""}`,
		);
	}

	url.searchParams.delete("ott");
	window.history.replaceState({}, "", url.toString());

	return { next: nextTarget };
}

export function HostedAuthCallback({
	apiPath = "/api/auth",
	fallbackTo = "/sign-in",
	loadingMessage = "Finishing sign-in…",
}: {
	apiPath?: string;
	fallbackTo?: string;
	loadingMessage?: string;
}) {
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			try {
				const result = await completeHostedAuth({
					apiPath,
					next: searchParams.get("next"),
				});
				if (!cancelled) {
					window.location.replace(result.next);
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError instanceof Error ? loadError.message : "Unable to complete sign-in.");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [apiPath, searchParams]);

	if (error) {
		return createElement(
			"div",
			{ style: { margin: "4rem auto", maxWidth: 480, padding: 24 } },
			createElement("p", { style: { color: "#b91c1c", marginBottom: 16 } }, error),
			createElement("a", { href: fallbackTo }, "Back to sign in"),
		);
	}

	return createElement(
		"div",
		{ style: { margin: "4rem auto", maxWidth: 480, padding: 24 } },
		createElement("p", null, loadingMessage),
	);
}
