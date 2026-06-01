// ============================================================
// @archlens/scoring — Grade Mapping
// ============================================================

import { GRADE, type Grade } from "@archlens/types";

/**
 * Maps a score (0 to 100) to an architectural letter grade.
 */
export function calculateGrade(score: number): Grade {
    if (score >= 90) return GRADE.A;
    if (score >= 80) return GRADE.B;
    if (score >= 70) return GRADE.C;
    if (score >= 60) return GRADE.D;
    return GRADE.F;
}
