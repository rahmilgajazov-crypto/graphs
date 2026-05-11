/**
 * АЛГОРИТМ 4: ЭЙЛЕРОВА ЦЕПЬ
 * Проверка, является ли последовательность вершин эйлеровой цепью
 * И поиск эйлеровой цепи (алгоритм Флёри)
 */

// Проверка, существует ли эйлерова цепь в графе
function hasEulerianPath(graph) {
    if (graph.directed) return false; // упрощённо: только неориентированные
    
    const n = graph.vertexCount();
    const degrees = Array(n).fill(0);
    for (const edge of graph.edges) {
        degrees[edge.from]++;
        degrees[edge.to]++;
    }
    
    const oddDegrees = degrees.filter(d => d % 2 === 1).length;
    // Для эйлеровой цепи нужно 0 или 2 вершины с нечётной степенью
    return (oddDegrees === 0 || oddDegrees === 2);
}

// Получить вершины с нечётной степенью (для старта цепи)
function getOddDegreeVertices(graph) {
    const n = graph.vertexCount();
    const degrees = Array(n).fill(0);
    for (const edge of graph.edges) {
        degrees[edge.from]++;
        degrees[edge.to]++;
    }
    
    const odd = [];
    for (let i = 0; i < n; i++) {
        if (degrees[i] % 2 === 1) odd.push(i);
    }
    return odd;
}

// Проверка, является ли ребро мостом (упрощённо: если после удаления граф распадается)
function isBridge(graph, edgeToCheck, startVertex) {
    // Упрощённая проверка: подсчёт компонент связности до и после удаления
    const n = graph.vertexCount();
    
    function countComponents(edges) {
        const adj = Array(n).fill().map(() => []);
        for (const e of edges) {
            adj[e.from].push(e.to);
            adj[e.to].push(e.from);
        }
        const visited = Array(n).fill(false);
        let components = 0;
        function dfs(v) {
            visited[v] = true;
            for (const to of adj[v]) {
                if (!visited[to]) dfs(to);
            }
        }
        for (let i = 0; i < n; i++) {
            if (!visited[i] && adj[i].length > 0) {
                dfs(i);
                components++;
            }
        }
        return components;
    }
    
    const originalComponents = countComponents(graph.edges);
    
    // Удаляем ребро
    const filteredEdges = graph.edges.filter(e => 
        !(e.from === edgeToCheck.from && e.to === edgeToCheck.to) &&
        !(e.from === edgeToCheck.to && e.to === edgeToCheck.from)
    );
    const newComponents = countComponents(filteredEdges);
    
    return newComponents > originalComponents;
}

// Алгоритм Флёри для поиска эйлеровой цепи
function findEulerianPath(graph) {
    if (!hasEulerianPath(graph)) return null;
    
    const vertices = graph.vertices;
    const edges = [...graph.edges];
    const path = [];
    
    // Стартовая вершина: если есть нечётные степени — с одной из них
    let oddVertices = getOddDegreeVertices(graph);
    let startId = oddVertices.length > 0 ? oddVertices[0] : 0;
    
    let currentId = startId;
    
    while (edges.length > 0) {
        // Ищем подходящее ребро (не мост, если есть выбор)
        let nextEdge = null;
        let nextVertex = -1;
        
        const candidates = edges.filter(e => e.from === currentId || e.to === currentId);
        
        if (candidates.length === 0) break;
        
        // Ищем не-мост
        for (const edge of candidates) {
            const newCurrent = (edge.from === currentId) ? edge.to : edge.from;
            const tempGraph = { ...graph, edges: edges };
            if (!isBridge(tempGraph, edge, currentId) || candidates.length === 1) {
                nextEdge = edge;
                nextVertex = newCurrent;
                break;
            }
        }
        
        if (!nextEdge) break;
        
        // Добавляем в путь
        if (path.length === 0) {
            path.push(vertices[currentId].label);
        }
        path.push(vertices[nextVertex].label);
        
        // Удаляем ребро
        const edgeIndex = edges.findIndex(e => 
            (e.from === nextEdge.from && e.to === nextEdge.to) ||
            (e.from === nextEdge.to && e.to === nextEdge.from)
        );
        edges.splice(edgeIndex, 1);
        
        currentId = nextVertex;
    }
    
    return path;
}

// Проверка введённой пользователем цепи
function isEulerianChain(vertexSequence, graph) {
    const steps = vertexSequence.split('-').map(s => s.trim().toUpperCase());
    if (steps.length < 2) return false;
    
    const vertices = graph.vertices;
    const edges = [...graph.edges];
    
    function getVertexId(label) {
        const v = vertices.find(v => v.label === label);
        return v ? v.id : -1;
    }
    
    const usedEdges = new Array(edges.length).fill(false);
    let prevVertex = steps[0];
    
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
                (e.from === currId && e.to === prevId)) {
                usedEdges[ei] = true;
                found = true;
                break;
            }
        }
        if (!found) return false;
        prevVertex = currVertex;
    }
    
    return usedEdges.every(u => u === true);
}
