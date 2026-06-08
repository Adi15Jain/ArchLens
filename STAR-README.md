# ArchLens — Behavioral Interview Prep (STAR Method)

> **What is this document?**
> This is your interview-ready reference for discussing the **ArchLens** project using the STAR method. Each answer demonstrates **Ownership**, **Impact**, **Collaboration**, **Judgment**, and **Self-awareness** — the five signals behavioral interviewers score on.

---

## 🎯 Project Overview

**ArchLens** is an Architecture Intelligence Platform — a CLI-first, CI-integrable tool that analyzes software repositories to provide architecture quality scores, dependency health analysis, maintainability evaluation, technical debt quantification, and architectural violation detection. It operates at the module/package/layer level (not line-of-code) and produces deterministic, evidence-based, explainable outputs.

### Architecture at a Glance

```
Repository → Scanner → Parser → Graph Engine → Analyzer → Rule Engine → Scoring Engine → Reporting
                                                                                      → Risk Forecaster
```

### Key Metrics

| Metric | Value |
| :--- | :--- |
| **Packages** | 10 (@archlens/scanner, parser, graph, analyzer, rules, scoring, reporting, cli, shared, types) |
| **Architecture Documents** | 15 (ARCH-001 through ARCH-014 + STACK-001) |
| **Analysis Pipeline Levels** | 8 (L0 Repository Ingestion → L7 Architecture Governance) |
| **Design Principles** | 8 binding infrastructure constraints |
| **Architectural Decisions** | 5 documented (AD-001 through AD-005) |
| **Monorepo Tooling** | pnpm workspaces + Turborepo + tsup + Vitest |
| **TypeScript** | Strict mode, no `any` in public APIs |
| **Test Framework** | Vitest with V8 coverage |
| **CLI Entry Point** | `npx archlens analyze .` — zero config |
| **Output Formats** | Markdown, JSON, SARIF |
| **Philosophy** | Documentation-first: spec → RFC → engineering doc → implementation → tests |

---

## Prompt A — "Tell me about a time you disagreed with a teammate."

> **Situation:** While building ArchLens — a tool that scores software architecture quality — I was defining the analysis scope. A contributor argued that ArchLens should analyze at the function/class level, detecting code smells like overly long functions, deep nesting, and high cyclomatic complexity. Their reasoning was sound: "users expect a code analysis tool to look at code, and function-level metrics would give more granular results."
>
> **Task:** I owned the product vision and had to decide whether ArchLens should analyze at the code level (functions/classes) or strictly at the module/package/layer level, knowing this would fundamentally define what the tool is and isn't.
>
> **Action:** Instead of dismissing the idea, I took it seriously and worked through the implications. I wrote ARCH-001 (Product Vision) which explicitly defines what ArchLens is and, critically, what it is *not*. I created a comparison table showing that code-level analysis (linting, complexity metrics) is already served by mature tools — ESLint, SonarQube, CodeClimate — while *architecture-level* analysis (dependency coupling, boundary violations, module cohesion, layer integrity) has essentially no tooling. I mapped the contributor's proposed function-level features to existing tools that already do them better, and then showed the gap: "No tool treats architecture as a continuously observable, measurable, and governable engineering artifact." I proposed a clear boundary in AD-001: *"ArchLens analyzes at the module/package/layer level. It does not analyze individual functions, classes, or lines. Code-level analysis is a different domain."* I documented this as a binding constraint requiring an RFC to override.
>
> **Result:** We shipped ArchLens with a clear identity: architecture intelligence, not code analysis. The 10-package monorepo structure (scanner → parser → graph → analyzer → rules → scoring → reporting) directly reflects this scope — every package operates on module-level structures, not AST nodes. The "What ArchLens Is Not" table in ARCH-001 has prevented 3 subsequent scope-creep proposals by giving contributors a documented reference point. The contributor who proposed code-level analysis later acknowledged that the focused scope made the tool more credible and differentiated.

**Why this answer works:**
- High stakes: defining the fundamental identity and scope of the entire product.
- "I wrote... I created... I mapped... I proposed... I documented" — clear ownership.
- Resolved with *market analysis* (existing tools table, gap analysis), not just preference.
- Quantified impact (prevented 3 scope-creep proposals, 10-package architecture reflects the decision).
- Treated the disagreement respectfully — took it seriously, documented the reasoning publicly.

---

## Prompt B — "Tell me about a time you failed."

> **Situation:** ArchLens follows a documentation-first development philosophy: Architecture Spec → RFC → Engineering Doc → Implementation → Tests. I wrote 15 architecture documents (ARCH-001 through ARCH-014 + STACK-001) before writing a single line of code, defining everything from the product vision to the scoring engine design to risk forecasting.
>
> **Task:** I was responsible for the complete architecture and implementation of the platform — from design documents through to working packages with tests.
>
> **Action:** I spent three weeks writing comprehensive architecture specs. Every component had a document: the scanner, parser, graph engine, analyzer, rule engine, scoring engine, reporting, and risk forecaster. I defined data flow, immutability principles, dependency rules, and the 8-level intelligence hierarchy. But what I *didn't* do was validate the document-level abstractions against implementation reality early enough. When I started building the `@archlens/parser` package, I discovered that my ARCH-008 (Repository Analysis Pipeline) assumed a clean separation between file scanning and import parsing — but in TypeScript projects, you can't resolve import paths without understanding `tsconfig.json` path aliases, `package.json` exports fields, and barrel files. The parser needed information from the scanner that my architecture said should flow the other direction. My beautifully documented unidirectional data flow had a real-world dependency that violated it.
>
> **Result:** I had to refactor the scanner-parser interface after implementation started — something that should have been caught with a spike. The fix took 4 days: I introduced a `ResolutionContext` that the scanner produces and the parser consumes, which preserved unidirectional flow but added a data dependency I hadn't anticipated. The architecture docs were updated, but 3 weeks of "pure documentation" had produced a design that was partially wrong in a way only implementation could reveal.
>
> **What I learned / changed:** Documentation-first doesn't mean documentation-*only*. I now run a vertical spike — implementing one thin slice end-to-end — before finalizing architecture specs. For ArchLens, that means parsing one real TypeScript project through the entire pipeline (scan → parse → graph → analyze → score → report) as a validation pass before the specs are "final." The binding principle in ARCH-006 ("Stability Over Feature Velocity") still holds, but I've added a practical corollary: *"Validate abstractions with a spike before treating them as stable."*

**Why this answer works:**
- Real failure: architecture docs that were wrong in ways only implementation could reveal.
- Owns the root cause: over-invested in documentation without implementation validation.
- Shows the recovery: refactored the interface, updated docs, 4-day fix.
- Concrete behavior change: vertical spikes before finalizing specs.
- Self-aware: acknowledges the philosophy was right but the execution was incomplete.

---

## Prompt C — "Tell me about a time you had to learn something quickly."

> **Situation:** ArchLens's core value proposition is analyzing module dependency graphs in software repositories. The `@archlens/graph` package needs to build a typed directed graph from parsed import/export relationships, compute metrics like coupling, cohesion, fan-in/fan-out, and detect patterns like circular dependencies and layering violations. I had used graph algorithms in algorithm courses, but I'd never built a graph engine that operates on *real software structure* — where nodes are modules, edges are import relationships, and the graph needs to support metrics like instability (Ce / (Ca + Ce)) and abstractness.
>
> **Task:** I had to design and implement the dependency graph engine — including the data model, metric computation, and circular dependency detection — while keeping it deterministic (same repo → same graph → same metrics every time) and explainable (every metric traceable to specific edges and nodes).
>
> **Action:** I broke the learning into three focused areas. (1) **Graph data modeling for software**: I studied how existing tools (Madge, Dependency Cruiser) represent module graphs and identified the key abstractions — `ModuleNode` (file path, exports, metadata) and `DependencyEdge` (source, target, import type, weight). (2) **Architecture metrics**: I focused on exactly the metrics ArchLens needs — Robert C. Martin's package metrics (instability, abstractness, distance from main sequence), fan-in/fan-out, and transitive dependency depth. I read the original "Clean Architecture" definitions and translated each into a computable formula over the graph. (3) **Circular dependency detection**: I learned Tarjan's strongly connected components algorithm, which gives me all cycles in one O(V+E) pass, rather than the naive approach of checking every pair of nodes. Instead of learning graph theory broadly, I implemented each metric against example projects in the `examples/` directory — `simple-project` for basic dependency chains and `circular-deps` for cycle detection — validating each metric's output before moving on.
>
> **Result:** The `@archlens/graph` package was implemented in 8 days with all target metrics: coupling (afferent/efferent), instability, fan-in/fan-out, and circular dependency detection via Tarjan's SCC. The metrics are deterministic — running `archlens analyze .` twice on the same repo produces identical output. Every metric in the score card is traceable to specific nodes and edges in the dependency graph, fulfilling the explainability principle from ARCH-004. The example projects serve as both test fixtures and documentation for contributors.

**Why this answer works:**
- Specific, high-stakes constraint: build a graph engine for software architecture analysis.
- Shows *how* I learn: three focused areas, studied existing tools, translated formulas, validated against examples.
- De-risked with example projects as test fixtures.
- Quantified result: 8 days, all target metrics, deterministic output, explainable.
- The example projects show durable artifacts, not just "I learned it."

---

## 📝 Practice Notes

> **Target delivery: ~90 seconds to 2 minutes per answer.**
>
> - If you're past 30 seconds and haven't started the **Action**, cut the Situation.
> - Every Action sentence should have **"I"** as the subject.
> - End with: *"Does that answer it, or would you like me to go deeper on any part?"*
>
> These three stories also cover: **product scoping**, **documentation-driven development**, **architecture decision records**, and **learning under constraint**. The ArchLens stories are especially strong for "influence without authority" (scope definition), "a decision you'd make differently" (documentation-only), and "how you approach ambiguity" (graph engine design).

---

*Prepared using the [STAR Method framework](./01-star-method.md)*
