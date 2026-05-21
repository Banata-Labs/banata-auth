import { AuthHero } from "@/components/auth-hero";
import { HostedAuthLink } from "@/components/hosted-auth-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { getEnabledSocialProviders, getPublicAuthConfig } from "@/lib/public-auth-config";
import { SignUpForm, SocialButtons, useUser } from "@banata-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function SignUpPage() {
	const navigate = useNavigate();
	const { isAuthenticated, isLoading } = useUser();
	const authConfigQuery = useQuery({
		queryKey: ["public-auth-config"],
		queryFn: getPublicAuthConfig,
		retry: false,
	});

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate("/app", { replace: true });
		}
	}, [isAuthenticated, isLoading, navigate]);

	const config = authConfigQuery.data;
	const socialProviders = getEnabledSocialProviders(config);
	const emailPasswordEnabled = config?.authMethods.emailPassword ?? true;
	const signUpEnabled = config?.features.signUp ?? true;

	return (
		<div className="grid min-h-screen lg:grid-cols-[1.05fr,0.95fr]">
			<AuthHero />
			<div className="flex min-h-screen items-center justify-center px-6 py-12">
				{authConfigQuery.isLoading ? (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardContent className="p-8 text-sm text-muted-foreground">
							Loading available sign-up methods...
						</CardContent>
					</Card>
				) : authConfigQuery.error ? (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardContent className="p-8 text-sm text-muted-foreground">
							Unable to load authentication settings.
						</CardContent>
					</Card>
				) : !signUpEnabled ? (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardHeader>
							<CardTitle>New sign-ups are disabled</CardTitle>
							<CardDescription>
								This workspace is not accepting new registrations right now.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link className="text-sm text-primary hover:underline" to="/sign-in">
								Back to sign in
							</Link>
						</CardContent>
					</Card>
				) : emailPasswordEnabled ? (
					<div className="w-full max-w-md space-y-4">
						<HostedAuthLink mode="sign-up" />
						<Separator />
						<SignUpForm
							authClient={authClient}
							callbackURL="/auth/callback?next=/app"
							socialProviders={socialProviders}
							title="Create your workspace"
							description="Set up a support workspace for intake, triage, and replies."
							footer={
								<Link className="text-sm text-primary hover:underline" to="/sign-in">
									Already have an account? Sign in
								</Link>
							}
						/>
					</div>
				) : (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardHeader>
							<CardTitle>Create your workspace</CardTitle>
							<CardDescription>
								Use one of the enabled providers below to create an account.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<HostedAuthLink mode="sign-up" />
							<Separator />
							<SocialButtons
								authClient={authClient}
								providers={socialProviders}
								callbackURL="/auth/callback?next=/app"
							/>
							<div className="text-center">
								<Link className="text-sm text-primary hover:underline" to="/sign-in">
									Already have an account? Sign in
								</Link>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
