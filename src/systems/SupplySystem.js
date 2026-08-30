/**
 * Mülk-i Osmanî - İkmal, Talimgâh ve Sefer Hazırlık Sistemi (SupplySystem)
 * 
 * V2 Devir Sözleşmesi Bölüm 15 (G3-G4 Standartları):
 * - Tımarın 1396 Niğbolu Seferi için savaşa hazırlık derecesi (readinessScore).
 * - Cebelü Ali ve Sipahi'nin talim, at tımarı, pusat bileme ve lojistik hazırlığı.
 * - Deterministik puanlama: Savaş safhalarına doğrudan etki eden çarpanlar.
 * - Geriye dönük uyumluluk (Legacy durability & inspection API desteği).
 */

import { gameState } from '../core/GameState.js';
import { effectRunner } from '../core/EffectRunner.js';
import { logger } from '../core/Logger.js';

export class SupplySystem {
  constructor() {
    this.maintenanceCompletedToday = {
      horseGrooming: false,
      swordSharpening: false,
      archeryPractice: false,
      armorRepair: false
    };

    // Legacy uyumluluk alanları
    this.durability = {
      sword: 100,
      armor: 100,
      shield: 100,
      bow: 100
    };

    this.horse = {
      health: 100,
      stamina: 100,
      hunger: 0
    };
  }

  // --- Legacy API Desteği ---
  reduceDurability(itemType, amount) {
    if (this.durability[itemType] !== undefined) {
      this.durability[itemType] = Math.max(0, this.durability[itemType] - amount);
    }
  }

  repairItem(itemType, cost = 30) {
    if (gameState.timar.akce >= cost) {
      gameState.timar.akce -= cost;
      if (this.durability[itemType] !== undefined) {
        this.durability[itemType] = 100;
      }
      return true;
    }
    return false;
  }

  feedHorse() {
    this.horse.stamina = 100;
    this.horse.hunger = 0;
    return true;
  }

  conductInspection() {
    const isPassing = this.durability.sword > 50 && this.durability.armor > 50;
    const score = this.calculateReadinessScore();
    const grade = score >= 80 ? 'Âlâ (Kusursuz Savaşçı)' : score >= 50 ? 'Evsât (Makbul Cebelü)' : 'Ednâ (Kusurlu Teçhizat)';
    return {
      passed: isPassing,
      score,
      grade,
      readinessScore: score
    };
  }

  // --- V2 Devir Standartları ---
  /**
   * At Tımarı & Bakımı
   */
  groomHorse() {
    const cost = 20;
    if (gameState.timar.akce < cost) {
      gameState.addNotification('⚠️ At tımarı ve yemi için 20 Akçe gereklidir!', 'alert');
      return false;
    }

    const txId = `supply:groom:${gameState.time.dayCount}`;
    const result = effectRunner.runTransaction(txId, [
      { type: 'modifyStat', stat: 'akce', value: -cost },
      { type: 'modifyStat', stat: 'squadLoyalty', value: 5 }
    ]);

    if (result.ok) {
      this.maintenanceCompletedToday.horseGrooming = true;
      this.feedHorse();
      gameState.military.horseCondition = Math.min(100, (gameState.military.horseCondition || 70) + 15);
      gameState.addNotification('🐎 Atlar tımarlanıp beslendi; kondisyonları arttı (+15).', 'success');
      return true;
    }
    return false;
  }

  /**
   * Kılıç & Pusat Bileme (Demirci Dükkanı)
   */
  sharpenWeapons() {
    const cost = 35;
    if (gameState.timar.akce < cost) {
      gameState.addNotification('⚠️ Kılıç bileme ve çark için 35 Akçe gereklidir!', 'alert');
      return false;
    }

    const txId = `supply:sharpen:${gameState.time.dayCount}`;
    const result = effectRunner.runTransaction(txId, [
      { type: 'modifyStat', stat: 'akce', value: -cost },
      { type: 'modifyStat', stat: 'faction_ahiler', value: 5 }
    ]);

    if (result.ok) {
      this.maintenanceCompletedToday.swordSharpening = true;
      this.durability.sword = 100;
      gameState.military.weaponSharpness = Math.min(100, (gameState.military.weaponSharpness || 60) + 20);
      gameState.addNotification('⚔️ Kılıç ve gürzler Demirci körüğünde bilendi (+20 Keskinlik).', 'success');
      return true;
    }
    return false;
  }

  /**
   * Okçuluk & Nişan Talimi
   */
  practiceArchery() {
    const txId = `supply:archery:${gameState.time.dayCount}`;
    const result = effectRunner.runTransaction(txId, [
      { type: 'modifyStat', stat: 'squadLoyalty', value: 5 }
    ]);

    if (result.ok) {
      this.maintenanceCompletedToday.archeryPractice = true;
      gameState.military.archeryProficiency = Math.min(100, (gameState.military.archeryProficiency || 50) + 10);
      gameState.addNotification('🏹 Talimgâhta ok atış talimi yapıldı (+10 İsabet).', 'success');
      return true;
    }
    return false;
  }

  /**
   * Zırh & Kalkan Onarımı
   */
  repairArmor() {
    const cost = 40;
    if (gameState.timar.akce < cost) {
      gameState.addNotification('⚠️ Zırh ve kalkan perçinleri için 40 Akçe gereklidir!', 'alert');
      return false;
    }

    const txId = `supply:armor:${gameState.time.dayCount}`;
    const result = effectRunner.runTransaction(txId, [
      { type: 'modifyStat', stat: 'akce', value: -cost }
    ]);

    if (result.ok) {
      this.maintenanceCompletedToday.armorRepair = true;
      this.durability.armor = 100;
      gameState.military.armorCondition = Math.min(100, (gameState.military.armorCondition || 65) + 15);
      gameState.addNotification('🛡️ Zırh gömlekleri ve kalkanlar elden geçirildi (+15 Zırh).', 'success');
      return true;
    }
    return false;
  }

  /**
   * Sefer Hazırlık Puanı Hesaplaması (0 - 100)
   */
  calculateReadinessScore() {
    const cebeluWeight = Math.min(30, (gameState.military.cebeluCount * 15) + (gameState.military.cebeluExperience * 0.15));
    const gearWeight = (
      ((gameState.military.horseCondition || 70) * 0.1) +
      ((gameState.military.weaponSharpness || 60) * 0.1) +
      ((gameState.military.armorCondition || 65) * 0.1)
    );
    const logisticWeight = Math.min(20, (gameState.timar.akce / 100));
    const moraleWeight = (
      (gameState.reputation.squadLoyalty * 0.1) +
      (gameState.reputation.sancakReputation * 0.1)
    );

    const total = Math.min(100, Math.round(cebeluWeight + gearWeight + logisticWeight + moraleWeight));
    return total;
  }

  resetDailyMaintenance() {
    this.maintenanceCompletedToday = {
      horseGrooming: false,
      swordSharpening: false,
      archeryPractice: false,
      armorRepair: false
    };
  }

  serialize() {
    return {
      maintenance: this.maintenanceCompletedToday,
      durability: this.durability,
      horse: this.horse
    };
  }

  deserialize(data) {
    if (!data) return;
    this.maintenanceCompletedToday = data.maintenance || this.maintenanceCompletedToday;
    this.durability = data.durability || this.durability;
    this.horse = data.horse || this.horse;
  }
}

export const supplySystem = new SupplySystem();
