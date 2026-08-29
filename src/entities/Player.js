import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder.js';
import { soundManager } from '../core/AudioManager.js';
import { gameState } from '../core/GameState.js';

/**
 * Player - 1. Kişi / 3. Kişi Sipahi Kontrolcüsü (2. Görseldeki Orijinal Kılıç Duruşu ve Kamera Açısı)
 */
export class Player {
  constructor(camera, scene, colliders) {
    this.camera = camera;
    this.scene = scene;
    this.colliders = colliders || [];

    this.camera.rotation.order = 'YXZ';

    // 2. Görseldeki Başlangıç Konumu (Koca Yakub'un 4m Gerisinde)
    this.position = new THREE.Vector3(0, 1.8, 12);
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;

    this.pitch = 0;
    this.yaw = 0;
    this.mouseSensitivity = 0.0022;

    this.walkSpeed = 6.5;
    this.runSpeed = 11.5;
    this.unarmedWalkSpeed = 8.5;
    this.unarmedRunSpeed = 15.0;
    this.horseSpeed = 18.0;
    this.jumpForce = 8.0;
    this.gravity = 22.0;

    this.isRiding = false;
    this.horseEntity = null;
    this.cameraMode = 'firstPerson';
    this.cameraShake = 0;

    // 2. Görseldeki 1. Şahıs Mavi Kolluklu Kılıç Rigi
    this.modelBuilder = new ModelBuilder();
    this.weaponRig = this.modelBuilder.createFirstPersonSword();
    this.camera.add(this.weaponRig);
    this.scene.add(this.camera);

    this.isAttacking = false;
    this.attackProgress = 0;
    this.comboStep = 0; // 0: Yatay Kesme, 1: Ters Çapraz, 2: Tepe İndirme
    this.comboResetTimer = 0;
    this.queuedAttack = false;
    this.isBlocking = false;
    this.footstepTimer = 0;
  }

  toggleWeapon() {
    gameState.sipahi.swordDrawn = !gameState.sipahi.swordDrawn;
    if (this.weaponRig) {
      this.weaponRig.visible = gameState.sipahi.swordDrawn && (this.cameraMode === 'firstPerson');
    }
    
    if (gameState.sipahi.swordDrawn) {
      gameState.addNotification('⚔️ Pusatını kuşandın. Savaşa hazırsın!', 'info');
      try { soundManager.playSwordSwing(); } catch (e) {}
    } else {
      gameState.addNotification('🏃 Kılıcını kınına soktun. Çevik ve hızlı hareket ediyorsun.', 'info');
    }
  }

  setHorse(horse) {
    this.horseEntity = horse;
  }

  addCameraShake(amount) {
    this.cameraShake = Math.min(0.2, this.cameraShake + amount);
  }

  toggleCameraMode() {
    this.cameraMode = (this.cameraMode === 'firstPerson') ? 'thirdPerson' : 'firstPerson';
    this.weaponRig.visible = (this.cameraMode === 'firstPerson') && gameState.sipahi.swordDrawn;
  }

  toggleHorseMount() {
    if (!this.horseEntity) return;
    const dist = this.position.distanceTo(this.horseEntity.position);

    if (!this.isRiding) {
      if (dist < 5.0) {
        this.isRiding = true;
        gameState.sipahi.isRiding = true;
        gameState.addNotification('🐎 Tımar atına bindin.', 'success');
        try { soundManager.playHorseHoof(); } catch (e) {}
      } else {
        this.horseEntity.position.set(this.position.x + 2.5, 0, this.position.z + 2.5);
        gameState.addNotification('🐎 Atını yanına çağırdın.', 'info');
        try { soundManager.playHorseHoof(); } catch (e) {}
      }
    } else {
      this.isRiding = false;
      gameState.sipahi.isRiding = false;
      this.horseEntity.position.set(this.position.x + 2.0, 0, this.position.z + 2.0);
      gameState.addNotification('Attan indin.', 'info');
    }
  }

  handleMouseLook(mouseDelta) {
    this.yaw -= mouseDelta.x * this.mouseSensitivity;
    this.pitch -= mouseDelta.y * this.mouseSensitivity;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));

    if (this.cameraMode === 'firstPerson') {
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }
  }

  triggerAttack() {
    if (this.isRiding) return false;

    if (!gameState.sipahi.swordDrawn) {
      gameState.addNotification('⚠️ Önce pusatını kuşan! (Q Tuşuna bas)', 'alert');
      return false;
    }

    // Eğer saldırı ortasındaysa ve sonuna yaklaşıldıysa sıradaki komboyu sıraya al
    if (this.isAttacking) {
      if (this.attackProgress > 0.45 && this.attackProgress < 0.9) {
        this.queuedAttack = true;
      }
      return false;
    }

    if (gameState.sipahi.stamina < 15) {
      gameState.addNotification('⚡ Kuvvetin tükendi! Dinlenmelisin.', 'alert');
      return false;
    }

    // Kombo aşamasını belirle (Eğer aradan çok süre geçtiyse sıfırla - 4 Farklı Saldırı Formu)
    if (this.comboResetTimer <= 0) {
      this.comboStep = 0;
    } else {
      this.comboStep = (this.comboStep + 1) % 4;
    }

    this.isAttacking = true;
    this.attackProgress = 0;
    this.queuedAttack = false;
    this.comboResetTimer = 1.4; // 1.4 saniye içinde devam edilirse kombo sürer

    const staminaCost = this.comboStep === 2 ? 26 : this.comboStep === 3 ? 22 : 16;
    gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - staminaCost);
    this.staminaRegenDelay = 1.2;

    try { soundManager.playSwordSwing(); } catch (e) {}
    return true;
  }

  setBlocking(isBlocking) {
    if (!gameState.sipahi.swordDrawn && isBlocking) {
      return;
    }
    this.isBlocking = isBlocking;
    gameState.sipahi.isBlocking = isBlocking;
    if (isBlocking) {
      this.staminaRegenDelay = 0.8;
    }
  }

  update(delta, inputManager) {
    // Sönümleme (Geri itilme / Knockback için sürtünme)
    this.velocity.x -= this.velocity.x * 6.0 * delta;
    this.velocity.z -= this.velocity.z * 6.0 * delta;

    const mouseDelta = inputManager.getMouseDelta();
    this.handleMouseLook(mouseDelta);

    const moveDir = new THREE.Vector3();
    if (inputManager.isKeyDown('KeyW')) moveDir.z -= 1;
    if (inputManager.isKeyDown('KeyS')) moveDir.z += 1;
    if (inputManager.isKeyDown('KeyA')) moveDir.x -= 1;
    if (inputManager.isKeyDown('KeyD')) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;
    const isRunning = (inputManager.isKeyDown('ShiftLeft') || inputManager.isKeyDown('ShiftRight')) && isMoving;
    
    // Temel Hız Belirleme (Silahsızken daha hızlı ve çevik)
    const isUnarmed = !gameState.sipahi.swordDrawn;
    const baseWalk = isUnarmed ? this.unarmedWalkSpeed : this.walkSpeed;
    const baseRun = isUnarmed ? this.unarmedRunSpeed : this.runSpeed;
    let currentSpeed = baseWalk;

    if (this.isRiding) {
      currentSpeed = this.horseSpeed;
    } else if (isRunning && gameState.sipahi.stamina > 5) {
      currentSpeed = baseRun;
      // Koşarken saniyede kuvvet harcar (silahsızken daha az harcar)
      const staminaDrain = isUnarmed ? 15 : 22;
      gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - delta * staminaDrain);
      this.staminaRegenDelay = 0.9;
    } else if (this.isBlocking) {
      currentSpeed = this.walkSpeed * 0.55; // Kalkan/kılıç bloğunda yavaş yürüyüş
      gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - delta * 8);
      this.staminaRegenDelay = 1.0;
    }

    // Kuvvet Yenilenmesi (Regen Delay Sistemi)
    if (this.staminaRegenDelay > 0) {
      this.staminaRegenDelay -= delta;
    } else if (!isRunning && !this.isBlocking) {
      gameState.sipahi.stamina = Math.min(gameState.sipahi.maxStamina, gameState.sipahi.stamina + delta * 16);
    }

    if (isMoving) {
      moveDir.normalize();
      const sinY = Math.sin(this.yaw);
      const cosY = Math.cos(this.yaw);

      const worldX = (moveDir.x * cosY + moveDir.z * sinY) * currentSpeed;
      const worldZ = (-moveDir.x * sinY + moveDir.z * cosY) * currentSpeed;

      const newX = this.position.x + (worldX + this.velocity.x) * delta;
      const newZ = this.position.z + (worldZ + this.velocity.z) * delta;

      if (!this.checkCollision(newX, this.position.z)) {
        this.position.x = newX;
      }
      if (!this.checkCollision(this.position.x, newZ)) {
        this.position.z = newZ;
      }

      this.footstepTimer += delta * (currentSpeed / 4.5);
      if (this.footstepTimer > 1.0) {
        this.footstepTimer = 0;
        try {
          if (this.isRiding) soundManager.playHorseHoof();
          else soundManager.playFootstep();
        } catch (e) {}
      }
    } else {
      // Eğer tuşlara basılmıyorsa ama knockback (velocity) varsa hareket et
      if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.z) > 0.1) {
        const newX = this.position.x + this.velocity.x * delta;
        const newZ = this.position.z + this.velocity.z * delta;
        if (!this.checkCollision(newX, this.position.z)) this.position.x = newX;
        if (!this.checkCollision(this.position.x, newZ)) this.position.z = newZ;
      }
    }

    // Zıplama & Kuvvet Tüketimi
    if (inputManager.isKeyDown('Space') && this.isGrounded && !this.isRiding && gameState.sipahi.stamina >= 20) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - 20);
      this.staminaRegenDelay = 1.2;
    }

    this.velocity.y -= this.gravity * delta;
    this.position.y += this.velocity.y * delta;

    const eyeHeight = this.isRiding ? 3.20 : 1.75;
    if (this.position.y <= eyeHeight) {
      this.position.y = eyeHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    if (this.isRiding && this.horseEntity) {
      this.horseEntity.position.set(this.position.x, 0, this.position.z);
      this.horseEntity.rotation.y = this.yaw + Math.PI;
    }

    if (this.cameraMode === 'firstPerson') {
      this.camera.position.copy(this.position);
      this.weaponRig.visible = true;
      this.updateWeaponAnimation(delta, moveDir.lengthSq() > 0);
    } else {
      this.weaponRig.visible = false;
      const camDist = this.isRiding ? 5.2 : 3.8;
      const camHeight = this.isRiding ? 1.4 : 1.0;

      const cosPitch = Math.cos(this.pitch);
      const sinPitch = Math.sin(this.pitch);
      const sinYaw = Math.sin(this.yaw);
      const cosYaw = Math.cos(this.yaw);

      const targetFocus = new THREE.Vector3(
        this.position.x,
        this.position.y - (this.isRiding ? 0.9 : 0.3),
        this.position.z
      );

      const camX = this.position.x + sinYaw * cosPitch * camDist;
      const camZ = this.position.z + cosYaw * cosPitch * camDist;
      const camY = this.position.y + sinPitch * camDist + camHeight;

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(targetFocus);
    }
  }

  checkCollision(x, z) {
    const playerRadius = 0.8;
    for (const c of this.colliders) {
      if (
        x + playerRadius > c.minX &&
        x - playerRadius < c.maxX &&
        z + playerRadius > c.minZ &&
        z - playerRadius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  // Gerçekçi Kılıç Savurma, Kombo Zinciri & Dinamik Sallantı
  updateWeaponAnimation(delta, isMoving) {
    const sword = this.weaponRig.userData.sword;
    if (!sword) return;

    const time = performance.now() * 0.003;

    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= delta;
    }

    if (this.isAttacking) {
      // 3. Kombo (Ağır tepe darbesi) biraz daha oturaklı ve ağırlıklı
      const attackSpeed = this.comboStep === 2 ? 4.8 : 5.8;
      this.attackProgress += delta * attackSpeed;

      const p = this.attackProgress;

      if (this.comboStep === 0) {
        // --- 1. SALDIRI: Yan Savurma (Sağdan Sola Geniş Yatay Kesme) ---
        if (p < 0.28) {
          const ease = p / 0.28;
          sword.position.set(0.48 + ease * 0.15, -0.05 + ease * 0.1, -0.55 + ease * 0.1);
          sword.rotation.set(-0.2 + ease * 0.4, 0.4 + ease * 0.8, -0.3);
        } else if (p < 0.72) {
          const ease = (p - 0.28) / 0.44;
          const sinP = Math.sin(ease * Math.PI * 0.5);
          sword.position.set(0.63 - sinP * 0.95, 0.05 - sinP * 0.25, -0.45 - sinP * 0.35);
          sword.rotation.set(0.2 - sinP * 0.6, 1.2 - sinP * 2.4, -0.3 + sinP * 0.6);
        } else if (p < 1.0) {
          const ease = (p - 0.72) / 0.28;
          sword.position.set(-0.32 + ease * 0.68, -0.2 + ease * 0.14, -0.8 + ease * 0.18);
          sword.rotation.set(-0.4 + ease * 0.4, -1.2 + ease * 1.2, 0.3 - ease * 0.3);
        } else {
          this.finishAttackStep();
        }
      } else if (this.comboStep === 1) {
        // --- 2. SALDIRI: Dik Savurma (Yukarıdan Aşağıya Dikey Kesme) ---
        if (p < 0.3) {
          const ease = p / 0.3;
          sword.position.set(0.28 - ease * 0.08, 0.1 + ease * 0.4, -0.55);
          sword.rotation.set(0.1 + ease * 1.2, -0.2, -0.1);
        } else if (p < 0.7) {
          const ease = (p - 0.3) / 0.4;
          const sinP = Math.sin(ease * Math.PI * 0.5);
          sword.position.set(0.2, 0.5 - sinP * 0.85, -0.55 - sinP * 0.3);
          sword.rotation.set(1.3 - sinP * 2.2, -0.2, -0.1);
        } else if (p < 1.0) {
          const ease = (p - 0.7) / 0.3;
          sword.position.set(0.2 + ease * 0.14, -0.35 + ease * 0.25, -0.85 + ease * 0.27);
          sword.rotation.set(-0.9 + ease * 0.9, -0.2, -0.1);
        } else {
          this.finishAttackStep();
        }
      } else if (this.comboStep === 2) {
        // --- 3. SALDIRI: Çapraz Güçlü Vuruş (Sol Üstten Sağ Alta Çapraz İndirme) ---
        if (p < 0.32) {
          const ease = p / 0.32;
          sword.position.set(-0.25 + ease * 0.1, 0.2 + ease * 0.35, -0.5);
          sword.rotation.set(0.4 + ease * 0.9, 0.6, -0.5);
        } else if (p < 0.75) {
          const ease = (p - 0.32) / 0.43;
          const sinP = Math.sin(ease * Math.PI * 0.5);
          sword.position.set(-0.15 + sinP * 0.75, 0.55 - sinP * 0.95, -0.5 - sinP * 0.4);
          sword.rotation.set(1.3 - sinP * 2.2, 0.6 - sinP * 1.4, -0.5 + sinP * 1.2);
          if (ease > 0.45 && !this._shakeTriggered) {
            this.addCameraShake(0.08);
            this._shakeTriggered = true;
          }
        } else if (p < 1.0) {
          const ease = (p - 0.75) / 0.25;
          sword.position.set(0.6 - ease * 0.26, -0.4 + ease * 0.3, -0.9 + ease * 0.32);
          sword.rotation.set(-0.9 + ease * 0.9, -0.8 + ease * 0.8, 0.7 - ease * 0.7);
        } else {
          this._shakeTriggered = false;
          this.finishAttackStep();
        }
      } else {
        // --- 4. SALDIRI: Dik Batırma / Dürtme (Forward Thrust / Stab) ---
        if (p < 0.25) {
          const ease = p / 0.25;
          sword.position.set(0.22, -0.05, -0.4 + ease * 0.15); // Geriye çekilip hedefe hizalanma
          sword.rotation.set(0, 0, 0);
        } else if (p < 0.65) {
          const ease = (p - 0.25) / 0.4;
          const sinP = Math.sin(ease * Math.PI * 0.5);
          sword.position.set(0.18, -0.02, -0.25 - sinP * 0.95); // İleriye mızrak gibi saplama
          sword.rotation.set(0.02, -0.02, 0.05);
        } else if (p < 1.0) {
          const ease = (p - 0.65) / 0.35;
          sword.position.set(0.18 + ease * 0.16, -0.02 - ease * 0.08, -1.2 + ease * 0.62); // Hızla geri çekiş
          sword.rotation.set(0.02 - ease * 0.02, -0.02, 0.05 - ease * 0.05);
        } else {
          this.finishAttackStep();
        }
      }
    } else if (this.isBlocking) {
      sword.position.set(0.12, -0.02, -0.45);
      sword.rotation.set(Math.PI / 4, -Math.PI / 6, Math.PI / 4);
    } else {
      // Dinamik Gerçekçi Nefes Alma & Adım Sallantısı
      const bobX = isMoving ? Math.cos(time * 3) * 0.025 : Math.cos(time * 1.2) * 0.006;
      const bobY = isMoving ? Math.sin(time * 6) * 0.035 : Math.sin(time * 2.4) * 0.009;
      const sway = isMoving ? Math.sin(time * 3) * 0.03 : 0;

      sword.position.set(0.34 + bobX, -0.10 + bobY, -0.58);
      sword.rotation.set(0.05 + bobY * 1.8, -Math.PI / 12 + bobX * 1.8 + sway, -0.05);
    }
  }

  finishAttackStep() {
    this.isAttacking = false;
    this.attackProgress = 0;
    if (this.queuedAttack) {
      this.queuedAttack = false;
      this.triggerAttack();
    }
  }
}
