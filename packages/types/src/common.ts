// ============================================================
// @archlens/types — Common Types
// ============================================================

/**
 * Discriminated Result type for explicit error handling.
 * Functions that can fail return Result<T, E> instead of throwing.
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Base error type for all ArchLens errors.
 * Every error carries a machine-readable code, human-readable message,
 * and optional context for debugging.
 */
export interface ArchLensError {
  readonly code: string;
  readonly message: string;
  readonly context?: Record<string, unknown>;
}

/**
 * Severity levels for violations and rules.
 * Using const object + type extraction instead of enums (ARCH-004 P10).
 */
export const SEVERITY = {
  error: 'error',
  warning: 'warning',
  info: 'info',
} as const;

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

/**
 * Architecture score grades.
 */
export const GRADE = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  F: 'F',
} as const;

export type Grade = (typeof GRADE)[keyof typeof GRADE];

/**
 * Edge type taxonomy for dependency relationships.
 */
export const EDGE_TYPE = {
  static: 'static',
  dynamic: 'dynamic',
  typeOnly: 'type-only',
  reExport: 're-export',
  sideEffect: 'side-effect',
} as const;

export type EdgeType = (typeof EDGE_TYPE)[keyof typeof EDGE_TYPE];
