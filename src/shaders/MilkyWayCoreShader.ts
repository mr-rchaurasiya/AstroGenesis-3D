/**
 * MilkyWayCoreShader.ts
 * GPU Vertex and Fragment shaders for the supermassive Galactic Center bulge glow.
 */

export const MilkyWayCoreVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const MilkyWayCoreFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel-like limb darkening/brightening for volumetric bulge appearance
    float fresnel = 1.0 - abs(dot(normal, viewDir));
    float radial = exp(-fresnel * 1.8);

    vec3 glowColor = uColor * uIntensity * radial;
    float alpha = clamp(radial * 0.85, 0.0, 1.0);

    gl_FragColor = vec4(glowColor, alpha);
  }
`;
