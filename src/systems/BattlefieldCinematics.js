import * as THREE from 'three';
import { soundManager } from '../core/AudioManager.js';
import { gameState } from '../core/GameState.js';

/**
 * BattlefieldCinematics - Gerçek Zamanlı 3D Sinematik Savaş & Animasyon Motoru
 * Taktik seçimlerin sonuçlarını 3D dünyada ok yağmuru, süvari hücumu, gürz vuruşması
 * ve dev savaş filinin çiğneme animasyonları olarak canlandırır.
 */
export class BattlefieldCinematics {
  constructor(scene, camera, player, battlefieldScene, engine) {
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.battlefieldScene = battlefieldScene;
    this.engine = engine;

    this.isInBattle = false;
    this.savedVillagePos = new THREE.Vector3(0, 1.8, 70);
    this.activeProjectiles = [];
    this.activeAnimations = [];
  }

  teleportToBattlefield(battleType = 'nigbolu') {
    this.isInBattle = true;
    if (this.player) {
      this.savedVillagePos.copy(this.player.position);
      // Harp meydanında Osmanlı sancağının hemen önü
      this.player.position.set(400, 1.8, 375);
      this.player.yaw = 0;
      this.player.pitch = -0.05;
      if (this.player.weaponRig) {
        this.player.weaponRig.visible = true;
      }
    }

    if (this.battlefieldScene) {
      this.battlefieldScene.setMode(battleType);
    }

    // Sinematik Savaş Işığı ve Sisi
    if (this.engine) {
      if (battleType === 'ankara') {
        this.engine.scene.background = new THREE.Color(0x5c1d0c);
        this.engine.scene.fog = new THREE.FogExp2(0x8a3818, 0.006);
      } else {
        this.engine.scene.background = new THREE.Color(0x6e4a2c);
        this.engine.scene.fog = new THREE.FogExp2(0x996f47, 0.005);
      }
    }

    try { soundManager.playWarDrum(); } catch (e) {}
    gameState.addNotification(
      battleType === 'ankara'
        ? '🐘 1402 ÇUBUK OVASI HARP MEYDANINA İNTİKAL EDİLDİ!'
        : '🚩 1396 NİĞBOLU MEYDANINA İNTİKAL EDİLDİ!',
      'alert'
    );
  }

  teleportBackToVillage() {
    this.isInBattle = false;
    if (this.player) {
      this.player.position.copy(this.savedVillagePos);
      this.player.yaw = Math.PI;
    }

    // Köy atmosferini geri yükle
    if (this.engine) {
      this.engine.scene.background = new THREE.Color(0x7bb5e3);
      this.engine.scene.fog = new THREE.FogExp2(0xcce2f0, 0.0032);
    }

    gameState.addNotification('🏡 Akçaoba Tımarına muzaffer olarak dönüldü.', 'info');
  }

  playTacticalAnimation(optionId, onComplete) {
    if (optionId === 'heroic_charge') {
      this.playElephantStompCinematic(onComplete);
    } else if (optionId === 'arrow_rain' || optionId === 'tactical_retreat' || optionId === 'aim_eyes') {
      this.playArrowRainAnimation(onComplete);
    } else if (optionId === 'use_mace' || optionId === 'direct_clash') {
      this.playMaceClashAnimation(onComplete);
    } else if (optionId === 'final_charge' || optionId === 'cavalry_strike' || optionId === 'spear_charge') {
      this.playCavalryChargeAnimation(onComplete);
    } else {
      this.playGeneralManeuverAnimation(onComplete);
    }
  }

  // 1. 3D OK YAĞMURU ANİMASYONU (ARROW RAIN)
  playArrowRainAnimation(onComplete) {
    try { soundManager.playBowShot(); } catch (e) {}
    const arrows = [];
    const arrowGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4);
    const arrowMat = new THREE.MeshStandardMaterial({ color: 0x221105 });

    const count = 35;
    for (let i = 0; i < count; i++) {
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      const startX = 370 + Math.random() * 60;
      const startZ = 372 + Math.random() * 8;
      const targetX = 370 + Math.random() * 60;
      const targetZ = 415 + Math.random() * 20;

      arrow.position.set(startX, 2.5 + Math.random() * 2, startZ);
      arrow.rotation.x = -Math.PI / 3;
      this.scene.add(arrow);

      arrows.push({
        mesh: arrow,
        progress: 0,
        speed: 0.9 + Math.random() * 0.4,
        startX, startZ,
        targetX, targetZ,
        arcHeight: 12 + Math.random() * 6
      });
    }

    const startTime = performance.now();
    const duration = 2200;

    const anim = {
      update: () => {
        const elapsed = performance.now() - startTime;
        const p = Math.min(elapsed / duration, 1.0);

        arrows.forEach(a => {
          const t = Math.min(p * a.speed, 1.0);
          const currX = THREE.MathUtils.lerp(a.startX, a.targetX, t);
          const currZ = THREE.MathUtils.lerp(a.startZ, a.targetZ, t);
          const currY = 2.0 + Math.sin(t * Math.PI) * a.arcHeight;

          a.mesh.position.set(currX, currY, currZ);
          // Oku yönüne doğru eğ
          a.mesh.rotation.x = -Math.PI / 4 + t * 0.9;
        });

        if (this.player) {
          this.player.addCameraShake(0.02);
        }

        if (p >= 1.0) {
          arrows.forEach(a => this.scene.remove(a.mesh));
          try { soundManager.playSwordClash(); } catch (e) {}
          if (this.battlefieldScene && this.battlefieldScene.crusaderUnits.length > 0) {
            // Birkaç düşman askerini hafif yere eğ
            this.battlefieldScene.crusaderUnits.slice(0, 4).forEach(u => {
              u.rotation.x = Math.PI / 3;
            });
          }
          if (onComplete) onComplete();
          return true;
        }
        return false;
      }
    };
    this.activeAnimations.push(anim);
  }

  // 2. SİPAHİ SÜVARİ HÜCUMU (CAVALRY CHARGE)
  playCavalryChargeAnimation(onComplete) {
    try { soundManager.playHorseGallop(); } catch (e) {}
    try { soundManager.playWarDrum(); } catch (e) {}

    const units = this.battlefieldScene ? this.battlefieldScene.ottomanUnits : [];
    const initialZ = units.map(u => u.position.z);

    const startTime = performance.now();
    const duration = 2400;

    const anim = {
      update: () => {
        const elapsed = performance.now() - startTime;
        const p = Math.min(elapsed / duration, 1.0);

        units.forEach((u, i) => {
          if (p < 0.7) {
            u.position.z = initialZ[i] + (p / 0.7) * 22;
          } else {
            u.position.z = initialZ[i] + 22 - ((p - 0.7) / 0.3) * 6;
          }
          u.position.y = Math.abs(Math.sin(elapsed * 0.015)) * 0.4;
        });

        if (this.player) {
          this.player.addCameraShake(0.05);
        }

        if (p >= 0.65 && !anim._clashed) {
          anim._clashed = true;
          try { soundManager.playSwordClash(); } catch (e) {}
        }

        if (p >= 1.0) {
          units.forEach((u, i) => {
            u.position.z = initialZ[i];
            u.position.y = 0;
          });
          if (onComplete) onComplete();
          return true;
        }
        return false;
      }
    };
    this.activeAnimations.push(anim);
  }

  // 3. GÜRZ & ZIRH PARÇALAMA VURUŞMASI (MACE CLASH)
  playMaceClashAnimation(onComplete) {
    try { soundManager.playSwordClash(); } catch (e) {}
    if (this.player) {
      this.player.triggerAttack();
      this.player.addCameraShake(0.09);
    }

    setTimeout(() => {
      try { soundManager.playSwordClash(); } catch (e) {}
      if (this.player) this.player.triggerAttack();
    }, 400);

    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1800);
  }

  // 4. 🐘 TİMUR'UN DEV SAVAŞ FİLİ ÇİĞNEME SİNEMATİĞİ (ELEPHANT STOMP)
  playElephantStompCinematic(onComplete) {
    const elephant = this.battlefieldScene ? this.battlefieldScene.warElephant : null;
    if (!elephant) {
      if (onComplete) onComplete();
      return;
    }

    try { soundManager.playWarDrum(); } catch (e) {}

    const startTime = performance.now();
    const duration = 3200;

    const anim = {
      update: () => {
        const elapsed = performance.now() - startTime;
        const p = Math.min(elapsed / duration, 1.0);

        if (p < 0.4) {
          // Fil hızla ileri doğru kükreyerek adımlar
          const ease = p / 0.4;
          elephant.position.z = 18 - ease * 34; // Oyuncunun hemen önüne kadar gelir
          elephant.position.y = Math.abs(Math.sin(elapsed * 0.012)) * 0.6;
          if (this.player) this.player.addCameraShake(0.06);
        } else if (p < 0.75) {
          // Fil şaha kalkar, devasa ön bacakları kameranın / oyuncunun üzerine kalkar!
          const ease = (p - 0.4) / 0.35;
          elephant.position.z = -16 - ease * 4;
          elephant.rotation.x = -ease * 0.45; // Şaha kalkış
          elephant.position.y = ease * 3.5;
          if (this.player) this.player.addCameraShake(0.12);
        } else {
          // Fil devasa ağırlığıyla kameranın üzerine iner!
          const ease = (p - 0.75) / 0.25;
          elephant.rotation.x = -0.45 + ease * 0.55;
          elephant.position.y = 3.5 - ease * 3.5;

          if (!anim._stomped) {
            anim._stomped = true;
            try { soundManager.playSwordClash(); } catch (e) {}
            try { soundManager.playWarDrum(); } catch (e) {}
            if (this.player) this.player.addCameraShake(0.25);
          }
        }

        if (p >= 1.0) {
          if (onComplete) onComplete();
          return true;
        }
        return false;
      }
    };
    this.activeAnimations.push(anim);
  }

  // 5. GENEL MANEVRA VE HAT TUTMA
  playGeneralManeuverAnimation(onComplete) {
    try { soundManager.playWarDrum(); } catch (e) {}
    if (this.player) {
      this.player.addCameraShake(0.04);
    }
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1600);
  }

  update(delta) {
    for (let i = this.activeAnimations.length - 1; i >= 0; i--) {
      const isDone = this.activeAnimations[i].update();
      if (isDone) {
        this.activeAnimations.splice(i, 1);
      }
    }
  }
}
