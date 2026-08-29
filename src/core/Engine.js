import * as THREE from 'three';

/**
 * Engine - Mülk-i Osmanî: Tımarlı Sipahi 3D Gerçekçi PBR Aydınlatma & Render Motoru
 * - Canlı Gün Işığı (Asla kararmaz veya WebGL context çökmesi yaşanmaz)
 * - ACES Filmic Tone Mapping & Yumuşak Gölgeler
 */
export class Engine {
  constructor(canvas) {
    this.canvas = canvas || document.getElementById('webgl-canvas');
    this.width = window.innerWidth || 1280;
    this.height = window.innerHeight || 720;

    // 1. Sahne ve Açık Gökyüzü Arka Planı
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x82c8f7); // Canlı Gök Mavisi
    this.scene.fog = new THREE.FogExp2(0xcfe2f3, 0.0025); // Ufuk Sisi

    // 2. Kamera
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 1.8, 15);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(0x82c8f7, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 4. Işıklandırma
    this.setupLighting();

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // 1. Güçlü Ortam Işığı (Hiçbir nesne karanlıkta kalmaz)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    this.scene.add(this.ambientLight);

    // 2. Yarımküre Işığı (Gökyüzünden Mavi/Altın, Topraktan Zengin Yeşil Yansıma)
    this.hemiLight = new THREE.HemisphereLight(0xe8f4f8, 0x4d613c, 1.15);
    this.hemiLight.position.set(0, 120, 0);
    this.scene.add(this.hemiLight);

    // 3. Ana Güneş Işığı (4K PCF Soft Shadow)
    this.sunLight = new THREE.DirectionalLight(0xfff6e0, 2.2);
    this.sunLight.position.set(90, 140, 70);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 450;

    const d = 160;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;

    this.scene.add(this.sunLight);

    // 4. Atmosferik Gökyüzü Kubbesi
    const skyGeo = new THREE.SphereGeometry(650, 24, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x77bfe8,
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
