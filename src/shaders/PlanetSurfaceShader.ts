/**
 * PlanetSurfaceShader.ts
 * Procedural surface shader for the 8 major planets, major moons, and dwarf planets.
 * Implements physically accurate solar point-light illumination and day/night terminators.
 */

export const PlanetVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    vec4 mvPosition = viewMatrix * worldPos;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const PlanetFragmentShader = /* glsl */ `
  uniform int uShaderId; // 0=Mercury, 1=Venus, 2=Earth, 3=Mars, 4=Jupiter, 5=Saturn, 6=Uranus, 7=Neptune, 8=Moon/Rocky, 9=Io, 10=Europa, 11=Titan
  uniform vec3 uSunPosition; // World coordinates of the Sun (usually [0,0,0])
  uniform float uTime;
  uniform vec3 uBaseColor;

  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying vec3 vViewPosition;

  // Simple procedural noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; ++i) {
      v += a * noise2D(p);
      p = rot * p * 2.0 + vec2(100.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunPosition - vWorldPosition); // Sun direction
    vec3 V = normalize(vViewPosition);

    // Solar point-light diffuse term (Day/Night terminator)
    float NdotL = dot(N, L);
    float diffuse = clamp(NdotL, 0.0, 1.0);
    // Smooth terminator transition
    diffuse = smoothstep(-0.05, 0.35, NdotL);

    // Deep-space ambient starlight visibility
    float ambient = 0.32;

    vec3 surfaceColor = uBaseColor;
    float lat = vUv.y * 2.0 - 1.0; // [-1 at south pole, +1 at north pole]
    float lon = vUv.x * 2.0 * 3.14159265;

    // ── 0: MERCURY ──
    if (uShaderId == 0) {
      float n = fbm(vUv * 32.0);
      float craters = pow(fbm(vUv * 64.0), 2.2);
      surfaceColor = mix(vec3(0.48, 0.45, 0.42), vec3(0.68, 0.65, 0.60), n);
      surfaceColor = mix(surfaceColor, vec3(0.28, 0.26, 0.25), craters * 0.7);
    }
    // ── 1: VENUS ──
    else if (uShaderId == 1) {
      float bands = sin(lat * 14.0 + fbm(vec2(vUv.x * 4.0 - uTime * 0.02, vUv.y * 8.0)) * 2.5);
      surfaceColor = mix(vec3(0.88, 0.78, 0.52), vec3(0.96, 0.90, 0.72), bands * 0.5 + 0.5);
    }
    // ── 2: EARTH ──
    else if (uShaderId == 2) {
      float continents = fbm(vec2(vUv.x * 6.0, vUv.y * 3.0));
      vec3 ocean = vec3(0.04, 0.18, 0.55);
      vec3 land = mix(vec3(0.18, 0.45, 0.15), vec3(0.55, 0.48, 0.28), fbm(vUv * 12.0));
      vec3 ice = vec3(0.92, 0.95, 1.0);

      if (continents > 0.48) {
        surfaceColor = land;
      } else {
        surfaceColor = ocean;
      }

      // Polar ice caps
      if (abs(lat) > 0.82) {
        float iceCover = smoothstep(0.80, 0.92, abs(lat) + (fbm(vUv * 8.0) - 0.5) * 0.12);
        surfaceColor = mix(surfaceColor, ice, iceCover);
      }
    }
    // ── 3: MARS ──
    else if (uShaderId == 3) {
      float n = fbm(vUv * 16.0);
      vec3 redSoil = vec3(0.78, 0.32, 0.12);
      vec3 darkRock = vec3(0.35, 0.18, 0.10);
      surfaceColor = mix(redSoil, darkRock, smoothstep(0.42, 0.65, n));

      // Polar ice caps
      if (abs(lat) > 0.88) {
        surfaceColor = mix(surfaceColor, vec3(0.95, 0.95, 0.95), smoothstep(0.86, 0.92, abs(lat)));
      }
    }
    // ── 4: JUPITER ──
    else if (uShaderId == 4) {
      float bandNoise = fbm(vec2(vUv.x * 12.0 + uTime * 0.015, vUv.y * 30.0));
      float bands = sin(lat * 38.0 + bandNoise * 3.0);

      vec3 darkBelt = vec3(0.58, 0.32, 0.16);
      vec3 lightZone = vec3(0.85, 0.72, 0.52);
      vec3 whiteAmmonia = vec3(0.95, 0.90, 0.82);

      surfaceColor = mix(darkBelt, lightZone, bands * 0.5 + 0.5);
      surfaceColor = mix(surfaceColor, whiteAmmonia, pow(bandNoise, 3.0) * 0.4);

      // Great Red Spot (approx lat = -0.38, lon = 0.42)
      vec2 grsCenter = vec2(0.42, 0.31);
      vec2 grsDist = (vUv - grsCenter) * vec2(2.5, 5.0);
      if (length(grsDist) < 0.12) {
        float spotFactor = 1.0 - smoothstep(0.04, 0.12, length(grsDist));
        surfaceColor = mix(surfaceColor, vec3(0.82, 0.24, 0.12), spotFactor * 0.9);
      }
    }
    // ── 5: SATURN ──
    else if (uShaderId == 5) {
      float bands = sin(lat * 32.0 + fbm(vec2(vUv.x * 6.0, vUv.y * 20.0)) * 1.5);
      surfaceColor = mix(vec3(0.78, 0.64, 0.40), vec3(0.92, 0.82, 0.60), bands * 0.5 + 0.5);
    }
    // ── 6: URANUS ──
    else if (uShaderId == 6) {
      float subtle = sin(lat * 12.0) * 0.06;
      surfaceColor = vec3(0.42, 0.78, 0.85) + subtle;
    }
    // ── 7: NEPTUNE ──
    else if (uShaderId == 7) {
      float n = fbm(vec2(vUv.x * 10.0 + uTime * 0.02, vUv.y * 18.0));
      vec3 deepBlue = vec3(0.12, 0.25, 0.65);
      vec3 azure = vec3(0.22, 0.48, 0.92);
      vec3 cirrus = vec3(0.75, 0.88, 1.0);
      surfaceColor = mix(deepBlue, azure, n);
      surfaceColor = mix(surfaceColor, cirrus, pow(n, 4.0) * 0.5);
    }
    // ── 8: MOON / ROCKY ──
    else if (uShaderId == 8) {
      float n = fbm(vUv * 24.0);
      float maria = smoothstep(0.45, 0.58, fbm(vUv * 6.0));
      vec3 highlands = vec3(0.68, 0.65, 0.62);
      vec3 basaltMaria = vec3(0.32, 0.30, 0.28);
      surfaceColor = mix(highlands, basaltMaria, maria);
      surfaceColor *= (0.8 + 0.4 * n);
    }
    // ── 9: IO (Sulfur Volcanoes) ──
    else if (uShaderId == 9) {
      float n = fbm(vUv * 20.0);
      surfaceColor = mix(vec3(0.88, 0.72, 0.12), vec3(0.95, 0.35, 0.05), n);
    }
    // ── 10: EUROPA (Icy Linia) ──
    else if (uShaderId == 10) {
      float lines = pow(fbm(vUv * 40.0), 1.5);
      surfaceColor = mix(vec3(0.92, 0.88, 0.82), vec3(0.55, 0.35, 0.25), lines * 0.6);
    }
    // ── 11: TITAN (Orange Haze) ──
    else if (uShaderId == 11) {
      surfaceColor = vec3(0.89, 0.58, 0.18);
    }

    // Final Lighting Composition
    vec3 finalColor = surfaceColor * (diffuse + ambient);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
