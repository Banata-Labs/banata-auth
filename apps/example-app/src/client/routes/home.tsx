import { useUser } from "@banata-auth/react";
import { Navigate } from "react-router-dom";

export function HomePage() {
	const { isAuthenticated, isLoading } = useUser();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
				Loading session…
			</div>
		);
	}

	return <Navigate replace to={isAuthenticated ? "/app" : "/sign-in"} />;
}
