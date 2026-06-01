# ARCH-004 — Architectural Principles

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | ARCH-004             |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 1 — Foundation |
| Depends On  | ARCH-001, ARCH-003   |

---

## Purpose

Defines the architectural principles that govern all design and implementation decisions in ArchLens. These are binding constraints — any violation requires an explicit exemption documented in an RFC.

---

## Scope

- Structural design principles.
- Data flow principles.
- API design principles.
- Testing and quality principles.
- Extension principles.

---

## Principles

### P1: Unidirectional Dependency Flow

Dependencies between packages flow in one direction — from higher-level orchestration (CLI) down through analysis layers to foundational types. No package may depend on a package above it in the hierarchy.

**Implication**: If `@archlens/graph` needs functionality from `@archlens/analyzer`, the design is wrong. The dependency must be inverted or the shared logic extracted into a lower-level package.

---

### P2: Single Responsibility per Package

Each package owns exactly one responsibility in the Architecture Intelligence Hierarchy (defined in ARCH-001). No package spans multiple hierarchy levels except the CLI (orchestration) and Reporting (output synthesis).

**Implication**: If a package starts doing two unrelated things, it must be split.

---

### P3: Immutable Data Flow

Each pipeline stage receives immutable input and produces new immutable output. No stage mutates data produced by a previous stage. Pipeline state flows forward only.

**Implication**: All inter-stage data structures are read-only. Stages communicate via well-defined types, not shared mutable state.

---

### P4: Explainable Outputs

Every analysis output (score, violation, risk assessment) must include an evidence chain that traces back to specific structural facts. "Architecture score: 72" is insufficient. "Architecture score: 72 because: 3 circular dependency clusters, 12 boundary violations, instability index 0.78 in module X" is required.

**Implication**: Scoring and rule engines must propagate evidence metadata through the entire pipeline.

---

### P5: Configuration Over Convention (with Sensible Defaults)

ArchLens works with zero configuration using sensible defaults. All behavior is overridable through explicit configuration. Convention is the fallback, not the requirement.

**Implication**: Every configurable parameter has a documented default. Configuration is typed (TypeScript config file, not JSON/YAML).

---

### P6: Type Safety at Boundaries

All public APIs between packages are strictly typed. No `any`, no `unknown` at package boundaries. Internal implementation may use pragmatic typing where appropriate, but inter-package contracts are strict.

**Implication**: `@archlens/types` defines all shared types. Package exports are explicitly typed interfaces.

---

### P7: Testability by Design

Every component is designed for testability:

- Pipeline stages accept inputs and produce outputs (pure functions where possible).
- No global state, no singletons, no side effects in analysis logic.
- File system access is confined to the Scanner; all other packages work with abstract representations.

**Implication**: The Analyzer can be tested with a hand-crafted DependencyGraph without touching the file system. The Rule Engine can be tested with a hand-crafted AnalysisResult without running the Analyzer.

---

### P8: Fail Fast, Fail Clearly

Errors are detected as early as possible and reported with maximum context. Silent failures are bugs. Swallowed exceptions are bugs. Every error path produces a message that tells the user what went wrong, where, and what to do about it.

**Implication**: All error types are defined in `@archlens/types`. Error handling strategy is documented in ENG-002.

---

### P9: Determinism

Given identical input (same repository state + same configuration), ArchLens produces identical output. No randomness, no external service calls, no time-dependent behavior in the analysis pipeline.

**Implication**: Timestamps in reports are metadata, not analysis inputs. Analysis logic has no network calls.

---

### P10: Extensibility Through Interfaces, Not Inheritance

Extension points (custom rules, custom scorers, custom formatters, language plugins) are defined as interfaces. Consumers implement interfaces — they do not extend base classes. Composition over inheritance at every level.

**Implication**: The Rule Engine accepts any object satisfying `ArchitectureRule` interface. It does not require extending `BaseRule`.

---

### P11: Minimal External Dependencies

ArchLens minimizes third-party dependencies. Each external dependency must justify its inclusion:

- Does it solve a problem that would take >2 days to implement correctly?
- Is it well-maintained and stable?
- Does it have an acceptable license?
- Can it be replaced without major refactoring?

**Implication**: Utility libraries (lodash, etc.) are not used. Standard library and purpose-built utilities are preferred.

---

### P12: Forward Compatibility

Data structures and output formats are designed for forward compatibility. New fields can be added without breaking existing consumers. Removed fields go through a deprecation cycle.

**Implication**: Output schemas use explicit versioning. Parsers ignore unknown fields.

---

## Principle Interaction Matrix

Principles can tension with each other. This matrix documents known tensions and how to resolve them:

| Tension                                 | Resolution                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| P5 (Configuration) vs. P9 (Determinism) | Configuration is an input. Same config + same repo = same output. Config changes produce different but still deterministic output. |
| P11 (Minimal deps) vs. P7 (Testability) | Testing dependencies (Vitest) are exempt from minimalism. Production dependencies are not.                                         |
| P4 (Explainability) vs. Performance     | Explainability wins. If evidence chain tracking causes overhead, optimize the tracking — do not remove it.                         |
| P10 (Interfaces) vs. P6 (Type safety)   | Interfaces ARE type safety. No tension — they reinforce each other.                                                                |

---

## Decision Log

| ID     | Decision                                   | Rationale                                                      |
| ------ | ------------------------------------------ | -------------------------------------------------------------- |
| DL-014 | 12 binding architectural principles        | Provides decision framework for all implementation choices     |
| DL-015 | Principles are constraints, not guidelines | "Should" is not useful for architecture governance; "must" is  |
| DL-016 | Principle tensions documented explicitly   | Prevents principle-vs-principle disputes during implementation |

---

_End of ARCH-004_
