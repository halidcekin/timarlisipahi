import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { trainingSystem } from './TrainingSystem.js';
import { supplySystem } from './SupplySystem.js';
import { questSystem } from './QuestSystem.js';

/**
 * CampaignBattleSystem - 1396 Niğbolu Meydan Muharebesi ve Rumeli Seferi Motoru (Aşama 3 & 4)
 * 5 Safhalı Epik Meydan Muharebesi:
 * 1. Öncü Temas & Keşif (Öncü akıncılar, düzenli geri çekilme)
 * 2. Kazık Hattı & Okçu Barajı (Fransız-Burgonya zırhlı hücumunu kırma)
 * 3. Yaya Şövalye Çarpışması (Attan inmiş ağır şövalyelerle yakın dövüş)
 * 4. Kral Sigismund'un Ana Kuvveti (Hattı tutma ve bölük komutları)
 * 5. İhtiyat & Karşı Hücum (Stefan Lazareviç & Yıldırım Bayezid süvarileri)
 */
export class CampaignBattleSystem {
  constructor() {
    this.currentPhase = 0; // 0: Hazırlık, 1-5: Muharebe Safhaları, 6: Zafer
    this.battleLog = [];
    this.battleScore = 0;
    this.playerLosses = 0;
    this.capturedBanners = 0;
    this.isBattleActive = false;
  }

  startNicopolisBattle() {
    this.currentPhase = 1;
    this.battleLog = [];
    this.battleScore = 0;
    this.playerLosses = 0;
    this.capturedBanners = 0;
    this.isBattleActive = true;

    soundManager.playWarDrum();
    gameState.addNotification('🚩 1396 NİĞBOLU MEYDAN MUHAREBESİ BAŞLADI!', 'alert');

    return this.getPhaseData(1);
  }

  getPhaseData(phaseIndex) {
    const phases = {
      1: {
        id: 'phase_1_recon',
        name: '1. Safha: Öncü Temas & Keşif',
        enemy: 'Frenk Şövalye Öncüleri (Jean de Nevers / Korkusuz Jean)',
        desc: 'Burgonya ve Fransız şövalyeleri kibirle ön saflara hücuma geçti! Göreviniz akıncılarla hafif temas kurup düzeni bozmadan kazık hattının gerisine çekilmek.',
        options: [
          { id: 'tactical_retreat', text: '🏹 Atlı okçularla oklayarak kazık koridoruna düzenli çekil', successRate: 0.85, score: 20 },
          { id: 'direct_clash', text: '⚔️ Kılıç çekip şövalye süvarilerini göğüsle', successRate: 0.4, score: 10 }
        ]
      },
      2: {
        id: 'phase_2_stakes',
        name: '2. Safha: Kazık Hattı & Okçu Barajı',
        enemy: 'Fransız Ağır Süvari Dalgası',
        desc: 'Zırhlı şövalyeler hızla kazık hattına çarptı! Atlar devrildi, şövalyeler attan inmek zorunda kaldı.',
        options: [
          { id: 'arrow_rain', text: '🎯 Okçulara zırh delici temrenlerle yaylım ateşi emri ver', successRate: 0.9, score: 25 },
          { id: 'squad_hold', text: '🛡️ Cebelülerine kalkan duvarı ördürüp kazık başını tuttur', successRate: 0.75, score: 20 }
        ]
      },
      3: {
        id: 'phase_3_infantry',
        name: '3. Safha: Yaya Ağır Şövalye Çarpışması',
        enemy: 'Attan İnmiş Ağır Plaka Zırhlı Şövalyeler',
        desc: 'Fransız asilzadeleri tepeyi aşmak için kılıç ve kalkanla hücum ediyor! Ağır plaka zırhlarına karşı kılıç yetersiz kalıyor.',
        options: [
          { id: 'use_mace', text: '🔨 Gürz ve Savaş Çekici kuşanarak zırhları ez', successRate: 0.85, score: 30 },
          { id: 'flank_attack', text: '🗡️ Cebelülerinle arkadan çevirip açık noktalarına vur', successRate: 0.7, score: 20 }
        ]
      },
      4: {
        id: 'phase_4_sigismund',
        name: '4. Safha: Kral Sigismund\'un Ana Kuvveti',
        enemy: 'Macar ve Alman İmparatorluk Alayı',
        desc: 'Macar Kralı Sigismund taze kuvvetlerle ovaya indi! Savaşın en kritik anı, cephe hattı sarsılıyor.',
        options: [
          { id: 'hold_the_line', text: '🚩 "Safı bozmayın!" emriyle bölüğü bir arada tut', successRate: 0.8, score: 25 },
          { id: 'feigned_retreat', text: '🐎 Sahte ricat yaparak Macar kanadını pusu vadisine çek', successRate: 0.75, score: 30 }
        ]
      },
      5: {
        id: 'phase_5_counter',
        name: '5. Safha: İhtiyat & Sırp Vasal Karşı Hücumu',
        enemy: 'Bozguna Uğrayan Haçlı Ordusu',
        desc: 'Sultan Yıldırım Bayezid Han ve Sırp Knezi Stefan Lazareviç süvarileriyle tepe arkasından indi! Haçlı ordusu iki ateş arasında kaldı!',
        options: [
          { id: 'final_charge', text: '⚡ Sultanın sancağı altına katılıp Haçlı karargahına nihai hücum yap', successRate: 0.95, score: 35 },
          { id: 'capture_banner', text: '🚩 Burgonya başkomutanı Korkusuz Jean\'ın sancağını ele geçir', successRate: 0.85, score: 40 }
        ]
      }
    };

    return phases[phaseIndex] || null;
  }

  executePhaseAction(optionId) {
    if (!this.isBattleActive || this.currentPhase > 5) return null;

    const phase = this.getPhaseData(this.currentPhase);
    const chosenOption = phase.options.find(o => o.id === optionId);
    if (!chosenOption) return null;

    const roll = Math.random();
    const isSuccess = roll <= chosenOption.successRate;

    let resultDesc = '';
    if (isSuccess) {
      this.battleScore += chosenOption.score;
      if (optionId === 'capture_banner') this.capturedBanners++;
      resultDesc = `✅ [BAŞARILI MANEVRA] ${phase.name} safhasında taktik tam uygulandı! (+${chosenOption.score} Zafer Puanı)`;
    } else {
      this.battleScore += Math.round(chosenOption.score * 0.4);
      this.playerLosses++;
      supplySystem.reduceDurability('shield', 15);
      resultDesc = `⚠️ [ÇETİN VURUŞMA] Düşman sert direndi, cebelülerinden biri yaralandı fakat hat kırılmadı.`;
    }

    this.battleLog.push({ phase: this.currentPhase, isSuccess, text: resultDesc });
    gameState.addNotification(resultDesc, isSuccess ? 'success' : 'alert');

    this.currentPhase++;

    if (this.currentPhase > 5) {
      return this.concludeBattle();
    }

    return {
      nextPhase: this.getPhaseData(this.currentPhase),
      log: resultDesc
    };
  }

  concludeBattle() {
    this.isBattleActive = false;
    const isGloriousVictory = this.battleScore >= 110;

    let lootAkce = isGloriousVictory ? 3000 : 1800;
    let repGain = isGloriousVictory ? 50 : 30;

    gameState.timar.akce += lootAkce;
    gameState.modifySancakReputation(repGain);
    gameState.modifySquadLoyalty(35);
    gameState.modifyReayaTrust(20);
    gameState.activeCampaign.isResolved = true;

    // Savaşın Dramatik Bedeli: Cebelü Ali sipahisini kurtarırken bacağı koptu
    gameState.aliStatus.legSevered = true;
    gameState.aliStatus.isWounded = true;
    gameState.aliStatus.daysRemaining = 3;
    gameState.aliStatus.isSaved = false;
    gameState.aliStatus.isDead = false;

    // Ali'yi kurtarma acil vazifesini aktif et
    const aliQuest = questSystem.getQuestById('quest_save_ali_leg');
    if (aliQuest) {
      aliQuest.status = 'active';
      questSystem.syncWithGameState();
    }

    try { soundManager.playVictoryJingle(); } catch (e) {}

    const outcome = {
      isGloriousVictory,
      score: this.battleScore,
      losses: this.playerLosses,
      banners: this.capturedBanners,
      lootAkce,
      repGain,
      title: isGloriousVictory ? '🏆 NİĞBOLU ZAFER-İ CELÎLESİ (MUHAYYEL GAZÂ)' : '⚔️ NİĞBOLU MEYDAN ZAFERİ',
      desc: isGloriousVictory
        ? `Tuna boyunda Haçlı şövalyeleri darmadağın edildi! Lakin Fransız şövalyesinin kılıcı sana inerken Sadık Cebelü Ali önüne atıldı ve sağ bacağı koptu! Onu Akçaoba'ya yetiştirdin, 3 gün içinde dağlama ve koltuk değneği tedarik etmezsen vefat edecek!`
        : `Zorlu beş safhanın ardından Niğbolu Kalesi kurtarıldı. Zafer kazanıldı lakin Sadık Cebelü Ali ağır yaralandı ve bacağını kaybetti. Onu hayatta tutmalısın!`
    };

    gameState.addNotification(`🏆 ZAFER KAZANILDI LAKİN ALİ AĞIR YARALANDI! (+${lootAkce} Akçe, +${repGain} İtibar)`, 'alert');
    gameState.addNotification(`🚨 ACİL VAZİFE: Gazi Ali'yi Hayatta Tut (Kalan Mühlet: 3 Gün)!`, 'alert');
    return outcome;
  }

  handlePlayerMartyrdom() {
    this.isBattleActive = false;
    gameState.triggerMartyrdom();
  }
}

export const campaignBattleSystem = new CampaignBattleSystem();
