// ============================================================
// @archlens/reporting — JSON Formatter
// ============================================================

import type { OutputFormatter, ReportInput } from '@archlens/types';

export class JsonFormatter implements OutputFormatter {
  readonly format = 'json';

  render(input: ReportInput): string {
    return JSON.stringify(
      {
        timestamp: input.metadata.timestamp,
        archlensVersion: input.metadata.archlensVersion,
        repositoryPath: input.metadata.repositoryPath,
        moduleCount: input.metadata.moduleCount,
        fileCount: input.metadata.fileCount,
        analysisTimeMs: input.metadata.analysisTimeMs,
        scoreCard: {
          scores: {
            architecture: {
              value: input.scoreCard.scores.architecture.value,
              grade: input.scoreCard.scores.architecture.grade,
            },
            dependencyHealth: {
              value: input.scoreCard.scores.dependencyHealth.value,
              grade: input.scoreCard.scores.dependencyHealth.grade,
            },
            maintainability: {
              value: input.scoreCard.scores.maintainability.value,
              grade: input.scoreCard.scores.maintainability.grade,
            },
            technicalDebt: {
              value: input.scoreCard.scores.technicalDebt.value,
              grade: input.scoreCard.scores.technicalDebt.grade,
            },
            scalability: {
              value: input.scoreCard.scores.scalability.value,
              grade: input.scoreCard.scores.scalability.grade,
            },
          },
          penalties: input.scoreCard.scores.architecture.penalties,
        },
        violations: input.violationSet.violations,
        anomalies: input.analysisResult.anomalies,
        patterns: {
          hubs: input.analysisResult.patterns.hubs.map((h) => h.moduleId),
          godModules: input.analysisResult.patterns.godModules.map((g) => g.moduleId),
          bottlenecks: input.analysisResult.patterns.bottlenecks.map((b) => b.moduleId),
          orphans: input.analysisResult.patterns.orphans.map((o) => o.moduleId),
        },
        risks: input.riskAssessment.risks,
      },
      null,
      2
    );
  }
}
