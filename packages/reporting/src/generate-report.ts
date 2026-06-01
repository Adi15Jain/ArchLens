// ============================================================
// @archlens/reporting — Report Orchestration
// ============================================================

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ReportInput, ReportOptions } from '@archlens/types';
import { ConsoleFormatter } from './formatters/console-formatter.js';
import { MarkdownFormatter } from './formatters/markdown-formatter.js';
import { JsonFormatter } from './formatters/json-formatter.js';
import { logger } from '@archlens/shared';

/**
 * Generates an architectural audit report using the specified format.
 */
export function generateReport(input: ReportInput, options: ReportOptions): string {
  logger.info(`Generating ${options.format} report...`);

  let formatter;
  switch (options.format) {
    case 'markdown':
      formatter = new MarkdownFormatter();
      break;
    case 'json':
      formatter = new JsonFormatter();
      break;
    case 'console':
    default:
      formatter = new ConsoleFormatter();
      break;
  }

  const output = formatter.render(input);

  if (options.outputPath) {
    try {
      const resolvedPath = path.resolve(options.outputPath);
      // Ensure target directory exists
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      fs.writeFileSync(resolvedPath, output, 'utf-8');
      logger.info(`Report saved successfully to: ${resolvedPath}`);
    } catch (err) {
      logger.error(`Failed to save report to '${options.outputPath}':`, { error: err instanceof Error ? err.message : String(err) });
    }
  }

  return output;
}
export { ConsoleFormatter, MarkdownFormatter, JsonFormatter };
