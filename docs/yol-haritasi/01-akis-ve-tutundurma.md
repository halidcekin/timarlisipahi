# Mülk-i Osmanî: Akış ve Tutundurma (Flow & Retention) Tasarım Dokümanı

**Doküman no:** 01 — Akış ve Tutundurma
**Sürüm:** 1.0 — 30 Ağustos 2026
**Bağlı olduğu dokümanlar:** `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` (bundan sonra: TARIHSEL), `docs/DEVELOPMENT_SPEC.md`, `docs/_calisma-arsivi/analiz-tam.json` (7 ajanlık kod analizi)

> **Bu doküman ne için:** Bu doküman, işverenin "insanların oynarken zamanın nasıl geçtiğini anlamayacağı, küçük nükte ve espirilerin olduğu akıcı bir oyun" hedefini, mevcut ~7000 satırlık Three.js kod tabanı üzerinde **dosya:satır düzeyinde uygulanabilir** tasarım kararlarına çevirir. İçinde: flow teorisinin bu oyundaki somut karşılıkları ve iç içe hedef döngüleri (Bölüm 1), zaman sisteminin yeniden dengelenmesi ve 1396 takvimine bağlanması (Bölüm 2), ilk 15 dakikanın dakika dakika yeniden tasarımı (Bölüm 3), ölü geri bildirim kanallarının öncelikli "juice" listesi (Bölüm 4), kayıt/oturum ritüeli (Bölüm 5), görev fiil çeşitliliği kalıpları (Bölüm 6), ekonomiye gider döngüsü (Bölüm 7) ve her kararın ölçülebilir kabul kriteri (Bölüm 8) vardır. Bu dokümanı uygulayacak geliştirici soru soramayacak; bu yüzden her madde (a) somut değer/metin içerir, (b) mevcut koda `dosya:satır` ile bağlanır, (c) denetçinin test edebileceği bir kabul kriteri taşır. TARIHSEL doc ile çelişmez; onun 5, 6, 9.7, 9.8 ve 18. bölümlerinin üzerine inşa eder.

---

## 0. Okuma Kılavuzu: Varsayımlar ve Teknik Plana Devredilen Bağımlılıklar

Bu doküman bir **tasarım** dokümanıdır; aşağıdaki çalışma-zamanı hataları **teknik onarım planının** (ayrı doküman) konusudur ve bu dokümandaki akış tasarımı bunların **düzeltilmiş olduğunu varsayar**:

| # | Bağımlılık (teknik planda çözülecek) | Kod referansı | Bu dokümandaki tüketicisi |
|---|---|---|---|
| B1 | Su İhtilafı görevi NPC'ye bağlanır (`water_dispute_talk` sahipsiz) | `DialogueSystem.js:357`, `QuestSystem.js:51` | Bölüm 3, 6 |
| B2 | Pusula görev iğnesi 180° ters; hedef metni `undefined` | `UIManager.js:869-876, 884` | Bölüm 1, 3 |
| B3 | "Sefere Katıl" butonu görev önkoşuluna kilitlenir | `UIManager.js:340-364`, `GameState.js:127-137` | Bölüm 1, 3 |
| B4 | Bildirim render'ı her karede yeniden kurulmaz (animasyon görünür olur) | `UIManager.js:1249-1260` | Bölüm 4 |
| B5 | `world-marker` CSS'i yazılır (işaretçiler görünür olur) | `UIManager.js:1049-1129` + `style.css` | Bölüm 4 |
| B6 | Başlangıç ekranı çift buton bağlama kaldırılır (ses butonu çalışır) | `main.js:87-131` + `UIManager.js:162-202` | Bölüm 3 |
| B7 | `SaveManager` oyuna bağlanır; `serializeState`'e `aliStatus`, `activeCampaign`, `currentPetition` eklenir | `SaveManager.js:41-57, 208` | Bölüm 5 |
| B8 | Minimap landmark koordinatları `TownGenerator` gerçeğiyle eşitlenir | `UIManager.js:936-942` vs `TownGenerator.js:174, 293, 390` | Bölüm 3 |
| B9 | Ev içleri girilebilir olur **veya** oyuncu yatağı konak avlusuna/sofasına taşınır (evler katı blok, sedirler taşın içinde gömülü) | `TownGenerator.js:868-885`, `ModelBuilder.js:868-874` | Bölüm 2.4 (uyku) |
| B10 | `CampaignBattleSystem` (5 safhalı Niğbolu) UI'a bağlanır; `simulateNigboluCampaign` tek-tık yolu kaldırılır | `CampaignBattleSystem.js:26-187`, `HistoryEventSystem.js:38-81` | Bölüm 1.4, 8 |
| B11 | `taxCollectedThisYear` mevsim başına değil yılda bir sıfırlanır | `GameState.js:261`, `TimarSystem.js:11` | Bölüm 7 |
| B12 | `modifyReayaTrust`'ın `timar.morale`'i ezmesi giderilir (tek yazar) | `GameState.js:168-170`, `TimarSystem.js:25,75` | Bölüm 7 |
| B13 | Görev günlüğü kilitli görevleri gizler (spoiler önlenir) | `UIManager.js:485-500` | Bölüm 3 |
| B14 | `advanceObjective` kilitli görevi aktive edemez (activate/progress ayrımı) | `QuestSystem.js:439-441` | Bölüm 6 |

**Terminoloji:** "Oynanır gün" = oyuncunun içinde gezindiği takvim günü. "Atlama kartı" = perde/bölüm arası zaman sıkıştırma ekranı (TARIHSEL 18.2). A/B/C/R = tarihsellik güven etiketi (TARIHSEL 4.2).

**İslami içerik çerçevesi (tüm bölümler için bağlayıcı):** İçerik Ehl-i sünnet çizgisinde, Osmanlı bağlamına uygun olarak Hanefî fıkhı ve Mâturîdî itikadı esas alınarak yazılır; yalnız sahih/muteber kaynaklardan beslenir; uydurma rivayet, mezhep tartışması ve modern polemik yer almaz. Din adamları, ibadet ve dinî değerler **asla** mizah nesnesi olmaz (TARIHSEL 18.1). Mizah dünyevi hayatta yaşar: esnaf, köylü, hamam, çarşı, asker arası muhabbet.

---

## 1. Flow Teorisi Uygulaması

### 1.1 Üçlü sacayağı: bu oyunda neye karşılık geliyor

Flow (akış) hali üç şart ister: **net hedef**, **anlık geri bildirim**, **beceri-zorluk dengesi**. Mevcut oyunda üçü de kırıktır: hedef katmanı tek bir (üstelik tamamlanamayan) görev kartıdır, geri bildirim kanallarının çoğu ölüdür (Bölüm 4'teki liste), zorluk eğrisi ise yoktur (sefer 1. dakikada tek tıkla kazanılıyor). Karşılıklar:

| Flow şartı | Bu oyundaki somut karşılığı | Kod bağlantısı |
|---|---|---|
| **Net hedef** | 3 katmanlı hedef HUD'u: "Şimdi" (aktif hedef cümlesi), "Bugün" (sabah divanında verilen 2-3 iş), "Sefer" (Niğbolu hazırlık göstergesi). Görev kartı `#quest-title` alanı genişletilir; birkaç saniye sonra tek satıra küçülür (TARIHSEL 9.9). | `UIManager.js:1152-1188` (updateHUD görev bloğu), `QuestSystem.js:536-561` (syncWithGameState) |
| **Anlık geri bildirim** | Her oyuncu eyleminin ≤100 ms içinde en az iki kanaldan (görsel+işitsel) yanıtlanması. Ölü kanalların dirilme sırası Bölüm 4'te. | `UIManager.js:1249-1260`, `Player.js:72-74`, `AudioManager.js` |
| **Beceri-zorluk dengesi** | Talimlerde bronz/gümüş/altın dereceler (TARIHSEL 8. bölüm tablosu); harami karşılaşması ancak Perde I'in 3. gününde açılır; Niğbolu safhaları hazırlık puanına göre tolerans değiştirir (B10). Kolaylaştırma: aynı talimde 3 başarısızlıkta "bronz ile geç" seçeneği belirir. | `TrainingSystem.js:22-150` (ölü sistem — teknik plan bağlar), `CampaignBattleSystem.js:40-95` |

**"Zamanın nasıl geçtiğini anlamama" hissinin formülü:** oyuncu hiçbir an "şimdi ne yapacağım?" diye boşta kalmaz (hedef), yaptığı her şey anında "tık" diye karşılık bulur (geri bildirim) ve bir sonraki hedef hep bir öncekinden ulaşılabilir mesafede durur (denge). Aşağıdaki iç içe döngüler bu formülün zaman ölçekleridir.

### 1.2 İç içe hedef döngüleri (nested loops)

Dört ölçek; her biri bir üsttekini besler. Kural: **her döngü kapanışında bir "kapanış anı"** (ödül + kısa özet + sonraki hedefin teaser'ı) vardır — bu an, oyuncunun "bir tur daha" demesini sağlayan kancadır.

#### Döngü A — Mikro eylem (1-3 dakika)

Tek fiillik işler. Her mikro eylemin şeması: *hedef cümlesi → eylem → çift kanallı geri bildirim → küçük ödül → sıradaki hedefin görünmesi.*

| Mikro eylem | Süre | Geri bildirim | Ödül | Kod kancası |
|---|---|---|---|---|
| Bir hane teftişi (defter vs saha karşılaştırma) | 2 dk | Defter sayfasına "mühür" damgası animasyonu + `playNotification` | +Reaya güveni veya kayıt notu | `QuestSystem.js:16-50` (quest_inspect genişletmesi, Bölüm 6.1) |
| Bir arzuhal kararı | 1-2 dk | Kadı hükmü modalı + akçe sayacı animasyonu | inşaat kuyruğu / moral | `PetitionSystem.js:16-53`, `UIManager.js:587` (Gemini akışı — teknik plan bağlar) |
| Talim seti (5 blok / 5 vuruş / 5 ok) | 2-3 dk | vuruş hit-stop + isabet halkası metni + derece rozeti | ustalık puanı (bronz/gümüş/altın) | `ArcherySystem.js:146-183`, `TrainingSystem.js:22-125` |
| Demirci/attar alışverişi | 1 dk | `playCoinJingle` + envanter satırı | teçhizat/merhem | `DialogueSystem.js:180-236, 462-484` |
| Bir NPC sohbeti (havadis/mizah/kodeks) | 1-2 dk | yeni kodeks kartı rozeti | bilgi + 1 nükte | `DialogueSystem.js` düğümleri; alias soketleri `DialogueSystem.js:654-661` |

**Kabul kriteri A:** Oyunun herhangi bir anında, oyuncunun 60 saniye içinde başlatıp 3 dakika içinde kapatabileceği en az 2 mikro eylem erişilebilir olmalı (ölçüm: aktif hedef + arzuhal + talim erişilebilirlik bayraklarını okuyan basit sayaç objesi — bkz. §8.1 K1 ölçüm notu — veya manuel gözlem çizelgesi; ayrı telemetri altyapısı kurulmaz).

#### Döngü B — Görev/Gün (10-15 dakika)

Bir oyun günü = orta döngü. TARIHSEL 6. bölümdeki ritim birebir uygulanır ve **namaz vakitleriyle çerçevelenir** (Bölüm 2.3):

1. **Sabah divanı (uyanış/08:00):** Kethüda konak önünde bekler; günün 2-3 işi + bekleyen arzuhal burada verilir. (Arzuhaller artık 45 sn'lik rastgele zamanlayıcıyla değil — `PetitionSystem.js:60-73` — şafakta üretilir; Bölüm 2.5.)
2. **Saha işi (öğleye kadar):** aktif görev fiili (incele/taşı/iz sür...).
3. **Talim/bakım (öğleden ikindiye):** talimgâh, at bakımı, teçhizat tamiri.
4. **Riskli iş (ikindi-akşam):** devriye, harami izi, yolculuk.
5. **Akşam hesabı (yatsı civarı):** gün özeti ekranı (Bölüm 5.2) + uyku → otomatik kayıt → yeni gün.

**Kabul kriteri B:** Bir oyun günü (uyanış→uyku) medyan 12-18 gerçek dakika sürmeli (kronometreli playtest gözlem çizelgesi); akşam hesabı ekranı %90+ oturumda görüntülenmeli.

#### Döngü C — Perde / sefer hazırlığı (45-90 dakika)

Bir perde = 5-8 oynanır gün + atlama kartı. Perde kapanışları: Perde I sonu "berat mührü basılır" vinyeti; Perde II sonu Ramazan bayramlaşması; Perde III sonu Gelibolu'da gemiye biniş; Perde IV = Niğbolu. Her perde kapanışında **perde karnesi** gösterilir: reaya güveni / sancak itibarı / bölük sadakati değişimi + "bu kararın seferde karşına çıkacak" ibaresi (TARIHSEL 17. bölümün üç sorusu).

**Kabul kriteri C:** Her perde tek oturumda (45-90 dk) bitirilebilir olmalı; perde karnesinde en az 3 geri dönecek karar listelenmeli.

#### Döngü D — Kampanya (Niğbolu, ~8-11 saat toplam)

Kampanya hedefi HUD'daki "Sefer Hazırlık Defteri" ile sürekli görünür: cebelü sayısı/talimi, erzak, ok, nal, at kondisyonu, yoklama notu (`SupplySystem.js:89-123` iskeleti — teknik plan bağlar). Bu defter, B10 ile bağlanan 5 safhalı muharebede somut avantaja çevrilir (ör. ok stoğu 2. safhada yaylım sayısını belirler). Böylece "neden talim yapıyorum?" sorusunun cevabı oyunun ilk saatinden itibaren ekranda durur.

**Kabul kriteri D:** Hazırlık defterindeki en az 5 kalemin her biri Niğbolu safhalarından en az birinde ölçülebilir fark üretmeli (savaş metin-taktik olduğundan bot/otomatik koşu GEREKMEZ: `CampaignBattleSystem`'i düşük ve yüksek `SupplySystem` durumuyla çağıran iki birim test arasında sonuç farkı).

### 1.3 Boşluk anlarının doldurulması

Flow'u öldüren şey boşluktur. Mevcut `updateStoryGuidance` (`main.js:215-240`) 100 sn'de bir tek tip mesaj basar. Yeniden tasarım: bağlama duyarlı üç kanal —

- **Yönlendirme:** aktif hedef 40 m'den uzaksa ve oyuncu 90 sn'dir hedefe yaklaşmadıysa tek satır hatırlatma (mevcut iskelet korunur, metin havuzu 8 varyanta çıkarılır — tekrar hissi kırılır).
- **Dünya nabzı:** hedefe yürürken yol üstü mikro sahneler: demirci örs kıvılcımı + usta-çırak azarı (`VillagerAI.js:228-239` senkronu hazır), saka su esprisi, meydan dedikodusu. Bunlar *durmayı gerektirmez*; yürürken duyulur/okunur (baloncuk).
- **Vakit nabzı:** ezan vakti bildirimi + köylülerin mescide yönelmesi (Bölüm 2.3) — oyuncuya saati menüden değil dünyadan okutur.

**Kabul kriteri:** Tek 10 dakikalık serbest keşif ekran kaydında oyuncunun 60 sn'den uzun "sıfır uyaran" penceresi olmamalı. **Sayılabilir "uyaran" tanımı (K16 ile aynı):** (a) ekranda beliren bildirim/diyalog baloncuğu, (b) HUD hedef satırı değişimi, (c) adım/ortam gürültüsü dışında duyulur ses olayı (vakit bildirimi, replik, çevre sesi vurgusu), (d) görüş alanında NPC mikro-sahnesi (örs kıvılcımı, usta-çırak azarı, mescide yöneliş). Protokol: tek kayıt alınır, uyaranlar kayıt üzerinde zaman damgasıyla işaretlenir; bu dört sınıfın dışındaki hiçbir şey uyaran sayılmaz.

---

## 2. Zaman Sistemi Yeniden Dengesi

### 2.1 Teşhis ve yeni değer

Mevcut: `daySpeed: 0.003` (`GameState.js:116`), `dayTimeHours += delta * daySpeed` (`GameState.js:213`). Yani 1 oyun saati = 1/0.003 ≈ 333 gerçek saniye (5,6 dk); tam gün ≈ 2 saat 13 dk. Ayrıca `PetitionSystem.js:63-64` kendi "45 saniye = 1 gün" sayacıyla `gameState.daysPassed`'i bağımsız artırır — iki ayrı zaman gerçeği vardır.

**Karar Z1 — Yeni değer: `daySpeed = 1/60 ≈ 0.01667`.** Ezberlenebilir kural: **1 gerçek saniye = 1 oyun dakikası; 1 gerçek dakika = 1 oyun saati.**

Gerekçe:
- Aktif gün (05:30-22:00, 16,5 oyun saati) ≈ **16,5 gerçek dakika** → Döngü B'nin 10-15 dk hedefiyle örtüşür (uyku atlamasıyla net oynanış ~12-15 dk).
- 2 dakikalık bir diyalog 2 oyun saati "yer" — gün içinde 4-6 anlamlı iş sığar; oyuncu gün planı yapmaya zorlanır ama sıkboğaz olmaz.
- Gece-gündüz döngüsü ve gökyüzü değişimi (Engine `updateDayNight`) bir oturumda defalarca yaşanır; "zaman geçiyor" hissi görsel olarak beslenir.

**Karar Z2 — Tek zaman otoritesi:** `GameState.updateTime` tek gün sayacıdır. `PetitionSystem.js:64`'teki `daysPassed += 1` kaldırılır; arzuhal üretimi ve inşaat ilerlemesi gün-dönümü kancasına (`GameState.js:214-233`) taşınır (Bölüm 2.5).

**Karar Z3 — Modal açıkken zaman durur:** Diyalog, tımar defteri, harita, günlük ve arzuhal modalları açıkken `updateTime` çağrılmaz (`main.js:253`'e `ui.isAnyModalOpen()` kapısı). Okumak oyuncuyu cezalandırmamalı. Savaş ve açık dünyada zaman akar.

| Büyüklük | Eski (0.003) | Yeni (0.01667) |
|---|---|---|
| 1 oyun saati | 5,6 dk | **60 sn** |
| Tam gün (24 saat) | 2 sa 13 dk | **24 dk** |
| Aktif gün (05:30-22:00) | ~1 sa 32 dk | **16,5 dk** |
| Uyku ile atlanır kısım | — | ~7,5 saat → 8 sn geçiş |
| Ali'nin 3 günlük mühleti | ~6 sa 40 dk | **72 dk tavan; uykuyla ~50-55 dk oynanış** |
| Mevsim (eski: 10 gün kuralı) | ~22 saat | **kaldırıldı → takvim ayı** (Z4) |
| Yıl (eski: 40 gün) | ~89 saat | **kaldırıldı → kampanya takvimi** (Z4) |

### 2.2 Takvim: soyut gün sayacından 1396 takvimine

**Karar Z4 — Gerçek takvim:** `dayCount % 10 == 0 → advanceSeason` kuralı (`GameState.js:230-232`) ve `year++` mantığı (`GameState.js:263-268`, zaten sıralama hatasıyla ölü) kaldırılır. Yerine `GameState.time`'a `calendarDay` (kampanya günü indeksi) ve türetilmiş `{gün, ay, yıl, hicriGün, hicriAy, haftaGünü}` alanları gelir. Kampanya **1 Mart 1396**'da başlar, **25 Eylül 1396** (Niğbolu) ile biter (TARIHSEL 5. bölüm sabit kararı). Mevsim, takvim ayından türetilir (Mart-Mayıs ilkbahar, Haziran-Ağustos yaz, Eylül güz).

**Karar Z5 — Asimetrik zaman / atlama kartları (TARIHSEL 18.2):** 209 takvim günü, ~28 **oynanır güne** sıkıştırılır. Bölümler arası atlamalar tam ekran "atlama kartı" ile anlatılır: geçen süre, köyde olanlar (2-3 satır), mevsimlik gelir-gider dökümü (Bölüm 7 ile entegre), bir tarih vinyeti (A/B etiketli). Atlama kartı aynı zamanda otomatik kayıt anıdır.

**Kampanya takvimi tablosu** (perde → bölüm → tarih → oynanır gün; bölüm içerikleri TARIHSEL 5. bölümden):

| Perde | Bölüm (TARIHSEL) | Takvim penceresi | Oynanır gün | Atlama sonrası kart |
|---|---|---|---|---|
| I | 0 Beratın Mührü | 1 Mart | 1 | — |
| I | 1 Defter ile tarla | 2-3 Mart | 2 | — |
| I | 2 Su hakkı | 4-5 Mart (4'ü Cuma öncesi; cuma sahnesi 3 Mart'a da alınabilir, bkz. Z7) | 2 | — |
| I | 3 Yoklama günü | 6 Mart | 1 | **Atlama #1:** "Altı hafta geçti — tarlalar yeşerdi" (→ 15 Nisan) |
| II | 4 Ali'nin talimi | 15-16 Nisan | 2 | — |
| II | 5 Yaylakta ok | 17 Nisan | 1 | — |
| II | 6 Harami değil, iz | 18-19 Nisan | 2 | **Atlama #2:** "Bahar bitti, sıcak bastırdı" (→ 8 Haziran, Ramazan) |
| II | Ramazan segmenti + 7 Hanın yabancısı | 8-10 Haziran (Ramazan'ın ilk günleri) | 3 | **Atlama #3:** "Ramazan tamam oldu, bayram geçti, orak vakti geldi" (→ 3 Ağustos) |
| III | 8 Tuğ çağrısı (hasat ortasında ferman!) | 3-5 Ağustos | 3 | — |
| III | 9 Sancak yoklaması | 6 Ağustos | 1 | — |
| III | 10 Gelibolu geçişi | 10-11 Ağustos | 2 | **Atlama #4:** "Rumeli yolu" (→ 20 Ağustos) |
| IV | 11 Çok dilli ordugâh | 20-21 Ağustos | 2 | **Atlama #5:** "Tuna'ya yürüyüş" (→ 10 Eylül) |
| IV | 12 Tuna'ya zor yürüyüş | 10-12 Eylül | 3 | — |
| IV | Kurban Bayramı ordugâhta (bkz. Z6) | 14 Eylül | 1 | **Atlama #6:** "Niğbolu önlerine" (→ 24 Eylül) |
| IV | 13 Niğbolu gecesi | 24 Eylül | 1 | — |
| IV | 14 Meydan Muharebesi | 25 Eylül | 1 | — |
| IV | 15 Zaferin bedeli | 26-27 Eylül | 2 | Final |
| | | **Toplam** | **≈28 gün** | ≈ 8-11 saat ana yol |

> **Ç1 uyum notu (`06-fazlar-ve-kabul.md`):** Ç1 kararı bu tablodaki miladi tarihleri kaydırarak uygular (kampanya başı **1 Nisan 1396**); kaydırma esas olarak Perde I-II'yi etkiler, Perde III-IV çıpaları (3 Ağustos ferman, 25 Eylül Niğbolu) sabit kalır. Gün-gün tam eşleme yalnız 06'nın **F2-02 perde tablosudur**; bu tablo veya §2.3 çıpaları ile F2-02 çelişirse **F2-02 esastır** — buradaki tarihler Ç1 öncesi taslak değerlerdir, hicri eşlemeler F2-02 üzerinden yeniden türetilir.

### 2.3 Hicri takvim, namaz vakitleri ve dinî takvim çıpaları

`hijriYear: 798` alanı zaten var (`GameState.js:112`) ama işlenmiyor. Yeni takvimle birlikte hicri gün/ay da türetilir. Çıpalar (Jülyen↔Hicri çevrimi hesaplanmıştır; **B etiketi — ±1-2 gün kayma payı**, tarih danışmanı doğrulaması Aşama 5'te):

| Olay | Miladi (Jülyen) | Hicri | Etiket | Oyundaki kullanımı |
|---|---|---|---|---|
| Kampanya başı | 1 Mart 1396 (Çarşamba) | ~19 Cemâziyelevvel 798 | B | HUD çift takvim (`index.html:104-108` zaten çift gösterim yapıyor) |
| İlk cuma | 3 Mart 1396 | — | B | İlk cuma namazı sahnesi; `quest_imam` buraya bağlanır (Bölüm 6) |
| Ramazan başı | ~8 Haziran 1396 | 1 Ramazan 798 | B | Ramazan segmenti (aşağıda) |
| Ramazan Bayramı | ~8 Temmuz 1396 | 1 Şevval 798 | B | Atlama #3 kartında bayramlaşma vinyeti |
| Kurban Bayramı | ~14 Eylül 1396 | 10 Zilhicce 798 | B | Ordugâhta bayram namazı + kurban sahnesi (vinyet — kesim mekaniği yok, bkz. `04-islami-icerik.md` §2.4.3) — savaştan 11 gün önce; ordunun manevi hazırlığı (tarihe uygun, güçlü an) |
| Niğbolu | 25 Eylül 1396 (Pazartesi) | 21 Zilhicce 798 | A | Final |

**Karar Z6 — Ramazan segmenti (Perde II):** Tarihî takvim hediyesi: Ramazan 798, kampanya penceresinin tam ortasına düşer. 3 oynanır günlük segment: gündüz köy ritmi yavaşlar (öğle yemek yığılması yerine — `VillagerAI.js:98-104` — köylüler işte ağır çalışır), akşam **iftar sofrası** meydanda kurulur (sosyal toplanma sahnesi), yatsıdan sonra mescidde **teravih** (NPC'ler mescide yönelir). Oyuncuya oruç bir sayaçla dayatılmaz (angarya riski, TARIHSEL 15); iftar/sahur sahneleri atmosfer ve diyalog taşıyıcısıdır. Sefer/yolculuk ruhsatı imam diyaloğunda doğru fıkhî çerçevede anlatılır (Hanefî kaynaklarına uygun, sahih içerik). Bölüm 7 (Hanın yabancısı) bu segmentin içinde geçer: iftar sofrasındaki yabancılar, soruşturmaya doğal sahne kurar. **Mizah kuralı hatırlatması:** iftar sofrası muhabbeti (yemek, uyku, pide kavgası) mizaha açıktır; oruç, namaz, teravih **asla** espri konusu olmaz.

**Karar Z7 — Namaz vakitleri gün çerçevesi olur:** Gün, saat sayısıyla değil vakitlerle okunur. Mevsimlik sabit tablo (C etiketi — oynanış için stilize):

| Vakit | İlkbahar | Yaz | Oynanış işlevi |
|---|---|---|---|
| İmsak/Sabah | 05:30 | 04:45 | Uyanış, otomatik kayıt, sabah divanı öncesi |
| Öğle | 12:15 | 12:30 | Sabah işinin kapanışı; cuma günü cuma namazı (köy mescide akar) |
| İkindi | 15:45 | 16:30 | Talim penceresinin kapanışı |
| Akşam | 18:30 | 19:45 | Riskli iş bitişi; Ramazan'da iftar |
| Yatsı | 20:00 | 21:15 | Akşam hesabı + uyku penceresi |

Uygulama: `VillagerAI.evaluateSchedule`'a (`VillagerAI.js:85-119`) kısa `PRAYING` durumu eklenir (mescide yöneliş; entities analizindeki hazır kanca). **Ezan sunumu kararı:** prosedürel Web Audio ile "sentetik ezan" ÜRETİLMEZ — kötü bir sentez, ibadeti karikatürleştirme riski taşır (18.1 kuralının ruhu). v1: bildirim metni ("Öğle ezanı okunuyor") + köylü davranışı + pusulada kıble/mescid vurgusu (`UIManager.js:848-856` yön tablosu kancası). v2: lisanslı, muteber bir ezan kaydı düşük seste ve mesafeye bağlı (`AudioManager` mevcut mesafe mantığı yok; teknik plana not).

### 2.4 Uyku ve zaman atlama mekaniği

**Karar Z8 — Uyku:** Konak sofasındaki sedire `E` ile etkileşim (interactables dizisi boş — `TownGenerator.js:20` — teknik plan doldurur; **B9 bağımlılığı:** evler katı blok olduğundan v1'de oyuncu yatağı konak avlusuna/sofaya, yani açık alana konur). Menü: **"Sabah ezanına dek uyu"** (→ imsak) / **"Bir vakit dinlen"** (+3 saat). Uyku sırasında `daySpeed` 60× hızlanır (1 sn ≈ 1 oyun saati): gökyüzü döner, ~8 saniyelik görsel geçiş — ani kesme yerine "zaman aktı" hissi (Engine `updateDayNight` bunu bedavaya sağlar).

Kurallar:
- Uyku = **otomatik kayıt** (Bölüm 5.1) + kuvvet tam dolar + sıhhat +20 (tam dolmaz — hamam ve attar değerini korur, `DEVELOPMENT_SPEC` Özellik 1 ile tutarlı).
- 40 m içinde düşman varsa uyunamaz ("Buralar emin değil beyim").
- Zaman baskılı görev (Ali mühleti) varken uyumak sayacı işletir; uyku menüsünde kırmızı uyarı satırı gösterilir ("Ali'nin yarası ağır — 2 gün kaldı"). Bilerek risk almak oyuncunun hakkıdır.
- Sefer perdelerinde (III-IV) yatak yerine **ordugâh ateşi** aynı işlevi görür.

**Karar Z9 — Ali mühleti yeni tempoda:** `GameState.js:220-227` sayacı `dayCount` üzerinden zaten işler; yeni tempoda 3 gün = 72 dk tavan, tipik 50-55 dk — tek oturumluk gergin bir yay. Eklenenler: (a) HUD görev kartında kalan gün rozeti, (b) her şafakta imamdan durum bildirimi ("yara kötüleşiyor"), (c) mühlet dolduğunda ani fail yerine **son fırsat sahnesi**: imam başucunda son bir "dağlama" seçeneği sunar (başarı şansı düşük, `attar` merhemi alındıysa yükselir) — TARIHSEL 15 "kurtarma yolu tasarlanmalı" ilkesi. Fail-state metinleri (`GameState.js:236-245`) korunur.

### 2.5 Arzuhal ve inşaatın yeni tempoya bağlanması

`PetitionSystem`'in 45 sn zamanlayıcısı (`PetitionSystem.js:10, 59-64`) kaldırılır. Yeni kural: her şafakta (gün-dönümü kancası `GameState.js:214-233`) %45 ihtimalle 1 arzuhal üretilir; bekleyen arzuhal varken yenisi gelmez; arzuhal **sabah divanında** sunulur (Döngü B'nin 1. adımı). Cevaplanmayan arzuhalde ertesi şafak `hasPendingMessenger` (`PetitionSystem.js:80`) gerçek bir köylü NPC'sini oyuncuya koşturur (narrative analizindeki hazır kanca) — "vaat edilen sahne" gerçekten oynanır. İnşaat süreleri gün bazında kalır (ör. kuyu 1 gün ≈ 1 oturum içi; değirmen 4 gün ≈ atlama kartında biter — kart metnine "değirmenin çatısı örtüldü" satırı düşer).

**Kabul kriterleri (Bölüm 2):**
- Z1: `daySpeed === 1/60`; otomatik test: 60 sn simülasyonda `dayTimeHours` +1.0 (±0.01) artar.
- Z2: `grep daysPassed src/systems/PetitionSystem.js` → yazma erişimi yok; gün sayacının tek yazarı `GameState.updateTime`.
- Z3: diyalog modalı 5 dk açık tutulunca `dayTimeHours` değişmez.
- Z4/Z5: HUD, atlama kartı ve kayıt dosyası aynı tarihi gösterir (tutarlılık kapısı, TARIHSEL 15 test kapıları #2); 25 Eylül günü `quest_campaign` finali tetiklenir.
- Z8: uyku sonrası `time` imsak değerinde, kayıt slotu güncellenmiş, kuvvet=100.
- Z9: Ali yayı playtestte medyan 45-75 dk'da çözülür; mühlet dolumunda son fırsat sahnesi %100 tetiklenir.

---

## 3. İlk 15 Dakika Yeniden Tasarımı

playerTrace bulgularına dakika dakika cevap. Varsayım: B1-B8, B13 çözüldü. Hedef: ilk 15 dakikada oyuncu **3 farklı fiil**, **1 ahlaki karar**, **1 mizah anı**, **1 kodeks kartı**, **1 görünür otomatik kayıt** yaşar ve hiçbir an 60 sn'den uzun hedefsiz kalmaz.

### 3.1 Dakika dakika akış

| Dakika | Yeni deneyim | Cevap verdiği playerTrace bulgusu | Kod kancası |
|---|---|---|---|
| 0:00-0:40 | Başlangıç ekranı: tek hoş geldin, çalışan ses düğmesi, prosedürel sipahi kartında 1 satır mizahlı kusur ("Değirmen taşı çatlak, kethüda dert küpü") | çift binding, çift cıngıl (dk 0:30) | `UIManager.js:367-376` (updateStartScreenInfo — hazır yuva), B6 |
| 0:40-1:30 | **Açılış: konak sofasında uyanış.** Oyuncu sedirde gözünü açar (uyku mekaniğinin ilk karesi = öğretimi bedava). Sabah ışığı, kuş sesi. Tek hedef satırı: "Kethüda Koca Yakub kapıda bekliyor." | Oyun meydanda kılıç elde başlıyordu; silah HUD karmaşası | Başlangıç pozisyonu `main.js` Player spawn; `swordDrawn:false` başlangıcı (`Player.js:18`) — kılıç kında başlar, Q öğretimi dk 7'ye taşınır |
| 1:30-4:00 | **Sabah divanı = eski quest_inspect:** Yakub öşür kararını sorar (yetimleri affet ↔ tam tahsil — oyunun en iyi anı korunur). Diyalog açılır açılmaz görev ilerletmez; karar **seçilince** ilerler. Kapanışta Yakub günün 3 işini sayar: "değirmen arkı, demirci, mescid" → "Bugün" hedef listesi dolar | dk 1'de onOpen ile bedava görev ilerlemesi ("bir şey mi yaptım?"); "haramiler" bilgi dalının vergi hedefini tamamlaması | `DialogueSystem.js:21-23` (onOpen kaldırılır, karar düğümüne taşınır), `DialogueSystem.js:74-95` (harami dalı hedef bağı kesilir) |
| 4:00-7:00 | **Su İhtilafı (yeniden tasarlanmış, Bölüm 6):** pusula artık doğru yönü ve "Değirmen Arkı (38m)" metnini gösterir. Yerinde: kırık set **incelenir** (E ile 2 nokta), değirmenci NPC'si tanıklık eder. İlk fiziksel fiil: "incele". | Tamamlanamayan görev + ters pusula + `undefined` metin (dk 4-10 çöküşü) | B1, B2; `QuestSystem.js:51-75` yeni hedef tipleri |
| 7:00-8:30 | Arka dönüşte köprüden geçilir (collider düzeltmesi teknik planda, F0-14); **ilk mizah anı:** Saka İbrahim yol üstünde — açılış repliği 02-mizah §3-a'daki saka_talk metnidir ("...kuyunun ipi benden evvel emekliye ayrıldı..."). NOT (Ç4): bu tabloda daha önce yer alan "zemzem" esprisi 04-islam §1.4 ve 02-mizah §1.3 gereği KULLANILMAZ. | köprü görünmez duvar; Saka E'ye basınca sessiz | `NPCManager.js:189-193`, `DialogueSystem.js` yeni saka_talk düğümü |
| 8:30-10:00 | Su hükmü: Molla Şemseddin'e götür **veya** iki haneyi uzlaştır (iki çözüm yolu). Karar sonrası **ilk kodeks kartı** açılır: "Osmanlı'da su hakkı ve kadı" (C etiketi) + rozet animasyonu | görev zinciri kilitlenmesi; ödül hissizliği | `QuestSystem.js:485-511` completeQuest + kodeks kancası |
| 10:00-11:00 | Öğle ezanı bildirimi; köylüler mescide/yemeğe akar — dünya "yaşıyor" anı. Cuma ise (3 Mart) cuma sahnesi: meydan boşalır, kısa hutbe vinyeti (metin, muteber içerik) | öğlen NPC kaybolması kafa karışıklığı (dk 25-33) — artık *anlatılan* bir ritim | `VillagerAI.js:85-119` + Z7 |
| 11:00-13:30 | **Demirci Rüstem:** kılıç bileme + Q öğretimi ("pusatını kuşan" — ilk kez burada). Talimgâhda 3 vuruşluk mini talim: **gerçek manken modeli** önünde hit-stop'lu ilk vuruş hissi. İkinci fiil: "vur/talim" | görünmez manken absürtlüğü; R/Q tuşlarının rehberde olmaması | `CombatSystem.js:296-319` (manken modeli teknik plan), `index.html:132-138` tuş rehberi güncellemesi |
| 13:30-15:00 | Konağa dönüş → **akşam hesabı ekranı** (ilk kez, 3 satır özet + yarın teaser'ı: "Handa bir yabancı görülmüş...") → sedirde uyku → **"Kaydedildi" mührü** ekranın köşesinde. | kayıt yokluğu; oturum kapanış ritüeli yokluğu | Bölüm 5.1-5.2 |

### 3.2 İlk 15 dakikada bilinçli olarak YAPILMAYANLAR

- Sefer haritasında "Sefere Katıl" **görünür ama mühürlü**: üzerinde "Sancakbeyinden ferman gelmedi" rozeti (B3). Butonu gizlemek yerine kilitli göstermek, kampanya hedefini (Döngü D) ilk dakikadan pazarlar.
- Görev günlüğü yalnız Perde I başlıklarını listeler; kilitli perdeler "———" görünür (B13; "Gazi Cebelü Ali'yi Hayatta Tut" spoiler'ı ölür).
- At binme dk 15'ten önce öğretilmez (Bölüm 0'da at zaten teslim alınmıştır ama ilk görevler yayan mesafededir) — tuş kalabalığı ertelenir.
- Harami kampı Perde I gün 3'ten önce spawn edilmez (`NPCManager.js:584-623` spawn çağrısı geciktirilir) — erken ölüm/çiftbozan spirali (playerTrace: köylüye 4 swing = game over) ilk oturumda imkânsızlaşır.

**Kabul kriterleri (Bölüm 3):**
- Yeni oyuncu playtesti (n≥3): dk 15'te tamamlanmış hedef sayısı ≥4; "ne yapacağımı bilmiyordum" ifadesi 0 kez.
- Otomatik iz: ilk 15 dk'da tamamlanan hedeflerin `objective.type` kümesi ≥3 farklı fiil içerir (ölçüm: hedef tamamlanınca `objective.type` başına artan basit sayaç objesi — ~2 saatlik küçük iş kalemi, bkz. `06-fazlar-ve-kabul.md` — veya manuel gözlem çizelgesi).
- `undefined` dizgisi hiçbir HUD/modal alanında görünmez (DOM tarama testi).
- Sefer butonu `quest_campaign.status !== 'active'` iken `disabled` + rozet (UI testi).
- İlk otomatik kayıt dk 15'ten önce oluşur (kayıt slotu zaman damgası).

---

## 4. Geri Bildirim / "Juice" Öncelik Listesi

Analizin tespit ettiği **tüm** ölü geri bildirim kanalları, oyuncu hissine çevrilmiş öncelik sırasıyla. P0 = akış için hayati, P1 = tutundurma çarpanı, P2 = cila.

| Öncelik | Kanal | Mevcut durum (kanıt) | Tasarım kararı |
|---|---|---|---|
| **P0-1** | Bildirim animasyonu | Her karede `innerHTML=''` ile yeniden kurulum; animasyon ilk karede takılı, bildirimler fiilen görünmez (`UIManager.js:1249-1260`, `style.css:464`) | B4 fix üstüne: aynı anda **en fazla 3** bildirim (TARIHSEL 9.9); önem sınıfları `savaş/görev/ekonomi/tarih/din`; süreler: savaş 3 sn, görev 5 sn, tarih/din 7 sn; taşan mesajlar doğrudan Vakayiname'ye (Bölüm 5.3) düşer — kaybolmaz |
| **P0-2** | Vuruş hissi senkronu | Hasar mousedown anında uygulanıyor (`main.js:137-141`), sarsıntı animasyonun %75'inde (`Player.js:381`) — darbe "önceden" hissediliyor | **Karar J1:** Hasar uygulaması mousedown'dan **aktif vuruş karesine** taşınır: kombo animasyonunun %45-60 penceresinde tek kare "hit frame" (`Player.js:316-423 updateWeaponAnimation` faz bilgisini `CombatSystem.processPlayerAttack` çağrısına geçirir). O karede **aynı anda**: hasar + 60 ms hit-stop (TARIHSEL 9.3.7: 40-80 ms) + `playSwordClash` + kan/toz parçacığı + sarsıntı. Kabul: hasar+ses+sarsıntı+parçacığın TEK çağrı noktasından (hit frame) tetiklendiğini gösteren kod-düzeyi assert + manuel his kontrolü (frame-log altyapısı kurulmaz) |
| **P0-3** | cameraShake ölü | `addCameraShake` 5 yerden çağrılıyor ama `update()` kameraya hiç uygulamıyor (`Player.js:37, 72-74`; çağrılar `CombatSystem.js:195,226,267,309`, `ArcherySystem.js:113`) | `Player.update` kamera aşamasında sönümlü gürültü ofseti (tavan 0.2 mevcut); 6 kare içinde sıfıra iner. Erişilebilirlik: ayarlardan kapatılabilir (TARIHSEL 9.9) |
| **P0-4** | playNotification / playCoinJingle tanımsız | Çağrılar bekliyor, metotlar yok; arzuhal/ulak/inşaat/kadı anları sessiz (`PetitionSystem.js:81,100,158`, `UIManager.js:676`, `AudioManager.js`) | İki kısa prosedürel ses: `playNotification` = 2 nota (E5→A5, 150 ms, üçgen dalga); `playCoinJingle` = 3 hızlı metalik tık (kare dalga + highpass). Akçe değişiminde HUD sayacı 400 ms'de sayarak akar (count-up) |
| **P0-5** | Dünya işaretçileri görünmez | CSS hiç yazılmamış (`UIManager.js:1049-1129`) | B5 fix üstüne kural: işaretçi **mesafe ve keşfe bağlı** (TARIHSEL 10.9): görev NPC'si ≤60 m'de sancak/mühür ikonu; düşman HP çubuğu yalnız dövüşte; duvar arkasında solar |
| **P1-1** | Başarımlar kopuk | 8 tanımlı başarımdan 6'sı hiç tetiklenmiyor; her görev sonu tanımsız `ACH_FIRST_PATROL` çağrılıyor (`QuestSystem.js:504`, `SteamManager.js:12-21`) | Eşleme tablosu veriye taşınır: ACH_FIRST_INSPECT→quest_inspect; ACH_BLACKSMITH→demirci gürz/bileme; ACH_CASTLE_DISCOVERY→kale ilk giriş; ACH_BANDIT_SLAYER→quest_bandits; ACH_NIGBOLU_VICTORY→Bölüm 14 finali; ACH_WEALTHY_SIPAHI→akçe≥2500 (gün-dönümü kontrolü). `ACH_FIRST_PATROL` ya sözlüğe eklenir ya çağrı silinir. Mevcut altın banner (`SteamManager.js:68-118`) korunur |
| **P1-2** | Görev ödülleri görünmez | Günlük `rewards.reputation/morale` arıyor; görevler `reayaTrust/sancakReputation/...` veriyor (`UIManager.js:521-526`); `title` hiç verilmiyor (`QuestSystem.js:491-500`) | Ödül şeması tek sözlükte merkezileşir (narrative techDebt önerisi); görev tamamlama ekranında ödüller tek tek "pul" animasyonuyla dizilir; unvanlar (`Gazi Sancakbeyi Naibi` vb.) HUD isim satırına işlenir |
| **P1-3** | Görev tamamlama anı zayıf | Tek satır bildirim | "Vazife tamam" banner'ı: mühür damgası + `playVictoryJingle` (kısa varyant) + ödül pulları + "sıradaki" teaser satırı. Süre ≤3 sn, atlanabilir |
| **P1-4** | Rich Presence tek seferlik | Yalnız açılışta (`main.js:77`) | Durum bazlı güncelleme: "Tımarını teftiş ediyor", "Niğbolu yolunda", "Hamamda keselenirken" (mizah taşıyıcısı — Steam arkadaş listesinde organik reklam) |
| **P2-1** | NPC durum etiketleri | Yalnız 4 durum (`main.js:326-331`) | +"(Kaytarıyor)", "(Dedikodu yapıyor)", "(Namazda — rahatsız etme)" [namaz etiketi nötr ve saygılı; espri YOK]; uyuyan NPC'yi uyandırınca huysuz replik seti ("Bre! Gece yarısı kapı mı çalınır beyim?") |
| **P2-2** | Pusulada kıble/mescid | Yön adları sabit tablo (`UIManager.js:848-856`) | Mescid yönünde küçük mescid ikonu; vakit bildirimlerinde vurgulanır |
| **P2-3** | Ganimet/ölüm mesajı tek tip | `killEnemy` sabit metin (`CombatSystem.js:324-342`) | Düşman türüne göre ganimet çeşidi ("Frenk miğferi", "Ceneviz kumaşı") + haramilerin son sözleri (dünyevi mizah kancası, gameplay analizi önerisi) |

**Kabul kriterleri (Bölüm 4):** P0 kalemlerinin tamamı tek sürümde çıkar; "juice smoke testi": 1 arzuhal kabulü + 1 kılıç isabeti + 1 görev tamamlama kaydında her olayın ≥2 duyusal kanaldan (görsel+ses) aynı karede yanıt verdiği doğrulanır. Bildirim testi: 10 mesaj arka arkaya basıldığında ekranda ≤3 görünür, hiçbiri kaybolmaz (log'a düşer).

---

## 5. Kayıt ve Oturum Ritüeli

### 5.1 Otomatik kayıt anları

`SaveManager` 4 slotlu altyapısıyla hazır ama hiç bağlanmamış (`SaveManager.js:208`; B7). Slot planı: `auto` (dönüşümlü 2 slot), `chapter` (perde/atlama kartı), `manual` (1 slot, defterden).

Otomatik kayıt tetikleri (hepsi "yükleme sonrası tutarlı an"lardır — modal ortası/dövüş ortası kayıt YOK):

1. **Uyku** (Z8) — birincil ritüel kayıt.
2. **Şafak** (gün-dönümü kancası, `GameState.js:214-233`) — uyumadan gün deviren oyuncu için sigorta.
3. **Görev tamamlama** (`QuestSystem.js:485-511 completeQuest` sonu).
4. **Atlama kartı / perde geçişi** (`chapter` slotu tektir ve her atlama kartında üzerine yazılır — vaat yalnız **son perde başına** dönüp farklı karar denemektir; daha eski perdelere dönüş vaat edilmez).
5. **Niğbolu safha aralar** (B10 bağlandığında safha bazlı checkpoint — TARIHSEL Aşama 4 gereksinimi).
6. **Arzuhal kabulü / büyük harcama** (≥300 akçe) sonrası sessiz kayıt.

Görsel dil: sağ alt köşede 1,5 sn "mühür basılıyor" ikonu + "Kaydedildi" — Osmanlı mühür metaforu kayıt sistemini temaya bağlar.

### 5.2 Oturum kapanış ritüeli: Akşam Hesabı

Yatsı vaktinde (veya oyuncu uykuya geçtiğinde) tam ekran **Akşam Hesabı** kartı (TARIHSEL 6. bölümün 5. adımının ekranlaşması):

- **Kasa:** günün akçe giriş/çıkışı (Bölüm 7 gider kalemleri burada görünür kılınır).
- **İtibar:** reaya güveni / sancak itibarı / bölük sadakati değişimi (ok işaretleriyle).
- **Vazife:** tamamlanan hedefler + yarının işleri (sabah divanı önizlemesi).
- **Söylenti satırı:** 1 satır köy dedikodusu/mizah VEYA 1 tarih vinyeti (dönüşümlü) — "yarın ne olacak" merakı: oturumu burada kapatan oyuncu, kancayla döner.
- Kart kapanınca uyku geçişi + kayıt mührü.

### 5.3 Oturum açılış ritüeli: "Kaldığın Yer"

Devam yüklemesinde oyuna doğrudan düşmek yerine 1 kart:

- Tarih (çift takvim) + konum + aktif hedef cümlesi,
- son 3 önemli olay (Vakayiname'den),
- akçe/cebelü/güven anlık değerleri,
- varsa saatli tehdit ("Ali'nin mühleti: 2 gün"),
- tek buton: "Devam et" (hedef: yüklemeden oynanışa ≤30 sn).

Veri kaynakları: `gameState.quest/currentQuest` (`QuestSystem.js:536-561`), `gameState.time`, Vakayiname günlüğü (aşağıda). `serializeState` genişletmesi B7'de.

### 5.4 Vakayiname (bildirim geçmişi / olay günlüğü)

Mevcut kuyruk 5 kayıtla sınırlı ve eskiler shift ile atılıyor (`GameState.js:207-209`) — yoğun anlarda mesajlar okunmadan kaybolur. Tasarım:

- Yeni ekran: **Vakayiname** (görev günlüğü modalına 2. sekme; `J` içinde — yeni tuş eklenmez).
- Her `addNotification` çağrısı `{gün, vakit, tür, metin}` olarak günlüğe de yazılır; tavan 200 kayıt (FIFO); kayıt dosyasına girer.
- Filtre çipleri: Vazife / Tımar / Sefer / Kodeks. Kodeks girdileri A/B/C/R rozetini taşır.
- Gün başlıkları ("6 Mart 1396, Cuma — H. 24 C.evvel 798") — oyuncu geçmişi bir *kronik* gibi okur; tarih öğretimi ile tutundurma aynı ekranda buluşur.

**Kabul kriterleri (Bölüm 5):**
- Oyun kapatılıp açıldığında ilerleme kaybı ≤1 oyun günü (crash senaryosu dahil; test: kill-process sonrası yükleme).
- `aliStatus`, `activeCampaign`, `currentPetition`, takvim ve Vakayiname kayıt dosyasında birebir geri gelir (round-trip testi).
- Akşam Hesabı kartı her oyun günü sonunda gösterilir; Kaldığın Yer kartı her yüklemede gösterilir (UI testi).
- Vakayiname'de hiçbir bildirim kaybolmaz: 20 hızlı bildirimlik stres testinde günlük kayıt sayısı = 20.

---

## 6. Görev Çeşitliliği Kalıpları

TARIHSEL 9.7 fiil seti (incele / al / taşı / onar / iz sür / mühürle) + "her göreve en az iki çözüm yolu" ilkesi, mevcut 13 göreve (`QuestSystem.js:16-401`) uygulanır. Mevcut durum: 13 görevin 11'i "git-konuş-şık seç" (narrative analizi). Aşağıdaki varyantlar **mevcut görev iskeletini korur**, hedef (objective) tipleri ekler; `advanceObjective`'e yeni hedef tipleri (`inspect`, `carry`, `track`, `seal`) teknik planda tanımlanır (B14 ile birlikte).

| Görev | Mevcut kalıp | Yeni varyant (fiiller) | En az iki çözüm yolu |
|---|---|---|---|
| quest_inspect (Tımar Teftişi) | konuş + şık | Sabah divanı + **3 hane ziyareti**: defter sayfası vs saha (**incele** ×3, TARIHSEL Bölüm 1) — kuraklık/borç/eksik ölçüm | tahsil et / süre ver / kadıya **mühürle** kayıt gönder |
| quest_water_dispute (Su Hakkı) | tamamlanamaz (B1) | Kırık ark **incele** (2 nokta), tanıkları dinle, eski sınır taşını **iz sür** ile bul (TARIHSEL Bölüm 2) | uzlaştır / kadı naibine götür / (kötü yol) zorla hükmet → göç riski |
| quest_blacksmith (Pusat Teftişi) | konuş + satın al | Körük için kömür çuvalını handan **taşı** (fiziksel taşıma: yürüyüş yavaşlar, kılıç kullanılamaz) VEYA bedelini öde; gürz/kılıç seçimi (mevcut mekanik korunur — `DialogueSystem.js:196-206`) | taşı (bedava, zaman) / öde (30 akçe, hızlı) |
| quest_imam (Cuma Duası) | konuş | **Zaman kapılı:** cuma günü öğle vaktinde mescid avlusu; hutbe vinyeti + dua. Vaktinde gitmezse görev beklemede kalır (fail yok — ibadet mekaniği ceza aracı yapılmaz) | erken git (imamla sohbet + kodeks kartı) / yalnız vakitte katıl |
| quest_cebelu (Ali'nin Talimi) | konuş | **Gerçek talim** (TARIHSEL Bölüm 4, 4 aşama): 5 blok, 3 bölgeli vuruş, atlı geçiş (yalnız `isRiding` + hız ile ölçülür; atlı saldırı girdisi İSTEMEZ — at üstünde kılıç savurma bilinçli kapsam dışıdır, bkz. `06-fazlar-ve-kabul.md` §11.3), komut — `TrainingSystem.startDrill` bağlanır (teknik plan) | altın derece (Ali'yi yaralamadan) / bronz geç (3 başarısızlıkta önerilir) |
| quest_inn_spy (Handa Yabancı) | konuş ×2 | **Belge karşılaştırma** (TARIHSEL Bölüm 7): iki geçiş kâğıdını **incele** (tarih çelişkisi), gece mesajını **iz sür**; fail her oyunda değişir | doğru kişiyi kadıya teslim / yanlış suçlama → ticaret+zimmî güveni düşer (başarısızlık içerik üretir) |
| quest_attar (Şifalı Merhemler) | konuş + satın al | Nehir kıyısında kantaron **topla/al** (3 bitki noktası, E ile) → attara **taşı**, merhem birlikte hazırlanır | topla (bedava, zaman) / hazırını satın al (40 akçe) |
| quest_dede_flag (Kosova Hatırası) | konuş | Dinleme + **aktif hatırlama**: Dede anlatırken 2 soru sorulur (yanlış cevap kırmaz; doğru cevap kodeks kartını "tam" açar) | sabırla dinle / acele et (kısa versiyon, kart yarım açılır) |
| quest_bandits (Harami Baskını) | 3 öldür | **Önce iz sür** (kırık ok, nal izi — TARIHSEL Bölüm 6), kampı keşfet | öldür (ganimet) / lideri yakala (bilgi: Haçlı söylentisi + hukukî itibar) / erzak karşılığı teslim al (tekrar suç riski) |
| quest_neighbor (Sungur Bey İttifakı) | konuş | Atla kuzey yoluna **eskort/yolculuk** (binicilik kullanımına ilk mecburi sahne) + ittifak sözü | doğrudan yol (haydut pusu riski) / uzun güvenli yol (zaman) |
| quest_castle (Kale Yoklaması) | konuş | Yoklama defterini **mühürle**: envanter sayımı mini-ekranı (cebelü, at, ok, zırh listesi) — eksikler görünür | eksiği dürüstçe bildir (itibar −, seferde yardım +) / sakla (itibar +, Rumeli'de kayıp ↑ — TARIHSEL Bölüm 9) |
| quest_campaign (Niğbolu Fermanı) | tek tık (B3/B10) | 3 günlük **hazırlık listesi** (Bölüm 8 Tuğ Çağrısı): erzak **taşı**, nal/ok **al**, araba **onar**; sonra sefer | tam hazırlık (safha kolaylıkları) / asgari hazırlık (riskli sefer) |
| quest_save_ali_leg (Ali'yi Kurtar) | fetch ×3 (tetikleyicisi ölü) | Tetik: Bölüm 14 sonucu (B10). Mühlet HUD'da; merhem **al/taşı**, değnek **al**, imamla yara sarımı; mühlet dolarsa son fırsat sahnesi (Z9) | merhem+değnek tam seti (garanti) / eksik setle dağlama (riskli) |

**Fiil dağılımı sonucu:** incele ×4, al/taşı ×4, iz sür ×3, mühürle ×2, onar ×1, zaman-kapısı ×1, gerçek talim ×1 — "git-konuş" tekeli kırılır.

**Kural (TARIHSEL 9.7 ile uyum):** Görev işaretçisi çözümü değil **bölgeyi** gösterir; kanıt yaklaştıkça daralır (işaretçi yarıçapı 30 m → 8 m). Diyalog seçeneklerinde sonuç rakamla yazılmaz ("+15 güven" YOK); niyet cümlesiyle yazılır.

**Kabul kriterleri (Bölüm 6):**
- 13 görevin en az 9'u konuşma dışı en az 1 hedef içerir (görev verisi denetimi: `objectives[].type !== 'talk'` sayımı).
- En az 6 görev iki+ çözüm yoluyla biter (outcome dallanma testi: iki farklı yol iki farklı `outcomes` kaydı üretir).
- quest_inn_spy'da yanlış suçlama oyunu kilitlemez; yeni içerik (tazmin görevi) açar.
- İlk oturumda (30 dk) oyuncu ≥3 farklı fiil tipi tamamlar (Bölüm 8 K1 ile aynı ölçüm: basit sayaç objesi veya manuel gözlem çizelgesi).

---

## 7. Ekonomi Baskısı: Gider Döngüsü

### 7.1 Teşhis

Gelir tek yönlü ve enflasyonist: periyodik gider sıfır (gameplay analizi: `akce -=` yalnız tek seferlik alımlarda), "yıllık" vergi her mevsim toplanabiliyor (`GameState.js:261` + `TimarSystem.js:11`, B11), arzuhal havuzunda aynı yapı tekrar inşa edilip her seferinde kalıcı gelir basıyor (`PetitionSystem` techDebt). Sonuç: akçe monoton artar, 800 akçelik cebelü kararı anlamsızlaşır, "hazırlık" gerilimi ölür.

### 7.2 Gelir yapısı (yeniden)

| Gelir | Zamanlama | Miktar | Not |
|---|---|---|---|
| Öşür + rüsum (ana vergi) | **Yılda 1: hasat, Ağustos** — Atlama #3/Bölüm 8 penceresi | 2.400-3.200 akçe (reaya güveni çarpanı korunur: `annualIncome × (0.85 + morale/100×0.3)`, `TimarSystem.js:17-19`) | B11 fix şart. Hasadın tam sefer fermanına denk gelmesi (Ağustos) TARIHSEL Bölüm 8 gerilimini bedavaya kurar |
| Değirmen/kovan rüsumu (küçük akış) | Atlama kartlarında aylık | +60-90/ay | Atlama kartında satır olarak görünür |
| Arzuhal yapıları (değirmen +800 vb.) | **Hasatta** ödenir, anında değil | `PetitionSystem.js:16-53` reward.value hasat havuzuna yazılır | Tamamlanan yapı havuzdan düşer (tekrar inşa edilemez) |
| Ganimet | Harami başına 40-100 (mevcut, `CombatSystem.js:330`) | tek seferlik — respawn yok | Sefer ganimeti Bölüm 15'te "taşıma/bölüşme" kararına bağlanır (TARIHSEL 9.8) |
| Görev ödülleri | Azaltılır | Perde I görevlerinde akçe ödülü ≤150; ağırlık itibar/eşya/kodekse kayar | "Her eylem para basmasın" (TARIHSEL 9.8) |

### 7.3 Gider döngüsü (yeni)

| Gider | Zamanlama | Miktar | Kod kancası |
|---|---|---|---|
| **Cebelü nafakası** | Oynanır günlerde şafakta 2 akçe/cebelü; atlama kartlarında 60 akçe/ay/cebelü | 1 cebelü ≈ 60/ay | Gün-dönümü kancası (`GameState.js:214-233`) + atlama kartı hesabı |
| **At yemi + nal** | 1 akçe/gün + atlama kartında 30/ay | at başına | Aynı kanca; bakımsız at Bölüm 12'de dayanıklılık cezası (SupplySystem `feedHorse` bağlanır) |
| **Teçhizat tamiri** | Kullanım bazlı: her 25 isabetli vuruşta bileme ihtiyacı | 20-30 akçe (demirci) | `SupplySystem.reduceDurability` iskeleti (`SupplySystem.js:39-123`) dövüşe bağlanır (teknik plan) |
| **Hamam / merhem** | isteğe bağlı iyileşme | 40 / 30-40 | Mevcut (`DialogueSystem.js:585`, attar) |
| **Ziyafet / hayır işleri** | isteğe bağlı itibar | 150 | Mevcut (`TimarSystem.js:75`); B12 fix ile etkisi kalıcı olur |
| **Sefer hazırlık sepeti** | Bölüm 8 (tek büyük gider) | erzak 250 + ok/nal 120 + araba 100 = **~470** taban; indirim mevcut `reayaTrust` değerinden türetilir: trust ≥70 → −%40, 50-69 → −%20, <50 → 0 (sabitler `balance.js`'te) | TARIHSEL Bölüm 8'in "geçmiş kararlar geri döner" mekaniği: Perde I kararları zaten `reayaTrust`'a yazar — ayrı bir "hane memnuniyeti" alt sistemi KURULMAZ |

### 7.4 Sayısal başlangıç dengesi

| Kalem | Değer | Gerekçe |
|---|---|---|
| Başlangıç akçesi | **900** (mevcut 850-1350 rastgelesi daraltılır: 850-950) | İlk cebelü (800) *hemen* alınamasın diye değil; alınırsa kasa boşalsın diye — gerçek bir karar olur |
| Başlangıç cebelü | 1 (Ali) — mevcut | `GameState.js:96` |
| Perde I sonu hedef kasa (medyan) | 600-900 | Görev ödülleri + küçük giderler sonrası; ziyafet (150) hâlâ "hissedilir" (%20 nakit) |
| Hasat günü kasa sıçraması | +2.400-3.200 | Yılın tek büyük "zengin anı" — hemen ardından sefer sepeti + 2. cebelü (800) kararı gelir: para *akar*, birikmez |
| Sefer öncesi hedef | Kasa %60-75'i hazırlığa gider | "Sultanın seferi ucuz değil" hissi; kabul: playtest medyanı bu bantta |
| Güvenlik tabanı | Kasa 0'ın altına inmez; nafaka ödenemezse akçe yerine **bölük sadakati** düşer (-5/gün) | İflas-kilidi yerine anlamlı baskı (TARIHSEL 15: kurtarma yolu) |

### 7.5 Ekonomi × mizah × öğreticilik

Gider kalemleri Akşam Hesabı'nda tek tek görünür (Bölüm 5.2) — oyuncu "para nereye gidiyor?" sorusunun cevabını her akşam okur; kethüda satır aralarına dünyevi nükte düşer ("Ali'nin boğazı, beyim... bir orduyu doyurur"). Vergi terminolojisi (öşür, ağnam, çift resmi — `UIManager.js:554`'te zaten var) hasat ekranında 1 satırlık açıklamayla kodekse bağlanır: ekonomi ekranı aynı zamanda tarih dersi olur.

**Kabul kriterleri (Bölüm 7):**
- Headless ekonomi simülasyonu birim testi (bot koşusu YOK): gün-dönümü kancası, betikli gelir/gider senaryosuyla kampanya boyunca (≈28 oynanır gün + atlama kartı ayları) döngüde çağrılır; kasa eğrisi monoton artmaz ve en az 2 "net-negatif 7-günlük pencere" (pencere içi toplam gider > toplam gelir) oluşur.
- Vergi butonu hasat penceresi dışında pasif + tooltip ("Hasat vakti değil"); yılda 1'den fazla tahsilat imkânsız (birim test).
- Aynı arzuhal yapısı iki kez inşa edilemez (birim test).
- Sefer sepetinde `reayaTrust` indirimi çalışır: yüksek (≥70) ve düşük (<50) güvenli iki kayıtla maliyet farkı ≥%25 (birim test).

---

## 8. Ölçülebilir Başarı: KPI Tablosu ve Test Protokolü

### 8.1 KPI tablosu (denetçinin kabul listesi)

| # | Tasarım kararı | Ölçülebilir hedef | Ölçüm yöntemi |
|---|---|---|---|
| K1 | Fiil çeşitliliği (Bölüm 6) | İlk oturumda (30 dk) oyuncu ≥3 farklı fiil tipinde hedef tamamlar | Basit sayaç objesi (`objective.type` başına artan; ~2 saatlik iş kalemi, bkz. `06-fazlar-ve-kabul.md`) veya manuel gözlem çizelgesi — ayrı telemetri altyapısı yok |
| K2 | Zaman temposu (Z1) | 1 oyun günü medyan 12-18 gerçek dk | Kronometreli playtest gözlemi (dayCount vs duvar saati); bot koşusu gerekmez |
| K3 | Tek zaman otoritesi (Z2) | `daysPassed` tek yazarlı; HUD/defter/kayıt aynı tarihi gösterir | Kod denetimi + tutarlılık testi |
| K4 | İlk 15 dk (Bölüm 3) | ≥4 tamamlanmış hedef, 0 "ne yapacağımı bilmiyorum" anı, ilk otomatik kayıt <15 dk | Playtest (n≥3) + kayıt zaman damgası |
| K5 | Sekans kırılması (B3) | Sefer butonu quest_campaign aktif olmadan basılamaz | UI testi (1. dakika denemesi) |
| K6 | Bildirim görünürlüğü (P0-1) | Her bildirim ≥4 sn tam opak; aynı anda ≤3; hiçbiri kaybolmaz (Vakayiname'ye düşer) | DOM/opacity otomatik testi + stres testi |
| K7 | Vuruş hissi (J1) | Hasar+ses+sarsıntı+parçacık aynı karede (Δ=0); hit-stop 40-80 ms | Kod-düzeyi assert: dördü TEK çağrı noktasından (hit frame) tetiklenir + manuel his kontrolü (frame-log altyapısı yok) |
| K8 | Ali yayı (Z9) | Tetiklenme→çözüm medyan 45-75 dk; mühlet dolumunda son fırsat sahnesi %100 | Playtest gözlem çizelgesi (kronometre) + son fırsat sahnesi birim testi |
| K9 | Kayıt güvencesi (Bölüm 5) | Crash sonrası kayıp ≤1 oyun günü; round-trip'te aliStatus/activeCampaign/takvim korunur | Kill-process testi + serialize birim testi |
| K10 | Oturum ritüeli (Bölüm 5) | Yükleme→oynanış ≤30 sn ("Kaldığın Yer" dahil); Akşam Hesabı gösterim oranı ≥%90 | Kronometre + gözlem çizelgesi |
| K11 | Ekonomi baskısı (Bölüm 7) | Perde I sonu medyan kasa 600-900; simülasyonda ≥2 net-negatif 7-günlük pencere | Headless ekonomi simülasyonu birim testi (Bölüm 7 kabulü) + playtest gözlemi |
| K12 | Hazırlık anlamı (Döngü D) | Hazırlık defterindeki ≥5 kalem Niğbolu safhalarında ölçülebilir fark üretir | `CampaignBattleSystem`'i düşük/yüksek `SupplySystem` durumuyla çağıran iki birim testin karşılaştırması |
| K13 | Mizah yoğunluğu | İlk oturumda ≥2, her oyun gününde ortalama ≥1 mizah beat'i; dinî içerikte mizah 0 | İçerik kapsama tablosu + 18.1 denetim listesi |
| K14 | Tarih/din öğretimi | İlk oturumda ≥3 kodeks kartı açılır; tüm kartlar A/B/C/R etiketli; dinî metinler kaynak onaylı | İçerik denetimi (Aşama 5 tarih danışmanı kapısı) |
| K15 | `undefined` sıfır toleransı | Hiçbir HUD/modal alanında "undefined/NaN" görünmez | Otomatik DOM dizgi taraması |
| K16 | Boşluk anı (1.3) | 10 dk serbest keşifte >60 sn sıfır-uyaran pencere yok ("uyaran" = §1.3'teki sayılabilir dört sınıf) | Tek 10 dk'lık ekran kaydı protokolü (§1.3): uyaranlar zaman damgasıyla işaretlenir |
| K17 | Vakit ritmi (Z7) | Namaz vakitlerinde NPC mescid yönelimi görsel olarak gerçekleşir; ezan sunumu 18.1 kurallarına uygun (sentez yok) | Görsel test + içerik denetimi |
| K18 | Oturum uzunluğu (tutundurma) | Oturumların ≥%70'i Akşam Hesabı/atlama kartı ekranında kapanır; medyan oturum 45-90 dk | Playtest anketi ("Oturumu hangi ekranda kapattın?" sorusu) + oturum süresi kaydı |

### 8.2 Playtest protokolü (her sürüm kapısında)

1. **Soğuk başlangıç testi (n=3, oyunu hiç görmemiş kişi):** yalnız Faz 1 (ilk 15 dk) ve Faz 5 (KPI) kapılarında zorunludur; ara faz kapılarında geliştirici öz-checklist'i + tek tekrar-oyuncu yeterli sayılır (solo geliştirici gerçekliği). İçerik: ilk 15 dk sessiz gözlem + K4 anketi; ardından "kaldığın yerden devam" testi (K10).
2. **Deterministik test paketi (bot koşusu YOK):** K11 headless ekonomi simülasyonu (Bölüm 7 kabulü), K12 çift birim test ve K15 DOM dizgi taraması otomatik çalıştırılır; K2 kronometreli playtest gözlemiyle ölçülür. (3 saatlik 3D bot otomasyonu bilinçli kapsam dışıdır — solo geliştirici için orantısız, ayrı bir mühendislik işidir.)
3. **İçerik denetimi:** yeni yazılan tüm diyalog/kodeks metinleri iki listeden geçer: (a) tarihsellik etiketi atanmış mı (A/B/C/R), (b) 18.1 mizah sınırı ihlali var mı; dinî metinler için muteber kaynak referansı zorunlu (TDV İslâm Ansiklopedisi öncelikli — TARIHSEL 16. bölüm kaynakları).
4. **Regresyon:** `npm test` 97/97 korunur; zaman sistemi değişikliği sonrası testlerdeki zaman varsayımları güncellenir (testler gerçek modülleri import ediyor — `tests/systems.test.js:46-59`; `daySpeed` değişimi Test 6 tipi assert'leri etkileyebilir, teknik plana not).

### 8.3 Uygulama sırası önerisi (bu dokümanın kendi içinde)

Solo geliştirici gerçekliğine göre, bu dokümandaki işlerin teslim sırası (teknik planın B-fixleri ile senkron):

1. **Z1+Z2+Z3 (zaman)** → her şeyin temeli; tek başına oyunu "oynanabilir" yapar.
2. **P0 juice paketi (Bölüm 4)** → aynı sprint'te; geri bildirim olmadan hiçbir tasarım test edilemez.
3. **Bölüm 3 ilk 15 dakika** (B1-B8 fixleriyle birlikte) → demo kalitesi eşiği.
4. **Bölüm 5 kayıt/oturum** → tutundurmanın sigortası.
5. **Z4-Z9 takvim + uyku + Ramazan/bayram çıpaları** → kampanya iskeleti.
6. **Bölüm 6 görev varyantları** (perde sırasıyla) + **Bölüm 7 ekonomi** → derinlik.
7. **Döngü D / Niğbolu bağlantısı (B10)** → final.

---

## 9. Sabit Kararlarla Uyum Beyanı

- **Kampanya:** 1396 ilkbaharı → 25 Eylül 1396 Niğbolu; TARIHSEL 5. bölüm perde/bölüm yapısı birebir korunmuş, yalnız takvim tarihleri ve oynanır gün bütçeleri eklenmiştir (Bölüm 2.2).
- **A/B/C/R etiketleri:** takvim çıpaları (B), namaz vakit tablosu (C), Niğbolu tarihi (A), kodeks kartları ve Vakayiname rozetleri bu sistemi kullanır.
- **İslami içerik:** Ehl-i sünnet (Hanefî-Mâturîdî) çerçevesi Bölüm 0'da bağlayıcı kural olarak konmuş; Ramazan/bayram/namaz içeriği atmosfer ve öğreticilik taşıyıcısıdır, mekanik ceza/ödül aracı veya mizah nesnesi değildir (Z6, Z7, K13, K14).
- **Mizah:** yalnız dünyevi hayatta (saka, hamam, asker muhabbeti, kethüda nüktesi, Steam Rich Presence); din adamı/ibadet/dinî değer espirisi sıfır toleranslıdır.
- **Mimari:** hiçbir öneri yeniden yazım istemez; tüm kararlar mevcut dosyalara `dosya:satır` kancasıyla bağlanmış, büyük işler B1-B14 olarak teknik plana devredilmiştir.
