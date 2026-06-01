// ============================================================
// @archlens/analyzer — Graph Metrics
// ============================================================

import type { DependencyGraph, Cycle, ModuleMap } from "@archlens/types";
import type { GraphMetrics, ModuleMetrics } from "@archlens/types";

/**
 * Computes graph-level aggregate metrics from the dependency graph and module metrics.
 */
export function computeGraphMetrics(
    graph: DependencyGraph,
    moduleMetrics: Map<string, ModuleMetrics>,
    cycles: readonly Cycle[],
    moduleMap: ModuleMap,
): GraphMetrics {
    const moduleCount = graph.nodes.size;
    const edgeCount = graph.edges.length;

    // Calculate cycleCount and cycleSizeDistribution (sorted ascending)
    const cycleCount = cycles.length;
    const cycleSizeDistribution = cycles
        .map((c) => c.length)
        .sort((a, b) => a - b);

    // Compute maxDepth and averageFanOut
    let maxDepth = 0;
    let totalFanOut = 0;
    let orphanCount = 0;

    for (const metrics of moduleMetrics.values()) {
        if (metrics.depth > maxDepth) {
            maxDepth = metrics.depth;
        }
        totalFanOut += metrics.fanOut;

        // An orphan has no incoming and no outgoing dependencies
        if (metrics.fanIn === 0 && metrics.fanOut === 0) {
            orphanCount++;
        }
    }

    const averageFanOut = moduleCount > 0 ? totalFanOut / moduleCount : 0;

    // Graph density: E / (V * (V - 1))
    const density =
        moduleCount > 1 ? edgeCount / (moduleCount * (moduleCount - 1)) : 0;

    // Unresolved import count from the parsed modules
    let unresolvedImportCount = 0;
    for (const moduleInfo of moduleMap.values()) {
        unresolvedImportCount += moduleInfo.unresolvedImports?.length ?? 0;
    }

    return {
        cycleCount,
        cycleSizeDistribution,
        maxDepth,
        averageFanOut,
        density,
        moduleCount,
        edgeCount,
        orphanCount,
        unresolvedImportCount,
    };
}
