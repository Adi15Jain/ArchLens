// ============================================================
// @archlens/rules — Boundary Violation Rule
// ============================================================

import type { ArchitectureRule, RuleContext, Violation } from "@archlens/types";
import { createViolation } from "../violation-builder.js";
import { SEVERITY } from "@archlens/types";

interface BoundaryRule {
    from: string;
    cannotImport: string[];
}

export class BoundaryViolationRule implements ArchitectureRule {
    readonly id = "boundary-violation";
    readonly name = "Architectural Boundary Violation";
    readonly description =
        "Enforces layer isolation and architectural boundaries (e.g. low-level packages/shared/components cannot depend on high-level pages/app/cli).";
    readonly severity = SEVERITY.error;

    evaluate(context: RuleContext): Violation[] {
        const defaultBoundaries: BoundaryRule[] = [
            {
                from: "shared",
                cannotImport: [
                    "/pages/",
                    "/app/",
                    "/cli/",
                    "/routes/",
                    "/controllers/",
                    "/views/",
                ],
            },
            {
                from: "utils",
                cannotImport: [
                    "/pages/",
                    "/app/",
                    "/cli/",
                    "/routes/",
                    "/controllers/",
                    "/views/",
                ],
            },
            {
                from: "types",
                cannotImport: [
                    "/pages/",
                    "/app/",
                    "/cli/",
                    "/routes/",
                    "/controllers/",
                    "/views/",
                    "/components/",
                ],
            },
            {
                from: "components",
                cannotImport: ["/pages/", "/app/", "/cli/"],
            },
        ];

        const boundaries =
            (context.config?.boundaries as BoundaryRule[]) ?? defaultBoundaries;
        const violations: Violation[] = [];

        for (const edge of context.graph.edges) {
            const srcLower = edge.source.toLowerCase();
            const tgtLower = edge.target.toLowerCase();

            for (const boundary of boundaries) {
                // If the source matches the "from" keyword (e.g. is inside a /shared/ folder or is named shared.ts)
                const matchesFrom =
                    srcLower.includes(`/${boundary.from}/`) ||
                    srcLower.includes(`/${boundary.from}.`) ||
                    srcLower.endsWith(`/${boundary.from}`);

                if (matchesFrom) {
                    for (const restrictedPattern of boundary.cannotImport) {
                        if (
                            tgtLower.includes(restrictedPattern.toLowerCase())
                        ) {
                            const srcNode = context.graph.nodes.get(
                                edge.source,
                            );
                            const tgtNode = context.graph.nodes.get(
                                edge.target,
                            );

                            const srcName = srcNode?.name ?? edge.source;
                            const tgtName = tgtNode?.name ?? edge.target;

                            violations.push(
                                createViolation({
                                    ruleId: this.id,
                                    ruleName: this.name,
                                    severity: this.severity,
                                    message: `Boundary violation: '${srcName}' (in layer '${boundary.from}') is not allowed to import '${tgtName}' (restricted pattern: '${restrictedPattern}')`,
                                    modules: [edge.source, edge.target],
                                    description: `A module in a lower layer ('${boundary.from}') imports a module from a higher/restricted layer ('${edge.target}'). This violates strict layering or clean architecture principles and causes circular packaging dependencies.`,
                                    metrics: { line: edge.metadata.line },
                                    chain: [edge.source, edge.target],
                                }),
                            );
                        }
                    }
                }
            }
        }

        return violations;
    }
}
