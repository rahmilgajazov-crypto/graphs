// ========== ПОДСКАЗКА (МАТРИЦА СМЕЖНОСТИ / ВЕСОВ) ==========
function showReachabilityMatrix() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const colors = getThemeColors();

    const n = currentGraph.vertexCount();
    const vertices = currentGraph.vertices;

    if (currentTask === 2 || currentTask === 4) {
        modalTitle.innerHTML = `Матрица длин дуг — задание ${currentTask + 1}`;

        const W = Array(n).fill().map(() => Array(n).fill('∞'));
        for (let i = 0; i < n; i++) W[i][i] = '0';
        for (const edge of currentGraph.edges) {
            const w = edge.weight !== undefined ? edge.weight : 1;
            W[edge.from][edge.to] = w.toString();
            if (!currentGraph.directed) {
                W[edge.to][edge.from] = w.toString();
            }
        }

        let html = '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + colors.borderColor + ';">';
        html += '<thead><tr>';
        html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">↓/→</th>';
        for (const v of vertices) {
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + v.label + '</th>';
        }
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr>';
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + vertices[i].label + '</th>';
            for (let j = 0; j < n; j++) {
                const val = W[i][j];
                const isNumber = val !== '∞' && val !== '0';
                const bg = isNumber ? colors.greenBg : (val === '0' ? colors.blueBg : colors.redBg);
                html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; text-align: center; background: ' + bg + '; color: ' + colors.textColor + ';">' + val + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        let extra = currentTask === 2 ? '<p style="margin-top: 16px;"><small> Задание 3 : числа — веса рёбер, ∞ — ребра нет.</small></p>' : '<p style="margin-top: 16px;"><small> Задание 5 : числа — веса рёбер, ∞ — ребра нет.</small></p>';
        modalBody.innerHTML = html + extra;
        modal.classList.add('active');
        return;
    }

    modalTitle.innerHTML = ` Матрица смежности — задание ${currentTask + 1}`;
    const A = Array(n).fill().map(() => Array(n).fill(0));
    for (const edge of currentGraph.edges) {
        A[edge.from][edge.to] = 1;
        if (!currentGraph.directed) A[edge.to][edge.from] = 1;
    }

    let html = '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + colors.borderColor + ';">';
    html += '<thead><tr>';
    html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">↓/→</th>';
    for (const v of vertices) {
        html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + v.label + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let i = 0; i < n; i++) {
        html += '<tr>';
        html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + vertices[i].label + '</th>';
        for (let j = 0; j < n; j++) {
            const val = A[i][j];
            const bg = val ? colors.greenBg : colors.redBg;
            html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; text-align: center; background: ' + bg + '; color: ' + colors.textColor + ';">' + val + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table></div>';
    modalBody.innerHTML = html + '<p style="margin-top: 16px;"><small> 1 — есть ребро, 0 — нет.</small></p>';
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 1) ==========
function showSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');
    const colors = getThemeColors();

    if (!currentGraph || currentTask !== 0) {
        modalTitle.innerHTML = ' Решение доступно только для задания 1';
        modalBody.innerHTML = '<p>Сначала выберите задание 1 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const result = findSCCByMatrixDetailed(currentGraph);
    const vertices = currentGraph.vertices;
    const n = vertices.length;

    function matrixToHtml(matrix, title, stepDesc) {
        let html = '<div style="margin: 15px 0; padding: 12px; background: ' + colors.formulaBg + '; border-radius: 12px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<h4 style="margin-top: 0; margin-bottom: 8px; color: ' + colors.textColor + ';">' + title + '</h4>';
        if (stepDesc) html += '<p style="font-size: 0.75rem; margin-bottom: 10px; color: ' + colors.textColor + ';">' + stepDesc + '</p>';
        html += '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; font-size: 13px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<thead><tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 6px 10px; color: ' + colors.textColor + ';">↓/→</th>';
        for (const v of vertices) {
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 6px 10px; color: ' + colors.textColor + ';">' + v.label + '</th>';
        }
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 6px 10px; color: ' + colors.textColor + ';">' + vertices[i].label + '</th>';
            for (let j = 0; j < n; j++) {
                const val = matrix[i][j];
                let bgColor = colors.redBg;
                if (val === 1) bgColor = colors.greenBg;
                else if (val !== 0 && val !== 1) bgColor = colors.blueBg;
                html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 6px 10px; text-align: center; background: ' + bgColor + '; color: ' + colors.textColor + ';">' + val + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div></div>';
        return html;
    }

    let scrollContent = '<div style="overflow-y: auto; max-height: 60vh; padding-right: 10px;">';
    scrollContent += '<h3 style="text-align: center; margin-bottom: 20px; color: ' + colors.textColor + ';"> Матричный метод нахождения компонент сильной связности</h3>';
    scrollContent += '<div style="background: ' + colors.formulaBg + '; padding: 12px; border-radius: 12px; margin-bottom: 20px; border: 1px solid ' + colors.borderColor + ';">';
    scrollContent += '<p style="margin: 0; color: ' + colors.textColor + ';"><strong> Формулы метода:</strong></p>';
    scrollContent += '<p style="margin: 8px 0 0 0; color: ' + colors.textColor + ';">• <strong>T(D) = sign(E + A + A² + ... + Aⁿ⁻¹)</strong> — матрица достижимости (транзитивное замыкание)</p>';
    scrollContent += '<p style="margin: 8px 0 0 0; color: ' + colors.textColor + ';">• <strong>S(D) = T & Tᵀ</strong> — матрица сильной связности (поэлементное умножение)</p>';
    scrollContent += '<p style="margin: 8px 0 0 0; font-size: 0.85rem; color: ' + colors.textColor + ';">где E — единичная матрица, A — матрица смежности</p>';
    scrollContent += '</div>';

    scrollContent += matrixToHtml(result.matrices.A, ' Шаг 1. Матрица смежности A(D)', 'A[i][j] = 1, если есть ребро i → j, иначе 0');
    scrollContent += matrixToHtml(result.matrices.R, ' Шаг 2. Матрица достижимости T(D) = sign(E + A + A² + ... + Aⁿ⁻¹)', 'T[i][j] = 1, если существует путь i → j');
    scrollContent += matrixToHtml(result.matrices.S, ' Шаг 3. Матрица сильной связности S = T & Tᵀ', 'S[i][j] = 1, если i и j взаимно достижимы (i→j и j→i)');

    scrollContent += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.formulaBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
    scrollContent += '<h4 style="margin-top: 0;"> Шаг 4. Выделение компонент по матрице S</h4>';
    scrollContent += '<p>По матрице S группируем вершины: если S[i][j] = 1, то вершины i и j в одной компоненте.</p>';
    scrollContent += '<p><strong>Компоненты сильной связности:</strong> ' + result.components.map(c => '{' + c.join(',') + '}').join(', ') + '</p>';
    scrollContent += '</div>';

    modalBody.innerHTML = scrollContent;
    modalTitle.innerHTML = ' Пошаговое решение (матричный метод) — задание 1';
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 2) ==========
function showWaveSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');
    const colors = getThemeColors();

    if (!currentGraph || currentTask !== 1) {
        modalTitle.innerHTML = ' Решение доступно только для задания 2';
        modalBody.innerHTML = '<p>Сначала выберите задание 2 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const result = waveAnalysis(currentGraph);
    const vertices = currentGraph.vertices;
    const n = vertices.length;

    function matrixToHtml(matrix, title, type) {
        let html = '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<h4 style="margin-top: 0; margin-bottom: 15px; color: ' + colors.textColor + ';">' + title + '</h4>';
        html += '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + colors.borderColor + ';">';
        html += '<thead><tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">↓/→</th>';
        for (const v of vertices) {
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + v.label + '</th>';
        }
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + vertices[i].label + '</th>';
            for (let j = 0; j < n; j++) {
                let val = matrix[i][j];
                let displayVal = (val === Infinity) ? '∞' : val;
                let bgColor = colors.neutralBg;
                let fontColor = colors.textColor;

                if (type === 'adjacency') {
                    bgColor = val === 1 ? colors.greenBg : colors.redBg;
                    fontColor = val === 1 ? colors.greenText : colors.redText;
                } else {
                    if (val === 0) { bgColor = colors.neutralBg; fontColor = colors.textColor; }
                    else if (val === result.diameter) { bgColor = colors.yellowBg; fontColor = colors.yellowText; }
                    else if (val === result.radius) { bgColor = colors.greenBg; fontColor = colors.greenText; }
                    else if (val !== Infinity) { bgColor = colors.neutralBg; fontColor = colors.textColor; }
                    else { bgColor = colors.redBg; fontColor = colors.redText; }
                }
                html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; text-align: center; background: ' + bgColor + '; color: ' + fontColor + ';">' + displayVal + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        if (type === 'distances') {
            html += '<div style="margin-top: 12px; font-size: 0.8rem; color: ' + colors.textColor + '; background: ' + colors.headerBg + '; padding: 8px; border-radius: 8px; border: 1px solid ' + colors.borderColor + ';">';
            html += '<p><strong> Пояснение к таблице 2:</strong> Кратчайшие расстояния между всеми парами вершин.</p>';
            html += '<p>• <span style="background: ' + colors.yellowBg + '; color: ' + colors.yellowText + '; padding: 0 4px;">Жёлтые ячейки</span> — расстояние равно <strong>диаметру</strong> (' + result.diameter + ').</p>';
            html += '<p>• <span style="background: ' + colors.greenBg + '; color: ' + colors.greenText + '; padding: 0 4px;">Зелёные ячейки</span> — расстояние равно <strong>радиусу</strong> (' + result.radius + ').</p>';
            html += '<p>• <span style="background: ' + colors.redBg + '; color: ' + colors.redText + '; padding: 0 4px;">Красные ячейки</span> — вершины недостижимы (∞).</p>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    const A = Array(n).fill().map(() => Array(n).fill(0));
    for (const edge of currentGraph.edges) {
        A[edge.from][edge.to] = 1;
        if (!currentGraph.directed) A[edge.to][edge.from] = 1;
    }

    let html = '<div style="max-height: 550px; overflow-y: auto; padding-right: 10px;">';
    html += '<h3 style="text-align: center; margin-bottom: 20px; color: ' + colors.textColor + ';"> Фронт волны — решение</h3>';
    html += matrixToHtml(A, ' Таблица 1. Матрица смежности A(D)', 'adjacency');
    html += matrixToHtml(result.distances, ' Таблица 2. Матрица минимальных расстояний (Флойд-Уоршелл)', 'distances');

    html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
    html += '<h4 style="margin-top: 0; color: ' + colors.textColor + ';"> Результаты и пояснения</h4>';
    html += '<p><strong style="background: ' + colors.yellowBg + '; color: ' + colors.yellowText + '; padding: 2px 8px; border-radius: 12px;"> Диаметр:</strong> <span style="color: ' + colors.textColor + ';">' + result.diameter + '</span></p>';
    html += '<p style="margin-left: 20px; font-size: 0.85rem; color: ' + colors.textColor + ';"> Максимальное расстояние между любыми двумя вершинами.</p>';
    html += '<p><strong style="background: ' + colors.greenBg + '; color: ' + colors.greenText + '; padding: 2px 8px; border-radius: 12px;"> Радиус:</strong> <span style="color: ' + colors.textColor + ';">' + result.radius + '</span></p>';
    html += '<p style="margin-left: 20px; font-size: 0.85rem; color: ' + colors.textColor + ';"> Минимальный эксцентриситет среди всех вершин.</p>';
    html += '<p><strong style="background: ' + colors.blueBg + '; color: ' + colors.blueText + '; padding: 2px 8px; border-radius: 12px;"> Центры графа:</strong> <span style="color: ' + colors.textColor + ';">' + (result.centers.join(', ') || 'нет') + '</span></p>';
    html += '<p style="margin-left: 20px; font-size: 0.85rem; color: ' + colors.textColor + ';"> Вершины, у которых эксцентриситет равен радиусу.</p>';
    html += '</div>';

    modalTitle.innerHTML = ' Фронт волны — пошаговое решение (задание 2)';
    modalBody.innerHTML = html;
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 3) ==========
function showBellmanSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');
    const colors = getThemeColors();

    if (!currentGraph || currentTask !== 2) {
        modalTitle.innerHTML = ' Решение доступно только для задания 3';
        modalBody.innerHTML = '<p>Сначала выберите задание 3 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const n = currentGraph.vertexCount();
    const vertices = currentGraph.vertices;
    const startLabel = vertices[currentBellmanStart].label;
    const endLabel = vertices[currentBellmanEnd].label;

    const W = Array(n).fill().map(() => Array(n).fill('∞'));
    for (let i = 0; i < n; i++) W[i][i] = '0';
    for (const edge of currentGraph.edges) {
        const w = edge.weight !== undefined ? edge.weight : 1;
        W[edge.from][edge.to] = w.toString();
    }

    const distMatrix = [];
    const prevDist = Array(n).fill(Infinity);
    prevDist[currentBellmanStart] = 0;
    distMatrix.push([...prevDist]);

    for (let k = 1; k < n; k++) {
        const newDist = [...prevDist];
        let changed = false;
        for (const edge of currentGraph.edges) {
            const u = edge.from, v = edge.to;
            const w = edge.weight !== undefined ? edge.weight : 1;
            if (prevDist[u] !== Infinity && prevDist[u] + w < newDist[v]) {
                newDist[v] = prevDist[u] + w;
                changed = true;
            }
        }
        distMatrix.push([...newDist]);
        for (let i = 0; i < n; i++) prevDist[i] = newDist[i];
        if (!changed) {
            while (distMatrix.length < n) distMatrix.push([...newDist]);
            break;
        }
    }
    while (distMatrix.length < n) distMatrix.push([...distMatrix[distMatrix.length - 1]]);

    function weightMatrixToHtml() {
        let html = '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<h4 style="margin-top: 0; margin-bottom: 15px; color: ' + colors.textColor + ';"> Таблица 1. Матрица длин дуг A(D)</h4>';
        html += '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + colors.borderColor + ';">';
        html += '<thead><tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">↓/→</th>';
        for (const v of vertices) {
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + v.label + '</th>';
        }
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + vertices[i].label + '</th>';
            for (let j = 0; j < n; j++) {
                const val = W[i][j];
                const isNumber = val !== '∞' && val !== '0';
                const bg = isNumber ? colors.greenBg : (val === '0' ? colors.blueBg : colors.redBg);
                html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; text-align: center; background: ' + bg + '; color: ' + colors.textColor + ';">' + val + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div></div>';
        return html;
    }

    function iterationsMatrixToHtml() {
        let html = '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<h4 style="margin-top: 0; margin-bottom: 15px; color: ' + colors.textColor + ';"> Таблица 2. Матрица расстояний λ<sup>k</sup>ᵢ — по итерациям (от ' + startLabel + ')</h4>';
        html += '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + colors.borderColor + ';">';
        html += '<thead><tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">i / k</th>';
        for (let k = 0; k < n; k++) {
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">λ<sup>' + k + '</sup>ᵢ</th>';
        }
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr><th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + vertices[i].label + '</th>';
            for (let k = 0; k < n; k++) {
                let val = distMatrix[k][i];
                let displayVal = (val === Infinity) ? '∞' : val;
                let bgColor = (i === currentBellmanEnd) ? colors.yellowBg : colors.neutralBg;
                html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; text-align: center; background: ' + bgColor + '; color: ' + colors.textColor + ';">' + displayVal + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        return html;
    }

    const result = fordBellman(currentGraph, currentBellmanStart, currentBellmanEnd);
    let html = '<div style="max-height: 550px; overflow-y: auto; padding-right: 10px;">';
    html += '<h3 style="text-align: center; margin-bottom: 20px; color: ' + colors.textColor + ';"> Форд-Беллман — решение</h3>';
    html += weightMatrixToHtml();
    html += iterationsMatrixToHtml();
    html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
    html += '<h4 style="margin-top: 0; color: ' + colors.textColor + ';"> Результат</h4>';
    html += '<p><strong style="background: ' + colors.yellowBg + '; color: ' + colors.yellowText + '; padding: 2px 8px; border-radius: 12px;">Минимальный путь от ' + startLabel + ' до ' + endLabel + ':</strong> <span style="color: ' + colors.textColor + ';">' + result.path + '</span></p>';
    html += '<p><strong style="background: ' + colors.greenBg + '; color: ' + colors.greenText + '; padding: 2px 8px; border-radius: 12px;">Вес пути:</strong> <span style="color: ' + colors.textColor + ';">' + result.distance + '</span></p>';
    if (result.hasNegativeCycle) html += '<p style="color: ' + colors.redText + ';"><strong> Обнаружен отрицательный цикл!</strong> Кратчайший путь не определён.</p>';
    html += '</div></div>';

    modalTitle.innerHTML = ' Форд-Беллман — пошаговое решение (задание 3)';
    modalBody.innerHTML = html;
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 4) ==========
function showEulerSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');
    const colors = getThemeColors();

    if (!currentGraph || currentTask !== 3) {
        modalTitle.innerHTML = ' Решение доступно только для задания 4';
        modalBody.innerHTML = '<p>Сначала выберите задание 4 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const eulerPath = findEulerianPath(currentGraph);

    let html = '<div style="max-height: 550px; overflow-y: auto; padding-right: 10px;">';
    html += '<h3 style="text-align: center; margin-bottom: 20px; color: ' + colors.textColor + ';"> Эйлерова цепь — решение</h3>';

    if (eulerPath && eulerPath.length > 1) {
        html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.formulaBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<h4 style="margin-top: 0; color: ' + colors.textColor + ';"> Эйлерова цепь</h4>';
        html += '<p style="color: ' + colors.textColor + '; font-size: 1.1rem; word-break: break-all;"><strong>' + eulerPath.join(' → ') + '</strong></p>';
        html += '</div>';
    } else {
        html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.redBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<p style="color: ' + colors.redText + ';">⚠️ Эйлерова цепь не найдена.</p>';
        html += '</div>';
    }

    html += '</div>';

    modalTitle.innerHTML = ' Эйлерова цепь — решение (задание 4)';
    modalBody.innerHTML = html;
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 5) ==========
function showMSTSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');
    const colors = getThemeColors();

    if (!currentGraph || currentTask !== 4) {
        modalTitle.innerHTML = ' Решение доступно только для задания 5';
        modalBody.innerHTML = '<p>Сначала выберите задание 5 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const n = currentGraph.vertexCount();
    const vertices = currentGraph.vertices;

    const W = Array(n).fill().map(() => Array(n).fill('∞'));
    for (let i = 0; i < n; i++) W[i][i] = '0';
    for (const edge of currentGraph.edges) {
        const w = edge.weight !== undefined ? edge.weight : 1;
        W[edge.from][edge.to] = w.toString();
        if (!currentGraph.directed) {
            W[edge.to][edge.from] = w.toString();
        }
    }

    const mstResult = kruskalMST(currentGraph);
    const mstEdges = mstResult.edges;
    const totalWeight = mstResult.weight;

    const mstEdgeSet = new Set();
    for (const edge of mstEdges) {
        const key = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
        mstEdgeSet.add(key);
    }

    const mstVertices = currentGraph.vertices.map(v => ({ ...v }));
    const mstGraph = new Graph(mstVertices, mstEdges, false, true);

    function weightMatrixWithOutline() {
        let html = '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
        html += '<h4 style="margin-top: 0; margin-bottom: 15px; color: ' + colors.textColor + ';"> Таблица 1. Матрица длин дуг A(D) — рёбра MST обведены</h4>';
        html += '<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + colors.borderColor + ';">';
        html += '<thead>';
        html += '<tr>';
        html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">↓/→</th>';
        for (const v of vertices) {
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + v.label + '</th>';
        }
        html += '</tr>';
        html += '</thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr>';
            html += '<th style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; color: ' + colors.textColor + '; background: ' + colors.headerBg + ';">' + vertices[i].label + '</th>';
            for (let j = 0; j < n; j++) {
                const val = W[i][j];
                const isNumber = val !== '∞' && val !== '0';
                const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
                const isMSTEdge = mstEdgeSet.has(key);

                let bgColor = colors.neutralBg;
                if (val === '0') bgColor = colors.blueBg;
                else if (!isNumber) bgColor = colors.redBg;
                else bgColor = colors.greenBg;

                const outlineStyle = isMSTEdge ? 'border: 2px solid ' + colors.yellowBg + '; border-radius: 50%; display: inline-block; width: 28px; line-height: 28px;' : '';
                const cellContent = '<span style="' + outlineStyle + '">' + val + '</span>';

                html += '<td style="border: 1px solid ' + colors.borderColor + '; padding: 8px 12px; text-align: center; background: ' + bgColor + '; color: ' + colors.textColor + ';">' + cellContent + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table></div>';
        html += '<p style="margin-top: 12px; font-size: 0.8rem;"><small>🟡 Жёлтая обводка — рёбра, вошедшие в минимальное остовное дерево.</small></p>';
        html += '</div>';
        return html;
    }

    const mstCanvas = document.createElement('canvas');
    mstCanvas.width = 520;
    mstCanvas.height = 360;
    mstCanvas.style.width = '100%';
    mstCanvas.style.height = 'auto';
    mstCanvas.style.border = '1px solid ' + colors.borderColor;
    mstCanvas.style.borderRadius = '12px';
    mstCanvas.style.background = colors.isDark ? '#1e293b' : '#fefefe';

    const mstCtx = mstCanvas.getContext('2d');
    drawGraph(mstCtx, mstGraph, 520, 360);

    let html = '<div style="max-height: 550px; overflow-y: auto; padding-right: 10px;">';
    html += '<h3 style="text-align: center; margin-bottom: 20px; color: ' + colors.textColor + ';"> Минимальное остовное дерево — решение</h3>';

    html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.formulaBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
    html += '<h4 style="margin-top: 0; color: ' + colors.textColor + ';"> Алгоритм Краскала</h4>';
    html += '<p style="color: ' + colors.textColor + ';">1. Отсортировать все рёбра по весу (от меньшего к большему).</p>';
    html += '<p style="color: ' + colors.textColor + ';">2. Взять самое лёгкое ребро.</p>';
    html += '<p style="color: ' + colors.textColor + ';">3. Если оно соединяет разные компоненты связности — добавить в MST.</p>';
    html += '<p style="color: ' + colors.textColor + ';">4. Повторять, пока не будет n-1 ребро.</p>';
    html += '</div>';

    html += weightMatrixWithOutline();

    html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
    html += '<h4 style="margin-top: 0; margin-bottom: 15px; color: ' + colors.textColor + ';"> Граф минимального остовного дерева</h4>';
    html += '<div id="mstCanvasContainer" style="text-align: center;"></div>';

    html += '<div style="margin: 20px 0; padding: 15px; background: ' + colors.headerBg + '; border-radius: 16px; border: 1px solid ' + colors.borderColor + ';">';
    html += '<h4 style="margin-top: 0; color: ' + colors.textColor + ';"> Результат</h4>';
    html += '<p><strong style="background: ' + colors.greenBg + '; color: ' + colors.greenText + '; padding: 2px 8px; border-radius: 12px;">Суммарный вес минимального остовного дерева:</strong> <span style="color: ' + colors.textColor + ';">' + totalWeight + '</span></p>';
    html += '</div></div>';

    modalTitle.innerHTML = ' Минимальное остовное дерево — пошаговое решение (задание 5)';
    modalBody.innerHTML = html;

    const container = document.getElementById('mstCanvasContainer');
    if (container) {
        container.innerHTML = '';
        container.appendChild(mstCanvas);
    }

    modal.classList.add('active');
}
