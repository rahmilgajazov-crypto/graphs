/**
 * АЛГОРИТМ 2: ФРОНТ ВОЛНЫ
 * Метод: поиск кратчайших расстояний (BFS или Флойд-Уоршелл)
 * Находит: диаметр, радиус, центры графа
 * 
 * Определения:
 * - Эксцентриситет вершины: максимальное расстояние до любой другой вершины
 * - Диаметр: максимальный эксцентриситет
 * - Радиус: минимальный эксцентриситет
 * - Центры: вершины с эксцентриситетом = радиусу
 * 
 * Соответствует пункту 5 документации
 */

/**
 * Анализ графа методом фронта волны
 * @param {Graph} graph 
 * @returns {Object} { diameter, radius, centers, distances }
 */
function waveAnalysis(graph) {
    const n = graph.vertexCount();
    const vertices = graph.vertices;
    const edges = graph.edges;
    
    // 1. Инициализация матрицы расстояний
    const dist = Array(n).fill().map(() => Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) dist[i][i] = 0;
    for (const edge of edges) {
        if (graph.directed) {
            dist[edge.from][edge.to] = 1;
        } else {
            dist[edge.from][edge.to] = 1;
            dist[edge.to][edge.from] = 1;
        }
    }
    
    // 2. Алгоритм Флойда-Уоршелла (или можно BFS от каждой вершины)
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    
    // 3. Вычисление эксцентриситета для каждой вершины
    const eccentricity = [];
    for (let i = 0; i < n; i++) {
        let maxDist = 0;
        for (let j = 0; j < n; j++) {
            if (dist[i][j] !== Infinity && dist[i][j] > maxDist) {
                maxDist = dist[i][j];
            }
        }
        // Если граф несвязный, вершина имеет бесконечный эксцентриситет
        eccentricity.push(maxDist === 0 && n > 1 ? Infinity : maxDist);
    }
    
    // 4. Диаметр, радиус, центры
    const finiteEcc = eccentricity.filter(v => v !== Infinity);
    const diameter = Math.max(...finiteEcc);
    const radius = Math.min(...finiteEcc);
    const centers = vertices
        .filter((_, i) => eccentricity[i] === radius)
        .map(v => v.label)
        .sort();
    
    return {
        diameter: diameter,
        radius: radius,
        centers: centers,
        distances: dist,
        eccentricity: eccentricity
    };
}