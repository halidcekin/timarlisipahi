/**
 * Mülk-i Osmanî - Kayıt Verisi Dönüştürme & Migrasyon Motoru (SaveMigration)
 * 
 * Saf (pure), idempotent fonksiyonlarla eski kayıt sürümlerini v1 şemasına göçürür.
 * Desteklenen sürümler:
 * - 'legacy-1.2.0': Eski SaveManager formatı
 * - 1: Kanonik V1 Zarfı
 */

export class SaveMigration {
  static get CURRENT_SCHEMA_VERSION() {
    return 1;
  }

  // Basit ve hızlı string hash (Checksum doğrulaması)
  static computeChecksum(dataObj) {
    const jsonStr = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj);
    let hash = 5381;
    for (let i = 0; i < jsonStr.length; i++) {
      hash = ((hash << 5) + hash) + jsonStr.charCodeAt(i);
      hash = hash & hash;
    }
    return `chk_${(hash >>> 0).toString(16)}`;
  }

  /**
   * Herhangi bir kayıt nesnesini V1 formatına valide ve normalize eder.
   */
  static migrate(rawRecord) {
    if (!rawRecord || typeof rawRecord !== 'object') {
      throw new Error('Geçersiz kayıt verisi: Kayıt bir nesne olmalıdır.');
    }

    // Durum 1: Zaten V1 şeması mı?
    if (rawRecord.meta && rawRecord.meta.saveSchemaVersion === 1) {
      return this._validateV1(rawRecord);
    }

    // Durum 2: Gelecek sürüm mü?
    if (rawRecord.meta && rawRecord.meta.saveSchemaVersion > this.CURRENT_SCHEMA_VERSION) {
      throw new Error(`Daha yeni bir oyun sürümüne ait kayıt tespit edildi (v${rawRecord.meta.saveSchemaVersion}).`);
    }

    // Durum 3: Legacy format (version: '1.2.0' veya doğrudan state)
    return this._migrateLegacyToV1(rawRecord);
  }

  static _migrateLegacyToV1(legacy) {
    const nowUtc = new Date().toISOString();
    
    // Eski alanları toparla
    const sipahi = legacy.sipahi || {};
    const timar = legacy.timar || {};
    const reputation = legacy.reputation || {
      reayaTrust: 75,
      sancakReputation: 60,
      squadLoyalty: 80
    };
    const factions = legacy.factions || {
      ulema: 85,
      ahiler: 70,
      reaya: 75
    };
    const military = legacy.military || {
      cebeluCount: 1,
      cebeluRequired: 1,
      cebeluExperience: 40,
      veteranSoldiers: ['Toy Cebelü Ali']
    };

    const time = legacy.time || {
      dayCount: legacy.daysPassed || 1,
      totalMinutes: (legacy.daysPassed || 1) * 1440
    };

    const v1State = {
      game: {
        sipahi,
        timar,
        reputation,
        factions,
        military,
        time,
        aliStatus: legacy.aliStatus || { legSevered: false, treated: false, daysLeft: 3 },
        murderCase: legacy.murderCase || null,
        flags: legacy.flags || {}
      },
      player: {
        position: legacy.playerPos || { x: 0, y: 1.8, z: 0 },
        yaw: legacy.playerYaw || 0,
        cameraMode: legacy.cameraMode || 'thirdPerson',
        isRiding: !!sipahi.isRiding
      },
      quests: {
        byId: legacy.quests || {}
      },
      systems: {
        petition: {
          activeConstructions: legacy.activeConstructions || legacy.constructions || [],
          lastPetitionId: legacy.lastPetitionId || null,
          hasPendingMessenger: !!legacy.hasPendingMessenger
        },
        campaign: legacy.activeCampaign || {
          type: null,
          phase: null,
          score: 0,
          losses: 0,
          isActive: false
        },
        codex: legacy.codex || {},
        news: legacy.news || {},
        prayer: legacy.prayer || {},
        humor: legacy.humor || {}
      },
      world: {
        defeatedEnemyIds: legacy.defeatedEnemyIds || [],
        discoveredIds: legacy.discoveredIds || [],
        constructionIds: legacy.constructionIds || []
      },
      rng: legacy.rng || {
        simulationState: null,
        contentState: null
      },
      appliedEffectIds: legacy.appliedEffectIds || [],
      expansions: {
        post1396: legacy.expansions?.post1396 || {}
      }
    };

    const v1Envelope = {
      meta: {
        saveSchemaVersion: 1,
        gameVersion: legacy.gameVersion || '1.0.0',
        migratedFrom: legacy.version || 'legacy-1.2.0',
        slot: legacy.slot || 'manual',
        revision: legacy.revision || 1,
        createdAtUtc: legacy.createdAtUtc || nowUtc,
        updatedAtUtc: nowUtc,
        simulationSeed: legacy.simulationSeed || 'nigbolu_1396',
        checksum: ''
      },
      state: v1State
    };

    v1Envelope.meta.checksum = this.computeChecksum(v1Envelope.state);
    return v1Envelope;
  }

  static _validateV1(v1Envelope) {
    if (!v1Envelope.state || !v1Envelope.meta) {
      throw new Error('Bozuk V1 kayıt paketi: state veya meta eksik.');
    }
    // Checksum kontrolü
    const computed = this.computeChecksum(v1Envelope.state);
    if (v1Envelope.meta.checksum && v1Envelope.meta.checksum !== computed) {
      console.warn(`[SaveMigration] Checksum uyuşmazlığı (Beklenen: ${v1Envelope.meta.checksum}, Hesaplanan: ${computed}). Kayıt yine de kurtarılıyor.`);
    }
    return v1Envelope;
  }
}
