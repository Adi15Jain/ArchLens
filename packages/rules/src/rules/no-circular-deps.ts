// ============================================================
// @archlens/rules — No Circular Dependencies Rule
// ============================================================

import type { ArchitectureRule, RuleContext, Violation } from "@archlens/types";
import { createViolation } from "../violation-builder.js";
import { SEVERITY } from "@archlens/types";

export class NoCircularDepsRule implements ArchitectureRule {
    readonly id = "no-circular-deps";
    readonly name = "No Circular Dependencies";
    readonly description =
        "Ensures there are no cyclic relationships between modules, which hinders testability and separate compilation.";
    readonly severity = SEVERITY.error;

    evaluate(context: RuleContext): Violation[] {
        const { cycles } = context.analysis;
        const violations: Violation[] = [];

        for (let i = 0; i < cycles.length; i++) {
            const cycle = cycles[i];
            if (!cycle) continue;
            const cyclePath =
                cycle.nodes.join(" -> ") + " -> " + cycle.nodes[0];

            violations.push(
                createViolation({
                    ruleId: this.id,
                    ruleName: this.name,
                    severity: this.severity,
                    message: `Circular dependency detected involving ${cycle.length} modules: ${cyclePath}`,
                    modules: cycle.nodes,
                    description: `A cyclical dependency path exists in the import graph: ${cyclePath}.`,
                    metrics: { cycleLength: cycle.length },
                    chain: cycle.nodes,
                }),
            );
        }

        return violations;
    }
}
