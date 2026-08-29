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
    this.isBlocking = false;
    this.footstepTimer = 0;
  }

  setHorse(horse) {
    this.horseEntity = horse;
  }

  toggleCameraMode() {
    this.cameraMode = (this.cameraMode === 'firstPerson') ? 'thirdPerson' : 'firstPerson';
    this.weaponRig.visible = (this.cameraMode === 'firstPerson');
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
    if (this.isAttacking || this.isBlocking) return false;
    if (gameState.sipahi.stamina < 15) {
      gameState.addNotification('Kuvvetin tükendi!', 'alert');
      return false;
    }

    this.isAttacking = true;
    this.attackProgress = 0;
    gameState.sipahi.stamina -= 15;
    try { soundManager.playSwordSwing(); } catch (e) {}
    return true;
  }

  setBlocking(isBlocking) {
    this.isBlocking = isBlocking;
    gameState.sipahi.isBlocking = isBlocking;
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

    const isRunning = inputManager.isKeyDown('ShiftLeft') || inputManager.isKeyDown('ShiftRight');
    let currentSpeed = this.walkSpeed;

    if (this.isRiding) {
      currentSpeed = this.horseSpeed;
    } else if (isRunning && gameState.sipahi.stamina > 5) {
      currentSpeed = this.runSpeed;
      gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - delta * 12);
    } else {
      gameState.sipahi.stamina = Math.min(gameState.sipahi.maxStamina, gameState.sipahi.stamina + delta * 15);
    }

    if (moveDir.lengthSq() > 0) {
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

    if (inputManager.isKeyDown('Space') && this.isGrounded && !this.isRiding && gameState.sipahi.stamina > 20) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      gameState.sipahi.stamina -= 20;
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

  // 2. Görseldeki Canlı Kılıç Savurma & Sallantı Animasyonu
  updateWeaponAnimation(delta, isMoving) {
    const sword = this.weaponRig.userData.sword;
    if (!sword) return;

    const time = performance.now() * 0.003;

    if (this.isAttacking) {
      this.attackProgress += delta * 6.5;

      if (this.attackProgress < 0.5) {
        sword.rotation.x = -Math.PI / 3 * (this.attackProgress * 2);
        sword.rotation.y = Math.PI / 4 * (this.attackProgress * 2);
        sword.position.z = -0.62 - (this.attackProgress * 0.4);
      } else if (this.attackProgress < 1.0) {
        sword.rotation.x = Math.PI / 4 * (1 - (this.attackProgress - 0.5) * 2);
        sword.rotation.y = -Math.PI / 3 * (1 - (this.attackProgress - 0.5) * 2);
        sword.position.z = -0.82 + (this.attackProgress - 0.5) * 0.4;
      } else {
        this.isAttacking = false;
        this.attackProgress = 0;
      }
    } else if (this.isBlocking) {
      sword.position.set(0.12, -0.02, -0.45);
      sword.rotation.set(Math.PI / 4, -Math.PI / 6, Math.PI / 4);
    } else {
      // 2. Görseldeki Orijinal Dinamik Kılıç Duruşu
      const bobX = isMoving ? Math.cos(time * 3) * 0.025 : Math.cos(time) * 0.008;
      const bobY = isMoving ? Math.sin(time * 6) * 0.03 : Math.sin(time * 2) * 0.01;

      sword.position.set(0.36 + bobX, -0.06 + bobY, -0.62);
      sword.rotation.set(bobY * 2, bobX * 2, -Math.PI / 10);
    }
  }
}
