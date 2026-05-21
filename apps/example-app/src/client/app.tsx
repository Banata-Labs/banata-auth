import { AuthProvider } from "@/lib/auth-provider";
import { AuthCallbackPage } from "@/routes/auth-callback";
import { DashboardPage } from "@/routes/dashboard";
import { HomePage } from "@/routes/home";
import { SignInPage } from "@/routes/sign-in";
import { SignUpPage } from "@/routes/sign-up";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/sign-in" element={<SignInPage />} />
						<Route path="/sign-up" element={<SignUpPage />} />
						<Route path="/auth/callback" element={<AuthCallbackPage />} />
						<Route path="/app" element={<DashboardPage />} />
					</Routes>
				</BrowserRouter>
				<Toaster richColors position="top-right" />
			</AuthProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
