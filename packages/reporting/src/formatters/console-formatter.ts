// ============================================================
// @archlens/reporting — Console Formatter
// ============================================================

import type { OutputFormatter, ReportInput, DimensionalScore, Violation, Risk } from '@archlens/types';
import { colors } from '../utils/colors.js';

export class ConsoleFormatter implements OutputFormatter {
  readonly format = 'console';

  private getGradeColor(grade: string): (text: string) => string {
    switch (grade) {
      case 'A':
        return (t) => colors.bold(colors.green(t));
      case 'B':
        return colors.green;
      case 'C':
        return colors.yellow;
      case 'D':
        return (t) => colors.bold(colors.yellow(t));
      case 'F':
        return (t) => colors.bold(colors.red(t));
      default:
        return colors.reset;
    }
  }

  private renderScoreRow(label: string, score: DimensionalScore): string {
    const colorFn = this.getGradeColor(score.grade);
    const paddedLabel = label.padEnd(25, ' ');
    const scoreVal = score.value.toFixed(1).padStart(5, ' ');
    const gradeStr = `[${score.grade}]`.padStart(5, ' ');
    return `${colors.dim('│')}  ${paddedLabel}  ${colors.bold(scoreVal)}  ${colorFn(gradeStr)}  ${colors.dim('│')}`;
  }

  render(input: ReportInput): string {
    const lines: string[] = [];
    const meta = input.metadata;
    const scores = input.scoreCard.scores;

    // Header block
    lines.push('');
    lines.push(colors.bold(colors.cyan('┌────────────────────────────────────────────────────────┐')));
    lines.push(`${colors.bold(colors.cyan('│'))}                  ${colors.bold(colors.cyan('A R C H L E N S'))}                     ${colors.bold(colors.cyan('│'))}`);
    lines.push(`${colors.bold(colors.cyan('│'))}           ${colors.dim('Architecture Intelligence Platform')}           ${colors.bold(colors.cyan('│'))}`);
    lines.push(colors.bold(colors.cyan('├────────────────────────────────────────────────────────┤')));
    
    // Metadata
    const repoLabel = meta.repositoryPath.length > 36 
      ? '...' + meta.repositoryPath.slice(-33) 
      : meta.repositoryPath;
    lines.push(`${colors.dim('│')}  Target: ${repoLabel.padEnd(36, ' ')}  v${meta.archlensVersion.padEnd(6, ' ')} ${colors.dim('│')}`);
    lines.push(`${colors.dim('│')}  Files:  ${meta.fileCount.toString().padEnd(8, ' ')} Modules: ${meta.moduleCount.toString().padEnd(8, ' ')} Time: ${meta.analysisTimeMs.toString().padEnd(5, ' ')}ms  ${colors.dim('│')}`);
    lines.push(colors.bold(colors.cyan('├────────────────────────────────────────────────────────┤')));

    // Score Card
    lines.push(`${colors.dim('│')}  ${colors.bold(colors.cyan('ARCHITECTURE SCORE CARD'))}                           ${colors.dim('│')}`);
    lines.push(`${colors.dim('│')}  ${colors.dim('----------------------------------------------------')}  ${colors.dim('│')}`);
    lines.push(this.renderScoreRow('Overall Architecture', scores.architecture));
    lines.push(`${colors.dim('│')}  ${colors.dim('----------------------------------------------------')}  ${colors.dim('│')}`);
    lines.push(this.renderScoreRow('Dependency Health', scores.dependencyHealth));
    lines.push(this.renderScoreRow('Maintainability', scores.maintainability));
    lines.push(this.renderScoreRow('Technical Debt', scores.technicalDebt));
    lines.push(this.renderScoreRow('Scalability', scores.scalability));
    lines.push(colors.bold(colors.cyan('└────────────────────────────────────────────────────────┘')));
    lines.push('');

    // Violations Block
    const violations = input.violationSet.violations;
    if (violations.length === 0) {
      lines.push(colors.bold(colors.green('  ✔ No architectural boundary or structural violations detected.')));
      lines.push('');
    } else {
      lines.push(colors.bold(colors.yellow(`  ⚠️  Architectural Violations (${violations.length} total)`)));
      lines.push('');

      // Sort by severity (error -> warning -> info)
      const sortedViolations = [...violations].sort((a, b) => {
        const severityWeight = { error: 3, warning: 2, info: 1 };
        return (severityWeight[b.severity] ?? 0) - (severityWeight[a.severity] ?? 0);
      });

      for (const v of sortedViolations) {
        const sevLabel = v.severity === 'error' 
          ? colors.bold(colors.red('[ERROR]')) 
          : colors.bold(colors.yellow('[WARN]'));
        
        lines.push(`  ${sevLabel} ${colors.bold(v.ruleName)} (${v.ruleId})`);
        lines.push(`  ${colors.dim('└')} ${v.message}`);
        if (v.evidence && v.evidence.description) {
          lines.push(`    ${colors.dim('Evidence: ')}${v.evidence.description}`);
        }
        lines.push('');
      }
    }

    // Risk Assessment Block
    const risks = input.riskAssessment.risks;
    if (risks.length > 0) {
      lines.push(colors.bold(colors.red('  🚨 Engineering Risk & Complexity Hotspots')));
      lines.push('');
      
      const sortedRisks = [...risks].sort((a, b) => {
        const rw = { high: 3, medium: 2, low: 1 };
        return rw[b.severity] - rw[a.severity];
      });

      for (const r of sortedRisks) {
        const severityStr = r.severity === 'high'
          ? colors.bold(colors.red('[HIGH]'))
          : colors.bold(colors.yellow('[MEDIUM]'));
        
        lines.push(`  ${severityStr} ${colors.bold(r.title)} (${r.category})`);
        lines.push(`  ${colors.dim('└')} ${r.description}`);
        lines.push(`  ${colors.dim('💡 Recommendation: ')}${r.recommendation}`);
        lines.push('');
      }
    } else {
      lines.push(colors.bold(colors.green('  ✔ Low risk profile. No critical structural anomalies detected.')));
      lines.push('');
    }

    return lines.join('\n');
  }
}
