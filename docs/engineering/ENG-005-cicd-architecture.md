# ENG-005 — CI/CD Architecture

---

## Metadata

| Field       | Value                 |
| ----------- | --------------------- |
| Document ID | ENG-005               |
| Version     | 1.0.0                 |
| Status      | DRAFT                 |
| Owner       | ArchLens Core Team    |
| Created     | 2026-06-02            |
| Phase       | Phase 4 — Engineering |
| Depends On  | ENG-003, ENG-004      |

---

## Purpose

Defines the CI/CD pipeline architecture — automated build, test, lint, and release workflows.

---

## Platform

**GitHub Actions** — integrated with GitHub repository, no external CI service dependency.

---

## Workflows

### 1. PR Validation (`ci.yml`)

Runs on every pull request to `main`.

```yaml
Jobs: 1. Install dependencies (pnpm install)
    2. Build all packages (turbo build)
    3. Type check (turbo typecheck)
    4. Lint (turbo lint)
    5. Test (turbo test)
    6. Dogfood (run archlens analyze on itself, verify no regressions)
```

**Caching**: pnpm store and Turborepo cache are cached between runs using GitHub Actions cache.

**Dogfood step**: Runs ArchLens on its own repository and verifies:

- Exit code 0 (or above minimum threshold).
- No new error-severity violations compared to main branch.

---

### 2. Release (`release.yml`)

Runs when a PR created by Changesets is merged to `main`.

```yaml
Jobs: 1. Install and build
    2. Run all tests
    3. Publish changed packages to npm (via Changesets)
    4. Create GitHub release with changelog
    5. Tag release
```

---

### 3. Nightly (`nightly.yml`)

Runs on schedule (daily) against `main`.

```yaml
Jobs: 1. Full build + test (no cache, clean environment)
    2. Full E2E test suite (including slow tests)
    3. Report status to team
```

Purpose: Catch flaky tests and environment-dependent issues that PR caching might mask.

---

## Branch Strategy

| Branch   | Purpose                                 |
| -------- | --------------------------------------- |
| `main`   | Production-ready, always shippable      |
| `feat/*` | Feature branches (short-lived, <3 days) |
| `fix/*`  | Bug fix branches                        |
| `docs/*` | Documentation-only changes              |

All branches merge to `main` via PR. No direct commits to `main`.

---

## Quality Gates

A PR cannot be merged unless:

1. ✅ All CI jobs pass (build, typecheck, lint, test).
2. ✅ At least one approval from a core contributor.
3. ✅ No new error-severity ArchLens violations (dogfood).
4. ✅ Changeset included (if package code changed).

---

## Decision Log

| ID     | Decision                               | Rationale                                       |
| ------ | -------------------------------------- | ----------------------------------------------- |
| DL-080 | GitHub Actions as sole CI platform     | Integrated with repository, no external service |
| DL-081 | Dogfood step in PR validation          | ArchLens must pass its own analysis             |
| DL-082 | Nightly full rebuild without cache     | Catches caching-masked issues                   |
| DL-083 | Changeset required for package changes | Ensures changelog and version management        |

---

_End of ENG-005_
