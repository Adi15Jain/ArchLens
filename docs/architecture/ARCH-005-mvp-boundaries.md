# ARCH-005 — MVP Boundaries

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | ARCH-005             |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 1 — Foundation |
| Depends On  | ARCH-001, ARCH-003   |

---

## Purpose

Defines the exact scope of the ArchLens MVP — what is included, what is deferred, and the rationale for each boundary decision.

---

## Scope

- MVP feature inclusions with acceptance criteria.
- MVP feature exclusions with deferral rationale.
- MVP constraints and limitations.

---

## MVP Definition

The MVP is the minimum version of ArchLens that delivers actionable architecture intelligence for a TypeScript/JavaScript repository from the command line.

**MVP success condition**: A developer runs `npx archlens analyze .` on a TypeScript project and receives a meaningful architecture health report with scores, violations, and actionable findings — within 60 seconds for a repository of up to 500 files.

---

## MVP Inclusions

### 1. Repository Scanning

| Aspect     | Specification                                                       |
| ---------- | ------------------------------------------------------------------- |
| Input      | Local file system path                                              |
| Languages  | TypeScript, JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)               |
| Exclusions | `node_modules`, `.git`, `dist`, `build`, configurable via CLI flags |
| Output     | File manifest with metadata                                         |

---

### 2. Structural Parsing

| Aspect            | Specification                                                         |
| ----------------- | --------------------------------------------------------------------- |
| Parser            | TypeScript AST via ts-morph                                           |
| Extracts          | Import declarations, export declarations, re-exports, dynamic imports |
| Module resolution | Node.js standard resolution (relative paths, package imports)         |
| Output            | Module map with per-file structural data                              |

---

### 3. Dependency Graph Construction

| Aspect           | Specification                                                                         |
| ---------------- | ------------------------------------------------------------------------------------- |
| Nodes            | Files and packages/directories (configurable granularity)                             |
| Edges            | Import relationships with type classification (static, dynamic, type-only, re-export) |
| Graph operations | Cycle detection, transitive closure, subgraph extraction                              |
| Output           | Typed directed graph                                                                  |

---

### 4. Architecture Analysis

| Metric                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| Circular dependencies  | Count and identification of all dependency cycles  |
| Fan-in / Fan-out       | Per-module incoming and outgoing dependency counts |
| Instability index      | Ce / (Ca + Ce) per module                          |
| Coupling metrics       | Afferent coupling (Ca), efferent coupling (Ce)     |
| Module depth           | Maximum dependency chain length                    |
| Dependency bottlenecks | Modules with disproportionate fan-in               |

---

### 5. Rule Engine (Default Rules)

| Rule                     | Severity | Description                                                       |
| ------------------------ | -------- | ----------------------------------------------------------------- |
| No circular dependencies | Error    | Detects cycles in the dependency graph                            |
| Maximum fan-out          | Warning  | Flags modules exceeding a configurable fan-out threshold          |
| Maximum dependency depth | Warning  | Flags dependency chains exceeding a configurable depth            |
| Boundary violations      | Error    | Detects imports crossing configured architectural boundaries      |
| Orphan modules           | Info     | Detects modules with zero incoming and zero outgoing dependencies |

---

### 6. Scoring

| Score                   | Description                                              | Range |
| ----------------------- | -------------------------------------------------------- | ----- |
| Architecture Score      | Aggregate of all dimensional scores                      | 0–100 |
| Dependency Health Score | Based on cycle count, depth, instability distribution    | 0–100 |
| Maintainability Score   | Based on coupling, cohesion proxies, boundary clarity    | 0–100 |
| Technical Debt Score    | Inverse function of violation count weighted by severity | 0–100 |
| Scalability Score       | Based on module independence, bottleneck concentration   | 0–100 |

All scores include evidence chains explaining the contributing factors.

---

### 7. Reporting

| Format   | Description                                                 |
| -------- | ----------------------------------------------------------- |
| Markdown | Human-readable report with scores, violations, and findings |
| JSON     | Machine-readable structured output                          |
| Console  | Summarized terminal output with color-coded severity        |

---

### 8. CLI

| Command                      | Description                       |
| ---------------------------- | --------------------------------- |
| `archlens analyze <path>`    | Run full analysis on a repository |
| `archlens score <path>`      | Output scores only                |
| `archlens violations <path>` | Output violations only            |
| `archlens graph <path>`      | Output dependency graph           |

| Flag                                 | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| `--format <json\|markdown\|console>` | Output format                                       |
| `--output <path>`                    | Write report to file                                |
| `--exclude <patterns>`               | Additional exclusion patterns                       |
| `--threshold <n>`                    | Fail with exit code 1 if architecture score below n |

---

## MVP Exclusions

| Feature                                   | Deferred To | Rationale                                                      |
| ----------------------------------------- | ----------- | -------------------------------------------------------------- |
| Configuration file (`archlens.config.ts`) | Post-MVP    | CLI flags sufficient for MVP; config file adds complexity      |
| Custom rules                              | Post-MVP    | Default rules provide value; custom rule API needs design time |
| Historical tracking                       | Post-MVP    | Requires persistent storage; MVP is stateless                  |
| Risk forecasting                          | Post-MVP    | Requires historical data that MVP doesn't persist              |
| Web dashboard                             | Post-MVP    | CLI-first; web adds significant development scope              |
| Multi-language support                    | Post-MVP    | TypeScript/JavaScript first for depth                          |
| SARIF output                              | Post-MVP    | JSON and Markdown sufficient for MVP                           |
| IDE integration                           | Post-MVP    | Separate development effort                                    |
| Architecture diff (branch comparison)     | Post-MVP    | Requires git integration and historical context                |
| Fix suggestions                           | Post-MVP    | Report findings only; suggestions add maintenance burden       |

---

## MVP Constraints

| Constraint              | Value                            | Rationale                            |
| ----------------------- | -------------------------------- | ------------------------------------ |
| Maximum repository size | ~500 source files                | Performance optimization is post-MVP |
| Language support        | TypeScript/JavaScript only       | Depth before breadth                 |
| Configuration           | CLI flags only                   | Simplicity for first use             |
| Storage                 | None (stateless, no persistence) | Reduces complexity                   |
| Network                 | None (fully offline)             | Local-first principle                |
| Output                  | Console + file                   | No server, no UI                     |

---

## Decision Log

| ID     | Decision                              | Rationale                                                   |
| ------ | ------------------------------------- | ----------------------------------------------------------- |
| DL-017 | MVP includes 5 scoring dimensions     | Covers the core value proposition without over-engineering  |
| DL-018 | MVP is stateless (no persistence)     | Reduces scope; historical features require design           |
| DL-019 | MVP has 5 default rules               | Enough to demonstrate governance; extensibility comes later |
| DL-020 | 500-file limit accepted for MVP       | Performance optimization deferred; most projects fit this   |
| DL-021 | CLI flags only, no config file in MVP | Zero-config first-use principle; config file is post-MVP    |

---

_End of ARCH-005_
