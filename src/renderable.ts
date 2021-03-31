import { Camera } from './camera';

export interface RenderableOptions {
    gl: WebGL2RenderingContext;
    fragmentShaderCode: string;
    vertexShaderCode: string;
    vertexData: Float32Array;
    indexData: Uint8Array | Uint16Array | Uint32Array;
}

export class Renderable {
    private _gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _count: number;
    private _type: number;
    private _vao: WebGLVertexArrayObject;
    private _vbo: WebGLBuffer;
    private _ebo: WebGLBuffer;
    private _pMatrix: WebGLUniformLocation;
    private _vMatrix: WebGLUniformLocation;
    private _position: WebGLUniformLocation | null;

    constructor(options: RenderableOptions) {
        const { gl, vertexShaderCode, fragmentShaderCode, vertexData, indexData } = options;
        this._count = indexData.length;
        this._gl = gl;

        /* Create shader program */
        const program = gl.createProgram();
        const vShader = gl.createShader(gl.VERTEX_SHADER);
        const fShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (program === null || vShader === null || fShader === null) {
            throw new Error('Create shader program error');
        }

        this._program = program;

        gl.shaderSource(vShader, vertexShaderCode);
        gl.compileShader(vShader);
        gl.shaderSource(fShader, fragmentShaderCode);
        gl.compileShader(fShader);

        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            throw new Error(String(gl.getShaderInfoLog(vShader)));
        }
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            throw new Error(String(gl.getShaderInfoLog(fShader)));
        }

        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(String(gl.getProgramInfoLog(program)));
        }

        gl.deleteShader(vShader);
        gl.deleteShader(fShader);

        const pMatrix = gl.getUniformLocation(program, 'pMatrix');
        const vMatrix = gl.getUniformLocation(program, 'vMatrix');
        if (pMatrix === null || vMatrix === null) {
            throw new Error('Sahder matrices not found');
        }

        this._pMatrix = pMatrix;
        this._vMatrix = vMatrix;
        this._position = gl.getUniformLocation(program, 'camera');

        /* Create and init buffers */
        if (indexData instanceof Uint32Array) {
            this._type = gl.UNSIGNED_INT;
        } else if (indexData instanceof Uint16Array) {
            this._type = gl.UNSIGNED_SHORT;
        } else {
            this._type = gl.UNSIGNED_BYTE;
        }

        const vbo = gl.createBuffer();
        const ebo = gl.createBuffer();
        const vao = gl.createVertexArray();
        if (vbo === null || ebo === null || vao === null) {
            throw new Error('Create buffers error');
        }

        this._vao = vao;
        this._vbo = vbo;
        this._ebo = ebo;

        /* Bind VAO and buffers */
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
        /* Position */
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
        /* Normal */
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
        /* Unbind VAO */
        gl.bindVertexArray(null);
    }

    destructor(): void {
        const gl = this._gl;
        gl.deleteVertexArray(this._vao);
        gl.deleteBuffer(this._vbo);
        gl.deleteBuffer(this._ebo);
        gl.deleteProgram(this._program);
    }

    draw(camera: Camera): void {
        const gl = this._gl;
        /* Update uniforms */
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._pMatrix, false, camera.pMatrix);
        gl.uniformMatrix4fv(this._vMatrix, false, camera.vMatrix);

        if (this._position !== null) {
            gl.uniform3fv(this._position, camera.position);
        }

        /* Draw */
        gl.bindVertexArray(this._vao);
        gl.drawElements(gl.TRIANGLES, this._count, this._type, 0);
    }
}
