// ============================================================
// @archlens/scoring — Penalty Builder & Calculator
// ============================================================

import type { Penalty, DimensionalScore } from "@archlens/types";
import { calculateGrade } from "./grade.js";

export class ScoreCalculator {
    private base = 100;
    private penalties: Penalty[] = [];

    addPenalty(
        name: string,
        value: number,
        reason: string,
        modules: readonly string[] = [],
    ): void {
        if (value <= 0) return;
        this.penalties.push({ name, value, reason, modules });
    }

    getScore(): DimensionalScore {
        const totalDeductions = this.penalties.reduce(
            (sum, p) => sum + p.value,
            0,
        );
        const scoreVal = Math.max(
            0,
            Math.min(100, this.base - totalDeductions),
        );

        return {
            value: Math.round(scoreVal * 10) / 10, // Round to 1 decimal place
            grade: calculateGrade(scoreVal),
            penalties: this.penalties,
        };
    }
}
