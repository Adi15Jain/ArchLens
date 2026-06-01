# GOV-001 — Contribution Guide

---

## Metadata

| Field       | Value                     |
| ----------- | ------------------------- |
| Document ID | GOV-001                   |
| Version     | 1.0.0                     |
| Status      | DRAFT                     |
| Owner       | ArchLens Core Team        |
| Created     | 2026-06-02                |
| Phase       | Phase 5 — Governance      |
| Depends On  | ARCH-006, ENG-003, ENG-004|

---

## Purpose

Defines how contributors can contribute to ArchLens — from issue creation through code review to merge.

---

## Types of Contributions

| Type | Description | Requires RFC? |
| --- | --- | --- |
| Bug fix | Fix incorrect behavior | No |
| Documentation | Improve or add documentation | No |
| New rule | Add a new architecture rule | Yes |
| New metric | Add a new analysis metric | Yes |
| New feature | Add new CLI commands, flags, or capabilities | Yes |
| Scoring change | Modify scoring formulas or weights | Yes |
| New output format | Add a new report formatter | No (follows interface) |
| Refactoring | Internal restructuring without API change | No (if no API change) |

---

## Contribution Workflow

### 1. Open an Issue

Before starting work, open an issue describing:
- What you want to change.
- Why (the problem it solves or improvement it provides).
- Whether you plan to submit a PR.

### 2. Discuss Design (if RFC required)

For changes requiring an RFC:
- Draft the RFC as a Markdown document following the RFC template.
- Open a PR with the RFC for review.
- Incorporate feedback.
- RFC must be approved before implementation begins.

### 3. Implement

- Fork the repository.
- Create a feature branch from `main`: `feat/<short-description>`.
- Make changes following the coding standards (GOV-002).
- Add tests for new logic.
- Run the full test suite locally: `pnpm test`.
- Run linting: `pnpm lint`.
- Create a changeset: `pnpm changeset`.

### 4. Submit PR

PR description must include:
- Link to the related issue.
- Summary of changes.
- Testing done.
- Changeset included (if package code changed).

### 5. Review

- At least one core team member reviews.
- CI must pass (build, test, lint, typecheck, dogfood).
- Reviewer checks: correctness, test coverage, adherence to principles, documentation.

### 6. Merge

Squash merge to `main` with a clean commit message.

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/archlens/archlens.git
cd archlens

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run ArchLens on itself
pnpm archlens analyze .
```

---

## Commit Message Format

```
<type>(<scope>): <description>

Types: feat, fix, docs, refactor, test, chore
Scope: package name or area (scanner, parser, graph, cli, etc.)

Examples:
feat(rules): add max-fan-in rule
fix(scoring): handle zero fan-in + fan-out in instability calculation
docs(arch): update ARCH-012 scoring formulas
test(graph): add cycle detection edge cases
```

---

## Decision Log

| ID | Decision | Rationale |
| --- | --- | --- |
| DL-088 | RFC required for scoring/metric/rule changes | These affect core analysis output and need design review |
| DL-089 | Squash merge only | Clean main branch history |
| DL-090 | Changeset required for package changes | Ensures proper versioning and changelog |

---

*End of GOV-001*
