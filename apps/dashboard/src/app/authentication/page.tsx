"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticationPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/authentication/methods");
	}, [router]);

	return null;
}
