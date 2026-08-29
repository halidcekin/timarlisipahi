import * as THREE from 'three';
import { soloGameState } from '../core/SoloGameState.js';

/**
 * Solo Leveling Gelişmiş Gölge Ordusu (ShadowArmy)
 * - Gölge Askerler Savaşta Ölebilir
 * - Asker Öldüğünde: Mana Varsa (20 MP) Yeniden Canlanır
 * - Mana Biterse: Zindanda Yeniden Canlanamaz!
 * - Köye Dönüşte: Tüm Ölü Askerler Tam Canla Canlanır ve Ordu Ayağa Kalkar!
 */
export class ShadowArmy {
  constructor(scene) {
    this.scene = scene;
    this.soldiers = [];
    this.cagedBosses = [];
    this.commandMode = 'follow';
    this.respawnManaCost = 20; // Dirilme başı mana maliyeti
    this.personalSpaceRadius = 1.8;
  }

  extractShadow(monsterData, isBoss = false, dungeonWorld = null) {
    const maxCapacity = soloGameState.getMaxShadowCapacity();
    const activeCount = this.soldiers.length;

    if (activeCount >= maxCapacity) {
      if (!isBoss) return null;

      let weakestIndex = -1;
      let lowestHp = Infinity;

      for (let i = 0; i < this.soldiers.length; i++) {
        const s = this.soldiers[i];
        if (!s.isBoss || s.maxHp < monsterData.maxHp) {
          if (s.maxHp < lowestHp) {
            lowestHp = s.maxHp;
            weakestIndex = i;
          }
        }
      }

      if (weakestIndex !== -1) {
        const replacedSoldier = this.soldiers[weakestIndex];
        this.scene.remove(replacedSoldier.group);
        this.soldiers.splice(weakestIndex, 1);

        soloGameState.emit('shadowReplaced', {
          oldName: replacedSoldier.name,
          newName: monsterData.name
        });
      } else {
        this.placeInShadowCage(monsterData, dungeonWorld);
        soloGameState.emit('shadowCaged', monsterData.name);
        return null;
      }
    }

    const soldierGroup = new THREE.Group();
    const spawnPos = monsterData.group ? monsterData.group.position.clone() : new THREE.Vector3();
    soldierGroup.position.copy(spawnPos);

    const scale = monsterData.scale || 1.0;
    const shadowEmissive = isBoss ? 0xa855f7 : 0x7c3aed;

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x07070c,
      roughness: 0.3,
      metalness: 0.8,
      emissive: shadowEmissive,
      emissiveIntensity: 1.1
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.75 * scale, 1.15 * scale, 0.55 * scale),
      armorMat
    );
    body.position.y = (1.15 * scale) / 2;
    body.castShadow = true;
    soldierGroup.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32 * scale, 8, 8),
      armorMat
    );
    head.position.y = 1.32 * scale;
    soldierGroup.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: isBoss ? 0xf43f5e : 0x38bdf8 });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 5, 5), eyeMat);
    eye1.position.set(-0.14 * scale, 1.36 * scale, 0.28 * scale);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 5, 5), eyeMat);
    eye2.position.set(0.14 * scale, 1.36 * scale, 0.28 * scale);
    soldierGroup.add(eye1);
    soldierGroup.add(eye2);

    const wGeo = new THREE.ConeGeometry(0.12 * scale, 1.1 * scale, 4);
    wGeo.scale(0.3, 1, 1);
    const weapon = new THREE.Mesh(wGeo, armorMat);
    weapon.position.set(0.55 * scale, 0.65 * scale, 0.3 * scale);
    weapon.rotation.x = Math.PI / 4;
    soldierGroup.add(weapon);

    this.createExtractionEffect(soldierGroup.position);
    this.scene.add(soldierGroup);

    const baseHp = Math.floor((monsterData.maxHp || 100) * 1.2);
    const baseDmg = Math.floor((monsterData.damage || 15) * 1.3);

    const soldier = {
      group: soldierGroup,
      name: `Gölge ${monsterData.name || 'Askeri'}`,
      isBoss: isBoss,
      maxHp: baseHp,
      hp: baseHp,
      damage: baseDmg,
      speed: (monsterData.speed || 6.0) * 1.1,
      scale: scale,
      alive: true,
      attackCooldown: 0,
      attackRange: 2.6 * scale
    };

    this.soldiers.push(soldier);
    soloGameState.shadowSoldiersCount = this.soldiers.length;
    soloGameState.emit('update', soloGameState);

    return soldier;
  }

  placeInShadowCage(monsterData, dungeonWorld) {
    const cageGroup = new THREE.Group();
    cageGroup.position.set(18, 0, 18);

    const barMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8,
      metalness: 0.9
    });

    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.5, 6), barMat);
      bar.position.set(Math.cos(ang) * 2.5, 2.25, Math.sin(ang) * 2.5);
      cageGroup.add(bar);
    }

    const cageRoof = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.3, 8), barMat);
    cageRoof.position.y = 4.5;
    cageGroup.add(cageRoof);

    const bossMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, emissive: 0x7c3aed, emissiveIntensity: 0.6 });
    const innerBoss = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.8), bossMat);
    innerBoss.position.y = 1.0;
    cageGroup.add(innerBoss);

    this.scene.add(cageGroup);
    this.cagedBosses.push({ group: cageGroup, monsterData });
  }

  createExtractionEffect(position) {
    const ringGeo = new THREE.RingGeometry(0.4, 3.5, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(position);
    ring.position.y = 0.1;
    this.scene.add(ring);

    let p = 0;
    const interval = setInterval(() => {
      p += 0.1;
      ring.scale.set(1 + p * 2.2, 1 + p * 2.2, 1);
      ring.material.opacity = Math.max(0, 0.9 - p);
      if (p >= 1.0) {
        clearInterval(interval);
        this.scene.remove(ring);
      }
    }, 30);
  }

  commandAttack() {
    this.commandMode = 'attack';
    soloGameState.shadowCommand = 'attack';
    soloGameState.emit('update', soloGameState);
    return 'attack';
  }

  commandRecall() {
    this.commandMode = 'follow';
    soloGameState.shadowCommand = 'follow';
    soloGameState.emit('update', soloGameState);
    return 'follow';
  }

  // --- KÖYE GİDİNCE TÜM ÖLÜ ASKERLERİ DİRİLTME ---
  reviveAllAtHub(playerPos) {
    this.soldiers.forEach((soldier, idx) => {
      soldier.alive = true;
      soldier.hp = soldier.maxHp;
      soldier.group.visible = true;
      soldier.group.position.copy(playerPos);
      this.createExtractionEffect(soldier.group.position);
    });
    soloGameState.shadowSoldiersCount = this.soldiers.length;
    soloGameState.emit('update', soloGameState);
  }

  // --- ASKER HASAR ALMA VE ÖLÜMÜ / MANA İLE DİRİLME ---
  damageSoldier(soldier, amount, playerPos) {
    if (!soldier.alive) return;
    soldier.hp -= amount;

    if (soldier.hp <= 0) {
      soldier.hp = 0;
      soldier.alive = false;
      soldier.group.visible = false;

      // Mana Kontrolü: Yeterli Mana Varsa Anında Diril (-20 MP)
      if (soloGameState.mana >= this.respawnManaCost) {
        soloGameState.consumeMana(this.respawnManaCost);
        setTimeout(() => {
          soldier.alive = true;
          soldier.hp = soldier.maxHp;
          soldier.group.visible = true;
          soldier.group.position.copy(playerPos || soldier.group.position);
          this.createExtractionEffect(soldier.group.position);
          soloGameState.emit('shadowRespawned', soldier);
        }, 1200);
      } else {
        // MANA BİTTİ: Zindanda Canlanamaz!
        soloGameState.emit('shadowCannotRespawn', soldier.name);
      }
    }
  }

  getArmyFormationTarget(soldierIndex, playerPos, playerYaw) {
    let row = 1;
    let countInRow = 3;
    let remaining = soldierIndex;

    while (remaining >= countInRow) {
      remaining -= countInRow;
      row++;
      countInRow += 2;
    }
    const colIndex = remaining - Math.floor(countInRow / 2);

    const rowSpacing = 2.2;
    const colSpacing = 1.9;

    const localX = colIndex * colSpacing;
    const localZ = row * rowSpacing;

    const rotated = new THREE.Vector3(localX, 0, localZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
    return new THREE.Vector3(playerPos.x + rotated.x, 0, playerPos.z + rotated.z);
  }

  calculateSeparationForce(currentSoldier) {
    const separationForce = new THREE.Vector3(0, 0, 0);
    const minDistance = this.personalSpaceRadius * currentSoldier.scale;
    const minDistanceSq = minDistance * minDistance;

    for (let i = 0; i < this.soldiers.length; i++) {
      const other = this.soldiers[i];
      if (other === currentSoldier || !other.alive) continue;

      const dx = currentSoldier.group.position.x - other.group.position.x;
      const dz = currentSoldier.group.position.z - other.group.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq > 0 && distSq < minDistanceSq) {
        const dist = Math.sqrt(distSq);
        const push = (minDistance - dist) / minDistance;
        separationForce.x += (dx / dist) * push * 3.5;
        separationForce.z += (dz / dist) * push * 3.5;
      }
    }

    return separationForce;
  }

  update(delta, playerPos, playerYaw, activeMonsters, onMonsterDamaged) {
    const shadowBuff = soloGameState.getShadowDamageMultiplier();

    this.soldiers.forEach((soldier, idx) => {
      if (!soldier.alive) return; // Ölü asker zindanda manasızsa hareket etmez

      // R Modu: Hücum
      if (this.commandMode === 'attack' && activeMonsters && activeMonsters.length > 0) {
        let nearestMonster = null;
        let minDistSq = Infinity;

        for (let i = 0; i < activeMonsters.length; i++) {
          const m = activeMonsters[i];
          if (!m.alive) continue;
          const dx = soldier.group.position.x - m.group.position.x;
          const dz = soldier.group.position.z - m.group.position.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            nearestMonster = m;
          }
        }

        if (nearestMonster) {
          const mPos = nearestMonster.group.position;
          const dist = Math.sqrt(minDistSq);

          soldier.group.lookAt(mPos.x, soldier.group.position.y, mPos.z);

          if (dist > soldier.attackRange) {
            const moveDir = new THREE.Vector3().subVectors(mPos, soldier.group.position).normalize();
            const sep = this.calculateSeparationForce(soldier);
            moveDir.add(sep.multiplyScalar(0.35)).normalize();

            soldier.group.position.x += moveDir.x * soldier.speed * delta;
            soldier.group.position.z += moveDir.z * soldier.speed * delta;
          } else {
            if (soldier.attackCooldown <= 0) {
              soldier.attackCooldown = 0.9;
              if (onMonsterDamaged) {
                const finalDamage = Math.floor(soldier.damage * shadowBuff);
                onMonsterDamaged(nearestMonster, finalDamage);
              }
            }
          }
        } else {
          this.moveInFormation(soldier, idx, playerPos, playerYaw, delta);
        }
      } else {
        // Q Modu: Toplanma
        this.moveInFormation(soldier, idx, playerPos, playerYaw, delta);
      }

      if (soldier.attackCooldown > 0) {
        soldier.attackCooldown -= delta;
      }
    });
  }

  moveInFormation(soldier, index, playerPos, playerYaw, delta) {
    const targetPos = this.getArmyFormationTarget(index, playerPos, playerYaw);
    const dist = soldier.group.position.distanceTo(targetPos);
    const separationForce = this.calculateSeparationForce(soldier);

    if (dist > 0.6) {
      const moveDir = new THREE.Vector3().subVectors(targetPos, soldier.group.position).normalize();
      moveDir.add(separationForce.multiplyScalar(0.4)).normalize();

      const currentSpeed = dist > 6.0 ? soldier.speed * 1.4 : soldier.speed;
      soldier.group.position.x += moveDir.x * currentSpeed * delta;
      soldier.group.position.z += moveDir.z * currentSpeed * delta;
      soldier.group.rotation.set(0, playerYaw, 0);
    } else {
      if (separationForce.lengthSq() > 0.01) {
        soldier.group.position.x += separationForce.x * delta * 1.2;
        soldier.group.position.z += separationForce.z * delta * 1.2;
      }
      soldier.group.rotation.set(0, playerYaw, 0);
    }
  }

  getActiveSoldiers() {
    return this.soldiers.filter((s) => s.alive);
  }

  clearAll() {
    this.soldiers.forEach((s) => this.scene.remove(s.group));
    this.soldiers = [];
    this.cagedBosses.forEach((c) => this.scene.remove(c.group));
    this.cagedBosses = [];
    soloGameState.shadowSoldiersCount = 0;
  }
}
