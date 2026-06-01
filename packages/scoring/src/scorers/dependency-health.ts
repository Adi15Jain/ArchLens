// ============================================================
// @archlens/scoring — Dependency Health Scorer
// ============================================================

import type {
    AnalysisResult,
    ViolationSet,
    DimensionalScore,
} from "@archlens/types";
import { ScoreCalculator } from "../penalties.js";

/**
 * Computes the Dependency Health score (0-100).
 * Reflects cycles, boundary violations, and stable dependency violations.
 */
export function scoreDependencyHealth(
    analysis: AnalysisResult,
    violations: ViolationSet,
): DimensionalScore {
    const calc = new ScoreCalculator();

    // 1. Cycles
    const cycles = analysis.cycles;
    if (cycles.length > 0) {
        const cycleModules = new Set<string>();
        for (const c of cycles) {
            for (const m of c.nodes) {
                cycleModules.add(m);
            }
        }
        const deduction = Math.min(60, cycles.length * 15);
        calc.addPenalty(
            "Circular Dependencies",
            deduction,
            `Detected ${cycles.length} circular dependency cycles, involving ${cycleModules.size} modules.`,
            Array.from(cycleModules),
        );
    }

    // 2. Boundary Violations
    const boundaryViolations = violations.violations.filter(
        (v) => v.ruleId === "boundary-violation",
    );
    if (boundaryViolations.length > 0) {
        const affectedModules = new Set<string>();
        for (const v of boundaryViolations) {
            for (const m of v.modules) {
                affectedModules.add(m);
            }
        }
        const deduction = Math.min(40, boundaryViolations.length * 10);
        calc.addPenalty(
            "Layer Boundary Violations",
            deduction,
            `Detected ${boundaryViolations.length} boundary violations, breaking modular layering rules.`,
            Array.from(affectedModules),
        );
    }

    // 3. Stable Dependencies Principle (SDP) Violations
    const sdpAnomaly = analysis.anomalies.find(
        (a) => a.type === "stable-dependency-violation",
    );
    if (sdpAnomaly && sdpAnomaly.modules.length > 0) {
        const deduction = Math.min(25, sdpAnomaly.modules.length * 5);
        calc.addPenalty(
            "Stable Dependencies Violations",
            deduction,
            `Highly stable components depend on unstable components (${sdpAnomaly.modules.length} instances).`,
            sdpAnomaly.modules,
        );
    }

    return calc.getScore();
}
