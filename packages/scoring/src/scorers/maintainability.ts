// ============================================================
// @archlens/scoring — Maintainability Scorer
// ============================================================

import type {
    AnalysisResult,
    ViolationSet,
    DimensionalScore,
} from "@archlens/types";
import { ScoreCalculator } from "../penalties.js";

/**
 * Computes the Maintainability score (0-100).
 * Focuses on dead code (orphans), excessive coupling (fan-out), and cognitive complexity (god modules).
 */
export function scoreMaintainability(
    analysis: AnalysisResult,
    violations: ViolationSet,
): DimensionalScore {
    const calc = new ScoreCalculator();

    // 1. Orphan modules (Dead code)
    const orphans = analysis.patterns.orphans;
    if (orphans.length > 0) {
        const deduction = Math.min(20, orphans.length * 5);
        calc.addPenalty(
            "Orphan Modules",
            deduction,
            `Detected ${orphans.length} isolated orphan modules (possible dead code).`,
            orphans.map((m) => m.moduleId),
        );
    }

    // 2. Excess Fan-Out
    const fanOutViolations = violations.violations.filter(
        (v) => v.ruleId === "max-fan-out",
    );
    if (fanOutViolations.length > 0) {
        const deduction = Math.min(30, fanOutViolations.length * 5);
        calc.addPenalty(
            "High Coupling (Fan-Out)",
            deduction,
            `Detected ${fanOutViolations.length} modules exceeding the standard coupling limits.`,
            fanOutViolations.map((v) => v.modules[0] ?? ""),
        );
    }

    // 3. God Modules
    const godModules = analysis.patterns.godModules;
    if (godModules.length > 0) {
        const deduction = Math.min(45, godModules.length * 15);
        calc.addPenalty(
            "God Modules",
            deduction,
            `Detected ${godModules.length} high-complexity god modules (cognitive load centers).`,
            godModules.map((m) => m.moduleId),
        );
    }

    return calc.getScore();
}
