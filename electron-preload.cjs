/**
 * Mülk-i Osmanî - Electron Preload Script
 * V2 Devir Sözleşmesi Güvenlik Köprüsü (G0-08):
 * - desktopRuntime.save (slot tabanlı güvenli okuma/yazma)
 * - desktopRuntime.steam (güvenli no-op / steamworks desteği)
 * - desktopRuntime.window (tam ekran kontrolü)
 */
const { contextBridge, ipcRenderer } = require('electron');

let steamClient = null;
try {
  const steamworks = require('steamworks.js');
  steamClient = steamworks.init(480);
  console.log('[Steamworks Preload] SDK başarıyla bağlandı.');
} catch (e) {
  // Steam kapalıyken veya çevrimdışıyken güvenle geç
}

// Masaüstü Entegrasyon Köprüsü
contextBridge.exposeInMainWorld('desktopRuntime', {
  getInfo: () => ({
    platform: process.platform,
    isDesktop: true,
    hasSteam: !!steamClient
  }),

  // Slot Tabanlı Kayıt IPC Köprüsü
  save: {
    write: (slot, data) => ipcRenderer.invoke('save:write', { slot, data }),
    read: (slot) => ipcRenderer.invoke('save:read', slot),
    list: () => ipcRenderer.invoke('save:list')
  },

  // Steamworks Köprüsü
  steam: {
    getStatus: () => ({ isConnected: !!steamClient }),
    unlockAchievement: (id) => {
      if (steamClient?.achievement?.activate) {
        steamClient.achievement.activate(id);
      }
    },
    setRichPresence: (key, val) => {
      if (steamClient?.richPresence?.set) {
        steamClient.richPresence.set(key, val);
      }
    }
  },

  // Pencere & Ekran Kontrolü
  window: {
    setFullscreen: (enabled) => {
      // IPC ile genişletilebilir
    }
  }
});

// Geriye dönük uyumluluk için eski window.steamworks referansı
if (steamClient) {
  contextBridge.exposeInMainWorld('steamworks', {
    appId: 480,
    achievement: {
      activate: (name) => steamClient.achievement.activate(name),
      isActivated: (name) => steamClient.achievement.isActivated(name),
      clear: (name) => steamClient.achievement.clear(name)
    },
    richPresence: {
      set: (key, val) => steamClient.richPresence.set(key, val)
    }
  });
}
