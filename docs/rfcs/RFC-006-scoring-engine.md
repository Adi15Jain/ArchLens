# RFC-006 — Scoring Engine

---

## Metadata

| Field       | Value                      |
| ----------- | -------------------------- |
| Document ID | RFC-006                    |
| Version     | 1.0.0                      |
| Status      | DRAFT                      |
| Owner       | ArchLens Core Team         |
| Created     | 2026-06-02                 |
| Phase       | Phase 3 — Package RFCs     |
| Depends On  | RFC-004, RFC-005, ARCH-012 |
| Package     | `@archlens/scoring`        |

---

## Purpose

RFC for the `@archlens/scoring` package — responsible for computing architecture scores from analysis results and violations.

---

## Responsibility

L5 in the Architecture Intelligence Hierarchy. Takes `AnalysisResult` and `ViolationSet` and produces a `ScoreCard`.

---

## Public API

```typescript
function computeScores(
    analysis: AnalysisResult,
    violations: ViolationSet,
): ScoreCard;
```

---

## Internal Design

### Scorer Functions

Each scoring dimension is computed by an independent function:

```typescript
function scoreDependencyHealth(analysis: AnalysisResult): DimensionalScore;
function scoreMaintainability(analysis: AnalysisResult): DimensionalScore;
function scoreTechnicalDebt(violations: ViolationSet): DimensionalScore;
function scoreScalability(analysis: AnalysisResult): DimensionalScore;
function scoreArchitecture(dimensional: DimensionalScore[]): DimensionalScore;
```

### Score Computation Flow

```
AnalysisResult + ViolationSet
  → Compute Dependency Health Score (from metrics)
  → Compute Maintainability Score (from metrics)
  → Compute Technical Debt Score (from violations)
  → Compute Scalability Score (from metrics)
  → Compute Aggregate Architecture Score (weighted average)
  → Build ScoreCard with evidence
```

### Penalty Tracking

Every score deduction is recorded as a `Penalty` object with:

- Name (what was penalized)
- Value (points deducted)
- Reason (why)
- Modules (which modules contributed)

This is the evidence chain. The ScoreCard is not just a number — it is a number with a full explanation.

### Grade Assignment

```typescript
function toGrade(score: number): Grade {
    if (score >= 90) return "A";
    if (score >= 75) return "B";
    if (score >= 60) return "C";
    if (score >= 40) return "D";
    return "F";
}
```

### File Structure

```
packages/scoring/src/
├── index.ts
├── compute-scores.ts
├── scorers/
│   ├── dependency-health.ts
│   ├── maintainability.ts
│   ├── technical-debt.ts
│   ├── scalability.ts
│   └── aggregate.ts
├── grade.ts
└── penalties.ts
```

---

## Dependencies

- `@archlens/types` — `ScoreCard`, `DimensionalScore`, `Penalty`, `Grade` types
- `@archlens/shared` — utilities
- `@archlens/analyzer` — `AnalysisResult` type (input)
- `@archlens/rules` — `ViolationSet` type (input)

---

## Testing Strategy

| Test Type  | Description                                                            |
| ---------- | ---------------------------------------------------------------------- |
| Per-scorer | Each scorer tested with controlled metrics, verifying exact scores     |
| Boundary   | Score at exact threshold values (edge cases at grade boundaries)       |
| Evidence   | Verify every score includes penalty breakdown                          |
| Aggregate  | Verify weighted average computation with known inputs                  |
| Property   | Scores are always in [0, 100]; grades are consistent with score ranges |

---

_End of RFC-006_
