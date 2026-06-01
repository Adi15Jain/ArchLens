// ============================================================
// @archlens/rules — Max Fan-Out Rule
// ============================================================

import type { ArchitectureRule, RuleContext, Violation } from "@archlens/types";
import { createViolation } from "../violation-builder.js";
import { SEVERITY } from "@archlens/types";

export class MaxFanOutRule implements ArchitectureRule {
    readonly id = "max-fan-out";
    readonly name = "Max Fan-Out Limit";
    readonly description =
        "Restricts the maximum number of outgoing dependencies a module can have, preventing over-coupled components.";
    readonly severity = SEVERITY.warning;

    evaluate(context: RuleContext): Violation[] {
        const defaultLimit = 8;
        const limit = (context.config?.maxFanOut as number) ?? defaultLimit;
        const violations: Violation[] = [];

        const moduleMetrics = context.analysis.metrics.modules;

        for (const [moduleId, metrics] of moduleMetrics.entries()) {
            if (metrics.fanOut > limit) {
                const node = context.graph.nodes.get(moduleId);
                const nodeName = node?.name ?? moduleId;

                violations.push(
                    createViolation({
                        ruleId: this.id,
                        ruleName: this.name,
                        severity: this.severity,
                        message: `Module '${nodeName}' has too many outgoing dependencies (${metrics.fanOut} > ${limit})`,
                        modules: [moduleId],
                        description: `The module depends on ${metrics.fanOut} other components, exceeding the configured limit of ${limit}. High fan-out suggests that the module has too many responsibilities or is too tightly coupled to changes in other modules.`,
                        metrics: { fanOut: metrics.fanOut, limit },
                    }),
                );
            }
        }

        return violations;
    }
}
