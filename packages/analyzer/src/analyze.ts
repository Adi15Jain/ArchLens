// ============================================================
// @archlens/analyzer — Main Analysis Orchestration
// ============================================================

import type {
    DependencyGraph,
    ModuleMap,
    AnalysisResult,
    Anomaly,
} from "@archlens/types";
import { computeBetweennessCentrality } from "./centrality.js";
import { computeModuleMetrics } from "./metrics.js";
import { computeGraphMetrics } from "./graph-metrics.js";
import { detectPatterns } from "./patterns.js";
import { detectCycles } from "@archlens/graph";
import { logger } from "@archlens/shared";

/**
 * Run the complete architecture analysis pipeline.
 */
export function analyze(
    graph: DependencyGraph,
    moduleMap: ModuleMap,
): AnalysisResult {
    logger.info("Analyzing dependency graph...");

    // 1. Compute Betweenness Centrality
    const betweenness = computeBetweennessCentrality(graph);

    // 2. Compute Module Metrics (fan-in, fan-out, instability, depth, betweenness)
    const moduleMetrics = computeModuleMetrics(graph, betweenness);

    // 3. Detect Cycles (Strongly Connected Components)
    const cycles = detectCycles(graph);

    // 4. Compute Graph-Level Aggregate Metrics
    const graphMetrics = computeGraphMetrics(
        graph,
        moduleMetrics,
        cycles,
        moduleMap,
    );

    // 5. Detect Structural Patterns (hubs, god modules, bottlenecks, orphans, leaves)
    const patterns = detectPatterns(graph, moduleMetrics);

    // 6. Detect Structural Anomalies
    const anomalies: Anomaly[] = [];

    // Anomaly 1: Cycles
    if (cycles.length > 0) {
        const cycleModules = new Set<string>();
        for (const cycle of cycles) {
            for (const node of cycle.nodes) {
                cycleModules.add(node);
            }
        }
        anomalies.push({
            type: "circular-dependency",
            description: `Detected ${cycles.length} circular dependency cycles in the graph, hindering independent deployability.`,
            modules: Array.from(cycleModules),
            severity: "high",
        });
    }

    // Anomaly 2: Stable Dependencies Principle (SDP) Violations
    // A stable module (low instability) should not depend on an unstable module (high instability)
    const sdpViolations: string[] = [];
    for (const edge of graph.edges) {
        const srcMetrics = moduleMetrics.get(edge.source);
        const tgtMetrics = moduleMetrics.get(edge.target);
        if (srcMetrics && tgtMetrics) {
            // If source is very stable (instability < 0.3) and target is unstable (instability > 0.7)
            if (srcMetrics.instability < 0.3 && tgtMetrics.instability > 0.7) {
                sdpViolations.push(`${edge.source} -> ${edge.target}`);
            }
        }
    }
    if (sdpViolations.length > 0) {
        anomalies.push({
            type: "stable-dependency-violation",
            description: `Detected ${sdpViolations.length} Stable Dependencies Principle (SDP) violations where highly stable modules depend on volatile/unstable modules.`,
            modules: sdpViolations,
            severity: "medium",
        });
    }

    // Anomaly 3: God Modules (Complexity Sinks)
    if (patterns.godModules.length > 0) {
        anomalies.push({
            type: "god-module-anomaly",
            description: `Detected ${patterns.godModules.length} god modules that absorb excessive structural coupling.`,
            modules: patterns.godModules.map((m) => m.moduleId),
            severity: "medium",
        });
    }

    // Anomaly 4: Bottleneck Modules
    if (patterns.bottlenecks.length > 0) {
        anomalies.push({
            type: "dependency-bottleneck",
            description: `Detected ${patterns.bottlenecks.length} module bottlenecks that lie on multiple critical path dependencies.`,
            modules: patterns.bottlenecks.map((m) => m.moduleId),
            severity: "high",
        });
    }

    logger.info(
        `Analysis completed: found ${cycles.length} cycles, ${anomalies.length} total anomalies.`,
    );

    return {
        metrics: {
            modules: moduleMetrics,
            graph: graphMetrics,
        },
        patterns,
        cycles,
        anomalies,
    };
}
