/**
 * АЛГОРИТМ 5: МИНИМАЛЬНОЕ ОСТОВНОЕ ДЕРЕВО (Краскал)
 */
function kruskalMST(graph) {
    const n = graph.vertexCount();
    const edges = [...graph.edges];

    edges.sort((a, b) => a.weight - b.weight);

    const parent = Array(n).fill().map((_, i) => i);
    const rank = Array(n).fill(0);

    function find(v) {
        if (parent[v] !== v) parent[v] = find(parent[v]);
        return parent[v];
    }

    function union(a, b) {
        const ra = find(a), rb = find(b);
        if (ra === rb) return false;
        if (rank[ra] < rank[rb]) parent[ra] = rb;
        else if (rank[ra] > rank[rb]) parent[rb] = ra;
        else { parent[rb] = ra; rank[ra]++; }
        return true;
    }

    const mstEdges = [];
    let totalWeight = 0;
    for (const edge of edges) {
        if (union(edge.from, edge.to)) {
            mstEdges.push(edge);
            totalWeight += edge.weight;
            if (mstEdges.length === n - 1) break;
        }
    }

    return { weight: totalWeight, edges: mstEdges, isConnected: mstEdges.length === n - 1 };
}