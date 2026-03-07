/**
 * Base error class for all Banata Auth errors.
 * Matches WorkOS SDK error patterns with status, code, and requestId.
 */
export class BanataAuthError extends Error {
	readonly status: number;
	readonly code: string;
	readonly requestId: string;
	readonly retryable: boolean;

	constructor(options: {
		message: string;
		status: number;
		code: string;
		requestId?: string;
		retryable?: boolean;
	}) {
		super(options.message);
		this.name = "BanataAuthError";
		this.status = options.status;
		this.code = options.code;
		this.requestId = options.requestId ?? "";
		this.retryable = options.retryable ?? false;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			code: this.code,
			requestId: this.requestId,
		};
	}
}

/**
 * 401 - Missing or invalid API key / session.
 */
export class AuthenticationError extends BanataAuthError {
	constructor(options: { message?: string; requestId?: string } = {}) {
		super({
			message: options.message ?? "Authentication required",
			status: 401,
			code: "authentication_required",
			requestId: options.requestId,
			retryable: false,
		});
		this.name = "AuthenticationError";
	}
}

/**
 * 403 - Valid credentials but insufficient permissions.
 */
export class ForbiddenError extends BanataAuthError {
	constructor(options: { message?: string; requestId?: string } = {}) {
		super({
			message: options.message ?? "Insufficient permissions",
			status: 403,
			code: "forbidden",
			requestId: options.requestId,
			retryable: false,
		});
		this.name = "ForbiddenError";
	}
}

/**
 * 404 - Resource not found.
 */
export class NotFoundError extends BanataAuthError {
	constructor(options: { message?: string; resource?: string; requestId?: string } = {}) {
		super({
			message:
				options.message ?? (options.resource ? `${options.resource} not found` : "Not found"),
			status: 404,
			code: "not_found",
			requestId: options.requestId,
			retryable: false,
		});
		this.name = "NotFoundError";
	}
}

/**
 * 409 - Conflict (duplicate resource, etc.)
 */
export class ConflictError extends BanataAuthError {
	constructor(options: { message?: string; requestId?: string } = {}) {
		super({
			message: options.message ?? "Resource already exists",
			status: 409,
			code: "conflict",
			requestId: options.requestId,
			retryable: false,
		});
		this.name = "ConflictError";
	}
}

/**
 * Individual field validation error.
 */
export interface FieldError {
	field: string;
	message: string;
	code: string;
}

/**
 * 422 - Validation error with field-level details.
 */
export class ValidationError extends BanataAuthError {
	readonly errors: FieldError[];

	constructor(options: { message?: string; errors: FieldError[]; requestId?: string }) {
		super({
			message: options.message ?? "Validation failed",
			status: 422,
			code: "validation_error",
			requestId: options.requestId,
			retryable: false,
		});
		this.name = "ValidationError";
		this.errors = options.errors;
	}

	toJSON() {
		return {
			...super.toJSON(),
			errors: this.errors,
		};
	}
}

/**
 * 429 - Rate limited.
 */
export class RateLimitError extends BanataAuthError {
	readonly retryAfter: number;

	constructor(options: { retryAfter: number; requestId?: string }) {
		super({
			message: `Rate limit exceeded. Retry after ${options.retryAfter} seconds`,
			status: 429,
			code: "rate_limit_exceeded",
			requestId: options.requestId,
			retryable: true,
		});
		this.name = "RateLimitError";
		this.retryAfter = options.retryAfter;
	}
}

/**
 * 500 - Internal server error.
 */
export class InternalError extends BanataAuthError {
	constructor(options: { message?: string; requestId?: string } = {}) {
		super({
			message: options.message ?? "Internal server error",
			status: 500,
			code: "internal_error",
			requestId: options.requestId,
			retryable: true,
		});
		this.name = "InternalError";
	}
}

/**
 * Maps an HTTP status code to the appropriate error class.
 */
export function createErrorFromStatus(
	status: number,
	body: { message?: string; code?: string; errors?: FieldError[] },
	requestId?: string,
): BanataAuthError {
	switch (status) {
		case 401:
			return new AuthenticationError({ message: body.message, requestId });
		case 403:
			return new ForbiddenError({ message: body.message, requestId });
		case 404:
			return new NotFoundError({ message: body.message, requestId });
		case 409:
			return new ConflictError({ message: body.message, requestId });
		case 422:
			return new ValidationError({
				message: body.message,
				errors: body.errors ?? [],
				requestId,
			});
		case 429: {
			return new RateLimitError({ retryAfter: 60, requestId });
		}
		default:
			if (status >= 500) {
				return new InternalError({ message: body.message, requestId });
			}
			return new BanataAuthError({
				message: body.message ?? "Unknown error",
				status,
				code: body.code ?? "unknown_error",
				requestId,
			});
	}
}
