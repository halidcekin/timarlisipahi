import * as THREE from 'three';

/**
 * Engine - Mülk-i Osmanî: Tımarlı Sipahi 3D Gerçekçi PBR Aydınlatma & Render Motoru
 * - Mount & Blade II: Bannerlord Seviyesinde 24 Saatlik Sinematik Gökyüzü ve Işık Döngüsü
 * - 4K PCF Soft Shadows & ACES Filmic Tone Mapping
 */
export class Engine {
  constructor(canvas) {
    this.canvas = canvas || document.getElementById('webgl-canvas');
    this.width = window.innerWidth || 1280;
    this.height = window.innerHeight || 720;

    // 1. Sahne ve Atmosferik Ufuk Sisi
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7bb5e3);
    this.scene.fog = new THREE.FogExp2(0xcce2f0, 0.0032);

    // 2. Kamera
    this.camera = new THREE.PerspectiveCamera(62, this.width / this.height, 0.1, 1200);
    this.camera.position.set(0, 1.8, 15);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    this.renderer.setClearColor(0x7bb5e3, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    // 4. Işıklandırma & Atmosfer
    this.setupLighting();
    this.setupSkyAtmosphere();

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // 1. Doğal Ortam Işığı
    this.ambientLight = new THREE.AmbientLight(0xfff5e6, 0.95);
    this.scene.add(this.ambientLight);

    // 2. Yarımküre Işığı
    this.hemiLight = new THREE.HemisphereLight(0xdcebf8, 0x483a24, 1.15);
    this.hemiLight.position.set(0, 150, 0);
    this.scene.add(this.hemiLight);

    // 3. Ana Güneş Işığı
    this.sunLight = new THREE.DirectionalLight(0xfff0d4, 2.6);
    this.sunLight.position.set(110, 130, 80);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 4096;
    this.sunLight.shadow.mapSize.height = 4096;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 480;

    const d = 180;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);

    // 4. Ay Işığı (Gece devreye giren gümüşi ışık)
    this.moonLight = new THREE.DirectionalLight(0x8ba6c9, 0.0);
    this.moonLight.position.set(-110, 100, -80);
    this.scene.add(this.moonLight);

    // 5. Dolgu Güneş Işığı
    this.fillLight = new THREE.DirectionalLight(0x8eb4d4, 0.75);
    this.fillLight.position.set(-80, 70, -60);
    this.scene.add(this.fillLight);
  }

  setupSkyAtmosphere() {
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    this.skyCtx = skyCanvas.getContext('2d');
    this.skyTex = new THREE.CanvasTexture(skyCanvas);

    this.updateSkyCanvas(12.0); // Başlangıç öğle güneşi

    const skyGeo = new THREE.SphereGeometry(750, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);
  }

  updateSkyCanvas(hour) {
    if (!this.skyCtx) return;
    const ctx = this.skyCtx;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);

    // Gece (22:00 - 05:00)
    if (hour >= 21.5 || hour < 5.0) {
      grad.addColorStop(0.0, '#060b14'); // Simsiyah / Koyu Lacivert Gökyüzü
      grad.addColorStop(0.5, '#0c1524');
      grad.addColorStop(0.85, '#162338');
      grad.addColorStop(1.0, '#1d2c42'); // Ufukta Gümüşi Gece Parıltısı
    }
    // Şafak / Gün Doğumu (05:00 - 08:00)
    else if (hour >= 5.0 && hour < 8.0) {
      grad.addColorStop(0.0, '#1c3a60');
      grad.addColorStop(0.4, '#4a6b8c');
      grad.addColorStop(0.75, '#c27b52'); // Şafak Kızıllığı
      grad.addColorStop(1.0, '#f2ab6d'); // Kehribar Ufuk
    }
    // Gün Batımı / Altın Saat (18:00 - 21.5)
    else if (hour >= 18.0 && hour < 21.5) {
      grad.addColorStop(0.0, '#162d4a');
      grad.addColorStop(0.4, '#4e4c6b');
      grad.addColorStop(0.75, '#b84e36'); // Alevli Gün Batımı
      grad.addColorStop(1.0, '#e58e47');
    }
    // Gündüz / Öğle (08:00 - 18:00)
    else {
      grad.addColorStop(0.0, '#1c4a7e');
      grad.addColorStop(0.45, '#4a82b8');
      grad.addColorStop(0.75, '#9bc0de');
      grad.addColorStop(0.92, '#f2d4a8');
      grad.addColorStop(1.0, '#e8be88');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Gece Yıldızları
    if (hour >= 21.0 || hour < 5.5) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 90; i++) {
        const sx = (i * 37) % 512;
        const sy = (i * 59) % 320;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }

    if (this.skyTex) this.skyTex.needsUpdate = true;
  }

  /**
   * 24 Saatlik Zaman Dilimine Göre Aydınlatma ve Gökyüzü Akışı
   */
  updateDayNight(hour) {
    // Güneş Açısı Yörüngesi
    const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
    const sunDist = 200;

    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = Math.sin(sunAngle * 0.5) * 80;

    this.sunLight.position.set(sunX, Math.max(-50, sunY), sunZ);

    // Güneş Işık Şiddeti ve Renk Geçişi
    if (sunY > 10) {
      // Gündüz
      const dayFactor = Math.min(1.0, sunY / 100);
      this.sunLight.intensity = 1.0 + dayFactor * 1.6;
      this.ambientLight.intensity = 0.5 + dayFactor * 0.45;
      this.moonLight.intensity = 0.0;
      this.renderer.toneMappingExposure = 1.1 + dayFactor * 0.25;
      this.scene.fog.color.setHex(0xcce2f0);
    } else {
      // Gece
      this.sunLight.intensity = 0.0;
      this.ambientLight.intensity = 0.22;
      this.moonLight.intensity = 0.65;
      this.moonLight.position.set(-sunX, Math.max(20, -sunY), -sunZ);
      this.renderer.toneMappingExposure = 0.85;
      this.scene.fog.color.setHex(0x0c1524);
    }

    // Gökyüzü Dokusu Güncellemesi (Her 5 dakikada bir)
    if (!this.lastHourUpdate || Math.abs(this.lastHourUpdate - hour) > 0.15) {
      this.updateSkyCanvas(hour);
      this.lastHourUpdate = hour;
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
