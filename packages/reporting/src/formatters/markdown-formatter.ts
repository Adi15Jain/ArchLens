// ============================================================
// @archlens/reporting — Markdown Formatter
// ============================================================

import type { OutputFormatter, ReportInput, DimensionalScore, Violation, Risk } from '@archlens/types';

export class MarkdownFormatter implements OutputFormatter {
  readonly format = 'markdown';

  private getGradeEmoji(grade: string): string {
    switch (grade) {
      case 'A': return '🟢 **A**';
      case 'B': return '🟢 **B**';
      case 'C': return '🟡 **C**';
      case 'D': return '🟠 **D**';
      case 'F': return '🔴 **F**';
      default: return `**${grade}**`;
    }
  }

  render(input: ReportInput): string {
    const meta = input.metadata;
    const scores = input.scoreCard.scores;
    const md: string[] = [];

    md.push(`# ArchLens Architecture Audit Report`);
    md.push(`> Generated automatically by ArchLens Platform on ${new Date(meta.timestamp).toUTCString()}`);
    md.push('');

    // Summary Statistics Table
    md.push('## Executive Summary');
    md.push('');
    md.push('| Parameter | Metric |');
    md.push('| :--- | :--- |');
    md.push(`| **Target Repository** | \`${meta.repositoryPath}\` |`);
    md.push(`| **Source Files** | ${meta.fileCount} |`);
    md.push(`| **Analyzed Modules** | ${meta.moduleCount} |`);
    md.push(`| **Analysis Duration** | ${meta.analysisTimeMs} ms |`);
    md.push(`| **ArchLens Version** | \`v${meta.archlensVersion}\` |`);
    md.push('');

    // Scorecard Table
    md.push('## Architecture Score Card');
    md.push('');
    md.push('| Analysis Dimension | Score | Grade |');
    md.push('| :--- | :---: | :---: |');
    md.push(`| 🏆 **Overall Architecture** | **${scores.architecture.value.toFixed(1)} / 100** | ${this.getGradeEmoji(scores.architecture.grade)} |`);
    md.push(`| 🔗 Dependency Health | ${scores.dependencyHealth.value.toFixed(1)} / 100 | ${this.getGradeEmoji(scores.dependencyHealth.grade)} |`);
    md.push(`| 🛠️ Maintainability | ${scores.maintainability.value.toFixed(1)} / 100 | ${this.getGradeEmoji(scores.maintainability.grade)} |`);
    md.push(`| 💸 Technical Debt | ${scores.technicalDebt.value.toFixed(1)} / 100 | ${this.getGradeEmoji(scores.technicalDebt.grade)} |`);
    md.push(`| 🚀 Scalability | ${scores.scalability.value.toFixed(1)} / 100 | ${this.getGradeEmoji(scores.scalability.grade)} |`);
    md.push('');

    // Violations Block
    md.push('## Architectural Boundary & Rule Violations');
    md.push('');
    const violations = input.violationSet.violations;
    if (violations.length === 0) {
      md.push('✅ **No architectural boundary or layering violations detected. Excellent work!**');
      md.push('');
    } else {
      md.push(`⚠️ **Detected ${violations.length} architectural rule violations.**`);
      md.push('');
      md.push('| Severity | Rule | Message / Evidence | Affected Components |');
      md.push('| :---: | :--- | :--- | :--- |');
      for (const v of violations) {
        const severityEmoji = v.severity === 'error' ? '🔴 Error' : '🟡 Warning';
        const affected = v.modules.map(m => `\`${m.split('/').pop()}\``).join(', ');
        md.push(`| ${severityEmoji} | **${v.ruleName}** (\`${v.ruleId}\`) | ${v.message}<br/>*Evidence: ${v.evidence.description}* | ${affected} |`);
      }
      md.push('');
    }

    // Risk Assessment Block
    md.push('## Structural Risks & Recommendations');
    md.push('');
    const risks = input.riskAssessment.risks;
    if (risks.length === 0) {
      md.push('✅ **Low risk profile. No structural hotspots or architectural anomalies identified.**');
      md.push('');
    } else {
      md.push(`🚨 **Detected ${risks.length} structural architectural hotspots.**`);
      md.push('');
      for (const r of risks) {
        const sevEmoji = r.severity === 'high' ? '🔴' : '🟡';
        md.push(`### ${sevEmoji} ${r.title} (\`${r.category}\`)`);
        md.push(`- **Risk Severity**: **${r.severity.toUpperCase()}**`);
        md.push(`- **Affected Modules**: ${r.modules.map(m => `\`${m}\``).join(', ')}`);
        md.push(`- **Description**: ${r.description}`);
        md.push(`- **Recommendation**: 💡 *${r.recommendation}*`);
        md.push('');
      }
    }

    return md.join('\n');
  }
}
