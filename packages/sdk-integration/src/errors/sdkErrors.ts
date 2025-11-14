/**
 * SDK Error Classes
 *
 * Custom error types for SDK wrapper operations with:
 * - Hierarchical error types for specific error handling
 * - Original error preservation for debugging
 * - Error codes for programmatic error handling
 */

export class SDKError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'SDKError';
  }
}

export class NetworkError extends SDKError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends SDKError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', originalError);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends SDKError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'RATE_LIMIT_ERROR', originalError);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends SDKError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends SDKError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'TIMEOUT_ERROR', originalError);
    this.name = 'TimeoutError';
  }
}
