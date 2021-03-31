export interface CameraOptions {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
}

const ROTATE_SPEED = 0.002;
const MOVE_SPEED = 10;
const HALF_PI = Math.PI * 0.5;

const KEY_W_BIT = 0x01;
const KEY_S_BIT = 0x02;
const KEY_A_BIT = 0x04;
const KEY_D_BIT = 0x08;
const KEY_E_BIT = 0x10;
const KEY_Q_BIT = 0x20;

export class Camera {
    private static _iMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    private _canvas: HTMLCanvasElement;
    private _gl: WebGL2RenderingContext;

    private _width: number;
    private _height: number;

    private _oldX: number;
    private _oldY: number;
    private _keyState: number;

    private _polar: number;
    private _azimuthal: number;

    pMatrix = new Float32Array(16);
    vMatrix = new Float32Array(16);
    position = new Float32Array(3);

    constructor(options: CameraOptions) {
        const { gl, canvas } = options;
        this._gl = gl;
        this._canvas = canvas;
        this._polar = 0.2;
        this._azimuthal = 0;
        this._oldX = 0;
        this._oldY = 0;
        this._keyState = 0;

        this.position[1] = 10.0;
        this.position[2] = 50.0;

        /* Init canvas */
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        canvas.width = this._width;
        canvas.height = this._height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.oncontextmenu = () => false;

        /* Init context */
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        gl.clearColor(0.3, 0.3, 0.3, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        /* Input events */
        document.body.addEventListener('mousemove', e => {
            if (e.buttons === 1 && e.button === 0) {
                this._polar += (e.clientY - this._oldY) * ROTATE_SPEED;
                this._azimuthal += (e.clientX - this._oldX) * ROTATE_SPEED;
                this._polar = Math.max(Math.min(this._polar, HALF_PI), -HALF_PI);
            }
            this._oldX = e.clientX;
            this._oldY = e.clientY;
        });

        document.body.addEventListener('keyup', e => {
            switch (e.code) {
                case 'KeyW':
                    this._keyState &= ~KEY_W_BIT;
                    break;
                case 'KeyS':
                    this._keyState &= ~KEY_S_BIT;
                    break;
                case 'KeyA':
                    this._keyState &= ~KEY_A_BIT;
                    break;
                case 'KeyD':
                    this._keyState &= ~KEY_D_BIT;
                    break;
                case 'KeyQ':
                    this._keyState &= ~KEY_Q_BIT;
                    break;
                case 'KeyE':
                    this._keyState &= ~KEY_E_BIT;
                    break;
                default: break;
            }
        });

        document.body.addEventListener('keydown', e => {
            switch (e.code) {
                case 'KeyW':
                    this._keyState |= KEY_W_BIT;
                    break;
                case 'KeyS':
                    this._keyState |= KEY_S_BIT;
                    break;
                case 'KeyA':
                    this._keyState |= KEY_A_BIT;
                    break;
                case 'KeyD':
                    this._keyState |= KEY_D_BIT;
                    break;
                case 'KeyQ':
                    this._keyState |= KEY_Q_BIT;
                    break;
                case 'KeyE':
                    this._keyState |= KEY_E_BIT;
                    break;
                default: break;
            }
        });
    }

    update(dt: number): void {
        /* Update screen */
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (width !== this._width || height !== this._height) {
            this._width = width;
            this._height = height;

            this._canvas.width = width;
            this._canvas.height = height;

            this._gl.viewport(0, 0, width, height);
        }

        /* Calculate matrices */
        let dx = 0;
        let dy = 0;
        let dz = 0;

        if (this._keyState & KEY_W_BIT) {
            dz -= 1;
        }
        if (this._keyState & KEY_S_BIT) {
            dz += 1;
        }
        if (this._keyState & KEY_A_BIT) {
            dx -= 1;
        }
        if (this._keyState & KEY_D_BIT) {
            dx += 1;
        }
        if (this._keyState & KEY_Q_BIT) {
            dy += 1;
        }
        if (this._keyState & KEY_E_BIT) {
            dy -= 1;
        }

        dx *= MOVE_SPEED * dt;
        dy *= MOVE_SPEED * dt;
        dz *= MOVE_SPEED * dt;

        this._perspective();
        this._orbit(dx, dy, dz);
    }

    private _perspective(): void {
        const mat = this.pMatrix;
        const far = 1000;
        const near = 0.1;
        const fov = 0.7;
        const aspect = this._width / this._height;

        mat.set(Camera._iMatrix);

        mat[15] = 0;
        mat[14] = -2 * far * near / (far - near);
        mat[11] = -1;
        mat[10] = -(far + near) / (far - near);
        mat[5] = 1 / Math.tan(fov * 0.5);
        mat[0] = mat[5] / aspect;
    }

    private _orbit(dx: number, dy: number, dz: number): void {
        const cosa = Math.cos(this._azimuthal);
        const sina = Math.sin(this._azimuthal);
        const cosp = Math.cos(this._polar);
        const sinp = Math.sin(this._polar);
        const mat = this.vMatrix;
        const position = this.position;

        mat.set(Camera._iMatrix);

        mat[0] = cosa;
        mat[4] = 0;
        mat[8] = sina;
        mat[1] = sina * sinp;
        mat[5] = cosp;
        mat[9] = -cosa * sinp;
        mat[2] = -sina * cosp;
        mat[6] = sinp;
        mat[10] = cosa * cosp;

        position[0] += mat[0] * dx + mat[1] * dy + mat[2] * dz;
        position[1] += mat[4] * dx + mat[5] * dy + mat[6] * dz;
        position[2] += mat[8] * dx + mat[9] * dy + mat[10] * dz;

        mat[12] -= position[0] * mat[0] + position[1] * mat[4] + position[2] * mat[8];
        mat[13] -= position[0] * mat[1] + position[1] * mat[5] + position[2] * mat[9];
        mat[14] -= position[0] * mat[2] + position[1] * mat[6] + position[2] * mat[10];
    }
}
