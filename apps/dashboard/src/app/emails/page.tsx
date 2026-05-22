"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailsPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/emails/events");
	}, [router]);

	return null;
}
