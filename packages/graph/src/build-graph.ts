// ============================================================
// @archlens/graph — Graph Construction
// ============================================================

import * as path from "node:path";
import type {
    ModuleInfo,
    GraphNode,
    GraphEdge,
    DependencyGraph,
} from "@archlens/types";
import { logger } from "@archlens/shared";

/**
 * Build a DependencyGraph from a ModuleMap.
 */
export function buildGraph(
    moduleMap: ReadonlyMap<string, ModuleInfo>,
): DependencyGraph {
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    // Create nodes
    for (const [filePath, moduleInfo] of moduleMap) {
        nodes.set(filePath, {
            id: filePath,
            path: filePath,
            name: path.basename(filePath),
            type: "file",
            metadata: {
                size: 0,
                exportCount: moduleInfo.exports.length,
                importCount: moduleInfo.imports.length,
            },
        });
    }

    // Create edges
    for (const [filePath, moduleInfo] of moduleMap) {
        for (const imp of moduleInfo.imports) {
            if (imp.resolvedPath && nodes.has(imp.resolvedPath)) {
                edges.push({
                    source: filePath,
                    target: imp.resolvedPath,
                    type: imp.type,
                    metadata: {
                        specifier: imp.specifier,
                        line: imp.line,
                    },
                });
            }
        }
    }

    // Compute metadata
    const nodeCount = nodes.size;
    const edgeCount = edges.length;
    const density =
        nodeCount > 1 ? edgeCount / (nodeCount * (nodeCount - 1)) : 0;

    // Identify root nodes (no incoming edges) and leaf nodes (no outgoing edges)
    const incomingCounts = new Map<string, number>();
    const outgoingCounts = new Map<string, number>();
    for (const node of nodes.keys()) {
        incomingCounts.set(node, 0);
        outgoingCounts.set(node, 0);
    }
    for (const edge of edges) {
        incomingCounts.set(
            edge.target,
            (incomingCounts.get(edge.target) ?? 0) + 1,
        );
        outgoingCounts.set(
            edge.source,
            (outgoingCounts.get(edge.source) ?? 0) + 1,
        );
    }

    const rootNodes = [...nodes.keys()].filter(
        (n) => (incomingCounts.get(n) ?? 0) === 0,
    );
    const leafNodes = [...nodes.keys()].filter(
        (n) => (outgoingCounts.get(n) ?? 0) === 0,
    );

    logger.info(
        `Graph: ${nodeCount} nodes, ${edgeCount} edges, density ${density.toFixed(4)}`,
    );

    return {
        nodes,
        edges,
        metadata: { nodeCount, edgeCount, density, rootNodes, leafNodes },
    };
}

/**
 * Get outgoing edges for a node.
 */
export function getOutgoingEdges(
    graph: DependencyGraph,
    nodeId: string,
): readonly GraphEdge[] {
    return graph.edges.filter((e) => e.source === nodeId);
}

/**
 * Get incoming edges for a node.
 */
export function getIncomingEdges(
    graph: DependencyGraph,
    nodeId: string,
): readonly GraphEdge[] {
    return graph.edges.filter((e) => e.target === nodeId);
}

/**
 * Compute fan-in (incoming dependency count) for a node.
 */
export function fanIn(graph: DependencyGraph, nodeId: string): number {
    return getIncomingEdges(graph, nodeId).length;
}

/**
 * Compute fan-out (outgoing dependency count) for a node.
 */
export function fanOut(graph: DependencyGraph, nodeId: string): number {
    return getOutgoingEdges(graph, nodeId).length;
}
