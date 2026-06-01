// ============================================================
// @archlens/rules — Violation Builder
// ============================================================

import type { Violation, Severity, Evidence } from "@archlens/types";

export function createViolation(params: {
    ruleId: string;
    ruleName: string;
    severity: Severity;
    message: string;
    modules: readonly string[];
    description: string;
    metrics?: Record<string, number>;
    chain?: readonly string[];
}): Violation {
    return {
        ruleId: params.ruleId,
        ruleName: params.ruleName,
        severity: params.severity,
        message: params.message,
        modules: params.modules,
        evidence: {
            description: params.description,
            metrics: params.metrics ?? {},
            chain: params.chain ?? [],
        },
    };
}
