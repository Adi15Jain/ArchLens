// ============================================================
// @archlens/types — Public API
// ============================================================

export type {
    Result,
    ArchLensError,
    Severity,
    Grade,
    EdgeType,
} from "./common.js";
export { SEVERITY, GRADE, EDGE_TYPE } from "./common.js";

export type {
    ScannerConfig,
    FileEntry,
    FileManifest,
    ScannerError,
} from "./scanner.js";

export type {
    ImportDeclaration,
    ExportDeclaration,
    ModuleInfo,
    ModuleMap,
    ParserError,
} from "./parser.js";

export type { GraphNode, GraphEdge, DependencyGraph, Cycle } from "./graph.js";

export type {
    ModuleMetrics,
    GraphMetrics,
    PatternMatch,
    Anomaly,
    AnalysisResult,
} from "./analyzer.js";

export type {
    Evidence,
    Violation,
    ViolationSet,
    RuleContext,
    ArchitectureRule,
    RuleSet,
} from "./rules.js";

export type { Penalty, DimensionalScore, ScoreCard } from "./scoring.js";

export type { RiskCategory, Risk, RiskAssessment } from "./risk.js";
export { RISK_CATEGORY } from "./risk.js";

export type {
    ReportMetadata,
    ReportInput,
    ReportOptions,
    OutputFormatter,
} from "./reporting.js";

export type { AnalyzeOptions, CLIOptions } from "./config.js";
