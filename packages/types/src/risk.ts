// ============================================================
// @archlens/types — Risk Types
// ============================================================

/**
 * Risk category taxonomy.
 */
export const RISK_CATEGORY = {
    changePropagation: "change-propagation",
    circularDependency: "circular-dependency",
    bottleneck: "bottleneck",
    complexityGrowth: "complexity-growth",
    boundaryErosion: "boundary-erosion",
} as const;

export type RiskCategory = (typeof RISK_CATEGORY)[keyof typeof RISK_CATEGORY];

/**
 * A single risk identified in the architecture.
 */
export interface Risk {
    readonly id: string;
    readonly category: RiskCategory;
    readonly severity: "high" | "medium" | "low";
    readonly title: string;
    readonly description: string;
    readonly modules: readonly string[];
    readonly metrics: Record<string, number>;
    readonly recommendation: string;
}

/**
 * The complete risk assessment output.
 */
export interface RiskAssessment {
    readonly risks: readonly Risk[];
    readonly summary: {
        readonly total: number;
        readonly bySeverity: {
            readonly high: number;
            readonly medium: number;
            readonly low: number;
        };
        readonly byCategory: Readonly<Record<string, number>>;
    };
}
