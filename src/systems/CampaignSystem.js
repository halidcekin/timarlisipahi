/**
 * Mülk-i Osmanî - 5 Safhalı Niğbolu Seferi & Muharebe Motoru (CampaignSystem)
 * 
 * V2 Devir Sözleşmesi Bölüm 15 (G4 Standartları):
 * - 25 Eylül 1396 Niğbolu Meydan Muharebesi'nin beş tarihsel safhası.
 * - Köyde yapılan hazırlıkların (Supply readinessScore) savaşa doğrudan deterministik etkisi.
 * - Taktiksel sipahi komutları, safha checkpointleri ve adil sonuç değerlendirmesi.
 */

import { gameState } from '../core/GameState.js';
import { supplySystem } from './SupplySystem.js';
import { codexSystem } from './CodexSystem.js';
import { consequenceSystem } from './ConsequenceSystem.js';

export const BATTLE_PHASES = [
  {
    id: 1,
    key: 'phase_french_charge',
    name: '1. Safha: Fransız Şövalyelerinin Ağır Süvari Hücumu',
    desc: 'Korkusuz Jean komutasındaki kibirli Haçlı şövalyeleri zırhlı atlarıyla ovaya indi. Öncü Türk birliklerini ezmek için hızla ilerliyorlar.',
    objective: 'Kazık hattı gerisinde safları sıklaştır ve şövalyeleri tepenin ardına çek.',
    tacticalChoices: [
      { id: 'feigned_retreat', title: 'Kurt Kapanı (Sahte Ric\'at)', desc: 'Geri çekilip şövalyeleri kazık hattına ve gizli okçulara doğru çek.', reqReadiness: 40 },
      { id: 'direct_clash', title: 'Ön Safta Göğüs Göğüse Karşıla', desc: 'Şövalyeleri doğrudan mızraklarla durdurmaya çalış.', reqReadiness: 75 }
    ]
  },
  {
    id: 2,
    key: 'phase_stake_line',
    name: '2. Safha: Kazık Hattı & Türk Okçuları',
    desc: 'Atları kazıklara takılan Fransız şövalyeleri atlarından inip yaya olarak tepeye tırmanmaya başladı. Okçularımız yay geriyor.',
    objective: 'Ok yağmuru ile şövalyelerin zırhlarını yıprat ve düzenlerini boz.',
    tacticalChoices: [
      { id: 'volley_fire', title: 'Kademe Kademe Ok Yağmuru', desc: 'Sürekli yay gerip zırhsız açık noktaları hedef al.', reqReadiness: 50 },
      { id: 'infantry_counter', title: 'Azap ve Piyadeleri İleri Sür', desc: 'Yorgun şövalyeleri kılıç ve gürzlerle karşıla.', reqReadiness: 65 }
    ]
  },
  {
    id: 3,
    key: 'phase_flank_encirclement',
    name: '3. Safha: Tımarlı Sipahilerin Yanlardan Kuşatması',
    desc: 'Tepeyi aştığını sanan Haçlılar, karşılarında taze ve düzenli Tımarlı Sipahi sancaklarını gördü! Yan kanat hücumu vakti!',
    objective: 'Cebelülerinle birlikte sol kanattan düşman arkasına sark ve çemberi daralt.',
    tacticalChoices: [
      { id: 'flank_pincer', title: 'Hilal Kuşatması & Çifte Kıskaç', desc: 'Sol ve sağ kanattan düşman arkasını kapat.', reqReadiness: 60 },
      { id: 'headon_charge', title: 'Doğrudan Merkez Yarma Hücumu', desc: 'Kılıç çekip düşman sancağına doğru hücuma kalk.', reqReadiness: 70 }
    ]
  },
  {
    id: 4,
    key: 'phase_bayezid_counter',
    name: '4. Safha: Sultan Yıldırım Bayezid & Kapıkulu Karşı Taarruzu',
    desc: 'Sultan Yıldırım Bayezid Han ve Yeniçeriler tepe ardından yıldırım gibi ovaya indi! Kral Sigismund\'un Macar ordusu paniğe kapıldı.',
    objective: 'Sultan\'ın sancağı altında son meydan hücumuna katıl.',
    tacticalChoices: [
      { id: 'support_sultan', title: 'Sultanın Yanında Saf Tut', desc: 'Padişah sancağını koruyarak düşman merkezini dağıt.', reqReadiness: 55 },
      { id: 'pursue_retreat', title: 'Kaçan Şövalye Birliklerini Kuşat', desc: 'Tuna nehrine doğru kaçan düşman süvarilerini engelle.', reqReadiness: 65 }
    ]
  },
  {
    id: 5,
    key: 'phase_victory_liberation',
    name: '5. Safha: Zafer & Niğbolu Kalesinin Kurtuluşu',
    desc: 'Haçlı ordusu tamamen dağıldı. Kale kumandanı Doğan Bey ve kahraman muhafızlar Niğbolu surlarından zafer nidalarıyla indi!',
    objective: 'Gaza zaferini tebrik et, şehitleri hayırla yad eyle ve sancağını Niğbolu burcuna dik.',
    tacticalChoices: [
      { id: 'dignified_triumph', title: 'Şükür ve Adaletle Kaleyi Teslim Al', desc: 'Esirlere ferman gereği adaletle muamele et, yaralı cebelüleri tedavi et.', reqReadiness: 0 }
    ]
  }
];

export class CampaignSystem {
  constructor() {
    this.currentPhaseIndex = 0; // 0..4
    this.phaseResults = [];     // Her safhanın başarı/puan kaydı
    this.isCampaignActive = false;
    this.isVictory = false;
  }

  startCampaign() {
    this.currentPhaseIndex = 0;
    this.phaseResults = [];
    this.isCampaignActive = true;
    this.isVictory = false;
    gameState.addNotification('🚩 1396 NİĞBOLU SEFERİ BAŞLADI: Tuna Boyunda Saf Tutuldu!', 'alert');
    return this.getCurrentPhase();
  }

  getCurrentPhase() {
    if (!this.isCampaignActive) return null;
    return BATTLE_PHASES[this.currentPhaseIndex] || null;
  }

  /**
   * Oyuncunun seçtiği taktik tercihi değerlendirir
   */
  executeTacticalChoice(choiceId) {
    const phase = this.getCurrentPhase();
    if (!phase) return { success: false, reason: 'Aktif safha yok' };

    const choice = phase.tacticalChoices.find(c => c.id === choiceId) || phase.tacticalChoices[0];
    const readiness = supplySystem.calculateReadinessScore();

    // Başarı kontrolü: Hazırlık puanı gereksinimden yüksek veya yakın olmalı
    const isSuccess = (readiness + 20) >= choice.reqReadiness;
    const scoreEarned = isSuccess ? Math.round(readiness * 1.2) : Math.round(readiness * 0.6);

    const result = {
      phaseIndex: this.currentPhaseIndex + 1,
      phaseName: phase.name,
      choiceTitle: choice.title,
      isSuccess,
      score: scoreEarned,
      readiness
    };

    this.phaseResults.push(result);

    if (isSuccess) {
      gameState.addNotification(`⚔️ ${phase.name} safhasında taktik başarı sağlandı! (+${scoreEarned} Şan)`, 'success');
    } else {
      gameState.addNotification(`⚠️ ${phase.name} safhasında zorlanıldı; cebelüler fedakarca direndi.`, 'alert');
    }

    // Bir sonraki safhaya geç
    this.currentPhaseIndex++;

    if (this.currentPhaseIndex >= BATTLE_PHASES.length) {
      this.finishCampaign();
    }

    return result;
  }

  finishCampaign() {
    this.isCampaignActive = false;
    this.isVictory = true;

    // Kodeks maddelerini aç
    codexSystem.unlock('nigbolu');
    codexSystem.unlock('dogan_bey');
    codexSystem.unlock('hacli_bilesimi');
    codexSystem.unlock('esir_fidyesi');

    // Vakayinameye kaydet
    consequenceSystem.chronicle.push({
      day: gameState.time.dayCount,
      title: '1396 Niğbolu Meydan Muharebesi Zaferi',
      desc: 'Tımarlı Sipahiler ve Sultan Bayezid Han komutasındaki Osmanlı ordusu Haçlı ordusunu mağlup etti. Niğbolu Kalesi kurtarıldı.',
      date: '25 Eylül 1396 / H. 798'
    });

    gameState.modifySancakReputation(50);
    gameState.modifyReayaTrust(30);
    gameState.addNotification('🏆 BÜYÜK NİĞBOLU ZAFERİ KAZANILDI! Mülk-i Osmanî payidar oldu!', 'success');
  }

  serialize() {
    return {
      currentPhaseIndex: this.currentPhaseIndex,
      phaseResults: this.phaseResults,
      isCampaignActive: this.isCampaignActive,
      isVictory: this.isVictory
    };
  }

  deserialize(data) {
    if (!data) return;
    this.currentPhaseIndex = data.currentPhaseIndex || 0;
    this.phaseResults = data.phaseResults || [];
    this.isCampaignActive = data.isCampaignActive || false;
    this.isVictory = data.isVictory || false;
  }
}

export const campaignSystem = new CampaignSystem();
