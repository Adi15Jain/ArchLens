# RFC-001 — Scanner Package

---

## Metadata

| Field       | Value                  |
| ----------- | ---------------------- |
| Document ID | RFC-001                |
| Version     | 1.0.0                  |
| Status      | DRAFT                  |
| Owner       | ArchLens Core Team     |
| Created     | 2026-06-02             |
| Phase       | Phase 3 — Package RFCs |
| Depends On  | ARCH-007, ARCH-008     |
| Package     | `@archlens/scanner`    |

---

## Purpose

RFC for the `@archlens/scanner` package — responsible for repository ingestion, file discovery, and filtering.

---

## Responsibility

L0 in the Architecture Intelligence Hierarchy. The scanner is the first pipeline stage. It takes a file system path and produces a `FileManifest` — an ordered list of source files to analyze.

---

## Public API

```typescript
interface ScannerConfig {
    rootPath: string;
    extensions: string[]; // Default: ['.ts', '.tsx', '.js', '.jsx']
    exclude: string[]; // Default: ['node_modules', '.git', 'dist', 'build']
}

interface FileEntry {
    path: string; // Absolute path
    relativePath: string; // Relative to rootPath
    extension: string;
    size: number; // Bytes
}

interface FileManifest {
    rootPath: string;
    files: FileEntry[];
    totalSize: number;
    scannedAt: string; // ISO timestamp
}

function scan(config: ScannerConfig): Result<FileManifest, ScannerError>;
```

---

## Internal Design

### Directory Walker

Recursive directory traversal using Node.js `fs.readdir` with `withFileTypes: true` for performance (avoids separate `stat` calls).

**Traversal order**: Breadth-first within directories, sorted alphabetically. Deterministic order ensures reproducible file manifests.

### Exclusion Matching

Exclusion patterns are matched against directory/file names using glob-style matching:

- `node_modules` matches any directory named `node_modules` at any depth.
- `*.test.ts` matches any file ending in `.test.ts`.
- Exclusion is checked before descending into a directory (short-circuit: if a directory is excluded, its children are never visited).

### Symlink Handling

Symlinks are not followed. They are skipped with a debug-level log. Following symlinks risks infinite loops and introduces non-determinism (symlink targets may vary across environments).

---

## Error Cases

| Error              | Cause                                     | Handling                              |
| ------------------ | ----------------------------------------- | ------------------------------------- |
| `PathNotFound`     | Root path does not exist                  | Return `Result.err`                   |
| `NotADirectory`    | Root path is a file                       | Return `Result.err`                   |
| `NoSourceFiles`    | No files match extensions after filtering | Return `Result.err`                   |
| `PermissionDenied` | Cannot read a subdirectory                | Skip directory, log warning, continue |

---

## Dependencies

- `@archlens/types` — `FileManifest`, `FileEntry`, `ScannerConfig` types
- `@archlens/shared` — `Result` type, logging utilities
- Node.js `fs` and `path` modules (no external dependencies)

---

## Testing Strategy

| Test Type   | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| Unit        | Exclusion pattern matching logic                                        |
| Integration | Scan a fixture directory and verify manifest                            |
| Edge cases  | Empty directory, deeply nested directories, symlinks, permission denied |

---

_End of RFC-001_
