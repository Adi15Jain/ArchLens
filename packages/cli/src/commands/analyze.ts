// ============================================================
// @archlens/cli — Analyze Command
// ============================================================

import { defineCommand } from 'citty';
import { orchestrate } from '../orchestrate.js';
import { generateReport } from '@archlens/reporting';
import { logger, isErr } from '@archlens/shared';

export default defineCommand({
  meta: {
    name: 'analyze',
    description: 'Analyze a repository and output structural metrics, violations, and architecture score.',
  },
  args: {
    dir: {
      type: 'positional',
      description: 'Directory to analyze',
      required: false,
      default: '.',
    },
    format: {
      type: 'string',
      description: 'Report format (console, markdown, json)',
      default: 'console',
    },
    output: {
      type: 'string',
      description: 'File path to save the generated report',
    },
    threshold: {
      type: 'string',
      description: 'Fail build if overall architecture score falls below this value (0-100)',
    },
    exclude: {
      type: 'string',
      description: 'Comma-separated glob ignore patterns',
    },
    maxFanOut: {
      type: 'string',
      description: 'Custom maximum fan-out coupling limit',
    },
    maxDepth: {
      type: 'string',
      description: 'Custom maximum dependency depth limit',
    },
  },
  async run({ args }) {
    const dir = args.dir || '.';
    const format = (args.format as 'console' | 'markdown' | 'json') || 'console';
    const output = args.output;
    const thresholdVal = args.threshold ? parseFloat(args.threshold) : undefined;
    
    // Parse commas
    const excludePatterns = args.exclude ? args.exclude.split(',').map((p) => p.trim()) : undefined;
    const maxFanOut = args.maxFanOut ? parseInt(args.maxFanOut, 10) : undefined;
    const maxDepth = args.maxDepth ? parseInt(args.maxDepth, 10) : undefined;

    const result = await orchestrate(dir, {
      excludePatterns,
      maxFanOut,
      maxDepth,
    });

    if (!result.ok) {
      logger.error(`Analysis failed: ${result.error.message}`);
      process.exit(1);
      return;
    }

    const reportInput = result.value;
    const renderedReport = generateReport(reportInput, {
      format,
      outputPath: output,
    });

    // Write to console if no output file or if using console formatter
    if (format === 'console' || !output) {
      console.log(renderedReport);
    }

    // Check threshold fail condition
    if (thresholdVal !== undefined) {
      const overallScore = reportInput.scoreCard.scores.architecture.value;
      if (overallScore < thresholdVal) {
        logger.error(`\n[FAIL] Overall architecture score ${overallScore} is below the threshold of ${thresholdVal}.`);
        process.exit(1);
      } else {
        logger.info(`\n[PASS] Overall architecture score ${overallScore} met the threshold of ${thresholdVal}.`);
      }
    }
  },
});
