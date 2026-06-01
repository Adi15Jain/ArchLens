# RFC-004 — Analyzer Package

---

## Metadata

| Field       | Value                  |
| ----------- | ---------------------- |
| Document ID | RFC-004                |
| Version     | 1.0.0                  |
| Status      | DRAFT                  |
| Owner       | ArchLens Core Team     |
| Created     | 2026-06-02             |
| Phase       | Phase 3 — Package RFCs |
| Depends On  | RFC-003, ARCH-010      |
| Package     | `@archlens/analyzer`   |

---

## Purpose

RFC for the `@archlens/analyzer` package — responsible for computing architectural metrics and detecting structural patterns from the dependency graph.

---

## Responsibility

L3 in the Architecture Intelligence Hierarchy. Takes a `DependencyGraph` and produces an `AnalysisResult` — computed metrics, detected patterns, and structural anomalies.

---

## Public API

```typescript
function analyze(graph: DependencyGraph): AnalysisResult;
```

Single entry point. No configuration in MVP — all metrics and patterns are computed.

---

## Internal Design

### Metric Computation

Metrics are computed by independent, composable functions:

```typescript
// Per-module metrics
function computeFanIn(graph: DependencyGraph, nodeId: string): number;
function computeFanOut(graph: DependencyGraph, nodeId: string): number;
function computeInstability(fanIn: number, fanOut: number): number;
function computeDepth(graph: DependencyGraph, nodeId: string): number;
function computeBetweenness(graph: DependencyGraph): Map<string, number>;

// Graph-level metrics
function computeGraphMetrics(
    graph: DependencyGraph,
    moduleMetrics: Map<string, ModuleMetrics>,
): GraphMetrics;
```

Each function is pure — takes input, returns output, no side effects.

### Pattern Detection

Pattern detectors run after metric computation and use the computed metrics:

```typescript
function detectHubs(metrics: Map<string, ModuleMetrics>): PatternMatch[];
function detectGodModules(metrics: Map<string, ModuleMetrics>): PatternMatch[];
function detectBottlenecks(
    metrics: Map<string, ModuleMetrics>,
    graph: DependencyGraph,
): PatternMatch[];
function detectOrphans(metrics: Map<string, ModuleMetrics>): PatternMatch[];
function detectLeaves(metrics: Map<string, ModuleMetrics>): PatternMatch[];
```

**Threshold model**: Patterns use relative thresholds (2× graph average) rather than absolute numbers. This ensures thresholds adapt to project size.

### Analysis Pipeline (Internal)

```
DependencyGraph
  → Compute per-module metrics (fan-in, fan-out, instability, depth)
  → Compute betweenness centrality
  → Compute graph-level metrics
  → Detect cycles (delegates to graph package)
  → Run pattern detectors
  → Assemble AnalysisResult
```

---

## Betweenness Centrality Algorithm

Uses Brandes' algorithm for computing betweenness centrality on unweighted directed graphs. Time complexity: O(V × E).

For MVP performance target (500 files), this is acceptable. For larger graphs, approximate algorithms may be needed post-MVP.

---

## Dependencies

- `@archlens/types` — `AnalysisResult`, `ModuleMetrics`, `GraphMetrics`, `PatternMatch` types
- `@archlens/shared` — utilities
- `@archlens/graph` — `DependencyGraph`, graph operations (cycle detection, etc.)

---

## Testing Strategy

| Test Type   | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| Unit        | Individual metric computation functions with hand-crafted graph inputs        |
| Pattern     | Each pattern detector with graphs designed to trigger/not trigger the pattern |
| Integration | Full analysis of a fixture project graph                                      |
| Property    | Instability is always in [0, 1]; fan-in/fan-out are non-negative              |

---

_End of RFC-004_
