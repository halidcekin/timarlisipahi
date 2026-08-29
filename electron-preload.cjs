/**
 * Mülk-i Osmanî - Electron Preload Script
 * Steamworks SDK Güvenli Köprüsü
 */
const { contextBridge } = require('electron');

let steamClient = null;
try {
  const steamworks = require('steamworks.js');
  steamClient = steamworks.init(480); // 480: Spacewar Test AppID
  console.log('Steamworks Preload: SDK başlatıldı!');
} catch (e) {
  // Çevrimdışı / Steam kapalıyken sessizce geç
}

contextBridge.exposeInMainWorld('steamworks', steamClient ? {
  appId: 480,
  achievement: {
    activate: (name) => steamClient.achievement.activate(name),
    isActivated: (name) => steamClient.achievement.isActivated(name),
    clear: (name) => steamClient.achievement.clear(name)
  },
  richPresence: {
    set: (key, val) => steamClient.richPresence.set(key, val)
  },
  cloud: {
    write: (name, data) => steamClient.cloud.write(name, data),
    read: (name) => steamClient.cloud.read(name),
    has: (name) => steamClient.cloud.has(name)
  },
  overlay: {
    activate: (dialog) => steamClient.overlay.activate(dialog)
  }
} : null);
