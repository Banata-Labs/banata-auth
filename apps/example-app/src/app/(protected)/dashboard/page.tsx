"use client";

import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user ?? null;

	if (isPending) {
		return (
			<main style={{ maxWidth: 600, margin: "100px auto" }}>
				<p>Loading...</p>
			</main>
		);
	}

	if (user === null) {
		return (
			<main style={{ maxWidth: 600, margin: "100px auto" }}>
				<h1>Unauthorized</h1>
				<p>You need to sign in to access this page.</p>
				<a href="/sign-in">Sign In</a>
			</main>
		);
	}

	return (
		<main style={{ maxWidth: 600, margin: "100px auto" }}>
			<h1>Dashboard</h1>
			<p>Welcome, {user.name || user.email}!</p>

			<h2>User Identity</h2>
			<pre style={{ background: "#f5f5f5", padding: 16, overflow: "auto" }}>
				{JSON.stringify(user, null, 2)}
			</pre>

			<button
				type="button"
				onClick={async () => {
					await authClient.signOut();
					window.location.href = "/";
				}}
				style={{ marginTop: 16, padding: 10 }}
			>
				Sign Out
			</button>
		</main>
	);
}
