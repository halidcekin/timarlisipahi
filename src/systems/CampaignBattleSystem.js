import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { supplySystem } from './SupplySystem.js';
import { questSystem } from './QuestSystem.js';

/**
 * CampaignBattleSystem - 1396 Niğbolu Meydan Muharebesi, Sungur Bey'in Dönüş Yolu Trajedisi
 * ve 1402 Ankara Savaşında Timur'un Savaş Filleri Meydan Motoru
 */
export class CampaignBattleSystem {
  constructor() {
    this.currentBattleType = 'nigbolu'; // 'nigbolu' veya 'ankara'
    this.currentPhase = 0;
    this.battleLog = [];
    this.battleScore = 0;
    this.playerLosses = 0;
    this.capturedBanners = 0;
    this.isBattleActive = false;
  }

  startNicopolisBattle() {
    this.currentBattleType = 'nigbolu';
    this.currentPhase = 1;
    this.battleLog = [];
    this.battleScore = 0;
    this.playerLosses = 0;
    this.capturedBanners = 0;
    this.isBattleActive = true;

    try { soundManager.playWarDrum(); } catch (e) {}
    gameState.addNotification('🚩 1396 NİĞBOLU MEYDAN MUHAREBESİ BAŞLADI!', 'alert');

    return this.getPhaseData(1);
  }

  startAnkaraBattle() {
    this.currentBattleType = 'ankara';
    this.currentPhase = 1;
    this.battleLog = [];
    this.battleScore = 0;
    this.playerLosses = 0;
    this.capturedBanners = 0;
    this.isBattleActive = true;

    try { soundManager.playWarDrum(); } catch (e) {}
    gameState.addNotification('🐘 1402 ANKARA MEYDAN MUHAREBESİ (ÇUBUK OVASI) BAŞLADI!', 'alert');

    return this.getPhaseData(1);
  }

  getPhaseData(phaseIndex) {
    if (this.currentBattleType === 'ankara') {
      const ankaraPhases = {
        1: {
          id: 'ankara_p1_tatars',
          name: '1. Safha: Çağatay Okçuları & Kara Tatarların İhaneti',
          enemy: 'Emir Timur\'un Zırhlı Süvarileri & Okçu Barajı',
          desc: '1402 Çubuk Ovası\'nda sol kanattaki Kara Tatarlar taraf değiştirip arkadan vurdu! Düşman atlı okçuları gökyüzünü kararttı.',
          options: [
            { id: 'shield_circle', text: '🛡️ Cebelülerle çember kalkan duvarı örüp hattı koru', successRate: 0.85, score: 25 },
            { id: 'cavalry_strike', text: '⚔️ Atlı hücumla kanat yaran süvarileri karşıla', successRate: 0.5, score: 15 }
          ]
        },
        2: {
          id: 'ankara_p2_janissaries',
          name: '2. Safha: Sultan Bayezid\'in Tepedeki Direnişi',
          enemy: 'Timur\'un Ağır Zırhlı Muhafız Alayı (Kişik)',
          desc: 'Sultan Yıldırım Bayezid Han merkezde yeniçerileriyle tepeyi tutuyor. Düşman dalga dalga tepeye yükleniyor.',
          options: [
            { id: 'hold_hill', text: '🚩 Sultanın sancağı yanına yetişip sol kanadı takviye et', successRate: 0.9, score: 30 },
            { id: 'flank_harass', text: '🏹 Okçularla tepeye tırmanan düşman zırhlılarını yandan biç', successRate: 0.75, score: 20 }
          ]
        },
        3: {
          id: 'ankara_p3_elephants_arrive',
          name: '3. Safha: Timur\'un Zırhlı Savaş Filleri Sahada!',
          enemy: 'Hint Zırhlı Savaş Fillleri & Kule Okçuları',
          desc: 'Yer gök inliyor! Emir Timur\'un Hindistan\'dan getirdiği zırhlı devasa savaş filleri ön saflara sürüldü. Atlar ürkerek dağılıyor!',
          options: [
            { id: 'aim_eyes', text: '🎯 Filin gözlerine ve hortumuna alevli temrenler fırlat', successRate: 0.8, score: 35 },
            { id: 'spear_charge', text: '🐎 Mızrakla filin zırhlı diz kapaklarına atıl', successRate: 0.7, score: 30 }
          ]
        },
        4: {
          id: 'ankara_p4_elephant_clash',
          name: '4. Safha: Savaş Filine Karşı Nihai Cansiperane Hücum!',
          enemy: 'Emir Timur\'un Baş Savaş Fili (Dev Zırhlı)',
          desc: 'Devasa savaş fili kükreyerek Osmanlı sancağının üzerine doğru adımlıyor! Sipahi Murad Bey kılıç ve gürzünü çekip tek başına cansiperane filin önüne atılıyor!',
          options: [
            { id: 'heroic_charge', text: '⚡ "Allahu Ekber!" nidasıyla filin ayakları arasına tek başına dal!', successRate: 1.0, score: 50 }
          ]
        }
      };
      return ankaraPhases[phaseIndex] || null;
    }

    // 1396 Niğbolu Muharebesi Safhaları
    const nigboluPhases = {
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

    return nigboluPhases[phaseIndex] || null;
  }

  executePhaseAction(optionId) {
    if (!this.isBattleActive) return null;

    const maxPhases = this.currentBattleType === 'ankara' ? 4 : 5;
    if (this.currentPhase > maxPhases) return null;

    const phase = this.getPhaseData(this.currentPhase);
    const chosenOption = phase.options.find(o => o.id === optionId);
    if (!chosenOption) return null;

    // Ankara 4. Safha: Filin ayağı altında epik şehadet
    if (this.currentBattleType === 'ankara' && this.currentPhase === 4) {
      this.isBattleActive = false;
      gameState.triggerElephantMartyrdom();
      return {
        isElephantMartyrdom: true,
        desc: 'Devasa savaş fili kükreyerek üzerine bastı! Şanlı bir şehadetle adını tarihe yazdırdın!'
      };
    }

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
      try { supplySystem.reduceDurability('shield', 15); } catch (e) {}
      resultDesc = `⚠️ [ÇETİN VURUŞMA] Düşman sert direndi, cebelülerinden biri yaralandı fakat hat kırılmadı.`;
    }

    this.battleLog.push({ phase: this.currentPhase, isSuccess, text: resultDesc });
    gameState.addNotification(resultDesc, isSuccess ? 'success' : 'alert');

    this.currentPhase++;

    if (this.currentPhase > maxPhases) {
      return this.concludeBattle();
    }

    return {
      nextPhase: this.getPhaseData(this.currentPhase),
      log: resultDesc
    };
  }

  concludeBattle() {
    this.isBattleActive = false;

    if (this.currentBattleType === 'ankara') {
      gameState.triggerElephantMartyrdom();
      return;
    }

    const isGloriousVictory = this.battleScore >= 110;
    let lootAkce = isGloriousVictory ? 3000 : 1800;
    let repGain = isGloriousVictory ? 50 : 30;

    gameState.timar.akce += lootAkce;
    gameState.modifySancakReputation(repGain);
    gameState.modifySquadLoyalty(35);
    gameState.modifyReayaTrust(20);
    gameState.activeCampaign.isResolved = true;

    // Savaşın ve Dönüş Yolunun Dramatik Sonu:
    // 1. Cebelü Ali bacağını kaybetti
    gameState.aliStatus.legSevered = true;
    gameState.aliStatus.isWounded = true;
    gameState.aliStatus.daysRemaining = 3;
    gameState.aliStatus.isSaved = false;
    gameState.aliStatus.isDead = false;

    // 2. Gazi Sungur Bey Dönüş Yolunda Attan Düşüp Şehit Oldu & İftira Başladı
    gameState.murderCase.hasSungurDied = true;
    gameState.murderCase.isAccused = true;
    gameState.murderCase.isAsayisLocked = true;
    gameState.reputation.asayis = 40;
    gameState.timar.order = 40;

    // Ali kurtarma görevi
    const aliQuest = questSystem.getQuestById('quest_save_ali_leg');
    if (aliQuest) {
      aliQuest.status = 'active';
    }

    // Cinayet Soruşturması ve Mahkeme görevini aktif et
    const murderQuest = questSystem.getQuestById('quest_murder_trial');
    if (murderQuest) {
      murderQuest.status = 'active';
    }

    questSystem.syncWithGameState();

    try { soundManager.playVictoryJingle(); } catch (e) {}

    const outcome = {
      isGloriousVictory,
      score: this.battleScore,
      losses: this.playerLosses,
      banners: this.capturedBanners,
      lootAkce,
      repGain,
      title: '🏆 NİĞBOLU ZAFERİ & DÖNÜŞ YOLUNDA HAİN SUNGUR SABOTAJI!',
      desc: `Haçlı ordusu darmadağın edildi! Lakin dönüş yolunda Gazi Sungur Bey'in atı dağ geçidinde kaza yaptı ve Sungur Bey şehit düştü. Köye vardığında ise Frenk ajanı Dimitri ortaya çıkıp seni cinayetle suçladı! Köy Asayişi %40'a kilitlendi! İpucu olmaksızın delil toplamak ve mahkemede aklanmak zorundasın!`
    };

    gameState.addNotification(`🏆 ZAFER KAZANILDI LAKİN GAZİ SUNGUR BEY ŞEHİT OLDU!`, 'alert');
    gameState.addNotification(`🚨 DİKKAT: Yabancı Dimitri seni cinayetle suçladı! Köy Asayişi %40'a KİLİTLENDİ!`, 'alert');
    return outcome;
  }

  handlePlayerMartyrdom() {
    this.isBattleActive = false;
    gameState.triggerMartyrdom();
  }

  handleBattleDefeat() {
    this.isBattleActive = false;
    gameState.triggerBattleDefeat(this.currentBattleType === 'ankara' ? 'Ankara' : 'Niğbolu');
  }
}

export const campaignBattleSystem = new CampaignBattleSystem();
