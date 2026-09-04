/**
 * NebulaShader.ts
 * Custom GLSL shaders for procedural volumetric nebulae.
 * Implements layered noise turbulence, ionization boundaries, and spectral color blending.
 */

export const NebulaVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aDensity;
  attribute vec3 aColorPrimary;
  attribute vec3 aColorSecondary;
  attribute float aNebulaType; // 0=Emission, 1=Reflection, 2=Dark, 3=StarForming
  attribute float aSeed;

  varying vec3 vColorPrimary;
  varying vec3 vColorSecondary;
  varying float vDensity;
  varying float vNebulaType;
  varying float vSeed;

  uniform float uTime;

  void main() {
    vColorPrimary = aColorPrimary;
    vColorSecondary = aColorSecondary;
    vDensity = aDensity;
    vNebulaType = aNebulaType;
    vSeed = aSeed;

    // Subtle cosmic turbulence displacement
    vec3 displaced = position;
    float wave = sin(uTime * 0.05 + aSeed * 6.28) * 4.0;
    displaced += normal * wave;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_PointSize = aSize * (700.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 5.0, 320.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const NebulaFragmentShader = /* glsl */ `
  varying vec3 vColorPrimary;
  varying vec3 vColorSecondary;
  varying float vDensity;
  varying float vNebulaType;
  varying float vSeed;

  uniform float uOpacityFactor;
  uniform float uTime;

  // 2D Simplex-like hash for fast procedural variation
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 3; ++i) {
      v += a * noise2D(p);
      p = rot * p * 2.0 + vec2(100.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Compute internal filamentary noise structure
    vec2 noiseCoord = uv * 4.0 + vec2(vSeed * 7.13, uTime * 0.01);
    float n = fbm(noiseCoord) * 0.5 + 0.5;

    // Organic radial falloff modified by internal filament turbulence
    float falloff = exp(-dist * dist * 9.0);
    float alpha = falloff * (0.6 + 0.8 * n) * vDensity * uOpacityFactor;

    // Blend between ionization/reflection spectrum layers
    float colorMix = smoothstep(0.1, 0.45, dist + n * 0.2);
    vec3 finalColor = mix(vColorPrimary, vColorSecondary, colorMix);

    // Boost hot core brightness for emission and star-forming types
    if (vNebulaType > 2.5 || vNebulaType < 0.5) {
      float coreGlow = exp(-dist * dist * 24.0);
      finalColor += vec3(0.2, 0.15, 0.1) * coreGlow;
    }

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
