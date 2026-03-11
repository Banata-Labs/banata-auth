"use client";

type AuthClientErrorLike = {
	message?: string;
	code?: string;
	status?: number;
	details?: {
		tryAgainIn?: number;
	};
};

function formatRetryMessage(baseMessage: string, tryAgainIn?: number) {
	if (typeof tryAgainIn !== "number" || !Number.isFinite(tryAgainIn) || tryAgainIn <= 0) {
		return baseMessage;
	}

	const seconds = Math.max(1, Math.ceil(tryAgainIn));
	return `${baseMessage} Try again in about ${seconds} second${seconds === 1 ? "" : "s"}.`;
}

export function formatAuthClientError(
	error: AuthClientErrorLike | null | undefined,
	fallbackMessage: string,
) {
	if (!error) {
		return fallbackMessage;
	}

	const baseMessage = error.message?.trim() || fallbackMessage;
	const isRateLimited =
		error.code === "RATE_LIMITED" ||
		error.status === 429 ||
		baseMessage.toLowerCase() === "rate limit exceeded.";
	if (!isRateLimited) {
		return baseMessage;
	}

	return formatRetryMessage(baseMessage, error.details?.tryAgainIn);
}
