/**
 * GalaxyShader.ts
 * High performance GLSL shaders for rendering procedural galaxy stellar populations.
 * Features differential rotation, temperature color grading, and Gaussian core disc rendering.
 */

export const GalaxyVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aOpacity;
  attribute float aType; // 0=Bulge, 1=Disk, 2=Arm, 3=Halo
  attribute float aOrbitalDist;
  attribute float aAngle;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vType;

  uniform float uTime;
  uniform float uRotationSpeed;
  uniform float uBrightness;

  void main() {
    vColor = aColor;
    vOpacity = aOpacity * uBrightness;
    vType = aType;

    // Differential Keplerian / Flat rotation curve:
    // Inner core rotates like solid body, outer disk follows flat rotation curve v ≈ const
    float r = max(0.5, aOrbitalDist);
    float angularVel = (uRotationSpeed * 0.15) / (1.0 + r * 0.08);
    float currentAngle = aAngle + uTime * angularVel;

    // Rotate point in local orbital plane (XZ)
    vec3 animatedPos = position;
    if (aType < 2.5) { // Bulge, Disk, Arms rotate smoothly
      float origR = length(position.xz);
      if (origR > 0.1) {
        animatedPos.x = origR * cos(currentAngle);
        animatedPos.z = origR * sin(currentAngle);
      }
    }

    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
    
    // Attenuation with distance
    gl_PointSize = aSize * (350.0 / -mvPosition.z);
    
    // Size clamping per population type
    if (aType > 1.5 && aType < 2.5) {
      gl_PointSize = clamp(gl_PointSize, 1.0, 10.0); // Bright young arm stars
    } else if (aType < 0.5) {
      gl_PointSize = clamp(gl_PointSize, 0.8, 8.0);  // Dense bulge stars
    } else {
      gl_PointSize = clamp(gl_PointSize, 0.5, 5.0);  // Disk & Halo
    }

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const GalaxyFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vType;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft Gaussian core with delicate halo
    float core = exp(-dist * dist * 16.0);
    float halo = exp(-dist * 6.0) * 0.35;
    float intensity = core + halo;

    // Bright OB association stars in spiral arms have crisp bright centers
    if (vType > 1.5 && vType < 2.5) {
      intensity = exp(-dist * dist * 12.0) + exp(-dist * 4.0) * 0.45;
    }

    float alpha = intensity * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
