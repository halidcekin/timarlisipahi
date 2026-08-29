import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelBuilder } from './ModelBuilder.js';
import { TownGenerator } from './TownGenerator.js';
import { VillagerAI } from './VillagerAI.js';
import { gameState } from '../core/GameState.js';

/**
 * NPCManager - Mount & Blade II: Bannerlord Seviyesinde Yaşayan ve Etkileşimli Köy Ahalisi
 * - Uyuyan, Yiyen, İçen, Tarlada/Örste/Kuyuda Çalışan 20+ Canlı Karakter
 * - 24 Saatlik Zaman Çizelgesi & Davranış Durum Makineleri (VillagerAI)
 */
export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.modelBuilder = new ModelBuilder();
    this.gltfLoader = new GLTFLoader();
    this.npcs = [];
    this.enemies = [];
    this.villagerAIs = [];
  }

  initNPCs() {
    // -------------------------------------------------------------------------
    // 1. ÖNEMLİ KÖY LİDERLERİ & PROTOKOL
    // -------------------------------------------------------------------------
    // A) Köy Kethüdası Koca Yakub (Köy Meydanında)
    const kethuda = this.createHumanNPC({
      id: 'kethuda',
      name: 'Koca Yakub (Kethüda)',
      role: 'Reaya ve Köy Temsilcisi',
      position: new THREE.Vector3(0, 0, 8),
      kaftanColor: 0x4a3222,
      turbanColor: 0xf5f0ea,
      hairColor: 0x1a1510,
      headwear: 'turban',
      dialogueId: 'kethuda_talk'
    });
    this.attachVillagerAI(kethuda, {
      homePos: new THREE.Vector3(0, 0, -32),
      workPos: new THREE.Vector3(0, 0, 8),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 8),
      workType: 'innkeeping'
    });

    // B) Köy İmamı Molla Şemseddin (Mescid Avlusunda)
    const imam = this.createHumanNPC({
      id: 'imam',
      name: 'Molla Şemseddin (Kadı Naibi)',
      role: 'Köy İmamı ve Hukuk Naibi',
      position: new THREE.Vector3(10, 0, 2),
      kaftanColor: 0x1d4734,
      turbanColor: 0xf5f5f5,
      hairColor: 0x5a544c,
      headwear: 'turban',
      dialogueId: 'imam_talk'
    });
    this.attachVillagerAI(imam, {
      homePos: new THREE.Vector3(26, 0, 12),
      workPos: new THREE.Vector3(10, 0, 2),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(12, 0, -4),
      workType: 'innkeeping'
    });

    // C) Demirci Rüstem Usta & Çırak Salih (Atölyede Örs ve Ocak Başında)
    const demirci = this.createHumanNPC({
      id: 'demirci',
      name: 'Demirci Rüstem Usta',
      role: 'Silah ve Zırh Ustası',
      position: new THREE.Vector3(-58, 0, 6.8),
      kaftanColor: 0x2b2219,
      hairColor: 0x141210,
      headwear: 'cap',
      dialogueId: 'demirci_talk'
    });
    this.attachVillagerAI(demirci, {
      homePos: new THREE.Vector3(-22, 0, 8),
      workPos: new THREE.Vector3(-58, 0, 6.8),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 6),
      workType: 'smithing'
    });

    const cirak = this.createHumanNPC({
      id: 'cirak_salih',
      name: 'Çırak Salih',
      role: 'Demirci Çırağı',
      position: new THREE.Vector3(-60, 0, 6.2),
      kaftanColor: 0x3d3024,
      hairColor: 0x1a1510,
      headwear: 'cap',
      hasBeard: false,
      dialogueId: 'cirak_talk'
    });
    this.attachVillagerAI(cirak, {
      homePos: new THREE.Vector3(-22, 0, 8),
      workPos: new THREE.Vector3(-60, 0, 6.2),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 6),
      workType: 'smithing'
    });

    // D) Komşu Tımarlı Sipahi Gazi Sungur Bey (Kuzey Yolu)
    const neighbor = this.createHumanNPC({
      id: 'neighbor',
      name: 'Gazi Sungur Bey',
      role: 'Komşu Çakırlı Tımarı Sahibi',
      position: new THREE.Vector3(18, 0, -10),
      kaftanColor: 0x8b1e1e,
      hairColor: 0x1f1a14,
      headwear: 'bork',
      dialogueId: 'neighbor_talk'
    });
    this.attachVillagerAI(neighbor, {
      homePos: new THREE.Vector3(28, 0, -22),
      workPos: new THREE.Vector3(18, 0, -10),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 6),
      workType: 'guarding'
    });

    // E) Toy Cebelü Ali (Talimgâhta Kılıç Çalışan Genç Nefer)
    const cebelu = this.createHumanNPC({
      id: 'cebelu',
      name: 'Toy Cebelü Ali',
      role: 'Sipahinin Sadık Cebelü Neferi',
      position: new THREE.Vector3(14, 0, -26),
      kaftanColor: 0x243b5e,
      hairColor: 0x241d16,
      headwear: 'cap',
      hasBeard: false,
      dialogueId: 'cebelu_talk'
    });
    this.attachVillagerAI(cebelu, {
      homePos: new THREE.Vector3(0, 0, -32),
      workPos: new THREE.Vector3(14, 0, -26),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 6),
      workType: 'guarding'
    });

    // -------------------------------------------------------------------------
    // 2. ÇARŞI & HAN AHALİSİ (ESNAF, SAKA, AŞÇI, HANCI)
    // -------------------------------------------------------------------------
    // A) Hancı İdris
    const hanci = this.createHumanNPC({
      id: 'hanci_idris',
      name: 'Hancı İdris',
      role: 'Köy Hanı Sahibi & Aşçı',
      position: new THREE.Vector3(-14, 0, 26),
      kaftanColor: 0x6e2c1a,
      hairColor: 0x241d16,
      headwear: 'turban',
      dialogueId: 'hanci_talk'
    });
    this.attachVillagerAI(hanci, {
      homePos: new THREE.Vector3(-16, 0, 28),
      workPos: new THREE.Vector3(-14, 0, 26),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(-10, 0, 24),
      workType: 'innkeeping'
    });

    // B) Su Kuyusu Sakası Saka İbrahim
    const saka = this.createHumanNPC({
      id: 'saka_ibrahim',
      name: 'Saka İbrahim',
      role: 'Köy Sakası (Su Taşıyıcı)',
      position: new THREE.Vector3(8, 0, 24.5),
      kaftanColor: 0x2d4860,
      hairColor: 0x1a1510,
      headwear: 'cap',
      dialogueId: 'saka_talk'
    });
    this.attachVillagerAI(saka, {
      homePos: new THREE.Vector3(22, 0, 65),
      workPos: new THREE.Vector3(8, 0, 24.5),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 6),
      workType: 'well_water'
    });

    // C) Pazar Yeri Baharatçısı Attar Mehmet Efendi
    const attar = this.createHumanNPC({
      id: 'attar_mehmet',
      name: 'Attar Mehmet Efendi',
      role: 'Çarşı Baharatçısı & Şifacı',
      position: new THREE.Vector3(-10, 0, 15.5),
      kaftanColor: 0x8b6508,
      hairColor: 0x4a443a,
      headwear: 'turban',
      dialogueId: 'attar_talk'
    });
    this.attachVillagerAI(attar, {
      homePos: new THREE.Vector3(-24, 0, 42),
      workPos: new THREE.Vector3(-10, 0, 15.5),
      eatPos: new THREE.Vector3(-10, 0, 24),
      socialPos: new THREE.Vector3(0, 0, 6),
      workType: 'innkeeping'
    });

    // D) Köy İhtiyarı Koca Dede
    const kocaDede = this.createHumanNPC({
      id: 'koca_dede',
      name: 'Koca Dede (Gazi Piri)',
      role: 'Köyün Asırlık Gazisi & Bilgesi',
      position: new THREE.Vector3(-6, 0, 5),
      kaftanColor: 0x42464a,
      hairColor: 0xdedede,
      turbanColor: 0xffffff,
      headwear: 'turban',
      hasBeard: true,
      dialogueId: 'dede_talk'
    });
    this.attachVillagerAI(kocaDede, {
      homePos: new THREE.Vector3(-20, 0, -15),
      workPos: new THREE.Vector3(-6, 0, 5),
      eatPos: new THREE.Vector3(-6, 0, 24),
      socialPos: new THREE.Vector3(-6, 0, 5),
      workType: 'innkeeping'
    });

    // -------------------------------------------------------------------------
    // 3. TARLALARDA ÇALIŞAN ÇİFTÇİLER & IRGATLAR (DOĞU QUARTER)
    // -------------------------------------------------------------------------
    const farmers = [
      { id: 'ciftci_hasan', name: 'Çiftçi Hasan', work: new THREE.Vector3(45, 0, 45), home: new THREE.Vector3(24, 0, 48) },
      { id: 'irgat_veli', name: 'Irgat Veli', work: new THREE.Vector3(55, 0, 60), home: new THREE.Vector3(22, 0, 65) },
      { id: 'reaya_mahmud', name: 'Reaya Mahmud', work: new THREE.Vector3(62, 0, 42), home: new THREE.Vector3(28, 0, 32) },
      { id: 'orakci_bekir', name: 'Orakçı Bekir', work: new THREE.Vector3(48, 0, 70), home: new THREE.Vector3(32, 0, -45) }
    ];

    farmers.forEach(f => {
      const npc = this.createHumanNPC({
        id: f.id,
        name: f.name,
        role: 'Tımar Reayası & Çiftçi',
        position: f.work,
        kaftanColor: 0x5c4d3c,
        hairColor: 0x111111,
        headwear: 'cap',
        dialogueId: 'farmer_talk'
      });
      this.attachVillagerAI(npc, {
        homePos: f.home,
        workPos: f.work,
        eatPos: new THREE.Vector3(-10, 0, 24),
        socialPos: new THREE.Vector3(0, 0, 6),
        workType: 'farming'
      });
    });

    // -------------------------------------------------------------------------
    // 4. SANCAK KALESİ GARNİZONU
    // -------------------------------------------------------------------------
    // A) Dizdar Hamza Bey
    const dizdar = this.createHumanNPC({
      id: 'dizdar',
      name: 'Dizdar Hamza Bey',
      role: 'Sancak Kalesi Muhafızı & Dizdarı',
      position: new THREE.Vector3(185, 0, 0),
      kaftanColor: 0x8b1e1e,
      turbanColor: 0xd4af37,
      hairColor: 0x241d16,
      headwear: 'turban',
      hasBeard: true,
      dialogueId: 'dizdar_talk'
    });
    this.attachVillagerAI(dizdar, {
      homePos: new THREE.Vector3(190, 0, 0),
      workPos: new THREE.Vector3(185, 0, 0),
      eatPos: new THREE.Vector3(180, 0, 8),
      socialPos: new THREE.Vector3(185, 0, 0),
      workType: 'guarding'
    });

    // B) Kale Kapı Nöbetçileri
    const guards = [
      { id: 'kale_guard_1', name: 'Kale Nöbetçisi Gazi Hasan', pos: new THREE.Vector3(148, 0, 4.5) },
      { id: 'kale_guard_2', name: 'Kale Okçusu Balaban', pos: new THREE.Vector3(148, 0, -4.5) },
      { id: 'kale_guard_3', name: 'Zırhlı Nefer Timur', pos: new THREE.Vector3(175, 0, -8) }
    ];

    guards.forEach(g => {
      const guardNPC = this.createHumanNPC({
        id: g.id,
        name: g.name,
        role: 'Sancak Kalesi Kapı Muhafızı',
        position: g.pos,
        kaftanColor: 0x2b382d,
        hairColor: 0x111111,
        headwear: 'cap',
        dialogueId: 'guard_talk'
      });
      this.attachVillagerAI(guardNPC, {
        homePos: new THREE.Vector3(180, 0, 10),
        workPos: g.pos,
        eatPos: new THREE.Vector3(180, 0, 5),
        socialPos: g.pos,
        workType: 'guarding'
      });
    });

    // -------------------------------------------------------------------------
    // 5. ORMAN HARAMİLERİ (KUZEYBATI KAMPI)
    // -------------------------------------------------------------------------
    this.spawnBandits();
  }

  attachVillagerAI(npcData, scheduleConfig) {
    const ai = new VillagerAI(npcData, scheduleConfig);
    this.villagerAIs.push(ai);
    npcData.ai = ai;
  }

  createHumanNPC(config) {
    let mesh;
    if (config.id === 'kethuda') {
      mesh = this.modelBuilder.createModernKethudaStanLee();
    } else {
      mesh = this.modelBuilder.createDetailedHumanNPC(config);
    }
    const h = TownGenerator.getTerrainHeight(config.position.x, config.position.z);
    mesh.position.set(config.position.x, h, config.position.z);
    this.scene.add(mesh);

    // Koca Yakub özel GLTF modeli varsa yükle
    if (config.gltfPath || config.id === 'kethuda') {
      const modelPath = config.gltfPath || './models/kethuda.glb';
      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) child.material.side = THREE.DoubleSide;
            }
          });
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          if (size.y > 0) {
            const scaleFactor = 1.85 / size.y;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }
          while (mesh.children.length > 0) {
            mesh.remove(mesh.children[0]);
          }
          mesh.add(model);
        },
        undefined,
        () => {}
      );
    }

    const npcData = {
      id: config.id,
      name: config.name,
      role: config.role,
      mesh: mesh,
      position: mesh.position,
      dialogueId: config.dialogueId,
      initialY: mesh.position.y,
      animOffset: Math.random() * Math.PI * 2
    };

    this.npcs.push(npcData);
    return npcData;
  }

  spawnBandits() {
    const banditCoords = [
      [-78, -88],
      [-84, -92],
      [-75, -95]
    ];

    banditCoords.forEach((coord, idx) => {
      const h = TownGenerator.getTerrainHeight(coord[0], coord[1]);
      const mesh = this.modelBuilder.createDetailedHumanNPC({
        kaftanColor: 0x241d18,
        hairColor: 0x111111,
        headwear: 'cap',
        hasBeard: true
      });

      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.02), this.modelBuilder.materials.metal);
      sword.position.set(0.55, 0.85, 0.3);
      sword.rotation.set(Math.PI / 4, 0, -Math.PI / 4);
      mesh.add(sword);

      mesh.position.set(coord[0], h, coord[1]);
      this.scene.add(mesh);

      this.enemies.push({
        id: `bandit_${idx}`,
        name: `Harami Çapulcu #${idx + 1}`,
        mesh: mesh,
        position: mesh.position,
        health: 50,
        maxHealth: 50,
        attackCooldown: 0,
        isDead: false
      });
    });
  }

  update(delta, playerPos, hour = 12.0, particleSystem = null) {
    // 1. Köylülerin 24 Saatlik Rutin ve Davranış Yapay Zekası Güncellemesi
    this.villagerAIs.forEach(ai => {
      ai.update(delta, hour, playerPos, particleSystem);
    });

    // 2. Eşkıya Düşman Saldırı Yapay Zekası
    this.enemies.forEach(enemy => {
      if (enemy.isDead) return;

      const dist = enemy.position.distanceTo(playerPos);
      if (dist < 30 && dist > 1.8) {
        const dir = new THREE.Vector3().subVectors(playerPos, enemy.position).normalize();
        enemy.position.x += dir.x * delta * 3.2;
        enemy.position.z += dir.z * delta * 3.2;

        const currentH = TownGenerator.getTerrainHeight(enemy.position.x, enemy.position.z);
        enemy.position.y = currentH;
        enemy.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      }
    });
  }

  getNearbyNPC(playerPos, maxDist = 4.0) {
    for (const npc of this.npcs) {
      if (npc.position.distanceTo(playerPos) <= maxDist) {
        return npc;
      }
    }
    return null;
  }
}
