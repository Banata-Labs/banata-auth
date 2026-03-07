import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const links = [
	{ href: "/sso-setup", label: "SSO Setup Wizard" },
	{ href: "/domain-verification", label: "Domain Verification" },
	{ href: "/users", label: "User Access" },
];

export default function HomePage() {
	return (
		<section className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Admin Portal</h1>
				<p className="mt-1 text-sm text-muted-foreground">Configure enterprise SSO and verify ownership of your identity domains.</p>
			</div>
			<div className="grid gap-3">
				{links.map((link) => (
					<Card key={link.href}>
						<CardHeader>
							<CardTitle className="text-base">{link.label}</CardTitle>
							<CardDescription>Open this setup flow in the enterprise admin portal.</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline" className="w-full justify-start">
								<Link href={link.href}>Open</Link>
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}
