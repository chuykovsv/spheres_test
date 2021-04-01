import gridFragmentCode from './shaders/grid.frag.glsl';
import meshFragmentCode from './shaders/mesh.frag.glsl';
import gridVertexCode from './shaders/grid.vert.glsl';
import meshVertexCode from './shaders/mesh.vert.glsl';
import { Renderable, RenderableOptions } from './renderable';
import { createMesh, CreateMeshOptions } from './mesh';
import { Camera } from './camera';
import { UI } from './ui';

export class App {
    private _time: number = 0;
    private _gl: WebGL2RenderingContext;

    private _camera: Camera;
    private _mesh!: Renderable;
    private _grid: Renderable;
    private _ui: UI;

    constructor() {
        /* Create canvas and context */
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);

        const gl = canvas.getContext('webgl2', {
            depth: true,
            alpha: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
        }) as WebGL2RenderingContext;
        if (gl === null) {
            throw new Error('WebGL2 not supported');
        }
        this._gl = gl;

        /* Create camera */
        this._camera = new Camera({ gl, canvas });

        /* Create UI */
        this._ui = new UI();

        /* Create Grid */
        const vertexDataArray = [ /* Pos.X, Pos.Y, Pos.Z, Nor.X, Nor.Y, Nor.Z */
            1, 0, 1, 0, 1, 0,
            1, 0, -1, 0, 1, 0,
            -1, 0, -1, 0, 1, 0,
            -1, 0, 1, 0, 1, 0
        ];
        this._grid = new Renderable({
            gl,
            vertexShaderCode: gridVertexCode,
            fragmentShaderCode: gridFragmentCode,
            vertexData: new Float32Array(vertexDataArray),
            indexData: new Uint8Array([0, 1, 2, 0, 2, 3])
        });

        this._load('./assets/spheres.json').then(() => this._loop(0));
    }

    private async _load(url: string): Promise<void> {
        /* Load json file */
        const response = await fetch(url);
        const json = await response.json() as CreateMeshOptions;

        /* Create mesh */
        const options: RenderableOptions = {
            gl: this._gl,
            vertexShaderCode: meshVertexCode,
            fragmentShaderCode: meshFragmentCode,
            ...createMesh(json)
        };
        this._mesh = new Renderable(options);

        /* Set UI data */
        this._ui.set(
            options.indexData.length / 3,
            options.vertexData.length / 6,
            options.indexData.length
        );
    }

    private _loop = (time: number): void => {
        const gl = this._gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        /* Calc DeltaTime */
        const dt = (time - this._time) * 0.001;
        this._time = time;

        /* Update camera */
        this._camera.update(dt);

        /* Draw renderables */
        this._mesh.draw(this._camera);
        this._grid.draw(this._camera);
        requestAnimationFrame(this._loop);
    }

    update(json: CreateMeshOptions): void {
        this._mesh.destructor();

        const options: RenderableOptions = {
            gl: this._gl,
            vertexShaderCode: meshVertexCode,
            fragmentShaderCode: meshFragmentCode,
            ...createMesh(json)
        };
        this._mesh = new Renderable(options);

        /* Set UI data */
        this._ui.set(
            options.indexData.length / 3,
            options.vertexData.length / 6,
            options.indexData.length
        );
    }
}
