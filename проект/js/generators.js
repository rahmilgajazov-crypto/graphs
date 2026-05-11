/**
 * Модуль генерации тестовых графов для каждого задания
 * 
 * Соответствует пункту 10 документации
 */

const VERTEX_LABELS = 'ABCDEFGH';

/**
 * Генерация позиций вершин по кругу
 * @param {number} n - количество вершин
 * @param {number} width 
 * @param {number} height 
 * @param {number} radius 
 * @returns {Array<{x: number, y: number}>}
 */
function getCircularPositions(n, width, height, radius = 160) {
    const cx = width / 2;
    const cy = height / 2;
    const positions = [];
    for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        positions.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        });
    }
    return positions;
}

/**
 * Создание вершин с круговым расположением
 * @param {number} n 
 * @param {number} width 
 * @param {number} height 
 * @returns {Array}
 */
function createVertices(n, width, height) {
    const positions = getCircularPositions(n, width, height);
    return positions.map((p, i) => ({
        id: i,
        label: VERTEX_LABELS[i % VERTEX_LABELS.length],
        x: p.x,
        y: p.y
    }));
}

/**
 * Генерация графа для задания 1 (компоненты сильной связности)
 */
function generateSCCGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];
    
    // Случайное количество компонент (20% одна, 80% 2-3)
    let compCount = Math.random() < 0.2 ? 1 : Math.floor(Math.random() * 3) + 2;
    if (compCount > n) compCount = Math.min(n, 3);
    
    // Распределение вершин по компонентам
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
    
    // Рёбра внутри компонент
    for (const comp of components) {
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
    
    const graph = new Graph(vertices, edges, true, false);
    return { graph };
}

/**
 * Генерация графа для задания 2 (фронт волны)
 */
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

/**
 * Генерация графа для задания 3 (Форд-Беллман)
 * Гарантируется достижимость пути от 0 до n-1
 */
function generateBellmanFordGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];

    // Гарантированный путь 0 → 1 → 2 → ... → n-1 (обязательные рёбра)
    for (let i = 0; i < n - 1; i++) {
        edges.push({ from: i, to: i + 1, weight: Math.floor(Math.random() * 11) - 2 }); // -2..8
    }

    // Ограниченное количество случайных рёбер (не более n*1.5)
    const maxExtraEdges = Math.floor(n * 1.5);
    let extraCount = 0;

    while (extraCount < maxExtraEdges) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        if (i !== j && !(j === i + 1 && i < n - 1)) {
            // Проверяем, нет ли уже такого ребра
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

/**
 * Генерация графа для задания 4 (эйлерова цепь)
 */
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
            if (Math.random() < 0.25) {
                edges.push({ from: i, to: j });
            }
        }
    }
    
    const graph = new Graph(vertices, edges, false, false);
    return { graph };
}

/**
 * Генерация графа для задания 5 (MST)
 * Граф всегда связный
 */
function generateMSTGraph(n, width, height) {
    const vertices = createVertices(n, width, height);
    const edges = [];
    
    // Базовый цикл для связности
    for (let i = 0; i < n; i++) {
        edges.push({ from: i, to: (i + 1) % n, weight: Math.floor(Math.random() * 15) + 1 });
    }
    
    // Дополнительные рёбра
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