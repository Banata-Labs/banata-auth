const STORAGE_KEY = "better-auth_cookie";
const AUTH_COOKIE_NAMES = [
	"better-auth.session_token",
	"__Secure-better-auth.session_token",
	"better-auth-session_token",
	"__Secure-better-auth-session_token",
];

interface StoredCookie {
	value: string;
	expires: string | null;
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

		const cookieObject: Record<string, string> = { value: value ?? "" };
		for (const attribute of attributes) {
			const [attributeName, attributeValue] = attribute.split("=");
			if (attributeName) {
				cookieObject[attributeName.toLowerCase()] = attributeValue ?? "";
			}
		}

		cookieMap.set(name, cookieObject);
	}

	return cookieMap;
}

function mergeCookieJar(header: string, previousCookie: string | null) {
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

	if (previousCookie) {
		try {
			nextCookie = {
				...(JSON.parse(previousCookie) as Record<string, StoredCookie>),
				...nextCookie,
			};
		} catch {
			// Ignore malformed cookie jars and overwrite them.
		}
	}

	return JSON.stringify(nextCookie);
}

function syncSessionCookiesToDocument(header: string) {
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

export function persistHostedCookie(response: Response) {
	const setCookie = response.headers.get("set-better-auth-cookie");
	if (!setCookie) {
		return;
	}

	const previousCookie = window.localStorage.getItem(STORAGE_KEY);
	window.localStorage.setItem(STORAGE_KEY, mergeCookieJar(setCookie, previousCookie));
	syncSessionCookiesToDocument(setCookie);
}

export async function completeHostedAuth(apiPath = "/api/auth") {
	const url = new URL(window.location.href);
	const token = url.searchParams.get("ott");
	const next = url.searchParams.get("next") ?? "/app";

	if (!token) {
		return next;
	}

	const response = await fetch(`${apiPath}/cross-domain/one-time-token/verify`, {
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

	persistHostedCookie(response);
	url.searchParams.delete("ott");
	window.history.replaceState({}, "", url.toString());
	return next;
}

export function clearAuthArtifacts() {
	try {
		window.localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Ignore storage failures in private browsing.
	}

	for (const name of AUTH_COOKIE_NAMES) {
		document.cookie = `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
	}
}
