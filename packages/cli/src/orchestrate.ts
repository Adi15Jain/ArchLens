// ============================================================
// @archlens/cli — Pipeline Orchestration
// ============================================================

import type { ReportInput, Result, ArchLensError } from '@archlens/types';
import { scan } from '@archlens/scanner';
import { parse } from '@archlens/parser';
import { buildGraph } from '@archlens/graph';
import { analyze } from '@archlens/analyzer';
import { evaluateRules, getDefaultRuleSet } from '@archlens/rules';
import { computeScores } from '@archlens/scoring';
import { assessRisks } from './risk.js';
import { logger, Ok, Err, DEFAULT_EXTENSIONS, DEFAULT_EXCLUDES } from '@archlens/shared';
import * as path from 'node:path';

export interface OrchestrateOptions {
  excludePatterns?: string[];
  extensions?: string[];
  maxFanOut?: number;
  maxDepth?: number;
  boundaries?: any[];
}

/**
 * Runs the entire ArchLens analysis pipeline end-to-end on a target directory.
 */
export async function orchestrate(
  targetDir: string,
  options: OrchestrateOptions = {}
): Promise<Result<ReportInput, ArchLensError>> {
  const startTime = Date.now();
  const absoluteTargetDir = path.resolve(targetDir);

  logger.info(`Starting pipeline on: ${absoluteTargetDir}`);

  // 1. Ingest/Scan Directory
  const scanResult = scan({
    rootPath: absoluteTargetDir,
    exclude: options.excludePatterns ?? DEFAULT_EXCLUDES,
    extensions: options.extensions ?? DEFAULT_EXTENSIONS,
  });

  if (!scanResult.ok) {
    return Err({
      code: 'SCAN_FAILED',
      message: `Failed to scan directory: ${scanResult.error.code} on ${(scanResult.error as any).path ?? absoluteTargetDir}`,
      context: scanResult.error,
    });
  }

  const manifest = scanResult.value;
  const fileCount = manifest.files.length;
  logger.info(`Scan complete: found ${fileCount} target source files.`);

  if (fileCount === 0) {
    return Err({
      code: 'NO_FILES_FOUND',
      message: `No files matching the specified extensions in directory: ${absoluteTargetDir}`,
    });
  }

  // 2. Parse source files into ModuleMap
  const parseResult = await parse(manifest);

  if (!parseResult.ok) {
    return Err({
      code: 'PARSE_FAILED',
      message: `Failed to parse source files: ${parseResult.error.reason}`,
      context: { path: parseResult.error.path },
    });
  }

  const moduleMap = parseResult.value;

  // 3. Construct dependency graph
  const graph = buildGraph(moduleMap);

  // 4. Run structural analyzer
  const analysisResult = analyze(graph, moduleMap);

  // 5. Evaluate architectural rules
  const ruleSet = getDefaultRuleSet();
  const ruleContext = {
    graph,
    analysis: analysisResult,
    config: {
      maxFanOut: options.maxFanOut,
      maxDepth: options.maxDepth,
      boundaries: options.boundaries,
    },
  };
  const violationSet = evaluateRules(ruleContext, ruleSet);

  // 6. Compute scores
  const scoreCard = computeScores(analysisResult, violationSet, absoluteTargetDir);

  // 7. Perform Risk Assessment
  const riskAssessment = assessRisks(analysisResult, violationSet);

  const durationMs = Date.now() - startTime;
  logger.info(`Pipeline completed successfully in ${durationMs}ms.`);

  const reportInput: ReportInput = {
    scoreCard,
    violationSet,
    analysisResult,
    riskAssessment,
    metadata: {
      repositoryPath: absoluteTargetDir,
      timestamp: new Date().toISOString(),
      archlensVersion: '0.1.0',
      moduleCount: graph.nodes.size,
      fileCount,
      analysisTimeMs: durationMs,
    },
    graph,
  };

  return Ok(reportInput);
}
