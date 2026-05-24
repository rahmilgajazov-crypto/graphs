function buildSCCPanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description"> <strong>Задание 1: Компоненты сильной связности</strong><br>С помощью матрицы смежности найти компоненты сильной связанности ориентированного графа D.</div>
        <div class="format-hint">Пример ввода: {A,B},{C},{D,E}</div>
        <input type="text" id="userAnswer" placeholder="Введите компоненты...">
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;"> Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;"> Показать решение</button>
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
        <div class="task-description"> <strong>Задание 2: Фронт волны</strong><br>С помощью алгоритма фронта волны найти расстояния в ориентированном графе D: диаметр, радиус и центры.</div>
        <div class="input-group"><label> Диаметр:</label><input type="text" id="userDiameter" placeholder="число"></div>
        <div class="input-group"><label> Радиус:</label><input type="text" id="userRadius" placeholder="число"></div>
        <div class="input-group"><label> Центры:</label><input type="text" id="userCenters" placeholder="A,B,C"></div>
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;"> Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;"> Показать решение</button>
        </div>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkWave();
    document.getElementById('solveBtn').onclick = () => showWaveSolution();
}

function buildBellmanPanel() {
    const startLabel = currentGraph ? currentGraph.vertices[currentBellmanStart].label : '?';
    const endLabel = currentGraph ? currentGraph.vertices[currentBellmanEnd].label : '?';
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description"> <strong>Задание 3: Форд-Беллман</strong><br>Найти минимальный путь в нагруженном графе по методу Форда-Беллмана от вершины <strong>${startLabel}</strong> до вершины <strong>${endLabel}</strong>.</div>
        <div class="format-hint"> Пример ввода: ${startLabel}-X-Y-${endLabel}</div>
        <input type="text" id="userAnswer" placeholder="Введите путь...">
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;"> Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;"> Показать решение</button>
        </div>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkBellman();
    document.getElementById('solveBtn').onclick = () => showBellmanSolution();
}

function buildEulerPanel() {
    const correctPath = findEulerianPath(currentGraph);
    currentEulerAnswer = correctPath ? correctPath.join('-') : 'Невозможно';

    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description"> <strong>Задание 4: Эйлерова цепь</strong><br>Найти Эйлерову цепь в неориентированном графе.<br>Путь, проходящий по каждому ребру ровно один раз.</div>
        <div class="format-hint"> Пример ввода: A-B-C-D-A</div>
        <input type="text" id="userAnswer" placeholder="Введите последовательность вершин...">
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;"> Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;"> Показать решение</button>
        </div>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;

    const btn = document.getElementById('checkBtn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
        const userChain = document.getElementById('userAnswer').value.trim().toUpperCase();
        const isValid = isEulerianChain(userChain, currentGraph);
        showResult(isValid, currentEulerAnswer);
    });

    const solveBtn = document.getElementById('solveBtn');
    if (solveBtn) solveBtn.onclick = () => showEulerSolution();
}

function buildMSTPanel() {
    const panel = document.getElementById('answerPanel');
    panel.innerHTML = `
        <div class="task-description"> <strong>Задание 5: Минимальное остовное дерево</strong><br>Найти минимальное остовное дерево в неориентированном нагруженном графе.</div>
        <div class="format-hint"> Пример ввода: 25</div>
        <input type="text" id="userAnswer" placeholder="Введите вес...">
        <div style="display: flex; gap: 10px;">
            <button class="check-btn" id="checkBtn" style="flex:1;"> Проверить</button>
            <button class="check-btn" id="solveBtn" style="background: #3b82f6; flex:1;"> Показать решение</button>
        </div>
        <div class="message" id="messageArea">Осталось попыток: 3</div>
        <div class="attempts" id="answerHint"></div>
    `;
    document.getElementById('checkBtn').onclick = () => checkMST();
    document.getElementById('solveBtn').onclick = () => showMSTSolution();
}

function showResult(isCorrect, correctAnswerText) {
    const msgDiv = document.getElementById('messageArea');
    const hintDiv = document.getElementById('answerHint');
    msgDiv.classList.remove('success', 'error');

    if (isCorrect) {
        msgDiv.innerHTML = 'Верно! Отличная работа.';
        msgDiv.classList.add('success');
        hintDiv.innerHTML = '';
    } else {
        currentAttempts--;
        if (currentAttempts > 0) {
            msgDiv.innerHTML = ` Неверно. Осталось попыток: ${currentAttempts}`;
            msgDiv.classList.add('error');
        } else {
            msgDiv.innerHTML = ` Попытки закончились. Правильный ответ: ${correctAnswerText}`;
            msgDiv.classList.add('error');
            hintDiv.innerHTML = `Верный ответ: ${correctAnswerText}`;
            const btn = document.getElementById('checkBtn');
            if (btn) btn.disabled = true;
        }
    }
}