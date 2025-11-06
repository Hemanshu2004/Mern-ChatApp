/**
 * Result type for functional error handling
 * Either contains a success value (Ok) or an error (Err)
 * 
 * @template T - Success value type
 * @template E - Error type
 */

/**
 * Creates a successful Result
 * @template T
 * @param {T} value - The success value
 * @returns {{ ok: true, value: T, error: null }}
 */
export function Ok(value) {
  return { ok: true, value, error: null };
}

/**
 * Creates a failed Result
 * @template E
 * @param {E} error - The error value
 * @returns {{ ok: false, value: null, error: E }}
 */
export function Err(error) {
  return { ok: false, value: null, error };
}

/**
 * Checks if a Result is successful
 * @param {ReturnType<typeof Ok> | ReturnType<typeof Err>} result
 * @returns {result is ReturnType<typeof Ok>}
 */
export function isOk(result) {
  return result.ok === true;
}

/**
 * Checks if a Result is an error
 * @param {ReturnType<typeof Ok> | ReturnType<typeof Err>} result
 * @returns {result is ReturnType<typeof Err>}
 */
export function isErr(result) {
  return result.ok === false;
}

