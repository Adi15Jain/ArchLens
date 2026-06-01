// ============================================================
// @archlens/types — Reporting Types
// ============================================================

import type { ScoreCard } from "./scoring.js";
import type { ViolationSet } from "./rules.js";
import type { AnalysisResult } from "./analyzer.js";
import type { RiskAssessment } from "./risk.js";
import type { DependencyGraph } from "./graph.js";

/**
 * Metadata about the analysis run, included in reports.
 */
export interface ReportMetadata {
    readonly repositoryPath: string;
    readonly timestamp: string;
    readonly archlensVersion: string;
    readonly moduleCount: number;
    readonly fileCount: number;
    readonly analysisTimeMs: number;
}

/**
 * All data needed to generate a report.
 */
export interface ReportInput {
    readonly scoreCard: ScoreCard;
    readonly violationSet: ViolationSet;
    readonly analysisResult: AnalysisResult;
    readonly riskAssessment: RiskAssessment;
    readonly metadata: ReportMetadata;
    readonly graph: DependencyGraph;
}

/**
 * Options controlling report generation.
 */
export interface ReportOptions {
    readonly format: "console" | "markdown" | "json";
    readonly outputPath?: string;
}

/**
 * Interface for output formatters.
 */
export interface OutputFormatter {
    readonly format: string;
    render(input: ReportInput): string;
}
