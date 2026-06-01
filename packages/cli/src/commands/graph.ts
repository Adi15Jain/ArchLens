// ============================================================
// @archlens/cli — Graph Command
// ============================================================

import { defineCommand } from 'citty';
import { orchestrate } from '../orchestrate.js';
import { logger, isErr } from '@archlens/shared';

export default defineCommand({
  meta: {
    name: 'graph',
    description: 'Analyze a repository and output the dependency graph in JSON format.',
  },
  args: {
    dir: {
      type: 'positional',
      description: 'Directory to analyze',
      required: false,
      default: '.',
    },
  },
  async run({ args }) {
    const dir = args.dir || '.';

    const result = await orchestrate(dir);

    if (!result.ok) {
      logger.error(`Analysis failed: ${result.error.message}`);
      process.exit(1);
      return;
    }

    const { nodes, edges, metadata } = result.value.graph;

    console.log(
      JSON.stringify(
        {
          metadata,
          nodes: [...nodes.entries()].map(([id, node]) => ({
            id,
            name: node.name,
            path: node.path,
            type: node.type,
            metadata: node.metadata,
          })),
          edges: edges.map((e: any) => ({
            source: e.source,
            target: e.target,
            type: e.type,
            metadata: e.metadata,
          })),
        },
        null,
        2
      )
    );
  },
});
