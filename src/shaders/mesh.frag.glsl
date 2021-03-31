#version 300 es
precision highp float;

uniform vec3 camera;

in vec3 vNor;
in vec3 vPos;
out vec4 outColor;

vec3 lg = normalize(vec3(1.0, 4.0, 3.0));

vec3 getEnv(vec3 nor) {
    vec2 uv;
    vec3 res = vec3(0.5);

    if (nor.y < 0.0) {
        float k = pow(max(-nor.y, 0.0), 0.8);
        uv = nor.xz / nor.y;
        vec2 stp = step(vec2(0.5, 0.5), fract(uv * 0.5));
        res = vec3(stp.x != stp.y ? 0.8 : 0.5);
        res = mix(vec3(0.5), res, k);
    }

    return res;
}

vec3 light(vec3 nor) {
    float k = max(dot(lg, nor), 0.0);
    return vec3(k * 0.9 + 0.1);
}

void main() {
    vec3 nor = normalize(vNor);

    vec3 color = vec3(0.6, 0.16, 0.1) * light(nor);

    float spec = pow(1.0 - abs(dot(normalize(vPos - camera), -nor)), 3.0) * 0.99 + 0.01;

    color = mix(color, getEnv(nor), spec);

    outColor = vec4(color, 1);
}
