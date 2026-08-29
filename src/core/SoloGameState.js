/**
 * Solo Leveling Oyun Durumu, Ekonomi (Mağaza) ve Veri Yönetimi
 */
export class SoloGameState {
  constructor() {
    this.reset();
  }

  reset() {
    // Oyuncu Statları
    this.level = 1;
    this.rank = 'E'; // E < D < C < B < A
    this.maxHealth = 100;
    this.health = 100;
    this.maxMana = 100;
    this.mana = 100;
    this.baseAttack = 20;
    this.defense = 4;
    this.xp = 0;
    this.xpToNextLevel = 120;

    // Ekonomi ve Mağaza (System Store)
    this.gold = 150; // Başlangıç altını
    this.inventory = {
      hpPotions: 1,
      mpPotions: 1
    };

    // Kalıcı Mağaza Geliştirmeleri
    this.upgrades = {
      strengthCount: 0,
      agilityCount: 0,
      shadowCoreCount: 0,
      monarchArmorCount: 0
    };

    // Hançer ve Ekipman
    this.currentDagger = {
      id: 'rusty_dagger',
      name: 'Eğri Avcı Hançeri',
      rank: 'E',
      damage: 18,
      description: 'E rank bir avcının ilk mütevazı hançeri.',
      bladeColor: 0x94a3b8,
      glowColor: 0x00e5ff
    };
    this.unlockedDaggers = [this.currentDagger];

    // Gölge Ordusu
    this.shadowCommand = 'follow'; // 'attack' | 'follow'
    this.shadowSoldiersCount = 0;
    this.respawnManaCost = 20; // Her asker dirilişi 20 MP tüketir

    // Konum ve Zindan
    this.currentLocation = 'hub';
    this.activeDungeon = null;

    this.listeners = [];
  }

  getRankForLevel(level) {
    if (level >= 50) return 'A';
    if (level >= 40) return 'B';
    if (level >= 25) return 'C';
    if (level >= 10) return 'D';
    return 'E';
  }

  getRankNumber(rank) {
    const rankMap = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5 };
    return rankMap[rank] || 1;
  }

  canEnterPortal(portalRank) {
    const playerRankNum = this.getRankNumber(this.rank);
    const portalRankNum = this.getRankNumber(portalRank);
    return playerRankNum >= portalRankNum;
  }

  getRequiredLevelForRank(rank) {
    const req = { 'E': 1, 'D': 10, 'C': 25, 'B': 40, 'A': 50 };
    return req[rank] || 1;
  }

  getMaxShadowCapacity() {
    const caps = { 'E': 30, 'D': 35, 'C': 45, 'B': 50, 'A': 60 };
    return caps[this.rank] || 30;
  }

  // Hardcore Dengeli XP Kazanımı
  addXP(amount) {
    this.xp += amount;
    let leveledUp = false;

    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      leveledUp = true;

      this.maxHealth += 18;
      this.health = this.maxHealth;
      this.maxMana += 18;
      this.mana = this.maxMana;
      this.baseAttack += 4;
      this.defense += 2;
      // Gerçek RPG Seviye Zorlaşma Eğrisi
      this.xpToNextLevel = Math.floor(120 * Math.pow(1.32, this.level - 1));

      const newRank = this.getRankForLevel(this.level);
      if (newRank !== this.rank) {
        const oldRank = this.rank;
        this.rank = newRank;
        this.emit('rankUp', { oldRank, newRank: this.rank });
      }

      this.emit('levelUp', { level: this.level, rank: this.rank });
    }

    this.emit('update', this);
    return leveledUp;
  }

  addGold(amount) {
    this.gold += amount;
    this.emit('update', this);
  }

  // Mağaza Satın Alma Sistemi (System Store)
  buyStoreItem(itemKey) {
    const prices = {
      hp_potion: 80,
      mp_potion: 80,
      strength_stone: 350,
      agility_pendant: 400,
      shadow_core: 500,
      monarch_armor: 600
    };

    const cost = prices[itemKey];
    if (cost === undefined || this.gold < cost) {
      return { success: false, reason: 'Yetersiz Altın!' };
    }

    this.gold -= cost;

    if (itemKey === 'hp_potion') {
      this.inventory.hpPotions++;
    } else if (itemKey === 'mp_potion') {
      this.inventory.mpPotions++;
    } else if (itemKey === 'strength_stone') {
      this.upgrades.strengthCount++;
      this.baseAttack += 12;
    } else if (itemKey === 'agility_pendant') {
      this.upgrades.agilityCount++;
    } else if (itemKey === 'shadow_core') {
      this.upgrades.shadowCoreCount++;
    } else if (itemKey === 'monarch_armor') {
      this.upgrades.monarchArmorCount++;
      this.defense += 10;
      this.maxHealth += 50;
      this.health += 50;
    }

    this.emit('update', this);
    return { success: true, item: itemKey };
  }

  useHpPotion() {
    if (this.inventory.hpPotions > 0 && this.health < this.maxHealth) {
      this.inventory.hpPotions--;
      this.health = Math.min(this.maxHealth, this.health + Math.floor(this.maxHealth * 0.6));
      this.emit('update', this);
      return true;
    }
    return false;
  }

  useMpPotion() {
    if (this.inventory.mpPotions > 0 && this.mana < this.maxMana) {
      this.inventory.mpPotions--;
      this.mana = Math.min(this.maxMana, this.mana + Math.floor(this.maxMana * 0.7));
      this.emit('update', this);
      return true;
    }
    return false;
  }

  // Köye Dönüşte Tam Şifa ve Mana Dolumu
  refreshAtHub() {
    this.health = this.maxHealth;
    this.mana = this.maxMana;
    this.emit('hubRested', this);
    this.emit('update', this);
  }

  takeDamage(amount) {
    const armorReduction = this.defense * 0.35 + (this.upgrades.monarchArmorCount * 4);
    const actualDamage = Math.max(2, Math.floor(amount - armorReduction));
    this.health = Math.max(0, this.health - actualDamage);
    this.emit('damageTaken', { damage: actualDamage, health: this.health });
    this.emit('update', this);
    return actualDamage;
  }

  consumeMana(amount) {
    if (this.mana >= amount) {
      this.mana -= amount;
      this.emit('update', this);
      return true;
    }
    return false;
  }

  regenerateMana(amount) {
    if (this.mana < this.maxMana) {
      this.mana = Math.min(this.maxMana, this.mana + amount);
      this.emit('update', this);
    }
  }

  equipDagger(dagger) {
    this.currentDagger = dagger;
    if (!this.unlockedDaggers.some(d => d.id === dagger.id)) {
      this.unlockedDaggers.push(dagger);
    }
    this.emit('daggerEquipped', dagger);
    this.emit('update', this);
  }

  getTotalAttack() {
    const base = this.baseAttack + (this.currentDagger ? this.currentDagger.damage : 0);
    return base + (this.upgrades.strengthCount * 8);
  }

  getShadowDamageMultiplier() {
    return 1.0 + (this.upgrades.shadowCoreCount * 0.25);
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Error in event ${event}:`, e);
        }
      });
  }
}

export const soloGameState = new SoloGameState();
