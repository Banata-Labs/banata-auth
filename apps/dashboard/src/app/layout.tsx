import { BackendStatusProvider } from "@/components/backend-status";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getToken } from "@/lib/auth-server";
import { resolveDashboardConvexSiteUrl } from "@/lib/convex-urls";
import { BotIdClient } from "botid/client";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/**
 * Routes protected by Vercel BotID — invisible CAPTCHA that blocks
 * sophisticated bots on authentication endpoints.
 * @see https://vercel.com/docs/botid
 */
const botIdProtectedRoutes = [
	{ path: "/api/auth/sign-in/*", method: "POST" as const },
	{ path: "/api/auth/sign-up/*", method: "POST" as const },
	{ path: "/api/auth/forget-password/*", method: "POST" as const },
	{ path: "/api/auth/reset-password/*", method: "POST" as const },
];

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
	title: { default: "Banata Dashboard", template: "%s | Banata" },
	description: "Developer dashboard for users, orgs, and enterprise SSO",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const token = await getToken();
	const convexSiteUrl = resolveDashboardConvexSiteUrl();

	return (
		<html lang="en" className="dark">
			<head>
				{/* Pre-warm connections to Convex backend for faster API calls */}
				{process.env.NEXT_PUBLIC_CONVEX_URL && (
					<>
						<link rel="preconnect" href={process.env.NEXT_PUBLIC_CONVEX_URL} />
						<link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_CONVEX_URL} />
					</>
				)}
				{convexSiteUrl && (
					<>
						<link rel="preconnect" href={convexSiteUrl} />
						<link rel="dns-prefetch" href={convexSiteUrl} />
					</>
				)}
				<BotIdClient protect={botIdProtectedRoutes} />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
				<BackendStatusProvider>
					<ConvexClientProvider initialToken={token}>
						<DashboardLayout>{children}</DashboardLayout>
					</ConvexClientProvider>
				</BackendStatusProvider>
				<Toaster
					theme="dark"
					position="bottom-right"
					toastOptions={{ duration: 8000 }}
					richColors
					closeButton
				/>
			</body>
		</html>
	);
}
