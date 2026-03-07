"use client";

import Link from "next/link";
import { SignUpForm } from "@banata-auth/react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
	return (
		<div className="mt-14">
			<SignUpForm
				authClient={authClient}
				callbackURL="/verify-email"
				description="Email verification is required."
				footer={
					<p>
						Already have an account?{" "}
						<Link href="/sign-in" className="underline">
							Sign in
						</Link>
					</p>
				}
			/>
		</div>
	);
}
