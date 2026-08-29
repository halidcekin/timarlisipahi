/**
 * SteamManager - Steamworks SDK ve Masaüstü Entegrasyon Yöneticisi
 * Steam Başarımları (Achievements), Cloud Save, Rich Presence ve Overlay Desteği
 */
export class SteamManager {
  constructor() {
    this.isSteamInitialized = false;
    this.steamClient = null;
    this.appId = 480; // Steamworks Spacewar Test AppID veya Gerçek Oyun AppID

    // Başarım Tanımları (Steamworks Panelinde Eşleşecek ID'ler)
    this.achievements = {
      ACH_FIRST_INSPECT: { id: 'ACH_FIRST_INSPECT', title: 'İlk Ferman', desc: 'Köy kethüdası Koca Yakub ile ilk tımar teftişini tamamla.' },
      ACH_BLACKSMITH: { id: 'ACH_BLACKSMITH', title: 'Çelik Bilek', desc: 'Demirci Rüstem Usta\'nın atölyesine gir ve pusatını bile.' },
      ACH_CASTLE_DISCOVERY: { id: 'ACH_CASTLE_DISCOVERY', title: 'Hisar Muhafızı', desc: 'Sancak Kalesi\'ne at sür ve Dizdar Hamza Bey ile görüş.' },
      ACH_BANDIT_SLAYER: { id: 'ACH_BANDIT_SLAYER', title: 'Harami Avcısı', desc: 'Ormandaki eşkıya çetesini kılıçtan geçirip asayişi sağla.' },
      ACH_NIGBOLU_VICTORY: { id: 'ACH_NIGBOLU_VICTORY', title: 'Niğbolu Gazisi', desc: 'Sultan Bayezid ile Haçlı ordusuna karşı büyük zafer kazan.' },
      ACH_FIRST_CEBELU: { id: 'ACH_FIRST_CEBELU', title: 'Gaza Ereni', desc: 'İlk Cebelü süvarini tam teçhizat donatarak orduya kat.' },
      ACH_HORSE_MASTER: { id: 'ACH_HORSE_MASTER', title: 'Rüzgâr Kanatlı', desc: 'Savaş atına binip açık dünyada dörtnala sür.' },
      ACH_WEALTHY_SIPAHI: { id: 'ACH_WEALTHY_SIPAHI', title: 'Mülk Sahibi', desc: 'Tımar hazinesinde 2.500\'den fazla Akçe biriktir.' }
    };

    this.unlockedAchievements = new Set();
    this.init();
  }

  init() {
    // Electron veya Node ortamında Steamworks.js yüklü mü kontrol et
    if (typeof window !== 'undefined' && window.steamworks) {
      try {
        this.steamClient = window.steamworks;
        this.isSteamInitialized = true;
        console.log('✅ Steamworks SDK başarıyla bağlandı! AppID:', this.appId);
      } catch (err) {
        console.warn('Steamworks başlatılamadı, tarayıcı/çevrimdışı modda çalışılıyor:', err);
      }
    } else {
      console.log('ℹ️ Steamworks: Web/Simülasyon modunda çalışıyor (Tarayıcı ortamı).');
    }
  }

  /**
   * Başarım (Achievement) Kilidini Aç
   */
  unlockAchievement(achKey) {
    const ach = this.achievements[achKey];
    if (!ach) return;

    if (this.unlockedAchievements.has(achKey)) return;
    this.unlockedAchievements.add(achKey);

    if (this.isSteamInitialized && this.steamClient) {
      try {
        this.steamClient.achievement.activate(ach.id);
        console.log(`🏆 Steam Başarımı Açıldı: [${ach.title}]`);
      } catch (err) {
        console.error('Steam başarım hatası:', err);
      }
    }

    // Her iki ortamda da şık Steam Başarım Pop-up'ını göster
    this.showAchievementBanner(ach);
  }

  /**
   * Görsel Steam Başarım Pop-up Bildirimi
   */
  showAchievementBanner(ach) {
    if (typeof document === 'undefined') return;

    let banner = document.getElementById('steam-achievement-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'steam-achievement-banner';
      banner.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(135deg, rgba(22, 26, 33, 0.95), rgba(12, 15, 20, 0.98));
        border: 2px solid #d4af37;
        border-radius: 8px;
        padding: 14px 20px;
        color: #f5f5f5;
        font-family: 'Cinzel', serif, sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.35);
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 100000;
        transform: translateY(120px);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <div style="font-size: 32px; filter: drop-shadow(0 0 8px #d4af37);">🏆</div>
      <div>
        <div style="font-size: 11px; text-transform: uppercase; color: #d4af37; letter-spacing: 1.5px; font-weight: bold;">Steam Başarımı Açıldı!</div>
        <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 2px 0;">${ach.title}</div>
        <div style="font-size: 12px; color: #b8b8b8;">${ach.desc}</div>
      </div>
    `;

    // Göster
    requestAnimationFrame(() => {
      banner.style.transform = 'translateY(0)';
      banner.style.opacity = '1';
    });

    // 4.5 saniye sonra kapat
    setTimeout(() => {
      banner.style.transform = 'translateY(120px)';
      banner.style.opacity = '0';
    }, 4500);
  }

  /**
   * Steam Rich Presence (Arkadaş Listesinde Durum Gösterme)
   * Örn: "Akçaoba Köyü'nde Devriye Geziyor" veya "Sancak Kalesi'nde Talim Yapıyor"
   */
  setRichPresence(statusText) {
    if (this.isSteamInitialized && this.steamClient) {
      try {
        this.steamClient.richPresence.set('status', statusText);
        this.steamClient.richPresence.set('steam_display', '#StatusFull');
      } catch (e) {}
    }
  }

  /**
   * Steam Cloud Save (Bulut Kaydı)
   */
  saveToCloud(fileName, dataString) {
    if (this.isSteamInitialized && this.steamClient) {
      try {
        this.steamClient.cloud.write(fileName, dataString);
        console.log(`☁️ Steam Cloud Kaydedildi: ${fileName}`);
        return true;
      } catch (e) {
        console.error('Cloud save hatası:', e);
      }
    }
    // Fallback: LocalStorage
    localStorage.setItem(`mulk_osmani_${fileName}`, dataString);
    return true;
  }

  /**
   * Steam Cloud'dan Yükle
   */
  loadFromCloud(fileName) {
    if (this.isSteamInitialized && this.steamClient) {
      try {
        if (this.steamClient.cloud.has(fileName)) {
          return this.steamClient.cloud.read(fileName);
        }
      } catch (e) {}
    }
    return localStorage.getItem(`mulk_osmani_${fileName}`);
  }
}

// Global Singleton
export const steamManager = new SteamManager();
