# RFC-003 — Graph Engine

---

## Metadata

| Field       | Value                  |
| ----------- | ---------------------- |
| Document ID | RFC-003                |
| Version     | 1.0.0                  |
| Status      | DRAFT                  |
| Owner       | ArchLens Core Team     |
| Created     | 2026-06-02             |
| Phase       | Phase 3 — Package RFCs |
| Depends On  | RFC-002, ARCH-009      |
| Package     | `@archlens/graph`      |

---

## Purpose

RFC for the `@archlens/graph` package — responsible for constructing, querying, and operating on the dependency graph.

---

## Responsibility

L2 in the Architecture Intelligence Hierarchy. Takes a `ModuleMap` and produces a `DependencyGraph` with typed nodes, typed edges, and graph operations.

---

## Public API

```typescript
// Construction
function buildGraph(moduleMap: ModuleMap): DependencyGraph;
function collapseToPackages(graph: DependencyGraph): DependencyGraph;

// Queries
function getNode(graph: DependencyGraph, id: string): GraphNode | undefined;
function getEdges(graph: DependencyGraph, sourceId: string): GraphEdge[];
function getIncomingEdges(
    graph: DependencyGraph,
    targetId: string,
): GraphEdge[];
function fanIn(graph: DependencyGraph, nodeId: string): number;
function fanOut(graph: DependencyGraph, nodeId: string): number;

// Operations
function detectCycles(graph: DependencyGraph): Cycle[];
function topologicalSort(graph: DependencyGraph): Result<string[], CycleError>;
function transitiveDependencies(
    graph: DependencyGraph,
    nodeId: string,
): string[];
function shortestPath(
    graph: DependencyGraph,
    from: string,
    to: string,
): string[] | null;
function subgraph(
    graph: DependencyGraph,
    filter: (node: GraphNode) => boolean,
): DependencyGraph;
```

---

## Internal Design

### Data Structure

The graph uses an adjacency list representation:

- `nodes`: `Map<string, GraphNode>` — O(1) node lookup.
- `outEdges`: `Map<string, GraphEdge[]>` — Outgoing edges per node.
- `inEdges`: `Map<string, GraphEdge[]>` — Incoming edges per node (maintained for O(1) fan-in queries).

**Why adjacency list over adjacency matrix**: Dependency graphs are sparse (density typically < 5%). Adjacency lists are space-efficient for sparse graphs and support O(degree) edge iteration.

### Graph Construction Algorithm

1. Create a node for each entry in the `ModuleMap`.
2. For each module's resolved imports, create an edge from the importing module to the imported module.
3. Skip edges to modules not in the graph (external imports already filtered by parser).
4. Build both `outEdges` and `inEdges` maps in a single pass.
5. Compute metadata (node count, edge count, density, root/leaf identification).

### Cycle Detection (Tarjan's SCC)

1. Run Tarjan's strongly connected components algorithm.
2. Filter SCCs with size > 1 (these are cycles).
3. For each SCC, extract the edges forming the cycle.
4. Return `Cycle[]` with node lists and edge lists.

Time complexity: O(V + E).

### Package Collapse

1. Determine package boundaries by directory (configurable depth).
2. Group file-level nodes by package.
3. Create package-level nodes.
4. Merge file-level edges into package-level edges:
    - If multiple file-level edges exist between the same two packages, create one package-level edge with a `weight` equal to the count.
5. Recompute metadata for the collapsed graph.

---

## Immutability

The `DependencyGraph` object is immutable after construction. All operations that "modify" the graph (e.g., `subgraph`, `collapseToPackages`) return new graph instances.

---

## Dependencies

- `@archlens/types` — `DependencyGraph`, `GraphNode`, `GraphEdge`, `Cycle` types
- `@archlens/shared` — `Result` type
- `@archlens/parser` — `ModuleMap` type (input)
- No external graph library — custom implementation for control and minimal dependencies

---

## Testing Strategy

| Test Type   | Description                                                         |
| ----------- | ------------------------------------------------------------------- |
| Unit        | Node/edge creation, fan-in/fan-out computation                      |
| Algorithm   | Cycle detection with known cyclic and acyclic graphs                |
| Integration | Build graph from parsed fixture project, verify structure           |
| Edge cases  | Self-imports, empty graph, single-node graph, fully connected graph |

---

_End of RFC-003_
