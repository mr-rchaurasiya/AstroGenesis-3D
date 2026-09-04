/**
 * GalaxyCoreShader.ts
 * Custom GLSL shaders for the high-density galactic central core / supermassive bulge glow.
 * Renders smooth spherical light concentration without harsh planar artifacts.
 */

export const GalaxyCoreVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const GalaxyCoreFragmentShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  uniform vec3 uCoreColor;
  uniform float uCoreIntensity;

  void main() {
    // Soft radial core falloff: intense center smoothly fading to halo boundary
    float viewAngle = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float intensity = pow(viewAngle, 2.5) * uCoreIntensity;

    gl_FragColor = vec4(uCoreColor, intensity * 0.4);
  }
`;
