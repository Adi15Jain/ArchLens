# RFC-005 — Rule Engine

---

## Metadata

| Field       | Value                  |
| ----------- | ---------------------- |
| Document ID | RFC-005                |
| Version     | 1.0.0                  |
| Status      | DRAFT                  |
| Owner       | ArchLens Core Team     |
| Created     | 2026-06-02             |
| Phase       | Phase 3 — Package RFCs |
| Depends On  | RFC-004, ARCH-011      |
| Package     | `@archlens/rules`      |

---

## Purpose

RFC for the `@archlens/rules` package — responsible for evaluating architectural rules against analysis results.

---

## Responsibility

L4 in the Architecture Intelligence Hierarchy. Takes an `AnalysisResult` and a `RuleSet` and produces a `ViolationSet`.

---

## Public API

```typescript
interface RuleSet {
    rules: ArchitectureRule[];
}

function evaluateRules(
    analysis: AnalysisResult,
    graph: DependencyGraph,
    ruleSet: RuleSet,
): ViolationSet;
function getDefaultRuleSet(): RuleSet;
```

---

## Internal Design

### Rule Execution

Rules are evaluated sequentially. Each rule receives a `RuleContext` and returns violations:

```typescript
function evaluateRules(analysis, graph, ruleSet): ViolationSet {
    const violations: Violation[] = [];
    const context: RuleContext = { graph, analysis, config: {} };

    for (const rule of ruleSet.rules) {
        const ruleViolations = rule.evaluate(context);
        violations.push(...ruleViolations);
    }

    return buildViolationSet(violations);
}
```

**Why sequential, not parallel**: Rules are fast (no I/O), and parallel execution adds complexity without meaningful performance gain for 5 rules.

### Built-In Rule Implementations

Each rule is a separate module file:

```
packages/rules/src/
├── index.ts
├── evaluate.ts
├── default-rules.ts
├── rules/
│   ├── no-circular-deps.ts
│   ├── max-fan-out.ts
│   ├── max-depth.ts
│   ├── boundary-violation.ts
│   └── orphan-modules.ts
```

### Violation Builder

Every rule implementation constructs violations using a builder to ensure consistent structure:

```typescript
function createViolation(params: {
    ruleId: string;
    ruleName: string;
    severity: Severity;
    message: string;
    modules: string[];
    evidence: Evidence;
}): Violation;
```

---

## Dependencies

- `@archlens/types` — `ViolationSet`, `Violation`, `Evidence`, `ArchitectureRule`, `RuleContext` types
- `@archlens/shared` — utilities
- `@archlens/analyzer` — `AnalysisResult` type (input)
- `@archlens/graph` — `DependencyGraph` type (input, for boundary rules)

---

## Testing Strategy

| Test Type   | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| Per-rule    | Each rule tested with analysis results designed to trigger/not trigger violations |
| Integration | Full rule set evaluated against fixture analysis results                          |
| Evidence    | Verify every violation includes complete evidence chain                           |
| Severity    | Verify correct severity classification                                            |

---

_End of RFC-005_
