# ARCH-006 — Engineering Philosophy

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | ARCH-006             |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 1 — Foundation |
| Depends On  | ARCH-001, ARCH-004   |

---

## Purpose

Defines the engineering culture, practices, and standards that govern how ArchLens is built. While ARCH-004 defines architectural principles (structural constraints), this document defines engineering philosophy (how the team works).

---

## Scope

- Development workflow philosophy.
- Code quality expectations.
- Decision-making framework.
- Engineering values and their priority order.

---

## Engineering Values (Priority Order)

When values conflict, the higher-priority value wins:

1. **Correctness** — Incorrect analysis is worse than no analysis.
2. **Clarity** — Code and architecture that cannot be understood cannot be maintained.
3. **Simplicity** — The simplest solution that meets requirements is the best solution.
4. **Performance** — Fast is good, but not at the cost of correctness or clarity.
5. **Velocity** — Shipping quickly matters, but not at the cost of the above.

---

## Development Workflow

### Documentation-First

```
Problem Statement → Design Document → Review → Implementation → Tests → Documentation Update
```

No implementation begins without a reviewed design. For significant features, this means an RFC. For smaller changes, an inline design comment in the PR is sufficient.

**Threshold for RFC**: Any change that modifies a public API, adds a new package, changes scoring methodology, or modifies the analysis pipeline requires an RFC.

### Trunk-Based Development

- Main branch is always shippable.
- Feature branches are short-lived (<3 days).
- PRs are small and focused (single concern per PR).
- CI passes before merge; no exceptions.

### Review Standards

Every PR requires:

- At least one approval from a core contributor.
- All CI checks passing.
- No increase in ArchLens's own violation count (dogfooding).
- Test coverage for new logic.

---

## Code Quality Expectations

### TypeScript Standards

- Strict mode enabled (`"strict": true` in tsconfig).
- No `any` in public APIs. `unknown` with type narrowing preferred.
- Explicit return types on exported functions.
- Readonly types for immutable data structures.
- Discriminated unions for variant types.
- No enums — use `as const` objects with string literal types.

### Naming Conventions

| Construct      | Convention             | Example                       |
| -------------- | ---------------------- | ----------------------------- |
| Package        | `@archlens/kebab-case` | `@archlens/graph`             |
| File           | `kebab-case.ts`        | `dependency-graph.ts`         |
| Type/Interface | `PascalCase`           | `DependencyGraph`             |
| Function       | `camelCase`            | `buildGraph`                  |
| Constant       | `UPPER_SNAKE_CASE`     | `MAX_DEPTH`                   |
| Boolean        | `is/has/should` prefix | `isCircular`, `hasViolations` |

### Error Handling

- Functions that can fail return `Result<T, E>` types — not thrown exceptions — for expected failure modes.
- Exceptions are reserved for programmer errors (bugs), not user-facing error conditions.
- Every error carries context: what went wrong, where, and how to resolve.

### Testing

- Every public function has tests.
- Tests are co-located with source (`*.test.ts` adjacent to `*.ts`).
- Test names describe behavior, not implementation: `"detects circular dependency between three modules"`, not `"test findCycles method"`.
- Fixtures over mocks. Real data structures over fake objects.

---

## Decision-Making Framework

### For Technical Decisions

1. Does it align with the architectural principles (ARCH-004)?
2. Does it serve the goals (ARCH-003)?
3. Is it the simplest solution that meets requirements?
4. Can it be explained to a new contributor in under 5 minutes?
5. Does it keep the dependency graph clean?

If the answer to any of (1), (2) is no — reject.
If the answer to (3), (4), or (5) is no — redesign.

### For Scope Decisions

1. Is it in the MVP inclusions (ARCH-005)?
2. Is it explicitly a non-goal (ARCH-003)?
3. Does it serve the mission (ARCH-001)?

If (2) is yes — reject.
If (1) is yes — proceed.
If (1) is no and (3) is yes — defer to post-MVP backlog.
If (3) is no — reject.

---

## Engineering Reasoning Over Hype

ArchLens does not adopt technologies, patterns, or methodologies because they are popular. Every choice requires engineering justification:

- **"Why TypeScript?"** — Because the MVP targets TypeScript repositories, and analyzing TypeScript with TypeScript enables leveraging ts-morph for AST parsing. Not because TypeScript is trendy.
- **"Why Turborepo?"** — Because ArchLens is a monorepo with multiple packages, and Turborepo provides efficient task orchestration with caching. Not because monorepos are fashionable.
- **"Why not AI/ML?"** — Because deterministic, explainable analysis is a product requirement. Not because ML is bad, but because it violates the explainability principle for this use case.

Every technical choice in ArchLens documentation and code should be accompanied by a "because" — the engineering rationale.

---

## Ownership and Responsibility

- **Package owners**: Each package has a designated owner responsible for its API design, test coverage, and architectural integrity.
- **Breaking changes**: Any breaking change to a public API requires the owning engineer to update all dependent packages and documentation.
- **Technical debt**: Technical debt is tracked as ArchLens violations against itself. Debt is not allowed to accumulate silently.

---

## Decision Log

| ID     | Decision                                                                    | Rationale                                                                                |
| ------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| DL-022 | Priority order: Correctness > Clarity > Simplicity > Performance > Velocity | Establishes clear tiebreaker for conflicting engineering concerns                        |
| DL-023 | Documentation-first with RFC threshold                                      | Prevents undocumented design decisions; threshold prevents bureaucracy for small changes |
| DL-024 | No `any` in public APIs, no enums, Result types for errors                  | Type safety and explicitness are architectural principles applied to code                |
| DL-025 | Engineering reasoning required for every technical choice                   | Prevents hype-driven decision making                                                     |

---

_End of ARCH-006_
