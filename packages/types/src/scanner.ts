// ============================================================
// @archlens/types — Scanner Types
// ============================================================

/**
 * Configuration for the scanner stage.
 */
export interface ScannerConfig {
    readonly rootPath: string;
    readonly extensions: readonly string[];
    readonly exclude: readonly string[];
}

/**
 * A single file entry discovered by the scanner.
 */
export interface FileEntry {
    readonly path: string;
    readonly relativePath: string;
    readonly extension: string;
    readonly size: number;
}

/**
 * The output of the scanner stage — an ordered list of source files.
 */
export interface FileManifest {
    readonly rootPath: string;
    readonly files: readonly FileEntry[];
    readonly totalSize: number;
    readonly scannedAt: string;
}

/**
 * Scanner-specific error types as a discriminated union.
 */
export type ScannerError =
    | { readonly code: "PATH_NOT_FOUND"; readonly path: string }
    | { readonly code: "NOT_A_DIRECTORY"; readonly path: string }
    | {
          readonly code: "NO_SOURCE_FILES";
          readonly path: string;
          readonly extensions: readonly string[];
      };
