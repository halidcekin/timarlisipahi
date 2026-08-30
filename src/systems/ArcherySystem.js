import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';

/**
 * ArcherySystem - Osmanlı Yay ve Ok Talimi Sistemi
 * - Parabolik Gerçekçi Ok Fiziği (Açı ve Çekiş Gücüne Göre)
 * - Kale Avlusunda Hedef Tahtası İsabet Tespiti (Göbek, Kırmızı ve Beyaz Halka)
 * - 1. Şahıs Yay Rigi & Nişangah
 */
export class ArcherySystem {
  constructor(scene, camera, player, townGenerator) {
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.town = townGenerator;

    this.isBowMode = false;
    this.isDrawing = false;
    this.drawProgress = 0; // 0.0 - 1.0
    this.maxDrawTime = 1.2; // 1.2 saniyede tam gerilim

    // 1. Şahıs Yay Rigi
    this.bowRig = this.player.modelBuilder.createFirstPersonBow();
    this.camera.add(this.bowRig);

    // Havada Uçan ve Hedefe Saplanan Oklar
    this.activeArrows = [];
    this.stuckArrows = [];

    // Ok Geometrisi ve Materyalleri
    this.arrowGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.85, 6);
    this.arrowMat = new THREE.MeshStandardMaterial({ color: 0x5a3e22, roughness: 0.8 });
    this.tipGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
    this.tipMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
    this.featherGeo = new THREE.BoxGeometry(0.01, 0.08, 0.14);
    this.featherMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  }

  toggleBowMode() {
    this.isBowMode = !this.isBowMode;
    this.bowRig.visible = this.isBowMode && (this.player.cameraMode === 'firstPerson');

    const crosshair = document.getElementById('archery-crosshair');

    if (this.isBowMode) {
      gameState.sipahi.swordDrawn = false;
      if (this.player.weaponRig) this.player.weaponRig.visible = false;
      gameState.addNotification('🏹 Osmanlı Yayını gerdin. Nişan al ve [Sol Tık] ile fırlat!', 'info');
      try { soundManager.playSwordSwing(); } catch (e) {}
      if (crosshair && this.player.cameraMode === 'firstPerson') {
        crosshair.classList.remove('hidden');
      }
    } else {
      this.isDrawing = false;
      this.drawProgress = 0;
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
      gameState.addNotification('🏹 Yayı omzuna astın.', 'info');
      if (crosshair) crosshair.classList.add('hidden');
    }
  }

  startDrawing() {
    if (!this.isBowMode) return false;
    this.isDrawing = true;
    this.drawProgress = 0;
    return true;
  }

  releaseArrow() {
    if (!this.isBowMode || !this.isDrawing) return false;

    this.isDrawing = false;
    const power = Math.max(0.3, this.drawProgress); // En az %30 güç
    this.drawProgress = 0;

    // Ok Objesini Oluştur
    const arrow = new THREE.Group();
    const shaft = new THREE.Mesh(this.arrowGeo, this.arrowMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.castShadow = true;
    arrow.add(shaft);

    const tip = new THREE.Mesh(this.tipGeo, this.tipMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = -0.46;
    arrow.add(tip);

    for (let angle of [0, Math.PI / 2]) {
      const f = new THREE.Mesh(this.featherGeo, this.featherMat);
      f.rotation.z = angle;
      f.position.z = 0.38;
      arrow.add(f);
    }

    // Kameranın baktığı yönü hesapla
    const shootDir = new THREE.Vector3();
    this.camera.getWorldDirection(shootDir);

    // Okun başlangıç pozisyonu
    const startPos = this.camera.position.clone().addScaledVector(shootDir, 0.8);
    startPos.y -= 0.15;
    arrow.position.copy(startPos);
    arrow.lookAt(startPos.clone().add(shootDir));

    this.scene.add(arrow);

    // Başlangıç Hızı (Açı ve Çekiş Gücüne Göre)
    const baseSpeed = 22 + power * 35; // 22 m/s - 57 m/s arası
    const velocity = shootDir.clone().multiplyScalar(baseSpeed);

    this.activeArrows.push({
      mesh: arrow,
      velocity: velocity,
      life: 5.0,
      power: power
    });

    try { soundManager.playSwordSwing(); } catch (e) {}
    this.player.addCameraShake(0.04);

    return true;
  }

  update(delta, inputManager) {
    const crosshair = document.getElementById('archery-crosshair');
    
    // Hide crosshair in 3rd person mode even if bow is equipped
    if (this.isBowMode && this.player.cameraMode !== 'firstPerson') {
      if (crosshair) crosshair.classList.add('hidden');
    } else if (this.isBowMode && this.player.cameraMode === 'firstPerson') {
      if (crosshair) crosshair.classList.remove('hidden');
    }

    if (this.isBowMode) {
      if (inputManager.mouse.leftDown) {
        this.isDrawing = true;
        this.drawProgress = Math.min(1.0, this.drawProgress + delta / this.maxDrawTime);
        // Yay rig'ini hafif geriye çekilme efekti ver
        this.bowRig.position.z = -0.2 - this.drawProgress * 0.12;
        
        // Update crosshair visually based on draw progress
        if (crosshair && this.player.cameraMode === 'firstPerson') {
          const size = 44 - (this.drawProgress * 24); // 44px -> 20px
          crosshair.style.width = `${size}px`;
          crosshair.style.height = `${size}px`;
          crosshair.classList.add('active');
          
          this.camera.fov = 75 - (this.drawProgress * 15);
          this.camera.updateProjectionMatrix();
        }
      } else if (this.isDrawing) {
        this.releaseArrow();
        this.bowRig.position.z = -0.2;
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();
        
        // Reset crosshair
        if (crosshair) {
          crosshair.style.width = '44px';
          crosshair.style.height = '44px';
          crosshair.classList.remove('active');
        }
      }
    }

    // Uçan Okların Hareketi ve Çarpışma Testi
    for (let i = this.activeArrows.length - 1; i >= 0; i--) {
      const arr = this.activeArrows[i];
      arr.life -= delta;

      // Yerçekimi ivmesi
      arr.velocity.y -= 14.0 * delta;

      // Pozisyon güncellemesi
      const nextPos = arr.mesh.position.clone().addScaledVector(arr.velocity, delta);
      arr.mesh.lookAt(nextPos);
      arr.mesh.position.copy(nextPos);

      let isHit = false;

      // 1. Kale Talim Hedef Tahtasına İsabet Kontrolü
      if (this.town && this.town.archeryTargets) {
        this.town.archeryTargets.forEach(target => {
          if (isHit) return;

          // Hedef diskinin merkezine olan mesafe
          const targetCenter = target.position;
          const distZ = Math.abs(arr.mesh.position.z - targetCenter.z);

          if (distZ < 0.6 && Math.abs(arr.mesh.position.x - targetCenter.x) < 2.0) {
            // Y ve X düzlemindeki radyal uzaklık
            const dx = arr.mesh.position.x - targetCenter.x;
            const dy = arr.mesh.position.y - targetCenter.y;
            const radialDist = Math.sqrt(dx * dx + dy * dy);

            if (radialDist <= target.radiusOuter) {
              isHit = true;
              let xpGain = 5;
              let scoreTitle = '🎯 Dış Halka!';

              if (radialDist <= target.radiusBullseye) {
                xpGain = 25;
                scoreTitle = '🎯 TAM İSABET! 12\'den Vurdun (Sarı Göbek)!';
                try { soundManager.playVictoryJingle(); } catch (e) {}
              } else if (radialDist <= target.radiusMid) {
                xpGain = 15;
                scoreTitle = '🎯 İsabet! Kırmızı Halka!';
                try { soundManager.playSwordClash(); } catch (e) {}
              } else {
                try { soundManager.playSwordClash(); } catch (e) {}
              }

              gameState.military.cebeluExperience = (gameState.military.cebeluExperience || 0) + xpGain;
              gameState.addNotification(`${scoreTitle} (+${xpGain} Okçuluk & Cebelü Tecrübesi)`, 'success');
            }
          }
        });
      }

      // 2. Yere veya Duvara Çarpma Kontrolü
      if (arr.mesh.position.y <= 0.05 || isHit) {
        // Ok saplandı
        arr.mesh.position.y = Math.max(0.05, arr.mesh.position.y);
        this.stuckArrows.push(arr.mesh);
        this.activeArrows.splice(i, 1);

        // Fazla ok birikirse eskilerini temizle
        if (this.stuckArrows.length > 25) {
          const old = this.stuckArrows.shift();
          this.scene.remove(old);
        }
      } else if (arr.life <= 0) {
        this.scene.remove(arr.mesh);
        this.activeArrows.splice(i, 1);
      }
    }
  }
}
