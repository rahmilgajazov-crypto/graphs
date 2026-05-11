const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const width = 520, height = 360;
canvas.width = width;
canvas.height = height;

let currentTask = 0;
let nodeCount = 5;
let currentGraph = null;
let currentAttempts = 3;

let currentSCCAnswer = null;
let currentWaveData = null;
let currentBellmanPath = null;
let currentMSTWeight = null;
let isGenerating = false;

function buildSCCPanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 1: Компоненты сильной связности</strong><br>Матричный метод (транзитивное замыкание).<br>Введите компоненты в формате: {A,B},{C},{D,E}</div>
        <div class="format-hint">📌 Пример: {A,B},{C},{D,E}</div>
        <input type="text" id="userAnswer" placeholder="Введите компоненты...">
        <button class="check-btn" id="checkBtn">✅ Проверить</button>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkSCC();
}

function buildWavePanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 2: Фронт волны</strong><br>Диаметр, радиус, центры графа.</div>
        <div class="input-group"><label>📏 Диаметр:</label><input type="text" id="userDiameter" placeholder="число"></div>
        <div class="input-group"><label>🎯 Радиус:</label><input type="text" id="userRadius" placeholder="число"></div>
        <div class="input-group"><label>⭐ Центры:</label><input type="text" id="userCenters" placeholder="A,B,C"></div>
        <button class="check-btn" id="checkBtn">✅ Проверить</button>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkWave();
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
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description">🔍 <strong>Задание 4: Эйлерова цепь</strong><br>Путь, проходящий по каждому ребру ровно один раз.<br>Формат: A-B-C-D-A</div>
        <div class="format-hint">📌 Пример: A-B-C-D-A</div>
        <input type="text" id="userAnswer" placeholder="Введите последовательность...">
        <button class="check-btn" id="checkBtn">✅ Проверить</button>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkEuler();
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

function showResult(isCorrect, correctAnswerText) {
    const msgDiv = document.getElementById('messageArea');
    const hintDiv = document.getElementById('answerHint');
    msgDiv.classList.remove('success', 'error');
    if (isCorrect) {
        msgDiv.innerHTML = '✅ Верно! Отличная работа.';
        msgDiv.classList.add('success');
        hintDiv.innerHTML = '';
    } else {
        currentAttempts--;
        if (currentAttempts > 0) {
            msgDiv.innerHTML = `❌ Неверно. Осталось попыток: ${currentAttempts}`;
            msgDiv.classList.add('error');
        } else {
            msgDiv.innerHTML = `❌ Попытки закончились. Правильный ответ: ${correctAnswerText}`;
            msgDiv.classList.add('error');
            hintDiv.innerHTML = `📌 Верный ответ: ${correctAnswerText}`;
            const btn = document.getElementById('checkBtn');
            if (btn) btn.disabled = true;
        }
    }
}

function checkSCC() {
    const userInput = document.getElementById('userAnswer').value.trim().toUpperCase();
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
    const isOk = normalize(userInput) === normalize(currentSCCAnswer);
    showResult(isOk, currentSCCAnswer);
}

function checkWave() {
    const userD = document.getElementById('userDiameter').value.trim();
    const userR = document.getElementById('userRadius').value.trim();
    const userC = document.getElementById('userCenters').value.trim().toUpperCase();
    const normalizedCenters = userC.split(',').map(s => s.trim()).sort().join(',');
    const isOk = (parseInt(userD) === currentWaveData.diameter) &&
        (parseInt(userR) === currentWaveData.radius) &&
        (normalizedCenters === currentWaveData.centers);
    const correctAnswer = `диаметр ${currentWaveData.diameter}, радиус ${currentWaveData.radius}, центры ${currentWaveData.centers}`;
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
    showResult(isOk, 'пример: ' + currentGraph.vertices.map(v => v.label).join('-') + '-' + currentGraph.vertices[0].label);
}

function checkMST() {
    const userWeight = parseInt(document.getElementById('userAnswer').value.trim());
    const isOk = (userWeight === currentMSTWeight);
    showResult(isOk, currentMSTWeight.toString());
}

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
            const components = findSCCByMatrix(currentGraph);
            currentSCCAnswer = components.map(comp => `{${comp.join(',')}}`).sort().join(',');
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
        } else if (currentTask === 3) {
            const data = generateEulerianGraph(nodeCount, width, height);
            currentGraph = data.graph;
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
    document.querySelectorAll('.task-btn').forEach((btn, idx) => {
        if (idx == taskId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    generateAndRender();
}

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

    // 1. Матрица смежности A (за один шаг)
    const A = Array(n).fill().map(() => Array(n).fill(0));
    for (const edge of currentGraph.edges) {
        A[edge.from][edge.to] = 1;
        if (!currentGraph.directed) {
            A[edge.to][edge.from] = 1;
        }
    }

    modalTitle.innerHTML = `📊 Матрица смежности (один шаг) — задание ${currentTask + 1}`;

    let html = '<table><thead><tr><th>↓ / →</th>';
    for (const v of vertices) html += `<th>${v.label}</th>`;
    html += '</tr></thead><tbody>';

    for (let i = 0; i < n; i++) {
        html += `<tr><th>${vertices[i].label}</th>`;
        for (let j = 0; j < n; j++) {
            const val = A[i][j];
            const bg = val ? '#bbf7d0' : '#fee2e2';
            html += `<td style="background: ${bg};">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';

    // Дополнительное пояснение в зависимости от задания
    let extra = '';
    if (currentTask === 0) {
        extra = '<p><small>🔍 1 — есть ребро, 0 — нет. Для сильной связности нужно найти компоненты с помощью матрицы достижимости (смотрите лекции).</small></p>';
    } else if (currentTask === 1) {
        extra = '<p><small>📏 По этой матрице можно найти расстояния (Флойд‑Уоршелл) → диаметр, радиус, центры.</small></p>';
    } else if (currentTask === 2) {
        extra = '<p><small>⚡ В задании 3 учитываются веса рёбер (матрица смежности не взвешенная, смотрите таблицу весов отдельно).</small></p>';
    } else if (currentTask === 3) {
        extra = '<p><small>🔁 Эйлерова цепь: матрица смежности показывает все связи. С её помощью проверяют чётность степеней.</small></p>';
    } else if (currentTask === 4) {
        extra = '<p><small>🌳 Для MST важна матрица весов (здесь показаны только связи, веса смотрите в отдельной таблице).</small></p>';
    }

    modalBody.innerHTML = html + extra;
    modal.classList.add('active');
}
function initTheme() {
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
        if (currentGraph) drawGraph(ctx, currentGraph, width, height);
    });
}

document.querySelectorAll('.task-btn').forEach((btn, idx) => btn.onclick = () => setTask(idx));
document.getElementById('regenerateBtn').onclick = () => generateAndRender();
document.getElementById('nodeSlider').oninput = (e) => {
    nodeCount = parseInt(e.target.value);
    document.getElementById('nodeCountValue').innerText = nodeCount;
    generateAndRender();
};
document.getElementById('helpBtn').onclick = () => showReachabilityMatrix();
document.getElementById('modalClose').onclick = () => document.getElementById('modal').classList.remove('active');
document.getElementById('modal').onclick = (e) => { if (e.target === document.getElementById('modal')) document.getElementById('modal').classList.remove('active'); };

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setTask(0);
});