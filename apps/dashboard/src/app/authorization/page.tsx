"use client";

import { useEffect } from "react";

export default function AuthorizationPage() {
	useEffect(() => {
		window.location.replace("/authorization/roles");
	}, []);

	return null;
}
