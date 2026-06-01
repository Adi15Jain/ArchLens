# GOV-002 — Coding Standards

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | GOV-002              |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 5 — Governance |
| Depends On  | ARCH-004, ARCH-006   |

---

## Purpose

Defines enforceable coding standards for all ArchLens source code.

---

## TypeScript

### Compiler Settings

- `strict: true` — non-negotiable.
- `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`.
- `exactOptionalPropertyTypes: true` — `undefined` is not assignable to optional properties.
- `noImplicitReturns: true` — all code paths must return.

### Type Usage

| Rule                                         | Example                                        |
| -------------------------------------------- | ---------------------------------------------- |
| No `any` in public APIs                      | Use `unknown` with type narrowing              |
| Explicit return types on exports             | `function foo(): Result<Bar, Err>`             |
| Readonly for shared data                     | `readonly` properties, `ReadonlyArray`         |
| Discriminated unions over class hierarchies  | `type Error = { code: 'A' } \| { code: 'B' }`  |
| `as const` over enums                        | `const SEVERITY = { error: 'error' } as const` |
| No type assertions (`as`) unless unavoidable | Document with `// SAFETY:` comment when used   |

### Naming

| Construct           | Convention                                     |
| ------------------- | ---------------------------------------------- |
| Files               | `kebab-case.ts`                                |
| Types/Interfaces    | `PascalCase`                                   |
| Functions/Variables | `camelCase`                                    |
| Constants           | `UPPER_SNAKE_CASE`                             |
| Booleans            | `is`/`has`/`should` prefix                     |
| Private fields      | No underscore prefix; use TypeScript `private` |

---

## Code Organization

### File Rules

- One primary export per file (exceptions: utility files with multiple related helpers).
- File name matches primary export: `dependency-graph.ts` exports `DependencyGraph`.
- Max file length: 300 lines (soft limit). If longer, consider splitting.
- Imports ordered: external → `@archlens/*` → relative.

### Package Rules

- `index.ts` is the only entry point — it re-exports the public API.
- Internal modules are not importable from outside the package.
- No cross-package imports of internal modules.

---

## Formatting

**Prettier** with the following configuration:

```json
{
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2,
    "arrowParens": "always"
}
```

Formatting is enforced in CI. No formatting debates in code review.

---

## Linting

**ESLint** with TypeScript-aware rules:

Key rules:

- `no-explicit-any`: error
- `no-unused-vars`: error (with underscore exception for unused params)
- `no-console`: warn (console usage is through the Logger)
- `prefer-const`: error
- `no-var`: error
- `eqeqeq`: error (always use `===`)

---

## Comments and Documentation

### When to Comment

- **Why, not what**: Comments explain rationale, not mechanics.
- **Public API**: Every exported function has a JSDoc comment describing parameters, return value, and behavior.
- **Complex algorithms**: Step-by-step explanation (e.g., Tarjan's SCC).
- **Workarounds**: `// WORKAROUND:` prefix with link to issue.
- **Safety**: `// SAFETY:` prefix when using type assertions or other unsafe operations.

### When NOT to Comment

- Self-explanatory code.
- Implementation details that are obvious from the code.
- TODO comments without issue links (create an issue instead).

---

## Decision Log

| ID     | Decision                                  | Rationale                                        |
| ------ | ----------------------------------------- | ------------------------------------------------ |
| DL-091 | Prettier for formatting, ESLint for logic | Separate tools for separate concerns; no overlap |
| DL-092 | 300-line soft limit per file              | Encourages modularity without being rigid        |
| DL-093 | JSDoc on all public exports               | Public API is documented at the code level       |
| DL-094 | No TODO without issue link                | Prevents accumulation of untracked work          |

---

_End of GOV-002_
