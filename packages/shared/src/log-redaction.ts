const SENSITIVE_KEY_PATTERN =
	/(authorization|cookie|token|secret|password|passcode|otp|api[-_]?key|client[-_]?secret|refresh|session)/i;

const SENSITIVE_VALUE_PATTERNS = [
	/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
	/\bba_(?:live|test)_[A-Za-z0-9._-]+/g,
	/\bsk_(?:live|test)_[A-Za-z0-9._-]+/g,
	/\bwhsec_[A-Za-z0-9._-]+/g,
	/\beyJ[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/g,
];

export const REDACTED_LOG_VALUE = "[REDACTED]";

export function isSensitiveLogKey(key: string): boolean {
	return SENSITIVE_KEY_PATTERN.test(key);
}

export function redactSensitiveString(value: string): string {
	return SENSITIVE_VALUE_PATTERNS.reduce(
		(redacted, pattern) => redacted.replace(pattern, REDACTED_LOG_VALUE),
		value,
	);
}

export function redactUrl(value: string): string {
	try {
		const url = new URL(value);
		for (const key of Array.from(url.searchParams.keys())) {
			if (isSensitiveLogKey(key)) {
				url.searchParams.set(key, REDACTED_LOG_VALUE);
			}
		}
		return redactSensitiveString(url.toString());
	} catch {
		return redactSensitiveString(value);
	}
}

export function redactSensitiveObject<T>(value: T): T {
	return redactValue(value, null) as T;
}

function redactValue(value: unknown, key: string | null): unknown {
	if (key && isSensitiveLogKey(key)) {
		return REDACTED_LOG_VALUE;
	}
	if (typeof value === "string") {
		return redactSensitiveString(value);
	}
	if (Array.isArray(value)) {
		return value.map((item) => redactValue(item, null));
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
			entryKey,
			redactValue(entryValue, entryKey),
		]);
		return Object.fromEntries(entries);
	}
	return value;
}
