// ============================================================
// @archlens/analyzer — Module Metrics
// ============================================================

import type { DependencyGraph } from "@archlens/types";
import type { ModuleMetrics } from "@archlens/types";
import { fanIn, fanOut, computeDepth } from "@archlens/graph";

/**
 * Computes metrics for all modules in a dependency graph.
 */
export function computeModuleMetrics(
    graph: DependencyGraph,
    betweenness: Record<string, number>,
): Map<string, ModuleMetrics> {
    const metricsMap = new Map<string, ModuleMetrics>();

    for (const nodeId of graph.nodes.keys()) {
        const fIn = fanIn(graph, nodeId);
        const fOut = fanOut(graph, nodeId);

        // Instability = Ce / (Ca + Ce) = fanOut / (fanIn + fanOut)
        // Safe division: if total dependencies are zero, instability is 0 (fully stable/independent)
        const instability = fIn + fOut > 0 ? fOut / (fIn + fOut) : 0;

        const depth = computeDepth(graph, nodeId);
        const btwn = betweenness[nodeId] ?? 0;

        metricsMap.set(nodeId, {
            moduleId: nodeId,
            fanIn: fIn,
            fanOut: fOut,
            instability,
            depth,
            betweenness: btwn,
        });
    }

    return metricsMap;
}
