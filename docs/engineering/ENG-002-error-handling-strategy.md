# ENG-002 — Error Handling Strategy

---

## Metadata

| Field       | Value                 |
| ----------- | --------------------- |
| Document ID | ENG-002               |
| Version     | 1.0.0                 |
| Status      | DRAFT                 |
| Owner       | ArchLens Core Team    |
| Created     | 2026-06-02            |
| Phase       | Phase 4 — Engineering |
| Depends On  | ENG-001, ARCH-004     |

---

## Purpose

Defines how errors are created, propagated, and handled across the ArchLens pipeline.

---

## Error Philosophy

1. **Expected failures use `Result<T, E>`** — file not found, parse errors, invalid config.
2. **Programmer errors throw exceptions** — null dereference, out-of-bounds, invariant violations.
3. **No silent failures** — every error is either handled (skip + log) or propagated.
4. **Errors carry context** — what went wrong, where, and what to do.

---

## Error Categories

| Category       | Type             | Handling                           | Example                   |
| -------------- | ---------------- | ---------------------------------- | ------------------------- |
| Input Error    | `Result.err`     | Fail fast, user-facing message     | Path not found            |
| Parse Error    | `Result.err`     | Skip item, log warning, continue   | Syntax error in a file    |
| Analysis Error | `Result.err`     | Propagate to CLI                   | Graph operation failure   |
| Config Error   | `Result.err`     | Fail fast, show usage              | Invalid flag combination  |
| Internal Error | Thrown exception | Catch at CLI boundary, exit code 3 | Invariant violation (bug) |

---

## Error Propagation Flow

```
Pipeline Stage (returns Result)
  → CLI Orchestrator (matches on Result)
    → If Ok: pass to next stage
    → If Err: format error message, set exit code, terminate
```

Pipeline stages never catch and swallow errors from downstream dependencies. They either:

1. **Handle locally** (e.g., parser skips unparseable file, logs warning).
2. **Propagate** (return `Result.err` to caller).

---

## Error Type Structure

```typescript
interface ArchLensError {
    readonly code: string; // Machine-readable error code
    readonly message: string; // Human-readable message
    readonly context?: {
        path?: string; // File/directory involved
        line?: number; // Line number if applicable
        suggestion?: string; // What the user can do
    };
}
```

### Per-Package Error Types

Each package defines its own error type as a discriminated union:

```typescript
// Scanner errors
type ScannerError =
    | { code: "PATH_NOT_FOUND"; path: string }
    | { code: "NOT_A_DIRECTORY"; path: string }
    | { code: "NO_SOURCE_FILES"; path: string; extensions: string[] };

// Parser errors
type ParserError =
    | { code: "PARSE_FAILED"; path: string; reason: string }
    | { code: "TSCONFIG_INVALID"; path: string; reason: string };
```

---

## Logging

### Log Levels

| Level   | Usage                                                  |
| ------- | ------------------------------------------------------ |
| `error` | Errors that terminate the pipeline                     |
| `warn`  | Non-fatal issues (skipped files, unresolved imports)   |
| `info`  | Progress information (files scanned, analysis started) |
| `debug` | Detailed internal state (for development/debugging)    |

### Log Implementation

Simple logging via `@archlens/shared`:

```typescript
interface Logger {
    error(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
}
```

Default log level: `warn` (only warnings and errors shown). Configurable via `--verbose` flag (shows `info`) or `--debug` flag (shows all).

---

## Decision Log

| ID     | Decision                                              | Rationale                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------- |
| DL-067 | Result types for expected errors, exceptions for bugs | Clear distinction between user-facing and internal errors |
| DL-068 | Per-package discriminated union error types           | Type-safe error handling, exhaustive matching             |
| DL-069 | No error swallowing anywhere in pipeline              | Silent failures are bugs                                  |
| DL-070 | Simple logger over logging framework                  | Minimal dependencies; ArchLens is a CLI, not a server     |

---

_End of ENG-002_
