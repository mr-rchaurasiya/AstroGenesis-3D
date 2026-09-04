/**
 * DistantGalaxyShader.ts
 * Custom GLSL shaders for distant background galaxies (elliptical, spiral, irregular).
 * Creates realistic core-to-halo brightness profiles, disk inclination, and subtle color grading.
 */

export const DistantGalaxyVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aMorphology; // 0=Elliptical, 1=Spiral, 2=Irregular
  attribute vec3 aColorCore;
  attribute vec3 aColorArm;
  attribute float aAngle;
  attribute float aTilt;

  varying vec3 vColorCore;
  varying vec3 vColorArm;
  varying float vMorphology;
  varying float vAngle;
  varying float vTilt;

  void main() {
    vColorCore = aColorCore;
    vColorArm = aColorArm;
    vMorphology = aMorphology;
    vAngle = aAngle;
    vTilt = aTilt;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (600.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 3.0, 48.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const DistantGalaxyFragmentShader = /* glsl */ `
  varying vec3 vColorCore;
  varying vec3 vColorArm;
  varying float vMorphology;
  varying float vAngle;
  varying float vTilt;

  uniform float uBrightness;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);

    // Rotate and apply inclination tilt
    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 rot = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
    rot.y /= max(0.25, cos(vTilt)); // Inclination flattening

    float dist = length(rot);
    if (dist > 0.5) discard;

    // De Vaucouleurs profile approximation (r^1/4 law for core)
    float coreProfile = exp(-pow(dist * 6.0, 0.7));
    float diskProfile = exp(-dist * 5.0);

    float alpha = 0.0;
    vec3 col = vColorCore;

    if (vMorphology < 0.5) {
      // Elliptical galaxy: smooth de Vaucouleurs profile, warm yellow-white core
      alpha = coreProfile * 0.9 * uBrightness;
      col = mix(vColorCore, vColorArm, dist * 2.0);
    } else if (vMorphology < 1.5) {
      // Spiral galaxy: bright bulge + cooler outer disk
      float spiralArmHint = 1.0 + 0.3 * sin(atan(rot.y, rot.x) * 2.0 - dist * 12.0);
      alpha = (coreProfile * 0.7 + diskProfile * 0.5 * spiralArmHint) * uBrightness;
      col = mix(vColorCore, vColorArm, smoothstep(0.08, 0.4, dist));
    } else {
      // Irregular dwarf galaxy: asymmetrical clumpy profile
      float clump = sin(rot.x * 15.0) * cos(rot.y * 15.0) * 0.25;
      alpha = diskProfile * (0.8 + clump) * uBrightness;
      col = mix(vColorCore, vColorArm, dist * 1.5);
    }

    gl_FragColor = vec4(col, alpha);
  }
`;
