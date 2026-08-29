import * as THREE from 'three';
import { soloGameState } from '../core/SoloGameState.js';

/**
 * Solo Leveling Savaş ve Çatışma Sistemi (SoloCombatSystem)
 * - Hançer vuruş tespiti ve hasar hesaplaması
 * - Altın (Gold) ve Dengeli Hardcore XP Kazanımı
 * - Gölge Çıkarma & Kapasite / Boss Değiştirme
 * - Boss Ödülleri & Zindan Tamamlama
 */
export class SoloCombatSystem {
  constructor(scene, player, monsterManager, shadowArmy) {
    this.scene = scene;
    this.player = player;
    this.monsterManager = monsterManager;
    this.shadowArmy = shadowArmy;

    this.floatingTexts = [];
    this.setupEvents();
  }

  setupEvents() {
    this.monsterManager.onMonsterKilled = (monster, isBoss) => {
      // 1. Gölge Çıkarma (Shadow Extraction - Arise)
      this.shadowArmy.extractShadow(monster, isBoss);

      // 2. Altın ve Dengeli XP Kazanımı
      const goldEarned = monster.gold || (isBoss ? 200 : 12);
      const xpEarned = isBoss ? 150 : 14;
      soloGameState.addGold(goldEarned);
      soloGameState.addXP(xpEarned);

      this.spawnFloatingText(monster.group.position, `+${goldEarned} 💰 ALTIN`, '#eab308');
      this.spawnFloatingText(monster.group.position, `+${xpEarned} XP`, '#38bdf8');

      // 3. Boss İse Özel Hançer Düşür ve Zindan Tamamlama Bildirimi
      if (isBoss) {
        this.handleBossDefeated(monster);
      }
    };
  }

  processPlayerAttack() {
    const playerPos = this.player.position;
    const playerYaw = this.player.yaw;
    const attackRange = 3.5;
    const attackAngle = Math.PI * 0.6;

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
    const activeTargets = this.monsterManager.getActiveMonsters();
    let hitCount = 0;

    activeTargets.forEach((target) => {
      const targetPos = target.group.position;
      const toTarget = new THREE.Vector3().subVectors(targetPos, playerPos);
      const dist = toTarget.length();

      if (dist <= attackRange + (target.scale || 1.0)) {
        toTarget.normalize();
        const angle = forward.angleTo(toTarget);

        if (angle <= attackAngle / 2) {
          const baseDamage = soloGameState.getTotalAttack();
          const isCrit = Math.random() < 0.25;
          const finalDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

          this.monsterManager.damageMonster(target, finalDamage);
          this.spawnHitEffect(targetPos);
          this.spawnFloatingText(targetPos, finalDamage, isCrit ? '#ef4444' : '#38bdf8', isCrit ? 'KRİTİK!' : '');

          hitCount++;
        }
      }
    });

    return hitCount > 0;
  }

  processDashDamage() {
    const playerPos = this.player.position;
    const activeTargets = this.monsterManager.getActiveMonsters();

    activeTargets.forEach((target) => {
      const dist = target.group.position.distanceTo(playerPos);
      if (dist <= 3.2) {
        const dashDamage = Math.floor(soloGameState.getTotalAttack() * 0.85);
        this.monsterManager.damageMonster(target, dashDamage);
        this.spawnFloatingText(target.group.position, dashDamage, '#a855f7', 'GÖLGE DARBESİ');
      }
    });
  }

  handleBossDefeated(bossData) {
    const currentRank = soloGameState.activeDungeon || 'E';

    const daggerDrops = {
      E: {
        id: 'bone_dagger',
        name: 'Razan\'ın Kemik Hançeri',
        rank: 'E',
        damage: 32,
        description: 'Goblin Reisinin sertleşmiş kemikten yontulmuş keskin hançeri.',
        bladeColor: 0xe2e8f0,
        glowColor: 0x10b981
      },
      D: {
        id: 'kasaka_fang',
        name: 'Kasaka\'nın Zehirli Dişi',
        rank: 'D',
        damage: 65,
        description: 'Mavi Bataklık Yılanı Kasaka\'nın felç edici zehirle kaplı dişi.',
        bladeColor: 0x06b6d4,
        glowColor: 0x06b6d4
      },
      C: {
        id: 'baruka_dagger',
        name: 'Baruka\'nın Buzul Hançeri',
        rank: 'C',
        damage: 130,
        description: 'Buz Elfi Lordu Baruka\'nın dondurucu soğuk aurasına sahip hançeri.',
        bladeColor: 0xa855f7,
        glowColor: 0x38bdf8
      },
      B: {
        id: 'demon_king_dagger',
        name: 'İblis Kralı Kısa Kılıcı',
        rank: 'B',
        damage: 230,
        description: 'Açgözlü İblis Kralı Vulcan\'ın volkanik alevlerle dövülmüş hançeri.',
        bladeColor: 0xf97316,
        glowColor: 0xef4444
      },
      A: {
        id: 'kamish_wrath',
        name: 'Kamish\'in Gazabı (Hükümdar Hançeri)',
        rank: 'A',
        damage: 480,
        description: 'Kadim Ejderha Kamish\'in dişinden yapılmış, mutlak karanlık güce sahip efsanevi hançer.',
        bladeColor: 0xeab308,
        glowColor: 0x9333ea
      }
    };

    const newDagger = daggerDrops[currentRank] || daggerDrops.E;
    soloGameState.equipDagger(newDagger);

    const bonusXp = { E: 200, D: 450, C: 950, B: 2100, A: 4500 }[currentRank] || 200;
    soloGameState.addXP(bonusXp);

    soloGameState.emit('dungeonCleared', {
      rank: currentRank,
      dagger: newDagger,
      xp: bonusXp
    });
  }

  spawnHitEffect(position) {
    const flashMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), flashMat);
    flash.position.copy(position);
    flash.position.y += 1.0;
    this.scene.add(flash);

    setTimeout(() => this.scene.remove(flash), 120);
  }

  spawnFloatingText(position, text, color = '#38bdf8', prefix = '') {
    this.floatingTexts.push({
      worldPos: position.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        1.6 + Math.random() * 0.6,
        (Math.random() - 0.5) * 0.8
      )),
      text: prefix ? `${prefix} ${text}` : `${text}`,
      color: color,
      opacity: 1.0,
      life: 1.1
    });
  }

  update(delta) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= delta;
      ft.worldPos.y += delta * 1.5;
      ft.opacity = Math.max(0, ft.life / 1.1);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
