"use client";

import { useEffect } from "react";

export default function EmailsPage() {
	useEffect(() => {
		window.location.replace("/emails/events");
	}, []);

	return null;
}
