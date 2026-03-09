import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
	title: "Banata Admin Portal",
	description: "Self-serve IT admin portal for enterprise setup",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
				<div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
			</body>
		</html>
	);
}
