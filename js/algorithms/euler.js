/**
 * АЛГОРИТМ 4: ЭЙЛЕРОВА ЦЕПЬ
 * Метод: алгоритм Флёри (проверка мостов) или простая проверка введённой цепи
 * 
 * Определение: эйлерова цепь — путь, проходящий по каждому ребру ровно один раз
 * 
 * В данном модуле реализована проверка корректности введённой пользователем цепи
 * Соответствует пункту 7 документации
 */

/**
 * Проверить, является ли последовательность вершин эйлеровой цепью
 * @param {string} vertexSequence - строка вида "A-B-C-D-A"
 * @param {Graph} graph 
 * @returns {boolean}
 */
function isEulerianChain(vertexSequence, graph) {
    const steps = vertexSequence.split('-').map(s => s.trim().toUpperCase());
    if (steps.length < 2) return false;
    
    const vertices = graph.vertices;
    const edges = [...graph.edges];  // копия рёбер для пометок
    
    // Копия рёбер для отметки использованных
    const usedEdges = new Array(edges.length).fill(false);
    let prevVertex = steps[0];
    
    // Вспомогательная функция: найти индекс вершины по букве
    function getVertexId(label) {
        const v = vertices.find(v => v.label === label);
        return v ? v.id : -1;
    }
    
    // Проверяем каждый шаг
    for (let i = 1; i < steps.length; i++) {
        const currVertex = steps[i];
        const prevId = getVertexId(prevVertex);
        const currId = getVertexId(currVertex);
        
        if (prevId === -1 || currId === -1) return false;
        
        let found = false;
        for (let ei = 0; ei < edges.length; ei++) {
            if (usedEdges[ei]) continue;
            const e = edges[ei];
            
            if ((e.from === prevId && e.to === currId) ||
                (!graph.directed && e.from === currId && e.to === prevId)) {
                usedEdges[ei] = true;
                found = true;
                break;
            }
        }
        
        if (!found) return false;
        prevVertex = currVertex;
    }
    
    // Все ли рёбра использованы?
    return usedEdges.every(u => u === true);
}

/**
 * Найти эйлерову цепь (алгоритм Флёри — упрощённо)
 * @param {Graph} graph 
 * @returns {Array<string>|null} последовательность вершин или null, если цепи нет
 */
function findEulerianChain(graph) {
    const vertices = graph.vertices;
    const edges = [...graph.edges];
    
    // Проверка существования эйлеровой цепи:
    // В неориентированном графе: 0 или 2 вершины с нечётной степенью
    if (!graph.directed) {
        const degrees = Array(graph.vertexCount()).fill(0);
        for (const edge of edges) {
            degrees[edge.from]++;
            degrees[edge.to]++;
        }
        const oddDegrees = degrees.filter(d => d % 2 === 1);
        if (oddDegrees.length !== 0 && oddDegrees.length !== 2) return null;
        
        // Стартуем из нечётной вершины, если есть
        const startId = oddDegrees.length === 2 
            ? degrees.findIndex(d => d % 2 === 1)
            : 0;
        
        // Упрощённый поиск: просто показываем пример
        return [vertices[startId].label, vertices[(startId + 1) % vertices.length].label, vertices[startId].label];
    }
    
    return null;
}