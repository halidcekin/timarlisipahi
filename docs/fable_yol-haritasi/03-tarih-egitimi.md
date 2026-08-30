# 03 — Tarih Eğitimi Tasarımı: "Oynarken Fark Etmeden Öğrenme"

> **Bu doküman ne için:** "Mülk-i Osmanî: Tımarlı Sipahi 3D" oyununa, işverenin talebi olan "oynarken Osmanlı ve Türk tarihini öğrenecekleri" katmanı ekleyecek geliştiricinin **soru sormadan uygulayabileceği** tam içerik ve tasarım şartnamesidir. Öğretim felsefesini, oyun içi ansiklopedi ("Menâkıbnâme" kodeksi) tasarımını ve ilk 40 maddenin kes-yapıştır kalitesinde tam metinlerini, 1396 kampanya takviminin oyun içine damla damla verilecek havadis akışını, mevcut içeriğin tarihsel doğruluk denetimini, çevresel anlatı metinlerini (9 mezar kitabesi, Koca Dede'nin 3 yeni anısı, imamın 5 havadis varyantı) ve geliştiricinin yeni tarihi içerik eklerken uyacağı kaynak/doğruluk protokolünü içerir. `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` (bundan sonra: **TARIHSEL doc**) ile çelişmez, onun 4.2 (A/B/C/R etiketi), 5 (1396 kampanyası), 11 (dil), 15 (ton/temsil) ve 16 (kaynaklar) bölümlerinin üzerine inşa eder. İslami içeriğin kendisi ayrı dokümandadır (**bkz. 04-islami-icerik**); bu doküman yalnız çakışma noktalarında kısa geçer.

**Sabit kararlar (tartışmasız):** Kampanya 1396 ilkbaharı → 25 Eylül 1396 Niğbolu. Tarihsellik etiketi A/B/C/R. Din adamları, ibadet ve dinî değerler asla mizah nesnesi olmaz (TARIHSEL doc 18.1). Mevcut mimari korunur; cerrahi değişiklik, aşamalı teslim. Dokümanlar Türkçe, kod/commit İngilizce.

**Teknik plana bağımlılık notu:** Bu dokümandaki içerik dağıtım kanallarından ikisi şu anda kırık: (1) bildirim akışı her karede yeniden kurulduğu için fiilen görünmez (`src/ui/UIManager.js:1249-1260`), (2) yıl-bazlı `checkHistoricalEvents()` sıralama hatası yüzünden hiç çalışmıyor (`src/core/GameState.js:263-268`: önce `year++`, sonra `year === 1396` kontrolü) — 06-fazlar-ve-kabul.md kararı gereği bu fonksiyon DÜZELTİLMEZ, nötrleştirilir (devre dışı bırakılır/kaldırılır) ve tarih olaylarının tek dağıtım mekanizması bu dokümandaki gün-bazlı havadis akışı (Bölüm 3) olur. Bildirim düzeltmesi ve nötrleştirme teknik planın/faz planının işidir; bu dokümandaki kabul kriterleri "bu işler yapılmış" varsayımıyla yazılmıştır ve yapılmadan bu içerik teslim edilmiş sayılmaz.

---

## 1. ÖĞRETİM FELSEFESİ

### 1.1 Diegetik öğrenme: ders anlatma yok, dünyanın içinde yaşama

Oyuncu hiçbir zaman "şimdi tarih öğreneceksin" hissine kapılmamalıdır. Bilgi her zaman **birinin derdi, işi veya hatırası** olarak gelir:

| İlke | Tanım | Oyundaki karşılığı (mevcut/eklenecek) |
|---|---|---|
| **D1 — Bilgi bir karakterin yükü** | Kavram, öğretmen ağzıyla değil; o kavramla yaşayan birinin ağzıyla verilir. | Öşürü kethüda defter derdiyle anlatır (`src/systems/DialogueSystem.js:16-105`), cebelüyü Ali korkusuyla anlatır (`cebelu_talk`). |
| **D2 — Önce yaşa, sonra oku** | Mekanik önce oynanır; ansiklopedik açıklama (kodeks) ancak yaşandıktan sonra açılır. | Vergi tahsil edilir (`src/systems/TimarSystem.js:10-30`) → "Öşür" kodeks maddesi o an açılır. Kodeks maddesi asla mekanikten önce açılmaz. |
| **D3 — Anlatıcı tarafsız, kesinlik etikete göre** | Sistem anlatıcısı (bildirim, kodeks) yalnız A-etiketli bilgiyi kesin dille verir; R-etiketli bilgi hep "derler ki / rivayet olunur" kalıbıyla verilir (TARIHSEL doc 15 "Sistem anlatıcısı tarafsız ve açık olmalı" kuralı). | Kodeks madde şablonundaki etiket rozeti + metin içi kalıplar (bkz. 2.5). |
| **D4 — Mizah bilgiye bitişik ama dünyevidir** | Bir tarih dersi anını bir esnaf/asker esprisi izleyebilir; espri bilgiyi taşır, bilgiyi sulandırmaz. Din adamı, ibadet, mezarlık ve şehitlik bağlamında mizah **yasak** (TARIHSEL doc 18.1). | Hamam/han/nöbetçi diyalogları mizah taşıyıcısıdır; imam, Koca Dede'nin vasiyeti ve hazire ciddi kalır. |
| **D5 — Belirsizlik de ders** | Kaynak ihtilafı saklanmaz; oyunun kendisi "tarih bazen susar" dersini verir. | Sırpsındığı anısında Dede'nin "kimi kâtipler bu cengi karıştırır" demesi (bkz. 5.2), okunamayan 9. mezar taşı (bkz. 5.1), esir infazlarının kodekste kaynak ihtilafıyla verilmesi (K-40). |

### 1.2 Bilgi yoğunluğu kuralı: dakikada en fazla 1 yeni kavram

"Yeni kavram" = oyuncunun o oturumda ilk kez karşılaştığı, günlük Türkçede yaygın olmayan tarihsel terim (tımar, öşür, cebelü, dizdar...). Kural operasyonel hale getirilmiştir; denetçi şunları sayarak kontrol eder:

1. **Diyalog düğümü başına en fazla 2 yeni terim.** Bir diyalog metninde 3+ yeni terim varsa metin bölünür veya terim ertelenir.
2. **İlk geçiş kuralı:** Her yeni terim ilk geçtiği cümlede, kısa bağlam içi açıklamayla gelir (ör. *"bir cebelü — yani sefere benimle gelecek zırhlı bir asker — donatmam gerek"*). İkinci geçişten itibaren çıplak kullanılır.
3. **Kodeks açılış kuyruğu:** Aynı anda en fazla 1 kodeks açılış bildirimi gösterilir; aynı diyalog/olay birden çok madde açarsa fazlası kuyruğa alınıp 30 sn arayla duyurulur (bkz. 2.4).
4. **İlk 10 dakika bütçesi:** Oyun başlangıcından `quest_inspect` tamamlanana kadar toplam yeni terim ≤ 8. Mevcut açılış zaten şunları harcar: *tımar, sipahi, sancak, kethüda, öşür, reaya, cebelü, akçe* → bütçe dolu; bu pencereye **yeni terim eklenmez**.
5. **Havadis bütçesi:** Bir havadis metni (bkz. Bölüm 3) en fazla 1 yeni özel isim + 1 yeni kavram taşır.

**Kabul kriteri (B1):** `quest_inspect` tamamlanana kadarki tüm zorunlu metinlerde (karşılama bildirimi `src/main.js:123`, `kethuda_talk` tamamı, HUD etiketleri) geçen benzersiz tarihsel terim sayısı ≤ 8; her diyalog düğümünde yeni terim ≤ 2. Denetçi metinleri okuyarak sayar.

### 1.3 Tekrar-pekiştirme döngüsü: "Üç Temas Kuralı"

Her öğretilecek kavram üç ayrı kanaldan, üç ayrı zamanda dokunulmadan "öğretildi" sayılmaz:

- **T1 — Duy:** Kavram bir diyalog/havadis içinde, bir insanın derdi olarak geçer.
- **T2 — Yap/Gör:** Kavram bir mekanikte veya sahnede oyuncunun eliyle/gözüyle yaşanır.
- **T3 — Oku:** Kodeks maddesi açılır; oyuncu isterse 4-6 cümlelik derli toplu bilgiyi okur.
- **T4 (isteğe bağlı pekiştirme) — Yeniden duy:** Kavram başka bir karakterin ağzından, farklı bağlamda tekrar geçer.

Zorunlu ilk 20 kavramın T1-T3 haritası (denetçi bu tabloyu satır satır doğrular):

| Kavram | T1 (Duy) | T2 (Yap/Gör) | T3 (Kodeks) |
|---|---|---|---|
| Tımar | Karşılama bildirimi (`src/main.js:123`) | TAB Tımar Defteri (`src/ui/UIManager.js:447`) | K-01 (otomatik) |
| Berat | `kethuda_talk` açılışı | Başlangıç ekranı tımar dökümü (`src/ui/UIManager.js:367-376`) | K-03 |
| Öşür | Kethüda defter dalı (`DialogueSystem.js:24-105`) | `TimarSystem.collectAnnualTax` (`src/systems/TimarSystem.js:10-30`) | K-04 |
| Çift resmi | Tımar Defteri gelir satırı (`src/ui/UIManager.js:553-585`) | Aynı ekrandaki gelir dökümü | K-05 |
| Reaya | Çiftçi diyaloğu (`farmer_talk`) | Köylü rutinleri (`src/entities/VillagerAI.js:85-119`) | K-07 |
| Kethüda | `kethuda_talk` | Sabah raporu havadisleri (Bölüm 3) | K-08 |
| Cebelü | `cebelu_talk` | `TimarSystem.trainCebelu` (`TimarSystem.js:49-55`) | K-14 |
| Çiftbozan | Reaya güveni ilk kez 40 altına düşünce uyarı | Fail-state (`src/core/GameState.js:190-197`) | K-06 |
| Kadı | İmamın şer'i/örfi dalı (`DialogueSystem.js:166` civarı) | Arzuhal reddi akışı (Gemini kadı bağlanınca) | K-09 |
| Arzuhal | İlk arzuhal bildirimi (`src/systems/PetitionSystem.js:66-73`) | TAB'dan kabul/ret | K-10 |
| Ahilik | `demirci_talk` "Ahi Evran ocağı" repliği (`DialogueSystem.js:180+`) | Demirci tamir/gürz mekaniği | K-22 |
| Gaza | Koca Dede vasiyeti (`DialogueSystem.js:334`) | Sefer katılımı | K-23 (kısa; bkz. 04-islami-icerik) |
| Akıncı | Dede'nin yeni anıları (bkz. 5.2) | Niğbolu 1. safha (öncü/akıncı rolü) | K-15 |
| Yoklama | `dizdar_talk` | quest_castle teftişi | K-16 |
| Dizdar | `dizdar_talk` açılışı | Kale ziyareti | K-17 |
| Kazık hattı | Havadis H-11 / kamp gecesi | Niğbolu 2. safha (`src/systems/CampaignBattleSystem.js:55-66`) | K-21 |
| Haçlı ordusu bileşimi | İmam havadis V2 (bkz. 5.3) | Niğbolu safha düşman adları | K-38 |
| Sancak | `dizdar_talk` + harita "RUMELİ BEYLERBEYLİĞİ" (`UIManager.js:747-750`) | M haritası | K-12 |
| Esir fidyesi | Zafer sonrası havadis H-13 | Sefer sonuç ekranı | K-40 |
| Zimmî | Tımar Defteri "Müslüman & Zimmî hane" satırı (`UIManager.js:554`) | Su ihtilafı görevi (`water_dispute_talk` bağlanınca) | K-11 |

**Kabul kriteri (B2):** Yukarıdaki 20 satırın her biri oyunda fiilen üç temasla var; denetçi her satır için T1'i okur, T2'yi oynar, T3'ün o anda (veya kuyruk gecikmesiyle) açıldığını görür.

---

## 2. KODEKS TASARIMI: "MENÂKIBNÂME"

### 2.1 İsim ve oyun içi çerçeveleme

Oyun içi ansiklopedinin adı **"Menâkıbnâme"** dir (dönem türü: menkıbe/hatıra defteri). Kurgusal çerçeve: sipahinin kâtibine tutturduğu, gördüğü-duyduğu her şeyi kaydettiği defter. Bu çerçeve iki iş görür: (1) maddelerin "oyuncu keşfettikçe açılması" dünyada gerekçelenir (defter yazıldıkça dolar), (2) A/B/C/R etiketi diegetik dille sunulabilir ("kâtip der ki: bu kısmı ulaklardan duydum, sıhhatini bilmem" = R).

### 2.2 Veri modeli (yeni dosya: `src/data/CodexData.js`)

```js
// src/data/CodexData.js — tamamen veri, mantık yok
export const CODEX_ENTRIES = [
  {
    id: 'timar',                    // benzersiz, snake_case
    category: 'dirlik',             // 'dirlik' | 'asker' | 'cemiyet' | 'vakayi'
    title: 'Tımar',
    tag: 'A',                       // 'A' | 'B' | 'C' | 'R'
    unlock: { type: 'auto' },       // auto | quest:<id> | dialogue:<id> | event:<id> | discover:<id>
    gameText: '…',                  // "Defterde" paragrafı (oyun bağlamı, 2-3 cümle)
    historyText: '…',               // "Tarihte" paragrafı (gerçek tarih, 2-3 cümle)
    related: ['dirlik', 'berat']    // çapraz bağlantı (detay panelinde link)
  },
  // … 40 madde (bkz. 2.6)
];
```

Yeni sistem: `src/systems/CodexSystem.js` — singleton, mevcut `export const x = new X()` kalıbıyla (`src/systems/QuestSystem.js` sonundaki kalıp örnek alınır):

- `unlock(id)`: idempotent; ilk açılışta `gameState.addNotification('📜 Menâkıbnâme\'ye yeni varak düştü: Tımar — [K] ile oku', 'tarih')` (yeni bildirim tipi `'tarih'`; `src/core/GameState.js:200` `addNotification` type parametresi zaten var, `src/style.css:467-469` bildirim tip renklerine `tarih` eklenir).
- Bildirim kuyruğu: aynı anda en fazla 1 kodeks duyurusu; fazlası 30 sn arayla (bkz. 1.2 kural 3). Kuyruk `CodexSystem.update(delta)` içinde işler; `src/main.js` ana döngüsüne `codexSystem.update(delta)` eklenir (`petitionSystem.update` çağrısının yanına, `src/main.js:303`).
- `serialize()/deserialize()`: açılan madde id listesi; SaveManager bağlandığında (`src/core/SaveManager.js:41-57` `serializeState` genişletmesi — teknik plan işi) kayda girer.
- Unlock çağrıları içerik noktalarına tek satır olarak eklenir (tam liste 2.6'daki her maddenin "Açılış" satırında).

### 2.3 UI taslağı (mevcut parşömen temasıyla)

- **Giriş:** `K` tuşu. `src/core/InputManager.js:35-56` keydown switch'ine `KeyK` → `onToggleCodex` callback eklenir; `src/main.js:184-196` köprüsünde `ui.toggleCodexModal()`'a bağlanır. (Not: InputManager'ın modal-durumu farkındalığı yok — bilinen borç, teknik plan; kodeks de diğer modallarla aynı davranışı sergiler, daha kötüsünü değil.)
- **Modal iskeleti:** `index.html`'e mevcut `modal-backdrop` kalıbıyla (görev defteri örneği: `index.html:224`) `#codex-modal` eklenir. Başlık: `📜 MENÂKIBNÂME — Kâtibin Defteri`. Mevcut tema fontları kullanılır (Cinzel başlık, Amiri gövde; `index.html:7-9`).
- **Sol sütun:** 4 kategori sekmesi (Dirlik ve İdare / Askerlik / Cemiyet ve Gündelik Hayat / Vakāyi ve Şahıslar) + madde listesi. Açılmamış madde listede `— ???` olarak soluk görünür (başlığı da gizli; spoiler önleme — görev defterindeki başlık-spoiler hatasının tekrarı yasak, krş. `src/ui/UIManager.js:485-500` eleştirisi).
- **Sağ panel (madde detayı):**
  1. Başlık + **etiket rozeti** (A: altın çerçeve "Belgeli", B: yeşil "Kuvvetli Yorum", C: gri "Oyun Kurgusu", R: turuncu "Rivayet"). Rozetin üstüne gelince tek cümlelik açıklama (`title` attribute yeterli): örn. R → "Dönem anlatısında geçer, doğruluğu tartışmalıdır."
  2. **"Defterde"** paragrafı (`gameText`) — oyuncunun yaşadığı bağlam.
  3. **"Tarihte"** paragrafı (`historyText`) — gerçek tarih.
  4. `related` bağlantıları (tıklanınca o maddeye geçer; yalnız açılmış maddeler tıklanabilir).
- **CSS:** JS'in ürettiği her sınıf için CSS yazılması ZORUNLU şart olarak kabul kriterine girer (görev defterindeki "JS sınıf üretiyor, CSS yok" hatasının tekrarı yasak — krş. `src/ui/UIManager.js:486-549` vs `src/style.css:707-719`).

**Kabul kriteri (C1):** K tuşu kodeksi açıp kapatır; 4 kategori sekmesi çalışır; açılmamış maddeler `???`; açılmış maddede başlık+rozet+iki paragraf+ilgili bağlantılar görünür ve tümü stillidir (tarayıcı DevTools'ta stilsiz düz metin yok).

### 2.4 Madde açılma kuralları

| Unlock tipi | Tetikleme noktası | Örnek |
|---|---|---|
| `auto` | Oyun başlangıcında `CodexSystem` kurulurken | K-01 Tımar, K-13 Sipahi, K-03 Berat |
| `quest:<id>` | `QuestSystem.completeQuest` içine tek satır: `codexSystem.unlockForQuest(questId)` (`src/systems/QuestSystem.js:485-511`) | quest_castle → K-16 Yoklama, K-17 Dizdar |
| `dialogue:<node>` | İlgili diyalog düğümünün `action()`/`onOpen` içine tek satır (`src/systems/DialogueSystem.js`) | `dede_talk` Kosova dalı → K-33, K-34 |
| `event:<id>` | Havadis sistemi bir haberi yayınlarken (Bölüm 3, `HISTORICAL_NEWS[i].codexUnlocks`) | H-6 Vidin haberi → K-38 |
| `discover:<id>` | Dünya etkileşimi (mezar taşı okuma, bkz. 5.1) | İlk kitabe → K-27 Hazire |

Kurallar: (1) Bir tetikleyici birden çok madde açabilir ama duyuru kuyruğu tek tek işler. (2) Hiçbir madde, bağlı olduğu mekanik/diyalog yaşanmadan açılmaz (D2 ilkesi). (3) `battle` safha vinyetleri gösterildiğinde ilgili maddeler otomatik açılır (K-21, K-38, K-39, K-40).

**Kabul kriteri (C2):** Yeni oyunda kodeks 4-5 maddeyle başlar (`auto` olanlar); `kethuda_talk` sonrası K-04/K-08 açılır; sefer bitince K-37/K-40 açılır. `tests/systems.test.js`'e eklenmesi zorunlu veri bütünlüğü testi: 40 madde, benzersiz id, `tag ∈ {A,B,C,R}`, her maddede `gameText` ve `historyText` dolu, zorunlu 20 id mevcut (bkz. 7. bölüm test listesi).

### 2.5 Madde şablonu ve dil kuralları

- **Başlık:** Oyunda geçen biçim (tekil, Türkçe).
- **Etiket:** Maddenin ANA iddiasına göre (madde içinde farklı düzeyde bir ayrıntı varsa metin içinde "rivayet olunur ki" kalıbıyla ayrılır).
- **"Defterde" (gameText):** 2-3 cümle; oyuncunun yaşadığı bağlama bağlanır; birinci elden kâtip ağzı serbesttir.
- **"Tarihte" (historyText):** 2-3 cümle; modern, tarafsız ders kitabı dili; abartısız; sayı verilecekse aralık ve ihtilaf belirtilir.
- R-etiketli maddede historyText **"…diye anlatılır / kaynaklarda tartışmalıdır"** kalıbı zorunlu.
- Dinî kavram maddeleri (K-23 Gaza, K-28 Vakıf, K-29 Hicri Takvim) kısa tutulur ve sonunda `bkz. Menâkıbnâme'nin "İlmihal" faslı` yönlendirmesi bulunur — o fasıl 04-islami-icerik dokümanının işidir; bu dokümanda tanımlanmaz.

### 2.6 İLK 40 MADDE — TAM METİNLER (kes-yapıştır)

Aşağıdaki metinler `CodexData.js`'e olduğu gibi girilir. Format: **K-No · Başlık — [Etiket]** / Açılış / Defterde / Tarihte.

#### KATEGORİ 1: DİRLİK VE İDARE (12 madde)

**K-01 · Tımar — [A]**
Açılış: `auto` (oyun başlangıcı).
Defterde: "Beyim bu köyün sahibi değildir; Devlet-i Aliyye'nin ona emanet ettiği gelirin bekçisidir. Köyün öşrünü toplar, karşılığında atıyla, pusatıyla ve cebelüsüyle sefere koşar. Emaneti kötü tutanın beratı elinden alınır."
Tarihte: Tımar, Osmanlı Devleti'nin belirli bir bölgenin vergi gelirini, savaşta atlı asker (sipahi) hizmeti karşılığında bir kişiye tahsis etmesidir. Sipahi toprağın mülk sahibi değil, gelirin görevli tasarrufçusudur; hizmet aksarsa tımar geri alınır. Bu sistem Osmanlı taşra idaresinin ve ordusunun asıl omurgasıydı.
`related: ['dirlik','berat','sipahi']`

**K-02 · Dirlik — [A]**
Açılış: `dialogue:` Tımar Defteri'nin ilk açılışı (`src/ui/UIManager.js:447` toggleTimarModal ilk çağrısına tek satır).
Defterde: "Kâtipler, devletin hizmet karşılığı dağıttığı her geçimliğe 'dirlik' der. Beyimin tımarı da bir dirliktir; küçüğü tımar, büyüğü zeamet, en büyüğü has diye anılır."
Tarihte: Dirlik, Osmanlı'da devlet hizmeti karşılığında tahsis edilen gelir kaynağının genel adıdır. Klasik dönemde yıllık geliri düşük olanlar tımar, orta olanlar zeamet, en yüksek olanlar (genellikle beylere ve hanedana) has olarak sınıflanmıştır. Bu üçlü tasnifin ayrıntılı ölçüleri 15.-16. yüzyıl defterlerinde netleşir.
`related: ['timar','sancak']`

**K-03 · Berat — [A]**
Açılış: `auto`.
Defterde: "Beyimin sandığındaki en kıymetli kâğıt: üzerinde Sultanın tuğrası bulunan berat. Tımarın kime, hangi şartla verildiğini o söyler. Berat elden giderse tımar da gider."
Tarihte: Berat, padişahın tuğrasını taşıyan resmî tevcih belgesidir; bir görevin, gelirin veya imtiyazın kime hangi şartlarla verildiğini belgeler. Tımar sahipleri hak iddialarını beratla ispat ederdi. Yeni padişah tahta çıktığında beratların yenilenmesi gerekirdi.
`related: ['timar','ciftbozan']`

**K-04 · Öşür — [A]**
Açılış: `dialogue:kethuda_talk` defter/vergi dalı (`src/systems/DialogueSystem.js:24-105` içindeki tahsilat action'ına tek satır).
Defterde: "Harmandan kalkan her on ölçekten biri beyimindir — buna öşür denir. Kethüda Yakub Ağa 'öşür hakkıyla alınırsa bereket, zulümle alınırsa göç getirir' der."
Tarihte: Öşür (aşar), Müslüman reayanın toprak mahsulünden alınan ve adını "onda bir"den alan şer'î vergidir; fiilî oran bölgeye ve toprağın statüsüne göre onda birden farklılaşabiliyordu. Tımar sisteminde öşür, sipahinin başlıca gelir kalemiydi. (Verginin fıkhî temeli için bkz. 04-islami-icerik.)
`related: ['cift_resmi','reaya','timar']`

**K-05 · Çift Resmi — [A]**
Açılış: Tımar Defteri gelir dökümünün ilk görüntülenmesi (`src/ui/UIManager.js:553-585` updateTimarBookUI ilk çağrısı).
Defterde: "Defterde her hanenin yanında bir kayıt: bir çift öküzle sürülecek kadar toprağı olan, yılda bir kez akçe öder. Kâtipler buna çift resmi der; toprağı yarım olan yarım öder."
Tarihte: Çift resmi, bir çift öküzle işlenebilecek büyüklükteki aile çiftliği (çiftlik) üzerinden Müslüman reayadan yılda bir alınan nakdî toprak vergisidir; yarım çift işleyenden yarısı alınırdı. Osmanlı kırsal vergi düzeninin ("çift-hane sistemi") temel birimidir. Gayrimüslim haneler benzer yükümlülüğü ispence adıyla öderdi.
`related: ['osur','reaya','zimmi']`

**K-06 · Çiftbozan — [B]**
Açılış: Reaya güveni ilk kez 40'ın altına düştüğünde (`src/core/GameState.js:168-170` modifyReayaTrust içine eşik kontrolü; erken-uyarı işlevi de görür).
Defterde: "Toprağını ekmeyi bırakıp kaçan köylüye çiftbozan denir. Reaya kaçarsa üretim durur, defter boş kalır; kabahat çoğu kez kaçanda değil, kaçırtandadır. Zulmüyle köyü boşaltan sipahinin beratı elinden alınır."
Tarihte: Çiftini terk edip toprağını işlemeyen reayadan, doğan gelir kaybını tazmin için "çiftbozan resmi" alınırdı; kavram ve uygulamanın ayrıntıları 15.-16. yüzyıl kanunnamelerinden bilinir, 1396 için erken dönem uygulaması yorumla geriye taşınmıştır. Kesin olan şudur: Reayanın yerinde ve üretimde tutulması tımar düzeninin varlık şartıydı; köyünü boşaltan bir dirlik sahibi devletin gözünde görevini yapmamış sayılırdı.
`related: ['reaya','timar','osur']`

**K-07 · Reaya — [A]**
Açılış: `dialogue:farmer_talk` ilk açılış.
Defterde: "Tarlayı süren, harmanı kaldıran, vergiyi ödeyen ahali: reaya. Beyim onların efendisi değil, koruyucusudur — kılıç taşımayan bu insanların hakkı yenirse devletin direği çürür."
Tarihte: Reaya, yönetici-askerî sınıfın (askerî) dışında kalan, üretim yapan ve vergi ödeyen tebaanın genel adıdır; Müslüman ve gayrimüslim herkesi kapsar. Osmanlı siyaset düşüncesinde devleti ayakta tutan döngü "adalet dairesi"yle özetlenir: adalet reayayı, reaya üretimi, üretim hazineyi, hazine orduyu, ordu devleti ayakta tutar.
`related: ['osur','ciftbozan','zimmi']`

**K-08 · Kethüda — [A]**
Açılış: `dialogue:kethuda_talk` ilk açılış (`src/systems/DialogueSystem.js:16`).
Defterde: "Koca Yakub, köyün kethüdası: ahali ile beyim arasındaki köprü. Defteri o bilir, haneleri o tanır, kimin harmanı yandı kimin oğlu askere yarar — hepsi onun dilinin ucundadır."
Tarihte: Kethüda, bir topluluğun (köy, mahalle, esnaf loncası, hatta vezir kapısı) işlerini yürüten güvenilir temsilcidir. Köy kethüdası vergi toplanmasında, kayıtların tutulmasında ve ahalinin taleplerinin iletilmesinde idarenin yerel muhatabıydı.
`related: ['reaya','arzuhal']`

**K-09 · Kadı ve Naib — [A]**
Açılış: `dialogue:imam_talk` şer'î/örfî hukuk dalı (`src/systems/DialogueSystem.js:166` civarındaki action'a tek satır).
Defterde: "Molla Şemseddin köyümüzde kadı naibidir: kazadaki kadı efendinin vekili. Beyim kılıcın sahibi olabilir ama hükmün sahibi değildir — dava kadıya gider, sipahi bile onun hükmü önünde eğilir."
Tarihte: Kadı, Osmanlı'da hem şer'î hukuku hem padişah kanunlarını (örfî hukuk) uygulayan; yargıçlığın yanında noterlik ve yerel denetim görevleri de bulunan görevliydi. Büyük kazalara atanır, köy ve nahiyelere naib (vekil) gönderirdi. Sipahi, reayayı kendi başına cezalandıramaz; ceza kadı hükmü gerektirirdi. (Şer'î hukukun içeriği için bkz. 04-islami-icerik.)
`related: ['arzuhal','zimmi','kethuda']`

**K-10 · Arzuhal — [A]**
Açılış: İlk arzuhal üretildiğinde (`src/systems/PetitionSystem.js:66-73` generatePetition içine tek satır).
Defterde: "Ahalinin derdi kâğıda döküldü mü adı arzuhal olur: 'değirmen ister, kuyu ister, çatısı akan mescidine onarım ister.' Beyim dinlemezse köylü hakkını kadıda, olmadı Divan'da arar — Osmanlı'da en fakirin bile kaleme erişimi vardır."
Tarihte: Arzuhal, halkın yöneticilere ve mahkemelere sunduğu yazılı dilekçedir. Osmanlı tebaası şikâyet ve taleplerini kadı mahkemesine, beylere ve doğrudan Divan-ı Hümâyun'a arzuhalle ulaştırabilirdi; bu "adalet kapısının açık tutulması" devletin meşruiyet iddiasının temeliydi.
`related: ['kadi','kethuda']`

**K-11 · Zimmî — [A]**
Açılış: Su ihtilafı görevi diyaloğu (`src/systems/DialogueSystem.js:357` water_dispute_talk — teknik plan bu diyaloğu bir NPC'ye bağladığında) VEYA Tımar Defteri "Müslüman & Zimmî" satırının ilk görüntülenmesi; hangisi önce olursa.
Defterde: "Defterde Müslüman haneler de yazar, zimmî haneler de. Zimmî — ahd ile korunan gayrimüslim demektir: canı, malı, ibadeti devletin güvencesindedir; buna karşılık cizye öder. Molla Şemseddin'in sözü kulağımda: 'Müslim olsun zimmî olsun, hak kimin ise ona teslim edilsin.'"
Tarihte: Zimmî, İslam devletinin koruma ahdi (zimmet) altındaki gayrimüslim tebaadır; askerlikten muaf tutulur, karşılığında cizye vergisi öderdi. Erken Osmanlı Balkanlarında Ortodoks Hristiyan köylüler, Müslüman reaya ile aynı üretim düzeninin içinde ve kadı mahkemesine erişimle yaşıyordu. (Fıkhî çerçeve için bkz. 04-islami-icerik.)
`related: ['reaya','kadi']`

**K-12 · Sancak ve Sancakbeyi — [A]**
Açılış: `quest:quest_castle` tamamlanınca.
Defterde: "Tımarımız Hüdavendigâr sancağına bağlıdır. Sancak hem bir bayrak hem bir memlekettir: sancakbeyi, o bayrağın altında toplanan bütün tımarlı sipahilerin sefer komutanıdır. Yoklamada eksik çıkan, sancakbeyinin defterine düşer."
Tarihte: Sancak, Osmanlı taşra teşkilatının temel askerî-idarî birimidir; adını, birliklerin altında toplandığı sancaktan (bayraktan) alır. Sancakbeyi hem bölgenin yöneticisi hem seferde o sancağın tımarlı sipahilerinin komutanıydı. Hüdavendigâr (Bursa yöresi), Osmanlı'nın çekirdek sancaklarından biriydi.
`related: ['timar','yoklama','dizdar']`

#### KATEGORİ 2: ASKERLİK (9 madde)

**K-13 · Sipahi — [A]**
Açılış: `auto`.
Defterde: "Beyim bir tımarlı sipahidir: barışta köyün nizamını gözetir, savaş borusu çalınca atına biner, zırhını kuşanır, cebelüsünü yanına alıp sancağının altına koşar. Geçimi maaştan değil, tımarın gelirindendir."
Tarihte: Tımarlı sipahi, tımar geliri karşılığında sefere atı ve teçhizatıyla katılmakla yükümlü süvaridir. Klasik dönem Osmanlı ordusunun en kalabalık unsuru bu eyalet süvarisiydi; merkezdeki maaşlı kapıkulu askerinden (ör. yeniçeriler) ayrı bir sınıftı.
`related: ['timar','cebelu','yoklama']`

**K-14 · Cebelü — [A]**
Açılış: `dialogue:cebelu_talk` ilk açılış VEYA `TimarSystem.trainCebelu` ilk çağrısı (`src/systems/TimarSystem.js:49-55`).
Defterde: "Ali benim cebelümdür: tımarın geliriyle donattığım, zırhını benim aldığım, sefere benimle gelen asker. Gelir büyüdükçe kanun daha çok cebelü ister — dirlik yiyenin kılıç borcu da büyür."
Tarihte: Cebelü ("cebe" = zırh), tımar sahibinin gelirine göre besleyip donatmak ve sefere götürmekle yükümlü olduğu zırhlı askerdir. Yükümlülük gelir dilimlerine göre defterlerde kayıtlıydı; oyundaki "her 3000 akçe için bir cebelü" ifadesi bu ilkenin basitleştirilmiş bir temsilidir (klasik dönem kayıtlarında dilimler ve şartlar daha ayrıntılıdır).
`related: ['sipahi','yoklama','akce']`

**K-15 · Akıncı — [A]**
Açılış: `dialogue:` Koca Dede'nin yeni anı dallarından herhangi biri (bkz. 5.2).
Defterde: "Koca Dede gençliğinde akıncıymış: serhaddin öncüsü, düşman diyarının derinliğine dalan hafif atlı. 'Biz orduya yol açardık' der, 'kılıçtan önce korkumuz varırdı.'"
Tarihte: Akıncılar, Osmanlı serhaddinde düşman topraklarına derin akınlar yapan hafif süvari birlikleriydi; keşif, yıpratma ve öncü kuvvet görevi görürlerdi. Evrenosoğulları ve Mihaloğulları gibi belirli akıncı beyi aileleri tarafından yönetilirlerdi — oyundaki sipahi isim havuzunda geçen "Evrenosoğlu" bu geleneğe göndermedir (`src/core/GameState.js:16-23`).
`related: ['sipahi','kazik_hatti']`

**K-16 · Yoklama — [A]**
Açılış: `quest:quest_castle`.
Defterde: "Dizdar Hamza Bey defteri açtı, adımızı okudu, atımıza, zırhımıza, cebelümüze baktı. Buna yoklama denir: sefere kim, ne ile geliyor — devlet bunu kâğıtta görmek ister. Yoklamada eksik çıkanın dirliği tehlikeye girer."
Tarihte: Yoklama, sefer öncesi ve sırasında tımarlı sipahilerin mevcutlarının ve teçhizatının defter üzerinden denetlenmesidir. Sefere mazeretsiz gelmeyen veya eksik gelen sipahinin tımarı elinden alınabilirdi; bu denetim tımar sisteminin işlemesini sağlayan asıl mekanizmaydı.
`related: ['sipahi','cebelu','sancak']`

**K-17 · Dizdar — [A]**
Açılış: `dialogue:dizdar_talk` ilk açılış.
Defterde: "Hamza Bey sancak kalesinin dizdarıdır: kapının, burçların, zahire ambarının ve zindanın emini. Kale onun namusudur — 'kale düşerse dizdar sağ çıkmaz' derler."
Tarihte: Dizdar, bir kalenin muhafız komutanı ve sorumlusudur; kale neferlerinin, silah ve erzak depolarının idaresi ona aitti. Niğbolu 1396'da kaleyi Haçlı kuşatmasına karşı tutan Osmanlı komutanı da kaynaklarda Doğan Bey adıyla anılır (bkz. K-39).
`related: ['sancak','dogan_bey']`

**K-18 · Börk ve Başlıklar — [B]**
Açılış: `dialogue:demirci_talk` ilk açılış.
Defterde: "Başlık, adamın kimliğidir: sipahinin kızıl börkü, ulemânın ak sarığı, köylünün keçe külahı. Rüstem Usta 'başa bakınca kim olduğunu bilirsin, o yüzden kimse başkasının başlığını giymez' der."
Tarihte: Börk, erken Osmanlı askerinin karakteristik keçe başlığıdır; renk ve biçimiyle sınıf belirtirdi (yeniçerilerin ak börkü gibi). Toplumda başlık ve sarık, meslek ve statünün en görünür işaretiydi. Kırmızı fes ise bu dönemde YOKTUR; Osmanlı ordusuna ve topluma ancak 19. yüzyılda II. Mahmud reformlarıyla girmiştir (oyundaki fes modeli bu yüzden kaldırılmıştır, bkz. Bölüm 4.1).
`related: ['sipahi','ahilik']`

**K-19 · Gürz ve Plaka Zırh — [B]**
Açılış: `dialogue:demirci_talk` gürz dersi dalı (`src/systems/DialogueSystem.js:196-206` action'ına tek satır).
Defterde: "Rüstem Usta'nın dersi: 'Frenk şövalyesinin plaka zırhını kılıçla çizersin, gürzle çökertirsin.' Kesici kesmeyeni ezmek gerek — demirin dili budur."
Tarihte: 14. yüzyıl sonunda Batı Avrupa ağır süvarisi giderek bütünleşik plaka zırha geçiyordu; kesici darbelere karşı çok dirençli olan bu zırha karşı gürz, savaş çekici gibi künt/delici silahlar etkiliydi. Osmanlı ve genel Orta Çağ pratiğinde silah seçiminin hedefin zırhına göre yapılması gerçek bir taktik ilkeydi; oyunun hasar sistemi (kesme/delme/künt × zırh türü) bu ilkenin temsilidir.
`related: ['bork','kazik_hatti','hacli_bilesimi']`

**K-20 · Akçe — [A]**
Açılış: İlk vergi tahsilatı (`src/systems/TimarSystem.js:17-19` collectAnnualTax içine tek satır).
Defterde: "Kesemizdeki gümüş sikkenin adı akçe. Öşür akçeyle hesaplanır, cebelü akçeyle donatılır, tımarın büyüklüğü yıllık akçesiyle ölçülür. 'Akçesiz sipahi, yaysız okçu' derler."
Tarihte: Akçe, Osmanlı'nın temel gümüş sikkesiydi; ilk Osmanlı akçesi Orhan Bey döneminde (1320'ler) basılmıştır. Tımar gelirleri, vergiler ve maaşlar akçe üzerinden defterlere kaydedilirdi; tımarların büyüklüğü yıllık akçe geliriyle tanımlanırdı.
`related: ['timar','cebelu']`

**K-21 · Kazık Hattı ve Katmanlı Savaş Düzeni — [A]** *(ana olay A; "tek manevra" anlatısını düzeltir)*
Açılış: `event:` Niğbolu 2. safha vinyeti gösterildiğinde (bkz. 3.4) VEYA kamp gecesi havadisi H-11.
Defterde: "Niğbolu sabahı öncüler düşmanı üstümüze çekti; şövalye atları toprağa çakılı sivri kazıklara saplandı; okçularımız yağmur gibi ok yağdırdı; biz sipahiler ve Sultanın ihtiyatı arkada bekledik. Savaş tek bir hileyle değil, kat kat örülmüş bir düzenle kazanıldı."
Tarihte: Kaynaklar Niğbolu'da Osmanlı düzenini katmanlı tarif eder: önde düzensiz/öncü birlikler, arkasında sivri kazıklarla korunan hat ve yaya okçular, geride sipahi süvarisi ve ihtiyat kuvvetleri. Haçlı ağır süvarisinin hücumu bu katmanlarda eritilmiş, savaş ihtiyatın karşı hücumuyla bitirilmiştir. Savaşı tek bir "sahte ricat" manevrasına indirgemek kaynaklardaki bu katmanlı düzeni fazla basitleştirir.
`related: ['nigbolu','akinci','hacli_bilesimi']`

#### KATEGORİ 3: CEMİYET VE GÜNDELİK HAYAT (8 madde)

**K-22 · Ahilik — [A]**
Açılış: `dialogue:demirci_talk` ilk açılış ("Ahi Evran ocağından feyiz almışız" repliği).
Defterde: "Rüstem Usta bir ahidir: çarşının hem ustası hem ahlak bekçisi. Ahiler çırağı yetiştirir, hileli malı çarşıdan kovar, misafiri doyurur. 'Eline, diline, beline sahip ol' — ocaklarının kapısında yazan budur."
Tarihte: Ahilik, Anadolu'da esnaf ve zanaatkârları örgütleyen, fütüvvet ahlakına dayalı kardeşlik teşkilatıdır; piri olarak Kırşehirli Ahi Evran kabul edilir. Ahi birlikleri üretim kalitesini, usta-çırak eğitimini ve çarşı ahlakını denetler; şehir hayatında büyük toplumsal güç taşırdı. Erken Osmanlı beyliğinin kuruluşunda ahi çevrelerinin desteği önemliydi. (Fütüvvet ahlakının dinî kaynakları için bkz. 04-islami-icerik.)
`related: ['bork','han']`

**K-23 · Gaza ve Gazi — [A]** *(kısa madde; ayrıntı 04-islami-icerik'te)*
Açılış: `dialogue:dede_talk` gaza vasiyeti dalı (`src/systems/DialogueSystem.js:334` action'ına tek satır).
Defterde: "Koca Dede'nin vasiyeti kulağımdadır: 'Gazâ ganimet için değil, milletin namusu ve mazlumun duası içindir.' Serhadde savaşan ve sağ dönene gazi denir; bu ad bir övünç değil, bir emanettir."
Tarihte: Gaza, serhat boylarındaki din uğruna mücadeleyi; gazi, bu mücadeleye katılanı ifade eder. Erken Osmanlı beyleri "gazi" unvanını kimliklerinin merkezine koymuştur; tarihçiler gaza olgusunun dinî, iktisadî ve siyasî boyutlarının iç içe geçtiğini vurgular. Gazânın ahlakı ve fıkhî çerçevesi için bkz. 04-islami-icerik.
`related: ['akinci','kosova_1389']`

**K-24 · Hamam — [A]**
Açılış: `dialogue:tellak_talk` kese hizmeti satın alındığında (`src/systems/DialogueSystem.js:585` ilgili action).
Defterde: "Hamamımız köy yerinde şaşırtıcı büyüklüktedir; Tellak Hüseyin Ağa sorulunca göğsünü gerer: 'Burası vakıf malıdır beyim — hayır sahibi yaptırmış ki gelen geçen temizlensin, geliri de mescide aksın.' Kese, köpük, kurna, göbek taşı: yorgunluğun ilacı burasıdır."
Tarihte: Hamam, İslam şehir kültüründe temizliğin ve toplumsal hayatın temel kurumuydu; çoğu hamam bir vakfın parçası olarak yapılır, geliri cami, imaret gibi hayır yapılarına akardı. Erken Osmanlı döneminden kalma hamamlar vardır; ancak büyük hamamlar tipik olarak kasaba/menzil ölçeğinin yapısıdır — oyundaki hamamın "vakıf yapısı" olarak sunulması bu gerçekliğe uygun düşsün diye seçilmiştir (krş. TARIHSEL doc 3.2).
`related: ['vakif','han']`

**K-25 · Han ve Kervan Ticareti — [A]**
Açılış: `dialogue:hanci_talk` ilk açılış.
Defterde: "Hancı İdris'in kapısından her milletin yolcusu geçer: Bursa ipeği taşıyan tüccar, Ragusalı ulak, Cenevizli simsar. Han, yolcunun emniyeti ve havadisin pınarıdır — dünyada ne oluyorsa önce handa konuşulur."
Tarihte: Hanlar ve kervansaraylar, yol boylarında kervanlara konaklama ve güvenlik sağlayan yapılardı; çoğu vakıf eseriydi. 14. yüzyıl sonunda Osmanlı toprakları, Ceneviz ve Venedik gibi İtalyan denizci devletlerinin ve Ragusa (Dubrovnik) tüccarlarının işlediği canlı bir ticaret ağının parçasıydı; savaş zamanında bile ticaret tümüyle durmazdı.
`related: ['ahilik','zimmi']`

**K-26 · Attar ve Dönem Hekimliği — [B]**
Açılış: `dialogue:attar_talk` ilk açılış.
Defterde: "Attar Mehmet Efendi'nin dükkânı bir koku deryası: kantaron yağı, çörek otu macunu, dağ kekiği, mürver merhemi. Kırığı sarar, yarayı dağlar, ateşi düşürmeye şerbet kaynatır. Hekim yoksa attar, yarı hekimdir."
Tarihte: Attar (aktar), baharat, bitkisel ilaç ve macun satan esnaftır; tabip bulunmayan yerlerde halk hekimliğinin başlıca adresiydi. Dönemin tıbbı İbn Sina geleneğine dayanır; yara dağlama, bitkisel merhemler ve kırık-çıkık sarma yaygın pratiklerdi. Kantaron (binbirdelik otu) yağının yara tedavisinde kullanımı geleneksel tıpta gerçekten kayıtlıdır.
`related: ['hamam']`

**K-27 · Hazire ve Osmanlı Mezar Taşları — [B]**
Açılış: `discover:` ilk mezar kitabesi okunduğunda (bkz. 5.1).
Defterde: "Mescidin yanındaki servili küçük mezarlığa hazire denir. Taşların her biri bir ömrün özetidir: kimi bir gaziyi, kimi bir ebeyi, kimi adı çoktan silinmiş birini anar. Kâtip dedi ki: 'Taş okumasını bilene mezarlık, köyün ikinci defteridir.'"
Tarihte: Hazire, cami ve tekke gibi yapıların bitişiğindeki çevrili küçük mezarlıktır. Erken Osmanlı mezar taşları genellikle sade, çoğu Arapça kitabelidir; ölünün adını, duasını ve bazen mesleğini verir. Başlık (kavuk/sarık) yontulmuş gösterişli şahideler ve zengin Türkçe kitabeler daha çok sonraki yüzyılların âdetidir — oyundaki Türkçe kitabeler okunabilirlik için yapılmış bilinçli bir uyarlamadır.
`related: ['hamam','vakif']`

**K-28 · Vakıf — [A]** *(kısa madde; ayrıntı 04-islami-icerik'te)*
Açılış: Mescit onarımı arzuhali kabul edildiğinde (`src/systems/PetitionSystem.js:16-53` havuzundaki fix_mosque kabulüne tek satır) VEYA K-24 ile birlikte.
Defterde: "Hamamı yaptıran hayır sahibi, gelirini mescide bağlamış: buna vakıf denir — bir malı Allah rızası için ebediyen hayra adamak. Çeşme, köprü, han, mektep... yol üstünde işine yarayan çoğu şey bir vakfın eseridir."
Tarihte: Vakıf, bir mülkün gelirinin süresiz olarak hayır hizmetine tahsis edildiği hukukî kurumdur; Osmanlı şehir ve yol altyapısının (cami, imaret, hamam, kervansaray, köprü) büyük kısmı vakıflar eliyle kurulup yaşatılmıştır. Kuruluş esasları ve dinî temeli için bkz. 04-islami-icerik.
`related: ['hamam','han']`

**K-29 · Hicri Takvim — [A]** *(kısa madde; ayrıntı 04-islami-icerik'te)*
Açılış: İlk gün dönümünde (`src/core/GameState.js:214-233` gün-dönümü bloğuna tek satır).
Defterde: "Kâtip defteri iki tarihle tutar: Frenk hesabıyla 1396, bizim hesabımızla 798. Bizim yıl, Peygamber Efendimiz'in hicretiyle başlar ve ay'a göre sayılır; bu yüzden mevsimlerin içinde yavaşça döner."
Tarihte: Hicri takvim, 622'deki Hicret'i başlangıç alan ay (kamerî) takvimidir; yılı yaklaşık 354 gündür ve miladî yıla göre her yıl ~11 gün öne kayar. Miladi 1396 yılı, ağırlıkla Hicri 798 yılına denk düşer; Niğbolu zaferi (25 Eylül 1396) Zilhicce 798 ayı içindedir. Takvimin dinî ayları ve oyun içi kullanımı için bkz. 04-islami-icerik.
`related: []`

#### KATEGORİ 4: VAKĀYİ VE ŞAHISLAR (11 madde)

**K-30 · Edirne'nin Fethi (1361) — [B]** *(tarih tartışmalıdır)*
Açılış: `dialogue:` Koca Dede yeni anı 1 (bkz. 5.2).
Defterde: "Koca Dede der ki: 'Sazlıdere'de Rum ordusunu dağıttık, ardından Edirne kapılarını aman ile açtı — kılıçla değil.' Şimdi o şehir Sultanın Rumeli'deki tahtıdır; ferman oradan çıkar, ordu orada toplanır."
Tarihte: Edirne, I. Murad döneminde, Sazlıdere Savaşı'nın ardından Osmanlı hâkimiyetine girdi; fethin kesin yılı kaynaklarda tartışmalıdır (yaygın kabul 1361, bazı araştırmalar 1369'a tarihler). Şehir kısa sürede Osmanlıların Rumeli'deki merkezi ve fiilî payitahtlarından biri hâline geldi; 1396 Niğbolu seferinin toplanma ve sevk merkezi de Edirne'ydi.
`related: ['cirmen_1371','murad_hudavendigar']`

**K-31 · Sırpsındığı (1364) — [R]** *(kaynak eleştirisi dersi olarak bilinçli R)*
Açılış: `dialogue:` Koca Dede yeni anı 2 (bkz. 5.2).
Defterde: "Dede bu cengi anlatırken sesini alçaltır: 'Hacı İlbey bir gece baskınıyla koca haçlı ordusunu Meriç'e döktü, derler. Ben o yıllarda serhatteydim; çok şey duydum, azını gördüm. Sonradan gelen kâtipler bu cengi başka cenklerle karıştırır — sen yine de dinle, ama bil ki her duyduğun görülmüş değildir.'"
Tarihte: Osmanlı kronikleri, 1364'e tarihlenen ve Hacı İlbey'in gece baskınıyla bir Haçlı ordusunu Meriç kıyısında bozguna uğrattığı bir "Sırpsındığı" zaferi anlatır. Modern tarihçilerin bir kısmı bu anlatının 1371 Çirmen zaferiyle karıştırılmış ya da menkıbeleşmiş olabileceğini düşünür; olayın müstakil varlığı tartışmalıdır. Oyun bu maddeyi bilinçli olarak "rivayet" etiketiyle sunar.
`related: ['cirmen_1371','edirne_1361']`

**K-32 · Çirmen Muharebesi (1371) — [A]**
Açılış: `dialogue:` Koca Dede yeni anı 3 (bkz. 5.2).
Defterde: "Dede'nin en net anısı: 'Meriç kenarında, Çirmen'de, sabaha karşı vurduk. Sırp kralları Vukaşin ile Uglyeşa ordularıyla Meriç'e gömüldü. O günden sonra Makedonya'nın yolu açıldı.'"
Tarihte: 26 Eylül 1371'de Meriç (Maritsa) kıyısındaki Çirmen'de Osmanlı kuvvetleri, Serez despotu Uglješa ile kardeşi Kral Vukašin'in ordusunu ani bir baskınla yok etti; iki kardeş de savaşta öldü. Bu zafer Osmanlıların Makedonya ve Batı Trakya'ya yayılmasının önünü açtı ve Balkan devletlerinin bir kısmını Osmanlı'ya haraçgüzar hâle getirdi.
`related: ['sirpsindigi_1364','kosova_1389']`

**K-33 · I. Kosova Muharebesi (1389) — [A]**
Açılış: `quest:quest_dede_flag` (mevcut Kosova anısı; `src/systems/DialogueSystem.js:317-352`).
Defterde: "Koca Dede'nin gözleri Kosova'yı anlatırken buğulanır: 'Düşman safları demir duvar gibiydi. Zafer bizim oldu, ama Sultan Murad Han o meydanda şehit düştü.' Bir savaşı hem kazanıp hem en büyüğünü kaybetmek — Kosova budur."
Tarihte: 28 Haziran 1389'da (Jülyen takvimle 15 Haziran; kodeksteki diğer tarihler — ör. Niğbolu 25 Eylül 1396 — Jülyen'dir) Kosova ovasında Osmanlı ordusu, Sırp Knezi Lazar önderliğindeki Balkan ittifakıyla savaştı; iki taraf da ağır kayıp verdi, Knez Lazar öldürüldü ve savaş Osmanlı üstünlüğüyle sonuçlandı. Sultan I. Murad savaş meydanında öldürüldü — öldürülüş biçimi (Miloš Obilić'e atfedilen suikast) kaynaklarda farklı anlatılır ve menkıbeleşmiştir. Tahta oğlu Bayezid geçti.
`related: ['murad_hudavendigar','yildirim_bayezid']`

**K-34 · Murad Hüdavendigâr — [A]**
Açılış: K-33 ile birlikte (aynı diyalog dalı; kuyruk 30 sn sonra duyurur).
Defterde: "Dede ona hep 'Hüdavendigâr' der — efendimiz. 'Rumeli'yi bize o yurt yaptı' der; 'Edirne'yi o aldı, Kosova'da o şehit düştü. Şehadet duasını kendi kulağıyla duyanlar hâlâ sağdır.'"
Tarihte: I. Murad (saltanatı 1362-1389), Osmanlı Devleti'ni Rumeli'de kalıcı bir güç hâline getiren hükümdardır; Edirne'nin alınması, Balkanlar'a iskân politikası ve devlet teşkilatının (yeniçeri ocağı dahil) gelişmesi onun dönemine denk düşer. Kosova'da savaş alanında ölen tek Osmanlı padişahıdır. Kosova öncesi şehadet niyazı Osmanlı kroniklerinde aktarılan, menkıbeleşmiş bir anlatıdır (bu ayrıntı R düzeyindedir).
`related: ['kosova_1389','edirne_1361']`

**K-35 · Rovine (1395) — [A]** *(olay A; kesin tarihi tartışmalı)*
Açılış: `event:` Havadis H-1 (bkz. 3.2).
Defterde: "Geçen yılın acı haberi hâlâ konuşulur: Sultan, Eflak voyvodası Mirça'nın üstüne yürüdü; Rovine'de kanlı bir boğuşma oldu. Bizim safta çarpışan Sırp beyleri Kral Marko ile Konstantin o meydanda düştü. Kâtip not düştü: Osmanlı sancağı altında Hristiyan beyler de savaşır — bunu bilmeyen, bu devri anlamaz."
Tarihte: Rovine Muharebesi'nde (kaynaklara göre Ekim 1394 veya Mayıs 1395) Bayezid'in ordusu Eflak Voyvodası Mircea ile savaştı; savaş çok kanlı geçti ve kesin sonuçsuz kaldı, ancak Eflak üzerindeki Osmanlı baskısı sürdü. Osmanlı safında savaşan vasal hükümdarlardan Kral Marko (Prilep kralı) ve Konstantin Dejanović bu savaşta öldü — Osmanlı ordusunun tek dinli olmadığının en açık örneklerindendir.
`related: ['hacli_bilesimi','yildirim_bayezid']`

**K-36 · Yıldırım Bayezid — [A]**
Açılış: `quest:quest_campaign` fermanı geldiğinde.
Defterde: "Sultanımız Bayezid Han'a 'Yıldırım' derler; ordusuyla bir uçtan öbür uca beklenmedik hızla düşer de ondan. Bir yıl Anadolu'da beylikleri derler toplar, ertesi yıl Rumeli'de küffar... Haçlı ordusuna karşı ferman çıktı; şimdi yıldırımın ne demek olduğunu cümle âlem görecek."
Tarihte: I. Bayezid (saltanatı 1389-1402), Anadolu beyliklerinin çoğunu Osmanlı'ya katan, 1394'ten itibaren Konstantinopolis'i ablukaya alan ve seferlerindeki hızı nedeniyle "Yıldırım" lakabıyla anılan padişahtır. 1396'da Niğbolu'da Haçlı ordusunu yendi; 1402'de Ankara'da Timur'a yenilerek esir düştü. (Oyunun kampanyası 1396'da biter; Ankara ayrı bir genişleme konusudur, krş. TARIHSEL doc 14.)
`related: ['nigbolu','rovine_1395']`

**K-37 · Niğbolu Muharebesi (25 Eylül 1396) — [A]**
Açılış: `event:` sefer sonuçlandığında (savaş sonucu ekranıyla birlikte).
Defterde: "Tuna kıyısında, Niğbolu kalesinin önünde, Haçlı ordusunun sonu geldi. Frenk şövalyeleri kibirle ilk hücumu yaptı, kazık hattında kırıldı; Macar kralının ana kuvveti Sultanın ihtiyatı ve Sırp vasal süvarisi karşısında dağıldı. Kral Sigismund canını Tuna'daki gemilere zor attı."
Tarihte: 25 Eylül 1396'da Bayezid'in ordusu, Niğbolu Kalesi'ni kuşatan Haçlı ordusunu kesin yenilgiye uğrattı. Fransız-Burgonya süvarisinin erken ve düzensiz hücumu Osmanlı'nın katmanlı düzeninde eridi; Sırp despotu Stefan Lazareviç'in ihtiyattaki müdahalesi savaşın son dengesini bozdu; Kral Sigismund nehir yoluyla kaçtı. Zafer, Osmanlı'nın Balkan hâkimiyetini pekiştirdi ve Avrupa'da büyük yankı uyandırdı.
`related: ['kazik_hatti','hacli_bilesimi','esir_fidyesi','dogan_bey']`

**K-38 · Haçlı Ordusunun Bileşimi — [A]**
Açılış: `event:` Havadis H-4 (Buda'da toplanma) VEYA sefer 1. safha vinyeti.
Defterde: "Karşımızdaki ordu tek bir millet değildi: Burgonya ve Fransa asilzadeleri, Macar Kralının alayları, Alman kontları, Rodos şövalyeleri, Eflak askeri... Kâtip der ki: kalabalıktılar, lakin her başın ayrı hesabı vardı — kibir, ganimet, taht, tövbe. Tek yürek olamayan ordu, tek yumruğa dayanamaz."
Tarihte: 1396 Haçlı ordusu Macar Kralı Sigismund'un çağrısıyla toplanan çok uluslu bir koalisyondu: Burgonya dükünün oğlu Jean de Nevers komutasındaki Fransız-Burgonya şövalyeleri, Macar, Alman ve Eflak kuvvetleri, Rodos (Hospitalier) şövalyeleri ve Tuna'da Venedik-Ceneviz gemileri. Komuta birliği yoktu; Fransız şövalyelerinin Sigismund'un savaş planını dinlemeyip öne atılması yenilginin başlıca sebeplerinden sayılır. Ordunun mevcudu kaynaklarda çok farklı (abartılı) verilmiştir; modern tahminler her iki taraf için de on binler mertebesindedir. Jean, Niğbolu'daki cüretinden ötürü sonradan "Korkusuz" (Sans Peur) diye anılacaktır (B — lakap 1396 baharında henüz yoktur; oyun metinleri bu yüzden savaştan önce ondan yalnız "Burgonya dükünün oğlu Jean" diye söz eder).
`related: ['nigbolu','kazik_hatti','esir_fidyesi']`

**K-39 · Doğan Bey ve Niğbolu Savunması — [R]**
Açılış: `event:` Havadis H-8 (kuşatma haberi) VEYA kamp gecesi rivayeti H-11.
Defterde: "Ordugâhta ateş başında anlatılır: Niğbolu dizdarı Doğan Bey kaleyi teslim etmemiş; Sultan gece karanlığında tek başına sur dibine at sürmüş, kaleye seslenmiş, Doğan Bey'le konuşup 'dayan' demiş. Bunu gören yok — ama anlatan çok. Kâtip buraya şerh düşer: rivayettir."
Tarihte: Niğbolu kalesini kuşatma boyunca tutan Osmanlı komutanı kaynaklarda Doğan Bey olarak geçer; kalenin direnmesi, Bayezid'in ordusu yetişene dek Haçlıları oyalayan etkendi. Bayezid'in gece gizlice sur dibine gelip Doğan Bey'le konuştuğu sahnesi ise Osmanlı anlatı geleneğinde yer alan, doğrulanamayan meşhur bir rivayettir; oyun bunu bilerek "asker ağzından anlatılan hikâye" olarak sunar (TARIHSEL doc 4.2 ve Bölüm 13 kararıyla uyumlu).
`related: ['dizdar','nigbolu']`

**K-40 · Esir Fidyesi ve Zaferin Bedeli — [A]** *(infaz sayıları ihtilaflı; metin bunu söyler)*
Açılış: `event:` sefer sonrası havadis H-13.
Defterde: "Zafer sarhoşluğu çabuk geçer; meydanda esirler, yaralılar ve hesap kalır. Frenk beylerinin canı fidyeyle satın alınır — Burgonya dükünün oğlu için dağlar kadar altın konuşuluyor. Sıradan esirlerin akıbeti ise ordugâhta fısıltıyla anlatılır; kimi çok şey söyler, kimi susar. Kâtip ikisini de yazdı."
Tarihte: Niğbolu'da esir düşen yüksek soylular — başta Jean de Nevers — büyük fidyeler karşılığında (kaynaklarda 200.000 altın mertebesinde rakamlar geçer) serbest bırakıldı; fidye pazarlıkları ve ödemesi yıllara yayıldı. Savaş ertesinde Bayezid'in, Rahova'da yapılan katliama misilleme olarak çok sayıda esiri idam ettirdiği anlatılır; idam edilenlerin sayısı kaynaklarda yüzlerle binler arasında değişir ve kesin değildir. Esirlerden Bavyeralı Johann Schiltberger yıllar sonra yazdığı hatıratıyla bu savaşın görgü tanığı kaynaklarından biri olmuştur.
`related: ['nigbolu','hacli_bilesimi']`

**Kabul kriteri (C3):** 40 maddenin tamamı `CodexData.js`'te yukarıdaki metinlerle (yazım düzeltmeleri serbest, içerik değişikliği yasak) mevcut; her maddenin unlock tetikleyicisi bu bölümdeki "Açılış" satırındaki noktaya bağlanmış; işveren temsilcisi 20 zorunlu maddeyi (görev tanımındaki liste) kodekste tek tek bulabiliyor.

---

## 3. TARİHİ OLAY AKIŞI: 1396 KAMPANYA TAKVİMİ

### 3.1 Tasarım: haber "damla damla" gelir

Oyuncu 1396'nın gerçek kronolojisini ders olarak değil, **köye sızan havadisler** olarak yaşar. Havadisin dört kanalı vardır ve her kanalın kendi sesi vardır:

| Kanal | Taşıyıcı | Ton | Teknik yuva |
|---|---|---|---|
| **İmam havadisi** | Molla Şemseddin'in "Rumeli havadisleri" dalı | Ağırbaşlı, teyitli, dua ile biter | `src/systems/DialogueSystem.js:146-161` mevcut dal, 5 varyanta genişletilir (bkz. 5.3) |
| **Han dedikodusu** | Hancı İdris + hamam sohbeti | Renkli, abartıya açık (mizah burada yaşar), ama çekirdek bilgi doğru | `hanci_talk` ve `tellak_talk`'a duruma bağlı ek replik dalı |
| **Kethüda sabah raporu** | Gün-dönümü bildirimi | Kuru, idari | `src/core/GameState.js:214-233` gün-dönümü bloğu |
| **Ulak/ferman** | Tam ekran bildirim (alert) | Resmî | `gameState.addNotification(..., 'alert')` + kös sesi (`playWarDrum`, `src/core/AudioManager.js:211`) |
| **Nöbetçi muhabbeti** | Kale nöbetçileri | Asker ağzı, temkinli mizah | `guard_talk` — şu an TANIMSIZ (`src/entities/NPCManager.js:313`); bu doküman metnini 3.3'te verir, tanımlama teknik plan işidir |

### 3.2 Havadis takvimi (tablo)

Kampanya takvimi: **Gün 1 = 1396 ilkbaharı (Nisan başı)**, savaş ≈ Gün 22-24. Mevcut oyun yılı 40 gün olduğundan (10 gün/mevsim, `src/core/GameState.js:229-232`) takvim tek oyun yılına rahat sığar; oyun-günü/gerçek-süre ayarı teknik planın işidir. **Uygulama önceliği:** Bu tablodaki gün numaraları ve `afterQuest` kapıları, 06-fazlar-ve-kabul.md'nin havadis remap tablosu (F4-09) ve Ç-kararlarıyla (özellikle ferman/quest_campaign/quest_castle sıralamasını bağlayan karar) birlikte uygulanır; bu tablo ile 06 çelişirse 06 geçerlidir. Her havadis **çifte anahtarlıdır**: `minDay` (erken gösterilmez) VE `afterQuest` (görev temposu yavaşsa haber görevleri bekler) — böylece hızlı ve yavaş oyuncuda kronoloji bozulmaz.

Veri sözleşmesi (yeni dosya `src/data/HistoricalNews.js`; günlük kontrol `GameState.updateTime` gün-dönümü bloğuna eklenir; yıl-bazlı `checkHistoricalEvents` (`src/core/GameState.js:271-285`) 06-fazlar-ve-kabul.md kararı gereği nötrleştirilir — ayrı bir yıl-olayı tablosu YAZILMAZ, tek olay mekanizması bu gün-bazlı havadis akışıdır):

```js
export const HISTORICAL_NEWS = [
  { id:'h1', minDay:1,  afterQuest:null,             channel:'dede',    tag:'A', codexUnlocks:['rovine_1395'], text:'…' },
  { id:'h2', minDay:2,  afterQuest:null,             channel:'hanci',   tag:'A', codexUnlocks:[], text:'…' },
  // …
];
```

| # | Oyun günü (min) | Görev kapısı | Miladi karşılık | Kanal | Etiket | Havadis metni (kes-yapıştır) |
|---|---|---|---|---|---|---|
| H-1 | 1 | — | 1395'in yankısı | Koca Dede / imam V1 | A | "Geçen yıl Eflak elinde, Rovine'de çok kan döküldü; bizim safta vuruşan Kral Marko ile Konstantin Bey o meydanda kaldı. Sultanımız şimdi İstanbul'u abluka altında tutar. Fırtına dindi sanma evlat; bulut sadece yer değiştirdi." |
| H-2 | 2 | — | Kış 1395-96: Haçlı vaazı | Hancı İdris | A | "Kervandan duydum beyim: Macar kralı Frenk diyarına elçi üstüne elçi salmış. Papazlar kiliselerde 'Türk'e karşı sefer' vaaz ediyormuş. Bizim buralara kadar gelirler mi dersin? ...Ben hancıyım beyim, savaştan önce fiyatlar konuşulur — yem fiyatı şimdiden oynadı bile." *(mizah dünyevi: esnaf aklı)* |
| H-3 | 4 | quest_inspect | Nisan sonu 1396: Burgonya yola çıktı | Hancı İdris | A | "Batıdan gelen tüccar anlattı: Burgonya dükünün oğlu Jean, binlerce şövalyeyle yola çıkmış. Altın işlemeli çadırlar, ipek sancaklar, araba araba şarap... Tüccar dedi ki: 'Ordudan çok düğün alayına benziyor.' Düğünün kime kurulduğunu Tuna'da görecekler." |
| H-4 | 7 | — | Temmuz 1396: Buda'da toplanma | İmam V2 | A | (Tam metin 5.3'te — V2) |
| H-5 | 10 | quest_bandits | Ağustos 1396: Tuna boyunca ilerleyiş | Nöbetçi (guard_talk) | B | "Serhatten gelen ulaklar diyor ki Haçlı kolları Tuna boyunca iniyormuş; Demirkapı geçitlerini geçmişler. Sayıları mı? Her anlatan bir katına çıkarıyor. Sen sayıya bakma beyim — sen atının nalına, okunun temrenine bak." |
| H-6 | 12 | — | Ağustos sonu: Vidin'in teslimi | Ulak (alert) | A | "📜 ULAK HABERİ: Vidin şehri Haçlı ordusuna kapılarını açtı! Bulgar kralı İvan Stratsimir direnmedi. Ordu Tuna boyunca doğuya, Rahova üzerine yürüyor." |
| H-7 | 14 | — | Eylül başı: Rahova'nın düşüşü | Kethüda sabah raporu + imam V3 | A | "Beyim, acı haber: Rahova düşmüş. Kaleyi aman ile teslim almışlar, sonra ahaliye kılıç üşürmüşler. Kaçabilen canını Tuna'nın öte yakasına atmış. Ahalimiz korkuda — 'sıra bize gelir mi' diye soranlara ne diyeyim?" |
| H-8 | 16 | quest_castle | ~12 Eylül: Niğbolu kuşatıldı | Dizdar + ulak | A (+R detay) | "🏰 Niğbolu Hisarı kuşatıldı! Kale dizdarı Doğan Bey teslim çağrısını reddetmiş, burçlarda direniyormuş. Kale dayanırsa Sultana zaman kazandırır; düşerse Tuna kapısı ardına kadar açılır." |
| H-9 | 17 | quest_castle | Eylül ortası: Sultan yürüyüşte | Ulak (alert) + kös | A | "📜 SULTANIN FERMANI: Yıldırım Bayezid Han İstanbul ablukasını kaldırıp bütün ordusuyla Rumeli'ye geçti! Sancağı altına çağrılan her tımarlı sipahi, cebelüsü ve pusatıyla orduya koşsun!" *(quest_campaign'in fiilî açılış anı)* |
| H-10 | 18 | quest_campaign aktif | Eylül: Tırnova üzerinden yaklaşma | İmam V4 | B | (Tam metin 5.3'te — V4) |
| H-11 | sefere katılım | quest_campaign | 24 Eylül gecesi: ordugâh | Kamp anlatısı (sefer arayüzü) | R | "Ateş başında eski bir akıncı anlatıyor: 'Bu gece Sultan tek başına sur dibine at sürmüş; karanlıkta kaleye seslenmiş, Doğan Bey'le konuşmuş derler. Gören yok, anlatan çok. Ama sabah kazık hattının nereye kurulacağını Sultandan iyi bilen de yok.'" *(K-39 açılır)* |
| H-12 | savaş günü | — | 25 Eylül 1396 | 5 safha vinyeti | A/B | (Bkz. 3.4) |
| H-13 | savaş + 1 | sefer bitti | Ekim 1396: zaferin yankısı | İmam V5 + kethüda | A (+R detay) | "Zafer haberi köyden köye yayılıyor. Frenk beyleri esir; Burgonya dükünün oğlu için dağ gibi fidye konuşuluyor. Ordugâhtan dönenler başka şeyler de fısıldıyor: Rahova'nın öcü esirlerden soruldu, diyorlar — kimi çok söylüyor, kimi hiç. Sultanın, zafer nişanesi olarak Bursa'da ulu bir cami yaptırmaya niyet ettiği de söyleniyor." *(K-40 açılır; Ulu Cami R kaydı — bkz. 4.1 madde 7)* |

**Kabul kriterleri (T1-T3):**
- (T1) `HISTORICAL_NEWS` dizisi 13 kayıtla mevcut; her kaydın `minDay`, `afterQuest`, `channel`, `tag`, `text` alanı dolu.
- (T2) Yeni oyunda konsoldan gün atlatıldığında (test yardımıcısı veya `daySpeed` geçici artışı) H-1→H-9 sırayla ve **asla sıra bozulmadan** gelir; `afterQuest` kapısı sağlanmadan sonraki haber gelmez.
- (T3) Aynı haber iki kez gösterilmez (id bazlı "delivered" seti; kayda girer).

### 3.3 Nöbetçi diyaloğu (`guard_talk`) — hazır metin

`guard_talk` şu an tanımsız olduğundan E tuşu 3 kale nöbetçisinde sessiz kalıyor (`src/entities/NPCManager.js:313`, `src/ui/UIManager.js:388-390`). Teknik plan diyaloğu bağlarken şu içerik kullanılır (havadis H-5 sonrası varyantı yukarıda; varsayılan varyant):

> **Nöbetçi (Gazi Hasan / Okçu Balaban / Zırhlı Nefer Timur):** "Buyur Gazi Beyim! Nöbet bizde, gözler serhatte. — Söyleyeyim mi, kale nöbetinin üç düşmanı vardır: uyku, soğuk, bir de Balaban'ın maslahat diye anlattığı bitmez hikâyeler." *(asker arası muhabbet mizahı — serbest)*
> Seçenek 1: "Serhatten ne haber?" → aktif havadis varyantına göre H-2/H-5/H-8 metninin nöbetçi ağzına uyarlanmış hâli.
> Seçenek 2: "Nöbetiniz mübarek olsun." → "Sağ olasın beyim. Sen geç, biz bekleriz — kale uyumaz."

### 3.4 Niğbolu 5 safhasına tarih vinyetleri (kes-yapıştır)

`CampaignBattleSystem.getPhaseData` (`src/systems/CampaignBattleSystem.js:40-95`) zaten data-driven; her safha nesnesine `historyNote: { tag, text }` alanı eklenir ve savaş arayüzü safha başında bu vinyeti ayrı bir "kâtip şeridi" olarak gösterir (savaş UI bağlantısı teknik plan işidir; metinler buradadır). Vinyet gösterildiğinde ilgili kodeks maddeleri açılır.

**Safha 1 — Öncü Temas (`phase_1_recon`) — [A]**
> "Kâtip yazdı: Fransız ve Burgonya şövalyeleri, Macar Kralı Sigismund'un 'öncüyü bize bırakın' ricasını dinlemedi; şeref ilk hücumundur diyerek kendi başlarına ileri atıldılar. Osmanlı öncüsüyle ilk karşılaşan onlar oldu — ve ardındaki asıl düzeni görmeden."
*(Açılır: K-38)*

**Safha 2 — Kazık Hattı (`phase_2_stakes`) — [A]**
> "Kâtip yazdı: Öncünün ardında toprak, sivri kazıklarla dikilmişti; aralarında Osmanlı okçuları bekliyordu. Şövalye atları kazıklara saplandı; asilzadeler atlarından inip zırhlarının ağırlığıyla yokuş yukarı yürümek zorunda kaldı. Kaynaklar bu hattı, savaşın kaderini çizen düzen diye anar."
*(Açılır: K-21)*

**Safha 3 — Yaya Çarpışması (`phase_3_infantry`) — [B]**
> "Kâtip yazdı: Attan inmiş şövalye, plaka zırhı içinde bir demir kuledir — ama yorulan bir kule. Kesici kılıç bu zırhtan kayar; gürz ve savaş çekici ise onu ezer. Dönemin savaş ustaları bunu bilirdi; o gün tepede bunu bilenler kazandı."
*(Açılır: K-19 pekiştirme — kodeks zaten açıksa yalnız vinyet gösterilir)*

**Safha 4 — Sigismund'un Ana Kuvveti (`phase_4_sigismund`) — [A]**
> "Kâtip yazdı: Öncünün kırıldığını gören Kral Sigismund, Macar ve Alman alaylarıyla düzenli biçimde ilerledi. Savaşın en çetin saati buydu: iki taraf da yıprandı, hat sarsıldı ama kırılmadı. Zaferi hücum değil, sabır getirecekti."

**Safha 5 — İhtiyat ve Karşı Hücum (`phase_5_counter`) — [A]**
> "Kâtip yazdı: Tam terazinin dili titrerken Sultanın sakladığı ihtiyat ve Sırp Despotu Stefan Lazareviç'in zırhlı süvarisi meydana indi. Osmanlı sancağı altında savaşan bu Hristiyan vasal kuvvetinin darbesi, Haçlı ordusunun son düzenini dağıttı. Kral Sigismund canını Tuna'daki gemilere attı."
*(Açılır: K-37; savaş sonunda H-13 ile K-40)*

**Kabul kriteri (T4):** 5 vinyet metni `getPhaseData`'daki 5 safha nesnesinde `historyNote` alanı olarak birebir mevcut; savaş akışı bağlandığında her safha başında görünür; safha 2 ve 5'te ilgili kodeks maddeleri açılır.

---

## 4. MEVCUT İÇERİĞİN DOĞRULUK DENETİMİ

Analiz envanterine (docs/fable_yol-haritasi/calisma-arsivi/analiz-tam.json) göre tarih/doğruluk düzeltme listesi. (README 72/72-97/97 çelişkisi gibi salt teknik/metin hataları teknik planın işidir; burada yalnız tarihsel doğruluk kalemleri var.)

| # | Sorun | Yer | Düzeltme | Kabul kriteri |
|---|---|---|---|---|
| 4.1 | **Kırmızı fes anakronizmi** (~430 yıl; fes 19. yy II. Mahmud dönemi). `headwear:'cap'` dalı yok; 'bork' dışındaki herkes sarık+fes giyiyor. | `src/entities/ModelBuilder.js:848-857` (fes mesh'i `ModelBuilder.js:855-857`) | Fes silindiri tamamen kaldırılır. Üç dönem başlığı kalır/eklenir: `bork` (mevcut, `ModelBuilder.js:841-847`), `turban` = beyaz sarıklı kavuk (mevcut torus sarık + fes yerine alçak yarıküre tepe, kumaş rengi 0xf5f0e0), `cap` = keçe külah (koni, boz/kahve 0x8a7a5c). NPC config'lerindeki `cap` istekleri artık gerçek külah üretir. | Kodda `fez` kelimesi ve 0x8b1e1e silindir başlık yok (grep `fez` → 0 sonuç); köy turunda hiçbir NPC'de fes görünmüyor; K-18 maddesi fes yokluğunu açıklıyor. |
| 4.2 | **"Cenevizli casus" etnik kimlik sorunu** — etnik kimlik doğrudan suç kanıtı (TARIHSEL doc 3.2 eleştirisi). | `hanci_talk` (`src/systems/DialogueSystem.js:406+`), quest_inn_spy (`src/systems/QuestSystem.js` görev 6) | **Kısa vade (bu teslim):** Metin düzeltmesi — şüphe etnik kimlikten arındırılır. Hancının ihbar repliği şöyle değişir: *"Handa bir tüccar konaklıyor beyim. Milletinden değil, kâğıtlarından şüphelendim: iki ayrı geçiş tezkeresi taşıyor, ikisinin tarihi birbirini tutmuyor. Dün gece de handan bir oğlanla mektup çıkarttı."* Kanıt bulma metni "Niğbolu ikmal yolları işaretli kroki + çelişkili tezkere" olur; "Cenevizli" kelimesi suçlama cümlelerinden çıkar (tüccarın Ceneviz'li OLMASI serbest — suçun kanıtı olması yasak). Görev tamamlama metnine tek cümle eklenir: *"Kadı naibi tembih etti: adamı milletinden değil, belgesinden yakaladık — töhmet delile bağlanır."* **Uzun vade:** TARIHSEL doc Bölüm 7 ("Hanın Yabancısı") yeniden tasarımı (ayrı iş kalemi, bu teslimin kapsamı dışında). | `DialogueSystem.js` içinde "Cenevizli" kelimesi hiçbir suçlama/kanıt cümlesinde geçmiyor; şüphe gerekçesi belge çelişkisi; denetçi görevi oynayıp yeni metinleri görüyor. |
| 4.3 | **"Sahte ricat (Turan taktiği)" tek açıklama** — kaynaklardaki katmanlı düzeni aşırı basitleştirme (TARIHSEL doc 3.2). | `src/systems/HistoryEventSystem.js:54`, `README.md:45` | HistoryEventSystem zafer metni şöyle değişir: *"…Frenk öncüsü kazık hattında kırıldı; okçu barajı, sipahi hattı ve Sultanın ihtiyatı düşmanı kat kat eritti. Sultan seni bizzat huzuruna çağırıp gazanı tebrik etti."* README 45. satır: "sahte ricat (Turan taktiği) manevrası" → "kazık hattı, okçu barajı ve ihtiyatın karşı hücumundan oluşan katmanlı savaş düzeni". Sahte ricat, YALNIZ safha 4'ün bir oyuncu SEÇENEĞİ olarak kalır (`CampaignBattleSystem.js:83` `feigned_retreat` — tarihsel olarak savunulabilir bir manevra, tek açıklama değil). | grep "Turan taktiği" → 0 sonuç; K-21 katmanlı düzeni anlatıyor. |
| 4.4 | **"12'den Vurdun (Sarı Göbek)"** — modern atıcılık dili (TARIHSEL doc 11 dil listesi). | `src/systems/ArcherySystem.js:168` | Mesaj: `'🎯 TAM İSABET! Göbeğe oturdu!'`; diğer halka mesajları "iç halka / dış halka" dilinde kalır. | grep "12'den" → 0 sonuç. |
| 4.5 | **"Yüz binlik Haçlı ordusu"** — kronik abartısı kesin bilgi gibi sunuluyor. | `src/systems/DialogueSystem.js:150` (imam havadisi) | "yüz binlik bir Haçlı ordusu" → "on binlerce askerlik büyük bir Haçlı ordusu — kimi ulaklar yüz bin diyor, Molla bunu 'korkunun matematiği' diye düzeltir". (İmam V4 metni 5.3'te bunu zaten içerir.) | İmam havadislerinde kesin dille verilen ordu mevcudu yok; K-38 ihtilafı açıklıyor. |
| 4.6 | **Koca Dede yaş tutarsızlığı** — "yaşım doksanı aştı" + 1389 Kosova'da at sürdüm ⇒ 83 yaşında muharip; gerçekçi değil. Yeni anılar (1361/1364/1371) eklenince sorun büyür. | `src/systems/DialogueSystem.js:318-321` | "Yaşım doksanı aştı" → **"Seksenime merdiven dayadım"**; Kosova cümlesi → *"Ben 1389'da Kosova sahrasında son gazamı ettim — yaşım altmışı geçmişti, kılıçtan çok duam keskindi."* Böylece: ~1316 doğum; Edirne'de ~45, Sırpsındığı'nda ~48, Çirmen'de ~55, Kosova'da ~73→ hâlâ yüksek; bu yüzden Kosova anlatısı "son gazam, saf gerisinde sancak dibindeydim" çerçevesine çekilir (5.2'deki mevcut-anı revizyonu). | dede_talk metinlerinde yaş-olay çelişkisi yok (denetçi yılları toplayarak kontrol eder; beklenen yaşlar: Edirne ~45, Sırpsındığı ~48, Çirmen ~55, Kosova ~73 — 5.2'deki anı metinleri bu yaşlarla uyumlu olmalıdır). |
| 4.7 | **Bursa Ulu Cami** — 1396 baharında tamamlanmış yapı gibi haritada. (Yapım 1396-1400; gelenek, yapımı Niğbolu zaferine/adağına bağlar.) | `src/ui/UIManager.js:753-761` harita noktaları | Bursa noktasının açıklamasından "Ulu Cami" çıkarılır → "Bursa (Hüdavendigâr) — İpek Pazarı & Yeşil Vadiler". Ulu Cami, zaferden SONRA H-13 havadisinde "Sultanın cami adağı" olarak (R kaydıyla) girer. | Sefer öncesi haritada Ulu Cami ibaresi yok; H-13 metni adağı "söyleniyor" kalıbıyla veriyor. |
| 4.8 | **"Kazasker zırhı"** (makam adıdır, zırh değil — TARIHSEL doc 3.2). | Kod genelinde | grep `Kazasker` — bulunursa teçhizat adından çıkarılır; teçhizat adları TARIHSEL doc 11 kuralına döner (malzeme+işçilik: "örme zırh", "levha takviyeli örme"). | grep "Kazasker" → teçhizat bağlamında 0 sonuç. |
| 4.9 | **Mevsim etiketi "İlkbahar (Ekim Zamanı)"** — "Ekim" ay adıyla karışıyor. | `src/core/GameState.js:113` ve `advanceSeason` dizisi (`GameState.js:258`) | "İlkbahar (Bahar Ekimi)" yapılır; Güz etiketi "Güz (Hasat Mevsimi)" kalır. | HUD'da "Ekim Zamanı" ibaresi yok. |
| 4.10 | **"3000 akçe = 1 cebelü"** basitleştirmesi kesin kanun gibi sunuluyor. | `src/core/GameState.js:93-94` yorum + Tımar Defteri "Kanunen Gereken Asker" satırı | Mekanik korunur (TARIHSEL doc Bölüm 3 "oyunun seçtiği sancak/yıl kuralı" yaklaşımı); yalnız K-14 kodeks maddesi bunun basitleştirme olduğunu açıkça söyler (metin 2.6'da hazır). Ek kod değişikliği yok. | K-14 "basitleştirilmiş temsil" cümlesini içeriyor. |
| 4.11 | **Sarıklı mezar taşı modeli** erken dönem için fazla gelişkin (başlıklı şahide geleneği ağırlıkla sonraki yüzyıllar). | `src/entities/ModelBuilder.js:1405-1428` | Görsel değişiklik İSTENMEZ (maliyet/fayda düşük); dengeleme metinle yapılır: K-27 kodeks maddesi uyarlamayı açıkça söyler (metin hazır). | K-27 "bilinçli uyarlama" cümlesini içeriyor. |
| 4.12 | **İmamın workType'ı `'innkeeping'`** — din adamı temsil özensizliği. | `src/entities/NPCManager.js:74` | `workType: 'imam'` yapılır; VillagerAI çalışma animasyonu mescid avlusunda bekleme/okuma duruşuna bağlanır (ibadet animasyonu 04-islami-icerik kapsamıdır; burada yalnız yanlış etiketin düzeltilmesi istenir). | İmam öğlen hancı gibi kupa kaldırmıyor. |
| 4.13 | **"Steam Sürümü v1.0 • Mount & Blade ve Kingdom Come İlhamlı"** ibaresi — marka adları + yanlış beklenti. | `index.html:359` | İbare kaldırılır → "1396 Niğbolu Dönemi Osmanlı Tımar Simülasyonu" (ikame metin 05-teknik-plan.md §3.3 ve 06-fazlar-ve-kabul.md F0-09 ile birebir aynıdır). | Başlangıç ekranında üçüncü şahıs marka adı yok; ikame metin F0-09'daki metinle birebir aynı. |

**Kabul kriteri (D-genel):** Yukarıdaki 13 satırın her biri ya uygulanmış ya da satırında "kapsam dışı/uzun vade" olarak açıkça işaretlenmiş durumda; denetçi grep komutlarını (4.1, 4.3, 4.4, 4.8) çalıştırarak doğrular.

---

## 5. ÇEVRESEL ANLATI

### 5.1 Hazire kitabeleri: 9 şahide, 9 mikro-ders

**Teknik yuva:** Hazire 3×3 = 9 mezar taşı üretir (`src/entities/TownGenerator.js:186-193` döngüsü). Her taşa `KITABE_DATA[i]` bağlanır ve `this.interactables` dizisine (`src/entities/TownGenerator.js:20` — şu an hep boş) `{ type:'tombstone', id, position }` push edilir. `src/main.js:321-351` updateInteractionPrompts genişletilir: yakın interactable için "🪦 [E] Kitabeyi Oku"; okuma, diyalog modalının tek-metin görünümüyle yapılır (yeni UI icat edilmez). İlk okumada K-27 açılır. **Mezarlıkta mizah yasaktır** (sabit karar); prompt ve metinler ciddi kalır.

Kitabe dili: erken Osmanlı taşlarının çoğu Arapça'dır; oyun okunabilirlik için sade Türkçe uyarlama kullanır (K-27 bunu açıklar). Her kitabe **[R]** etiketiyle gösterilir (kişiler kurgu, kalıplar dönem üslubu uyarlaması). Dua kalıpları Ehl-i sünnet geleneğinin muteber kalıplarıdır (Fâtiha talebi, rahmet duası); uydurma/şüpheli ibare yoktur (ayrıntılı dinî üslup onayı: bkz. 04-islami-icerik).

**Kitabe metinleri (kes-yapıştır):**

1. **Kosova Şehidi (makam taşı):**
"Hüve'l-Hayyü'l-Bâkî. Bu taş, Kosova sahrasında şehit düşen sancaktar Turhan oğlu Saruca'nın makamıdır. Tenini o mübarek meydanın toprağı sakladı; adını bu taş saklar. Sene 791. Ruhuna Fâtiha."
*(Mikro-ders: şehidin düştüğü yere defni ve geride "makam taşı" dikilmesi âdeti; Hicri 791 ≈ 1389.)*

2. **Çirmen Gazisi:**
"Merhum Kara Doğan, Bahadır oğlu. Çirmen cenginde gazi oldu; kılıç artığı ömrünü bağında, torun sesinde tamam etti. Yolcu, bir Fâtiha çok mudur?"
*(Mikro-ders: gazinin savaştan sağ dönüp eceliyle ölmesi de bir mertebe; Çirmen 1371 → K-32 bağlantısı.)*

3. **Köyün Kurucusu:**
"Bu köye ilk kazmayı vuran Halil Dede'dir; Karesi ilinden sürüsüyle göçüp gelmiş, çeşmeyi o akıtmıştır. Toprağı bol, makamı cennet ola."
*(Mikro-ders: Anadolu'da yörük göçü ve köy kuruluşu; Karesi = oyundaki gerçek sancak adı, `src/core/GameState.js:25-30`.)*

4. **Taun Kurbanı:**
"Attar Musa bin İlyas. Büyük kıran (taun) yılında hastaların başından ayrılmadı; Hakk'ın rahmetine el verdiği kullarının ardından yürüdü. Rahmetullahi aleyh."
*(Mikro-ders: Kara Ölüm/veba dalgaları 14. yüzyıl Anadolu-Balkan dünyasının ortak felaketiydi; hastaya bakanın fedakârlığı.)*

5. **Ebe Hatun (kadın şahidesi — başlıksız, yalın taş):**
"Merhume ve mağfure Ebe Ayşe Hatun. Bu köyün üç kuşağı onun elinde dünyaya geldi. Doğurttuğu her can, terazisinde bir hasene ola. Ruhiçün Fâtiha."
*(Mikro-ders: kadın mezar taşlarının başlıksız/yalın biçimi; ebeliğin toplumdaki yeri.)*

6. **Eski İmam (ciddi, saygılı):**
"Kırk yıl bu mescidde imamet eden Hafız Mahmud Efendi burada yatar. İlim öğretti, ara buldu, kimseyi kapısından boş çevirmedi. Rabbim makamını âlî eylesin."
*(Din adamı kabri — mizahtan ve her türlü hafiflikten uzak; sabit karar 18.1.)*

7. **Ahi Ustası:**
"Ahi ocağından Demirci Davud Usta. Helal kazandı, çırak yetiştirdi, hile bilmedi. Kuşağı ocağına, ruhu Rahman'a emanet. Fâtiha."
*(Mikro-ders: ahi kuşağı ve ocak-çırak geleneği → K-22 bağlantısı.)*

8. **Genç İvaz:**
"Değirmenci Yusuf'un oğlu İvaz. On yedi yaşında Meriç suyunda boğuldu. 'Küllü nefsin zâikatü'l-mevt' — her nefis ölümü tadıcıdır. Sabreden babasına sabır, İvaz'a rahmet."
*(Mikro-ders: taşlarda âyet iktibası geleneği; âyet meali doğru ve muteberdir — Âl-i İmrân 185.)*

9. **Okunamayan Taş:**
"(Taşın yüzü yosun tutmuş, yazısı silinmiştir. Kâtip şerhi: Kim bilir kimdi. Tarih bazen susar; susan taşa da Fâtiha okunur.)"
*(Mikro-ders: kaynakların sessizliği — D5 ilkesinin dünyadaki sureti. Bu taş kodekste K-27'nin "related" hattına bağlanır.)*

**Kabul kriteri (E1):** 9 taşın her birine E ile yaklaşınca farklı kitabe açılır; metinler yukarıdakiyle birebir; ilk okumada K-27 kodeks bildirimi gelir; hazirede hiçbir mizahi metin/emoji yok (🪦 prompt ikonu hariç).

### 5.2 Koca Dede'ye 3 yeni anı dalı

**Teknik yuva:** `dede_talk.choices` dizisine (`src/systems/DialogueSystem.js:325-351`) 3 yeni seçenek eklenir. Kod deseni mevcut Kosova dalıyla aynıdır (label → action → text → nested choices). **Ödül verilmez** (bilgi dalları ödül enflasyonu yaratmasın — TARIHSEL doc 9.8); yalnız kodeks açılır. Mevcut Kosova metnindeki yaş sorunu 4.6'daki revizyonla birlikte uygulanır.

**Anı 1 — 1361 Edirne (label: `🏰 "Dede, Edirne'nin alınışını sen gördün mü?"`):**
> "Gördüm ya... Kırkımı süren dinç bir akıncıydım o vakit. Sazlıdere'de Rum ordusunu dağıttık; şehir kapılarını kılıçla değil, aman ile açtı — Lala Şahin Paşa öyle buyurmuştu: 'Teslim olana kılıç yok.' Sonra ne oldu bak: o şehir bugün Sultanın Rumeli tahtı oldu. Ferman oradan çıkar, ordu orada toplanır. Bir kapı ki aman ile açıldı, devlet kapısı oldu."
> → Seçenek: "Devlet kılıçla açar, adaletle oturur demek ki." → "Ha şöyle! Belle bunu: kılıç kapıyı açar, nizam içeride tutar."
*(Açılır: K-30, K-15. Tarihî çapa: Sazlıdere, Lala Şahin Paşa, fethin aman ile oluşu; fetih yılı ihtilafı kodekste — Dede'ye kesin yıl SÖYLETİLMEZ. Yaş çapası: 4.6 revizyonuna göre Dede Edirne'de ~45 yaşındadır; "sakalı yeni terlemiş genç" gibi yaş tablosuyla çelişen ifade kullanılmaz.)*

**Anı 2 — 1364 Sırpsındığı (label: `🌙 "Sırpsındığı cengini anlat — hani şu gece baskınını."`):**
> *(Dede sesini alçaltır.)* "Onu sorana hep aynı şeyi derim: Hacı İlbey bir gece, bir avuç akıncıyla koca orduyu Meriç'e döktü — DERLER. Ben o yıllarda serhatteydim; kızıl ufukları gördüm, kaçışan kervanları gördüm, ama o geceyi görmedim. Sonradan kâtipler bu cengi başka cenklerle karıştırır oldu. Sen yine dinle evlat — ama şunu da belle: her duyduğun, görülmüş değildir. Duyduğunu 'duydum' diye anlatan yalancı olmaz; 'gördüm' diye anlatan olur."
> → Seçenek: "Yani bu cenk oldu mu, olmadı mı?" → "Meriç boyunda çok cenk oldu oğul. Hangisine hangi ad kaldı — onu Allah bilir, bir de belki kâtipler yanılır. Benden sana kalan ders cenk değil, edeb: bilmediğine 'bilmem' de."
*(Açılır: K-31. Bu dal, kaynak eleştirisini DİEGETİK olarak öğretir — D5 ilkesinin ana örneği. R çerçevesi Dede'nin kendi ağzından kurulur.)*

**Anı 3 — 1371 Çirmen (label: `⚔️ "Meriç kıyısındaki büyük cengi — Çirmen'i — sen yaşadın mı?"`):**
> "Onu gördüm işte, hem de şu iki gözümle. Meriç kenarında, Çirmen önünde, sabaha karşı vurduk. Sırp kralları Vukaşin ile kardeşi Uglyeşa koca ordularıyla gelmişti; baskının şaşkınlığında saflar birbirine girdi, kaçanı Meriç aldı. O sudan o gün çok can geçti, azı karşıya vardı. O günden sonra Makedonya'nın yolu bize açıldı — ama ben ne zaman o suyu ansam, zaferden önce boğulanların çığlığını duyarım. Zafer tatlıdır oğul; bedeli hep acıdır."
> → Seçenek: "Allah geçmişlerine rahmet eylesin — düşene de." → "İşte şimdi sipahi oldun. Düşmanın ölüsüne sevinmeyeni Meriç bile saygıyla anar."
*(Açılır: K-32. Tarihî çapa: 26 Eylül 1371, Vukašin ve Uglješa'nın ölümü, Makedonya yolunun açılışı. Ton: zafer + insani maliyet birlikte — TARIHSEL doc 15 "temsil" kuralı.)*

**Kabul kriteri (E2):** dede_talk'ta Kosova dalına ek 3 yeni dal var; metinler birebir; hiçbirinde akçe/itibar ödülü yok; her dal kendi kodeks maddesini açıyor; 4.6 yaş revizyonu uygulanmış.

### 5.3 İmam havadis bülteni: görev durumuna bağlı 5 varyant

**Teknik yuva:** `imam_talk`'ın "Rumeli havadisleri" dalı (`src/systems/DialogueSystem.js:146-161`). `getDialogueData` her çağrıda nesneyi yeniden kurduğundan (`DialogueSystem.js:11`) koşullu metin doğrudan action içinde seçilebilir:

```js
// DialogueSystem içinde yardımcı (yeni):
function imamNewsVariant() {
  const q = (id) => questSystem.getQuestById(id);
  if (gameState.activeCampaign?.isResolved) return V5;
  if (q('quest_campaign')?.status === 'active' || gameState.daysPassed >= 17) return V4;
  if (gameState.daysPassed >= 13) return V3;
  if (gameState.daysPassed >= 7)  return V2;
  return V1;
}
```

Her varyant duayla biter (imam karakteri; mizah yok — sabit karar). Metinler:

**V1 — Bahar başı (varsayılan):**
> "Ulakların dilinde iki haber var evlat. Biri eski: Sultanımız İstanbul'u abluka altında tutar; surların ardındaki kayser dara düşmüştür. Biri taze: Macar kralı, Frenk diyarına elçiler salmış; kiliselerde bize karşı sefer vaaz ediliyormuş. Geçen yılki Rovine'nin kanı daha kurumadı — Rabbim memleketimizi fitneden esirgesin. Sen işine bak, tarlana bak; vakti gelirse çağrılırsın."
*(Açılır: K-35.)*

**V2 — Toplanma (gün ≥ 7):**
> "Havadis kesinleşti: Frenk, Alaman ve Macar askeri Buda şehrinde toplanıyormuş. Başlarında Macar Kralı Sigismund, yanında Burgonya dükünün oğlu Jean. Rodos şövalyeleri de denizden katılmış. Kalabalık ordu, çok başlı ordu demektir; çok başlı ordunun yüreği tek atmaz. Yine de gafil olmayalım — Rabbim serhat ehline kuvvet versin."
*(Açılır: K-38.)*

**V3 — Vidin ve Rahova (gün ≥ 13):**
> "Kara haberler geldi evlat. Vidin kapılarını açmış; Rahova ise aman verilmişken kılıçtan geçirilmiş — kadın, çocuk demeden. Kaçabilen Tuna'yı yüzerek geçmiş. Ahalimiz korkar, sorar: 'Sıra bize gelir mi?' Ben onlara sabrı ve duayı öğütlerim; sana ise hazırlığı: ambarını say, pusatını yokla. Zalimin zulmü varsa mazlumun da Allah'ı var."
*(Sivil maliyet vurgusu — TARIHSEL doc 15 kuralı: savaş güzellenmez.)*

**V4 — Kuşatma ve yürüyüş (quest_campaign aktif veya gün ≥ 17):**
> "Niğbolu Hisarı kuşatıldı; dizdar Doğan Bey teslim olmayıp direniyormuş — Allah kuvvet versin. Sultanımız İstanbul önünden kalkıp bütün ordusuyla Rumeli'ye geçti; Edirne'den Tuna'ya yıldırım gibi yürüyor. Ulaklar düşmana 'yüz bin' diyor; sen korkunun matematiğine kapılma — on binlerce oldukları muhakkak, gerisi rivayet. Hazırlığını tamam eyle beyim: bu ferman senin de fermanındır. Rabbim gazanızı mübarek eylesin."
*(Açılır: K-39 tetikleyicisiyle koordineli; "korkunun matematiği" düzeltmesi 4.5'i uygular.)*

**V5 — Zafer sonrası (activeCampaign.isResolved):**
> "Elhamdülillah — zafer haberi mihraba kadar geldi. Lakin dinle: zafer övünmek için değil, ibret içindir. Frenk beyleri esir düştü, fidyeleri konuşuluyor; ordugâhtan dönenler Rahova'nın hesabının esirlerden sorulduğunu da fısıldıyor — Rabbim cümle ümmete adaleti unutturmasın. Sen köyüne dön, yaralına bak, borcunu öde, şükrünü eda et. Gazanın tamamı budur."
*(Açılır: K-40 ile koordineli. İnfaz konusu ne atlanır ne gösteriye dönüştürülür — TARIHSEL doc 15.)*

**Kabul kriteri (E3):** İmamın havadis dalı oyun ilerledikçe 5 farklı metin döndürür (denetçi gün/görev durumunu değiştirerek 5'ini de görür); tümü dua ile biter; hiçbirinde mizah yok; V4 "yüz bin" ifadesini rivayet olarak işaretler.

---

## 6. KAYNAKÇA VE DOĞRULUK PROTOKOLÜ

### 6.1 Geliştirici kontrol listesi (her yeni tarihi içerik için, İSTİSNASIZ)

Yeni bir diyalog, havadis, kodeks maddesi, görev metni veya isim eklerken şu 10 soru sırayla cevaplanır; biri "hayır" ise içerik girmez:

1. **Etiket:** İçeriğin A/B/C/R etiketi belirlendi mi? (Kodekste rozet, diyalogda dil kalıbı: R → "derler ki / rivayet olunur".)
2. **Kaynak:** A için en az bir modern akademik kaynak veya TDV İslâm Ansiklopedisi maddesi; B için en az bir akademik yeniden kurma; R için kronik/anlatı kaynağı gösterildi mi? (Kaynak, commit mesajına veya `CodexData.js` yorum satırına yazılır.)
3. **Anakronizm taraması:** Nesne/terim/kıyafet 1396'da var mıydı? Yasak liste (grep ile denetlenir): *fes, kazasker zırhı, Turan taktiği (tek açıklama olarak), masöz, taktik radar, 12'den vurmak, top/tüfek (bireysel silah olarak), kahve, tütün, patates/domates/mısır/biber (Yeni Dünya ürünleri), matbaa, mehter "marşı" (kurumsal mehterhane ayrıntıları için temkin).*
4. **Sayı disiplini:** Ordu mevcudu, para, kayıp gibi sayılar aralıklı ve ihtilaf kaydıyla mı verildi? Kroniklerdeki abartı kesin dille aktarılmadı mı?
5. **Dil:** TARIHSEL doc 11 kuralı — anlaşılır modern Türkçe + dönem terimleri; yapay Osmanlıca yığması yok; sistem anlatıcısında "küffar" yok (yalnız uygun karakter ağzında).
6. **Temsil:** Hiçbir etnik/dinî grup tek ahlaki kalıba indirgenmedi (TARIHSEL doc 15); suç daima kişiye ve delile bağlı, kimliğe değil (4.2 dersi).
7. **Mizah sınırı:** Din adamı, ibadet, dinî değer, mezarlık, şehitlik bağlamında mizah SIFIR. Mizah yalnız dünyevi alanda (esnaf, hamam, çarşı, asker muhabbeti) ve bilgiyi taşıyacak biçimde.
8. **İslami içerik hattı:** İçerik itikat/fıkıh/ibadet alanına giriyorsa bu doküman değil **04-islami-icerik** protokolü uygulanır (Hanefî-Mâturîdî çizgi, sahih kaynak şartı); buradaki tarih içeriği o alana taşarsa "bkz. 04" notu düşülür.
9. **Yoğunluk bütçesi:** 1.2'deki kurallar (düğüm başına ≤2 yeni terim, ilk geçişte bağlam içi açıklama) uygulandı mı?
10. **Üç temas:** Yeni kavramın T1-T2-T3 haritası (1.3) kurulabildi mi? Kurulamıyorsa kavram ya ertelenir ya kodekse alınmaz.

### 6.2 Ana kaynak rafı (geliştiricinin başvuru sırası)

**Birinci raf — kurumlar ve kavramlar (A etiketi dayanağı):**
- TDV İslâm Ansiklopedisi (islamansiklopedisi.org.tr) maddeleri: *Tımar, Cebelü, Sipahi, Berat, Öşür, Reâyâ, Kadı, Kethüdâ, Ahîlik, Gazâ, Vakıf, Akçe, Hamam, Bayezid I, Murad I, Niğbolu Savaşı, Edirne, Çirmen Savaşı, Kosova Savaşları.* (TARIHSEL doc 16 ile aynı hat; ücretsiz, Türkçe, hakemli.)
- Halil İnalcık, *Osmanlı İmparatorluğu Klasik Çağ (1300-1600)* — tımar, reaya, adalet dairesi, taşra düzeni.
- Yusuf Halaçoğlu, *XIV-XVII. Yüzyıllarda Osmanlılarda Devlet Teşkilâtı ve Sosyal Yapı* (TTK) — teşkilat terimlerinin denetimi.
- Ömer Lütfi Barkan'ın kanunname ve "çift resmi" çalışmaları — vergi adları ve oranları.
- İsmail Hakkı Uzunçarşılı, *Osmanlı Tarihi I* (TTK) — olay kronolojisi çapraz kontrolü.

**İkinci raf — Niğbolu 1396 (olay ve askeri yeniden kurma; A/B):**
- TDV İA "Niğbolu Savaşı" maddesi (ana çerçeve).
- David Nicolle, *Nicopolis 1396: The Last Crusade* (Osprey) — muharebe safhalarının görsel/askeri yeniden kurması (B düzeyi dayanak).
- Johann Schiltberger, *Türkler ve Tatarlar Arasında (1394-1427)* — esir görgü tanığı; infaz ve esaret anlatısının birincil kaynağı (R/B; tanıklığı değerli, sayıları abartılı olabilir).
- Froissart Kronikleri — Batı bakışı; TARIHSEL doc 16'nın kullanım notu aynen geçerli: kıyafet/motivasyon için fotoğraf gibi değil, karşılaştırma için.

**Üçüncü raf — Osmanlı kronikleri (R etiketi dayanağı):**
- Âşıkpaşazâde Tarihi, Neşrî *Cihannümâ* — Sırpsındığı, Doğan Bey rivayeti, Murad'ın şehadet duası gibi anlatıların KAYNAĞI olarak; bu kaynaklardan gelen renkli ayrıntı oyunda daima R çerçevesiyle sunulur.

**Kural:** Bir bilgi yalnız üçüncü raftan geliyorsa asla A/B etiketi alamaz. Birinci/ikinci raf ile çelişen kronik anlatısı ya atılır ya açıkça R olarak dramatize edilir (Sırpsındığı örneği: 5.2 Anı 2).

### 6.3 Sürüm disiplini

- Her içerik PR'ının açıklamasına şu satır eklenir: `History-content: <etiket(ler)> / kaynak: <kısa referans>` (örn. `History-content: A / TDV-Timar, Inalcik-KlasikCag`).
- `CodexData.js` ve `HistoricalNews.js` içindeki her kayda kaynak yorum satırı düşülür: `// src: TDV "Cebelü"; Inalcik s.114-118`.
- Tarih içeriği değiştiren PR, bu dokümanın 6.1 kontrol listesine göre kendi kendini denetler (checklist PR şablonuna kopyalanır).

---

## 7. TESLİM VE KABUL ÖZETİ (denetçi tablosu)

| Teslimat | İçerik | Doğrulama |
|---|---|---|
| **T-A Kodeks** | `src/data/CodexData.js` (40 madde, 2.6 metinleriyle) + `src/systems/CodexSystem.js` + `#codex-modal` + K tuşu | C1, C2, C3 kriterleri; `tests/systems.test.js`'e eklenen veri bütünlüğü testleri geçer: (a) `CODEX_ENTRIES.length === 40`, (b) id'ler benzersiz, (c) `tag ∈ {A,B,C,R}`, (d) her maddede `gameText`/`historyText` ≥ 80 karakter, (e) şu 20 id mevcut: `timar, dirlik, berat, osur, cift_resmi, cebelu, ciftbozan, kadi, kethuda, ahilik, gaza, akinci, kosova_1389, rovine_1395, nigbolu, yildirim_bayezid, hacli_bilesimi, dogan_bey, kazik_hatti, esir_fidyesi` |
| **T-B Havadis akışı** | `src/data/HistoricalNews.js` (13 kayıt, 3.2 metinleriyle) + gün-dönümü entegrasyonu + imam 5 varyant + guard_talk içeriği | T1, T2, T3, E3 kriterleri; sıra asla bozulmaz; her haber tek kez |
| **T-C Niğbolu vinyetleri** | `getPhaseData` 5 safhasına `historyNote` (3.4 metinleri) | T4 kriteri |
| **T-D Doğruluk düzeltmeleri** | Bölüm 4 tablosundaki 13 kalem | D-genel kriteri + grep kontrolleri (fez=0, "Turan taktiği"=0, "12'den"=0, Kazasker=0) |
| **T-E Çevresel anlatı** | 9 kitabe + interactables bağlantısı; Koca Dede 3 anı; imam varyantları | E1, E2, E3 kriterleri |
| **T-F Felsefe uyumu** | 1.2 yoğunluk bütçesi ve 1.3 üç-temas haritası | B1, B2 kriterleri (denetçi ilk 10 dakikayı oynayıp terim sayar; 20 satırlık temas tablosunu doğrular) |
| **Ön koşul (teknik plan)** | Bildirim render düzeltmesi (`UIManager.js:1249-1260`), `checkHistoricalEvents`'in nötrleştirilmesi (`GameState.js:263-268`; 06-fazlar-ve-kabul.md kararı — sıralama "düzeltmesi" değil, devre dışı bırakma/kaldırma), `guard_talk`/`saka_talk` ve `water_dispute_talk` bağlanması, kayıt sistemi (kodeks/haber durumu kayda girecek) | Bu doküman kapsamındaki içerik, bu düzeltmeler olmadan "teslim edildi" sayılmaz |

**Uygulama sırası önerisi (bağımlılığa göre):** (1) T-D metin düzeltmeleri (bağımsız, düşük risk) → (2) T-A kodeks altyapısı + 40 madde → (3) T-E çevresel anlatı → (4) T-B havadis akışı → (5) T-C savaş vinyetleri (safhalı savaş UI'sının teknik planda bağlanmasıyla birlikte).
