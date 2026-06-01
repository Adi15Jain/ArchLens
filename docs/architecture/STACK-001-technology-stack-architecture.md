# STACK-001 — ArchLens Technology Stack Architecture

---

## Metadata

| Field       | Value              |
| ----------- | ------------------ |
| Document ID | STACK-001          |
| Version     | 1.0.0              |
| Status      | DRAFT              |
| Owner       | ArchLens Core Team |
| Created     | 2026-06-02         |
| Phase       | Pre-Implementation |

---

## 1. Technology Strategy

### Philosophy

ArchLens's stack is selected under three governing constraints:

1. **TypeScript everywhere** — a single language across CLI, backend, frontend, and analysis engine. This eliminates context switching, enables shared types across the full stack, and allows the analysis engine (which targets TypeScript repos first) to dogfood its own runtime.

2. **Start local, grow distributed** — MVP runs entirely on a developer's machine with zero infrastructure. V2 introduces persistence and a web layer. V3 scales to multi-repo, team, and CI-integrated workflows. The stack must support this progression without rewrites.

3. **Own the core, outsource the commodity** — ArchLens builds its own graph engine, analyzer, rule engine, and scorer (these are the product). It uses battle-tested libraries for parsing, HTTP, UI, and infrastructure (these are commodities).

### Evolution Model

```
MVP (Local CLI)           → V2 (CLI + Web + Persistence)     → V3 (Platform)
No server, no database       Local server, SQLite/PostgreSQL    Multi-repo, GitHub, CI
File-system only              Web dashboard, API                 Teams, history, forecasting
```

Every technology choice must be valid across all three stages or be explicitly scoped to one stage with a documented migration path.

---

## 2. Frontend Architecture

> Applicable from V2 onwards. MVP is CLI-only.

### Framework: Next.js (App Router)

**Why**:

- Server-side rendering for performance and SEO on documentation/report pages.
- API routes co-located with frontend — no separate backend service in V2.
- React Server Components reduce client-side JavaScript for data-heavy dashboard pages.
- File-based routing reduces boilerplate.
- Mature ecosystem, massive community, production-proven at scale.

**Alternatives considered**:

| Alternative      | Why rejected                                                               |
| ---------------- | -------------------------------------------------------------------------- |
| Vite + React SPA | No SSR, no API routes. Would need a separate backend from day one.         |
| Remix            | Smaller ecosystem, less community adoption. Viable but higher risk.        |
| Astro            | Excellent for static content but ArchLens dashboard is highly interactive. |
| SvelteKit        | Smaller ecosystem, fewer UI component libraries, harder to hire for.       |
| Angular          | Heavier, more opinionated, smaller modern open-source community.           |

**Scalability**: Next.js scales from a single-developer local dashboard to a deployed SaaS. The App Router's server component model handles large data sets (dependency graphs with thousands of nodes) without shipping all data to the client.

---

### Styling: Tailwind CSS v4

**Why**:

- Utility-first approach accelerates UI development.
- Design tokens via CSS variables integrate with component libraries.
- Zero-runtime CSS — no JS-in-CSS performance overhead.
- v4's CSS-first configuration is simpler and more standard.
- Dominant adoption in the React/Next.js ecosystem.

**Alternatives considered**:

| Alternative       | Why rejected                                                              |
| ----------------- | ------------------------------------------------------------------------- |
| Vanilla CSS       | Slower development velocity for complex dashboards.                       |
| CSS Modules       | More boilerplate, less design system consistency.                         |
| styled-components | Runtime CSS-in-JS, performance overhead, React 19 compatibility concerns. |
| Panda CSS         | Newer, smaller ecosystem. Promising but higher risk.                      |

---

### Component Library: shadcn/ui

**Why**:

- Copy-paste components, not a dependency — full control over source code.
- Built on Radix UI primitives — accessible, composable, headless.
- Tailwind-native — integrates perfectly with the styling choice.
- Highly customizable — ArchLens can build a distinctive design system on top.
- No version lock-in — components are owned, not imported.

**Alternatives considered**:

| Alternative       | Why rejected                                                                   |
| ----------------- | ------------------------------------------------------------------------------ |
| Material UI       | Heavy bundle, opinionated design, harder to customize.                         |
| Chakra UI         | Good but tightly coupled as a dependency; less control.                        |
| Radix UI (direct) | Lower-level; shadcn/ui provides the styled layer on top.                       |
| Ant Design        | Enterprise-focused design language doesn't fit open-source platform aesthetic. |

---

### State Management: Zustand + TanStack Query

**Why**:

- **Zustand** for client-side UI state (active filters, selected modules, view preferences). Minimal API, tiny bundle, no boilerplate.
- **TanStack Query** for server state (analysis results, scores, violation data). Handles caching, background refetching, optimistic updates, and loading/error states.
- This separation (client state vs. server state) is the modern best practice.

**Alternatives considered**:

| Alternative         | Why rejected                                                         |
| ------------------- | -------------------------------------------------------------------- |
| Redux Toolkit       | More boilerplate, heavier for this use case.                         |
| Jotai               | Atomic model is good but less intuitive for larger state trees.      |
| React Context alone | Causes unnecessary re-renders at scale. Not suitable for dashboards. |

---

### Visualization: D3.js + Recharts

**Why**:

- **D3.js** for custom graph visualizations (dependency graphs, architecture diagrams). D3 is the only library with enough low-level control for interactive, force-directed graph layouts with thousands of nodes.
- **Recharts** for standard charts (score trends, metric distributions, violation breakdowns). Built on D3 but provides React component abstractions for common chart types.

**Alternatives considered**:

| Alternative     | Why rejected                                                |
| --------------- | ----------------------------------------------------------- |
| Chart.js        | Canvas-based, less customizable for complex graph layouts.  |
| Nivo            | Beautiful but less control for custom graph visualizations. |
| Victory         | Smaller ecosystem, less maintained.                         |
| Observable Plot | Newer, less React integration.                              |

---

### Graph Visualization: React Flow

**Why**:

- Purpose-built for interactive node-graph UIs in React.
- Supports custom nodes, edges, layouts, and interactions.
- Performant with large graphs (virtualization, viewport culling).
- Active development, strong community.
- Perfect for visualizing dependency graphs and architecture diagrams interactively.

**Alternatives considered**:

| Alternative              | Why rejected                                                          |
| ------------------------ | --------------------------------------------------------------------- |
| Cytoscape.js             | Powerful but no native React integration. Wrapper libraries are thin. |
| vis.js                   | Less maintained, older API design.                                    |
| Sigma.js                 | WebGL-based, fast for huge graphs but less React-friendly.            |
| D3 force layout directly | Lower-level; React Flow provides the interaction layer D3 lacks.      |

**Future consideration**: For repositories with 10,000+ modules, WebGL-based rendering (Sigma.js or custom) may be needed. React Flow handles up to ~5,000 nodes well.

---

## 3. Backend Architecture

### Runtime: Node.js (LTS)

**Why**: TypeScript everywhere. Node.js is the native runtime for TypeScript. The analysis engine uses ts-morph which requires Node.js. No benefit to introducing a second runtime.

### Language: TypeScript (Strict Mode)

**Why**: Defined in ARCH-004. Shared types across CLI, analysis engine, API, and frontend.

### Framework (V2+): Hono

**Why**:

- Ultra-lightweight, fast HTTP framework.
- Runs on Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge — maximum deployment flexibility.
- TypeScript-first with excellent type inference for routes.
- Middleware-based, composable.
- Tiny footprint — doesn't impose opinions beyond HTTP handling.
- When deployed behind Next.js API routes, Hono handles the API layer within Next.js.

**Alternatives considered**:

| Alternative              | Why rejected                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Express                  | Aging, callback-based, weak TypeScript support.                                                                |
| Fastify                  | Good but heavier than needed. Plugin system adds complexity.                                                   |
| tRPC                     | Excellent for type-safe APIs but couples client and server tightly. Viable as a complement, not a replacement. |
| Next.js API routes alone | Sufficient for V2 but not portable if ArchLens needs a standalone API server later.                            |

**Strategy**: V2 uses Next.js API routes with Hono as the router inside them. V3 can extract Hono to a standalone server if needed, with zero route rewrite.

### Background Processing: BullMQ (V2+)

**Why**:

- Redis-backed job queue for background analysis tasks.
- Needed when analysis moves from synchronous CLI to async web-triggered.
- Supports retries, priorities, progress tracking, and concurrency control.
- Battle-tested in production Node.js systems.

**Alternative**: Start with simple in-process async for V2, graduate to BullMQ when concurrent analysis or scheduling is needed.

### API Strategy: REST + JSON

**Why**:

- Universal client compatibility (curl, fetch, any language).
- Simple to cache and debug.
- Analysis results are document-shaped (scores, violations, reports) — REST maps naturally.
- GraphQL is premature until the query surface becomes complex (V3+).

**V3 consideration**: Introduce GraphQL (via Yoga or Pothos) when the dashboard needs flexible querying of graph data. REST remains for CI/CD integration (simple webhooks, exit codes).

---

## 4. Repository Analysis Layer

### AST Analysis: ts-morph

**Why**:

- High-level TypeScript compiler API wrapper.
- Full access to TypeScript AST, type checker, and module resolution.
- Handles tsconfig.json path aliases, project references, and composite projects.
- Active maintenance, strong community.

**Alternatives considered**:

| Alternative                 | Why rejected                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Raw TypeScript Compiler API | 3–5x more boilerplate for the same operations. ts-morph wraps it cleanly.                           |
| SWC                         | Fast parser but no type information, no module resolution. Insufficient for architectural analysis. |
| Babel                       | JavaScript-focused, weaker TypeScript support, no type-aware resolution.                            |
| tree-sitter                 | Language-agnostic but no TypeScript-specific resolution. Better for multi-language V3.              |

### Dependency Analysis: Custom + dependency-cruiser

**Why**:

- **Custom graph engine** (`@archlens/graph`) for internal dependency analysis — ArchLens needs full control over graph construction, edge typing, and operations.
- **dependency-cruiser** as a validation reference and for its mature module resolution. Can be used to cross-validate ArchLens's own resolution results during development.

### Multi-Language Parsing (V3): tree-sitter

**Why**:

- Universal parsing framework supporting 100+ languages.
- WASM bindings work in Node.js — no native compilation required.
- Incremental parsing is fast for large files.
- Each language is a separate grammar package — add languages without core changes.
- Used by GitHub, Neovim, Zed, and other major tools.

**Strategy**: MVP uses ts-morph for TypeScript/JavaScript. V3 introduces tree-sitter parsers behind the `LanguagePlugin` interface (defined in ARCH-001). Each language plugin maps tree-sitter parse trees to ArchLens's `ModuleInfo` structure.

**V3 language priority**: Python → Go → Java/Kotlin → Rust → C#.

### Code Intelligence: TypeScript Language Service

**Why**: For V2+ features like "navigate to the boundary violation" in the web dashboard, the TypeScript language service (accessed via ts-morph) provides go-to-definition, find-references, and symbol resolution.

---

## 5. Graph Processing Layer

### In-Memory Graph: Custom Adjacency List Engine

**Why**:

- ArchLens's dependency graph has specific requirements (typed edges, package collapse, evidence chains) that no off-the-shelf graph library fully satisfies.
- The graph is the core data structure — it must be fully owned for control, optimization, and extensibility.
- Adjacency list is optimal for sparse graphs (dependency graphs are always sparse, density < 5%).

### Graph Algorithms: Custom Implementation

Implemented in `@archlens/graph` and `@archlens/analyzer`:

| Algorithm             | Purpose                               |
| --------------------- | ------------------------------------- |
| Tarjan's SCC          | Cycle detection                       |
| Brandes' centrality   | Betweenness centrality                |
| BFS/DFS               | Transitive dependencies, reachability |
| Dijkstra (unweighted) | Shortest path for evidence chains     |
| Kahn's algorithm      | Topological sort                      |

**Why custom over a library**:

- Graph libraries (graphlib, ngraph) add dependencies for algorithms that are 50–200 lines each.
- Custom implementations are tailored to ArchLens's specific graph types and evidence chain requirements.
- Minimal dependency principle (ARCH-004 P11).

### Graph Database (V3): Neo4j (Optional)

**Why Neo4j if needed**:

- When ArchLens supports cross-repository analysis (V3), the graph grows beyond what in-memory processing handles efficiently.
- Neo4j is the most mature graph database with the richest query language (Cypher).
- Cypher queries express graph patterns (cycles, paths, neighborhoods) naturally.

**Why not in MVP/V2**: In-memory processing handles single-repo graphs easily (500–5,000 modules). A graph database adds deployment complexity that is unjustified until multi-repo analysis.

**Alternatives considered**:

| Alternative                        | Why deferred                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| ArangoDB                           | Multi-model but smaller community than Neo4j for pure graph workloads.                    |
| Amazon Neptune                     | Cloud-only, vendor lock-in.                                                               |
| Memgraph                           | Smaller ecosystem, less tooling.                                                          |
| Custom graph storage on PostgreSQL | Viable with recursive CTEs but query ergonomics are worse than Cypher for graph patterns. |

---

## 6. Rule Engine Architecture

### Approach: TypeScript Plugin Architecture with YAML Configuration

**Design**: Two layers:

1. **Rule Configuration (YAML)** — for threshold-based rules that don't need code:

```yaml
rules:
    max-fan-out:
        severity: warning
        threshold: 15
    no-circular-deps:
        severity: error
    boundary-violation:
        severity: error
        boundaries:
            - from: "infrastructure"
              to: "domain"
              direction: forbidden
```

2. **Rule Plugins (TypeScript)** — for custom rules requiring code:

```typescript
export default {
    id: "custom/no-cross-team-deps",
    name: "No Cross-Team Dependencies",
    severity: "error",
    evaluate(context: RuleContext): Violation[] {
        // Custom logic with full access to graph, analysis, config
    },
} satisfies ArchitectureRule;
```

**Why this dual approach**:

- YAML covers 80% of use cases (threshold tuning, boundary definitions) without requiring users to write code.
- TypeScript plugins cover the remaining 20% (complex custom logic) with full type safety and IDE support.
- Users start with YAML, graduate to plugins when needed — progressive disclosure.

**Alternatives considered**:

| Alternative                        | Why rejected                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| JSON rules only                    | No comments, less readable than YAML for configuration.                                           |
| Custom DSL                         | Requires learning a new language. TypeScript plugins are a known language.                        |
| YAML only (no plugins)             | Cannot express complex rules (e.g., "module X can only depend on module Y if Z condition holds"). |
| JavaScript plugins (no TypeScript) | Loses type safety. ArchLens users are TypeScript developers.                                      |
| OPA/Rego policy engine             | Over-engineered for this use case. Adds a new language and runtime.                               |

---

## 7. Scoring Engine Architecture

### Approach: Deterministic Linear Penalty Model

Defined in detail in ARCH-012. Technology considerations:

- **No ML/AI in scoring** — scores must be deterministic, reproducible, and explainable. Same repo = same score, every time.
- **Pure functions** — each scorer is a pure function from metrics to score. No side effects, no external state.
- **Evidence chains** — every penalty carries the modules and metrics that caused it.

### Formula Representation

Formulas are hardcoded in TypeScript functions (MVP), configurable via weights in YAML (V2+):

```yaml
# V2: archlens.config.yaml
scoring:
    weights:
        dependencyHealth: 0.30
        maintainability: 0.25
        technicalDebt: 0.20
        scalability: 0.25
    thresholds:
        depthThreshold: 10
        fanOutThreshold: 8
```

### Historical Scoring (V3)

When persistence is available, scores are stored with timestamps. Trend analysis uses linear regression on score time series to produce rate-of-change metrics and forecasts.

**Library**: `simple-statistics` — lightweight, zero-dependency statistics library for regression and trend computation. No heavy ML framework needed.

---

## 8. Reporting Architecture

### Strategy: Template-Based Generation

Each report format has a dedicated renderer implementing the `OutputFormatter` interface.

### Markdown Reports

**Technology**: Template literals in TypeScript. Markdown is simple enough that a template engine adds unnecessary dependency.

### HTML Reports (V2)

**Technology**: React server-side rendering via `react-dom/server`.

**Why**: The same React components used in the web dashboard can render to static HTML for self-contained reports. No separate template language needed.

**Distribution**: Single-file HTML with inlined CSS and JS. Openable in any browser, no server required.

### PDF Reports (V2+)

**Technology**: Puppeteer (headless Chrome rendering of HTML report to PDF).

**Why**: HTML → PDF via headless Chrome produces pixel-perfect, styled PDFs without a separate PDF templating system. The HTML report IS the PDF source.

**Alternatives considered**:

| Alternative | Why rejected                                  |
| ----------- | --------------------------------------------- |
| jsPDF       | Limited styling, no CSS support.              |
| PDFKit      | Low-level, requires manual layout.            |
| wkhtmltopdf | Deprecated WebKit, rendering inconsistencies. |
| WeasyPrint  | Python dependency, not Node.js native.        |

### Dashboard Generation (V2+)

The web dashboard IS the report — it's a live, interactive version of the same data that static reports contain. Built with Next.js + React Flow + Recharts.

---

## 9. Storage Architecture

### MVP: No Storage (Stateless)

Analysis runs are stateless. Results are computed fresh each time and written to stdout or file. No database, no persistence.

**Rationale**: Zero infrastructure, zero setup, zero maintenance. Maximum adoption friction reduction.

### V2: SQLite (Local) or PostgreSQL (Deployed)

**SQLite for local mode**:

- Zero-configuration embedded database.
- Single file, no server process.
- Perfect for local development dashboard.
- Stores historical analysis results, scores, and configuration.
- Accessed via **Drizzle ORM** — lightweight, TypeScript-first, SQL-native.

**PostgreSQL for deployed mode**:

- When ArchLens runs as a team-facing web service.
- Mature, reliable, handles concurrent access.
- Same Drizzle ORM schema works with both SQLite and PostgreSQL (Drizzle supports both dialects).

**Why Drizzle ORM**:

- TypeScript-first with inferred types from schema.
- SQL-like query builder — no ORM abstraction leakage.
- Supports SQLite, PostgreSQL, and MySQL with the same schema definition.
- Lightweight, fast, modern.

**Alternatives considered**:

| Alternative | Why rejected                                                                   |
| ----------- | ------------------------------------------------------------------------------ |
| Prisma      | Heavier, requires code generation, custom query language.                      |
| TypeORM     | Aging, maintenance concerns, heavy abstraction.                                |
| Knex        | Query builder only, no schema type inference.                                  |
| Raw SQL     | No type safety, more boilerplate.                                              |
| MongoDB     | Document store is wrong model for relational score history and graph metadata. |

### V3: PostgreSQL + Redis + Optional Neo4j

| Technology       | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| PostgreSQL       | Primary data store (repos, analyses, scores, users, teams)       |
| Redis            | Caching (analysis results), job queues (BullMQ), session storage |
| Neo4j (optional) | Cross-repository dependency graph storage and querying           |

### Schema Evolution

Drizzle supports schema migrations. Migration files are committed to the repository and run automatically on startup.

---

## 10. CLI Architecture

### CLI Framework: citty

**Why**:

- Lightweight, TypeScript-first CLI framework by the UnJS team.
- Supports subcommands, typed arguments, and auto-generated help.
- Tiny footprint — no bloated dependency tree.
- Active maintenance, used in Nuxt and other UnJS projects.

**Alternatives considered**:

| Alternative            | Why rejected                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| Commander.js           | Larger, callback-based API, weaker TypeScript inference.                  |
| Yargs                  | Heavy, complex API for what ArchLens needs.                               |
| oclif                  | Full CLI framework by Heroku — over-engineered for ArchLens's 4 commands. |
| meow                   | Too minimal, no subcommand support.                                       |
| Custom argument parser | Reinventing the wheel for commodity functionality.                        |

### Command Structure

```
archlens analyze <path>     [--format] [--output] [--exclude] [--threshold] [--granularity]
archlens score <path>       [--format] [--output]
archlens violations <path>  [--format] [--output]
archlens graph <path>       [--format] [--output] [--granularity]
archlens init               (V2: generate archlens.config.yaml)
archlens history <path>     (V3: show score history)
archlens diff <path>        (V3: compare architecture between commits)
```

### Output Formats

| Format            | Library                 | Use Case                   |
| ----------------- | ----------------------- | -------------------------- |
| Console (colored) | `picocolors`            | Interactive terminal use   |
| JSON              | Native `JSON.stringify` | CI integration, piping     |
| Markdown          | Template literals       | Documentation, PR comments |

**Why `picocolors`**: Smallest ANSI color library (3.8KB), no dependencies, respects `NO_COLOR`. Drop-in replacement for `chalk` without the weight.

---

## 11. Testing Architecture

### Unit Testing: Vitest

**Why**: Defined in ENG-003. TypeScript-native, ESM-first, fast, compatible with Turborepo caching.

### Integration Testing: Vitest + Fixture Projects

**Why**: Same framework for unit and integration tests. Fixture TypeScript projects in `examples/` directory exercise the full pipeline.

### End-to-End Testing: Vitest + execa

**Why**: E2E tests spawn the CLI as a subprocess (via `execa`) against fixture projects and verify output and exit codes. No additional E2E framework needed for a CLI tool.

### Browser Testing (V2+): Playwright

**Why**:

- For testing the web dashboard.
- Cross-browser testing (Chromium, Firefox, WebKit).
- Built-in auto-waiting, screenshots, and trace viewer.
- TypeScript-first API.

**Alternatives considered**:

| Alternative | Why rejected                                             |
| ----------- | -------------------------------------------------------- |
| Cypress     | Heavier, Chromium-focused, slower for large test suites. |
| Puppeteer   | Chromium-only, lower-level API.                          |

### Coverage: Vitest built-in (v8 provider)

Target: 90%+ for core analysis packages, 80%+ for CLI and reporting.

---

## 12. DevOps & Infrastructure

### CI/CD: GitHub Actions

Defined in ENG-005. Three workflows: PR validation, release, nightly.

### Release Management: Changesets

Defined in ENG-006. Monorepo-aware versioning and changelog generation.

### Package Publishing: npm (under `@archlens` scope)

All packages published to npm. CLI installable via `npx archlens`.

### Monorepo Tooling: pnpm + Turborepo

| Tool      | Role                                                 |
| --------- | ---------------------------------------------------- |
| pnpm      | Package management, workspace linking                |
| Turborepo | Task orchestration, caching, dependency-aware builds |

### Containerization (V2+): Docker

**Why**: When ArchLens runs as a web service, Docker provides reproducible deployment.

```dockerfile
# Multi-stage build
FROM node:22-alpine AS builder
# ... build steps
FROM node:22-alpine AS runner
# ... production image
```

**Orchestration**: Docker Compose for local development (app + database). Kubernetes for production deployment (V3).

### Infrastructure as Code (V3): Pulumi

**Why Pulumi over Terraform**: TypeScript-native IaC. Same language as the application. No HCL learning curve for contributors.

---

## 13. Security Considerations

### Repository Access

- **Local mode**: ArchLens reads the local file system with the user's permissions. No elevation, no special access.
- **GitHub integration (V3)**: OAuth App or GitHub App with minimal permissions:
    - `contents: read` — read repository files
    - `pull_requests: write` — post analysis comments
    - No write access to code, no admin access

### Secrets Handling

- No secrets in MVP (local-only, no auth).
- V2+: Environment variables for database credentials. No `.env` files committed.
- V3: Secrets manager integration (GitHub Actions secrets, Vault).

### Report Security

- Reports may contain file paths and module names — not source code.
- JSON output schema is documented — consumers know exactly what data is exposed.
- HTML reports are self-contained — no external resource loading, no tracking.

### Supply Chain

- Minimal dependencies reduce supply chain attack surface.
- `pnpm` strict mode prevents phantom dependencies.
- Dependency updates tracked via Dependabot or Renovate.
- Lock file committed and verified in CI.

---

## 14. Future AI Layer

### Position: Deterministic Core, AI-Augmented Periphery

ArchLens's core analysis pipeline (scan → parse → graph → analyze → rules → score) **remains deterministic and AI-free**. This is a product requirement (ARCH-004 AD-002, AD-005).

### Where AI Can Add Value (V3+)

| Feature                           | AI Role                                                                    | Deterministic Alternative                   |
| --------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Natural language report summaries | LLM generates prose summary of scores and violations                       | Template-based summaries (always available) |
| Refactoring suggestions           | LLM suggests how to break a circular dependency                            | Static recommendations (always available)   |
| Architecture pattern recognition  | ML model identifies architectural styles (hexagonal, layered, microkernel) | Rule-based heuristics (always available)    |
| Anomaly detection                 | ML model identifies unusual structural patterns                            | Statistical thresholds (always available)   |

### Design Principle

Every AI feature has a deterministic fallback. AI outputs are labeled as "AI-generated" and never affect scores or governance verdicts. Scores are always deterministic.

### Technology (When Introduced)

- **LLM integration**: OpenAI API or local models via Ollama. User brings their own API key.
- **ML models**: `simple-statistics` for basic regression. TensorFlow.js or ONNX Runtime for trained models (if ever needed).

### Why Not AI-First

1. Trust requires explainability. AI outputs are hard to explain.
2. Determinism is required for CI governance. AI outputs vary between runs.
3. The architecture analysis problem is well-defined and solvable with graph algorithms. AI is not needed for the core value proposition.
4. Adding AI increases complexity, cost, and dependency on external services.

---

## 15. Final Recommended Stack

### MVP Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Language         | TypeScript (strict mode)              |
| Runtime          | Node.js 22 LTS                        |
| Package Manager  | pnpm                                  |
| Monorepo         | Turborepo                             |
| Build            | tsup                                  |
| CLI Framework    | citty                                 |
| CLI Colors       | picocolors                            |
| AST Parsing      | ts-morph                              |
| Graph Engine     | Custom (adjacency list)               |
| Graph Algorithms | Custom (Tarjan, Brandes, BFS/DFS)     |
| Rule Engine      | TypeScript functions + built-in rules |
| Scoring Engine   | TypeScript pure functions             |
| Output Formats   | Console, JSON, Markdown               |
| Testing          | Vitest                                |
| Linting          | ESLint                                |
| Formatting       | Prettier                              |
| CI/CD            | GitHub Actions                        |
| Release          | Changesets                            |
| Storage          | None (stateless)                      |

### V2 Stack (Adds)

| Layer               | Technology                       |
| ------------------- | -------------------------------- |
| Frontend Framework  | Next.js (App Router)             |
| Styling             | Tailwind CSS v4                  |
| Components          | shadcn/ui + Radix UI             |
| State Management    | Zustand + TanStack Query         |
| Charts              | Recharts                         |
| Graph Visualization | React Flow                       |
| API Layer           | Hono (inside Next.js API routes) |
| Database (local)    | SQLite via Drizzle ORM           |
| Database (deployed) | PostgreSQL via Drizzle ORM       |
| HTML Reports        | React SSR (`react-dom/server`)   |
| PDF Reports         | Puppeteer                        |
| Browser Testing     | Playwright                       |
| Config Format       | YAML (archlens.config.yaml)      |
| Containerization    | Docker + Docker Compose          |

### V3 Stack (Adds)

| Layer                  | Technology                                |
| ---------------------- | ----------------------------------------- |
| Background Jobs        | BullMQ + Redis                            |
| Graph Database         | Neo4j (optional, for cross-repo analysis) |
| Multi-Language Parsing | tree-sitter (WASM)                        |
| GitHub Integration     | GitHub App (Octokit)                      |
| Auth                   | NextAuth.js                               |
| Infrastructure as Code | Pulumi                                    |
| Orchestration          | Kubernetes                                |
| AI (optional)          | OpenAI API / Ollama                       |
| Statistics             | simple-statistics                         |
| Historical Analysis    | PostgreSQL time-series queries            |
| Architecture Diff      | Custom (graph diffing algorithm)          |

---

### Dependency Summary (MVP Only)

**Production dependencies** (the bar is high — each must justify its inclusion):

| Dependency   | Justification                                                               |
| ------------ | --------------------------------------------------------------------------- |
| `ts-morph`   | TypeScript AST parsing and module resolution. >2 weeks to build equivalent. |
| `citty`      | CLI argument parsing. Commodity; not worth reimplementing.                  |
| `picocolors` | ANSI terminal colors. 3.8KB, zero deps.                                     |
| `yaml`       | YAML parsing for V2 config. Not needed in MVP but listed for V2 readiness.  |

**Everything else is custom-built** — graph engine, algorithms, analyzer, rules, scoring, reporting.

Total production dependency count for MVP: **3** (ts-morph, citty, picocolors).

---

## Decision Log

| ID     | Decision                                                 | Rationale                                              |
| ------ | -------------------------------------------------------- | ------------------------------------------------------ |
| DL-103 | TypeScript everywhere (frontend, backend, CLI, analysis) | Single language, shared types, dogfood capability      |
| DL-104 | Next.js for web (V2)                                     | SSR, API routes, React Server Components, ecosystem    |
| DL-105 | Hono for API layer                                       | Lightweight, portable, TypeScript-first                |
| DL-106 | shadcn/ui for components                                 | Owned source code, accessible, Tailwind-native         |
| DL-107 | React Flow for graph visualization                       | Purpose-built for interactive node graphs in React     |
| DL-108 | citty for CLI                                            | Lightweight, TypeScript-first, UnJS ecosystem          |
| DL-109 | Custom graph engine over library                         | Full control, minimal deps, tailored to ArchLens needs |
| DL-110 | SQLite (local) + PostgreSQL (deployed) via Drizzle       | Progressive storage; same ORM for both                 |
| DL-111 | tree-sitter for multi-language (V3)                      | Universal parser, WASM, used by GitHub                 |
| DL-112 | No AI in core pipeline                                   | Determinism, explainability, trust                     |
| DL-113 | 3 production dependencies in MVP                         | Minimal attack surface, maximum control                |

---

_End of STACK-001_
