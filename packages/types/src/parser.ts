// ============================================================
// @archlens/types — Parser Types
// ============================================================

import type { EdgeType } from "./common.js";

/**
 * A single import declaration extracted from a source file.
 */
export interface ImportDeclaration {
    readonly specifier: string;
    readonly resolvedPath: string | null;
    readonly type: EdgeType;
    readonly names: readonly string[];
    readonly line: number;
}

/**
 * A single export declaration extracted from a source file.
 */
export interface ExportDeclaration {
    readonly name: string;
    readonly type: "named" | "default" | "re-export";
    readonly line: number;
}

/**
 * Structural information for a single module (source file).
 */
export interface ModuleInfo {
    readonly path: string;
    readonly imports: readonly ImportDeclaration[];
    readonly exports: readonly ExportDeclaration[];
    readonly unresolvedImports: readonly string[];
}

/**
 * Map of file paths to their structural representations.
 */
export type ModuleMap = ReadonlyMap<string, ModuleInfo>;

/**
 * Parser-specific error types.
 */
export type ParserError =
    | {
          readonly code: "PARSE_FAILED";
          readonly path: string;
          readonly reason: string;
      }
    | {
          readonly code: "TSCONFIG_INVALID";
          readonly path: string;
          readonly reason: string;
      };
