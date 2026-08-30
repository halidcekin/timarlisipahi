/**
 * Mülk-i Osmanî - 1396 Sefer Havadisleri Sistemi (HistoricalNewsSystem)
 * 
 * V2 Devir Sözleşmesi & 03-tarih-egitimi.md:
 * - Çift anahtarlı (minDay + afterQuest) tarihsel olay akışı.
 * - Deterministik ve idempotent havadis yönetimi.
 */

import { HISTORICAL_NEWS } from '../data/HistoricalNews.js';
import { gameState } from '../core/GameState.js';
import { codexSystem } from './CodexSystem.js';
import { questSystem } from './QuestSystem.js';
import { soundManager } from '../core/AudioManager.js';

export class HistoricalNewsSystem {
  constructor() {
    this.newsList = HISTORICAL_NEWS;
    this.deliveredNewsIds = new Set();
  }

  checkDailyNews(dayCount) {
    const completedQuestIds = (questSystem.quests || [])
      .filter(q => q.status === 'completed')
      .map(q => q.id);

    for (const news of this.newsList) {
      if (this.deliveredNewsIds.has(news.id)) continue;

      // minDay kontrolü
      if (dayCount < news.minDay) continue;

      // afterQuest kapısı kontrolü
      if (news.afterQuest && !completedQuestIds.includes(news.afterQuest)) continue;

      // Havadisi ilet
      this.deliverNews(news);
    }
  }

  deliverNews(news) {
    this.deliveredNewsIds.add(news.id);

    const isAlert = news.channel === 'messenger' || news.channel === 'battle';
    const notifType = isAlert ? 'alert' : 'tarih';

    gameState.addNotification(news.text, notifType);

    if (isAlert) {
      try { soundManager.playWarHorn(); } catch (e) {}
    }

    // Varsa ilgili Menâkıbnâme maddelerinin kilidini aç
    if (Array.isArray(news.codexUnlocks)) {
      for (const codexId of news.codexUnlocks) {
        codexSystem.unlock(codexId);
      }
    }
  }

  serialize() {
    return Array.from(this.deliveredNewsIds);
  }

  deserialize(savedList) {
    this.deliveredNewsIds = new Set(savedList || []);
  }
}

export const historicalNewsSystem = new HistoricalNewsSystem();
