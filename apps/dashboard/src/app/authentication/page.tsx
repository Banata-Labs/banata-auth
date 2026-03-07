"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AuthenticationPage() {
	useEffect(() => {
		window.location.replace("/authentication/methods");
	}, []);

	return null;
}
