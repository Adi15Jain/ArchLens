// ============================================================
// @archlens/types — Graph Types
// ============================================================

import type { EdgeType } from "./common.js";

/**
 * A node in the dependency graph, representing a module or package.
 */
export interface GraphNode {
    readonly id: string;
    readonly path: string;
    readonly name: string;
    readonly type: "file" | "package";
    readonly metadata: {
        readonly size: number;
        readonly exportCount: number;
        readonly importCount: number;
    };
}

/**
 * An edge in the dependency graph, representing a dependency relationship.
 */
export interface GraphEdge {
    readonly source: string;
    readonly target: string;
    readonly type: EdgeType;
    readonly metadata: {
        readonly specifier: string;
        readonly line: number;
    };
}

/**
 * The dependency graph data structure.
 * Immutable after construction — all operations return new instances.
 */
export interface DependencyGraph {
    readonly nodes: ReadonlyMap<string, GraphNode>;
    readonly edges: readonly GraphEdge[];
    readonly metadata: {
        readonly nodeCount: number;
        readonly edgeCount: number;
        readonly density: number;
        readonly rootNodes: readonly string[];
        readonly leafNodes: readonly string[];
    };
}

/**
 * A cycle (strongly connected component) in the graph.
 */
export interface Cycle {
    readonly nodes: readonly string[];
    readonly length: number;
    readonly edges: readonly GraphEdge[];
}
