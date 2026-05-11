/**
 * Класс Graph — структура данных для хранения графа
 */
class Graph {
    constructor(vertices, edges, directed = false, weighted = false) {
        this.vertices = vertices;
        this.edges = edges;
        this.directed = directed;
        this.weighted = weighted;
    }

    getVertex(id) {
        return this.vertices.find(v => v.id === id);
    }

    vertexCount() {
        return this.vertices.length;
    }

    hasOpposite(from, to) {
        if (!this.directed) return false;
        return this.edges.some(e => e.from === to && e.to === from);
    }

    getOutgoingEdges(vertexId) {
        return this.edges.filter(e => e.from === vertexId);
    }

    getIncomingEdges(vertexId) {
        return this.edges.filter(e => e.to === vertexId);
    }
}