import * as THREE from 'three';

/**
 * Solo Leveling Hardcore Canavar ve Boss Yöneticisi (MonsterManager)
 * - Canavarlar ve Boss'lar Gölge Askerlere Gerçek Hasar Verip Onları Öldürebilir!
 * - Gerçekçi Dövüş Zorluğu ve Altın (Gold) Ödülleri
 * - Kaçılabilir ve Dengeli Boss Yetenekleri
 */
export class MonsterManager {
  constructor(scene) {
    this.scene = scene;
    this.monsters = [];
    this.boss = null;
    this.onMonsterKilled = null;
  }

  spawnDungeonMonsters(rank) {
    this.clearAll();

    const configs = {
      E: {
        mobCount: 12,
        mobName: 'Mağara Goblini',
        mobType: 'goblin',
        mobHp: 75,
        mobDmg: 12,
        mobSpeed: 4.8,
        mobColor: 0x166534,
        mobScale: 0.9,
        mobGold: 10,
        bossName: 'Goblin Reisi Razan',
        bossType: 'razan',
        bossHp: 850,
        bossDmg: 28,
        bossSpeed: 5.4,
        bossColor: 0x14532d,
        bossScale: 2.3,
        bossSpecial: 'slam',
        bossGold: 180,
        specialDamage: 35,
        specialRadius: 7.5
      },
      D: {
        mobCount: 16,
        mobName: 'Bataklık Zehir Yılanı',
        mobType: 'serpent',
        mobHp: 160,
        mobDmg: 22,
        mobSpeed: 5.8,
        mobColor: 0x047857,
        mobScale: 1.0,
        mobGold: 20,
        bossName: 'Mavi Zehirli Kasaka',
        bossType: 'kasaka',
        bossHp: 1900,
        bossDmg: 45,
        bossSpeed: 6.5,
        bossColor: 0x0284c7,
        bossScale: 2.6,
        bossSpecial: 'venom',
        bossGold: 350,
        specialDamage: 55,
        specialRadius: 8.5
      },
      C: {
        mobCount: 22,
        mobName: 'Don Muhafızı Buz Elfi',
        mobType: 'ice_elf',
        mobHp: 320,
        mobDmg: 36,
        mobSpeed: 6.8,
        mobColor: 0x38bdf8,
        mobScale: 1.1,
        mobGold: 35,
        bossName: 'Buz Elfi Lordu Baruka',
        bossType: 'baruka',
        bossHp: 3800,
        bossDmg: 70,
        bossSpeed: 8.0,
        bossColor: 0x0ea5e9,
        bossScale: 2.2,
        bossSpecial: 'blizzard',
        bossGold: 600,
        specialDamage: 85,
        specialRadius: 9.5
      },
      B: {
        mobCount: 30,
        mobName: 'Cehennem Alev İblisi',
        mobType: 'demon',
        mobHp: 650,
        mobDmg: 55,
        mobSpeed: 7.5,
        mobColor: 0xdc2626,
        mobScale: 1.2,
        mobGold: 60,
        bossName: 'Açgözlü İblis Kralı Vulcan',
        bossType: 'vulcan',
        bossHp: 7500,
        bossDmg: 110,
        bossSpeed: 7.0,
        bossColor: 0x991b1b,
        bossScale: 3.4,
        bossSpecial: 'meteor',
        bossGold: 1100,
        specialDamage: 130,
        specialRadius: 10.5
      },
      A: {
        mobCount: 40,
        mobName: 'Karanlık Karınca Askeri',
        mobType: 'ant',
        mobHp: 1100,
        mobDmg: 80,
        mobSpeed: 8.8,
        mobColor: 0x0f172a,
        mobScale: 1.3,
        mobGold: 100,
        bossName: 'Kan Kırmızı Igris',
        bossType: 'igris',
        bossHp: 14000,
        bossDmg: 160,
        bossSpeed: 9.8,
        bossColor: 0x991b1b,
        bossScale: 3.0,
        bossSpecial: 'igris_charge',
        bossGold: 2200,
        specialDamage: 180,
        specialRadius: 11.5
      }
    };

    const cfg = configs[rank] || configs.E;

    // Normal Canavarlar
    for (let i = 0; i < cfg.mobCount; i++) {
      const angle = (i / cfg.mobCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = 12 + Math.random() * 26;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const monster = this.buildDetailedMonsterMesh({
        name: cfg.mobName,
        type: cfg.mobType,
        maxHp: cfg.mobHp,
        damage: cfg.mobDmg,
        speed: cfg.mobSpeed,
        color: cfg.mobColor,
        scale: cfg.mobScale,
        gold: cfg.mobGold,
        isBoss: false,
        x,
        z
      });

      this.monsters.push(monster);
    }

    // Boss
    this.boss = this.buildDetailedBossMesh({
      name: cfg.bossName,
      type: cfg.bossType,
      maxHp: cfg.bossHp,
      damage: cfg.bossDmg,
      speed: cfg.bossSpeed,
      color: cfg.bossColor,
      scale: cfg.bossScale,
      gold: cfg.bossGold,
      special: cfg.bossSpecial,
      specialDamage: cfg.specialDamage,
      specialRadius: cfg.specialRadius,
      x: 0,
      z: -28
    });
  }

  buildDetailedMonsterMesh(cfg) {
    const group = new THREE.Group();
    group.position.set(cfg.x, 0, cfg.z);
    const s = cfg.scale;

    if (cfg.type === 'goblin') {
      const skinMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
      const leatherMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7 * s, 0.9 * s, 0.5 * s), skinMat);
      torso.position.y = 0.55 * s;
      torso.castShadow = true;
      group.add(torso);

      const hunch = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, 8, 8), skinMat);
      hunch.position.set(0, 0.8 * s, -0.2 * s);
      group.add(hunch);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 10, 10), skinMat);
      head.position.set(0, 1.1 * s, 0.1 * s);
      group.add(head);

      const earGeo = new THREE.ConeGeometry(0.08 * s, 0.35 * s, 4);
      const earL = new THREE.Mesh(earGeo, skinMat);
      earL.position.set(-0.35 * s, 1.15 * s, 0);
      earL.rotation.z = 1.1;
      const earR = new THREE.Mesh(earGeo, skinMat);
      earR.position.set(0.35 * s, 1.15 * s, 0);
      earR.rotation.z = -1.1;
      group.add(earL);
      group.add(earR);

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 6, 6), eyeMat);
      eye1.position.set(-0.12 * s, 1.15 * s, 0.35 * s);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 6, 6), eyeMat);
      eye2.position.set(0.12 * s, 1.15 * s, 0.35 * s);
      group.add(eye1);
      group.add(eye2);

      const club = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.12 * s, 0.8 * s, 6), leatherMat);
      club.position.set(0.48 * s, 0.6 * s, 0.25 * s);
      club.rotation.x = Math.PI / 4;
      group.add(club);

    } else if (cfg.type === 'serpent') {
      const scaleMat = new THREE.MeshStandardMaterial({
        color: 0x065f46,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0x10b981,
        emissiveIntensity: 0.3
      });

      for (let j = 0; j < 4; j++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry((0.35 - j * 0.05) * s, (0.4 - j * 0.05) * s, 0.5 * s, 8),
          scaleMat
        );
        seg.position.set(Math.sin(j * 0.8) * 0.2 * s, (0.3 + j * 0.35) * s, Math.cos(j * 0.8) * 0.15 * s);
        group.add(seg);
      }

      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.8 * s, 0.45 * s, 0.15 * s), scaleMat);
      hood.position.set(0, 1.5 * s, 0.1 * s);
      group.add(hood);

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 6, 6), eyeMat);
      eye1.position.set(-0.2 * s, 1.55 * s, 0.2 * s);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 6, 6), eyeMat);
      eye2.position.set(0.2 * s, 1.55 * s, 0.2 * s);
      group.add(eye1);
      group.add(eye2);

    } else if (cfg.type === 'ice_elf') {
      const elfMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.3 });
      const armorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7 * s, 1.1 * s, 0.45 * s), armorMat);
      body.position.y = 0.65 * s;
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.26 * s, 10, 10), elfMat);
      head.position.y = 1.35 * s;
      group.add(head);

      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.3 * s, 4), elfMat);
      earL.position.set(-0.3 * s, 1.4 * s, 0);
      earL.rotation.z = 1.2;
      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.3 * s, 4), elfMat);
      earR.position.set(0.3 * s, 1.4 * s, 0);
      earR.rotation.z = -1.2;
      group.add(earL);
      group.add(earR);

      const sword = new THREE.Mesh(
        new THREE.BoxGeometry(0.08 * s, 1.1 * s, 0.18 * s),
        new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.6 })
      );
      sword.position.set(0.5 * s, 0.7 * s, 0.3 * s);
      sword.rotation.x = Math.PI / 4;
      group.add(sword);

    } else if (cfg.type === 'demon') {
      const demonMat = new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        emissive: 0xef4444,
        emissiveIntensity: 0.45,
        roughness: 0.6
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.85 * s, 1.2 * s, 0.6 * s), demonMat);
      body.position.y = 0.7 * s;
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 8, 8), demonMat);
      head.position.y = 1.45 * s;
      group.add(head);

      const hornMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.9 });
      const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.1 * s, 0.45 * s, 5), hornMat);
      horn1.position.set(-0.2 * s, 1.8 * s, 0);
      horn1.rotation.z = -0.4;
      const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.1 * s, 0.45 * s, 5), hornMat);
      horn2.position.set(0.2 * s, 1.8 * s, 0);
      horn2.rotation.z = 0.4;
      group.add(horn1);
      group.add(horn2);

    } else {
      const chitinMat = new THREE.MeshStandardMaterial({
        color: 0x020617,
        metalness: 0.95,
        roughness: 0.2,
        emissive: 0x3b0764,
        emissiveIntensity: 0.4
      });

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45 * s, 8, 8), chitinMat);
      body.position.y = 0.7 * s;
      body.scale.set(0.9, 1.3, 0.9);
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 8, 8), chitinMat);
      head.position.y = 1.4 * s;
      group.add(head);

      const scytheMat = new THREE.MeshStandardMaterial({ color: 0x581c87, metalness: 0.9 });
      const scythe = new THREE.Mesh(new THREE.ConeGeometry(0.08 * s, 1.2 * s, 4), scytheMat);
      scythe.position.set(0.55 * s, 0.8 * s, 0.3 * s);
      scythe.rotation.set(Math.PI / 3, 0, -0.3);
      group.add(scythe);
    }

    this.scene.add(group);

    return {
      group,
      name: cfg.name,
      maxHp: cfg.maxHp,
      hp: cfg.maxHp,
      damage: cfg.damage,
      speed: cfg.speed,
      gold: cfg.gold || 10,
      isBoss: false,
      color: cfg.color,
      scale: s,
      attackCooldown: 0,
      attackRange: 2.4 * s,
      alive: true,
      hitFlash: 0
    };
  }

  buildDetailedBossMesh(cfg) {
    const group = new THREE.Group();
    group.position.set(cfg.x, 0, cfg.z);
    const s = cfg.scale;

    if (cfg.type === 'razan') {
      const armorMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.8, roughness: 0.4 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.7 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6 * s, 2.0 * s, 1.2 * s), armorMat);
      body.position.y = 1.2 * s;
      body.castShadow = true;
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.55 * s, 12, 12), skinMat);
      head.position.y = 2.4 * s;
      group.add(head);

      const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.18 * s, 0.8 * s, 6), armorMat);
      horn1.position.set(-0.45 * s, 2.9 * s, 0);
      horn1.rotation.z = -0.5;
      const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.18 * s, 0.8 * s, 6), armorMat);
      horn2.position.set(0.45 * s, 2.9 * s, 0);
      horn2.rotation.z = 0.5;
      group.add(horn1);
      group.add(horn2);

      const mace = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.65 * s),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95 })
      );
      mace.position.set(1.4 * s, 2.0 * s, 0.6 * s);
      group.add(mace);

    } else if (cfg.type === 'kasaka') {
      const kasakaMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        metalness: 0.7,
        roughness: 0.2
      });

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * s, 1.2 * s, 2.6 * s, 12), kasakaMat);
      body.position.y = 1.4 * s;
      group.add(body);

      const hood = new THREE.Mesh(new THREE.BoxGeometry(2.4 * s, 1.6 * s, 0.4 * s), kasakaMat);
      hood.position.set(0, 2.6 * s, 0.2 * s);
      group.add(hood);

      const fangMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x10b981, emissiveIntensity: 0.9 });
      const fang1 = new THREE.Mesh(new THREE.ConeGeometry(0.12 * s, 0.6 * s, 4), fangMat);
      fang1.position.set(-0.35 * s, 2.2 * s, 0.6 * s);
      const fang2 = new THREE.Mesh(new THREE.ConeGeometry(0.12 * s, 0.6 * s, 4), fangMat);
      fang2.position.set(0.35 * s, 2.2 * s, 0.6 * s);
      group.add(fang1);
      group.add(fang2);

    } else if (cfg.type === 'baruka') {
      const barukaArmor = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9, roughness: 0.2 });
      const iceBladeMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.2
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2 * s, 1.8 * s, 0.7 * s), barukaArmor);
      body.position.y = 1.1 * s;
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.45 * s, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      head.position.y = 2.2 * s;
      group.add(head);

      const d1 = new THREE.Mesh(new THREE.ConeGeometry(0.15 * s, 1.6 * s, 4), iceBladeMat);
      d1.position.set(-1.0 * s, 1.2 * s, 0.5 * s);
      d1.rotation.set(Math.PI / 4, 0, 0.3);
      const d2 = new THREE.Mesh(new THREE.ConeGeometry(0.15 * s, 1.6 * s, 4), iceBladeMat);
      d2.position.set(1.0 * s, 1.2 * s, 0.5 * s);
      d2.rotation.set(Math.PI / 4, 0, -0.3);
      group.add(d1);
      group.add(d2);

    } else if (cfg.type === 'vulcan') {
      const lavaMat = new THREE.MeshStandardMaterial({
        color: 0x450a0a,
        emissive: 0xdc2626,
        emissiveIntensity: 0.75,
        roughness: 0.4
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(2.0 * s, 2.6 * s, 1.4 * s), lavaMat);
      body.position.y = 1.5 * s;
      group.add(body);

      const flameSwordMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xef4444,
        emissiveIntensity: 1.5
      });
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.35 * s, 4.0 * s, 0.8 * s), flameSwordMat);
      sword.position.set(1.6 * s, 2.4 * s, 0.8 * s);
      sword.rotation.x = Math.PI / 5;
      group.add(sword);

    } else {
      const igrisArmor = new THREE.MeshStandardMaterial({
        color: 0x0a0a0f,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x991b1b,
        emissiveIntensity: 0.5
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.4 * s, 2.1 * s, 0.8 * s), igrisArmor);
      body.position.y = 1.3 * s;
      group.add(body);

      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.48 * s, 12, 12), igrisArmor);
      helm.position.y = 2.5 * s;
      group.add(helm);

      const plumeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const plume = new THREE.Mesh(new THREE.ConeGeometry(0.18 * s, 1.8 * s, 6), plumeMat);
      plume.position.set(0, 3.2 * s, -0.6 * s);
      plume.rotation.x = -1.1;
      group.add(plume);

      const cape = new THREE.Mesh(
        new THREE.BoxGeometry(1.6 * s, 2.4 * s, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 })
      );
      cape.position.set(0, 1.2 * s, -0.45 * s);
      group.add(cape);

      const greatSword = new THREE.Mesh(
        new THREE.BoxGeometry(0.25 * s, 4.5 * s, 0.7 * s),
        new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.95, emissive: 0x7c3aed, emissiveIntensity: 0.8 })
      );
      greatSword.position.set(1.2 * s, 2.2 * s, 0.7 * s);
      greatSword.rotation.x = Math.PI / 6;
      group.add(greatSword);
    }

    const bossLight = new THREE.PointLight(cfg.color, 3.0, 16 * s);
    bossLight.position.set(0, 2.5 * s, 0);
    group.add(bossLight);

    this.scene.add(group);

    return {
      group,
      name: cfg.name,
      maxHp: cfg.maxHp,
      hp: cfg.maxHp,
      damage: cfg.damage,
      speed: cfg.speed,
      gold: cfg.gold || 180,
      isBoss: true,
      color: cfg.color,
      scale: s,
      special: cfg.special,
      specialDamage: cfg.specialDamage || 35,
      specialRadius: cfg.specialRadius || 7.5,
      attackCooldown: 0,
      specialCooldown: 8.0,
      attackRange: 3.5 * s,
      alive: true,
      hitFlash: 0
    };
  }

  update(delta, playerPos, onPlayerDamaged, shadowArmy) {
    const shadowTargets = shadowArmy ? shadowArmy.getActiveSoldiers() : [];

    this.monsters.forEach((m) => {
      if (!m.alive) return;
      if (m.hitFlash > 0) m.hitFlash -= delta;

      let targetPos = playerPos;
      let targetSoldier = null;

      // En yakın hedefi belirle (Oyuncu mu yoksa bir gölge asker mi?)
      let minDist = m.group.position.distanceTo(playerPos);

      if (shadowTargets.length > 0) {
        for (let i = 0; i < shadowTargets.length; i++) {
          const s = shadowTargets[i];
          if (!s.alive) continue;
          const d = m.group.position.distanceTo(s.group.position);
          if (d < minDist) {
            minDist = d;
            targetPos = s.group.position;
            targetSoldier = s;
          }
        }
      }

      if (minDist > m.attackRange) {
        const dir = new THREE.Vector3().subVectors(targetPos, m.group.position).normalize();
        m.group.position.x += dir.x * m.speed * delta;
        m.group.position.z += dir.z * m.speed * delta;
        m.group.lookAt(targetPos.x, m.group.position.y, targetPos.z);
      } else {
        if (m.attackCooldown <= 0) {
          m.attackCooldown = 1.3;
          if (targetSoldier) {
            // Gölge Askere Hasar Ver!
            shadowArmy.damageSoldier(targetSoldier, m.damage, playerPos);
          } else if (onPlayerDamaged) {
            // Oyuncuya Hasar Ver!
            onPlayerDamaged(m.damage);
          }
        }
      }

      if (m.attackCooldown > 0) m.attackCooldown -= delta;
    });

    // Boss Güncellemesi
    if (this.boss && this.boss.alive) {
      const b = this.boss;
      if (b.hitFlash > 0) b.hitFlash -= delta;

      const distToPlayer = b.group.position.distanceTo(playerPos);
      b.group.lookAt(playerPos.x, b.group.position.y, playerPos.z);

      if (b.specialCooldown > 0) {
        b.specialCooldown -= delta;
      } else {
        b.specialCooldown = 12.0;
        this.triggerBossSpecialWithTelegraph(b, playerPos, onPlayerDamaged);
      }

      if (distToPlayer > b.attackRange) {
        const dir = new THREE.Vector3().subVectors(playerPos, b.group.position).normalize();
        b.group.position.x += dir.x * b.speed * delta;
        b.group.position.z += dir.z * b.speed * delta;
      } else {
        if (b.attackCooldown <= 0) {
          b.attackCooldown = 1.5;
          if (onPlayerDamaged) onPlayerDamaged(b.damage);
        }
      }

      if (b.attackCooldown > 0) b.attackCooldown -= delta;
    }
  }

  triggerBossSpecialWithTelegraph(boss, playerPos, onPlayerDamaged) {
    const centerPos = boss.group.position.clone();
    const radius = boss.specialRadius || 7.5;

    const telegraphMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });

    const telegraphCircle = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), telegraphMat);
    telegraphCircle.rotation.x = -Math.PI / 2;
    telegraphCircle.position.set(centerPos.x, 0.08, centerPos.z);
    this.scene.add(telegraphCircle);

    const borderRing = new THREE.Mesh(
      new THREE.RingGeometry(radius - 0.2, radius, 32),
      new THREE.MeshBasicMaterial({ color: 0xff0033, side: THREE.DoubleSide })
    );
    borderRing.rotation.x = -Math.PI / 2;
    borderRing.position.set(centerPos.x, 0.1, centerPos.z);
    this.scene.add(borderRing);

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 0.1;
      telegraphMat.opacity = 0.35 + Math.sin(elapsed * 12) * 0.25;

      if (elapsed >= 1.5) {
        clearInterval(interval);
        this.scene.remove(telegraphCircle);
        this.scene.remove(borderRing);

        this.createExplosionEffect(centerPos, radius, boss.color);

        const currentDist = boss.group.position.distanceTo(playerPos);
        if (currentDist <= radius) {
          if (onPlayerDamaged) {
            onPlayerDamaged(boss.specialDamage || 35);
          }
        }
      }
    }, 100);
  }

  createExplosionEffect(pos, radius, color) {
    const ringGeo = new THREE.RingGeometry(0.2, radius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color || 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, 0.15, pos.z);
    this.scene.add(ring);

    let progress = 0;
    const anim = setInterval(() => {
      progress += 0.1;
      ring.scale.set(1 + progress * 0.4, 1 + progress * 0.4, 1);
      ring.material.opacity = Math.max(0, 0.9 - progress);
      if (progress >= 1.0) {
        clearInterval(anim);
        this.scene.remove(ring);
      }
    }, 30);
  }

  damageMonster(monster, amount) {
    if (!monster.alive) return;
    monster.hp -= amount;
    monster.hitFlash = 0.15;

    if (monster.hp <= 0) {
      monster.alive = false;
      this.scene.remove(monster.group);
      if (this.onMonsterKilled) {
        this.onMonsterKilled(monster, monster.isBoss);
      }
    }
  }

  getActiveMonsters() {
    const list = this.monsters.filter((m) => m.alive);
    if (this.boss && this.boss.alive) {
      list.push(this.boss);
    }
    return list;
  }

  clearAll() {
    this.monsters.forEach((m) => this.scene.remove(m.group));
    this.monsters = [];
    if (this.boss) {
      this.scene.remove(this.boss.group);
      this.boss = null;
    }
  }
}
