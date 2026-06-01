# ENG-004 — Build Architecture

---

## Metadata

| Field       | Value                 |
| ----------- | --------------------- |
| Document ID | ENG-004               |
| Version     | 1.0.0                 |
| Status      | DRAFT                 |
| Owner       | ArchLens Core Team    |
| Created     | 2026-06-02            |
| Phase       | Phase 4 — Engineering |
| Depends On  | ARCH-007              |

---

## Purpose

Defines the build architecture — how ArchLens packages are compiled, bundled, and linked within the monorepo.

---

## Build Tools

| Tool           | Role                                     |
| -------------- | ---------------------------------------- |
| **pnpm**       | Package manager, workspace management    |
| **Turborepo**  | Monorepo task orchestration and caching  |
| **tsup**       | TypeScript bundling (per-package builds) |
| **TypeScript** | Type checking (separate from bundling)   |

---

## Build Pipeline

```
pnpm install (install all dependencies)
  → turbo build (orchestrate package builds in dependency order)
    → tsup (per-package: compile TypeScript to ESM + CJS)
    → tsc --emitDeclarationOnly (per-package: generate .d.ts files)
  → turbo test (run tests after build)
  → turbo lint (run ESLint)
```

---

## Turborepo Configuration

```json
// turbo.json
{
    "pipeline": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": ["dist/**"]
        },
        "test": {
            "dependsOn": ["build"],
            "outputs": []
        },
        "lint": {
            "outputs": []
        },
        "typecheck": {
            "dependsOn": ["^build"],
            "outputs": []
        }
    }
}
```

- `^build` means a package's build runs after all its dependencies' builds complete.
- Turborepo caches build outputs — unchanged packages are not rebuilt.

---

## Package Build (tsup)

Each package uses tsup for compilation:

```typescript
// tsup.config.ts (per-package)
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
});
```

**Output**:

- `dist/index.mjs` — ESM build
- `dist/index.cjs` — CJS build
- `dist/index.d.ts` — Type declarations
- `dist/index.mjs.map` — Source maps

**Why dual format (ESM + CJS)**: ESM is the primary format for modern tooling. CJS is provided for backward compatibility with tools and environments that don't support ESM.

---

## Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
    - "packages/*"
    - "apps/*"
```

```json
// Root package.json (scripts)
{
    "scripts": {
        "build": "turbo build",
        "test": "turbo test",
        "lint": "turbo lint",
        "typecheck": "turbo typecheck",
        "clean": "turbo clean",
        "dev": "turbo dev"
    }
}
```

---

## Package Linking

Within the monorepo, packages reference each other using workspace protocol:

```json
// packages/parser/package.json
{
    "dependencies": {
        "@archlens/types": "workspace:*",
        "@archlens/shared": "workspace:*",
        "@archlens/scanner": "workspace:*"
    }
}
```

`workspace:*` is resolved by pnpm to the local package. On publish, it's replaced with the actual version number.

---

## Decision Log

| ID     | Decision                         | Rationale                                                             |
| ------ | -------------------------------- | --------------------------------------------------------------------- |
| DL-076 | pnpm over npm/yarn               | Efficient disk usage, strict dependency resolution, workspace support |
| DL-077 | Turborepo for task orchestration | Dependency-aware build ordering, caching, parallel execution          |
| DL-078 | tsup for bundling                | Fast, zero-config for simple builds, handles ESM/CJS dual output      |
| DL-079 | Dual ESM + CJS output            | Maximum compatibility without sacrificing modern ESM usage            |

---

_End of ENG-004_
