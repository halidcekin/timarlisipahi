# ⚔️ Mülk-i Osmanî: Tımarlı Sipahi 3D

**14. Yüzyıl Osmanlı İmparatorluğu'nda geçen, Mount & Blade II: Bannerlord ilhamıyla geliştirilmiş açık dünya 3D aksiyon-RPG oyunu.**

Tımarlı Sipahi Gazi Murad Bey olarak Akçaoba köyünüzü yönetin, Sultan Yıldırım Bayezid Han'ın fermanıyla 1396 Niğbolu Haçlı Seferi'ne katılın ve Osmanlı'nın şanlı tarihini yaşayın.

---

## 🎮 Oynanış

### Açık Dünya Keşfi
- Prosedürel olarak üretilmiş Osmanlı köyü: Ulu Mescid, Şadırvan, Sipahi Konağı, Demirci Atölyesi, Köy Hanı, Pazar Çarşısı, Buğday Tarlaları, Yeldeğirmeni ve daha fazlası
- 1. ve 3. şahıs kamera geçişi (`V` tuşu)
- At binme ve süvari sistemi (`F` tuşu)

### 24 Saatlik Yaşayan Köy Simülasyonu
- **20+ köylü** bağımsız yapay zeka ile yaşar: uyur, çalışır, yemek yer, dolaşır
- Demirci Rüstem Usta örste çekiç döver, Çiftçi Hasan tarlada orak sallar, Saka İbrahim kuyudan su çeker
- Koyun sürüleri çayırda otlar, tavuklar meydanda dolaşır
- Gece-gündüz döngüsü tüm köylülerin rutinini etkiler

### Epik 11 Bölümlük Hikaye
1. Tımar Arazisi Teftişi & Kethüda Görüşmesi
2. Pusat ve Zırh Teftişi (Demirci Rüstem Usta)
3. Mescid Ziyareti & Hayır Dua (Molla Şemseddin)
4. Sadık Cebelü Ali'nin Talimi
5. Köy Hanında Şüpheli Bizans Casusu
6. Savaş İçin Şifalı Merhemler (Attar Mehmet Efendi)
7. Koca Dede'nin 1389 Kosova Hatırası
8. Sancak İttifakı & Gazi Sungur Bey
9. Orman Harami Baskını (Kılçık Cafer Çetesi)
10. Sancak Kalesi Teftişi & Dizdar Hamza Bey
11. **FİNAL:** Sultan Yıldırım Bayezid Han'ın Fermanı — 1396 Niğbolu Haçlı Seferi

### Tımar Yönetimi & Ekonomi
- Öşür gelirleri, cebelü askerleri, reaya morali ve köy asayişi
- Köylü arzuhalleri ve dilekçe sistemi
- Hızlı intikal (sancak haritası üzerinden)

---

## 🖥️ Teknik Altyapı

### Render Motoru
| Özellik | Detay |
|---|---|
| **3D Motor** | Three.js (WebGL 2.0) |
| **Post-Processing** | SSAO, Unreal Bloom, SMAA, Color Grading |
| **Aydınlatma** | PBR (Physically Based Rendering) + PMREM/IBL çevresel yansıma |
| **Gölgeler** | 4K PCF Soft Shadow Maps + Dinamik oyuncu takipli gölge kamerası |
| **Tone Mapping** | ACES Filmic |
| **Atmosfer** | 24 saatlik dinamik gökyüzü (şafak, öğle, gün batımı, yıldızlı gece) |
| **Parçacıklar** | Baca dumanı, demirci kıvılcımları, ateş közleri, atmosferik toz |
| **Meşale Sistemi** | Alev titremeli noktasal ışıklar (gece/gündüz dinamik) |

### Build Sistemi
| Araç | Versiyon |
|---|---|
| Vite | 5.x |
| Three.js | 0.160+ |
| Electron | 44.x (Masaüstü) |

---

## 🚀 Kurulum & Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu (tarayıcıda)
npm run dev

# Masaüstü uygulaması (Electron)
npm run desktop

# Production build
npm run build
```

---

## 🎮 Kontroller

| Tuş | Eylem |
|---|---|
| `W A S D` | Hareket |
| `Shift` | Koşma |
| `Space` | Zıplama |
| `Sol Tık` | Kılıç savurma |
| `Sağ Tık` | Kalkan savunması |
| `E` | NPC ile konuşma / Etkileşim |
| `F` | Ata bin / in |
| `V` | 1. / 3. şahıs kamera |
| `TAB` | Tımar Defteri |
| `J` | Görev Defteri |
| `M` | Sancak Haritası |

---

## 📁 Proje Yapısı

```
src/
├── core/
│   ├── Engine.js          # Render motoru, post-processing, ışıklandırma
│   ├── InputManager.js    # Klavye, fare ve pointer lock yönetimi
│   ├── GameState.js       # Oyun durumu ve ekonomi verileri
│   ├── ParticleSystem.js  # Duman, kıvılcım, köz ve toz parçacıkları
│   ├── AudioManager.js    # Ses efektleri yönetimi
│   └── SteamManager.js    # Steam entegrasyonu
├── entities/
│   ├── Player.js          # Oyuncu kontrolcüsü ve fizik
│   ├── NPCManager.js      # NPC yönetimi ve yapay zeka
│   ├── VillagerAI.js      # 24 saatlik köylü yaşam döngüsü
│   ├── ModelBuilder.js    # Prosedürel 3D model üreticisi
│   ├── TownGenerator.js   # Köy ve çevre harita üreticisi
│   └── TextureGenerator.js # PBR uyumlu doku üreticisi
├── systems/
│   ├── CombatSystem.js    # Kılıç dövüşü ve vuruş sistemi
│   ├── QuestSystem.js     # 11 bölümlük görev zinciri
│   ├── DialogueSystem.js  # NPC diyalog ve ticaret sistemi
│   ├── PetitionSystem.js  # Köylü arzuhal sistemi
│   └── TimarSystem.js     # Tımar ekonomisi yönetimi
├── ui/
│   └── UIManager.js       # HUD, menüler ve diyalog pencereleri
└── main.js                # Oyun döngüsü ve başlatıcı
```

---

## 📜 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

---

*Bismillah. Cenab-ı Hakk'ın izniyle, gazâ meydanına!* ⚔️🏇
