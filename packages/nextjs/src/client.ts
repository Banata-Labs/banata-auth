"use client";

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
	storagePrefix?: string;
}

interface StoredCookie {
	value: string;
	expires: string | null;
}

const hostedAuthInflight = new Map<string, Promise<{ next: string }>>();

function normalizeApiPath(path: string): string {
	return path.endsWith("/") ? path.slice(0, -1) : path;
}

function parseSetCookieHeader(header: string): Map<string, Record<string, string>> {
	const cookieMap = new Map<string, Record<string, string>>();
	for (const cookie of header.split(", ")) {
		const [nameValue, ...attributes] = cookie.split("; ");
		if (!nameValue) {
			continue;
		}
		const [name, value] = nameValue.split("=");
		if (!name) {
			continue;
		}

		const cookieObj: Record<string, string> = { value: value ?? "" };
		for (const attr of attributes) {
			const [attrName, attrValue] = attr.split("=");
			if (attrName) {
				cookieObj[attrName.toLowerCase()] = attrValue ?? "";
			}
		}

		cookieMap.set(name, cookieObj);
	}
	return cookieMap;
}

function mergeCrossDomainCookieJar(header: string, prevCookie: string | null): string {
	const parsed = parseSetCookieHeader(header);
	let nextCookie: Record<string, StoredCookie> = {};

	for (const [key, cookie] of parsed.entries()) {
		const expiresAt = cookie.expires;
		const maxAge = cookie["max-age"];
		const expires = expiresAt
			? new Date(String(expiresAt))
			: maxAge
				? new Date(Date.now() + Number(maxAge) * 1000)
				: null;
		nextCookie[key] = {
			value: cookie.value ?? "",
			expires: expires ? expires.toISOString() : null,
		};
	}

	if (prevCookie) {
		try {
			nextCookie = {
				...(JSON.parse(prevCookie) as Record<string, StoredCookie>),
				...nextCookie,
			};
		} catch {
			// Ignore malformed local storage values and overwrite them.
		}
	}

	return JSON.stringify(nextCookie);
}

function syncSessionCookiesToDocument(header: string): void {
	if (typeof window === "undefined") {
		return;
	}

	const parsed = parseSetCookieHeader(header);
	for (const [rawName, cookie] of parsed.entries()) {
		if (!rawName.includes("session_token")) {
			continue;
		}

		const isLocalhost = window.location.hostname === "localhost";
		const cookieName =
			isLocalhost && rawName.startsWith("__Secure-") ? rawName.replace("__Secure-", "") : rawName;
		const parts = [`${cookieName}=${cookie.value ?? ""}`, "Path=/", "SameSite=Lax"];
		if (cookie.expires) {
			parts.push(`Expires=${cookie.expires}`);
		}
		if (cookie["max-age"]) {
			parts.push(`Max-Age=${cookie["max-age"]}`);
		}
		if (!isLocalhost && window.location.protocol === "https:") {
			parts.push("Secure");
		}
		document.cookie = parts.join("; ");
	}
}

function persistHostedAuthCookie(response: Response, storagePrefix: string): void {
	if (typeof window === "undefined") {
		return;
	}

	const setCookie = response.headers.get("set-better-auth-cookie");
	if (!setCookie) {
		return;
	}

	const storageKey = `${storagePrefix}_cookie`;
	const previousCookie = window.localStorage.getItem(storageKey);
	window.localStorage.setItem(storageKey, mergeCrossDomainCookieJar(setCookie, previousCookie));
	syncSessionCookiesToDocument(setCookie);
}

export async function completeHostedAuth({
	apiPath = "/api/auth",
	next,
	storagePrefix = "better-auth",
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

	const existing = hostedAuthInflight.get(token);
	if (existing) {
		return existing;
	}

	const completion = (async () => {
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

		persistHostedAuthCookie(response, storagePrefix);

		url.searchParams.delete("ott");
		window.history.replaceState({}, "", url.toString());

		return { next: nextTarget };
	})()
		.catch((error) => {
			hostedAuthInflight.delete(token);
			throw error;
		});

	hostedAuthInflight.set(token, completion);
	return completion;
}

export function HostedAuthCallback({
	apiPath = "/api/auth",
	fallbackTo = "/sign-in",
	loadingMessage = "Finishing sign-in...",
	storagePrefix = "better-auth",
}: {
	apiPath?: string;
	fallbackTo?: string;
	loadingMessage?: string;
	storagePrefix?: string;
}) {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			try {
				const result = await completeHostedAuth({
					apiPath,
					storagePrefix,
					next:
						typeof window === "undefined"
							? null
							: new URL(window.location.href).searchParams.get("next"),
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
	}, [apiPath, storagePrefix]);

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
