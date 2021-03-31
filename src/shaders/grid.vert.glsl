#version 300 es

uniform mat4 pMatrix;
uniform mat4 vMatrix;

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;

out vec2 vUv;

void main() {
    vec3 pos = position * 128.0;
    vUv = pos.xz;
    gl_Position = pMatrix * vMatrix * vec4(pos, 1.0);
}
