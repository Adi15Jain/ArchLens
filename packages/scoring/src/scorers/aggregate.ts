// ============================================================
// @archlens/scoring — Aggregate Architecture Scorer
// ============================================================

import type { DimensionalScore } from '@archlens/types';
import { calculateGrade } from '../grade.js';

/**
 * Computes the overall aggregate Architecture Score card.
 */
export function scoreAggregate(
  depHealth: DimensionalScore,
  maintainability: DimensionalScore,
  techDebt: DimensionalScore,
  scalability: DimensionalScore
): DimensionalScore {
  // Weights:
  // - Dependency Health: 35%
  // - Maintainability: 25%
  // - Technical Debt: 20%
  // - Scalability: 20%
  const scoreVal =
    depHealth.value * 0.35 +
    maintainability.value * 0.25 +
    techDebt.value * 0.20 +
    scalability.value * 0.20;

  // Aggregate penalties from the sub-scores
  const allPenalties = [
    ...depHealth.penalties,
    ...maintainability.penalties,
    ...techDebt.penalties,
    ...scalability.penalties,
  ];

  return {
    value: Math.round(scoreVal * 10) / 10,
    grade: calculateGrade(scoreVal),
    penalties: allPenalties,
  };
}
