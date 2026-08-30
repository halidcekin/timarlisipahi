/**
 * Mülk-i Osmanî - Gecikmeli Karar Sonuçları & Vakayiname (ConsequenceSystem)
 * 
 * V2 Devir Sözleşmesi Bölüm 15 (G3 Fazı & Gecikmeli Sonuç Standardı):
 * - Kararların anlık değil, 1-3 gün sonra köye ve dirlikteki hayata yansıması.
 * - Vakayiname (Tarih Günlüğü) ile oyuncunun eylemlerinin tarihsel hafızası.
 * - Idempotent ve deterministik sonuç yürütücüsü.
 */

import { effectRunner } from '../core/EffectRunner.js';
import { gameState } from '../core/GameState.js';
import { logger } from '../core/Logger.js';

export class ConsequenceSystem {
  constructor() {
    this.pendingConsequences = []; // { id, dueDay, title, desc, effects, transactionId }
    this.chronicle = [];           // { day, title, desc, outcome }
    this.executedIds = new Set();
  }

  /**
   * Gelecek bir gün için gecikmeli sonuç planlar
   * @param {Object} item - { id, dueDay, title, desc, effects }
   */
  scheduleConsequence(item) {
    if (!item || !item.id || !item.dueDay) return false;
    if (this.executedIds.has(item.id)) return false;

    // Aynı id zaten kuyrukta varsa mükerrer ekleme
    const exists = this.pendingConsequences.some(p => p.id === item.id);
    if (exists) return false;

    this.pendingConsequences.push({
      ...item,
      transactionId: `consequence:${item.id}`
    });
    return true;
  }

  /**
   * Gün değişiminde vadesi gelen sonuçları yürütür
   * @param {number} dayCount - Mevcut oyun günü (1-178)
   */
  checkDailyConsequences(dayCount) {
    for (let i = this.pendingConsequences.length - 1; i >= 0; i--) {
      const item = this.pendingConsequences[i];

      if (dayCount >= item.dueDay) {
        this.pendingConsequences.splice(i, 1);
        this.executeConsequence(item, dayCount);
      }
    }
  }

  executeConsequence(item, currentDay) {
    if (this.executedIds.has(item.id)) return;
    this.executedIds.add(item.id);

    // EffectRunner ile atomik uygulama
    if (Array.isArray(item.effects) && item.effects.length > 0) {
      effectRunner.runTransaction(item.transactionId, item.effects);
    }

    // Bildirim ver
    if (item.title) {
      gameState.addNotification(`📜 VAKAYİNAME: ${item.title}`, 'info');
    }

    // Vakayinameye kaydet
    this.chronicle.push({
      day: currentDay,
      title: item.title,
      desc: item.desc,
      date: `H. 798 / Gün ${currentDay}`
    });

    logger.info('Consequence executed', { id: item.id, day: currentDay });
  }

  getChronicle() {
    return this.chronicle;
  }

  serialize() {
    return {
      pending: this.pendingConsequences,
      chronicle: this.chronicle,
      executedIds: Array.from(this.executedIds)
    };
  }

  deserialize(data) {
    if (!data) return;
    this.pendingConsequences = data.pending || [];
    this.chronicle = data.chronicle || [];
    this.executedIds = new Set(data.executedIds || []);
  }
}

export const consequenceSystem = new ConsequenceSystem();
