const fragmentShader = /* glsl */ `
varying float vDistance;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBrighten;

void main() {
  float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
  strength = pow(strength, 3.0);

  vec3 color = mix(uColorA, uColorB, vDistance * 0.5);
  color = mix(vec3(0.0), color, strength);

  gl_FragColor = vec4(color, strength * 2.0) * uBrighten;
}
`;

export default fragmentShader;
