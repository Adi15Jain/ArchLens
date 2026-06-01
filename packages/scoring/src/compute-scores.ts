// ============================================================
// @archlens/scoring — Score Orchestration
// ============================================================

import type { AnalysisResult, ViolationSet, ScoreCard } from '@archlens/types';
import { scoreDependencyHealth } from './scorers/dependency-health.js';
import { scoreMaintainability } from './scorers/maintainability.js';
import { scoreTechnicalDebt } from './scorers/technical-debt.js';
import { scoreScalability } from './scorers/scalability.js';
import { scoreAggregate } from './scorers/aggregate.js';

/**
 * Computes all architectural scores and compiles the complete ScoreCard.
 */
export function computeScores(
  analysis: AnalysisResult,
  violations: ViolationSet,
  repositoryPath: string
): ScoreCard {
  const dependencyHealth = scoreDependencyHealth(analysis, violations);
  const maintainability = scoreMaintainability(analysis, violations);
  const technicalDebt = scoreTechnicalDebt(analysis, violations);
  const scalability = scoreScalability(analysis, violations);
  const architecture = scoreAggregate(
    dependencyHealth,
    maintainability,
    technicalDebt,
    scalability
  );

  return {
    scores: {
      architecture,
      dependencyHealth,
      maintainability,
      technicalDebt,
      scalability,
    },
    timestamp: new Date().toISOString(),
    repositoryPath,
    moduleCount: analysis.metrics.graph.moduleCount,
  };
}
