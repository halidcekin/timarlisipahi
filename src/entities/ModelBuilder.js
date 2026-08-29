import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * ModelBuilder - Mülk-i Osmanî: Tımarlı Sipahi 3D
 * 2. Görseldeki orijinal stilize Osmanlı mimarisi, mavi kolluklu kılıç rigi, mavi kubbeli cami ve karakterler.
 */
export class ModelBuilder {
  constructor() {
    this.materials = {
      grass: new THREE.MeshStandardMaterial({
        color: 0x5a8648,
        map: TextureGenerator.createGrassTexture(),
        roughness: 0.85,
        metalness: 0.05
      }),
      steppeGrass: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createSteppeGrassBladeTexture(),
        transparent: true,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.75,
        metalness: 0.02
      }),
      path: new THREE.MeshStandardMaterial({
        color: 0xded8cc,
        roughness: 0.90,
        metalness: 0.02
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0x5c3a21,
        roughness: 0.75,
        metalness: 0.05
      }),
      house: new THREE.MeshStandardMaterial({
        color: 0xf0ebd8,
        roughness: 0.85,
        metalness: 0.02
      }),
      armor: new THREE.MeshStandardMaterial({
        color: 0x4fa0c0, // 2. Görseldeki Mavi Sipahi Zırhı
        metalness: 0.50,
        roughness: 0.35
      }),
      stone: new THREE.MeshStandardMaterial({
        color: 0x9e9a92,
        roughness: 0.85,
        metalness: 0.05
      }),
      wall: new THREE.MeshStandardMaterial({
        color: 0x8a8479,
        roughness: 0.90,
        metalness: 0.05
      }),
      damascusSteel: new THREE.MeshStandardMaterial({
        color: 0xb8e0f5, // 2. Görseldeki Parlak Çelik
        metalness: 0.85,
        roughness: 0.15
      }),
      chainmail: new THREE.MeshStandardMaterial({
        color: 0x55606a,
        metalness: 0.70,
        roughness: 0.35
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.20
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0x8a929a,
        metalness: 0.90,
        roughness: 0.25
      }),
      roof: new THREE.MeshStandardMaterial({
        color: 0xa63a24, // Alaturka Kiremit Çatı
        roughness: 0.70,
        metalness: 0.05
      }),
      domeBlue: new THREE.MeshStandardMaterial({
        color: 0x2b5876, // 2. Görseldeki Mavi Cami Kubbesi
        roughness: 0.40,
        metalness: 0.30
      }),
      water: new THREE.MeshStandardMaterial({
        color: 0x1c4d6f,
        roughness: 0.10,
        metalness: 0.80,
        transparent: true,
        opacity: 0.85
      }),
      skin: new THREE.MeshStandardMaterial({
        color: 0xdeb887,
        roughness: 0.70
      }),
      leather: new THREE.MeshStandardMaterial({
        color: 0x3d2614,
        roughness: 0.80
      })
    };
  }

  // 1. GÖRSEL 2'DEKİ 1. ŞAHIS MAVİ KOLLUKLU SİPAHİ KILIÇ RİGİ
  createFirstPersonSword() {
    const weaponRig = new THREE.Group();

    // Sipahi Kolu (2. Görseldeki Canlı Mavi-Turkuaz Kol)
    const armGroup = new THREE.Group();
    armGroup.position.set(0.38, -0.32, -0.42);
    armGroup.rotation.set(Math.PI / 4.5, 0, -Math.PI / 12);

    // Mavi Kolçak
    const armGeo = new THREE.CylinderGeometry(0.11, 0.14, 0.90, 16);
    const arm = new THREE.Mesh(armGeo, this.materials.armor);
    armGroup.add(arm);

    // Altın Bileklik Halkaları (2. Görseldeki Altın Detaylar)
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 8, 18), this.materials.gold);
    ring1.position.y = 0.20;
    ring1.rotation.x = Math.PI / 2;
    armGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.020, 8, 18), this.materials.gold);
    ring2.position.y = 0.35;
    ring2.rotation.x = Math.PI / 2;
    armGroup.add(ring2);

    // Deri Eldiven
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.materials.leather);
    hand.position.set(0, 0.48, 0);
    armGroup.add(hand);

    weaponRig.add(armGroup);

    // 2. Kılıç (2. Görseldeki Altın Hilal Balçaklı Kavisli Kılıç)
    const sword = new THREE.Group();
    sword.position.set(0.36, -0.06, -0.62);
    sword.rotation.set(0, 0, -Math.PI / 10);

    // Deri Kabza
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.38, 12), this.materials.leather);
    sword.add(hilt);

    // Altın Kabza Başı (Topuz)
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), this.materials.gold);
    pommel.position.y = -0.21;
    sword.add(pommel);

    // Altın Hilal Balçak (2. Görseldeki Altın Kıvrımlar)
    const guardGroup = new THREE.Group();
    guardGroup.position.y = 0.20;

    const guardCenter = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), this.materials.gold);
    guardGroup.add(guardCenter);

    for (let dir of [-1, 1]) {
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 8, 16, Math.PI * 0.5), this.materials.gold);
      crescent.position.set(dir * 0.08, 0.03, 0);
      crescent.rotation.z = dir * Math.PI / 1.5;
      guardGroup.add(crescent);
    }
    sword.add(guardGroup);

    // Kavisli Parlak Namlu (2. Görseldeki Açık Mavi-Beyaz Yalmanlı Kılıç)
    const bladeGroup = new THREE.Group();
    bladeGroup.position.y = 0.25;

    for (let s = 0; s < 7; s++) {
      const w = 0.065 + (s > 4 ? 0.015 : 0);
      const seg = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.22, 0.018),
        this.materials.damascusSteel
      );
      seg.position.set(Math.sin(s * 0.12) * 0.05, 0.11 + s * 0.21, 0);
      seg.rotation.z = -s * 0.025;
      bladeGroup.add(seg);
    }

    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.28, 6),
      this.materials.damascusSteel
    );
    tip.position.set(0.07, 1.58, 0);
    tip.rotation.z = -0.15;
    bladeGroup.add(tip);

    sword.add(bladeGroup);
    weaponRig.add(sword);
    weaponRig.userData.sword = sword;

    return weaponRig;
  }

  // 2B. GÖRSELDEKİ BEYAZ SAÇLI, GÖZLÜKLÜ, SİYAH CEKETLİ KOCA YAKUB (STAN LEE) MODELİ
  createModernKethudaStanLee() {
    const charGroup = new THREE.Group();

    // Özel Malzemeler
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x181a1d, roughness: 0.70, metalness: 0.10 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f6, roughness: 0.85 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0xd5c4a1, roughness: 0.80 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.60 });
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.20 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0x4a2a16, roughness: 0.45, metalness: 0.15 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.65 });
    const whiteHairMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.90 });
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x221812, roughness: 0.30, metalness: 0.20 });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0xcde8fa,
      transparent: true,
      opacity: 0.40,
      roughness: 0.10,
      metalness: 0.80
    });

    // 1. AYAKLAR & KAHVERENGİ DERİ AYAKKABILAR
    for (let dir of [-1, 1]) {
      const shoe = new THREE.Group();
      shoe.position.set(dir * 0.14, 0.06, 0.02);

      // Ayakkabı Tabanı ve Gövdesi
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.28), shoesMat);
      sole.castShadow = true;
      shoe.add(sole);

      // Ayakkabı Burnu (Kavisli deri burun)
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), shoesMat);
      toe.position.set(0, -0.01, 0.12);
      shoe.add(toe);

      charGroup.add(shoe);
    }

    // 2. BACAKLAR & BEJ/HAKİ KUMAŞ PANTOLON
    for (let dir of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.82, 14), pantsMat);
      leg.position.set(dir * 0.14, 0.50, 0);
      leg.castShadow = true;
      charGroup.add(leg);
    }

    // Pantolon Üst Kısmı (Basen)
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.28), pantsMat);
    pelvis.position.set(0, 0.92, 0);
    pelvis.castShadow = true;
    charGroup.add(pelvis);

    // 3. DERİ KEMER & ALTIN TOKA
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.055, 0.29), beltMat);
    belt.position.set(0, 1.02, 0);
    charGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.065, 0.03), buckleMat);
    buckle.position.set(0, 1.02, 0.15);
    charGroup.add(buckle);

    // 4. GÖVDE: BEYAZ DÜĞMELİ GÖMLEK & SİYAH BLAZER CEKET
    // İç Gömlek (Açık Beyaz/Krem)
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, 0.24), shirtMat);
    shirt.position.set(0, 1.34, 0);
    shirt.castShadow = true;
    charGroup.add(shirt);

    // Gömlek Yakası (Açık V-Yaka)
    const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.10, 0.08), shirtMat);
    collarL.position.set(-0.06, 1.63, 0.11);
    collarL.rotation.set(0.3, 0, -0.4);
    const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.10, 0.08), shirtMat);
    collarR.position.set(0.06, 1.63, 0.11);
    collarR.rotation.set(0.3, 0, 0.4);
    charGroup.add(collarL, collarR);

    // Siyah Blazer Ceket (Sol ve Sağ açık kanatlar + Sırt)
    const jacketBack = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.64, 0.08), jacketMat);
    jacketBack.position.set(0, 1.32, -0.11);
    jacketBack.castShadow = true;
    charGroup.add(jacketBack);

    const jacketLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.64, 0.28), jacketMat);
    jacketLeft.position.set(-0.19, 1.32, 0.01);
    jacketLeft.castShadow = true;
    charGroup.add(jacketLeft);

    const jacketRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.64, 0.28), jacketMat);
    jacketRight.position.set(0.19, 1.32, 0.01);
    jacketRight.castShadow = true;
    charGroup.add(jacketRight);

    // Ceket Yakaları (Geniş Kruvaze/Blazer Yaka)
    for (let dir of [-1, 1]) {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.30, 0.03), jacketMat);
      lapel.position.set(dir * 0.13, 1.48, 0.14);
      lapel.rotation.set(0.2, 0, -dir * 0.25);
      charGroup.add(lapel);
    }

    // 5. KOLLAR & BEYAZ GÖMLEK MANŞETLERİ & ELLER
    for (let dir of [-1, 1]) {
      const armGroup = new THREE.Group();
      armGroup.position.set(dir * 0.25, 1.58, 0);

      // Ceket Kolu (Siyah) - Görseldeki gibi iki yana açık T-duruşu
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.58, 12), jacketMat);
      arm.position.set(dir * 0.28, -0.12, 0);
      arm.rotation.z = -dir * (Math.PI / 2.3);
      arm.castShadow = true;
      armGroup.add(arm);

      // Beyaz Gömlek Manşeti
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.06, 12), shirtMat);
      cuff.position.set(dir * 0.54, -0.22, 0);
      cuff.rotation.z = -dir * (Math.PI / 2.3);
      armGroup.add(cuff);

      // Eller (Ten rengi)
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), skinMat);
      hand.position.set(dir * 0.60, -0.24, 0);
      armGroup.add(hand);

      charGroup.add(armGroup);
    }

    // 6. KAFA, YÜZ, BEYAZ SAÇLAR & RETRO GÖZLÜK
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.76, 0);

    // Boyun
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 10), skinMat);
    neck.position.y = -0.06;
    headGroup.add(neck);

    // Kafa
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 16), skinMat);
    head.position.set(0, 0.08, 0);
    head.castShadow = true;
    headGroup.add(head);

    // BEYAZ SAÇLAR (Görseldeki gibi arkaya taranmış dolgun beyaz saçlar)
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.175, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.65), whiteHairMat);
    hairTop.position.set(0, 0.09, -0.02);
    headGroup.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 12), whiteHairMat);
    hairBack.position.set(0, 0.08, -0.05);
    headGroup.add(hairBack);

    // Favoriler (Yan beyaz saçlar)
    for (let dir of [-1, 1]) {
      const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.08, 0.06), whiteHairMat);
      sideburn.position.set(dir * 0.155, 0.08, 0.02);
      headGroup.add(sideburn);
    }

    // BEYAZ KIR SAKAL / BIYIK
    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), whiteHairMat);
    mustache.position.set(0, 0.03, 0.16);
    headGroup.add(mustache);

    // GÖZLER
    for (let dir of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
      eye.position.set(dir * 0.055, 0.09, 0.15);
      headGroup.add(eye);
    }

    // RETRO KALIN ÇERÇEVELİ GÖZLÜK (Stan Lee İmzası)
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.09, 0.165);

    // Sol & Sağ Çerçeve
    for (let dir of [-1, 1]) {
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.007, 8, 16), glassesMat);
      frame.position.set(dir * 0.055, 0, 0);
      glassesGroup.add(frame);

      // Şeffaf Gözlük Camı
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), lensMat);
      lens.position.set(dir * 0.055, 0, 0);
      glassesGroup.add(lens);
    }

    // Gözlük Burun Köprüsü
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.008), glassesMat);
    bridge.position.set(0, 0.01, 0);
    glassesGroup.add(bridge);

    // Gözlük Sapları (Kulaklara doğru)
    for (let dir of [-1, 1]) {
      const temple = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.14), glassesMat);
      temple.position.set(dir * 0.095, 0, -0.07);
      glassesGroup.add(temple);
    }

    headGroup.add(glassesGroup);
    charGroup.add(headGroup);

    return charGroup;
  }

  // 2. GÖRSEL 2'DEKİ NPC KARAKTER MODELİ (DİĞER KÖYLÜLER)
  createDetailedHumanNPC(config = {}) {
    const human = new THREE.Group();
    const kaftanColor = config.kaftanColor || 0x4a3222;
    const kaftanMat = new THREE.MeshStandardMaterial({ color: kaftanColor, roughness: 0.80 });
    const turbanMat = new THREE.MeshStandardMaterial({ color: config.turbanColor || 0xf0eae0, roughness: 0.90 });
    const hairMat = new THREE.MeshStandardMaterial({ color: config.hairColor || 0x1a1510, roughness: 0.85 });

    // Gövde (Cübbe / Kaftan)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 1.10, 16), kaftanMat);
    body.position.y = 0.95;
    body.castShadow = true;
    human.add(body);

    // Kemer / Kuşak
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 16), this.materials.leather);
    belt.position.y = 1.05;
    belt.rotation.x = Math.PI / 2;
    human.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), this.materials.gold);
    buckle.position.set(0, 1.05, 0.33);
    human.add(buckle);

    // Kollar (2. Görseldeki Açık Kollar)
    for (let dir of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 12), kaftanMat);
      arm.position.set(dir * 0.38, 1.20, 0);
      arm.rotation.z = dir * 0.35;
      arm.castShadow = true;
      human.add(arm);

      // El
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), this.materials.skin);
      hand.position.set(dir * 0.52, 0.95, 0);
      human.add(hand);
    }

    // Bacaklar
    for (let dir of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 10), kaftanMat);
      leg.position.set(dir * 0.14, 0.22, 0);
      leg.castShadow = true;
      human.add(leg);
    }

    // Kafa & Yüz
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.65;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), this.materials.skin);
    headGroup.add(head);

    // Sakal & Pala Bıyık (2. Görseldeki gibi)
    if (config.hasBeard !== false) {
      const beard = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.30, 8), hairMat);
      beard.position.set(0, -0.12, 0.10);
      beard.rotation.x = Math.PI / 3.5;
      headGroup.add(beard);

      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.08), hairMat);
      mustache.position.set(0, -0.02, 0.16);
      headGroup.add(mustache);
    }

    // Gözler
    for (let x of [-0.06, 0.06]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      eye.position.set(x, 0.04, 0.16);
      headGroup.add(eye);
    }

    // Başlık (Sarık veya Börk)
    if (config.headwear === 'bork') {
      const bork = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.30, 10), new THREE.MeshStandardMaterial({ color: 0x8b1e1e }));
      bork.position.y = 0.22;
      headGroup.add(bork);
    } else {
      // Beyaz Sarık (2. Görseldeki gibi)
      const turbanWrap = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 8, 18), turbanMat);
      turbanWrap.position.y = 0.14;
      turbanWrap.rotation.x = Math.PI / 2;
      headGroup.add(turbanWrap);

      const fez = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.20, 10), new THREE.MeshStandardMaterial({ color: 0x8b1e1e }));
      fez.position.y = 0.24;
      headGroup.add(fez);
    }

    human.add(headGroup);
    return human;
  }

  // 3. GÖRSEL 2'DEKİ SAFRANBOLU EVİ
  createOttomanHouse(w = 8, l = 7, h = 6.5, hasCumba = true) {
    const house = new THREE.Group();

    // Zemin Kat (Açık Taş)
    const groundH = h * 0.45;
    const groundMesh = new THREE.Mesh(new THREE.BoxGeometry(w, groundH, l), this.materials.stone);
    groundMesh.position.y = groundH / 2;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    house.add(groundMesh);

    // Üst Kat (Beyaz Kireç Sıva + Ahşap Karkas)
    const upperH = h * 0.55;
    const upperW = hasCumba ? w * 1.08 : w;
    const upperL = hasCumba ? l * 1.12 : l;

    const upperMesh = new THREE.Mesh(new THREE.BoxGeometry(upperW, upperH, upperL), this.materials.house);
    upperMesh.position.y = groundH + (upperH / 2);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    house.add(upperMesh);

    // Ahşap Hatıllar (Çerçeveler)
    for (let x of [-upperW / 2, upperW / 2]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.15, upperH, 0.15), this.materials.wood);
      beam.position.set(x, groundH + upperH / 2, upperL / 2);
      house.add(beam);
    }

    // Kırmızı Kiremit Çatı
    const roofH = 2.4;
    const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(Math.max(upperW, upperL) * 0.85, roofH, 4), this.materials.roof);
    roofMesh.position.y = h + roofH / 2;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    house.add(roofMesh);

    return house;
  }

  createSipahiMansion() {
    const mansion = this.createOttomanHouse(12, 10, 8, true);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 8), this.materials.wood);
    pole.position.set(4.5, 9.5, 4.5);
    mansion.add(pole);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshStandardMaterial({
      color: 0x8b1e1e,
      side: THREE.DoubleSide
    }));
    flag.position.set(5.5, 11, 4.5);
    mansion.add(flag);

    return mansion;
  }

  // 4. GÖRSEL 2'DEKİ MAVİ KUBBELİ MESCİD / CAMİ
  createMosque() {
    const mosque = new THREE.Group();

    // Taş Gövde
    const base = new THREE.Mesh(new THREE.BoxGeometry(11, 6, 11), this.materials.stone);
    base.position.y = 3;
    base.castShadow = true;
    mosque.add(base);

    // 2. Görseldeki Mavi Yarım Küre Kubbe
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(5.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.domeBlue
    );
    dome.position.y = 6;
    mosque.add(dome);

    // Minare
    const minaret = new THREE.Group();
    minaret.position.set(6.2, 0, 6.2);

    const minBody = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 16, 16), this.materials.stone);
    minBody.position.y = 8;
    minBody.castShadow = true;
    minaret.add(minBody);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4, 16), this.materials.domeBlue);
    cone.position.y = 17.8;
    minaret.add(cone);

    mosque.add(minaret);
    return mosque;
  }

  // 5. DEMİRCİ OCAĞI
  createBlacksmithShop() {
    const shop = new THREE.Group();
    const stoneMat = this.materials.stone;
    const woodMat = this.materials.wood;
    const roofMat = this.materials.roof;
    const wallH = 3.6;

    const base = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.16, 9.2), stoneMat);
    base.position.y = 0.08;
    shop.add(base);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(11.4, wallH, 0.4), stoneMat);
    backWall.position.set(0, wallH / 2, 4.4);
    backWall.castShadow = true;
    shop.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallH, 9.2), stoneMat);
    leftWall.position.set(-5.5, wallH / 2, 0);
    leftWall.castShadow = true;
    shop.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallH, 9.2), stoneMat);
    rightWall.position.set(5.5, wallH / 2, 0);
    rightWall.castShadow = true;
    shop.add(rightWall);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(8.5, 2.8, 4), roofMat);
    roof.position.y = wallH + 1.4;
    roof.rotation.y = Math.PI / 4;
    shop.add(roof);

    return shop;
  }

  // 6. YEL DEĞİRMENİ
  createWindmill() {
    const windmill = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 4.0, 12, 12), this.materials.stone);
    tower.position.y = 6;
    tower.castShadow = true;
    windmill.add(tower);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.5, 12), this.materials.roof);
    cap.position.y = 13.5;
    windmill.add(cap);

    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 11, 2.8);

    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7.5, 0.1), this.materials.wood);
      blade.position.y = 3.5;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (i * Math.PI) / 2;
      bladePivot.add(blade);
      bladesGroup.add(bladePivot);
    }
    windmill.add(bladesGroup);
    windmill.userData.blades = bladesGroup;
    windmill.userData.sails = bladesGroup;

    return windmill;
  }

  // 7. KÖY ÇEŞMESİ
  createVillageFountain() {
    const fountain = new THREE.Group();
    const basin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.0, 2.5), this.materials.stone);
    basin.position.y = 0.5;
    basin.castShadow = true;
    fountain.add(basin);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 1.2), this.materials.stone);
    pillar.position.y = 1.4;
    fountain.add(pillar);

    const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), this.materials.water);
    waterPlane.position.y = 0.85;
    waterPlane.rotation.x = -Math.PI / 2;
    fountain.add(waterPlane);

    return fountain;
  }

  // 8. GÖRSEL 2'DEKİ ÇAM VE KÜRESEL AĞAÇLAR
  createTree(type = 'pine') {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.55, 4.5, 8), this.materials.wood);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    tree.add(trunk);

    if (type === 'pine') {
      // 2. Görseldeki Çok Katmanlı Koyu Yeşil Çam Ağaçları
      for (let i = 0; i < 3; i++) {
        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry(2.8 - i * 0.6, 2.4, 8),
          new THREE.MeshStandardMaterial({ color: 0x1b4324, roughness: 0.85 })
        );
        foliage.position.y = 3.6 + i * 1.6;
        foliage.castShadow = true;
        tree.add(foliage);
      }
    } else {
      // Yeşil Küre Ağaçlar
      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(3.0, 1),
        new THREE.MeshStandardMaterial({ color: 0x386629, roughness: 0.85 })
      );
      foliage.position.y = 5.2;
      foliage.castShadow = true;
      tree.add(foliage);
    }
    return tree;
  }

  // 9. OSMANLI SAVAŞ ATI
  createHorse(colorHex = 0x3a2214) {
    const horse = new THREE.Group();
    const horseMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.60 });
    const leatherMat = this.materials.leather;
    const maneMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });

    // Gövde
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 2.2), horseMat);
    body.position.set(0, 1.60, 0);
    body.castShadow = true;
    horse.add(body);

    // Boyun & Kafa
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.65), horseMat);
    neck.position.set(0, 2.20, 0.90);
    neck.rotation.x = -Math.PI / 4;
    horse.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.45, 0.85), horseMat);
    head.position.set(0, 2.70, 1.30);
    horse.add(head);

    // Eyer
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.25, 0.95), leatherMat);
    saddle.position.set(0, 2.20, -0.05);
    horse.add(saddle);

    // Bacaklar
    const legs = [];
    const legPositions = [
      { name: 'frontLeft', x: -0.38, y: 1.50, z: 0.75 },
      { name: 'frontRight', x: 0.38, y: 1.50, z: 0.75 },
      { name: 'backLeft', x: -0.38, y: 1.50, z: -0.75 },
      { name: 'backRight', x: 0.38, y: 1.50, z: -0.75 }
    ];

    legPositions.forEach(pos => {
      const legPivot = new THREE.Group();
      legPivot.position.set(pos.x, pos.y, pos.z);

      const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.50, 0.24), horseMat);
      legMesh.position.y = -0.75;
      legMesh.castShadow = true;
      legPivot.add(legMesh);

      horse.add(legPivot);
      legs.push({ name: pos.name, group: legPivot });
    });

    horse.userData.legs = legs;
    return horse;
  }

  // 10. SANCAK KALESİ
  createOttomanCastle() {
    return this.createCastleQuarter();
  }

  createCastleQuarter() {
    const castle = new THREE.Group();
    const stoneMat = this.materials.stone;

    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(45, 12, 4), stoneMat);
    wall1.position.set(0, 6, 20);
    wall1.castShadow = true;
    castle.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(45, 12, 4), stoneMat);
    wall2.position.set(0, 6, -20);
    wall2.castShadow = true;
    castle.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 40), stoneMat);
    wall3.position.set(20, 6, 0);
    wall3.castShadow = true;
    castle.add(wall3);

    for (let dx of [-20, 20]) {
      for (let dz of [-20, 20]) {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 16, 12), stoneMat);
        tower.position.set(dx, 8, dz);
        tower.castShadow = true;
        castle.add(tower);

        const tRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 4.0, 12), this.materials.roof);
        tRoof.position.set(dx, 18, dz);
        castle.add(tRoof);
      }
    }

    return castle;
  }

  createMossyRock(scale = 1.0) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4 * scale, 1),
      this.materials.stone
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  createWildflowerCluster(flowerColorHex = 0xd62828) {
    const cluster = new THREE.Group();
    const petalMat = new THREE.MeshBasicMaterial({ color: flowerColorHex });
    const stemMat = new THREE.MeshBasicMaterial({ color: 0x3d6622 });

    for (let i = 0; i < 4; i++) {
      const flower = new THREE.Group();
      const ox = (Math.random() - 0.5) * 0.8;
      const oz = (Math.random() - 0.5) * 0.8;
      const fh = 0.35 + Math.random() * 0.25;

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, fh, 4), stemMat);
      stem.position.set(ox, fh / 2, oz);
      flower.add(stem);

      const petal = new THREE.Mesh(new THREE.CircleGeometry(0.10, 6), petalMat);
      petal.position.set(ox, fh, oz);
      petal.rotation.x = -Math.PI / 2;
      flower.add(petal);

      cluster.add(flower);
    }
    return cluster;
  }

  createPineTree() {
    const tree = new THREE.Group();
    
    // Ağaç Gövdesi
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3b2c });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8), trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Yapraklar (Çam Konileri)
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x1e3f20 });
    
    // 3 Katmanlı Çam Ağacı
    const layer1 = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), leavesMat);
    layer1.position.y = 3;
    layer1.castShadow = true;
    layer1.receiveShadow = true;
    tree.add(layer1);

    const layer2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 8), leavesMat);
    layer2.position.y = 4.5;
    layer2.castShadow = true;
    layer2.receiveShadow = true;
    tree.add(layer2);

    const layer3 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 8), leavesMat);
    layer3.position.y = 6;
    layer3.castShadow = true;
    layer3.receiveShadow = true;
    tree.add(layer3);

    return tree;
  }
}
