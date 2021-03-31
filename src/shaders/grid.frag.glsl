#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

void main() {
    vec2 grid = abs(fract(vUv - 0.5) - 0.5) / fwidth(vUv) * 0.5;
    vec2 grid2 = abs(fract(vUv * 0.1 - 0.5) - 0.5) / fwidth(vUv) * 5.0;
    vec2 axis = abs(vUv) / fwidth(vUv) * 0.5;

    float al = max(0.0, 1.0 - length(vUv) * 0.01);
    float ad = 0.5;

    float l = 1.0 - min(min(grid.x, grid.y), 1.0);
    float l2 = 1.0 - min(min(grid2.x, grid2.y), 1.0);
    float x = 1.0 - min(axis.y, 1.0);
    float y = 1.0 - min(axis.x, 1.0);

    vec4 xc = vec4(x, 0.1, 0.2, x * al);
    vec4 yc = vec4(0.2, y, 0.1, y * al);
    vec4 lc = vec4(l, l, l, l * ad * al * 0.1);
    vec4 lc2 = vec4(l2, l2, l2, l2 * al * 0.2);
    vec4 color;
    color = mix(lc, lc2, l2);
    color = mix(color, xc, x);
    color = mix(color, yc, y);

    outColor = color;
}
