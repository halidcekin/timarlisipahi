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

  populateTrees() {
    // Çevre Çam Ağaçları
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 38 + (i % 3) * 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const tree = this.modelBuilder.createTree(i % 3 === 0 ? 'oak' : 'pine');
      tree.position.set(x, 0, z);
      this.scene.add(tree);
    }
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
