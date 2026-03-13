import { banataAuthProxy } from "@banata-auth/nextjs";

export const proxy = banataAuthProxy({
	publicRoutes: ["/sign-in", "/sign-up", "/api/auth(.*)"],
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};
