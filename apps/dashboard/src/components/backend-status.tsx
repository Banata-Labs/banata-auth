"use client";

import { ApiError } from "@/lib/dashboard-api";
import { WifiOff, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface BackendStatusContextValue {
	/** Whether the backend has been confirmed unreachable. */
	isBackendDown: boolean;
	/** Call this when an API request fails — if it's a network error, the banner is shown. */
	reportError: (error: unknown) => void;
	/** Call this when an API request succeeds — clears the banner. */
	reportSuccess: () => void;
}

const BackendStatusContext = createContext<BackendStatusContextValue>({
	isBackendDown: false,
	reportError: () => {},
	reportSuccess: () => {},
});

export function useBackendStatus() {
	return useContext(BackendStatusContext);
}

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
	const [isBackendDown, setIsBackendDown] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const reportError = useCallback((error: unknown) => {
		if (error instanceof ApiError && error.isNetworkError) {
			setIsBackendDown(true);
			setDismissed(false);
		}
	}, []);

	const reportSuccess = useCallback(() => {
		setIsBackendDown(false);
	}, []);

	// Periodically retry when backend is down to auto-dismiss the banner
	useEffect(() => {
		if (!isBackendDown) return;

		const check = async () => {
			try {
				// Lightweight health-check: try to hit the session endpoint
				const res = await fetch("/api/auth/get-session", {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: "{}",
				});
				if (res.ok || res.status === 401) {
					// Backend is responding (even 401 means it's alive)
					setIsBackendDown(false);
				}
			} catch {
				// still down
			}
		};

		retryTimerRef.current = setInterval(check, 15_000);
		return () => {
			if (retryTimerRef.current) clearInterval(retryTimerRef.current);
		};
	}, [isBackendDown]);

	return (
		<BackendStatusContext.Provider value={{ isBackendDown, reportError, reportSuccess }}>
			{isBackendDown && !dismissed && (
				<div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200 backdrop-blur-sm">
					<WifiOff className="size-4 shrink-0 text-amber-400" />
					<span>
						<strong>Backend not connected</strong> — Dashboard data cannot be loaded. Make sure your
						Convex dev server is running.
					</span>
					<button
						type="button"
						onClick={() => setDismissed(true)}
						className="ml-2 rounded p-0.5 text-amber-400/60 hover:text-amber-300 transition-colors"
					>
						<X className="size-3.5" />
					</button>
				</div>
			)}
			{children}
		</BackendStatusContext.Provider>
	);
}
