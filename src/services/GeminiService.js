/**
 * GeminiService (LEGACY / DEPRECATED)
 * 
 * V2 Devir Sözleşmesi Bölüm 12.3:
 * V1'de Gemini servisi ve API key alanı kaldırılmış, yerini %100 çevrimdışı ve deterministik
 * PetitionRuleEngine almıştır. Bu dosya geriye dönük uyumluluk adına PetitionRuleEngine'e delege eder.
 */

import { petitionRuleEngine } from '../systems/PetitionRuleEngine.js';

export class GeminiService {
  constructor() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('gemini_api_key');
      }
    } catch (e) {}
  }

  setApiKey() {
    // API anahtarı V1'de kullanılmaz ve saklanmaz
  }

  async evaluateRejection(petition, reason) {
    const result = petitionRuleEngine.evaluatePetitionRejection(petition, reason);
    return {
      valid: result.valid,
      score: result.score,
      verdict: result.verdictText,
      moraleChange: result.moraleChange,
      isAi: false
    };
  }
}

export const geminiService = new GeminiService();
