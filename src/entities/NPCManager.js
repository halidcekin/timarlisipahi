import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelBuilder } from './ModelBuilder.js';
import { TownGenerator } from './TownGenerator.js';

/**
 * NPCManager - Ultra Gerçekçi Yüz ve Anatomiye Sahip Osmanlı Karakterleri
 */
export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.modelBuilder = new ModelBuilder();
    this.gltfLoader = new GLTFLoader();
    this.npcs = [];
    this.enemies = [];
  }

  initNPCs() {
    // 1. Köy Kethüdası Koca Yakub (Köy Meydanında tam karşımızda)
    this.createHumanNPC({
      id: 'kethuda',
      name: 'Koca Yakub (Kethüda)',
      role: 'Reaya ve Köy Temsilcisi',
      position: new THREE.Vector3(0, 0, 8),
      kaftanColor: 0x4a3222, // Koyu Kahverengi Cübbe
      turbanColor: 0xf5f0ea, // Beyaz Sarık
      hairColor: 0x1a1510,
      headwear: 'turban',
      dialogueId: 'kethuda_talk'
    });

    // 2. Köy İmamı Molla Şemseddin (Mescid Avlusunda)
    this.createHumanNPC({
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

    // 3. Demirci Rüstem Usta (Atölyede Örs ve Ocak Başında)
    this.createHumanNPC({
      id: 'demirci',
      name: 'Demirci Rüstem Usta',
      role: 'Silah ve Zırh Ustası',
      position: new THREE.Vector3(-26.5, TownGenerator.getTerrainHeight(-26.5, 34.5), 34.5),
      kaftanColor: 0x2b2219, // Deri İş Önlüğü
      hairColor: 0x141210,  // Kara Pala Bıyık
      headwear: 'cap',
      dialogueId: 'demirci_talk'
    });

    // 4. Komşu Tımarlı Sipahi Gazi Sungur Bey (Kuzey Yolu)
    this.createHumanNPC({
      id: 'neighbor',
      name: 'Gazi Sungur Bey',
      role: 'Komşu Çakırlı Tımarı Sahibi',
      position: new THREE.Vector3(18, TownGenerator.getTerrainHeight(18, -10), -10),
      kaftanColor: 0x8b1e1e, // Al Kırmızı Sipahi Kaftanı
      hairColor: 0x1f1a14,
      headwear: 'bork',     // Sipahi Börkü
      dialogueId: 'neighbor_talk'
    });

    // 5. Toy Cebelü Ali (Konağın Bahçesinde Talim Yapan Genç Sipahi Neferi)
    this.createHumanNPC({
      id: 'cebelu',
      name: 'Toy Cebelü Ali',
      role: 'Sipahinin Sadık Cebelü Neferi',
      position: new THREE.Vector3(-8, TownGenerator.getTerrainHeight(-8, -38), -38),
      kaftanColor: 0x243b5e, // Mavi Yelek
      hairColor: 0x241d16,
      headwear: 'cap',
      hasBeard: false,      // Genç bıyıksız/hafif sakallı
      dialogueId: 'cebelu_talk'
    });

    // 6. Sancak Kalesi Dizdarı Hamza Bey (Kale İç Avlusunda)
    this.createHumanNPC({
      id: 'dizdar',
      name: 'Dizdar Hamza Bey',
      role: 'Sancak Kalesi Muhafızı & Dizdarı',
      position: new THREE.Vector3(185, TownGenerator.getTerrainHeight(185, 0), 0),
      kaftanColor: 0x8b1e1e, // Al Sipahi Kaftanı
      turbanColor: 0xd4af37, // Altın Sarımlı Sarık
      hairColor: 0x241d16,
      headwear: 'turban',
      hasBeard: true,
      dialogueId: 'dizdar_talk'
    });

    // 7. Kale Kapısı Nöbetçileri
    this.createHumanNPC({
      id: 'kale_guard_1',
      name: 'Kale Nöbetçisi Gazi Hasan',
      role: 'Sancak Kalesi Kapı Muhafızı',
      position: new THREE.Vector3(148, TownGenerator.getTerrainHeight(148, 4.5), 4.5),
      kaftanColor: 0x2b382d,
      hairColor: 0x111111,
      headwear: 'cap',
      dialogueId: 'guard_talk'
    });

    this.createHumanNPC({
      id: 'kale_guard_2',
      name: 'Kale Okçusu Balaban',
      role: 'Sancak Kalesi Kapı Nöbetçisi',
      position: new THREE.Vector3(148, TownGenerator.getTerrainHeight(148, -4.5), -4.5),
      kaftanColor: 0x2b382d,
      hairColor: 0x111111,
      headwear: 'cap',
      dialogueId: 'guard_talk'
    });

    // 8. Orman Sınırındaki Harami / Eşkıya Grubu (Kuzey Batı)
    this.spawnBandits();

    // 9. Tarlalarda Çalışan Reaya (Köylüler)
    this.spawnPeasants();
  }

  createHumanNPC(config) {
    let mesh;
    if (config.id === 'kethuda') {
      // 3D Görseldeki Beyaz Saçlı, Kalın Gözlüklü, Siyah Blazer Ceketli Koca Yakub (Stan Lee) Modeli
      mesh = this.modelBuilder.createModernKethudaStanLee();
    } else {
      mesh = this.modelBuilder.createDetailedHumanNPC(config);
    }
    mesh.position.copy(config.position);
    this.scene.add(mesh);

    // Eğer Koca Yakub ise veya özel bir GLTF model yolu tanımlandıysa yükle
    if (config.gltfPath || config.id === 'kethuda') {
      const modelPath = config.gltfPath || './models/kethuda.glb';
      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;

          // Gölgeler ve çift taraflı doku
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
              }
            }
          });

          // Otomatik boy ayarlama (1.85m insan boyu)
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          if (size.y > 0) {
            const targetHeight = 1.85;
            const scaleFactor = targetHeight / size.y;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          // Mevcut prosedürel parçaları temizleyip GLTF modeli içine yerleştir
          while (mesh.children.length > 0) {
            mesh.remove(mesh.children[0]);
          }
          mesh.add(model);
          console.log(`✅ [3D Model] ${config.name} için Meshy GLTF modeli başarıyla yüklendi: ${modelPath}`);
        },
        undefined,
        (err) => {
          // Dosya henüz public/models klasörüne konmadıysa sessizce prosedürel model kalır
          console.info(`ℹ️ ${config.name} için özel .glb dosyası bekleniyor (${modelPath}).`);
        }
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

      // Eşkıya Palası Ekle
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

  spawnPeasants() {
    // Tarlalar etrafında çalışan köylüler (x: 40-60, z: 50-70)
    const peasantCoords = [
      { x: 45, z: 55, name: 'Çiftçi Hasan' },
      { x: 55, z: 65, name: 'Irgat Veli' },
      { x: 50, z: 45, name: 'Reaya Mahmud' }
    ];

    peasantCoords.forEach(c => {
      this.createHumanNPC({
        id: `peasant_${c.name}`,
        name: c.name,
        role: 'Tımar Reayası',
        position: new THREE.Vector3(c.x, TownGenerator.getTerrainHeight(c.x, c.z), c.z),
        kaftanColor: 0x5c4d3c, // Kirli Toprak Rengi
        hairColor: 0x111111,
        headwear: 'cap',
        dialogueId: 'peasant_talk'
      });
    });
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.002;

    // NPC Canlı Nefes Alma, Göğüs Salınımı ve Oyuncuya Yönelme
    this.npcs.forEach(npc => {
      // Eğer bu NPC Kethüda ise ve bekleyen cevapsız arzuhal varsa oyuncuya koşsun
      if (npc.id === 'kethuda' && gameState.hasPendingMessenger) {
        const distToPlayer = npc.position.distanceTo(playerPos);
        if (distToPlayer > 3.2) {
          const dir = new THREE.Vector3().subVectors(playerPos, npc.position).normalize();
          npc.position.x += dir.x * delta * 5.0; // Koşma hızı
          npc.position.z += dir.z * delta * 5.0;
          npc.mesh.position.set(npc.position.x, TownGenerator.getTerrainHeight(npc.position.x, npc.position.z), npc.position.z);
          npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);
          return;
        }
      }

      const terrainH = TownGenerator.getTerrainHeight(npc.position.x, npc.position.z);
      // Doğal Göğüs Nefes Alma & Ayak Ağırlık Dağılımı Salınımı (GTA Stili Canlı Duruş)
      const breath = Math.sin(time * 2.4 + npc.animOffset);
      const sway = Math.cos(time * 1.2 + npc.animOffset);

      npc.mesh.position.y = terrainH + breath * 0.012;
      npc.mesh.rotation.z = sway * 0.012;

      // Göğüs Hacim Genişlemesi (Respiration)
      npc.mesh.scale.set(1.0 + breath * 0.012, 1.0 + breath * 0.008, 1.0 + breath * 0.012);

      const dist = npc.position.distanceTo(playerPos);
      if (dist < 12) {
        const targetRot = Math.atan2(playerPos.x - npc.position.x, playerPos.z - npc.position.z);
        npc.mesh.rotation.y = THREE.MathUtils.lerp(npc.mesh.rotation.y, targetRot, 0.06);
      }
    });

    // Eşkıya Yapay Zekası
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
