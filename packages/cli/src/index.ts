// ============================================================
// @archlens/cli — CLI Main Entry Point
// ============================================================

import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: {
    name: 'archlens',
    version: '0.1.0',
    description: 'ArchLens — Architecture Intelligence Platform\nAnalyze local repositories for architectural quality, modular boundaries, and structural risks.',
  },
  subCommands: {
    analyze: () => import('./commands/analyze.js').then((r) => r.default),
    violations: () => import('./commands/violations.js').then((r) => r.default),
    score: () => import('./commands/score.js').then((r) => r.default),
    graph: () => import('./commands/graph.js').then((r) => r.default),
  },
});

runMain(main);
