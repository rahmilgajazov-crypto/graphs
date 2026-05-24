function waveAnalysis(graph) {
    const n = graph.vertexCount();
    const vertices = graph.vertices;
    const edges = graph.edges;

    // 1. Матрица смежности (расстояния: 1 если есть ребро i→j, иначе Infinity)
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

    // 2. Флойд-Уоршелл
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }

    // 3. Эксцентриситет: максимальное расстояние до других вершин
    // Для орграфа важно: если вершина недостижима из i, то эксцентриситет = Infinity
    const eccentricity = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let maxDist = 0;
        let hasUnreachable = false;
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            if (dist[i][j] === Infinity) {
                hasUnreachable = true;
                break;
            }
            if (dist[i][j] > maxDist) {
                maxDist = dist[i][j];
            }
        }
        eccentricity[i] = hasUnreachable ? Infinity : maxDist;
    }

    // 4. Диаметр: максимальный эксцентриситет среди вершин, у которых не Infinity
    const finiteEcc = eccentricity.filter(v => v !== Infinity);
    if (finiteEcc.length === 0) {
        return { diameter: 0, radius: 0, centers: [], distances: dist, eccentricity: eccentricity };
    }
    const diameter = Math.max(...finiteEcc);

    // 5. Радиус: минимальный эксцентриситет среди вершин, у которых не Infinity
    const radius = Math.min(...finiteEcc);

    // 6. Центры: вершины с эксцентриситетом = радиусу
    const centers = [];
    for (let i = 0; i < n; i++) {
        if (eccentricity[i] === radius) {
            centers.push(vertices[i].label);
        }
    }
    centers.sort();

    return { diameter, radius, centers, distances: dist, eccentricity };
}