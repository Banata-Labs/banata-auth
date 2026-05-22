"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthorizationPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/authorization/roles");
	}, [router]);

	return null;
}
