// ============================================================
// @archlens/types — Analyzer Types
// ============================================================

/**
 * Per-module computed metrics.
 */
export interface ModuleMetrics {
    readonly moduleId: string;
    readonly fanIn: number;
    readonly fanOut: number;
    readonly instability: number;
    readonly depth: number;
    readonly betweenness: number;
}

/**
 * Graph-level aggregate metrics.
 */
export interface GraphMetrics {
    readonly cycleCount: number;
    readonly cycleSizeDistribution: readonly number[];
    readonly maxDepth: number;
    readonly averageFanOut: number;
    readonly density: number;
    readonly moduleCount: number;
    readonly edgeCount: number;
    readonly orphanCount: number;
    readonly unresolvedImportCount: number;
}

/**
 * A structural pattern detected in the architecture.
 */
export interface PatternMatch {
    readonly moduleId: string;
    readonly patternType:
        | "hub"
        | "god-module"
        | "bottleneck"
        | "orphan"
        | "leaf";
    readonly metrics: Record<string, number>;
    readonly evidence: string;
}

/**
 * A structural anomaly detected in the architecture.
 */
export interface Anomaly {
    readonly type: string;
    readonly description: string;
    readonly modules: readonly string[];
    readonly severity: "high" | "medium" | "low";
}

/**
 * The complete output of the analysis stage.
 */
export interface AnalysisResult {
    readonly metrics: {
        readonly modules: ReadonlyMap<string, ModuleMetrics>;
        readonly graph: GraphMetrics;
    };
    readonly patterns: {
        readonly hubs: readonly PatternMatch[];
        readonly godModules: readonly PatternMatch[];
        readonly bottlenecks: readonly PatternMatch[];
        readonly orphans: readonly PatternMatch[];
        readonly leafModules: readonly PatternMatch[];
    };
    readonly cycles: readonly import("./graph.js").Cycle[];
    readonly anomalies: readonly Anomaly[];
}
