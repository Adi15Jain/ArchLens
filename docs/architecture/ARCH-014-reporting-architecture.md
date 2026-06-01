# ARCH-014 — Reporting Architecture

---

## Metadata

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | ARCH-014                      |
| Version     | 1.0.0                         |
| Status      | DRAFT                         |
| Owner       | ArchLens Core Team            |
| Created     | 2026-06-02                    |
| Phase       | Phase 2 — System Architecture |
| Depends On  | ARCH-011, ARCH-012, ARCH-013  |

---

## Purpose

Specifies the reporting architecture — the component that transforms analysis results, scores, violations, and risk assessments into human-readable and machine-readable reports.

---

## Scope

- Report formats (Console, Markdown, JSON).
- Report structure and sections.
- Formatter interface.
- Exit code semantics.

---

## Report Inputs

The reporting engine receives all upstream outputs:

```
ReportInput {
  scoreCard: ScoreCard
  violationSet: ViolationSet
  analysisResult: AnalysisResult
  riskAssessment: RiskAssessment
  metadata: {
    repositoryPath: string
    timestamp: string
    archlensVersion: string
    moduleCount: number
    fileCount: number
    analysisTimeMs: number
  }
}
```

---

## Output Formats

### Console (Default)

Colorized terminal output for interactive use.

**Structure**:

```
╔══════════════════════════════════════╗
║        ArchLens Analysis Report      ║
╠══════════════════════════════════════╣

Repository: /path/to/repo
Files analyzed: 142
Analysis time: 1.2s

──── Architecture Score ────
  Overall:           72 / 100  (C)
  Dependency Health:  65 / 100  (C)
  Maintainability:    78 / 100  (B)
  Technical Debt:     80 / 100  (B)
  Scalability:        62 / 100  (C)

──── Violations (7 total) ────
  ✖ ERROR   2 circular dependency clusters
  ⚠ WARNING 3 modules exceed max fan-out (15)
  ⚠ WARNING 1 dependency chain exceeds max depth (10)
  ℹ INFO    1 orphan module detected

──── Top Risks ────
  🔴 HIGH   Change propagation risk: src/core/registry.ts
  🟡 MEDIUM Bottleneck risk: src/utils/helpers.ts

──── Summary ────
  Architecture score 72 is below threshold 80.
  Exit code: 1
```

**Color scheme**:

- Grade A/B: Green
- Grade C: Yellow
- Grade D/F: Red
- Error violations: Red
- Warning violations: Yellow
- Info violations: Dim/Gray

---

### Markdown

Full report in Markdown format, suitable for saving to file or embedding in documentation/PRs.

**Structure**:

```markdown
# ArchLens Analysis Report

## Metadata

- Repository: /path/to/repo
- Date: 2026-06-02T12:00:00Z
- Files: 142
- Duration: 1.2s

## Scores

| Dimension         | Score | Grade |
| ----------------- | ----- | ----- |
| Architecture      | 72    | C     |
| Dependency Health | 65    | C     |
| Maintainability   | 78    | B     |
| Technical Debt    | 80    | B     |
| Scalability       | 62    | C     |

## Score Details

### Dependency Health (65/100)

- cyclePenalty: -20 (2 circular dependency clusters)
- depthPenalty: -10 (max depth 12, threshold 10)
- instabilityPenalty: -5 (average instability 0.72)

## Violations

### Errors

1. **no-circular-deps**: Circular dependency: src/auth/session.ts → src/auth/token.ts → src/auth/session.ts
   ...

### Warnings

...

### Info

...

## Risk Assessment

### High

- **Change propagation risk**: src/core/registry.ts (fan-in: 34, centrality: 0.82)
  ...

## Dependency Graph Summary

- Nodes: 142
- Edges: 389
- Density: 0.019
- Cycles: 2
- Max depth: 12
```

---

### JSON

Machine-readable structured output for CI integration and downstream tooling.

**Structure**:

```json
{
  "version": "1.0.0",
  "metadata": {
    "repository": "/path/to/repo",
    "timestamp": "2026-06-02T12:00:00Z",
    "fileCount": 142,
    "analysisTimeMs": 1200
  },
  "scores": {
    "architecture": { "value": 72, "grade": "C", "penalties": [...] },
    "dependencyHealth": { "value": 65, "grade": "C", "penalties": [...] },
    "maintainability": { "value": 78, "grade": "B", "penalties": [...] },
    "technicalDebt": { "value": 80, "grade": "B", "penalties": [...] },
    "scalability": { "value": 62, "grade": "C", "penalties": [...] }
  },
  "violations": [...],
  "risks": [...],
  "graph": {
    "nodeCount": 142,
    "edgeCount": 389,
    "density": 0.019,
    "cycleCount": 2,
    "maxDepth": 12
  }
}
```

JSON output schema is versioned. The `version` field enables consumers to handle schema evolution.

---

## Formatter Interface

```
OutputFormatter {
  format: 'console' | 'markdown' | 'json'
  render(input: ReportInput): string
}
```

Each format is a separate implementation of `OutputFormatter`. Adding a new format (e.g., HTML, SARIF) requires only a new implementation — no changes to existing code.

---

## Exit Code Semantics

| Exit Code | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| 0         | Analysis completed. Architecture score meets or exceeds threshold (or no threshold set). |
| 1         | Analysis completed. Architecture score below threshold.                                  |
| 2         | Analysis failed. Input error (path not found, no source files).                          |
| 3         | Analysis failed. Internal error (bug).                                                   |

Default threshold: none (exit code 0 unless `--threshold` flag is set).

---

## Report Extensibility (Post-MVP)

| Format            | Description                                     | Target                           |
| ----------------- | ----------------------------------------------- | -------------------------------- |
| HTML              | Self-contained HTML report with embedded charts | File output                      |
| SARIF             | Static Analysis Results Interchange Format      | GitHub code scanning integration |
| GitHub PR Comment | Formatted summary for PR annotations            | GitHub Actions integration       |

---

## Decision Log

| ID     | Decision                                   | Rationale                                                       |
| ------ | ------------------------------------------ | --------------------------------------------------------------- |
| DL-057 | 3 formats in MVP (console, markdown, JSON) | Covers interactive use, documentation, and CI integration       |
| DL-058 | Console is default format                  | Optimal for first-use experience (zero-config, immediate value) |
| DL-059 | JSON schema is versioned                   | Prevents breaking downstream consumers                          |
| DL-060 | 4 exit codes with clear semantics          | Enables CI scripting and quality gates                          |
| DL-061 | Formatter interface for extensibility      | New formats don't require core changes                          |

---

_End of ARCH-014_
