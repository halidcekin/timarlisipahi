import { gameState } from './GameState.js';
import { questSystem } from '../systems/QuestSystem.js';
import { saveRepository, SaveRepository } from './SaveRepository.js';
import { SaveMigration } from './SaveMigration.js';
import { randomService } from './RandomService.js';
import { clockService } from './ClockService.js';

/**
 * SaveManager - V1 Standartlarında Kalıcı Kayıt/Yükleme Yöneticisi
 * - Slotlar: 'auto_a', 'auto_b', 'chapter', 'manual' (eski slot_1/auto alias'ları desteklenir)
 * - SaveRepository üzerinden Web (IndexedDB) ve Masaüstü (Electron IPC) ile %100 uyumlu
 */
export class SaveManager {
  constructor() {
    this.repo = saveRepository;
    this.repo.init();
    this.currentAutoSlot = 'auto_a';
  }

  _mapSlot(slot) {
    if (slot === 'auto') return this.currentAutoSlot;
    if (slot === 'slot_1') return 'manual';
    if (slot === 'slot_2') return 'chapter';
    if (slot === 'slot_3') return 'auto_b';
    if (SaveRepository.VALID_SLOTS.includes(slot)) return slot;
    return 'manual';
  }

  /**
   * Mevcut Oyun Durumunu V1 Zarfına Serileştirir
   */
  serializeState(slot = 'manual') {
    const canonicalSlot = this._mapSlot(slot);
    const timeState = {
      dayCount: gameState.time?.dayCount || gameState.daysPassed || 1,
      seasonIndex: gameState.time?.seasonIndex || 0,
      seasonName: gameState.time?.seasonName || 'İlkbahar',
      year: gameState.time?.year || 1396,
      hicriYear: gameState.time?.hicriYear || 798,
      dayTimeHours: gameState.time?.dayTimeHours || clockService.dayTimeHours || 6.0,
      totalMinutes: clockService.totalMinutes || 360
    };

    const rawEnvelope = {
      meta: {
        saveSchemaVersion: 1,
        gameVersion: '1.0.0',
        slot: canonicalSlot,
        revision: Date.now(),
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        simulationSeed: randomService.masterSeed || 'nigbolu_1396',
        checksum: ''
      },
      state: {
        game: {
          sipahi: { ...gameState.sipahi },
          reputation: { ...gameState.reputation },
          factions: { ...gameState.factions },
          failState: { ...gameState.failState },
          timar: { ...gameState.timar },
          military: { ...gameState.military },
          time: timeState,
          aliStatus: { ...(gameState.aliStatus || { legSevered: false, treated: false, daysLeft: 3 }) },
          murderCase: gameState.murderCase || null,
          flags: { ...(gameState.flags || {}) }
        },
        player: {
          position: { x: 0, y: 1.8, z: 0 },
          yaw: 0,
          cameraMode: 'thirdPerson',
          isRiding: !!gameState.sipahi?.isRiding
        },
        quests: {
          byId: questSystem ? questSystem.serializeQuests() : []
        },
        systems: {
          petition: {
            activeConstructions: gameState.constructions || [],
            lastPetitionId: gameState.currentPetition?.id || null,
            hasPendingMessenger: !!gameState.hasPendingMessenger
          },
          campaign: {
            type: gameState.activeCampaign?.type || null,
            phase: gameState.activeCampaign?.phase || null,
            score: gameState.activeCampaign?.score || 0,
            losses: gameState.activeCampaign?.losses || 0,
            isActive: !!gameState.activeCampaign?.isActive
          },
          codex: {},
          news: {},
          prayer: {},
          humor: {}
        },
        world: {
          defeatedEnemyIds: [],
          discoveredIds: [],
          constructionIds: []
        },
        rng: randomService.getState(),
        appliedEffectIds: [],
        expansions: {
          post1396: {}
        }
      }
    };

    rawEnvelope.meta.checksum = SaveMigration.computeChecksum(rawEnvelope.state);
    return rawEnvelope;
  }

  /**
   * Serileştirilmiş Durumu Oyun Motoruna Yükler
   */
  deserializeState(envelope) {
    if (!envelope) return false;

    const validated = SaveMigration.migrate(envelope);
    const s = validated.state;

    if (s.game) {
      if (s.game.sipahi) Object.assign(gameState.sipahi, s.game.sipahi);
      if (s.game.reputation) Object.assign(gameState.reputation, s.game.reputation);
      if (s.game.factions) Object.assign(gameState.factions, s.game.factions);
      if (s.game.failState) Object.assign(gameState.failState, s.game.failState);
      if (s.game.timar) Object.assign(gameState.timar, s.game.timar);
      if (s.game.military) Object.assign(gameState.military, s.game.military);
      if (s.game.time) {
        Object.assign(gameState.time, s.game.time);
        gameState.daysPassed = s.game.time.dayCount || 1;
        if (s.game.time.totalMinutes !== undefined) {
          clockService.setState({ totalMinutes: s.game.time.totalMinutes });
        }
      }
      if (s.game.aliStatus) gameState.aliStatus = { ...s.game.aliStatus };
      if (s.game.flags) gameState.flags = { ...s.game.flags };
    }

    if (s.rng) {
      randomService.setState(s.rng);
    }

    if (questSystem && s.quests?.byId) {
      questSystem.deserializeQuests(s.quests.byId);
    }

    gameState.addNotification('💾 Oyun Başarıyla Yüklendi!', 'success');
    return true;
  }

  /**
   * Oyunu Belirtilen Slota Kaydeder
   */
  async saveGame(slot = 'auto_a') {
    try {
      const canonicalSlot = this._mapSlot(slot);
      const envelope = this.serializeState(canonicalSlot);
      await this.repo.saveSlot(canonicalSlot, envelope);

      // Otomatik kayıt slotunu sırayla değiştir (auto_a <-> auto_b)
      if (slot === 'auto' || slot === 'auto_a' || slot === 'auto_b') {
        this.currentAutoSlot = this.currentAutoSlot === 'auto_a' ? 'auto_b' : 'auto_a';
      }

      gameState.addNotification(`💾 Kayıt Alındı: ${canonicalSlot}`, 'info');
      return true;
    } catch (e) {
      console.error('[SaveManager] Kayıt başarısız:', e);
      return false;
    }
  }

  /**
   * Belirtilen Slottaki Oyunu Yükler
   */
  async loadGame(slot = 'auto_a') {
    try {
      const canonicalSlot = this._mapSlot(slot);
      const envelope = await this.repo.loadSlot(canonicalSlot);
      if (envelope) {
        return this.deserializeState(envelope);
      }
      return false;
    } catch (e) {
      console.error('[SaveManager] Kayıt yükleme hatası:', e);
      return false;
    }
  }

  /**
   * Tüm Kayıt Slotlarının Özetini Listeler
   */
  async listSaves() {
    const list = await this.repo.listSlots();
    const result = [];
    for (const slot of SaveRepository.VALID_SLOTS) {
      const info = list[slot];
      result.push({
        slot,
        exists: !!info,
        meta: info ? {
          slot,
          dateString: info.updatedAtUtc ? new Date(info.updatedAtUtc).toLocaleString('tr-TR') : '',
          sipahiName: info.sipahiName,
          dayCount: info.dayCount,
          akce: info.akce
        } : null
      });
    }
    return result;
  }
}

export const saveManager = new SaveManager();

