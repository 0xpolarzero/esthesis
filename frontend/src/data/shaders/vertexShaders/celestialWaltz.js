const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uGain;

varying float vDistance;

mat4 rotation4dX(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, c, -s, 0.0,
    0.0, s, c, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 rotation4dY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    c, 0.0, s, 0.0,
    0.0, 1.0, 0.0, 0.0,
    -s, 0.0, c, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 rotation4dZ(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    c, -s, 0.0, 0.0,
    s, c, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

void main() {
  vec3 particlePosition = position;
  particlePosition = vec3(rotation4dY(uTime * 0.3) * vec4(particlePosition, 1.0));
  particlePosition = vec3(rotation4dZ(uTime * 0.2) * vec4(particlePosition, 1.0));
  particlePosition = vec3(rotation4dX(uTime * 0.1) * vec4(particlePosition, 1.0));
  
  vDistance = distance(particlePosition, vec3(0.0));

  vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = 10.0 * (1.0 + sin(uTime + vDistance * 4.0)) * uGain;
  gl_PointSize *= (1.0 / - viewPosition.z);
}

`;

export default vertexShader;
