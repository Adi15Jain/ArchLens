// ============================================================
// @archlens/graph — Graph Traversal
// ============================================================

import type { DependencyGraph } from "@archlens/types";

/**
 * Compute the maximum dependency depth from a node (longest path to any leaf).
 */
export function computeDepth(graph: DependencyGraph, nodeId: string): number {
    const visited = new Set<string>();
    const memo = new Map<string, number>();

    function dfs(id: string): number {
        if (memo.has(id)) return memo.get(id)!;
        if (visited.has(id)) return 0; // Cycle detected — don't infinite loop
        visited.add(id);

        const outgoing = graph.edges.filter((e) => e.source === id);
        if (outgoing.length === 0) {
            memo.set(id, 0);
            return 0;
        }

        let maxChildDepth = 0;
        for (const edge of outgoing) {
            const childDepth = dfs(edge.target);
            maxChildDepth = Math.max(maxChildDepth, childDepth);
        }

        const depth = maxChildDepth + 1;
        memo.set(id, depth);
        return depth;
    }

    return dfs(nodeId);
}

/**
 * Find all transitive dependencies of a node (everything reachable via outgoing edges).
 */
export function transitiveDependencies(
    graph: DependencyGraph,
    nodeId: string,
): string[] {
    const visited = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        const outgoing = graph.edges.filter((e) => e.source === current);
        for (const edge of outgoing) {
            if (!visited.has(edge.target)) {
                queue.push(edge.target);
            }
        }
    }

    visited.delete(nodeId); // Don't include self
    return [...visited];
}

/**
 * Find shortest path between two nodes using BFS. Returns null if no path exists.
 */
export function shortestPath(
    graph: DependencyGraph,
    from: string,
    to: string,
): string[] | null {
    if (from === to) return [from];

    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const queue = [from];
    visited.add(from);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const outgoing = graph.edges.filter((e) => e.source === current);

        for (const edge of outgoing) {
            if (!visited.has(edge.target)) {
                visited.add(edge.target);
                parent.set(edge.target, current);

                if (edge.target === to) {
                    // Reconstruct path
                    const pathResult: string[] = [to];
                    let node = to;
                    while (parent.has(node)) {
                        node = parent.get(node)!;
                        pathResult.unshift(node);
                    }
                    return pathResult;
                }

                queue.push(edge.target);
            }
        }
    }

    return null;
}
