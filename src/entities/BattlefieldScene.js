import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder.js';

/**
 * BattlefieldScene - 1396 Niğbolu ve 1402 Ankara 3D Harp Meydanı ve Savaş Modelleri
 * Dünyanın (x: 400, z: 400) koordinatlarında gerçek 3D savaş atmosferi inşa eder.
 */
export class BattlefieldScene {
  constructor(scene) {
    this.scene = scene;
    this.modelBuilder = new ModelBuilder();
    this.battleGroup = new THREE.Group();
    this.battleGroup.position.set(400, 0, 400);

    this.crusaderUnits = [];
    this.ottomanUnits = [];
    this.timurUnits = [];
    this.warElephant = null;
    this.stakes = [];
    this.banners = [];

    this.currentMode = 'nigbolu'; // 'nigbolu' | 'ankara'
    this.initBattlefield();
    this.scene.add(this.battleGroup);
  }

  initBattlefield() {
    // 1. Kan ve Tozla Çiğnenmiş Harp Meydanı Zemini
    const groundGeo = new THREE.PlaneGeometry(160, 160, 16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b2c,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.battleGroup.add(ground);

    // 2. Kazık Hattı (Kazıklı Barikatlar z: -5)
    this.buildStakeLine();

    // 3. Osmanlı Karargâhı & Sancaklar (z: -25 ile -15)
    this.buildOttomanArmy();

    // 4. Haçlı Ordusu (z: 20 ile 35) - Niğbolu
    this.buildCrusaderArmy();

    // 5. Timur'un Ordusu & Dev Zırhlı Savaş Fili (z: 20 ile 35) - Ankara
    this.buildTimurArmyAndElephant();

    this.setMode('nigbolu');
  }

  buildStakeLine() {
    const stakeGeo = new THREE.CylinderGeometry(0.08, 0.14, 2.2, 6);
    const stakeMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });

    for (let x = -35; x <= 35; x += 1.6) {
      const stake = new THREE.Mesh(stakeGeo, stakeMat);
      stake.position.set(x + (Math.random() - 0.5) * 0.4, 0.9, -5 + (Math.random() - 0.5) * 0.8);
      stake.rotation.x = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
      stake.rotation.z = (Math.random() - 0.5) * 0.2;
      stake.castShadow = true;
      this.battleGroup.add(stake);
      this.stakes.push(stake);
    }
  }

  buildOttomanArmy() {
    this.ottomanGroup = new THREE.Group();

    // Kırmızı Hilâl Sancakları
    for (let x = -28; x <= 28; x += 14) {
      const flag = this.createOttomanBanner();
      flag.position.set(x, 0, -22);
      this.ottomanGroup.add(flag);
      this.banners.push(flag);
    }

    // Sipahi Süvari Sıraları (Ön ve Orta Hat)
    for (let row = 0; row < 2; row++) {
      for (let x = -30; x <= 30; x += 5) {
        const horseSipahi = this.createOttomanSipahiUnit();
        horseSipahi.position.set(x + (row % 2) * 2.5, 0, -18 - row * 6);
        this.ottomanGroup.add(horseSipahi);
        this.ottomanUnits.push(horseSipahi);
      }
    }

    // Sultanın Altın Kubbeli Otağ-ı Hümayunu (Arka Merkez)
    const tentGeo = new THREE.ConeGeometry(5, 4.5, 10);
    const tentMat = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.7 });
    const tent = new THREE.Mesh(tentGeo, tentMat);
    tent.position.set(0, 2.25, -36);
    this.ottomanGroup.add(tent);

    this.battleGroup.add(this.ottomanGroup);
  }

  createOttomanBanner() {
    const group = new THREE.Group();
    // Direk
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x221105 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.75;
    group.add(pole);

    // Kırmızı Hilal Kumaş
    const flagGeo = new THREE.PlaneGeometry(2.0, 1.3);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xaa1111,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(1.0, 4.4, 0);
    group.add(flag);

    // Altın Alem
    const alemGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const alemMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const alem = new THREE.Mesh(alemGeo, alemMat);
    alem.position.y = 5.5;
    group.add(alem);

    return group;
  }

  createOttomanSipahiUnit() {
    const unit = new THREE.Group();
    // At gövdesi
    const horseBodyGeo = new THREE.BoxGeometry(0.9, 0.9, 1.8);
    const horseMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10 });
    const horseBody = new THREE.Mesh(horseBodyGeo, horseMat);
    horseBody.position.y = 1.2;
    unit.add(horseBody);

    // Sipahi Asker Gövdesi
    const manGeo = new THREE.BoxGeometry(0.6, 0.9, 0.5);
    const manMat = new THREE.MeshStandardMaterial({ color: 0x8b2500 });
    const man = new THREE.Mesh(manGeo, manMat);
    man.position.set(0, 2.0, 0);
    unit.add(man);

    // Miğfer & Sarık
    const helmetGeo = new THREE.ConeGeometry(0.28, 0.45, 8);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 2.6, 0);
    unit.add(helmet);

    // Mızrak / Kılıç
    const spearGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.2, 6);
    const spearMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7 });
    const spear = new THREE.Mesh(spearGeo, spearMat);
    spear.position.set(0.4, 2.4, 0.5);
    spear.rotation.x = -Math.PI / 6;
    unit.add(spear);

    return unit;
  }

  buildCrusaderArmy() {
    this.crusaderGroup = new THREE.Group();

    // Haçlı Bayrakları (Mavi/Kırmızı Haçlar)
    for (let x = -28; x <= 28; x += 14) {
      const flag = this.createCrusaderBanner();
      flag.position.set(x, 0, 32);
      this.crusaderGroup.add(flag);
    }

    // Ağır Plaka Zırhlı Şövalyeler
    for (let row = 0; row < 2; row++) {
      for (let x = -30; x <= 30; x += 4.5) {
        const knight = this.createCrusaderKnight();
        knight.position.set(x + (row % 2) * 2.2, 0, 15 + row * 6);
        this.crusaderGroup.add(knight);
        this.crusaderUnits.push(knight);
      }
    }

    this.battleGroup.add(this.crusaderGroup);
  }

  createCrusaderBanner() {
    const group = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.75;
    group.add(pole);

    const flagGeo = new THREE.PlaneGeometry(2.0, 1.3);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-1.0, 4.4, 0);
    group.add(flag);

    return group;
  }

  createCrusaderKnight() {
    const knight = new THREE.Group();
    // Çelik Plaka Zırh Gövde
    const bodyGeo = new THREE.BoxGeometry(0.7, 1.0, 0.5);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.25 });
    const body = new THREE.Mesh(bodyGeo, steelMat);
    body.position.y = 1.3;
    knight.add(body);

    // Demir Şövalye Miğferi (Great Helm)
    const helmGeo = new THREE.BoxGeometry(0.4, 0.45, 0.45);
    const helm = new THREE.Mesh(helmGeo, steelMat);
    helm.position.y = 2.0;
    knight.add(helm);

    // Kalkan (Kite Shield)
    const shieldGeo = new THREE.BoxGeometry(0.5, 0.8, 0.08);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.45, 1.3, 0.2);
    knight.add(shield);

    // Uzun Şövalye Kılıcı
    const swordGeo = new THREE.BoxGeometry(0.06, 1.3, 0.12);
    const sword = new THREE.Mesh(swordGeo, steelMat);
    sword.position.set(0.45, 1.3, 0.25);
    knight.add(sword);

    return knight;
  }

  buildTimurArmyAndElephant() {
    this.timurGroup = new THREE.Group();

    // Timur Tuğları
    for (let x = -28; x <= 28; x += 14) {
      const tug = this.createTimurTug();
      tug.position.set(x, 0, 32);
      this.timurGroup.add(tug);
    }

    // Çağatay Süvarileri
    for (let row = 0; row < 2; row++) {
      for (let x = -30; x <= 30; x += 6) {
        if (Math.abs(x) < 8 && row === 0) continue; // Fil için merkezde yer aç
        const rider = this.createTimurRider();
        rider.position.set(x, 0, 18 + row * 6);
        this.timurGroup.add(rider);
        this.timurUnits.push(rider);
      }
    }

    // 🐘 EMİR TİMUR'UN DEV ZIRHLI SAVAŞ FİLİ (WAR ELEPHANT)
    this.warElephant = this.createArmoredWarElephant();
    this.warElephant.position.set(0, 0, 18);
    this.timurGroup.add(this.warElephant);

    this.battleGroup.add(this.timurGroup);
  }

  createTimurTug() {
    const group = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.75;
    group.add(pole);

    // At Kuyruğu Püskül
    const hairGeo = new THREE.ConeGeometry(0.35, 1.4, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 4.5, 0);
    hair.rotation.x = Math.PI;
    group.add(hair);

    return group;
  }

  createTimurRider() {
    const unit = new THREE.Group();
    const horseBodyGeo = new THREE.BoxGeometry(0.85, 0.85, 1.7);
    const horseMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a });
    const horseBody = new THREE.Mesh(horseBodyGeo, horseMat);
    horseBody.position.y = 1.1;
    unit.add(horseBody);

    const manGeo = new THREE.BoxGeometry(0.55, 0.85, 0.45);
    const manMat = new THREE.MeshStandardMaterial({ color: 0x223322 });
    const man = new THREE.Mesh(manGeo, manMat);
    man.position.set(0, 1.9, 0);
    unit.add(man);

    // Tatar Miğferi
    const helmGeo = new THREE.ConeGeometry(0.26, 0.4, 8);
    const helmMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 });
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.set(0, 2.45, 0);
    unit.add(helm);

    // Kompozit Yay
    const bowGeo = new THREE.TorusGeometry(0.4, 0.03, 6, 12, Math.PI);
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const bow = new THREE.Mesh(bowGeo, bowMat);
    bow.position.set(0.35, 1.9, 0.3);
    bow.rotation.y = Math.PI / 2;
    unit.add(bow);

    return unit;
  }

  createArmoredWarElephant() {
    const elephant = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });
    const tuskMat = new THREE.MeshStandardMaterial({ color: 0xf0ede6, roughness: 0.3 });

    // 1. Devasa Gövde
    const bodyGeo = new THREE.BoxGeometry(3.6, 3.4, 5.8);
    const body = new THREE.Mesh(bodyGeo, skinMat);
    body.position.y = 4.2;
    body.castShadow = true;
    elephant.add(body);

    // Zırhlı Sırt Örtüsü (Caparison)
    const caparisonGeo = new THREE.BoxGeometry(3.7, 2.2, 5.2);
    const caparisonMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 });
    const caparison = new THREE.Mesh(caparisonGeo, caparisonMat);
    caparison.position.set(0, 4.4, 0);
    elephant.add(caparison);

    // 2. 4 Kalın Sütun Bacak
    const legGeo = new THREE.CylinderGeometry(0.65, 0.75, 3.0, 10);
    const legPositions = [
      [-1.3, 1.5, 1.8], [1.3, 1.5, 1.8],
      [-1.3, 1.5, -1.8], [1.3, 1.5, -1.8]
    ];
    elephant.legs = [];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, skinMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      elephant.add(leg);
      elephant.legs.push(leg);
    });

    // 3. Fil Başı & Zırhlı Miğfer
    const headGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 4.8, -3.4);
    elephant.add(head);

    // Çelik Alın Zırhı (Chamfron)
    const headArmorGeo = new THREE.BoxGeometry(2.1, 2.2, 0.4);
    const headArmor = new THREE.Mesh(headArmorGeo, armorMat);
    headArmor.position.set(0, 4.9, -4.5);
    elephant.add(headArmor);

    // Altın Baş Çivisi
    const spikeGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(0, 5.8, -4.6);
    spike.rotation.x = -Math.PI / 4;
    elephant.add(spike);

    // 4. Kulaklar
    const earGeo = new THREE.BoxGeometry(1.6, 2.0, 0.15);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-1.8, 5.0, -3.0);
    leftEar.rotation.y = Math.PI / 6;
    elephant.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(1.8, 5.0, -3.0);
    rightEar.rotation.y = -Math.PI / 6;
    elephant.add(rightEar);

    // 5. Hortum (Trunk)
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.22, 2.8, 8);
    const trunk = new THREE.Mesh(trunkGeo, skinMat);
    trunk.position.set(0, 3.2, -4.4);
    trunk.rotation.x = Math.PI / 6;
    elephant.add(trunk);
    elephant.trunk = trunk;

    // 6. Bıçaklı İki Dev Fildişi (Tusks with Steel Blades)
    const tuskGeo = new THREE.ConeGeometry(0.22, 2.4, 8);
    const leftTusk = new THREE.Mesh(tuskGeo, tuskMat);
    leftTusk.position.set(-0.9, 3.8, -4.5);
    leftTusk.rotation.x = -Math.PI / 3;
    leftTusk.rotation.z = -0.15;
    elephant.add(leftTusk);

    const rightTusk = new THREE.Mesh(tuskGeo, tuskMat);
    rightTusk.position.set(0.9, 3.8, -4.5);
    rightTusk.rotation.x = -Math.PI / 3;
    rightTusk.rotation.z = 0.15;
    elephant.add(rightTusk);

    // Fildişi Uçlarındaki Çelik Kılıçlar
    const bladeGeo = new THREE.BoxGeometry(0.06, 1.2, 0.18);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.1 });
    const leftBlade = new THREE.Mesh(bladeGeo, bladeMat);
    leftBlade.position.set(-1.1, 3.2, -5.3);
    elephant.add(leftBlade);

    const rightBlade = new THREE.Mesh(bladeGeo, bladeMat);
    rightBlade.position.set(1.1, 3.2, -5.3);
    elephant.add(rightBlade);

    // 7. Filin Sırtındaki Kule (Howdah)
    const howdahGeo = new THREE.BoxGeometry(3.0, 1.8, 3.2);
    const howdahMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const howdah = new THREE.Mesh(howdahGeo, howdahMat);
    howdah.position.set(0, 6.7, 0);
    elephant.add(howdah);

    // Kule Üzerindeki Okçular
    const archerGeo = new THREE.BoxGeometry(0.6, 0.9, 0.5);
    const archerMat = new THREE.MeshStandardMaterial({ color: 0x112211 });
    const archer1 = new THREE.Mesh(archerGeo, archerMat);
    archer1.position.set(-0.7, 7.8, 0);
    elephant.add(archer1);

    const archer2 = new THREE.Mesh(archerGeo, archerMat);
    archer2.position.set(0.7, 7.8, 0);
    elephant.add(archer2);

    return elephant;
  }

  setMode(mode) {
    this.currentMode = mode;
    if (mode === 'ankara') {
      this.crusaderGroup.visible = false;
      this.timurGroup.visible = true;
    } else {
      this.crusaderGroup.visible = true;
      this.timurGroup.visible = false;
    }
  }

  update(delta) {
    // Sancakların rüzgarda dalgalanması
    const time = performance.now() * 0.003;
    this.banners.forEach((b, idx) => {
      b.rotation.y = Math.sin(time + idx) * 0.15;
    });

    if (this.warElephant && this.timurGroup.visible) {
      // Filin hafif nefes alma ve hortum salınımı
      this.warElephant.position.y = Math.sin(time * 1.5) * 0.08;
      if (this.warElephant.trunk) {
        this.warElephant.trunk.rotation.x = Math.PI / 6 + Math.sin(time * 2) * 0.1;
      }
    }
  }
}
