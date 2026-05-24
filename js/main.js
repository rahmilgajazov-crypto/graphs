const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const width = 520, height = 360;
canvas.width = width;
canvas.height = height;

let currentTask = 0;
let nodeCount = 5;
let currentGraph = null;
let currentAttempts = 3;
let currentEulerCycles = null;

let currentWaveData = null;
let currentBellmanPath = null;
let currentBellmanStart = 0;
let currentBellmanEnd = 0;
let currentMSTWeight = null;
let isGenerating = false;

// ========== ЦВЕТА ==========
function getThemeColors() {
    const isDark = document.body.classList.contains('dark-theme');
    return {
        isDark,
        borderColor: isDark ? '#475569' : '#cbd5e1',
        textColor: isDark ? '#f1f5f9' : '#0f172a',
        headerBg: isDark ? '#0f172a' : '#f8fafc',
        formulaBg: isDark ? '#1e293b' : '#ffffff',
        greenBg: isDark ? '#14532d' : '#bbf7d0',
        greenText: isDark ? '#bbf7d0' : '#166534',
        redBg: isDark ? '#7f1d1d' : '#fee2e2',
        redText: isDark ? '#fecaca' : '#991b1b',
        yellowBg: isDark ? '#854d0e' : '#fef08a',
        yellowText: isDark ? '#fef08a' : '#854d0e',
        blueBg: isDark ? '#1e3a8a' : '#bfdbfe',
        blueText: isDark ? '#bfdbfe' : '#1e3a8a',
        neutralBg: isDark ? '#334155' : '#f1f5f9'
    };
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
            currentBellmanStart = data.startId;
            currentBellmanEnd = data.endId;
            const result = fordBellman(currentGraph, currentBellmanStart, currentBellmanEnd);
            currentBellmanPath = result.path;
            drawGraph(ctx, currentGraph, width, height);
            buildBellmanPanel();
        } else if (currentTask === 3) {
            const data = generateEulerianGraph(nodeCount, width, height);
            currentGraph = data.graph;
            currentEulerCycles = data.cycles || [];
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

    document.querySelectorAll('.task-btn').forEach((btn, idx) => {
        if (idx == taskId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    generateAndRender();
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

        const solutionModal = document.getElementById('solutionModal');
        if (solutionModal && solutionModal.classList.contains('active')) {
            if (currentTask === 0) showSolution();
            else if (currentTask === 1) showWaveSolution();
            else if (currentTask === 2) showBellmanSolution();
            else if (currentTask === 3) showEulerSolution();
            else if (currentTask === 4) showMSTSolution();
        }
        const helpModal = document.getElementById('modal');
        if (helpModal && helpModal.classList.contains('active')) showReachabilityMatrix();
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
document.getElementById('solutionModalClose').onclick = () => document.getElementById('solutionModal').classList.remove('active');
document.getElementById('modal').onclick = (e) => { if (e.target === document.getElementById('modal')) document.getElementById('modal').classList.remove('active'); };
document.getElementById('solutionModal').onclick = (e) => { if (e.target === document.getElementById('solutionModal')) document.getElementById('solutionModal').classList.remove('active'); };

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setTask(0);
});