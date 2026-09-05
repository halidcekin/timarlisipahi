import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';

/**
 * TrainingSystem - Tımarlı Sipahi ve Cebelü Talim Sistemi (Aşama 2)
 * Talim Türleri:
 * 1. Kalkan & Blok (shield): 5 darbeli blok talimi
 * 2. Kılıç & Mesafe (sword): Hassas vuruş ve stamina yönetimi
 * 3. Atlı Mızrak (spear): At üstünde süratli geçiş hücumu
 * 4. Bölük Komutu (squad): Takip, Saf Tut, Hücum, Düzenli Ricat
 */
export class TrainingSystem {
  constructor() {
    this.activeDrill = null;
    this.drillProgress = 0;
    this.drillTarget = 5;
    this.drillScore = 0;
    this.squadOrders = ['FOLLOW', 'HOLD', 'CHARGE', 'FALL_BACK'];
    this.currentSquadOrder = 'FOLLOW';
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
  }

  setCallbacks(onProgress, onComplete) {
    this.onProgressCallback = onProgress;
    this.onCompleteCallback = onComplete;
  }

  startDrill(drillType) {
    this.activeDrill = drillType;
    this.drillProgress = 0;
    this.drillScore = 0;

    let drillName = '';
    let drillIcon = '🥋';
    let hint = '';

    switch (drillType) {
      case 'shield':
        this.drillTarget = 5;
        drillName = 'Kalkan ve Savunma Talimi';
        drillIcon = '🛡️';
        hint = 'Sağ tık ile kalkanını kaldırıp 5 darbeyi karşıla!';
        break;
      case 'sword':
        this.drillTarget = 6;
        drillName = 'Kılıç Kombinasyonu ve Mesafe Talimi';
        drillIcon = '⚔️';
        hint = 'Sol tık ile kılıcını savurup hedefe 6 vuruş yap!';
        break;
      case 'spear':
        this.drillTarget = 4;
        drillName = 'Atlı Mızrak Hücum Talimi';
        drillIcon = '🏇';
        hint = 'At üstünde süratle geçiş hücumu yap!';
        break;
      case 'squad':
        this.drillTarget = 4;
        drillName = 'Cebelü Bölük Komut Talimi';
        drillIcon = '🚩';
        hint = 'Cebelüye 4 farklı taktik emir ver!';
        break;
      default:
        this.activeDrill = null;
        return false;
    }

    gameState.addNotification(`🥋 Talim Başladı: ${drillName} (Hedef: ${this.drillTarget} Tekrar)`, 'info');

    if (this.onProgressCallback) {
      this.onProgressCallback({
        type: drillType,
        title: drillName,
        icon: drillIcon,
        hint: hint,
        current: 0,
        target: this.drillTarget,
        score: 0
      });
    }

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

    if (this.onProgressCallback) {
      this.onProgressCallback({
        type: this.activeDrill,
        current: this.drillProgress,
        target: this.drillTarget,
        score: this.drillScore,
        hint: isTimingPerfect ? 'Mükemmel Zamanlama!' : 'Blok Başarılı!'
      });
    }

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

    if (this.onProgressCallback) {
      this.onProgressCallback({
        type: this.activeDrill,
        current: this.drillProgress,
        target: this.drillTarget,
        score: this.drillScore,
        hint: isComboHit ? 'Mükemmel Kılıç Kombosu!' : 'İsabetli Darbe!'
      });
    }

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

    if (this.onProgressCallback) {
      this.onProgressCallback({
        type: this.activeDrill,
        current: this.drillProgress,
        target: this.drillTarget,
        score: this.drillScore,
        hint: 'Mızrak Hücumu Başarılı!'
      });
    }

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

      if (this.onProgressCallback) {
        this.onProgressCallback({
          type: this.activeDrill,
          current: this.drillProgress,
          target: this.drillTarget,
          score: this.drillScore,
          hint: `Emir Verildi: ${orderDesc}`
        });
      }

      if (this.drillProgress >= this.drillTarget) {
        this.completeDrill();
      }
    }

    return true;
  }

  cancelDrill() {
    if (!this.activeDrill) return;
    gameState.addNotification('🥋 Talim sonlandırıldı.', 'info');
    this.activeDrill = null;
    this.drillProgress = 0;
    this.drillScore = 0;
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

    // Cebelü görevini (Bölüm 5) ilerlet
    questSystem.advanceObjective('quest_cebelu', 1);

    try { soundManager.playVictoryJingle(); } catch (e) {}
    gameState.addNotification(`🏆 Talim Tamamlandı! Derece: ${medal} (+${xpGain} Cebelü Tecrübesi, +${loyaltyGain} Bölük Sadakati)`, 'success');

    if (this.onCompleteCallback) {
      this.onCompleteCallback({
        medal,
        xpGain,
        loyaltyGain,
        score: this.drillScore
      });
    }

    this.activeDrill = null;
  }
}

export const trainingSystem = new TrainingSystem();
