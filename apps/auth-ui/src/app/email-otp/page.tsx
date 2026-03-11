"use client";

import {
	DisabledAuthMethodCard,
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { ProjectAuthLogo } from "@/components/project-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postCrossDomainAuthJson, useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function EmailOtpPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"request" | "verify">("request");
	const { config, customerAuthBaseUrl, error, hasScope, hostedAuthUrl, isLoading, scopedPath } =
		useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	if (!hasScope) {
		return <MissingProjectScopeCard branding={config?.branding} />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Email OTP" branding={config?.branding} />;
	}

	if (error) {
		return <ProjectAuthErrorCard title="Email OTP" message={error} branding={config?.branding} />;
	}

	if (!(config?.authMethods.emailOtp ?? false)) {
		return (
			<DisabledAuthMethodCard
				title="Email OTP"
				description="Use a one-time code sent to your email."
				backHref={scopedPath("/sign-in")}
				branding={config?.branding}
			/>
		);
	}

	return (
		<AuthCard
			title="Email OTP"
			description="Use a one-time code sent to your email."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			{step === "request" ? (
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						if (!customerAuthBaseUrl) return;
						await postCrossDomainAuthJson(
							authClient,
							customerAuthBaseUrl,
							"/email-otp/send-verification-otp",
							{ email, type: "sign-in" },
						);
						setStep("verify");
					}}
					className="grid gap-3"
				>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="you@company.com"
						required
					/>
					<Button type="submit">Send code</Button>
				</form>
			) : (
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						if (!customerAuthBaseUrl) return;
						await postCrossDomainAuthJson(authClient, customerAuthBaseUrl, "/sign-in/email-otp", {
							email,
							otp,
							callbackURL: hostedAuthUrl("/callback") ?? scopedPath("/callback"),
						});
						window.location.href = scopedPath("/callback");
					}}
					className="grid gap-3"
				>
					<Label htmlFor="otp">Verification code</Label>
					<Input
						id="otp"
						value={otp}
						onChange={(event) => setOtp(event.target.value)}
						inputMode="numeric"
						maxLength={6}
						placeholder="123456"
						required
					/>
					<Button type="submit">Verify code</Button>
				</form>
			)}
		</AuthCard>
	);
}
