import * as THREE from 'three';

/**
 * Engine - Mülk-i Osmanî: Tımarlı Sipahi 3D Gerçekçi PBR Aydınlatma & Render Motoru
 * - Sinematik Altın Saat Gün Işığı & Atmosferik Gökyüzü Kubbesi
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
    this.scene.fog = new THREE.FogExp2(0xcce2f0, 0.0032); // Sinematik Dağ & Vadi Sisi

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
    this.renderer.toneMappingExposure = 1.35; // Canlı ve zengin PBR parlaklığı

    // 4. Işıklandırma & Atmosfer
    this.setupLighting();
    this.setupSkyAtmosphere();

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // 1. Doğal Ortam Işığı (Ambient Light)
    this.ambientLight = new THREE.AmbientLight(0xfff5e6, 0.95);
    this.scene.add(this.ambientLight);

    // 2. Yarımküre Işığı (Gökyüzünden Ilık Mavi, Topraktan Sıcak Yeşil/Kahve Yansıma)
    this.hemiLight = new THREE.HemisphereLight(0xdcebf8, 0x483a24, 1.15);
    this.hemiLight.position.set(0, 150, 0);
    this.scene.add(this.hemiLight);

    // 3. Ana Güneş Işığı (Sinematik Altın Saat 55° Eğimli Doğal Güneş)
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

    // 4. Dolgu Güneş Işığı (Gölgelerin içine yumuşak ışık)
    const fillLight = new THREE.DirectionalLight(0x8eb4d4, 0.75);
    fillLight.position.set(-80, 70, -60);
    this.scene.add(fillLight);
  }

  setupSkyAtmosphere() {
    // Çok Katmanlı Sinematik Gökyüzü Kubbesi
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#1c4a7e'); // Tepe Gökyüzü (Derin Mavi)
    grad.addColorStop(0.45, '#4a82b8');
    grad.addColorStop(0.75, '#9bc0de');
    grad.addColorStop(0.92, '#f2d4a8'); // Ufukta Sıcak Güneş Kızıllığı/Kehribar
    grad.addColorStop(1.0, '#e8be88');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Hafif Bulut Tabakaları
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let i = 0; i < 20; i++) {
      const cx = Math.random() * 512;
      const cy = 200 + Math.random() * 180;
      const rx = 50 + Math.random() * 120;
      const ry = 12 + Math.random() * 25;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyGeo = new THREE.SphereGeometry(750, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);
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
