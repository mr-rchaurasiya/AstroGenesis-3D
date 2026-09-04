/**
 * DustShader.ts
 * Custom GLSL shaders for rendering soft, volumetric-looking interstellar cosmic dust.
 * Employs procedural turbulence, soft radial Gaussian falloffs, and subtle light absorption.
 */

export const DustVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aOpacity;
  attribute vec3 aColor;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vSeed;

  uniform float uTime;

  void main() {
    vColor = aColor;
    vOpacity = aOpacity;
    vSeed = aSeed;

    // Extremely subtle dust drifting across deep time
    vec3 displaced = position;
    displaced.x += sin(uTime * 0.02 + aSeed * 10.0) * 2.0;
    displaced.y += cos(uTime * 0.015 + aSeed * 8.0) * 1.5;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_PointSize = aSize * (500.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 160.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const DustFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vSeed;

  uniform float uDensityScale;

  void main() {
    // Soft radial falloff for particle cloud
    vec2 centerCoord = gl_PointCoord - vec2(0.5);
    float dist = length(centerCoord);
    if (dist > 0.5) discard;

    // Soft Gaussian density core with feathered edges
    float alpha = exp(-dist * dist * 10.0) * vOpacity * uDensityScale;

    // Micro-texture variation to break artificial uniformity
    float angle = atan(centerCoord.y, centerCoord.x);
    float perturb = 1.0 + 0.15 * sin(angle * 3.0 + vSeed * 20.0);
    alpha *= perturb;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
