import { describe, expect, it } from "vitest";
import {
	REDACTED_LOG_VALUE,
	isSensitiveLogKey,
	redactSensitiveObject,
	redactSensitiveString,
	redactUrl,
} from "../log-redaction";

describe("log redaction", () => {
	it("detects sensitive log keys", () => {
		expect(isSensitiveLogKey("authorization")).toBe(true);
		expect(isSensitiveLogKey("x-api-key")).toBe(true);
		expect(isSensitiveLogKey("clientSecret")).toBe(true);
		expect(isSensitiveLogKey("pathname")).toBe(false);
	});

	it("redacts known secret-looking values inside strings", () => {
		expect(redactSensitiveString("Authorization: Bearer abc.def.ghi")).toBe(
			`Authorization: ${REDACTED_LOG_VALUE}`,
		);
		expect(redactSensitiveString("created whsec_abcdefghijklmnopqrstuvwxyz")).toBe(
			`created ${REDACTED_LOG_VALUE}`,
		);
	});

	it("redacts sensitive URL query parameters", () => {
		const redacted = redactUrl(
			"https://app.example.com/callback?code=abc&state=xyz&session_token=secret",
		);

		expect(redacted).toContain("code=abc");
		expect(redacted).toContain(`session_token=${encodeURIComponent(REDACTED_LOG_VALUE)}`);
		expect(redacted).not.toContain("secret");
	});

	it("redacts nested object fields by key while preserving nonsensitive context", () => {
		expect(
			redactSensitiveObject({
				pathname: "/api/auth/session",
				headers: {
					authorization: "Bearer abc.def.ghi",
					"x-api-key": "ba_live_secret",
					origin: "https://app.example.com",
				},
			}),
		).toEqual({
			pathname: "/api/auth/session",
			headers: {
				authorization: REDACTED_LOG_VALUE,
				"x-api-key": REDACTED_LOG_VALUE,
				origin: "https://app.example.com",
			},
		});
	});
});
