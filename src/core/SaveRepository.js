/**
 * Mülk-i Osmanî - Kayıt Deposu ve Platform Adaptörü (SaveRepository)
 * 
 * Masaüstü (Electron IPC / userData) ve Tarayıcı (IndexedDB / memory) adaptörleri sağlar.
 * Kanonik slotlar: auto_a, auto_b, chapter, manual
 */

import { SaveMigration } from './SaveMigration.js';

export class SaveRepository {
  constructor(options = {}) {
    this.dbName = options.dbName || 'MulkIOsmaniDB';
    this.dbVersion = 2;
    this.storeName = 'saves';
    this.memoryStore = new Map(); // Node.js test & fallback
    this.db = null;
    this.isNode = typeof window === 'undefined';
  }

  static get VALID_SLOTS() {
    return ['auto_a', 'auto_b', 'chapter', 'manual'];
  }

  async init() {
    if (this.isNode) return this;

    // Electron masaüstü köprüsü varsa kontrol et
    if (window.desktopRuntime?.save) {
      return this;
    }

    // Tarayıcı ortamında IndexedDB başlat
    if (typeof indexedDB !== 'undefined') {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'slot' });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this);
        };

        request.onerror = (event) => {
          console.warn('[SaveRepository] IndexedDB açılamadı, bellek moduna geçiliyor:', event.target.error);
          resolve(this);
        };
      });
    }

    return this;
  }

  async saveSlot(slotName, dataEnvelope) {
    if (!SaveRepository.VALID_SLOTS.includes(slotName)) {
      throw new Error(`Geçersiz kayıt slotu: ${slotName}`);
    }

    const migratedEnvelope = SaveMigration.migrate(dataEnvelope);
    migratedEnvelope.meta.slot = slotName;
    migratedEnvelope.meta.updatedAtUtc = new Date().toISOString();

    // 1. Electron IPC Adaptörü
    if (typeof window !== 'undefined' && window.desktopRuntime?.save?.write) {
      return await window.desktopRuntime.save.write(slotName, migratedEnvelope);
    }

    // 2. IndexedDB Adaptörü
    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction([this.storeName], 'readwrite');
          const store = tx.objectStore(this.storeName);
          const payload = { slot: slotName, ...migratedEnvelope };
          const req = store.put(payload);

          req.onsuccess = () => resolve(migratedEnvelope);
          req.onerror = (e) => reject(e.target.error);
        } catch (err) {
          this.memoryStore.set(slotName, migratedEnvelope);
          resolve(migratedEnvelope);
        }
      });
    }

    // 3. Fallback / Test Bellek Deposu
    this.memoryStore.set(slotName, migratedEnvelope);
    return migratedEnvelope;
  }

  async loadSlot(slotName) {
    if (!SaveRepository.VALID_SLOTS.includes(slotName)) {
      throw new Error(`Geçersiz kayıt slotu: ${slotName}`);
    }

    // 1. Electron IPC Adaptörü
    if (typeof window !== 'undefined' && window.desktopRuntime?.save?.read) {
      const raw = await window.desktopRuntime.save.read(slotName);
      return raw ? SaveMigration.migrate(raw) : null;
    }

    // 2. IndexedDB Adaptörü
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction([this.storeName], 'readonly');
          const store = tx.objectStore(this.storeName);
          const req = store.get(slotName);

          req.onsuccess = () => {
            if (req.result) {
              try {
                resolve(SaveMigration.migrate(req.result));
              } catch (e) {
                console.error('[SaveRepository] Kayıt paketi migrasyon hatası:', e);
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        } catch (err) {
          const mem = this.memoryStore.get(slotName);
          resolve(mem ? SaveMigration.migrate(mem) : null);
        }
      });
    }

    // 3. Fallback / Test Bellek Deposu
    const inMem = this.memoryStore.get(slotName);
    return inMem ? SaveMigration.migrate(inMem) : null;
  }

  async listSlots() {
    const slots = {};
    for (const slot of SaveRepository.VALID_SLOTS) {
      try {
        const item = await this.loadSlot(slot);
        if (item) {
          slots[slot] = {
            slot,
            version: item.meta.gameVersion,
            schemaVersion: item.meta.saveSchemaVersion,
            updatedAtUtc: item.meta.updatedAtUtc,
            dayCount: item.state?.game?.time?.dayCount || 1,
            sipahiName: item.state?.game?.sipahi?.name || 'Gazi Sipahi',
            akce: item.state?.game?.timar?.akce || 0
          };
        }
      } catch (e) {}
    }
    return slots;
  }

  async deleteSlot(slotName) {
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.delete(slotName);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }
    this.memoryStore.delete(slotName);
    return true;
  }
}

export const saveRepository = new SaveRepository();
