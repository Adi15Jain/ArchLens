# RFC-008 — CLI Package

---

## Metadata

| Field       | Value                   |
| ----------- | ----------------------- |
| Document ID | RFC-008                 |
| Version     | 1.0.0                   |
| Status      | DRAFT                   |
| Owner       | ArchLens Core Team      |
| Created     | 2026-06-02              |
| Phase       | Phase 3 — Package RFCs  |
| Depends On  | RFC-001 through RFC-007 |
| Package     | `@archlens/cli`         |

---

## Purpose

RFC for the `@archlens/cli` package — the top-level orchestrator that provides the command-line interface and drives the analysis pipeline.

---

## Responsibility

Orchestration layer. Parses user input, configures pipeline stages, executes the analysis pipeline, and handles output and exit codes.

---

## Public API (CLI Commands)

### `archlens analyze <path>`

Full analysis: scan → parse → graph → analyze → rules → score → report.

| Flag            | Type                          | Default   | Description                                  |
| --------------- | ----------------------------- | --------- | -------------------------------------------- |
| `--format`      | `console \| markdown \| json` | `console` | Output format                                |
| `--output`      | `string`                      | —         | Write report to file path                    |
| `--exclude`     | `string[]`                    | —         | Additional exclusion patterns                |
| `--threshold`   | `number`                      | —         | Minimum architecture score (exit 1 if below) |
| `--granularity` | `file \| package`             | `file`    | Graph granularity level                      |

### `archlens score <path>`

Scores only (no violations or detailed report).

### `archlens violations <path>`

Violations only (no scores or detailed report).

### `archlens graph <path>`

Dependency graph output (JSON format with nodes and edges).

### `archlens --version`

Print version and exit.

### `archlens --help`

Print usage help and exit.

---

## Internal Design

### Command Parser

Uses a lightweight argument parser (custom or `citty`). No heavy framework — ArchLens's CLI is simple enough to not warrant a complex CLI framework.

**Why not Commander/Yargs**: Minimizing external dependencies (ARCH-004 P11). The CLI has 4 commands with a handful of flags — a lightweight approach is sufficient.

### Pipeline Orchestration

```typescript
async function runAnalyze(options: AnalyzeOptions): Promise<number> {
    // 1. Scan
    const manifest = await scan({
        rootPath: options.path,
        extensions: DEFAULT_EXTENSIONS,
        exclude: [...DEFAULT_EXCLUDES, ...options.exclude],
    });
    if (manifest.isErr()) return handleError(manifest.error);

    // 2. Parse
    const moduleMap = await parse(manifest.value);
    if (moduleMap.isErr()) return handleError(moduleMap.error);

    // 3. Build Graph
    const graph = buildGraph(moduleMap.value);
    const displayGraph =
        options.granularity === "package" ? collapseToPackages(graph) : graph;

    // 4. Analyze
    const analysis = analyze(displayGraph);

    // 5. Rules
    const violations = evaluateRules(
        analysis,
        displayGraph,
        getDefaultRuleSet(),
    );

    // 6. Score
    const scores = computeScores(analysis, violations);

    // 7. Risk Assessment
    const risks = assessRisks(analysis, violations);

    // 8. Report
    const report = generateReport(
        {
            scoreCard: scores,
            violationSet: violations,
            analysisResult: analysis,
            riskAssessment: risks,
            metadata: buildMetadata(options, manifest.value),
        },
        { format: options.format, outputPath: options.output },
    );

    if (report.isErr()) return handleError(report.error);

    // 9. Output
    if (!options.output) console.log(report.value);

    // 10. Exit code
    if (
        options.threshold &&
        scores.scores.architecture.value < options.threshold
    ) {
        return 1;
    }
    return 0;
}
```

### Exit Code Handling

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 0    | Success (or no threshold set)      |
| 1    | Architecture score below threshold |
| 2    | Input error                        |
| 3    | Internal error                     |

### File Structure

```
packages/cli/src/
├── index.ts                    // Entry point, process.argv handling
├── commands/
│   ├── analyze.ts
│   ├── score.ts
│   ├── violations.ts
│   └── graph.ts
├── options.ts                  // Argument parsing and validation
├── orchestrate.ts              // Pipeline orchestration
└── errors.ts                   // Error formatting for CLI output
```

---

## Binary Entry Point

The CLI package defines a `bin` entry in `package.json`:

```json
{
    "bin": {
        "archlens": "./dist/index.js"
    }
}
```

Supports both `npx archlens analyze .` (no install) and global install via `pnpm add -g archlens`.

---

## Dependencies

- `@archlens/scanner`, `@archlens/parser`, `@archlens/graph`, `@archlens/analyzer`, `@archlens/rules`, `@archlens/scoring`, `@archlens/reporting` — all pipeline packages
- `@archlens/types`, `@archlens/shared` — foundation packages
- Minimal external dependencies (argument parser only if needed)

---

## Testing Strategy

| Test Type      | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| Integration    | Run CLI commands against fixture repositories, verify output and exit codes |
| Flag parsing   | Verify all flag combinations are parsed correctly                           |
| Error handling | Verify error messages for invalid paths, bad flags                          |
| Exit codes     | Verify correct exit codes for threshold pass/fail                           |
| E2E            | Full `npx archlens analyze .` on ArchLens's own repository                  |

---

_End of RFC-008_
