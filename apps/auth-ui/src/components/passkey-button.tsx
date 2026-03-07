"use client";

import { Button } from "@/components/ui/button";

export function PasskeyButton({ callbackURL }: { callbackURL?: string }) {
	return (
		<Button
			type="button"
			variant="secondary"
			onClick={() => {
				const params = new URLSearchParams();
				if (callbackURL) {
					params.set("callbackURL", callbackURL);
				}
				window.location.href = `/api/auth/sign-in/passkey?${params.toString()}`;
			}}
		>
			Sign in with Passkey
		</Button>
	);
}
