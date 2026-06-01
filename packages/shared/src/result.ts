// ============================================================
// @archlens/shared — Result Helpers
// ============================================================

import type { Result } from "@archlens/types";

/** Create a successful Result. */
export function Ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

/** Create a failed Result. */
export function Err<E>(error: E): Result<never, E> {
    return { ok: false, error };
}

/** Type guard: is this Result a success? */
export function isOk<T, E>(
    result: Result<T, E>,
): result is { ok: true; value: T } {
    return result.ok;
}

/** Type guard: is this Result a failure? */
export function isErr<T, E>(
    result: Result<T, E>,
): result is { ok: false; error: E } {
    return !result.ok;
}

/** Unwrap a Result, throwing if it's an error. For tests only. */
export function unwrap<T, E>(result: Result<T, E>): T {
    if (result.ok) return result.value;
    throw new Error(`Unwrap called on Err: ${JSON.stringify(result.error)}`);
}
