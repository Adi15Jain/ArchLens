// ============================================================
// @archlens/scanner — Core Scanning Logic
// ============================================================

import * as fs from "node:fs";
import * as path from "node:path";
import type {
    Result,
    ScannerConfig,
    FileManifest,
    FileEntry,
    ScannerError,
} from "@archlens/types";
import { Ok, Err, logger } from "@archlens/shared";

/**
 * Check if a file/directory name should be excluded.
 */
function isExcluded(name: string, excludePatterns: readonly string[]): boolean {
    return excludePatterns.some((pattern) => {
        // Simple glob: exact match or wildcard extension match
        if (pattern.startsWith("*.")) {
            return name.endsWith(pattern.slice(1));
        }
        return name === pattern;
    });
}

/**
 * Recursively walk a directory and collect matching files.
 */
function walkDirectory(
    dirPath: string,
    rootPath: string,
    extensions: readonly string[],
    excludePatterns: readonly string[],
): FileEntry[] {
    const entries: FileEntry[] = [];

    let dirEntries: fs.Dirent[];
    try {
        dirEntries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (err) {
        logger.warn(`Cannot read directory: ${dirPath}`, {
            error: String(err),
        });
        return entries;
    }

    // Sort for deterministic order
    dirEntries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of dirEntries) {
        if (isExcluded(entry.name, excludePatterns)) {
            continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Recurse into subdirectories (skip symlinks)
            if (!entry.isSymbolicLink()) {
                entries.push(
                    ...walkDirectory(
                        fullPath,
                        rootPath,
                        extensions,
                        excludePatterns,
                    ),
                );
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
                try {
                    const stats = fs.statSync(fullPath);
                    entries.push({
                        path: fullPath,
                        relativePath: path.relative(rootPath, fullPath),
                        extension: ext,
                        size: stats.size,
                    });
                } catch {
                    logger.warn(`Cannot stat file: ${fullPath}`);
                }
            }
        }
    }

    return entries;
}

/**
 * Scan a repository directory and produce a FileManifest.
 *
 * @param config - Scanner configuration (root path, extensions, exclusions)
 * @returns Result containing the FileManifest or a ScannerError
 */
export function scan(
    config: ScannerConfig,
): Result<FileManifest, ScannerError> {
    const { rootPath, extensions, exclude } = config;

    // Validate path exists
    if (!fs.existsSync(rootPath)) {
        return Err({ code: "PATH_NOT_FOUND" as const, path: rootPath });
    }

    // Validate path is a directory
    const stats = fs.statSync(rootPath);
    if (!stats.isDirectory()) {
        return Err({ code: "NOT_A_DIRECTORY" as const, path: rootPath });
    }

    const resolvedRoot = path.resolve(rootPath);
    logger.info(`Scanning: ${resolvedRoot}`);

    const files = walkDirectory(
        resolvedRoot,
        resolvedRoot,
        extensions,
        exclude,
    );

    if (files.length === 0) {
        return Err({
            code: "NO_SOURCE_FILES" as const,
            path: rootPath,
            extensions,
        });
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    logger.info(
        `Found ${files.length} files (${(totalSize / 1024).toFixed(1)} KB)`,
    );

    return Ok({
        rootPath: resolvedRoot,
        files,
        totalSize,
        scannedAt: new Date().toISOString(),
    });
}
