# ENG-001 — Type System Strategy

---

## Metadata

| Field       | Value                 |
| ----------- | --------------------- |
| Document ID | ENG-001               |
| Version     | 1.0.0                 |
| Status      | DRAFT                 |
| Owner       | ArchLens Core Team    |
| Created     | 2026-06-02            |
| Phase       | Phase 4 — Engineering |
| Depends On  | ARCH-004, ARCH-007    |

---

## Purpose

Defines the type system strategy for ArchLens — how types are organized, shared across packages, and enforced.

---

## Core Principles

1. **All shared types live in `@archlens/types`** — no type definitions duplicated across packages.
2. **Strict TypeScript** — `strict: true` in all tsconfig files.
3. **No `any` in public APIs** — `unknown` with type narrowing preferred.
4. **Readonly by default** — all data structures passed between pipeline stages are immutable.
5. **Discriminated unions** for variant types — not inheritance, not string enums.

---

## Type Organization

### `@archlens/types` Package Structure

```
packages/types/src/
├── index.ts                    // Re-exports all types
├── scanner.ts                  // FileManifest, FileEntry, ScannerConfig
├── parser.ts                   // ModuleMap, ModuleInfo, ImportDeclaration, ExportDeclaration
├── graph.ts                    // DependencyGraph, GraphNode, GraphEdge, Cycle
├── analyzer.ts                 // AnalysisResult, ModuleMetrics, GraphMetrics, PatternMatch
├── rules.ts                    // ArchitectureRule, RuleContext, Violation, ViolationSet, Evidence
├── scoring.ts                  // ScoreCard, DimensionalScore, Penalty, Grade
├── risk.ts                     // RiskAssessment, Risk
├── reporting.ts                // ReportInput, ReportOptions, ReportMetadata
├── common.ts                   // Result, ArchLensError, Severity
└── config.ts                   // CLIOptions, AnalyzeOptions
```

---

## Key Type Definitions

### Result Type

```typescript
type Result<T, E> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };

// Constructor helpers
function Ok<T>(value: T): Result<T, never>;
function Err<E>(error: E): Result<never, E>;
```

**Why custom Result over throwing**: Explicit error handling at type level. Callers cannot forget to handle errors — the compiler enforces it.

### Error Types

```typescript
interface ArchLensError {
    readonly code: string; // Machine-readable (e.g., 'PATH_NOT_FOUND')
    readonly message: string; // Human-readable
    readonly context?: Record<string, unknown>; // Additional context
}

// Specific error types as discriminated union
type ScannerError =
    | { readonly code: "PATH_NOT_FOUND"; readonly path: string }
    | { readonly code: "NOT_A_DIRECTORY"; readonly path: string }
    | { readonly code: "NO_SOURCE_FILES"; readonly path: string };
```

### Severity

```typescript
const SEVERITY = {
    error: "error",
    warning: "warning",
    info: "info",
} as const;

type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];
```

**Why `as const` objects over enums**: TypeScript enums generate runtime code and have known edge cases (reverse mappings, numeric enums). `as const` objects are simpler, tree-shakeable, and produce cleaner JavaScript output.

### Grade

```typescript
const GRADE = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    F: "F",
} as const;

type Grade = (typeof GRADE)[keyof typeof GRADE];
```

---

## Immutability Strategy

All types passed between packages use `readonly` at every level:

```typescript
interface FileManifest {
    readonly rootPath: string;
    readonly files: readonly FileEntry[];
    readonly totalSize: number;
    readonly scannedAt: string;
}
```

**Deep readonly**: For complex nested types, use a `DeepReadonly` utility type:

```typescript
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

---

## Type Export Rules

1. Each type file exports types only — no runtime code.
2. `index.ts` re-exports everything — consumers import from `@archlens/types`.
3. Internal types (not shared across packages) stay in the owning package.
4. Types follow naming convention: `PascalCase`, no `I` prefix for interfaces.

---

## TypeScript Configuration

### `tsconfig.base.json` (Root)

```json
{
    "compilerOptions": {
        "strict": true,
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "isolatedModules": true,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": true
    }
}
```

Key strict options:

- `noUncheckedIndexedAccess`: Prevents unsafe array/object indexing.
- `exactOptionalPropertyTypes`: Distinguishes between `undefined` and missing properties.

---

## Decision Log

| ID     | Decision                              | Rationale                                       |
| ------ | ------------------------------------- | ----------------------------------------------- |
| DL-062 | All shared types in `@archlens/types` | Single source of truth, no duplication          |
| DL-063 | Custom Result type over exceptions    | Compile-time error handling enforcement         |
| DL-064 | `as const` objects over enums         | Simpler, no runtime overhead, tree-shakeable    |
| DL-065 | Readonly at all levels                | Enforces immutability principle at compile time |
| DL-066 | `noUncheckedIndexedAccess` enabled    | Prevents a common class of runtime errors       |

---

_End of ENG-001_
