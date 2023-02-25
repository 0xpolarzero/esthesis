const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uRadius;
uniform float uGain;

varying float vDistance;

mat3 rotation3dZ(float angle) {
float s = sin(angle);
float c = cos(angle);
return mat3(
c, s, 0.0,
-s, c, 0.0,
0.0, 0.0, 1.0
);
}

void main() {
float distanceFactor = pow(uRadius - distance(position, vec3(0.0)), 2.0);
float size = distanceFactor * 10.0 + 10.0;

vec3 particlePosition = vec3(position.x * cos(uTime * 0.2 * distanceFactor), position.y * sin(uTime * 0.2 * distanceFactor), position.z);

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
