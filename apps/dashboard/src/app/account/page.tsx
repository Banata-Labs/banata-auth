"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
	const router = useRouter();
	useEffect(() => {
		router.replace("/account/profile");
	}, [router]);
	return null;
}
