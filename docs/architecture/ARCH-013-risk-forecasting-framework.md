# ARCH-013 — Risk Forecasting Framework

---

## Metadata

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | ARCH-013                      |
| Version     | 1.0.0                         |
| Status      | DRAFT                         |
| Owner       | ArchLens Core Team            |
| Created     | 2026-06-02                    |
| Phase       | Phase 2 — System Architecture |
| Depends On  | ARCH-010, ARCH-012            |

---

## Purpose

Specifies the risk forecasting framework — the component that uses structural analysis to identify modules and patterns that are at risk of architectural degradation.

---

## Scope

- Risk categories and definitions.
- Risk detection algorithms (MVP: point-in-time analysis).
- Risk output structure.
- Future: trend-based forecasting (requires historical data).

---

## Background

Risk forecasting in the MVP is limited to **point-in-time structural risk assessment**. True forecasting (trend-based prediction) requires historical data across multiple analysis runs, which is a post-MVP feature.

MVP risk assessment answers: "Based on the current structure, what architectural risks exist right now?"

Post-MVP risk forecasting answers: "Based on structural trends over time, what is likely to degrade?"

---

## Risk Categories

### R1: Change Propagation Risk

**Definition**: The risk that a change to a single module will require changes in many other modules.

**Detection**: Identify modules with high fan-in AND high betweenness centrality. Changes to these modules propagate widely through the dependency graph.

**Severity Calculation**:

```
propagationRisk = fanIn * betweennessCentrality
- High: propagationRisk > 75th percentile of graph
- Medium: propagationRisk > 50th percentile
- Low: below 50th percentile
```

---

### R2: Circular Dependency Risk

**Definition**: The risk that circular dependencies will grow larger and lock more modules into inseparable clusters.

**Detection**: Identify cycles and flag:

- Cycles involving more than 3 modules (large cycles are harder to break).
- Modules that participate in multiple cycles.
- Cycles that cross package/directory boundaries.

**Severity**:

- High: Cross-boundary cycles or cycles > 5 modules
- Medium: Cycles of 3–5 modules within same boundary
- Low: Cycles of 2 modules within same boundary

---

### R3: Bottleneck Risk

**Definition**: The risk that a module is becoming a single point of failure in the architecture.

**Detection**: Identify modules where:

- Fan-in is > 3× the graph average
- Removing the module would disconnect the graph or significantly increase average path length

**Severity**:

- High: Fan-in > 5× average
- Medium: Fan-in > 3× average
- Low: Fan-in > 2× average

---

### R4: Complexity Growth Risk

**Definition**: The risk that a module is accumulating too many responsibilities.

**Detection**: Identify modules with:

- High fan-out (depends on many things — doing too much)
- High fan-in (depended on by many things — becoming a god module)
- Both high fan-in and high fan-out simultaneously

**Severity**:

- High: God module (both fan-in and fan-out > 2× average)
- Medium: High fan-out only (> 2× average)
- Low: High fan-in only (> 2× average)

---

### R5: Boundary Erosion Risk

**Definition**: The risk that architectural boundaries between layers or packages are being violated.

**Detection**: Count boundary violations (from rule engine) and assess:

- Number of violations per boundary
- Whether violations are concentrated or distributed

**Severity**:

- High: > 5 violations on a single boundary
- Medium: 2–5 violations on a single boundary
- Low: 1 violation

---

## Output Structure

```
RiskAssessment {
  risks: Risk[]
  summary: {
    total: number
    bySeverity: { high: number, medium: number, low: number }
    byCategory: Record<string, number>
  }
}

Risk {
  id: string
  category: 'change-propagation' | 'circular-dependency' | 'bottleneck' | 'complexity-growth' | 'boundary-erosion'
  severity: 'high' | 'medium' | 'low'
  title: string                      // e.g., "High change propagation risk in src/core/registry.ts"
  description: string                // Detailed explanation
  modules: string[]                  // Affected modules
  metrics: Record<string, number>    // Supporting metrics
  recommendation: string             // What to do about it
}
```

---

## Recommendations

Each risk includes a recommendation. MVP recommendations are static templates:

| Category            | Recommendation Template                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| Change Propagation  | "Consider extracting an interface to reduce direct coupling to this module"          |
| Circular Dependency | "Break the cycle by extracting shared types or introducing a mediator module"        |
| Bottleneck          | "Consider splitting this module's responsibilities across multiple focused modules"  |
| Complexity Growth   | "This module has too many dependencies — extract sub-concerns into separate modules" |
| Boundary Erosion    | "Restore the boundary by refactoring imports to go through the intended interface"   |

Post-MVP: Recommendations become context-aware, referencing specific modules and suggesting specific refactoring patterns.

---

## Future: Trend-Based Forecasting (Post-MVP)

When historical data is available (multiple analysis runs stored), the risk engine will support:

1. **Trend Detection**: Is fan-in for module X increasing over time?
2. **Rate of Change**: How fast is coupling growing?
3. **Projection**: At the current rate, when will module X exceed the bottleneck threshold?
4. **Alerts**: "Module X's coupling has increased 30% in the last 5 analysis runs"

This requires:

- Persistent storage of analysis results.
- Timestamp-indexed score/metric history.
- Trend computation algorithms (linear regression on metric time series).

---

## Decision Log

| ID     | Decision                               | Rationale                                                 |
| ------ | -------------------------------------- | --------------------------------------------------------- |
| DL-053 | 5 risk categories in MVP               | Covers primary structural risks without over-engineering  |
| DL-054 | Point-in-time analysis only in MVP     | Trend forecasting requires persistence (post-MVP)         |
| DL-055 | Static recommendation templates in MVP | Context-aware recommendations require deeper analysis     |
| DL-056 | Percentile-based severity thresholds   | Adapts to project size rather than using absolute numbers |

---

_End of ARCH-013_
