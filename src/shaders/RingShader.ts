/**
 * RingShader.ts
 * GPU Vertex and Fragment shaders for planetary ring systems (Saturn, Uranus).
 * Models optical depth variations, Cassini division, and double-sided solar illumination.
 */

export const RingVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const RingFragmentShader = /* glsl */ `
  uniform vec3 uSunPosition;
  uniform vec3 uRingColor;
  uniform float uOpacity;
  uniform int uRingType; // 0=Saturn, 1=Uranus

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    // Distance from center of disc in UV space
    vec2 centered = vUv - vec2(0.5);
    float r = length(centered) * 2.0; // [0 at center, 1 at outer edge]

    if (r < 0.42 || r > 0.98) {
      discard; // Ring inner and outer cutoffs
    }

    float ringAlpha = 0.0;
    vec3 ringColor = uRingColor;

    // ── 0: SATURN RING BANDS ──
    if (uRingType == 0) {
      // C Ring (0.42 to 0.58) - Faint translucent inner ring
      if (r >= 0.42 && r < 0.58) {
        float t = (r - 0.42) / 0.16;
        ringAlpha = 0.35 * smoothstep(0.0, 0.2, t) * (1.0 - smoothstep(0.8, 1.0, t));
        ringColor *= 0.85;
      }
      // B Ring (0.58 to 0.78) - Densest, most reflective main ring
      else if (r >= 0.58 && r < 0.78) {
        float t = (r - 0.58) / 0.20;
        ringAlpha = 0.88 + 0.10 * sin(t * 45.0);
        ringColor = mix(uRingColor, vec3(0.96, 0.90, 0.82), 0.35);
      }
      // Cassini Division (0.78 to 0.82) - Dark gap
      else if (r >= 0.78 && r < 0.82) {
        ringAlpha = 0.08; // Very sparse particle population
      }
      // A Ring (0.82 to 0.98) - Moderate density outer ring with Encke gap
      else if (r >= 0.82 && r <= 0.98) {
        float t = (r - 0.82) / 0.16;
        ringAlpha = 0.65 + 0.12 * sin(t * 30.0);
        // Encke Gap at ~0.94
        if (abs(r - 0.94) < 0.008) {
          ringAlpha = 0.05;
        }
      }
    }
    // ── 1: URANUS RING BANDS ──
    else {
      // Faint narrow dark dusty ringlets
      ringAlpha = 0.25 * pow(sin(r * 60.0), 4.0);
    }

    // Solar lighting
    vec3 L = normalize(uSunPosition - vWorldPosition);
    float NdotL = abs(dot(normalize(vNormal), L)); // Double sided illumination
    float lightFactor = clamp(NdotL * 0.75 + 0.35, 0.2, 1.0);

    gl_FragColor = vec4(ringColor * lightFactor, ringAlpha * uOpacity);
  }
`;
