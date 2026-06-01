// ============================================================
// @archlens/types — CLI Config Types
// ============================================================

/**
 * Options for the analyze command.
 */
export interface AnalyzeOptions {
    readonly path: string;
    readonly format: "console" | "markdown" | "json";
    readonly output?: string;
    readonly exclude: readonly string[];
    readonly threshold?: number;
    readonly granularity: "file" | "package";
    readonly verbose: boolean;
    readonly debug: boolean;
}

/**
 * Top-level CLI options parsed from process.argv.
 */
export interface CLIOptions {
    readonly command: "analyze" | "score" | "violations" | "graph";
    readonly analyzeOptions: AnalyzeOptions;
}
