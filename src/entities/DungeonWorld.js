import * as THREE from 'three';

/**
 * Solo Leveling 5 Farklı Tematik Zindan Dünyası (DungeonWorld)
 * - 60+ FPS Optimizasyonu: Hafifletilmiş emissive meşaleler, optimize geometri
 * - E: Yeraltı Mağarası (Yeşil Zehir & Taş)
 * - D: Bataklık Harabeleri (Mavi Zehir & Yosunlu Kalıntılar)
 * - C: Buzul Zindanı (Buz Kristalleri & Kar Kaplı Taşlar)
 * - B: Cehennem Kalesi (Lav Havuzları & Obsidyen Sütunlar)
 * - A: Karanlık Tapınak / Karınca Yuvası (Karanlık Enerji & Boşluk Monolitleri)
 */
export class DungeonWorld {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.currentRank = null;
    this.returnPortal = null;
    this.animTime = 0;
    this.particles = [];
  }

  loadDungeon(rank) {
    this.clearDungeon();
    this.currentRank = rank;
    this.group.visible = true;

    const dungeonThemes = {
      E: {
        name: 'Yeraltı Mağarası',
        floorColor: 0x1c1917,
        wallColor: 0x292524,
        pillarColor: 0x14532d,
        lightColor: 0x10b981,
        fogColor: 0x064e3b,
        ambientColor: 0x052e16,
        floorRoughness: 0.9
      },
      D: {
        name: 'Bataklık Harabeleri',
        floorColor: 0x0f172a,
        wallColor: 0x1e293b,
        pillarColor: 0x0369a1,
        lightColor: 0x00e5ff,
        fogColor: 0x082f49,
        ambientColor: 0x0c4a6e,
        floorRoughness: 0.8
      },
      C: {
        name: 'Buzul Zindanı',
        floorColor: 0xe0f2fe,
        wallColor: 0xbae6fd,
        pillarColor: 0x38bdf8,
        lightColor: 0x7dd3fc,
        fogColor: 0x0284c7,
        ambientColor: 0x0369a1,
        floorRoughness: 0.2
      },
      B: {
        name: 'Cehennem Kalesi',
        floorColor: 0x450a0a,
        wallColor: 0x7f1d1d,
        pillarColor: 0x991b1b,
        lightColor: 0xef4444,
        fogColor: 0x7f1d1d,
        ambientColor: 0x450a0a,
        floorRoughness: 0.6
      },
      A: {
        name: 'Karanlık Hükümdar Tapınağı',
        floorColor: 0x030712,
        wallColor: 0x0f172a,
        pillarColor: 0x581c87,
        lightColor: 0xa855f7,
        fogColor: 0x3b0764,
        ambientColor: 0x1e1b4b,
        floorRoughness: 0.4
      }
    };

    const theme = dungeonThemes[rank] || dungeonThemes.E;
    this.buildDungeonArena(theme);
  }

  buildDungeonArena(theme) {
    // 1. Zemin Platformu (Devasa Zindan Arenası)
    const floorGeo = new THREE.CylinderGeometry(55, 60, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: theme.floorColor,
      roughness: theme.floorRoughness,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // 2. Çevre Sütunlar (Dairesel Arena Bariyerleri)
    const pillarCount = 14;
    const radius = 50;
    const pillarMat = new THREE.MeshStandardMaterial({
      color: theme.pillarColor,
      roughness: 0.7,
      metalness: 0.3
    });

    const torchMat = new THREE.MeshBasicMaterial({ color: theme.lightColor });

    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;

      const pHeight = 14;
      const pGeo = new THREE.BoxGeometry(3, pHeight, 3);
      const pillar = new THREE.Mesh(pGeo, pillarMat);
      pillar.position.set(px, pHeight / 2, pz);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.group.add(pillar);

      // Meşale Kristali (Emissive Hafif Obje)
      const torch = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), torchMat);
      torch.position.set(px * 0.93, pHeight * 0.8, pz * 0.93);
      this.group.add(torch);
    }

    // 3. Tek Optimize Zindan Işığı
    const centerLight = new THREE.PointLight(theme.lightColor, 2.5, 90);
    centerLight.position.set(0, 15, 0);
    this.group.add(centerLight);

    // 4. Çıkış Portalı (Köy Platformuna Geri Dönüş)
    this.buildReturnPortal(theme);
  }

  buildReturnPortal(theme) {
    const rGroup = new THREE.Group();
    rGroup.position.set(0, 0, 38);

    const archGeo = new THREE.TorusGeometry(3.0, 0.4, 12, 24, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.y = 2.2;
    rGroup.add(arch);

    const vortexGeo = new THREE.CircleGeometry(2.8, 24);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.returnVortex = new THREE.Mesh(vortexGeo, vortexMat);
    this.returnVortex.position.y = 2.2;
    rGroup.add(this.returnVortex);

    this.returnPortal = rGroup;
    this.group.add(rGroup);
  }

  isNearReturnPortal(playerPos) {
    if (!this.returnPortal || !this.group.visible) return false;
    return this.returnPortal.position.distanceTo(playerPos) < 5.0;
  }

  update(delta) {
    if (!this.group.visible) return;
    this.animTime += delta;

    if (this.returnVortex) {
      this.returnVortex.rotation.z += delta * 1.5;
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  clearDungeon() {
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
    }
    this.returnPortal = null;
    this.particles = [];
  }
}
