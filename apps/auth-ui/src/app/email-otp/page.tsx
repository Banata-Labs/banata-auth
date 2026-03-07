"use client";

import { useState } from "react";
import { AuthCard } from "@banata-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EmailOtpPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"request" | "verify">("request");

	return (
		<AuthCard title="Email OTP" description="Use a one-time code sent to your email.">
			{step === "request" ? (
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						await fetch("/api/auth/email-otp/send-verification-otp", {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify({ email, type: "sign-in" }),
						});
						setStep("verify");
					}}
					className="grid gap-3"
				>
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
					<Button type="submit">Send code</Button>
				</form>
			) : (
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						await fetch("/api/auth/sign-in/email-otp", {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify({ email, otp, callbackURL: "/org-selector" }),
						});
						window.location.href = "/org-selector";
					}}
					className="grid gap-3"
				>
					<Label htmlFor="otp">Verification code</Label>
					<Input id="otp" value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" required />
					<Button type="submit">Verify code</Button>
				</form>
			)}
		</AuthCard>
	);
}
