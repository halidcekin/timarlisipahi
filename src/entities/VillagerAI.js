import * as THREE from 'three';
import { TownGenerator } from './TownGenerator.js';
import { gameState } from '../core/GameState.js';

export const VillagerState = {
  SLEEPING: 'SLEEPING',
  WORKING: 'WORKING',
  EATING: 'EATING',
  WANDERING: 'WANDERING',
  TALKING: 'TALKING'
};

/**
 * VillagerAI - Yüksek Kaliteli Yaşayan Köylü Yapay Zekası
 * - 24 Saatlik Gerçek Zamanlı Davranış Çizelgesi (Daily Routine Schedule)
 * - Duruma Özel Prosedürel Rig Animasyonları (Örs Dövme, Orak Sallama, Kupa İçme, Sedirde Uzanma)
 * - Dinamik A-Noktası B-Noktası Yürüyüş ve Yönelme Fiziği
 */
export class VillagerAI {
  constructor(npcData, scheduleConfig) {
    this.npc = npcData;
    this.config = scheduleConfig || {};

    // Rutin Konumları
    this.homePos = this.config.homePos || new THREE.Vector3(npcData.position.x, 0, npcData.position.z);
    this.workPos = this.config.workPos || new THREE.Vector3(npcData.position.x, 0, npcData.position.z);
    this.eatPos = this.config.eatPos || new THREE.Vector3(-10, 0, 24); // Han önü masalar
    this.socialPos = this.config.socialPos || new THREE.Vector3(0, 0, 6); // Köy meydanı

    this.workType = this.config.workType || 'farming'; // 'farming', 'smithing', 'well_water', 'woodcutting', 'guarding', 'innkeeping'
    this.currentState = VillagerState.WORKING;
    this.targetPos = new THREE.Vector3().copy(this.workPos);

    this.speed = 2.2 + Math.random() * 0.6;
    this.animTimer = Math.random() * Math.PI * 2;
    this.talkTimeout = 0;

    // Aksesuar Referansları (Çekiç, Orak, Kova, Kupa vs.)
    this.toolMesh = null;
    this.setupTools();
  }

  setupTools() {
    if (!this.npc.mesh) return;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a321a, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x5a636a, metalness: 0.8, roughness: 0.25 });

    if (this.workType === 'smithing') {
      // Demirci Çekici (Sağ El)
      const hammer = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), woodMat);
      handle.position.y = 0.15;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), metalMat);
      head.position.y = 0.35;
      hammer.add(handle, head);
      hammer.position.set(0.28, 0.6, 0.2);
      hammer.rotation.set(Math.PI / 4, 0, 0);
      this.npc.mesh.add(hammer);
      this.toolMesh = hammer;
    } else if (this.workType === 'farming') {
      // Ekin Orağı (Sağ El)
      const sickle = new THREE.Group();
      const sHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 8), woodMat);
      sHandle.position.y = 0.1;
      const blade = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 12, Math.PI * 0.75), metalMat);
      blade.position.set(0.06, 0.25, 0);
      blade.rotation.z = -Math.PI / 3;
      sickle.add(sHandle, blade);
      sickle.position.set(0.26, 0.65, 0.18);
      this.npc.mesh.add(sickle);
      this.toolMesh = sickle;
    } else if (this.workType === 'well_water') {
      // Ahşap Su Kovası
      const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.26, 8), woodMat);
      bucket.position.set(0.32, 0.35, 0.15);
      this.npc.mesh.add(bucket);
      this.toolMesh = bucket;
    }
  }

  /**
   * 24 Saatlik Zaman Dilimine Göre Köylünün Davranışını Belirler
   */
  evaluateSchedule(hour) {
    if (this.isLockedInDialogue) {
      this.currentState = VillagerState.TALKING;
      return; // Oyuncuyla konuşuyor, yerinden kıpırdama
    }

    // Gece Uyku Saati: 22:00 - 06:00
    if (hour >= 22.0 || hour < 6.0) {
      if (this.currentState !== VillagerState.SLEEPING) {
        this.currentState = VillagerState.SLEEPING;
        this.targetPos.copy(this.homePos);
      }
    }
    // Öğle Yemeği & Mola: 12:30 - 14:00
    else if (hour >= 12.5 && hour < 14.0) {
      if (this.currentState !== VillagerState.EATING) {
        this.currentState = VillagerState.EATING;
        this.targetPos.copy(this.eatPos);
      }
    }
    // Akşam Meydan Toplanması & Sosyalleşme: 18:30 - 22:00
    else if (hour >= 18.5 && hour < 22.0) {
      if (this.currentState !== VillagerState.WANDERING && this.currentState !== VillagerState.EATING) {
        this.currentState = VillagerState.WANDERING;
        this.targetPos.copy(this.socialPos);
      }
    }
    // Gündüz Mesaisi & Çalışma: 06:00 - 12:30 & 14:00 - 18:30
    else {
      if (this.currentState !== VillagerState.WORKING) {
        this.currentState = VillagerState.WORKING;
        this.targetPos.copy(this.workPos);
      }
    }
  }

  setTalking(isTalking = true) {
    this.isLockedInDialogue = isTalking;
    if (isTalking) {
      this.currentState = VillagerState.TALKING;
    }
  }

  update(delta, hour, playerPos, particleSystem) {
    this.animTimer += delta * 3.5;

    // 1. Saat kontrolü ile durum güncelle
    this.evaluateSchedule(hour);

    // Periyodik etrafta gezinme ve teftiş adımları
    this.wanderTimer = (this.wanderTimer || 0) + delta;
    if (this.wanderTimer > 6.0 && this.currentState === VillagerState.WORKING && !this.isLockedInDialogue) {
      this.wanderTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 4.5;
      this.targetPos.set(this.workPos.x + Math.cos(angle) * radius, 0, this.workPos.z + Math.sin(angle) * radius);
    }

    const mesh = this.npc.mesh;
    if (!mesh) return;

    // Eğer oyuncuyla konuşuyorsa kesinlikle yürüme, yüzünü oyuncuya dön
    if (this.isLockedInDialogue) {
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.1);
      const terrainH = TownGenerator.getTerrainHeight(mesh.position.x, mesh.position.z);
      mesh.position.y = terrainH;
      if (playerPos) {
        const targetAngle = Math.atan2(playerPos.x - mesh.position.x, playerPos.z - mesh.position.z);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetAngle, 0.15);
      }
      mesh.rotation.z = Math.sin(this.animTimer * 1.5) * 0.02;
      this.npc.position.copy(mesh.position);
      return;
    }

    // 2. Hedefe Doğru Yürüme Mantığı
    const distToTarget = new THREE.Vector2(mesh.position.x - this.targetPos.x, mesh.position.z - this.targetPos.z).length();
    const isMoving = distToTarget > 1.2 && this.currentState !== VillagerState.SLEEPING;

    if (isMoving) {
      const dirX = this.targetPos.x - mesh.position.x;
      const dirZ = this.targetPos.z - mesh.position.z;
      const angle = Math.atan2(dirX, dirZ);

      // Yüzünü hedefe dön
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, angle, 0.08);

      // İlerle
      const moveStep = this.speed * delta;
      mesh.position.x += Math.sin(angle) * moveStep;
      mesh.position.z += Math.cos(angle) * moveStep;

      // Yürüme Adım Salınımı (Walk Cycle Bobbing)
      const walkBob = Math.sin(this.animTimer * 2.2) * 0.04;
      const terrainH = TownGenerator.getTerrainHeight(mesh.position.x, mesh.position.z);
      mesh.position.y = terrainH + Math.abs(walkBob);
      mesh.rotation.z = Math.sin(this.animTimer) * 0.03;

      this.npc.position.copy(mesh.position);
      return;
    }

    // 3. HEDEFE VARILDIĞINDA DURUMA ÖZEL ANİMASYONLAR
    const terrainH = TownGenerator.getTerrainHeight(mesh.position.x, mesh.position.z);

    switch (this.currentState) {
      // -----------------------------------------------------------------------
      // A) UYUMA DURUMU (SLEEPING)
      // -----------------------------------------------------------------------
      case VillagerState.SLEEPING: {
        // Sedirde/Yatakta Uzanma (Yere paralel yatay yatış)
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, -Math.PI / 2, 0.08);
        mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, 0.08);
        mesh.position.y = terrainH + 0.35 + Math.sin(this.animTimer * 0.4) * 0.015; // Yavaş derin uyku nefesi
        if (this.toolMesh) this.toolMesh.visible = false;
        break;
      }

      // -----------------------------------------------------------------------
      // B) YEME / İÇME DURUMU (EATING)
      // -----------------------------------------------------------------------
      case VillagerState.EATING: {
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.08);
        // Masada Oturma Duruşu (Diz kırma & hafif alçalma)
        mesh.position.y = terrainH - 0.25;
        // Elindeki kupayı ağzına götürüp indirme hareketi
        const drinkCycle = Math.sin(this.animTimer * 0.8);
        if (this.toolMesh) {
          this.toolMesh.visible = true;
          this.toolMesh.rotation.x = 0.5 + drinkCycle * 0.6;
        }
        mesh.rotation.z = Math.sin(this.animTimer * 0.4) * 0.02;
        break;
      }

      // -----------------------------------------------------------------------
      // C) ÇALIŞMA DURUMU (WORKING)
      // -----------------------------------------------------------------------
      case VillagerState.WORKING: {
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.08);
        mesh.position.y = terrainH;
        if (this.toolMesh) this.toolMesh.visible = true;

        if (this.workType === 'smithing') {
          // Örse Ritmik Çekiç Vurma
          const strikeCycle = Math.sin(this.animTimer * 1.6);
          if (this.toolMesh) {
            this.toolMesh.rotation.x = Math.max(-0.2, strikeCycle * 1.4);
          }
          mesh.rotation.x = Math.max(0, strikeCycle * 0.25);

          // Vuruş anında kıvılcım patlat
          if (strikeCycle > 0.95 && particleSystem) {
            particleSystem.emitBlacksmithSparks(new THREE.Vector3(-58, 0.9, 6));
          }
        } else if (this.workType === 'farming') {
          // Tarlada Orakla Ekin Biçme Salınımı
          const reapCycle = Math.sin(this.animTimer * 1.2);
          if (this.toolMesh) {
            this.toolMesh.rotation.z = reapCycle * 0.8;
          }
          mesh.rotation.y += Math.sin(this.animTimer * 0.5) * 0.01;
          mesh.rotation.x = 0.15 + Math.abs(reapCycle) * 0.15;
        } else if (this.workType === 'well_water') {
          // Kuyudan Kova Çekme & Eğilme
          const pullCycle = Math.sin(this.animTimer * 0.9);
          mesh.position.y = terrainH + pullCycle * 0.05;
          mesh.rotation.x = 0.2 + pullCycle * 0.2;
        }
        break;
      }

      // -----------------------------------------------------------------------
      // D) DOLAŞMA / SOSYALLEŞME (WANDERING)
      // -----------------------------------------------------------------------
      case VillagerState.WANDERING: {
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.08);
        mesh.position.y = terrainH;
        if (this.toolMesh) this.toolMesh.visible = false;

        // Belli aralıklarla meydanda küçük adımlarla yer değiştir
        if (Math.random() < 0.005) {
          this.targetPos.set(
            this.socialPos.x + (Math.random() - 0.5) * 14,
            0,
            this.socialPos.z + (Math.random() - 0.5) * 14
          );
        }
        break;
      }

      // -----------------------------------------------------------------------
      // E) OYUNCUYLA KONUŞMA (TALKING)
      // -----------------------------------------------------------------------
      case VillagerState.TALKING: {
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.08);
        mesh.position.y = terrainH;
        if (playerPos) {
          const targetAngle = Math.atan2(playerPos.x - mesh.position.x, playerPos.z - mesh.position.z);
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetAngle, 0.1);
        }
        // Konuşurken hafif el ve baş mimik salınımı
        mesh.rotation.z = Math.sin(this.animTimer * 1.5) * 0.02;
        break;
      }
    }

    this.npc.position.copy(mesh.position);
  }
}
