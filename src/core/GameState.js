import { randomService } from './RandomService.js';
import { clockService } from './ClockService.js';

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.daysPassed = 1;
    this.currentPetition = null; // Aktif onay bekleyen arzuhal

    // Prosedürel İsim & Tımar Havuzu
    const sipahiNames = [
      'Hamzaoğlu Gazi Doğan',
      'Ertuğrul oğlu Süleyman Bey',
      'Timurtaşzade Ali Bey',
      'Kara Sungur Gazi',
      'Evrenosoğlu Yahşi Bey',
      'Balaban Gazi'
    ];

    const timarNames = [
      { name: 'Akçaoba Tımarı', sancak: 'Sancak-ı Hüdavendigâr (Bursa)', terrain: 'Yeşil Vadi & Buğdaylık' },
      { name: 'Gölbaşı Karyesi Tımarı', sancak: 'Sancak-ı Karesi (Balıkesir)', terrain: 'Göl Kıyısı & Meşelik' },
      { name: 'Kızılhisar Tımarı', sancak: 'Sancak-ı Germiyan (Kütahya)', terrain: 'Kayalık Tepe & Bağlık' },
      { name: 'Söğütcük Tımarı', sancak: 'Sancak-ı Sultanönü (Eskişehir)', terrain: 'Bozkır & Yaylak' }
    ];

    const randomSipahi = randomService.simulation.choice(sipahiNames) || sipahiNames[0];
    const randomTimar = randomService.simulation.choice(timarNames) || timarNames[0];

    // Temel Sipahi Profili
    this.sipahi = {
      name: randomSipahi,
      title: 'Tımarlı Sipahi',
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      isRiding: false,
      swordDrawn: true,
      isBlocking: false,
      swordLevel: 1, // 1: Düz Tımar Kılıcı, 2: Şam Çeliği Kılıç, 3: Murassa Gazi Kılıcı
      armorLevel: 1, // 1: Keçe ve Deri Zırh, 2: Örme Çelik Zırh, 3: Osmanlı Ağır Zırhı
      equippedWeapon: 'sword', // 'sword' (slashing), 'spear' (piercing), 'mace' (blunt)
      weaponType: 'slashing',
      armorType: 'leather', // 'cloth', 'leather', 'mail', 'plate'
      horseType: 'Karayağız Anadolu Atı',
      reputation: 60 // Geriye dönük uyumluluk için sancak itibarı alias'ı
    };

    // 3 Eksenli İtibar Sistemi (Aşama 1 Standardı)
    this.reputation = {
      reayaTrust: 75,       // Reaya Güveni (0-100) - Kritik Eşik: 15 (Çiftbozan riski)
      sancakReputation: 60, // Sancakbeyi ve Divan İtibarı (0-100)
      squadLoyalty: 80      // Cebelü ve Bölük Sadakati (0-100)
    };

    // Sosyal Fraksiyonlar & Dinamik Denge
    this.factions = {
      ulema: 85,  // Kadı & Din Alimleri (Hukuk, Adalet, Meşruiyet - Daima bilge & hayırhah)
      ahiler: 70, // Zanaatkarlar & Esnaf Locası (Demirci, Attar, Pazar)
      reaya: 75   // Köylüler & Çiftçiler (Tarımsal Üretim, Su arkları, Ambar)
    };

    // Erken Yenilgi (Fail-State)
    this.failState = {
      isGameOver: false,
      reason: null,
      title: null
    };

    // Tımar Arazisi & Ekonomi Durumu
    this.timar = {
      name: randomTimar.name,
      sancak: randomTimar.sancak,
      terrain: randomTimar.terrain,
      haneCount: 18 + Math.floor(Math.random() * 12), // 18-30 arası hane
      irgatCount: 8, // Köydeki boşta çalışan amele/işçi sayısı
      akce: 850 + Math.floor(Math.random() * 500),
      grain: 320 + Math.floor(Math.random() * 200),
      asayis: 80, // %
      morale: 75, // % Köylü hoşnutluğu
      annualIncome: 3600, // Yıllık hasılat (Akçe)
      taxCollectedThisYear: false,
      hasWaterMill: true,
      hasBlacksmith: true
    };

    // Askeri Yükümlülük (Cebelü Sistemi)
    // Kanun: Her 3000 akçe için 1 Cebelü mecburiyeti
    this.military = {
      cebeluCount: 1, // Mevcut hazır asker
      cebeluRequired: 1, // Kanunen gereken
      cebeluExperience: 40,
      veteranSoldiers: ['Toy Cebelü Ali'],
      equipmentStock: {
        swords: 2,
        shields: 2,
        bows: 1,
        maces: 1,
        horses: 1
      }
    };

    // Tarih ve Zaman Sistemi (1396 İlkbahar Niğbolu Hazırlık Takvimi)
    this.time = {
      year: 1396,
      hijriYear: 798,
      season: 'İlkbahar (Ekim Zamanı)',
      seasonIndex: 0, // 0: Bahar, 1: Yaz, 2: Güz, 3: Kış
      dayTimeHours: 8.0, // Sabah 08:00 başlangıç
      daySpeed: 0.003, // Gerçekçi ve keyifli zaman akış katsayısı
      dayCount: 1
    };

    // Gazi Cebelü Ali - Kopan Bacak & Hayatta Tutma Durumu
    this.aliStatus = {
      isWounded: false,
      legSevered: false,
      daysRemaining: 3,
      isSaved: false,
      isDead: false
    };

    // Gazi Sungur Bey Cinayet Soruşturması ve İftira Durumu
    this.murderCase = {
      isAccused: false,
      hasSungurDied: false,
      accuser: 'Yabancı Efendi Lucas (Haçlı Ajanı Dimitri)',
      evidence: {
        severedStrap: false, // Kesik Eğer Kolanı (Frenk çeliğiyle çentikli sabotaj)
        spyLetter: false,    // Venedik Dükası & Haçlı Casus Mektubu
        poisonNeedle: false  // Zehirli Eğer İğnesi
      },
      trialStatus: 'not_started', // 'not_started', 'investigating', 'in_court', 'acquitted', 'executed'
      isAsayisLocked: false,
      banditRaidsActive: false,
      banditsRepelled: 0,
      messengerNewsCount: 0
    };

    // Aktif Ferman & Niğbolu Kampanyası
    this.activeCampaign = {
      id: 'nigbolu_1396',
      title: '1396 Niğbolu Haçlı Seferi Fermanı',
      year: 1396,
      desc: 'Kral Sigismund komutasındaki Haçlı ordusu Tuna kıyılarını kuşattı! Sultan Yıldırım Bayezid Han tımarlı sipahileri orduya çağırıyor.',
      reqCebelu: 1,
      rewardAkce: 1800,
      rewardRep: 30,
      isResolved: false
    };

    // NPC İlişki Puanları
    this.relations = {
      kethuda: 70, // Köy Kethüdası Koca Yakub
      imam: 85,    // Köy İmamı ve Naibi Molla Şemseddin (Bilge & Adil)
      demirci: 65, // Demirci Rüstem Usta
      neighbor: 50,// Komşu Sipahi Sungur Gazi
      cebelu: 85   // Sadık Çırak Ali
    };

    // Aktif Görev Bilgisi (HUD & Event Sync)
    this.quest = {
      currentTitle: 'Tımar Teftişi ve Asayiş',
      currentDescription: 'Köy kethüdası Koca Yakub veya Demirci Rüstem ile görüş, köyün asayişini sağla.',
      objectives: ['Köy kethüdası Koca Yakub ile görüş'],
      targetPosition: null
    };

    this.currentQuest = {
      id: 'quest_inspect',
      title: 'Tımar Teftişi ve Asayiş',
      desc: 'Köy kethüdası Koca Yakub veya Demirci Rüstem ile görüş, köyün asayişini sağla.',
      isCompleted: false
    };

    this.notifications = [];
  }

  modifyAsayis(amount) {
    if (this.murderCase.isAsayisLocked) {
      this.reputation.asayis = 40;
      this.timar.order = 40;
      return;
    }
    this.reputation.asayis = Math.max(0, Math.min(100, (this.reputation.asayis || 70) + amount));
    this.timar.order = this.reputation.asayis;
  }

  hasSufficientEvidence() {
    return this.murderCase.evidence.severedStrap && this.murderCase.evidence.spyLetter;
  }

  modifyReayaTrust(amount) {
    this.reputation.reayaTrust = Math.max(0, Math.min(100, this.reputation.reayaTrust + amount));
    this.timar.morale = this.reputation.reayaTrust;
    this.checkCiftbozan();
  }

  modifySancakReputation(amount) {
    this.reputation.sancakReputation = Math.max(0, Math.min(100, this.reputation.sancakReputation + amount));
    this.sipahi.reputation = this.reputation.sancakReputation;
  }

  modifySquadLoyalty(amount) {
    this.reputation.squadLoyalty = Math.max(0, Math.min(100, this.reputation.squadLoyalty + amount));
  }

  modifyFaction(factionName, amount) {
    if (this.factions[factionName] !== undefined) {
      this.factions[factionName] = Math.max(0, Math.min(100, this.factions[factionName] + amount));
    }
  }

  checkCiftbozan() {
    if (this.reputation.reayaTrust <= 15 && !this.failState.isGameOver) {
      this.failState.isGameOver = true;
      this.failState.reason = 'ciftbozan';
      this.failState.title = 'FERMAN-I AZİL: ÇİFTBOZAN VAKASI';
      this.failState.desc = 'Reayanın güveni tükendi! Köylüler topraklarını terk edip şehirlere ve dağlara kaçtı (Çiftbozan). Üretim durduğu için Sancakbeyi fermanıyla tımar beratınız iptal edildi ve azledildiniz!';
      this.addNotification('⚠️ DİKKAT: Reaya toprağı terk etti! Tımar beratınız azledildi!', 'alert');
      return true;
    }
    return false;
  }

  addNotification(text, type = 'info') {
    if (!this._nextNotificationId) this._nextNotificationId = 1;
    this.notifications.push({
      id: this._nextNotificationId++,
      text,
      type,
      time: Date.now()
    });
    if (this.notifications.length > 5) {
      this.notifications.shift();
    }
  }

  updateTime(delta) {
    this.time.dayTimeHours += delta * this.time.daySpeed;
    if (this.time.dayTimeHours >= 24) {
      this.time.dayTimeHours -= 24;
      this.time.dayCount++;
      this.daysPassed++;

      // Gazi Cebelü Ali bacak bakım süresi takibi
      if (this.aliStatus.legSevered && !this.aliStatus.isSaved && !this.aliStatus.isDead) {
        this.aliStatus.daysRemaining--;
        if (this.aliStatus.daysRemaining > 0) {
          this.addNotification(`⚠️ DİKKAT: Gazi Ali'nin yarası iltihaplandı! Kalan mühlet: ${this.aliStatus.daysRemaining} gün.`, 'alert');
        } else {
          this.triggerAliDeathAndStoning();
        }
      }

      // Günlük asayiş ve olay kontrolü
      if (this.time.dayCount % 10 === 0) {
        this.advanceSeason();
      }
    }
  }

  triggerAliDeathAndStoning() {
    this.aliStatus.isDead = true;
    this.failState = {
      isGameOver: true,
      reason: 'stoning_linch',
      title: '🪨 KÖYLÜLER TARAFINDAN TAŞLANARAK LİNÇ EDİLDİN!',
      desc: 'Gaza meydanında senin canını kurtarmak için bacağını feda eden Sadık Cebelü Ali ihmal nedeniyle vefat etti. Ahali ve cebelü yoldaşları vefasızlığına isyan edip seni konak önünde taşlayarak linç etti.'
    };
    this.addNotification('💀 Sadık Cebelü Ali vefat etti! Ahali konağı bastı!', 'alert');
  }

  triggerBattleDeath() {
    this.failState = {
      isGameOver: true,
      reason: 'battle_death',
      title: '🚩 TUNA BOYUNDA ŞEHİT DÜŞTÜN!',
      desc: '1396 Niğbolu Meydan Muharebesi\'nde Haçlı ordusuna karşı gazâ ederken canını feda ettin. Şanın asırlarca yaşayacak.'
    };
    this.addNotification('🚩 Tuna boyunda muharebe vefatı vuku buldu...', 'alert');
  }

  triggerMartyrdom() {
    // V2-09 Geriye dönük uyumluluk alias'ı
    this.triggerBattleDeath();
    this.failState.reason = 'martyrdom'; // Legacy test uyumluluğu için
  }

  triggerTrialExecution() {
    this.murderCase.trialStatus = 'executed';
    this.failState = {
      isGameOver: true,
      reason: 'trial_execution',
      title: '⚖️ İFTİRA VE HAKSIZ AZİL / İDAM FERMANI!',
      desc: 'Şer\'i mahkemede Gazi Sungur Bey\'in atına kurulan tuzağı ve Frenk kumpasını ispatlayacak delil sunamadın. Ahali ve Kadı seni silah arkadaşını katletmekle suçlu buldu. Tımar beratın iptal edildi ve idama mahkûm edildin!'
    };
    this.addNotification('⚖️ Mahkeme aleyhine sonuçlandı! İdama mahkûm edildin!', 'alert');
  }

  triggerElephantMartyrdom() {
    this.failState = {
      isGameOver: true,
      reason: 'elephant_martyrdom',
      title: '🐘 1402 ANKARA SAVAŞI: TİMUR\'UN SAVAŞ FİLİ ALTINDA ŞEHADET!',
      desc: '1402 Çubuk Ovası\'nda Emir Timur\'un zırhlı Hint savaş fillerine karşı cansiperane hücuma kalktın. Devasa savaş filinin ayağı altında kalarak şanlı bir şekilde şehadet şerbetini içtin. Sultan Bayezid esir düştü, Osmanlı Fetret Devri\'ne girdi. Adın gaziler defterine altın harflerle yazıldı!'
    };
    this.addNotification('🐘 Savaş filinin ayağı altında şehit düştün...', 'alert');
  }

  triggerBattleDefeat(battleName = 'Niğbolu') {
    this.failState = {
      isGameOver: true,
      reason: 'battle_defeat',
      title: `⚔️ ${battleName.toUpperCase()} MUHAREBESİNDE MAĞLUBİYET!`,
      desc: `${battleName} meydanında düşman safları yarılamadı ve bölüğün dağıldı. Savaş hattında ağır yara aldın.`
    };
    this.addNotification(`⚠️ ${battleName} muharebesi kaybedildi!`, 'alert');
  }

  advanceSeason() {
    const seasons = ['İlkbahar (Ekim Zamanı)', 'Yaz (Güneşli)', 'Güz (Hasat Mevsimi)', 'Kış (Karlı ve Soğuk)'];
    this.time.seasonIndex = (this.time.seasonIndex + 1) % 4;
    this.time.season = seasons[this.time.seasonIndex];
    this.timar.taxCollectedThisYear = false;

    if (this.time.seasonIndex === 0) {
      this.time.year++;
      this.time.hijriYear++;
      this.addNotification(`Yeni Yıl Başladı: Miladi ${this.time.year} (Hicri ${this.time.hijriYear})`, 'info');
      this.checkHistoricalEvents();
    }
  }

  checkHistoricalEvents() {
    if (this.time.year === 1396) {
      this.activeCampaign = {
        id: 'nigbolu_1396',
        title: '1396 Niğbolu Haçlı Seferi',
        year: 1396,
        desc: 'Büyük Haçlı ordusu Niğbolu Kalesini kuşattı! Sultan Yıldırım Bayezid fırtına gibi Tuna boyuna ilerliyor.',
        reqCebelu: 1,
        rewardAkce: 1800,
        rewardRep: 30,
        isResolved: false
      };
      this.addNotification('📜 Sultan Yıldırım Bayezid Han\'dan Niğbolu Seferi Fermanı Geldi!', 'alert');
    }
  }
}

export const gameState = new GameState();
