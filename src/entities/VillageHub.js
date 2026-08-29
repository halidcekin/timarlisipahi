import * as THREE from 'three';

/**
 * Solo Leveling Köy Platformu (Village Hub)
 * - Geniş ve canlı zemin platformu
 * - 3D Ağaçlar, Köy Evleri, Fenerler ve Merkez Kristal Anıtı
 * - 5 Adet Kademe Portalı (E, D, C, B, A) ile 3D Rank Hologramları ve Enerji Halkaları
 */
export class VillageHub {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.portals = [];
    this.animTime = 0;

    this.buildPlatform();
    this.buildVillageBuildings();
    this.buildTreesAndFoliage();
    this.buildPortals();
  }

  buildPlatform() {
    // 1. Ana Köy Zemin Platformu (Geniş Yeşil Çimen ve Taş Platform)
    const platformGeo = new THREE.CylinderGeometry(70, 75, 4, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x2e4a28,
      roughness: 0.8,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -2;
    platform.receiveShadow = true;
    this.group.add(platform);

    // 2. Taş Meydan Yolu
    const roadGeo = new THREE.RingGeometry(8, 42, 32);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    this.group.add(road);

    // 3. Merkez Kristal Güç Anıtı (Oyuncunun hemen önünde z = 0)
    const centerBaseGeo = new THREE.CylinderGeometry(4, 4.5, 0.8, 16);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const centerBase = new THREE.Mesh(centerBaseGeo, stoneMat);
    centerBase.position.set(0, 0.4, 0);
    centerBase.receiveShadow = true;
    this.group.add(centerBase);

    // Parlayan Mavi Monolit Kristal
    const crystalGeo = new THREE.OctahedronGeometry(1.6, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9
    });
    this.centerCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    this.centerCrystal.position.set(0, 2.8, 0);
    this.group.add(this.centerCrystal);
  }

  buildVillageBuildings() {
    const housePositions = [
      { x: -35, z: 10, rot: 0.4 },
      { x: -28, z: 28, rot: 0.8 },
      { x: -12, z: 38, rot: 0.2 },
      { x: 14, z: 36, rot: -0.3 },
      { x: 32, z: 24, rot: -0.7 },
      { x: 38, z: 6, rot: -1.1 },
      { x: -38, z: -12, rot: 1.4 },
      { x: 40, z: -10, rot: -1.5 }
    ];

    housePositions.forEach((pos, idx) => {
      const house = this.createHouseMesh(idx % 2 === 0);
      house.position.set(pos.x, 0, pos.z);
      house.rotation.y = pos.rot;
      this.group.add(house);
    });
  }

  createHouseMesh(isLarge = false) {
    const houseGroup = new THREE.Group();

    const width = isLarge ? 8 : 6;
    const height = isLarge ? 5 : 4;
    const depth = isLarge ? 7 : 5;

    const wallMat = new THREE.MeshStandardMaterial({
      color: isLarge ? 0x94a3b8 : 0xa8a29e,
      roughness: 0.8
    });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Kiremit Çatı
    const roofMat = new THREE.MeshStandardMaterial({
      color: isLarge ? 0x991b1b : 0xb45309,
      roughness: 0.6
    });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.8, 3.2, 4), roofMat);
    roof.position.y = height + 1.6;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);

    // Işıklı Pencere
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    win.position.set(0, height * 0.55, depth / 2 + 0.05);
    houseGroup.add(win);

    return houseGroup;
  }

  buildTreesAndFoliage() {
    const treeCoords = [
      [-46, 5], [-42, -18], [-38, 22], [-32, 42], [-18, 46],
      [0, 48], [20, 45], [35, 38], [44, 20], [48, 0],
      [46, -20], [-15, -42], [15, -42], [-28, -32], [28, -32],
      [-20, 16], [22, 14], [-16, 28], [16, 26], [-8, 20],
      [-26, -12], [26, -12], [-10, 8], [12, 6], [0, 32]
    ];

    treeCoords.forEach(([x, z], i) => {
      const isPine = i % 2 === 0;
      const scale = 0.9 + (i % 4) * 0.15;
      const tree = this.createTreeMesh(isPine, scale);
      tree.position.set(x, 0, z);
      this.group.add(tree);
    });

    // Fener Direkleri
    const lanternSpots = [
      [-12, 4], [12, 4], [-8, 22], [8, 22], [0, -8], [-22, 0], [22, 0]
    ];
    lanternSpots.forEach(([lx, lz]) => {
      const lamp = this.createStreetLamp();
      lamp.position.set(lx, 0, lz);
      this.group.add(lamp);
    });
  }

  createTreeMesh(isPine, scale) {
    const treeGroup = new THREE.Group();
    treeGroup.scale.set(scale, scale, scale);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8), trunkMat);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    if (isPine) {
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
      for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4 - i * 0.5, 2.5, 8), foliageMat);
        cone.position.y = 3.2 + i * 1.5;
        cone.castShadow = true;
        treeGroup.add(cone);
      }
    } else {
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), foliageMat);
      foliage.position.y = 4.2;
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }

    return treeGroup;
  }

  createStreetLamp() {
    const lampGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4, 8), postMat);
    post.position.y = 2;
    lampGroup.add(post);

    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), lanternMat);
    lantern.position.y = 4.1;
    lampGroup.add(lantern);

    return lampGroup;
  }

  buildPortals() {
    // 5 Kademe Portalı (E, D, C, B, A) - Tam karşıda yay şeklinde dizili
    const portalConfigs = [
      {
        rank: 'E',
        title: 'E KADEME PORTALI',
        requiredLvl: 1,
        color: 0x10b981,
        glowHex: '#10b981',
        x: -24,
        z: -20,
        targetDungeon: 'dungeon_E'
      },
      {
        rank: 'D',
        title: 'D KADEME PORTALI',
        requiredLvl: 10,
        color: 0x06b6d4,
        glowHex: '#06b6d4',
        x: -12,
        z: -26,
        targetDungeon: 'dungeon_D'
      },
      {
        rank: 'C',
        title: 'C KADEME PORTALI',
        requiredLvl: 25,
        color: 0xa855f7,
        glowHex: '#a855f7',
        x: 0,
        z: -28,
        targetDungeon: 'dungeon_C'
      },
      {
        rank: 'B',
        title: 'B KADEME PORTALI',
        requiredLvl: 40,
        color: 0xf97316,
        glowHex: '#f97316',
        x: 12,
        z: -26,
        targetDungeon: 'dungeon_B'
      },
      {
        rank: 'A',
        title: 'A KADEME PORTALI',
        requiredLvl: 50,
        color: 0xeab308,
        glowHex: '#eab308',
        x: 24,
        z: -20,
        targetDungeon: 'dungeon_A'
      }
    ];

    portalConfigs.forEach((cfg) => {
      const portalObj = this.createPortalMesh(cfg);
      portalObj.group.position.set(cfg.x, 0, cfg.z);
      portalObj.group.lookAt(0, 0, 14); // Oyuncunun başlangıç noktasına doğru baksın
      this.group.add(portalObj.group);

      this.portals.push({
        rank: cfg.rank,
        title: cfg.title,
        requiredLvl: cfg.requiredLvl,
        position: new THREE.Vector3(cfg.x, 0, cfg.z),
        triggerRadius: 4.5,
        targetDungeon: cfg.targetDungeon,
        meshObj: portalObj
      });
    });
  }

  createPortalMesh(cfg) {
    const pGroup = new THREE.Group();

    // 1. Taş Kemer
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.45, 12, 24, Math.PI), stoneMat);
    arch.position.y = 2.5;
    arch.castShadow = true;
    pGroup.add(arch);

    const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3.2, 12), stoneMat);
    leftPillar.position.set(-3.5, 1.6, 0);
    pGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3.2, 12), stoneMat);
    rightPillar.position.set(3.5, 1.6, 0);
    pGroup.add(rightPillar);

    // 2. Parlayan Vorteks Diski
    const vortexDisc = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 32),
      new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      })
    );
    vortexDisc.position.y = 3.2;
    pGroup.add(vortexDisc);

    // 3. Dönen Enerji Çemberi
    const energyRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.15, 8, 32),
      new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true })
    );
    energyRing.position.y = 3.2;
    pGroup.add(energyRing);

    // 4. 3D Rank Başlık Levhası
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const ctx = bannerCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = cfg.glowHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = cfg.glowHex;
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cfg.rank} KADEME PORTAL`, 256, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText(`(Gereksinim: Lvl ${cfg.requiredLvl}+)`, 256, 95);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true });
    const bannerPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.2), bannerMat);
    bannerPlane.position.set(0, 6.8, 0);
    pGroup.add(bannerPlane);

    return {
      group: pGroup,
      vortexDisc,
      energyRing,
      bannerPlane,
      color: cfg.color
    };
  }

  update(delta) {
    this.animTime += delta;

    if (this.centerCrystal) {
      this.centerCrystal.rotation.y += delta * 0.8;
      this.centerCrystal.position.y = 2.8 + Math.sin(this.animTime * 2) * 0.25;
    }

    this.portals.forEach((p) => {
      const obj = p.meshObj;
      if (obj.energyRing) {
        obj.energyRing.rotation.z += delta * 1.5;
      }
      if (obj.vortexDisc) {
        obj.vortexDisc.material.opacity = 0.75 + Math.sin(this.animTime * 4) * 0.15;
      }
    });
  }

  getNearbyPortal(playerPos) {
    for (const portal of this.portals) {
      const dist = portal.position.distanceTo(playerPos);
      if (dist <= portal.triggerRadius) {
        return { portal, distance: dist };
      }
    }
    return null;
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}
