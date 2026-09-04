/**
 * MilkyWayShader.ts
 * GPU Vertex and Fragment shaders for the Milky Way stellar population.
 * Implements smooth differential rotation, distance attenuation, and stellar population color balance.
 */

export const MilkyWayVertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aOpacity;
  attribute float aType; // 0=Bulge, 1=Bar, 2=ThinDisk, 3=ThickDisk, 4=SpiralArm, 5=Halo, 6=GlobularCluster
  attribute float aOrbitalDist;
  attribute float aAngle;

  uniform float uTime;
  uniform float uRotationSpeed;
  uniform float uBrightness;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vType;

  void main() {
    vColor = aColor;
    vOpacity = aOpacity;
    vType = aType;

    // Differential galactic rotation curve: omega(r) = v0 / sqrt(r^2 + rc^2)
    // Inner bar/bulge rotates quasi-rigidly; outer arms follow flat rotation curve
    float coreRadius = 12.0;
    float omega = uRotationSpeed / sqrt(aOrbitalDist * aOrbitalDist + coreRadius * coreRadius);

    // Halo and globular clusters orbit more slowly / isotropically
    if (aType > 4.5) {
      omega *= 0.25;
    }

    float currentAngle = aAngle + omega * uTime;
    float origY = position.y;

    vec3 transformedPos = vec3(
      aOrbitalDist * cos(currentAngle),
      origY,
      aOrbitalDist * sin(currentAngle)
    );

    vec4 mvPosition = modelViewMatrix * vec4(transformedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Distance attenuation
    float dist = -mvPosition.z;
    float pointScale = 280.0 / max(1.0, dist);

    // Dynamic stellar twinkle for active OB associations (Type 4)
    float twinkle = 1.0;
    if (aType > 3.5 && aType < 4.5) {
      twinkle = 0.85 + 0.30 * sin(uTime * 3.0 + aAngle * 10.0);
    }

    gl_PointSize = clamp(aSize * pointScale * twinkle, 1.0, 48.0);
  }
`;

export const MilkyWayFragmentShader = /* glsl */ `
  uniform float uBrightness;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vType;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distSq = dot(coord, coord);

    if (distSq > 0.25) {
      discard;
    }

    // Soft Gaussian-like stellar radiance
    float dist = sqrt(distSq) * 2.0; // 0.0 at center, 1.0 at edge
    float coreGlow = exp(-dist * dist * 3.5);
    float outerHalo = exp(-dist * 2.0) * 0.4;
    float radialAlpha = coreGlow + outerHalo;

    // Population specific color boost
    vec3 finalColor = vColor;
    if (vType > 3.5 && vType < 4.5) {
      // OB starburst regions: crisp bright core
      finalColor = mix(vColor, vec3(1.0), 0.25 * coreGlow);
    }

    gl_FragColor = vec4(finalColor * uBrightness, vOpacity * radialAlpha);
  }
`;
