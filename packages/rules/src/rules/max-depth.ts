// ============================================================
// @archlens/rules — Max Dependency Depth Rule
// ============================================================

import type { ArchitectureRule, RuleContext, Violation } from "@archlens/types";
import { createViolation } from "../violation-builder.js";
import { SEVERITY } from "@archlens/types";

export class MaxDepthRule implements ArchitectureRule {
    readonly id = "max-depth";
    readonly name = "Max Dependency Depth";
    readonly description =
        "Ensures the dependency chain length from a module does not exceed a threshold, preventing fragile structural architectures.";
    readonly severity = SEVERITY.warning;

    evaluate(context: RuleContext): Violation[] {
        const defaultLimit = 6;
        const limit = (context.config?.maxDepth as number) ?? defaultLimit;
        const violations: Violation[] = [];

        const moduleMetrics = context.analysis.metrics.modules;

        for (const [moduleId, metrics] of moduleMetrics.entries()) {
            if (metrics.depth > limit) {
                const node = context.graph.nodes.get(moduleId);
                const nodeName = node?.name ?? moduleId;

                violations.push(
                    createViolation({
                        ruleId: this.id,
                        ruleName: this.name,
                        severity: this.severity,
                        message: `Module '${nodeName}' has excessive dependency depth (${metrics.depth} > ${limit})`,
                        modules: [moduleId],
                        description: `The maximum dependency path from this module to any leaf node is ${metrics.depth}, which exceeds the configured limit of ${limit}. Deep dependency paths indicate that a change at the leaf layer can cascade upwards through many levels of abstractions, causing fragile structures.`,
                        metrics: { depth: metrics.depth, limit },
                    }),
                );
            }
        }

        return violations;
    }
}
