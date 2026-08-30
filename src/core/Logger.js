/**
 * Mülk-i Osmanî - Güvenli ve Yapılandırılmış Logger Servisi
 * Hassas veri, API anahtarı veya save payload'ı loglamaz.
 * Rate-limited fingerprint mekanizmasıyla konsol taşmasını önler.
 */

export class Logger {
  constructor(options = {}) {
    this.subsystem = options.subsystem || 'App';
    this.minLevel = options.minLevel || 'info'; // 'debug' | 'info' | 'warn' | 'error'
    this.recentErrors = new Map(); // fingerprint -> timestamp
    this.rateLimitMs = 1000;
  }

  static get LEVELS() {
    return { debug: 0, info: 1, warn: 2, error: 3 };
  }

  shouldLog(level) {
    const current = Logger.LEVELS[this.minLevel] ?? 1;
    const target = Logger.LEVELS[level] ?? 1;
    return target >= current;
  }

  _format(level, event, context = {}) {
    const safeContext = { ...context };
    // Hassas veri temizliği
    delete safeContext.apiKey;
    delete safeContext.key;
    delete safeContext.password;
    delete safeContext.savePayload;

    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      subsystem: this.subsystem,
      event,
      ...safeContext
    };
  }

  debug(event, context) {
    if (!this.shouldLog('debug')) return;
    const payload = this._format('debug', event, context);
    console.debug(`[DEBUG][${this.subsystem}] ${event}`, context ? payload : '');
  }

  info(event, context) {
    if (!this.shouldLog('info')) return;
    const payload = this._format('info', event, context);
    console.info(`[INFO][${this.subsystem}] ${event}`, context ? payload : '');
  }

  warn(event, context) {
    if (!this.shouldLog('warn')) return;
    const payload = this._format('warn', event, context);
    console.warn(`[WARN][${this.subsystem}] ${event}`, context ? payload : '');
  }

  error(event, errorOrContext, context = {}) {
    if (!this.shouldLog('error')) return;

    // Rate-limiting by fingerprint
    const fingerprint = `${this.subsystem}:${event}:${errorOrContext?.message || ''}`;
    const now = Date.now();
    const lastLogged = this.recentErrors.get(fingerprint) || 0;
    if (now - lastLogged < this.rateLimitMs) {
      return; // Rate limited
    }
    this.recentErrors.set(fingerprint, now);

    const mergedContext = errorOrContext instanceof Error 
      ? { message: errorOrContext.message, stack: errorOrContext.stack, ...context }
      : { ...errorOrContext, ...context };

    const payload = this._format('error', event, mergedContext);
    console.error(`[ERROR][${this.subsystem}] ${event}`, payload);
  }

  createChild(subsystem) {
    return new Logger({
      subsystem: `${this.subsystem}:${subsystem}`,
      minLevel: this.minLevel
    });
  }
}

export const logger = new Logger({ subsystem: 'Engine' });
