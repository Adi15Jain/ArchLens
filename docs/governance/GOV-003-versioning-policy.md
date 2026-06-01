# GOV-003 — Versioning Policy

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | GOV-003              |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 5 — Governance |
| Depends On  | ENG-006              |

---

## Purpose

Defines the versioning policy for ArchLens packages — what constitutes a breaking change, how versions are coordinated across the monorepo, and stability guarantees.

---

## SemVer Compliance

All packages follow Semantic Versioning 2.0.0: `MAJOR.MINOR.PATCH`.

---

## What Constitutes a Breaking Change (Major Bump)

| Change Type                                      | Breaking? | Rationale                                                |
| ------------------------------------------------ | --------- | -------------------------------------------------------- |
| Remove a public export                           | Yes       | Downstream code will fail to compile                     |
| Change a public function signature               | Yes       | Downstream code will fail to compile                     |
| Change scoring formula weights                   | Yes       | CI thresholds may break; scores are part of the contract |
| Change JSON output schema (remove/rename fields) | Yes       | Downstream tools parsing JSON will break                 |
| Change exit code semantics                       | Yes       | CI scripts depend on exit codes                          |
| Change default rule severity                     | Yes       | May break CI quality gates                               |
| Add a new optional field to output               | No        | Additive change, backward compatible                     |
| Add a new rule (default off)                     | No        | No change to existing behavior                           |
| Add a new CLI command                            | No        | Existing commands unchanged                              |
| Add a new scoring dimension                      | Minor     | Additive but significant; minor bump                     |
| Fix a bug in scoring calculation                 | Patch     | Corrects incorrect behavior                              |
| Internal refactoring                             | Patch     | No public API change                                     |

---

## Version Coordination

Packages are versioned independently. A change to `@archlens/graph` does not force a version bump in `@archlens/cli` unless CLI's code or API changes.

However, **peer dependency ranges** ensure compatibility:

- If `@archlens/analyzer@0.3.0` depends on `@archlens/graph@^0.2.0`, it works with any `0.2.x` version of graph.
- If graph makes a breaking change (0.3.0), analyzer must be updated and released with the new dependency.

---

## Stability Tiers

| Tier        | Version Range | Guarantee                                   |
| ----------- | ------------- | ------------------------------------------- |
| Unstable    | `0.0.x`       | API may change at any time                  |
| Development | `0.x.y`       | Minor bumps may break; patch bumps are safe |
| Stable      | `≥1.0.0`      | Full SemVer guarantees                      |

**Current tier**: Development (`0.x`). All packages start at `0.1.0`.

**Path to 1.0**: A package reaches 1.0 when:

1. Its public API has been stable for 3+ months.
2. Its scoring/rule methodology has been validated.
3. It has comprehensive test coverage.
4. It has been used in production by at least 3 external projects.

---

## Deprecation Policy

1. Deprecated features are marked with `@deprecated` JSDoc tag.
2. Deprecation warning is logged at runtime (if applicable).
3. Deprecated features are removed in the next major version.
4. Minimum deprecation window: 1 minor version (feature is deprecated in x.y, removed in x+1.0).

---

## Decision Log

| ID     | Decision                             | Rationale                                                    |
| ------ | ------------------------------------ | ------------------------------------------------------------ |
| DL-095 | Scoring formula changes are breaking | CI thresholds depend on score stability                      |
| DL-096 | Independent package versioning       | Avoids unnecessary version bumps across unrelated packages   |
| DL-097 | All packages start at 0.1.0          | Communicates development status; no false stability promises |
| DL-098 | 4 criteria for 1.0 graduation        | Ensures genuine stability, not arbitrary milestone           |

---

_End of GOV-003_
