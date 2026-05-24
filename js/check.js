function checkSCC()
{
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

    const normalizedCenters = userC.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .sort()
        .join(',');

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

function checkMST() {
    const userWeight = parseInt(document.getElementById('userAnswer').value.trim());
    const isOk = (userWeight === currentMSTWeight);
    showResult(isOk, currentMSTWeight.toString());
}