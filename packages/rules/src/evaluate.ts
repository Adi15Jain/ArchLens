// ============================================================
// @archlens/rules — Rule Evaluation Loop
// ============================================================

import type {
    RuleContext,
    RuleSet,
    ViolationSet,
    Violation,
} from "@archlens/types";
import { logger } from "@archlens/shared";

/**
 * Evaluates a set of architectural rules against the dependency graph and analysis results.
 */
export function evaluateRules(
    context: RuleContext,
    ruleSet: RuleSet,
): ViolationSet {
    logger.info(`Evaluating ${ruleSet.rules.length} architectural rules...`);

    const violations: Violation[] = [];

    const bySeverity = {
        error: 0,
        warning: 0,
        info: 0,
    };

    const byRule: Record<string, number> = {};

    for (const rule of ruleSet.rules) {
        try {
            const ruleViolations = rule.evaluate(context);

            if (ruleViolations.length > 0) {
                byRule[rule.id] = ruleViolations.length;

                for (const v of ruleViolations) {
                    violations.push(v);
                    bySeverity[v.severity] = (bySeverity[v.severity] ?? 0) + 1;
                }
            } else {
                byRule[rule.id] = 0;
            }
        } catch (err) {
            logger.error(`Error evaluating rule '${rule.id}':`, {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    const total = violations.length;
    logger.info(
        `Rules evaluation completed: found ${total} violations (${bySeverity.error} errors, ${bySeverity.warning} warnings, ${bySeverity.info} info).`,
    );

    return {
        violations,
        summary: {
            total,
            bySeverity,
            byRule,
        },
    };
}
