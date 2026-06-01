# ENG-003 — Testing Strategy

---

## Metadata

| Field       | Value                 |
| ----------- | --------------------- |
| Document ID | ENG-003               |
| Version     | 1.0.0                 |
| Status      | DRAFT                 |
| Owner       | ArchLens Core Team    |
| Created     | 2026-06-02            |
| Phase       | Phase 4 — Engineering |
| Depends On  | ARCH-004, ARCH-006    |

---

## Purpose

Defines the testing strategy for ArchLens — test types, organization, tooling, coverage expectations, and fixture design.

---

## Testing Framework

**Vitest** — chosen for:

- Native TypeScript support (no separate compilation step).
- ESM-first design (matches ArchLens's module format).
- Fast execution with watch mode.
- Compatible with Turborepo task caching.

---

## Test Types

### Unit Tests

Test individual functions and modules in isolation.

- **Location**: Co-located with source (`*.test.ts` next to `*.ts`).
- **Dependencies**: None beyond the module under test and types.
- **Mocking**: Minimal. Prefer fixtures and real data structures over mocks.
- **Coverage target**: 90%+ for core logic (metrics, scoring, rules).

### Integration Tests

Test a pipeline stage end-to-end with realistic inputs.

- **Location**: `__tests__/` directory within each package.
- **Dependencies**: May depend on upstream packages (e.g., parser integration test uses scanner output).
- **Fixtures**: Fixture TypeScript projects in `examples/` directory.

### End-to-End Tests

Test the full CLI pipeline from command invocation to output and exit code.

- **Location**: `packages/cli/__tests__/e2e/`.
- **Execution**: Run `archlens analyze` as a subprocess against fixture projects.
- **Verification**: Correct exit code, output format, and key values in output.

### Property Tests

Test invariants that must hold for all inputs.

- **Examples**:
    - Scores are always in [0, 100].
    - Instability is always in [0, 1].
    - Fan-in and fan-out are non-negative.
    - Cycle detection finds all SCCs.
    - Determinism: same input always produces same output.

---

## Test Organization

```
packages/<name>/
├── src/
│   ├── feature.ts
│   └── feature.test.ts        # Unit tests (co-located)
└── __tests__/
    ├── integration/            # Integration tests
    └── fixtures/               # Package-specific fixtures
```

```
examples/                       # Shared fixture repositories
├── simple-project/             # Basic TS project, no issues
├── circular-deps/              # Project with circular dependencies
├── high-coupling/              # Project with high coupling
├── clean-architecture/         # Well-structured project (should score high)
└── mixed-issues/               # Project with multiple violations
```

---

## Fixture Design

Fixtures are small, purpose-built TypeScript projects that exercise specific analysis scenarios:

| Fixture              | Purpose                             | Expected Behavior                                   |
| -------------------- | ----------------------------------- | --------------------------------------------------- |
| `simple-project`     | 5–10 files, clean structure         | High scores, no violations                          |
| `circular-deps`      | Contains known cycles               | Cycle detection triggers, dependency health penalty |
| `high-coupling`      | Modules with 20+ fan-out            | Fan-out warnings, maintainability penalty           |
| `clean-architecture` | Layered architecture, no violations | High scores across all dimensions                   |
| `mixed-issues`       | Multiple violation types            | Comprehensive output for E2E testing                |

Fixtures are committed to the repository and are version-controlled. Changes to fixtures require corresponding test updates.

---

## Test Naming Convention

Tests describe behavior, not implementation:

```typescript
// Good
describe('detectCycles', () => {
  it('detects a cycle between two modules', () => { ... });
  it('detects a cycle spanning three modules', () => { ... });
  it('returns empty array for acyclic graph', () => { ... });
});

// Bad
describe('detectCycles', () => {
  it('test case 1', () => { ... });
  it('works correctly', () => { ... });
});
```

---

## CI Integration

- All tests run on every PR via GitHub Actions.
- Tests must pass before merge — no exceptions.
- Turborepo caches test results — unchanged packages skip test re-execution.
- Test results are reported in PR checks.

---

## Decision Log

| ID     | Decision                      | Rationale                                        |
| ------ | ----------------------------- | ------------------------------------------------ |
| DL-071 | Vitest as test framework      | TypeScript-native, ESM-first, fast               |
| DL-072 | Co-located unit tests         | Reduces friction; test lives next to code        |
| DL-073 | Fixtures over mocks           | Real data structures produce more reliable tests |
| DL-074 | Property tests for invariants | Catches edge cases that example-based tests miss |
| DL-075 | 90%+ coverage for core logic  | Core scoring/analysis must be thoroughly tested  |

---

_End of ENG-003_
