/**
 * Mülk-i Osmanî - Mevsimsel ve Dönemsel Atmosfer Sistemi (SeasonalEvents)
 * 
 * V2 Devir Sözleşmesi Bölüm 10 ve 15 (G3 Standartları):
 * - 1396 Niğbolu Seferi takvimindeki dönemsel olaylar ve toplumsal atmosfer.
 * - Ramazan ayı (Hicri 798 Şaban/Ramazan) gece fenerleri, iftar sofraları ve yardımlaşma.
 * - Hiçbir ibadet/oruç zorlaması veya cezası yoktur; yalnızca görsel ve toplumsal bir atmosferdir.
 */

import { gameState } from '../core/GameState.js';

export class SeasonalEvents {
  constructor() {
    this.isRamadanActive = false;
  }

  /**
   * Gün sayısına göre dönemsel olayları değerlendirir
   * @param {number} dayCount - 1 Nisan 1396'dan itibaren geçen gün
   */
  updateDailySeason(dayCount) {
    // Gün 45 - 75 arası Hicri 798 Ramazan Ayı atmosferi
    if (dayCount >= 45 && dayCount <= 75) {
      if (!this.isRamadanActive) {
        this.isRamadanActive = true;
        gameState.addNotification('🌙 Mübarek Ramazan Hilali Görüldü. Köyde kandiller uyandırıldı, iftar sofraları kuruldu.', 'info');
      }
    } else {
      if (this.isRamadanActive) {
        this.isRamadanActive = false;
        gameState.addNotification('☀️ Ramazan Bayramı Sevinci: Köyde bayramlaşma yapıldı.', 'info');
      }
    }
  }

  isRamadan() {
    return this.isRamadanActive;
  }

  /**
   * Gece fenerleri veya iftar toplanması için ışık yoğunluğu çarpanı
   */
  getLanternIntensityMultiplier() {
    return this.isRamadanActive ? 1.8 : 1.0;
  }
}

export const seasonalEvents = new SeasonalEvents();
