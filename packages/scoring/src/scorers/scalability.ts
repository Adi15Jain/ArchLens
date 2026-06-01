// ============================================================
// @archlens/scoring — Scalability Scorer
// ============================================================

import type { AnalysisResult, ViolationSet, DimensionalScore } from '@archlens/types';
import { ScoreCalculator } from '../penalties.js';

/**
 * Computes the Scalability score (0-100).
 * Assesses graph density, structural depth, and structural hubs.
 */
export function scoreScalability(
  analysis: AnalysisResult,
  violations: ViolationSet
): DimensionalScore {
  const calc = new ScoreCalculator();

  // 1. Graph Density (high density hinders horizontal scale & build parallelization)
  const density = analysis.metrics.graph.density;
  if (density > 0.08) {
    const excess = density - 0.08;
    const deduction = Math.min(30, Math.round(excess * 150));
    calc.addPenalty(
      'High Graph Density',
      deduction,
      `Dependency graph density is high (${(density * 100).toFixed(2)}%), indicating tight global coupling.`
    );
  }

  // 2. Max Dependency Depth
  const maxDepth = analysis.metrics.graph.maxDepth;
  if (maxDepth > 6) {
    const excess = maxDepth - 6;
    const deduction = Math.min(25, excess * 5);
    calc.addPenalty(
      'Deep Dependency Paths',
      deduction,
      `Maximum dependency depth is ${maxDepth}, exceeding optimal parallelism threshold (6).`
    );
  }

  // 3. Concentration of Hub Modules
  const hubs = analysis.patterns.hubs;
  if (hubs.length > 0) {
    const deduction = Math.min(45, hubs.length * 8);
    calc.addPenalty(
      'Hub Module Concentration',
      deduction,
      `Detected ${hubs.length} coupling hubs that act as bottleneck coordination points.`,
      hubs.map((h) => h.moduleId)
    );
  }

  return calc.getScore();
}
