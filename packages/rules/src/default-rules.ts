// ============================================================
// @archlens/rules — Default Rule Set
// ============================================================

import type { RuleSet } from "@archlens/types";
import { NoCircularDepsRule } from "./rules/no-circular-deps.js";
import { MaxFanOutRule } from "./rules/max-fan-out.js";
import { MaxDepthRule } from "./rules/max-depth.js";
import { BoundaryViolationRule } from "./rules/boundary-violation.js";
import { OrphanModulesRule } from "./rules/orphan-modules.js";

/**
 * Returns the default set of architectural rules.
 */
export function getDefaultRuleSet(): RuleSet {
    return {
        rules: [
            new NoCircularDepsRule(),
            new MaxFanOutRule(),
            new MaxDepthRule(),
            new BoundaryViolationRule(),
            new OrphanModulesRule(),
        ],
    };
}
export {
    NoCircularDepsRule,
    MaxFanOutRule,
    MaxDepthRule,
    BoundaryViolationRule,
    OrphanModulesRule,
};
