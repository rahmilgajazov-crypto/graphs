const VERTEX_LABELS = 'ABCDEFGH';

function getCircularPositions(n, width, height, radius = 130)
{
    const cx = width / 2;
    const cy = height / 2;
    const positions = [];
    for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        positions.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
    }
    return positions;
}

function createVertices(n, width, height) {
    const positions = getCircularPositions(n, width, height);
    return positions.map((p, i) => ({
        id: i,
        label: VERTEX_LABELS[i % VERTEX_LABELS.length],
        x: p.x,
        y: p.y
    }));
}

function generateSCCGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    let compCount = Math.random() < 0.2 ? 1 : Math.floor(Math.random() * 3) + 2;
    if (compCount > n) compCount = Math.min(n, 3);

    const sizes = Array(compCount).fill(Math.floor(n / compCount));
    for (let i = 0; i < n % compCount; i++) sizes[i]++;

    const components = [];
    let idx = 0;
    for (let c = 0; c < compCount; c++) {
        const comp = [];
        for (let i = 0; i < sizes[c]; i++) comp.push(idx++);
        components.push(comp);
    }

    let doubleEdgesCount = 0;
    const MAX_DOUBLE_EDGES = 2;

    for (const comp of components) {
        if (comp.length === 1) continue;
        for (let i = 0; i < comp.length; i++) {
            edges.push({ from: comp[i], to: comp[(i + 1) % comp.length] });
            if (doubleEdgesCount < MAX_DOUBLE_EDGES && Math.random() < 0.3) {
                edges.push({ from: comp[(i + 1) % comp.length], to: comp[i] });
                doubleEdgesCount++;
            }
        }
    }

    for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
            if (Math.random() > 0.4) {
                const fromIdx = Math.floor(Math.random() * components[i].length);
                const toIdx = Math.floor(Math.random() * components[j].length);
                edges.push({ from: components[i][fromIdx], to: components[j][toIdx] });
            }
        }
    }

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.random() < 0.08) {
                let hasReverse = edges.some(e => e.from === j && e.to === i);
                if (!hasReverse || doubleEdgesCount < MAX_DOUBLE_EDGES) {
                    if (hasReverse) doubleEdgesCount++;
                    edges.push({ from: i, to: j });
                }
            }
        }
    }

    const graph = new Graph(vertices, edges, true, false);
    return { graph };
}

function generateWaveGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.random() < 0.25) {
                edges.push({ from: i, to: j });
            }
        }
    }

    const graph = new Graph(vertices, edges, true, false);
    return { graph };
}

function generateBellmanFordGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    // Случайные начальная и конечная вершины (разные)
    const startId = Math.floor(Math.random() * n);
    let endId = Math.floor(Math.random() * n);
    while (endId === startId) {
        endId = Math.floor(Math.random() * n);
    }

    // Создаём перемешанный порядок вершин для гарантированного пути
    const pathVertices = [];
    for (let i = 0; i < n; i++) pathVertices.push(i);
    for (let i = pathVertices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pathVertices[i], pathVertices[j]] = [pathVertices[j], pathVertices[i]];
    }

    const startIndex = pathVertices.indexOf(startId);
    const endIndex = pathVertices.indexOf(endId);

    // Строим путь от startId до endId вдоль перемешанного порядка (только прямой путь, без возвратов)
    if (startIndex < endIndex) {
        for (let i = startIndex; i < endIndex; i++) {
            const weight = Math.floor(Math.random() * 10) + 1;
            edges.push({ from: pathVertices[i], to: pathVertices[i + 1], weight: weight });
        }
    } else {
        for (let i = startIndex; i > endIndex; i--) {
            const weight = Math.floor(Math.random() * 10) + 1;
            edges.push({ from: pathVertices[i], to: pathVertices[i - 1], weight: weight });
        }
    }

    // Добавляем случайные рёбра (только положительные веса, без петель)
    const maxExtraEdges = Math.floor(n * 1.5);
    let extraCount = 0;
    while (extraCount < maxExtraEdges) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        if (i !== j) {
            const exists = edges.some(e => e.from === i && e.to === j);
            if (!exists) {
                const weight = Math.floor(Math.random() * 10) + 1;
                edges.push({ from: i, to: j, weight: weight });
                extraCount++;
            }
        }
    }

    const graph = new Graph(vertices, edges, true, true);
    return { graph, startId, endId };
}

function generateEulerianGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    let edges = [];
    let cycles = [];

    // 1. Базовый цикл
    for (let i = 0; i < n; i++) {
        edges.push({ from: i, to: (i + 1) % n });
    }
    const baseCycle = [];
    for (let i = 0; i < n; i++) {
        baseCycle.push(vertices[i].label);
    }
    cycles.push(baseCycle);

    // 2. Добавляем треугольники
    const extraTriangles = Math.floor(Math.random() * (n - 2)) + 1;
    for (let t = 0; t < extraTriangles; t++) {
        let a = Math.floor(Math.random() * n);
        let b = Math.floor(Math.random() * n);
        let c = Math.floor(Math.random() * n);
        while (a === b || a === c || b === c) {
            if (a === b) b = Math.floor(Math.random() * n);
            if (a === c) c = Math.floor(Math.random() * n);
            if (b === c) c = Math.floor(Math.random() * n);
        }
        if (!edges.some(e => (e.from === a && e.to === b))) edges.push({ from: a, to: b });
        if (!edges.some(e => (e.from === b && e.to === c))) edges.push({ from: b, to: c });
        if (!edges.some(e => (e.from === c && e.to === a))) edges.push({ from: c, to: a });
        cycles.push([vertices[a].label, vertices[b].label, vertices[c].label]);
    }

    // 3. Удаляем кратные рёбра
    const uniqueEdges = [];
    const edgeSet = new Set();
    for (const edge of edges) {
        const key = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
        if (!edgeSet.has(key)) {
            edgeSet.add(key);
            uniqueEdges.push(edge);
        }
    }

    // 4. Удаляем одно ребро и разрываем соответствующий цикл
    let removedEdgeInfo = null;
    for (let i = 0; i < uniqueEdges.length; i++) {
        const edge = uniqueEdges[i];
        if (edge.from !== edge.to) {
            removedEdgeInfo = {
                from: edge.from,
                to: edge.to,
                fromLabel: vertices[edge.from].label,
                toLabel: vertices[edge.to].label
            };
            uniqueEdges.splice(i, 1);
            break;
        }
    }

    // 5. Корректируем cycles: удаляем удалённое ребро из циклов
    if (removedEdgeInfo) {
        const newCycles = [];
        for (let cycle of cycles) {
            // Ищем в цикле удалённое ребро (как последовательные вершины)
            const fromLabel = removedEdgeInfo.fromLabel;
            const toLabel = removedEdgeInfo.toLabel;
            let foundIndex = -1;
            for (let i = 0; i < cycle.length; i++) {
                const current = cycle[i];
                const next = cycle[(i + 1) % cycle.length];
                if ((current === fromLabel && next === toLabel) ||
                    (current === toLabel && next === fromLabel)) {
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex !== -1) {
                // Разрываем цикл: получаем путь
                const newPath = [];
                for (let i = 0; i < cycle.length; i++) {
                    newPath.push(cycle[(foundIndex + 1 + i) % cycle.length]);
                }
                newCycles.push(newPath);
            } else {
                newCycles.push(cycle);
            }
        }
        cycles = newCycles;
    }

    const graph = new Graph(vertices, uniqueEdges, false, false);
    return { graph, cycles: cycles };
} function generateMSTGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    for (let i = 0; i < n; i++) {
        edges.push({ from: i, to: (i + 1) % n, weight: Math.floor(Math.random() * 15) + 1 });
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
            if (Math.random() < 0.4) {
                edges.push({ from: i, to: j, weight: Math.floor(Math.random() * 20) + 1 });
            }
        }
    }

    const graph = new Graph(vertices, edges, false, true);
    return { graph };
}