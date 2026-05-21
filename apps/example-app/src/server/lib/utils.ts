export function createId(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function toIsoDate(value: Date | number | string): string {
	return new Date(value).toISOString();
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function asString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function asNullableString(value: unknown): string | null {
	return typeof value === "string" ? value : null;
}
