// ============================================================
// @archlens/scoring — Technical Debt Scorer
// ============================================================

import type { AnalysisResult, ViolationSet, DimensionalScore } from '@archlens/types';
import { ScoreCalculator } from '../penalties.js';

/**
 * Computes the Technical Debt score (0-100).
 * Reflects broken references, structural bottlenecks, and rule violations.
 */
export function scoreTechnicalDebt(
  analysis: AnalysisResult,
  violations: ViolationSet
): DimensionalScore {
  const calc = new ScoreCalculator();

  // 1. Unresolved Imports (Broken dependencies)
  const unresolved = analysis.metrics.graph.unresolvedImportCount;
  if (unresolved > 0) {
    const deduction = Math.min(30, unresolved * 3);
    calc.addPenalty(
      'Unresolved/Broken Imports',
      deduction,
      `Detected ${unresolved} import statements referencing missing or external modules.`,
      []
    );
  }

  // 2. Critical Bottlenecks
  const bottlenecks = analysis.patterns.bottlenecks;
  if (bottlenecks.length > 0) {
    const deduction = Math.min(40, bottlenecks.length * 10);
    calc.addPenalty(
      'Structural Bottlenecks',
      deduction,
      `Detected ${bottlenecks.length} critical dependency bottlenecks (high betweenness, low fan-out).`,
      bottlenecks.map((m) => m.moduleId)
    );
  }

  // 3. Overall Violation Density
  const errors = violations.summary.bySeverity.error ?? 0;
  const warnings = violations.summary.bySeverity.warning ?? 0;
  if (errors > 0 || warnings > 0) {
    const deduction = Math.min(30, errors * 5 + warnings * 2);
    calc.addPenalty(
      'Architectural Rule Violations',
      deduction,
      `Detected ${errors} architectural errors and ${warnings} architectural warnings.`,
      []
    );
  }

  return calc.getScore();
}
