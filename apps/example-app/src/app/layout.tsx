import { ConvexClientProvider } from "@/components/convex-client-provider";

export const metadata = {
	title: "Banata Auth Example",
	description: "Example app demonstrating Banata Auth with Next.js and Convex",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<ConvexClientProvider>{children}</ConvexClientProvider>
			</body>
		</html>
	);
}
