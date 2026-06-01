# RFC-002 — Parser Package

---

## Metadata

| Field       | Value                  |
| ----------- | ---------------------- |
| Document ID | RFC-002                |
| Version     | 1.0.0                  |
| Status      | DRAFT                  |
| Owner       | ArchLens Core Team     |
| Created     | 2026-06-02             |
| Phase       | Phase 3 — Package RFCs |
| Depends On  | RFC-001, ARCH-008      |
| Package     | `@archlens/parser`     |

---

## Purpose

RFC for the `@archlens/parser` package — responsible for parsing source files into structural representations and resolving module imports.

---

## Responsibility

L1 in the Architecture Intelligence Hierarchy. Takes a `FileManifest` and produces a `ModuleMap` — a map of file paths to their structural data (imports, exports, module boundaries).

---

## Public API

```typescript
interface ModuleInfo {
    path: string;
    imports: ImportDeclaration[];
    exports: ExportDeclaration[];
    unresolvedImports: string[]; // Specifiers that could not be resolved
}

interface ImportDeclaration {
    specifier: string; // Raw import specifier (e.g., './utils')
    resolvedPath: string | null; // Resolved absolute path (null if unresolved)
    type: "static" | "dynamic" | "type-only" | "re-export" | "side-effect";
    names: string[]; // Imported names (empty for side-effect/namespace)
    line: number; // Source line number
}

interface ExportDeclaration {
    name: string; // Exported name ('default' for default export)
    type: "named" | "default" | "re-export";
    line: number;
}

type ModuleMap = Map<string, ModuleInfo>;

function parse(manifest: FileManifest): Result<ModuleMap, ParserError>;
```

---

## Internal Design

### AST Parser

Uses `ts-morph` to create a TypeScript `Project` and parse source files. ts-morph provides:

- Full TypeScript AST access.
- Built-in module resolution matching the TypeScript compiler.
- Support for `tsconfig.json` path mappings.

**Why ts-morph over raw TypeScript compiler API**: ts-morph provides a higher-level API with convenience methods for navigating imports, exports, and declarations. The raw TS compiler API requires significantly more boilerplate for the same operations.

### Import Resolution

1. For each import declaration, use ts-morph's module resolution to resolve the specifier to an absolute file path.
2. If resolution fails (external package, missing file), record as `unresolvedImport`.
3. External package imports (from `node_modules`) are excluded from the graph — ArchLens analyzes internal architecture only.

### Import Classification

| Source Pattern                 | Classified As |
| ------------------------------ | ------------- |
| `import { x } from './y'`      | `static`      |
| `import('./y')`                | `dynamic`     |
| `import type { X } from './y'` | `type-only`   |
| `export { x } from './y'`      | `re-export`   |
| `import './y'`                 | `side-effect` |

### File Processing

Files are parsed sequentially (MVP). Each file is processed independently — no shared state between file parses. Failed parses (syntax errors) skip the file and log a warning.

---

## Error Cases

| Error             | Cause                               | Handling                                             |
| ----------------- | ----------------------------------- | ---------------------------------------------------- |
| `ParseError`      | File contains unparseable syntax    | Skip file, log warning with path and error, continue |
| `ResolutionError` | Import specifier cannot be resolved | Record as unresolved, continue                       |
| `TsConfigError`   | tsconfig.json is invalid            | Fall back to default compiler options, log warning   |

---

## Dependencies

- `@archlens/types` — `ModuleMap`, `ModuleInfo`, `ImportDeclaration`, `ExportDeclaration` types
- `@archlens/shared` — `Result` type, logging
- `@archlens/scanner` — `FileManifest` type (input)
- `ts-morph` — TypeScript AST parsing and module resolution

---

## Testing Strategy

| Test Type   | Description                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| Unit        | Import classification logic, export extraction                                      |
| Integration | Parse fixture TypeScript files and verify ModuleMap                                 |
| Edge cases  | Circular re-exports, dynamic imports, namespace imports, barrel files, path aliases |

---

_End of RFC-002_
