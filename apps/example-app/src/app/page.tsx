import Link from "next/link";
import { isAuthenticated } from "@/lib/auth-server";

export default async function Home() {
	const hasToken = await isAuthenticated();

	return (
		<main style={{ maxWidth: 600, margin: "100px auto", textAlign: "center" }}>
			<h1>Banata Auth Example</h1>
			<p>Open-source WorkOS replacement built on Better Auth + Convex.</p>

			<div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center" }}>
				{hasToken ? (
					<Link href="/dashboard">
						<button type="button">Go to Dashboard</button>
					</Link>
				) : (
					<Link href="/sign-in">
						<button type="button">Sign In</button>
					</Link>
				)}
			</div>
		</main>
	);
}
