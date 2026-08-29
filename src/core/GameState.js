/**
 * Mülk-i Osmanî - Oyun Durumu ve Veri Yönetimi
 * Yıldırım Bayezid dönemi tımarlı sipahi verileri ve prosedürel durumları yönetir.
 */

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
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

    const randomSipahi = sipahiNames[Math.floor(Math.random() * sipahiNames.length)];
    const randomTimar = timarNames[Math.floor(Math.random() * timarNames.length)];

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
      armorLevel: 1, // 1: Keçe ve Deri Zırh, 2: Örme Çelik Zırh, 3: Osmanlı Kazasker Zırhı
      horseType: 'Karayağız Anadolu Atı',
      reputation: 60 // Padişah ve Sancakbeyi nezdindeki itibar
    };

    // Tımar Arazisi & Ekonomi Durumu
    this.timar = {
      name: randomTimar.name,
      sancak: randomTimar.sancak,
      terrain: randomTimar.terrain,
      haneCount: 18 + Math.floor(Math.random() * 12), // 18-30 arası hane
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
        horses: 1
      }
    };

    // Tarih ve Zaman Sistemi
    this.time = {
      year: 1394,
      hijriYear: 796,
      season: 'Güz (Hasat Mevsimi)',
      seasonIndex: 2, // 0: Bahar, 1: Yaz, 2: Güz, 3: Kış
      dayTimeHours: 12.0, // 0 - 24 saat
      daySpeed: 0.05, // Zaman akış katsayısı
      dayCount: 1
    };

    // Aktif Ferman & Alternatif Tarih Seferleri
    this.activeCampaign = {
      id: 'nigbolu_1396',
      title: '1396 Niğbolu Haçlı Seferi Fermanı',
      year: 1396,
      desc: 'Kral Sigismund komutasındaki Haçlı ordusu Tuna kıyılarını kuşattı! Sultan Yıldırım Bayezid Han tımarlı sipahileri orduya çağırıyor.',
      reqCebelu: 1,
      rewardAkce: 1500,
      rewardRep: 25,
      isResolved: false
    };

    // NPC İlişki Puanları
    this.relations = {
      kethuda: 70, // Köy Kethüdası Koca Yakub
      imam: 80,    // Köy İmamı Molla Şemseddin
      demirci: 65, // Demirci Rüstem Usta
      neighbor: 50,// Komşu Sipahi Sungur Gazi
      cebelu: 85   // Sadık Çırak Ali
    };

    // Aktif Görev
    this.currentQuest = {
      id: 'inspect_timar',
      title: 'Tımar Teftişi ve Asayiş',
      desc: 'Köy kethüdası Koca Yakub veya Demirci Rüstem ile görüş, köyün asayişini sağla.',
      isCompleted: false
    };

    this.notifications = [];
  }

  addNotification(text, type = 'info') {
    this.notifications.push({
      id: Date.now() + Math.random(),
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
      // Günlük asayiş ve olay kontrolü
      if (this.time.dayCount % 10 === 0) {
        this.advanceSeason();
      }
    }
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
    } else if (this.time.year === 1398) {
      this.activeCampaign = {
        id: 'karaman_1398',
        title: '1398 Karamanoğlu Üzerine Sefer',
        year: 1398,
        desc: 'Anadolu Türk birliğini tehdit eden Karamanoğlu Alaeddin Bey\'e karşı Konya ve Larende seferi düzenleniyor.',
        reqCebelu: 2,
        rewardAkce: 2200,
        rewardRep: 25,
        isResolved: false
      };
      this.addNotification('📜 Anadolu Seferi Fermanı Ulaştı!', 'alert');
    } else if (this.time.year >= 1402) {
      this.activeCampaign = {
        id: 'ankara_1402',
        title: '1402 Ankara Meydan Muharebesi (Büyük Karşılaşma)',
        year: 1402,
        desc: 'Emir Timur yüz bin kişilik ordusu ve zırhlı filleriyle Çubuk Ovası\'na indi. Kader savaşı başlıyor!',
        reqCebelu: 2,
        rewardAkce: 3500,
        rewardRep: 50,
        isResolved: false
      };
      this.addNotification('⚠️ DİKKAT: Emir Timur orduları Çubuk Ovasında! Sultan Bayezid Han harp düzeni alıyor!', 'alert');
    }
  }
}

export const gameState = new GameState();
