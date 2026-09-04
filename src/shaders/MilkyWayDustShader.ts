/**
 * MilkyWayDustShader.ts
 * GPU Vertex and Fragment shaders for interstellar dark absorption dust lanes.
 */

export const MilkyWayDustVertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aOpacity;

  uniform float uTime;
  uniform float uRotationSpeed;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vColor = aColor;
    vOpacity = aOpacity;

    float r = length(position.xz);
    float angle = atan(position.z, position.x);
    float omega = (uRotationSpeed * 0.95) / sqrt(r * r + 150.0);
    float curAngle = angle + omega * uTime;

    vec3 rotatedPos = vec3(
      r * cos(curAngle),
      position.y,
      r * sin(curAngle)
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = -mvPosition.z;
    float pointScale = 260.0 / max(1.0, dist);
    gl_PointSize = clamp(aSize * pointScale, 2.0, 96.0);
  }
`;

export const MilkyWayDustFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distSq = dot(coord, coord);

    if (distSq > 0.25) {
      discard;
    }

    float dist = sqrt(distSq) * 2.0;
    // Ultra soft dust cloud puff
    float alpha = exp(-dist * dist * 2.2) * vOpacity;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
