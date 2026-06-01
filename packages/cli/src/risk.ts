// ============================================================
// @archlens/cli — Structural Risk Assessment
// ============================================================

import type { AnalysisResult, ViolationSet, RiskAssessment, Risk, RiskCategory } from '@archlens/types';

/**
 * Conducts a risk assessment based on structural analysis and rule violations.
 */
export function assessRisks(
  analysis: AnalysisResult,
  violations: ViolationSet
): RiskAssessment {
  const risks: Risk[] = [];

  // 1. Circular Dependency Risks
  if (analysis.cycles.length > 0) {
    const cycleModules = new Set<string>();
    for (const c of analysis.cycles) {
      for (const n of c.nodes) {
        cycleModules.add(n);
      }
    }
    risks.push({
      id: 'risk-circular-deps',
      category: 'circular-dependency',
      severity: 'high',
      title: 'Cyclic Dependency Architectures',
      description: `Detected ${analysis.cycles.length} circular dependency loop(s) involving ${cycleModules.size} modules. Cycles make packages tightly coupled, prevent independent updates, and break modular testing.`,
      modules: Array.from(cycleModules),
      metrics: { cycles: analysis.cycles.length, affectedModules: cycleModules.size },
      recommendation: 'Break the circular dependency path by refactoring shared code into a lower-level module, or inject dependencies via interfaces (Dependency Inversion Principle).',
    });
  }

  // 2. Bottleneck Risks
  const bottlenecks = analysis.patterns.bottlenecks;
  if (bottlenecks.length > 0) {
    risks.push({
      id: 'risk-bottlenecks',
      category: 'bottleneck',
      severity: 'high',
      title: 'Critical Structural Bottlenecks',
      description: `Detected ${bottlenecks.length} module bottleneck(s) that lie on a high proportion of shortest dependency paths. A failure or change in these modules risks global regression.`,
      modules: bottlenecks.map((b) => b.moduleId),
      metrics: { bottlenecks: bottlenecks.length },
      recommendation: 'Break up bottleneck modules into smaller, highly specialized files or decouple their dependants using interfaces.',
    });
  }

  // 3. Complexity Growth (God Modules) Risks
  const godModules = analysis.patterns.godModules;
  if (godModules.length > 0) {
    risks.push({
      id: 'risk-god-modules',
      category: 'complexity-growth',
      severity: 'medium',
      title: 'Cognitive Complexity God Modules',
      description: `Detected ${godModules.length} god module(s) that aggregate excessive imports/exports. These are likely to become modification hotspots and sources of bugs.`,
      modules: godModules.map((g) => g.moduleId),
      metrics: { godModules: godModules.length },
      recommendation: 'Decompose god modules using the Single Responsibility Principle, separating data structures from orchestration logic.',
    });
  }

  // 4. Boundary Erosion Risks
  const boundaryViolations = violations.violations.filter((v) => v.ruleId === 'boundary-violation');
  if (boundaryViolations.length > 0) {
    const affected = new Set<string>();
    for (const v of boundaryViolations) {
      for (const m of v.modules) {
        affected.add(m);
      }
    }
    risks.push({
      id: 'risk-boundary-erosion',
      category: 'boundary-erosion',
      severity: 'high',
      title: 'Architectural Layer Boundary Erosion',
      description: `Detected ${boundaryViolations.length} boundary violation(s), indicating direct imports from higher layers to lower layer components (e.g. shared importing UI components).`,
      modules: Array.from(affected),
      metrics: { violations: boundaryViolations.length },
      recommendation: 'Review imports and revert them. High-level UI/business components should depend on shared utilities, never vice-versa.',
    });
  }

  // 5. Change Propagation Risks
  const hubs = analysis.patterns.hubs;
  if (hubs.length > 0) {
    risks.push({
      id: 'risk-hubs',
      category: 'change-propagation',
      severity: 'medium',
      title: 'High Change Propagation Potential',
      description: `Detected ${hubs.length} coordinator hub(s) with high incoming and outgoing dependencies. Changes in these hubs will rapidly ripple across the entire system.`,
      modules: hubs.map((h) => h.moduleId),
      metrics: { hubs: hubs.length },
      recommendation: 'Stabilize hub modules by limiting their outward dependencies, or encapsulate them behind a strict API boundary.',
    });
  }

  // Calculate Risk Assessment Summary
  let high = 0;
  let medium = 0;
  let low = 0;
  const byCategory: Record<string, number> = {};

  for (const r of risks) {
    if (r.severity === 'high') high++;
    else if (r.severity === 'medium') medium++;
    else low++;

    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }

  return {
    risks,
    summary: {
      total: risks.length,
      bySeverity: { high, medium, low },
      byCategory,
    },
  };
}
