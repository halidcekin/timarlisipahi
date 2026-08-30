/**
 * Mülk-i Osmanî - Deterministik Zaman Yönetim Servisi (ClockService)
 * 
 * Oyun dünyasındaki tek zaman otoritesidir.
 * 1 gerçek saniye = 1 oyun dakikası (varsayılan: daySpeed = 1/60)
 * 1 gün = 1440 oyun dakikası = 24 saat
 */

export class ClockService {
  constructor(options = {}) {
    this.totalMinutes = options.initialMinutes || 360; // 06:00 (Sabah uyanış)
    this.timeScale = 1.0;
    this.pauseReasons = new Set();
    this.listeners = {
      minute: new Set(),
      hour: new Set(),
      day: new Set()
    };
    this.processedEvents = new Set(); // Idempotent event ledger
  }

  // 0.0 - 24.0 saat cinsinden günün saati
  get dayTimeHours() {
    const minutesInDay = this.totalMinutes % 1440;
    return minutesInDay / 60;
  }

  // Toplam geçen gün sayısı (1'den başlar)
  get dayCount() {
    return Math.floor(this.totalMinutes / 1440) + 1;
  }

  get isPaused() {
    return this.pauseReasons.size > 0;
  }

  getPauseReasons() {
    return Array.from(this.pauseReasons);
  }

  pause(reason = 'default') {
    this.pauseReasons.add(reason);
  }

  resume(reason = 'default') {
    this.pauseReasons.delete(reason);
  }

  clearAllPauses() {
    this.pauseReasons.clear();
  }

  setTimeScale(scale = 1.0) {
    this.timeScale = Math.max(0, scale);
  }

  // Delta zaman (gerçek saniye) ile ilerlet
  update(deltaSeconds) {
    if (this.isPaused || deltaSeconds <= 0) return;

    // 1 gerçek saniye = 1 oyun dakikası * timeScale
    const minutesToAdd = deltaSeconds * this.timeScale;
    this.advanceMinutes(minutesToAdd, { reason: 'tick' });
  }

  advanceMinutes(amount, context = {}) {
    if (amount <= 0) return;

    if (context.eventId) {
      if (this.processedEvents.has(context.eventId)) {
        return; // Idempotent: daha önce işlenmiş
      }
      this.processedEvents.add(context.eventId);
    }

    const prevMinutes = Math.floor(this.totalMinutes);
    const prevHour = Math.floor(this.totalMinutes / 60);
    const prevDay = this.dayCount;

    this.totalMinutes += amount;

    const currentMinutes = Math.floor(this.totalMinutes);
    const currentHour = Math.floor(this.totalMinutes / 60);
    const currentDay = this.dayCount;

    if (currentMinutes !== prevMinutes) {
      this._emit('minute', { totalMinutes: this.totalMinutes, dayTimeHours: this.dayTimeHours });
    }
    if (currentHour !== prevHour) {
      this._emit('hour', { hour: currentHour % 24, dayCount: currentDay });
    }
    if (currentDay !== prevDay) {
      this._emit('day', { dayCount: currentDay, prevDay });
    }
  }

  // Günün belirli bir saatine atla (ör. 06:00 uyanış)
  advanceToHour(targetHour, context = {}) {
    const currentHourInDay = this.dayTimeHours;
    let hoursDiff = targetHour - currentHourInDay;
    if (hoursDiff <= 0) {
      hoursDiff += 24; // Ertesi günün hedefine atla
    }
    this.advanceMinutes(hoursDiff * 60, context);
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].add(callback);
    }
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[ClockService] Listener error for ${event}:`, e);
        }
      });
    }
  }

  getState() {
    return {
      totalMinutes: this.totalMinutes,
      timeScale: this.timeScale,
      processedEvents: Array.from(this.processedEvents)
    };
  }

  setState(savedState) {
    if (!savedState) return;
    this.totalMinutes = savedState.totalMinutes ?? 360;
    this.timeScale = savedState.timeScale ?? 1.0;
    this.pauseReasons.clear();
    this.processedEvents = new Set(savedState.processedEvents || []);
  }
}

export const clockService = new ClockService();
