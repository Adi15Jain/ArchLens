// ============================================================
// @archlens/analyzer — Betweenness Centrality (Brandes' Algorithm)
// ============================================================

import type { DependencyGraph } from "@archlens/types";

/**
 * Computes betweenness centrality for all nodes in the dependency graph
 * using Brandes' algorithm. The time complexity is O(V * E) for unweighted graphs.
 *
 * Betweenness centrality measures the number of times a node lies on the
 * shortest path between other nodes. Nodes with high betweenness are critical
 * bottlenecks or bridge nodes in the architecture.
 */
export function computeBetweennessCentrality(
    graph: DependencyGraph,
): Record<string, number> {
    const centrality: Record<string, number> = {};
    const nodeIds = Array.from(graph.nodes.keys());

    // Initialize centrality to 0
    for (const id of nodeIds) {
        centrality[id] = 0;
    }

    // Pre-build adjacency list for fast lookups
    const adj = new Map<string, string[]>();
    for (const id of nodeIds) {
        adj.set(id, []);
    }
    for (const edge of graph.edges) {
        const list = adj.get(edge.source);
        if (list) {
            list.push(edge.target);
        }
    }

    // Brandes' algorithm
    for (const s of nodeIds) {
        const stack: string[] = [];
        const P = new Map<string, string[]>();
        const sigma = new Map<string, number>();
        const d = new Map<string, number>();

        for (const id of nodeIds) {
            P.set(id, []);
            sigma.set(id, 0);
            d.set(id, -1);
        }

        sigma.set(s, 1);
        d.set(s, 0);

        const queue: string[] = [s];
        let qHead = 0;

        while (qHead < queue.length) {
            const v = queue[qHead++];
            if (v === undefined) break;
            stack.push(v);

            const neighbors = adj.get(v) || [];
            for (const w of neighbors) {
                // Path discovery
                const dw = d.get(w)!;
                const dv = d.get(v)!;
                if (dw < 0) {
                    queue.push(w);
                    d.set(w, dv + 1);
                }

                // Path counting
                if (d.get(w) === dv + 1) {
                    sigma.set(w, sigma.get(w)! + sigma.get(v)!);
                    P.get(w)!.push(v);
                }
            }
        }

        // Accumulation
        const delta = new Map<string, number>();
        for (const id of nodeIds) {
            delta.set(id, 0);
        }

        while (stack.length > 0) {
            const w = stack.pop();
            if (!w) continue;
            const parents = P.get(w) || [];
            const sigmaW = sigma.get(w)!;
            const deltaW = delta.get(w)!;

            for (const v of parents) {
                const sigmaV = sigma.get(v)!;
                const fraction = sigmaV / sigmaW;
                delta.set(v, delta.get(v)! + fraction * (1 + deltaW));
            }

            if (w !== s) {
                centrality[w] = (centrality[w] ?? 0) + delta.get(w)!;
            }
        }
    }

    return centrality;
}
