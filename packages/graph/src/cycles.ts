// ============================================================
// @archlens/graph — Tarjan's SCC (Cycle Detection)
// ============================================================

import type { DependencyGraph, Cycle, GraphEdge } from "@archlens/types";

/**
 * Detect all cycles (strongly connected components with size > 1)
 * using Tarjan's algorithm. O(V + E).
 */
export function detectCycles(graph: DependencyGraph): Cycle[] {
    const nodeIds = [...graph.nodes.keys()];
    const adjacency = new Map<string, string[]>();

    for (const nodeId of nodeIds) {
        adjacency.set(nodeId, []);
    }
    for (const edge of graph.edges) {
        adjacency.get(edge.source)?.push(edge.target);
    }

    let index = 0;
    const stack: string[] = [];
    const onStack = new Set<string>();
    const indices = new Map<string, number>();
    const lowlinks = new Map<string, number>();
    const sccs: string[][] = [];

    function strongconnect(v: string): void {
        indices.set(v, index);
        lowlinks.set(v, index);
        index++;
        stack.push(v);
        onStack.add(v);

        const neighbors = adjacency.get(v) ?? [];
        for (const w of neighbors) {
            if (!indices.has(w)) {
                strongconnect(w);
                lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!));
            } else if (onStack.has(w)) {
                lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!));
            }
        }

        if (lowlinks.get(v) === indices.get(v)) {
            const scc: string[] = [];
            let w: string;
            do {
                w = stack.pop()!;
                onStack.delete(w);
                scc.push(w);
            } while (w !== v);

            if (scc.length > 1) {
                sccs.push(scc.reverse());
            }
        }
    }

    for (const nodeId of nodeIds) {
        if (!indices.has(nodeId)) {
            strongconnect(nodeId);
        }
    }

    // Convert SCCs to Cycle objects with edges
    return sccs.map((scc) => {
        const sccSet = new Set(scc);
        const cycleEdges: GraphEdge[] = graph.edges.filter(
            (e) => sccSet.has(e.source) && sccSet.has(e.target),
        );

        return {
            nodes: scc,
            length: scc.length,
            edges: cycleEdges,
        };
    });
}
