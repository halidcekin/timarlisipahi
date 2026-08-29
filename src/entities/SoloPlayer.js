import * as THREE from 'three';
import { soloGameState } from '../core/SoloGameState.js';

/**
 * Solo Leveling Gelişmiş Oyuncu Kontrolcüsü (SoloPlayer)
 * - Kamera Roll=0 garantili hassas YXZ kamera rotasyonu
 * - Gelişmiş Sung Jin-Woo 3D Karakter Modeli
 * - Parlayan 3D Hançer Modelleri ve Kombo Savurma Animasyonu
 * - Gölge Atılması (Dash)
 */
export class SoloPlayer {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    // Konum ve Fizik (Köy meydanında, portallara bakacak şekilde yaw = 0)
    this.position = new THREE.Vector3(0, 1.8, 14);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.pitch = 0;
    this.yaw = 0; // Portallara doğru baksın
    this.isGrounded = true;
    this.height = 1.8;
    this.moveSpeed = 12.0;
    this.sprintMultiplier = 1.6;
    this.jumpForce = 11.0;
    this.gravity = 28.0;

    // Kamera Modu (1. Şahıs / 3. Şahıs)
    this.isThirdPerson = false;
    this.thirdPersonDistance = 4.5;

    // Dövüş & Hançer Animasyonu
    this.isAttacking = false;
    this.attackProgress = 0;
    this.attackCooldown = 0;
    this.attackSpeed = 7.5;
    this.comboIndex = 0;

    // Gölge Atılması (Shadow Dash - E Tuşu)
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.24;
    this.dashSpeed = 42.0;
    this.dashCooldown = 0;
    this.dashMaxCooldown = 2.5;
    this.dashDirection = new THREE.Vector3();

    // 3D Karakter ve Hançer Modelleri
    this.initPlayerVisuals();
    this.updateDaggerMesh();

    soloGameState.on('daggerEquipped', () => this.updateDaggerMesh());
  }

  initPlayerVisuals() {
    this.meshGroup = new THREE.Group();
    this.meshGroup.position.copy(this.position);

    // --- SUNG JIN-WOO DETAYLI 3D MODELİ ---
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.45, metalness: 0.35 });
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.6, metalness: 0.2 });

    // Göğüs Zırhı
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.95, 0.42);
    this.torso = new THREE.Mesh(torsoGeo, coatMat);
    this.torso.position.y = 0.92;
    this.torso.castShadow = true;
    this.meshGroup.add(this.torso);

    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    chestPlate.position.set(0, 1.05, 0.2);
    this.meshGroup.add(chestPlate);

    // Omuzluklar
    const pauldronGeo = new THREE.BoxGeometry(0.26, 0.22, 0.38);
    const pauldronMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    
    const leftPauldron = new THREE.Mesh(pauldronGeo, pauldronMat);
    leftPauldron.position.set(-0.46, 1.25, 0);
    leftPauldron.rotation.z = -0.2;
    this.meshGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, pauldronMat);
    rightPauldron.position.set(0.46, 1.25, 0);
    rightPauldron.rotation.z = 0.2;
    this.meshGroup.add(rightPauldron);

    // Kafa ve Yüz
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.75 });
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.58;
    this.head.castShadow = true;
    this.meshGroup.add(this.head);

    // Saç
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x05070d, roughness: 0.85 });
    const mainHair = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 8), hairMat);
    mainHair.position.set(0, 1.78, -0.06);
    mainHair.rotation.x = -0.35;
    this.meshGroup.add(mainHair);

    const bangs1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 5), hairMat);
    bangs1.position.set(-0.14, 1.68, 0.16);
    bangs1.rotation.set(0.4, 0.2, 0.3);
    this.meshGroup.add(bangs1);

    const bangs2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 5), hairMat);
    bangs2.position.set(0.12, 1.66, 0.18);
    bangs2.rotation.set(0.45, -0.2, -0.25);
    this.meshGroup.add(bangs2);

    // Parlayan Mavi Gözler
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    leftEye.position.set(-0.08, 1.6, 0.22);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    rightEye.position.set(0.08, 1.6, 0.22);
    this.meshGroup.add(leftEye);
    this.meshGroup.add(rightEye);

    // Pelerin
    this.coatFlap = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.85, 0.08), coatMat);
    this.coatFlap.position.set(0, 0.52, -0.22);
    this.meshGroup.add(this.coatFlap);

    // Bacaklar
    const legGeo = new THREE.BoxGeometry(0.24, 0.78, 0.26);
    this.leftLeg = new THREE.Mesh(legGeo, innerMat);
    this.leftLeg.position.set(-0.2, 0.39, 0);
    this.meshGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, innerMat);
    this.rightLeg.position.set(0.2, 0.39, 0);
    this.meshGroup.add(this.rightLeg);

    this.scene.add(this.meshGroup);

    // 1. Şahıs Kamera Rig'i
    this.fpHandRig = new THREE.Group();
    this.camera.add(this.fpHandRig);
    this.scene.add(this.camera);

    // Hançer Konteynerleri
    this.daggerContainerTP = new THREE.Group();
    this.meshGroup.add(this.daggerContainerTP);
    this.daggerContainerTP.position.set(0.45, 0.85, 0.25);

    this.daggerContainerFP = new THREE.Group();
    this.fpHandRig.add(this.daggerContainerFP);
    this.daggerContainerFP.position.set(0.32, -0.22, -0.48);
    this.daggerContainerFP.rotation.set(0.15, -0.25, 0.05);
  }

  updateDaggerMesh() {
    while (this.daggerContainerTP.children.length > 0) {
      this.daggerContainerTP.remove(this.daggerContainerTP.children[0]);
    }
    while (this.daggerContainerFP.children.length > 0) {
      this.daggerContainerFP.remove(this.daggerContainerFP.children[0]);
    }

    const daggerInfo = soloGameState.currentDagger || {
      name: 'Eğri Avcı Hançeri',
      bladeColor: 0x94a3b8,
      glowColor: 0x00e5ff
    };

    const daggerTP = this.createDagger3DModel(daggerInfo);
    daggerTP.scale.set(0.85, 0.85, 0.85);
    daggerTP.rotation.x = Math.PI / 4;
    this.daggerContainerTP.add(daggerTP);

    const daggerFP = this.createDagger3DModel(daggerInfo);
    daggerFP.scale.set(0.65, 0.65, 0.65);
    this.daggerContainerFP.add(daggerFP);
  }

  createDagger3DModel(info) {
    const group = new THREE.Group();

    // Bıçak
    const bladeGeo = new THREE.ConeGeometry(0.1, 0.8, 4);
    bladeGeo.scale(0.25, 1, 1);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: info.bladeColor || 0xd1d5db,
      roughness: 0.15,
      metalness: 0.9,
      emissive: info.glowColor || 0x00e5ff,
      emissiveIntensity: 0.85
    });

    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.4;
    blade.rotation.y = Math.PI / 4;
    group.add(blade);

    // Kavisli Sırt
    const spineGeo = new THREE.BoxGeometry(0.04, 0.65, 0.08);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(-0.02, 0.35, 0);
    group.add(spine);

    // Muhafaza
    const guardGeo = new THREE.BoxGeometry(0.26, 0.05, 0.1);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.2 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.y = 0.02;
    group.add(guard);

    // Kabza
    const handleGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.28, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.14;
    group.add(handle);

    // Pommel Kristali
    const pommelGeo = new THREE.OctahedronGeometry(0.05, 0);
    const pommelMat = new THREE.MeshBasicMaterial({ color: info.glowColor || 0x00e5ff });
    const pommel = new THREE.Mesh(pommelGeo, pommelMat);
    pommel.position.y = -0.28;
    group.add(pommel);

    return group;
  }

  triggerAttack() {
    if (this.attackCooldown > 0) return false;

    this.isAttacking = true;
    this.attackProgress = 0;
    this.attackCooldown = 0.24;
    this.comboIndex = (this.comboIndex + 1) % 2;

    return true;
  }

  triggerDash() {
    if (this.dashCooldown > 0) return false;

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    this.dashDirection.copy(forward).normalize();

    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashCooldown = this.dashMaxCooldown;

    this.velocity.copy(this.dashDirection).multiplyScalar(this.dashSpeed);
    return true;
  }

  toggleCameraMode() {
    this.isThirdPerson = !this.isThirdPerson;
  }

  update(delta, input) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.dashCooldown > 0) this.dashCooldown -= delta;

    // Fare Bakışı
    const mouse = input.getMouseDelta();
    const sens = 0.0022;

    this.yaw -= mouse.x * sens;
    this.pitch -= mouse.y * sens;
    this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

    // Dash Hareketi
    if (this.isDashing) {
      this.dashTimer -= delta;
      this.position.addScaledVector(this.dashDirection, this.dashSpeed * delta);

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.velocity.set(0, 0, 0);
      }
    } else {
      // Normal WASD Hareketi
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const moveDir = new THREE.Vector3();
      if (input.isKeyDown('KeyW')) moveDir.add(forward);
      if (input.isKeyDown('KeyS')) moveDir.sub(forward);
      if (input.isKeyDown('KeyD')) moveDir.add(right);
      if (input.isKeyDown('KeyA')) moveDir.sub(right);

      const isSprinting = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
      const currentSpeed = this.moveSpeed * (isSprinting ? this.sprintMultiplier : 1.0);

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        this.velocity.x = moveDir.x * currentSpeed;
        this.velocity.z = moveDir.z * currentSpeed;

        // Pelerin Salınımı
        if (this.coatFlap) {
          this.coatFlap.rotation.x = Math.sin(performance.now() * 0.012) * 0.35 + 0.3;
        }
      } else {
        this.velocity.x = 0;
        this.velocity.z = 0;
        if (this.coatFlap) this.coatFlap.rotation.x = 0;
      }

      // Zıplama
      if (input.isKeyDown('Space') && this.isGrounded) {
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
      }

      // Yerçekimi
      this.velocity.y -= this.gravity * delta;
      this.position.y += this.velocity.y * delta;
      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;

      const floorY = 0;
      if (this.position.y <= floorY + this.height) {
        this.position.y = floorY + this.height;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    // Karakter Mesh
    this.meshGroup.position.set(this.position.x, this.position.y - this.height, this.position.z);
    this.meshGroup.rotation.set(0, this.yaw, 0);

    // Kamera Güncellemesi (Order YXZ, roll=0)
    this.camera.rotation.order = 'YXZ';

    if (this.isThirdPerson) {
      this.torso.visible = true;
      this.head.visible = true;
      this.daggerContainerTP.visible = true;
      this.fpHandRig.visible = false;

      const camOffset = new THREE.Vector3(0.35, 0.4, this.thirdPersonDistance);
      camOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
      camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      this.camera.position.copy(this.position).add(camOffset);
      this.camera.lookAt(this.position.x, this.position.y + 0.15, this.position.z);
      this.camera.rotation.z = 0;
    } else {
      this.torso.visible = false;
      this.head.visible = false;
      this.daggerContainerTP.visible = false;
      this.fpHandRig.visible = true;

      this.camera.position.copy(this.position);
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
      this.camera.rotation.z = 0;
    }

    // Hançer Savurma Animasyonu
    if (this.isAttacking) {
      this.attackProgress += delta * this.attackSpeed;
      const swing = Math.sin(this.attackProgress * Math.PI);

      if (this.comboIndex === 0) {
        this.daggerContainerFP.position.set(
          0.32 - swing * 0.38,
          -0.22 + swing * 0.24,
          -0.48 - swing * 0.3
        );
        this.daggerContainerFP.rotation.set(
          0.15 + swing * 1.4,
          -0.25 - swing * 1.1,
          0.05 + swing * 0.8
        );
      } else {
        this.daggerContainerFP.position.set(
          -0.18 + swing * 0.55,
          -0.22,
          -0.48 - swing * 0.2
        );
        this.daggerContainerFP.rotation.set(
          0.1,
          0.55 - swing * 1.6,
          0.25 - swing * 0.5
        );
      }

      if (this.attackProgress >= 1.0) {
        this.isAttacking = false;
        this.daggerContainerFP.position.set(0.32, -0.22, -0.48);
        this.daggerContainerFP.rotation.set(0.15, -0.25, 0.05);
      }
    }
  }

  getDashCooldownPercent() {
    if (this.dashCooldown <= 0) return 0;
    return (this.dashCooldown / this.dashMaxCooldown) * 100;
  }
}
