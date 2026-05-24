/**
 * АЛГОРИТМ 1: КОМПОНЕНТЫ СИЛЬНОЙ СВЯЗНОСТИ
 * Метод: матричный (транзитивное замыкание + умножение на транспонированную)
 */
function findSCCByMatrix(graph) {
    return findSCCByMatrixDetailed(graph).components;
}
function findSCCByMatrixDetailed(graph) {
    const n = graph.vertexCount();
    const vertices = graph.vertices;

    // Шаг 1: матрица смежности A
    const A = Array(n).fill().map(() => Array(n).fill(0));
    for (const edge of graph.edges) {
        A[edge.from][edge.to] = 1;
    }

    // Шаг 2: матрица достижимости R (транзитивное замыкание)
    const R = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            R[i][j] = A[i][j];
        }
        R[i][i] = 1;
    }

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (R[i][k] && R[k][j]) R[i][j] = 1;
            }
        }
    }

    // Шаг 3: матрица сильной связности S = R ∧ Rᵀ
    const S = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            S[i][j] = (R[i][j] && R[j][i]) ? 1 : 0;
        }
    }

    // Шаг 4: выделение компонент
    const visited = Array(n).fill(false);
    const components = [];
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            const comp = [];
            for (let j = 0; j < n; j++) {
                if (S[i][j] === 1) {
                    comp.push(vertices[j].label);
                    visited[j] = true;
                }
            }
            components.push(comp.sort());
        }
    }
    components.sort((a, b) => a[0].localeCompare(b[0]));

    return {
        components: components,
        matrices: { A, R, S },
        steps: {
            step1: A,
            step2: R,
            step3: S,
            step4: components
        }
    };
}