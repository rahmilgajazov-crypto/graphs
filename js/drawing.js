function drawArrow(ctx, x, y, angle) {
    const size = 12;
    const left = angle - Math.PI / 5.5;
    const right = angle + Math.PI / 5.5;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(left), y - size * Math.sin(left));
    ctx.lineTo(x - size * Math.cos(right), y - size * Math.sin(right));

    const isDark = document.body.classList.contains('dark-theme');
    ctx.fillStyle = isDark ? '#fbbf24' : '#2563eb';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#b45309' : '#1e3a8a';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawStraightEdge(ctx, from, to, weight) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowX = to.x - 18 * Math.cos(angle);
    const arrowY = to.y - 18 * Math.sin(angle);
    drawArrow(ctx, arrowX, arrowY, angle);

    if (weight !== undefined && weight !== null) {
        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? '#f1f5f9' : '#000000';
        ctx.font = 'bold 24px monospace';
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.hypot(dx, dy);
        const perpX = -dy * 15 / len, perpY = dx * 15 / len;
        const midX = (from.x + to.x) / 2 + perpX;
        const midY = (from.y + to.y) / 2 + perpY;
        ctx.fillText(weight, midX, midY);
    }
}

function drawCurvedEdge(ctx, from, to, weight) {
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) return;

    const offset = 45;
    const perpX = -dy * offset / len, perpY = dx * offset / len;
    const cp1 = { x: from.x + dx * 0.25 + perpX, y: from.y + dy * 0.25 + perpY };
    const cp2 = { x: from.x + dx * 0.75 + perpX, y: from.y + dy * 0.75 + perpY };

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const t = 0.92, mt = 1 - t;
    const ax = mt * mt * mt * from.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * to.x;
    const ay = mt * mt * mt * from.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * to.y;
    const bt = t - 0.07, mbt = 1 - bt;
    const bx = mbt * mbt * mbt * from.x + 3 * mbt * mbt * bt * cp1.x + 3 * mbt * bt * bt * cp2.x + bt * bt * bt * to.x;
    const by = mbt * mbt * mbt * from.y + 3 * mbt * mbt * bt * cp1.y + 3 * mbt * bt * bt * cp2.y + bt * bt * bt * to.y;
    const angle = Math.atan2(ay - by, ax - bx);
    const arrowX = ax - 8 * Math.cos(angle);
    const arrowY = ay - 8 * Math.sin(angle);
    drawArrow(ctx, arrowX, arrowY, angle);

    if (weight !== undefined && weight !== null) {
        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? '#f1f5f9' : '#000000';
        ctx.font = 'bold 24px monospace';
        const midX = (from.x + to.x) / 2 + perpX * 0.8;
        const midY = (from.y + to.y) / 2 + perpY * 0.8;
        ctx.fillText(weight, midX + 12, midY - 12);
    }
}

function drawUndirectedEdge(ctx, from, to, weight) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (weight !== undefined && weight !== null) {
        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? '#f1f5f9' : '#000000';
        ctx.font = 'bold 24px monospace';
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.hypot(dx, dy);
        const perpX = -dy * 15 / len, perpY = dx * 15 / len;
        const midX = (from.x + to.x) / 2 + perpX;
        const midY = (from.y + to.y) / 2 + perpY;
        ctx.fillText(weight, midX, midY);
    }
}

function drawGraph(ctx, graph, width, height) {
    if (!graph) return;
    ctx.clearRect(0, 0, width, height);

    const { vertices, edges, directed, weighted } = graph;
    const processedPairs = new Set();

    for (const edge of edges) {
        const from = vertices[edge.from];
        const to = vertices[edge.to];
        if (!from || !to) continue;

        if (edge.from === edge.to) continue;

        const key = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;

        if (directed && graph.hasOpposite(edge.from, edge.to)) {
            if (processedPairs.has(key)) continue;
            processedPairs.add(key);
            const opposite = edges.find(e => e.from === edge.to && e.to === edge.from);
            drawStraightEdge(ctx, from, to, weighted ? edge.weight : null);
            drawCurvedEdge(ctx, to, from, weighted && opposite ? opposite.weight : null);
        } else if (directed) {
            drawStraightEdge(ctx, from, to, weighted ? edge.weight : null);
        } else {
            if (processedPairs.has(key)) continue;
            processedPairs.add(key);
            drawUndirectedEdge(ctx, from, to, weighted ? edge.weight : null);
        }
    }

    for (const vertex of vertices) {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#fef9e3';
        ctx.fill();
        ctx.strokeStyle = '#2c3e66';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(vertex.label, vertex.x, vertex.y);
    }
}