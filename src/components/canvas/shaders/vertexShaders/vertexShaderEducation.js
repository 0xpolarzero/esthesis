const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uRadius;
uniform float uGain;

varying float vDistance;

vec3 oscillate(vec3 position, float time) {
  return vec3(position.x + sin(position.y + time), position.y, position.z);
}

void main() {
  float distanceFactor = pow(uRadius - distance(position, vec3(0.0)), 2.0);
  float size = distanceFactor * 10.0 + 10.0;

  vec3 particlePosition = oscillate(position, uTime * 0.2 * distanceFactor);

  vDistance = distanceFactor;

  vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = size * uGain;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
`;

export default vertexShader;
