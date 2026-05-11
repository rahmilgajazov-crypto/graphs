/**
 * АЛГОРИТМ 5: МИНИМАЛЬНОЕ ОСТОВНОЕ ДЕРЕВО
 * Метод: алгоритм Краскала (сортировка рёбер + DSU)
 * Сложность: O(E log E)
 * 
 * Принцип работы:
 * 1. Сортируем все рёбра по весу
 * 2. Берём рёбра по порядку, если они не образуют цикл — добавляем в MST
 * 3. Цикл проверяется через систему непересекающихся множеств (DSU)
 * 
 * Соответствует пункту 8 документации
 */

/**
 * Алгоритм Краскала для построения минимального остовного дерева
 * @param {Graph} graph 
 * @returns {Object} { weight, edges }
 */
function kruskalMST(graph) {
    const n = graph.vertexCount();
    const edges = [...graph.edges];
    
    // 1. Сортируем рёбра по весу
    edges.sort((a, b) => a.weight - b.weight);
    
    // 2. Система непересекающихся множеств (DSU)
    const parent = Array(n).fill().map((_, i) => i);
    const rank = Array(n).fill(0);
    
    function find(v) {
        if (parent[v] !== v) {
            parent[v] = find(parent[v]);  // сжатие пути
        }
        return parent[v];
    }
    
    function union(a, b) {
        const ra = find(a);
        const rb = find(b);
        if (ra === rb) return false;
        
        // Объединение по рангу
        if (rank[ra] < rank[rb]) {
            parent[ra] = rb;
        } else if (rank[ra] > rank[rb]) {
            parent[rb] = ra;
        } else {
            parent[rb] = ra;
            rank[ra]++;
        }
        return true;
    }
    
    // 3. Основной цикл
    const mstEdges = [];
    let totalWeight = 0;
    
    for (const edge of edges) {
        if (union(edge.from, edge.to)) {
            mstEdges.push(edge);
            totalWeight += edge.weight;
            if (mstEdges.length === n - 1) break;
        }
    }
    
    // 4. Если граф несвязный, MST не построено
    if (mstEdges.length !== n - 1) {
        return {
            weight: null,
            edges: [],
            isConnected: false
        };
    }
    
    return {
        weight: totalWeight,
        edges: mstEdges,
        isConnected: true
    };
}

/**
 * Алгоритм Прима (альтернативный вариант)
 * @param {Graph} graph 
 * @returns {Object} { weight, edges }
 */
function primMST(graph) {
    const n = graph.vertexCount();
    const vertices = graph.vertices;
    
    if (n === 0) return { weight: 0, edges: [] };
    
    const visited = Array(n).fill(false);
    const minEdge = Array(n).fill(null);
    const minWeight = Array(n).fill(Infinity);
    
    minWeight[0] = 0;
    
    for (let i = 0; i < n; i++) {
        // Находим непосещённую вершину с минимальным весом
        let u = -1;
        for (let j = 0; j < n; j++) {
            if (!visited[j] && (u === -1 || minWeight[j] < minWeight[u])) {
                u = j;
            }
        }
        
        if (u === -1) break;
        visited[u] = true;
        
        // Обновляем рёбра
        for (const edge of graph.edges) {
            if (edge.from === u && !visited[edge.to] && edge.weight < minWeight[edge.to]) {
                minWeight[edge.to] = edge.weight;
                minEdge[edge.to] = edge;
            }
            if (!graph.directed && edge.to === u && !visited[edge.from] && edge.weight < minWeight[edge.from]) {
                minWeight[edge.from] = edge.weight;
                minEdge[edge.from] = { from: edge.to, to: edge.from, weight: edge.weight };
            }
        }
    }
    
    const mstEdges = [];
    let totalWeight = 0;
    for (let i = 1; i < n; i++) {
        if (minEdge[i]) {
            mstEdges.push(minEdge[i]);
            totalWeight += minEdge[i].weight;
        }
    }
    
    return {
        weight: totalWeight,
        edges: mstEdges,
        isConnected: mstEdges.length === n - 1
    };
}