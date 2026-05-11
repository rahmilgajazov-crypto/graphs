/**
 * Найти кратчайший путь от start до end алгоритмом Форда-Беллмана
 * Оптимизировано: ранний выход, кэширование
 * @param {Graph} graph 
 * @param {number} startId 
 * @param {number} endId 
 * @returns {Object}
 */
function fordBellman(graph, startId, endId) {
    const n = graph.vertexCount();
    const vertices = graph.vertices;
    const edges = graph.edges;

    // Быстрый путь: если start и end совпадают
    if (startId === endId) {
        return {
            distance: 0,
            path: vertices[startId].label,
            distances: [],
            parents: [],
            hasNegativeCycle: false
        };
    }

    // Инициализация
    const dist = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    dist[startId] = 0;

    // Основной цикл (ранний выход при отсутствии изменений)
    let changed = true;
    for (let i = 0; i < n - 1 && changed; i++) {
        changed = false;
        for (const edge of edges) {
            const u = edge.from;
            const v = edge.to;
            const w = edge.weight !== undefined ? edge.weight : 1;

            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                changed = true;
            }
        }
    }

    // Восстановление пути
    const path = [];
    let current = endId;
    let iterations = 0;
    const maxIterations = n + 5;

    while (current !== -1 && iterations < maxIterations) {
        path.unshift(vertices[current].label);
        current = parent[current];
        iterations++;
    }

    // Проверка на отрицательный цикл (только если путь не найден)
    let hasNegativeCycle = false;
    if (dist[endId] === Infinity) {
        for (const edge of edges) {
            const u = edge.from;
            const v = edge.to;
            const w = edge.weight !== undefined ? edge.weight : 1;
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                hasNegativeCycle = true;
                break;
            }
        }
    }

    return {
        distance: dist[endId],
        path: path.join('-'),
        distances: dist,
        parents: parent,
        hasNegativeCycle: hasNegativeCycle
    };
}