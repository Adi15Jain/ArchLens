// ============================================================
// @archlens/types — Rules Types
// ============================================================

import type { Severity } from "./common.js";
import type { AnalysisResult } from "./analyzer.js";
import type { DependencyGraph } from "./graph.js";

/**
 * Evidence supporting a violation — traceable to structural facts.
 */
export interface Evidence {
    readonly description: string;
    readonly metrics: Record<string, number>;
    readonly chain: readonly string[];
}

/**
 * A single architectural violation produced by a rule.
 */
export interface Violation {
    readonly ruleId: string;
    readonly ruleName: string;
    readonly severity: Severity;
    readonly message: string;
    readonly modules: readonly string[];
    readonly evidence: Evidence;
}

/**
 * The complete set of violations from all rules.
 */
export interface ViolationSet {
    readonly violations: readonly Violation[];
    readonly summary: {
        readonly total: number;
        readonly bySeverity: Readonly<Record<Severity, number>>;
        readonly byRule: Readonly<Record<string, number>>;
    };
}

/**
 * Context provided to each rule during evaluation.
 */
export interface RuleContext {
    readonly graph: DependencyGraph;
    readonly analysis: AnalysisResult;
    readonly config: Record<string, unknown>;
}

/**
 * Interface that all architecture rules implement.
 */
export interface ArchitectureRule {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly severity: Severity;
    evaluate(context: RuleContext): Violation[];
}

/**
 * A set of rules to evaluate.
 */
export interface RuleSet {
    readonly rules: readonly ArchitectureRule[];
}
