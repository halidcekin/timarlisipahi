import { gameState } from './GameState.js';
import { questSystem } from '../systems/QuestSystem.js';

/**
 * SaveManager - IndexedDB ve LocalStorage Tabanlı Kalıcı Kayıt/Yükleme Yöneticisi
 * - Slotlar: 'auto', 'slot_1', 'slot_2', 'slot_3'
 * - WebGL & Electron Masaüstü ortamlarıyla %100 uyumlu
 */
export class SaveManager {
  constructor() {
    this.dbName = 'MulkIOsmaniDB';
    this.storeName = 'saveSlots';
    this.dbVersion = 1;
    this.isIndexedDBSupported = typeof indexedDB !== 'undefined';
  }

  /**
   * IndexedDB Veritabanını Başlatır
   */
  async getDB() {
    if (!this.isIndexedDBSupported) return null;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'slot' });
        }
      };

      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Mevcut Oyun Durumunu JSON Nesnesine Dönüştürür
   */
  serializeState() {
    return {
      version: '1.2.0',
      timestamp: Date.now(),
      dateString: new Date().toLocaleString('tr-TR'),
      sipahi: { ...gameState.sipahi },
      reputation: { ...gameState.reputation },
      factions: { ...gameState.factions },
      failState: { ...gameState.failState },
      timar: { ...gameState.timar },
      military: { ...gameState.military },
      time: { ...gameState.time },
      relations: { ...gameState.relations },
      daysPassed: gameState.daysPassed,
      quests: questSystem ? questSystem.serializeQuests() : []
    };
  }

  /**
   * Serileştirilmiş Durumu Oyun Motoruna Yükler
   */
  deserializeState(data) {
    if (!data) return false;

    if (data.sipahi) Object.assign(gameState.sipahi, data.sipahi);
    if (data.reputation) Object.assign(gameState.reputation, data.reputation);
    if (data.factions) Object.assign(gameState.factions, data.factions);
    if (data.failState) Object.assign(gameState.failState, data.failState);
    if (data.timar) Object.assign(gameState.timar, data.timar);
    if (data.military) Object.assign(gameState.military, data.military);
    if (data.time) Object.assign(gameState.time, data.time);
    if (data.relations) Object.assign(gameState.relations, data.relations);
    if (data.daysPassed !== undefined) gameState.daysPassed = data.daysPassed;

    if (questSystem && data.quests) {
      questSystem.deserializeQuests(data.quests);
    }

    gameState.addNotification('💾 Oyun Başarıyla Yüklendi!', 'success');
    return true;
  }

  /**
   * Oyunu Belirtilen Slota Kaydeder
   */
  async saveGame(slot = 'auto') {
    const saveData = {
      slot,
      data: this.serializeState()
    };

    try {
      if (this.isIndexedDBSupported) {
        const db = await this.getDB();
        if (db) {
          await new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.put(saveData);
            req.onsuccess = () => resolve(true);
            req.onerror = (e) => reject(e.target.error);
          });
        }
      }
      // Yedek olarak localStorage'a da yaz
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`mos_save_${slot}`, JSON.stringify(saveData));
      }
      gameState.addNotification(`💾 Kayıt Alındı: ${slot === 'auto' ? 'Otomatik Kayıt' : slot}`, 'info');
      return true;
    } catch (e) {
      console.warn('IndexedDB kayıt başarısız, LocalStorage deneniyor:', e);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`mos_save_${slot}`, JSON.stringify(saveData));
        return true;
      }
      return false;
    }
  }

  /**
   * Belirtilen Slottaki Oyunu Yükler
   */
  async loadGame(slot = 'auto') {
    try {
      let saveData = null;

      if (this.isIndexedDBSupported) {
        const db = await this.getDB();
        if (db) {
          saveData = await new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get(slot);
            req.onsuccess = () => resolve(req.result);
            req.onerror = (e) => reject(e.target.error);
          });
        }
      }

      if (!saveData && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(`mos_save_${slot}`);
        if (raw) saveData = JSON.parse(raw);
      }

      if (saveData && saveData.data) {
        return this.deserializeState(saveData.data);
      }
      return false;
    } catch (e) {
      console.error('Kayıt yükleme hatası:', e);
      return false;
    }
  }

  /**
   * Tüm Kayıt Slotlarının Başlık ve Tarihlerini Listeler
   */
  async listSaves() {
    const slots = ['auto', 'slot_1', 'slot_2', 'slot_3'];
    const results = [];

    for (const slot of slots) {
      let meta = null;
      try {
        if (this.isIndexedDBSupported) {
          const db = await this.getDB();
          if (db) {
            const row = await new Promise((res) => {
              const tx = db.transaction(this.storeName, 'readonly');
              const req = tx.objectStore(this.storeName).get(slot);
              req.onsuccess = () => res(req.result);
              req.onerror = () => res(null);
            });
            if (row && row.data) {
              meta = {
                slot,
                dateString: row.data.dateString,
                sipahiName: row.data.sipahi?.name,
                timarName: row.data.timar?.name,
                year: row.data.time?.year
              };
            }
          }
        }
        if (!meta && typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(`mos_save_${slot}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            meta = {
              slot,
              dateString: parsed.data?.dateString,
              sipahiName: parsed.data?.sipahi?.name,
              timarName: parsed.data?.timar?.name,
              year: parsed.data?.time?.year
            };
          }
        }
      } catch (e) {}

      results.push({ slot, exists: !!meta, meta });
    }

    return results;
  }
}

export const saveManager = new SaveManager();
