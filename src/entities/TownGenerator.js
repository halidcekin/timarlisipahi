import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder.js';

/**
 * TownGenerator - 2. Görseldeki Orijinal Köy Meydanı, Mavi Kubbeli Cami ve Safranbolu Kasabası
 */
export class TownGenerator {
  constructor(scene) {
    this.scene = scene;
    this.modelBuilder = new ModelBuilder();
    this.colliders = [];
    this.animatedObjects = [];
    this.interactables = [];
    this.horseEntity = null;
  }

  static getTerrainHeight(x, z) {
    return 0; // 2. Görseldeki gibi düzgün ve ferah meydan zemini
  }

  generateTown() {
    // 1. Zemin (2. Görseldeki Açık Taş Parke Yolu ve Yeşil Çimenler)
    this.createTerrainAndPaths();

    // 2. Mavi Kubbeli Mescid / Cami (2. Görselde Koca Yakub'un hemen sağ arkasında yükseliyor!)
    this.buildMosqueAndSquare();

    // 3. Sipahi Konağı ve Çevre Evler
    this.buildHouses();

    // 4. Demirci ve Pazar Tezgahları
    this.buildProps();

    // 5. Çam Ağaçları
    this.populateTrees();

    // 7. Tarım Arazileri (Buğday Tarlaları)
    this.buildFarms();

    // 8. Orman İçi Harami Kampı
    this.buildBanditCamp();

    // 9. Devasa Sancak Kalesi (Haritanın Doğu Ucunda)
    this.buildCastle();

    return {
      colliders: this.colliders,
      animatedObjects: this.animatedObjects,
      interactables: this.interactables,
      horse: this.horseEntity
    };
  }

  createTerrainAndPaths() {
    // Geniş Yeşil Çim Zemin
    const terrainGeo = new THREE.PlaneGeometry(300, 300);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrain = new THREE.Mesh(terrainGeo, this.modelBuilder.materials.grass);
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // 2. Görseldeki Beyaz Taş Parke Köy Meydanı
    const squareGeo = new THREE.PlaneGeometry(60, 80);
    squareGeo.rotateX(-Math.PI / 2);
    const square = new THREE.Mesh(squareGeo, this.modelBuilder.materials.path);
    square.position.set(0, 0, 0);
    square.receiveShadow = true;
    this.scene.add(square);
  }

  buildMosqueAndSquare() {
    // 2. Görselde Koca Yakub'un hemen sağ arkasında yükselen Mavi Kubbeli Cami (x: 10, z: -4)
    const mosque = this.modelBuilder.createMosque();
    mosque.position.set(10, 0, -4);
    this.scene.add(mosque);
    this.addCollider(10, -4, 12, 12);

    // Çeşme
    const fountain = this.modelBuilder.createVillageFountain();
    fountain.position.set(-8, 0, 4);
    this.scene.add(fountain);
  }

  buildHouses() {
    // Sipahi Konağı (Kuzey)
    const mansion = this.modelBuilder.createSipahiMansion();
    mansion.position.set(0, 0, -28);
    this.scene.add(mansion);
    this.addCollider(0, -28, 14, 12);

    // Çevre Safranbolu Evleri
    const houseCoords = [
      { x: -22, z: 8, rot: 0.3 },
      { x: -20, z: -15, rot: -0.2 },
      { x: 24, z: 12, rot: -0.4 },
      { x: 26, z: -20, rot: 0.2 }
    ];

    houseCoords.forEach((coord, idx) => {
      const house = this.modelBuilder.createOttomanHouse(8, 7, 6, idx % 2 === 0);
      house.position.set(coord.x, 0, coord.z);
      house.rotation.y = coord.rot;
      this.scene.add(house);
      this.addCollider(coord.x, coord.z, 9, 8);
    });

    // Tımarlı Sipahi Atı (Konağın Yanında)
    const horse = this.modelBuilder.createHorse(0x28190e);
    horse.position.set(4, 0, -18);
    horse.rotation.y = Math.PI / 4;
    this.scene.add(horse);
    this.horseEntity = horse;
  }

  buildProps() {
    // Pazar Tezgahları
    const stall = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(3, 0.9, 1.6), this.modelBuilder.materials.wood);
    table.position.y = 0.45;
    stall.add(table);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.8 }));
    awning.position.set(0, 2.3, 0);
    stall.add(awning);
    stall.position.set(-14, 0, -2);
    this.scene.add(stall);

    // Meşaleler
    const torchPositions = [[-4, 8], [4, 8], [0, -15]];
    torchPositions.forEach(pos => {
      const torch = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 6), this.modelBuilder.materials.wood);
      pole.position.y = 1.3;
      torch.add(pole);

      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
      flame.position.y = 2.7;
      torch.add(flame);

      const light = new THREE.PointLight(0xff7722, 1.5, 12);
      light.position.y = 2.8;
      torch.add(light);

      torch.position.set(pos[0], 0, pos[1]);
      this.scene.add(torch);
    });
  }

  buildTrainingGrounds() {
    // Okçuluk Hedef Tahtaları
    const targetPositions = [
      { x: -28, z: 22 },
      { x: -25, z: 22 },
      { x: -22, z: 22 }
    ];

    targetPositions.forEach(pos => {
      const targetGroup = new THREE.Group();
      
      // Stand ayakları
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), this.modelBuilder.materials.wood);
      leg1.rotation.z = Math.PI / 8;
      leg1.position.set(-0.4, 0.8, 0);
      
      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), this.modelBuilder.materials.wood);
      leg2.rotation.z = -Math.PI / 8;
      leg2.position.set(0.4, 0.8, 0);
      
      // Hedef Tahtası Yuvarlağı
      const board = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9 })
      );
      board.rotation.x = Math.PI / 2;
      board.position.set(0, 1.2, 0.1);
      
      // Kırmızı Merkez
      const bullseye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.8 })
      );
      bullseye.rotation.x = Math.PI / 2;
      bullseye.position.set(0, 1.2, 0.12);
      
      targetGroup.add(leg1, leg2, board, bullseye);
      targetGroup.position.set(pos.x, 0, pos.z);
      targetGroup.rotation.y = Math.PI / 1.1;
      this.scene.add(targetGroup);
    });

    // Kılıç Eğitim Kuklaları (Wooden Dummies)
    const dummyPositions = [
      { x: -16, z: 28 },
      { x: -12, z: 28 }
    ];

    dummyPositions.forEach(pos => {
      const dummyGroup = new THREE.Group();
      
      // Ana gövde kazığı
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0), this.modelBuilder.materials.wood);
      pole.position.y = 1.0;
      
      // Omuz / Kollar
      const arms = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.15), this.modelBuilder.materials.wood);
      arms.position.y = 1.4;
      
      // Kafa kısmı
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.35), this.modelBuilder.materials.wood);
      head.position.y = 1.9;
      
      dummyGroup.add(pole, arms, head);
      dummyGroup.position.set(pos.x, 0, pos.z);
      this.scene.add(dummyGroup);
      this.addCollider(pos.x, pos.z, 1.5, 1.5);
    });
  }

  populateTrees() {
    // Çevre Çam Ağaçları
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      
      // Köy meydanına ve tarlalara ağaç koyma
      if (Math.abs(x) < 40 && Math.abs(z) < 40) continue;
      if (x > 140 && Math.abs(z) < 50) continue; // Kale yolu temiz
      if (x > 20 && x < 80 && z > 30 && z < 90) continue; // Tarlalar temiz
      
      const tree = this.modelBuilder.createPineTree();
      tree.position.set(x, 0, z);
      
      const scale = 0.8 + Math.random() * 0.6;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = Math.random() * Math.PI;
      
      this.scene.add(tree);
      this.addCollider(x, z, 2, 2);
    }
  }

  buildFarms() {
    // Köyün doğu/güney-doğu tarafında çitlerle çevrili tarlalar (x: 40, z: 60 civarı)
    const farmCenter = { x: 50, z: 60 };
    
    // Tarla Zemin Dokusu (Koyu kahverengi toprak)
    const soilGeo = new THREE.PlaneGeometry(40, 40);
    soilGeo.rotateX(-Math.PI / 2);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1.0 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.set(farmCenter.x, 0.05, farmCenter.z);
    this.scene.add(soil);

    // Etrafına basit tahta çitler
    for (let i = -20; i <= 20; i += 4) {
      // Kuzey - Güney
      this.createFenceSegment(farmCenter.x + i, farmCenter.z - 20, 0);
      this.createFenceSegment(farmCenter.x + i, farmCenter.z + 20, 0);
      // Doğu - Batı
      this.createFenceSegment(farmCenter.x - 20, farmCenter.z + i, Math.PI / 2);
      this.createFenceSegment(farmCenter.x + 20, farmCenter.z + i, Math.PI / 2);
    }

    // Ekili mahsuller (Sarı Buğdaylar)
    const wheatMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.9 });
    const wheatGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    for (let i = 0; i < 150; i++) {
      const wx = farmCenter.x + (Math.random() - 0.5) * 36;
      const wz = farmCenter.z + (Math.random() - 0.5) * 36;
      const wheat = new THREE.Mesh(wheatGeo, wheatMat);
      wheat.position.set(wx, 0.4, wz);
      wheat.rotation.y = Math.random() * Math.PI;
      this.scene.add(wheat);
    }
  }

  createFenceSegment(x, z, rot) {
    const group = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2), this.modelBuilder.materials.wood);
    post.position.set(0, 0.6, 0);
    const plank1 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.05), this.modelBuilder.materials.wood);
    plank1.position.set(2, 0.8, 0);
    const plank2 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.05), this.modelBuilder.materials.wood);
    plank2.position.set(2, 0.4, 0);
    
    group.add(post, plank1, plank2);
    group.position.set(x, 0, z);
    group.rotation.y = rot;
    this.scene.add(group);
  }

  buildBanditCamp() {
    // Haritanın kuzey-batı derinlikleri
    const campX = -80;
    const campZ = -90;

    // Kamp Ateşi
    const fireGroup = new THREE.Group();
    // Odunlar
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2), this.modelBuilder.materials.wood);
      log.rotation.x = Math.PI / 2;
      log.rotation.z = (Math.PI / 4) * i;
      log.position.y = 0.1;
      fireGroup.add(log);
    }
    // Alev ve Işık
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
    flame.position.y = 0.4;
    const light = new THREE.PointLight(0xff5500, 2.0, 30);
    light.position.y = 1.0;
    fireGroup.add(flame, light);
    fireGroup.position.set(campX, 0, campZ);
    this.scene.add(fireGroup);

    // Yırtık Çadırlar
    const tentPositions = [
      { x: campX - 5, z: campZ - 4, rot: 0.5 },
      { x: campX + 6, z: campZ - 3, rot: -0.5 },
      { x: campX, z: campZ + 6, rot: 3.14 }
    ];

    tentPositions.forEach(pos => {
      const tentGeo = new THREE.ConeGeometry(2.5, 3.5, 4);
      const tentMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
      const tent = new THREE.Mesh(tentGeo, tentMat);
      tent.position.set(pos.x, 1.75, pos.z);
      tent.rotation.y = Math.PI / 4 + pos.rot;
      this.scene.add(tent);
      this.addCollider(pos.x, pos.z, 3.5, 3.5);
    });
  }

  buildCastle() {
    // Sancak Kalesi (Haritanın Doğu ucu)
    const castleX = 180;
    const castleZ = 0;

    const castleGroup = new THREE.Group();

    // Taş Zemin / Avlu
    const yardGeo = new THREE.PlaneGeometry(60, 60);
    yardGeo.rotateX(-Math.PI / 2);
    const yard = new THREE.Mesh(yardGeo, this.modelBuilder.materials.wall);
    yard.position.set(0, 0.1, 0);
    castleGroup.add(yard);

    // Ana Surlar (Dört taraf)
    const wallGeo = new THREE.BoxGeometry(60, 6, 2);
    const wallN = new THREE.Mesh(wallGeo, this.modelBuilder.materials.wall);
    wallN.position.set(0, 3, -30);
    const wallS = new THREE.Mesh(wallGeo, this.modelBuilder.materials.wall);
    wallS.position.set(0, 3, 30);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 60), this.modelBuilder.materials.wall);
    wallE.position.set(30, 3, 0);
    
    // Batı Duvarı (Kapı var)
    const wallW1 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 26), this.modelBuilder.materials.wall);
    wallW1.position.set(-30, 3, -17);
    const wallW2 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 26), this.modelBuilder.materials.wall);
    wallW2.position.set(-30, 3, 17);
    
    // Kemerli Kapı
    const gateGeo = new THREE.BoxGeometry(2, 4, 8);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 }); // Koyu Ahşap Kapı
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(-30, 2, 0);

    castleGroup.add(wallN, wallS, wallE, wallW1, wallW2, gate);

    // Nöbetçi Kuleleri (4 Köşe)
    const towerGeo = new THREE.CylinderGeometry(3, 3, 10, 8);
    const corners = [
      { x: -30, z: -30 }, { x: 30, z: -30 },
      { x: 30, z: 30 }, { x: -30, z: 30 }
    ];
    
    corners.forEach(c => {
      const tower = new THREE.Mesh(towerGeo, this.modelBuilder.materials.wall);
      tower.position.set(c.x, 5, c.z);
      
      // Kule Çatısı
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 4, 8), new THREE.MeshStandardMaterial({ color: 0x8b1e1e })); // Kırmızı çatı
      roof.position.set(c.x, 12, c.z);
      
      castleGroup.add(tower, roof);
    });

    // Ana Hisar (Keep)
    const keepGeo = new THREE.BoxGeometry(20, 15, 20);
    const keep = new THREE.Mesh(keepGeo, this.modelBuilder.materials.wall);
    keep.position.set(10, 7.5, 0);
    castleGroup.add(keep);

    // Kırmızı Sancaklar (Bayraklar)
    const flagPositions = [{ x: -30, z: -10 }, { x: -30, z: 10 }];
    flagPositions.forEach(p => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), this.modelBuilder.materials.wood);
      pole.position.set(p.x, 8, p.z);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), new THREE.MeshBasicMaterial({ color: 0xcc0000, side: THREE.DoubleSide }));
      flag.position.set(p.x + 1, 9, p.z);
      castleGroup.add(pole, flag);
    });

    castleGroup.position.set(castleX, 0, castleZ);
    this.scene.add(castleGroup);

    // Çarpışma Alanları
    this.addCollider(castleX, castleZ - 30, 60, 2); // N
    this.addCollider(castleX, castleZ + 30, 60, 2); // S
    this.addCollider(castleX + 30, castleZ, 2, 60); // E
    this.addCollider(castleX - 30, castleZ - 17, 2, 26); // W1
    this.addCollider(castleX - 30, castleZ + 17, 2, 26); // W2
    this.addCollider(castleX + 10, castleZ, 20, 20); // Keep
  }

  addCollider(x, z, w, d) {
    this.colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2
    });
  }

  update(delta) {}
}
