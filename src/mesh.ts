export interface CreateMeshOptions {
    sphere1: [number, number, number, number];
    sphere2: [number, number, number, number];
    resolution: number;
}

export interface CreateMeshResult {
    vertexData: Float32Array;
    indexData: Uint8Array | Uint16Array | Uint32Array;
}

interface CreateSphereOptions {
    matrix: Float32Array;
    radialSegments: number;
    heightSegments: number;
    startAngle: number;
    parameters: [number, number, number, number];
    backSide: boolean;
    vertices: Float32Array;
    indices: Uint8Array | Uint16Array | Uint32Array;
    itv: number;
    iti: number;
}

function createSphere(options: CreateSphereOptions): void {
    const {
        matrix,
        radialSegments,
        heightSegments,
        startAngle,
        parameters,
        backSide,
        vertices,
        indices
    } = options;

    let {
        itv,
        iti
    } = options;

    const startIt = itv / 6;

    const deltaPolar = (Math.PI - startAngle) / heightSegments;
    const deltaAzimuthal = Math.PI * 2 / radialSegments;
    const radius = parameters[3];

    let x = 0;
    let y = 0;
    let z = 0;

    let tx = 0;
    let ty = 0;
    let tz = 0;

    let sinPolar = 0;
    let cosPolar = 0;
    let sinAzimuthal = 0;
    let cosAzimuthal = 0;

    for (let ih = 0; ih <= heightSegments; ih++) {
        for (let ir = 0; ir < radialSegments; ir++) {
            sinPolar = Math.sin(ih * deltaPolar + startAngle);
            cosPolar = Math.cos(ih * deltaPolar + startAngle);
            sinAzimuthal = Math.sin(-ir * deltaAzimuthal);
            cosAzimuthal = Math.cos(ir * deltaAzimuthal);
            tx = sinPolar * cosAzimuthal;
            ty = cosPolar;
            tz = sinPolar * sinAzimuthal;

            // x = tx * matrix[0] + ty * matrix[1] + tz * matrix[2];
            // y = tx * matrix[3] + ty * matrix[4] + tz * matrix[5];
            // z = tx * matrix[6] + ty * matrix[7] + tz * matrix[8];

            x = tx * matrix[0] + ty * matrix[3] + tz * matrix[6];
            y = tx * matrix[1] + ty * matrix[4] + tz * matrix[7];
            z = tx * matrix[2] + ty * matrix[5] + tz * matrix[8];

            /* vertices */
            /* PosX */ vertices[itv++] = x * radius + parameters[0];
            /* PosY */ vertices[itv++] = y * radius + parameters[1];
            /* PosZ */ vertices[itv++] = z * radius + parameters[2];
            if (backSide) {
                /* NorX */ vertices[itv++] = -x;
                /* NorY */ vertices[itv++] = -y;
                /* NorZ */ vertices[itv++] = -z;
            } else {
                /* NorX */ vertices[itv++] = x;
                /* NorY */ vertices[itv++] = y;
                /* NorZ */ vertices[itv++] = z;
            }

            /* indices */
            if (backSide) {
                if (ih < heightSegments) {
                    /* X0Y0 */ indices[iti++] = ir + ih * radialSegments + startIt;
                    /* X1Y1 */ indices[iti++] = (ir + 1) % radialSegments + (ih + 1) * radialSegments + startIt;
                    /* X0Y1 */ indices[iti++] = ir + (ih + 1) * radialSegments + startIt;
                    /* X0Y0 */ indices[iti++] = ir + ih * radialSegments + startIt;
                    /* X1Y0 */ indices[iti++] = (ir + 1) % radialSegments + ih * radialSegments + startIt;
                    /* X1Y1 */ indices[iti++] = (ir + 1) % radialSegments + (ih + 1) * radialSegments + startIt;
                }
            } else {
                if (ih < heightSegments) {
                    /* X0Y0 */ indices[iti++] = ir + ih * radialSegments + startIt;
                    /* X0Y1 */ indices[iti++] = ir + (ih + 1) * radialSegments + startIt;
                    /* X1Y1 */ indices[iti++] = (ir + 1) % radialSegments + (ih + 1) * radialSegments + startIt;
                    /* X0Y0 */ indices[iti++] = ir + ih * radialSegments + startIt;
                    /* X1Y1 */ indices[iti++] = (ir + 1) % radialSegments + (ih + 1) * radialSegments + startIt;
                    /* X1Y0 */ indices[iti++] = (ir + 1) % radialSegments + ih * radialSegments + startIt;
                }
            }
        }
    }

    options.itv = itv;
    options.iti = iti;
}

export function createMesh(options: CreateMeshOptions): CreateMeshResult {
    const resolution = Math.max(Math.ceil(options.resolution), 4);
    const radialSegments = resolution;

    const radius1 = options.sphere1[3];
    const radius2 = options.sphere2[3];

    let startAngle1 = 0;
    let startAngle2 = 0;

    let heightSegments1 = Math.ceil(resolution * 0.5);
    let heightSegments2 = 0;

    /* Calculate intersection of spheres */
    const sx = options.sphere1[0] - options.sphere2[0];
    const sy = options.sphere1[1] - options.sphere2[1];
    const sz = options.sphere1[2] - options.sphere2[2];
    const length = Math.sqrt(sx * sx + sy * sy + sz * sz);

    const matrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    if (length < radius1 + radius2 && length + Math.min(radius1, radius2) > Math.max(radius1, radius2)) { /* Intersect */
        startAngle1 = Math.acos((length * length + radius1 * radius1 - radius2 * radius2) / (2 * radius1 * length));
        startAngle2 = Math.PI - Math.acos((length * length + radius2 * radius2 - radius1 * radius1) / (2 * radius2 * length));
        heightSegments1 = Math.ceil(resolution * (Math.PI - startAngle1) / Math.PI);
        heightSegments2 = Math.ceil(resolution * (Math.PI - startAngle2) / Math.PI);

        const polar = Math.acos(Math.min(Math.max(sy / length, -1), 1));
        const azimuthal = Math.atan2(sx, sz);

        const cosa = Math.cos(azimuthal);
        const sina = Math.sin(azimuthal);
        const cosp = Math.cos(polar);
        const sinp = Math.sin(polar);

        matrix[0] = cosa;
        matrix[1] = 0;
        matrix[2] = -sina;
        matrix[3] = -sina * sinp;
        matrix[4] = -cosp;
        matrix[5] = -cosa * sinp;
        matrix[6] = -sina * cosp;
        matrix[7] = sinp;
        matrix[8] = -cosa * cosp;
    }
    const heightSegments = heightSegments1 + heightSegments2;

    /* Calculate spheres */
    const vertexCount = radialSegments * (heightSegments + (startAngle1 === 0 ? 1 : 2));
    const elementCount = radialSegments * heightSegments * 6;

    let ElementArrayConstructor: Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor = Uint32Array;
    if (vertexCount < 256) {
        ElementArrayConstructor = Uint8Array;
    } else if (vertexCount < 65536) {
        ElementArrayConstructor = Uint16Array;
    }

    const vertices = new Float32Array(vertexCount * 6);
    const indices = new ElementArrayConstructor(elementCount);

    const sphereOptions: CreateSphereOptions = {
        matrix,
        radialSegments,
        heightSegments: heightSegments1,
        parameters: options.sphere1,
        startAngle: startAngle1,
        backSide: false,
        vertices,
        indices,
        itv: 0,
        iti: 0
    };

    createSphere(sphereOptions);

    if (startAngle1 !== 0) {
        sphereOptions.heightSegments = heightSegments2;
        sphereOptions.parameters = options.sphere2;
        sphereOptions.startAngle = startAngle2;
        sphereOptions.backSide = true;
        createSphere(sphereOptions);
    }

    const result: CreateMeshResult =  {
        vertexData: vertices,
        indexData: indices
    };

    return result;
}
