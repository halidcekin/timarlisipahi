import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * AssetLoader - 3D GLTF/GLB Model ve Animasyon Yöneticisi
 * Harici yüksek kaliteli .glb modellerini yükler, önbelleğe alır ve animasyonları yönetir.
 */
export class AssetLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * GLB / GLTF Model Yükle
   * @param {string} url - Model dosya yolu
   * @returns {Promise<THREE.Group>}
   */
  async loadModel(url) {
    if (this.cache.has(url)) {
      return this.cloneModel(this.cache.get(url));
    }

    if (this.loadingPromises.has(url)) {
      const gltf = await this.loadingPromises.get(url);
      return this.cloneModel(gltf);
    }

    const promise = new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          // PBR materyallerini ve gölgeleri ayarla
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.envMapIntensity = 1.2;
              }
            }
          });
          this.cache.set(url, gltf);
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.warn(`3D Model yüklenemedi: ${url}, prosedürel organik modele geçiliyor.`);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(url, promise);
    const gltf = await promise;
    return this.cloneModel(gltf);
  }

  cloneModel(gltf) {
    const clonedScene = gltf.scene.clone(true);
    return {
      scene: clonedScene,
      animations: gltf.animations || []
    };
  }
}

export const assetLoader = new AssetLoader();
