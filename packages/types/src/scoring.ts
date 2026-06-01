// ============================================================
// @archlens/types — Scoring Types
// ============================================================

import type { Grade } from "./common.js";

/**
 * A single penalty contributing to a score deduction.
 * Carries the evidence chain explaining the deduction.
 */
export interface Penalty {
    readonly name: string;
    readonly value: number;
    readonly reason: string;
    readonly modules: readonly string[];
}

/**
 * A score along one dimension with its grade and penalty breakdown.
 */
export interface DimensionalScore {
    readonly value: number;
    readonly grade: Grade;
    readonly penalties: readonly Penalty[];
}

/**
 * The complete set of architecture scores.
 */
export interface ScoreCard {
    readonly scores: {
        readonly architecture: DimensionalScore;
        readonly dependencyHealth: DimensionalScore;
        readonly maintainability: DimensionalScore;
        readonly technicalDebt: DimensionalScore;
        readonly scalability: DimensionalScore;
    };
    readonly timestamp: string;
    readonly repositoryPath: string;
    readonly moduleCount: number;
}
