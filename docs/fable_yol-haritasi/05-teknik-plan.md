# 05 — Teknik Plan: Bug Backlog, Temizlik, Altyapı ve Kalite Kapıları

> **Bu doküman ne için:** Bu doküman, "Mülk-i Osmanî: Tımarlı Sipahi 3D" projesinin teknik yol haritasıdır. 7 ajanlık derin kod analizinde doğrulanan ~110 bulguyu tek bir önceliklendirilmiş backlog'a indirger (P0/P1/P2), ölü kod ve hukuki/marka temizliği kararlarını verir, içerik boru hattı (diyalog/kodeks/bark verisi) refaktörünü, performans düzeltmelerini, kayıt sistemi bağlama planını, test stratejisini, kod standartlarını ve Electron/Steam kararlarını tanımlar. Hedef okuyucu, soru sorma imkânı olmayan bir geliştirici ve işi bu dokümana göre kabul edecek bağımsız bir denetçidir: her iş kalemi dosya:satır ile mevcut koda bağlıdır, 1-3 cümlelik düzeltme tarifi, süre tahmini ve doğrulama yöntemi içerir. `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` (bundan sonra: TARIHSEL) ile çelişmez, onun Aşama 0 ("Sağlamlaştırma") ve teknik mimari bölümlerini (12, 15, 18.6) somut işe döker.

**Sabit kararlar (bu dokümanın üstünde):** 1396 ilkbahar → 25 Eylül 1396 Niğbolu kampanya yapısı (TARIHSEL §5); A/B/C/R tarihsellik etiketi (TARIHSEL §4.2); İslami içerik Ehl-i Sünnet çizgisinde (Hanefî fıkhı, Mâturîdî itikadı; yalnız sahih/muteber kaynak; uydurma rivayet, mezhep tartışması, modern polemik yok); din adamları, ibadet ve dinî değerler asla mizah nesnesi olmaz (TARIHSEL §18.1) — mizah dünyevi hayatta yaşar; mevcut mimari korunur, cerrahi değişiklik, büyük yeniden yazım yok; dokümanlar Türkçe, kod/commit İngilizce.

**Doğrulanmış temel durum:** `npm test` 97/97 geçiyor; `npm run build` çalışıyor (tek chunk >500kB uyarısıyla); testler `src/` altındaki gerçek modülleri import eden gerçek entegrasyon testleri. Her fazın çıkış şartı bu iki komutun yeşil kalmasıdır (bkz. §7).

---

## 1. BUG BACKLOG (P0 / P1 / P2)

**Önceliklendirme mantığı:**
- **P0 — İlk saati kurtaran cerrahi düzeltmeler.** Oyuncunun ilk 60 dakikada çarptığı, oyunu fiilen "bozuk" gösteren, her biri küçük ve izole düzeltmeler. Toplam ≈ 1,5-2 iş günü. Bunlar bitmeden hiçbir içerik/özellik işi başlamaz.
- **P1 — Döngü kıranlar.** Oyunun ana döngülerini (kayıt, zaman, ekonomi, sefer, arzuhal, rehberlik) çalışmaz veya anlamsız kılan hatalar. Toplam ≈ 8-11 iş günü.
- **P2 — Cila ve borç.** Görsel/işitsel cila, denge, metin, kod hijyeni. İçerik fazlarıyla paralel, fırsat buldukça.

**Konsolidasyon notu:** 7 ajanın raporladığı ~110 bulgunun bir kısmı aynı kök nedenin farklı alanlardan görünümüdür (ör. `playNotification` eksikliği hem core hem narrative hem ui raporunda). Aşağıdaki tabloda bunlar **tek iş kalemine birleştirildi**; birleştirilen kayıtlar "Belirti" sütununda ⊕ ile işaretlidir. Ölü kod bulguları §2'ye, hukuki bulgular §3'e, performans bulguları §5'e taşındı ve tabloda çapraz referansla görünür.

**Süre birimleri:** dk = dakika, s = saat, g = iş günü. Tahminler tek geliştirici içindir ve test/doğrulama süresini içerir.

**Genel doğrulama kuralı (her satır için geçerli):** düzeltme sonrası `npm test` 97/97 + `npm run build` hatasız; satırdaki özel doğrulama buna ektir.

### 1.1 P0 — İlk saat kurtarma paketi

| ID | Dosya:Satır | Belirti | Düzeltme tarifi | Süre | Doğrulama |
|---|---|---|---|---|---|
| P0-1 | `src/systems/DialogueSystem.js:357`, `src/systems/QuestSystem.js:51-75,527-533`, `src/entities/NPCManager.js` | ⊕ `water_dispute_talk` hiçbir NPC'ye bağlı değil; 2. görev (Su İhtilafı) ASLA tamamlanamıyor ve `getActiveQuest` dizi sırasına göre ilk 'active'i döndürdüğü için HUD pusulası/görev kartı oyun boyunca boş nehir kıyısına (-45,22) kilitleniyor. | `NPCManager.initNPCs`'e `dialogueId: 'water_dispute_talk'` taşıyan bir "Değirmenci" NPC ekle (öneri: "Değirmenci Musa"), konumu quest hedefi (-45,22) civarı; mevcut `createHumanNPC` + `attachVillagerAI` kalıbı aynen kullanılır. Değirmen arkı temsili için hedef noktaya küçük bir set/ark mesh'i (TownGenerator, tek `addStoneBlock` benzeri) eklenir. | 2-3s | Test: `DialogueSystem.getDialogueData('water_dispute_talk')` non-null + NPC config'lerinde bu id'nin varlığı assert edilir. Manuel: quest_inspect bitince pusula değirmenciye götürüyor, iki hedef diyalogdan tamamlanıyor, HUD 3. göreve geçiyor. |
| P0-2 | `src/ui/UIManager.js:869-876` (180°), `:884` (questTitle), `:848-857` (yön adları), `src/style.css` (.hidden) | ⊕ Pusula görev iğnesi 180° ters (hedefe dönünce kenara kaçıyor); hedef metni her zaman `undefined (34m)`; yön adları Doğu/Batı ters ve içerikleri yanlış ("Güney (Demirci)" ama demirci batıda); genel `.hidden{display:none}` kuralı olmadığından hedefsizken 📍 ve "Hedef: 0m" ekranda asılı kalıyor (`#rejection-loading` da hep görünür). | (a) `angleDiff` hesabına bakış yönü düzeltmesi: `let angleDiff = angleToTarget - playerYaw + Math.PI;` sonra mevcut normalize döngüsü (işaret ampirik doğrulanır — hedefe bakarken 📍 merkezde olmalı). (b) `:884` → `targetInfo.shortTitle`. (c) `:848-857` yön tablosunu gerçek yerleşimle eşle (mescid (12,-4), demirci (-62,8), kale (185,0), değirmen (48,-38)). (d) `style.css`'e `.hidden{display:none!important}` ekle. | 1,5-2s | Manuel: 4 ana yöne bak — yön adı doğru; görev hedefine dön — 📍 merkezde ve metin "Su Değirmeni Arkı (34m)" formatında; görev yokken 📍 gizli; ret modalında yükleme yazısı yalnız beklerken görünür. Test: `getActiveTargetInfo` dönüşünde `shortTitle` alanı assert. |
| P0-3 | `src/ui/UIManager.js:1249-1260` (+ `src/style.css:464,906-909`) | Bildirimler her karede `innerHTML=''` ile yıkılıp kurulduğu için slide-in animasyonu (opacity 0'dan başlar) her 16ms'de sıfırlanıyor: oyunun TÜM geri bildirim kanalı fiilen görünmez. | Dirty-flag render: `gameState.notifications`'a monoton artan `id` alanı ekle; `renderNotifications` son render edilen id listesini saklasın, liste değişmediyse DOM'a dokunmasın; değiştiyse yalnız yeni girişleri `appendChild`, süresi dolanları `remove()` etsin. | 1-1,5s | Manuel: vergi topla → bildirim 0.3s animasyonla belirip 5 sn okunabilir kalıyor. Chrome DevTools > Performance: `renderNotifications` artık her karede layout tetiklemiyor (bkz. §5 ölçüm). |
| P0-4 | `src/ui/UIManager.js:1049-1129,1107`, `src/style.css` (eksik kurallar), `src/systems/QuestSystem.js:419-433` | ⊕ Dünya işaretçileri (NPC isim etiketi, düşman HP barı, [GÖREV] rozeti) hiç görünmüyor: `.world-marker/.marker-*` sınıflarının ve `#world-markers-container`'ın CSS'i yazılmamış; ayrıca `:1107` `activeTarget.targetId` okuyor ama `getActiveTargetInfo` bu alanı döndürmüyor → [GÖREV] vurgusu hiçbir zaman tetiklenmiyor. | (a) `style.css`'e `#world-markers-container{position:fixed;inset:0;pointer-events:none;z-index:5}` + `.world-marker{position:absolute;transform:translate(-50%,-100%)}` + rozet/HP-bar/mesafe kuralları ekle (mevcut parşömen temasıyla uyumlu). (b) `getActiveTargetInfo` dönüşüne `targetId: quest.giver` alanını ekle; `:1107` karşılaştırması çalışır hale gelir. | 2-3s | Manuel: köy meydanında NPC üstlerinde isim etiketi + mesafe; harami kampında HP barı; aktif görev NPC'sinde 📜 [GÖREV] rozeti ve `active-quest` stili görünür. |
| P0-5 | `src/ui/UIManager.js:340-364`, `src/systems/HistoryEventSystem.js:12-36` | "SULTANIN SEFERİNE KATIL" dakika 1'de basılabiliyor (başlangıç cebelü=1, şart=1): tek tık tüm oyunu atlayıp +2200 akçe veriyor; harita tıklaması da (`:340`) quest önkoşulu kontrol etmiyor. | `joinActiveCampaign` başına kapı ekle: `questSystem.getQuestById('quest_campaign')?.status !== 'active'` ise `false` dön ve "Sultanın fermanı henüz sana ulaşmadı / önce sancak yoklamasını tamamla" bildirimi ver; UI butonunu aynı koşulda `disabled` + gri stil yap ve modal içinde nedenini yaz. | 1-1,5s | Test: `quest_campaign` locked iken `joinActiveCampaign()` false döner assert. Manuel: dk 1'de buton pasif ve neden metni görünür; quest_castle bitip quest_campaign aktifleşince buton açılır. |
| P0-6 | `src/main.js:87-131` ↔ `src/ui/UIManager.js:162-202` | Başlangıç ekranı butonları iki kez bağlı (main.js `onclick` + UIManager `addEventListener`): başlat çift bildirim + çift cıngıl, "Yeni Tımar" çift reset atıyor. | Tek sahip kuralı: bağlamayı **UIManager'da** bırak; `main.js:87-131`'deki `onclick` atamalarını sil ve oradaki oyun-başlatma yan etkilerini (pointer lock, `soundManager.init`, hoş geldin bildirimi) UIManager'ın çağıracağı tek bir `onGameStart` callback'ine taşı (`setFastTravelHandler` kalıbının aynısı). | 1-2s | Manuel: başlatınca TEK hoş geldin bildirimi, TEK cıngıl; "Yeni Tımar" tek reset (console.log ile sayılabilir). Kod: `grep -n "onclick" src/main.js` → 0 sonuç. |
| P0-7 | `src/main.js:87-95` + `src/ui/UIManager.js:162-167` + `src/core/AudioManager.js:26-40` | ⊕ Ses butonu hiç çalışmıyor (çift binding `toggleMute`'u iki kez çağırıp iptal ediyor); ayrıca init'ten önce mute yapılırsa `startAmbient` bir daha asla çağrılmadığı için rüzgar/kuş ambiyansı oturum boyu sessiz kalıyor. | P0-6 ile tek binding'e in; `toggleMute` içinde unmute dalına "ambient hiç başlamadıysa `startAmbient()` çağır" koşulu ekle (`this.ambientStarted` bayrağı); buton ikonunu (🔊/🔇) duruma göre güncelle. | 30-45dk | Manuel: start ekranında sesi kapat → oyuna gir → sesi aç: rüzgar/kuş sesi duyuluyor; buton ikonu her tıkta değişiyor. |

**P0 toplamı: ≈ 9-13 saat (1,5-2 gün).** P0 bitince yapılacak ilk şey §7.5'teki 10 adımlık duman testidir.

### 1.2 P1 — Döngü kıranlar

| ID | Dosya:Satır | Belirti | Düzeltme tarifi | Süre | Doğrulama |
|---|---|---|---|---|---|
| P1-01 | `src/core/SaveManager.js` (hiç import edilmiyor; `:41-57` eksik alanlar; `:20-36,159-205` bağlantı sızıntısı) | ⊕ Kayıt/yükleme fiilen yok: SaveManager hiçbir yerden çağrılmıyor; bağlansa bile `serializeState` aliStatus/activeCampaign/currentPetition'ı kapsamıyor; `getDB` her çağrıda yeni IndexedDB bağlantısı açıp kapatmıyor. | §6'daki plana göre bağla: otomatik kayıt + "Devam Et" + manuel kayıt; serialize kapsamını genişlet; `saveVersion` alanı ve migrasyon iskeleti ekle; `getDB`'yi tek bağlantılı yap. | 1,5-2g | §6.5'teki kabul kriterleri (test + manuel). |
| P1-02 | `src/systems/PetitionSystem.js:60-73` ↔ `src/core/GameState.js:212-233` + `GameState.js:12,117,216-217` | ⊕ "Gün" kavramı çatallı: PetitionSystem 45 gerçek saniyeyi 1 gün sayıp `daysPassed`'i artırıyor, GameState ~133 dakikada bir artırıyor; ayrıca `daysPassed` ve `time.dayCount` aynı şeyi sayan iki sayaç. | Tek zaman otoritesi GameState olur: PetitionSystem'deki `daysPassed++` ve kendi gün zamanlayıcısı kaldırılır; arzuhal üretimi ve inşaat ilerlemesi `gameState.time.dayCount` değişimini dinler (PetitionSystem.update'e "gün değişti mi" karşılaştırması). `daysPassed` kaldırılıp tüm okuyucular `time.dayCount`'a bağlanır (grep ile: PetitionSystem, DEVELOPMENT_SPEC hatırlatması, testler). **Tempo kararı (01-akış dokümanı Karar Z1 aynen benimsenir):** `daySpeed` 0.003 → **1/60 ≈ 0.01667** — ezber kural: 1 gerçek saniye = 1 oyun dakikası, 1 gerçek dakika = 1 oyun saati, tam gün = 24 gerçek dk (aktif gün ≈ 16,5 dk); mevsim/yıl içeriğini erişilir kılar. Sabit `src/data/balance.js`'e `DAY_SPEED` olarak taşınır (uyku sırasında 60× hızlanma da 01-akış Karar Z8'in işidir, çarpan yine balance.js'ten okunur). | 4-6s | Test (01-akış Z1 kabulü): 60 sn simülasyonda `dayTimeHours` +1.0 (±0.01) artar; arzuhal-gün senkron; `grep -rn "daysPassed" src/` → 0. Manuel: bir oyun günü ~24 dk sürüyor; inşaat "2 gün" gerçekten 2 oyun günü sürüyor. |
| P1-03 | `src/core/GameState.js:261` + `src/systems/TimarSystem.js:11` | "Yıllık" öşür vergisi yılda 4 kez toplanabiliyor: `taxCollectedThisYear` her mevsim (10 günde bir) sıfırlanıyor. | `this.timar.taxCollectedThisYear = false;` satırını `advanceSeason` gövdesinden `if (this.time.seasonIndex === 0)` bloğunun içine taşı (yıl dönümünde sıfırlama). | 15dk | Test: iki `advanceSeason()` çağrısı arasında `collectAnnualTax` ikinci kez reddedilir; 4 mevsim sonra tekrar toplanabilir. |
| P1-04 | `src/core/GameState.js:263-268,271-285` | `checkHistoricalEvents` yıl artırıldıktan SONRA çağrıldığı için `year === 1396` koşulu asla sağlanmıyor; yıl bazlı ferman/sefer üretimi ölü. | 06 F2-02(c) NİHAİ KARARI: bu bug "düzeltilmez", fonksiyon NÖTRLEŞTİRİLİR — `checkHistoricalEvents` çağrısı kaldırılır (kampanya tek yılda geçer, yıl-dönümü olayı hiç tetiklenemez); ferman/quest_campaign aktivasyonu gün-dönümü kancasında g125 eşiğiyle yapılır (Ç16). `historicalEvents.js` diye AYRI DOSYA AÇILMAZ; tek gün-bazlı olay mekanizması Faz 4B'nin HistoricalNews'udur. | 1s | Test: gün-dönümü simülasyonunda `dayCount=125` → quest_campaign aktif + ferman bildirimi assert; `grep historicalEvents src/` → 0. |
| P1-05 | `src/ui/UIManager.js:277-283,587-681`, `src/services/GeminiService.js:6-12,43` | ⊕ Oyunun en özgün mekaniği ölü: "Reddet" butonu `openRejectionModal` yerine düz `rejectPetition` (-5 moral) çağırıyor; `setApiKey`'i çağıran UI yok; API anahtarı URL query'de taşınıyor. | (a) `:277` handler'ı `openRejectionModal()`'a yönlendir; modal akışı (yaz → `submitRejectionReason` → `showKadiVerdict`) zaten hazır. (b) Varsayılan yol **çevrimdışı `evaluateHeuristic`** olur (TARIHSEL §15: ana görev çevrimiçi hizmete bağlanamaz); API anahtarı girilmişse Gemini denenir, hata/timeout'ta sessizce heuristic'e düşer. (c) `callGeminiAPI`'de anahtarı `?key=` yerine `x-goog-api-key` header'ı ile gönder. (d) Ayarlar/başlangıç ekranına opsiyonel "Gemini API anahtarı" alanı (boş bırakılabilir). (e) Güvenlik denetimi: çalışma kopyası VE commit geçmişi API anahtarı için taranır (`git log -p` üzerinde `AIza` kalıbı vb.; bulunan anahtar derhal iptal edilir); anahtar SaveManager serialize kapsamına ve konsol loglarına ASLA yazılmaz — bu kural test ile zorlanır. | 4-6s | Manuel: arzuhal reddet → gerekçe modalı açılır, gerekçe yaz → kadı hükmü modalı, asayiş/moral gerekçe kalitesine göre değişir; ağ kapalıyken akış aynen çalışır. Test: `evaluateHeuristic('trol metin')` düşük puan, meşru gerekçe yüksek puan assert; serialize çıktısında ve log çağrılarında anahtar dizgesi yok assert. Kod: `git log -p \| grep "AIza"` → 0 sonuç. |
| P1-06 | `src/systems/CampaignBattleSystem.js:26,97,148` + `src/systems/HistoryEventSystem.js:9-11,38-81` + `src/ui/UIManager.js:346,358` | ⊕ 5 safhalı Niğbolu muharebe motoru (kazık hattı, sahte ricat, Sigismund safhası) yazılmış ama hiçbir yerden çağrılmıyor; sefer tek `Math.random()` metin kutusu; Ali'nin bacak kopması (`legSevered`, `:148`) ve ona bağlı 3 günlük dram sayacı + taşlanma fail-state'i erişilmez. | **CampaignBattleSystem kanonik ilan edilir.** `joinActiveCampaign` başarılı olduğunda `simulateNigboluCampaign` yerine `getBattleSystem().startNicopolisBattle()` çağrılır; savaş sonucu modalı (`showBattleResult`) safha metni + 2-4 seçenek butonu render eden basit bir döngüye genişletilir (`executePhaseAction` zaten durum tutuyor); `concludeBattle` ödül/`legSevered` zincirini işletir. `simulateNigboluCampaign` ve `activeCampaign.rewardAkce/rewardRep` çelişkisi temizlenir: ödül tek kaynaktan (CampaignBattleSystem sonuç tablosu). Bu, TARIHSEL Bölüm 14'ün tam 3D versiyonu DEĞİLDİR; Aşama 4'e köprü kuran metin-taktik ara çözümdür. | 1-1,5g | Test: `startNicopolisBattle()` → 5 safha `executePhaseAction` ile ilerliyor, `concludeBattle` sonrası `gameState.aliStatus.legSevered===true` senaryosu üretilebiliyor (mevcut test 314-340 korunur). Manuel: sefere katıl → safha safha seçim yaparak savaş; zafer sonrası Ali görevi (quest_save_ali_leg) aktifleşiyor ve 3 gün sayacı işliyor. |
| P1-07 | `src/systems/ArcherySystem.js:144-183` | Ok yalnız poligon hedefi ve zemini test ediyor; düşmana ok işlemiyor — okçuluk dövüşte kullanılamıyor. | `updateArrows` çarpışma bloğuna `npcManager.enemies` taraması ekle: önceki→şimdiki pozisyon segmenti ile düşman merkezine nokta-segment mesafesi < 0.9 ise isabet; hasar mevcut `CombatSystem.calculateDamage('piercing', enemy.armorType)` üzerinden uygulanır ve `combat.killEnemy` akışı (ganimet, quest sayacı) yeniden kullanılır. | 3-4s | Test: sahte enemy objesiyle `releaseArrow` sonrası health düştü assert. Manuel: harami kampında 1 harami yalnız okla öldürülebiliyor, quest_bandits sayacı işliyor. |
| P1-08 | `src/entities/Player.js:37,72-74` (+ çağıranlar `CombatSystem.js:195,226,267,309`, `ArcherySystem.js:113`) | `addCameraShake` ile biriken sarsıntı hiçbir yerde kameraya uygulanmıyor/sönümlenmiyor — tüm vuruş hissi çağrıları boşa gidiyor. | `Player.update` kamera bölümüne: `if (this.cameraShake > 0.001) { camera.position.x += (Math.random()-0.5)*this.cameraShake; camera.position.y += (Math.random()-0.5)*this.cameraShake; this.cameraShake *= Math.pow(0.001, delta); }` benzeri sönümlü offset ekle (birinci/üçüncü şahıs her iki dalda). | 1s | Manuel: kılıç isabetinde ve ok atışında kısa, sönümlenen sarsıntı hissediliyor; 1 sn içinde tamamen duruyor. |
| P1-09 | `src/entities/VillagerAI.js:162` + `:164-184` | ⊕ 24 saat rutininin "eve dönüş" ayağı kırık: köylü 22:00'de olduğu yerde yere yatıyor (SLEEPING'de yürüme dalı atlanıyor); sabah da `rotation.x` sıfırlanmadığı için işe YATARAK kayıyor. | (a) `isMoving` koşulundan `currentState !== SLEEPING` şartını kaldır; uyku animasyonu (yere yatma) yalnız `homePos`'a varınca (mesafe < 1) uygulansın. (b) Yürüme dalının başında `mesh.rotation.x`'i 0'a lerple. | 1-2s | Manuel (daySpeed hızlandırılmış dev modda): 22:00'de köylüler evlerine yürüyüp orada yatıyor; 06:00'da ayakta yürüyerek işe gidiyor. |
| P1-10 | `src/entities/Player.js:273` (↔ `:57`, `ArcherySystem.js:46`) | Birinci şahısta her kare `weaponRig.visible = true` atanıyor: Q ile kına sokulan kılıç ve yay modu gizlemesi her karede eziliyor (yay + kılıç aynı anda ekranda). | `:273` satırını koşullu yap: `this.weaponRig.visible = gameState.sipahi.swordDrawn && !archery.bowMode;` (archery referansı main.js'ten enjekte edilir veya `gameState.sipahi.bowMode` bayrağına taşınır — ikincisi tercih; ArcherySystem toggle'da bu bayrağı günceller). | 1s | Manuel: Q → kılıç kayboluyor ve kaybolmuş kalıyor; R yay modunda yalnız yay görünüyor; test: `toggleWeapon` sonrası `weaponRig.visible === false` assert (mevcut Test korunur). |
| P1-11 | `src/entities/NPCManager.js:193,313` + `src/ui/UIManager.js:388-390` + `src/systems/DialogueSystem.js` | ⊕ Saka İbrahim ve 3 kale nöbetçisi konuşamıyor (`saka_talk`/`guard_talk` tanımsız) ve `openDialogue` bilinmeyen id'de sessizce çıkıyor — oyuncu "oyun bozuk" hissi yaşıyor. | (a) `openDialogue`'a fallback: `getDialogueData` null dönerse jenerik tek replik göster ("Beyim, işim başımdan aşkın, kusura kalma." + kapat) — bir daha hiçbir NPC sessiz kalamaz. (b) `saka_talk` ve `guard_talk` diyaloglarını içerik ekibinin şemasıyla (§4) ekle — Saka için su/temizlik kültürü, nöbetçiler için Niğbolu öncesi asker havadisi (içerik metni 03-içerik dokümanından gelir; teknik iş yalnız düğümleri bağlamaktır). | 2-3s (fallback+iskele) | Manuel: dört NPC'de E → diyalog açılıyor. Test: tüm `NPCManager` dialogueId'leri için `getDialogueData(id) !== null` assert (yeni koruyucu test — gelecekte aynı sınıf hatayı engeller). |
| P1-12 | `src/systems/DialogueSystem.js:117-131` (imam), `:223-236` (demirci), `:472-484` (attar) | "Ali'nin bacağı koptu" seçenekleri savaş olmadan görünür ve tıklanabilir: 13. görev hikâye dışı bedavaya tamamlanıyor, dramatik final spoiler'lanıyor. | Bu üç seçeneğe koşul ekle: yalnız `gameState.aliStatus.legSevered === true` VE `quest_save_ali_leg.status === 'active'` iken listelensin (bkz. §4 — koşullu seçenek `condition` alanı; geçiş öncesi mevcut yapıda `choices` dizisini runtime'da filtreleyen küçük bir yardımcıyla çözülür). | 1-2s | Manuel: sefer öncesi imam/attar/demirci diyaloglarında Ali seçeneği yok; P1-06 sonrası `legSevered` senaryosunda beliriyor. Test: legSevered=false iken imam_talk choices'ında "değneği getirdim" metni yok assert. |
| P1-13 | `src/systems/QuestSystem.js:439-441` (+ `TimarSystem.js:49-52`) | `advanceObjective` kilitli görevleri önkoşulsuz 'active' yapıyor: tek tık cebelü donatmak 4 görev hedefini zincir dışı ilerletiyor, bölüm yapısı deliniyor. | `advanceObjective`'de `locked` → `active` geçişini kaldır: hedef ilerletme yalnız `active`/`available` görevlerde çalışsın; görev aktifleştirme yalnız `syncAvailableQuests`'in işi olsun ("activate" ile "progress" ayrımı, TARIHSEL §12 ile uyumlu). | 1-2s | Test: `quest_cebelu` locked iken `trainCebelu()` çağrısı hedef ilerletmiyor; quest_blacksmith bitince (önkoşul) aynı çağrı ilerletiyor. |
| P1-14 | `src/systems/QuestSystem.js:464-483` + `src/entities/NPCManager.js:585-622` | Haramiler tek seferlik spawn ve öldürmeler yalnız görev active/available iken sayılıyor: erken temizlik `quest_bandits`'i kalıcı tamamlanamaz yapıyor. | `onEnemyDefeated`'daki durum filtresini kaldırıp sayaç her durumda işlesin; görev aktifleştiğinde sayaç geriye dönük değerlendirilsin (`banditKills >= 3` ise hedef tamam). Alternatif (daha büyük iş, seçme): spawn'ı görev aktivasyonuna bağla — ilk çözüm tercih edilir (cerrahi). | 1s | Test: görev locked iken `onEnemyKilled('bandit')`×3 → görev available olunca otomatik tamamlanabilir durumda assert. |
| P1-15 | `src/ui/UIManager.js:936-942` ↔ `src/entities/TownGenerator.js:174,293,390` | Minimap landmark'ları yanlış konumda (Mescid (40,15)≠(12,-4), Demirci (-25,35)≠(-62,8), Değirmen (-55,-25)≠(48,-38)) — radar aktif yanlış yönlendiriyor. | Landmark listesini gerçek TownGenerator koordinatlarıyla güncelle; kalıcı çözüm için koordinatları TownGenerator'ın ürettiği bir `landmarks` dizisinden oku (tek kaynak ilkesi; TownGenerator zaten yapı konumlarını biliyor). | 1-2s | Manuel: minimap'te mescid/demirci/değirmen ikonlarına yürü — ikon ile yapı örtüşüyor. |
| P1-16 | `src/ui/UIManager.js:324-328,343` ↔ `src/entities/TownGenerator.js:724` | Hızlı seyahat "Orman Harami Sığınağı" (-70,+60)'a ışınlıyor; gerçek kamp (-80,-80) — ~150m yanlış nokta. | Koordinatı (-80,-80) yakınına (kamp dışı güvenli nokta, ör. (-70,-70)) düzelt; buton handler'ı ve canvas tıklamasındaki kopya koordinatları tek sabit tablodan okut (bkz. §8 magic number kuralı). | 30dk | Manuel: haritadan sığınağa seyahat → kamp görüş mesafesinde. |
| P1-17 | `src/entities/TownGenerator.js:290` + `src/entities/Player.js:257-264` | Taş köprünün tamamı collider (üstünden geçilemiyor); nehirde collider yok ve göz hizası sabit → oyuncu su üstünde yürüyor. | Köprü collider'ını kaldırıp yalnız iki yan korkuluğa dar AABB koy (köprü sırtı yürünebilir); nehir şeridine alçak "yasak bölge" collider'ı ekle (oyuncu kıyıdan köprüye yönlendirilir). Not: gerçek yükseklik/derinlik işi P2-17 (terrain tek kaynağı) kapsamındadır; buradaki iş yalnız geçilebilirliği düzeltir. | 2s | Manuel: köprüden karşıya geçilebiliyor; nehre girilemiyor. |
| P1-18 | `src/main.js:137-141` + `src/entities/Player.js:117-119` + `src/systems/ArcherySystem.js:44-46` | Yay modunda her sol tık ayrıca `triggerAttack`'ı tetikleyip "⚠️ Önce pusatını kuşan! (Q)" spamı basıyor. | `main.js` onAttack köprüsüne koşul: `if (archery.bowMode) return;` — yay modundayken kılıç saldırı yolu hiç çalışmaz (P1-10'daki `bowMode` bayrağı kullanılır). | 30dk | Manuel: yay modunda 5 ok at — hiçbir uyarı bildirimi yok; yaydan çıkınca sol tık yine kılıç sallıyor. |
| P1-19 | `src/core/GameState.js:190-197` ↔ `src/ui/UIManager.js:1225-1235` | Çiftbozan game-over ekranı açıklama satırında "undefined" gösteriyor: `checkCiftbozan` uzun metni `reason`'a yazıyor, overlay `desc` okuyor; diğer iki fail-state farklı şema kullanıyor. | Fail-state şemasını tekle: `reason` = kısa makine kodu (`'ciftbozan'`), `desc` = oyuncuya gösterilen uzun metin; `checkCiftbozan`'ı bu şemaya çevir, `:1233` `desc` okumaya devam eder. Not: `'stoning_linch'` reason kodu, 06-fazlar-ve-kabul.md F0-12'nin taşlanma kurgusunu kadı-azil ile değiştirmesiyle bayatlamıştır — yeni kod (ör. `'kadi_azil'`) TEK yerde tanımlanır (fail-state sabit tablosu) ve ikon kontrolü ile F0-12 metni bu koda hizalanır. | 45dk | Test: `reayaTrust=10; checkCiftbozan()` → `failState.desc` dolu ve 'undefined' içermiyor assert. Manuel: köylüye 4 vuruş → overlay'de anlamlı açıklama. |
| P1-20 | `src/core/AudioManager.js` (eksik metotlar) ← `PetitionSystem.js:81,100,158`, `UIManager.js:676` | ⊕ `playNotification()` ve `playCoinJingle()` tanımsız: arzuhal gelişi, ulak, inşaat ve kadı hükmü tamamen sessiz (try/catch yutuyor). | AudioManager'a mevcut osilatör kalıbıyla iki kısa metot ekle: `playNotification` (2 nota, yumuşak çan benzeri), `playCoinJingle` (3 hızlı yüksek nota, metalik). Mevcut `playVictoryJingle` şablon alınır. | 1-1,5s | Manuel: arzuhal gelince ve kabul edilince ses duyuluyor. Test: metotların varlığı `typeof soundManager.playNotification === 'function'` assert. |
| P1-21 | `src/core/GameState.js:reset()` ← `PetitionSystem.js:80` | `hasPendingMessenger` reset'te tanımlanmıyor (dinamik ekleniyor): "Yeni Tımar" sonrası bayat bayrak kalabiliyor. | `reset()`'e `this.hasPendingMessenger = false;` ekle; ayrıca P1-01 serialize kapsamına dahil et. | 15dk | Test: bayrağı true yap, `reset()` → false assert. |
| P1-22 | `electron-main.cjs:39-53` ↔ `vite.config.js:6` | Electron önce 5173'ü deniyor, Vite 3000'de: her açılışta gecikme + makinede 5173'te başka Vite projesi varsa YANLIŞ uygulama yükleniyor. | §9.1'deki düzeltme: birincil URL `http://localhost:3000`, yedek dist. 5-dakikalık iş, P1'e alındı çünkü yanlış-uygulama-yükleme gerçek bir tehlike. **Not:** analiz sonrası commit 1ea86b2 ("Electron port izolasyonu") bu maddeyi kısmen/tamamen çözmüş olabilir — Faz 0'da yeniden doğrula; çözülmüşse satır yalnız doğrulama adımıyla kapatılır. | 15dk | Manuel: `npm run dev` + `npm run desktop` → doğru oyun açılıyor; 5173'te başka proje çalışırken de doğru oyun açılıyor. |

**P1 toplamı: ≈ 8-11 iş günü.** Sıralama önerisi: P1-01/02/03/04 (durum ve zaman omurgası) → P1-05/06 (arzuhal + sefer döngüleri) → kalanlar bağımsız, paralel yapılabilir.

### 1.3 P2 — Cila, denge, borç

Tema etiketli tek liste; her satır aynı sözleşmeyi taşır. Süresi 30dk altındaki metin/typo işleri "mikro" olarak gruplandı.

| ID | Dosya:Satır | Belirti | Düzeltme tarifi | Süre | Doğrulama |
|---|---|---|---|---|---|
| P2-01 | `src/systems/QuestSystem.js:491-500` | `rewards.title` hiç uygulanmıyor: vaat edilen "Gazi Sancakbeyi Naibi" / "Vefakâr Gazi Sipahi" unvanları verilmiyor. | `completeQuest`'e `if (q.rewards.title) gameState.sipahi.title = q.rewards.title;` dalı + HUD/başlangıç ekranında unvan gösterimi. | 1s | Test: quest_campaign tamamla → `sipahi.title` assert. |
| P2-02 | `src/systems/QuestSystem.js:499` | `rewards.maxHealth` azami canı artırmıyor, yalnız fulluyor — ödül adıyla çelişiyor. | `gameState.sipahi.maxHealth += q.rewards.maxHealth; health = maxHealth;` olarak düzelt. | 30dk | Test: quest_blacksmith sonrası maxHealth 115 assert. |
| P2-03 | `src/ui/UIManager.js:521-526` | Görev günlüğü `rewards.reputation/morale` anahtarlarını arıyor; görevler `reayaTrust/sancakReputation/squadLoyalty/faction*/maxHealth` veriyor — itibar ödülleri hiç gösterilmiyor. | Ödül-pill eşleme tablosunu gerçek anahtar setiyle değiştir (etiket: "Reaya Güveni +15" vb.); tek kaynak: §4'te tanımlanan `REWARD_LABELS` sözlüğü. | 1s | Manuel: J günlüğünde her görevin tüm ödülleri rozet olarak görünüyor. |
| P2-04 | `src/core/GameState.js:168-170` + `TimarSystem.js:25,75` + `PetitionSystem.js:117` | ⊕ `timar.morale`'in iki yazarı var (TimarSystem doğrudan, GameState `morale = reayaTrust` ile ezerek): ziyafet/mescit ödülleri ilk itibar değişiminde siliniyor. | Tek yazar kuralı: `morale` türetilmiş değer ilan edilir — TimarSystem/PetitionSystem morale'i doğrudan değil `modifyReayaTrust` üzerinden değiştirir; `morale` alanı `reayaTrust`'ın alias'ı olarak korunur (kayıt uyumluluğu). | 1-2s | Test: `feastVillagers()` sonra `modifyReayaTrust(+1)` → ziyafet etkisi kaybolmuyor assert. |
| P2-05 | `src/systems/TimarSystem.js:60-61` | `patrolVillage` `sipahi.reputation`'ı doğrudan artırıyor; `modifySancakReputation` kullanmadığı için bonus ilk itibar değişiminde eziliyor. | Çağrıyı `gameState.modifySancakReputation(2)`'ye çevir. | 15dk | Test: patrol → `reputation.sancakReputation` arttı assert. |
| P2-06 | `src/systems/TrainingSystem.js:142` + `CombatSystem.js:314` + `ArcherySystem.js:178` | `cebeluExperience` 5 yerden artırılıyor ama hiçbir yerde okunmuyor — boş sayaç. | Kısa vade: Tımar Defteri'ne "Cebelü Tecrübesi" satırı ekle (görünürlük). Orta vade: TARIHSEL §7 ustalık sistemine geçişte bu sayaç `archeryMastery` vb. alanlara bölünür (ayrı tasarım işi). | 1s | Manuel: TAB defterinde tecrübe değeri görünüyor ve talimle artıyor. |
| P2-07 | `src/systems/CombatSystem.js:384-402` | Düşman saldırısı sabit 18 hasar; oyuncunun zırh seviyesi savunmada hiç kullanılmıyor. | `enemyAttackPlayer`'da hasarı `18 - armorLevel*2` (min 8) yap; blok emilimi korunur. Denge değerleri `balance.js`'e. | 1s | Test: armorLevel 0 vs 3 için alınan hasar farkı assert. |
| P2-08 | `src/systems/CombatSystem.js:296-319` | "Talim mankenleri" görünmez: koordinatlarda mesh yok, boşluğa vurunca "tam isabet!" + sınırsız XP. | TownGenerator'a talimgâh konumunda 2 manken mesh'i ekle (ModelBuilder'da basit ahşap kukla) ve koordinatları TownGenerator'dan CombatSystem'e geçir (sabit kod kopyası kalkar); XP kazanımına 10 sn cooldown. | 2-3s | Manuel: mankenler görünüyor, vurunca sarsılıyor; boş alanda "isabet" mesajı yok. |
| P2-09 | `src/systems/CombatSystem.js:31-60` | `applyDamageFlash` yarış durumu: 220ms içinde ikinci vuruş düşmanı kalıcı kırmızı bırakabiliyor. | Mesh başına `userData.flashTimeout` sakla; yeni flash gelince eski timeout'u `clearTimeout` et ve orijinal rengi mesh'te bir kez (`userData.origEmissive` yoksa) kaydet. | 1s | Manuel: hızlı 4'lü komboda düşman rengi normale dönüyor. |
| P2-10 | `src/systems/ArcherySystem.js:153-155` | Tam güç okta tünelleme: 57 m/s ok 1.2m'lik isabet penceresini tek karede atlayabiliyor. | Nokta testi yerine önceki→şimdiki pozisyon segmenti ile hedef düzlemi kesişimi testi (P1-07'deki segment yardımıcısı yeniden kullanılır). | 1s | Manuel: 20 tam güç atışın tamamı isabet kaydediyor (önceden ~%20 kayıp). |
| P2-11 | `src/systems/CombatSystem.js:202` | Vuruş geri tepmesi collider kontrolsüz: düşman duvara gömülebiliyor. | `addScaledVector` öncesi hedef pozisyonu `town.colliders`'a karşı test et (Player.checkCollision mantığı yardımcı fonksiyona çıkarılıp paylaşılır); çarpışıyorsa itme uygulanmaz. | 1-2s | Manuel: duvara sıkıştırılan düşman duvarın içine girmiyor. |
| P2-12 | `src/systems/CombatSystem.js:404-409` + `GameState.js:190` | Ceza dengesi ters: ölüm -100 akçe ile ucuz, köylüye kaza vuruşu (-15 güven) 4 vuruşta game-over. | Denge işi: köylüye ilk vuruşta uyarı + küçük ceza, tekrarında büyüyen ceza (kademelendirme); ölüme teçhizat aşınması/itibar kaybı ekle. Değerler `balance.js`'te; nihai sayılar oynanış tasarım dokümanıyla koordine. | 2-3s | Manuel: tek kaza vuruşu game-over spiraline girmiyor; ölümün hissedilir bedeli var. |
| P2-13 | `src/systems/PetitionSystem.js:16-53,104-128` | 4'lük arzuhal havuzu ~10 dakikada tekrar ediyor; tamamlanan inşaat havuzdan düşmüyor (aynı değirmen defalarca +800 gelir — enflasyon). | Tamamlanan `construction` tipli arzuhalleri havuzdan çıkar; art arda aynı arzuhalin gelmesini engelle (son id'yi hatırla). Havuzun genişletilmesi içerik işidir (§4 petitions.js). | 1-2s | Test: değirmen inşaatı bitince ikinci değirmen arzuhali üretilmiyor assert. |
| P2-14 | `src/systems/DialogueSystem.js:74-95` | Kethüda'nın harami bilgi dalı vergi hedefini (`quest_inspect`,1) tamamlıyor — hedef metniyle davranış uyumsuz. | Harami dalındaki `advanceObjective('quest_inspect',1)` çağrısını kaldır; hedef yalnız vergi/ziyafet seçimlerinden ilerlesin. | 30dk | Manuel: harami sorusu görev ilerletmiyor; vergi kararı ilerletiyor. |
| P2-15 | `src/entities/TownGenerator.js:682-695` | Kale yolu meşaleleri hiç spawn olmuyor (tek sayı x'te `%22===0` imkânsız) — 125m yol gece karanlık. | Koşulu döngü sayacına çevir: her 6. plakada meşale (`i % 6 === 0`); ışık bütçesi için meşale PointLight'ları paylaşımlı/az sayıda tutulur (TARIHSEL §15 ışık bütçesi). | 1s | Manuel: gece kale yolunda düzenli aralıklı meşaleler yanıyor. |
| P2-16 | `src/entities/TownGenerator.js:26-32` ↔ `:101-106` ↔ `Player.js:257-264` | Üç sistem üç farklı zemin varsayıyor: `getTerrainHeight` eğim bildiriyor, zemin düz, Player sabit göz hizası — NPC'ler değirmende havada yürüyor. | Kısa vade (cerrahi): `getTerrainHeight` düz zemine (0 döndür) sabitlenir — havada yürüme biter. Uzun vade (Grafik C aşaması): gerçek heightmap + tüm sistemler tek fonksiyondan okur. | 30dk (kısa) | Manuel: değirmen civarında NPC ayakları zeminde. |
| P2-17 | `src/entities/VillagerAI.js:164-184` + `NPCManager.js:643-651` | NPC'ler ve haramiler collider tanımıyor: duvar/ev içinden geçiyorlar. | Player'daki `checkCollision` AABB testini paylaşılan yardımcıya çıkar (P2-11 ile aynı iş); VillagerAI ve düşman kovalamacası hedefe adım atmadan önce test etsin, çarpışmada eksen-ayrık kaysın. NavMesh Aşama 4 işidir, burada istenmez. | 3-4s | Manuel: köylüler kapılardan dolaşıyor, haramiler duvardan geçmiyor. |
| P2-18 | `src/entities/NPCManager.js:53-267` (eatPos) | 15+ NPC öğlen aynı noktaya (-10,0,24) iç içe yığılıyor. | Her NPC'nin `eatPos`'una config sırasına göre deterministik ofset ekle (han önü masa slotları: 2×8 grid). | 1s | Manuel: 12:30'da NPC'ler ayrı noktalarda oturuyor/duruyor. |
| P2-19 | `src/entities/ModelBuilder.js:1190` + `Player.js:266-268` | At bacakları 18 m/s dörtnalda donuk; at y=0 sabit. | `userData.legs` pivotlarını Player.update'te hız > 0 iken sinüzoidal salınımla oynat (4 bacak faz kaydırmalı); ayrıntılı at animasyon seti Grafik C işi. | 2s | Manuel: at koşarken bacaklar hareketli. |
| P2-20 | `src/entities/NPCManager.js:655-662` | `getNearbyNPC` en yakını değil dizideki ilkini döndürüyor — kalabalıkta E yanlış kişiyle konuşuyor. | Döngüde min-mesafe takibiyle en yakın NPC'yi seç. | 30dk | Manuel: iki NPC yan yanayken E hep yakındakini açıyor. |
| P2-21 | `src/entities/TownGenerator.js:243-257` ↔ `:567-573` | Talimgâhtaki 3 hedef tahtası `archeryTargets`'a eklenmiyor — oklar içinden geçiyor. | Üç hedefi de `archeryTargets` listesine push et (buildArcheryRange kalıbı). | 30dk | Manuel: talimgâh hedefinde ok isabeti puanlanıyor. |
| P2-22 | `src/entities/TownGenerator.js:868-885` + `ModelBuilder.js:868-874` | Sedir yataklar içi dolu ev bloklarının İÇİNE gömülü — oyuncu asla göremiyor. | Kısa vade: yatak spawn'ını kaldır (görünmez içerik yaşatma). Ev içleri TARIHSEL Grafik C kapsamında ayrıca tasarlanacak. | 15dk | Kod: yatak üretim çağrısı yok; sahnede kayıp mesh azaldı. |
| P2-23 | `src/entities/ModelBuilder.js:842-858` | 'cap' başlık dalı yok: 10+ NPC 1396 için ~430 yıl anakronik KIRMIZI FES giyiyor. | 'cap' için dönem başlığı üret (mevcut börk kalıbından türetilmiş külah/kavuk varyantı); fes dalını kaldır. Tarihsel not: başlık-statü ilişkisi kodeks maddesi olarak içerik ekibine kanca (§4). | 1-2s | Manuel: köyde fes yok; başlıklar börk/kavuk/sarık. |
| P2-24 | `src/entities/TextureGenerator.js:11-19` ↔ `Engine.js:92` | Anisotropy hiçbir dokuya uygulanmıyor (cache boşken set ediliyor) — uzak zemin bulanık. | Doku üretim fonksiyonlarında `texture.anisotropy = TextureGenerator.maxAnisotropy || 1` ata; Engine set sırası önemsizleşir. | 45dk | Manuel: uzak taş yol dokusu belirgin daha net (önce/sonra ekran görüntüsü). |
| P2-25 | `src/core/InputManager.js:35-56` + modal davranışları | ⊕ Kısayollar start ekranı/game-over/modal açıkken çalışıyor; Escape modal kapatmıyor; diyalogta E köke sıfırlıyor; modal kapanınca pointer lock geri istenmiyor — akışı en çok kesen sürtünme kümesi. | Merkezi input-context: `gameState.uiMode` ('start'/'playing'/'modal'/'gameover') alanı; InputManager keydown başında mode kontrolü — 'playing' değilse yalnız Escape işlenir; Escape açık modalı kapatır; UIManager modal kapatınca `renderer.domElement.requestPointerLock()` çağırır; diyalog açıkken E yutulr. | 3-4s | Manuel: start ekranında F/TAB ölü; TAB→Escape→fare kilidi otomatik geri; diyalogta E spam sorunsuz. |
| P2-26 | `src/main.js:70,244` | `isRunning` hiç false olmuyor: game-over overlay'inde simülasyon tam hızda akıyor. | `checkFailState` overlay açarken `game.isRunning = false` benzeri bir duraklatma bayrağı set etsin (render devam, simülasyon adımları atlanır); "Yeniden Başla" reload zaten var. | 1s | Manuel: game-over'da NPC'ler ve saat duruyor. |
| P2-27 | `src/core/AudioManager.js:79-90` | startAmbient interval'ları saklanmıyor/temizlenmiyor: ambient yaşam döngüsü yok. | Interval id'lerini alanlara ata, `stopAmbient()` ekle; mute'ta stop, unmute'ta start (P0-7 ile uyumlu). | 45dk | Kod: `clearInterval` çağrıları mevcut; mute→unmute döngüsü 3 kez sorunsuz. |
| P2-28 | `src/core/SteamManager.js:12-21` + `QuestSystem.js:504` | ⊕ 8 başarımın 6'sı hiç tetiklenmiyor; her görev bitişi tanımsız `ACH_FIRST_PATROL`'ü çağırıyor. | Görev→başarım eşlemesini veriye taşı (`quests.js` içinde `achievement` alanı): quest_inspect→ACH_FIRST_INSPECT, quest_blacksmith→ACH_BLACKSMITH, quest_castle→ACH_CASTLE_DISCOVERY, quest_bandits→ACH_BANDIT_SLAYER, quest_campaign→ACH_NIGBOLU_VICTORY; akçe ≥ 2500 kontrolüyle ACH_WEALTHY_SIPAHI (updateTime gün dönümünde). `ACH_FIRST_PATROL` çağrısı kaldırılır. | 1-2s | Manuel: ilgili anlarda başarım banner'ı görünüyor (simülasyon modunda). |
| P2-29 | `src/core/GameState.js:207-209` | Bildirim kuyruğu 5 kayıt: yoğun anda mesajlar okunmadan siliniyor; kalıcı günlük yok. | Kuyruk sınırını ekranda 3 eşzamanlıya düşür (TARIHSEL §9.9) ama silinenleri `notificationLog`'a (son 100) taşı; Tımar Defteri'ne "Vakayiname" sekmesi (salt okunur liste). | 2-3s | Manuel: yoğun savaşta bildirimler sırayla akıyor; TAB→Vakayiname'de geçmiş duruyor. |
| P2-30 | `src/ui/UIManager.js:836-845` + `index.html:67` | Pusula şeridi boş div: çentik/yön harfleri hiç üretilmiyor — kayan şerit tasarımı ölü. | `buildCompassTape()` ile 8 yön harfi + çentikleri bir kez DOM'a üret (900px genişlik CSS'te tanımlanır), mevcut translateX çalışır. | 1-2s | Manuel: dönerken şeritte K/KD/D... harfleri akıyor. |
| P2-31 | `src/ui/UIManager.js:486-549` ↔ `style.css:707-719` | Görev defteri JS'in ürettiği ~11 sınıfın CSS'i yok (düz metin görünüyor); `.quest-list-item` ölü CSS. | Üretilen sınıflar için stil bloğu yaz (parşömen kart, seçili vurgusu, ödül rozetleri); ölü `.quest-list-item` kaldırılır. | 2s | Manuel: J günlüğü kartlı/rozetli görünüyor; seçim vurgusu çalışıyor. |
| P2-32 | `src/ui/UIManager.js:485-500` | Kilitli görevler tam başlıkla listeleniyor: "Gazi Cebelü Ali'yi Hayatta Tut" finali dakika 1'de spoiler. | 'locked' görevleri listede "??? (Mühürlü Ferman)" olarak göster; detay paneli kilitliyken açılmaz. | 1s | Manuel: başlangıçta yalnız aktif+tamamlanmış görev adları okunuyor. |
| P2-33 | `src/ui/UIManager.js:689` + `index.html:242,252` | Harita modal başlığı sefer adıyla eziliyor; asıl hedef `#campaign-sidebar-title` hiç güncellenmiyor. | Yazım hedefini `campaign-sidebar-title`'a çevir; H2 sabit kalır. | 15dk | Manuel: M haritasında başlık "SANCAK HARİTASI", kenar çubuğunda sefer adı. |
| P2-34 | `src/ui/UIManager.js:357` | `btnJoinCampaign` null-check'siz bağlanıyor: eleman kalkarsa constructor patlar, tüm UI ölür. | Diğer binding'lerdeki `if (this.dom...)` korumasını ekle. | 10dk | Kod incelemesi; elementi geçici silip smoke test. |
| P2-35 | `index.html:105` + `UIManager.js:1165` | Placeholder tarih "H. 805 / M. 1402" ilk karede yanlış; asayiş formatı HTML'de "80%", JS'de "%80". | HTML placeholder'ları 1396/H.798 ve "%80" ile değiştir. | 10dk | Manuel: ilk karede doğru tarih. |
| P2-36 | `src/style.css:373-393` + `.dialogue-choice-btn` | Çifte `.minimap-wrapper` tanımı ve hiç üretilmeyen sınıflar — ölü CSS. | İlk minimap bloğunu ve kullanılmayan seçicileri sil (P0-4/P2-31 CSS işleriyle aynı PR'da). | 30dk | Kod: `grep -c "minimap-wrapper" src/style.css` → 1 tanım. |
| P2-37 | `index.html:24-26` + `src/main.js:326-345` | Etkileşim prompt'unda E rozeti çift ("E [E] ..."); at için rozet E derken metin F diyor. | Sabit rozeti dinamik yap: prompt metnini tuşsuz üret, rozet içeriğini duruma göre (E/F) JS'ten yaz. | 45dk | Manuel: NPC'de "[E] Görüş", atta "[F] Atına Bin" tek rozetle. |
| P2-38 | `src/systems/DialogueSystem.js:111,550` ↔ `GameState.js:16-32` | Diyaloglar sabit "Gazi Murad Bey" diyor; sipahi adı prosedürel. | Metinlerde `{PLAYER}` yer tutucusu kullan; render sırasında `gameState.sipahi.name` ile değiştir (içerik göçünde §4 şemasının `interpolate` kuralı). | 1s | Manuel: farklı "Yeni Tımar" isimlerinde diyalog doğru hitap ediyor. |
| P2-39 | `src/entities/NPCManager.js:100-109` + `DialogueSystem.js:654-661` | Çırak Salih, Ali'nin diyaloğunu konuşuyor (cirak_talk→cebelu_talk alias); 7 alias ölü duruyor. | Salih'e kısa özgün `cirak_talk` diyaloğu (usta-çırak mizahı — içerik ekibinden); ölü alias'lar içerik soketleri olarak KALIR (bkz. §2 kararı) ama README'ye not düşülür. | 1s (iskele) | Manuel: Salih kendi repliğini konuşuyor. |
| P2-40 | `index.html:7-9` | Google Fonts CDN bağımlılığı: çevrimdışı Electron'da tema çöküyor. | Cinzel/Amiri/Outfit woff2 dosyalarını `public/fonts/`e indir, `@font-face` ile yerelden yükle; lisansları ASSETS.md'ye işle (üçü de OFL). | 1-2s | Manuel: ağ kapalıyken `npm run desktop` — fontlar doğru. |
| P2-41 | `src/core/InputManager.js:72-77` | mousemove `=` ile üzerine yazılıyor: yüksek polling-rate farede kamera/nişan tutarsız (bkz. §5.4). | `+=` ile biriktir (getMouseDelta zaten okuma sonrası sıfırlıyor). | 15dk | Manuel: 1000Hz fare ile yavaş süpürmede kamera atlamıyor. |
| P2-42 | `src/core/ParticleSystem.js:251,310` | Parçacık doğumu frame-bazlı: 144Hz'te 2.4 kat yoğun (bkz. §5.3). | Doğum olasılığını `p * delta * 60` ile ölçekle. | 30dk | §5.3 ölçümü. |
| P2-43 | `src/core/Engine.js:319-321` + `:142-144` | Her kare `composer.passes.find` ile bloom aranıyor; fillLight gece hiç kısılmıyor. | Bloom referansını constructor'da sakla; `updateDayNight`'ta fillLight.intensity'yi gece çarpanıyla güncelle (0.30→gece 0.06). | 45dk | Manuel: gece sahne belirgin daha karanlık; profiler'da find çağrısı yok. |
| P2-44 | `tests/systems.test.js:249-258` | Save testleri async fonksiyonları await'siz çağırıyor: yalnız Node'da IndexedDB olmadığı için tesadüfen geçiyor. | Test bloğunu `await` kullanan async IIFE'ye çevir (runner zaten sıralı); §7.4. | 45dk | `npm test` 97/97; kod incelemesinde await mevcut. |
| P2-45 | `README.md:102,119` ↔ `:238` + `:45,53-68` | README kendiyle çelişiyor: 72/72 vs 97/97; "sahte ricat (Turan taktiği)" TARIHSEL §3.2'nin kaldır dediği basitleştirme; 12 bölümlük tablo 16 bölümlük perde yapısıyla uyumsuz. | README'yi tek gerçeğe çek: 97/97, kampanya yapısı TARIHSEL §5'e referans, "sahte ricat" ifadesi "katmanlı savunma düzeni" anlatımıyla değiştirilir. | 1s | Kod: `grep -c "72/72" README.md` → 0. |
| P2-46 | `docs/DEVELOPMENT_SPEC.md` (tüm linkler) + `docs/TARIHSEL...md` §3.1 | Spec dosyası `c:/antigravity/yeni3d/` ölü yollarını gösteriyor ve tamamı uygulanmış özellikleri "yapılacak" anlatıyor; TARIHSEL §3.1 bug listesinin ≥3 maddesi kodda çoktan düzeltilmiş. | DEVELOPMENT_SPEC başına "UYGULANDI — tarihsel referans" bandı + yolları göreli yap; TARIHSEL §3.1'e "güncel durum" dipnotu ekle (düzeltilenler işaretlenir). Tek güncel-durum kaynağı bu doküman (05) ilan edilir. | 1s | Yeni geliştirici linklere tıklayınca kırık yol yok. |
| P2-47 | mikro-metin paketi: `PetitionSystem.js:123` ("İrfan eden ameleler" → "İşi biten ırgatlar boşta kaldı"), `SupplySystem.js:66` ("tamalandı"→"tamamlandı"), `CombatSystem.js:338-340` (çift yorum) | Anlamsız/yanlış metin ve kopya yorum. | Üç mikro düzeltme tek PR'da. | 30dk | Kod incelemesi; ilgili bildirimler doğru metinle görünüyor. |
| P2-48 | `src/ui/UIManager.js:1204-1239` + `index.html:198-327` inline stiller | Fail-state overlay'i ve 3 modal inline-style ile stilleniyor: temadan kopuk ikinci stil kaynağı. | Inline stilleri `style.css`'e sınıf olarak taşı (görsel değişiklik hedeflenmez, birebir aynı görünüm). | 2s | Görsel regresyon: önce/sonra ekran görüntüsü eş. |
| P2-49 | Erişilebilirlik borcu: `style.css:23` (`user-select:none` global), aria/role yok, focus trap yok, `prefers-reduced-motion` yok | Klavye/erişilebilirlik sıfır (TARIHSEL §9.9 hedefiyle çelişki). | Aşamalı: modallara `role="dialog"`+`aria-label`, Escape kapatma (P2-25 ile), `prefers-reduced-motion`'da animasyonları kapat; tam paket Aşama 5 işi. | 3-4s (ilk paket) | Klavye ile modal açılıp kapanabiliyor; reduced-motion'da slide-in yok. |
| P2-50 | Depo hijyeni: `dist/` çıktısı depoda; **DÜZELTME: depo hâlihazırda git deposudur ve GitHub'a bağlıdır — önceki "git init yapılacak" varsayımı geçersizdir (Faz 0'da doğrula)** | Build çıktısı kaynakla senkron kayması riski; ayrıca lisanssız/riskli varlıklar (stanlee3d.*, Flying.fbx, kopya OBJ'ler) commit GEÇMİŞİNDE fiilen duruyor — çalışma kopyası temizliği tek başına yayın riskini kapatmıyor. | Mevcut depo doğrulanır ve baseline etiketlenir: `.gitignore` (dist/, node_modules/) tamamlanır, dist/ takipten çıkarılır, mevcut durum `git tag baseline-97-97` ile işaretlenir. Bu madde **her işten önce** yapılmalıdır (P0'dan da önce). Dağıtım/push-yayın öncesi zorunlu git-geçmişi temizliği §3.1 adım 5'te tanımlıdır. | 30dk | `git tag` baseline etiketini gösteriyor; `git status` temiz; `git ls-files dist/` → 0. |

**P2 toplamı: ≈ 10-13 iş günü** (içerik fazlarına paralel dağıtılır; P2-50 hemen, P2-01..05 ekonomi/ödül hissi için erken önerilir).

---

## 2. ÖLÜ KOD KARARLARI

Karar sözlüğü: **SİL** = bu fazda kaldır; **TUT-BAĞLA** = planlanan işlevin sahibi, silinmez, backlog'daki işle bağlanır; **TUT-SOKET** = boş ama içerik ekibinin dolduracağı yuva.

| Öğe | Konum / Boyut | Karar | Gerekçe | Süre | Doğrulama |
|---|---|---|---|---|---|
| `SoloGameState.js` | `src/core/SoloGameState.js` (257 satır) | **SİL** | Hiçbir yerden import edilmiyor (grep doğrulandı) ve içerik başka bir oyuna ait ("Solo Leveling": E-A avcı rankları, mana, gölge ordusu). Bundle'ı şişiriyor, yeni geliştiriciyi yanıltıyor. | 15dk | `grep -rn "SoloGameState" src/ tests/` → 0; `npm test` + build yeşil. |
| `AssetLoader.js` | `src/core/AssetLoader.js` (70 satır) | **SİL** | Import eden yok; oyun tüm modelleri prosedürel üretiyor; GLTFLoader importu gereksiz bundle yükü. NPCManager'ın kendi OBJ yükleme yolu ayrıdır ve etkilenmez. | 15dk | grep 0; build yeşil. |
| FBX dalı + `Flying.fbx` | `src/entities/NPCManager.js:394-454` (fbx dalları), `public/models/Flying.fbx` (10.6MB) | **SİL** | Hiçbir NPC config'i `fbxPath` vermiyor; FBXLoader importu + 10.6MB dosya (muhtemel Mixamo — lisans belgesiz, bkz. §3) ölü ağırlık. | 30dk | grep `fbxPath`/`FBXLoader` → 0; models klasörü 10.6MB küçüldü. |
| `createModernKethudaStanLee` | `src/entities/ModelBuilder.js:397-717` (~320 satır) | **SİL** | Çağıran yok; üstelik modern kıyafetli Stan Lee tasviri — §3'teki kişilik hakkı temizliğinin parçası. | 30dk | grep 0; build yeşil. |
| `stanlee3d.obj` + `stanlee_extracted/` | `public/models/` (~29MB + kopya) | **SİL + İKAME** | §3.1'deki hukuki plan: aktif kullanılan model prosedürel NPC ile değiştirilip dosyalar silinir. | §3.1'de | §3.1. |
| OBJ kopyaları + `_extracted` klasörleri | `public/models/` (~100MB fazlalık; demirci.obj=dancer kopyası, saka.obj=clothing kopyası — md5 doğrulanmış) | **SİL (kopyaları)** | Aynı dosyanın 2-3 kopyası tutuluyor. Lisans denetimi (§3.2) sonucuna göre kalan tekil dosyalar ya GLB'ye dönüştürülür ya prosedürelle ikame edilir. | 30dk | models/ klasörü ≤ 30MB; oyun açılışında iki NPC hâlâ doğru görünüyor. |
| `TrainingSystem.js` | `src/systems/TrainingSystem.js` (tamamı çağrısız) | **TUT-BAĞLA** | TARIHSEL Bölüm 4 ("Cebelü Ali'nin gerçek talimi") ve Aşama 2'nin sahibi bu sistem: drill/madalya iskeleti hazır, gerçek girdilere (Player.setBlocking, comboStep, isRiding) bağlanacak. Silmek Aşama 2'yi sıfırdan yazdırır. `CampaignBattleSystem.js:3`'teki kullanılmayan importu temizle. | (Aşama 2) | Aşama 2 planında; şimdilik testlerdeki kapsam korunur. |
| `SupplySystem.js` | `src/systems/SupplySystem.js` (~%90 çağrısız) | **TUT-BAĞLA** | TARIHSEL Bölüm 8-10 (sefer hazırlığı, yoklama A/B/C teftişi) doğrudan bu sistemi bekliyor; yazım kalitesi yüksek. Aşama 2'de UI'a bağlanır (ok stoğu → ArcherySystem, durability → CombatSystem). | (Aşama 2) | Aşama 2 planında. |
| `CampaignBattleSystem.js` | `src/systems/CampaignBattleSystem.js` | **TUT-BAĞLA (P1-06)** | Kanonik Niğbolu motoru ilan edildi; P1-06 bağlıyor. | P1-06'da | P1-06. |
| `simulateKaramanCampaign` / `simulateAnkaraCampaign` | `src/systems/HistoryEventSystem.js:83-120` | **TUT (dondurulmuş)** | TARIHSEL §14 bu içerikleri açıkça "ayrı genişleme" olarak erteliyor; yazılmış içerik silinmez, dosya başına `// POST-1396 EXPANSION — not reachable by design` yorumu eklenir. | 10dk | Yorum mevcut; erişilemezlik bilinçli ve belgeli. |
| `GeminiService.js` | `src/services/GeminiService.js` | **TUT-BAĞLA (P1-05)** | Kadı mekaniğinin motoru; çevrimdışı heuristic varsayılan olacak şekilde bağlanıyor. | P1-05'te | P1-05. |
| `SaveManager.js` | `src/core/SaveManager.js` | **TUT-BAĞLA (P1-01/§6)** | Kayıt altyapısı hazır; bağlama planı §6. | §6'da | §6.5. |
| `water_dispute_talk` | `DialogueSystem.js:357` | **TUT-BAĞLA (P0-1)** | Oyunun tek hukuki-ikilem görevi; P0-1 bağlıyor. | P0-1'de | P0-1. |
| Diyalog alias'ları (bakkal_talk, kadi_talk, seyis_talk, muhafiz_talk, hanci_idris, koca_dede, attar_mehmet) | `DialogueSystem.js:654-661` | **TUT-SOKET** | Sıfır maliyetli içerik yuvaları: her alias ileride özgün diyalogla değiştirilecek (içerik dokümanının işi). Silmek içerik ekibinin soketlerini yok eder. | 0 | §4 içerik göçünde adres defteri olarak listelenir. |
| `createTree`, `createWildflowerCluster`, `createOttomanCastle`/`createCastleQuarter`, `materials.steppeGrass`, `createGrassNormalMap`, `createSteppeGrassBladeTexture` | `ModelBuilder.js:1109,1244,1195-1232,16-23`, `TextureGenerator.js:112-138` | **SİL** | Çağıran yok; Grafik B/C aşamasında bitki/kale işi zaten yeni sanat kitiyle yapılacak (TARIHSEL §10.5-10.6) — bu iskeletler o işe temel olmayacak kadar basit. | 45dk | grep 0; build yeşil; sahne görsel olarak değişmedi. |
| `ParticleSystem` ölü attribute'ları (`opacities`, per-particle `size`) | `ParticleSystem.js:49-71` | **SİL** | PointsMaterial per-particle size desteklemiyor; işlevsiz hazırlık. ShaderMaterial'a geçiş ancak Grafik C'de gerekirse yeniden değerlendirilir. | 30dk | Parçacık görünümü değişmedi (önce/sonra ekran görüntüsü). |
| Ölü importlar | `main.js:1,11` (THREE, DialogueSystem), `VillagerAI.js:3` + `NPCManager.js:9` (gameState), `tests/systems.test.js:48` (ModelBuilder), `CampaignBattleSystem.js:3` (trainingSystem) | **SİL** | Beş dosyada kullanılmayan import. | 20dk | Build + test yeşil. |
| `markerElementsPool` | `UIManager.js:142` | **TUT-KULLAN** | §5.2'deki DOM havuzlama düzeltmesinin taşıyıcısı olacak; silinmez, işlevlendirilir. | §5.2'de | §5.2. |
| `generateTown()` return sözleşmesi + `interactables` | `TownGenerator.js:20,86-93` | **TUT-SOKET** | `interactables` mezar taşı okuma / çeşme etkileşimi gibi planlanan içerik kancası (analiz hooks); dönüş nesnesi ilk gerçek tüketiciyle birlikte ya kullanılır ya sadeleştirilir. | 0 | — |
| `lastBathDay`, `quest.chapter` alanları | `GameState`, `QuestSystem` | **TUT** | `lastBathDay` DEVELOPMENT_SPEC Özellik 1.6 hamam hatırlatmasının verisi (bağlaması küçük iş, içerik fazında); `chapter` görev defteri gruplaması için UI'da kullanılacak (P2-31 ile). | — | — |

---

## 3. HUKUKİ / MARKA TEMİZLİĞİ

Bu bölümdeki dört madde **Steam'e veya herhangi bir dağıtım kanalına çıkmadan önce zorunludur**; ilk üçü içerik fazlarından bağımsız olarak hemen yapılabilir.

### 3.1 Stan Lee modelinin değiştirilmesi (KRİTİK — kişilik hakkı/marka riski)

**Durum:** `public/models/stanlee3d.obj` (29MB, Tripo AI üretimi — MTL'de `tripo_material_*`) Kethüda Koca Yakub olarak **sahnede aktif** kullanılıyor (`NPCManager.js:43-46`). Gerçek ve tanınabilir bir kişinin (Stan Lee) benzerliği ticari üründe post-mortem publicity rights + POW!/Marvel marka riski taşır. Ayrıca `ModelBuilder.js:397-717`'de kullanılmayan ikinci bir modern-Stan-Lee modeli var.

**İkame planı (prosedürel NPC — altyapı hazır):**
1. `NPCManager.js:43-46`'daki Koca Yakub config'inden `modelPath`/`mtlPath` alanlarını kaldır → NPC otomatik olarak `createDetailedHumanNPC` prosedürel yoluna düşer (mevcut davranış: model yüklenmezse placeholder kalıyor; burada placeholder kalıcı model olur).
2. Config'e yaşlı-bilge görünüm ver: `hairColor: 0xdedede` (beyaz — Koca Dede'de zaten kullanılan değer), sakallı varyant, `headwear: 'bork'` yerine sarık/kavuk (P2-23 başlık düzeltmesiyle uyumlu), koyu cübbe ton paleti.
3. `createModernKethudaStanLee`'yi sil (§2), `stanlee3d.obj` + `.mtl` + `stanlee_extracted/` klasörünü sil.
4. `git grep -i "stanlee\|stan lee"` → kod, yorum, dosya adı dahil 0 sonuç.
5. **Git geçmişi temizliği (dağıtım/push-yayın öncesi ZORUNLU):** Depo hâlihazırda git deposu olduğundan ve `stanlee3d.obj`, `stanlee_extracted/`, `Flying.fbx` ile kopya OBJ'ler commit geçmişinde fiilen bulunduğundan ("stanlee3d.zip modeli ... giydirildi", "Flying.fbx ... entegre edildi" commit'leri mevcut), adım 3'teki silme yalnız çalışma kopyasını temizler — kişilik hakkı/lisans riski geçmişte aynen sürer. Depo herhangi bir kanala push/yayın edilmeden önce `git filter-repo` (veya BFG) ile bu dosyalar geçmişten çıkarılır VEYA temiz yeni depo ile yeniden başlanır. Kabul: `git log --all -S "stanlee"` → 0 sonuç; `.git` pack boyutunun silinen büyük varlıklar oranında küçüldüğü doğrulanır.

**Süre:** 2-3s (adım 1-4) + 1-2s (adım 5, yayın kapısında). **Doğrulama:** Manuel — Koca Yakub köy meydanında beyaz sakallı prosedürel model olarak görünüyor, diyalog/AI davranışı değişmedi; repo'da "stanlee" araması 0 sonuç; `public/models` boyutu ≥ 29MB küçüldü; dağıtım öncesi ayrıca adım 5'in geçmiş-temizliği kabulü sağlanır.

### 3.2 Üçüncü parti OBJ'lerin lisans denetimi

**Durum:** `demirci.obj` (24MB) = `traditional+dancer+3d+model.obj`'nin bayt-bayt kopyası; `saka.obj` (23MB) = `traditional+clothing+3d+model.obj` kopyası (md5 doğrulanmış). `traditional+...` dosya adı kalıbı bir model sitesinden indirme işaretidir; Tripo materyalleri var ama kaynak/lisans belgesiz.

**Görev tarifi (araştırma + karar):**
1. Modellerin indirildiği kaynağı tespit et (satın alma e-postası, Tripo hesabı üretim geçmişi, indirme sitesi). Tripo hesabından üretildiyse Tripo3D kullanım koşullarının **ticari kullanım** iznini üyelik tipine göre doğrula ve ekran görüntüsüyle belgele.
2. Sonucu `docs/ASSETS.md`'ye işle (aşağıdaki format). Belgelenemeyen model **yayında kullanılamaz** → §3.1'deki prosedürel ikame kalıbı aynen uygulanır (Demirci Rüstem ve Saka İbrahim için `createDetailedHumanNPC` config'i).
3. Kopya dosyaları sil (§2), kalan tekil dosyayı tercihen Draco'lu GLB'ye dönüştür (yükleme süresi; ayrı P2 işi).

`docs/ASSETS.md` formatı (TARIHSEL §15 "lisanslar varlıkla birlikte tutulmalı" kuralının uygulaması):
```
| Dosya | Kaynak | Lisans | Kanıt | Ticari kullanım | Karar |
|---|---|---|---|---|---|
| demirci.obj | Tripo3D (hesap: ...) | Tripo ToS §... | ekran görüntüsü linki | Evet/Hayır | TUT/İKAME |
```

**Not (güncel envanter):** Analiz sonrası commit'lerle depoya yeni modeller eklenmiştir (ör. commit 65feebc — Attar 3D modeli). Denetim, ASSETS.md doldurulurken `public/models/` klasörünün o günkü GÜNCEL içeriği üzerinden yapılır; bu analizde listelenmeyen her yeni dosya da tabloya satır olarak girer ve belgelenemeyen model için §3.1 ikame kalıbı aynen uygulanır.

**Süre:** 2-4s (araştırma) + ikame gerekirse 2s/model. **Doğrulama:** ASSETS.md'de her `public/` varlığının satırı var; "Karar" sütunu boş satır yok.

### 3.3 "Mount & Blade ve Kingdom Come İlhamlı" ibaresinin kaldırılması

**Durum:** `index.html:359` başlangıç ekranı alt yazısı: `Steam Sürümü v1.0 • Mount & Blade ve Kingdom Come İlhamlı 3D Tımar Simülasyonu`. Üçüncü parti marka adlarının ürün tanıtımında kullanımı marka riski + yanlış beklenti (analiz: engagement bulgusu).

**Düzeltme:** Satırı şu nötr metinle değiştir: `1396 Niğbolu Dönemi Osmanlı Tımar Simülasyonu`. "Steam Sürümü v1.0" ifadesi de Steam'de yayın YOKKEN kaldırılır (yanıltıcı); sadece sürüm numarası kalabilir.

**Süre:** 10dk. **Doğrulama:** `grep -i "mount\|kingdom" index.html README.md` → 0 (README'de esin anlatısı varsa "esinlenilen türler" gibi markasız anlatıma çevrilir).

### 3.4 steamworks.js kararı ve Electron dağıtım hattı

**Durum:** `electron-preload.cjs:9` package.json'da hiç olmayan `steamworks.js`'i require ediyor (her zaman throw→catch, `window.steamworks` daima null); AppID 480 (Spacewar test kimliği) hard-coded; `build:steam` scripti `vite build` ile birebir aynı — paketleme yapmıyor; electron-builder kurulu değil.

**Karar önerisi: ŞİMDİ EKLEME (ertele), iskeleyi dürüstleştir.** Gerekçe: SteamManager simülasyon modu geliştirme için yeterli; Steam yayını kararlaştırılmadan native modül + AppID + partner hesabı maliyeti erken. Yapılacaklar iki aşamalı:

**Şimdi (30dk):**
1. `electron-preload.cjs`'e yorum bandı: `// steamworks.js is intentionally NOT a dependency yet — see docs/fable_yol-haritasi/05-teknik-plan.md §3.4` (sessiz ölü özellik → belgeli bilinçli karar).
2. `package.json`'dan `build:steam` scriptini kaldır VEYA `"build:steam": "echo 'Steam pipeline not configured — see docs 05 §3.4' && exit 1"` yap (boş vaat bırakma).
3. README'deki Steam başarım/cloud vaatleri "planlanan" diye işaretlenir.

**Steam kararı verilirse (1-2g, ayrı faz):**
1. Steamworks partner hesabı + gerçek AppID al; `steam_appid.txt` + config dosyasına taşı (hard-code yasak).
2. `npm i steamworks.js` (dependencies) + `npm i -D electron-builder`.
3. `package.json`'a electron-builder config (appId, `win: nsis`, `files: [dist, electron-*.cjs]`, `asarUnpack` steamworks native modülü için) + `"build:steam": "vite build && electron-builder"`.
4. `SteamManager.js:appId` ve preload 480 değerlerini config'ten okut; başarım ID'lerini partner panelinde birebir tanımla (P2-28 eşlemesi).
5. Doğrulama: paketlenmiş .exe Steam açıkken başarım banner'ını gerçek overlay ile gösteriyor; Steam kapalıyken oyun sorunsuz simülasyon moduna düşüyor.

---

## 4. İÇERİK BORU HATTI REFAKTÖRÜ (koddan veriye)

**Amaç:** Mizah, tarih, kodeks ve diyalog içeriğinin kod dosyalarına gömülü string'ler yerine `src/data/*.js` veri modüllerinde yaşaması. Bu, (a) içerik tasarımcılarının (02-anlatı, 03-mizah, 04-tarih/İslami içerik dokümanlarının sahipleri) kod dosyalarına dokunmadan içerik ekleyebilmesini, (b) A/B/C/R etiketi ve içerik denetimini (Ehl-i Sünnet kontrol listesi) tek yerde yapılabilmesini, (c) testlerin metin yerine yapı üzerinde koşmasını sağlar. TARIHSEL §12 ("veri güdümlü durum makinesi") ve §15 ("diyalog sistemi ekonomi/görev durumunu gelişigüzel değiştirmemeli") ile hizalıdır.

### 4.1 Hedef dizin yapısı (kanonik registry — dört tasarım dokümanıyla mutabık)

Aşağıdaki liste **kanoniktir**; diğer tasarım dokümanlarının (01-akış, 02-mizah, 03-tarih, 04-İslami içerik) kendi bölümlerinde tanımladığı somut dosya adları burada aynen benimsenmiştir — geliştirici o dokümanlardaki şemalara bu adlarla yazar, bu doküman yalnız okuma katmanını ve ortak kuralları sabitler.

```
src/data/
  dialogues/
    index.js           // tüm diyalogları tek registry'de toplar + alias tablosu (sahibi: bu doküman §4.2)
    kethuda.js         // NPC başına bir dosya (kethuda_talk)
    imam.js            // ...
    ...
  quests.js            // QuestSystem.js:16-401'deki 13 görev dizisi buraya taşınır (bu doküman)
  CodexData.js         // Menâkıbnâme kodeks maddeleri — şema sahibi: 03-tarih dokümanı §2.2 (bkz. §4.3)
  HistoricalNews.js    // gün-bazlı havadis takvimi (minDay+afterQuest çift anahtarlı) — sahibi: 03-tarih §3.2
  humor.js             // mizah havuzları + seçici fonksiyonlar (pickBanditLastWords, isHumorMuted) — sahibi: 02-mizah §5 (bkz. §4.4)
  islamicContent.js    // dua/hutbe/kodeks/hikmet metinleri, source+confidence zorunlu — sahibi: 04-İslami içerik §1.1
  petitions.js         // PetitionSystem.js:16-53 arzuhal havuzu buraya (bu doküman; 04 doc 3 hayır arzuhali buraya ekler)
  balance.js           // magic number'lar: hızlar, hasarlar, fiyatlar, daySpeed (§8)
```

**A/B/C/R alan adı eşlemesi (şema testleri için):** aynı etiket kavramı modül bazında şu alan adlarını taşır — `dialogues/*`: `historicalConfidence`; `CodexData.js`: `tag`; `islamicContent.js`: `confidence`; `HistoricalNews.js`: `tag`; `humor.js`: `historicalConfidence` (varsayılan 'C'). Şema testi (§7.3) her modülü kendi alan adıyla doğrular; yeni modül eklerken bu tabloya satır eklenir.

### 4.2 Diyalog ağacı formatı (şema)

Mevcut `getDialogueData`'nın ürettiği nesneyle bilinçli olarak uyumludur; iki fark: (1) `action: () => {...}` callback'leri yerine **bildirimsel `effects` dizisi**, (2) koşullu seçenek için `condition`. İçerik tasarımcılarının dokümanlarındaki diyaloglar bu formatta teslim edilir.

```js
// src/data/dialogues/degirmenci.js
export default {
  id: 'water_dispute_talk',
  npcName: 'Değirmenci Musa',
  npcRole: 'Değirmenci',
  historicalConfidence: 'C',          // A/B/C/R — kodekse ve denetime akar
  root: 'start',
  nodes: {
    start: {
      text: 'Beyim, ark kırılalı beri iki hane birbirine girdi...', // {PLAYER} yer tutucusu desteklenir
      effects: [ { type: 'advanceObjective', quest: 'quest_water_dispute', idx: 0 } ], // onOpen karşılığı
      choices: [
        {
          text: 'Sınır taşını gösterin, hükmü ona göre verelim.',
          condition: { questStatus: { id: 'quest_water_dispute', is: 'active' } },
          effects: [
            { type: 'advanceObjective', quest: 'quest_water_dispute', idx: 1 },
            { type: 'modify', stat: 'reayaTrust', amount: 15 },
            { type: 'notify', text: '⚖️ İki haneyi sınır taşına göre uzlaştırdın.', kind: 'success' },
            { type: 'unlockCodex', id: 'codex_su_hukuku' }
          ],
          next: 'resolved'            // yoksa 'closes: true'
        },
        { text: 'Sonra bakarız.', closes: true }
      ]
    },
    resolved: { text: 'Allah senden razı olsun beyim.', choices: [ { text: 'Hayra vesile ola.', closes: true } ] }
  }
};
```

**Effects sözlüğü (v1 — EffectRunner'ın tanıdığı tipler):** `advanceObjective{quest,idx}`, `modify{stat: reayaTrust|sancakReputation|squadLoyalty|asayis, amount}`, `modifyFaction{faction, amount}`, `akce{amount}` (negatif = harcama; yetersizse effect zinciri iptal + bildirim), `heal{full:true|amount}`, `setFlag{path,value}` (ör. `sipahi.weaponType`), `notify{text,kind}`, `sound{name}`, `unlockCodex{id}`, `achievement{id}`.
**Condition sözlüğü:** `questStatus{id,is}`, `flag{path,equals}`, `akceMin{amount}`, `aliLegSevered{is}`, `timeRange{from,to}` (saat).

### 4.3 Kodeks madde formatı (şema sahibi: 03-tarih dokümanı — burada teknik ekler tanımlanır)

Kodeksin oyun içi adı, 40 maddelik içerik listesi ve temel şema **03-tarih dokümanı §2.2'de** tanımlıdır (`src/data/CodexData.js`, `CODEX_ENTRIES`): `{ id, category: 'dirlik'|'asker'|'cemiyet'|'vakayi', title, tag: 'A'|'B'|'C'|'R', unlock: {type}, gameText, historyText, related[] }`. Bu doküman o şemayı DEĞİŞTİRMEZ; yalnız iki **opsiyonel teknik alan** ekler (additive — 03'ün testleri `CODEX_ENTRIES.length === 40`, `tag ∈ {A,B,C,R}` vb. aynen geçer):

```js
// src/data/CodexData.js — 03-tarih §2.2 şeması + teknik ekler
{
  id: 'osur',
  category: 'dirlik', title: 'Öşür', tag: 'A',
  unlock: { type: 'quest', id: 'quest_inspect' },
  gameText: '…', historyText: '…', related: ['timar'],
  // — teknik ekler (opsiyonel):
  sources: ['TDV İslâm Ansiklopedisi — Tımar'],       // A/B/R maddelerinde doldurulması beklenir
  reviewed: false                                     // içerik denetim onay bayrağı — TEK bayrak (§8 süreci)
}
```

`reviewed` alanı maddenin gerekli içerik denetimlerinden geçtiğini işaretler — tarih doğruluğu kontrolü ve, madde İslami içerik taşıyorsa, ayrıca Ehl-i Sünnet kontrolü (04-İslami içerik dokümanı §5 protokolü). Bilinçli sadeleştirme: iki ayrı onay bayrağı (`review: {history, islamic}`) yerine tek `reviewed: true` kullanılır — solo geliştirici iki ayrı onay akışı yönetmez; hangi denetimlerden geçtiği zaten `docs/ISLAMIC_CONTENT_AUDIT.md` ve kaynak yorum satırlarında kayıtlıdır. `reviewed: true` olmayan madde **build'e girer ama oyunda "taslak" rozetiyle gizlenir** (CodexSystem'de basit filtre) — denetimsiz içerik oyuncuya sızmaz. `unlock` tetiklerinin çalıştırılması ve `unlockCodex` effect'i (§4.2) `src/systems/CodexSystem.js`'e (03-tarih §2.2'nin öngördüğü singleton) bağlanır.

### 4.4 Bark (tek satırlık replik) havuzu formatı — somut dosya: `src/data/humor.js` (sahibi: 02-mizah dokümanı)

Mizah/bark metinlerinin envanteri, kategorileri ve ton kuralları **02-mizah dokümanında** tanımlıdır (152 replik `src/data/humor.js`'e yerleşir; `pickBanditLastWords` gibi seçiciler ve `isHumorMuted()` dram kapısı da orada yaşar). Bu doküman havuz girdilerinin **yapısal şemasını** sabitler ki şema testleri (§7.3) tüm havuzlarda koşabilsin:

```js
// src/data/humor.js — havuz girdisi yapısı
export const BARKS = [
  {
    id: 'bark_hamam_sohbet_1',
    context: 'hamam_idle',       // tetik bağlamı: meydan_aksam | hamam_idle | uyandirma | demirci_ors | vergi_gunu | bandit_lastwords | ...
    speakerRole: 'hamam_musteri',// NPC rolü veya belirli id
    lines: ['Ohhh be! Sıcak göbek taşı bel ağrımı aldı.'],
    humor: true,                 // mizah envanteri sayımı ve denetimi için (isHumorMuted kapısına tabi)
    historicalConfidence: 'C',
    cooldownSec: 120,            // aynı bark'ın tekrar aralığı
    weight: 1
  }
];
```

Kural (sabit karar gereği): `speakerRole` din adamı olan (`imam`, `kadi`) bark'larda `humor: true` **kullanılamaz** — bu kuralı basit bir test zorlar (§7.3 şablonu; testler `BARKS.filter(b => ['imam','kadi'].includes(b.speakerRole) && b.humor)` boş olmalı assert eder; 02-mizah dokümanının grep-denetimi — `imam|molla|ezan|namaz|dua|ayet|mescid` mizah havuzunda geçmez — buna ektir). Mizahın yaşadığı bağlamlar: esnaf, köylü, hamam, çarşı, asker muhabbeti. `humor: true` girdileri 02-mizah §6'daki `isHumorMuted()` kapısından geçerek gösterilir (Ali dram penceresi ve game-over'da mizah tamamen susar).

### 4.5 DialogueSystem'in asgari değişikliği (geçiş planı)

Büyük yeniden yazım YOK; üç küçük adım:

1. **Registry + fallback (2-3s):** `DialogueSystem.getDialogueData(id)` önce `src/data/dialogues/index.js` registry'sine bakar; kayıt yoksa mevcut statik nesneden (bugünkü ~650 satır) okumaya devam eder. Alias tablosu (`:654-661`) registry'ye taşınır. Böylece göç **diyalog başına** yapılabilir — tek büyük riskli PR yerine küçük PR'lar.
2. **EffectRunner (3-4s):** `src/systems/EffectRunner.js` (~80 satır): `runEffects(effects)` yukarıdaki sözlüğü `gameState`/`questSystem`/`soundManager` çağrılarına çevirir; `checkCondition(cond)` seçenek filtrelemede kullanılır. `UIManager.renderDialogueChoices` (`UIManager.js:415-436`) `choice.action()` yerine `choice.effects` varsa `EffectRunner.runEffects` çağırır (action varsa eskisi gibi çalışır — geriye uyum). Bu, TARIHSEL §15'in "sonuçlar ortak komut katmanından geçmeli" ilkesinin karşılığıdır.
3. **Kademeli göç:** Sıra: (1) yeni içerik DOĞRUDAN yeni formatta yazılır (P0-1 değirmenci, P1-11 saka/guard ilk örneklerdir); (2) test kapsamındaki mevcut 7 diyalog, §7.2'deki assert sağlamlaştırmasıyla EŞZAMANLI taşınır; (3) kalanlar içerik fazlarında fırsatçı taşınır. `{PLAYER}` interpolasyonu render katmanında yapılır (P2-38'i kökten çözer).

**Doğrulama:** her göç PR'ında `npm test` yeşil; taşınan diyalog için yapısal test (düğüm sayısı, effect tipleri) eklenmiş; oyunda diyalog davranışı birebir aynı (manuel A/B).

**Toplam altyapı süresi (registry + EffectRunner + quests/petitions/balance taşıma):** ≈ 2-3 gün. Kodeks/bark **tüketicileri** (kodeks UI sekmesi, bark tetikleyici sistemi) içerik dokümanlarının belirlediği fazlarda yapılır; bu doküman yalnız veri formatını ve okuma katmanını sabitler ki dört tasarımcı aynı şemaya yazsın.

---

## 5. PERFORMANS

### 5.0 Ölçüm altyapısı (önce bu — 2s)

Her performans işi **önce/sonra ölçüm** ister; ölçümsüz optimizasyon PR'ı kabul edilmez.

- **Dev overlay:** `?perf=1` query paramı ile açılan mini HUD: anlık frame time (ms), 5 sn hareketli ortalama FPS, son 60 sn'deki **hitch sayısı** (frame > 50ms), `renderer.info.render.calls` (draw call) ve `triangles`. Uygulama: main loop'ta `performance.now()` farkı + 1 sn'de bir DOM'a yazan ~40 satırlık yardımcı (`src/core/PerfOverlay.js`).
- **Kayıt protokolü:** ölçüm senaryosu sabit — köy meydanında 60 sn bekle + 60 sn at ile tur (aynı rota). PR açıklamasına önce/sonra tablo: ort. frame time, %1 low FPS, hitch sayısı.
- **Derin analiz:** Chrome DevTools Performance kaydı (30 sn) — uzun görevlerin kaynağı (script/layout/GC) fonksiyon adıyla raporlanır.

| İş | Konum | Sorun | Çözüm tarifi | Süre | Ölçüm/Kabul |
|---|---|---|---|---|---|
| 5.1 PMREM hitch | `src/core/Engine.js:370-373, 230-292` | Gökyüzü canvas + `pmremGenerator.fromEquirectangular` her 0.15 oyun saatinde (≈50 gerçek sn'de) senkron çalışıyor → periyodik frame takılması. daySpeed hızlanınca (P1-02) sıklaşır, sorun büyür. | İki katman: (a) **Ön üretim:** yükleme sırasında günün 8 anahtar saati (gece, şafak, sabah, öğle, ikindi, günbatımı, alacakaranlık, gece yarısı) için environment map'leri bir kez üret ve sakla; `updateDayNight` yalnız en yakın hazır map'i `scene.environment`'a atar (swap ucuz). (b) Gökyüzü **arka plan** gradyanı (görsel) mevcut sıklıkta güncellenmeye devam edebilir — pahalı olan yalnız PMREM'di. Eski RT'ler dispose edilir (mevcut disiplin korunur). | 3-4s | Kabul: 10 dk oyunda hitch (>50ms) sayısı ≈ 0 (yalnız yükleme anında); görsel gün döngüsü A/B'de fark edilmez. Ölçüm: overlay hitch sayacı önce/sonra. |
| 5.2 Her kare DOM yeniden kurulumu | `src/ui/UIManager.js:1049-1129` (markers), `:1249-1260` (notifications), `:895-1047` (minimap), `:1135-1195` (HUD yazıları) | `innerHTML=''` + yeniden üretim her karede: GC baskısı, layout thrash; bildirim animasyon bug'ının (P0-3) kök nedeni de bu. | (a) Bildirim: P0-3 dirty-flag. (b) Marker: `markerElementsPool` (UIManager.js:142) gerçekten kullanılır — NPC başına bir div bir kez üretilir, her kare yalnız `style.transform` ve görünürlük güncellenir; metin yalnız değişince yazılır. (c) HUD metinleri: değer değişmediyse `textContent` atama (string karşılaştırma). (d) Minimap canvas çizimi kalır (canvas zaten uygun) ama 30Hz'e düşürülür (her 2 karede bir). | 4-6s | Kabul: DevTools Performance'ta `ui.update` toplam script süresi ortalama < 1.5ms; minor GC sıklığı gözle görülür azalmış. |
| 5.3 Parçacık FPS bağımlılığı | `src/core/ParticleSystem.js:251, 310` | Doğum olasılıkları frame başına sabit (`Math.random() < 0.18`): 144Hz'te 60Hz'e göre ~2.4× yoğun. | Olasılığı delta ile ölçekle: `Math.random() < 0.18 * delta * 60`. Aynı düzeltme 0.12 köz dalına. | 30dk | Kabul: `ParticleSystem.update`'i 60 ve 144 FPS simülasyonuyla (sabit delta ile) 10 sn koşan mikro-test → üretilen parçacık sayısı ±%10 içinde eşit. |
| 5.4 mousemove birikimi | `src/core/InputManager.js:72-77` | `movementX/Y` `=` ile eziliyor: bir render karesinde birden çok mousemove gelirse hareket kaybolur — nişan hassasiyeti FPS'e bağımlı (okçuluk için kritik). | `this.mouse.movementX += e.movementX;` (`+=`). `getMouseDelta` okuma-sonrası sıfırlama zaten güvenli kılıyor. | 15dk | Manuel: 1000Hz fare + düşük FPS senaryosunda (DevTools CPU throttle 6×) yavaş süpürme kamerada atlama yapmıyor. |
| 5.5 Chunk >500kB | `vite.config.js` + `src/services/GeminiService.js` | Tek chunk build uyarısı: three + tüm oyun tek dosyada. | `vite.config.js` build.rollupOptions.output.manualChunks: `{ three: ['three'] }` (three ve examples/jsm ayrı vendor chunk'a); `GeminiService`'i `import()` ile dinamik yükle (yalnız ret modalı ilk açıldığında). | 1-2s | Kabul: `npm run build` uyarısız; ana chunk < 500kB; oyun `npm run preview`'da sorunsuz açılıyor (Electron `file://` uyumu `base:'./'` ile test edilir). |
| 5.6 Kare içi küçük israflar | `Engine.js:319-321` (passes.find), `main.js:321-351` (her kare NPC mesafe taraması + prompt DOM) | Her kare gereksiz dizi taraması ve koşulsuz DOM yazımı. | Bloom referansı constructor'da saklanır (P2-43); `updateInteractionPrompts` 10 karede bir çalışır ve metin değişmedikçe DOM'a yazmaz. | 1s | DevTools profilinde bu fonksiyonların self-time'ı ölçülür; görünür davranış değişmez. |

**Not (kapsam sınırı):** InstancedMesh'e geçiş (220 buğday sapı, ~190 yol taşı, 150 ağaç — draw call yükü) TARIHSEL Grafik B/C aşamasının işidir; burada yalnız ölçüm altyapısıyla **draw call bütçesi görünür kılınır** (hedef: TARIHSEL §10.10, köyde <700). Bu fazda zorlanmaz.

---

## 6. KAYIT SİSTEMİ BAĞLAMA PLANI

**Mevcut durum:** `src/core/SaveManager.js` 4 slotlu IndexedDB + localStorage yedeği ile hazır ama **hiçbir dosyadan import edilmiyor**; `serializeState` (`:41-57`) kritik alanları kapsamıyor; `getDB` (`:20-36`) her çağrıda yeni bağlantı açıyor. 1 oyun günü ≈ 2.2 saat iken (P1-02 öncesi) her sekme kapanışı tüm ilerlemeyi siliyor — en büyük bağlılık kırıcı.

### 6.1 Bağlama noktaları (UI + otomatik)

1. **Otomatik kayıt — gün dönümü:** `main.js` döngüsünde `lastSeenDayCount !== gameState.time.dayCount` değişimi izlenir → `saveManager.saveGame('auto')` (await'li, hata bildirimli). GameState'in içinden çağrılmaz (core, SaveManager'a bağımlanmaz — mevcut mimari korunur).
2. **Otomatik kayıt — kritik anlar:** `completeQuest` sonrası ve sefer dönüşünde (`concludeBattle` sonrası) `saveGame('auto')`. Uygulama: main.js'te `questSystem` tamamlama sayısı değişimini izleyen aynı kalıp (sistemlere kayıt bilgisi sızdırılmaz).
3. **UI — Devam Et:** Başlangıç ekranına "📜 Devam Et" butonu: `listSaves()` doluysa görünür, en yeni kaydı yükler ve doğrudan oyuna girer.
4. **UI — manuel slotlar:** Tımar Defteri'ne (TAB) "Kayıt" bölümü: 3 manuel slot + auto slot listesi (tarih/gün/akçe özeti `listSaves`'ten), Kaydet/Yükle butonları. Yükleme sonrası `questSystem.syncWithGameState()` + UI tazeleme zorunlu.

### 6.2 Serialize kapsamı (eksiklerin tamamı)

`serializeState`'e eklenecek alanlar — **eksik kalan alan, sessiz ilerleme kaybıdır:**

| Alan | Neden kritik |
|---|---|
| `gameState.aliStatus` (tamamı) | Ali'nin bacak mühleti/3 gün sayacı (P1-06 sonrası canlı dram) kayda girmezse yükleme sayacı sıfırlar. |
| `gameState.activeCampaign` | Sefer durumu; P1-06 sonrası safha ilerlemesi dahil (`CampaignBattleSystem` durum nesnesi de serialize edilir). |
| `gameState.currentPetition` + `hasPendingMessenger` | Bekleyen arzuhal kaybolursa oyuncu suçsuz yere "cevapsız arzuhal" cezası yer. |
| PetitionSystem `constructions` kuyruğu + zamanlayıcıları | Yarım inşaatlar (ödemesi alınmış!) kaybolmamalı. Uygulama: PetitionSystem'e `serialize()/deserialize()` çifti (QuestSystem kalıbı). |
| Quest durumları | `serializeQuests/deserializeQuests` zaten var (`QuestSystem.js:563-593`) — çağrıldığı doğrulanır, objective bazlı ilerleme dahil olduğu test edilir. |
| `sipahi.equippedWeapon`, `weaponType`, `swordDrawn`, `title` | Gürz satın alımı (akçe harcanmış) ve unvanlar kaybolmamalı. |
| `reputation` (3 eksen) + `factions` + `military` + `timar` (taxCollectedThisYear dahil) + `time` (tam nesne: dayCount, seasonIndex, year, hijriYear, dayTimeHours) | Mevcut kapsamda eksik olan tüm alt alanlar tek tek listelenip Object.assign yerine alan-bazlı yazılır. |
| `lastBathDay`, `notificationLog` (P2-29 sonrası) | Küçük ama tutarlılık için. |
| İleriye dönük (ilgili sistem eklendiği PR'da ZORUNLU): kodeks açılan madde id'leri (CodexSystem — 03-tarih T-A), gösterilen havadis id'leri (HistoricalNews — 03-tarih T-B), `time.hijriDay/hijriMonthIndex` + namaz vakti durumu (04-İslami içerik) | 03-tarih dokümanının "ön koşul" tablosu kodeks/haber durumunun kayda girmesini açıkça şart koşar; her yeni durumlu sistem serialize + §6.3 migrasyon girdisini aynı PR'da getirir. |

**Bilinçli hariç:** anlık `notifications` kuyruğu, failState (game-over kaydedilmez), DOM/3D durumları (pozisyon HARİÇ — `player.position` kaydedilir ve yüklemede geri konur; güvenli nokta kontrolüyle).

### 6.3 Geriye dönük uyumluluk kuralı (TARIHSEL §15 karşılığı)

1. Her kayda `saveVersion: 1` ve `gameVersion` (package.json) yazılır.
2. `loadGame` akışı: `deserializeState` ÖNCE `migrate(data)` çağırır — `MIGRATIONS` dizisi sürüm sırasıyla koşar (v1→v2→...); her migrasyon yalnız eksik alanlara default doldurur/yeniden adlandırır.
3. **Alan disiplini:** var olan kayıt alanı yeniden adlandırılamaz/silinemez — yalnız migrasyonla; yeni alan her zaman default'lu eklenir. Deserialize bilinmeyen alanı atmaz (ileri uyumluluk).
4. Bozuk/eski kayıt asla crash üretmez: try/catch → "Kayıt eski bir sürümden ve açılamadı" bildirimi + slot korunur (üzerine yazılmaz).
5. Görev veri şeması değişen her PR, bir `MIGRATIONS` girdisi ve §7.3 kalıbında bir migrasyon testi eklemek ZORUNDADIR.

### 6.4 Teknik onarımlar

- `getDB`: tek bağlantı (`this.dbPromise` memoize), `listSaves` 4 ayrı bağlantı açmaz; sayfa kapanışında bağlantı bırakılabilir (IndexedDB toleranslı).
- `saveGame/loadGame` çağrıları her yerde `await` + hata yolunda `addNotification('Kayıt başarısız...', 'alert')`.
- IndexedDB kullanılabilirliği yoksa localStorage yoluna düşüş korunur (Electron'da her ikisi de var).

### 6.5 Kabul kriterleri

- Test: (a) `await saveGame('slot1')` → `await loadGame('slot1')` gidiş-dönüşünde aliStatus/activeCampaign/currentPetition/quests/time alanları birebir eşit (derin karşılaştırma); (b) `saveVersion` alanı mevcut; (c) v0 (sürümsüz eski) sahte kayıt migrate ile açılıyor ve default'lar dolu.
- Manuel: 10 dk oyna (görev bitir, arzuhal kabul et, inşaat başlat) → sekmeyi kapat → "Devam Et" → aynı gün/saat, aynı görev, inşaat kaldığı günden sürüyor; pusula/HUD tutarlı.
- Süre: bölüm toplamı **1,5-2 gün** (P1-01 satırıyla aynı iş).

---

## 7. TEST STRATEJİSİ

### 7.1 Temel sözleşme

- Mevcut **97 assert korunur** — bir assert ancak yerine daha güçlüsü konarak değiştirilebilir ve PR açıklamasında tek tek gerekçelendirilir. Toplam assert sayısı hiçbir PR'da azalmaz.
- **Her faz sonunda `npm test` + `npm run build` yeşil** — kırmızıyken içerik/özellik PR'ı merge edilmez. (CI yok; bu kural commit disiplinidir: commit mesajının son satırına test özeti yazılır, ör. `tests: 103/103`.)
- Test dosyası gerçek modülleri import etmeye devam eder (mock'lu birim testine geçilmez — mevcut entegrasyon yaklaşımı bu projede kanıtlanmış değer).

### 7.2 Kırılgan assert'lerin sağlamlaştırılması

Sorun (`tests/systems.test.js:353,358,370,375,411`): assert'ler diyalog metninin birebir alt dizgelerine bağlı ("Hızır yoldaşın olsun", "parşömene çizer") — herhangi bir yazım düzeltmesi işlevsel olarak doğru kodu kırıyor. `:451-454` demirci collider'ları sihirli koordinatlarla test ediyor.

Düzeltme tarifi (içerik göçüyle — §4.5 adım 2 — eşzamanlı):
- Metin-eşleme assert'i → **yapısal assert**: düğüm var mı (`nodes.start`), seçenek sayısı, seçeneklerdeki `effects` tipleri (`advanceObjective` hedefi doğru quest'e mi), `historicalConfidence` alanı geçerli mi (`/^[ABCR]$/`).
- Dönem-doku kontrolü tamamen kaybolmasın diye metin assert'i **anahtar kelime listesine** gevşetilir: `['Kosova','Murad']` kelimelerinin İKİSİ de düğüm metninde geçiyor mu (cümle birebir değil).
- Collider testi koordinat yerine **davranış** test eder: demirci konumundan 4 yöne 1'er birim hareket denemesinde en az bir yönün collider'a takılması (yerleşim 1 birim kayarsa test hâlâ anlamlı).

### 7.3 Yeni sistem test şablonu

Her yeni sistem/veri modülü PR'ı şu kalıpta en az bir blok ekler (mevcut custom runner'a uyumlu):

```js
// TEST N: <Sistem adı> — <tek cümle kapsam>
(async () => {
  gameState.reset();                       // 1) İZOLASYON: her blok kendi reset'iyle başlar
  questSystem.syncWithGameState();
  // 2) KURULUM: durumu hazırla (örn. quest'i aktifleştir)
  // 3) EYLEM: tek kamu API çağrısı (örn. EffectRunner.runEffects([...]))
  // 4) ASSERT: durum değişimi + yan etki (bildirim eklendi mi, akçe düştü mü)
  // 5) NEGATİF YOL: koşul sağlanmayınca hiçbir şey değişmediği assert edilir
})();
```

Kurallar: (a) her blok başında `gameState.reset()` — mevcut testlerin sıra bağımlılığı YENİ testlere bulaştırılmaz; mevcut 21 bloğa da fırsatçı olarak reset eklenir (davranış değişmediği sürece). (b) async API'ler **her zaman await'lenir** (P2-44 düzeltmesi örnek teşkil eder). (c) Veri modülleri için şema testi: tüm diyaloglarda `root` düğümü mevcut, tüm `next` hedefleri tanımlı, tüm `effects.type` değerleri sözlükte, din adamı bark'larında `humor:true` yok (§4.4 kuralı), tüm kodeks `tag`'leri A/B/C/R.

Framework göçü (node:test/vitest) **bilinçli olarak yapılmaz** (P2'de bile değil): mevcut runner çalışıyor, göç riski/faydası bu proje ölçeğinde negatif. Tek iyileştirme: başarısız assert'te blok adının yazılması (runner'a 3 satır).

### 7.4 Kayıt testleri

§6.5 kabul kriterlerindeki üç test (`gidiş-dönüş derin eşitlik`, `saveVersion`, `migrasyon`) `tests/systems.test.js`'e eklenir; Node'da IndexedDB olmadığı için localStorage yolu test edilir — bu bilinen sınır, test yorumunda belirtilir ve IndexedDB yolu manuel duman testinin 10. adımıyla kapatılır.

### 7.5 Manuel duman testi (her faz kapanışında, 10 adım — ~20 dk)

Sıra önemlidir; herhangi bir adımda console error = faz kapanmaz.

1. **Başlangıç ekranı:** "Yeni Tımar" 1 kez reset atıyor (tek bildirim); ses butonu ikonuyla birlikte çalışıyor; alt yazıda marka adı yok (§3.3).
2. **Oyuna giriş:** TEK hoş geldin bildirimi + TEK cıngıl; bildirim 5 sn okunabilir kalıyor (P0-3); HUD tarihi 1396/H.798.
3. **İlk görev:** Kethüda ile diyalog → vergi kararı → görev tamamlandı bildirimi + başarım banner'ı (P2-28 sonrası); harami sorusu görev İLERLETMİYOR (P2-14 sonrası).
4. **Rehberlik:** Pusula 📍 değirmenciyi gösteriyor (doğru yön — hedefe dönünce merkezde), metin "…(Xm)" formatında; minimap yıldızı ve landmark'lar yerinde; NPC'lerde dünya işaretçileri görünüyor.
5. **Su İhtilafı:** Değirmenci ile iki hedef tamamlanıyor; HUD sonraki göreve geçiyor.
6. **Ekonomi:** TAB → vergi topla; AYNI yıl ikinci tahsilat reddediliyor; mevsim değişince de reddediliyor (P1-03).
7. **Arzuhal + Kadı:** Arzuhal gelişinde ses (P1-20); Reddet → gerekçe modalı → kadı hükmü (çevrimdışı); sonuç asayiş/morale yansıyor.
8. **Savaş + okçuluk:** Harami kampında 3 düşman; en az biri YALNIZ okla ölüyor (P1-07); vuruşta kamera sarsıntısı (P1-08); yay modunda uyarı spamı yok (P1-18).
9. **Sefer kapısı:** M haritasında sefer butonu görev önkoşulu sağlanana dek pasif + neden metni; kale teftişi sonrası açılıyor; sefer 5 safhalı seçim akışıyla oynanıyor (P1-06).
10. **Kayıt:** Sayfayı yenile → "Devam Et" → gün/saat/görev/inşaat/akçe birebir geri geliyor; F12 konsolunda 10 adım boyunca 0 error.

### 7.6 Kabul ölçümlerinin deterministik karşılıkları (bot koşusu / telemetri altyapısı YOK)

Diğer dokümanların kabul kriterlerinde geçen "3 saatlik bot koşusu", "objective.type telemetrisi", "frame log Δ=0 kare", "düşük/yüksek hazırlıklı iki otomatik koşu" gibi ifadeler bu projede birebir uygulanmaz: telemetri sistemi yoktur ve ana görev yolunu saatlerce oynayan bir 3D bot başlı başına 1-2 haftalık, hiçbir fazda bütçelenmemiş ayrı bir mühendislik işidir (solo geliştirici için orantısız). Denetçi ve geliştirici bu ifadeleri şu deterministik karşılıklarla okur:

- **Ekonomi eğrisi kabulleri** ("bot koşusu" ile ölçülenler) → gün-dönümü kancasını betikli gelir/giderle N gün çağıran headless simülasyon unit testi; eğri koşulu sayısal tanımla yazılır (ör. "≥2 net-negatif 7-günlük pencere").
- **Düşük/yüksek hazırlık karşılaştırması** → savaş metin-taktik olduğundan `CampaignBattleSystem`'i düşük ve yüksek `SupplySystem` durumuyla çağıran iki unit test.
- **Vuruş hissi (Δ=0 kare)** → hasar+ses+sarsıntı+parçacığın TEK çağrı noktasından tetiklendiğini gösteren kod-düzeyi assert + manuel his kontrolü.
- **Görev tipi / etkileşim telemetrisi** → `gameState` altında basit bir sayaç objesi (~2 saatlik yeni iş kalemi; 06-fazlar-ve-kabul.md ilgili faza kalem olarak ekler) veya manuel gözlem çizelgesi.

Bu bölüm, §7.3 şablonu ve §5.0 ölçüm altyapısıyla birlikte tüm kabul ölçümlerinin mevcut/bütçelenmiş araçlarla yapılabilmesini garanti eder; "bot koşusu" ifadesi hiçbir kabul listesinde bağlayıcı değildir.

---

## 8. KOD STANDARTLARI (yeni geliştirici sözleşmesi)

1. **Mevcut stile uy.** Sınıf-başına-dosya, `src/core|entities|systems|ui|services|data` yerleşimi, mevcut isimlendirme (İngilizce kod kimlikleri) korunur. "Hazır değmişken" komşu kodu iyileştirme YOK — her satır değişikliği bir backlog ID'sine veya içerik dokümanı maddesine bağlanır.
2. **Singleton kalıbı korunur:** sistemler dosya sonunda `export const x = new X()` ile üretilir (gameState, questSystem, petitionSystem, soundManager, steamManager, saveManager kalıbı). Yeni sistemler de (EffectRunner) aynı kalıbı kullanır. Core katmanı (GameState) sistemlere bağımlanmaz; bağlama main.js'te yapılır.
3. **Dil ayrımı:** Oyuncuya görünen HER metin Türkçe (dönem üslubu içerik dokümanlarına göre); kod kimlikleri, yorumlar, commit mesajları İngilizce. Commit ilk satırı emir kipi (`fix compass waypoint inversion`), gövdede ne+neden.
4. **Magic number yasağı:** Yeni/dokunulan denge değeri (hız, hasar, fiyat, süre, olasılık, koordinat sabiti) `src/data/balance.js`'e adlandırılmış sabit olarak gider; kodda çıplak sayı bırakan PR reddedilir. Mevcut sabitler dokunuldukça taşınır (toplu taşıma PR'ı yapılmaz — cerrahi ilke).
5. **İçerik koda gömülmez:** Yeni diyalog/bark/kodeks/arzuhal SADECE `src/data/` şemalarıyla (§4) eklenir. İçerik PR'ları `src/data/**` + (gerekirse) `DialogueSystem/EffectRunner` dışında dosyaya dokunamaz.
6. **PR dokunma matrisi** (küçük, odaklı CL ilkesi — bir PR bir satır grubu):
   | PR tipi | Dokunabileceği dosyalar |
   |---|---|
   | Bug düzeltme | Backlog satırındaki dosyalar + test dosyası |
   | İçerik | `src/data/**`, `docs/**` |
   | UI/CSS | `src/ui/**`, `src/style.css`, `index.html` |
   | Sistem | İlgili tek `src/systems|core/**` dosyası + main.js bağlama satırları + test |
   | Varlık | `public/**` + `docs/ASSETS.md` (lisans satırı zorunlu, §3.2) |
7. **Kendi kirini temizle:** Değişikliğinin unused bıraktığı import/değişken/fonksiyon aynı PR'da silinir; ilgisiz ölü kod SİLİNMEZ, §2 tablosuna aday olarak not edilir.
8. **Tarih/din içerik kapısı:** İslami veya tarihsel bilgi taşıyan her içerik parçası `historicalConfidence` (A/B/C/R) taşır; İslami içerik taşıyan kodeks maddesinde Ehl-i Sünnet kontrol listesi (04-içerik dokümanı) tamamlanmadan `reviewed:true` yapılamaz (§4.3 — tek bayrak); din adamı/ibadet mizah nesnesi olamaz (şema düzeyinde test edilir, §4.4). Sistem anlatıcısı tarafsız dil kullanır ("Haçlı ordusu"; "küffar" yalnız karakter ağzında — TARIHSEL §11).
9. **Doğrulama zorunluluğu:** Her PR açıklamasında (a) hangi backlog ID/doküman maddesi, (b) `npm test`+build çıktı özeti, (c) satırın kendi doğrulama adımının sonucu ("manuel: pusula hedefe dönünce merkezde ✓"). "Çalışıyor olmalı" kabul edilmez — kanıt istenir.
10. **Sürüm kontrolü:** Depo hâlihazırda git deposudur ve GitHub'a bağlıdır; P2-50 ile mevcut depo doğrulanıp baseline etiketlenir. Her backlog kalemi ayrı commit; davranış değiştiren commit'ler geri alınabilir küçüklükte tutulur. Dağıtım/push-yayın öncesi §3.1 adım 5'teki geçmiş temizliği zorunludur.

---

## 9. ELECTRON / PORT / STEAM

### 9.1 Port uyumsuzluğu düzeltmesi (P1-22)

**Sorun:** `electron-main.cjs:39-53` önce `http://localhost:5173`'ü deniyor; `vite.config.js:6` portu **3000**'e sabitlemiş. 5173 denemesi her açılışta boşa gecikme; daha kötüsü makinede 5173'te başka bir Vite projesi çalışıyorsa Electron **yanlış uygulamayı** yükler. `docs/DEVELOPMENT_SPEC.md:5` de yanlış portu (5173) belgeliyor.

**Düzeltme:** `electron-main.cjs`'te `devUrl`'ü `http://localhost:3000` yap; 5173 yedeğini tamamen kaldır (tek doğru port + dist fallback yeterli — yanlış-uygulama riskini sıfırlar). Kod içi yorum ve DEVELOPMENT_SPEC/README'deki port referansları 3000'e güncellenir. Süre: 15dk. **Doğrulama:** `npm run dev` + `npm run desktop` doğru oyunu açıyor; 5173'te başka proje koşarken de doğru oyun açılıyor; dev sunucu kapalıyken `dist/index.html` yükleniyor (önce `npm run build`).

**Güncellik notu:** Analiz sonrası commit 1ea86b2 ("Electron port izolasyonu") bu sorunu kısmen/tamamen çözmüş olabilir — Faz 0'da `electron-main.cjs` ve `vite.config.js` yeniden doğrulanır; çözülmüşse P1-22 yalnız yukarıdaki doğrulama adımları koşularak kapatılır, çözülmediyse tarif aynen uygulanır.

### 9.2 Preload + steamworks kararıyla birlikte

§3.4'teki karar uygulanır: `steamworks.js` şimdilik EKLENMEZ; preload'daki guard'lı `require` kalır ama niyet yorumla belgelenir; `build:steam` boş vaadi kaldırılır. Steam kararı verilirse §3.4'ün 5 adımlı hattı (gerçek AppID + electron-builder + asarUnpack) ayrı faz olarak açılır. `contextIsolation:true` mevcut ve korunur; preload'a başka API eklenirse `contextBridge` dışına çıkılmaz.

### 9.3 Çevrimdışı bütünlük

Electron dağıtımı vaadi için iki bağımlılık kapatılır: Google Fonts yerelleştirme (P2-40) ve Gemini'nin çevrimdışı heuristic varsayılanı (P1-05). Kabul: ağ tamamen kapalıyken `npm run desktop` ile oyun görsel ve işlevsel eksiksiz açılıyor (duman testi adım 1-7).

---

## 10. Teslim sırası ve kabul kapıları (özet)

| Sıra | Paket | İçerik | Süre | Kapanış şartı |
|---|---|---|---|---|
| 0 | Depo güvenliği | P2-50 (mevcut depo doğrulama + baseline etiketi — git init DEĞİL, depo zaten var) | 30dk | `git tag` baseline |
| 1 | P0 paketi | P0-1…P0-7 | 1,5-2g | Duman testi adım 1-5 + `npm test`/build yeşil |
| 2 | Hukuk paketi | §3.1 (adım 1-4), §3.3, §3.4-şimdi, §3.2 denetim başlangıcı | 1g | "stanlee/mount/kingdom" grep 0 (çalışma kopyası); ASSETS.md açıldı; git-geçmişi temizliği (§3.1 adım 5) yayın kapısına bağlandı |
| 3 | P1 paketi | P1-01…P1-22 (+§5.0 ölçüm, §6 kayıt) | 8-11g | Duman testi 10/10; kayıt gidiş-dönüş testi |
| 4 | İçerik altyapısı | §4 registry + EffectRunner + veri taşıma | 2-3g | Şema testleri; içerik ekipleri src/data'ya yazabiliyor |
| 5 | P2 akışı | İçerik fazlarına paralel, öncelik P2-01..05, P2-25, P2-28 | sürekli | Her PR kendi doğrulamasıyla |

Bu dokümandaki hiçbir iş TARIHSEL'in kampanya/sanat fazlarını (Aşama 1-5) beklemez; tersine, Aşama 1'in başlayabilmesinin ön şartı 1-4 numaralı paketlerin kapanmasıdır.

**Diğer tasarım dokümanlarının ön koşul eşlemesi (denetçi için):** İçerik dokümanlarının açıkça "teknik plan ön koşulu" ilan ettiği kalemler bu plandaki şu işlere karşılık gelir — 02-mizah §7.10 ve 03-tarih "Ön koşul" satırı → **P0-3** (bildirim render); 03-tarih → **P1-04** (checkHistoricalEvents sıralaması), **P0-1** (water_dispute bağlama), **P1-11** (saka_talk/guard_talk), **P1-01/§6** (kayıt: kodeks/haber durumu); 01-akış Karar Z1/Z8 → **P1-02** (tek zaman otoritesi + daySpeed) ve interactables doldurma (§2 TUT-SOKET satırı); 04-İslami içerik → **P1-02** zaman otoritesi, **§6.2** serialize ekleri ve **§4.1** islamicContent.js kaydı. Bir içerik dokümanının kabul testi, karşılık gelen teknik iş kapanmadan BAŞLATILMAZ.
