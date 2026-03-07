import { describe, it, expect } from "vitest";
import {
	BanataAuthError,
	AuthenticationError,
	ForbiddenError,
	NotFoundError,
	ConflictError,
	ValidationError,
	RateLimitError,
	InternalError,
	createErrorFromStatus,
} from "../errors";

describe("errors", () => {
	describe("BanataAuthError", () => {
		it("has correct properties", () => {
			const error = new BanataAuthError({
				message: "test error",
				status: 400,
				code: "test_error",
				requestId: "req_123",
				retryable: true,
			});

			expect(error.message).toBe("test error");
			expect(error.status).toBe(400);
			expect(error.code).toBe("test_error");
			expect(error.requestId).toBe("req_123");
			expect(error.retryable).toBe(true);
		});

		it("defaults requestId to empty string", () => {
			const error = new BanataAuthError({
				message: "test",
				status: 400,
				code: "test",
			});
			expect(error.requestId).toBe("");
		});

		it("defaults retryable to false", () => {
			const error = new BanataAuthError({
				message: "test",
				status: 400,
				code: "test",
			});
			expect(error.retryable).toBe(false);
		});

		it("is an instance of Error", () => {
			const error = new BanataAuthError({
				message: "test",
				status: 400,
				code: "test",
			});
			expect(error).toBeInstanceOf(Error);
		});

		it("has name 'BanataAuthError'", () => {
			const error = new BanataAuthError({
				message: "test",
				status: 400,
				code: "test",
			});
			expect(error.name).toBe("BanataAuthError");
		});

		it("toJSON() returns expected shape", () => {
			const error = new BanataAuthError({
				message: "test error",
				status: 400,
				code: "test_error",
				requestId: "req_123",
			});
			const json = error.toJSON();

			expect(json).toEqual({
				name: "BanataAuthError",
				message: "test error",
				status: 400,
				code: "test_error",
				requestId: "req_123",
			});
		});

		it("toJSON() does not include retryable", () => {
			const error = new BanataAuthError({
				message: "test",
				status: 400,
				code: "test",
				retryable: true,
			});
			const json = error.toJSON();
			expect(json).not.toHaveProperty("retryable");
		});
	});

	describe("AuthenticationError", () => {
		it("defaults to 401 status", () => {
			const error = new AuthenticationError();
			expect(error.status).toBe(401);
		});

		it('defaults to "authentication_required" code', () => {
			const error = new AuthenticationError();
			expect(error.code).toBe("authentication_required");
		});

		it("defaults to 'Authentication required' message", () => {
			const error = new AuthenticationError();
			expect(error.message).toBe("Authentication required");
		});

		it("is not retryable", () => {
			const error = new AuthenticationError();
			expect(error.retryable).toBe(false);
		});

		it("accepts custom message", () => {
			const error = new AuthenticationError({ message: "Token expired" });
			expect(error.message).toBe("Token expired");
		});

		it("accepts requestId", () => {
			const error = new AuthenticationError({ requestId: "req_abc" });
			expect(error.requestId).toBe("req_abc");
		});

		it("is an instance of Error", () => {
			expect(new AuthenticationError()).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new AuthenticationError()).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'AuthenticationError'", () => {
			expect(new AuthenticationError().name).toBe("AuthenticationError");
		});
	});

	describe("ForbiddenError", () => {
		it("defaults to 403 status", () => {
			const error = new ForbiddenError();
			expect(error.status).toBe(403);
		});

		it('defaults to "forbidden" code', () => {
			const error = new ForbiddenError();
			expect(error.code).toBe("forbidden");
		});

		it("defaults to 'Insufficient permissions' message", () => {
			const error = new ForbiddenError();
			expect(error.message).toBe("Insufficient permissions");
		});

		it("is not retryable", () => {
			expect(new ForbiddenError().retryable).toBe(false);
		});

		it("is an instance of Error", () => {
			expect(new ForbiddenError()).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new ForbiddenError()).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'ForbiddenError'", () => {
			expect(new ForbiddenError().name).toBe("ForbiddenError");
		});
	});

	describe("NotFoundError", () => {
		it("defaults to 404 status", () => {
			const error = new NotFoundError();
			expect(error.status).toBe(404);
		});

		it('defaults to "not_found" code', () => {
			const error = new NotFoundError();
			expect(error.code).toBe("not_found");
		});

		it("defaults to 'Not found' message", () => {
			const error = new NotFoundError();
			expect(error.message).toBe("Not found");
		});

		it("includes resource name in message when provided", () => {
			const error = new NotFoundError({ resource: "User" });
			expect(error.message).toBe("User not found");
		});

		it("custom message takes precedence over resource", () => {
			const error = new NotFoundError({ message: "Custom message", resource: "User" });
			expect(error.message).toBe("Custom message");
		});

		it("is not retryable", () => {
			expect(new NotFoundError().retryable).toBe(false);
		});

		it("is an instance of Error", () => {
			expect(new NotFoundError()).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new NotFoundError()).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'NotFoundError'", () => {
			expect(new NotFoundError().name).toBe("NotFoundError");
		});
	});

	describe("ConflictError", () => {
		it("defaults to 409 status", () => {
			const error = new ConflictError();
			expect(error.status).toBe(409);
		});

		it('defaults to "conflict" code', () => {
			const error = new ConflictError();
			expect(error.code).toBe("conflict");
		});

		it("defaults to 'Resource already exists' message", () => {
			const error = new ConflictError();
			expect(error.message).toBe("Resource already exists");
		});

		it("is not retryable", () => {
			expect(new ConflictError().retryable).toBe(false);
		});

		it("is an instance of Error", () => {
			expect(new ConflictError()).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new ConflictError()).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'ConflictError'", () => {
			expect(new ConflictError().name).toBe("ConflictError");
		});
	});

	describe("ValidationError", () => {
		const sampleErrors = [
			{ field: "email", message: "Invalid email", code: "invalid_email" },
			{ field: "name", message: "Name is required", code: "required" },
		];

		it("defaults to 422 status", () => {
			const error = new ValidationError({ errors: [] });
			expect(error.status).toBe(422);
		});

		it('defaults to "validation_error" code', () => {
			const error = new ValidationError({ errors: [] });
			expect(error.code).toBe("validation_error");
		});

		it("defaults to 'Validation failed' message", () => {
			const error = new ValidationError({ errors: [] });
			expect(error.message).toBe("Validation failed");
		});

		it("has errors array", () => {
			const error = new ValidationError({ errors: sampleErrors });
			expect(error.errors).toEqual(sampleErrors);
		});

		it("errors array can be empty", () => {
			const error = new ValidationError({ errors: [] });
			expect(error.errors).toEqual([]);
		});

		it("is not retryable", () => {
			expect(new ValidationError({ errors: [] }).retryable).toBe(false);
		});

		it("toJSON() includes errors array", () => {
			const error = new ValidationError({ errors: sampleErrors });
			const json = error.toJSON();

			expect(json).toHaveProperty("errors");
			expect(json.errors).toEqual(sampleErrors);
		});

		it("toJSON() includes all base properties plus errors", () => {
			const error = new ValidationError({
				errors: sampleErrors,
				requestId: "req_456",
			});
			const json = error.toJSON();

			expect(json).toEqual({
				name: "ValidationError",
				message: "Validation failed",
				status: 422,
				code: "validation_error",
				requestId: "req_456",
				errors: sampleErrors,
			});
		});

		it("is an instance of Error", () => {
			expect(new ValidationError({ errors: [] })).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new ValidationError({ errors: [] })).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'ValidationError'", () => {
			expect(new ValidationError({ errors: [] }).name).toBe("ValidationError");
		});
	});

	describe("RateLimitError", () => {
		it("defaults to 429 status", () => {
			const error = new RateLimitError({ retryAfter: 60 });
			expect(error.status).toBe(429);
		});

		it('has code "rate_limit_exceeded"', () => {
			const error = new RateLimitError({ retryAfter: 60 });
			expect(error.code).toBe("rate_limit_exceeded");
		});

		it("has retryAfter property", () => {
			const error = new RateLimitError({ retryAfter: 120 });
			expect(error.retryAfter).toBe(120);
		});

		it("message includes retry time", () => {
			const error = new RateLimitError({ retryAfter: 60 });
			expect(error.message).toContain("60");
		});

		it("is retryable", () => {
			const error = new RateLimitError({ retryAfter: 60 });
			expect(error.retryable).toBe(true);
		});

		it("is an instance of Error", () => {
			expect(new RateLimitError({ retryAfter: 60 })).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new RateLimitError({ retryAfter: 60 })).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'RateLimitError'", () => {
			expect(new RateLimitError({ retryAfter: 60 }).name).toBe("RateLimitError");
		});
	});

	describe("InternalError", () => {
		it("defaults to 500 status", () => {
			const error = new InternalError();
			expect(error.status).toBe(500);
		});

		it('defaults to "internal_error" code', () => {
			const error = new InternalError();
			expect(error.code).toBe("internal_error");
		});

		it("defaults to 'Internal server error' message", () => {
			const error = new InternalError();
			expect(error.message).toBe("Internal server error");
		});

		it("is retryable by default", () => {
			const error = new InternalError();
			expect(error.retryable).toBe(true);
		});

		it("accepts custom message", () => {
			const error = new InternalError({ message: "Database connection failed" });
			expect(error.message).toBe("Database connection failed");
		});

		it("is an instance of Error", () => {
			expect(new InternalError()).toBeInstanceOf(Error);
		});

		it("is an instance of BanataAuthError", () => {
			expect(new InternalError()).toBeInstanceOf(BanataAuthError);
		});

		it("has name 'InternalError'", () => {
			expect(new InternalError().name).toBe("InternalError");
		});
	});

	describe("createErrorFromStatus()", () => {
		it("401 returns AuthenticationError", () => {
			const error = createErrorFromStatus(401, {});
			expect(error).toBeInstanceOf(AuthenticationError);
			expect(error.status).toBe(401);
		});

		it("403 returns ForbiddenError", () => {
			const error = createErrorFromStatus(403, {});
			expect(error).toBeInstanceOf(ForbiddenError);
			expect(error.status).toBe(403);
		});

		it("404 returns NotFoundError", () => {
			const error = createErrorFromStatus(404, {});
			expect(error).toBeInstanceOf(NotFoundError);
			expect(error.status).toBe(404);
		});

		it("409 returns ConflictError", () => {
			const error = createErrorFromStatus(409, {});
			expect(error).toBeInstanceOf(ConflictError);
			expect(error.status).toBe(409);
		});

		it("422 returns ValidationError", () => {
			const error = createErrorFromStatus(422, { errors: [] });
			expect(error).toBeInstanceOf(ValidationError);
			expect(error.status).toBe(422);
		});

		it("422 with errors passes them through", () => {
			const fieldErrors = [
				{ field: "email", message: "Invalid", code: "invalid" },
			];
			const error = createErrorFromStatus(422, { errors: fieldErrors });
			expect(error).toBeInstanceOf(ValidationError);
			expect((error as ValidationError).errors).toEqual(fieldErrors);
		});

		it("422 without errors defaults to empty array", () => {
			const error = createErrorFromStatus(422, {});
			expect(error).toBeInstanceOf(ValidationError);
			expect((error as ValidationError).errors).toEqual([]);
		});

		it("429 returns RateLimitError", () => {
			const error = createErrorFromStatus(429, {});
			expect(error).toBeInstanceOf(RateLimitError);
			expect(error.status).toBe(429);
		});

		it("429 sets default retryAfter of 60", () => {
			const error = createErrorFromStatus(429, {}) as RateLimitError;
			expect(error.retryAfter).toBe(60);
		});

		it("500 returns InternalError", () => {
			const error = createErrorFromStatus(500, {});
			expect(error).toBeInstanceOf(InternalError);
			expect(error.status).toBe(500);
		});

		it("502 returns InternalError (any 5xx)", () => {
			const error = createErrorFromStatus(502, {});
			expect(error).toBeInstanceOf(InternalError);
		});

		it("503 returns InternalError (any 5xx)", () => {
			const error = createErrorFromStatus(503, {});
			expect(error).toBeInstanceOf(InternalError);
		});

		it("504 returns InternalError (any 5xx)", () => {
			const error = createErrorFromStatus(504, {});
			expect(error).toBeInstanceOf(InternalError);
		});

		it("418 returns generic BanataAuthError", () => {
			const error = createErrorFromStatus(418, {});
			expect(error).toBeInstanceOf(BanataAuthError);
			// Should NOT be an instance of any specific subclass
			expect(error.constructor).toBe(BanataAuthError);
		});

		it("400 returns generic BanataAuthError", () => {
			const error = createErrorFromStatus(400, { message: "Bad request", code: "bad_request" });
			expect(error).toBeInstanceOf(BanataAuthError);
			expect(error.status).toBe(400);
			expect(error.message).toBe("Bad request");
			expect(error.code).toBe("bad_request");
		});

		it("unknown status without message defaults to 'Unknown error'", () => {
			const error = createErrorFromStatus(418, {});
			expect(error.message).toBe("Unknown error");
		});

		it("unknown status without code defaults to 'unknown_error'", () => {
			const error = createErrorFromStatus(418, {});
			expect(error.code).toBe("unknown_error");
		});

		it("passes requestId through", () => {
			const error = createErrorFromStatus(401, {}, "req_test_123");
			expect(error.requestId).toBe("req_test_123");
		});

		it("passes custom message through", () => {
			const error = createErrorFromStatus(401, { message: "Token expired" });
			expect(error.message).toBe("Token expired");
		});

		it("all returned errors are instances of Error", () => {
			const statuses = [401, 403, 404, 409, 422, 429, 500, 502, 418];
			for (const status of statuses) {
				const error = createErrorFromStatus(status, { errors: [] });
				expect(error).toBeInstanceOf(Error);
			}
		});

		it("all returned errors are instances of BanataAuthError", () => {
			const statuses = [401, 403, 404, 409, 422, 429, 500, 502, 418];
			for (const status of statuses) {
				const error = createErrorFromStatus(status, { errors: [] });
				expect(error).toBeInstanceOf(BanataAuthError);
			}
		});
	});
});
