import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';
import { TownGenerator } from '../entities/TownGenerator.js';

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
   * Gerçekçi Kan ve Toz Efekti (Çarpışma anında)
   */
  spawnBloodAndDust(position, isHitEntity = true) {
    if (!this.player.scene) return;

    // Toz Bulutu (Gri)
    const dustCount = 8;
    for (let i = 0; i < dustCount; i++) {
      const size = 0.08 + Math.random() * 0.12;
      const dustGeo = new THREE.SphereGeometry(size, 4, 4);
      const dustMat = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.6
      });
      const dust = new THREE.Mesh(dustGeo, dustMat);
      dust.position.copy(position);
      dust.position.x += (Math.random() - 0.5) * 0.5;
      dust.position.y += (Math.random() - 0.5) * 0.5;
      dust.position.z += (Math.random() - 0.5) * 0.5;

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2.0
      );

      this.sparkGroup.add(dust);
      this.activeSparks.push({
        mesh: dust,
        velocity: vel,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'dust'
      });
    }

    if (!isHitEntity) return; // Eğer mankene vuruluyorsa kan çıkmasın

    // Kan Parçacıkları (Kırmızı ve Ağır)
    const bloodCount = 12;
    for (let i = 0; i < bloodCount; i++) {
      const size = 0.03 + Math.random() * 0.03;
      const bloodGeo = new THREE.SphereGeometry(size, 4, 4);
      const bloodMat = new THREE.MeshBasicMaterial({
        color: 0x8a0303, // Koyu kırmızı
        transparent: true,
        opacity: 0.9
      });
      const blood = new THREE.Mesh(bloodGeo, bloodMat);
      blood.position.copy(position);
      blood.position.x += (Math.random() - 0.5) * 0.3;
      blood.position.y += (Math.random() - 0.5) * 0.3;
      blood.position.z += (Math.random() - 0.5) * 0.3;

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 2.5 + 1.0,
        (Math.random() - 0.5) * 3.5
      );

      this.sparkGroup.add(blood);
      this.activeSparks.push({
        mesh: blood,
        velocity: vel,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        type: 'blood'
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

          // Kan ve Toz Saç
          const hitPos = enemy.position.clone().add(new THREE.Vector3(0, 1.2, 0));
          this.spawnBloodAndDust(hitPos, true);

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
      new THREE.Vector3(175, TownGenerator.getTerrainHeight(175, -10), -10),
      new THREE.Vector3(175, TownGenerator.getTerrainHeight(175, -6), -6)
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
          this.spawnBloodAndDust(hitPos, false); // Mankene vurduğunda kan yok, toz var

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

    // 3D Parçacık Hareketi (Kan daha hızlı düşer, Toz havada asılı kalır)
    for (let i = this.activeSparks.length - 1; i >= 0; i--) {
      const sp = this.activeSparks[i];
      sp.life -= delta;
      
      if (sp.type === 'blood') {
        sp.velocity.y -= 15.0 * delta; // Kan yerçekimi daha ağır
      } else {
        sp.velocity.y -= 4.0 * delta; // Toz bulutu havada süzülür
      }

      sp.mesh.position.addScaledVector(sp.velocity, delta);
      sp.mesh.material.opacity = Math.max(0, (sp.life / sp.maxLife));

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
