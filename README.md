<p align="center">
  <h1 align="center">🔬 ArchLens</h1>
  <p align="center">
    <strong>Architecture Intelligence Platform</strong><br/>
    Analyze software repositories for structural quality, dependency health,<br/>and architectural risk — at the module level, not the line level.
  </p>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> •
  <a href="#commands">Commands</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#built-in-rules">Rules</a> •
  <a href="#scoring">Scoring</a> •
  <a href="#development">Development</a>
</p>

---

## What is ArchLens?

**ArchLens** is a CLI-first, CI-integrable architecture analysis tool. Point it at any TypeScript/JavaScript repository and get:

- 🏗️ **Architecture Score** — A single 0–100 grade (A–F) for overall structural quality
- 🔗 **Dependency Health** — Fan-in/fan-out coupling, instability metrics, circular dependency detection
- 🧱 **Boundary Enforcement** — Layer violation detection across module boundaries
- ⚠️ **Violation Reports** — Actionable architectural rule violations with evidence
- 📊 **Risk Assessment** — Bottleneck identification, god module detection, change propagation forecasting
- 📝 **Multi-format Reports** — Console, Markdown, and JSON output for humans and CI pipelines

> **Philosophy:** ArchLens operates at the **module/package/layer** level. It doesn't lint your functions or count your lines — tools like ESLint and SonarQube already do that well. ArchLens answers a different question: _"Is the architecture itself healthy?"_

---

## Quickstart

### Prerequisites

- **Node.js** ≥ 22.0.0
- **pnpm** ≥ 9.15.0

### Install & Build

```bash
git clone https://github.com/Adi15Jain/ArchLens.git
cd ArchLens
pnpm install
pnpm build
```

### Run

```bash
# Analyze the current directory
node packages/cli/dist/index.js analyze .

# Analyze a specific project
node packages/cli/dist/index.js analyze /path/to/your/project

# After global linking (optional)
pnpm archlens analyze .
```

---

## Commands

### `analyze` — Full Architecture Report

Runs the complete pipeline and outputs structural metrics, violations, scores, and risk assessment.

```bash
archlens analyze [dir] [options]
```

| Option        | Description                                               | Default   |
| :------------ | :-------------------------------------------------------- | :-------- |
| `--format`    | Report format: `console`, `markdown`, `json`              | `console` |
| `--output`    | File path to save the report                              | —         |
| `--threshold` | Fail if architecture score falls below this value (0–100) | —         |
| `--exclude`   | Comma-separated glob patterns to ignore                   | —         |
| `--maxFanOut` | Custom maximum fan-out coupling limit                     | —         |
| `--maxDepth`  | Custom maximum dependency depth limit                     | —         |

**Examples:**

```bash
# Console report with a quality gate
archlens analyze ./src --threshold 70

# Markdown report saved to file
archlens analyze . --format markdown --output report.md

# JSON output for CI consumption
archlens analyze . --format json --output archlens-report.json

# Exclude test files and vendor directories
archlens analyze . --exclude "**/*.test.ts,**/vendor/*"
```

### `score` — Score Card Only

Outputs just the architectural score breakdown without the full report.

```bash
archlens score [dir] [--format json|text]
```

**Sample output:**

```
ArchLens Architectural Scores for: /path/to/project
Modules Analyzed: 42
----------------------------------------------------
Overall Architecture Score:  78.3 [Grade C]
Dependency Health Score:     82.1 [Grade B]
Maintainability Score:       74.5 [Grade C]
Technical Debt Score:        71.0 [Grade C]
Scalability Score:           85.6 [Grade B]
----------------------------------------------------
```

### `violations` — Architectural Violations

Lists only rule violations. Returns exit code 1 if architectural errors are found — ideal for CI gates.

```bash
archlens violations [dir] [--exclude patterns] [--failOnError]
```

### `graph` — Dependency Graph

Outputs the full dependency graph as JSON for visualization or further analysis.

```bash
archlens graph [dir]
```

---

## How It Works

ArchLens runs a deterministic, 7-stage analysis pipeline:

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                  ArchLens Pipeline                      │
                    └─────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Scanner  │───▶│  Parser  │───▶│  Graph   │───▶│ Analyzer │───▶│  Rules   │
  │          │    │          │    │  Engine  │    │          │    │  Engine  │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
  Discover files   Parse imports   Build dep       Compute        Evaluate
  in the repo      & exports       graph           metrics &      architectural
                   (ts-morph)                      detect         rules
                                                   patterns
                                                       │
                                        ┌──────────────┤
                                        ▼              ▼
                                  ┌──────────┐   ┌──────────┐
                                  │ Scoring  │   │   Risk   │
                                  │ Engine   │   │ Assessor │
                                  └──────────┘   └──────────┘
                                  Compute         Identify
                                  health scores   structural
                                  (A–F grades)    risks
                                        │              │
                                        └──────┬───────┘
                                               ▼
                                         ┌──────────┐
                                         │Reporting │
                                         │          │
                                         └──────────┘
                                         Console,
                                         Markdown,
                                         JSON output
```

**Stage-by-stage:**

1. **Scanner** — Walks the filesystem, discovers source files, respects exclude patterns
2. **Parser** — Uses [ts-morph](https://ts-morph.com/) to extract imports, exports, and structural relationships from each module
3. **Graph Engine** — Constructs a typed directed dependency graph (`ModuleNode` → `DependencyEdge`)
4. **Analyzer** — Computes per-module metrics (fan-in, fan-out, instability, betweenness centrality), detects cycles via Tarjan's SCC algorithm, and identifies structural patterns (hubs, bottlenecks, god modules, orphans)
5. **Rules Engine** — Evaluates the graph against architectural rules and produces violations with severity and evidence
6. **Scoring Engine** — Aggregates analysis results into five scored dimensions with letter grades
7. **Reporting** — Renders the final output in the requested format

---

## Built-in Rules

| Rule                         | ID                   | Severity | What It Detects                                              |
| :--------------------------- | :------------------- | :------- | :----------------------------------------------------------- |
| **No Circular Dependencies** | `no-circular-deps`   | Error    | Circular import cycles between modules (via Tarjan's SCC)    |
| **Max Fan-Out**              | `max-fan-out`        | Warning  | Modules with excessive outgoing dependencies (high coupling) |
| **Max Depth**                | `max-depth`          | Warning  | Transitive dependency chains exceeding a safe depth          |
| **Boundary Violation**       | `boundary-violation` | Error    | Cross-layer imports that violate architectural boundaries    |
| **Orphan Modules**           | `orphan-modules`     | Warning  | Disconnected modules with no incoming or outgoing edges      |

---

## Scoring

ArchLens produces a **ScoreCard** with five dimensions, each scored 0–100 and graded A–F:

| Score                 | What It Measures                                                                |
| :-------------------- | :------------------------------------------------------------------------------ |
| **Architecture**      | Weighted aggregate of all sub-scores — the single "headline" number             |
| **Dependency Health** | Coupling quality, cycle count, fan-in/fan-out balance, instability distribution |
| **Maintainability**   | Structural clarity, orphan count, god module presence, pattern quality          |
| **Technical Debt**    | Violation severity/density, boundary erosion, SDP violations                    |
| **Scalability**       | Depth limits, bottleneck count, change propagation risk, modular independence   |

**Grade mapping:**

| Score Range | Grade |
| :---------- | :---- |
| 90–100      | A     |
| 80–89       | B     |
| 70–79       | C     |
| 60–69       | D     |
| < 60        | F     |

### CI Quality Gate

Use `--threshold` to enforce a minimum architecture score in CI:

```bash
archlens analyze . --threshold 75 --format json --output report.json
```

This exits with code `1` if the overall architecture score falls below 75, failing your CI pipeline.

---

## Risk Assessment

ArchLens identifies five categories of structural risk:

| Risk Category             | Severity | Description                                                                   |
| :------------------------ | :------- | :---------------------------------------------------------------------------- |
| **Circular Dependencies** | High     | Dependency cycles that prevent independent updates and break modular testing  |
| **Bottlenecks**           | High     | Modules on critical dependency paths where a failure risks global regression  |
| **God Modules**           | Medium   | Modules absorbing excessive imports/exports that become modification hotspots |
| **Boundary Erosion**      | High     | Cross-layer imports that break architectural layering                         |
| **Change Propagation**    | Medium   | High-connectivity hubs where changes ripple across the entire system          |

Each risk includes affected modules, evidence metrics, and a remediation recommendation.

---

## Architecture

ArchLens is a **pnpm monorepo** with 10 packages, managed by **Turborepo** for build orchestration:

```
archLens/
├── packages/
│   ├── types/        # @archlens/types — Shared type definitions (zero-dep foundation)
│   ├── shared/       # @archlens/shared — Utilities, logger, Result type, constants
│   ├── scanner/      # @archlens/scanner — Repository ingestion and file discovery
│   ├── parser/       # @archlens/parser — TypeScript/JS structural parser (ts-morph)
│   ├── graph/        # @archlens/graph — Dependency graph engine & cycle detection
│   ├── analyzer/     # @archlens/analyzer — Metrics, centrality, pattern detection
│   ├── rules/        # @archlens/rules — Architectural rule evaluation engine
│   ├── scoring/      # @archlens/scoring — Score computation & grading
│   ├── reporting/    # @archlens/reporting — Console, Markdown, JSON formatters
│   └── cli/          # @archlens/cli — CLI orchestrator (citty)
├── docs/
│   ├── architecture/ # 15 architecture documents (ARCH-001 → ARCH-014, STACK-001)
│   ├── engineering/  # 6 engineering docs (ENG-001 → ENG-006)
│   ├── governance/   # Architecture governance documents
│   └── rfcs/         # Request for Comments
├── examples/         # Example projects for testing and validation
│   ├── simple-project/
│   └── circular-deps/
├── turbo.json        # Turborepo pipeline configuration
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── vitest.config.ts
```

### Dependency Flow

Dependencies flow strictly in one direction — upstream packages never import from downstream:

```
types → shared → scanner → parser → graph → analyzer → rules → scoring → reporting
                                                                          ↑
                                                                         cli (orchestrator)
```

### Key Design Decisions

- **Module-level analysis only** — No function/class-level analysis; that's a different domain (AD-001)
- **Deterministic output** — Same repo → same graph → same scores → same report, every time
- **Explainability** — Every metric and score is traceable to specific nodes and edges in the dependency graph
- **Documentation-first** — 15 architecture specs + 6 engineering docs written before implementation
- **Result\<T, E\> pattern** — Typed error handling without exceptions throughout the pipeline

---

## Development

### Prerequisites

- Node.js ≥ 22.0.0
- pnpm ≥ 9.15.0

### Setup

```bash
pnpm install
```

### Common Commands

```bash
# Build all packages (respects dependency order via Turborepo)
pnpm build

# Run all tests
pnpm test

# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check

# Clean all build artifacts
pnpm clean
```

### Testing

Tests are written with [Vitest](https://vitest.dev/) and located alongside source code or in `__tests__/` directories:

```bash
# Run all tests
pnpm test

# Run tests for a specific package
cd packages/graph && pnpm test
```

### Tech Stack

| Layer           | Technology                 |
| :-------------- | :------------------------- |
| Language        | TypeScript (strict mode)   |
| Runtime         | Node.js ≥ 22               |
| Package Manager | pnpm 9 with workspaces     |
| Build System    | Turborepo + tsup           |
| Test Framework  | Vitest with V8 coverage    |
| AST Parser      | ts-morph                   |
| CLI Framework   | citty                      |
| Module System   | ESM (dual CJS/ESM exports) |

---

## Documentation

The `docs/` directory contains comprehensive architecture and engineering documentation:

### Architecture Documents (ARCH-001 → ARCH-014)

| Document  | Topic                                               |
| :-------- | :-------------------------------------------------- |
| ARCH-001  | Product Vision, Mission & Infrastructure Philosophy |
| ARCH-002  | Industry Problem Analysis                           |
| ARCH-003  | Goals and Non-Goals                                 |
| ARCH-004  | Architectural Principles                            |
| ARCH-005  | MVP Boundaries                                      |
| ARCH-006  | Engineering Philosophy                              |
| ARCH-007  | High-Level System Architecture                      |
| ARCH-008  | Repository Analysis Pipeline                        |
| ARCH-009  | Dependency Graph Architecture                       |
| ARCH-010  | Architecture Analysis Engine                        |
| ARCH-011  | Rule Engine Architecture                            |
| ARCH-012  | Scoring Engine Design                               |
| ARCH-013  | Risk Forecasting Framework                          |
| ARCH-014  | Reporting Architecture                              |
| STACK-001 | Technology Stack Architecture                       |

### Engineering Documents (ENG-001 → ENG-006)

| Document | Topic                   |
| :------- | :---------------------- |
| ENG-001  | Type System Strategy    |
| ENG-002  | Error Handling Strategy |
| ENG-003  | Testing Strategy        |
| ENG-004  | Build Architecture      |
| ENG-005  | CI/CD Architecture      |
| ENG-006  | Release Strategy        |

---

## License

This project is private and not yet published.

---

<p align="center">
  <sub>Built with a documentation-first philosophy: spec → RFC → engineering doc → implementation → tests.</sub>
</p>
