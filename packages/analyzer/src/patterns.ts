// ============================================================
// @archlens/analyzer — Structural Pattern Detection
// ============================================================

import type { DependencyGraph } from "@archlens/types";
import type { PatternMatch, ModuleMetrics } from "@archlens/types";

/**
 * Detects structural patterns in the dependency graph.
 */
export function detectPatterns(
    graph: DependencyGraph,
    moduleMetrics: Map<string, ModuleMetrics>,
): {
    hubs: PatternMatch[];
    godModules: PatternMatch[];
    bottlenecks: PatternMatch[];
    orphans: PatternMatch[];
    leafModules: PatternMatch[];
} {
    const hubs: PatternMatch[] = [];
    const godModules: PatternMatch[] = [];
    const bottlenecks: PatternMatch[] = [];
    const orphans: PatternMatch[] = [];
    const leafModules: PatternMatch[] = [];

    const totalNodes = graph.nodes.size;

    // Let's compute average betweenness to scale the bottleneck detection
    let maxBetweenness = 0;
    for (const m of moduleMetrics.values()) {
        if (m.betweenness > maxBetweenness) {
            maxBetweenness = m.betweenness;
        }
    }

    for (const [moduleId, m] of moduleMetrics.entries()) {
        const { fanIn, fanOut, betweenness } = m;

        // 1. Orphan: no incoming, no outgoing
        if (fanIn === 0 && fanOut === 0) {
            orphans.push({
                moduleId,
                patternType: "orphan",
                metrics: { fanIn, fanOut, betweenness },
                evidence: `Module '${graph.nodes.get(moduleId)?.name}' has no incoming or outgoing dependencies, indicating it is completely isolated.`,
            });
            continue; // An orphan cannot be anything else
        }

        // 2. Hub: high fan-in and high fan-out (crossroads)
        if (fanIn >= 4 && fanOut >= 4) {
            hubs.push({
                moduleId,
                patternType: "hub",
                metrics: { fanIn, fanOut, betweenness },
                evidence: `Module '${graph.nodes.get(moduleId)?.name}' acts as a structural hub with high coupling (fan-in: ${fanIn}, fan-out: ${fanOut}).`,
            });
        }

        // 3. God Module: extremely high total coupling (complexity sink)
        if (fanIn + fanOut >= 10) {
            godModules.push({
                moduleId,
                patternType: "god-module",
                metrics: {
                    fanIn,
                    fanOut,
                    coupling: fanIn + fanOut,
                    betweenness,
                },
                evidence: `Module '${graph.nodes.get(moduleId)?.name}' is a highly coupled complexity sink with ${fanIn + fanOut} total dependencies (fan-in: ${fanIn}, fan-out: ${fanOut}).`,
            });
        }

        // 4. Bottleneck: High betweenness (lies on many shortest paths) and low fan-out, but high fan-in
        // If betweenness is in the top tier (or > 0.05 * V) and it accepts more than it emits
        const isHighBetweenness =
            maxBetweenness > 0 ? betweenness / maxBetweenness > 0.3 : false;
        if (
            fanIn >= 3 &&
            fanOut <= 2 &&
            betweenness > 0 &&
            (isHighBetweenness || betweenness >= 5)
        ) {
            bottlenecks.push({
                moduleId,
                patternType: "bottleneck",
                metrics: { fanIn, fanOut, betweenness },
                evidence: `Module '${graph.nodes.get(moduleId)?.name}' is a critical bottleneck node on multiple dependency paths, having high fan-in (${fanIn}), low fan-out (${fanOut}), and high betweenness centrality (${betweenness.toFixed(2)}).`,
            });
        }

        // 5. Leaf: fan-in > 0, fan-out == 0
        if (fanIn > 0 && fanOut === 0) {
            leafModules.push({
                moduleId,
                patternType: "leaf",
                metrics: { fanIn, fanOut, betweenness },
                evidence: `Module '${graph.nodes.get(moduleId)?.name}' is a leaf module (pure dependency) imported by ${fanIn} other modules, but depends on nothing itself.`,
            });
        }
    }

    return { hubs, godModules, bottlenecks, orphans, leafModules };
}
