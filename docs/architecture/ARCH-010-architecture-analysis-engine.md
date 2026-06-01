# ARCH-010 — Architecture Analysis Engine

---

## Metadata

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | ARCH-010                      |
| Version     | 1.0.0                         |
| Status      | DRAFT                         |
| Owner       | ArchLens Core Team            |
| Created     | 2026-06-02                    |
| Phase       | Phase 2 — System Architecture |
| Depends On  | ARCH-008, ARCH-009            |

---

## Purpose

Specifies the architecture analysis engine — the component that takes a dependency graph and computes architectural metrics, detects patterns, and identifies structural anomalies.

---

## Scope

- Metrics computed by the analyzer.
- Pattern detection algorithms.
- Output structure (AnalysisResult).
- Extensibility model.

---

## Metrics

### Per-Module Metrics

| Metric                 | Formula                                              | Description                                        |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Fan-In (Ca)            | Count of incoming edges                              | How many modules depend on this module             |
| Fan-Out (Ce)           | Count of outgoing edges                              | How many modules this module depends on            |
| Instability (I)        | Ce / (Ca + Ce)                                       | 0 = maximally stable, 1 = maximally unstable       |
| Dependency Depth       | Longest path from this node to any leaf              | How deep in the dependency chain                   |
| Betweenness Centrality | Fraction of shortest paths passing through this node | How critical this module is as a dependency bridge |

### Graph-Level Metrics

| Metric                  | Formula                                      | Description                              |
| ----------------------- | -------------------------------------------- | ---------------------------------------- |
| Cycle Count             | Number of SCCs with size > 1                 | Total circular dependency clusters       |
| Cycle Size Distribution | List of SCC sizes                            | How large the circular dependencies are  |
| Max Depth               | Maximum dependency depth across all nodes    | Deepest dependency chain                 |
| Average Fan-Out         | Sum(Ce) / node count                         | Average outgoing dependencies per module |
| Dependency Density      | edge count / (node count × (node count − 1)) | How interconnected the graph is (0–1)    |
| Module Count            | Total graph nodes                            | Size indicator                           |
| Edge Count              | Total graph edges                            | Complexity indicator                     |
| Orphan Count            | Nodes with Ca = 0 and Ce = 0                 | Disconnected modules                     |

---

## Pattern Detection

### Hub Modules

**Definition**: Modules with fan-in significantly above the average (> 2× average fan-in).

**Significance**: Hubs are critical dependencies. Changes to hubs propagate widely. They are potential architectural bottlenecks.

### God Modules

**Definition**: Modules with both high fan-in (> 2× avg) AND high fan-out (> 2× avg).

**Significance**: God modules both depend on many things and are depended upon by many things. They are the highest-risk modules for change propagation.

### Bottleneck Modules

**Definition**: Modules with high betweenness centrality (top 5% of the graph).

**Significance**: Bottlenecks are modules through which many dependency paths flow. Even if their fan-in is moderate, they are critical structural bridges.

### Leaf Modules

**Definition**: Modules with Ce = 0 (no outgoing dependencies).

**Significance**: Leaves are the most stable modules. They depend on nothing and can be changed without propagation risk.

### Orphan Modules

**Definition**: Modules with Ca = 0 AND Ce = 0.

**Significance**: Orphans are disconnected from the architecture. They may be dead code, entry points, or configuration files that the scanner included incorrectly.

### Layer Violations

**Detection**: If the repository defines a layered architecture (via configuration or convention), detect edges that flow against the intended layer direction.

**MVP**: Layer detection is convention-based. Directories named `domain`, `infrastructure`, `application`, `presentation` (or configured equivalents) are treated as layers with expected dependency direction.

---

## Output Structure

```
AnalysisResult {
  metrics: {
    modules: Map<string, ModuleMetrics>   // Per-module metrics
    graph: GraphMetrics                    // Graph-level metrics
  }
  patterns: {
    hubs: PatternMatch[]                  // Hub modules with evidence
    godModules: PatternMatch[]            // God modules with evidence
    bottlenecks: PatternMatch[]           // Bottleneck modules with evidence
    orphans: PatternMatch[]               // Orphan modules
    leafModules: PatternMatch[]           // Leaf modules
  }
  cycles: Cycle[]                         // All detected cycles
  anomalies: Anomaly[]                    // Structural anomalies
}
```

Where:

```
PatternMatch {
  moduleId: string
  patternType: string
  metrics: Record<string, number>         // The metrics that triggered the match
  evidence: string                        // Human-readable explanation
}

Anomaly {
  type: string
  description: string
  modules: string[]
  severity: 'high' | 'medium' | 'low'
}
```

---

## Extensibility

The analyzer is designed to accept additional metric computations and pattern detectors through a plugin interface (post-MVP):

```
interface MetricPlugin {
  name: string
  computeModuleMetric?(node: GraphNode, graph: DependencyGraph): number
  computeGraphMetric?(graph: DependencyGraph): number
}

interface PatternPlugin {
  name: string
  detect(analysis: AnalysisResult, graph: DependencyGraph): PatternMatch[]
}
```

MVP ships with built-in metrics and patterns only. Plugin interface is designed but not exposed publicly until post-MVP.

---

## Decision Log

| ID     | Decision                                                   | Rationale                                                     |
| ------ | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DL-040 | 5 per-module metrics, 8 graph-level metrics                | Covers core architectural dimensions without over-engineering |
| DL-041 | Pattern detection uses statistical thresholds (2× average) | Simple, explainable thresholds; configurable post-MVP         |
| DL-042 | Layer violation detection is convention-based in MVP       | Full configuration requires config file, which is post-MVP    |
| DL-043 | Plugin interface designed but not public in MVP            | Prevents premature API commitment                             |

---

_End of ARCH-010_
