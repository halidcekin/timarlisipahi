/**
 * Mülk-i Osmanî - Menâkıbnâme (Kâtibin Defteri) Kodeks Sistemi
 * 
 * V2 Standartları & 03-tarih-egitimi.md:
 * - 40 maddelik tarihsel bilgi kartlarını yönetir.
 * - Idempotent kilit açma (unlock) ve kontrollü bildirim kuyruğu (Rate-limited).
 */

import { CODEX_ENTRIES } from '../data/CodexData.js';
import { gameState } from '../core/GameState.js';

export class CodexSystem {
  constructor() {
    this.entries = CODEX_ENTRIES;
    this.unlockedIds = new Set();
    this.notificationQueue = [];
    this.notifyCooldown = 0;

    // Otomatik açılan maddeleri yükle
    this.initAutoUnlocks();
  }

  initAutoUnlocks() {
    for (const entry of this.entries) {
      if (entry.unlock && entry.unlock.type === 'auto') {
        this.unlockedIds.add(entry.id);
      }
    }
  }

  /**
   * Madde kilidini açar (Idempotent)
   * @param {string} id - Madde ID'si
   * @returns {boolean} Yeni açıldıysa true
   */
  unlock(id) {
    if (!id || this.unlockedIds.has(id)) return false;

    const entry = this.getEntryById(id);
    if (!entry) return false;

    this.unlockedIds.add(id);
    this.notificationQueue.push(entry);
    return true;
  }

  unlockForQuest(questId) {
    for (const entry of this.entries) {
      if (entry.unlock && entry.unlock.type === `quest:${questId}`) {
        this.unlock(entry.id);
      }
    }
  }

  unlockForDialogue(dialogueId) {
    for (const entry of this.entries) {
      if (entry.unlock && entry.unlock.type === `dialogue:${dialogueId}`) {
        this.unlock(entry.id);
      }
    }
  }

  update(delta) {
    if (this.notifyCooldown > 0) {
      this.notifyCooldown -= delta;
    }

    // Bildirim kuyruğunu işle (10 saniye arayla tek bildirim)
    if (this.notifyCooldown <= 0 && this.notificationQueue.length > 0) {
      const nextEntry = this.notificationQueue.shift();
      this.notifyCooldown = 10.0; // 10 saniye bekleme süresi

      gameState.addNotification(
        `📜 Menâkıbnâme'ye yeni varak düştü: ${nextEntry.title} — [N] ile oku`,
        'tarih'
      );
    }
  }

  isUnlocked(id) {
    return this.unlockedIds.has(id);
  }

  getEntryById(id) {
    return this.entries.find(e => e.id === id) || null;
  }

  getEntriesByCategory(category) {
    if (!category || category === 'all') return this.entries;
    return this.entries.filter(e => e.category === category);
  }

  serialize() {
    return Array.from(this.unlockedIds);
  }

  deserialize(savedIds) {
    this.unlockedIds = new Set(savedIds || []);
    this.initAutoUnlocks();
  }
}

export const codexSystem = new CodexSystem();
