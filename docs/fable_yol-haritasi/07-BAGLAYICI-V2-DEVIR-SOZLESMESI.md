# 07 — Bağlayıcı V2 Devir Sözleşmesi ve Geliştirme Yol Haritası

**Belge durumu:** Uygulamaya esas, bağlayıcı V2 sözleşmesi  
**Tarih:** 30 Ağustos 2026  
**Kapsam:** 1396 Niğbolu ana kampanyası; Windows/Electron birincil hedef, web geliştirme hedefi  
**Okuyucu:** Uygulamayı devralan geliştirici, içerik editörü, tarih/din danışmanları ve kabul denetçisi

> Bu belge kod değildir; hangi kodun, hangi sırayla, hangi sınırlar içinde ve hangi kanıtla teslim edileceğini tanımlar. Geliştirici uygulamaya başlamadan önce bu belgenin G0 kapısını tamamlar. Buradaki bir karar 00–06 numaralı belgelerle çelişirse **bu belge geçerlidir**. Çelişen eski cümle “alternatif” sayılmaz.

---

## 1. Yönetici özeti ve olgunluk hükmü

Mevcut 00–06 seti yaratıcı yön, içerik hacmi ve kod referansları bakımından güçlüdür; fakat bugünkü hâliyle doğrudan devredilecek kadar güvenli değildir. Aşağıdaki konular bağlayıcılaştırılmadan uygulama başlatılırsa farklı geliştiriciler farklı oyunlar üretir:

- “Oyuncu zamanın nasıl geçtiğini anlamasın” hedefi etik akış yerine oturum süresini zorlayan ölçütlere bağlanmıştır.
- İlk oynanabilir birleşik deneyim çok geç gelmektedir; sistemler ayrı ayrı yapılınca 12. haftaya kadar oyun hissi doğrulanamaz.
- Tarihî doğruluk etiketi ile dinî hüküm/onay aynı A/B/C/R modeline sokulmuştur.
- Tek `reviewed` boolean’ı tarih, fıkıh, itikat, hadis ve editoryal onayı kanıtlamaz.
- Sabit namaz saatleri, dört tekrar eden prosedürel namaz animasyonu ve sayısal zekât hesabı dinî açıdan güvenli değildir.
- Serbest üretken yapay zekâ “Kadı hükmü” verip oyun statlarını değiştirebilmektedir.
- Kayıt şeması mevcut kodla çelişmekte; masaüstü rastgele origin ve beklenmeyen async test davranışı gerçek kalıcılığı kanıtlamamaktadır.
- Electron güvenlik sınırı, deterministik RNG/Clock, atomik effects, erişilebilirlik ve gerçek CI kapıları eksiktir.
- 368–484 saat / 17 hafta tahmini içerik onayı, test altyapısı, paketleme ve yeniden çalışma payını kapsamamaktadır.

**V2 hükmü:** 00–06, bu belgeyle birlikte olgun bir tasarım girdisidir; **tek başına uygulama sözleşmesi değildir**. Uygulamaya başlanabilmesi için Bölüm 4’teki G0 giriş/çıkış koşulları ve Bölüm 18’deki “Definition of Ready” sağlanmalıdır.

---

## 2. Belge önceliği ve değişiklik yönetimi

### 2.1 Okuma sırası

1. `00-GENEL-BAKIS.md`
2. **Bu belge (`07-BAGLAYICI-V2-DEVIR-SOZLESMESI.md`)**
3. `06-fazlar-ve-kabul.md` — yalnız ayrıntılı eski backlog ve kod kancası kaynağı olarak
4. `05-teknik-plan.md`
5. `01-akis-ve-tutundurma.md`
6. `02-mizah-ve-diyalog.md`
7. `03-tarih-egitimi.md`
8. `04-islami-icerik.md`
9. Ana tarihsel senaryo ve eski geliştirme belgeleri

### 2.2 Öncelik sırası

Bir çelişkide aşağıdaki sıra uygulanır:

1. Kullanıcının yazılı ve güncel talebi
2. Bu V2 belgesi
3. Onay manifestindeki içerik hash’ine bağlı uzman kararı
4. `06` içindeki çelişki tablosunun V2 tarafından geçersiz kılınmamış maddeleri
5. `01–05` alan belgeleri
6. Eski `TARIHSEL...` ve `DEVELOPMENT_SPEC.md`
7. Mevcut kod davranışı

Kodun bugün bir şeyi yapıyor olması o davranışı ürün kararı yapmaz.

### 2.3 Sessiz varsayım yasağı ve karar kaydı

Geliştirici kullanıcıya rutin teknik tercih sormaz; bu belgenin varsayılanlarını uygular. Ancak tarihî/dinî anlamı, yayın kapsamını, veri kaybı riskini veya lisans hakkını değiştiren bir belirsizlikte tahmin yapmaz. `docs/DECISIONS.md` içine şu alanlarla karar kaydı açar:

```text
DEC-### | tarih | konu | seçenekler | öneri | gerekçe | etkilenen içerik/claim ID
karar sahibi | karar | onay tarihi | uygulayan iş kimliği
```

Uzman kararı gerektiren içerik, karar gelene kadar `draft` kalır ve production bundle’a girmez. Bu bekleme geliştiriciye farklı metin uydurma yetkisi vermez.

---

## 3. Ürün sözleşmesi

### 3.1 Ürün vaadi

Oyuncu, 1396’da bir tımarlı sipahinin dirliğini yönetirken insanları ve delilleri gözlemleyecek, karar verecek, kararın kısa ve gecikmeli sonuçlarını görecek, sefere hazırlanacak ve Niğbolu’ya uzanan tarihî bağlamı yaşayacaktır. Bilgi; ansiklopedi duvarı olarak değil, karar vermeyi kolaylaştıran bağlam olarak sunulur.

Temel deneyim cümlesi:

> “Bir işi daha yapayım” merakı uyandıran, fakat oyuncunun iradesini ve dinlenme hakkını koruyan; güldürürken küçümsemeyen; öğretirken vaaz veya sınav hissi vermeyen tarihî yaşam simülasyonu.

### 3.2 Hedef kitle ve ton

- Yaş hedefi: **13+**, aile yanında oynanabilir.
- Dil: V1 yalnız Türkçe; `SUPPORTED_LOCALES = ['tr']`, `DEFAULT_LOCALE = 'tr'`.
- Şiddet: grafik olmayan, sonuçları ciddiye alan; ölüm mizahı yok.
- Mizah: küçük, karaktere bağlı, dünyevî, tekrarsız; sürekli skeç tonu yok.
- Dinî anlatım: saygılı, öğretici, kaynaklı; oyuncunun dindarlığını puanlamaz.
- Tarihî anlatım: kesin bilgi, kuvvetli yorum, dramatik bileşim ve rivayet birbirinden görünür biçimde ayrılır.

### 3.3 Kapsam sınırı

**V1 ana kapsamı:** 1 Nisan 1396 oyun çıpasından 25 Eylül 1396 Niğbolu kapanışına kadar 13 çekirdek görev ve bunları bağlayan dört perde.

Mevcut koddaki cinayet, akıncı, ulak ve 1402 Ankara hattı ana kampanya kapsamından çıkarılır; silinmez. `src/data/expansions/post1396/` altında erişilemez, testleri ayrı ve `frozen` genişleme paketi olarak tutulur. Eski kayıt bunları içeriyorsa veri `state.expansions.post1396` altında korunur, fakat ana görev registry’sini aktive etmez.

**V1 dışında:** 1402 oynanabilir kampanya, multiplayer, canlı servis, günlük giriş serisi, mikro ödeme, serbest üretken yapay zekâ, ayrıntılı ibadet simülasyonu ve bütün dillerde yerelleştirme.

### 3.4 Etik akış ilkeleri

Akış; zorunlu uyaran, FOMO veya oyuncuyu yorgunken tutma tekniği değildir.

- Günlük giriş ödülü, kaybolan ödül, streak, değişken oranlı ganimet veya “şimdi çıkarsan kaybedersin” kullanılmaz.
- Her 10–18 dakikalık oyun gününde doğal kapanış ve güvenli kayıt vardır.
- Oyuncu bir kapanış kararı verdikten sonra en geç **120 saniye** içinde oyundan kayıpsız çıkabilir.
- Oturum süresi yalnız betimleyici telemetridir; kabul kapısı değildir.
- 10 dakikada kendiliğinden açılan zorunlu UI olayı en çok 3’tür. Diğer dünya olayları oyuncunun yolunu kesmez.
- Oyuncu bildirim, hareket, kamera sarsıntısı ve ses yoğunluğunu azaltabilir.
- “Bir tur daha” hissi merak ve sonuç bağıyla kurulur; ceza veya manipülasyonla değil.

---

## 4. Bağlayıcı V2 düzeltmeleri

Bu tablo 00–06’daki aksi yöndeki kararları açıkça geçersiz kılar.

| ID | Konu | Bağlayıcı V2 kararı |
|---|---|---|
| V2-01 | Kampanya | İç takvim günü 1 = 1 Nisan 1396; gün 178 = 25 Eylül 1396. Mart/209 gün tabloları kullanılmaz. |
| V2-02 | Takvim konvansiyonu | Runtime ordinal gün kullanır. UI için `proleptic_gregorian` normalizasyonu ve kaynak tarihinin özgün biçimi metadata’da tutulur. Dönüşüm, uzman onaylı claim’e bağlanır. |
| V2-03 | Vakitler | Sabit tablo gerçek ibadet vakti olarak sunulmaz. Oyun `dawn/midday/afternoon/sunset/night` ritim pencereleri kullanır; “gerçek namaz vakti değildir” notu bulunur. |
| V2-04 | Namaz görselleştirmesi | Rekât koreografisi ve “4 tekrar” yoktur. Uzak silüet, safa yönelme, kısa kararma ve çevresel ses kullanılır; yakın plan ibadet kontrolü yoktur. |
| V2-05 | Zekât | V1’de nisap veya `%2.5` hesaplayan oyun mekaniği yoktur. Zekât yalnız uzman onaylı bilgi içeriğidir. Oynanabilir yardım eylemleri sadaka, infak ve vakıf olarak adlandırılır. |
| V2-06 | Öşür | Fıkıhtaki zirai zekât ile Osmanlı arazi/vergi pratiği aynılaştırılmaz; ilgili içerik hem tarihçi hem Hanefî fıkıh uzmanı onayı ister. |
| V2-07 | Ehl-i Sünnet çerçevesi | Ortak Sünnî ilkeler temel; 1396 Osmanlı pratiğinde Hanefî temsil açıkça etiketli; gerekli itikadî ayrıntı Mâturîdî kaynağa atıflı. Diğer Sünnî ekoller küçümsenmez veya “dışarıda” gösterilmez. |
| V2-08 | Dindarlık ölçümü | `devout/regular/rare`, `istikamet`, “katıldığı vakit” gibi iman/dindarlık çıkaran sayaçlar yoktur. Yalnız sahne tanıklığı ve takvim olayı kaydedilir. |
| V2-09 | Şehitlik | Sistem oyuncu veya NPC için uhrevî hüküm vermez. `triggerMartyrdom` yerine `triggerBattleDeath`; karakterler yalnız ümit ve dua diliyle konuşabilir, metin uzman onaylıdır. |
| V2-10 | Mizah | Ölüm anı/`killEnemy` son sözü yoktur. Aynı replikler uygunsa çatışma öncesi böbürlenme, kaçış veya teslim bağlamına yeniden yazılır. |
| V2-11 | Dinî ifade ve mizah | Dua, bereket, sevap, ibadet ve din adamı mizahın kurulumunda veya vuruşunda kullanılmaz. Halk duası `speechAct:'blessing'`, `humor:false` taşır. Grep yalnız ön kontrol; insanî anlam denetimi zorunludur. |
| V2-12 | İçerik etiketleri | A/B/C/R yalnız `historicalStatus` alanıdır. Dinî kapsam `religiousScope`, ifade türü `statementMode`, risk ve uzman onayı ayrı alanlardır. |
| V2-13 | Kodeks adı | Oyuncu yüzündeki ana bilgi kitabı **Kâtibin Defteri**. Sekmeler: “Vakalar ve Şahıslar”, “Menkıbeler ve Rivayetler”, “Dinî Hayat ve Âdâb”. Son sekme fetva/ilmihal veya gerçek vakit kaynağı değildir. |
| V2-14 | Yapay zekâ | V1 yayın kodunda Gemini ve benzeri runtime üretken AI yoktur; API anahtarı UI’si kaldırılır. Hüküm, skor ve stat değişimi yalnız yerel deterministik kural motorundadır. |
| V2-15 | Effects | Bütün effects şema doğrulamalı, allowlist’li, atomik ve `transactionId` ile exactly-once’dır. Keyfî object path yazan `setFlag(path)` yasaktır. |
| V2-16 | Determinizm | Gameplay RNG’si `RandomService`; zaman `Clock/CalendarService` üzerinden akar. Aynı seed + komut dizisi aynı canonical state hash’ini üretir. |
| V2-17 | Kayıt | Electron’da kanonik kayıt `userData` altındaki doğrulanmış dosyadır; web geliştirmede IndexedDB. Rastgele localhost origin kayıt otoritesi değildir. |
| V2-18 | Quest kimliği | Görev ve objective durumları index veya oyuncu metniyle değil kalıcı ASCII ID ile saklanır. |
| V2-19 | Test | 97 assert sayısı kalite kapısı değildir. Legacy suite korunur; yeni davranışlar Vitest, Playwright, içerik validator ve CI ile kimliklendirilir. |
| V2-20 | Erişilebilirlik | Ortak modal/a11y altyapısı ilk dikey kesitte kurulur; son faza bırakılmaz. |
| V2-21 | Performans | Ölçüm overlay’i G0/G1’de gelir; içerik bittikten sonra ilk kez ölçüm yapılmaz. |
| V2-22 | İlk teslim | Önce 30–45 dakikalık tek günlük birleşik dikey kesit yapılır; tüm sistemlerin ayrı ayrı bitmesi beklenmez. |
| V2-23 | Tahmin | Eski 368–484 saat / 17 hafta geçersizdir. Planlama bandı 700–1000 saat, 22–32 takvim haftasıdır; G1 sonunda yeniden tahmin edilir. |
| V2-24 | Onay | `reviewed:true` yasaktır. Uzman rolü + içerik hash’i + tarih + durum içeren ayrı audit manifesti gerekir. |
| V2-25 | Yayın | Onaysız hassas içerik gizlenmekle kalmaz, production bundle’a alınmaz. Build validator bunu zorlar. |

---

## 5. Deneyim mimarisi

### 5.1 Ana oynanış döngüsü

Her anlamlı görev şu sırayı izler:

```text
Gözlemle → iki kaynağı/delili karşılaştır → karar ver
→ anlık dünya tepkisini gör → akşam hesabında özeti gör
→ 1–3 oyun günü sonra gecikmeli sonucu yaşa
```

Bir görev yalnız “NPC ile konuş → ödül al” ise tamamlanmış sayılmaz. Çekirdek 13 görevden en az 10’u en az iki farklı fiil ve bir kanıt/sonuç bağı içermelidir.

Zorunlu fiil havuzu:

- `inspect`: nesne/iz incele
- `compare`: defter, tanık veya fiziksel delili karşılaştır
- `carry/deliver`: sınırlı taşıma ve teslim
- `track`: yön/iz sürme
- `train`: zamanlamalı beceri denemesi
- `allocate`: akçe, erzak veya insan gücü ayır
- `mediate`: iki makul taraf arasında karar ver
- `prepare`: sefer girdisi hazırla
- `command`: muharebe safhasında taktik seç

### 5.2 Dikey kesit: bir tam oyun günü

G1’in tek oynanabilir kesiti 30–45 dakika içinde şunları bir araya getirir:

1. **Uyanış ve yönelim:** hareket, etkileşim, “şimdi/bugün/sefer” hedefleri; yardım metni kapatılabilir.
2. **Sabah divanı:** Kethüda iki iş sunar; oyuncu sırasını seçer.
3. **Su ihtilafı:** kırık arkı inceleme, iki tanık, sınır işareti; en az iki makul çözüm.
4. **Dünyevî mizah:** Saka veya defter işi üzerinden en çok iki kısa beat; hiçbir kutsal kavram punchline değildir.
5. **Tarih öğrenimi:** karar için gerekli bir tımar/öşür/arazi ayrımı; kaynaklı kart açılır.
6. **Dinî hayat ritmi:** NPC’lerin gündelik ritim değişimi ve mescide yönelişi; oyuncuya sevap/stat/ceza yok.
7. **Talim veya bakım:** kısa beceri döngüsü, okunur geri bildirim.
8. **Gecikmeli yankı önizlemesi:** su kararının küçük dünya değişimi.
9. **Akşam hesabı:** karar, maliyet, öğrenilen kavram ve yarın merakı.
10. **Kayıt:** auto slot; masaüstü tam process kapanıp açıldıktan sonra aynı durum.

Kesit, sonraki kampanya içeriği hazır değilken ayrı bir `vertical-slice` feature flag’iyle çalışabilir; geçici metinler `DRAFT` filigranlı olur ve production build’e girmez.

### 5.3 Gün ve perde ritmi

- Bir aktif oyun günü hedefi 10–18 gerçek dakikadır; bu bir denge başlangıç değeri, zorunlu KPI değildir.
- Her gün 2 ana iş + 1 isteğe bağlı kısa faaliyet sunar.
- Aynı gün en fazla 1 ağır ahlaki karar vardır.
- Oyuncu modal okurken simülasyon durur; savaş, takip ve fiziksel riskte durmaz.
- Akşam hesabı manuel açılabilir; otomatik açılış oyuncu güvenli alandaysa ve başka modal yoksa olur.
- Perde sonu 45–90 dakikalık oturum hedefi değil, 4–7 oynanır gün ve açık anlatı kapanışıyla tanımlanır.

### 5.4 Hedef ve geri bildirim

HUD yalnız üç satır taşır:

- **Şimdi:** tek somut fiil, hedef ve mesafe
- **Bugün:** kalan 0–3 iş
- **Sefer:** tek hazırlık özeti

Her eylem en geç 100 ms içinde görsel veya işitsel geri bildirim verir; erişilebilirlik için kritik bilgi yalnız ses, renk, ekran sarsıntısı veya titreşime dayanamaz. Büyük ödül yağmuru yerine kısa mühür, defter işareti ve dünya tepkisi kullanılır.

---

## 6. Mizah ve anlatı tonu sözleşmesi

### 6.1 Ton durumları

Her sahne şu enum değerlerinden birini taşır:

```text
LIGHT | NEUTRAL | TENSE | SOLEMN
```

- `SOLEMN`: ölüm, cenaze, ibadet, âyet/hadis, ağır hastalık, savaş kaybı. Mizah sıfır.
- `TENSE`: çatışma hazırlığı, tehdit, afet. Yalnız gerilimi insanileştiren dünyevî bir söz; punchline yok.
- `NEUTRAL`: bilgi ve görev akışı. Hafif karakter nüktesi olabilir.
- `LIGHT`: çarşı, zanaat, hayvan, hava, yemek, uyku, bürokrasi.

Ton geçişi game-time `Clock` ile yönetilir; `Date.now()` kullanılmaz. Trajedi sonrası en az 120 oyun saniyesi `SOLEMN` kilidi vardır.

### 6.2 Mizah bütçesi

- İlk 15 dakikada kendiliğinden gösterilen en çok 2 mizah beat’i.
- Sonrasında hedef: saatte 4–8; oyuncunun seçtiği diyalog dalları bu sayıya dahil edilmez.
- Global cooldown en az 180 gerçek saniye.
- Aynı kanal havuzu bitmeden replik tekrar etmez.
- Seçim `content` RNG stream’i ve kayıtlı seed ile deterministiktir.
- Ekranda aynı anda yalnız bir mizah kanalı konuşur; UI bildirimi ile NPC balonu yarışmaz.

### 6.3 Yasaklar ve zorunlu yeniden yazımlar

- `killEnemy` ölüm replikleri kaldırılır.
- “Dua akçeden sağlam paradır”, “buğday zaten duayla bitiyor” benzeri ifadeler kaldırılır; dinî eylemi ekonomik punchline yapamaz.
- Başarım adı/açıklaması kutsal kavramı şakaya veya sayı oyununa çeviremez.
- Uyuyan NPC’leri rahatsız etmeyi ödüllendiren başarım yoktur.
- “Kahvaltı” gibi bağlama göre modern duran kullanım yerine “sabah sofrası” tercih edilir; nihai dil editörü karar verir.
- Din adamı, etnik/dinî topluluk, engellilik, yoksulluk, ölüm ve ibadet aşağılayıcı mizah hedefi değildir.

### 6.4 Mizah veri sözleşmesi

```js
/** @typedef {Object} ContentLine
 * @property {string} id                 // ASCII, kalıcı, benzersiz
 * @property {string} textTr
 * @property {string} speakerId
 * @property {'bark'|'dialogue'|'notification'|'blessing'} channel
 * @property {'LIGHT'|'NEUTRAL'|'TENSE'|'SOLEMN'} tone
 * @property {number} priority           // 0..100
 * @property {string} cooldownGroup
 * @property {number=} minDay
 * @property {number=} maxDay
 * @property {string[]} requiredFlags
 * @property {string[]} blockedFlags
 * @property {string[]} claimIds
 * @property {string[]} sensitivityTags
 * @property {'draft'|'in_review'|'approved'|'published'} lifecycle
 * @property {boolean} humor
 * @property {'joke'|'blessing'|'warning'|'information'} speechAct
 */
```

`speechAct:'blessing'` olan kayıt `humor:false` olmak zorundadır. `SOLEMN` sahnede `humor:true` build hatasıdır.

---

## 7. Tarih öğretimi ve Türk tarihi kapsamı

### 7.1 Öğretme ilkesi

Bir bilgi üç katmandan geçer:

1. **İhtiyaç:** oyuncu bir karar verirken bilgiye gereksinim duyar.
2. **Karşılaşma:** bilgi çevre, karakter, defter veya olay içinde görülür.
3. **Hatırlama:** oyuncu aynı kavramı daha sonra yeni bir bağlamda kullanır.

Kart açılması öğrenme kanıtı değildir. Quiz zorunlu değildir; doğru kavramı kullanmanın dünyayı anlamayı kolaylaştırması esastır.

### 7.2 Ana öğrenme hedefleri

Oyuncu kampanya sonunda şunları kendi cümlesiyle ayırt edebilmelidir:

- Tımarın özel mülk veya maaş olmadığını; hizmet, vergi tahsisatı ve cebelü yükümlülüğü ilişkisini
- Reaya, sipahi, kadı/naip, kethüda, ahi/esnaf ve vakıf rollerini
- Gaza anlatısı ile yağma ve sınırsız şiddetin aynı olmadığını
- Niğbolu’nun ana taraflarını, sefer bağlamını ve dramatize edilen unsurları
- Tarihî belge, tarihçi yorumu, dramatik bileşim ve rivayetin farkını
- Fıkhî öşür kavramı ile Osmanlı vergi/arazi uygulamasının bağlama göre ayrıldığını
- Türk tarihinin Osmanlı’dan başlamadığını ve Anadolu/Rumeli dünyasının çok katmanlı olduğunu

### 7.3 Genişletilmiş Türk tarihi kart paketi

Ana senaryoyu ansiklopediye çevirmeden şu altı kart ve en az üç çevresel bağ eklenir:

| ID | Konu | Oyun bağı | Asgari uzmanlık |
|---|---|---|---|
| `seljuklu_mirasi` | Selçuklu yol, han ve idare mirası | Han/yol güvenliği görevi | Anadolu Orta Çağ tarihçisi |
| `anadolu_beylikleri` | Beylikler ve erken Osmanlı ilişkileri | Tüccar malı/arma anlatısı | Erken Osmanlı tarihçisi |
| `turkmen_yaylak_kislak` | Türkmen hareketliliği ve üretim | Hayvan/mera ihtilafı | Sosyal-ekonomik tarihçi |
| `ahi_teskilati` | Ahi/esnaf dayanışması | Demirci/çarşı kararları | Kurumlar tarihi + dinî hayat |
| `turkce_cokdillilik` | Türkçe ve çok dilli sınır dünyası | Rumeli tüccarı/tercüman | Dil ve Balkan tarihi |
| `rumeli_yerlesimleri` | Rumeli’de yerleşim, yerel halk ve idare | Sefer yolculuğu vignette’i | Osmanlı-Balkan tarihçisi |

Bu başlıklar milliyetçi üstünlük, homojen nüfus veya doğrusal “kaçınılmaz yükseliş” anlatısına dönüştürülmez.

### 7.4 Kâtibin Defteri

Ana ad **Kâtibin Defteri**’dir. “Menâkıbnâme” yalnız menkıbe/rivayet sekmesinin tarihî tür adı olarak açıklanabilir; bütün kodeksin adı olamaz. Her kart:

- 70–140 kelime ana metin,
- 1 cümle “oyunda ne gördün?”,
- görünür `historicalStatus`,
- kaynak ayrıntısı ve locator,
- dramatizasyon varsa açık uyarı,
- ilgili claim ve onay hash’i taşır.

### 7.5 Öğrenme kabulü

Faz playtestlerinde, öğretici metni yazan kişi dışında katılımcılarla ölçülür:

- Hemen sonra 8 çekirdek kavramda doğru/temelde doğru anlatım ≥ %70.
- 24–48 saat sonra 6 kavramlık uzaktan takipte ≥ %50.
- A/B/C/R ayrımında örnek sınıflandırma ≥ %80.
- Dinî veya tarihî temel yanlış öğrenme: **0 kritik misconception**.
- Kartı açma oranı raporlanır ama tek başına başarı sayılmaz.

Küçük örneklemde bu yüzdeler yayın iddiası değil, tasarım sinyalidir; ham yanıtlar anonimleştirilerek build hash’iyle saklanır.

---

## 8. Ehl-i Sünnet içerik yönetişimi

### 8.1 Çerçeve

“Ehl-i Sünnet” tek bir fıkıh veya kelâm okulundan ibaretmiş gibi yazılmaz. V1’in bağlayıcı profili:

- Ortak Sünnî inanç ve adab ilkeleri temel katmandır.
- 1396 Osmanlı gündelik/fıkhî pratiği anlatılırken **Hanefî** çerçeve açıkça etiketlenir.
- İtikadî ayrıntı gerçekten gerekiyorsa **Mâturîdî** kaynağa atfedilir; oyun içi polemik kurulmaz.
- Şâfiî, Eş’arî veya diğer Sünnî gelenekler yanlış, eksik veya dış grup gibi gösterilmez.
- Dinî hüküm oyuncu karakterin ağzından mutlaklaştırılmaz; tarihî karakter görüşü ile sistem bilgisi ayrılır.

### 8.2 Kapsam ayrımı

Her hassas claim aşağıdaki değerlerden birini taşır:

```text
sunni_shared | hanafi | maturidi | intra_sunni_disputed | ottoman_custom
```

`intra_sunni_disputed` içerik V1’de oynanış sonucu belirleyemez. Gerekirse yalnız “görüş farklılığı vardır” biçiminde, uzman onayıyla bilgi kartında yer alır.

### 8.3 İbadet ve oyuncu özgürlüğü

- Oyuncu namaza katılmadığı için stat, görev, başarım veya hikâye cezası almaz.
- Katılım bir “doğru cevap” düğmesi değildir; NPC toplumsal davranış sahnesidir.
- Oruç sayaç veya dayanıklılık debuff’ı değildir.
- NPC’ler homojen davranmaz: gayrimüslimler mescide yönelmez; hastalık, görev, yolculuk gibi bağlamlar ahlaki yargı olmadan temsil edilir.
- Ezan/dua kaydı sentetik sesle üretilmez. İcracı, kayıt/master, platform, bölge ve süre hakları yazılı olarak doğrulanır.
- Oyundaki ritim göstergesi gerçek namaz vakti/fetva hizmeti olmadığını açıkça söyler.

### 8.4 Zekât, sadaka, infak ve vakıf

V1’de `nisab`, kamerî yıl ve borç/temel ihtiyaç koşullarını eksik modelleyen sayısal zekât hesabı **uygulanmaz**. “Kasadaki fazla akçe × 0.025” formülü yasaktır.

- Oyuncunun gönüllü yardımı `sadaqa/infak` olarak kaydedilir.
- Kalıcı hayır işi `waqf`/vakıf bağlamında, tarihî ve hukukî basitleştirme uyarısıyla işlenir.
- Sosyal dünya sonucu (ör. ihtiyaç sahibinin minnettarlığı) gösterilebilir; uhrevî puan veya savaş buff’ı yoktur.
- Zekâtın şartları yalnız onaylı bilgi kartında, fetva kaynağına yönlendiren “oyun dinî danışmanlık değildir” notuyla açıklanır.

### 8.5 Şehitlik, gaza ve ölüm

- Sistem hiç kimseyi “şehit” ilan etmez; niyet ve uhrevî hüküm Allah’a aittir çerçevesi korunur.
- Oyun olayı `battle_death`; cenaze/dua sahnesi tarihî-dinî uzman onaylıdır.
- “Şehit ol” başarımı, ödülü veya ölüm optimizasyonu yoktur.
- Gaza, yağma izni veya sivile sınırsız güç gibi anlatılmaz; tarihî kavram ile normatif dinî ilke ayrı claim’lerdir.
- Âyet/hadis savaş loot’u, başarı efekti veya propaganda sloganı gibi kullanılmaz.

### 8.6 Dinî içerik için zorunlu uzmanlar

En az şu roller isimli ve yazılı onay verir:

- 14. yüzyıl Osmanlı/Rumeli tarihçisi
- Hanefî fıkıh ve Osmanlı dinî pratiği uzmanı
- İtikad/şehitlik/hadis geçen içerikte ilgili uzman
- Hadis kullanımında tahric ve sıhhat derecesini kontrol eden uzman
- Ezan/tilavet varsa ehil okuyucu ve ses hakları sorumlusu
- Lisans/hukuk sorumlusu

“Danışmana gösterildi” kabul değildir; Bölüm 10’daki manifest alanları dolmalıdır.

---

## 9. İçerik, claim, kaynak ve onay veri sözleşmeleri

### 9.1 Temel ilke

Oyuncuya gösterilen cümle (`ContentRecord`), o cümlenin iddiası (`ClaimRecord`), dayanağı (`SourceRecord`) ve uzman onayı (`ReviewRecord`) ayrı kayıtlar olur. Bir metin değişince hash değişir ve eski onay otomatik olarak `stale` olur.

### 9.2 ContentRecord

```js
{
  id: 'codex_timar_001',
  schemaVersion: 1,
  contentKind: 'codex',
  locale: 'tr',
  title: 'Tımar neydi?',
  body: '...',
  claimIds: ['claim_timar_001', 'claim_timar_002'],
  sensitivityTags: ['history', 'religion_adjacent'],
  requiredReviewRoles: ['history', 'editorial'],
  lifecycle: 'draft',
  contentHash: 'sha256:...',
  owner: 'content-team'
}
```

### 9.3 ClaimRecord

```js
{
  id: 'claim_timar_001',
  statement: 'Tımar, toprağın özel mülkiyetinin devri değildir.',
  contentKind: 'historical',
  historicalStatus: 'A',             // A | B | C | R | not_applicable
  religiousScope: 'not_applicable',  // veya Bölüm 8.2 enum’u
  statementMode: 'system_fact',      // system_fact | character_view | dramatization | tradition_report
  sourceIds: ['src_tdv_timar_001'],
  risk: 'medium',                     // low | medium | high | prohibited
  notesOnDisagreement: null
}
```

`C` ve `R` içerik `system_fact` olamaz. `R`, oyuncuya “rivayet edilir/menkıbede anlatılır” çerçevesiyle gösterilir.

### 9.4 SourceRecord

```js
{
  id: 'src_tdv_timar_001',
  authorityOrAuthor: '...',
  title: 'Tımar',
  editionPublisherYear: '...',
  locator: 'cilt/sayfa/bölüm veya paragraf',
  stableUrl: 'https://...',
  accessedAt: '2026-08-30',
  sourceType: 'reference_article',
  supportsClaimIds: ['claim_timar_001'],
  usage: 'paraphrase',
  licenseStatus: 'link-and-paraphrase-ok',
  notesOnDisagreement: null
}
```

Yalnız kitap/site adı yazmak yeterli değildir; sayfa, bölüm, hadis numarası veya kararlı paragraf locator’ı gerekir. “Kütüb-i Sitte’de var” tek başına kaynak değildir; rivayet, tahric, sıhhat değerlendirmesi ve bağlam belirtilir.

### 9.5 Ayrı audit manifestindeki ReviewRecord

```js
{
  contentId: 'codex_timar_001',
  contentHash: 'sha256:...',
  role: 'history', // history | fiqh | aqidah | hadith | editorial | legal | audio
  reviewerId: 'reviewer-registry-id',
  status: 'approved', // pending | changes_requested | approved | not_required | stale
  reviewedAt: '2026-09-15T12:00:00Z',
  sourceIds: ['src_tdv_timar_001'],
  notes: '...'
}
```

Kurallar:

- Onay içerik dosyasının içine boolean olarak yazılmaz.
- Reviewer kendi rolü dışındaki onayı veremez.
- Content hash değişince ilgili tüm `approved` kayıtlar `stale` sayılır.
- `lifecycle:'published'` için gerekli her rol `approved` veya açıkça `not_required` olmalıdır.
- `validate:content`, eksik/stale onaylı published içeriğinde build’i kırar.
- Taslak içerik production import graph’ına alınmaz.

### 9.6 Üç uzman kapısı

1. **Politika kapısı:** Şema, hassasiyet matrisi, yasaklar ve kaynak yöntemi koddan önce onaylanır.
2. **Claim freeze:** Metin yazılmadan önce claim ve kaynaklar onaylanır.
3. **Exact-build kapısı:** Oyuncunun göreceği birebir string, animasyon, ses, bağlam ve content hash’i release candidate üzerinde onaylanır.

---

## 10. Teknik mimari sözleşmesi

### 10.1 Modül sahipliği

Her stateful sınıf testte bağımsız oluşturulabilir olmalıdır. Dosya gerektiğinde hem class/factory hem uygulama composition-root’unda singleton export edebilir; domain modülü başka singleton’ı doğrudan import edip gizli state paylaşmaz.

Asgari servis sınırları:

- `ClockService`: tek zaman yazarı
- `CalendarService`: ordinal gün ↔ gösterim/çıpa
- `RandomService`: seed’li stream’ler
- `EffectRunner`: doğrulama/preflight/commit
- `SaveRepository`: platform backend’i ve migration
- `ContentRegistry`: yalnız published + valid içerik
- `RuleEngine`: dilekçe/karar sonuçlarının tek otoritesi
- `Logger`: güvenli ve yapılandırılmış hata kaydı

### 10.2 Clock ve Calendar

Normal akış, uyku, atlama kartı ve debug jump yalnız şu API üzerinden ilerler:

```js
clock.advanceMinutes(amount, { reason, eventId });
calendar.advanceToDay(dayCount, { reason, eventId });
```

- Doğrudan `time.dayCount++`, `daysPassed++` veya sistem içi sayaç yasaktır.
- Gün geçiş event’i `eventId` ile idempotenttir.
- Oyun modalları `pauseReason` seti kullanır; boolean yarışı yoktur.
- Takvim doğruluğu unit test değil, onaylı claim/source ile kanıtlanır; unit test yalnız dönüşümün tanımlanan kurala uyduğunu kanıtlar.

### 10.3 RNG

`RandomService` en az üç stream sunar:

```text
simulation  // ekonomi, muharebe, görev sonucu
content     // replik/havadis seçimi
cosmetic    // parçacık ve salt görsel çeşitlilik
```

Gameplay’i etkileyen kodda doğrudan `Math.random()` yasaktır. `simulation` ve `content` state’i kayda girer. Kozmetik stream kayıt dışında kalabilir ama testte enjekte edilebilir. Bildirim ID’si rastgelelikle üretilmez; monotonic counter/UUID factory kullanılır.

### 10.4 EffectRunner transaction modeli

İzinli effect türleri enum’dur: `modifyStat`, `advanceObjective`, `completeQuest`, `unlockContent`, `scheduleEvent`, `startConstruction`, `addItem`, `removeItem`, `setKnownFlag`. Keyfî fonksiyon ve keyfî path yoktur.

İşlem sırası:

1. İçerik ve effect JSON Schema ile doğrulanır.
2. `transactionId` ledger’da varsa daha önceki sonuç döner; tekrar uygulanmaz.
3. Bütün conditions (`all/any/not`) projected state üzerinde hesaplanır.
4. Bakiye, kapasite, quest durumu ve allowlist için preflight yapılır.
5. Tek bir effect geçersizse state hiç değişmez.
6. Yeni state tek atomik commit ile yazılır; `appliedEffectIds` ledger’a eklenir.
7. Ses, bildirim ve achievement commit sonrasında çalışır; bunların hatası state’i geri almaz ve rate-limited loglanır.

Sonuç sözleşmesi:

```js
{
  ok: true,
  transactionId: 'dialogue:water:start:resolve',
  applied: ['advance_water_evidence', 'trust_plus_15'],
  skipped: [],
  error: null
}
```

### 10.5 Quest veri sözleşmesi

Her quest ve objective kalıcı ID taşır:

```js
{
  id: 'quest_water_dispute',
  schemaVersion: 1,
  actId: 'act_1',
  prerequisites: ['quest_inspect'],
  objectives: [
    { id: 'inspect_broken_channel', type: 'inspect', targetId: 'water_channel_a' },
    { id: 'hear_witness_ayse', type: 'dialogue', targetId: 'npc_ayse' }
  ],
  outcomes: ['reconcile', 'refer_to_naib', 'coerce'],
  contentIds: ['dialogue_water_001'],
  saveCompatibilityId: 'quest_water_dispute:v1'
}
```

- `THREE.Vector3`, function, DOM node veya class instance data dosyasına girmez; koordinat `{x,y,z}` plain object olur ve runtime’da hydrate edilir.
- Boş choice, kırık `next`, erişilemez node, cycle (açıkça `loopAllowed` değilse), duplicate ID ve hem `next` hem `closes` kullanımı validator hatasıdır.
- `onOpen` kalıcı effect taşımaz; gerekiyorsa idempotent transaction ID zorunludur.

### 10.6 Hata ve log sözleşmesi

Logger alanları: `level`, `subsystem`, `event`, `buildVersion`, `sessionId`, `seed`, güvenli context.

- API key, oyuncu serbest metni, save payload, dosya yolu veya kişisel veri loglanmaz.
- Beklenmeyen `catch {}` yasaktır. Optional capability hatası kod ve yorumla açıkça ayrılır.
- Test/development’ta beklenmeyen hata testi kırar.
- Production’da fatal simulation hatası oyunu duraklatır, güvenli mesaj ve recovery save seçeneği sunar.
- Frame loop aynı hatayı her kare yazmaz; fingerprint + rate limit kullanır.

### 10.7 Mevcut gerçek bug’ın kapsamı

`main.js` içindeki `this.questSystem.advanceObjective(...)` çağrısında `Game` üzerinde `questSystem` ataması yoktur. G0/G1’de ya dependency açıkça enjekte edilir ya da etkileşim yeni EffectRunner yoluna taşınınca ölü dal kaldırılır. Kabul testi, ilgili etkileşimin exception atmadan objective’i tam bir kez ilerlettiğini doğrular.

---

## 11. Kayıt ve migration sözleşmesi

### 11.1 Platform backend’i

- **Electron production:** preload üzerinden dar IPC; kanonik dosyalar `app.getPath('userData')/saves/` altında.
- **Web geliştirme:** IndexedDB; localStorage yalnız küçük recovery pointer’ı olabilir.
- Renderer dosya yolu seçemez. IPC yalnız sabit slot enum’u ve boyut sınırı doğrulanmış payload kabul eder.
- Yazım: geçici dosya → doğrulama/checksum → atomik rename. Eski geçerli dosya recovery olarak korunur.

Kanonik slotlar:

```text
auto_a | auto_b | chapter | manual
```

Autosave `auto_a/auto_b` arasında revision’a göre döner. Bozuk/yeni sürüm kaydı algılandığında autosave kilitlenir; kullanıcı recovery kararı vermeden üzerine yazılmaz.

### 11.2 Kayıt zarfı

```js
{
  meta: {
    saveSchemaVersion: 1,
    gameVersion: '1.0.0',
    slot: 'auto_a',
    revision: 42,
    createdAtUtc: '...',
    updatedAtUtc: '...',
    simulationSeed: '...',
    checksum: 'sha256:...'
  },
  state: {
    game: { sipahi, timar, reputation, factions, military, time, aliStatus, murderCase, relations, flags },
    player: { position: { x: 0, y: 0, z: 0 }, yaw: 0, cameraMode: 'thirdPerson', isRiding: false },
    quests: { byId: {} },
    systems: {
      petition: { activeConstructions: [], lastPetitionId: null, pendingMessenger: null },
      campaign: { type: null, phase: null, score: 0, losses: 0, banners: [], log: [], isActive: false },
      supply: {}, codex: {}, news: {}, prayer: {}, humor: {}, telemetry: {}
    },
    world: { defeatedEnemyIds: [], discoveredIds: [], constructionIds: [] },
    rng: { simulationState: null, contentState: null },
    appliedEffectIds: [],
    expansions: { post1396: {} }
  }
}
```

Şema gerçek kod envanteri çıkarıldıktan sonra genişletilebilir; alan adı sessizce değiştirilemez. `activeConstructions`/`constructions`, `daysPassed`/`time.dayCount`, `version`/`saveSchemaVersion` uyuşmazlıkları migration fixture’larıyla çözülür.

### 11.3 Migration kuralları

- Mevcut `version:'1.2.0'` biçimi `legacy-1.2.0` olarak adlandırılır; “v0” diye varsayılmaz.
- `dbSchemaVersion` ile `saveSchemaVersion` ayrıdır.
- Migration saf, idempotent, girdi nesnesini değiştirmeyen fonksiyondur.
- Her adım `from → to`, invariant ve fixture taşır.
- Bilinmeyen alan ya `extensions` altında korunur ya açık allowlist kararıyla raporlanarak atılır; sessiz veri kaybı yoktur.
- Gelecek sürüm kaydı eski oyunla açılmaz; salt okunur yedek ve anlaşılır hata sunulur.
- Objective index/metni ID’ye çevrilirken explicit mapping tablosu kullanılır.

Zorunlu fixture’lar: gerçek legacy kayıt, en eski desteklenen kayıt, eksik alan, bozuk JSON, yanlış checksum, future version, iki backend farklı revision, savaş ortası, expansion quest aktif ve objective sırası değişmiş kayıt.

### 11.4 Kayıt kabulü

- Electron: kaydet → uygulamayı tamamen kapat → yeni process → aynı canonical state hash.
- Savaşın her safhasında kaydet/yükle; skor, loss, log ve RNG aynı.
- Aynı effect load sonrası yeniden çalışmaz.
- Bozuk auto slot geçerli diğer slota/recovery’ye zarar vermez.
- 100 ardışık save/load çevriminde invariant ihlali ve büyüyen duplicate ledger yoktur.

---

## 12. Electron, ağ ve yapay zekâ güvenliği

### 12.1 Production origin

Production’da rastgele portlu HTTP sunucusu kullanılmaz. Tercih edilen çözüm, yalnız paketlenmiş `dist/**` içeriğini sunan ayrıcalıklı ve sabit `app://game` protokolüdür. Alternatif `loadFile` ancak asset routing ve CSP testleri tam geçerse kabul edilir.

Zorunlu ayarlar:

```text
contextIsolation: true
nodeIntegration: false
sandbox: true
webSecurity: true
```

- `dist` yoksa fail-closed; repo kökü/public fallback yok.
- `will-navigate` dış origin’i engeller.
- `setWindowOpenHandler` varsayılan `deny`.
- Kamera, mikrofon, konum ve bildirim permission request’leri varsayılan `deny`.
- CSP en az `default-src 'self'`; gereken directive’ler explicit.
- Wildcard CORS yok.
- Preload API’leri slot, dosya adı, boyut, achievement ID ve değer allowlist’iyle daraltılır.
- Steam AppID 480 production hedefi olamaz; Steam entegrasyonu gerçek yapılandırma yoksa capability olarak kapalıdır.

Güvenlik testleri `/%2e%2e/package.json`, `/../package.json`, `/package.json`, dış navigation, new-window, permission ve CSP ihlallerini içerir.

### 12.2 Paketleme

`npm run desktop` yayın artifact’i değildir. G6’da tanımlı `package:desktop` veya eşdeğeri, temiz Windows ortamında internet olmadan açılan imzalanabilir artifact üretmelidir. Hedef işletim sistemi/sürümü release checklist’te sabitlenir.

### 12.3 Runtime AI kararı

V1’de Gemini servisi, API key alanı ve serbest AI “Kadı hükmü” kaldırılır. Dilekçe sonucu:

1. Yerel şema doğrulaması
2. Deterministik `RuleEngine`
3. Onaylı sonuç ID’si
4. İçerik registry’sinden sabit, uzman onaylı metin

Ağ kapalı ve açıkken aynı karar, skor ve stat sonucu oluşmalıdır. İleride AI üslup varyantı araştırılırsa ayrı tasarım/onay ister; hiçbir zaman state sayısı veya dinî/hukukî hüküm üretmez.

Startup migration’ı eski `gemini_api_key` localStorage kaydını siler; secret save, log, URL query veya crash raporuna girmez.

---

## 13. Erişilebilirlik, i18n ve performans

### 13.1 Ortak modal standardı

G1’den itibaren her modal:

- klavyeyle açılır, gezilir, seçilir ve kapanır;
- `role="dialog"`, `aria-modal="true"`, erişilebilir ad taşır;
- focus trap, background inert ve kapanışta focus restoration uygular;
- görünür focus sağlar;
- kritik bildirimde doğru `aria-live` seviyesini kullanır;
- %200 zoom/reflow’da bilgi kaybettirmez;
- renk dışında ikon/metin/şekil işareti kullanır;
- `prefers-reduced-motion` ile kamera shake, hit-stop, parçacık ve UI animasyonunu azaltır.

Sesle iletilen ezan/vakit/anons içeriğinin metinsel karşılığı bulunur. Otomasyon: Playwright + axe; release’te en az bir manuel NVDA turu.

### 13.2 Türkçe-only i18n hazırlığı

- UI/system metinleri i18n key’idir; tarihî içerik Türkçe data olabilir.
- ID’ler ASCII ve görüntü metninden bağımsızdır.
- Unicode NFC validator vardır.
- Arapça ibare varsa uygun `lang="ar"` ve font glyph fallback testi gerekir.
- Save’e lokalize tarih string’i değil UTC/ordinal veri yazılır; gösterimde `Intl` kullanılır.
- Eksik key, `undefined`, `NaN` ve taşan uzun metin test edilir.

### 13.3 Referans performans bütçesi

İlk baseline G0’da, sonra her milestone’da production Electron build ile ölçülür.

Referans profil:

- Intel i5-8400 veya Ryzen 3 3100 sınıfı CPU
- 8 GB RAM
- GTX 1050 Ti 4 GB sınıfı GPU
- Windows 10/11, 1920×1080, Medium preset
- 60 sn warm-up, sabit seed ve sabit rota

Başlangıç bütçesi:

- median ≥ 60 FPS
- p95 frame time ≤ 20 ms
- p99 frame time ≤ 33 ms
- `>50 ms` hitch ≤ 2 / 10 dakika
- ilk açılış ≤ 15 sn; oyun içi sonradan yükleme ≤ 3 sn
- ölçüm sırasında memory sürekli yükselmez; sahne değişiminde disposable GPU kaynakları serbest kalır

Draw call, triangle, JS heap ve yaklaşık GPU texture bütçesi baseline’dan sonra G1 sonunda sabitlenir. Ana chunk boyutu tek başına performans kanıtı değildir.

---

## 14. Test ve CI sözleşmesi

### 14.1 Runner geçişi

Mevcut `tests/systems.test.js` silinmez ve ilk aşamada `test:legacy` olarak çalışır. Async çağrılar tek `await main()` veya gerçek runner altında tamamlanmadan özet üretmez. Her test bağımsız instance/fixture kullanır; global singleton sırasına güvenmez.

Yeni davranışlar:

- Unit/integration: **Vitest**
- Browser/Electron E2E ve a11y: **Playwright** (+ axe)
- İçerik: JSON Schema + özel semantic validator
- JS static check: ESLint + `tsc --noEmit --allowJs --checkJs`

Önerilen script sözleşmesi:

```json
{
  "scripts": {
    "lint": "eslint .",
    "check:js": "tsc --noEmit --allowJs --checkJs",
    "validate:content": "node scripts/validate-content.mjs",
    "test:legacy": "node tests/systems.test.js",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:save-compat": "vitest run tests/save-compat",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test --grep @a11y",
    "test:simulation": "vitest run tests/simulation",
    "test": "npm run test:legacy && npm run test:unit && npm run test:integration",
    "check": "npm run lint && npm run check:js && npm run validate:content && npm test && npm run test:save-compat && npm run build"
  }
}
```

Paket sürümleri lockfile’da sabitlenir; CI ve yerel ortam aynı Node 22 LTS minor çizgisini `.nvmrc`/`engines` ile kullanır. Mevcut Electron/Vite uyumu doğrulanmadan kör güncelleme yapılmaz.

### 14.2 Test matrisi

| Katman | Zorunlu kapsam | Sıklık | Kapı |
|---|---|---|---|
| Static | ESLint, checkJs, import/dead dependency | Her PR | 0 hata |
| Content | Schema, duplicate/kırık link, hash, review, yasak kombinasyon | Her PR | 0 invalid/unapproved published |
| Unit | Clock, Calendar, RNG, RuleEngine, EffectRunner, economy | Her PR | Tümü yeşil |
| Integration | GameState + quest + petition + campaign + reset | Her PR | Tümü yeşil ve sıra bağımsız |
| Save compat | legacy/current/future/corrupt, objective mapping | Her PR | Veri kaybı yok |
| Web E2E | başlat, görev, modal, save/reload, offline | Her PR | Chromium smoke yeşil |
| Electron E2E | process restart, IPC, security, stable origin | Nightly + release | Tümü yeşil |
| A11y | axe + keyboard/focus/reduced motion | Her PR + manuel release | Critical/serious 0 |
| Simulation | 50–100 seed, 178 gün ekonomi, düşük/yüksek sefer | Nightly | Invariant ihlali 0 |
| Performance | referans cihaz/build/seed/rota | Milestone + release | Bölüm 13 bütçesi |
| Security | secret scan, audit policy, traversal/CSP/navigation | Her PR | High/Critical 0 |
| Playtest | build hash + gözlem + öğrenme takibi | Faz sonu | Rapor ve aksiyonlar kapalı |

Yeni veya büyük ölçüde değişen domain modüllerinde başlangıç hedefi statement ≥ %90, branch ≥ %80’dir. Coverage hedefi, zayıf assertion yazma gerekçesi değildir. Legacy “97 assert azalmadı” yalnız geriye dönük sinyal olarak raporlanır.

### 14.3 Zorunlu davranış testleri

EffectRunner:

- Üç effect’in ikincisi başarısızsa hiçbiri uygulanmaz.
- Aynı transaction iki kez çalışırsa ödül/stat yalnız bir kez değişir.
- Yasak flag/path prototipi veya state’i değiştirmez.
- Bildirim hatası commit’i geri almaz.
- Save/load sonrası transaction yeniden uygulanmaz.

Determinism:

- Aynı seed + aynı command log = aynı canonical state hash.
- Farklı cosmetic seed gameplay hash’ini değiştirmez.
- Fake clock ile gün olayı tek kez tetiklenir.

Content:

- Duplicate ID, source’suz claim, locator’sız kaynak, `C/R + system_fact`, `SOLEMN + humor`, blessing + humor ve stale approval build’i kırar.
- Published dinî içerikte rol bazlı onay eksikliği build’i kırar.
- Mizah semantic inceleme listesi imzalanmadan paketleme olmaz.

E2E kritik yol:

- Yeni oyun → Su İhtilafı iki çözümden biri → akşam hesabı → save → process restart → gecikmeli sonuç.
- Savaş ortası save/restart.
- Klavye-only başlangıç, diyalog, seçim, defter ve çıkış.
- Ağ kapalıyken ana kampanya ve bütün kararlar çalışır.

### 14.4 CI

Her PR:

1. `npm ci` ve lockfile
2. `npm run check`
3. Playwright Chromium smoke + axe
4. Secret/license policy scan
5. Test, schema ve production build raporlarını artifact olarak saklama

Nightly: seed matrisi, uzun ekonomi, Electron E2E. Release: Windows artifact, offline clean-machine smoke, varlık manifesti, exact-build uzman onayları ve manuel a11y/playtest raporu.

---

## 15. Fazlar, iş paketleri ve kapılar

Eski F0–F5 iş kimlikleri kod bulma yardımı olarak korunabilir; yürütme sırası ve kabul kapısı aşağıdaki G0–G6’dır. Her iş, Bölüm 17 şablonuyla issue/PR’a dönüştürülür.

### G0 — Temel sözleşmeler ve güvenli taban (70–100 saat)

**Amaç:** Yeni içerik eklemeden test edilebilir, güvenli ve deterministik çalışma zemini.

İş paketleri:

- `G0-01` Repo/branch, dirty state, dependency ve gerçek build envanteri; baseline raporu
- `G0-02` Lisans/asset hash manifesti ve riskli geçmiş için ayrı operasyon kararı
- `G0-03` ESLint, checkJs, Vitest, Playwright, content validator ve CI iskeleti
- `G0-04` Legacy test async düzeltmesi, 28 blok envanteri, state isolation/factory
- `G0-05` Logger/error policy ve boş catch envanteri
- `G0-06` Clock/Calendar + RandomService ve deterministic snapshot testi
- `G0-07` Save schema, real legacy fixtures, migration ve Electron backend tasarımı
- `G0-08` Stable production origin, CSP/sandbox/navigation/permission sınırları
- `G0-09` Content/claim/source/review şemaları ve build audit’i
- `G0-10` Ortak modal/a11y shell ve performans overlay’i
- `G0-11` `main.js` quest dependency bug’ı ve ilk-saat P0’larının testle envanteri
- `G0-12` Tarih/din danışmanlarının isimli kapsam ve takvim randevuları

**Çıkış kapısı:** `npm run check` tanımlı ve yeşil; stable Electron origin/security testleri; aynı seed snapshot; legacy save fixture migration’ı; onaysız hassas content production bundle’da yok. Kod davranışı değiştiren P0 düzeltmeler ayrıca testlidir.

### G1 — 30–45 dakikalık bir günlük dikey kesit (100–140 saat)

**Amaç:** Ürünün bütün vaadini en erken noktada oynanabilir kanıtlamak.

İş paketleri:

- Üç katmanlı hedef HUD ve erişilebilir başlangıç
- Sabah divanı ve iki iş seçimi
- Su İhtilafı: inspect/compare/mediate, iki makul sonuç
- Saka/çarşıdan en çok iki güvenli mizah beat’i
- Bir tarih claim zinciri ve Kâtibin Defteri kartı
- Ritim penceresi, NPC mescide yönelişi, cezasız oyuncu tercihi
- Bir talim/bakım mikro döngüsü
- Akşam hesabı, auto save, process restart
- EffectRunner’ın dikey kesitte gerçek kullanımı
- n≥5 gözlemli playtest ve 24–48 saat öğrenme mini takibi

**Çıkış kapısı:** Kesit baştan sona placeholder console komutu olmadan oynanır; kritik E2E iki sonuç yolunda yeşil; process-restart save yeşil; a11y kritik/serious 0; uzman onaysız içerik yalnız DRAFT build’de; playtestte kritik takılma ve dinî/tarihî yanlış öğrenme 0.

G1 sonunda tüm kalan işlere üç noktalı tahmin yapılır ve toplam bant yeniden hesaplanır.

### G2 — İlk saat ve çekirdek sistemler (120–160 saat)

**Amaç:** İlk saatte görev, ekonomi, talim, supply, gündüz ritmi ve kayıt güvenini tamamlamak.

İş paketleri:

- İlk 3–4 çekirdek quest ve kalıcı objective ID’leri
- Petition `RuleEngine`; AI’sız deterministik karar
- Ekonomi giderleri, construction, supply ve invariant’lar
- Auto×2/chapter/manual save UI ve recovery
- HUD/minimap/marker/bildirim P0 düzeltmeleri
- İlk saat mizah/content pool’u ve seeded cooldown
- Accessibility keyboard/reduced-motion/subtitle seçenekleri
- Web + Electron first-hour E2E
- n=8–12 bütünleşik ilk-saat playtesti

**Çıkış kapısı:** İlk saat bloklayıcı bug yok; aynı seed ile iki koşu aynı gameplay snapshot’ı; ekonomi exploit’i ve duplicate effect yok; çıkış/kayıt her kapanışta erişilebilir; öğrenme ve ton raporu kabul edilmiş.

### G3 — Perde I–II ve dirlik derinliği (110–160 saat)

**Amaç:** Oyuncu kararlarının birkaç gün sonra geri dönmesi ve tarihî gündelik hayatın derinleşmesi.

İş paketleri:

- Çekirdek questlerin yaklaşık yarısı
- Gecikmeli consequence scheduler ve Vakayiname
- Ramazan dönemi toplumsal ritmi; oruç mekaniği yok
- Selçuklu mirası, Anadolu beylikleri, ahi/esnaf ve yaylak-kışlak kartları
- İnşaatların dünya mesh/state dönüşümü
- Perde sonu karne ve chapter save
- 50 seed ekonomi simülasyonu

**Çıkış kapısı:** En az 5 kararın gecikmeli sonucu save/restart sonrasında doğru; Perde I–II baştan sona; ilgili tüm content hash/onayları release-candidate build ile eşleşiyor.

### G4 — Perde III–IV ve Niğbolu (130–190 saat)

**Amaç:** Hazırlıkların beş safhalı muharebede okunur ve adil sonuç vermesi.

İş paketleri:

- Kalan 13 çekirdek quest ve açık ID listesi
- Rumeli yolu, çok dillilik ve yerleşim bağlamı
- Supply/cebelü/talim girdilerinin campaign safhalarına açık eşlemesi
- Beş safha, checkpoint/save/restore ve taktik UI
- Savaş ölümü/cenaze dilinin V2-09’a göre yeniden yazımı
- Niğbolu history claims ve dramatizasyon ayrımları
- Düşük/orta/yüksek hazırlık seed matrisi

**Çıkış kapısı:** 13 çekirdek ID’nin tamamı erişilebilir ve 4 expansion ID’si erişilemez; savaş her safhada save/restart; hazırlık kalemlerinin en az beşi ölçülebilir etki yapar; ölüm anında mizah ve sistemsel uhrevî hüküm yoktur.

### G5 — İçerik kapanışı, erişilebilirlik ve performans (100–150 saat)

**Amaç:** Taslakların yayın içeriğine dönüşmesi, tekrarların ve teknik borcun kapanması.

İş paketleri:

- Bütün Kâtibin Defteri/havadis/diyalog claim-source-review zinciri
- Exact-build tarih, fıkıh, itikad, hadis, editoryal ve ses onayları
- Mizah tekrar/bütçe/semantic incelemesi
- Türkçe dil editörü, Unicode/font/overflow kontrolleri
- Asset/audio lisans manifesti ve attribution
- Referans cihaz performans optimizasyonu
- Manual NVDA, keyboard-only, reduced-motion ve subtitle turu
- n≥5 tam kampanya playtesti + gecikmeli öğrenme takibi

**Çıkış kapısı:** Published içerikte eksik/stale onay 0; kritik yanlış öğrenme 0; performans bütçesi; a11y critical/serious 0; lisans durumu belirsiz asset 0.

### G6 — Yayın adayı ve bağımsız kabul (70–100 saat)

**Amaç:** Kaynak kodun değil, dağıtılacak birebir artifact’in kabulü.

İş paketleri:

- Paketleme, versioning, config ve gerçek Steam capability kararı
- Windows temiz makine offline smoke
- Save upgrade/downgrade güvenli hata ve recovery drill
- Full CI, nightly seed ve Electron security suite
- Exact artifact hash’ine uzman/audit manifest kilidi
- Bağımsız denetçi turu ve blocker düzeltmeleri
- Handoff/runbook/release notes

**Çıkış kapısı:** Bölüm 19’daki bütün DoD maddeleri; artifact hash’i ve audit hash’i eşleşiyor; High/Critical security ve lisans bulgusu 0; rollback/recovery provası tamam.

### 15.1 Toplam tahmin

| Faz | Saat |
|---|---:|
| G0 | 70–100 |
| G1 | 100–140 |
| G2 | 120–160 |
| G3 | 110–160 |
| G4 | 130–190 |
| G5 | 100–150 |
| G6 | 70–100 |
| **Toplam** | **700–1000** |

Solo geliştirici için 30–35 üretken saat/hafta ve dış inceleme beklemeleriyle **22–32 takvim haftası** planlanır. Bu söz değil, risk bandıdır. G1 verileriyle yeniden tahmin zorunludur. Tarih/din danışmanı, özgün ses ve lisans bekleme süreleri paralel başlatılır ve kritik yol olarak raporlanır.

---

## 16. Playtest ve ölçüm planı

### 16.1 Örneklem kapıları

- Mevcut baseline: n≥5, ilk 30 dakika
- G1 dikey kesit: n≥5 + 24–48 saat takip
- G2 ilk saat: n=8–12, hedef kitleye yakın
- G3/G4 perde testleri: her perde n≥5
- G5 tam kampanya: n≥5 + gecikmeli öğrenme

Aynı kişi aynı build’i “yeni oyuncu” olarak ikinci kez temsil edemez. Ekip üyesi bulgu sağlar ama hedef kullanıcı metriğine dahil edilmez.

### 16.2 Gözlem alanları

Her oturumda build hash, seed, cihaz ve şu olaylar kaydedilir:

- İlk bağımsız hareket/etkileşim zamanı
- “Şimdi ne yapacağım?” diye sorma veya 30 sn amaçsız kalma
- Görev başına yanlış rota/geri dönüş
- Mizah beat’i: fark etti / gülümsedi / rahatsız oldu / anlamadı
- Bilgi kartını açma ve kararda kullanma
- Modal klavye/focus sorunu
- Gönüllü kapanış noktası ve devam etme nedeni
- Kritik yanlış öğrenme veya dinî otorite sanma
- Save’e güven ve yeniden açılış sonucu

Oturum uzunluğu optimize edilmez. “Devam ettim çünkü merak ettim” olumlu; “kaydetmeyi bulamadım/ödülü kaçıracaktım” blocker’dır.

### 16.3 Denge kararları

Bir metrik tek başına içerik ekleme emri vermez. Öncelik:

1. Güvenlik, saygı, doğruluk
2. Bloklayıcı anlaşılabilirlik
3. Kontrol ve erişilebilirlik
4. Akış ve tekrar
5. Görsel/işitsel süs

---

## 17. Her iş kalemi için zorunlu devir şablonu

Her issue/PR aşağıdaki alanları doldurur. “Dokümana göre yap” tek başına kabul edilmez.

```text
İş ID / Başlık:
Amaç ve kullanıcı davranışı:
Kapsam içi / kapsam dışı:
Etkilenen dosya ve symbol’ler:
Önkoşullar / bağımlılıklar:
Veri şeması ve migration etkisi:
Content/claim/review ID’leri:
Security/privacy etkisi:
Accessibility gereksinimi:
Performance bütçesi:

Uygulama adımları:
1. Önce kırmızı test / yeniden üretim
2. En küçük davranış değişimi
3. Negative ve sınır durumları
4. Save/load ve deterministic test

Kabul senaryoları (Given/When/Then):
- Normal yol
- En az iki olumsuz/sınır yolu
- Reload/process restart gerekiyorsa
- Keyboard/reduced-motion gerekiyorsa
- Offline davranış gerekiyorsa

Çalıştırılacak komutlar:
Kanıt: test raporu, ekran kaydı/screenshot, content audit hash
Rollback/recovery:
Bilinen risk ve takip işi:
```

PR açıklaması test çıktısını kopyalamak yerine komut, exit code, rapor artifact’i ve gözlenen davranışı bağlar. Her değişen satır iş kapsamına veya doğrulamaya izlenebilir olmalıdır.

---

## 18. Definition of Ready

Bir iş geliştirmeye alınmadan önce:

- [ ] Kalıcı iş ID’si ve tek sorumlusu var.
- [ ] Kullanıcı davranışı ve kapsam dışı açık.
- [ ] Dosya/symbol etkisi mevcut koddan doğrulandı; satır numarasına kör güvenilmiyor.
- [ ] Veri ID’leri, schema ve save/migration etkisi tanımlı.
- [ ] Tarihî/dinî claim varsa source ve gerekli review rolleri tanımlı.
- [ ] Lisans gerektiren asset/audio için edinim yolu açık.
- [ ] En az normal + negative + restart/offline/a11y gereken testler yazılı.
- [ ] Kabul kanıtının ne olacağı belli.
- [ ] Bağımlılıklar hazır; placeholder production’a sızmayacak biçimde flag’li.

Eksikse iş “in progress” değil `blocked-ready` durumundadır; geliştirici boşluğu tahminle doldurmaz.

---

## 19. Definition of Done

Bir iş/faz yalnız aşağıdakiler sağlandığında tamamdır:

- **D1 Davranış:** Kullanıcıya dönük kabul senaryoları gerçek build’de geçer.
- **D2 Test:** İlgili static, unit, integration, E2E ve negative testler yeşildir.
- **D3 İzolasyon:** Test sırası veya başka singleton state’i sonucu değiştirmez.
- **D4 Determinizm:** Aynı seed + command log aynı canonical hash’i üretir.
- **D5 Effects:** Şema valid, atomik ve exactly-once.
- **D6 Save:** Legacy/current fixture, process restart ve recovery geçer.
- **D7 Security:** Electron traversal/navigation/CSP/permission ve secret scan yeşil.
- **D8 Accessibility:** Keyboard smoke ve axe critical/serious 0; ilgili manuel kontrol yapılmış.
- **D9 Content:** Gerekli claim/source/review hash’leri exact build ile eşleşir.
- **D10 Mizah/ton:** Semantic inceleme ve bütçe/cooldown testleri geçer.
- **D11 Hata görünürlüğü:** Beklenmeyen boş catch yok; testte logger error 0.
- **D12 Performance:** İlgili milestone bütçesinde regresyon yok.
- **D13 Lisans:** Kullanılan her asset/audio manifestte ve yayın hakkı açık.
- **D14 Offline:** Ana oyun dış servissiz çalışır; ağ yokluğu ceza veya veri kaybı üretmez.
- **D15 Artifact:** Hedef platform paketi temiz makinede açılır.
- **D16 Doküman:** Decision, schema, migration, runbook ve değişen kabul maddeleri güncel.
- **D17 Review:** Bağımsız denetçi blocker’ı yoktur; non-blocking notlar ayrı kaydedilir.

“Kod yazıldı”, “97 assert geçiyor” veya “danışman baktı” tek başına Done değildir.

---

## 20. Risk kaydı ve azaltımlar

| Risk | Olasılık / Etki | Erken işaret | Azaltım / sahibi |
|---|---|---|---|
| Sistemler ayrı ayrı iyi, oyun akmıyor | Yüksek/Yüksek | G1 öncesi birleşik build yok | G1 dikey kesit; ürün sahibi + gameplay dev |
| Dinî yanlış/otorite izlenimi | Orta/Çok yüksek | Kaynaksız metin, tek reviewer | Claim pipeline + rol bazlı exact-build onay |
| Tarihî kesinlik yanılsaması | Yüksek/Yüksek | C/R system fact gibi yazılmış | Görünür status + kaynak locator + tarihçi |
| Kayıt kaybı | Yüksek/Çok yüksek | Rastgele origin, async test | Electron userData backend + process E2E |
| AI determinism/mahremiyet | Yüksek/Yüksek | API key/localStorage, serbest hüküm | V1 runtime AI kaldırma |
| Mizah saygı sınırını aşıyor | Orta/Yüksek | Kutsal kavram punchline | Semantic review + forbidden combination validator |
| Tekrar ve tempo yorgunluğu | Yüksek/Orta | Aynı bark, zorunlu modal | Seeded pool, global cooldown, etik flow |
| Erişilebilirlik sonradan pahalı | Yüksek/Yüksek | Her modal farklı | G0/G1 ortak modal standardı |
| Tahmin taşması | Yüksek/Yüksek | G1 velocity < plan | G1 re-estimate, scope cut order |
| Lisans belirsizliği | Orta/Çok yüksek | Kaynak/kanıt yok | G0 hash manifest, belirsiz asset production dışı |
| Performance geç fark edilir | Orta/Yüksek | F5’e kadar ölçüm yok | G0 overlay, milestone benchmark |
| Expansion ana kampanyayı sızdırır | Orta/Orta | 17 quest registry/test | Explicit 13 ID allowlist + frozen module |

Kapsam kesme sırası: kozmetik varyantlar → düşük öncelikli çevre vignette’leri → ek başarım/Steam Rich Presence → genişleme köprüleri. Doğruluk, kayıt, güvenlik, erişilebilirlik, çekirdek 13 görev ve uzman onayı kesilmez.

---

## 21. Devir ve kabul paketi

Geliştirici her milestone’da şunları teslim eder:

- Git branch/commit listesi ve iş ID eşlemesi
- `npm run check`, E2E, a11y, simulation ve benchmark raporları
- Build hash, seed ve test cihazı
- Save schema/migration fixture’ları
- Content, claim, source ve review audit raporu
- Asset/audio lisans manifesti
- Açık decision/risk listesi
- Bilinen blocker/non-blocker ayrımı
- Sonraki ilk iş ve bağımlılıkları

Bağımsız denetçi doküman satırı değil gözlenebilir davranış ve artifact üzerinden kabul yapar. Tarih/din onayının doğruluğunu geliştirici kendi testleriyle ikame edemez.

---

## 22. Başlangıç kaynak kayıtları

Bu liste nihai kaynakça değil, `SourceRecord` registry’sinin başlangıç çekirdeğidir. Her kullanım exact claim ve locator’a bağlanmalıdır.

### Dinî yöntem ve kavramlar

- TDV İslâm Ansiklopedisi, “Ehl-i Sünnet”: <https://islamansiklopedisi.org.tr/ehl-i-sunnet>
- Din İşleri Yüksek Kurulu, fetva yöntemi: <https://kurul.diyanet.gov.tr/tr/kurumsal/fetva-yontemi>
- DİYK, zekât hesabında şartlar: <https://kurul.diyanet.gov.tr/tr/fetva/maas-ve-ucret-gibi-gelirlerin-zekati-nasil-hesaplanir-ve-ne-zaman-verilir/019b7485-db53-7b9e-969c-c981d3fb6081>
- DİYK, öşür: <https://kurul.diyanet.gov.tr/tr/fetva/osur-ne-anlama-gelir-dini-dayanagi-nedir/0193c42d-6704-7d02-aa8a-426c841a6c5e>
- TDV İslâm Ansiklopedisi, “Öşür”: <https://islamansiklopedisi.org.tr/osur>
- TDV İslâm Ansiklopedisi, “Şehid”: <https://islamansiklopedisi.org.tr/sehid>
- Diyanet, Hadislerle İslâm yöntem/önsöz: <https://hadislerleislam.diyanet.gov.tr/onsoz.php>
- DİYK, kamerî ay başlangıçlarının tespiti: <https://kurul.diyanet.gov.tr/tr/faaliyetler/2020-2025/ibadet-vakitleri-dini-gun-ve-gecelerin-tespiti/kameri-hicri-ay-baslarinin-tespiti>

### Tarih ve araştırma altyapısı

- TDV İslâm Ansiklopedisi, “Gaza”: <https://islamansiklopedisi.org.tr/gaza>
- TDV İslâm Ansiklopedisi, “Tımar”: <https://islamansiklopedisi.org.tr/timar>
- TDV İslâm Ansiklopedisi, “Niğbolu Savaşı”: <https://islamansiklopedisi.org.tr/nigbolu-savasi>
- İSAM veri tabanları: <https://www.isam.org.tr/kutuphane/veri-tabanlari-hakkinda>
- Türk Tarih Kurumu Kütüphanesi: <https://ttk.gov.tr/kutuphane/>

Kaynakların kurumsal olması her tekil yorumun otomatik doğru veya oyuna uygun olduğu anlamına gelmez; exact claim, bağlam ve uzman kararı yine zorunludur.

---

## 23. Devralan geliştiricinin ilk 10 iş günü

Geliştirici soru sormadan şu sırayla başlar; davranış geliştirmesi G0 kapısından önce yapılmaz:

1. Gün 1: branch/worktree, clean status, Node/npm/Electron envanteri, mevcut test/build kanıtı.
2. Gün 1–2: 28 legacy test bloğu ve singleton/async risk matrisi; gerçek legacy save fixture’larını salt okunur kopyalama.
3. Gün 2–3: Vitest/ESLint/checkJs/content validator ve CI smoke.
4. Gün 3–4: Clock/RNG service arayüzü ve aynı-seed kırmızı testi.
5. Gün 4–5: Save schema/migration fixture testleri; Electron stable origin tasarımını spike ile doğrulama.
6. Gün 5–6: Electron CSP/sandbox/navigation/permission ve process-restart E2E.
7. Gün 6–7: Content/claim/source/review scheması, hash validator ve DRAFT exclusion.
8. Gün 7–8: Ortak modal/a11y shell ve perf baseline.
9. Gün 8–9: `main.js` quest bug’ı ile ilk-saat P0’larına davranış testleri.
10. Gün 10: G0 audit; başarısız kapıları kapatma; G1 işlerini gerçek velocity ile yeniden tahmin.

Bu sırada tarih/din uzmanlarına politika paketi ve claim taslakları gönderilir; yanıt beklerken yalnız onaysız altyapı ve DRAFT prototip ilerletilir.

