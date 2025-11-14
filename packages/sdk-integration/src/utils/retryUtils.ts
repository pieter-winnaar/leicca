/**
 * Retry Utilities
 *
 * Retry logic with exponential backoff for handling transient failures.
 * Supports different retry strategies for different error types.
 */

import { AuthenticationError, ValidationError, NetworkError, RateLimitError } from '../errors/sdkErrors';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;  // milliseconds
}

/**
 * Retry function with exponential backoff
 *
 * Retry behavior by error type:
 * - NetworkError: Exponential backoff (baseDelay * 2^attempt)
 * - RateLimitError: Linear backoff (5s, 10s, 15s)
 * - AuthenticationError: No retry (throw immediately)
 * - ValidationError: No retry (throw immediately)
 *
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Promise with function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, baseDelay: 1000 }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry authentication errors - these need user action
      if (error instanceof AuthenticationError) {
        throw error;
      }

      // Don't retry validation errors - input is invalid
      if (error instanceof ValidationError) {
        throw error;
      }

      // Retry network errors with exponential backoff
      if (error instanceof NetworkError && attempt < options.maxRetries - 1) {
        const delay = Math.pow(2, attempt) * options.baseDelay;
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Retry rate limit errors with longer delay
      if (error instanceof RateLimitError && attempt < options.maxRetries - 1) {
        const delay = (attempt + 1) * 5000;  // 5s, 10s, 15s
        console.log(`Rate limited, retry after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt or non-retryable error
      throw error;
    }
  }

  throw lastError!;
}
