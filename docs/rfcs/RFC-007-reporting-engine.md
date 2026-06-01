# RFC-007 — Reporting Engine

---

## Metadata

| Field       | Value                  |
| ----------- | ---------------------- |
| Document ID | RFC-007                |
| Version     | 1.0.0                  |
| Status      | DRAFT                  |
| Owner       | ArchLens Core Team     |
| Created     | 2026-06-02             |
| Phase       | Phase 3 — Package RFCs |
| Depends On  | RFC-006, ARCH-014      |
| Package     | `@archlens/reporting`  |

---

## Purpose

RFC for the `@archlens/reporting` package — responsible for rendering analysis results into formatted reports.

---

## Responsibility

Output layer. Takes `ScoreCard`, `ViolationSet`, `AnalysisResult`, and `RiskAssessment` and produces formatted output in the requested format.

---

## Public API

```typescript
interface ReportOptions {
    format: "console" | "markdown" | "json";
    outputPath?: string; // If set, write to file instead of returning string
}

interface ReportInput {
    scoreCard: ScoreCard;
    violationSet: ViolationSet;
    analysisResult: AnalysisResult;
    riskAssessment: RiskAssessment;
    metadata: ReportMetadata;
}

function generateReport(
    input: ReportInput,
    options: ReportOptions,
): Result<string, ReportError>;
```

---

## Internal Design

### Formatter Registry

```typescript
const formatters: Record<string, OutputFormatter> = {
    console: new ConsoleFormatter(),
    markdown: new MarkdownFormatter(),
    json: new JsonFormatter(),
};
```

`generateReport` looks up the requested formatter and delegates rendering.

### ConsoleFormatter

- Uses ANSI escape codes for colors.
- Score values colored by grade (green/yellow/red).
- Violations grouped by severity with icons (✖/⚠/ℹ).
- Compact layout — key information first, details on request.
- Respects `NO_COLOR` environment variable.

### MarkdownFormatter

- Produces valid GitHub Flavored Markdown.
- Tables for scores and violations.
- Headers for sections.
- Suitable for saving to file and embedding in PRs.

### JsonFormatter

- Produces valid JSON matching the versioned output schema.
- Schema version included in output.
- Deterministic key ordering for reproducibility.

### File Structure

```
packages/reporting/src/
├── index.ts
├── generate-report.ts
├── formatters/
│   ├── formatter.ts               // OutputFormatter interface
│   ├── console-formatter.ts
│   ├── markdown-formatter.ts
│   └── json-formatter.ts
└── utils/
    ├── colors.ts                   // ANSI color helpers
    └── tables.ts                   // Text table rendering
```

---

## Dependencies

- `@archlens/types` — all input types
- `@archlens/shared` — utilities
- No external dependencies for formatting (custom implementation)

---

## Testing Strategy

| Test Type     | Description                                               |
| ------------- | --------------------------------------------------------- |
| Per-formatter | Verify output structure for each format with known inputs |
| JSON schema   | Verify JSON output matches expected schema                |
| Console       | Verify color output and NO_COLOR support                  |
| File output   | Verify file write when outputPath is set                  |
| Determinism   | Same input produces identical output across runs          |

---

_End of RFC-007_
