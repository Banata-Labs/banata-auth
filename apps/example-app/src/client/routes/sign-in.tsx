import { AuthHero } from "@/components/auth-hero";
import { HostedAuthLink } from "@/components/hosted-auth-link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { getEnabledSocialProviders, getPublicAuthConfig } from "@/lib/public-auth-config";
import { SignInForm, useUser } from "@banata-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function SignInPage() {
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
	const hasAnyMethods = emailPasswordEnabled || socialProviders.length > 0;

	return (
		<div className="grid min-h-screen lg:grid-cols-[1.05fr,0.95fr]">
			<AuthHero />
			<div className="flex min-h-screen items-center justify-center px-6 py-12">
				{authConfigQuery.isLoading ? (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardContent className="p-8 text-sm text-muted-foreground">
							Loading available sign-in methods...
						</CardContent>
					</Card>
				) : authConfigQuery.error ? (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardContent className="p-8 text-sm text-muted-foreground">
							Unable to load authentication settings.
						</CardContent>
					</Card>
				) : !hasAnyMethods ? (
					<Card className="w-full max-w-md border-border/70 bg-card/80">
						<CardContent className="space-y-3 p-8">
							<p className="text-lg font-semibold text-white">Authentication unavailable</p>
							<p className="text-sm leading-6 text-muted-foreground">
								No sign-in methods are enabled for this project yet.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="w-full max-w-md space-y-4">
						<HostedAuthLink mode="sign-in" />
						<Separator />
						<SignInForm
							authClient={authClient}
							callbackURL="/auth/callback?next=/app"
							socialProviders={socialProviders}
							socialOnly={!emailPasswordEnabled}
							title="Welcome back"
							description="Sign in to open, assign, and resolve tickets."
							footer={
								signUpEnabled ? (
									<Link className="text-sm text-primary hover:underline" to="/sign-up">
										Need an account? Create one
									</Link>
								) : null
							}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
