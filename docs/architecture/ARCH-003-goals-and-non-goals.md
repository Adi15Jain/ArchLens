# ARCH-003 — Goals and Non-Goals

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | ARCH-003             |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 1 — Foundation |
| Depends On  | ARCH-001, ARCH-002   |

---

## Purpose

Defines the explicit goals and non-goals of the ArchLens project. This document serves as the primary filter for feature requests, design decisions, and scope negotiations.

---

## Scope

- Project-level goals (not MVP-specific — see ARCH-005 for MVP boundaries).
- Explicit non-goals to prevent scope creep.
- Success criteria for each goal.

---

## Goals

### G1: Quantify Architecture Quality

Produce numerical scores for architecture dimensions: dependency health, maintainability, scalability, technical debt, and overall architecture quality. Scores must be evidence-based, reproducible, and explainable.

**Success Criteria**: Given any analyzed repository, every score can be traced to specific structural evidence through an evidence chain.

---

### G2: Detect Architectural Violations

Identify violations of architectural constraints — circular dependencies, boundary violations (e.g., domain importing infrastructure), excessive coupling, and dependency direction violations.

**Success Criteria**: Zero false negatives on detectable structural violations. False positive rate below 5% with default rules.

---

### G3: Measure Dependency Health

Analyze the internal dependency graph: circular dependencies, transitive dependency depth, instability index, fan-in/fan-out ratios, and dependency bottlenecks.

**Success Criteria**: Complete dependency graph construction for any TypeScript/JavaScript repository with standard module resolution.

---

### G4: Assess Technical Debt

Quantify technical debt as a function of architectural violations, coupling metrics, boundary degradation, and structural anomalies. Debt should be expressed in actionable terms, not abstract numbers.

**Success Criteria**: Debt assessment identifies specific modules and specific violations contributing to the total.

---

### G5: Evaluate Maintainability

Measure how maintainable the architecture is based on module boundary clarity, coupling/cohesion ratios, change propagation risk, and module independence.

**Success Criteria**: Maintainability score correlates with objective structural metrics, not subjective opinion.

---

### G6: Assess Scalability Risk

Identify architectural patterns that inhibit scalability: dependency bottlenecks, tightly coupled modules, monolithic structures that resist partitioning.

**Success Criteria**: Scalability assessment identifies specific structural barriers with evidence.

---

### G7: Forecast Engineering Risk

Based on structural analysis, identify modules and patterns that are trending toward architectural failure — increasing coupling, degrading boundaries, growing circular dependency clusters.

**Success Criteria**: Risk forecasts are backed by measurable structural trends.

---

### G8: Enable Architecture Governance

Provide enforceable architectural rules that can be integrated into CI/CD pipelines as quality gates. Teams should be able to block merges that violate architectural standards.

**Success Criteria**: CLI exit codes and machine-readable outputs suitable for CI integration.

---

### G9: Produce Human-Readable and Machine-Readable Reports

All analysis results must be available in both human-readable (Markdown) and machine-readable (JSON) formats. CI-specific formats (SARIF) as a future extension.

**Success Criteria**: Every analysis run produces both output formats by default.

---

### G10: Zero-Configuration First Use

A developer should be able to run `npx archlens analyze .` on any TypeScript/JavaScript repository and get meaningful results without any configuration.

**Success Criteria**: First analysis run requires zero setup beyond running the CLI command.

---

## Non-Goals

### NG1: Code-Level Analysis

ArchLens does not analyze code style, function complexity, variable naming, code smells, or any per-line/per-function patterns. This is the domain of linters and static analyzers.

---

### NG2: Code Generation or Modification

ArchLens does not generate code, suggest code changes, scaffold projects, or modify source files. It is a read-only analysis tool.

---

### NG3: AI/ML-Based Analysis in Core Pipeline

The core analysis pipeline does not use machine learning, neural networks, or any probabilistic methods. All analysis is deterministic and explainable. ML may be explored in future extensions with strict explainability requirements.

---

### NG4: Security Vulnerability Detection

ArchLens does not scan for CVEs, security vulnerabilities, or unsafe coding patterns. This is the domain of security scanning tools.

---

### NG5: Runtime Analysis

ArchLens performs static structural analysis only. It does not instrument, profile, or monitor running applications.

---

### NG6: Multi-Language Support in MVP

MVP targets TypeScript/JavaScript only. The architecture is designed for language extensibility, but multi-language support is a post-MVP goal.

---

### NG7: Web UI or Dashboard in MVP

MVP is CLI-only. Web-based visualization and dashboards are future extensions.

---

### NG8: Historical Tracking in MVP

MVP produces point-in-time analysis. Persistent storage and historical trend tracking are post-MVP features.

---

### NG9: Team or Organization Features

ArchLens does not manage teams, roles, permissions, or organizational structures. It analyzes repositories.

---

### NG10: IDE Integration in MVP

IDE extensions and editor integrations are future extensions. MVP is CLI and CI focused.

---

## Decision Log

| ID     | Decision                                           | Rationale                                                                     |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| DL-011 | 10 explicit goals with measurable success criteria | Enables objective evaluation of progress and scope                            |
| DL-012 | 10 explicit non-goals                              | Prevents scope creep; every rejected feature request can reference a non-goal |
| DL-013 | Goals are project-level, not MVP-level             | MVP boundaries are a separate concern (ARCH-005)                              |

---

_End of ARCH-003_
