import { BackendStatusProvider } from "@/components/backend-status";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { resolveDashboardConvexSiteUrl } from "@/lib/convex-urls";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
	title: { default: "Banata Dashboard", template: "%s | Banata" },
	description: "Developer dashboard for users, orgs, and enterprise SSO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
				<BackendStatusProvider>
					<ConvexClientProvider>
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
