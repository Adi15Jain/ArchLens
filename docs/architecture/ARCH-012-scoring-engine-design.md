# ARCH-012 — Scoring Engine Design

---

## Metadata

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | ARCH-012                      |
| Version     | 1.0.0                         |
| Status      | DRAFT                         |
| Owner       | ArchLens Core Team            |
| Created     | 2026-06-02                    |
| Phase       | Phase 2 — System Architecture |
| Depends On  | ARCH-010, ARCH-011            |

---

## Purpose

Specifies the scoring engine — the component that transforms analysis metrics and violations into quantitative architecture scores across multiple dimensions.

---

## Scope

- Scoring dimensions and their formulas.
- Score aggregation model.
- Evidence chain generation.
- Score normalization.

---

## Scoring Dimensions

All scores are normalized to a 0–100 range. 100 = perfect, 0 = critical.

### 1. Dependency Health Score

Measures the health of the internal dependency graph.

**Inputs**:

- Cycle count (from AnalysisResult)
- Maximum dependency depth
- Average instability index
- Unresolved import count

**Formula**:

```
cyclePenalty     = min(cycleCount * 10, 40)
depthPenalty     = max(0, (maxDepth - depthThreshold) * 5)  // depthThreshold = 10
instabilityPenalty = |avgInstability - 0.5| * 20             // Penalize extreme values
unresolvedPenalty = min(unresolvedCount * 2, 10)

DependencyHealthScore = max(0, 100 - cyclePenalty - depthPenalty - instabilityPenalty - unresolvedPenalty)
```

**Rationale**: Cycles are the most damaging architectural flaw (highest penalty weight). Depth and instability are secondary concerns. Unresolved imports indicate structural gaps but are less severe.

---

### 2. Maintainability Score

Measures how easy the architecture is to modify and extend.

**Inputs**:

- Average fan-out (coupling)
- God module count
- Hub module count
- Orphan module count

**Formula**:

```
couplingPenalty   = max(0, (avgFanOut - fanOutThreshold) * 5)  // fanOutThreshold = 8
godModulePenalty  = godModuleCount * 15
hubPenalty        = max(0, (hubCount - 3) * 5)                 // First 3 hubs are acceptable
orphanPenalty     = min(orphanCount * 2, 10)

MaintainabilityScore = max(0, 100 - couplingPenalty - godModulePenalty - hubPenalty - orphanPenalty)
```

**Rationale**: God modules are the primary maintainability killer (highest weight). High average coupling makes changes propagate unpredictably. Orphans indicate dead or misplaced code.

---

### 3. Technical Debt Score

Measures accumulated architectural debt via violations.

**Inputs**:

- Violation counts by severity

**Formula**:

```
errorPenalty   = errorCount * 8
warningPenalty = warningCount * 3
infoPenalty    = infoCount * 1

TechnicalDebtScore = max(0, 100 - errorPenalty - warningPenalty - infoPenalty)
```

**Rationale**: Direct mapping from violations to debt. Error-severity violations carry the most weight because they represent fundamental architectural problems.

---

### 4. Scalability Score

Measures how well the architecture supports scaling (horizontal partitioning, independent deployment, module isolation).

**Inputs**:

- Bottleneck module count
- Dependency density
- Cycle count (cycles prevent independent scaling)
- Maximum fan-in (highest single-module fan-in)

**Formula**:

```
bottleneckPenalty = bottleneckCount * 10
densityPenalty    = max(0, (density - 0.1) * 200)       // Penalize density above 10%
cyclePenalty      = min(cycleCount * 8, 30)
fanInPenalty      = max(0, (maxFanIn - fanInThreshold) * 3)  // fanInThreshold = 20

ScalabilityScore = max(0, 100 - bottleneckPenalty - densityPenalty - cyclePenalty - fanInPenalty)
```

**Rationale**: Bottlenecks are the primary scalability inhibitor. High density means the graph is too interconnected for independent scaling. Cycles lock modules into inseparable units.

---

### 5. Architecture Score (Aggregate)

Weighted average of dimensional scores.

**Formula**:

```
ArchitectureScore = (
    DependencyHealthScore  * 0.30 +
    MaintainabilityScore   * 0.25 +
    TechnicalDebtScore     * 0.20 +
    ScalabilityScore       * 0.25
)
```

**Weight rationale**:

- Dependency health is weighted highest because it is the foundation — unhealthy dependencies undermine all other dimensions.
- Maintainability and scalability are equally weighted as they represent the two primary architectural qualities teams care about.
- Technical debt is weighted lowest because it is a derivative of violations, which are already reflected in other scores.

---

## Score Card Structure

```
ScoreCard {
  scores: {
    architecture: DimensionalScore
    dependencyHealth: DimensionalScore
    maintainability: DimensionalScore
    technicalDebt: DimensionalScore
    scalability: DimensionalScore
  }
  timestamp: string
  repositoryPath: string
  moduleCount: number
}

DimensionalScore {
  value: number                      // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  penalties: Penalty[]               // Breakdown of score deductions
}

Penalty {
  name: string                       // e.g., "cyclePenalty"
  value: number                      // Points deducted
  reason: string                     // Human-readable explanation
  modules: string[]                  // Modules contributing to the penalty
}
```

### Grade Mapping

| Score Range | Grade | Interpretation                     |
| ----------- | ----- | ---------------------------------- |
| 90–100      | A     | Excellent architecture             |
| 75–89       | B     | Good architecture, minor issues    |
| 60–74       | C     | Acceptable, attention needed       |
| 40–59       | D     | Poor, significant issues           |
| 0–39        | F     | Critical, major refactoring needed |

---

## Evidence Chains

Every penalty in a score includes:

1. **What**: The metric that triggered the penalty.
2. **How much**: The points deducted.
3. **Why**: Human-readable explanation.
4. **Where**: The specific modules contributing.

Example:

```
Penalty {
  name: "cyclePenalty"
  value: 20
  reason: "2 circular dependency clusters detected"
  modules: ["src/auth/session.ts", "src/auth/token.ts", "src/api/middleware.ts"]
}
```

---

## Thresholds (Defaults)

| Parameter          | Default | Used In           |
| ------------------ | ------- | ----------------- |
| `depthThreshold`   | 10      | Dependency Health |
| `fanOutThreshold`  | 8       | Maintainability   |
| `fanInThreshold`   | 20      | Scalability       |
| `densityThreshold` | 0.1     | Scalability       |

All thresholds are hardcoded defaults in MVP. Post-MVP, they are configurable via `archlens.config.ts`.

---

## Tradeoffs

| Decision                          | Tradeoff                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Linear penalty functions          | (+) Simple, predictable, explainable. (−) May not capture non-linear scaling of architectural damage. Acceptable for MVP. |
| Fixed weights for aggregate score | (+) Deterministic, no config needed. (−) Teams may disagree on weights. Post-MVP configurability mitigates.               |
| Grade letters alongside numbers   | (+) Quick interpretation. (−) Arbitrary thresholds. Mitigated by always showing the number too.                           |

---

## Decision Log

| ID     | Decision                                   | Rationale                                                           |
| ------ | ------------------------------------------ | ------------------------------------------------------------------- |
| DL-048 | 4 dimensional scores + 1 aggregate         | Covers core dimensions without over-fragmentation                   |
| DL-049 | Linear penalty-based scoring               | Simple, explainable, debuggable                                     |
| DL-050 | Evidence chains mandatory on every penalty | Core explainability requirement                                     |
| DL-051 | Hardcoded thresholds in MVP                | Zero-config principle; configurability post-MVP                     |
| DL-052 | Weight distribution: 30/25/20/25           | Dependency health as foundation; debt lower because it's derivative |

---

_End of ARCH-012_
