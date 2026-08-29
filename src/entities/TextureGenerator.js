import * as THREE from 'three';

/**
 * TextureGenerator - Ultra Hızlı, Bellek Önbellekli (Cached) PBR Doku Üreticisi
 * Canvas operasyonlarını tek sefer üretir ve önbelleğe alır. WebGL donmasını %100 engeller.
 */
export class TextureGenerator {
  static cache = {};

  // 1. Zengin Çimen & Toprak Dokusu (Önbellekli)
  static createGrassTexture() {
    if (this.cache.grass) return this.cache.grass;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#314a21');
    grad.addColorStop(0.5, '#44652a');
    grad.addColorStop(1, '#293d1b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Doku varyasyon lekeleri
    for (let i = 0; i < 60; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const r = 10 + Math.random() * 30;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(58, 44, 26, 0.4)' : 'rgba(35, 52, 22, 0.35)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Çimen parçacıkları
    for (let i = 0; i < 2500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? '#5d8837' : '#2d431a';
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Yabani sarı ve beyaz çiçek noktacıkları
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.4 ? '#f5ebd0' : '#e5c038';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(32, 32);
    this.cache.grass = texture;
    return texture;
  }

  // 1B. Çim & Zemin Normal Haritası
  static createGrassNormalMap() {
    if (this.cache.grassNormal) return this.cache.grassNormal;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const dx = (Math.random() - 0.5) * 30;
      const dy = (Math.random() - 0.5) * 30;
      ctx.fillStyle = `rgb(${128 + dx}, ${128 + dy}, 255)`;
      ctx.fillRect(x, y, 3, 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(32, 32);
    this.cache.grassNormal = texture;
    return texture;
  }

  // 2. Taş & Çakıllı Köy Yolu Dokusu
  static createPathTexture() {
    if (this.cache.path) return this.cache.path;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#5c4e3d';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? '#483c2e' : '#6e5e4b';
      ctx.fillRect(x, y, 4, 4);
    }

    for (let i = 0; i < 180; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const rx = 6 + Math.random() * 10;
      const ry = 4 + Math.random() * 8;
      ctx.fillStyle = '#2b2318';
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      const stoneShade = 120 + Math.floor(Math.random() * 50);
      ctx.fillStyle = `rgb(${stoneShade}, ${stoneShade - 10}, ${stoneShade - 20})`;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 30);
    this.cache.path = texture;
    return texture;
  }

  // 3. Şam Çeliği (Damascus Steel) Kılıç Namlusu Dokusu
  static createDamascusSteelTexture() {
    if (this.cache.damascus) return this.cache.damascus;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#8d959c');
    grad.addColorStop(0.35, '#c8d0d6');
    grad.addColorStop(0.5, '#f0f3f6');
    grad.addColorStop(0.65, '#c0c8cf');
    grad.addColorStop(1, '#687077');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    for (let y = 0; y < 512; y += 6) {
      ctx.strokeStyle = (y % 12 === 0) ? 'rgba(30, 35, 40, 0.45)' : 'rgba(230, 240, 250, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 256; x += 16) {
        const wave = Math.sin(x * 0.08 + y * 0.1) * 3.5;
        ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    const edgeGrad = ctx.createLinearGradient(235, 0, 256, 0);
    edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    edgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(235, 0, 21, 512);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.damascus = texture;
    return texture;
  }

  // 4. Osmanlı Örme Zırh (Chainmail) Dokusu & Normal Haritası
  static createChainmailTexture() {
    if (this.cache.chainmail) return this.cache.chainmail;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#181b1e';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#a4abb3';
    ctx.lineWidth = 2.0;

    for (let y = 0; y < 128; y += 16) {
      const offsetX = (y % 32 === 0) ? 0 : 8;
      for (let x = offsetX; x < 128; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    this.cache.chainmail = texture;
    return texture;
  }

  static createChainmailNormalMap() {
    if (this.cache.chainmailNormal) return this.cache.chainmailNormal;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 128, 128);

    for (let y = 0; y < 128; y += 16) {
      const offsetX = (y % 32 === 0) ? 0 : 8;
      for (let x = offsetX; x < 128; x += 16) {
        ctx.strokeStyle = '#b0b0ff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    this.cache.chainmailNormal = texture;
    return texture;
  }

  // 5. Ahşap Kalas & Kütük Dokusu
  static createWoodTexture() {
    if (this.cache.wood) return this.cache.wood;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 8) {
      ctx.strokeStyle = (y % 16 === 0) ? '#382212' : '#6d4527';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 256; x += 20) {
        ctx.lineTo(x, y + Math.sin(x * 0.05) * 3);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.wood = texture;
    return texture;
  }

  static createWoodNormalMap() {
    if (this.cache.woodNormal) return this.cache.woodNormal;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 128, 128);

    for (let y = 0; y < 128; y += 12) {
      ctx.strokeStyle = '#a0a0ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.woodNormal = texture;
    return texture;
  }

  // 6. Taş Duvar & Hisar Duvarı Dokusu
  static createStoneWallTexture() {
    if (this.cache.stone) return this.cache.stone;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#615c54';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#2d2a26';
    ctx.lineWidth = 3.0;

    for (let row = 0; row < 256; row += 32) {
      ctx.beginPath();
      ctx.moveTo(0, row);
      ctx.lineTo(256, row);
      ctx.stroke();

      const offset = (row % 64 === 0) ? 0 : 32;
      for (let col = offset; col < 256; col += 64) {
        ctx.beginPath();
        ctx.moveTo(col, row);
        ctx.lineTo(col, row + 32);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.stone = texture;
    return texture;
  }

  static createStoneWallNormalMap() {
    if (this.cache.stoneNormal) return this.cache.stoneNormal;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#5050ff';
    ctx.lineWidth = 3.0;

    for (let row = 0; row < 128; row += 32) {
      ctx.beginPath();
      ctx.moveTo(0, row);
      ctx.lineTo(128, row);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.stoneNormal = texture;
    return texture;
  }

  // 7. Alaturka Kiremit Çatı Dokusu
  static createRoofTileTexture() {
    if (this.cache.roof) return this.cache.roof;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8a3324';
    ctx.fillRect(0, 0, 128, 128);

    for (let y = 0; y < 128; y += 16) {
      ctx.fillStyle = '#5c2218';
      ctx.fillRect(0, y, 128, 3);
      ctx.fillStyle = '#b34432';
      ctx.fillRect(0, y + 3, 128, 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.roof = texture;
    return texture;
  }

  // 8. Nehir Su Normal Haritası
  static createWaterNormalMap() {
    if (this.cache.waterNormal) return this.cache.waterNormal;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 128, 128);

    for (let y = 0; y < 128; y += 8) {
      ctx.strokeStyle = '#a0a0ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 128; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.1) * 3);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    this.cache.waterNormal = texture;
    return texture;
  }
}
