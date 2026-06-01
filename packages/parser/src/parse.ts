// ============================================================
// @archlens/parser — Core Parsing Logic
// ============================================================

import * as path from "node:path";
import {
    Project,
    type SourceFile,
    type ImportDeclaration as TSImportDecl,
    SyntaxKind,
} from "ts-morph";
import type {
    Result,
    FileManifest,
    ModuleInfo,
    ImportDeclaration,
    ExportDeclaration,
    ParserError,
    EdgeType,
} from "@archlens/types";
import { EDGE_TYPE } from "@archlens/types";
import { Ok, Err, logger } from "@archlens/shared";

/**
 * Classify an import declaration by its type.
 */
function classifyImport(importDecl: TSImportDecl): EdgeType {
    if (importDecl.isTypeOnly()) {
        return EDGE_TYPE.typeOnly;
    }
    return EDGE_TYPE.static;
}

/**
 * Extract import declarations from a source file.
 */
function extractImports(
    sourceFile: SourceFile,
    rootPath: string,
): ImportDeclaration[] {
    const imports: ImportDeclaration[] = [];

    // Static imports (import { x } from './y', import type { X } from './y')
    for (const importDecl of sourceFile.getImportDeclarations()) {
        const specifier = importDecl.getModuleSpecifierValue();
        const resolvedSourceFile = importDecl.getModuleSpecifierSourceFile();
        const resolvedPath = resolvedSourceFile
            ? resolvedSourceFile.getFilePath()
            : null;

        // Skip external/node_modules imports
        if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
            continue;
        }

        const namedImports = importDecl
            .getNamedImports()
            .map((n) => n.getName());
        const defaultImport = importDecl.getDefaultImport();
        const names = defaultImport
            ? [defaultImport.getText(), ...namedImports]
            : namedImports;

        const type = classifyImport(importDecl);
        const isSideEffect =
            !defaultImport &&
            namedImports.length === 0 &&
            !importDecl.getNamespaceImport();

        imports.push({
            specifier,
            resolvedPath: resolvedPath ? path.resolve(resolvedPath) : null,
            type: isSideEffect ? EDGE_TYPE.sideEffect : type,
            names,
            line: importDecl.getStartLineNumber(),
        });
    }

    // Re-exports: export { x } from './y'
    for (const exportDecl of sourceFile.getExportDeclarations()) {
        const moduleSpecifier = exportDecl.getModuleSpecifierValue();
        if (!moduleSpecifier) continue;
        if (
            !moduleSpecifier.startsWith(".") &&
            !moduleSpecifier.startsWith("/")
        )
            continue;

        const resolvedSourceFile = exportDecl.getModuleSpecifierSourceFile();
        const resolvedPath = resolvedSourceFile
            ? resolvedSourceFile.getFilePath()
            : null;
        const names = exportDecl.getNamedExports().map((n) => n.getName());

        imports.push({
            specifier: moduleSpecifier,
            resolvedPath: resolvedPath ? path.resolve(resolvedPath) : null,
            type: EDGE_TYPE.reExport,
            names,
            line: exportDecl.getStartLineNumber(),
        });
    }

    // Dynamic imports: import('./y')
    for (const callExpr of sourceFile.getDescendantsOfKind(
        SyntaxKind.CallExpression,
    )) {
        if (callExpr.getExpression().getKind() === SyntaxKind.ImportKeyword) {
            const args = callExpr.getArguments();
            if (args.length > 0) {
                const specifier = args[0]!.getText().replace(/['"]/g, "");
                if (specifier.startsWith(".") || specifier.startsWith("/")) {
                    // Resolve the dynamic import path
                    const dir = path.dirname(sourceFile.getFilePath());
                    const possibleExts = [
                        ".ts",
                        ".tsx",
                        ".js",
                        ".jsx",
                        "/index.ts",
                        "/index.tsx",
                        "/index.js",
                        "/index.jsx",
                    ];
                    let resolvedPath: string | null = null;

                    for (const ext of possibleExts) {
                        const candidate = path.resolve(dir, specifier + ext);
                        const candidateFile = sourceFile
                            .getProject()
                            .getSourceFile(candidate);
                        if (candidateFile) {
                            resolvedPath = candidate;
                            break;
                        }
                    }

                    imports.push({
                        specifier,
                        resolvedPath,
                        type: EDGE_TYPE.dynamic,
                        names: [],
                        line: callExpr.getStartLineNumber(),
                    });
                }
            }
        }
    }

    return imports;
}

/**
 * Extract export declarations from a source file.
 */
function extractExports(sourceFile: SourceFile): ExportDeclaration[] {
    const exports: ExportDeclaration[] = [];

    // Named exports from export declarations
    for (const exportDecl of sourceFile.getExportDeclarations()) {
        for (const namedExport of exportDecl.getNamedExports()) {
            exports.push({
                name: namedExport.getName(),
                type: exportDecl.getModuleSpecifierValue()
                    ? "re-export"
                    : "named",
                line: namedExport.getStartLineNumber(),
            });
        }
    }

    // Exported statements (export function, export const, export class, etc.)
    for (const stmt of sourceFile.getStatements()) {
        if ("isExported" in stmt && typeof stmt.isExported === "function") {
            const exported = stmt.isExported() as boolean;
            if (
                exported &&
                "getName" in stmt &&
                typeof stmt.getName === "function"
            ) {
                const name = stmt.getName() as string | undefined;
                if (name) {
                    const isDefault =
                        "isDefaultExport" in stmt &&
                        typeof stmt.isDefaultExport === "function"
                            ? (stmt.isDefaultExport() as boolean)
                            : false;
                    exports.push({
                        name,
                        type: isDefault ? "default" : "named",
                        line: stmt.getStartLineNumber(),
                    });
                }
            }
        }
    }

    // Default export assignment: export default ...
    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport && !exports.some((e) => e.type === "default")) {
        exports.push({
            name: "default",
            type: "default",
            line: 1,
        });
    }

    return exports;
}

/**
 * Parse a FileManifest into a ModuleMap.
 *
 * @param manifest - The file manifest from the scanner
 * @returns Result containing the ModuleMap or a ParserError
 */
export function parse(
    manifest: FileManifest,
): Result<Map<string, ModuleInfo>, ParserError> {
    logger.info(`Parsing ${manifest.files.length} files...`);

    // Create a ts-morph project
    const project = new Project({
        compilerOptions: {
            target: 99, // ESNext
            module: 99, // ESNext
            moduleResolution: 100, // Bundler
            allowJs: true,
            skipLibCheck: true,
            noEmit: true,
        },
        skipAddingFilesFromTsConfig: true,
    });

    // Add all files to the project
    for (const file of manifest.files) {
        try {
            project.addSourceFileAtPath(file.path);
        } catch (err) {
            logger.warn(`Cannot add file to project: ${file.path}`, {
                error: String(err),
            });
        }
    }

    const moduleMap = new Map<string, ModuleInfo>();

    for (const sourceFile of project.getSourceFiles()) {
        const filePath = path.resolve(sourceFile.getFilePath());

        try {
            const imports = extractImports(sourceFile, manifest.rootPath);
            const exports = extractExports(sourceFile);
            const unresolvedImports = imports
                .filter((i) => i.resolvedPath === null)
                .map((i) => i.specifier);

            moduleMap.set(filePath, {
                path: filePath,
                imports,
                exports,
                unresolvedImports,
            });
        } catch (err) {
            logger.warn(`Parse error in ${filePath}: ${String(err)}`);
            // Skip this file but continue parsing others
        }
    }

    if (moduleMap.size === 0) {
        return Err({
            code: "PARSE_FAILED" as const,
            path: manifest.rootPath,
            reason: "No files could be parsed successfully",
        });
    }

    logger.info(`Parsed ${moduleMap.size} modules`);
    return Ok(moduleMap);
}
