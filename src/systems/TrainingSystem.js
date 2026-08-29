import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';

/**
 * TrainingSystem - Tımarlı Sipahi ve Cebelü Talim Sistemi (Aşama 2)
 * Talim Türleri:
 * 1. Kalkan & Blok (shield_drill): 5 darbeli blok talimi
 * 2. Kılıç & Mesafe (sword_drill): Hassas vuruş ve stamina yönetimi
 * 3. Atlı Mızrak (spear_drill): At üstünde süratli geçiş hücumu
 * 4. Bölük Komutu (squad_drill): Takip, Saf Tut, Hücum, Düzenli Ricat
 */
export class TrainingSystem {
  constructor() {
    this.activeDrill = null;
    this.drillProgress = 0;
    this.drillTarget = 5;
    this.drillScore = 0;
    this.squadOrders = ['FOLLOW', 'HOLD', 'CHARGE', 'FALL_BACK'];
    this.currentSquadOrder = 'FOLLOW';
  }

  startDrill(drillType) {
    this.activeDrill = drillType;
    this.drillProgress = 0;
    this.drillScore = 0;

    let drillName = '';
    switch (drillType) {
      case 'shield':
        this.drillTarget = 5;
        drillName = 'Kalkan ve Savunma Talimi';
        break;
      case 'sword':
        this.drillTarget = 6;
        drillName = 'Kılıç Kombinasyonu ve Mesafe Talimi';
        break;
      case 'spear':
        this.drillTarget = 4;
        drillName = 'Atlı Mızrak Hücum Talimi';
        break;
      case 'squad':
        this.drillTarget = 4;
        drillName = 'Cebelü Bölük Komut Talimi';
        break;
      default:
        this.activeDrill = null;
        return false;
    }

    gameState.addNotification(`🥋 Talim Başladı: ${drillName} (Hedef: ${this.drillTarget} Tekrar)`, 'info');
    return true;
  }

  processShieldBlock(isTimingPerfect = false) {
    if (this.activeDrill !== 'shield') return false;

    this.drillProgress++;
    const scoreAdd = isTimingPerfect ? 20 : 10;
    this.drillScore += scoreAdd;

    // Stamina Tüketimi & Kalkan Dayanıklılığı
    gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - (isTimingPerfect ? 5 : 12));
    gameState.addNotification(`🛡️ Kalkan Bloğu Başarılı! (${this.drillProgress}/${this.drillTarget})`, 'info');

    if (this.drillProgress >= this.drillTarget) {
      this.completeDrill();
    }
    return true;
  }

  processSwordStrike(isComboHit = false) {
    if (this.activeDrill !== 'sword') return false;

    this.drillProgress++;
    this.drillScore += isComboHit ? 25 : 15;
    gameState.sipahi.stamina = Math.max(0, gameState.sipahi.stamina - 8);

    gameState.addNotification(`⚔️ Kılıç Darbesi İsabetli! (${this.drillProgress}/${this.drillTarget})`, 'info');

    if (this.drillProgress >= this.drillTarget) {
      this.completeDrill();
    }
    return true;
  }

  processSpearCharge(speed = 1.0) {
    if (this.activeDrill !== 'spear') return false;

    this.drillProgress++;
    const scoreAdd = Math.round(20 * speed);
    this.drillScore += scoreAdd;

    gameState.addNotification(`🏇 Mızrak Hücumu Tam İsabet! (${this.drillProgress}/${this.drillTarget})`, 'info');

    if (this.drillProgress >= this.drillTarget) {
      this.completeDrill();
    }
    return true;
  }

  issueSquadOrder(order) {
    if (!this.squadOrders.includes(order)) return false;

    this.currentSquadOrder = order;
    let orderDesc = '';

    switch (order) {
      case 'FOLLOW': orderDesc = 'Sipahiyi Takip Et!'; break;
      case 'HOLD': orderDesc = 'Saf Tut ve Mevziyi Koru!'; break;
      case 'CHARGE': orderDesc = 'Hücum! Düşman Hattına Girin!'; break;
      case 'FALL_BACK': orderDesc = 'Kontrollü Geri Çekilin!'; break;
    }

    gameState.addNotification(`🚩 Bölük Emri: ${orderDesc}`, 'alert');

    if (this.activeDrill === 'squad') {
      this.drillProgress++;
      this.drillScore += 25;
      if (this.drillProgress >= this.drillTarget) {
        this.completeDrill();
      }
    }

    return true;
  }

  completeDrill() {
    let medal = 'Bronz';
    let xpGain = 15;
    let loyaltyGain = 10;

    if (this.drillScore >= 80) {
      medal = 'Altın';
      xpGain = 35;
      loyaltyGain = 20;
    } else if (this.drillScore >= 50) {
      medal = 'Gümüş';
      xpGain = 25;
      loyaltyGain = 15;
    }

    gameState.military.cebeluExperience = (gameState.military.cebeluExperience || 0) + xpGain;
    gameState.modifySquadLoyalty(loyaltyGain);
    gameState.modifySancakReputation(5);

    try { soundManager.playVictoryJingle(); } catch (e) {}
    gameState.addNotification(`🏆 Talim Tamamlandı! Derece: ${medal} (+${xpGain} Cebelü Tecrübesi, +${loyaltyGain} Bölük Sadakati)`, 'success');

    this.activeDrill = null;
  }
}

export const trainingSystem = new TrainingSystem();
