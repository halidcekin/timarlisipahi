/**
 * Mülk-i Osmanî - Atomik Efekt ve Durum İşleticisi (EffectRunner)
 * 
 * V2 Devir Sözleşmesi Bölüm 10.4 Standartları:
 * - İzinli effect enum'ları: modifyStat, advanceObjective, completeQuest, unlockContent, addItem, removeItem, setFlag
 * - transactionId ile exactly-once / idempotent yürütme
 * - Atomik: Herhangi bir preflight koşulu geçmezse state hiç değişmez
 */

import { gameState } from './GameState.js';
import { questSystem } from '../systems/QuestSystem.js';
import { logger } from './Logger.js';

export class EffectRunner {
  constructor() {
    this.appliedTransactions = new Set();
  }

  static get ALLOWED_EFFECT_TYPES() {
    return [
      'modifyStat',
      'advanceObjective',
      'completeQuest',
      'unlockContent',
      'addItem',
      'removeItem',
      'setFlag',
      'notification'
    ];
  }

  /**
   * Efekt listesini atomik bir işlem olarak uygular.
   * @param {string} transactionId - Benzersiz işlem ID'si (ör. 'dialogue:water:resolve')
   * @param {Array<Object>} effects - Uygulanacak efektler dizisi
   * @returns {Object} { ok: boolean, transactionId, applied: [], error: string|null }
   */
  runTransaction(transactionId, effects = []) {
    if (!transactionId || typeof transactionId !== 'string') {
      return { ok: false, transactionId, applied: [], error: 'Geçersiz transactionId' };
    }

    // 1. Idempotency kontrolü: Zaten uygulandıysa tekrar uygulama
    if (this.appliedTransactions.has(transactionId)) {
      return { ok: true, transactionId, applied: [], skipped: true, error: null };
    }

    if (!Array.isArray(effects)) {
      return { ok: false, transactionId, applied: [], error: 'Effects bir dizi olmalıdır' };
    }

    // 2. Preflight doğrulaması (Tüm efektlerin tipleri ve kaynak yeterliliği kontrol edilir)
    for (const eff of effects) {
      if (!eff.type || !EffectRunner.ALLOWED_EFFECT_TYPES.includes(eff.type)) {
        return { ok: false, transactionId, applied: [], error: `Yasaklı efekt tipi: ${eff.type}` };
      }

      // Akçe harcama kontrolü
      if (eff.type === 'modifyStat' && eff.stat === 'akce' && eff.value < 0) {
        if ((gameState.timar.akce + eff.value) < 0) {
          return { ok: false, transactionId, applied: [], error: 'Yetersiz akçe bakiyesi' };
        }
      }
    }

    // 3. Atomik Uygulama
    const appliedList = [];
    try {
      for (const eff of effects) {
        this._applySingleEffect(eff);
        appliedList.push(eff.type);
      }

      this.appliedTransactions.add(transactionId);
      return { ok: true, transactionId, applied: appliedList, error: null };
    } catch (err) {
      logger.error('EffectRunner execution error', err, { transactionId });
      return { ok: false, transactionId, applied: appliedList, error: err.message };
    }
  }

  _applySingleEffect(eff) {
    switch (eff.type) {
      case 'modifyStat':
        if (eff.stat === 'akce') {
          gameState.timar.akce = Math.max(0, gameState.timar.akce + eff.value);
        } else if (eff.stat === 'reayaTrust') {
          gameState.modifyReayaTrust(eff.value);
        } else if (eff.stat === 'sancakReputation') {
          gameState.modifySancakReputation(eff.value);
        } else if (eff.stat === 'squadLoyalty') {
          gameState.modifySquadLoyalty(eff.value);
        } else if (eff.stat === 'asayis') {
          gameState.timar.asayis = Math.max(0, Math.min(100, gameState.timar.asayis + eff.value));
        } else if (eff.stat?.startsWith('faction_')) {
          const fName = eff.stat.replace('faction_', '');
          gameState.modifyFaction(fName, eff.value);
        }
        break;

      case 'advanceObjective':
        if (questSystem && eff.questId) {
          questSystem.advanceObjective(eff.questId, eff.objectiveIndex ?? 0);
        }
        break;

      case 'completeQuest':
        if (questSystem && eff.questId) {
          questSystem.completeQuest(eff.questId);
        }
        break;

      case 'setFlag':
        if (eff.flagName) {
          if (!gameState.flags) gameState.flags = {};
          gameState.flags[eff.flagName] = eff.value ?? true;
        }
        break;

      case 'notification':
        if (eff.text) {
          gameState.addNotification(eff.text, eff.notificationType || 'info');
        }
        break;
    }
  }

  getState() {
    return Array.from(this.appliedTransactions);
  }

  setState(savedList) {
    this.appliedTransactions = new Set(savedList || []);
  }
}

export const effectRunner = new EffectRunner();
