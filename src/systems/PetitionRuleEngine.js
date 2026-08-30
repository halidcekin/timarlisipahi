/**
 * Mülk-i Osmanî - Deterministik Arzuhal & Ferman Kural Motoru (PetitionRuleEngine)
 * 
 * V2 Devir Sözleşmesi Bölüm 12.3 Standartları:
 * - Runtime LLM/Gemini API bağımlılığı V1'de tamamen kaldırılmıştır.
 * - %100 Çevrimdışı, deterministik, uzman onaylı sabit hüküm ve skor motoru.
 * - Aynı gerekçe metni hem ağ açıkken hem kapalıyken aynı kanonik sonucu verir.
 */

import { gameState } from '../core/GameState.js';

export class PetitionRuleEngine {
  constructor() {
    this._cleanupLegacyKey();
  }

  _cleanupLegacyKey() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('gemini_api_key');
      }
    } catch (e) {}
  }

  /**
   * Sipahi'nin ret fermanını analiz ederek deterministik Kadı & Ahali Heyeti hükmü üretir.
   * @param {Object} petition - Arzuhal nesnesi
   * @param {string} reasonText - Sipahi'nin girdiği ferman / gerekçe metni
   * @returns {Object} { valid: boolean, score: number, verdictId: string, verdictText: string, moraleChange: number, trustChange: number }
   */
  evaluatePetitionRejection(petition, reasonText = '') {
    const raw = (reasonText || '').trim();

    // 1. Çok kısa veya anlamsız gerekçe
    if (raw.length < 6) {
      return {
        valid: false,
        score: 20,
        verdictId: 'verdict_empty_reason',
        verdictText: 'Kadı Naibi Hükmü: Sipahi Beyimiz meşru ve sarih bir sebep beyan etmeksizin ferman buyurmuştur. Ahali bu keyfi muameleden teessür duymuştur.',
        moraleChange: -10,
        trustChange: -5
      };
    }

    const lower = raw.toLocaleLowerCase('tr');

    // 2. Makul ve meşru kavram sözlüğü (Sefer, Gaza, Hazine, Cebelü, Öncelik)
    const validKeywords = [
      { key: 'sefer', weight: 25 },
      { key: 'gaza', weight: 20 },
      { key: 'cebelu', weight: 25 },
      { key: 'hazine', weight: 20 },
      { key: 'ordu', weight: 15 },
      { key: 'oncelik', weight: 15 },
      { key: 'akce', weight: 15 },
      { key: 'asayis', weight: 15 },
      { key: 'harami', weight: 15 },
      { key: 'muhafaza', weight: 15 },
      { key: 'ertele', weight: 10 },
      { key: 'masraf', weight: 10 },
      { key: 'muharebe', weight: 20 },
      { key: 'nigbolu', weight: 25 },
      { key: 'sultan', weight: 15 }
    ];

    let matchedScore = 40; // Temel beyan puanı
    let matchedCount = 0;

    for (const kw of validKeywords) {
      if (lower.includes(kw.key)) {
        matchedScore += kw.weight;
        matchedCount++;
      }
    }

    matchedScore = Math.min(100, matchedScore);

    // 3. Haklı / Meşru Karar (Skor >= 65)
    if (matchedScore >= 65) {
      let verdictText = `Kadı Naibi Hükmü: Sipahi Beyimizin fermanındaki gazâ hazırlığı ve dirlik önceliği mazereti şer'an ve örfen makul görülmüştür.`;
      if (lower.includes('sefer') || lower.includes('cebelu') || lower.includes('nigbolu')) {
        verdictText = `Kadı Naibi Hükmü: Beyimizin Rumeli gazâsı için cebelü ve ordu levazımını öne alması yerindedir. Ahali sabır ve rıza ile karşılamıştır.`;
      } else if (lower.includes('hazine') || lower.includes('akce')) {
        verdictText = `Kadı Naibi Hükmü: Tımar hazinesinin ihtiyat akçesi olarak korunması fermanı isabetlidir.`;
      }

      return {
        valid: true,
        score: matchedScore,
        verdictId: 'verdict_legitimate_military_priority',
        verdictText,
        moraleChange: 0,
        trustChange: +2
      };
    }

    // 4. Zayıf / Yetersiz Gerekçe
    return {
      valid: false,
      score: matchedScore,
      verdictId: 'verdict_weak_justification',
      verdictText: 'Kadı Naibi Hükmü: Ferman buyurulan gerekçe ahalinin acil ihtiyacını karşılamaya kâfi görülmemiştir; reaya arasında hoşnutsuzluk hâsıl olmuştur.',
      moraleChange: -6,
      trustChange: -3
    };
  }
}

export const petitionRuleEngine = new PetitionRuleEngine();
