/**
 * Memory Manager & Resource Disposal Subsystem
 * Phase 12 - Performance, Polish & Production Hardening
 */

import * as THREE from 'three';

export interface MemoryStats {
  geometriesDisposed: number;
  materialsDisposed: number;
  texturesDisposed: number;
}

export class MemoryManager {
  private stats: MemoryStats = {
    geometriesDisposed: 0,
    materialsDisposed: 0,
    texturesDisposed: 0,
  };

  public getStats(): MemoryStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = {
      geometriesDisposed: 0,
      materialsDisposed: 0,
      texturesDisposed: 0,
    };
  }

  /**
   * Safely and recursively traverses an Object3D hierarchy and disposes of all geometries,
   * materials, and textures attached to its descendants.
   */
  public disposeHierarchy(root: THREE.Object3D | null | undefined): void {
    if (!root) return;

    root.traverse((child) => {
      if ('geometry' in child) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
          this.stats.geometriesDisposed++;
        }
      }

      if ('material' in child) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => this.disposeMaterial(mat));
        } else if (mesh.material) {
          this.disposeMaterial(mesh.material);
        }
      }
    });
  }

  /**
   * Disposes of a material and any attached textures in its uniform properties.
   */
  public disposeMaterial(material: THREE.Material): void {
    if (!material) return;

    // Dispose texture maps on standard/basic/shader materials if present
    const matRecord = material as unknown as Record<string, unknown>;
    for (const key of Object.keys(matRecord)) {
      const prop = matRecord[key];
      if (prop && typeof prop === 'object' && 'isTexture' in prop && (prop as THREE.Texture).isTexture) {
        (prop as THREE.Texture).dispose();
        this.stats.texturesDisposed++;
      }
    }

    material.dispose();
    this.stats.materialsDisposed++;
  }

  /**
   * Disposes of a standalone Three.js texture.
   */
  public disposeTexture(texture: THREE.Texture | null | undefined): void {
    if (!texture) return;
    texture.dispose();
    this.stats.texturesDisposed++;
  }
}

export const globalMemoryManager = new MemoryManager();
