/**
 * Mülk-i Osmanî - Ayarlar ve Erişilebilirlik Paneli (SettingsModal)
 * 
 * V2 Devir Sözleşmesi Bölüm 13 ve 15 (G5 Standartları):
 * - Erişilebilirlik: Reduced Motion, Büyük Altyazı Fontu, Kontrast, Tuş Kılavuzu.
 * - Ses ve Müzik kontrolleri.
 * - LocalStorage kalıcılığı ve Node.js/Test ortamı için güvenli SSR/isomorfik yapı.
 */

import { soundManager } from '../core/AudioManager.js';

export class SettingsModal {
  constructor() {
    this.settings = {
      reducedMotion: false,
      fontSize: 'normal', // 'normal', 'large', 'xlarge'
      masterVolume: 1.0,
      subtitles: true
    };

    this.loadSettings();
    this.applySettings();
  }

  loadSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('mulk_settings_v1');
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      }
    } catch (e) {}
  }

  saveSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mulk_settings_v1', JSON.stringify(this.settings));
      }
    } catch (e) {}
  }

  setReducedMotion(enabled) {
    this.settings.reducedMotion = !!enabled;
    this.applySettings();
    this.saveSettings();
  }

  setFontSize(size) {
    if (['normal', 'large', 'xlarge'].includes(size)) {
      this.settings.fontSize = size;
      this.applySettings();
      this.saveSettings();
    }
  }

  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1.0, volume));
    try {
      soundManager.setVolume(this.settings.masterVolume);
    } catch (e) {}
    this.saveSettings();
  }

  applySettings() {
    if (typeof document === 'undefined' || !document.body) return;

    // Reduced motion CSS sınıfı
    if (this.settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Font boyutu CSS sınıfı
    document.body.classList.remove('font-large', 'font-xlarge');
    if (this.settings.fontSize === 'large') {
      document.body.classList.add('font-large');
    } else if (this.settings.fontSize === 'xlarge') {
      document.body.classList.add('font-xlarge');
    }
  }

  getSettings() {
    return this.settings;
  }
}

export const settingsModal = new SettingsModal();
