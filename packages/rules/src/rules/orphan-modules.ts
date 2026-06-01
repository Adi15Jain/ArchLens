// ============================================================
// @archlens/rules — Orphan Modules Rule
// ============================================================

import type { ArchitectureRule, RuleContext, Violation } from "@archlens/types";
import { createViolation } from "../violation-builder.js";
import { SEVERITY } from "@archlens/types";

export class OrphanModulesRule implements ArchitectureRule {
    readonly id = "orphan-modules";
    readonly name = "Orphan Modules";
    readonly description =
        "Flags modules that are completely isolated from the rest of the application dependency graph, suggesting dead or unused code.";
    readonly severity = SEVERITY.warning;

    evaluate(context: RuleContext): Violation[] {
        const violations: Violation[] = [];
        const orphans = context.analysis.patterns.orphans;

        for (const orphan of orphans) {
            const node = context.graph.nodes.get(orphan.moduleId);
            const nodeName = node?.name ?? orphan.moduleId;

            violations.push(
                createViolation({
                    ruleId: this.id,
                    ruleName: this.name,
                    severity: this.severity,
                    message: `Module '${nodeName}' is completely orphaned (unused and unreachable)`,
                    modules: [orphan.moduleId],
                    description: orphan.evidence,
                    metrics: orphan.metrics,
                }),
            );
        }

        return violations;
    }
}
