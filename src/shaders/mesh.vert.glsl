#version 300 es

uniform mat4 pMatrix;
uniform mat4 vMatrix;

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;

out vec3 vNor;
out vec3 vPos;

void main() {
    vNor = normal;
    vPos = position;
    gl_Position = pMatrix * vMatrix * vec4(position, 1.0);
}
