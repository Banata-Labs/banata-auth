import { handler } from "@/lib/auth-server";

function summarizeHeaders(headers: Headers) {
	return {
		host: headers.get("host"),
		origin: headers.get("origin"),
		referer: headers.get("referer"),
		userAgent: headers.get("user-agent"),
		xForwardedFor: headers.get("x-forwarded-for"),
		xForwardedHost: headers.get("x-forwarded-host"),
		xForwardedProto: headers.get("x-forwarded-proto"),
		xBanataProjectId: headers.get("x-banata-project-id"),
		xBanataClientId: headers.get("x-banata-client-id"),
		hasApiKey: Boolean(headers.get("x-api-key")),
		hasAuthorization: Boolean(headers.get("authorization")),
	};
}

async function logAndHandle(method: "GET" | "POST", request: Request) {
	const url = new URL(request.url);
	console.info("[dashboard-auth-route] request", {
		method,
		pathname: url.pathname,
		search: url.search,
		headers: summarizeHeaders(request.headers),
	});

	try {
		const response = await handler[method](request);
		console.info("[dashboard-auth-route] response", {
			method,
			pathname: url.pathname,
			status: response.status,
			location: response.headers.get("location"),
			setCookieCount: response.headers.getSetCookie().length,
		});
		return response;
	} catch (error) {
		console.error("[dashboard-auth-route] failure", {
			method,
			pathname: url.pathname,
			error,
		});
		throw error;
	}
}

export async function GET(request: Request) {
	return logAndHandle("GET", request);
}

export async function POST(request: Request) {
	return logAndHandle("POST", request);
}
