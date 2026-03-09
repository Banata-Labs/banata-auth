"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticationPage() {
	useEffect(() => {
		window.location.replace("/authentication/methods");
	}, []);

	return null;
}
