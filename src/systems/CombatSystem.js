import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';

/**
 * CombatSystem - 1. Kişi Kılıç Dövüşü ve Vuruş Algılama
 */
export class CombatSystem {
  constructor(player, npcManager) {
    this.player = player;
    this.npcManager = npcManager;
    this.activeSparks = [];

    // 3D Kıvılcım ve Darbe Parçacık Grubu
    this.sparkGroup = new THREE.Group();
    if (this.player.scene) {
      this.player.scene.add(this.sparkGroup);
    }
  }

  /**
   * İsabet Noktasında 3D Parlayan Metal Kıvılcımları Saç
   */
  spawnSparks(position) {
    if (!this.player.scene) return;

    const sparkCount = 16;
    for (let i = 0; i < sparkCount; i++) {
      const size = 0.04 + Math.random() * 0.04;
      const sparkGeo = new THREE.SphereGeometry(size, 4, 4);
      const sparkMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.3 ? 0xffcc33 : 0xffffff,
        transparent: true,
        opacity: 1
      });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.position.copy(position);
      spark.position.x += (Math.random() - 0.5) * 0.3;
      spark.position.y += (Math.random() - 0.5) * 0.3;
      spark.position.z += (Math.random() - 0.5) * 0.3;

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 5.5,
        Math.random() * 4.5 + 1.5,
        (Math.random() - 0.5) * 5.5
      );

      this.sparkGroup.add(spark);
      this.activeSparks.push({
        mesh: spark,
        velocity: vel,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5
      });
    }
  }

  processPlayerAttack() {
    const playerPos = this.player.position;
    const playerDir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.player.yaw, 0));

    let hitCount = 0;

    // 1. Düşmanlara vuruş kontrolü
    this.npcManager.enemies.forEach(enemy => {
      if (enemy.isDead) return;

      const dist = playerPos.distanceTo(enemy.position);
      if (dist < 3.2) {
        // Açı kontrolü (Oyuncunun baktığı yönde mi?)
        const toEnemy = new THREE.Vector3().subVectors(enemy.position, playerPos).normalize();
        const dot = playerDir.dot(toEnemy);

        if (dot > 0.4) {
          // İsabet!
          hitCount++;
          const baseDamage = 25 + gameState.sipahi.swordLevel * 8;
          enemy.health -= baseDamage;

          soundManager.playSwordClash();
          this.player.addCameraShake(0.14);

          // Kıvılcım Saç
          const hitPos = enemy.position.clone().add(new THREE.Vector3(0, 1.2, 0));
          this.spawnSparks(hitPos);

          gameState.addNotification(`⚔️ ${enemy.name} kılıç darbesi aldı! (-${baseDamage} Can)`, 'alert');

          // Geri itilme efekti
          enemy.position.addScaledVector(playerDir, 0.8);

          if (enemy.health <= 0) {
            this.killEnemy(enemy);
          }
        }
      }
    });

    // 2. Kale Avlusu Talim Mankenlerine Vuruş Kontrolü
    const dummyPositions = [
      new THREE.Vector3(187, 8.5, -14),
      new THREE.Vector3(190.5, 8.5, -14),
      new THREE.Vector3(194, 8.5, -14)
    ];

    dummyPositions.forEach((dPos, idx) => {
      const dist = playerPos.distanceTo(dPos);
      if (dist < 3.4) {
        const toDummy = new THREE.Vector3().subVectors(dPos, playerPos).normalize();
        const dot = playerDir.dot(toDummy);
        if (dot > 0.3) {
          hitCount++;
          soundManager.playSwordClash();
          this.player.addCameraShake(0.08);

          const hitPos = dPos.clone().add(new THREE.Vector3(0, 1.5, 0));
          this.spawnSparks(hitPos);

          gameState.military.cebeluExperience = (gameState.military.cebeluExperience || 0) + 5;
          gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - 8);
          gameState.addNotification(`🎯 Talim Mankeni #${idx + 1}'e tam isabet! Kılıç talimi tamamlandı (+5 Tecrübe).`, 'info');
        }
      }
    });

    return hitCount > 0;
  }

  killEnemy(enemy) {
    enemy.isDead = true;
    // Düşme animasyonu
    enemy.mesh.rotation.x = Math.PI / 2;
    enemy.mesh.position.y = 0.2;

    const lootAkce = 40 + Math.floor(Math.random() * 60);
    gameState.timar.akce += lootAkce;
    gameState.timar.asayis = Math.min(100, gameState.timar.asayis + 10);
    gameState.sipahi.reputation += 8;

    gameState.addNotification(`💀 ${enemy.name} alt edildi! +${lootAkce} Akçe ele geçirildi. Asayiş arttı!`, 'success');
    soundManager.playVictoryJingle();

    // Görev Sistemi Bildirimi
    questSystem.onEnemyKilled(enemy);
  }

  update(delta) {
    const playerPos = this.player.position;

    // 3D Kıvılcım Parçacıklarının Hareketi & Sönümlenmesi
    for (let i = this.activeSparks.length - 1; i >= 0; i--) {
      const sp = this.activeSparks[i];
      sp.life -= delta;
      sp.velocity.y -= 12.0 * delta; // Yerçekimi
      sp.mesh.position.addScaledVector(sp.velocity, delta);
      sp.mesh.material.opacity = Math.max(0, sp.life / sp.maxLife);

      if (sp.life <= 0) {
        this.sparkGroup.remove(sp.mesh);
        sp.mesh.geometry.dispose();
        sp.mesh.material.dispose();
        this.activeSparks.splice(i, 1);
      }
    }

    // Düşmanların oyuncuya vurması
    this.npcManager.enemies.forEach(enemy => {
      if (enemy.isDead) return;

      const dist = enemy.position.distanceTo(playerPos);
      if (dist < 2.0) {
        enemy.attackCooldown = (enemy.attackCooldown || 0) + delta;
        if (enemy.attackCooldown >= 1.6) {
          enemy.attackCooldown = 0;
          this.enemyAttackPlayer(enemy);
        }
      }
    });
  }

  enemyAttackPlayer(enemy) {
    let damage = 18;

    if (this.player.isBlocking) {
      // Kalkan bloklandı
      damage = Math.floor(damage * 0.2); // %80 hasar emilimi
      soundManager.playSwordClash();
      gameState.addNotification(`🛡️ ${enemy.name}'in darbesini kalkanla savuşturdun!`, 'info');
    } else {
      soundManager.playSwordClash();
      gameState.addNotification(`💥 ${enemy.name} seni yaraladı! (-${damage} Sıhhat)`, 'alert');
    }

    gameState.sipahi.health = Math.max(0, gameState.sipahi.health - damage);

    if (gameState.sipahi.health <= 0) {
      this.handlePlayerDefeat();
    }
  }

  handlePlayerDefeat() {
    gameState.addNotification('⚠️ Ağır yaralandın! Köylüler seni konağa taşıdı.', 'alert');
    gameState.sipahi.health = 40;
    this.player.position.set(0, 1.8, -40); // Konağın önüne ışınla
    gameState.timar.akce = Math.max(0, gameState.timar.akce - 100);
  }
}
