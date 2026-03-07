import { createAuthClient } from "better-auth/react";

const baseURL =
	typeof window !== "undefined"
		? "/api/auth"
		: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth`;

export const authClient = createAuthClient({
	baseURL,
});
