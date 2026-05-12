const VERTEX_LABELS = 'ABCDEFGH';

function getCircularPositions(n, width, height, radius = 130) {
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

    // Рёбра внутри компонент (без петель, т.к. comp[i] != comp[(i+1)%comp.length] при comp.length > 1)
    for (const comp of components) {
        if (comp.length === 1) continue; // одиночная вершина — не добавляем петлю
        for (let i = 0; i < comp.length; i++) {
            edges.push({ from: comp[i], to: comp[(i + 1) % comp.length] });
            if (doubleEdgesCount < MAX_DOUBLE_EDGES && Math.random() < 0.3) {
                edges.push({ from: comp[(i + 1) % comp.length], to: comp[i] });
                doubleEdgesCount++;
            }
        }
    }

    // Рёбра между компонентами
    for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
            if (Math.random() > 0.4) {
                const fromIdx = Math.floor(Math.random() * components[i].length);
                const toIdx = Math.floor(Math.random() * components[j].length);
                edges.push({ from: components[i][fromIdx], to: components[j][toIdx] });
            }
        }
    }

    // Дополнительные случайные рёбра (с проверкой i !== j)
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.random() < 0.08) {   // ← КЛЮЧЕВОЕ УСЛОВИЕ
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

    // 1. Гарантируем связность: создаём базовый цикл
    for (let i = 0; i < n; i++) {
        edges.push({ from: i, to: (i + 1) % n });
    }

    // 2. Добавляем случайные рёбра (без петель)
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.random() < 0.3) {
                // Проверяем, нет ли уже такого ребра
                const exists = edges.some(e => e.from === i && e.to === j);
                if (!exists) {
                    edges.push({ from: i, to: j });
                }
            }
        }
    }

    // 3. Убеждаемся, что граф ориентированный (для фронта волны — орграф)
    const graph = new Graph(vertices, edges, true, false);

    // 4. Проверка на достижимость всех вершин из всех (через транзитивное замыкание)
    // Если несвязный — добавляем недостающие рёбра
    const n_vertices = graph.vertexCount();
    const adj = Array(n_vertices).fill().map(() => []);
    for (const edge of graph.edges) {
        adj[edge.from].push(edge.to);
    }

    // Матрица достижимости
    const reach = Array(n_vertices).fill().map(() => Array(n_vertices).fill(false));
    for (let i = 0; i < n_vertices; i++) {
        reach[i][i] = true;
        for (const to of adj[i]) reach[i][to] = true;
    }

    // Флойд-Уоршелл для достижимости
    for (let k = 0; k < n_vertices; k++) {
        for (let i = 0; i < n_vertices; i++) {
            for (let j = 0; j < n_vertices; j++) {
                if (reach[i][k] && reach[k][j]) reach[i][j] = true;
            }
        }
    }

    // Если есть недостижимые пары — добавляем рёбра
    for (let i = 0; i < n_vertices; i++) {
        for (let j = 0; j < n_vertices; j++) {
            if (i !== j && !reach[i][j]) {
                edges.push({ from: i, to: j });
                reach[i][j] = true;
            }
        }
    }

    return { graph };
}
function generateBellmanFordGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    for (let i = 0; i < n - 1; i++) {
        edges.push({ from: i, to: i + 1, weight: Math.floor(Math.random() * 11) - 2 });
    }

    const maxExtraEdges = Math.floor(n * 1.5);
    let extraCount = 0;
    while (extraCount < maxExtraEdges) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        if (i !== j && !(j === i + 1 && i < n - 1)) {
            const exists = edges.some(e => e.from === i && e.to === j);
            if (!exists) {
                edges.push({ from: i, to: j, weight: Math.floor(Math.random() * 11) - 2 });
                extraCount++;
            }
        }
    }

    const graph = new Graph(vertices, edges, true, true);
    return { graph };
}

function generateEulerianGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    // Базовый цикл
    for (let i = 0; i < n; i++) {
        edges.push({ from: i, to: (i + 1) % n });
    }

    // Дополнительные рёбра
    for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
            if (Math.random() < 0.3) {
                edges.push({ from: i, to: j });
                if (Math.random() > 0.5 && j + 1 < n) {
                    edges.push({ from: i, to: j + 1 });
                } else if (i + 1 < n) {
                    edges.push({ from: i + 1, to: j });
                }
            }
        }
    }

    // Исправляем чётность степеней
    const degrees = Array(n).fill(0);
    for (const edge of edges) {
        degrees[edge.from]++;
        degrees[edge.to]++;
    }

    const oddVertices = [];
    for (let i = 0; i < n; i++) {
        if (degrees[i] % 2 === 1) oddVertices.push(i);
    }

    for (let i = 0; i < oddVertices.length; i += 2) {
        if (i + 1 < oddVertices.length) {
            edges.push({ from: oddVertices[i], to: oddVertices[i + 1] });
        }
    }

    // ВАЖНО: создаём экземпляр класса Graph
    const graph = new Graph(vertices, edges, false, false);
    return { graph };
}

function generateMSTGraph(n, width, height) {
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