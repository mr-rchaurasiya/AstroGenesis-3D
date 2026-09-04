/**
 * AtmosphereShader.ts
 * GPU Vertex and Fragment shaders for planetary atmospheric limb scattering (Fresnel Rayleigh effect).
 */

export const AtmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    vec4 mvPosition = viewMatrix * worldPos;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const AtmosphereFragmentShader = /* glsl */ `
  uniform vec3 uSunPosition;
  uniform vec3 uAtmosphereColor;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunPosition - vWorldPosition);
    vec3 V = normalize(vViewPosition);

    // Fresnel rim effect
    float viewDot = clamp(dot(normalize(vNormal), V), 0.0, 1.0);
    float rim = pow(1.0 - viewDot, 2.8);

    // Solar illumination factor (atmosphere glow on day side, fading into twilight)
    float sunDot = dot(N, L);
    float dayFactor = smoothstep(-0.25, 0.45, sunDot);

    float alpha = rim * dayFactor * uOpacity;
    vec3 color = uAtmosphereColor * (1.2 + rim * 0.8);

    gl_FragColor = vec4(color, alpha);
  }
`;
