// ============================================================
// @archlens/shared — Constants
// ============================================================

/** Default file extensions to scan. */
export const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const;

/** Default directories/patterns to exclude from scanning. */
export const DEFAULT_EXCLUDES = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".next",
    "out",
] as const;

/** Default scoring thresholds. */
export const DEFAULT_THRESHOLDS = {
    depthThreshold: 10,
    fanOutThreshold: 8,
    fanInThreshold: 20,
    densityThreshold: 0.1,
} as const;

/** Scoring dimension weights for the aggregate score. */
export const SCORE_WEIGHTS = {
    dependencyHealth: 0.3,
    maintainability: 0.25,
    technicalDebt: 0.2,
    scalability: 0.25,
} as const;

/** Default rule thresholds. */
export const RULE_DEFAULTS = {
    maxFanOut: 15,
    maxDepth: 10,
} as const;

/** ArchLens version — read from package.json at build time. */
export const VERSION = "0.1.0";
