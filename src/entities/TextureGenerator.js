import * as THREE from 'three';

/**
 * TextureGenerator - Ultra Gerçekçi, PBR Uyumlu, Bellek Önbellekli Doku Üreticisi
 * Mount & Blade / Kingdom Come tarzı gerçekçi taş, çimen, ahşap, sıva, kiremit ve çelik dokuları üretir.
 */
export class TextureGenerator {
  static cache = {};

  // 1. Gerçekçi Çimen, Toprak ve Yabani Ot Dokusu
  static createGrassTexture() {
    if (this.cache.grass) return this.cache.grass;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Zengin Zemin Gradyanı (Koyu Orman Yeşili & Nemli Toprak)
    const grad = ctx.createRadialGradient(512, 512, 50, 512, 512, 600);
    grad.addColorStop(0, '#385324');
    grad.addColorStop(0.5, '#2e451d');
    grad.addColorStop(1, '#223315');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Toprak ve Çamur Lekeleri
    for (let i = 0; i < 120; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const r = 20 + Math.random() * 60;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(54, 41, 26, 0.45)' : 'rgba(38, 48, 22, 0.4)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // İnce Çim Kılları ve Yosun Detayları
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const length = 4 + Math.random() * 8;
      const angle = Math.random() * Math.PI;

      ctx.strokeStyle = Math.random() > 0.6 ? '#628e36' : (Math.random() > 0.3 ? '#496c27' : '#2b3f16');
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Yabani Sarı Papatyalar ve Beyaz Kır Çiçekleri
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      ctx.fillStyle = Math.random() > 0.4 ? '#f0e6c2' : '#e0b830';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(24, 24);
    this.cache.grass = texture;
    return texture;
  }

  // 1B. Bozkır Çimeni Dokusu
  static createSteppeGrassBladeTexture() {
    if (this.cache.steppeGrassBlade) return this.cache.steppeGrassBlade;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 512);

    const bladeColors = ['#c8ae64', '#ba994d', '#8f7e3d', '#617036', '#495625'];
    for (let b = 0; b < 32; b++) {
      const startX = 128 + (Math.random() - 0.5) * 80;
      const endX = startX + (Math.random() - 0.5) * 110;
      const endY = 50 + Math.random() * 160;

      ctx.strokeStyle = bladeColors[b % bladeColors.length];
      ctx.lineWidth = 3.5 - (b * 0.07);
      ctx.beginPath();
      ctx.moveTo(startX, 510);
      ctx.quadraticCurveTo(startX + (Math.random() - 0.5) * 50, 300, endX, endY);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.steppeGrassBlade = texture;
    return texture;
  }

  // 1C. Çim Normal Haritası
  static createGrassNormalMap() {
    if (this.cache.grassNormal) return this.cache.grassNormal;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const dx = (Math.random() - 0.5) * 35;
      const dy = (Math.random() - 0.5) * 35;
      ctx.fillStyle = `rgb(${128 + dx}, ${128 + dy}, 255)`;
      ctx.fillRect(x, y, 3, 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(24, 24);
    this.cache.grassNormal = texture;
    return texture;
  }

  // 2. Gerçekçi Köy Meydanı Arnavut Kaldırımı (Cobblestone Square & Paths)
  static createPathTexture() {
    if (this.cache.path) return this.cache.path;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Koyu harç / derz zemini
    ctx.fillStyle = '#2b2620';
    ctx.fillRect(0, 0, 1024, 1024);

    const rows = 24;
    const cols = 24;
    const cellW = 1024 / cols;
    const cellH = 1024 / rows;

    for (let r = 0; r < rows; r++) {
      const rowOffset = (r % 2 === 0) ? cellW * 0.5 : 0;
      for (let c = -1; c <= cols; c++) {
        const x = c * cellW + rowOffset + (Math.random() - 0.5) * 4;
        const y = r * cellH + (Math.random() - 0.5) * 4;
        const stoneW = cellW - 6 - Math.random() * 4;
        const stoneH = cellH - 6 - Math.random() * 4;

        // Taş renk varyasyonları (Doğal açık kireçtaşı, sıcak bej, granit)
        const tone = 150 + Math.floor(Math.random() * 55);
        const rVal = tone + 10;
        const gVal = tone;
        const bVal = tone - 15;

        // 3D Taş Kabartma Gradyanı
        const stoneGrad = ctx.createLinearGradient(x, y, x + stoneW, y + stoneH);
        stoneGrad.addColorStop(0, `rgb(${rVal + 25}, ${gVal + 25}, ${bVal + 20})`);
        stoneGrad.addColorStop(0.7, `rgb(${rVal}, ${gVal}, ${bVal})`);
        stoneGrad.addColorStop(1, `rgb(${rVal - 40}, ${gVal - 40}, ${bVal - 35})`);
        ctx.fillStyle = stoneGrad;

        ctx.beginPath();
        ctx.roundRect(x, y, stoneW, stoneH, 5);
        ctx.fill();

        // Taş Yüzeyi Pürüzleri ve Çatlaklar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let p = 0; p < 8; p++) {
          ctx.fillRect(x + Math.random() * stoneW, y + Math.random() * stoneH, 2, 2);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 8);
    this.cache.path = texture;
    return texture;
  }

  // 3. Safranbolu Evleri Kerpiç / Kireç Sıva Dokusu
  static createHousePlasterTexture() {
    if (this.cache.plaster) return this.cache.plaster;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sıcak Kireç Sıva Gradyanı
    ctx.fillStyle = '#ebe2d0';
    ctx.fillRect(0, 0, 512, 512);

    // Sıva pürüzleri ve eskitme lekeleri
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(205, 190, 170, 0.4)' : 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(x, y, 3, 3);
    }

    // Su akıntısı ve yağmur izleri
    for (let i = 0; i < 25; i++) {
      const sx = Math.random() * 512;
      const len = 40 + Math.random() * 120;
      const grad = ctx.createLinearGradient(sx, 0, sx, len);
      grad.addColorStop(0, 'rgba(120, 100, 80, 0.25)');
      grad.addColorStop(1, 'rgba(120, 100, 80, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sx, 0, 6 + Math.random() * 10, len);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.plaster = texture;
    return texture;
  }

  // 4. Alaturka Oluklu Kiremit Çatı Dokusu
  static createRoofTileTexture() {
    if (this.cache.roof) return this.cache.roof;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#6e2316';
    ctx.fillRect(0, 0, 512, 512);

    const tileW = 32;
    for (let x = 0; x < 512; x += tileW) {
      // Oluklu Kiremit 3D Gölgelendirme Gradyanı
      const grad = ctx.createLinearGradient(x, 0, x + tileW, 0);
      grad.addColorStop(0, '#3d1209');
      grad.addColorStop(0.3, '#9c3826');
      grad.addColorStop(0.6, '#b84732');
      grad.addColorStop(0.9, '#7a2517');
      grad.addColorStop(1, '#350f08');

      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, tileW, 512);

      // Kiremit bindirme yatay çizgileri
      for (let y = 0; y < 512; y += 36) {
        ctx.fillStyle = 'rgba(15, 4, 2, 0.65)';
        ctx.fillRect(x, y, tileW, 4);
        ctx.fillStyle = 'rgba(235, 135, 105, 0.35)';
        ctx.fillRect(x, y + 4, tileW, 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.roof = texture;
    return texture;
  }

  // 5. Tarihi Osmanlı Kesme Taş Surlar ve Mescid Duvarı Dokusu
  static createStoneWallTexture() {
    if (this.cache.stone) return this.cache.stone;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a3834';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 12;
    const cols = 6;
    const blockH = 512 / rows;
    const blockW = 512 / cols;

    for (let r = 0; r < rows; r++) {
      const offset = (r % 2 === 0) ? blockW * 0.5 : 0;
      for (let c = -1; c <= cols; c++) {
        const x = c * blockW + offset + 2;
        const y = r * blockH + 2;
        const w = blockW - 4;
        const h = blockH - 4;

        const baseVal = 130 + Math.floor(Math.random() * 45);
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, `rgb(${baseVal + 15}, ${baseVal + 12}, ${baseVal + 8})`);
        grad.addColorStop(1, `rgb(${baseVal - 25}, ${baseVal - 27}, ${baseVal - 30})`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);

        // Taş yüzeyi çatlak ve eskitme
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let p = 0; p < 12; p++) {
          ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 3, 2);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.stone = texture;
    return texture;
  }

  // 6. Eskitilmiş Meşe Ahşap Dokusu (Kirişler, Kapılar, Tezgahlar)
  static createWoodTexture() {
    if (this.cache.wood) return this.cache.wood;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#422814';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 4) {
      const shade = 50 + Math.floor(Math.random() * 35);
      ctx.fillStyle = `rgb(${shade + 25}, ${shade + 10}, ${shade - 10})`;
      ctx.fillRect(0, y, 512, 3);
    }

    // Ahşap Budakları ve Damarları
    for (let b = 0; b < 8; b++) {
      const bx = 50 + Math.random() * 400;
      const by = 40 + Math.random() * 420;
      ctx.strokeStyle = '#221207';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(bx, by, 35, 12, Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.wood = texture;
    return texture;
  }

  // 7. Şam Çeliği (Damascus Steel) Kılıç Namlusu Dokusu
  static createDamascusSteelTexture() {
    if (this.cache.damascus) return this.cache.damascus;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#78828c');
    grad.addColorStop(0.35, '#c0cdd6');
    grad.addColorStop(0.5, '#f4f8fb');
    grad.addColorStop(0.65, '#b0bdc8');
    grad.addColorStop(1, '#525a62');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Dalgalı Su ve Çelik Katman Desenleri
    for (let y = 0; y < 512; y += 4) {
      ctx.strokeStyle = (y % 8 === 0) ? 'rgba(25, 30, 35, 0.55)' : 'rgba(240, 245, 255, 0.35)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 256; x += 12) {
        const wave = Math.sin(x * 0.09 + y * 0.08) * 4.2;
        ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    // Keskin Bıçak Ağzı Işıltısı
    const edgeGrad = ctx.createLinearGradient(238, 0, 256, 0);
    edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    edgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(238, 0, 18, 512);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.damascus = texture;
    return texture;
  }
}
