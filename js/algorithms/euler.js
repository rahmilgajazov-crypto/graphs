//АЛГОРИТМ 4: ЭЙЛЕРОВА ЦЕПЬ

function isValidGraph(graph) {
    return graph && typeof graph.vertexCount === 'function';
}

function getDegrees(graph) {
    const n = graph.vertexCount();
    const deg = Array(n).fill(0);
    for (const e of graph.edges) {
        deg[e.from]++;
        deg[e.to]++;
    }
    return deg;
}

function hasEulerianPath(graph) {
    if (!isValidGraph(graph)) return false;
    const deg = getDegrees(graph);
    const oddCount = deg.filter(d => d % 2 === 1).length;
    return oddCount === 0 || oddCount === 2;
}

function getOddVerticesIds(graph) {
    const deg = getDegrees(graph);
    const odd = [];
    for (let i = 0; i < deg.length; i++) {
        if (deg[i] % 2 === 1) odd.push(i);
    }
    return odd;
}

// Функция getOddVerticesLabels УДАЛЕНА — не использовалась

function getDegreesForDisplay(graph) {
    const deg = getDegrees(graph);
    const vertices = graph.vertices;
    const result = [];
    for (let i = 0; i < deg.length; i++) {
        result.push({
            vertex: vertices[i].label,
            degree: deg[i],
            isOdd: deg[i] % 2 === 1
        });
    }
    return result;
}

// ========== ОСНОВНОЙ АЛГОРИТМ ХИРХОЛЬЦЕРА ==========

function findEulerianPath(graph) {
    if (!hasEulerianPath(graph)) {
        return null;
    }

    const vertices = graph.vertices;
    const n = vertices.length;
    const edges = graph.edges;

    if (edges.length === 0) return [];

    const adj = Array(n).fill().map(() => new Map());

    for (const e of edges) {
        const u = e.from;
        const v = e.to;
        adj[u].set(v, (adj[u].get(v) || 0) + 1);
        adj[v].set(u, (adj[v].get(u) || 0) + 1);
    }

    const oddIds = getOddVerticesIds(graph);
    let start = 0;
    if (oddIds.length === 2) {
        start = oddIds[0];
    } else if (oddIds.length === 0) {
        start = 0;
    } else {
        return null;
    }

    const stack = [start];
    const path = [];

    while (stack.length > 0) {
        const v = stack[stack.length - 1];

        if (adj[v].size === 0) {
            path.push(v);
            stack.pop();
        } else {
            const neighbor = adj[v].keys().next().value;

            const newCountV = adj[v].get(neighbor) - 1;
            const newCountU = adj[neighbor].get(v) - 1;

            if (newCountV === 0) {
                adj[v].delete(neighbor);
            } else {
                adj[v].set(neighbor, newCountV);
            }

            if (newCountU === 0) {
                adj[neighbor].delete(v);
            } else {
                adj[neighbor].set(v, newCountU);
            }

            stack.push(neighbor);
        }
    }

    const pathIds = path.reverse();
    const pathLabels = pathIds.map(id => vertices[id].label);

    return pathLabels;
}

function isEulerianChain(vertexSequence, graph) {
    if (!isValidGraph(graph)) return false;

    const steps = vertexSequence.split('-').map(s => s.trim().toUpperCase());
    if (steps.length < 2) return false;

    const vertices = graph.vertices;
    const edges = graph.edges.map(e => ({ from: e.from, to: e.to }));
    const usedEdges = new Array(edges.length).fill(false);

    function getVertexId(label) {
        const v = vertices.find(v => v.label === label);
        return v ? v.id : -1;
    }

    let prev = steps[0];
    for (let i = 1; i < steps.length; i++) {
        const curr = steps[i];
        const prevId = getVertexId(prev);
        const currId = getVertexId(curr);

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
        prev = curr;
    }

    return usedEdges.every(u => u === true);
}