import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder.js';

/**
 * TownGenerator - Akçaoba Tımarı & Osmanlı Köyü Devasa 3D Dünya Üreticisi
 * - Geniş Yeşil Vadi, Kıvrımlı Nehir & Kemerli Taş Köprü
 * - Mavi Kubbeli Ulu Mescid, Hazire (Servili Mezarlık) & Mermer Şadırvan
 * - Büyük Sipahi Konağı, At Tavlası, Talimgâh & Gözetleme Kulesi
 * - 12+ Tarihi Safranbolu Evi, Cumbalar, Ahşap Hatıllar & Bacalar
 * - Demirci Rüstem Usta Atölyesi, Su Kuyusu, Köy Hanı & Pazar Çarşısı
 * - Yeldeğirmeni, Çitlerle Çevrili Buğday Tarlaları, Saman Balyaları & At Arabaları
 * - Köy Giriş Kapısı, Sancak Kalesi & Orman İçi Harami Kampı
 */
export class TownGenerator {
  constructor(scene) {
    this.scene = scene;
    this.modelBuilder = new ModelBuilder();
    this.colliders = [];
    this.animatedObjects = [];
    this.interactables = [];
    this.damageables = [];
    this.archeryTargets = [];
    this.horseEntity = null;
  }

  static getTerrainHeight(x, z) {
    // Vadi tabanı düz, nehir yatağı hafif alçak
    if (x > -50 && x < -40) return -0.4;
    // Değirmen tepesi hafif yükselti
    if (x > 35 && x < 55 && z > -50 && z < -30) return 1.2;
    return 0;
  }

  addCollider(x, z, width, depth) {
    this.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
  }

  generateTown() {
    // 1. Zemin, Yollar, Nehir & Ufuk Dağları
    this.createLandscapeAndRiver();

    // 2. Merkez Meydan: Ulu Mescid, Şadırvan, Meclis & Hazire
    this.buildCenterSquare();

    // 3. Kuzey Quarter: Sipahi Konağı, Tavla, Talimgâh & Kule
    this.buildSipahiQuarter();

    // 4. Batı Quarter: Nehir, Kemerli Taş Köprü & Demirci Atölyesi
    this.buildBlacksmithAndBridge();

    // 4B. Su Değirmeni & Kırık Su Bendi (Nehir Arkı - x: -45, z: 22)
    this.buildWaterMillAndDam();

    // 5. Güney Quarter: Köy Çarşısı, Han, Su Kuyusu & Giriş Kapısı
    this.buildMarketAndVillageGate();

    // 6. Doğu Quarter: Yeldeğirmeni & Geniş Buğday Tarlaları
    this.buildWindmillAndFarms();

    // 7. Safranbolu Evleri & Mahalle Dokusu (12+ Farklı Konak)
    this.buildResidentialHouses();

    // 8. Osmanlı Hamamı (Kubbe, Sekizgen Göbek Taşı, 4 Mermer Kurna, Buhar)
    this.buildHamam();

    // 9. Sancak Kalesi & Doğu Taş Yolu (Okçuluk Talim Poligonu Dahil)
    this.buildCastleDistrict();

    // 10. Harami / Eşkıya Kampı (Kuzeybatı Ormanı)
    this.buildBanditCamp();

    // 11. Çevre Bitki Örtüsü (120+ Çam, Servi, Meşe, Çim & Çiçekler)
    this.populateNatureAndFoliage();

    // 12. Köy Hayvanları (Otlayan Koyunlar & Tavuklar)
    this.spawnVillageFauna();

    // 13. Kırılabilir Fıçılar & Saman Balyaları
    this.spawnBreakableObjects();

    // 14. Uyku Sedirleri & Yatakları
    this.setupSedirBeds();

    return {
      colliders: this.colliders,
      animatedObjects: this.animatedObjects,
      interactables: this.interactables,
      damageables: this.damageables,
      archeryTargets: this.archeryTargets,
      horse: this.horseEntity
    };
  }

  // ---------------------------------------------------------------------------
  // 1. ZEMİN, NEHİR, TAŞ YOLLAR & UFUK DAĞLARI
  // ---------------------------------------------------------------------------
  createLandscapeAndRiver() {
    // Geniş Yeşil Çim Zemin (500x500)
    const terrainGeo = new THREE.PlaneGeometry(550, 550, 40, 40);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrain = new THREE.Mesh(terrainGeo, this.modelBuilder.materials.grass);
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // Kıvrımlı Nehir Yatağı (Batı Vadisi: x: -45 boyunca kuzeyden güneye)
    const riverGeo = new THREE.PlaneGeometry(16, 450);
    riverGeo.rotateX(-Math.PI / 2);
    const river = new THREE.Mesh(riverGeo, this.modelBuilder.materials.water);
    river.position.set(-45, -0.25, 0);
    this.scene.add(river);

    // Nehir Kenarı Kıyı Taşları ve Çakılları
    for (let z = -180; z <= 180; z += 18) {
      for (let side of [-1, 1]) {
        const rock = this.modelBuilder.createMossyRock(0.8 + Math.random() * 0.6);
        rock.position.set(-45 + side * 8.5, 0.1, z + (Math.random() - 0.5) * 8);
        this.scene.add(rock);
      }
    }

    // Ana Köy Meydanı Arnavut Kaldırımı (65x85)
    const squareGeo = new THREE.PlaneGeometry(65, 85, 16, 16);
    squareGeo.rotateX(-Math.PI / 2);
    const square = new THREE.Mesh(squareGeo, this.modelBuilder.materials.path);
    square.position.set(0, 0.01, 0);
    square.receiveShadow = true;
    this.scene.add(square);

    // Bağlantı Taş Yolları
    const roadConfigs = [
      { x: 0, z: 65, w: 10, l: 60, rot: 0 },         // Güney Çarşı ve Giriş Kapısı Yolu
      { x: 0, z: -35, w: 12, l: 30, rot: 0 },        // Kuzey Konağı Yolu
      { x: -25, z: 0, w: 9, l: 35, rot: Math.PI / 2 },// Batı Köprü Yolu
      { x: 50, z: 0, w: 8, l: 80, rot: Math.PI / 2 } // Doğu Tarlalar ve Kale Yolu
    ];

    roadConfigs.forEach(r => {
      const roadGeo = new THREE.PlaneGeometry(r.w, r.l);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, this.modelBuilder.materials.path);
      road.position.set(r.x, 0.012, r.z);
      road.rotation.y = r.rot;
      road.receiveShadow = true;
      this.scene.add(road);
    });

    // Ufuk Dağları (360 Derece Çevreleyen Görkemli Dağ Sıraları)
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x3d4e5a,
      roughness: 0.95
    });
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 10) {
      const dist = 240 + Math.random() * 30;
      const mx = Math.cos(angle) * dist;
      const mz = Math.sin(angle) * dist;
      const mH = 50 + Math.random() * 45;
      const mW = 60 + Math.random() * 40;

      const mountain = new THREE.Mesh(new THREE.ConeGeometry(mW, mH, 6), mountainMat);
      mountain.position.set(mx, mH / 2 - 5, mz);
      mountain.rotation.y = Math.random() * Math.PI;
      this.scene.add(mountain);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. MERKEZ MEYDAN: CAMİ, ŞADIRVAN, HAZİRE & KOCA YAKUB ALANI
  // ---------------------------------------------------------------------------
  buildCenterSquare() {
    // Mavi Kubbeli Ulu Mescid (x: 12, z: -4)
    const mosque = this.modelBuilder.createMosque();
    mosque.position.set(12, 0, -4);
    this.scene.add(mosque);
    this.addCollider(12, -4, 14, 14);

    // Mermer Şadırvan & Su Havuzu (x: -8, z: 4)
    const fountain = this.modelBuilder.createVillageFountain();
    fountain.position.set(-8, 0, 4);
    this.scene.add(fountain);
    this.addCollider(-8, 4, 3.5, 3.5);

    // Mescid Yanı Hazire (Tarihi Servi Ağaçlı Osmanlı Mezarlığı: x: 25, z: -6)
    const hazireGroup = new THREE.Group();
    for (let tx = 0; tx < 3; tx++) {
      for (let tz = 0; tz < 3; tz++) {
        const tomb = this.modelBuilder.createOttomanTombstone();
        tomb.position.set(22 + tx * 3.2, 0, -12 + tz * 3.6);
        hazireGroup.add(tomb);
      }
    }

    // Hazireyi Çevreleyen Zarif Servi Ağaçları
    const cypressCoords = [
      { x: 19, z: -14 }, { x: 31, z: -14 },
      { x: 19, z: -3 }, { x: 31, z: -3 }
    ];
    cypressCoords.forEach(c => {
      const cypress = this.modelBuilder.createCypressTree();
      cypress.position.set(c.x, 0, c.z);
      hazireGroup.add(cypress);
      this.addCollider(c.x, c.z, 1.5, 1.5);
    });

    this.scene.add(hazireGroup);
  }

  // ---------------------------------------------------------------------------
  // 3. KUZEY QUARTER: SİPAHİ KONAĞI, AT TAVLASI, TALİMGÂH & GÖZCÜ KULESİ
  // ---------------------------------------------------------------------------
  buildSipahiQuarter() {
    // 2 Katlı Büyük Sipahi Konağı (x: 0, z: -32)
    const mansion = this.modelBuilder.createSipahiMansion();
    mansion.position.set(0, 0, -32);
    this.scene.add(mansion);
    this.addCollider(0, -32, 16, 14);

    // At Tavlası & Samanlık (Konağın Sol Yanı: x: -14, z: -30)
    const stable = new THREE.Group();
    const sBase = new THREE.Mesh(new THREE.BoxGeometry(9, 4.2, 7), this.modelBuilder.materials.wood);
    sBase.position.y = 2.1;
    sBase.castShadow = true;
    stable.add(sBase);

    const sRoof = new THREE.Mesh(new THREE.ConeGeometry(7, 2.5, 4), this.modelBuilder.materials.roof);
    sRoof.position.y = 5.2;
    sRoof.rotation.y = Math.PI / 4;
    stable.add(sRoof);
    stable.position.set(-14, 0, -30);
    this.scene.add(stable);
    this.addCollider(-14, -30, 10, 8);

    // Tımarlı Sipahi Savaş Atı (x: 4, z: -20)
    const horse = this.modelBuilder.createHorse(0x2b180d);
    horse.position.set(4, 0, -20);
    horse.rotation.y = Math.PI / 4;
    this.scene.add(horse);
    this.horseEntity = horse;

    // Sipahi Talimgâhı (Okçuluk Hedefleri & Kılıç Kuklaları: x: 14, z: -28)
    for (let i = 0; i < 3; i++) {
      // Hedef Tahtası
      const target = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), this.modelBuilder.materials.wood);
      post.position.y = 1.1;
      const board = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0xe0d6c0 }));
      board.position.set(0, 1.4, 0.08);
      board.rotation.x = Math.PI / 2;
      const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0x9e1e1e }));
      bullseye.position.set(0, 1.4, 0.10);
      bullseye.rotation.x = Math.PI / 2;
      target.add(post, board, bullseye);
      target.position.set(12 + i * 2.5, 0, -28);
      this.scene.add(target);
    }

    // Ahşap Gözetleme Kulesi (x: -18, z: -45)
    const watchtower = new THREE.Group();
    const tPoles = [-1.5, 1.5];
    tPoles.forEach(dx => {
      tPoles.forEach(dz => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 9, 8), this.modelBuilder.materials.wood);
        pole.position.set(dx, 4.5, dz);
        pole.castShadow = true;
        watchtower.add(pole);
      });
    });

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 4.2), this.modelBuilder.materials.wood);
    cabin.position.y = 9.2;
    const cRoof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2.2, 4), this.modelBuilder.materials.roof);
    cRoof.position.y = 11.4;
    cRoof.rotation.y = Math.PI / 4;
    watchtower.add(cabin, cRoof);
    watchtower.position.set(-18, 0, -45);
    this.scene.add(watchtower);
    this.addCollider(-18, -45, 5, 5);
  }

  // ---------------------------------------------------------------------------
  // 4. BATI QUARTER: KEMERLİ TAŞ KÖPRÜ & DEMİRCİ RÜSTEM USTA ATÖLYESİ
  // ---------------------------------------------------------------------------
  buildBlacksmithAndBridge() {
    // Tarihi Kemerli Taş Köprü (x: -45, z: 0)
    const bridge = this.modelBuilder.createStoneArchBridge(26, 7.5);
    bridge.position.set(-45, 0, 0);
    this.scene.add(bridge);
    this.addCollider(-45, 0, 8, 26);

    // Demirci Rüstem Usta Atölyesi (x: -62, z: 8)
    const forge = this.modelBuilder.createBlacksmithShop();
    forge.position.set(-62, 0, 8);
    this.scene.add(forge);
    // İçeri rahat giriş için sadece 3 duvara collider eklendi, ön cephe tamamen açık
    this.addCollider(-62, 8 + 4.4, 11.5, 0.8); // Arka duvar
    this.addCollider(-62 - 5.5, 8, 0.8, 9.2);  // Sol duvar
    this.addCollider(-62 + 5.5, 8, 0.8, 9.2);  // Sağ duvar

    // Alevli Demirci Ocağı & Işık (Forge Fire)
    const forgeFire = new THREE.PointLight(0xff5500, 2.4, 18);
    forgeFire.position.set(-62, 2.2, 8);
    this.scene.add(forgeFire);

    // Demirci Örsü (Anvil) & Su Teknesi
    const anvilMat = new THREE.MeshStandardMaterial({ color: 0x24282c, metalness: 0.9, roughness: 0.25 });
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.2), anvilMat);
    anvil.position.set(-58, 0.4, 6);
    this.scene.add(anvil);
  }

  // ---------------------------------------------------------------------------
  // 4B. SU DEĞİRMENİ & KIRIK SU BENDİ (x: -45, z: 22)
  // ---------------------------------------------------------------------------
  buildWaterMillAndDam() {
    const millGroup = new THREE.Group();

    // 1. Taş & Ahşap Değirmen Binası
    const millBase = new THREE.Mesh(
      new THREE.BoxGeometry(7, 5, 8),
      this.modelBuilder.materials.stone
    );
    millBase.position.set(-51, 2.5, 22);
    millBase.castShadow = true;
    millBase.receiveShadow = true;

    // Ahşap Üst Kat & Kiremit Çatı
    const millRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5.5, 3.5, 4),
      this.modelBuilder.materials.roof
    );
    millRoof.position.set(-51, 6.75, 22);
    millRoof.rotation.y = Math.PI / 4;

    // 2. Büyük Dönen Su Çarkı (Nehir Yatağında - Geleneksel 12 Kollu Su Çarkı)
    const wheelGroup = new THREE.Group();

    // Ana Ahşap Mil (Axle / Shaft)
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12),
      this.modelBuilder.materials.wood
    );
    axle.rotation.x = Math.PI / 2;
    wheelGroup.add(axle);

    // Çark Göbeği (Hub)
    const wheelCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.95, 16),
      this.modelBuilder.materials.wood
    );
    wheelCenter.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelCenter);

    // Çift Ahşap Kasnak / Çember (Dual Outer Rims)
    for (let zOffset of [-0.4, 0.4]) {
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.08, 8, 32),
        this.modelBuilder.materials.wood
      );
      rim.position.z = zOffset;
      wheelGroup.add(rim);
    }

    // 12 Adet Radyal Parmak Kirişi (Spokes) & Su Kepçesi (Paddles)
    const spokeCount = 12;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * 2 * Math.PI) / spokeCount;

      // Merkezden dışa uzanan radyal ahşap kiriş
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.1, 0.1),
        this.modelBuilder.materials.wood
      );
      spoke.position.set(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0);
      spoke.rotation.z = angle - Math.PI / 2;
      wheelGroup.add(spoke);

      // Çember ucundaki su tutucu kepçe / kanat tahtası
      const paddle = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.55, 0.85),
        this.modelBuilder.materials.wood
      );
      paddle.position.set(Math.cos(angle) * 2.15, Math.sin(angle) * 2.15, 0);
      paddle.rotation.z = angle - Math.PI / 2;
      wheelGroup.add(paddle);
    }

    wheelGroup.position.set(-46.5, 1.8, 22);
    wheelGroup.name = 'waterMillWheel';
    millGroup.add(millBase, millRoof, wheelGroup);

    // 3. Kırık Taş Su Bendi (Broken Weir / Dam)
    const damGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(1.2 + Math.random() * 0.6, 1.1 + Math.random() * 0.5, 1.4),
        this.modelBuilder.materials.stone
      );
      stone.position.set(-45 + (i - 2.5) * 1.4, 0.5, 25.5 + (Math.random() - 0.5) * 0.8);
      stone.rotation.set(Math.random() * 0.2, Math.random() * 0.4, Math.random() * 0.3);
      stone.castShadow = true;
      damGroup.add(stone);
    }

    // İnceleme & İşaret Direği (Kanıt Noktası)
    const inspectPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 2.4),
      this.modelBuilder.materials.wood
    );
    inspectPost.position.set(-44.2, 1.2, 22);
    const postBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.1),
      this.modelBuilder.materials.wood
    );
    postBoard.position.set(-44.2, 2.1, 22);
    inspectPost.add(postBoard);
    damGroup.add(inspectPost);

    millGroup.add(damGroup);
    this.scene.add(millGroup);

    this.waterMillWheel = wheelGroup;
    this.animatedObjects.push({
      userData: {
        customUpdate: (delta) => {
          if (wheelGroup) {
            wheelGroup.rotation.z += delta * 1.2;
          }
        }
      }
    });

    this.addCollider(-51, 22, 7.5, 8.5);
    this.addCollider(-45, 25.5, 8.0, 2.0);
  }

  // ---------------------------------------------------------------------------
  // 5. GÜNEY QUARTER: ÇARŞI, KÖY HANI, SU KUYUSU & KÖY GİRİŞ KAPISI
  // ---------------------------------------------------------------------------
  buildMarketAndVillageGate() {
    // 1. Köy Hanı / Kıraathanesi (x: -16, z: 28)
    const inn = this.modelBuilder.createOttomanHouse(11, 9, 7.2, true);
    inn.position.set(-16, 0, 28);
    this.scene.add(inn);
    this.addCollider(-16, 28, 12, 10);

    // Han Önü Açık Hava Sedirleri ve Masalar
    for (let mx of [-10, -6]) {
      const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.4), this.modelBuilder.materials.wood);
      table.position.set(mx, 0.4, 24);
      table.castShadow = true;
      this.scene.add(table);

      for (let sx of [-1.2, 1.2]) {
        const stool = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), this.modelBuilder.materials.wood);
        stool.position.set(mx + sx, 0.25, 24);
        this.scene.add(stool);
      }
    }

    // 2. Köy Su Kuyusu (x: 8, z: 26)
    const well = this.modelBuilder.createWaterWell();
    well.position.set(8, 0, 26);
    this.scene.add(well);
    this.addCollider(8, 26, 3, 3);

    // 3. Pazar Tezgahları (Bazaar Stalls)
    const stalls = [
      { x: -10, z: 14, color: 0x8b1e1e },
      { x: 10, z: 16, color: 0x1d4e70 },
      { x: 12, z: 32, color: 0x8b6508 }
    ];

    stalls.forEach(s => {
      const stall = new THREE.Group();
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 1.8), this.modelBuilder.materials.wood);
      tbl.position.y = 0.45;
      stall.add(tbl);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.8 }));
      awning.position.y = 2.3;
      stall.add(awning);

      stall.position.set(s.x, 0, s.z);
      this.scene.add(stall);
      this.addCollider(s.x, s.z, 3.5, 2.2);
    });

    // 4. Ahşap At Arabaları (Wagons)
    const wagon1 = this.modelBuilder.createWagon();
    wagon1.position.set(16, 0, 38);
    wagon1.rotation.y = 0.35;
    this.scene.add(wagon1);
    this.addCollider(16, 38, 3, 4);

    // 5. Köy Giriş Kapısı & Hisar Çitleri (x: 0, z: 75)
    const gate = this.modelBuilder.createVillageGate();
    gate.position.set(0, 0, 75);
    this.scene.add(gate);
    this.addCollider(0, 75, 14, 4);

    // Giriş Çitleri (Palisades)
    for (let x = -35; x <= 35; x += 4) {
      if (Math.abs(x) < 6) continue; // Kapı boşluğu
      this.createFenceSegment(x, 75, 0);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. DOĞU QUARTER: YELDEĞİRMENİ & BUĞDAY TARLALARI
  // ---------------------------------------------------------------------------
  buildWindmillAndFarms() {
    // Yeldeğirmeni (x: 48, z: -38 - Tepe Üzerinde)
    const windmill = this.modelBuilder.createWindmill();
    windmill.position.set(48, 0, -38);
    this.scene.add(windmill);
    this.addCollider(48, -38, 9, 9);
    this.animatedObjects.push(windmill);

    // Çitlerle Çevrili Geniş Buğday Tarlaları (x: 55, z: 35 to 85)
    const farmCenter = { x: 55, z: 50 };
    const soilGeo = new THREE.PlaneGeometry(45, 55);
    soilGeo.rotateX(-Math.PI / 2);
    const soil = new THREE.Mesh(soilGeo, new THREE.MeshStandardMaterial({ color: 0x3b2614, roughness: 1.0 }));
    soil.position.set(farmCenter.x, 0.03, farmCenter.z);
    this.scene.add(soil);

    // Tarla Çitleri
    for (let x = -22; x <= 22; x += 4) {
      this.createFenceSegment(farmCenter.x + x, farmCenter.z - 27, 0);
      this.createFenceSegment(farmCenter.x + x, farmCenter.z + 27, 0);
    }
    for (let z = -27; z <= 27; z += 4) {
      this.createFenceSegment(farmCenter.x - 22, farmCenter.z + z, Math.PI / 2);
      this.createFenceSegment(farmCenter.x + 22, farmCenter.z + z, Math.PI / 2);
    }

    // 250+ Altın Buğday Başağı
    const wheatMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.85 });
    const wheatGeo = new THREE.BoxGeometry(0.18, 0.95, 0.18);
    for (let i = 0; i < 220; i++) {
      const wx = farmCenter.x + (Math.random() - 0.5) * 40;
      const wz = farmCenter.z + (Math.random() - 0.5) * 50;
      const wheat = new THREE.Mesh(wheatGeo, wheatMat);
      wheat.position.set(wx, 0.48, wz);
      wheat.rotation.y = Math.random() * Math.PI;
      this.scene.add(wheat);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. SAFRANBOLU KONAKLARI & MAHALLE DOKUSU (12+ EV)
  // ---------------------------------------------------------------------------
  buildResidentialHouses() {
    const houseConfigs = [
      // Merkez & Meydan Çevresi
      { x: -22, z: 8, w: 8.5, l: 7.5, h: 6.8, rot: 0.35 },
      { x: -20, z: -15, w: 8.0, l: 7.0, h: 6.5, rot: -0.25 },
      { x: 26, z: 12, w: 9.0, l: 8.0, h: 7.0, rot: -0.45 },
      { x: 28, z: -22, w: 8.5, l: 7.5, h: 6.8, rot: 0.25 },

      // Güney Çarşı Mahallesi
      { x: -24, z: 42, w: 8.0, l: 7.0, h: 6.5, rot: 0.15 },
      { x: -22, z: 58, w: 8.5, l: 7.5, h: 6.8, rot: -0.20 },
      { x: 24, z: 48, w: 9.0, l: 8.0, h: 7.0, rot: -0.30 },
      { x: 22, z: 65, w: 8.0, l: 7.0, h: 6.5, rot: 0.40 },

      // Batı Köprübaşı & Nehir Boyu
      { x: -32, z: -25, w: 8.0, l: 7.0, h: 6.5, rot: 0.60 },
      { x: -30, z: 22, w: 8.5, l: 7.5, h: 6.8, rot: -0.50 },

      // Doğu Değirmen Yolu
      { x: 32, z: -45, w: 8.0, l: 7.0, h: 6.5, rot: 0.10 },
      { x: 28, z: 32, w: 8.5, l: 7.5, h: 6.8, rot: -0.15 }
    ];

    houseConfigs.forEach((cfg, idx) => {
      const house = this.modelBuilder.createOttomanHouse(cfg.w, cfg.l, cfg.h, idx % 2 === 0);
      house.position.set(cfg.x, 0, cfg.z);
      house.rotation.y = cfg.rot;
      this.scene.add(house);
      this.addCollider(cfg.x, cfg.z, cfg.w + 1, cfg.l + 1);
    });
  }

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // 8. OSMANLI HAMAMI (KUBBE, MERMER GÖBEK TAŞI, 4 KURNA & SICAK BUHAR)
  // ---------------------------------------------------------------------------
  buildHamam() {
    const hamamX = 32;
    const hamamZ = 26;
    const hamamGroup = new THREE.Group();

    // 1. Taş Dış Duvarlar (16x14 metre genişlik, 5 metre yükseklik)
    const wallMat = this.modelBuilder.materials.wall;
    const hamamWalls = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 14), wallMat);
    hamamWalls.position.y = 2.5;
    hamamWalls.castShadow = true;
    hamamWalls.receiveShadow = true;
    hamamGroup.add(hamamWalls);

    // 2. Hamam Giriş Kapısı (Ön Cephede Açıklık)
    const doorMat = this.modelBuilder.materials.wood;
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 0.4), doorMat);
    door.position.set(0, 1.7, 7.1);
    hamamGroup.add(door);

    // 3. Büyük Sıcaklık Kubbesi (Cam Gözlü Kurşun Kubbe)
    const domeMat = this.modelBuilder.materials.domeBlue;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(6.8, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      domeMat
    );
    dome.position.set(0, 5.0, 0);
    dome.castShadow = true;
    hamamGroup.add(dome);

    // Kubbe Tepesi Aydınlık Cam Feneri
    const lantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.9, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xe0e8f0, roughness: 0.2, metalness: 0.3 })
    );
    lantern.position.set(0, 11.8, 0);
    hamamGroup.add(lantern);

    // 4. Mermer Zemin Kaplaması
    const marbleFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 13),
      new THREE.MeshStandardMaterial({ color: 0xededf2, roughness: 0.2, metalness: 0.05 })
    );
    marbleFloor.rotation.x = -Math.PI / 2;
    marbleFloor.position.y = 0.05;
    marbleFloor.receiveShadow = true;
    hamamGroup.add(marbleFloor);

    // 5. Merkezde Büyük Sekizgen Mermer Göbek Taşı
    const gobekTasi = this.modelBuilder.createGobekTasi();
    gobekTasi.position.set(0, 0, 0);
    hamamGroup.add(gobekTasi);

    // 6. Dört Duvar Kenarında Pirinç Musluklu Mermer Kurnalar & Taslar
    const kurnaOffsets = [
      { x: -5.8, z: 0, rot: Math.PI / 2 },   // Batı Kurna
      { x: 5.8, z: 0, rot: -Math.PI / 2 },  // Doğu Kurna
      { x: 0, z: -5.0, rot: 0 },            // Kuzey Kurna
      { x: -3.5, z: 5.0, rot: Math.PI }     // Güney Kurna (Kapı yanı)
    ];

    kurnaOffsets.forEach(k => {
      const kurna = this.modelBuilder.createHamamKurna();
      kurna.position.set(k.x, 0, k.z);
      kurna.rotation.y = k.rot;
      hamamGroup.add(kurna);
    });

    // 7. Loş ve Sıcak Kehribar Hamam Fener Işığı
    const hamamLight = new THREE.PointLight(0xffaa44, 2.2, 22);
    hamamLight.position.set(0, 4.2, 0);
    hamamGroup.add(hamamLight);

    hamamGroup.position.set(hamamX, 0, hamamZ);
    this.scene.add(hamamGroup);

    // Dış Duvar Çarpışma Kutuları (Kapı geçişi serbest)
    this.addCollider(hamamX - 8, hamamZ, 1.5, 14); // Batı
    this.addCollider(hamamX + 8, hamamZ, 1.5, 14); // Doğu
    this.addCollider(hamamX, hamamZ - 7, 16, 1.5); // Kuzey
    this.addCollider(hamamX - 5, hamamZ + 7, 6, 1.5); // Güney Sol
    this.addCollider(hamamX + 5, hamamZ + 7, 6, 1.5); // Güney Sağ
  }

  // ---------------------------------------------------------------------------
  // 9. SANCAK KALESİ, TAŞ YOL & OKÇULUK TALİM POLİGONU
  // ---------------------------------------------------------------------------
  buildCastleDistrict() {
    this.buildCastle();
    this.buildStoneRoadToCastle();
    this.buildArcheryRange();
  }

  buildArcheryRange() {
    const rangeX = 175;
    const rangeZ = -10;

    // 1. Ok Hedef Panosu (10 metre ilerde: x: 175, z: -22)
    const target = this.modelBuilder.createArcheryTarget();
    target.position.set(rangeX, 0, -22);
    this.scene.add(target);

    this.archeryTargets.push({
      mesh: target,
      position: new THREE.Vector3(rangeX, 1.6, -22),
      radiusBullseye: 0.40,
      radiusMid: 0.85,
      radiusOuter: 1.40
    });

    // 2. Okçu Atış Çizgisi & Ahşap Barikat
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.7 });
    const shootingLine = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 0.3), lineMat);
    shootingLine.position.set(rangeX, 0.05, rangeZ);
    this.scene.add(shootingLine);

    // Yay Sehbası
    const stand = this.modelBuilder.createWeaponRack();
    stand.position.set(rangeX + 2.5, 0, rangeZ);
    stand.rotation.y = -Math.PI / 2;
    this.scene.add(stand);
  }

  buildCastle() {
    const castleX = 180;
    const castleZ = 0;
    const castleGroup = new THREE.Group();

    // Taş Avlu
    const yardGeo = new THREE.PlaneGeometry(60, 60);
    yardGeo.rotateX(-Math.PI / 2);
    const yard = new THREE.Mesh(yardGeo, this.modelBuilder.materials.wall);
    yard.position.set(0, 0.1, 0);
    castleGroup.add(yard);

    // Ana Surlar (Dört Taraf)
    const wallGeo = new THREE.BoxGeometry(60, 7.5, 2.5);
    const wallN = new THREE.Mesh(wallGeo, this.modelBuilder.materials.wall);
    wallN.position.set(0, 3.75, -30);
    const wallS = new THREE.Mesh(wallGeo, this.modelBuilder.materials.wall);
    wallS.position.set(0, 3.75, 30);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(2.5, 7.5, 60), this.modelBuilder.materials.wall);
    wallE.position.set(30, 3.75, 0);

    const wallW1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 7.5, 26), this.modelBuilder.materials.wall);
    wallW1.position.set(-30, 3.75, -17);
    const wallW2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 7.5, 26), this.modelBuilder.materials.wall);
    wallW2.position.set(-30, 3.75, 17);

    // Kapı
    const gate = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5, 8), new THREE.MeshStandardMaterial({ color: 0x2b190e }));
    gate.position.set(-30, 2.5, 0);

    castleGroup.add(wallN, wallS, wallE, wallW1, wallW2, gate);

    // 4 Köşe Nöbetçi Kuleleri
    const corners = [{ x: -30, z: -30 }, { x: 30, z: -30 }, { x: 30, z: 30 }, { x: -30, z: 30 }];
    corners.forEach(c => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 12, 10), this.modelBuilder.materials.wall);
      tower.position.set(c.x, 6, c.z);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 4.5, 10), this.modelBuilder.materials.roof);
      roof.position.set(c.x, 14.2, c.z);
      castleGroup.add(tower, roof);
    });

    // Ana Hisar (Keep)
    const keep = new THREE.Mesh(new THREE.BoxGeometry(22, 16, 22), this.modelBuilder.materials.wall);
    keep.position.set(10, 8, 0);
    castleGroup.add(keep);

    castleGroup.position.set(castleX, 0, castleZ);
    this.scene.add(castleGroup);
    this.addCollider(castleX, castleZ - 30, 60, 2); // N
    this.addCollider(castleX, castleZ + 30, 60, 2); // S
    this.addCollider(castleX + 30, castleZ, 2, 60); // E
    this.addCollider(castleX - 30, castleZ - 17, 2, 26); // W1
    this.addCollider(castleX - 30, castleZ + 17, 2, 26); // W2
    this.addCollider(castleX + 10, castleZ, 20, 20); // Keep
  }

  /**
   * Köyden Sancak Kalesi'ne Uzanan 3D Taş Yol (Cobblestone Highway)
   */
  buildStoneRoadToCastle() {
    const roadGroup = new THREE.Group();
    const stoneMat1 = new THREE.MeshStandardMaterial({ color: 0x5a5650, roughness: 0.9 });
    const stoneMat2 = new THREE.MeshStandardMaterial({ color: 0x6e685f, roughness: 0.85 });
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x3d3a36, roughness: 0.95 });

    const startX = 25;
    const endX = 150;
    const step = 2.0;

    for (let x = startX; x <= endX; x += step) {
      // Hafif organik kıvrım (S-Curve)
      const t = (x - startX) / (endX - startX);
      const zOffset = Math.sin(t * Math.PI * 2) * 3.5;

      // Yol Taş Plakaları (Genişlik 4 metre)
      const slabGeo = new THREE.BoxGeometry(1.8, 0.12, 1.2);
      for (let side = -1.5; side <= 1.5; side += 1.4) {
        const mat = Math.random() > 0.5 ? stoneMat1 : stoneMat2;
        const slab = new THREE.Mesh(slabGeo, mat);
        slab.position.set(x + (Math.random() - 0.5) * 0.2, 0.06, zOffset + side + (Math.random() - 0.5) * 0.2);
        slab.rotation.y = (Math.random() - 0.5) * 0.1;
        roadGroup.add(slab);
      }

      // Kenar Bordür Taşları
      const borderGeo = new THREE.BoxGeometry(1.9, 0.2, 0.3);
      const borderL = new THREE.Mesh(borderGeo, borderMat);
      borderL.position.set(x, 0.1, zOffset - 2.4);
      const borderR = new THREE.Mesh(borderGeo, borderMat);
      borderR.position.set(x, 0.1, zOffset + 2.4);
      roadGroup.add(borderL, borderR);

      // Her 22 metrede bir Meşale Direkleri
      if (Math.floor(x) % 22 === 0) {
        const torch = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2), this.modelBuilder.materials.wood);
        post.position.y = 1.6;
        const fire = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
        fire.position.y = 3.2;
        const light = new THREE.PointLight(0xff7722, 1.2, 16);
        light.position.y = 3.3;

        torch.add(post, fire, light);
        torch.position.set(x, 0, zOffset + (x % 44 === 0 ? 2.9 : -2.9));
        roadGroup.add(torch);
        this.addCollider(torch.position.x, torch.position.z, 0.8, 0.8);
      }
    }

    this.scene.add(roadGroup);
  }

  createFenceSegment(x, z, rotationY) {
    const fence = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8);
    const postMat = this.modelBuilder.materials.wood;
    for (let dx of [-1.5, 0, 1.5]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(dx, 0.9, 0);
      post.castShadow = true;
      fence.add(post);
    }
    const plankGeo = new THREE.BoxGeometry(3.2, 0.15, 0.05);
    for (let py of [0.6, 1.2]) {
      const plank = new THREE.Mesh(plankGeo, postMat);
      plank.position.set(0, py, 0.1);
      plank.castShadow = true;
      fence.add(plank);
    }
    fence.position.set(x, 0, z);
    fence.rotation.y = rotationY;
    this.scene.add(fence);
    this.addCollider(x, z, 3.2, 0.4);
  }

  buildBanditCamp() {
    const campX = -80;
    const campZ = -80;
    
    // Kamp Ateşi
    const fireLog = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5), this.modelBuilder.materials.wood);
    fireLog.position.set(campX, 0.2, campZ);
    fireLog.rotation.z = Math.PI / 2;
    this.scene.add(fireLog);

    const fire = new THREE.PointLight(0xff5500, 2.5, 25);
    fire.position.set(campX, 1.5, campZ);
    this.scene.add(fire);
    
    // Harami Çadırları
    const tentMat = new THREE.MeshStandardMaterial({ color: 0x3d352b, roughness: 0.9 });
    const tentGeo = new THREE.ConeGeometry(2.8, 3.5, 4);
    for (let i = 0; i < 4; i++) {
        const tent = new THREE.Mesh(tentGeo, tentMat);
        const tx = campX + (Math.random() - 0.5) * 20;
        const tz = campZ + (Math.random() - 0.5) * 20;
        if (Math.abs(tx - campX) < 4 && Math.abs(tz - campZ) < 4) continue;
        tent.position.set(tx, 1.75, tz);
        tent.rotation.y = Math.random() * Math.PI;
        this.scene.add(tent);
        this.addCollider(tx, tz, 4, 4);
    }
  }

  populateNatureAndFoliage() {
    for (let i = 0; i < 150; i++) {
      const rx = (Math.random() - 0.5) * 400;
      const rz = (Math.random() - 0.5) * 400;
      
      // Kasaba merkezi, kale ve yollara ağaç koyma
      if (Math.abs(rx) < 90 && Math.abs(rz) < 90) continue;
      if (rx > 120 && Math.abs(rz) < 50) continue; // Kale yolu
      
      const tree = this.modelBuilder.createPineTree();
      tree.position.set(rx, TownGenerator.getTerrainHeight(rx, rz), rz);
      this.scene.add(tree);
      this.addCollider(rx, rz, 1.5, 1.5);
    }
  }

  spawnVillageFauna() {
    // 1. Tarlalar ve Çayır Civarı Otlayan Koyunlar (x: 40-70, z: 20-50)
    for (let i = 0; i < 8; i++) {
      const sheep = this.modelBuilder.createSheep();
      const sx = 42 + Math.random() * 25;
      const sz = 20 + Math.random() * 28;
      sheep.position.set(sx, TownGenerator.getTerrainHeight(sx, sz), sz);
      sheep.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(sheep);
      this.addCollider(sx, sz, 1.2, 1.2);

      this.damageables.push({
        mesh: sheep,
        name: `Koyun #${i + 1}`,
        type: 'animal',
        maxHealth: 35,
        health: 35,
        isDead: false
      });
    }

    // 2. Köy Meydanı ve Han Çevresinde Dolaşan Tavuklar
    for (let i = 0; i < 10; i++) {
      const chicken = this.modelBuilder.createChicken();
      const cx = (Math.random() - 0.5) * 35;
      const cz = 10 + Math.random() * 30;
      chicken.position.set(cx, TownGenerator.getTerrainHeight(cx, cz), cz);
      chicken.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(chicken);

      this.damageables.push({
        mesh: chicken,
        name: `Köy Tavuğu #${i + 1}`,
        type: 'animal',
        maxHealth: 15,
        health: 15,
        isDead: false
      });
    }
  }

  // 13. KIRILABİLİR FIÇILAR VE SAMAN BALYALARI
  spawnBreakableObjects() {
    const barrelPositions = [
      { x: -18, z: 22 },  // Han Önü
      { x: -20, z: 24 },
      { x: -15, z: 26 },
      { x: -24, z: -4 },  // Çarşı
      { x: -22, z: 4 },
      { x: -55, z: 8 },   // Demirci Yanı
      { x: -53, z: 6 },
      { x: 172, z: -8 },  // Kale Avlusu
      { x: 176, z: -14 }
    ];

    barrelPositions.forEach((pos, idx) => {
      const barrel = this.modelBuilder.createBarrel();
      barrel.position.set(pos.x, TownGenerator.getTerrainHeight(pos.x, pos.z), pos.z);
      this.scene.add(barrel);
      this.addCollider(pos.x, pos.z, 0.9, 0.9);

      this.damageables.push({
        mesh: barrel,
        name: `Ahşap Fıçı #${idx + 1}`,
        type: 'object',
        maxHealth: 30,
        health: 30,
        isDead: false
      });
    });

    const balePositions = [
      { x: 45, z: 25 },   // Tarlalar
      { x: 48, z: 28 },
      { x: 52, z: 22 },
      { x: 60, z: 35 },
      { x: 64, z: 38 },
      { x: 12, z: -35 },  // Sipahi Tavlası Yanı
      { x: 14, z: -38 }
    ];

    balePositions.forEach((pos, idx) => {
      const bale = this.modelBuilder.createHayBale();
      bale.position.set(pos.x, TownGenerator.getTerrainHeight(pos.x, pos.z), pos.z);
      bale.rotation.y = (Math.random() - 0.5) * 0.4;
      this.scene.add(bale);
      this.addCollider(pos.x, pos.z, 1.2, 0.8);

      this.damageables.push({
        mesh: bale,
        name: `Saman Balyası #${idx + 1}`,
        type: 'object',
        maxHealth: 25,
        health: 25,
        isDead: false
      });
    });
  }

  setupSedirBeds() {
    // Köylülerin Gece Uyuması İçin Sedir / Yatak Noktaları
    const bedLocations = [
      { x: -22, z: 8 },   // Konak 1
      { x: -20, z: -15 }, // Konak 2
      { x: 26, z: 12 },   // Konak 3
      { x: 28, z: -22 },  // Konak 4
      { x: -24, z: 42 },  // Konak 5
      { x: 24, z: 48 },   // Konak 6
      { x: 0, z: -32 }    // Sipahi Konağı Odası
    ];

    bedLocations.forEach(loc => {
      const bed = this.modelBuilder.createSedirBed();
      bed.position.set(loc.x, TownGenerator.getTerrainHeight(loc.x, loc.z), loc.z);
      this.scene.add(bed);
    });
  }

  update(delta) {
    // Yeldeğirmeni ve su çarkı kanatlarını sürekli döndür
    this.animatedObjects.forEach(obj => {
      if (obj.userData && obj.userData.blades) {
        obj.userData.blades.rotation.z += delta * 0.75;
      }
      if (obj.userData && obj.userData.customUpdate) {
        obj.userData.customUpdate(delta);
      }
    });
  }
}
