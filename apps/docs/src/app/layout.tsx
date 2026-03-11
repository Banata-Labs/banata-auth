import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Banata Auth - Documentation",
		template: "%s - Banata Auth Docs",
	},
	description:
		"Documentation for integrating Banata Auth into your product with projects, API keys, and dashboard-managed auth configuration.",
	metadataBase: new URL("https://auth-docs.banata.dev"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
			<body className="min-h-screen antialiased">{children}</body>
		</html>
	);
}
