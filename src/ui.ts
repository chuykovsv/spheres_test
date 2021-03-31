export class UI {
    set(triangles: number, vertices: number, indices: number): void {
        const trianglesElement = document.getElementById('triangles');
        const verticesElement = document.getElementById('vertices');
        const indicesElement = document.getElementById('indices');

        if (trianglesElement === null || verticesElement === null || indicesElement === null) { return; }

        trianglesElement.innerText = String(triangles);
        verticesElement.innerText = String(vertices);
        indicesElement.innerText = String(indices);
    }
}
