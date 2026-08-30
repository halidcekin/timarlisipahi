# 04 — İslami İçerik Tasarım Dokümanı
## Mülk-i Osmanî: Tımarlı Sipahi 3D — Ehl-i Sünnet Çizgisinde Dinî İçerik, Mekanik ve Denetim Talimatnamesi

> **Bu doküman ne için:** Bu doküman, işverenin "oynarken Osmanlı ve Türk tarihini öğrenecekleri, İslami şeyler öğrenecekleri bir kurgu istiyorum" talebini, mevcut kod tabanına (Three.js + Vite + Electron, `D:\antigravity\sipahi`) dosya:satır düzeyinde bağlanmış, kabul kriterleri yazılmış somut geliştirme işlerine çevirir. İçerik çizgisi tartışmasızdır: **Ehl-i Sünnet (Hanefî fıkhı, Mâturîdî itikadı, Osmanlı bağlamı)**; yalnız sahih/muteber kaynak; uydurma rivayet, mezhep tartışması ve modern polemik yok; ibadet ve din adamları asla mizah nesnesi değil. Doküman `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` ile **çelişmez, üzerine inşa eder** (özellikle 15. bölüm "Dinî mekânlar yalnız buff istasyonu olmamalı", 18.1 antagonist kuralı ve 11. bölüm dil ilkeleri). Hedef okuyucu, uygulama sırasında hiç soru soramayacak bir geliştirici ve işi bu dokümana göre kabul edecek bağımsız bir denetçidir.

---

## 0. Bağlayıcı Çerçeve (özet)

| # | Karar | Kaynağı |
|---|---|---|
| 0.1 | Kampanya: 1396 ilkbaharı → 25 Eylül 1396 Niğbolu | TARIHSEL doc §5 (sabit karar) |
| 0.2 | Her kodeks/tarih maddesi A/B/C/R güven etiketi taşır | TARIHSEL doc §4.2 (sabit karar) |
| 0.3 | İslami içerik: Hanefî fıkhı + Mâturîdî itikadı; yalnız Kur'an meali (Diyanet meali referans), Kütüb-i Sitte sahih hadisleri, muteber ilmihal (Ömer Nasuhi Bilmen, *Büyük İslam İlmihali* düzeyi) | İşveren talebi (sabit karar) |
| 0.4 | Din adamları, ibadet ve dinî değerler mizah nesnesi olmaz; mizah dünyevi hayatta yaşar | TARIHSEL doc §18.1 + işveren |
| 0.5 | Mevcut mimari korunur; cerrahi değişiklik, aşamalı teslim | Sabit karar (solo geliştirici) |
| 0.6 | Sistem anlatıcısı tarafsız; sert dönem ifadeleri yalnız karakter ağzında | TARIHSEL doc §15 |

Bu dokümandaki her iş kalemi üç şart taşır: **(a)** somut, **(b)** dosya:satır ile mevcut koda bağlı, **(c)** kabul kriteri yazılı.

---

# BÖLÜM 1 — İLKELER

## 1.1 Kaynak disiplini (zorunlu)

1. **Âyet mealleri:** Yalnız **Diyanet İşleri Başkanlığı Kur'an-ı Kerim Meali** esas alınır. Bu dokümandaki meal özetleri *yazım şablonudur*; geliştirici her metni oyuna koymadan önce Diyanet meali ile karşılaştırıp birebirleştirir (kabul kriteri: §5 protokol, madde P1).
2. **Hadisler:** Yalnız **Kütüb-i Sitte** (Buhârî, Müslim, Ebû Dâvûd, Tirmizî, Nesâî, İbn Mâce) içinden, sahih/hasen-sahih derecesindekiler kullanılır. Her hadis metninin yanına kaynak adı yazılır (oyun içinde kodekste görünür; diyalogda görünmez ama veri dosyasında `source` alanı zorunludur).
3. **İlmihal bilgisi:** Abdest, namaz, oruç, zekât gibi amelî konularda Ömer Nasuhi Bilmen *Büyük İslam İlmihali* düzeyindeki muteber Hanefî ilmihal bilgisi esastır. Ayrıntı fetva düzeyine inilmez (bkz. 1.3).
4. **Tarih-din kesişimi:** Gaza, şehitlik, vakıf, ahilik gibi kavramlarda TDV İslâm Ansiklopedisi maddeleri (TARIHSEL doc §16 kaynak listesinde zaten var) referanstır.
5. **Veri dosyası zorunluluğu:** Tüm dinî metinler tek veri modülünde toplanır: **`src/data/islamicContent.js` (YENİ DOSYA)** — alanlar: `id, type ('dua'|'hutbe'|'kodeks'|'hikmet'), title, textTr, transliteration (ops.), source, confidence ('A'|'B'|'C'|'R'), gameHook`. Diyalog/sistem kodu metni buradan çeker; metin koda gömülmez. (Gerekçe: TARIHSEL doc §15 "diyalog sistemi gelişigüzel veri değiştirmemeli" + test kırılganlığı, bkz. §6.9.)

## 1.2 Uydurma rivayet ve israiliyat yasağı

- Halk arasında meşhur ama aslı olmayan sözler ("Cennet anaların ayağı altındadır" gibi *tartışmalı senetli* metinler dâhil, kaynağı Kütüb-i Sitte sahihi olarak teyit edilemeyen hiçbir söz) "hadis" diye sunulmaz.
- Menkıbe/rivayet türü anlatılar (ör. Koca Dede'nin Kosova anlatısındaki Murad Hüdavendigâr'ın şehadet duası) **R etiketiyle**, "kaynaklarda böyle anlatılır" çerçevesiyle verilir; asla âyet/hadis ile aynı hiyerarşide sunulmaz. (Mevcut örnek: `src/systems/DialogueSystem.js:334` — bkz. §6.3.)
- İsrailiyat (kaynağı belirsiz kıssa malzemesi) tamamen yasaktır.

## 1.3 İttifak alanında kalma

- Yalnız **mezheplerin ve Ehl-i Sünnet ulemasının ittifak ettiği** temel bilgiler işlenir: namazın farz oluşu, beş vakit, zekâtın farz oluşu, orucun farz oluşu, kul hakkının ağırlığı, emanet-adalet, sadaka-i câriye, vakıf.
- **Girilmeyecek konular:** mezhep içi ihtilaflar (kunut, el bağlama biçimi vb.), kelâmî tartışmalar (kader münazaraları, sıfat tartışmaları), modern polemikler (mezhepsizlik, tekfir söylemleri), siyasî din yorumları, tasavvuf tarikat ayrıntıları (Ahilik yalnız tarihî-sosyal kurum olarak işlenir).
- Oyun hiçbir karakterin ağzından **fetva vermez.** Molla Şemseddin öğüt verir, kavram öğretir, uzlaştırır; "şu caizdir, bu haramdır" kalıbı yalnız ittifaklı ve oyunla doğrudan bağlı konularda (kul hakkı, emanete hıyanet, haksız kan) kullanılır.

## 1.4 İbadet ve din adamı mizah nesnesi olamaz (uygulama kuralları)

TARIHSEL doc §18.1 kuralının içerik-üretim karşılığı:

- Molla Şemseddin ve her din adamı NPC her zaman **bilge, vakur, merhametli** yazılır; unutkan/komik/açgözlü imam tipi yasaktır.
- Ezan, namaz, dua, âyet, hadis, mescid, Kur'an, şehitlik hiçbir esprinin kurulumunda veya vuruşunda yer almaz.
- Mizahın yaşayacağı alanlar (diğer tasarım dokümanlarının konusu): hamam (Tellak Hüseyin Ağa — `DialogueSystem.js:585+`), çarşı-esnaf, saka, asker muhabbeti, uyuyan köylüyü uyandırma. **Sınır örneği:** Saka İbrahim'e önerilen "kuyudan çektiğim su zemzem değil ama..." tarzı bir espri **UYGUN DEĞİLDİR** (zemzem mukaddes bir değerdir); "kuyudan çektiğim kadar laf çekmeyin beyim" **uygundur** (tamamen dünyevi). Bu ayrım §5'teki denetim listesinin M2 maddesidir.
- Namaz kılan (PRAYING durumundaki) NPC ile diyalog açılamaz; `[E]` prompt'u o NPC için "(Namazda 🕌 — bekle)" yerine **emoji'siz** "(Namazda — bekleyiniz)" gösterir (emoji azaltma: TARIHSEL doc §9.9). Uyandırma-mizah mekaniği (başka dokümanın önerisi) PRAYING durumunu **kapsamaz**.

## 1.5 İbadetin oyunlaştırılma adabı — "Şahitlik ve İstikamet" modeli (tasarım çözümü)

**Problem:** "Namaz kıl → +10 can" tarzı kaba ödülleşme ibadeti araçsallaştırır; hem adaba aykırıdır hem öğretim değerini yok eder (ibadet Allah rızası için yapılır, oyun içi güç için değil). Öte yandan ibadetin oyunda **hiçbir karşılığının olmaması** da onu ölü dekor yapar.

**Çözüm — üç katman:**

1. **Şahitlik katmanı (her zaman, oyuncudan bağımsız):** İbadet, dünya simülasyonunun parçasıdır. Ezan okunur, köylüler işi bırakıp mescide yürür, saflar kurulur, sonra hayat devam eder. Oyuncu hiçbir şey yapmasa da bunu *görür*. Öğretimin asıl taşıyıcısı budur: oyuncu beş vakti, cumayı, Ramazan'ı köyün ritminden öğrenir.
2. **Katılım katmanı (opsiyonel, teşvikli, cezasız):** Oyuncu vakit penceresinde mescid avlusundayken `[E] Cemaate katıl` seçeneği görür. Katılım bir mini-oyun **DEĞİLDİR** (namaz asla QTE/beceri testi yapılmaz): kısa kararma + bir "hikmet satırı" (kodeksten kısa alıntı) + oyun saatinin vakit penceresi sonuna ilerlemesi. Saatin ilerlemesi pratik bir yan fayda sağlar (bekleme yerine doğal zaman geçişi) ama bu bir "ödül sayısı" değildir. **Katılmamanın hiçbir cezası yoktur** ("Dinde zorlama yoktur" — Bakara 2/256 ilkesinin tasarım karşılığı: oyun oyuncuyu ibadete puanla itmez, dünyayı yaşayarak davet eder).
3. **İstikamet katmanı (anlatısal karşılık):** `gameState.piety` gibi bir *sayı* tutulmaz. Bunun yerine görünmez bir `istikamet` işaret kümesi (katıldığı vakit türleri, ilk cuma, ilk iftar…) yalnız **anlatı ve bilgi** açar: imam diyaloğunda yeni nasihat dalları, köylülerin selâm varyantları, kodeks maddelerinin açılması. **Kesin yasak:** istikamet işaretleri can, kuvvet, akçe, hasar, XP, vergi, itibar sayılarının HİÇBİRİNE yazmaz.

**Sınır çizgisi — sosyal simülasyon istisnası:** Zekât/sadaka gibi **malî ibadetler** toplumsal fiillerdir; köyün oyuncuya güveninin (mevcut `reayaTrust` — `src/core/GameState.js:168-170`) hayır işlerinden etkilenmesi ibadetin metalaştırılması değil, toplumsal simülasyonun doğal sonucudur (aç köylü doyuran beye güvenir — bu dünyevi bir sonuçtur ve İslam'ın da işaret ettiği toplumsal meyvedir). Kural: **namaz/oruç/dua → hiçbir sayı; zekât/sadaka/infak → yalnız sosyal sayılar (reayaTrust, morale), asla doğrudan savaş/can sayıları.**

**Kabul kriterleri (İlke düzeyi):**
- [ ] Kod tabanında `health`, `stamina`, `akce`, `cebeluExperience`, `sancakReputation` alanlarına yazan hiçbir çağrının call-stack'inde namaz/dua/ezan olayı yoktur (test: §7 T-İ1).
- [ ] `istikamet` verisi kayıt dosyasına girer ama hiçbir `modify*` fonksiyonunu çağırmaz.
- [ ] Namaz katılımında ekranda sayı, bar, puan, "combo" benzeri hiçbir gösterge çıkmaz.

## 1.6 Dil ve üslup kuralları

- Allah lafzı ve Peygamber Efendimiz'in (s.a.v.) adı geçen her metinde saygı ifadesi: sistem/kodeks metinlerinde "Hz. Peygamber (s.a.v.)", karakter ağzında dönem üslubu ("Resûlullah aleyhisselâm", "Fahr-i Kâinat Efendimiz").
- Âyet/hadis içeren satırda **emoji kullanılmaz** (mevcut 🤲 kullanımı — `DialogueSystem.js:133,337` — diyalog *seçenek etiketinde* kalabilir, âyet/hadis metninin kendisine bulaşamaz).
- TARIHSEL doc §11 dil ilkesi geçerli: anlaşılır modern Türkçe + dönem terimleri; "sürekli dinî slogan" yasak — dua ve dinî kalıplar karaktere ve âna göre dozlanır (her NPC her cümlesine "inşallah/maşallah" eklemez).
- Sistem anlatıcısı (bildirimler) tarafsız kalır: "Öğle ezanı okunuyor" der; "Haydi namaza!" demez.

---

# BÖLÜM 2 — MEKANİKLER

## 2.1 Ezan ve Namaz Vakitleri

### 2.1.1 Yeni sistem: `src/systems/PrayerTimeSystem.js` (YENİ DOSYA)

Oyun saati zaten tek otoritede: `gameState.time.dayTimeHours` (`src/core/GameState.js:115`, her karede `updateTime` ile ilerler — `GameState.js:212-234`; ana döngü çağrısı `src/main.js` startLoop içinde, `main.js:242-319` sırasının 1. adımı). PrayerTimeSystem bu değeri okur, vakit geçişlerinde olay üretir.

**Vakit tablosu (motor-uyumlu sabit tablo):** Engine gökyüzü/güneş konumu `dayTimeHours`'a bağlıdır (`src/core/Engine.js:297-378`) ve gün doğumu/batımı görsel olarak ~06:00/~18:00 civarındadır. Görsel ile mekanik çelişmesin diye **mevsimsel vakit tablosu birinci sürümde KULLANILMAZ**; güneş modeliyle uyumlu tek tablo kullanılır:

| Vakit | Saat (oyun) | Cemaat penceresi | Katılan NPC kümesi |
|---|---|---|---|
| Sabah | 04:45 | 04:45–05:30 | yalnız imam + `devout:true` işaretli 3-4 NPC |
| Öğle | 12:15 | 12:15–12:50 | geniş küme (aşağıda) |
| İkindi | 15:30 | 15:30–16:05 | geniş küme |
| Akşam | 18:05 | 18:05–18:40 | geniş küme |
| Yatsı | 19:35 | 19:35–20:10 | imam + `devout` küme |

- **Mevsim genişletmesi (opsiyonel, ertelenebilir):** Engine güneş modeli ileride mevsimselleşirse (`gameState.time.seasonIndex`, `GameState.js:114`) tabloya mevsim başına ±45 dk ofset eklenir. Kodeks "Namaz Vakitleri" maddesi (bkz. §3, K3) oyuncuya "gerçek vakitler güneşin hareketiyle hesaplanır; oyundaki saatler basitleştirilmiş temsildir" notunu **B etiketiyle** verir. Bu not zorunludur — oyun gerçek namaz vakti kaynağı gibi algılanmamalıdır.
- API: `prayerTimeSystem.update(dayTimeHours)` → pencere giriş/çıkışında `onPrayerStart(vakitId)`, `onPrayerEnd(vakitId)` callback'leri; `getCurrentVakit(hours)` saf fonksiyon (test edilebilir); `isPrayerWindow(hours)` yardımcı.
- Entegrasyon noktası: `main.js` startLoop'ta `gameState.updateTime(delta)` çağrısının hemen ardından `prayerTimeSystem.update(...)` (mevcut sıra: `main.js:242-319`, adım 1'in ardına eklenir).

### 2.1.2 Ezan sesi — tasarım kararı: **kayıt, asla prosedürel sentez değil**

Mevcut AudioManager tamamen prosedürel Web Audio'dur (`src/core/AudioManager.js` — mevcut metotlar: `init:14, toggleMute:26, startAmbient:39, playBirdChirp:94, playFootstep:115, playHorseHoof:135, playSwordSwing:162, playSwordClash:188, playWarDrum:211, playVictoryJingle:247`). **Karar:** Ezan osilatörle sentezlenmez. Makamı ve telaffuzu bozuk bir "robot ezan" adaba aykırıdır ve işverenin hassasiyetiyle çelişir.

- **Birincil yol:** İnsan sesiyle okunmuş, lisansı belgeli (sipariş kayıt veya açık lisanslı, lisans dosyası `public/audio/LICENSES.md`'ye işlenir — TARIHSEL doc §15 "varlık lisansları varlıkla birlikte tutulmalı") iki `.ogg` dosyası paketlenir: `public/audio/ezan_sabah.ogg` (Saba makamı geleneğine uygun, sakin) ve `public/audio/ezan.ogg` (diğer dört vakit). Süre 60–90 sn tam metin; ezan **fade-out ile kesilmez**, tamamı çalar.
- **Fallback (dosya yoksa/yüklenemezse):** Yalnız yazılı bildirim: `"🕌 Öğle ezanı okunuyor."` — sentetik ses fallback'i YASAK. (Electron çevrimdışı paketinde dosya her zaman bulunmalı; fallback yalnız hata dayanıklılığı içindir.)
- **AudioManager ekleri:** `loadAzanBuffers()` (init sırasında `fetch` + `decodeAudioData`), `playAzan(vakitId, playerPos)` — kaynak konumu minare tepesi `(12, 10, -4)` (mescid konumu: `src/entities/TownGenerator.js:173`, model: `src/entities/ModelBuilder.js:957-1021`); gain mesafeyle azalır (0 m'de 0.9 → 120 m'de ≤0.2, lineer). `isMuted` bayrağına saygı duyar (`AudioManager.js:26-36`). Ezan çalarken rüzgâr gain'i ve kuş cıvıltısı interval'i %50'ye düşürülür, bitince döner (saygı + miks; interval referansları saklanmalı — bu, core alanının bilinen `setInterval` temizlik borcunu da öder, bkz. analiz: `AudioManager.js:79-90`).
- **Bilinen bug bağımlılığı:** "Start ekranında mute → kalıcı sessizlik" bug'ı (`AudioManager.js:39-40`) ezanı da yutar; core düzeltme listesinde çözülmeden ezan kabulü yapılmaz.

### 2.1.3 Köylü rutini: `PRAYING` durumu (VillagerAI)

Analiz raporunun işaretlediği kanca hazırdır: `VillagerAI.evaluateSchedule` saat-dilim mimarisi (`src/entities/VillagerAI.js:85-119`) ve durum enum'u (`VillagerAI.js:5-9`).

**Değişiklikler:**
1. `VillagerState`'e `PRAYING: 'PRAYING'` eklenir (`VillagerAI.js:5-9`).
2. `evaluateSchedule(hour)` başına (dialogue kilidi kontrolünden sonra, `VillagerAI.js:86-89`) vakit penceresi kontrolü eklenir: pencere içindeyse ve NPC katılım kümesindeyse `currentState = PRAYING; targetPos = safPozisyonu`. Pencere dışına çıkınca normal çizelge devralır (mevcut `else` zinciri değişmez).
3. **Öğle çakışması:** Mevcut EATING penceresi 12:30–14:00 (`VillagerAI.js:99-104`). Öğle cemaat penceresi 12:15–12:50 olduğu için EATING başlangıcı **12:50'ye çekilir** (tek sabit değişikliği). Sonuç ritmi: namaz → yemek — dönem köy hayatına da uygun.
4. **Katılım kümeleri:** Her vakitte 24 NPC birden mescide yığılmaz (performans + görsel çeşitlilik + gerçekçilik). NPC config'ine (`src/entities/NPCManager.js:29-374` içindeki `attachVillagerAI` çağrıları, ör. `NPCManager.js:69-75`) `prayerGroup: 'devout' | 'regular' | 'rare'` alanı eklenir: imam + Koca Dede + Attar `devout` (5 vakit köyde oldukları vakitlerde), esnaf/çiftçiler `regular` (öğle-ikindi-akşam), nöbetçi/hamam görevlisi `rare` (yalnız cuma — nöbet/hizmet meşru mazerettir; bu, "herkes robotik 5 vakittedir" karikatürünü de önler).
5. **Saf pozisyonları:** Mescid avlusunda (12,-4 merkezli) mihraba dönük 2 sıra × 6 slot grid (`safIndex` NPC'ye atanır, çakışma olmaz — mevcut "tüm köy tek eatPos'a yığılıyor" hatasının (`NPCManager.js:53-267`, eatPos (-10,0,24)) tekrarı yasak).
6. **Kıble tutarlılığı:** Oyun dünyasında kıble yönü tek sabitle tanımlanır: `const QIBLA_DIR = new THREE.Vector3(1, 0, 1).normalize()` (güneydoğu temsili; Hüdavendigâr sancağı kurgusuna uygun). Mescid mihrap duvarı, saf yönü ve (ileride) pusula kıble işareti hep bu sabiti okur. Tek kaynak ilkesi (TARIHSEL doc §15).
7. **Namaz animasyonu:** Mevcut prosedürel duruş altyapısıyla (uyku yatışı `rotation.x` lerp deseni — `VillagerAI.js:194-201`) **sadeleştirilmiş** kıyam → rükû (gövde ~80° öne) → secde (diz+alın, tam çömelme pozu) → oturuş çevrimi, 4 tekrar. Abartılı/hızlı "animasyon komedisi" görüntüsü oluşmaması için geçiş lerp süresi ≥1.2 sn. Uzaktan bakıldığında saf düzeni okunmalıdır; yüz detayı gerekmez.
8. **İmam düzeltmesi:** İmamın `workType: 'innkeeping'` değeri (`NPCManager.js:74`) `'imam'` yapılır; WORKING animasyon dalına (`VillagerAI.js:223+`) `'imam'` için sade bekleme/tesbih duruşu eklenir (sallanma yok, karikatür yok). İmam her vakitten 5 oyun-dakikası önce mescidde olur (workPos zaten avlu: `NPCManager.js:71`).
9. **Bağımlılık — bilinen VillagerAI bug'ları:** (a) `isMoving` hesabı SLEEPING'i dışlıyor, uyku saatinde eve yürünmüyor (`VillagerAI.js:162`); (b) yürürken `rotation.x` sıfırlanmıyor (yerde kayan köylü — `VillagerAI.js:164-184`). PRAYING'e giden yürüyüşler aynı yolu kullandığı için bu iki düzeltme **ön koşuldur** (core/entities düzeltme dokümanının kapsamı; burada yalnız bağımlılık olarak kayıtlıdır).

### 2.1.4 Mescide akış sahnesi

- Ezan başladığında (onPrayerStart): katılım kümesindeki NPC'lerin `targetPos`'u saf slotuna döner; köy meydanından mescide doğal yürüyüş "sahneyi" kendiliğinden üretir (ek cutscene sistemi YOK — cerrahi değişiklik ilkesi).
- Demirci örs/kıvılcım döngüsü (`VillagerAI.js:228-239` + `ParticleSystem.emitBlacksmithSparks`) PRAYING penceresinde durur (state değiştiği için kendiliğinden durur — ek kod gerekmez; kabul kriterinde doğrulanır).
- Bildirim: pencere başında tek satır (`gameState.addNotification('🕌 İkindi ezanı okunuyor.', 'info')` — `GameState.js:200-210`). Bildirim spam'i yasak: vakit başına 1 bildirim.

### 2.1.5 Oyuncu katılımı (opsiyonel ve teşvikli)

- Vakit penceresi içinde oyuncu mescid avlusuna ≤10 m yaklaşınca etkileşim prompt'u (`main.js:321-351` updateInteractionPrompts kancası): `"[E] Şadırvanda abdest al ve cemaate katıl"`. Şadırvan zaten merkez meydanda modellidir (`TownGenerator.js:47` yorumu ve mescid bloğu 172-208).
- `E` → 2 sn kararma → su sesi kısa çalar (mevcut prosedürel altyapı yeterli; ezan gibi hassas değildir) → ekranda tek hikmet satırı (`islamicContent.js`'ten, ör. kodeks K10 kul hakkı alıntısı) → `gameState.time.dayTimeHours` pencere sonuna set edilir → kararma açılır, NPC'ler dağılıyordur.
- **Yasaklar:** mini-oyun yok, sayı/puan yok, can/kuvvet dolmaz, "namaz serisi" sayacı UI'da yok (bkz. 1.5).
- İstikamet işareti: `gameState.istikamet.attendedVakits` set'ine vakit eklenir; ilk katılımda kodeks K2 (Abdest) ve K3 (Namaz Vakitleri) maddeleri açılır (kodeks sistemi tarih tasarım dokümanının 12. bölüm görev şemasına bağlanır — `historicalConfidence` alanı zaten planda: TARIHSEL doc satır 661-690).

### 2.1.6 Kabul kriterleri — Ezan & Namaz

- [ ] **E1:** Oyun saati 12:15'e geldiğinde tek bildirim düşer ve ezan sesi minare konumundan, mesafeye göre kısılarak çalar; `isMuted=true` iken çalmaz.
- [ ] **E2:** `getCurrentVakit(4.8)==='sabah'`, `(12.3)==='ogle'`, `(15.6)==='ikindi'`, `(18.2)==='aksam'`, `(19.7)==='yatsi'`, `(11.0)===null` assert'leri `tests/systems.test.js`'e eklenir ve geçer.
- [ ] **E3:** 12:15–12:50 arasında `regular`+`devout` kümesindeki NPC'lerden en az 8'i mescid avlusu (12,-4) 10 m yarıçapında ve `currentState==='PRAYING'`; hepsi QIBLA_DIR yönüne bakar (yaw sapması <10°).
- [ ] **E4:** Aynı pencerede demirci örs kıvılcım emisyonu sıfırdır; 12:50 sonrası köylüler EATING'e döner ve 14:00 sonrası WORKING'e döner (mevcut çizelge bozulmamıştır).
- [ ] **E5:** Oyuncu katılımında `health/stamina/akce/cebeluExperience` değerlerinin hiçbiri değişmez (test assert), oyun saati pencere sonuna atlar, kodeks kaydı açılır.
- [ ] **E6:** Ezan dosyası silinip oyun açıldığında konsol hatasız, yalnız yazılı bildirim gelir.
- [ ] **E7:** PRAYING NPC'ye `E` basılınca diyalog açılmaz; "(Namazda — bekleyiniz)" ibaresi görünür; pencere bitince aynı NPC ile diyalog normal açılır.
- [ ] **E8:** Akşam ezanı, gökyüzündeki gün batımı görseliyle ±15 oyun dakikası içinde örtüşür (görsel denetim maddesi).

## 2.2 Cuma Günü

### 2.2.1 Hafta ve cuma tespiti

Hicri yıl zaten HUD'dadır (`src/ui/UIManager.js:1171` — `H. ${hijriYear} / M. ${year}`; index.html:104-108 date-row). Gün-of-hafta yoktur; eklenir:

- **Takvim çıpası (deterministik, B etiketi):** Kampanya 1. günü = **1 Nisan 1396 (Miladi) = 22 Cemâziyelâhir 798 (Hicri) = Cumartesi** kabul edilir. Buradan: **`isFriday = (gameState.time.dayCount % 7 === 0)`** (7., 14., 21. günler cuma). `dayCount` zaten günlük artar (`GameState.js:216`). Kodeks K17 (Hicrî Takvim) maddesi "oyun takvimi basitleştirilmiş ve sabitlenmiştir; gerçek tarih hesabından 1-2 gün sapabilir" notunu taşır.
- HUD rozeti: cuma günü tarih satırının yanına `Cuma` rozeti (season-pill deseni zaten var — UI analizinin işaret ettiği kanca: `index.html:104-108`). Emoji değil metin rozeti (TARIHSEL doc §9.9).

### 2.2.2 Cuma köy rutini

- Cuma günü **öğle vakti yerine cuma namazı** işler: pencere 12:00–13:10 (hazırlık + hutbe + namaz temsili).
- Katılım kümesi genişler: `rare` dahil tüm uygun erkek NPC'ler safa gelir (nöbetçilerden 1'i nöbette kalır — gerçekçi ve öğretici ayrıntı: hizmet mazereti).
- 12:00–13:10 arası çarşı/iş durur: WORKING durumunda NPC kalmaz; demirci ocağı söner (kabul kriteri C3).
- Ezan: cuma için `ezan.ogg` + pencere başında ayrı bildirim: `"Bugün cuma. Ahali Ulu Mescid'de toplanıyor."`

### 2.2.3 Cuma hutbesi/vaazı — Molla Şemseddin içeriği genişler

Mevcut vaaz çekirdeği: imam_talk "gazâ ahlakı" dalı (`src/systems/DialogueSystem.js:133-140` — "gazâ kibir için değil, mazlumu zalimden korumak içindir") ve adalet öğüdü ("kılıç fetihler açar, lakin o fethi ayakta tutan ancak adalettir"; "Müslim olsun zimmî olsun, hak kimin ise ona teslim edilsin" — imam_talk içi, 107-178 aralığı). Bu ton **şablondur**; korunur ve genişletilir.

**Hutbe havuzu:** `islamicContent.js`'e `type:'hutbe'` 6 metin (her biri 80–120 kelime; giriş hamdele-salvele kalıbı kısa temsil edilir, tam Arapça metin kullanılmaz):

| id | Tema | Dayanak (kaynak alanına yazılır) | Oyun bağı |
|---|---|---|---|
| H1 | Adalet ve ihsan | Nahl 16/90 meali (Diyanet) | Kethüda öşür kararı (`DialogueSystem.js:16-95`), kadı/arzuhal sistemi |
| H2 | Emanet ve ehliyet | Nisâ 4/58 meali | Tımar = emanet teması (berat; TARIHSEL doc Bölüm 0 "mutasarrıf" öğretisi) |
| H3 | Kul hakkı | Buhârî, Mezâlim (kıyamette hakların sahibine verilmesi) | Reayaya vuruş cezaları (`src/systems/CombatSystem.js` reaya dalı), reayaTrust |
| H4 | Zekât ve infak | Bakara 2/261 meali + Buhârî, Zekât | §2.3 hayır arzuhalleri |
| H5 | Gazâ ahlâkı ve ölçü | Bakara 2/190 meali ("aşırı gitmeyin") + mevcut imam repliği | Niğbolu hazırlığı, sivil/esir teması (TARIHSEL doc Bölüm 15) |
| H6 | Komşuluk ve merhamet | Buhârî, Edeb + Müslim, Îmân ("Allah'a ve ahiret gününe iman eden komşusuna ikram etsin") | Kuraklık/kıtlık olayları, iftar sofrası |

> **Tahriç notu (H6):** "Komşusu açken tok yatan bizden değildir" rivayeti Kütüb-i Sitte sahihi DEĞİLDİR (Taberânî/Hâkim; Buhârî'nin *el-Edebü'l-Müfred*'i) ve bu dokümanın 1.1/2 kuralını karşılamaz; H6'nın dayanağı bu yüzden yukarıdaki Kütüb-i Sitte hadisidir. "Tok yatan" teması hutbe metninde kullanılacaksa hadis diye DEĞİL, "ulema öğüdü" çerçevesiyle verilir ve `source` alanına "el-Edebü'l-Müfred (hasen)" yazılır.

- **Sunum:** Oyuncu cumaya katılırsa hutbe metni diyalog penceresinde tam gösterilir (typewriter gerekmez); katılmazsa akşam meydanında Koca Dede/köylü ağzından tek cümlelik özet duyulur ("Hoca efendi bugün kul hakkını anlattı…") — dünya oyuncusuz da yaşar (şahitlik katmanı).
- Hutbeler sıralı döner, aynı hutbe üst üste iki cuma gelmez (`lastHutbeId` kaydı).
- Cuma katılımı istikamet işaretine `firstJuma` ekler; kodeks K5 (Cuma) açılır.

### 2.2.4 Kabul kriterleri — Cuma

- [ ] **C1:** `dayCount % 7 === 0` günlerinde HUD'da "Cuma" rozeti görünür; diğer günlerde görünmez.
- [ ] **C2:** Cuma 12:00–13:10 penceresinde katılım kümesi ≥12 NPC mescid avlusundadır (normal öğle cemaatinden belirgin kalabalık).
- [ ] **C3:** Aynı pencerede `WORKING` durumunda hiçbir `regular` NPC yoktur; demirci kıvılcım emisyonu sıfırdır.
- [ ] **C4:** Oyuncu katılırsa H1–H6'dan biri tam metin gösterilir; iki ardışık cumada aynı id gelmez (test edilebilir: `pickNextHutbe()` saf fonksiyon).
- [ ] **C5:** Hutbe metinlerinin her birinin `source` alanı doludur ve §5 protokolünden geçtiği işaretlenmiştir (denetçi kontrol dosyası: `docs/ISLAMIC_CONTENT_AUDIT.md`, bkz. §5.3).

## 2.3 Zekât, Sadaka, İnfak ve Kul Hakkı

### 2.3.1 Kavram düzeltmesi önce: öşür ≠ zekât

Mevcut ekonomi "öşür" tahsil eder (`src/systems/TimarSystem.js:10-30`, UI: Tımar Defteri "Öşür, Ağnam & Çift Resmi" — `UIManager.js:553-585`). Oyuncuya **öşür vergisinin zekât olmadığı** (öşür: şer'î toprak mahsulü yükümlülüğü; tımar geliri: devletin askerî hizmet karşılığı tahsisi; zekât: kişinin kendi malından, nisâb üzerinden verdiği farz ibadet) kodeks K7'de açıkça öğretilir. Bu ayrım oyunda hâlihazırda örtük olarak doğrudur; yanlış birleştirme yapılmaz.

### 2.3.2 Sipahinin zekâtı (yıllık, opsiyonel, sosyal karşılıklı)

- **Tetik (06 Ç10 kararıyla revize):** Yılda bir (havl temsili), **yıllık öşür tahsilatının yapıldığı günün ertesi şafağında** (hasat penceresi, Ağustos — 06-fazlar-ve-kabul.md Bölüm 1, Ç10; böylece hatırlatma kasa doluyken ve oyuncu köydeyken gelir) kethüda bir arzuhal-üstü hatırlatma getirir: "Beyim, kazancının hesabını yap; nisâba mâlik olan zekâtını verir." Bildirim + Tımar Defteri'nde `Zekât Ver` eylemi görünür. (Bu dokümanın eski "Güz'e geçişte `seasonIndex===2`" tetiği Ç10 ile geçersizdir; hesap/nisâb/sonuç kuralları ve Z1-Z5 kabul mantığı aynen geçerlidir.)
- **Hesap (basitleştirilmiş, ilmihal-uyumlu temsil):** `zekat = floor(max(0, akce - NISAB) * 0.025)`; `NISAB = 500` akçe (oyun-içi sabit; kodeks K7 "gerçek nisâb altın/gümüş ölçüsüyle hesaplanır, oyundaki değer temsildir" notu, B etiketi).
- **Sonuç:** akçe düşer; dağıtım sahnesi yok (kapsam), yalnız bildirim: "Zekâtın kethüda eliyle köyün yoksullarına, yetimlerine ve yolda kalmışlarına ulaştırıldı." + `modifyReayaTrust(+5)` (sosyal simülasyon istisnası, bkz. 1.5) + istikamet işareti `zakatGiven`.
- **Vermezse:** hiçbir ceza yok, hatırlatma tekrarlanmaz (yılda 1 kez). Oyun suçluluk üretmez; kodeks öğretir.

### 2.3.3 Hayır arzuhalleri (PetitionSystem genişlemesi)

Arzuhal havuzu 4 maddedir ve düz dizidir (`src/systems/PetitionSystem.js:16-53`; `fix_mosque` zaten `PetitionSystem.js:27`). Havuzun genişletilebilirliği analizde doğrulandı (reward şeması `income/morale/asayis`). **3 yeni dönem-otantik hayır arzuhali eklenir:**

| id | Metin özü | Bedel | Karşılık | Öğretilen kavram |
|---|---|---|---|---|
| `zekat_drought` | "Kuraklık vurdu; ambarı boş hanelere zahire ve akçe yardımı" | 120 akçe + 20 kile | +morale, +reayaTrust | Sadaka/infak (K8) |
| `sebil_fountain` | "Yol üstüne bir sebil-çeşme yapılsın, gelen geçen su içsin" | 150 akçe / 1 ırgat / 2 gün | +asayis, kodeks açılır | Sadaka-i câriye (K8) + Vakıf (K9) |
| `orphan_seed` | "Yetim kalan hanenin tohumluk buğdayı yok; bahara ekemezse aç kalır" | 60 akçe + 10 kile | +reayaTrust (gecikmeli +income YOK — hayır ticarete bağlanmaz) | Yetim malı/kul hakkı (K10) |

- Reddedilirse mevcut ret akışı işler (-5 morale; Gemini kadı akışı bağlanırsa o doküman geçerli). **Dinî suçlama metni yasak:** ret bildirimi "köylü mahzun ayrıldı" der; "Allah'tan bulasın" tarzı beddua/dinî yargı metni sistem ağzına yazılmaz.
- `fix_mosque` arzuhalinin +20 morale ödülünün `modifyReayaTrust` tarafından ezilme bug'ı (`PetitionSystem.js:117` + `GameState.js:168-170`) ekonomi düzeltme dokümanının konusudur; burada bağımlılık olarak kayıtlıdır (mescit onarımının karşılığı görünür olmalı).

### 2.3.4 Kul hakkı çerçevelemesi (mevcut sistemin üstüne metin katmanı)

Reayaya vuruş cezaları zaten vardır (CombatSystem reaya dalı: asayiş/güven/fraksiyon düşüşleri — analiz: `CombatSystem.js:171-322` hedef grubu 2). Eklenecek olan **anlam katmanıdır**:
- Reayaya ilk vuruşta (oyun başına 1 kez) özel bildirim: `"Kul hakkına girdin. Kadı huzurunda ve ahirette hesabı sorulur."` + kodeks K10 açılır.
- Çiftbozan fail-state açıklaması (`GameState.js:190-197`; desc bug'ı core dokümanında) düzeltilirken metne kul hakkı-adalet cümlesi eklenir: "Zulümle âbâd olanın âhiri berbâd olur" (Osmanlı kelamı, C etiketi).
- Kethüdanın "yetimlerin öşrünü affet" ikilemi (`DialogueSystem.js:16-95`, oyunun en iyi ahlaki kararı — analiz tespiti) dokunulmadan korunur; affetme dalına kodeks K10 bağlantısı eklenir.

### 2.3.5 Kabul kriterleri — Zekât/Sadaka

- [ ] **Z1:** Zekât hatırlatması, yıllık öşür tahsilatının yapıldığı günün ertesi şafağında (Ç10 tetiği) bir kez düşer; `akce=2500` iken `Zekât Ver` 50 akçe düşürür (2500−500=2000×0.025); `akce=400` iken eylem görünmez (nisâb altı).
- [ ] **Z2:** Yeni 3 arzuhal havuzdan gelebilir ve kabul akışı mevcut arzuhallarla aynı UI'dan çalışır (TAB → Tımar Defteri — `UIManager.js:267-283`).
- [ ] **Z3:** `orphan_seed` kabulü hiçbir `income` artışı yapmaz (hayır ↛ kâr ilkesi, test assert).
- [ ] **Z4:** Reayaya ilk vuruşta kul hakkı bildirimi tam 1 kez düşer; kodeks K10 açılır.
- [ ] **Z5:** Zekât/sadaka eylemlerinin hiçbiri `health/stamina/hasar` değerlerine yazmaz (test assert — 1.5 sınır çizgisi).

## 2.4 Ramazan ve Bayramlar (küçük kapsam önerisi)

### 2.4.1 Hicri ay tablosu (deterministik oyun takvimi, B etiketi)

Kampanya penceresi hicri 798'in ikinci yarısına denk gelir ve **Ramazan gerçekten kampanya içindedir** — bu tarihî bir hediyedir, kullanılmalıdır:

| Miladi (oyun) | Hicri (oyun) | Olay |
|---|---|---|
| 1 Nisan 1396 (1. gün) | 22 Cemâziyelâhir 798 | Kampanya başlangıcı (Cumartesi) |
| 10 Nisan | 1 Receb 798 | — |
| 9 Mayıs | 1 Şaban 798 | — |
| **7 Haziran (68. gün)** | **1 Ramazan 798** | Oruç başlar (Perde II dönemi) |
| **7 Temmuz (98. gün)** | **1 Şevval 798** | **Ramazan Bayramı** (3 gün) |
| 6 Ağustos | 1 Zilkade 798 | — |
| 5 Eylül | 1 Zilhicce 798 | Sefer yürüyüşü dönemi |
| **14 Eylül** | **10 Zilhicce 798** | **Kurban Bayramı — ordugâhta** (Perde IV) |
| **25 Eylül (178. gün)** | **21 Zilhicce 798** | **Niğbolu Meydan Muharebesi** |

- Uygulama: `GameState.time`'a `hijriDay`, `hijriMonthIndex` eklenir; gün dönümünde (`GameState.js:216-218`) yukarıdaki ay-uzunluk tablosuyla ilerletilir (tablo `islamicContent.js`'te sabit veri). HUD tarih satırı (`UIManager.js:1171`) `H. 798 Ramazan 12 / M. 18 Haziran 1396` formatına genişler.
- Kodeks K17 notu: "Oyun takvimi 25 Eylül 1396 = 21 Zilhicce 798 çıpasına göre sabitlenmiştir; gerçek hesaptan 1-2 gün sapabilir (B)." Niğbolu'nun hicri tarihi kaynaklarda 21 Zilhicce olarak geçer — bu çıpa hem tarihî hem deterministiktir.
- **NOT — takvim çakışması denetimi:** Mevcut `advanceSeason` 10 günde bir mevsim, 40 günde yıl döndürür (`GameState.js:229-232, 257-269`) ve `hijriYear`'ı yılbaşında artırır (`GameState.js:265`). 1396 kampanyası tek yıl içinde bittiği için bu doküman **hijriYear artışına dokunmaz**; hicri ay/gün sayacı ondan bağımsız işler. Zaman ekonomisinin (daySpeed, time-skip) yeniden ayarı tempo dokümanının işidir; buradaki tablo `dayCount` üzerinden tanımlandığı için tempo değişikliklerinden etkilenmez.

### 2.4.2 Ramazan köy sahneleri (kapsam: 3 sahne, hepsi mevcut sistemlerle)

1. **Gündüz:** Ramazan ayında (hijriMonthIndex === Ramazan) öğle EATING penceresi köylüler için **iptal** (VillagerAI çizelge kontrolüne tek koşul); öğle cemaat penceresi aynen işler. Han önü yemek masaları gündüz boş kalır — "köy oruçlu" görüntüsü kendiliğinden oluşur. Oyuncunun yemesi/içmesi kısıtlanmaz ve yorumlanmaz (oyuncuya oruç dayatması yok; seferî/mazur ihtimali — oyun yargılamaz, kodeks K18 öğretir).
2. **İftar:** 18:05 akşam ezanıyla köylüler han önü masalara toplanır (mevcut eatPos altyapısı; saat farklı). Bildirim: `"İftar vakti. Ahali sofraya oturdu."` Oyuncu yaklaşırsa `[E] Sofraya otur` → kararma + hikmet satırı (H6 komşuluk teması) + istikamet `firstIftar`. Sayısal ödül yok.
3. **Teravih temsili:** Yatsı cemaat penceresi Ramazan'da 20 dk uzar ve katılım kümesi genişler (ayrı animasyon/sahne yazılmaz — pencere parametresi). Bildirim yalnız ilk gece: `"Ramazan geceleri mescid dolup taşıyor."`

### 2.4.3 Bayramlar

- **Ramazan Bayramı (98.-100. günler):** 3 gün boyunca çizelge değişir: sabah cemaat penceresinden sonra tüm gün WANDERING (meydan), işler tatil. Bayram sabahı bildirimi: `"Bayram namazı kılındı. Ahali bayramlaşıyor."` NPC selâm havuzuna bayram varyantları eklenir ("Bayramınız mübarek olsun beyim!"). Oyuncu meydanda NPC'lerle konuşursa ilk diyalog satırı bayramlaşma olur (DialogueSystem giriş metnine koşullu ek — `getDialogueData` her çağrıda kurulduğu için koşullu metin kolaydır; analiz: DialogueSystem yapısı). Kodeks K19 açılır. **Perde takvimi notu (06 ile senkron):** 06-fazlar-ve-kabul.md F2-02 perde takviminde g98-100, Atlama#3 penceresine (g70→g125) düşer, yani normal akışta OYNANMAZ. Normal akışta bayram içeriği **Atlama#3 kartında bayramlaşma vinyeti + NPC bayram selam varyantları + kodeks K19 açılışı** olarak teslim edilir (06 F4-16 tarifi esastır). Bu paragraftaki köy-sahnesi tam çizelge değişimi, bu günlerin oynanır olduğu durumların (debug gün-atlama, olası serbest-oyun modu) tanımıdır.
- **Kurban Bayramı (167. gün, 10 Zilhicce):** Kampanya kurgusunda ordu Rumeli yürüyüşündedir (TARIHSEL doc Bölüm 12-13 dönemi). Köy sahnesinde büyük içerik yapılmaz; **ordugâh vinyeti** olarak tek metin sahnesi + kodeks K19 notu: "798 Kurban Bayramı'nı ordu sefer yolunda karşıladı; savaş bayramdan 11 gün sonradır (B)". Bu, tarihe dokunan güçlü ama ucuz bir andır. (Sefer sahneleri henüz kodda yoksa bu vinyet bildirim + kodeks düzeyinde kalır — kapsam emniyeti.)
- **Kurban kesimi mekaniği YAPILMAZ** (hayvan kesme mevcut damageables mekaniğiyle karışır ve adap riski taşır — bkz. §5 R11).

### 2.4.4 Kabul kriterleri — Ramazan/Bayram

- [ ] **R1:** 68. gün HUD'da "H. 798 Ramazan 1" görünür; 98. günde "Şevval 1" + bayram rozeti. (g98-100 normal akışta Atlama#3 penceresinde olduğundan 98. gün kısmı **debug gün-atlama komutuyla** doğrulanır — bkz. 06-fazlar-ve-kabul.md F2-02 perde takvimi.)
- [ ] **R2:** Ramazan'da 12:50-14:00 penceresinde han önünde EATING durumunda NPC yoktur; 18:05'te ≥8 NPC sofradadır.
- [ ] **R3:** Bayram günlerinde 09:00-18:00 arası WORKING durumunda `regular` NPC yoktur. (Ramazan Bayramı günleri normal akışta oynanmadığından doğrulama **debug gün-atlama komutuyla** yapılır — bkz. 06-fazlar-ve-kabul.md F2-02; normal akıştaki teslim biçimi §2.4.3 perde takvimi notudur.)
- [ ] **R4:** Hicri gün hesabı unit test: `gameDayToHijri(68)==='1 Ramazan'`, `(178)==='21 Zilhicce'`, `(167)==='10 Zilhicce'`.
- [ ] **R5:** Oyuncu iftara katıldığında hiçbir sayısal stat değişmez (test assert).

## 2.5 Dualar (hazır metin havuzu — 18 adet)

Kurallar: (1) hepsi `islamicContent.js`'te `type:'dua'`; (2) oyunda **Türkçe anlamı esastır**, kısa transliterasyon opsiyonel ikinci satırdır; (3) Arapça hat/mushaf görseli kullanılmaz; (4) her dua bir oyun anına bağlıdır ve **spam'lenmez** (aynı dua günde en fazla 1 kez görünür); (5) dualar bildirim kuyuğuna değil, diyalog/sahne metnine yazılır (5'lik bildirim kuyruğunda kaybolma sorunu — `GameState.js:207-209`).

| # | id | An (oyun bağı) | Metin (Türkçe anlam — şablon; §5 P1 doğrulaması zorunlu) | Kaynak |
|---|---|---|---|---|
| D1 | `dua_binek` | Ata ilk biniş (gün başına 1; `Player.toggleHorseMount`, `src/entities/Player.js:81-102`) | "Bunu bizim hizmetimize vereni tesbih ederiz; yoksa biz buna güç yetiremezdik. Şüphesiz biz Rabbimize döneceğiz." | Zuhruf 43/13-14 meali; Müslim, Hac |
| D2 | `dua_yolculuk` | Hızlı seyahat onayı (`UIManager.executeFastTravel`, `UIManager.js:153-158`) | "Allah'ım! Bu yolculuğumuzda Sen'den iyilik ve takva, razı olacağın ameller isteriz. Allah'ım, yolculuğumuzu kolay kıl." | Müslim, Hac |
| D3 | `dua_sefer` | Sefere katılım ekranı (harita modal onayı, `UIManager.js:340-364`) | "Ey Rabbimiz! Üzerimize sabır yağdır, ayaklarımızı sabit kıl ve kâfirler topluluğuna karşı bize yardım et." | Bakara 2/250 meali |
| D4 | `dua_korku` | Sağlık %25 altına ilk düşüş (updateStoryGuidance kancası, `main.js:215-240`) | "Allah bize yeter; O ne güzel vekildir." | Âl-i İmrân 3/173 meali; Buhârî, Tefsîr |
| D5 | `dua_hasta_ziyaret` | Ali'yi ziyaret (imam_talk Ali dalı girişi, `DialogueSystem.js:117-131`) | "Geçmiş olsun; inşallah temizlenmene (günahlarına kefaret olmasına) vesiledir." | Buhârî, Merdâ |
| D6 | `dua_sifa` | Ali için şifa duası (imam repliği) | "Büyük Arş'ın Rabbi olan yüce Allah'tan sana şifa vermesini dilerim." (yedi kez söylenir) | Ebû Dâvûd, Cenâiz; Tirmizî (sahih) |
| D7 | `dua_mescid_giris` | Cemaate katılım sahnesi girişi (§2.1.5) | "Allah'ım! Bana rahmet kapılarını aç." | Müslim, Salât |
| D8 | `dua_mescid_cikis` | Cemaat sahnesi çıkışı | "Allah'ım! Senin lütfundan isterim." | Müslim, Salât |
| D9 | `dua_yemek_sonu` | İftar sofrası sahnesi (§2.4.2) | "Bizi yediren, içiren ve Müslümanlardan kılan Allah'a hamd olsun." | Ebû Dâvûd, Et'ime; Tirmizî |
| D10 | `dua_sabah` | Gün doğumu köy bildirimi (günde 1, imam/dede ağzından) | "Allah'ım! Senin sayende sabaha çıktık, Senin sayende akşama erdik." | Tirmizî, Deavât (sahih) |
| D11 | `dua_uyku` | Oyuncu uyku/zaman-atlama mekaniği eklendiğinde (tempo dokümanına bağ) | "Allah'ım! Senin adınla ölür, Senin adınla dirilirim." | Buhârî, Deavât |
| D12 | `dua_zafer_sukru` | Sefer zafer ekranı (`UIManager.showBattleResult`, `UIManager.js:824-834`) | "Nimetiyle salih amellerin tamamlandığı Allah'a hamd olsun." | İbn Mâce, Edeb (hasen-sahih) |
| D13 | `dua_taziye` | Şehit/vefat haberi metinleri (fail-state hariç sahneler) | "Biz Allah'a aidiz ve şüphesiz O'na döneceğiz." | Bakara 2/156 meali |
| D14 | `dua_kabir` | Hazire ziyareti etkileşimi (mezar taşları — `TownGenerator.js:185-207`; interactables kancası `TownGenerator.js:20`) | "Selâm size ey müminler yurdunun sakinleri! İnşallah biz de size katılacağız." | Müslim, Cenâiz |
| D15 | `dua_valideyn` | Hazirede aile kabri kitabesi okununca | "Rabbimiz! Hesabın görüleceği gün beni, ana-babamı ve müminleri bağışla." | İbrâhîm 14/41 meali |
| D16 | `dua_yagmur` | Kuraklık arzuhali çözümü sahnesi (§2.3.3 `zekat_drought`) | "Allah'ım! Bize faydalı bir yağmur ihsan eyle." | Buhârî, İstiskâ |
| D17 | `dua_hayir_kabul` | Zekât/sadaka verilince kethüda repliği | "Allah kabul eylesin, malına bereket versin beyim." (halk duası, C etiketi — âyet/hadis değil, dönem kalıbı) | C — dönem üslubu |
| D18 | `dua_selam` | NPC selamlaşma havuzu (mevcut "Esselamü aleyküm ve rahmetullah" — `DialogueSystem.js` kethüda girişi) | Selâmın karşılığı daha güzeliyle verilir ilkesi; varyantlar: "Ve aleyküm selâm ve rahmetullahi ve berekâtüh." | Nisâ 4/86 meali (ilke); mevcut metin korunur |

**Kabul kriterleri — Dualar:**
- [ ] **D-K1:** `islamicContent.js`'te 18 dua kaydı vardır; her kaydın `source` alanı boş değildir (unit test).
- [ ] **D-K2:** Aynı `id`'li dua aynı oyun gününde iki kez gösterilmez (gün damgası kontrolü).
- [ ] **D-K3:** D1 ata binişte diyalog balonu/alt yazı olarak görünür, bildirim kuyruğuna girmez.
- [ ] **D-K4:** Dua metinlerinin bulunduğu satırlarda emoji yoktur (lint-benzeri metin taraması, §5 P6).

---

# BÖLÜM 3 — ÖĞRETİM İÇERİĞİ: KODEKS'E GİRECEK 20 İSLAMİ KAVRAM MADDESİ

Kodeks sistemi TARIHSEL doc §4.2 + §12'de tanımlanan A/B/C/R etiketli ansiklopedidir (tarih tasarım dokümanı kurar; bu bölüm İslami maddelerin **metinlerini** teslim eder). Her madde: başlık, etiket, metin (oyuna girecek nihai taslak; §5 P1-P2 doğrulaması sonrası kesinleşir), oyun bağı, açılma tetiği. Tüm maddeler `islamicContent.js` `type:'kodeks'` kayıtlarıdır.

> Etiket notu: Dinî temel bilgiler (namazın farziyeti gibi) tarihsel "A — belgelenmiş" etiketiyle işaretlenir; oyunun basitleştirdiği temsiller (vakit saatleri, nisâb değeri) "B" notu taşır.

**K1 — Besmele (A)**
"Bismillâhirrahmânirrahîm: 'Rahmân ve Rahîm olan Allah'ın adıyla.' Müslüman her hayırlı işe Allah'ın adını anarak başlar. Osmanlı kâtipleri fermanların, defterlerin ve kitapların başına besmeleyi yazar; ustalar çekici besmeleyle sallar, yolcu besmeleyle yola çıkardı. Oyunun açılışındaki hat işareti (﷽) bu geleneğin izidir."
*Oyun bağı:* Başlık ekranı tuğrası (`index.html:346`); demirci çalışma repliklerine besmele eklenir (bkz. §6.7). *Açılma:* oyun başlangıcında açık (ilk kodeks maddesi).

**K2 — Abdest (A)**
"Abdest, namaza hazırlık için elleri, yüzü, kolları yıkamak ve başı mesh edip ayakları yıkamaktan ibaret bir temizliktir. 'Temizlik imanın yarısıdır' buyrulmuştur (Müslim, Tahâret); abdest uzuvlarının kıyamet günü nurlu olacağı da bildirilmiştir (Buhârî; Müslim). Mescidlerin avlusundaki şadırvanlar bunun içindir: cemaat namazdan önce burada abdest alır. Osmanlı çarşısında hamamın, çeşmenin ve şadırvanın bolluğu, temizliği ibadetin parçası sayan bu anlayışın eseridir."
*Oyun bağı:* Şadırvan (merkez meydan, `TownGenerator.js:172-208`); cemaate katılım prompt'u (§2.1.5). *Açılma:* ilk cemaat katılımı.

**K3 — Namaz ve Beş Vakit (A; oyun saatleri B)**
"Namaz, günde beş vakit kılınan farz ibadettir: sabah, öğle, ikindi, akşam, yatsı. Vakitler güneşin hareketine göre belirlenir; bu yüzden köylerde ezan hem ibadete çağrı hem de gündelik hayatın saatidir — 'ikindiye doğru', 'yatsıdan sonra' gibi sözler günün ölçüsüdür. Oyundaki vakit saatleri basitleştirilmiş bir temsildir (B); gerçek vakitler hesapla tayin edilir."
*Oyun bağı:* PrayerTimeSystem (§2.1); köy rutini. *Açılma:* ilk ezan bildirimi.

**K4 — Ezan (A)**
"Ezan, namaz vaktinin girdiğini bildiren çağrıdır; Hz. Peygamber (s.a.v.) devrinden beri insan sesiyle okunur. Minare, sesin uzağa ulaşması için yükseltilmiş yerdir. Ezanı duyan köylü işini bağlar, tarladaki orağını bırakır; çarşıda alışveriş kısa süre durur. Beş vakit ezan, Osmanlı köyünün görünmez saat kulesiydi."
*Oyun bağı:* Ezan sesi ve minare (`ModelBuilder.js:957-1021`). *Açılma:* ilk ezan.

**K5 — Cuma ve Hutbe (A)**
"Cuma namazı, cuma günü öğle vaktinde cemaatle kılınan farzdır; öncesinde imam minberden hutbe okur: Allah'a hamd, Peygamber'e salât ve müminlere öğüt. Cuma, Müslümanların haftalık toplanma günüdür; çarşı durur, köy mescidde buluşur. Hutbede sultanın adının anılması, meşruiyetin de işaretiydi."
*Oyun bağı:* §2.2 cuma döngüsü; Molla Şemseddin hutbeleri. *Açılma:* ilk cuma günü.

**K6 — Cemaat ve Mescid (A)**
"Mescid yalnız namaz kılınan yer değildir: ilim öğrenilen, davaların sulh edildiği, yolcunun soluklandığı köy odağıdır. Cemaatle namaz tek başına kılınandan faziletli sayılır; saf düzeni, zengin-yoksul, bey-reaya demeden omuz omuza durmayı öğretir. Köyünüzün mavi kubbeli Ulu Mescidi bu hayatın merkezidir."
*Oyun bağı:* Mescid (12,-4; `TownGenerator.js:173`); imam NPC (`NPCManager.js:59-75`). *Açılma:* mescid avlusuna ilk giriş (mesafe tetiği).

**K7 — Zekât (A; oyun hesabı B)**
"Zekât, İslam'ın beş şartından biridir: nisâb miktarı mala bir yıl sahip olan Müslüman, kırkta birini (yüzde 2,5) yoksula, yetime, borçluya, yolda kalmışa verir. Zekât devlet vergisi değildir; Allah'ın yoksula tanıdığı haktır. Sipahinin topladığı öşür ise toprak mahsulünün şer'î hissesidir — ikisi karıştırılmamalıdır. Oyundaki nisâb ve hesap basitleştirilmiş temsildir (B)."
*Oyun bağı:* §2.3.2 zekât eylemi; Tımar Defteri. *Açılma:* ilk zekât hatırlatması.

**K8 — Sadaka ve Sadaka-i Câriye (A)**
"Sadaka, farz olan zekâtın dışında gönüllü vermektir; 'yarım hurmayla da olsa ateşten korunun' buyrulmuştur (Buhârî). Sadaka-i câriye, sevabı kesilmeden akan hayırdır: Hz. Peygamber (s.a.v.), insan ölünce amel defterinin kapandığını, ancak üç şeyin istisna olduğunu bildirir — sadaka-i câriye, faydalanılan ilim ve hayırlı evlat duası (Müslim). Çeşme, köprü, kuyu, mescid yaptırmak bu yüzden Osmanlı'da en itibarlı hayırdı."
*Oyun bağı:* `sebil_fountain` ve kuyu arzuhalleri (`PetitionSystem.js:16-53`). *Açılma:* ilk hayır arzuhali kabulü.

**K9 — Vakıf (A)**
"Vakıf, bir malı Allah rızası için ebediyen hayra tahsis etmektir: geliri belirlenen hizmete akar — imaret aş dağıtır, medrese okutur, kervansaray yolcuyu barındırır, hamam ve çeşme temizliği yaşatır. Osmanlı şehirlerini kuran görünmez el vakıftır; köyünüzdeki büyük hamamın masrafı da bir vakfın geliriyle döner. Vakfa el uzatmak, yetim malına el uzatmak gibi ağır sayılırdı."
*Oyun bağı:* Hamamın vakıf bağlamı (TARIHSEL doc §3.2 ve §11'in istediği açıklama buradan verilir — hamam anakronizm eleştirisinin İslami-kurumsal cevabı). *Açılma:* hamama ilk giriş.

**K10 — Kul Hakkı (A)**
"Kul hakkı, insanın insana karşı hakkıdır: malına, canına, emeğine, onuruna. Hz. Peygamber (s.a.v.) kıyamet günü hakların sahiplerine mutlaka ödettirileceğini bildirir (Müslim). Allah kendi hakkını dilerse bağışlar; kul hakkını ise sahibi helal etmedikçe bağışlamaz — bu yüzden Osmanlı ahlakında 'kul hakkıyla huzura varma' korkusu, kadı mahkemesinden ağır bir denetimdi. Reayanın malını haksız almak, beyin en büyük vebalidir."
*Oyun bağı:* Reayaya vuruş cezaları; yetim öşrü ikilemi (`DialogueSystem.js:16-95`); Çiftbozan fail-state metni. *Açılma:* ilk kul hakkı bildirimi (§2.3.4) veya yetim kararı.

**K11 — Emanet (A)**
"'Allah size emanetleri ehline vermenizi ve insanlar arasında hükmettiğinizde adaletle hükmetmenizi emreder' (Nisâ 4/58, meal). Emanet yalnız bırakılan eşya değildir; makam, görev ve yönetilen insanlar da emanettir. Tımar beratı sipahiye toprağın mülkünü değil, emanetini verir: 'Sahibi değil, mutasarrıfısın.' Emanete hıyanet, münafıklık alameti sayılmıştır (Buhârî)."
*Oyun bağı:* Berat teslimi (TARIHSEL doc Bölüm 0); tımar sisteminin tamamı (`TimarSystem.js`). *Açılma:* oyun başlangıcı + berat sahnesi.

**K12 — Adalet ve Kadılık (A)**
"Osmanlı köylüsü hakkını kılıçla değil, arzuhalle arar: kadıya dilekçe verir. Kadı, şer'î hukuku; örf ise sultanın kanunnamesini temsil eder — ikisi birlikte işler. Kadının hükmü beyi de bağlar: sipahi, reayayı kadı kararı olmadan cezalandıramaz. 'Bir saat adaletle hükmetmek...' diye başlayan rivayetler bu kültürde adaleti ibadet katına çıkarır (R). Zimmî (gayrimüslim tebaa) da aynı mahkemede hak arar: 'Hak kimin ise ona teslim edilir.'"
*Oyun bağı:* PetitionSystem + kadı hüküm akışı (`UIManager.js:587-681`, bağlanınca); Molla Şemseddin'in naib rolü (`NPCManager.js:59-61`); su ihtilafı görevi (`DialogueSystem.js:357-374`). *Açılma:* ilk arzuhal.

**K13 — Ahilik ve Fütüvvet (A)**
"Ahilik, Anadolu esnaf ve zanaatkârlarının hem meslek hem ahlak ocağıdır; kökü fütüvvet geleneğine dayanır: eli açıklık, sözünde durmak, mazlumu korumak. Çırak ustasından yalnız zanaat değil edep öğrenir; kalitesiz mal üretenin 'pabucu dama atılır'. Ahi Evran, debbağların pîri sayılır. Demirci Rüstem Usta'nın ocağındaki düzen bu geleneğin köydeki yüzüdür."
*Oyun bağı:* Demirci diyaloğu ("Ahi Evran ocağından feyiz almışız" — `DialogueSystem.js:180+`); ahiler fraksiyonu (`GameState.js` factions). *Açılma:* demirciyle ilk konuşma.

**K14 — Gaza ve Gazilik (A)**
"Gaza, din ve nizam uğruna yapılan savaştır; gazi, bu yoldan sağ dönendir. Ancak gaza yağma bahanesi değildir: 'Savaşın ama aşırı gitmeyin; Allah aşırı gidenleri sevmez' (Bakara 2/190, meal). Kadına, çocuğa, yaşlıya, mabede ve kendini savaşa katmayana dokunulmaz; ahde vefa esastır. Erken Osmanlı beyleri 'gazi' unvanını taşırdı — köyünüzdeki Koca Dede gibi. Gazanın ölçüsü kibir değil, mazlumun duasıdır."
*Oyun bağı:* İmam'ın gaza vaazı (`DialogueSystem.js:133-140`), Koca Dede vasiyeti (`DialogueSystem.js:317-348`), Niğbolu kampanyası. *Açılma:* imam gaza vaazı dinlenince.

**K15 — Şehitlik (A — dengeli çerçeve)**
"Şehit, Allah yolunda canını verendir; Kur'an onlar için 'ölüler demeyin... onlar diridirler' buyurur (Bakara 2/154, meal). Şehitlik aranarak ölmek değil, hak uğruna ölümü göze almaktır; İslam intiharı ve gözü kara telef olmayı yasaklar — asker safını korur, komutana itaat eder, sağ kalmak için tedbir alır. Şehidin ardından yas ölçülüdür: dua edilir, hakkı ödenir, ailesi gözetilir. Gazilik de şehitlik de nişan değil, emanettir."
*Oyun bağı:* `triggerMartyrdom` fail-state (`GameState.js:247-255`; metin düzeltmesi §6.4); Ali'nin akıbeti (§4). *Açılma:* sefer fermanı okunduğunda.

**K16 — Tevekkül ve Sebeplere Sarılmak (A)**
"Tevekkül, elinden geleni yaptıktan sonra sonucu Allah'a bırakmaktır. Devesini salıvererek 'tevekkül ettim' diyen adama Hz. Peygamber (s.a.v.) 'Önce bağla, sonra tevekkül et' buyurmuştur (Tirmizî). Hastalıkta tedavi aramak tevekküle aykırı değildir; bizzat emredilmiştir: 'Tedavi olun; Allah her derdin devasını yaratmıştır' (Ebû Dâvûd). Yaralı cebelüsüne hem merhem hem dua arayan sipahi, tevekkülün doğrusunu yapar."
*Oyun bağı:* Ali zinciri (attar merhemi + imam duası — §4); `quest_save_ali_leg` (`QuestSystem.js` 13. görev). *Açılma:* Ali yaralanınca.

**K17 — Hicrî Takvim (A; oyun eşlemesi B)**
"Hicrî takvim, Hz. Peygamber'in (s.a.v.) Mekke'den Medine'ye hicretini başlangıç alır ve ayın hareketine göre işler: yıl 354 gündür, aylar mevsimlere göre her yıl ~11 gün öne kayar. Osmanlı defterleri hicrî tarihle tutulur; Ramazan ve bayramlar bu takvimle döner. İçinde bulunduğunuz yıl 798'dir; Niğbolu'ya yürüyen ordu, Zilhicce ayındadır. Oyun takvimi 25 Eylül 1396 = 21 Zilhicce 798 çıpasıyla sabitlenmiştir; gerçek hesaptan bir-iki gün sapabilir (B)."
*Oyun bağı:* HUD çifte takvim (`UIManager.js:1171`; `GameState.js:111-112`); §2.4.1 tablosu. *Açılma:* oyun başlangıcında açık.

**K18 — Ramazan ve Oruç (A)**
"Ramazan, Kur'an'ın indirildiği aydır; orucu farzdır: tan yerinden güneş batana dek yeme-içmeden uzak durulur (Bakara 2/183-185, meal). Hasta ve yolcu tutamadığını sonra kaza eder — sefere çıkan asker de bu ruhsattandır. Oruç yalnız açlık değildir; dile, ele, öfkeye de oruç tutturulur. Köyde gündüz sofra kurulmaz; iftar topluca, şükürle açılır."
*Oyun bağı:* §2.4.2 Ramazan sahneleri. *Açılma:* 1 Ramazan bildirimi.

**K19 — Bayramlar (A)**
"İslam'ın iki bayramı vardır: Ramazan Bayramı (Şevval'in ilk üç günü) orucun şükrüdür; Kurban Bayramı (Zilhicce'nin onuncu günü) Hz. İbrahim'in (a.s.) teslimiyetini anar, kesilen kurbanın eti yoksula dağıtılır. Bayram sabahı cemaatle bayram namazı kılınır; küsler barıştırılır, büyükler ziyaret edilir, çocuklar sevindirilir. 798 yılının Kurban Bayramı'nı ordu, Niğbolu yolunda karşıladı (B)."
*Oyun bağı:* §2.4.3 bayram sahneleri. *Açılma:* ilk bayram günü.

**K20 — Selâm ve Dua Âdâbı (A)**
"'Size bir selâm verildiğinde, ondan daha güzeliyle veya aynıyla karşılık verin' (Nisâ 4/86, meal). Selâm, esenlik dileğidir; küçük büyüğe, binitli yürüyene, yürüyen oturana selâm verir. Dua, kulun Rabbiyle konuşmasıdır: yola çıkarken, sofraya otururken, hastayı ziyaret ederken dilden düşmez. Osmanlı gündeliğindeki 'Hızır yoldaşın olsun', 'Allah muzaffer eylesin' kalıpları bu kültürün türküleridir."
*Oyun bağı:* Mevcut selamlaşma metinleri (`DialogueSystem.js` genelinde), D18 duası, NPC selam havuzu. *Açılma:* ilk NPC diyaloğu.

**Kabul kriterleri — Kodeks:**
- [ ] **KX1:** 20 maddenin tamamı `islamicContent.js`'te tam metinle vardır; her birinin `confidence` ve `source` alanı doludur.
- [ ] **KX2:** Her maddenin açılma tetiği çalışır (tetik-madde eşlemesi test tablosuyla doğrulanır; en az 5'i otomatik testte).
- [ ] **KX3:** Kodeks UI'ında etiket açıklaması (A/B/C/R lejantı) görünür (tarih dokümanının kodeks UI işine bağımlılık).
- [ ] **KX4:** Metinlerde âyet mealleri Diyanet meali ile karşılaştırılıp `docs/ISLAMIC_CONTENT_AUDIT.md`'de işaretlenmiştir (§5.3).

---

# BÖLÜM 4 — ALİ'NİN HİKAYESİ: DUA–TEVEKKÜL–TEDAVİ DENGESİ

## 4.1 Anlatı çerçevesi

Ali zinciri oyunun duygusal çekirdeğidir (analiz tespiti: `GameState.aliStatus` — `GameState.js:121-127`; 3 günlük mühlet `GameState.js:220-227`; görev `quest_save_ali_leg`; diyaloglar imam/demirci/attar). Tetikleyicinin (bacağın kopması, `CampaignBattleSystem.js:148`) ölü kodda olması **savaş/anlatı dokümanlarının** çözeceği bugdır; bu bölüm zincirin **İslami çerçevesini** bağlar.

**Ana ilke — iki yanlışa da kapıyı kapat:**
1. ❌ "Sadece dua yeter, merhem gerekmez" (kadercilik karikatürü) — hiçbir karakter söylemez.
2. ❌ "Dua boş iştir, ilaç yeter" (imansız hekim karikatürü) — hiçbir karakter söylemez.
3. ✅ Doğru çerçeve: **sebep + tevekkül.** İmam merhem ve değnek ister VE dua eder; attar ilacı verir VE "şifa Allah'tandır, biz sebebine yapışırız" der.

## 4.2 Diyalog zincirinin İslami dokusu (metin ekleri)

Zincir mevcut üç duraklıdır: Attar (kantaron merhemi, `DialogueSystem.js:462-484+`), Demirci (koltuk değneği, `DialogueSystem.js:180+` içindeki Ali dalı), İmam (yara sarma + müjde, `DialogueSystem.js:117-131`). Eklenecek metin katmanları:

1. **Attar Mehmet Efendi** (merhem satışı sırasına eklenir): "Merhemi sürerken şunu unutma beyim: Resûlullah aleyhisselâm 'Tedavi olun; Allah her derdin devasını yaratmıştır' buyurdu. Biz sebebe sarılırız, şifayı veren Allah'tır." (Kaynak: Ebû Dâvûd, Tıb — `source` alanına.)
2. **İmam Molla Şemseddin** (yara sarma sahnesine): D5 hasta ziyaret duası + D6 şifa duası ("Büyük Arş'ın Rabbi olan yüce Allah'tan sana şifa vermesini dilerim" — yedi kez okunduğu söylenir). Dağlama konusu mevcut metinde geçiyor ("Yarasını dağladık" — `DialogueSystem.js:127`); imam ağzına bir cümle eklenir: "Dağ, en son çaredir; Resûlullah aleyhisselâm onu hoş görmezdi, lakin can pazarında ruhsat vardır." (Buhârî, Tıb'daki "şifa üç şeydedir" hadisinin ilmihal-uyumlu, ihtilafsız özeti: dağlama yasak değil, son çare.) Bu cümle hem dönem hekimliğini (tarih öğretimi) hem fıkhî dengeyi taşır.
3. **Ali'nin kendisi** (kurtulunca, cebelu_talk'a ek dal): "Bacağım gitti ama canım emanet geldi beyim. Hocamız 'gazinin eksiği, kıyamette şahididir' dedi. Ben yine yanındayım — at süremem ama ok yontarım." → Gazilik onuru + engellilik = işe yaramazlık DEĞİL mesajı (fütüvvet ahlakı). Bu dal `quest_save_ali_leg` tamamlanınca açılır. **Etiket notu:** "Gazinin eksiği, kıyamette şahididir" bir âyet/hadis DEĞİLDİR; hoca ağzından bir teselli/dönem-üslubu kalıbıdır. `islamicContent.js` kaydında `confidence:'C'` (dönem üslubu/teselli sözü) olarak etiketlenir ve `docs/ISLAMIC_CONTENT_AUDIT.md`'de bu şekilde işaretlenir; hadis zannedilmesine yol açacak hiçbir sunum yapılmaz.
4. **Koşulsuz seçenek bug'ının kapatılması (zorunlu ön koşul):** "Kantaron merhemini ve koltuk değneğini getirdim" seçeneği bugün görev durumu kontrol etmeden tıklanabilir (`DialogueSystem.js:117-131` + `QuestSystem.js:439-441` locked→active bypass — analizde YÜKSEK bug). İslami çerçevenin inandırıcılığı sahne sırasına bağlıdır: seçenek yalnız `quest_save_ali_leg` aktif VE ilk iki hedef tamamken görünür. (Uygulama görev-sistem dokümanının işi; buradaki kabul kriteri A-K4 bunu İslami içerik kabulünün de şartı yapar.)

## 4.3 Şehitlik ve gazilik metin denetimi (fail-state uyumu)

1. **`triggerMartyrdom` (`GameState.js:247-255`) — DÜZELT:** Mevcut desc "…canını feda ettin. **Şanın asırlarca yaşayacak.**" — vurgu dünyevi şöhrettedir; şehitliğin tanımıyla (K15) çelişir. Yeni metin: *"1396 Niğbolu Meydan Muharebesi'nde Haçlı ordusuna karşı gazâ ederken canını verdin. Ahali senin için gıyabında cenaze namazı kıldı; adın köyün hazîresindeki taşa, hakkın Hakk'ın divanına yazıldı."* (Şan → dua ve hak vurgusu.) Bildirim satırı "🚩 Şehadet şerbetini içtin..." kalabilir (dönem deyimi, uygun); emoji tarih dokümanının emoji politikasına tabidir.
2. **`triggerAliDeathAndStoning` (`GameState.js:236-245`) — DEĞİŞTİR (yüksek öncelik):** "Ahali konağı bastı, taşlayarak linç etti" faili meçhul bir **linç meşrulaştırması** okunuyor; hem İslami hukukla (ceza yalnız mahkemeyle verilir — K12) hem oyunun kadı-adalet temasıyla ve TARIHSEL doc §15 "sistem anlatıcısı tarafsız" ilkesiyle çelişiyor. Yeni fail-state kurgusu: *Ali ihmalden vefat eder → köy kadıya arzuhal eder → kadı soruşturması sipahinin ihmalini sabit görür → sancakbeyi beratı azleder.* Başlık: "⚖️ KADI HÜKMÜYLE AZLEDİLDİN"; desc: *"Canını senin için feda eden Gazi Ali'yi ihmalinle kaybettin. Ahali kadıya arzuhal etti; şer' ve örf seni haksız buldu. Sancakbeyi fermanıyla tımarın elinden alındı. Kul hakkı, divanda da mizanda da ağırdır."* — Aynı `failState` şeması (reason kodu + desc; Çiftbozan şema normalizasyonu core dokümanında). Bu değişiklik hem düzeltmedir hem öğretimdir: oyuncu kaybederken bile kadı sistemi ve kul hakkı öğrenir.
3. **Gazilik unvanı:** `quest_save_ali_leg` ödül unvanı "Vefakâr Gazi Sipahi" ve kampanya unvanı "Gazi Sancakbeyi Naibi" hiç verilmiyor (rewards.title bug'ı — `QuestSystem.js:491-500`). Görev-sistem dokümanı düzeltince metinler olduğu gibi kullanılabilir; İslami açıdan **uygundur** (gazi unvanı hak edilerek alınır — K14 ile tutarlı).
4. **"Gaza İle Zafer Kazandık" buton metni** (savaş sonucu modalı) — uygundur, korunur.

## 4.4 Kabul kriterleri — Ali zinciri

- [ ] **A-K1:** Attar ve imam Ali diyaloglarında hem tedavi hem dua ifadesi geçer; hiçbir replikte tedaviyi veya duayı küçümseyen cümle yoktur (metin denetimi, §5 protokol).
- [ ] **A-K2:** `triggerMartyrdom` ve Ali fail-state metinleri yukarıdaki yeni metinlerle değiştirilmiştir; game-over ekranında "undefined" görünmez (core desc bug'ına bağımlı).
- [ ] **A-K3:** Ali kurtulunca cebelu_talk'ta yeni "gazi" dalı açılır; kurtulmadan görünmez.
- [ ] **A-K4:** İmamdaki Ali seçeneği görev ön koşulları sağlanmadan listede yoktur (görev-gating; test: quest locked iken `getDialogueData('imam_talk')` seçenek listesinde ilgili label bulunmaz).
- [ ] **A-K5:** D5 ve D6 duaları sahnede gösterilir ve `source` alanları doludur.

---

# BÖLÜM 5 — HASSASİYET DENETİM PROTOKOLÜ

## 5.1 Her yeni dinî içerik için zorunlu kontrol listesi (P-serisi)

Geliştirici, dinî metin/mekanik içeren HER değişiklikte bu listeyi uygular ve sonucu `docs/ISLAMIC_CONTENT_AUDIT.md`'ye satır olarak işler (bkz. 5.3):

- **P1 — Kaynak:** Âyet ise Diyanet meali ile birebir karşılaştırıldı mı? Hadis ise Kütüb-i Sitte içinden mi ve derecesi sahih/hasen-sahih mi? `source` alanı dolu mu?
- **P2 — Bağlam:** Âyet/hadis, indirildiği/söylendiği anlam çerçevesinde mi kullanılıyor? (Örn. savaş âyetleri yalnız meşru savaş bağlamında; azap âyetleri korkutma efekti olarak ASLA.)
- **P3 — İttifak:** Konu mezhep içi/kelâmî ihtilaf alanına giriyor mu? Giriyorsa çıkar (1.3).
- **P4 — Mizah süzgeci:** Metnin 10 satır yakınında espri/alay var mı ve dinî öğeye temas ediyor mu? Ediyorsa espriyi taşı veya sil (1.4).
- **P5 — Ödül süzgeci:** Bu içerik `health/stamina/akce/XP/hasar/itibar` sayılarından herhangi birini değiştiriyor mu? (Zekât-sosyal istisnası hariç — 1.5.) Değiştiriyorsa RED.
- **P6 — Üslup:** Allah lafzı/peygamber adı saygı kalıbıyla mı? Âyet/hadis satırında emoji var mı? Sistem anlatıcısı tarafsız mı?
- **P7 — Zorlamasızlık:** İçerik, katılmayan oyuncuya ceza/suçluluk üretiyor mu? Üretiyorsa RED.
- **P8 — Görsel adap:** Arapça hat/mushaf görseli oyun içi yıpranabilir/parçalanabilir/kanla örtüşebilir bir yüzeyde mi? (Besmele tuğrası yalnız durağan UI'da; 3B dünyada yazılı Kur'an objesi modellenmez.)
- **P9 — Ses adabı:** Ezan/dua sesi sentetik mi (RED), kesiliyor mu, savaş SFX ile miksi ayarlı mı?
- **P10 — Test bağlaşımı:** Yeni dinî metne birebir substring assert'i yazıldı mı? Yazıldıysa gevşet (id/anahtar üzerinden assert; mevcut kötü örnek: `tests/systems.test.js:411` "Elhamdülillah" birebir metni — §6.9).

## 5.2 Riskli kalıplar kara listesi (R-serisi) — görüldüğü yerde düzeltilir

| # | Kalıp | Neden risk | Doğrusu |
|---|---|---|---|
| R1 | İbadet-ödül döngüsü ("namaz = +10 can") | İbadeti araçsallaştırır | §1.5 üç katman modeli |
| R2 | İbadet-ceza döngüsü ("namaz kaçırdın −moral") | Zorlama; dinde yeri yok | Katılmamak sonuçsuz |
| R3 | Âyetin bağlam dışı kullanımı (loot ekranında âyet vb.) | Tahrif izlenimi | Âyet yalnız kodeks/hutbe/dua bağlamında |
| R4 | Din adamının komik/aciz/açgözlü gösterilmesi | 18.1 ihlali | Bilge-vakur sabiti |
| R5 | Kutsal kavramla espri (zemzem, cennet, melek şakaları) | Hafife alma | Mizah dünyevi konularda |
| R6 | "Şehit ol" oynanış teşviki (ölümün ödüllendirilmesi) | K15 ile çelişir | Ölüm her zaman kayıptır; şehitlik anlatı katmanıdır |
| R7 | Sentetik/robotik ezan, ezanın ortadan kesilmesi | Ses adabı | §2.1.2 kayıt kuralı |
| R8 | Dua metinlerinin bildirim spam'i olması | Değersizleştirme | Günde 1 kural + sahne metni |
| R9 | Kıble/saf yönü tutarsızlığı (NPC'ler farklı yönlere secde) | Görsel yanlış öğretim | QIBLA_DIR tek sabiti |
| R10 | Mescid avlusunda çatışma/vuruş mekaniğinin sıradanlaşması | Mekân hürmeti | Mescid 15 m yarıçapında oyuncu saldırısı ekstra ağır kul hakkı bildirimi tetikler; düşman AI bu bölgeye pusu kurmaz (spawn/rota kontrolü) |
| R11 | Kurban kesiminin hayvan-kesme mekaniğiyle temsili | Adap + mevcut "koyun kes +10 erzak" mekaniğiyle karışır | Kurban yalnız metin/kodeks (§2.4.3) |
| R12 | AI (Gemini) kadısının şer'î hüküm/fetva verir görünmesi | Yapay zekâya fetva verdirmek kabul edilemez | Kadı hükmü "ikna ve maslahat değerlendirmesi" diye çerçevelenir; Gemini prompt'una guardrail: "dinî hüküm verme, yalnız gerekçenin adalet/ikna gücünü değerlendir"; çevrimdışı deterministik metinler §5.1'den geçirilir (`src/services/GeminiService.js:103-166` heuristik metinleri dahil) |
| R13 | PRAYING durumundaki NPC'nin öldürülebilir/itilebilir olması | Sahne saygısı | PRAYING NPC'ye vuruş = reaya vuruş cezasının 2 katı + anında kul hakkı bildirimi (CombatSystem reaya dalına tek koşul) |
| R14 | Hicri takvim/vakit hatası (bayramın yanlış güne düşmesi) | Yanlış öğretim | §2.4.4 R4 testi + tablo tek kaynak |

## 5.3 Denetim kayıt dosyası

**`docs/ISLAMIC_CONTENT_AUDIT.md` (YENİ DOSYA)** — tablo: `içerik id | dosya:satır | P1..P10 sonuçları | denetleyen | tarih`. Bağımsız denetçi kabulde bu dosyayı esas alır. Kabul kriteri: oyuna giren her `islamicContent.js` kaydının bu tabloda satırı vardır.

**Meal iktibası telif notu:** Diyanet Kur'an meali telifli bir eserdir. AUDIT dosyasının başına ve `ASSETS.md`'ye şu sabit satır eklenir: "Meal iktibasları kaynak gösterimiyle sınırlı tutulmuştur; yayın öncesi iktibas kapsamı hukuk kontrolünden geçirilecektir." Bu kontrol, Faz 5 yayın kapısına bağlanır (06-fazlar-ve-kabul.md Faz 5 çıkış denetimi).

---

# BÖLÜM 6 — MEVCUT İÇERİK DENETİMİ (envanter süzgeci)

Analiz envanterindeki tüm dinî metinler Ehl-i Sünnet ve adap süzgecinden geçirildi. Hüküm sütunu: **UYGUN** (dokunma), **DÜZELT** (metin/koşul değişikliği), **DEĞİŞTİR** (kurgu değişikliği).

| # | İçerik | Yer | Hüküm | Gerekçe / Yapılacak |
|---|---|---|---|---|
| 6.1 | İmam vaazları: adalet öğüdü, gaza ahlakı, zimmî hakkı ("Müslim olsun zimmî olsun...") | `DialogueSystem.js:107-178` | **UYGUN** | Ton ve muhteva Ehl-i Sünnet çizgisinde ve dönem-uygun; hutbe havuzuna şablon olur (§2.2.3). Tek ek: `source` alanlarıyla `islamicContent.js`'e taşınır. |
| 6.2 | "Elhamdülillah! Yarasını dağladık..." müjde repliği | `DialogueSystem.js:127` | **UYGUN** (koşul DÜZELT) | Metin uygun; seçeneğin görev-gating'siz tıklanabilmesi anlatıyı bozar → §4.2 madde 4. |
| 6.3 | Koca Dede: Murad Hüdavendigâr'ın şehadet duası ("Ya Rabbi, beni bu millet yoluna şehit eyle") | `DialogueSystem.js:321-348` | **DÜZELT (etiket)** | İçerik meşru ve kaynaklarda anlatılır; ancak **R etiketi** ile sunulmalı: Dede'nin ağzına bir cümle eklenir: "Ben duymadım evlat, ordugâhta böyle anlatılırdı" → kodeks bağlantısı R etiketli. (TARIHSEL doc §4.2 ilkesi birebir.) |
| 6.4 | Şehadet fail-state: "Şanın asırlarca yaşayacak" | `GameState.js:247-255` | **DÜZELT** | Dünyevi şöhret vurgusu → §4.3 madde 1 yeni metin. |
| 6.5 | Ali ölümü fail-state: taşlanarak linç | `GameState.js:236-245` | **DEĞİŞTİR** | Linç meşrulaştırması; kadı-azil kurgusuyla değiştirilir → §4.3 madde 2. |
| 6.6 | Besmele tuğrası ﷽ | `index.html:346` (başlık ekranı) + tımar defteri/kadı modalı süslemeleri | **DÜZELT (kural)** | Başlık ekranı ve defter/ferman parşömenlerinde UYGUN (Osmanlı kitabet geleneği, K1). Kural eklenir: tuğra, game-over/ölüm/kan ekranlarında ve buton içlerinde KULLANILMAZ (P8). Mevcut game-over overlay'i JS-inline üretilir (`UIManager.js:1204-1239`) — tuğra eklenmemiş olduğu doğrulanır, kural regresyonu önler. |
| 6.7 | Demirci/usta çalışma sahnesi | `VillagerAI.js:228-239` | **UYGUN + fırsat** | Örs vuruş döngüsüne günde bir kez "Bismillah… ya Allah!" iş nidası eklenebilir (K1 bağı; zanaat-besmele geleneği). P4 süzgeci: çırak azarlama mizahı (başka dokümanın önerisi) besmele repliğiyle AYNI sahne döngüsüne konmaz. |
| 6.8 | Selam/dua kalıpları: "Esselamü aleyküm ve rahmetullah", "Hızır yoldaşın olsun", "Cenab-ı Hak muzaffer kılsın", "Allah razı olsun" | `DialogueSystem.js:39,90,140,171,374,483,498,537,643` | **UYGUN** | Dönem-otantik halk kalıpları. "Hızır yoldaşın olsun" halk kültürü deyimidir, itikadî iddia içermez → C etiketiyle kalır. Doz kuralı (1.6) yeni metinlerde gözetilir. |
| 6.9 | Test bağlaşımı: birebir dinî metin assert'leri | `tests/systems.test.js:353,411` ("Hızır yoldaşın olsun", "Elhamdülillah") | **DÜZELT** | Metin düzeltmeleri (bu doküman + tarih dokümanı) testleri kırar. Assert'ler diyalog **id/dal varlığına** çevrilir (ör. `imam_talk` Ali dalının `outcome:'ali_saved'` bayrağı). P10 kuralı kalıcılaştırır. |
| 6.10 | Mescit onarımı arzuhali ("lodos çatıyı uçurdu… ahali cemaatle saf tutabilsin") | `PetitionSystem.js:27` | **UYGUN** | Dönem-uygun; ödülün morale-ezilme bug'ı ekonomi dokümanına kayıtlı (§2.3.3 not). |
| 6.11 | "İrfan eden ameleler boşa çıktı" bozuk cümle | `PetitionSystem.js:123` | **DÜZELT** | Dinî değil ama arzuhal/kadı bağlamında geçtiği için buradan da kayıt: "İşi biten ırgatlar boşta kaldı" yapılır. |
| 6.12 | Mescid modeli + hazire + servi mezarlık | `ModelBuilder.js:957-1021, 1405-1428`; `TownGenerator.js:172-208` | **UYGUN + görev** | Model uygun. Hazire şahideleri `interactables`'a bağlanınca (kanca: `TownGenerator.js:20` boş dizi) kitabe metinleri §5 protokolünden geçer; D14/D15 duaları buraya bağlanır. Kitabelerde gerçek kişi adı uydurulmaz; C etiketli kurgu adlar + A etiketli dönem bilgisi (başlık-meslek simgesi geleneği). |
| 6.13 | İmamın `workType:'innkeeping'` ve 24 saat çizelgesinde namazsızlık | `NPCManager.js:74`; `VillagerAI.js:85-119` | **DÜZELT** | §2.1.3 madde 8 ve PRAYING durumu bunu çözer. Ayrıca imam 22:00'de meydanda uyuyakalmamalı (VillagerAI eve dönüş bug'ı — bağımlılık). |
| 6.14 | Ulema fraksiyonu tanımı "Kadı & Din Alimleri (Hukuk, Adalet, Meşruiyet)" ve imam "Bilge & Adil" nitelemesi | `GameState.js:64,144` | **UYGUN** | 18.1 kuralıyla uyumlu; korunur. |
| 6.15 | Kadı hükmü akışı metinleri (5 sonuç tonu) + trol kelime listesi | `GeminiService.js:103-166`; `UIManager.js:648-681` | **DÜZELT (çerçeve)** | Akış bağlandığında (UI dokümanı) R12 uygulanır: modal başlığındaki "Kadı Efendi ve Köy İhtiyar Heyeti" ifadesi korunur ama hüküm metinlerine "fetva" kelimesi girmez; Gemini prompt'una dinî-hüküm-yasağı guardrail eklenir; 5 deterministik metin P-serisinden geçirilir (mevcut tonları uygun görünüyor, kayıt altına alınır). |
| 6.16 | "Gazi", "gaza", "şehadet şerbeti" söylemi geneli | GameState/Dialogue/HistoryEvent genelinde | **UYGUN** | K14-K15 dengeli çerçevesi kodekste verildiği sürece serbest; "küffar" kelimesi yalnız karakter ağzında (TARIHSEL doc §11 zaten emrediyor; README'deki kalıntılar tarih dokümanının işi). |
| 6.17 | Köyde ezan/namaz/cuma yokluğu (en büyük eksik) | `VillagerAI.js:85-119`; AudioManager | **DEĞİŞTİR (ekle)** | Bu dokümanın 2. bölümü bütünüyle bu boşluğu doldurur. |
| 6.18 | Hamam sahnesi ve tellak mizahı | `DialogueSystem.js:585+`; DEVELOPMENT_SPEC Özellik 1 | **UYGUN** | Hamam dünyevi mekândır; mizah serbest (1.4). Tek bağ: K9 vakıf maddesi hamamın varlığını tarihsel bağlama oturtur (TARIHSEL doc §3.2 hamam eleştirisine İslami-kurumsal cevap). "Masöz" kelimesi zaten "Tellak"a çevrilmiş (doc §11) — yeni metinlerde de tellak kullanılır. |

---

# BÖLÜM 7 — UYGULAMA SIRASI, BAĞIMLILIKLAR VE TEST KAPILARI

## 7.1 Aşamalara dağılım (TARIHSEL doc §13 yol haritasına eklemlenir)

| Aşama | Bu dokümandan giren işler | Ön koşul (başka dokümanlardan) |
|---|---|---|
| **Aşama 0 (sağlamlaştırma)** | §6.4, §6.5 fail-state metin değişimleri; §6.9 test gevşetme; `islamicContent.js` iskeleti + K1/K11/K17 (başlangıçta açık maddeler) | failState desc şema düzeltmesi (core); test altyapısı |
| **Aşama 1 (dirlik dikey kesiti)** | §2.1 ezan + PRAYING + oyuncu katılımı; §2.2 cuma; K2-K6, K10-K13, K20 kodeks; D1-D18 dua altyapısı | VillagerAI yürüyüş bug'ları (`VillagerAI.js:162,164-184`); AudioManager mute bug'ı; kodeks UI (tarih dok.) |
| **Aşama 2 (talim/hazırlık)** | §2.3 zekât+hayır arzuhalleri; §2.4.1-2.4.2 hicri ay + Ramazan; K7-K9, K18 | PetitionSystem morale bug'ı (ekonomi dok.); zaman temposu kararı (tempo dok.) |
| **Aşama 3-4 (sefer/Niğbolu)** | §2.4.3 bayramlar (bayram + ordugâh vinyeti); §4 Ali zinciri metinleri; K14-K15, K19 | CampaignBattleSystem bağlanması (savaş dok.); quest gating (görev dok.) |
| **Aşama 5 (denetim)** | §5.3 audit dosyasının tam taraması; ilahiyat yetkinliğine sahip bir okuyucuya son metin kontrolü (tarih danışmanı denetimine paralel — TARIHSEL doc Aşama 5 zaten dış denetim öngörüyor) | — |

## 7.2 Yeni/değişen dosyalar özeti

| Dosya | Durum | İçerik |
|---|---|---|
| `src/systems/PrayerTimeSystem.js` | YENİ | Vakit tablosu, pencere olayları, `getCurrentVakit` |
| `src/data/islamicContent.js` | YENİ | Dualar (18), hutbeler (6), kodeks (20), hikmet satırları, hicri ay tablosu — hepsi `source`+`confidence` alanlı |
| `docs/ISLAMIC_CONTENT_AUDIT.md` | YENİ | P-serisi denetim kayıtları |
| `src/entities/VillagerAI.js` | DEĞİŞİR | `PRAYING` durumu (5-9, 85-119, 192-273), EATING 12:50 kayması |
| `src/entities/NPCManager.js` | DEĞİŞİR | `prayerGroup` + `safIndex` alanları; imam `workType:'imam'` (74) |
| `src/core/AudioManager.js` | DEĞİŞİR | `loadAzanBuffers`, `playAzan`, ambient gain düşürme |
| `src/core/GameState.js` | DEĞİŞİR | `time.hijriDay/hijriMonthIndex`; `istikamet` seti; fail-state metinleri (236-255); zekât eylemi alanları |
| `src/systems/PetitionSystem.js` | DEĞİŞİR | 3 hayır arzuhali (16-53 havuzuna) |
| `src/systems/DialogueSystem.js` | DEĞİŞİR | İmam/attar/Ali metin ekleri; bayram selam varyantları; metinlerin `islamicContent.js`'ten okunması |
| `src/ui/UIManager.js` | DEĞİŞİR | HUD hicri ay/gün (1171), cuma/bayram rozeti, cemaat prompt'u |
| `public/audio/ezan.ogg`, `ezan_sabah.ogg`, `LICENSES.md` | YENİ VARLIK | Lisans belgeli insan sesi ezan kayıtları |

## 7.3 Test kapıları (tests/systems.test.js'e eklenecek asgari set)

- **T-İ1 (ilke):** Cemaat katılım fonksiyonu çağrılmadan önce/sonra `health/stamina/akce/cebeluExperience/sancakReputation` eşittir (≥5 assert).
- **T-İ2 (vakit):** `getCurrentVakit` 6 sınır değeri (E2).
- **T-İ3 (hicri):** `gameDayToHijri` 4 çıpa günü (R4) + `isFriday(7/14/21)`.
- **T-İ4 (veri bütünlüğü):** `islamicContent.js` içindeki her kaydın `source` ve `confidence` alanı dolu; dua sayısı ≥18, kodeks sayısı ≥20.
- **T-İ5 (zekât):** Nisâb altı/üstü hesap (Z1) + hayır arzuhali `income` yasağı (Z3).
- **T-İ6 (gating):** `quest_save_ali_leg` locked iken imam diyaloğunda Ali-teslim seçeneği yok (A-K4).
- **T-İ7 (metin adabı):** Otomatik tarama: `islamicContent.js` metinlerinde emoji karakteri yok (D-K4/P6).

## 7.4 Kapsam dışı (bilinçli)

- Namaz kıldırma/mini-oyun, abdest mini-oyunu, kurban kesim sahnesi (R11), oyuncuya oruç zorunluluğu, tasavvuf/tarikat içerikleri, fetva mekaniği, Kur'an tilaveti ses varlığı (ezan dışında tilavet kaydı eklenmez — miks ve adap riski), mevsimsel gerçek vakit hesabı (opsiyonel ertelendi §2.1.1).
- 1397 Karaman / 1402 Ankara içerikleri (TARIHSEL doc §14 zaten erteliyor) — o genişlemelerin dinî içeriği ayrıca denetlenir.

---

*Bu doküman `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` (§4.2, §5, §11, §13, §15, §18) ve 7 ajanlık kod analizi (analiz-tam.json) üzerine inşa edilmiştir; onlarla çelişen hiçbir karar içermez. Metin taslakları oyuna girmeden önce §5.1 P1-P2 doğrulaması zorunludur.*
