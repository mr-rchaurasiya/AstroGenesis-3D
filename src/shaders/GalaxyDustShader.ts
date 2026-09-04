/**
 * GalaxyDustShader.ts
 * Custom GLSL shaders for interstellar dust lanes in galactic disks.
 * Implements soft absorbing clouds that trace spiral arms and the galactic plane.
 */

export const GalaxyDustVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aOpacity;
  attribute float aOrbitalDist;
  attribute float aAngle;

  varying vec3 vColor;
  varying float vOpacity;

  uniform float uTime;
  uniform float uRotationSpeed;

  void main() {
    vColor = aColor;
    vOpacity = aOpacity;

    // Follow galactic orbital rotation
    float r = max(1.0, aOrbitalDist);
    float angularVel = (uRotationSpeed * 0.15) / (1.0 + r * 0.08);
    float currentAngle = aAngle + uTime * angularVel;

    vec3 animatedPos = position;
    float origR = length(position.xz);
    if (origR > 0.1) {
      animatedPos.x = origR * cos(currentAngle);
      animatedPos.z = origR * sin(currentAngle);
    }

    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
    gl_PointSize = aSize * (450.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 48.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const GalaxyDustFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;

  uniform float uAbsorptionFactor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft feathered extinction cloud
    float falloff = exp(-dist * dist * 8.0);
    float alpha = falloff * vOpacity * uAbsorptionFactor;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
