import * as THREE from 'three';

/**
 * ParticleSystem - Mount & Blade II: Bannerlord Seviyesinde Yaşayan Atmosfer Parçacık Motoru
 * - Köy Konakları & Fırın Bacalarından Tüten Gerçekçi Dumanlar (Chimney Smoke)
 * - Demirci Rüstem Usta Örsünden Sıçrayan Kor Kıvılcımlar (Blacksmith Sparks)
 * - Kamp Ateşi, Ocak ve Meşalelerden Yükselen Közler (Fire Embers)
 * - Güneş Işığında Süzülen Atmosferik Polen ve Toz Zerreleri (Dust Motes)
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    // 1. Duman Parçacık Sistemi (Bacalardan ve Ocaklardan)
    this.smokeParticles = [];
    this.maxSmoke = 180;
    this.initSmoke();

    // 2. Demirci Kıvılcım Sistemi (Örs Vuruşları İçin)
    this.sparks = [];
    this.maxSparks = 80;
    this.initSparks();

    // 3. Ateş Közleri & Meşale Parçacıkları (Embers)
    this.embers = [];
    this.maxEmbers = 120;
    this.initEmbers();

    // 4. Atmosferik Toz / Polen Zerreleri
    this.initAtmosphericDust();

    // Duman Kaynakları (Köydeki Ev Bacaları, Demirci ve Kamp Ateşi)
    this.smokeEmitters = [
      new THREE.Vector3(-62, 5.8, 8),    // Demirci Ocağı Bacası
      new THREE.Vector3(0, 7.5, -32),    // Sipahi Konağı Bacası
      new THREE.Vector3(-16, 7.8, 28),   // Köy Hanı Bacası
      new THREE.Vector3(-22, 7.2, 8),    // Konak 1 Bacası
      new THREE.Vector3(26, 7.5, 12),    // Konak 2 Bacası
      new THREE.Vector3(-80, 0.4, -80)   // Harami Kamp Ateşi
    ];
  }

  // ---------------------------------------------------------------------------
  // 1. GERÇEKÇİ BACA & OCAK DUMANI
  // ---------------------------------------------------------------------------
  initSmoke() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxSmoke * 3);
    const sizes = new Float32Array(this.maxSmoke);
    const opacities = new Float32Array(this.maxSmoke);

    for (let i = 0; i < this.maxSmoke; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      sizes[i] = 1.0;
      opacities[i] = 0;

      this.smokeParticles.push({
        active: false,
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 3.5 + Math.random() * 2.0,
        size: 1.2,
        emitterIdx: 0
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Duman Dokusu Oluştur (Yumuşak Puf Bulutu)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(210, 215, 220, 0.8)');
    grad.addColorStop(0.4, 'rgba(160, 165, 170, 0.4)');
    grad.addColorStop(1, 'rgba(100, 105, 110, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const smokeTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 2.4,
      map: smokeTex,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.smokeMesh = new THREE.Points(geo, mat);
    this.scene.add(this.smokeMesh);
  }

  // ---------------------------------------------------------------------------
  // 2. DEMİRCİ ÖRS KIVILCIMLARI (SPARKS)
  // ---------------------------------------------------------------------------
  initSparks() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxSparks * 3);

    for (let i = 0; i < this.maxSparks; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;

      this.sparks.push({
        active: false,
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.28,
      color: 0xffaa22,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparkMesh = new THREE.Points(geo, mat);
    this.scene.add(this.sparkMesh);
  }

  /**
   * Demirci örse vurduğunda kıvılcım patlaması yaratır
   */
  emitBlacksmithSparks(origin = new THREE.Vector3(-58, 0.9, 6)) {
    let emitted = 0;
    for (let i = 0; i < this.sparks.length && emitted < 14; i++) {
      const sp = this.sparks[i];
      if (!sp.active) {
        sp.active = true;
        sp.pos.copy(origin);
        // Yukarı ve çevreye patlama yönü
        sp.vel.set(
          (Math.random() - 0.5) * 4.5,
          2.5 + Math.random() * 3.5,
          (Math.random() - 0.5) * 4.5
        );
        sp.life = 0;
        sp.maxLife = 0.4 + Math.random() * 0.4;
        emitted++;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ATEŞ KÖZLERİ (EMBERS)
  // ---------------------------------------------------------------------------
  initEmbers() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxEmbers * 3);

    for (let i = 0; i < this.maxEmbers; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;

      this.embers.push({
        active: false,
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 2.0 + Math.random() * 2.0,
        origin: new THREE.Vector3(-62, 2.2, 8)
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0xff5511,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.emberMesh = new THREE.Points(geo, mat);
    this.scene.add(this.emberMesh);
  }

  // ---------------------------------------------------------------------------
  // 4. SİNEMATİK TOZ & POLEN ZERRELLERİ (ATMOSPHERIC DUST)
  // ---------------------------------------------------------------------------
  initAtmosphericDust() {
    const count = 400;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xffeedd,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });

    this.dustMesh = new THREE.Points(geo, mat);
    this.scene.add(this.dustMesh);
  }

  // ---------------------------------------------------------------------------
  // HER KARE GÜNCELLEME DÖNGÜSÜ (UPDATE)
  // ---------------------------------------------------------------------------
  update(delta, playerPos) {
    const time = performance.now() * 0.001;

    // 1. DUMAN GÜNCELLEMESİ
    const smokePos = this.smokeMesh.geometry.attributes.position.array;
    for (let i = 0; i < this.smokeParticles.length; i++) {
      const sp = this.smokeParticles[i];
      if (sp.active) {
        sp.life += delta;
        if (sp.life >= sp.maxLife) {
          sp.active = false;
          smokePos[i * 3 + 1] = -100;
          continue;
        }

        // Rüzgar ve yukarı kalkış hareketi
        sp.pos.x += (Math.sin(time + i) * 0.3 + 0.4) * delta;
        sp.pos.y += sp.vel.y * delta;
        sp.pos.z += (Math.cos(time + i) * 0.3) * delta;

        smokePos[i * 3] = sp.pos.x;
        smokePos[i * 3 + 1] = sp.pos.y;
        smokePos[i * 3 + 2] = sp.pos.z;
      } else {
        // Rastgele yeni duman parçacığı doğur
        if (Math.random() < 0.18) {
          sp.active = true;
          sp.life = 0;
          sp.emitterIdx = Math.floor(Math.random() * this.smokeEmitters.length);
          const emitter = this.smokeEmitters[sp.emitterIdx];
          sp.pos.set(
            emitter.x + (Math.random() - 0.5) * 0.4,
            emitter.y,
            emitter.z + (Math.random() - 0.5) * 0.4
          );
          sp.vel.set(0, 1.2 + Math.random() * 0.8, 0);
        }
      }
    }
    this.smokeMesh.geometry.attributes.position.needsUpdate = true;

    // 2. KIVILCIM GÜNCELLEMESİ
    const sparkPos = this.sparkMesh.geometry.attributes.position.array;
    for (let i = 0; i < this.sparks.length; i++) {
      const sp = this.sparks[i];
      if (sp.active) {
        sp.life += delta;
        if (sp.life >= sp.maxLife) {
          sp.active = false;
          sparkPos[i * 3 + 1] = -100;
          continue;
        }

        // Yerçekimi ve hız
        sp.vel.y -= 9.8 * delta;
        sp.pos.addScaledVector(sp.vel, delta);

        sparkPos[i * 3] = sp.pos.x;
        sparkPos[i * 3 + 1] = Math.max(0.05, sp.pos.y);
        sparkPos[i * 3 + 2] = sp.pos.z;
      }
    }
    this.sparkMesh.geometry.attributes.position.needsUpdate = true;

    // 3. KÖZ GÜNCELLEMESİ
    const emberPos = this.emberMesh.geometry.attributes.position.array;
    for (let i = 0; i < this.embers.length; i++) {
      const em = this.embers[i];
      if (em.active) {
        em.life += delta;
        if (em.life >= em.maxLife) {
          em.active = false;
          emberPos[i * 3 + 1] = -100;
          continue;
        }

        em.pos.x += Math.sin(time * 2 + i) * 0.8 * delta;
        em.pos.y += (1.4 + Math.sin(time + i) * 0.4) * delta;
        em.pos.z += Math.cos(time * 2 + i) * 0.8 * delta;

        emberPos[i * 3] = em.pos.x;
        emberPos[i * 3 + 1] = em.pos.y;
        emberPos[i * 3 + 2] = em.pos.z;
      } else {
        if (Math.random() < 0.12) {
          em.active = true;
          em.life = 0;
          // Demirci ocağı veya kamp ateşi civarı
          const isCamp = Math.random() > 0.5;
          const ex = isCamp ? -80 : -62;
          const ey = isCamp ? 0.3 : 2.2;
          const ez = isCamp ? -80 : 8;
          em.pos.set(
            ex + (Math.random() - 0.5) * 0.6,
            ey,
            ez + (Math.random() - 0.5) * 0.6
          );
        }
      }
    }
    this.emberMesh.geometry.attributes.position.needsUpdate = true;

    // 4. TOZ ZERRELERİ DALGALANMASI
    if (this.dustMesh) {
      this.dustMesh.rotation.y = time * 0.02;
      if (playerPos) {
        // Oyuncuyu takip eden hafif atmosfer alanı
        this.dustMesh.position.x = playerPos.x * 0.2;
        this.dustMesh.position.z = playerPos.z * 0.2;
      }
    }
  }
}
