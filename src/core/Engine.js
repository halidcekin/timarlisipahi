import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TextureGenerator } from '../entities/TextureGenerator.js';

/**
 * Sinematik Renk Tonlama & Kontrast Shader'ı (LUT / Color Grading)
 */
const ColorGradingShader = {
  name: 'ColorGradingShader',
  uniforms: {
    tDiffuse: { value: null },
    uTint: { value: new THREE.Color(1.0, 1.0, 1.0) },
    uContrast: { value: 1.06 },
    uSaturation: { value: 1.12 },
    uBrightness: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;
    uniform float uContrast;
    uniform float uSaturation;
    uniform float uBrightness;
    varying vec2 vUv;

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec3 color = tex.rgb * uTint * uBrightness;

      // Kontrast Eğrisi
      color = (color - 0.5) * uContrast + 0.5;

      // Doygunluk (Saturation)
      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luminance), color, uSaturation);

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), tex.a);
    }
  `
};

/**
 * Engine - Mülk-i Osmanî: Tımarlı Sipahi 3D Gerçekçi PBR Aydınlatma & Render Motoru
 * - Mount & Blade II: Bannerlord Seviyesinde 24 Saatlik Sinematik Gökyüzü ve Işık Döngüsü
 * - 4K PCF Soft Shadows & ACES Filmic Tone Mapping
 * - SSAO, Unreal Bloom, SMAA & Color Grading Post-Processing Hattı
 * - Dinamik PMREM Çevresel Yansımaları (IBL) & Alev Titremeli Noktasal Meşale Işıkları
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

    // 3. WebGL Renderer (SMAA ile çift yükü önlemek için antialias: false)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    this.renderer.setClearColor(0x7bb5e3, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    // Anizotropik Doku Filtrelemesi
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy() || 4;
    TextureGenerator.setAnisotropy(maxAniso);

    // 4. Işıklandırma, Gece Meşaleleri & Atmosfer
    this.currentEnvRT = null;
    this.setupLighting();
    this.setupPointLights();
    this.setupSkyAtmosphere();
    this.setupPostProcessing();

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

    // 3. Ana Güneş Işığı (Dinamik Takip Eden Gölge Haritası)
    this.sunLight = new THREE.DirectionalLight(0xfff0d4, 2.6);
    this.sunLight.position.set(110, 130, 80);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 4096;
    this.sunLight.shadow.mapSize.height = 4096;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 280;

    const d = 80; // Oyuncu etrafında odaklanmış ultra keskin gölge kutusu
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.04;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 4. Ay Işığı (Gece devreye giren gümüşi ışık)
    this.moonLight = new THREE.DirectionalLight(0x8ba6c9, 0.0);
    this.moonLight.position.set(-110, 100, -80);
    this.scene.add(this.moonLight);
    this.scene.add(this.moonLight.target);

    // 5. Dolgu Güneş Işığı
    this.fillLight = new THREE.DirectionalLight(0x8eb4d4, 0.75);
    this.fillLight.position.set(-80, 70, -60);
    this.scene.add(this.fillLight);
  }

  /**
   * Gece ve Alacakaranlıkta Çevreyi Aydınlatan Alev Titremeli Noktasal Işıklar
   */
  setupPointLights() {
    this.pointLights = [];
    const lightConfigs = [
      { id: 'blacksmith', pos: new THREE.Vector3(-62, 2.0, 8), color: 0xff6611, distance: 20, baseIntensity: 3.2 },
      { id: 'banditCamp', pos: new THREE.Vector3(-80, 1.4, -80), color: 0xff5511, distance: 26, baseIntensity: 3.6 },
      { id: 'mansionLantern', pos: new THREE.Vector3(0, 3.2, -28), color: 0xffaa44, distance: 18, baseIntensity: 2.4 },
      { id: 'innLantern', pos: new THREE.Vector3(-16, 2.8, 24), color: 0xffaa44, distance: 18, baseIntensity: 2.4 },
      { id: 'squareLantern', pos: new THREE.Vector3(0, 2.6, 0), color: 0xffcc77, distance: 20, baseIntensity: 2.8 },
      { id: 'marketLantern', pos: new THREE.Vector3(-22, 2.8, -4), color: 0xffaa44, distance: 16, baseIntensity: 2.2 }
    ];

    for (const cfg of lightConfigs) {
      const pLight = new THREE.PointLight(cfg.color, cfg.baseIntensity, cfg.distance, 1.8);
      pLight.position.copy(cfg.pos);
      this.scene.add(pLight);
      this.pointLights.push({
        light: pLight,
        baseIntensity: cfg.baseIntensity,
        baseColor: cfg.color
      });
    }
  }

  setupSkyAtmosphere() {
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    this.skyCtx = skyCanvas.getContext('2d');
    this.skyTex = new THREE.CanvasTexture(skyCanvas);

    // PMREM Jeneratörü (Dinamik Çevresel Yansıma - IBL)
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

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

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    // 1. Sahneyi Normal Render Et
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 2. SSAO (Screen Space Ambient Occlusion) - Köşeler ve temas noktalarına derinlik gölgeleri
    const ssaoPass = new SSAOPass(this.scene, this.camera, this.width, this.height);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.002;
    ssaoPass.maxDistance = 0.1;
    this.composer.addPass(ssaoPass);

    // 3. Unreal Bloom - Güneş, Ateş, Meşale ve Kıvılcımlarda Işık Taşması
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.2, 0.4, 0.85);
    bloomPass.threshold = 0.55;
    bloomPass.strength = 0.45;
    bloomPass.radius = 0.5;
    this.composer.addPass(bloomPass);

    // 4. Color Grading Shader (Sinematik Renk & Kontrast Tonlama)
    this.colorGradingPass = new ShaderPass(ColorGradingShader);
    this.composer.addPass(this.colorGradingPass);

    // 5. SMAA - Üst Düzey Pürüzsüz Kenar Yumuşatma
    const smaaPass = new SMAAPass(this.width * this.renderer.getPixelRatio(), this.height * this.renderer.getPixelRatio());
    this.composer.addPass(smaaPass);
    
    // 6. Output Pass (ACES Filmic Tone Mapping)
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  updateSkyCanvas(hour) {
    if (!this.skyCtx) return;
    const ctx = this.skyCtx;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);

    // Gece (21:30 - 05:00)
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

    if (this.skyTex) {
      this.skyTex.needsUpdate = true;
      if (this.pmremGenerator) {
        // Bellek sızıntısını önlemek için eski RenderTarget'ı yok et (dispose)
        if (this.currentEnvRT) {
          this.currentEnvRT.dispose();
          this.currentEnvRT = null;
        }
        this.currentEnvRT = this.pmremGenerator.fromEquirectangular(this.skyTex);
        this.scene.environment = this.currentEnvRT.texture;
      }
    }
  }

  /**
   * 24 Saatlik Zaman Dilimine Göre Aydınlatma, Gölge Takibi ve Renk Tonlama Akışı
   */
  updateDayNight(hour, playerPos = null) {
    // Güneş Açısı Yörüngesi
    const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
    const sunDist = 180;

    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = Math.sin(sunAngle * 0.5) * 70;

    // Oyuncu Pozisyonunu Takip Eden Dinamik Gölge Kamerasının Konumlandırılması
    const targetX = playerPos ? playerPos.x : 0;
    const targetY = playerPos ? playerPos.y : 0;
    const targetZ = playerPos ? playerPos.z : 0;

    this.sunLight.target.position.set(targetX, targetY, targetZ);
    this.sunLight.position.set(targetX + sunX, targetY + Math.max(-50, sunY), targetZ + sunZ);

    this.moonLight.target.position.set(targetX, targetY, targetZ);
    this.moonLight.position.set(targetX - sunX, targetY + Math.max(20, -sunY), targetZ - sunZ);

    // Bloom ve Color Grading Geçişleri
    let bloomPass = null;
    if (this.composer) {
      bloomPass = this.composer.passes.find(p => p instanceof UnrealBloomPass);
    }

    if (sunY > 10) {
      // Gündüz
      const dayFactor = Math.min(1.0, sunY / 100);
      this.sunLight.intensity = 1.1 + dayFactor * 1.7;
      this.ambientLight.intensity = 0.55 + dayFactor * 0.40;
      this.moonLight.intensity = 0.0;
      this.renderer.toneMappingExposure = 1.15 + dayFactor * 0.25;
      this.scene.fog.color.setHex(0xcce2f0);
      if (bloomPass) bloomPass.strength = 0.25 + (1.0 - dayFactor) * 0.4;

      // Color Grading (Gündüz & Şafak Tonlaması)
      if (this.colorGradingPass) {
        if (hour >= 5.0 && hour < 8.5) {
          // Sıcak Şafak / Sabah Işığı
          this.colorGradingPass.uniforms.uTint.value.setRGB(1.06, 0.98, 0.90);
          this.colorGradingPass.uniforms.uContrast.value = 1.08;
          this.colorGradingPass.uniforms.uSaturation.value = 1.18;
        } else if (hour >= 17.5 && hour < 21.0) {
          // Zengin Gün Batımı Kehribar Tonu
          this.colorGradingPass.uniforms.uTint.value.setRGB(1.08, 0.94, 0.82);
          this.colorGradingPass.uniforms.uContrast.value = 1.10;
          this.colorGradingPass.uniforms.uSaturation.value = 1.22;
        } else {
          // Berrak Öğle Tonu
          this.colorGradingPass.uniforms.uTint.value.setRGB(1.0, 1.0, 1.0);
          this.colorGradingPass.uniforms.uContrast.value = 1.05;
          this.colorGradingPass.uniforms.uSaturation.value = 1.12;
        }
      }
    } else {
      // Gece
      this.sunLight.intensity = 0.0;
      this.ambientLight.intensity = 0.26;
      this.moonLight.intensity = 0.75;
      this.renderer.toneMappingExposure = 0.88;
      this.scene.fog.color.setHex(0x0c1524);
      if (bloomPass) bloomPass.strength = 0.35; // Geceleri meşaleler ve ateşler parlar

      // Color Grading (Gece Mistik Lacivert Tonlaması)
      if (this.colorGradingPass) {
        this.colorGradingPass.uniforms.uTint.value.setRGB(0.88, 0.94, 1.08);
        this.colorGradingPass.uniforms.uContrast.value = 1.12;
        this.colorGradingPass.uniforms.uSaturation.value = 0.98;
      }
    }

    // Gökyüzü Dokusu Güncellemesi (Her 5 dakikada bir)
    if (!this.lastHourUpdate || Math.abs(this.lastHourUpdate - hour) > 0.15) {
      this.updateSkyCanvas(hour);
      this.lastHourUpdate = hour;
    }

    // Noktasal Meşale Işıklarının Titremesini ve Parlaklığını Güncelle
    const time = performance.now() * 0.001;
    this.updatePointLights(time, hour);
  }

  updatePointLights(time, hour) {
    let nightMultiplier = 1.0;
    if (hour >= 20.0 || hour < 5.5) {
      nightMultiplier = 1.6; // Geceleyin meşaleler çok belirgin
    } else if (hour >= 8.0 && hour <= 17.0) {
      nightMultiplier = 0.6; // Öğlen güneşinde hafif arka plan aydınlığı
    } else {
      nightMultiplier = 1.15; // Şafak / Alacakaranlık
    }

    for (let i = 0; i < this.pointLights.length; i++) {
      const pl = this.pointLights[i];
      // Alev titremesi (flicker) simülasyonu
      const flicker = 1.0 + Math.sin(time * 12.0 + i * 2.5) * 0.12 + (Math.random() - 0.5) * 0.06;
      pl.light.intensity = pl.baseIntensity * nightMultiplier * flicker;
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    if (this.composer) this.composer.setSize(this.width, this.height);
  }

  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
