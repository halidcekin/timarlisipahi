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
        map: TextureGenerator.createGrassTexture(),
        roughness: 0.88,
        metalness: 0.02
      }),
      steppeGrass: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createSteppeGrassBladeTexture(),
        transparent: true,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.82,
        metalness: 0.01
      }),
      path: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createPathTexture(),
        roughness: 0.86,
        metalness: 0.02
      }),
      wood: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createWoodTexture(),
        roughness: 0.78,
        metalness: 0.02
      }),
      house: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createHousePlasterTexture(),
        roughness: 0.90,
        metalness: 0.01
      }),
      armor: new THREE.MeshStandardMaterial({
        color: 0x2b4c6f, // Koyu Çelik / Mavi Osmanlı Zırhı
        metalness: 0.88,
        roughness: 0.20
      }),
      stone: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createStoneWallTexture(),
        roughness: 0.84,
        metalness: 0.02
      }),
      wall: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createStoneWallTexture(),
        roughness: 0.88,
        metalness: 0.02
      }),
      damascusSteel: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createDamascusSteelTexture(),
        metalness: 0.96,
        roughness: 0.12
      }),
      chainmail: new THREE.MeshStandardMaterial({
        color: 0x5a636c,
        metalness: 0.85,
        roughness: 0.24
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.94,
        roughness: 0.16
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0x8a939c,
        metalness: 0.90,
        roughness: 0.18
      }),
      roof: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createRoofTileTexture(),
        roughness: 0.68,
        metalness: 0.03
      }),
      domeBlue: new THREE.MeshStandardMaterial({
        color: 0x1d4e70, // Mavi Kurşun Mescid Kubbesi
        roughness: 0.28,
        metalness: 0.65
      }),
      water: new THREE.MeshStandardMaterial({
        color: 0x153c57,
        roughness: 0.04,
        metalness: 0.04,
        transparent: true,
        opacity: 0.88
      }),
      skin: new THREE.MeshStandardMaterial({
        color: 0xdeb887,
        roughness: 0.70,
        metalness: 0.0
      }),
      leather: new THREE.MeshStandardMaterial({
        color: 0x3d2412,
        roughness: 0.78,
        metalness: 0.05
      })
    };
  }

  // 1. GERÇEKÇİ 1. ŞAHIS ŞAM ÇELİĞİ SİPAHİ KILICI & ZIRHLI KOL RİGİ
  createFirstPersonSword() {
    const weaponRig = new THREE.Group();

    // 1. Sipahi Kolu & Zırhı (Sağ alttan gelen çelik/deri kolçak)
    const armGroup = new THREE.Group();
    armGroup.position.set(0.36, -0.36, -0.45);
    armGroup.rotation.set(Math.PI / 4.8, 0, -Math.PI / 10);

    // Koyu Çelik / Mavi Osmanlı Kolçağı
    const armGeo = new THREE.CylinderGeometry(0.085, 0.115, 0.85, 16);
    const arm = new THREE.Mesh(armGeo, this.materials.armor);
    arm.castShadow = true;
    armGroup.add(arm);

    // Altın İşlemeli Kolçak Halkaları
    for (let y of [0.15, 0.30]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.012, 8, 18), this.materials.gold);
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2;
      armGroup.add(ring);
    }

    // Deri Süvari Eldiveni
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.08), this.materials.leather);
    hand.position.set(0, 0.44, 0);
    armGroup.add(hand);

    weaponRig.add(armGroup);

    // 2. Kavisli Osmanlı Sipahi Kılıcı (Şam Çeliği Yalmanlı Kılıç)
    const sword = new THREE.Group();
    sword.position.set(0.34, -0.10, -0.58);
    sword.rotation.set(0.05, 0, -Math.PI / 12);

    // Deri Sarımlı Ergonomik Kabza
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.022, 0.32, 12), this.materials.leather);
    sword.add(hilt);

    // Altın Kabza Başı (Topuz)
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.materials.gold);
    pommel.position.y = -0.17;
    sword.add(pommel);

    // Altın Hilal Balçak (İnce ve Zarif Kıvrımlı)
    const guardGroup = new THREE.Group();
    guardGroup.position.y = 0.16;

    const guardCenter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.04), this.materials.gold);
    guardGroup.add(guardCenter);

    for (let dir of [-1, 1]) {
      const quillon = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.008, 0.16, 8), this.materials.gold);
      quillon.position.set(dir * 0.09, 0.02, 0);
      quillon.rotation.z = dir * (Math.PI / 2.8);
      guardGroup.add(quillon);

      const tipBall = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.materials.gold);
      tipBall.position.set(dir * 0.16, 0.05, 0);
      guardGroup.add(tipBall);
    }
    sword.add(guardGroup);

    // Kavisli Şam Çeliği (Damascus Steel) Namlu
    const bladeGroup = new THREE.Group();
    bladeGroup.position.y = 0.20;

    const bladeCurve = [
      { y: 0.15, x: 0.00, w: 0.052, t: 0.014 },
      { y: 0.38, x: 0.01, w: 0.050, t: 0.013 },
      { y: 0.62, x: 0.03, w: 0.048, t: 0.012 },
      { y: 0.88, x: 0.06, w: 0.046, t: 0.011 },
      { y: 1.12, x: 0.11, w: 0.055, t: 0.010 }, // Yalman (Genişleyen Kılıç Ucu)
      { y: 1.34, x: 0.17, w: 0.052, t: 0.008 }
    ];

    bladeCurve.forEach((seg, i) => {
      const segMesh = new THREE.Mesh(
        new THREE.BoxGeometry(seg.w, 0.26, seg.t),
        this.materials.damascusSteel
      );
      segMesh.position.set(seg.x, seg.y, 0);
      segMesh.rotation.z = -seg.x * 0.45;
      segMesh.castShadow = true;
      bladeGroup.add(segMesh);
    });

    // Sivri Kılıç Ucu
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.22, 4),
      this.materials.damascusSteel
    );
    tip.position.set(0.22, 1.54, 0);
    tip.rotation.z = -0.32;
    tip.castShadow = true;
    bladeGroup.add(tip);

    sword.add(bladeGroup);
    weaponRig.add(sword);
    weaponRig.userData.sword = sword;

    return weaponRig;
  }

  // =========================================================================
  // GTA-SEVİYESİ ANATOMİK İNSAN MODELLEME YARDIMCILARI (ORGANİK 3D MESH SİSTEMİ)
  // =========================================================================

  // 1. Beş Parmaklı Gerçekçi Anatomik El Modeli
  createAnatomicalHand(skinMat, isLeft = false) {
    const handGroup = new THREE.Group();
    const side = isLeft ? -1 : 1;

    // Avuç İçi (Palm) - Doğal kaslı kavisli avuç içi
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.082, 0.026), skinMat);
    palm.position.set(0, -0.04, 0);
    palm.castShadow = true;
    handGroup.add(palm);

    // Başparmak Kökü Kası (Thenar Eminence)
    const thenar = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), skinMat);
    thenar.position.set(side * 0.028, -0.03, 0.008);
    handGroup.add(thenar);

    // Başparmak (Thumb) - 2 Boğum & Doğal Açılı
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(side * 0.032, -0.028, 0.012);
    thumbGroup.rotation.set(0.35, side * 0.55, -side * 0.45);

    const thumbProx = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.011, 0.032, 8), skinMat);
    thumbProx.position.y = -0.016;
    thumbGroup.add(thumbProx);

    const thumbDist = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.010, 0.026, 8), skinMat);
    thumbDist.position.set(0, -0.038, 0.006);
    thumbDist.rotation.x = -0.25;
    thumbGroup.add(thumbDist);

    handGroup.add(thumbGroup);

    // 4 Parmak (İşaret, Orta, Yüzük, Serçe) - 3'er Boğumlu & Doğal Rahat Dinlenme Kıvrımı
    const fingerDefs = [
      { name: 'index', x: side * 0.022, len: 0.030, w: 0.009, curl: 0.28 },
      { name: 'middle', x: side * 0.007, len: 0.035, w: 0.0095, curl: 0.32 },
      { name: 'ring', x: -side * 0.008, len: 0.031, w: 0.009, curl: 0.38 },
      { name: 'pinky', x: -side * 0.023, len: 0.024, w: 0.008, curl: 0.44 }
    ];

    fingerDefs.forEach(f => {
      const fGroup = new THREE.Group();
      fGroup.position.set(f.x, -0.08, 0.002);
      fGroup.rotation.x = f.curl; // Doğal içe kıvrım

      // Proksimal Boğum (Ana boğum)
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(f.w, f.w * 0.95, f.len * 0.45, 8), skinMat);
      p1.position.y = -f.len * 0.22;
      fGroup.add(p1);

      // Orta Boğum
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(f.w * 0.95, f.w * 0.88, f.len * 0.35, 8), skinMat);
      p2.position.set(0, -f.len * 0.55, 0.004);
      p2.rotation.x = f.curl * 0.6;
      fGroup.add(p2);

      // Uç Boğum & Tırnak
      const p3 = new THREE.Mesh(new THREE.CylinderGeometry(f.w * 0.88, f.w * 0.70, f.len * 0.25, 8), skinMat);
      p3.position.set(0, -f.len * 0.80, 0.010);
      p3.rotation.x = f.curl * 0.8;
      fGroup.add(p3);

      handGroup.add(fGroup);
    });

    return handGroup;
  }

  // 2. Heykelsi Anatomik Yüz & Kafa Sistemi (Çene, Burun, Dudak, Göz Çukuru, Göz Küreleri, Kulaklar)
  createSculptedHead(config, skinMat, hairMat) {
    const headGroup = new THREE.Group();

    // 1. Kafatası ve Şakaklar (Organik Kafa Kubbesi)
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 20), skinMat);
    cranium.position.set(0, 0.05, -0.015);
    cranium.scale.set(1.0, 1.15, 1.12);
    cranium.castShadow = true;
    headGroup.add(cranium);

    // 2. Yanaklar & Elmacık Kemikleri (Zygomatic Arch)
    for (let dir of [-1, 1]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), skinMat);
      cheek.position.set(dir * 0.062, 0.02, 0.065);
      cheek.scale.set(1.0, 1.2, 1.1);
      headGroup.add(cheek);
    }

    // 3. Heykelsi Çene & Çene Kemiği (Defined Mandible & Chin)
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.085, 0.095), skinMat);
    jaw.position.set(0, -0.065, 0.04);
    jaw.rotation.x = 0.22;
    headGroup.add(jaw);

    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), skinMat);
    chin.position.set(0, -0.10, 0.082);
    headGroup.add(chin);

    // 4. Anatomik Burun (Burun Kemeri, Ucu ve Burun Delikleri)
    const noseBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.065, 8), skinMat);
    noseBridge.position.set(0, 0.025, 0.125);
    noseBridge.rotation.x = 0.28;
    headGroup.add(noseBridge);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), skinMat);
    noseTip.position.set(0, -0.005, 0.142);
    headGroup.add(noseTip);

    for (let dir of [-1, 1]) {
      const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), skinMat);
      nostril.position.set(dir * 0.015, -0.010, 0.134);
      headGroup.add(nostril);
    }

    // 5. Şekilli Dudaklar ve Ağız (Philtrum, Üst ve Alt Dudak)
    const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.012, 0.015), new THREE.MeshStandardMaterial({
      color: 0xc48c78,
      roughness: 0.55
    }));
    upperLip.position.set(0, -0.040, 0.118);
    headGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.015, 0.018), new THREE.MeshStandardMaterial({
      color: 0xc98674,
      roughness: 0.50
    }));
    lowerLip.position.set(0, -0.056, 0.115);
    headGroup.add(lowerLip);

    // 6. Göz Çukurları, Göz Kapakları & Parlak Kornealı 3D Gözler
    for (let dir of [-1, 1]) {
      const eyeAssembly = new THREE.Group();
      eyeAssembly.position.set(dir * 0.048, 0.038, 0.098);

      // Göz Akı (Sclera)
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.017, 14, 12), new THREE.MeshStandardMaterial({
        color: 0xf5f7fa,
        roughness: 0.20
      }));
      eyeAssembly.add(eyeball);

      // İris (Koyu Kahve/Ela)
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.009, 14), new THREE.MeshBasicMaterial({
        color: 0x2e1a0e
      }));
      iris.position.set(0, 0, 0.0165);
      eyeAssembly.add(iris);

      // Gözbebeği (Pupil)
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.0045, 12), new THREE.MeshBasicMaterial({
        color: 0x050505
      }));
      pupil.position.set(0, 0, 0.017);
      eyeAssembly.add(pupil);

      // Üst Göz Kapağı & Kaş Kemiği
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.012, 0.022), skinMat);
      brow.position.set(0, 0.022, 0.008);
      brow.rotation.z = -dir * 0.12;
      eyeAssembly.add(brow);

      headGroup.add(eyeAssembly);
    }

    // 7. Kulaklar (Helix, Lobe & Concha)
    for (let dir of [-1, 1]) {
      const ear = new THREE.Group();
      ear.position.set(dir * 0.122, 0.015, -0.005);
      ear.rotation.set(0.1, dir * 0.25, -dir * 0.15);

      const earBody = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.055, 0.032), skinMat);
      ear.add(earBody);

      const earLobe = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), skinMat);
      earLobe.position.set(0, -0.028, 0);
      ear.add(earLobe);

      headGroup.add(ear);
    }

    return headGroup;
  }

  // =========================================================================
  // 2B. ULTRA-DETAYLI GTA SEVİYESİNDE MODERN KOCA YAKUB (STAN LEE) MODELİ
  // =========================================================================
  createModernKethudaStanLee() {
    const charGroup = new THREE.Group();

    // Üst Düzey PBR Kumaş, Deri, Ten ve Cam Materyalleri
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x15171a, // Gece Siyahı İtalyan Yün Blazer
      roughness: 0.65,
      metalness: 0.05
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf4f6f8, // Safir Beyazı Poplin Gömlek
      roughness: 0.70
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0xc8b894, // Özel Dikim Bej/Haki Chino Pantolon
      roughness: 0.75
    });
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x2b180d, // Kahverengi Hakiki Deri Kemer
      roughness: 0.40,
      metalness: 0.10
    });
    const buckleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Parlak Pirinç / Altın Kemer Tokası
      metalness: 0.90,
      roughness: 0.15
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: 0x361d10, // Cilalı Kahverengi Oxford Kundura
      roughness: 0.35,
      metalness: 0.20
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdfb48b, // Doğal İnsan Ten Rengi
      roughness: 0.55,
      metalness: 0.02
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0xf2f2f2, // Hacimli Beyaz Saç
      roughness: 0.65,
      metalness: 0.08
    });
    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x1a120b, // Kaplumbağa Kabuğu / Metalik Retro Çerçeve
      roughness: 0.25,
      metalness: 0.30
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x9ec7e6,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.90
    });

    // -------------------------------------------------------------
    // 1. CİLALI DERİ OXFORD AYAKKABILAR (TABAN, TOPUK, BURUN & BAĞCIKLAR)
    // -------------------------------------------------------------
    for (let dir of [-1, 1]) {
      const shoe = new THREE.Group();
      shoe.position.set(dir * 0.135, 0, 0.02);

      // Kauçuk Alt Taban
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.035, 0.30), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
      sole.position.set(0, 0.018, 0);
      sole.castShadow = true;
      shoe.add(sole);

      // Yükseltilmiş Ayakkabı Topuğu
      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.045, 0.09), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }));
      heel.position.set(0, 0.04, -0.095);
      shoe.add(heel);

      // Deri Gövde ve Burun Bombesi
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.075, 0.22), shoesMat);
      body.position.set(0, 0.065, 0.01);
      body.castShadow = true;
      shoe.add(body);

      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 10), shoesMat);
      toeCap.position.set(0, 0.052, 0.115);
      toeCap.scale.set(0.95, 0.70, 1.1);
      shoe.add(toeCap);

      charGroup.add(shoe);
    }

    // -------------------------------------------------------------
    // 2. TERZİ İŞİ DİKİM CHINO PANTOLON & BACAK ANATOMİSİ
    // -------------------------------------------------------------
    for (let dir of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(dir * 0.135, 0, 0);

      // Alt Bacak & Baldır Kavisi (Calf Contour)
      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.44, 16), pantsMat);
      lowerLeg.position.set(0, 0.30, 0);
      lowerLeg.castShadow = true;
      legGroup.add(lowerLeg);

      // Diz Eklemi & Kumaş Kırışığı
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.084, 12, 10), pantsMat);
      knee.position.set(0, 0.52, 0.012);
      legGroup.add(knee);

      // Üst Bacak (Uyluk Anatomisi - Thigh)
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.088, 0.44, 16), pantsMat);
      upperLeg.position.set(0, 0.74, 0);
      upperLeg.castShadow = true;
      legGroup.add(upperLeg);

      charGroup.add(legGroup);
    }

    // Pantolon Basen ve Bel Bölümü
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.20, 0.26), pantsMat);
    pelvis.position.set(0, 0.96, 0);
    pelvis.castShadow = true;
    charGroup.add(pelvis);

    // Deri Kemer ve Pirinç Toka
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.048, 0.27), beltMat);
    belt.position.set(0, 1.05, 0);
    charGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.055, 0.025), buckleMat);
    buckle.position.set(0, 1.05, 0.14);
    charGroup.add(buckle);

    // -------------------------------------------------------------
    // 3. TERZİ İŞİ DİKİM SİYAH BLAZER CEKET & BEYAZ GÖMLEK
    // -------------------------------------------------------------
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.08, 0);

    // Beyaz Poplin Gömlek (İç Gövde)
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.58, 0.22), shirtMat);
    shirt.position.set(0, 0.28, 0);
    shirt.castShadow = true;
    torsoGroup.add(shirt);

    // Gömlek Yakası (Açık V-Yaka Detayı)
    for (let dir of [-1, 1]) {
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.08), shirtMat);
      collar.position.set(dir * 0.06, 0.56, 0.10);
      collar.rotation.set(0.32, 0, -dir * 0.42);
      torsoGroup.add(collar);
    }

    // Siyah Blazer Ceket (Geniş Omuzlu, Oturan Kesim)
    const jacketBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.09), jacketMat);
    jacketBack.position.set(0, 0.27, -0.09);
    jacketBack.castShadow = true;
    torsoGroup.add(jacketBack);

    for (let dir of [-1, 1]) {
      // Ceket Ön Kanatları
      const jacketFront = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.26), jacketMat);
      jacketFront.position.set(dir * 0.18, 0.27, 0.01);
      jacketFront.castShadow = true;
      torsoGroup.add(jacketFront);

      // Ceket Yakaları (Notched Lapel)
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.035), jacketMat);
      lapel.position.set(dir * 0.125, 0.42, 0.135);
      lapel.rotation.set(0.24, 0, -dir * 0.30);
      torsoGroup.add(lapel);

      // Ceket Alt Cepleri (Flap Pockets)
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.025), jacketMat);
      pocket.position.set(dir * 0.16, 0.12, 0.13);
      torsoGroup.add(pocket);
    }

    // Sol Göğüs Cebi & Beyaz İpek Mendil (Pocket Square)
    const chestPocket = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.018, 0.02), jacketMat);
    chestPocket.position.set(-0.13, 0.40, 0.135);
    chestPocket.rotation.z = 0.1;
    torsoGroup.add(chestPocket);

    const pocketSquare = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.022, 0.01), shirtMat);
    pocketSquare.position.set(-0.13, 0.415, 0.138);
    pocketSquare.rotation.z = 0.1;
    torsoGroup.add(pocketSquare);

    charGroup.add(torsoGroup);

    // -------------------------------------------------------------
    // 4. ANATOMİK KOLLAR, GÖMLEK MANŞETLERİ & 5 PARMAKLI ELLER
    // -------------------------------------------------------------
    for (let dir of [-1, 1]) {
      const armAssembly = new THREE.Group();
      armAssembly.position.set(dir * 0.25, 1.58, 0);

      // Omuz Başı (Shoulder Pad & Deltoid)
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), jacketMat);
      shoulder.castShadow = true;
      armAssembly.add(shoulder);

      // Üst Kol (Bicep / Tricep) - Doğal A-Pozu (14° Aşağı Eğim)
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.34, 14), jacketMat);
      upperArm.position.set(dir * 0.04, -0.16, 0.02);
      upperArm.rotation.set(0.10, 0, -dir * 0.16);
      upperArm.castShadow = true;
      armAssembly.add(upperArm);

      // Ön Kol (Forearm) & Dirsek Bükümü
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(dir * 0.08, -0.32, 0.04);
      forearmGroup.rotation.set(0.20, 0, -dir * 0.08);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.062, 0.28, 14), jacketMat);
      forearm.position.y = -0.12;
      forearm.castShadow = true;
      forearmGroup.add(forearm);

      // Beyaz Gömlek Manşeti (Cuff)
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.04, 14), shirtMat);
      cuff.position.y = -0.26;
      forearmGroup.add(cuff);

      // 5 PARMAKLI GERÇEKÇİ ANATOMİK EL
      const hand = this.createAnatomicalHand(skinMat, dir < 0);
      hand.position.set(0, -0.28, 0);
      hand.rotation.set(0.15, -dir * 0.30, 0);
      forearmGroup.add(hand);

      armAssembly.add(forearmGroup);
      charGroup.add(armAssembly);
    }

    // -------------------------------------------------------------
    // 5. KAFA, HEYKELSİ YÜZ, BEYAZ SAÇLAR & RETRO AVIATOR GÖZLÜK
    // -------------------------------------------------------------
    const headMaster = new THREE.Group();
    headMaster.position.set(0, 1.76, 0);

    // Boyun & Trapezius Kasları
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.092, 0.14, 14), skinMat);
    neck.position.y = -0.06;
    headMaster.add(neck);

    // Heykelsi Anatomik Yüz (Çene, Burun, Dudaklar, Göz Küreleri, Kulaklar)
    const faceMesh = this.createSculptedHead({}, skinMat, hairMat);
    headMaster.add(faceMesh);

    // BEYAZ BÜYÜK HACİMLİ ARKAYA TARANMIŞ SAÇLAR (Layered Flowing Hair Locks)
    const hairGroup = new THREE.Group();

    // Üst Saç Kubbesi
    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.138, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.68),
      hairMat
    );
    hairTop.position.set(0, 0.06, -0.02);
    hairGroup.add(hairTop);

    // Arkaya Taranmış Saç Bukleleri (Volumetric Hair Strands)
    for (let i = 0; i < 9; i++) {
      const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, 0.16, 8), hairMat);
      const angle = (i / 8 - 0.5) * 1.8;
      lock.position.set(Math.sin(angle) * 0.085, 0.11 - Math.abs(angle) * 0.02, -0.04 - Math.abs(angle) * 0.03);
      lock.rotation.set(Math.PI / 2.2, 0, -angle * 0.4);
      hairGroup.add(lock);
    }

    // Arka Ense Saçları
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 12), hairMat);
    hairBack.position.set(0, 0.02, -0.06);
    hairGroup.add(hairBack);

    // Şakaklar ve Favoriler (Sideburns)
    for (let dir of [-1, 1]) {
      const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.09, 0.06), hairMat);
      sideburn.position.set(dir * 0.118, 0.02, 0.02);
      hairGroup.add(sideburn);
    }

    headMaster.add(hairGroup);

    // Beyaz Kır Pala Bıyık (Groomed White Mustache)
    const mustache = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.008, 0.10, 8), hairMat);
    mustache.position.set(0, -0.030, 0.128);
    mustache.rotation.z = Math.PI / 2;
    headMaster.add(mustache);

    // İMZA RETRO AVIATOR GÖZLÜKLER (Çift Köprülü, Yarı Saydam Camlı)
    const glasses = new THREE.Group();
    glasses.position.set(0, 0.040, 0.115);

    // Çift Burun Köprüsü
    const bridge1 = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.005, 0.005), glassesMat);
    bridge1.position.set(0, 0.015, 0);
    const bridge2 = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.005, 0.005), glassesMat);
    bridge2.position.set(0, 0.002, 0);
    glasses.add(bridge1, bridge2);

    for (let dir of [-1, 1]) {
      // Damla Çerçeve (Aviator Teardrop)
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.005, 8, 20), glassesMat);
      frame.position.set(dir * 0.046, 0, 0);
      frame.scale.set(1.0, 1.15, 1.0);
      glasses.add(frame);

      // Parlak Saydam Cam
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), lensMat);
      lens.position.set(dir * 0.046, 0, 0);
      lens.scale.set(1.0, 1.15, 1.0);
      glasses.add(lens);

      // Kulak Arkasına Uzan Saplar (Temples)
      const temple = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.14), glassesMat);
      temple.position.set(dir * 0.076, 0.010, -0.07);
      glasses.add(temple);
    }

    headMaster.add(glasses);
    charGroup.add(headMaster);

    return charGroup;
  }

  // =========================================================================
  // 2C. GTA SEVİYESİNDE OSMANLI KARAKTERLERİ (SİPAHİ, KÖYLÜ, İMAM, DEMİRCİ)
  // =========================================================================
  createDetailedHumanNPC(config = {}) {
    const human = new THREE.Group();
    const kaftanColor = config.kaftanColor || 0x3d281a;
    const kaftanMat = new THREE.MeshStandardMaterial({
      color: kaftanColor,
      roughness: 0.75,
      metalness: 0.05
    });
    const turbanMat = new THREE.MeshStandardMaterial({
      color: config.turbanColor || 0xf2ece4,
      roughness: 0.85
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: config.hairColor || 0x181410,
      roughness: 0.70
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.55
    });
    const bootsMat = new THREE.MeshStandardMaterial({
      color: 0x2b190e,
      roughness: 0.45,
      metalness: 0.15
    });

    // 1. Çarık / Yemeni / Deri Çizme
    for (let dir of [-1, 1]) {
      const boot = new THREE.Group();
      boot.position.set(dir * 0.14, 0, 0.02);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.28), bootsMat);
      sole.position.y = 0.02;
      sole.castShadow = true;
      boot.add(sole);

      // Kıvrık Burunlu Osmanlı Çarığı
      const toe = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), bootsMat);
      toe.position.set(0, 0.04, 0.14);
      toe.rotation.x = Math.PI / 3;
      boot.add(toe);

      human.add(boot);
    }

    // 2. Şalvar / Bacaklar
    for (let dir of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.82, 16), kaftanMat);
      leg.position.set(dir * 0.14, 0.45, 0);
      leg.castShadow = true;
      human.add(leg);
    }

    // 3. Gövde & Katmanlı Osmanlı Kaftanı / Cübbesi
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.40, 1.05, 18), kaftanMat);
    body.position.y = 1.02;
    body.castShadow = true;
    human.add(body);

    // Altın İşlemeli Kaftan Ön Bordürü (Sırma Şerit)
    const border = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.02, 0.02), this.materials.gold);
    border.position.set(0, 1.02, 0.32);
    human.add(border);

    // Kuşak / İpek Kemer
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.05, 10, 20), this.materials.leather);
    belt.position.y = 1.05;
    belt.rotation.x = Math.PI / 2;
    human.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), this.materials.gold);
    buckle.position.set(0, 1.05, 0.34);
    human.add(buckle);

    // 4. Kollar ve 5 Parmaklı Eller
    for (let dir of [-1, 1]) {
      const armGroup = new THREE.Group();
      armGroup.position.set(dir * 0.26, 1.48, 0);

      // Omuz
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), kaftanMat);
      shoulder.castShadow = true;
      armGroup.add(shoulder);

      // Kol (Doğal A-Pose)
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.58, 14), kaftanMat);
      arm.position.set(dir * 0.06, -0.26, 0.02);
      arm.rotation.set(0.14, 0, -dir * 0.18);
      arm.castShadow = true;
      armGroup.add(arm);

      // 5 Parmaklı Anatomik El
      const hand = this.createAnatomicalHand(skinMat, dir < 0);
      hand.position.set(dir * 0.12, -0.56, 0.06);
      hand.rotation.set(0.15, -dir * 0.3, 0);
      armGroup.add(hand);

      human.add(armGroup);
    }

    // 5. Heykelsi Yüz & Başlık (Sarık / Börk)
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.72;

    const face = this.createSculptedHead(config, skinMat, hairMat);
    headGroup.add(face);

    // Sakal & Pala Bıyık
    if (config.hasBeard !== false) {
      const beard = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 10), hairMat);
      beard.position.set(0, -0.10, 0.085);
      beard.rotation.x = Math.PI / 3.8;
      headGroup.add(beard);

      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.06), hairMat);
      mustache.position.set(0, -0.02, 0.135);
      headGroup.add(mustache);
    }

    // Başlık
    if (config.headwear === 'bork') {
      // Sipahi Börkü
      const bork = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 14), new THREE.MeshStandardMaterial({ color: 0x8b1e1e }));
      bork.position.y = 0.20;
      bork.rotation.x = -0.1;
      headGroup.add(bork);
    } else {
      // Katmanlı Beyaz Sarık & Kırmızı Fes
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.07, 10, 24), turbanMat);
      wrap.position.y = 0.12;
      wrap.rotation.x = Math.PI / 2;
      headGroup.add(wrap);

      const fez = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.13, 0.18, 14), new THREE.MeshStandardMaterial({ color: 0x8b1e1e }));
      fez.position.y = 0.20;
      headGroup.add(fez);
    }

    human.add(headGroup);
    return human;
  }

  // 3. TARİHİ SAFRANBOLU KONAĞI & EVİ (CUMBALI, AHŞAP HATILLI, KAFES PENCERELİ)
  createOttomanHouse(w = 8, l = 7, h = 6.5, hasCumba = true) {
    const house = new THREE.Group();

    // 1. Zemin Kat (Tarihi Taş Duvar Temeli)
    const groundH = h * 0.45;
    const groundMesh = new THREE.Mesh(new THREE.BoxGeometry(w, groundH, l), this.materials.stone);
    groundMesh.position.y = groundH / 2;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    house.add(groundMesh);

    // Zemin Kat Ahşap Giriş Kapısı
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), this.materials.wood);
    door.position.set(0, 1.1, l / 2 + 0.05);
    door.castShadow = true;
    house.add(door);

    // 2. Üst Kat (Kerpiç/Kireç Sıva + Ahşap Çıkmalı Cumba)
    const upperH = h * 0.55;
    const upperW = hasCumba ? w * 1.08 : w;
    const upperL = hasCumba ? l * 1.12 : l;

    const upperMesh = new THREE.Mesh(new THREE.BoxGeometry(upperW, upperH, upperL), this.materials.house);
    upperMesh.position.y = groundH + (upperH / 2);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    house.add(upperMesh);

    // Cumba Altı Ahşap Destek Payandaları (Struts)
    if (hasCumba) {
      for (let x of [-w * 0.35, 0, w * 0.35]) {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), this.materials.wood);
        strut.position.set(x, groundH - 0.45, l / 2 + 0.35);
        strut.rotation.x = Math.PI / 4.5;
        strut.castShadow = true;
        house.add(strut);
      }
    }

    // Ahşap Hatıllar & Köşe Kirişleri
    for (let x of [-upperW / 2, upperW / 2]) {
      for (let z of [-upperL / 2, upperL / 2]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.18, upperH, 0.18), this.materials.wood);
        beam.position.set(x, groundH + upperH / 2, z);
        house.add(beam);
      }
    }

    // Kafesli Ahşap Pencereler (Ön ve Yan Cepheler)
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x1a2530, roughness: 0.2, metalness: 0.6 });
    for (let wx of [-upperW * 0.28, upperW * 0.28]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.08), windowMat);
      win.position.set(wx, groundH + upperH * 0.55, upperL / 2 + 0.05);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.45, 0.05), this.materials.wood);
      frame.position.set(wx, groundH + upperH * 0.55, upperL / 2 + 0.03);
      house.add(frame, win);
    }

    // 3. Alaturka Oluklu Kiremit Geniş Saçaklı Çatı
    const roofH = 2.6;
    const roofOverhang = 1.25;
    const roofMesh = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(upperW, upperL) * 0.82 * roofOverhang, roofH, 4),
      this.materials.roof
    );
    roofMesh.position.y = h + roofH / 2;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    house.add(roofMesh);

    return house;
  }

  createSipahiMansion() {
    const mansion = this.createOttomanHouse(13, 11, 8.5, true);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 8), this.materials.wood);
    pole.position.set(5.0, 10.5, 5.0);
    mansion.add(pole);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshStandardMaterial({
      color: 0x8b1e1e,
      side: THREE.DoubleSide
    }));
    flag.position.set(6.2, 12, 5.0);
    mansion.add(flag);

    return mansion;
  }

  // 4. TARİHİ OSMANLI MESCİDİ & ŞADIRVANLI CAMİ
  createMosque() {
    const mosque = new THREE.Group();

    // Kesme Taş Ana Gövde
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 6.5, 12), this.materials.stone);
    base.position.y = 3.25;
    base.castShadow = true;
    base.receiveShadow = true;
    mosque.add(base);

    // Kemerli Giriş Portali
    const portal = new THREE.Mesh(new THREE.BoxGeometry(4, 4.5, 1.2), this.materials.stone);
    portal.position.set(0, 2.25, 6.4);
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.2, 0.1), this.materials.wood);
    door.position.set(0, 1.6, 6.9);
    mosque.add(portal, door);

    // Kubbe Kasnağı (Sekizgen Taş Taban)
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.5, 1.4, 8), this.materials.stone);
    drum.position.y = 7.2;
    drum.castShadow = true;
    mosque.add(drum);

    // Kurşun Mavi Ana Kubbe
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(5.4, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.domeBlue
    );
    dome.position.y = 7.8;
    dome.castShadow = true;
    mosque.add(dome);

    // Kubbe Alemi (Hilal)
    const alem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), this.materials.gold);
    alem.position.y = 13.8;
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 16, Math.PI * 1.5), this.materials.gold);
    crescent.position.y = 14.6;
    mosque.add(alem, crescent);

    // Tarihi Taş Minare & Şerefe
    const minaret = new THREE.Group();
    minaret.position.set(7.0, 0, 7.0);

    const minBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.0, 2.8), this.materials.stone);
    minBase.position.y = 2.0;
    minaret.add(minBase);

    const minBody = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 16, 16), this.materials.stone);
    minBody.position.y = 11.5;
    minBody.castShadow = true;
    minaret.add(minBody);

    // Şerefe (Balkon)
    const balcony = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 1.2, 16), this.materials.stone);
    balcony.position.y = 19.5;
    minaret.add(balcony);

    // Minare Külahı
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 16), this.materials.domeBlue);
    cone.position.y = 22.8;
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
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x422814, roughness: 0.85 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.5, 8), trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Yapraklar (Çam Konileri)
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1b3e1f, roughness: 0.75 });
    
    // 3 Katmanlı Çam Ağacı
    const layer1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.2, 8), leavesMat);
    layer1.position.y = 3;
    layer1.castShadow = true;
    layer1.receiveShadow = true;
    tree.add(layer1);

    const layer2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.6, 8), leavesMat);
    layer2.position.y = 4.6;
    layer2.castShadow = true;
    layer2.receiveShadow = true;
    tree.add(layer2);

    const layer3 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 8), leavesMat);
    layer3.position.y = 6.2;
    layer3.castShadow = true;
    layer3.receiveShadow = true;
    tree.add(layer3);

    return tree;
  }

  // 11. TARİHİ OSMANLI SERVİ AĞACI (CYPRESS TREE)
  createCypressTree() {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.2, 8), this.materials.wood);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x183820, roughness: 0.80 });
    const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.2, 7.5, 12), foliageMat);
    foliage.position.y = 4.8;
    foliage.castShadow = true;
    tree.add(foliage);

    return tree;
  }

  // 12. TARİHİ OSMANLI KEMERLİ TAŞ KÖPRÜSÜ
  createStoneArchBridge(length = 24, width = 6.5) {
    const bridge = new THREE.Group();

    // Köprü Zemin Yolu (Kavisli Eğimli Taş Parke)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.8, length), this.materials.path);
    deck.position.y = 2.8;
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridge.add(deck);

    // Taş Kemerler (Arch Supports)
    for (let z of [-length * 0.28, length * 0.28]) {
      const archPillar = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.48, width * 0.52, 3.2, 12), this.materials.stone);
      archPillar.position.set(0, 1.4, z);
      archPillar.castShadow = true;
      bridge.add(archPillar);
    }

    // Taş Korkuluklar (Parapets)
    for (let dir of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, length), this.materials.stone);
      rail.position.set(dir * (width / 2 - 0.25), 3.6, 0);
      rail.castShadow = true;
      bridge.add(rail);

      // Korkuluk Babaları (Post Finials)
      for (let pz of [-length / 2, 0, length / 2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.35, 0.65), this.materials.stone);
        post.position.set(dir * (width / 2 - 0.25), 3.75, pz);
        post.castShadow = true;
        bridge.add(post);
      }
    }

    return bridge;
  }

  // 13. KÖY SU KUYUSU (WELL)
  createWaterWell() {
    const well = new THREE.Group();

    // Taş Kuyu Gövdesi
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 1.1, 14), this.materials.stone);
    base.position.y = 0.55;
    base.castShadow = true;
    well.add(base);

    // Kuyu İçi Su
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.95, 12), this.materials.water);
    water.position.y = 0.85;
    water.rotation.x = -Math.PI / 2;
    well.add(water);

    // Ahşap Çatı Direkleri
    for (let dir of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), this.materials.wood);
      pole.position.set(dir * 1.0, 1.6, 0);
      pole.castShadow = true;
      well.add(pole);
    }

    // Ahşap Çıkrık & Halat
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 8), this.materials.wood);
    axle.position.set(0, 2.1, 0);
    axle.rotation.z = Math.PI / 2;
    well.add(axle);

    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.35, 8), this.materials.wood);
    bucket.position.set(0, 1.3, 0);
    well.add(bucket);

    // Kiremit Çatı
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.2, 4), this.materials.roof);
    roof.position.y = 3.1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    well.add(roof);

    return well;
  }

  // 14. TARİHİ OSMANLI MEZAR TAŞI (SARIKLI KAVUKLU ŞAHİDE)
  createOttomanTombstone() {
    const tomb = new THREE.Group();
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d4, roughness: 0.65 });

    // Mezar Mermer Kaidesi
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 1.8), marbleMat);
    base.position.y = 0.12;
    base.castShadow = true;
    tomb.add(base);

    // Mezar Taşı Şahidesi (Dikilitaş)
    const stela = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.2, 0.12), marbleMat);
    stela.position.set(0, 0.75, -0.75);
    stela.castShadow = true;
    tomb.add(stela);

    // Sarıklı Başlık
    const turban = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.06, 8, 16), marbleMat);
    turban.position.set(0, 1.40, -0.75);
    turban.rotation.x = Math.PI / 2;
    tomb.add(turban);

    return tomb;
  }

  // 15. AHŞAP AT ARABASI (WAGON / CART)
  createWagon() {
    const wagon = new THREE.Group();

    // Ahşap Kasa
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 3.4), this.materials.wood);
    bed.position.y = 0.85;
    bed.castShadow = true;
    wagon.add(bed);

    // Ahşap Parmaklıklı Tekerlekler (4 Adet)
    for (let dx of [-1.05, 1.05]) {
      for (let dz of [-1.1, 1.1]) {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 8, 16), this.materials.wood);
        wheel.position.set(dx, 0.52, dz);
        wheel.rotation.y = Math.PI / 2;
        wheel.castShadow = true;
        wagon.add(wheel);
      }
    }

    // Saman ve Çuvallar
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.9 });
    const load = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), hayMat);
    load.position.set(0, 1.35, 0.2);
    load.scale.set(1.0, 0.7, 1.4);
    wagon.add(load);

    return wagon;
  }

  // 16. KÖY GİRİŞ KAPISI & KALEVİ AHŞAP HİSAR
  createVillageGate() {
    const gateGroup = new THREE.Group();

    // Sol & Sağ Taş Kuleler
    for (let dir of [-1, 1]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.5, 6.5, 2.5), this.materials.stone);
      tower.position.set(dir * 4.5, 3.25, 0);
      tower.castShadow = true;
      gateGroup.add(tower);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.2, 4), this.materials.roof);
      roof.position.set(dir * 4.5, 7.5, 0);
      roof.rotation.y = Math.PI / 4;
      gateGroup.add(roof);

      // Meşaleler
      const torch = new THREE.PointLight(0xff7722, 1.8, 14);
      torch.position.set(dir * 3.2, 4.0, 1.3);
      gateGroup.add(torch);
    }

    // Üst Ahşap Köprü / Kemer
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.8, 2.0), this.materials.wood);
    lintel.position.set(0, 5.8, 0);
    lintel.castShadow = true;
    gateGroup.add(lintel);

    // Kırmızı Osmanlı Sancağı
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({
      color: 0x8b1e1e,
      side: THREE.DoubleSide
    }));
    flag.position.set(0, 6.8, 0);
    gateGroup.add(flag);

    return gateGroup;
  }

  // 17. ANADOLU KÖY KOYUNU (SHEEP)
  createSheep() {
    const sheep = new THREE.Group();
    const woolMat = new THREE.MeshStandardMaterial({ color: 0xede8dc, roughness: 0.95 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x3d3228, roughness: 0.8 });

    // Yün Gövde
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 1.2), woolMat);
    body.position.y = 0.65;
    body.castShadow = true;
    sheep.add(body);

    // Kafa
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), skinMat);
    head.position.set(0, 0.85, 0.65);
    head.castShadow = true;
    sheep.add(head);

    // Kulaklar
    for (let s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.08), skinMat);
      ear.position.set(s * 0.22, 0.92, 0.62);
      ear.rotation.z = s * 0.35;
      sheep.add(ear);
    }

    // 4 Bacak
    for (let x of [-0.28, 0.28]) {
      for (let z of [-0.4, 0.4]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), skinMat);
        leg.position.set(x, 0.22, z);
        leg.castShadow = true;
        sheep.add(leg);
      }
    }

    return sheep;
  }

  // 18. KÖY TAVUĞU (CHICKEN)
  createChicken() {
    const chicken = new THREE.Group();
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xc87d32, roughness: 0.8 }); // Kahverengi/Kızıl Köy Tavuğu
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xd49b28, roughness: 0.5 });
    const combMat = new THREE.MeshStandardMaterial({ color: 0xb51e1e, roughness: 0.6 });

    // Gövde
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.32), featherMat);
    body.position.y = 0.24;
    chicken.add(body);

    // Kafa
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), featherMat);
    head.position.set(0, 0.38, 0.14);
    chicken.add(head);

    // Gaga & İbik
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), beakMat);
    beak.position.set(0, 0.36, 0.22);
    beak.rotation.x = Math.PI / 2;
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.10), combMat);
    comb.position.set(0, 0.46, 0.13);
    chicken.add(beak, comb);

    // Bacaklar
    for (let x of [-0.06, 0.06]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 4), beakMat);
      leg.position.set(x, 0.08, 0);
      chicken.add(leg);
    }

    return chicken;
  }

  // 19. AHŞAP OSMANLI SEDİRİ / YATAK (SEDİR BED)
  createSedirBed() {
    const bed = new THREE.Group();
    const woodMat = this.materials.wood;
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x7a2828, roughness: 0.85 }); // Kırmızı Kilim Döşek

    // Ahşap Kaide
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 2.2), woodMat);
    base.position.y = 0.18;
    base.castShadow = true;
    bed.add(base);

    // Kilim Minder
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 2.1), fabricMat);
    mattress.position.y = 0.42;
    bed.add(mattress);

    // Yastık (Pillow)
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.45), new THREE.MeshStandardMaterial({ color: 0xddcca8 }));
    pillow.position.set(0, 0.54, -0.75);
    bed.add(pillow);

    return bed;
  }

  // 20. AHŞAP TAHLIL / SU FIÇISI (BARREL)
  createBarrel() {
    const barrel = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 0.8 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });

    // Fıçı Gövdesi
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.1, 12), woodMat);
    body.position.y = 0.55;
    body.castShadow = true;
    barrel.add(body);

    // Demir Kuşaklar (Hoops)
    for (let y of [0.2, 0.55, 0.9]) {
      const hoop = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.05, 12), ironMat);
      hoop.position.y = y;
      barrel.add(hoop);
    }

    return barrel;
  }

  // 21. BUĞDAY SAMAN BALYASI (HAY BALE)
  createHayBale() {
    const bale = new THREE.Group();
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xc4a45a, roughness: 0.95 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), hayMat);
    body.position.y = 0.35;
    body.castShadow = true;
    bale.add(body);

    // İp Kuşakları
    for (let x of [-0.3, 0.3]) {
      const rope = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.82), ropeMat);
      rope.position.set(x, 0.35, 0);
      bale.add(rope);
    }

    return bale;
  }

  // 22. PEŞTEMALLİ HAMAM ADAMI / TELLAĞI
  createPestemalMan(skinTone = 0xd8ad88, pestemalColor = 0xb53232) {
    const man = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.7 });
    const pestemalMat = new THREE.MeshStandardMaterial({ color: pestemalColor, roughness: 0.85 }); // Peştemal
    const takunyaMat = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.8 }); // Ahşap Takunya

    // Beden (Çıplak Üst Gövde)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.65, 0.28), skinMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    man.add(torso);

    // Baş (Kafa)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), skinMat);
    head.position.set(0, 1.82, 0);
    head.castShadow = true;
    man.add(head);

    // Belden Aşağı Sarılı Peştemal
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.33, 0.65, 10), pestemalMat);
    skirt.position.y = 0.85;
    skirt.castShadow = true;
    man.add(skirt);

    // Kollar
    for (let side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55), skinMat);
      arm.position.set(side * 0.32, 1.32, 0);
      arm.castShadow = true;
      man.add(arm);
    }

    // Bacaklar & Ayaklar (Takunyalı)
    for (let side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.52), skinMat);
      leg.position.set(side * 0.14, 0.30, 0);
      leg.castShadow = true;
      man.add(leg);

      const takunya = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.24), takunyaMat);
      takunya.position.set(side * 0.14, 0.03, 0.04);
      man.add(takunya);
    }

    return man;
  }

  // 23. HAMAM MERMER KURNASI & PİRİNÇ MUSLUK
  createHamamKurna() {
    const kurnaGroup = new THREE.Group();
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf5f5fa, roughness: 0.25, metalness: 0.1 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.3 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x4aa0d8, transparent: true, opacity: 0.75, roughness: 0.1 });

    // Kurna Kaidesi & Gövdesi
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.85), marbleMat);
    base.position.y = 0.38;
    base.castShadow = true;
    kurnaGroup.add(base);

    // Kurna İçi Su
    const water = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.72, 0);
    kurnaGroup.add(water);

    // Pirinç Osmanlı Musluğu
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25), brassMat);
    tap.rotation.x = Math.PI / 2;
    tap.position.set(0, 0.95, -0.38);
    kurnaGroup.add(tap);

    // Pirinç Hamam Tası
    const tas = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.07, 10), brassMat);
    tas.position.set(0.30, 0.80, 0.15);
    kurnaGroup.add(tas);

    return kurnaGroup;
  }

  // 24. HAMAM SEKİZGEN GÖBEK TAŞI
  createGobekTasi() {
    const gobekGroup = new THREE.Group();
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8f8fc, roughness: 0.2, metalness: 0.08 });
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd8d8e0, roughness: 0.35 });

    // Sekizgen Mermer Göbek Taşı
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, 0.55, 8), marbleMat);
    stone.position.y = 0.28;
    stone.castShadow = true;
    stone.receiveShadow = true;
    gobekGroup.add(stone);

    // Kenar Mermer Bordürü
    const border = new THREE.Mesh(new THREE.CylinderGeometry(3.15, 3.25, 0.15, 8), borderMat);
    stone.add(border);

    return gobekGroup;
  }

  // 25. KALE OK TALİM HEDEF PANOSU
  createArcheryTarget() {
    const targetGroup = new THREE.Group();
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xd4b870, roughness: 0.9 }); // Saman Hedef
    const woodMat = this.materials.wood;
    const ringRedMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6 });
    const ringYellowMat = new THREE.MeshStandardMaterial({ color: 0xddaa11, roughness: 0.6 });
    const ringWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });

    // Hedef Diski (Saman Gövde)
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.25, 20), strawMat);
    disk.rotation.x = Math.PI / 2;
    disk.position.y = 1.6;
    disk.castShadow = true;
    targetGroup.add(disk);

    // Beyaz Dış Halka
    const whiteRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.35, 20), ringWhiteMat);
    whiteRing.position.set(0, 1.6, 0.13);
    targetGroup.add(whiteRing);

    // Kırmızı Orta Halka
    const redRing = new THREE.Mesh(new THREE.RingGeometry(0.40, 0.85, 20), ringRedMat);
    redRing.position.set(0, 1.6, 0.132);
    targetGroup.add(redRing);

    // Sarı Merkez (12'den Vurulan Göbek Noktası)
    const bullseye = new THREE.Mesh(new THREE.CircleGeometry(0.40, 20), ringYellowMat);
    bullseye.position.set(0, 1.6, 0.134);
    targetGroup.add(bullseye);

    // Ahşap Sehpa / Ayaklar
    for (let angle of [-0.35, 0.35]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.2), woodMat);
      leg.position.set(Math.sin(angle) * 0.9, 0.95, -0.2);
      leg.rotation.z = -angle;
      leg.castShadow = true;
      targetGroup.add(leg);
    }
    const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.3), woodMat);
    backLeg.position.set(0, 0.95, -0.65);
    backLeg.rotation.x = 0.35;
    targetGroup.add(backLeg);

    return targetGroup;
  }

  // 26. 1. ŞAHIS OSMANLI TALİM YAYI (BOW RIG)
  createFirstPersonBow() {
    const bowRig = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.65 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Yay Eğrisi (Kavisli Torus Parçası)
    const bowCurve = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.024, 8, 24, Math.PI * 0.85), woodMat);
    bowCurve.rotation.z = Math.PI * 0.08;
    bowCurve.position.set(0.12, -0.1, -0.45);
    bowRig.add(bowCurve);

    // Deri Kabza
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.16, 8), gripMat);
    grip.position.set(0.12, -0.1, -0.45);
    bowRig.add(grip);

    // Kiriş İpi (String)
    const stringPoints = [
      new THREE.Vector3(0.12, 0.42, -0.45),
      new THREE.Vector3(0.12, -0.1, -0.32), // Çekilme noktası
      new THREE.Vector3(0.12, -0.62, -0.45)
    ];
    const stringGeo = new THREE.BufferGeometry().setFromPoints(stringPoints);
    const bowString = new THREE.Line(stringGeo, stringMat);
    bowRig.add(bowString);

    // Yay Pozisyonu
    bowRig.position.set(0.15, -0.18, -0.2);
    bowRig.visible = false;

    return bowRig;
  }

  // 27. AHŞAP SİLAH VE YAY SEHPASI (WEAPON RACK)
  createWeaponRack() {
    const rack = new THREE.Group();
    const woodMat = this.materials.wood;

    // İki Yan Dikme
    for (let x of [-0.6, 0.6]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8), woodMat);
      post.position.set(x, 0.9, 0);
      post.castShadow = true;
      rack.add(post);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.8), woodMat);
      foot.position.set(x, 0.05, 0);
      rack.add(foot);
    }

    // Yatay Çıtalar
    for (let y of [0.4, 0.9, 1.4]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.06), woodMat);
      bar.position.set(0, y, 0);
      rack.add(bar);
    }

    return rack;
  }
}
