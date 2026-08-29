import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';

/**
 * SupplySystem - Teçhizat Aşınması, At Bakımı, İkmal ve Askeri Yoklama (Aşama 2)
 */
export class SupplySystem {
  constructor() {
    this.durability = {
      sword: 100,
      shield: 100,
      armor: 100
    };

    this.horse = {
      stamina: 100,
      maxStamina: 100,
      isFedToday: true
    };

    this.campaignSupplies = {
      grain: 200,      // Zahire (Kile)
      horseshoes: 8,   // Yedek Nal Takımı
      arrows: 60,      // Savaş Oku
      waterKegs: 15,   // Su Fıçısı
      spareWeapons: 2  // Yedek Pusat
    };
  }

  reduceDurability(itemType, amount = 5) {
    if (this.durability[itemType] !== undefined) {
      this.durability[itemType] = Math.max(0, this.durability[itemType] - amount);
      if (this.durability[itemType] <= 20) {
        gameState.addNotification(`⚠️ Dikkat: ${itemType === 'sword' ? 'Kılıcın' : itemType === 'shield' ? 'Kalkanın' : 'Zırhın'} köreldi/aşındı! Demircide tamir ettir.`, 'alert');
      }
    }
  }

  repairItem(itemType, cost = 30) {
    if (gameState.timar.akce < cost) {
      gameState.addNotification('⚠️ Yeterli akçen yok!', 'alert');
      return false;
    }

    if (this.durability[itemType] !== undefined) {
      gameState.timar.akce -= cost;
      this.durability[itemType] = 100;
      gameState.modifyFaction('ahiler', 5);
      soundManager.playSwordClash();
      gameState.addNotification(`⚒️ ${itemType.toUpperCase()} Demirci Rüstem Usta tarafından tamir edildi ve bilendi (%100).`, 'success');
      return true;
    }
    return false;
  }

  feedHorse() {
    if (gameState.timar.grain < 5) {
      gameState.addNotification('⚠️ Ambarda at için yeterli arpa/zahire yok!', 'alert');
      return false;
    }

    gameState.timar.grain -= 5;
    this.horse.stamina = this.horse.maxStamina;
    this.horse.isFedToday = true;
    gameState.modifySquadLoyalty(5);
    gameState.addNotification('🐎 Karayağız at yemlendi ve tımardan geçirildi. Kuvveti tamalandı.', 'success');
    return true;
  }

  purchaseSupply(supplyKey, amount, totalCost) {
    if (gameState.timar.akce < totalCost) {
      gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
      return false;
    }

    if (this.campaignSupplies[supplyKey] !== undefined) {
      gameState.timar.akce -= totalCost;
      this.campaignSupplies[supplyKey] += amount;
      gameState.modifyFaction('ahiler', 4);
      gameState.addNotification(`📦 Sefer İkmali: +${amount} ${supplyKey} satın alındı (-${totalCost} Akçe).`, 'info');
      return true;
    }
    return false;
  }

  /**
   * Sancak Kalesi Askeri Yoklama Teftişi (Muster Inspection)
   */
  conductInspection() {
    const hasEnoughCebelu = gameState.military.cebeluCount >= gameState.activeCampaign.reqCebelu;
    const hasGoodWeapons = this.durability.sword >= 60 && this.durability.armor >= 60;
    const hasEnoughGrain = this.campaignSupplies.grain >= 150;
    const hasShoes = this.campaignSupplies.horseshoes >= 4;

    let score = 0;
    if (hasEnoughCebelu) score += 40;
    if (hasGoodWeapons) score += 25;
    if (hasEnoughGrain) score += 20;
    if (hasShoes) score += 15;

    let grade = 'C';
    let repGain = 10;
    let desc = '';

    if (score >= 85) {
      grade = 'A (Mükemmel Hazırlık)';
      repGain = 30;
      desc = 'Sancakbeyi teftiş heyeti tımarını ve cebelülerini takdir etti. Orduya tam nizamla katılacaksınız.';
    } else if (score >= 60) {
      grade = 'B (Yeterli Seviye)';
      repGain = 20;
      desc = 'Yoklama tamamlandı, sefer için asgari şartlar sağlandı.';
    } else {
      grade = 'C (Eksikli Hazırlık)';
      repGain = 5;
      desc = 'Eksik teçhizat ve yetersiz zahire nedeniyle divan teftişinde uyarı aldın!';
    }

    gameState.modifySancakReputation(repGain);
    gameState.addNotification(`📜 ASKERİ YOKLAMA SONUCU: Derece ${grade} (+${repGain} Sancak İtibarı)`, 'success');

    return { score, grade, desc };
  }
}

export const supplySystem = new SupplySystem();
