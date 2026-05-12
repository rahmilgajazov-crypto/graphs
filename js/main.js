const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const width = 520, height = 360;
canvas.width = width;
canvas.height = height;

let currentTask = 0;
let nodeCount = 5;
let currentGraph = null;
let currentAttempts = 3;
let currentEulerAnswer = null;

let currentSCCAnswer = null;
let currentWaveData = null;
let currentBellmanPath = null;
let currentMSTWeight = null;
let isGenerating = false;

// ========== ПОСТРОЕНИЕ ПАНЕЛЕЙ ==========

function buildSCCPanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 1: Компоненты сильной связности</strong><br>Матричный метод (транзитивное замыкание).<br>Введите компоненты в формате: {A,B},{C},{D,E}</div>
        <div class="format-hint">📌 Пример: {A,B},{C},{D,E}</div>
        <input type="text" id="userAnswer" placeholder="Введите компоненты...">
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;">✅ Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;">📐 Показать решение</button>
        </div>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkSCC();
    document.getElementById('solveBtn').onclick = () => showSolution();
}

function buildWavePanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 2: Фронт волны</strong><br>Диаметр, радиус, центры графа.</div>
        <div class="input-group"><label>📏 Диаметр:</label><input type="text" id="userDiameter" placeholder="число"></div>
        <div class="input-group"><label>🎯 Радиус:</label><input type="text" id="userRadius" placeholder="число"></div>
        <div class="input-group"><label>⭐ Центры:</label><input type="text" id="userCenters" placeholder="A,B,C"></div>
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;">✅ Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;">📐 Показать решение</button>
        </div>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkWave();
    document.getElementById('solveBtn').onclick = () => showWaveSolution();
}
function buildBellmanPanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 3: Форд-Беллман</strong><br>Кратчайший путь от первой до последней вершины.<br>Формат: A-B-C-D</div>
        <div class="format-hint">📌 Пример: A-B-C-D-E</div>
        <input type="text" id="userAnswer" placeholder="Введите путь...">
        <button class="check-btn" id="checkBtn">✅ Проверить</button>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkBellman();
}

function buildEulerPanel() {
    // Вычисляем правильный путь прямо здесь
    const correctPath = findEulerianPath(currentGraph);
    currentEulerAnswer = correctPath ? correctPath.join('-') : 'Невозможно';

    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 4: Эйлерова цепь</strong><br>Путь, проходящий по каждому ребру ровно один раз.<br>Формат: A-B-C-D-A</div>
        <div class="format-hint">📌 Пример: A-B-C-D-A</div>
        <input type="text" id="userAnswer" placeholder="Введите последовательность вершин...">
        <button class="check-btn" id="checkBtn">✅ Проверить</button>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;

    // Удаляем старый обработчик, если был, и вешаем новый
    const btn = document.getElementById('checkBtn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
        const userChain = document.getElementById('userAnswer').value.trim().toUpperCase();
        const isValid = isEulerianChain(userChain, currentGraph);
        // Используем сохранённый правильный ответ
        showResult(isValid, currentEulerAnswer);
    });
}
function buildMSTPanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 5: Минимальное остовное дерево</strong><br>Алгоритм Краскала. Суммарный вес.</div>
        <div class="format-hint">📌 Введите целое число</div>
        <input type="text" id="userAnswer" placeholder="Введите вес...">
        <button class="check-btn" id="checkBtn">✅ Проверить</button>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkMST();
}

function showResult(isCorrect, correctAnswerText)
{
    const msgDiv = document.getElementById('messageArea');
    const hintDiv = document.getElementById('answerHint');
    msgDiv.classList.remove('success', 'error');

    if (isCorrect) {
        msgDiv.innerHTML = '✅ Верно! Отличная работа.';
        msgDiv.classList.add('success');
        hintDiv.innerHTML = '';
        // Не блокируем кнопку при правильном ответе
    } else {
        currentAttempts--;
        if (currentAttempts > 0) {
            msgDiv.innerHTML = `❌ Неверно. Осталось попыток: ${currentAttempts}`;
            msgDiv.classList.add('error');
        } else {
            msgDiv.innerHTML = `❌ Попытки закончились. Правильный ответ: ${correctAnswerText}`;
            msgDiv.classList.add('error');
            hintDiv.innerHTML = `📌 Верный ответ: ${correctAnswerText}`;
            // Блокируем кнопку
            const btn = document.getElementById('checkBtn');
            if (btn) btn.disabled = true;
        }
    }
}
function checkSCC() {
    const userInput = document.getElementById('userAnswer').value.trim().toUpperCase();
    const components = findSCCByMatrix(currentGraph);
    const correctAnswer = components.map(comp => `{${comp.join(',')}}`).sort().join(',');
    currentSCCAnswer = correctAnswer;

    const normalize = (s) => {
        if (!s) return '';
        const groups = s.split(',').map(g => g.trim());
        const normalizedGroups = groups.map(g => {
            const inner = g.replace(/[{}]/g, '');
            const sorted = inner.split(',').sort().join(',');
            return `{${sorted}}`;
        }).sort();
        return normalizedGroups.join(',');
    };
    const isOk = normalize(userInput) === normalize(correctAnswer);
    showResult(isOk, correctAnswer);
}

function checkWave() {
    const userD = document.getElementById('userDiameter').value.trim();
    const userR = document.getElementById('userRadius').value.trim();
    const userC = document.getElementById('userCenters').value.trim().toUpperCase();

    // Нормализация центров пользователя: строка → массив → сортировка → строка
    const normalizedCenters = userC.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .sort()
        .join(',');

    // Преобразуем правильные центры из массива в строку
    const correctCentersStr = currentWaveData.centers.sort().join(',');

    const isOk = (parseInt(userD) === currentWaveData.diameter) &&
        (parseInt(userR) === currentWaveData.radius) &&
        (normalizedCenters === correctCentersStr);

    const correctAnswer = `диаметр ${currentWaveData.diameter}, радиус ${currentWaveData.radius}, центры ${correctCentersStr}`;
    showResult(isOk, correctAnswer);
}
function checkBellman() {
    const userPath = document.getElementById('userAnswer').value.trim().toUpperCase();
    const isOk = (userPath === currentBellmanPath);
    showResult(isOk, currentBellmanPath);
}

function checkEuler() {
    const userChain = document.getElementById('userAnswer').value.trim().toUpperCase();
    const isOk = isEulerianChain(userChain, currentGraph);
    // Используем сохранённый правильный ответ
    showResult(isOk, currentEulerAnswer);
}
function checkMST() {
    const userWeight = parseInt(document.getElementById('userAnswer').value.trim());
    const isOk = (userWeight === currentMSTWeight);
    showResult(isOk, currentMSTWeight.toString());
}

// ========== ГЕНЕРАЦИЯ ==========

function generateAndRender() {
    if (isGenerating) return;
    isGenerating = true;
    setTimeout(() => {
        if (currentGraph) {
            currentGraph.vertices = null;
            currentGraph.edges = null;
            currentGraph = null;
        }
        currentAttempts = 3;

        if (currentTask === 0) {
            const data = generateSCCGraph(nodeCount, width, height);
            currentGraph = data.graph;
            drawGraph(ctx, currentGraph, width, height);
            buildSCCPanel();
        } else if (currentTask === 1) {
            const data = generateWaveGraph(nodeCount, width, height);
            currentGraph = data.graph;
            currentWaveData = waveAnalysis(currentGraph);
            drawGraph(ctx, currentGraph, width, height);
            buildWavePanel();
        } else if (currentTask === 2) {
            const data = generateBellmanFordGraph(nodeCount, width, height);
            currentGraph = data.graph;
            const result = fordBellman(currentGraph, 0, nodeCount - 1);
            currentBellmanPath = result.path;
            drawGraph(ctx, currentGraph, width, height);
            buildBellmanPanel();
        }
        else if (currentTask === 3) {
            const data = generateEulerianGraph(nodeCount, width, height);
            currentGraph = data.graph;
            currentEulerAnswer = null;               // сброс ответа
            drawGraph(ctx, currentGraph, width, height);
            buildEulerPanel();
        } else if (currentTask === 4) {
            const data = generateMSTGraph(nodeCount, width, height);
            currentGraph = data.graph;
            const result = kruskalMST(currentGraph);
            currentMSTWeight = result.weight;
            drawGraph(ctx, currentGraph, width, height);
            buildMSTPanel();
        }
        isGenerating = false;
    }, 10);
}

function setTask(taskId) {
    currentTask = taskId;
    currentAttempts = 3;
    currentEulerAnswer = null;

    document.querySelectorAll('.task-btn').forEach((btn, idx) => {
        if (idx == taskId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    generateAndRender();
}

// ========== ПОДСКАЗКА (МАТРИЦА) ==========

function showReachabilityMatrix() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!currentGraph) {
        modalTitle.innerHTML = '⚠️ Нет графа';
        modalBody.innerHTML = '<p>Сначала сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const n = currentGraph.vertexCount();
    const vertices = currentGraph.vertices;
    const isDark = document.body.classList.contains('dark-theme');
    const borderColor = isDark ? '#475569' : '#cbd5e1';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const greenBg = isDark ? '#14532d' : '#bbf7d0';
    const redBg = isDark ? '#7f1d1d' : '#fee2e2';
    const blueBg = isDark ? '#1e3a8a' : '#e0e7ff';

    // Для заданий 3 и 5 — матрица весов
    if (currentTask === 2 || currentTask === 4) {
        modalTitle.innerHTML = `📊 Матрица весов (длин дуг) — задание ${currentTask + 1}`;

        const W = Array(n).fill().map(() => Array(n).fill('∞'));
        for (let i = 0; i < n; i++) W[i][i] = '0';
        for (const edge of currentGraph.edges) {
            const w = edge.weight !== undefined ? edge.weight : 1;
            W[edge.from][edge.to] = w.toString();
            if (!currentGraph.directed) {
                W[edge.to][edge.from] = w.toString();
            }
        }

        let html = `<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto;">`;
        html += `<thead><tr><th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor};">↓ / →</th>`;
        for (const v of vertices) html += `<th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor};">${v.label}</th>`;
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += `<tr><th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor};">${vertices[i].label}</th>`;
            for (let j = 0; j < n; j++) {
                const val = W[i][j];
                const isNumber = val !== '∞' && val !== '0';
                const bg = isNumber ? greenBg : (val === '0' ? blueBg : redBg);
                html += `<td style="border: 1px solid ${borderColor}; padding: 8px 12px; text-align: center; background: ${bg}; color: ${textColor};">${val}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';

        let extra = '';
        if (currentTask === 2) {
            extra = '<p style="margin-top: 16px;"><small>⚡ Задание 3 (Форд-Беллман): числа — веса рёбер, ∞ — ребра нет.</small></p>';
        } else {
            extra = '<p style="margin-top: 16px;"><small>🌳 Задание 5 (MST): числа — веса рёбер, ∞ — ребра нет. Алгоритм Краскала выбирает минимальные веса.</small></p>';
        }
        modalBody.innerHTML = html + extra;
        modal.classList.add('active');
        return;
    }

    // Для заданий 1,2,4 — матрица смежности
    modalTitle.innerHTML = `📊 Матрица смежности — задание ${currentTask + 1}`;

    const A = Array(n).fill().map(() => Array(n).fill(0));
    for (const edge of currentGraph.edges) {
        A[edge.from][edge.to] = 1;
        if (!currentGraph.directed) {
            A[edge.to][edge.from] = 1;
        }
    }

    let html = `<div style="overflow-x: auto;"><table style="border-collapse: collapse; margin: 0 auto;">`;
    html += `<thead><tr><th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor};">↓ / →</th>`;
    for (const v of vertices) html += `<th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor};">${v.label}</th>`;
    html += '</tr></thead><tbody>';

    for (let i = 0; i < n; i++) {
        html += `<tr><th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor};">${vertices[i].label}</th>`;
        for (let j = 0; j < n; j++) {
            const val = A[i][j];
            const bg = val ? greenBg : redBg;
            html += `<td style="border: 1px solid ${borderColor}; padding: 8px 12px; text-align: center; background: ${bg}; color: ${textColor};">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table></div>';

    let extra = '';
    if (currentTask === 0) {
        extra = '<p style="margin-top: 16px;"><small>🔍 1 — есть ребро, 0 — нет. Для сильной связности нажмите «Показать решение».</small></p>';
    } else if (currentTask === 1) {
        extra = '<p style="margin-top: 16px;"><small>📏 По этой матрице можно найти расстояния (Флойд‑Уоршелл) → диаметр, радиус, центры.</small></p>';
    } else if (currentTask === 3) {
        extra = '<p style="margin-top: 16px;"><small>🔁 Для эйлеровой цепи важна связность графа и чётность степеней.</small></p>';
    }

    modalBody.innerHTML = html + extra;
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 1) ==========

function showSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');

    if (!currentGraph || currentTask !== 0) {
        modalTitle.innerHTML = '⚠️ Решение доступно только для задания 1';
        modalBody.innerHTML = '<p>Сначала выберите задание 1 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const result = findSCCByMatrixDetailed(currentGraph);
    const vertices = currentGraph.vertices;
    const n = vertices.length;
    const isDark = document.body.classList.contains('dark-theme');

    const bgCard = isDark ? '#1e293b' : '#f8fafc';
    const borderColor = isDark ? '#475569' : '#cbd5e1';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const greenBg = isDark ? '#14532d' : '#bbf7d0';
    const redBg = isDark ? '#7f1d1d' : '#fee2e2';
    const blueBg = isDark ? '#1e3a8a' : '#e0e7ff';
    const formulaBg = isDark ? '#1e293b' : '#eef4ff';
    const formulaText = isDark ? '#f1f5f9' : '#0f172a';

    function matrixToHtml(matrix, title, stepDesc) {
        let html = `<div style="margin: 15px 0; padding: 12px; background: ${bgCard}; border-radius: 12px; border: 1px solid ${borderColor};">`;
        html += `<h4 style="margin-top: 0; margin-bottom: 8px; color: ${textColor}; font-size: 1rem;">${title}</h4>`;
        if (stepDesc) html += `<p style="font-size: 0.75rem; margin-bottom: 10px; color: ${textColor};">${stepDesc}</p>`;
        html += '<div style="overflow-x: auto; display: flex; justify-content: center;">';
        html += '<table style="border-collapse: collapse; margin: 0 auto; font-size: 13px;">';
        html += `<thead><tr><th style="border: 1px solid ${borderColor}; padding: 6px 10px; color: ${textColor};">↓/→</th>`;
        for (const v of vertices) html += `<th style="border: 1px solid ${borderColor}; padding: 6px 10px; color: ${textColor};">${v.label}</th>`;
        html += '</tr></thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += `<tr><th style="border: 1px solid ${borderColor}; padding: 6px 10px; color: ${textColor};">${vertices[i].label}</th>`;
            for (let j = 0; j < n; j++) {
                const val = matrix[i][j];
                let bgColor = redBg;
                if (val === 1) bgColor = greenBg;
                else if (val !== 0 && val !== 1) bgColor = blueBg;
                html += `<td style="border: 1px solid ${borderColor}; padding: 6px 10px; text-align: center; background: ${bgColor}; color: ${textColor};">${val}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table></div></div>';
        return html;
    }
    // Собираем содержимое (прокручивается только таблицы, кнопка — всегда видна)
    let scrollContent = '<div style="overflow-y: auto; max-height: 60vh; padding-right: 10px;">';
    scrollContent += '<h3 style="text-align: center; margin-bottom: 20px;">📐 Матричный метод нахождения компонент сильной связности</h3>';
    scrollContent += `<div style="background: ${formulaBg}; padding: 12px; border-radius: 12px; margin-bottom: 20px; border: 1px solid ${borderColor};">`;
    scrollContent += `<p style="margin: 0; color: ${formulaText};"><strong>📌 Формулы метода:</strong></p>`;
    scrollContent += `<p style="margin: 8px 0 0 0; color: ${formulaText};">• <strong>T(D) = sign(E + A + A² + ... + Aⁿ⁻¹)</strong> — матрица достижимости (транзитивное замыкание)</p>`;
    scrollContent += `<p style="margin: 8px 0 0 0; color: ${formulaText};">• <strong>S(D) = T & Tᵀ</strong> — матрица сильной связности (поэлементное умножение)</p>`;
    scrollContent += `<p style="margin: 8px 0 0 0; font-size: 0.85rem; color: ${formulaText};">где E — единичная матрица, A — матрица смежности</p>`;
    scrollContent += '</div>';

    // Шаг 1
    scrollContent += matrixToHtml(result.matrices.A,
        '🔹 Шаг 1. Матрица смежности A(D)',
        'A[i][j] = 1, если есть ребро i → j, иначе 0');

    // Шаг 2
    scrollContent += matrixToHtml(result.matrices.R,
        '🔹 Шаг 2. Матрица достижимости T(D) = sign(E + A + A² + ... + Aⁿ⁻¹)',
        'T[i][j] = 1, если существует путь i → j');

    // Шаг 3
    scrollContent += matrixToHtml(result.matrices.S,
        '🔹 Шаг 3. Матрица сильной связности S = T & Tᵀ (& - поэлементное умножение)',
        'S[i][j] = 1, если i и j взаимно достижимы (i→j и j→i)');

    // Шаг 4
    scrollContent += `<div style="margin: 20px 0; padding: 15px; background: ${bgCard}; border-radius: 16px; border: 1px solid ${borderColor};">`;
    scrollContent += '<h4 style="margin-top: 0;">🔹 Шаг 4. Выделение компонент по матрице S</h4>';
    scrollContent += '<p>По матрице S группируем вершины: если S[i][j] = 1, то вершины i и j в одной компоненте.</p>';
    scrollContent += `<p><strong>Компоненты сильной связности:</strong> ${result.components.map(c => `{${c.join(',')}}`).join(', ')}</p>`;
    scrollContent += '</div>';

    scrollContent += `<p style="margin-top: 25px; font-size: 0.75rem; text-align: center; border-top: 1px solid ${borderColor}; padding-top: 12px;">✅ Зелёная ячейка = 1 (связь есть), красная = 0 (связи нет), синяя = промежуточное значение.</p>`;
    scrollContent += '</div>';

    modalBody.innerHTML = scrollContent;
    modalTitle.innerHTML = '📐 Пошаговое решение (матричный метод) — задание 1';
    modal.classList.add('active');
}

// ========== ПОШАГОВОЕ РЕШЕНИЕ (ЗАДАНИЕ 2) ==========

function showWaveSolution() {
    const modal = document.getElementById('solutionModal');
    const modalTitle = document.getElementById('solutionModalTitle');
    const modalBody = document.getElementById('solutionModalBody');

    if (!currentGraph || currentTask !== 1) {
        modalTitle.innerHTML = '⚠️ Решение доступно только для задания 2';
        modalBody.innerHTML = '<p>Сначала выберите задание 2 и сгенерируйте граф.</p>';
        modal.classList.add('active');
        return;
    }

    const result = waveAnalysis(currentGraph);
    const vertices = currentGraph.vertices;
    const n = vertices.length;
    const isDark = document.body.classList.contains('dark-theme');

    // Цвета для тёмной и светлой темы
    const borderColor = isDark ? '#475569' : '#cbd5e1';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const headerBg = isDark ? '#0f172a' : '#f8fafc';
    const formulaBg = isDark ? '#1e293b' : '#ffffff';

    // Цвета ячеек
    const greenBg = isDark ? '#14532d' : '#bbf7d0';
    const greenText = isDark ? '#bbf7d0' : '#166534';
    const redBg = isDark ? '#7f1d1d' : '#fee2e2';
    const redText = isDark ? '#fecaca' : '#991b1b';
    const yellowBg = isDark ? '#854d0e' : '#fef08a';
    const yellowText = isDark ? '#fef08a' : '#854d0e';
    const blueBg = isDark ? '#1e3a8a' : '#bfdbfe';
    const blueText = isDark ? '#bfdbfe' : '#1e3a8a';
    const neutralBg = isDark ? '#334155' : '#f1f5f9';

    function matrixToHtml(matrix, title, type = 'adjacency') {
        let html = `<div style="margin: 20px 0; padding: 15px; background: ${headerBg}; border-radius: 16px; border: 1px solid ${borderColor};">`;
        html += `<h4 style="margin-top: 0; margin-bottom: 15px; color: ${textColor};">${title}</h4>`;
        html += '<div style="overflow-x: auto;">';
        html += '<table style="border-collapse: collapse; margin: 0 auto; border: 1px solid ' + borderColor + ';">';
        html += '<thead>';
        html += '<tr>';
        html += `<th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor}; background: ${headerBg};">↓/→</th>`;
        for (const v of vertices) {
            html += `<th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor}; background: ${headerBg};">${v.label}</th>`;
        }
        html += '</tr>';
        html += '</thead><tbody>';

        for (let i = 0; i < n; i++) {
            html += '<tr>';
            html += `<th style="border: 1px solid ${borderColor}; padding: 8px 12px; color: ${textColor}; background: ${headerBg};">${vertices[i].label}</th>`;
            for (let j = 0; j < n; j++) {
                let val = matrix[i][j];
                let displayVal = (val === Infinity) ? '∞' : val;
                let bgColor = neutralBg;
                let fontColor = textColor;

                if (type === 'adjacency') {
                    if (val === 1) {
                        bgColor = greenBg;
                        fontColor = greenText;
                    } else {
                        bgColor = redBg;
                        fontColor = redText;
                    }
                } else if (type === 'distances') {
                    if (val === 0) {
                        bgColor = neutralBg;
                        fontColor = textColor;
                    } else if (val === result.diameter) {
                        bgColor = yellowBg;
                        fontColor = yellowText;
                    } else if (val === result.radius) {
                        bgColor = greenBg;
                        fontColor = greenText;
                    } else if (val !== Infinity) {
                        bgColor = neutralBg;
                        fontColor = textColor;
                    } else {
                        bgColor = redBg;
                        fontColor = redText;
                    }
                }

                html += `<td style="border: 1px solid ${borderColor}; padding: 8px 12px; text-align: center; background: ${bgColor}; color: ${fontColor};">${displayVal}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';

        if (type === 'distances') {
            html += `<div style="margin-top: 12px; font-size: 0.8rem; color: ${textColor}; background: ${headerBg}; padding: 8px; border-radius: 8px; border: 1px solid ${borderColor};">`;
            html += `<p><strong>📖 Пояснение к таблице 2:</strong> Кратчайшие расстояния между всеми парами вершин (алгоритм Флойда‑Уоршелла).</p>`;
            html += `<p>• <span style="background: ${yellowBg}; color: ${yellowText}; padding: 0 4px;">Жёлтые ячейки</span> — расстояние равно <strong>диаметру</strong> (${result.diameter}).</p>`;
            html += `<p>• <span style="background: ${greenBg}; color: ${greenText}; padding: 0 4px;">Зелёные ячейки</span> — расстояние равно <strong>радиусу</strong> (${result.radius}).</p>`;
            html += `<p>• <span style="background: ${redBg}; color: ${redText}; padding: 0 4px;">Красные ячейки</span> — вершины недостижимы (∞).</p>`;
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    // Матрица смежности A
    const A = Array(n).fill().map(() => Array(n).fill(0));
    for (const edge of currentGraph.edges) {
        A[edge.from][edge.to] = 1;
        if (!currentGraph.directed) A[edge.to][edge.from] = 1;
    }

    let html = `<div style="max-height: 550px; overflow-y: auto; padding-right: 10px;">`;
    html += `<h3 style="text-align: center; margin-bottom: 20px; color: ${textColor};">📊 Фронт волны — решение</h3>`;

    // Таблица 1
    html += matrixToHtml(A, '📌 Таблица 1. Матрица смежности A(D)', 'adjacency');

    // Таблица 2
    html += matrixToHtml(result.distances, '📌 Таблица 2. Матрица минимальных расстояний (Флойд-Уоршелл)', 'distances');

    // Результаты
    html += `<div style="margin: 20px 0; padding: 15px; background: ${headerBg}; border-radius: 16px; border: 1px solid ${borderColor};">`;
    html += `<h4 style="margin-top: 0; color: ${textColor};">🎯 Результаты и пояснения</h4>`;

    html += `<p><strong style="background: ${yellowBg}; color: ${yellowText}; padding: 2px 8px; border-radius: 12px;">📏 Диаметр:</strong> <span style="color: ${textColor};">${result.diameter}</span></p>`;
    html += `<p style="margin-left: 20px; font-size: 0.85rem; color: ${textColor};">➜ Максимальное расстояние между любыми двумя вершинами (выделено жёлтым в таблице 2).</p>`;

    html += `<p><strong style="background: ${greenBg}; color: ${greenText}; padding: 2px 8px; border-radius: 12px;">🎯 Радиус:</strong> <span style="color: ${textColor};">${result.radius}</span></p>`;
    html += `<p style="margin-left: 20px; font-size: 0.85rem; color: ${textColor};">➜ Минимальный эксцентриситет среди всех вершин (выделено зелёным в таблице 2).</p>`;

    html += `<p><strong style="background: ${blueBg}; color: ${blueText}; padding: 2px 8px; border-radius: 12px;">⭐ Центры графа:</strong> <span style="color: ${textColor};">${result.centers.join(', ') || 'нет'}</span></p>`;
    html += `<p style="margin-left: 20px; font-size: 0.85rem; color: ${textColor};">➜ Вершины, у которых эксцентриситет равен радиусу.</p>`;

    html += `<p style="margin-top: 15px; font-size: 0.8rem; border-top: 1px solid ${borderColor}; padding-top: 10px; color: ${textColor};">🔍 <strong>Как вычислялось:</strong> Флойд‑Уоршелл → матрица расстояний → эксцентриситеты → диаметр (max), радиус (min), центры.</p>`;
    html += `</div></div>`;

    modalTitle.innerHTML = '📊 Фронт волны — пошаговое решение (задание 2)';
    modalBody.innerHTML = html;
    modal.classList.add('active');
}
function initTheme()
{
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌙';

        // Перерисовать граф
        if (currentGraph) {
            drawGraph(ctx, currentGraph, width, height);
        }

        const solutionModal = document.getElementById('solutionModal');
        if (solutionModal && solutionModal.classList.contains('active')) {
            // Определяем, какое решение показывать
            if (currentTask === 0) {
                showSolution();
            } else if (currentTask === 1) {
                showWaveSolution();
            }
        }

        // Обновить обычную подсказку (матрицу)
        const helpModal = document.getElementById('modal');
        if (helpModal && helpModal.classList.contains('active')) {
            showReachabilityMatrix();
        }
    });
}
// ========== ЗАПУСК ==========

document.querySelectorAll('.task-btn').forEach((btn, idx) => btn.onclick = () => setTask(idx));
document.getElementById('regenerateBtn').onclick = () => generateAndRender();
document.getElementById('nodeSlider').oninput = (e) => {
    nodeCount = parseInt(e.target.value);
    document.getElementById('nodeCountValue').innerText = nodeCount;
    generateAndRender();
};
document.getElementById('helpBtn').onclick = () => showReachabilityMatrix();
document.getElementById('modalClose').onclick = () => document.getElementById('modal').classList.remove('active');
document.getElementById('solutionModalClose').onclick = () => document.getElementById('solutionModal').classList.remove('active');
document.getElementById('modal').onclick = (e) => { if (e.target === document.getElementById('modal')) document.getElementById('modal').classList.remove('active'); };
document.getElementById('solutionModal').onclick = (e) => { if (e.target === document.getElementById('solutionModal')) document.getElementById('solutionModal').classList.remove('active'); };

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setTask(0);
});