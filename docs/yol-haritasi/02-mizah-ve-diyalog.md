# 02 — Mizah ve Diyalog Tasarım Belgesi
### Mülk-i Osmanî: Tımarlı Sipahi 3D — "Tebessüm Katmanı"

> **Bu doküman ne için:** İşverenin "oynarken zamanın nasıl geçtiğini anlamayacakları, küçük nükte ve espirilerin olduğu, Osmanlı/Türk tarihini ve İslami değerleri öğreten" oyun hedefinin **mizah ve diyalog ayağını** uygulanabilir hâle getirir. İçinde: (1) yazım üslup rehberi ve kesin yasaklar, (2) mevcut NPC kadrosunun komik rol haritası, (3) kes-yapıştır kalitesinde ~150 replik/metin (eksik `saka_talk` ve `guard_talk` diyalog ağaçları dâhil), (4) her içeriğin hangi kod kancasına (dosya:satır) bağlanacağı, (5) veri formatı önerisi (`src/data/humor.js`), (6) dramatik anlarda mizahı susturan ton dengesi bayrakları ve (7) denetçinin kabul kriterleri vardır. Bu doküman `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` ile **çelişmez, üzerine inşa eder** (özellikle Bölüm 11 dil kuralları ve 18.1 mizah/antagonist kuralı). Uygulayıcı geliştiricinin başka hiçbir soruya ihtiyacı kalmaması hedeflenmiştir.

---

## 0. Bağlayıcı Çerçeve (özet — tartışmasız)

1. Kampanya: 1396 ilkbaharı → 25 Eylül 1396 Niğbolu (TARIHSEL doc Bölüm 5). Mizah içeriği bu takvimin **dışına taşan gönderme yapamaz** (ör. fes, kahvehane, tütün, lale devri YOK — kahve Osmanlı'ya 16. yy'da girer, fes 19. yy'dır; analiz de ModelBuilder.js:842-858'deki fesi anakronizm olarak işaretledi).
2. Tarihsellik etiketi: **A / B / C / R** (TARIHSEL doc 4.2). Bu dokümandaki tüm mizah içeriği **C (dramatik bileşim)** etiketlidir; mizah repliğinin *içine gömülü* tarih/din bilgisi ise ayrıca A/B/R doğrulamasına tabidir (Bölüm 1.4).
3. İslami içerik **Ehl-i Sünnet çizgisinde**: Hanefî fıkhı, Mâturîdî itikadı; yalnız sahih/muteber kaynak (bu dokümanda geçen tek hadis metni Bölüm 3-a'da kaynağıyla verilmiştir). Uydurma rivayet, mezhep tartışması, modern polemik YOK.
4. **Din adamı, ibadet, ayet, dua, mescid, hazire asla mizah nesnesi olmaz** (TARIHSEL doc 18.1 + 15 "dinî mekân buff istasyonu olmasın"). Mizah dünyevi hayatta yaşar: esnaf, köylü, hamam, çarşı, asker muhabbeti, hayvanlar, hava, defter-hesap işleri.
5. Mimari korunur: içerik mevcut `DialogueSystem.getDialogueData()` veri kalıbına ve mevcut kancalara eklenir; yeni diyalog motoru YAZILMAZ. Cerrahi değişiklik, aşamalı teslim.
6. Tüm oyun-içi metin Türkçe; kod tanımlayıcıları/commit İngilizce.

**Teknik ön koşul (bağımlılık):** Mizahın ana dağıtım kanalı `gameState.addNotification` → `UIManager.renderNotifications`'tır ve bu kanal şu an **kırık** (her karede `innerHTML=''` ile animasyon sıfırlanıyor, bildirimler fiilen görünmüyor — UIManager.js:1249-1260, analiz "kritik" bug). Bu dokümandaki bildirim-tabanlı içerikler, teknik plandaki bildirim düzeltmesi yapılmadan **kabul edilemez**. Aynı şekilde `saka_talk`/`guard_talk` ağaçları eklenmeden önce bilinmesi gereken: bu ID'ler NPC'lere zaten atanmış (NPCManager.js:193 ve NPCManager.js:313), yani NPC tarafında **sıfır değişiklik** gerekir; yalnız DialogueSystem.js'e veri eklenecek.

---

## 1. ÜSLUP REHBERİ

### 1.1 Nüktenin tanımı — beş kural

Bu oyunun mizahı **meddah / Nasreddin Hoca / Karagöz-Hacivat** damarından beslenir; hedef **kahkaha değil tebessümdür**. Kurallar:

1. **Tebessüm, kahkaha değil.** Replik sesli güldürmek için değil, oyuncunun dudağını kıpırdatmak için yazılır. Test: repliği sesli okuyan biri gülmek zorunda kalmıyor ama gülümsüyorsa doğrudur.
2. **Espri anlatının içinde saklıdır.** Hiçbir replik "espri olsun diye" var olmaz; her replik önce **işini yapar** (bilgi verir, görev ipucu taşır, dünyayı anlatır), mizah yan üründür. Örnek: nöbetçinin "eşeği esir aldık" repliği aynı zamanda hancıyı ve kale gece nöbetini anlatır.
3. **Mizahın nesnesi:** konuşanın kendisi (öz-alay), dünyevi zorluklar (yorgunluk, hesap-defter, kırba, karga, dizler), hayvanlar ve hâl komedisi. **Asla:** kutsal olan, zayıfı ezmek, bir etnik/dinî grubu küçümsemek, ölümün kendisiyle alay.
4. **Deadpan (ciddi yüz) esastır.** Karakter komik olduğunu bilmez; kimse "şaka yaptım" demez, kimse gülmez. Meddah dönüş cümlesi tekniği kullanılır: ciddi tasvir + son cümlede beklenmedik küçük dönüş ("...Haçlı değil, hancının kaçmış eşeğiymiş.").
5. **Tekrar espriyi öldürür.** Aynı kalıp oyuncuya oturum başına en fazla bir kez gösterilir; tüm havuzlar rotasyonlu ve "son gösterileni tekrarlamaz" mantıklıdır (Bölüm 5'teki `pick()` sözleşmesi).

**Ton kaynakları ve dozları:**
- *Nasreddin Hoca:* kendine gülen bilgelik, ters mantık ("Uyumuyordum, gözümü dinlendiriyordum"). → köylüler, saka.
- *Meddah:* abartılı tasvir + tek cümlelik dönüş. → nöbetçiler, hamam.
- *Karagöz-Hacivat:* statü farkı atışması (usta-çırak, iki nöbetçi) — ama Karagöz'ün kaba sokak ağzı OLMADAN. → demirci ocağı.
- *Mizah bütçesi:* Oyuncu saatte ortalama **6-10** mizah temasından fazlasına maruz kalmamalı (kanal başına cooldown'lar Bölüm 4 tablosunda).

### 1.2 Dönem dili kuralları

**İlke (TARIHSEL doc Bölüm 11 ile aynı):** Anlaşılır modern Türkçe + dönem terimleri. Yapay Osmanlıca yığını YOK; her karakteri birbirine benzeten sürekli ağdalı dil YOK.

**Kullanılacak kelime/kalıp havuzu (serbest):**
bre, hele, beyim, ağa, usta, hocam, efendi, devletlü, gazi, evlat, aht, pusat, kırba, testi, kile, zahire, harman, öşür, defter, mühür, berat, nöbet, karavana, tirkeş, hisar, burç, dizdar, kethüda, arzuhal, maslahat, havadis, yadigâr, helal olsun, bereket versin, maşallah, inşallah, eyvallah, baş üstüne, sağ olasın, kolay gelsin, sıhhatler olsun, "derler ki", "vallahi", "hamdolsun", "Allah bilir".

**Yasaklı/anakronik kelimeler (grep listesi — kabul kriteri 7.2'de taranır):**
`tamam` (onay ünlemi olarak; "tamamlandı" fiili serbest), `ok(ey)`, `süper`, `harika` (modern ünlem tonuyla), `sorun yok`, `stres`, `panik`, `plan yap`, `sistem`, `radar`, `masöz`, `12'den`, `taktik`, `motivasyon`, `enerji`, `pozitif`, `bonus`, `level`, `skor`, `kanka`, `abi/abla` (hitap), `bay/bayan`, `lütfen` yerine `kerem et/buyur`, `merhaba` yerine selam kalıpları. Ayrıca TARIHSEL doc 11 gereği: "kılıçtan geçir" sistem metinlerinde kullanılmaz; "küffar" yalnız buna uygun tek tük karakter ağzında, sistem anlatıcısında "Haçlı ordusu".

**Selamlaşma kuralı:** Dinî selam kalıpları ("Esselamü aleyküm...") mevcut diyaloglardaki gibi **ciddi bağlamda** kullanılır; selamlaşma hiçbir replikte espri malzemesi yapılmaz. Mizahi sahne selamla açılacaksa nötr kalıp kullanılır ("Buyur beyim", "Hoş geldin beyim").

**Cümle uzunluğu ve biçim sınırları (denetlenebilir):**

| Metin türü | Sınır |
|---|---|
| Diyalog ana metni (`text`) | en fazla 3 cümle / ~320 karakter |
| Diyalog seçeneği (`label`) | tek cümle / ~90 karakter |
| Meydan/dünya baloncuğu | ~90 karakter |
| Bildirim (`addNotification`) | ~120 karakter |
| Harami son sözü | ~80 karakter |
| NPC durum etiketi | ~34 karakter (parantez + emoji dâhil) |
| Başarım adı / açıklaması | 2-4 kelime / ~90 karakter |

**Hitap tablosu:**

| Konuşan → Muhatap | Hitap |
|---|---|
| Reaya → oyuncu | "Beyim", "Gazi Beyim"; resmî anda "Devletlü Beyim" |
| Esnaf/Ahi → oyuncu | "Bey", "Sipahi Beyim" |
| Asker → oyuncu | "Beyim" + kısa asker cümleleri |
| Oyuncu → yaşlı erkek | "(İsim) Ağa" (Yakub Ağa, İbrahim Ağa) |
| Oyuncu → zanaatkâr | "Usta" |
| Oyuncu → âlim | "Hocam", "Molla Efendi" (asla lakap/şaka yollu değil) |
| Oyuncu → genç | çıplak isim ("Salih", "Ali") |

**Mutlak kural — oyuncu adı:** Yeni yazılan hiçbir replik oyuncuya sabit isimle hitap ETMEZ (mevcut "Gazi Murad Bey" hatası: DialogueSystem.js:111 ve 550; sipahi adı prosedürel, GameState.js:16-23). Yalnız "beyim / Gazi Beyim / Sipahi Bey" kullanılır. Mevcut iki sabit ismin temizliği teknik planın işidir; bu doküman yeni içerikte tekrarını yasaklar.

**Yazım:** "â" inceltmesi yalnız yaygın kelimelerde (gazâ, ordugâh, kethüda serbest biçim "kethüda"); ölçüsüz transkripsiyon yok. Emoji kullanımı mevcut kod desenine uyar (seçenek etiketlerinde 1 adet, durum etiketlerinde 1 adet); TARIHSEL doc 9.9 "emoji ağırlığını azalt" dediği için **yeni içerik emoji sayısını artırmaz, mevcut deseni aşmaz**.

### 1.3 YASAKLAR (istisnasız)

1. **Din, ibadet, din adamı, ayet, hadis, dua, ezan, namaz, mescid, hazire/mezarlık, şehitlik mizah nesnesi/aracı olamaz.** (Ayrım: `dua` kelimesinin "duan olur mu", "sen dua et, yeter" gibi saygılı halk kalıpları içinde geçmesi serbesttir; yasak olan, duanın espri nesnesi/aracı yapılmasıdır — denetim kuralı §7.2'dedir.) İmam Molla Şemseddin hiçbir esprinin ne öznesi ne nesnesidir; hakkında dedikodu bile yazılmaz. "Zemzem", "cennet/cehennem", "melek", "günah" kelimeleri espri cümlesi içinde geçemez. Din içeriği yalnız ciddi/öğretici tonda ve muteber kaynakla verilir.
2. **Etnik/dinî gruplara aşağılama yok.** Rum, Bulgar, Sırp, Frenk, Ceneviz, zimmî, Yahudi vb. hiçbir grup kolektif olarak alay konusu edilemez (TARIHSEL doc 15: "tek ahlâkî kalıba indirgenmemeli"). Askerin abarttığı sayı esprisi düşman *sayısı* hakkındadır, düşman *milleti* hakkında değil.
3. **Anakronik/internet şakası yok.** Meme, günümüz göndermesi, dördüncü duvar kırma ("bu bir oyun"), modern marka/kurum esprisi yasak. (Steam başarım adları oyun-dışı meta metindir; orada da dönem tınısı korunur, internet şakası yine yasaktır.)
4. **Müstehcenlik yok.** Hamam sahnesi dâhil: peştemal/edep vurgusu vardır, beden espirisi "sırtım-dizim-kemiğim" yorgunluk düzeyini aşamaz. Cinsellik iması, küfür, argo (bre/vay gibi dönem ünlemleri hariç) yasak.
5. **Zayıfı ezen mizah yok.** Yetim, hasta, yaralı (özellikle Ali), yaşlılığın acziyeti, yoksulluğun kendisi güldürü nesnesi olamaz. Koca Dede'nin "abartılı anı" mizahı anlatıcının tatlı tekrarına güler, yaşlılığına değil.
6. **Ölümle alay yok.** Harami son sözleri (3-e) ölen adamın dünyevi pişmanlığının buruk mizahıdır; can verme ânı, ceset, acı hiçbir zaman komikleştirilmez. Şehit/dost ölümlerinde mizah zaten tamamen susar (Bölüm 6).
7. **Oyuncuyu aşağılayan mizah yok.** NPC'ler beyi iğneleyebilir (saygı çerçevesinde, sitem/naz formunda) ama küçük düşüremez.

### 1.4 Mizah içinde tarih/din bilgisi — etiket kuralı

- Her mizah verisi kaydı `historicalConfidence: 'C'` taşır (TARIHSEL doc 12'deki görev şemasıyla aynı alan adı).
- Mizah repliğinin içine gömülü **olgu iddiası** varsa iki yol vardır:
  - İddia A/B düzeyinde doğrulanabiliyorsa düz söylenir (ör. sakaların ordu hizmeti, sebil vakıf geleneği — TDV İA "Saka", "Sebil" maddeleri).
  - Doğrulanamıyorsa **"derler ki / rivayet olunur / ben görmedim, eri söyler"** kalıbıyla R çerçevesine alınır. Örnek: Bayezid–Doğan Bey gece görüşmesi (TARIHSEL doc satır 219'un istediği gibi) guard_talk'ta asker rivayeti olarak verilmiştir (Bölüm 3-b).
- Bu dokümanda geçen tek hadis: **"Temizlik imanın yarısıdır"** (Müslim, Tahâret 1) — sahih; `saka_talk` içinde espriden tamamen ayrı, **yalnız ciddi cevaplı bir alt dalda** ve ciddi tonda kullanılır (hadisin geçtiği düğüme mizahi oyuncu seçeneği bağlanmaz); kodeks girişinde kaynağı yazılır. Yeni hadis/ayet eklemek bu dokümanın yetkisinde DEĞİLDİR; ekleme ancak kaynak denetiminden geçmiş ayrı içerik kararıyla olur.

---

## 2. KOMİK ROL HARİTASI

Mevcut kadro (analiz `narrative.contentInventory` + NPCManager.js). Her satır: arketip + karakter sesi tarifi + mizah dozu.

| NPC (dialogueId) | Komik arketip | Karakter sesi tarifi | Doz |
|---|---|---|---|
| **Tellak Hüseyin Ağa** (`tellak_talk`, DialogueSystem.js:585) | Hamamın meddahı | Oyunun hâlihazırdaki en mizahi karakteri (analiz doğruladı) — bu ton **şablondur**. Coşkulu, esnaf ağzı, müşteriyi öven-abartan; sırt/kemik/kese üzerinden hâl komedisi. Asla laf taşımaz, "göbek taşı sır tutar" felsefesi vardır. | Yüksek |
| **Saka İbrahim** (`saka_talk` — TANIMSIZ, sıfırdan bu dokümanda yazıldı; NPCManager.js:181-201) | Sitemkâr sucu | Yorgun ama gururlu; sitem eder, yardımdan geri durmaz. Kırba, kuyu ipi, diz ağrısı üzerinden öz-alay. Mesleğinin şerefini (sebil, susuza su) ciddi tonda savunur — sitemden vakara geçiş bu karakterin imzasıdır. | Yüksek |
| **Kale nöbetçileri: Gazi Hasan, Okçu Balaban, Zırhlı Nefer Timur** (`guard_talk` — TANIMSIZ, bu dokümanda yazıldı; NPCManager.js:298-322) | Asker muhabbeti (Karagöz-Hacivat çifti tınısı) | Kuru asker mizahı: nöbet sıkıcılığı, karavana, abartılan düşman sayısı, birbirini ispiyonlayan tatlı atışma. Aynı zamanda oyunun **1396 havadis bülteni**: Niğbolu söylentilerini R-etiketli "derler ki" diliyle taşırlar. | Orta-Yüksek |
| **Kethüda Koca Yakub** (`kethuda_talk`, DialogueSystem.js:16) | Kurnaz kâhya / kaytaran köylü raporcusu | Mevcut saygılı-tecrübeli sesi KORUNUR; mizahı doğrudan konuşmaz, **rapor ettiği köylülerin hâlleri** üzerinden taşır ("Irgat Veli'nin hastalığı pazartesi tutuyor beyim, pazar akşamı geçiyor"). İmtihan edici üslubu ("kimi reayanın sırtına bindi...") zaten var; bozulmaz. | Düşük-Orta |
| **Demirci Rüstem Usta + Çırak Salih** (`demirci_talk`; Salih: `cirak_talk`, NPCManager.js:82-117) | Usta-çırak atışması | Rüstem: az sözle iğneleyen, işine âşık Ahi piri; övünmez ("dövdüğüm demir söylesin"). Salih: hazırcevap ama beceriksiz; her azarı ders gibi yer. Atışma hep **iş üstünde**, örs ritmiyle senkron (Bölüm 3-h). Ahi ahlakı (doğruluk, sabır) atışmanın içinde öğretilir. | Yüksek |
| **Hancı İdris** (`hanci_talk`) | Gözü açık esnaf | Fısıltıyla konuşan, her şeyi bilen, her bilgiye küçük hesap katan han sahibi; "hesap" ve "misafir" mizahı. Casus kurgusunda ciddiyete geçer (mevcut içerik korunur). | Orta |
| **Koca Dede** (`dede_talk`) | Tatlı tekrarcı gazi anlatıcı | Dokunaklı Kosova anısı (mevcut, DOKUNULMAZ) asıl kimliği; mizahı yalnız meydan baloncuklarında "Biz Kosova'da..." nakaratının köy gençlerince ezbere bilinmesi üzerinedir. Anının **içeriği** asla espri olmaz; espri, anlatma **alışkanlığındadır**. | Düşük |
| **Attar Mehmet Efendi** (`attar_talk`) | Envanter sayan tabip-esnaf | Merhem/ot adlarını dizerek konuşan titiz esnaf; mizahı listeleme tikinde ("...bir de sabır otu vardır beyim, onu ben de arıyorum"). | Düşük |
| **Çiftçiler: Hasan, Irgat Veli, Reaya Mahmud, Orakçı Bekir** (`farmer_talk`) | Köylü korosu | Hava, harman, karga, vergi üzerinden gündelik dertleşme; vergi günü tepkilerinin (3-f) ve meydan çiftlerinin (3-i) taşıyıcıları. | Orta |
| **Harami Elebaşı Kılçık Cafer + 2 çapulcu** (NPCManager.js:584-623) | Buruk son söz | Yaşarken tehditkâr, ölürken dünyevi pişmanlığı dökülen eşkıya (3-e). | Tek kanal (ölüm anı) |
| **Hamam müşterileri** (`hamam_musteri_talk`) | Dedikodu havuzu | "Ohhh be" rahatlığı (mevcut) + köy söylentisi taşıyıcısı; görev ipuçlarının gayriresmî kanalı (3-g). | Orta |

**Mizah TAŞIMAYAN karakterler (kesin liste):**
- **Molla Şemseddin (imam/kadı naibi):** Sıfır mizah — ne söyler ne hakkında söylenir. Bilge-adil rehber tonu (DialogueSystem.js:107-178) aynen korunur. En fazla *halim bir tebessüm* sahne yönü olarak tarif edilebilir; replik düzeyinde espri yasak.
- **Dizdar Hamza Bey:** Resmî-askerî ton (mevcut) korunur; espri yapmaz. Nöbetçilerin ondan "disiplin timsali" diye söz etmesi serbesttir (korkuyla karışık saygı — mizah dizdara değil, nöbetçilerin telaşınadır).
- **Cebelü Ali:** Dramatik çekirdek (bacak/yara hattı). Barış zamanında hafif toyluk sıcaklığı (meydan çifti 3-i/8'deki gibi tek satır) serbest; `quest_save_ali_leg` hattı aktifken Ali ile ilgili HER mizah kanalı susar (Bölüm 6).
- **Gazi Sungur Bey:** Kandaşlık/aht tonu ciddi kalır.

---

## 3. KULLANIMA HAZIR İÇERİK

> Toplam: **~150 replik/metin.** Tümü `historicalConfidence: 'C'`; içine gömülü olgu iddiaları madde altında etiketlendi. Diyalog ağaçları mevcut `DialogueSystem` şemasıyla birebir uyumludur: `{ npcName, npcRole, icon, text, onOpen?, choices: [{ label, action: null | () => ({text, choices}) }] }` (şema referansı: DialogueSystem.js:16-102 `kethuda_talk`).

### 3-a. `saka_talk` — tam diyalog ağacı (kes-yapıştır)

Eklenecek yer: `DialogueSystem.js` içinde `data` nesnesine, alias bloğundan (DialogueSystem.js:653-661) **önce**. NPC bağı hazır: NPCManager.js:193 `dialogueId: 'saka_talk'`.

```js
// =======================================================================
// SAKA İBRAHİM (Su Kültürü, Sebil Geleneği ve Sitemkâr Sucu Mizahı)
// =======================================================================
saka_talk: {
  npcName: 'Saka İbrahim',
  npcRole: 'Köy Sakası (Su Taşıyıcı)',
  icon: '🪣',
  text: `"Buyur beyim, buyur... Yok, kalkma, zahmet etme — nasılsa ben eğilirim, otuz senedir eğiliyorum. Sırtta kırba, dizde derman yok; kuyunun ipi benden evvel emekliye ayrıldı. Emret: su mu lazım, dert mi dinlersin?"`,
  choices: [
    {
      label: '💧 "Bu yıl suyumuz nasıl, İbrahim Ağa?"',
      action: () => ({
        text: `"Hamdolsun, kuyu cömert. Yalnız şu değirmen arkı var ya beyim... iki hane 'su benim' diye birbirine girdi. Su kimsenin değildir; su emanettir, nöbet kulundur. Sen bir bak o işe derim."`,
        choices: [
          {
            label: '⚖️ "Su kimsenin değilse kavga niye çıkar?"',
            action: () => ({
              text: `"Beyim, kavga sudan çıkmaz; kavga 'önce ben' demekten çıkar. Kırk yıldır kuyu başındayım, sudan çok laf taşıdım — vallahi laf, kırbadan ağırdır."`,
              choices: [{ label: '"Doğru söze ne denir. Kolay gelsin."', action: null }]
            })
          },
          { label: '"Bakarız o arka. Sen sırtını sağlam tut."', action: null }
        ]
      })
    },
    {
      label: '🏺 "Sakalık nasıl iştir, anlat hele."',
      action: () => ({
        text: `"Hor görme beyim; susuza su vermek sadakaların makbulündendir. Ecdat yol boylarına sebiller kurmuş: parasız, hesapsız — karşılığı yalnız dua. Orduda dahi saka neferi vardır; gazi susuz kalmasın diye kırba sırtlanır. Bizimkisi işte o yolun hamallığıdır."`,
        choices: [
          {
            // CİDDİ DAL — hadis yalnız burada geçer; bu dala mizahi seçenek BAĞLANMAZ (Bölüm 1.4 kuralı)
            label: '💧 "Temizliğin dinimizdeki yeri nedir, İbrahim Ağa?"',
            action: () => ({
              text: `"Peygamber Efendimiz 'Temizlik imanın yarısıdır' buyurmuştur beyim. Biz o sözün hürmetiyle taşırız bu kırbayı; su bedeni arındırır, niyet gönlü."`,
              choices: [{ label: '"Eyvallah. Rabbim emeğini zayi etmesin."', action: null }]
            })
          },
          {
            label: '🙂 "Öyleyse ücretine zam gerek." (tebessümle)',
            action: () => ({
              text: `"Aman beyim, sesli söyleme! Kethüda Yakub duyarsa 'deftere işleyelim' der; ben defterden anlamam, defter benden hiç anlamaz. Sen dua et, yeter — dua, akçeden sağlam paradır."`,
              choices: [{ label: '"Duamız hazır, İbrahim Ağa. Eyvallah."', action: null }]
            })
          },
          { label: '"Bereketli olsun. Emeğin helal, yolun açık olsun."', action: null }
        ]
      })
    },
    {
      label: '🐎 "Atıma da bir tas su ver."',
      action: () => ({
        text: `"Baş üstüne! Hayvanı sulamak da hayırdır beyim. Yalnız senin karayağız nazlıdır: geçen sefer tası kokladı, beni bir süzdü, 'bu sudan içilmez' der gibi baktı. Beyine çekmiş — zevk sahibi."`,
        choices: [{ label: '"Ona dolu bir tas koy. Sağ olasın."', action: null }]
      })
    },
    { label: 'Kolay gelsin, İbrahim Ağa.', action: null }
  ]
},
```

Etiketler: sebil/vakıf geleneği ve ordu sakaları = **A/B** (TDV İA "Saka", "Sebil"); hadis = sahih, Müslim Tahâret 1 (kodekse kaynak notu girilir; yalnız ciddi cevaplı AYRI alt dalda yer alır, mizahi seçenekle aynı düğümde bulunmaz); değirmen arkı cümlesi `quest_water_dispute`'a organik ipucu (görevin kendisi teknik planda onarılacak — bu replik onarımdan bağımsız da anlamlıdır). Karakterin hiçbir dalı ödül/akçe VERMEZ (TARIHSEL doc 9.8: "her görev doğrudan para vermemeli").

### 3-b. `guard_talk` — tam diyalog ağacı (kes-yapıştır)

Üç nöbetçi aynı ID'yi paylaşır (NPCManager.js:298-313); ad genel tutulur. `getDialogueData` her açılışta yeniden kurulduğu için (DialogueSystem.js:11-12) açılış metni havuzdan rastgele seçilebilir.

```js
// =======================================================================
// KALE NÖBETÇİLERİ (Asker Mizahı + 1396 Havadis Bülteni — R etiketli rivayetler)
// =======================================================================
guard_talk: (() => {
  const openers = [
    `"Dur! Kim var?.. Ha— tanıdım beyim, geç. Yüzünden değil, atından tanıdım; at senden meşhur."`,
    `"Hoş geldin beyim. Nöbet bereketli geçiyor: sabahtan beri iki karga, bir çoban, bir de sen. Kargaları saymazsak tenha."`,
    `"Beyim, dizdarımız görürse dik duralım. Görmezse de dik duralım da... belin müsaadesi kadar."`
  ];
  return {
    npcName: 'Kale Nöbetçisi',
    npcRole: 'Sancak Kalesi Kapı Muhafızı',
    icon: '🛡️',
    text: openers[Math.floor(Math.random() * openers.length)],
    choices: [
      {
        label: '🏰 "Niğbolu\\'dan ne haber? Anlat."',
        action: () => ({
          text: `"Haçlı, Niğbolu Hisarı'nı kuşatmış derler beyim: Frenk, Macar, Alaman, bir de Rodos şövalyeleri. Sayıyı Balaban'a sorarsan yüz bin, aşçıya sorarsan iki yüz bin — asker saymayı karavanadan öğrenir, hep fazla görür. Amma Sultanımız Yıldırım Han'a boşuna 'Yıldırım' dememişler; o yetişir."`,
          choices: [
            {
              label: '🌙 "Hisar dayanır mı peki?"',
              action: () => ({
                text: `"Dayanıyor beyim. Bir de derler ki — ben görmedim, eri söyler — Sultan gece vakti hisar dibine kadar varıp dizdar Doğan Bey ile konuşmuş. Doğrusunu Allah bilir; asker ağzıdır, büyütür. Amma hisarın direndiği kesin."`,
                choices: [{ label: '"Allah kolaylık versin. Gözünüz pek olsun."', action: null }]
              })
            },
            { label: '"Sayıyı bırak, sen tirkeşini dolu tut."', action: null }
          ]
        })
      },
      {
        label: '🌜 "Nöbet nasıl gidiyor, yiğitler?"',
        action: () => ({
          text: `"Sorma beyim. Evvelsi gece rüzgâr kapıyı dövdü; Hasan 'Haçlı geldi!' diye tirkeşe sarıldı. Haçlı değil, hancının kaçmış eşeğiymiş. Eşeği esir aldık, hancıdan fidye bekliyoruz."`,
          choices: [
            {
              label: '🙂 "Fidye ne kadar biçildi?"',
              action: () => ({
                text: `"Bir tas hoşaf beyim. Harp meclisi öyle uygun gördü. Eşek razı; hancı İdris hâlâ pazarlıkta."`,
                choices: [{ label: '"Âdil hüküm. Nöbetiniz mübarek olsun."', action: null }]
              })
            },
            { label: '"Uyanıklığınıza aşk olsun. Devam edin."', action: null }
          ]
        })
      },
      {
        label: '🧱 "Bu kale kimden yadigâr?"',
        action: () => ({
          text: `"Eski hisardır beyim; taşının bir kısmı Rum'dan kalma, burcu bizim elimizde yenilendi. Dizdar Hamza Bey der ki: 'Kale taş ile değil, nöbet ile durur.' Biz de duruyoruz işte — taş yorulunca sıra bizde."`,
          choices: [{ label: '"Taşından çok size güveniyorum. Berhudar olun."', action: null }]
        })
      },
      { label: 'Gözünüz pek, nöbetiniz mübarek olsun.', action: null }
    ]
  };
})(),
```

Etiketler: Haçlı ordusunun bileşimi (Fransız-Burgonya, Macar, Alman, Rodos) = **A** (TARIHSEL doc 4.1); sayı belirsizliği = **B** ("kesin mevcut bilinmez", doc 4.2 — espri tam da bu belirsizliği öğretir); Bayezid–Doğan Bey görüşmesi = **R**, doküman satır 219'un istediği "askerin anlattığı rivayet" formatında; kale taşının Rum yapısından devralınması = **B** (Balkan/Anadolu uç kaleleri için yaygın durum). Eşek/hoşaf sahnesi = **C**.

### 3-c. Uyuyan NPC uyandırma replikleri (12 adet)

Kanca: `UIManager.openDialogue` (UIManager.js:387-389) — diyalog verisi alınmadan önce `npcObj?.ai?.currentState === 'SLEEPING'` ise havuzdan bir replik tek seferlik "uyanma" ara metni olarak gösterilir (ayrıntı Bölüm 4/K3). `main.js:327` zaten `(Uyuyor 💤)` etiketi basıyor; bu havuz o vaadin devamıdır.

1. `"Bre! Baskın mı var?! ...Beyim?! Tövbe, sen miydin? Pusatı görünce yüreğim ağzıma geldi."`
2. `"Uyumuyordum beyim, gözümü dinlendiriyordum. Kulağım nöbetteydi."`
3. `"Hanım, değirmene ben mi gidecek—... Beyim! Buyur beyim. Uyanığım, hep uyanıktım."`
4. `"Rüyamda harman kaldırıyordum; tam desteyi bağlamıştım ki... Ne buyurdun beyim?"`
5. `"Horlamıyordum beyim, öksürüyordum. Uzun uzun. Makamlı."`
6. `"Kim o?! ...Ha, beyim. Az evvel rüyamda öşrü affediyordun; hayra yormuştum."`
7. `"Gözümü kapatmışım, dünya da kararmış. İkisinin alakası yok beyim, tesadüf."`
8. `"Sabah mı oldu? Olmadıysa niçin uyandım, olduysa niçin yorgunum?"`
9. `"Vallahi yattığım yok beyim — yer beni yatırdı. Şahidim topraktır."`
10. `"Şşş... tavuklar duymasın beyim. Horozdan evvel yatan mı ayıp, horozdan geç kalkan mı, onu tartışıyoruz."`
11. (yalnız nöbetçi/asker NPC) `"Asker uyumaz beyim, asker... tetikte serilir."`
12. `"Bu vakitte kapı çalınmaz beyim... Kapım olmadığını biliyorum, sen yine de çalma."`

Kural: Uyandırma repliği sonrası normal diyalog metnine geçilir; aynı NPC aynı gün ikinci kez uyandırılırsa havuzdan farklı replik seçilir (pick sözleşmesi, Bölüm 5). Gece yarısı (22:00-05:00) uyandırmalarında 6 numara gösterilmez (vergi rüyası sabaha yakışır — küçük dokunuş, zorunlu değil).

### 3-d. NPC durum etiketi mizahları (main.js:326-331 switch'ine)

Mevcut dört durum korunur, her durum **havuza** dönüşür; seçim kare-başına DEĞİL, gün-başına sabittir (titremesin diye): `index = (npc.id.length + gameState.time.dayCount) % pool.length`. `WORKING` etiketi `npc.ai.workType`'a göre özelleşir (doğrulanmış workType değerleri: `well_water` NPCManager.js:200, `guarding` NPCManager.js:294/320, `blacksmith` bölgesi VillagerAI.js:228-239, `innkeeping` NPCManager.js:74; bulunamayan tip `default`a düşer).

```js
statusLabels: {
  SLEEPING: [' (Uyuyor 💤)', ' (Makamlı horluyor 💤)', ' (Rüyasında harman kaldırıyor 💤)'],
  EATING:   [' (Yemek Yiyor 🍲)', ' (Kaşığıyla cenkte 🍲)', ' (Çorbayla sulh hâlinde 🍲)'],
  WANDERING:[' (Dolaşıyor 🚶)', ' (Havadis tazeliyor 🗣️)', ' (Düşünüyor... galiba 🚶)'],
  WORKING: {
    default:    [' (Çalışıyor ⚒️)', ' (İşi başından aşkın ⚒️)'],
    well_water: [' (Kuyudan su çekiyor 🪣)', ' (Kuyudan laf çekiyor 🪣)'],
    guarding:   [' (Nöbette — dimdik 🛡️)', ' (Nöbette... çoğunlukla dimdik 🛡️)'],
    blacksmith: [' (Örsle sohbette ⚒️)', ' (Demire laf anlatıyor ⚒️)'],
    innkeeping: [' (Hesap tutuyor 🧮)', ' (Misafir ağırlıyor 🍞)']
  }
}
```

Toplam 15 etiket. Kısıt: İmam NPC'sine mizahi etiket düşmemesi için `npc.id === 'imam'` (NPCManager kaydındaki id neyse) her durumda havuzun **ilk (nötr) elemanını** kullanır — kural veri değil kod tarafında uygulanır ve kabul kriterine girer.

### 3-e. Haramilerin son sözleri — `killEnemy` kancası (10 adet)

Kanca: `CombatSystem.killEnemy` (CombatSystem.js:324-342), mevcut ganimet bildiriminden **önce** ayrı bildirim satırı. Sıradan harami ölümünde %60 olasılıkla havuzdan; elebaşında her zaman özel satır. Üslup: buruk dünyevi pişmanlık; ölümün kendisi asla espri değildir (Yasak 1.3/6).

Sıradan haramiler:
1. `"Anam derdi ki... 'oğlum, bu yolun sonu yok'... Anam hep bilirdi..."`
2. `"Kılçık Cafer... haftalığımı zaten... vermemişti..."`
3. `"Bu kervan işi... son işti... hep son işti zaten..."`
4. `"Meşelik senin olsun beyim... sivrisineği de sana kalsın..."`
5. `"Beni tanıma beyim... anam duyarsa, ırgat öldü de..."`
6. `"Şu dünyada dikili bir ağacım olsun isterdim... meğer hepsi tımarınmış..."`
7. `"Hancıya söyle... hesabı... kapattık sayılır..."`
8. `"Pusuyu ben kurdum... tuzağa ben düştüm... hesap tutmuyor..."`

Elebaşı Kılçık Cafer (rastgele biri):
9. `"Kılçık derlerdi bana... herkesin boğazında dururdum... Nasip buymuş sipahi..."`
10. `"Meşeliğe iyi bak... pusu kurmayı ben bilirdim; bozmayı sen öğrendin..."`

Sunum: `gameState.addNotification('🗡️ ' + son_soz, 'info')` — 80 karakter sınırı; aynı çatışmada en fazla 2 son söz gösterilir (bildirim kuyruğu 5 kayıtla sınırlı, GameState.js:207-209).

### 3-f. Vergi günü köylü tepkileri — morale'e göre 3 kademe (9 adet)

Kanca: `TimarSystem.collectAnnualTax` (TimarSystem.js:10-30), başarılı tahsilat bildiriminden sonra morale bandına göre havuzdan 1 satır. **Tasarım ilkesi: moral düştükçe mizah çekilir** — alt bandın metinleri kasıtlı olarak komik DEĞİLDİR; oyuncuya adaletsizliğin ağırlığını hissettirir (işverenin "öğreten oyun" hedefi: öşür/adalet ilişkisi mekanikte değil vicdanla da öğrenilir).

`morale >= 70` (tebessüm):
1. `"Çiftçi Hasan güle güle verdi: 'Bey hakkını helal etsin; buğday zaten duayla bitiyor.'"`
2. `"Orakçı Bekir öşrü sayarken türkü tutturdu; şaşırıp fazla verdi, geri alırken utandı."`
3. `"Meydanda söz dolaşıyor: 'Bu bey defterden evvel yüze bakıyor.' Reaya memnun."`

`40 <= morale < 70` (iç geçirme):
4. `"Irgat Veli keseyi uzatırken iç geçirdi: 'Bereket versin... bize de biraz versin...'"`
5. `"Reaya Mahmud: 'Hakkıdır, veririz. Amma şu değirmen arkına da bir bakılsa...' diye söylendi."`
6. `"Öşür toplandı. Kimse itiraz etmedi; kimse türkü de söylemedi."`

`morale < 40` (mizah kapalı — vicdan tonu):
7. `"Kapılar tek tek kapandı. Öşür tahsil edildi; selam alınamadı."`
8. `"Çiftçi Hasan defteri imzalarken eli titredi. 'Kışa borçla giriyoruz beyim.' dedi; başka bir şey demedi."`
9. `"Çocuklar bugün meydanda oynamadı. Köy, ambarına değil beyine küskün görünüyor."`

### 3-g. Hamam sohbeti / dedikodu havuzu (12 adet)

Kanca 1: `tellak_talk`a (DialogueSystem.js:585) yeni seçenek `'🗣️ "Hamamda ne konuşulur Hüseyin Ağa?"'` → havuzdan tellak repliği. Kanca 2: `hamam_musteri_talk` (DialogueSystem.js:640-650) açılış metni havuzdan müşteri repliğiyle çeşitlenir. Dedikodu, görev/ekonomi ipucu taşıyabilir (TARIHSEL doc 15: "hamam yalnız iyileşme dükkânı olmamalı").

Tellak Hüseyin Ağa:
1. `"Sırtın davul gibi beyim — vurdukça tarih söylüyor: şu düğüm talimden, şu düğüm kethüda defterinden."`
2. `"Kese bir çıktı, altından yol haritası çıktı beyim. Maşallah, gezmediğin dağ kalmamış."`
3. `"Göbek taşı sabırlıdır: herkesi dinler, kimseye söylemez. Ben de öyleyim — benden çıkan laf buhardır, tutamazsın."`
4. `"Kese dediğin nasihat gibidir beyim: acı gelir, sıhhat verir."`
5. `"Bugün üçüncü müşterimsin: biri dertlendi, biri horladı. Bari sen havadis anlat."`
6. `"Peştemalini sıkı tut beyim; hamamda edep baş tacıdır. Kurna başında herkes birdir — bey de reaya da bir tas suyla yıkanır."`

Hamam müşterileri:
7. `"Ohhh... Duydun mu, değirmen arkı yüzünden iki hane kadı naibine gidecekmiş."` *(quest_water_dispute ipucu)*
8. `"Handa bir Frenk tüccar varmış; İdris gözünü üstünden ayırmıyormuş. İdris'in gözü keskindir — hesapta da öyledir."` *(quest_inn_spy ipucu)*
9. `"Nöbetçi Balaban dün 'Haçlı yüz bin' diyordu, bugün 'yüz elli bin'. Yarın hamama gelsin; terlesin de sayı düşsün."`
10. `"Saka İbrahim'in kırbası deliniyormuş. Ben demiyorum, sokak diyor — ıslak ıslak."`
11. `"Demircinin çırağı körük başında uyuyakalmış; Rüstem Usta 'demir soğudu, sen de soğu' diye dışarı dikmiş."`
12. `"Kale yolunun taşı düzgün amma dik; çıkan 'manzara hoş' diyor, inenin dizleri konuşuyor."`

Etiket notu: 6 numaralı tellak repliği hamam adabı + eşitlik değerini ciddi yarım-cümleyle taşır (**B**: Osmanlı hamam adabı; mizah peştemal cümlesinde değil, öncesindeki hâl tasvirlerinde yaşar).

### 3-h. Demirci usta-çırak atışmaları — örs vuruş anı kancası (10 atışma / 21 satır)

Kanca: `VillagerAI.update` demirci dalı — örs vuruşu + kıvılcım senkron noktası (VillagerAI.js:236-239, `particleSystem.emitBlacksmithSparks` çağrısının olduğu blok). Oyuncu 12 m içindeyken, en az 45 sn arayla, havuzdan bir atışma satır-satır (1,2 sn arayla) gösterilir. Rüstem = R, Salih = S.

1. R: `"Salih! Körük!"` — S: `"Basıyorum usta!"` — R: `"Sen körüğü değil, sabrımı basıyorsun."`
2. R: `"Demir tavında dövülür, Salih."` — S: `"Ben de tavımdayım usta."` — R: `"Sen tavda değil, gölgede duruyorsun."`
3. S: `"Usta, bu kılıç kaç akçe eder?"` — R: `"Sen sorma. Önce dövmesini öğren, ederini demir söyler."`
4. R: `"Ahi ocağında iki şey dövülür: demir ve nefis. Sen ikisine de uzaktan bakıyorsun."` — S: `"Yaklaşıyorum usta, kıvılcımdan yaklaşamıyorum."`
5. S: `"Usta, elime kıvılcım sıçradı!"` — R: `"Demek örse yaklaşmışsın. Hayra alâmet."`
6. R: `"Vur dedimse örse vur Salih, parmağına değil!"` — S: `"İkisi de öğreniyor usta."`
7. R: `"Bu nal düşmana değil, ata. Atı üzersen beyi üzersin; beyi üzersen..."` — S: `"...seni üzerim usta. Bildim."`
8. S: `"Ben ne zaman kılıç döveceğim usta?"` — R: `"Çivin doğru dursun; o gün de gelir."`
9. R: `"Körük nefes gibidir: verirken cömert, alırken sabırlı olacaksın."` — S: `"Ben tam tersini yapıyormuşum usta."`
10. S: `"Usta, sana Rüstem adını niye vermişler?"` — R: `"Dövdüğüm demir söylesin; ben övünmeyeyim."`

Etiket: Ahi ocağı ahlakı (doğruluk, sabır, nefis terbiyesi) = **B** (Ahilik fütüvvet geleneği; TDV İA "Ahîlik"). Atışma bu ahlakı vaaz etmeden, iş üstünde gösterir.

### 3-i. Meydan NPC-çifti baloncuk diyalogları (8 çift / 19 satır)

Kanca: `VillagerAI` WANDERING durumu (VillagerAI.js:258-273), 18:30-22:00 sosyalleşme dilimi. İki NPC birbirinin 6 m'sindeyken ve oyuncu 15 m içindeyse çift-baloncuk sahnesi (satır başına ~4 sn). Çift eşleşmesi NPC id'lerine göre sabittir (aşağıdaki eşleşmeler); eşleşme bulunamazsa sahne oynamaz.

1. **Çiftçi Hasan → Irgat Veli:** H: `"Bu yıl buğdayın boyu benim boyumu geçti."` — V: `"Zor olmamıştır, Hasan."`
2. **Orakçı Bekir → Reaya Mahmud:** B: `"Orak bilendi, tarla hazır, yağmur da söz verdi."` — M: `"Yağmur sözünden dönerse kefili sensin."`
3. **Hancı İdris → Attar Mehmet:** İ: `"Şu merhemden hana da koy; misafir kavga ederse hazır olsun."` — A: `"Merhemim kavgaya değil, kavgadan sonrasına, İdris."`
4. **Irgat Veli → Çiftçi Hasan:** V: `"Kethüda defter tutuyor; ben hesap tutamıyorum."` — H: `"Sen kürek tut. Hesabı bey tutar."`
5. **Koca Dede → Orakçı Bekir:** D: `"Biz Kosova'da..."` — B: `"Biliyoruz dede."` — D: `"Bilmek başka, dinlemek başka evlat. Otur."` *(anının içeriği değil, anlatma alışkanlığı gülümsetir — Bölüm 2 kuralı)*
6. **Saka İbrahim → Tellak Hüseyin:** S: `"Suyu ben taşıyorum, akçeyi sen alıyorsun Hüseyin."` — T: `"Sen suyu getir, ben teri götüreyim; ikimizinki de hamallık İbrahim."`
7. **Reaya Mahmud → Orakçı Bekir:** M: `"Harmanda karga çoğaldı."` — B: `"Kethüdaya söyle, deftere yazsın. Karga defterden korkar."`
8. **Çırak Salih → Cebelü Ali:** S: `"Cebelü olmak zor mu Ali?"` — A: `"Talimi zor, gerisi dua."` — S: `"Ben en iyisi çivi döveyim."`

Kısıt: 8 numaralı çift `quest_save_ali_leg` hattı aktifken oynamaz (Bölüm 6).

### 3-j. Mizahi ama saygılı başarım adları (12 adet)

Kanca: `SteamManager.achievements` sözlüğü (SteamManager.js:12-21). Mevcut 8 ID'nin adı/açıklaması aşağıdaki gibi güncellenir, eksik `ACH_FIRST_PATROL` sözlüğe eklenir (QuestSystem.js:504 zaten çağırıyor), 3 yeni başarım önerilir. Tetik noktaları teknik planla paylaşılan bağlantı işidir; buradaki teslimat **ad + açıklama metnidir**.

| ID | Ad | Açıklama | Tetik önerisi |
|---|---|---|---|
| ACH_FIRST_PATROL *(sözlüğe eklenecek)* | Kol Gezen Bey | İlk vazifeni tamamladın. Köylü artık "bizim bey boş gezmez" diyor. | ilk `completeQuest` (QuestSystem.js:485-511) |
| ACH_FIRST_INSPECT | Deftere İlk Mühür | İlk teftiş tamam. Kethüda memnun, kargalar tedirgin. | quest_inspect tamamlanınca |
| ACH_BLACKSMITH | Örs Hatırı | Ahi ocağından pusat kuşandın. Rüstem Usta memnun; Salih'in gözü pusatında. | gürz alımı (DialogueSystem.js:196-206) |
| ACH_CASTLE_DISCOVERY | Burçlara Selam | Sancak kalesine vardın. Nöbetçiler seni "atıyla meşhur bey" diye kaydetti. | quest_castle tamamlanınca |
| ACH_BANDIT_SLAYER | Meşelik Ferahladı | Kılçık Cafer çetesi dağıldı; kervanlar da köylü de rahat nefes aldı. | onEnemyDefeated sayaç=3 (QuestSystem.js:464-483) |
| ACH_NIGBOLU_VICTORY | Tuna Şahittir | 1396 Niğbolu meydanında sancağın altında durdun. Tarih yazdı; sen yaşadın. *(zafer başarımı — mizahsız, bilinçli)* | Niğbolu zaferi (HistoryEventSystem.js:38-81) |
| ACH_FIRST_CEBELU | Bir Yiğit, Bin Dua | İlk cebelünü donattın. Köy meydanı bir dua kalabalık. | mevcut tetik korunur (TimarSystem.js:55) |
| ACH_HORSE_MASTER | Rüzgâr Kanatlı | Karayağız ile aranız su gibi: o koşuyor, sen tutunuyorsun — kimse fark etmiyor. | mevcut tetik korunur (main.js:167) |
| ACH_WEALTHY_SIPAHI | Kese Dolu, Gönül Tok | Hazine 2500 akçeyi aştı. Kethüda deftere "hayra harcanır inşallah" notu düştü. | updateTime içinde akçe eşiği (GameState.js:212-233) |
| ACH_HAMAM_PAK *(yeni)* | Pirüpak Bey | Kese-köpük tamam. Hüseyin Ağa: "Kuş gibi hafifledin beyim." | tellak kese satın alımı (DialogueSystem.js:585+) |
| ACH_SAKA_DOSTU *(yeni)* | Su Gibi Aziz | Saka İbrahim'in derdini de mesleğinin şerefini de dinledin. | saka_talk "sakalık" dalı sonuna ulaşınca |
| ACH_UYKU_BOLEN *(yeni)* | Uyku Bölen | Beş uyuyan köylüyü uyandırdın. Kahvaltı sohbetinin konusu sensin. | uyandırma sayacı 5 (gameState.flags.wakeCount) |

### 3-k. Mevsim dönümü bildirimleri (8 adet — 4 mevsim × 2 varyant)

Kanca: `GameState.advanceSeason` (GameState.js:257-269), mevcut mevsim bildirimi yanına havuzdan 1 satır. (Kampanya eylülde bittiği için Kış metinleri serbest oyun/uzatma içindir; kod dört mevsimi desteklediğinden — seasons dizisi GameState.js:258 — dördü de teslim edilir.)

- **İlkbahar:** `"🌱 Ekim vakti: tohum toprağa, umut deftere düştü. Kethüda 'bereket yılı' diyor; kargalar 'ziyafet yılı' anlıyor."` / `"🌱 Bahar geldi: kim ne ekerse onu biçer — bunu tarla da bilir, defter de."`
- **Yaz:** `"☀️ Yaz bastırdı: tarla harlı, Saka İbrahim'in kırbası bir iniyor bir çıkıyor. Çınar gölgesi akçesiz dağıtılıyor."` / `"☀️ Sıcaklar geldi: reaya işte, nöbetçi gölgede; gölge de nöbette."`
- **Güz:** `"🍂 Harman savruldu, ambar doldu. Hesap günü yaklaşıyor — defterinki beyim, defterinki."` / `"🍂 Hasat mevsimi: buğday desteleri saf tuttu, kargalar bozguna uğradı. Bu yılın tek zaferi kansız kazanıldı."`
- **Kış:** `"❄️ Kış kapıya dayandı: odun kıymetlendi, sohbet uzadı. Hanın ocağı köy meclisine döndü."` / `"❄️ Kar düştü: yollar kapandı, havadis açıldı. Koca Dede'nin kıssaları uzun gecelere tam gelir."`

### 3-l. Başlangıç ekranı prosedürel tımar kusurları (12 adet)

Kanca: `UIManager.updateStartScreenInfo` (UIManager.js:367-376) — bilgi kutusuna `"Bilinen Kusur: ..."` satırı; tımar üretiminde (GameState.js:25-33 bölgesi) rastgele 1-2 kusur seçilir. Salt lezzet metnidir, mekanik etkisi yoktur (Simplicity First); ileride ekonomiye bağlanması teknik planın opsiyonudur. **Mescid/dinî yapı kusuru bilinçli olarak listede YOKTUR** (Yasak 1.3/1).

1. `"Değirmenin taşı çatlak; değirmenci 'sesi hoş geliyor' diye avunuyor."`
2. `"Köprünün orta tahtası eksik. Bilen atlıyor, bilmeyen yüzüyor."`
3. `"Ambar kapısı gıcırdıyor — bekçiden sadıktır, hırsız gelmeden öter."`
4. `"Kuyu ipi üç yerinden düğümlü; her düğüm bir 'sonra bakarız'ın hatırası."`
5. `"Hanın tabelası ters asılmış. Hancı: 'Okuyan zaten geliyor.'"`
6. `"Talimgâh kuklasının kellesi yamuk; evvelki sipahiden yadigâr, kimse el sürmüyor."`
7. `"Harman yerinde kargalar meclis kurmuş; kethüda 'vergiye tabi değiller' diye kederli."`
8. `"Tımar defterinin son sayfasında kurutulmuş bir gül var. Kimin koyduğunu defter söylemiyor."`
9. `"Çeşme yalağında iki kurbağa mukim. Reaya isim bile takmış."`
10. `"Ağıl kapısının mandalı gevşek; koyunlar biliyor, çoban bilmiyor."`
11. `"Meydandaki çınarın dibine oturan uyuyor. Ağaçtan mı, işten mi — tespit edilemedi."`
12. `"Kale yolu dik: çıkan 'manzara hoş' diyor; inenin yerine dizleri konuşuyor."`

### 3-m. (Ek) Bilinmeyen diyalog için genel köylü replikleri (5 adet)

Analizin işaret ettiği "E'ye basınca hiçbir şey olmuyor" sessiz hatasına (UIManager.js:388-389 `if (!data) return;`) içerik tarafı çözümü: tanımsız `dialogueId` düştüğünde `npcObj.name` başlıklı tek düğümlük genel diyalog gösterilir. Havuz:

1. `"Buyur beyim. Emrin olur mu, duan olur mu — ikisi de baş üstüne."`
2. `"Bugün havadis yok beyim. Olsa evvela sana söylerdim, sonra hamama."`
3. `"İş güç, harman zamanı beyim. Bir eksiğimiz yok — duanı eksik etme, yeter."`
4. `"Beyim, beni mi çağırdın, yoksa selamına mı geldik? İkisine de eyvallah."`
5. `"Sağlığını görelim beyim. Köyün hâli, duldaki harman gibi: bakan olursa bereketli."`

---

## 4. SİSTEMİK MİZAH YERLEŞİMİ — kanca eşlem tablosu

| # | Kanca (dosya:satır) | Bağlanan kategori | Tetik koşulu | Sınır / cooldown |
|---|---|---|---|---|
| K1 | `DialogueSystem.js` data nesnesi, alias bloğu öncesi (DialogueSystem.js:653) | 3-a `saka_talk`, 3-b `guard_talk` | E ile diyalog (NPC bağı hazır: NPCManager.js:193, 313) | — (diyalog, oyuncu isteğiyle) |
| K2 | `UIManager.openDialogue` (UIManager.js:387-389) | 3-m genel fallback | `getDialogueData` null döndüğünde | NPC başına oturumda 1 farklı replik |
| K3 | `UIManager.openDialogue` girişi + `npcObj.ai.currentState` (VillagerAI durumları, VillagerAI.js:5-12) | 3-c uyandırma replikleri | `currentState === 'SLEEPING'` iken diyalog açılışı; ardından normal metne geçilir; `gameState.flags.wakeCount++` | NPC başına gün başına 1; ACH_UYKU_BOLEN sayacı buradan |
| K4 | `main.js` updateInteractionPrompts switch (main.js:326-331) | 3-d durum etiketleri | her karede; **seçim gün-sabit** (`(npc.id.length + dayCount) % pool.length`) | imam istisnası (Bölüm 3-d kuralı) |
| K5 | `CombatSystem.killEnemy` (CombatSystem.js:324-342) | 3-e son sözler | sıradan harami %60, elebaşı %100 | çatışma başına en çok 2 satır |
| K6 | `TimarSystem.collectAnnualTax` (TimarSystem.js:10-30) | 3-f vergi tepkileri | başarılı tahsilat; `gameState.timar.morale` bandına göre | tahsilat başına 1 satır |
| K7 | `tellak_talk` (DialogueSystem.js:585) + `hamam_musteri_talk` (DialogueSystem.js:640-650) | 3-g hamam havuzu | yeni "hamamda ne konuşulur" seçeneği; müşteri açılış metni havuzdan | ziyaret başına en çok 2 dedikodu |
| K8 | `VillagerAI.update` demirci örs bloğu (VillagerAI.js:236-239, `emitBlacksmithSparks` senkronu) | 3-h usta-çırak atışması | oyuncu ≤ 12 m, iki NPC iş başında | ≥ 45 sn cooldown; sahne başına 1 atışma |
| K9 | `VillagerAI` WANDERING dalı (VillagerAI.js:258-273) | 3-i meydan çiftleri | 18:30-22:00; çift NPC ≤ 6 m; oyuncu ≤ 15 m | çift başına gün başına 1 sahne |
| K10 | `SteamManager.achievements` (SteamManager.js:12-21) + tetik noktaları (tabloda, 3-j) | 3-j başarımlar | ilgili olay | Steam kuralları |
| K11 | `GameState.advanceSeason` (GameState.js:257-269) | 3-k mevsim bildirimi | mevsim dönümü | dönüm başına 1 satır |
| K12 | `UIManager.updateStartScreenInfo` (UIManager.js:367-376) + tımar üretimi (GameState.js:25-33) | 3-l tımar kusurları | yeni tımar üretimi | tımar başına 1-2 kusur |

**Genel dağıtım kuralları:**
- Bildirim kanalını kullanan tüm kategoriler (K5, K6, K8*, K11) `type: 'info'` ile gönderilir ve **aynı anda kuyrukta 1'den fazla mizah bildirimi olamaz** (kuyruk 5 kayıt, GameState.js:207-209; kritik oyun mesajlarını itmemek için).
- K8 ve K9'un ideal sunumu dünya-içi baloncuktur; ancak dünya işaretçisi CSS'inin hiç yazılmadığı bilindiğinden (analiz: UIManager.js:1049-1129 kritik bug) **v1 uygulaması bildirim kanalıdır**; baloncuk, teknik planın world-marker onarımı teslim edildikten sonra v2 olarak taşınır. Bu iki aşama kabul kriterlerinde ayrı maddedir.
- Her kanal `isHumorMuted()` (Bölüm 6) kontrolünden geçer — tek istisna 3-f'nin `morale < 40` bandı (o metinler mizah değildir, her koşulda çıkar).

---

## 5. VERİ FORMATI — `src/data/humor.js`

Teknik planla uyum ilkeleri: diyalog **ağaçları** (3-a, 3-b, 3-m fallback şablonu) mevcut mimariye sadakat gereği `DialogueSystem.js` içinde kalır (tek diyalog kaynağı ilkesi; TARIHSEL doc 15 "aynı veri iki yerde tutulmamalı"). **Havuz** içerikleri (tek satırlıklar) yeni `src/data/humor.js` modülünde toplanır; mantık (seçim/cooldown/susturma) `src/systems/HumorSystem.js` yerine önce **minimal helper** olarak aynı dosyada verilir — ayrı sistem sınıfı ancak K8/K9 baloncuk aşamasında gerekirse açılır (Simplicity First).

```js
// src/data/humor.js
// All strings Turkish (game content); identifiers English (project rule).

export const HUMOR = {
  meta: { historicalConfidence: 'C', version: 1 },

  wakeLines: [ /* 3-c: 12 strings */ ],

  statusLabels: { /* 3-d: exact object from section 3-d */ },

  banditLastWords: {
    regular: [ /* 3-e items 1-8 */ ],
    boss:    [ /* 3-e items 9-10 */ ]
  },

  taxReactions: {
    high: [ /* 3-f 1-3 */ ],   // morale >= 70
    mid:  [ /* 3-f 4-6 */ ],   // 40..69
    low:  [ /* 3-f 7-9 */ ]    // < 40 — NOT humor; exempt from mute
  },

  hamamGossip: {
    tellak:   [ /* 3-g 1-6 */ ],
    customer: [ /* 3-g 7-12 */ ]
  },

  anvilBanter: [
    // 3-h: each exchange is an array of {speaker: 'R'|'S', line: '...'}
    [{ speaker: 'R', line: 'Salih! Körük!' }, { speaker: 'S', line: 'Basıyorum usta!' }, { speaker: 'R', line: 'Sen körüğü değil, sabrımı basıyorsun.' }],
    // ...
  ],

  plazaPairs: [
    // 3-i: { a: npcIdA, b: npcIdB, lines: [{who:'a'|'b', line}] , blockedByAliArc?: true }
    { a: 'ciftci_hasan', b: 'irgat_veli', lines: [ /* ... */ ] },
    { a: 'cirak_salih', b: 'cebelu_ali', blockedByAliArc: true, lines: [ /* ... */ ] }
    // NPC id'leri NPCManager.js'deki gerçek id alanlarıyla birebir eşleştirilir (uygulama sırasında doğrulanır)
  ],

  seasonNotes: {
    // key = seasonIndex (GameState.js:258 sırası: 0 İlkbahar, 1 Yaz, 2 Güz, 3 Kış)
    0: [ /* 2 strings */ ], 1: [ /* 2 */ ], 2: [ /* 2 */ ], 3: [ /* 2 */ ]
  },

  timarFlaws: [ /* 3-l: 12 strings */ ],

  fallbackVillagerLines: [ /* 3-m: 5 strings */ ]
};

// --- minimal selection helper (no-repeat + mute gate) ---
const lastPick = new Map(); // key -> last index

export function pickHumor(key, pool, { muted = false } = {}) {
  if (muted || !pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  let idx = Math.floor(Math.random() * pool.length);
  if (idx === lastPick.get(key)) idx = (idx + 1) % pool.length; // never repeat immediately
  lastPick.set(key, idx);
  return pool[idx];
}
```

**Sözleşmeler:**
1. `pickHumor` art arda aynı elemanı vermez (test edilebilir).
2. Çağıran taraf `muted: isHumorMuted(gameState)` geçirir (Bölüm 6); `taxReactions.low` çağrısı muted geçirmez.
3. `statusLabels` seçimi `pickHumor` KULLANMAZ — gün-sabit indeks kuralı (K4) uygulanır; aksi hâlde etiket her karede titrer.
4. Deterministik kayıt notu: TARIHSEL doc 12 "rastgele sonuçlar seed ile saklanmalı" der; mizah havuzu **oynanış sonucu üretmeyen lezzet metni** olduğundan seed zorunluluğundan muaftır (bu muafiyet bilinçli bir tasarım kararıdır ve burada kayda geçmiştir).
5. Kayıt sistemi bağlandığında (`SaveManager`) `gameState.flags.wakeCount` serialize alanlarına eklenmelidir (SaveManager.serializeState'in bugün `aliStatus`/`activeCampaign`'i bile kaydetmediği biliniyor — SaveManager.js:41-57; teknik plana not).
6. `DialogueSystem.js`'e eklenen `saka_talk`/`guard_talk` mevcut test asertlerini KIRMAMALIDIR: testler mevcut diyalogların birebir alt dizgelerine bağlı (tests/systems.test.js:353-411) — mevcut metinlere dokunulmaz, yalnız yeni anahtar eklenir; ayrıca iki yeni asert eklenir (Bölüm 7).

---

## 6. TON DENGESİ KURALI — mizah ne zaman susar

**İlke:** Dram anında tebessüm ihanettir. Aşağıdaki bayraklardan HERHANGİ biri doğruysa tüm mizah kanalları (K2-K9, K11) susar; yalnız 3-f `low` bandı (mizah olmayan vicdan metinleri) ve diyalog ağaçlarının **ciddi dalları** çalışır.

```js
// src/data/humor.js (devam)
export function isHumorMuted(gs) {
  if (gs.failState && gs.failState.isGameOver) return true;              // 1
  if (gs.aliStatus.legSevered && !gs.aliStatus.isSaved) return true;     // 2
  if (gs.aliStatus.isDead) return true;                                  // 3
  if (gs.flags && gs.flags.inCampaignScene) return true;                 // 4
  if (gs.flags && Date.now() < (gs.flags.recentTragedyUntil || 0)) return true; // 5
  if (gs.sipahi.health < gs.sipahi.maxHealth * 0.2) return true;         // 6
  return false;
}
```

| # | Bayrak | Kaynağı | Kapsam |
|---|---|---|---|
| 1 | `failState.isGameOver` | GameState.js:190-197 / 236-245 / 247-255 | Çiftbozan, taşlanma, şehadet ekranlarında mizah sıfır |
| 2 | `aliStatus.legSevered && !isSaved` | GameState.js:121-127, sayaç GameState.js:220-227 | **Ali'nin yara mühleti boyunca** köyde hiçbir mizah kanalı çalışmaz; 3-i/8 çifti ayrıca kalıcı bloklu (`blockedByAliArc`) |
| 3 | `aliStatus.isDead` | GameState.js:236-245 | Ali öldüyse (taşlanma öncesi kısa pencere dâhil) |
| 4 | `flags.inCampaignScene` *(yeni bayrak)* | Sefer/savaş sahnesi girişinde teknik plan set eder (CampaignBattleSystem bağlandığında `startNicopolisBattle` girişi, CampaignBattleSystem.js:26; v1'de `joinActiveCampaign` çağrısı sırasında, HistoryEventSystem.js:12-36) | Sefer yürüyüşü + Niğbolu safhaları + savaş sonucu ekranı; sefer bitiminde temizlenir |
| 5 | `flags.recentTragedyUntil` *(yeni bayrak, timestamp)* | Dost/köylü NPC ölümü, köylüye kaza vuruşu cezası (CombatSystem köylü dalı), şehit haberi — olay anında `Date.now() + 120000` yazılır | Trajediden sonra 120 sn sessizlik |
| 6 | `health < %20` | GameState.sipahi | Oyuncu ağır yaralıyken kimse şakalaşmaz (dünya duruma saygı duyar) |

**Mekânsal susturma (bayraktan bağımsız):** Mizah baloncuğu/bildirimi tetiklenirken oyuncu veya kaynak NPC şu bölgelerdeyse içerik gösterilmez: mescid merkezi (12, -4; TownGenerator meydan/mescid yerleşimi) çevresinde 10 m ve hazire (TownGenerator.js:186-207) çevresinde 8 m. Diyalog ağaçları bu kuraldan muaftır (oyuncu iradesiyle açılır) ama saka/nöbetçi zaten bu bölgelerde konumlanmaz.

**Zamansal ton eğrisi (kampanya):** Perde I-II (ilkbahar-yaz) mizah dozu tam; Perde III (ferman/toplanma) K9 meydan çiftleri havuzu yarıya iner (savaş hazırlığı gerginliği); Perde IV (yürüyüş + Niğbolu) bayrak 4 ile tamamen susar; Bölüm 15 "Zaferin bedeli" boyunca susmaya devam eder (bayrak 4 ancak köye dönüş sahnesinde temizlenir). Bu eğri, işverenin "akıcı oyun" isteğiyle çelişmez: gerginlik anında mizahın yokluğu, döndüğünde tazeliği demektir.

---

## 7. KABUL KRİTERLERİ (denetçi listesi)

### 7.1 İçerik varlığı ve bağlantısı
- [ ] `saka_talk` DialogueSystem.js'e eklendi; oyunda Saka İbrahim'e (NPCManager.js:181-201) E basınca diyalog açılıyor, en az 4 üst seçenek + 2 alt dal var, hiçbir dalı akçe/ödül vermiyor.
- [ ] `guard_talk` eklendi; üç nöbetçiden (NPCManager.js:298-322) herhangi birine E basınca açılıyor; açılış metni en az 3 varyanttan seçiliyor; "Niğbolu havadisi" dalında Doğan Bey rivayeti **"derler ki"** kalıbıyla veriliyor (R-etiket kuralı).
- [ ] Bilinmeyen dialogueId artık sessiz kalmıyor: fallback diyalog (3-m) `npcObj.name` başlığıyla gösteriliyor (UIManager.js:388-389 değişikliği).
- [ ] Uyuyan NPC'ye E basınca (state SLEEPING) uyandırma repliği (3-c) gösteriliyor; aynı NPC'de art arda aynı replik gelmiyor; `flags.wakeCount` artıyor.
- [ ] main.js:326-331 switch'i havuzlu etiket kullanıyor; etiket kare-başına değişMİYOR (gün-sabit kural); imam NPC'si her durumda nötr etiket alıyor.
- [ ] `killEnemy` son sözleri: elebaşı ölümünde her zaman, sıradan haramide ~%60 çıkıyor; çatışma başına ≤ 2.
- [ ] `collectAnnualTax` sonrası morale bandına göre doğru havuzdan tek satır geliyor; `morale < 40` metinleri mute bayraklarından etkilenMİYOR.
- [ ] Tellak diyaloğunda yeni "hamamda ne konuşulur" seçeneği var; hamam müşterisi açılışı havuzdan çeşitleniyor; mevcut kese-köpük akışı (can/stamina yenileme) bozulmadı.
- [ ] Örs atışması: oyuncu demircinin 12 m'sinde ve örs döngüsü aktifken (VillagerAI.js:236-239) 45 sn cooldown'la bir atışma oynuyor.
- [ ] Meydan çiftleri 18:30-22:00 diliminde tetikleniyor; Salih-Ali çifti Ali yara hattı aktifken hiç oynamıyor.
- [ ] SteamManager sözlüğünde 12 başarımın adı/açıklaması bu dokümandakiyle birebir; `ACH_FIRST_PATROL` artık tanımlı (SteamManager.js:12-21).
- [ ] Mevsim dönümünde havuzdan bir satır geliyor (GameState.js:257-269).
- [ ] Başlangıç ekranında "Bilinen Kusur" satırı görünüyor; kusurlar arasında dinî yapı YOK.

### 7.2 Üslup ve yasak denetimi (otomatikleştirilebilir)
- [ ] `src/data/humor.js` + yeni diyalog metinleri üzerinde yasaklı kelime grep'i temiz: `tamam!|okey|süper|sorun yok|stres|panik|radar|masöz|12'den|bonus|level|skor|kanka|merhaba` (büyük/küçük harf duyarsız; "tamamlandı" gibi fiil çekimlerine yanlış pozitif vermeyecek şekilde kelime sınırıyla).
- [ ] Din adamı/ibadet/kutsal kavram hiçbir mizah verisinde geçmiyor (manuel okuma + `imam|molla|namaz|ezan|ayet|hadis|mescid|zemzem|günah|melek` grep'inin mizah havuzlarında sıfır eşleşmesi; `saka_talk` içindeki hadis cümlesi tek istisnadır ve yalnız ciddi cevaplı ayrı alt dalda yer alır). Bu grep listesi NİHAİ listedir: 06-fazlar-ve-kabul.md Ç5 kararı ve F4-07 kabulüyle birebir aynı liste kullanılır; `dua` kelimesi listeye bilinçli olarak dâhil DEĞİLDİR — saygılı halk kalıbı olarak (mizah nesnesi yapılmadan) havuzlarda geçebilir ve manuel okuma denetimine tabidir (bkz. §1.3/1 ayrım notu).
- [ ] Yeni hiçbir replik oyuncuya sabit isimle hitap etmiyor (`Murad` grep'i yeni içerikte sıfır).
- [ ] Karakter sınırları (Bölüm 1.2 tablosu) aşılmıyor — göz kontrolüne bırakılMAZ: `src/data/humor.js` havuzları ve yeni diyalog metinleri üzerinde Bölüm 1.2 tablosundaki sınırları sayan basit bir uzunluk-denetim scripti (ör. tests/systems.test.js'e eklenen uzunluk asertleri) çalıştırılır ve sıfır ihlal raporlanır.
- [ ] Etnik/dinî grup adları mizah cümlesinin öznesi değil (manuel okuma — nöbetçi sayı esprisinin nesnesi "sayı"dır, millet değil).

### 7.3 Ton dengesi
- [ ] `isHumorMuted` 6 bayrağın her biriyle ayrı ayrı test edildi (bayrak set → mizah kanalı çağrısı → null döner).
- [ ] Sefer başlatılınca (`joinActiveCampaign` v1) `flags.inCampaignScene` true oluyor ve dönüşte temizleniyor.
- [ ] Mescid/hazire yarıçapı içinde baloncuk/bildirim mizahı tetiklenmiyor.

### 7.4 Regresyon
- [ ] `npm test` yeşil: mevcut 97 asert bozulmadı (mevcut diyalog metinlerine dokunulmadığı için — tests/systems.test.js:353-411 birebir dizge asertleri) **ve** en az 2 yeni asert eklendi: `DialogueSystem.getDialogueData('saka_talk') !== null` + `getDialogueData('guard_talk').choices.length >= 4`.
- [ ] `npm run build` hatasız.
- [ ] Bildirim-tabanlı içerikler yalnız bildirim render düzeltmesi (UIManager.js:1249-1260) teslim edildikten sonra "görünür" kabul edilir; düzeltme öncesi bu kategoriler için kabul verilmez.

---

## 8. Uygulama sırası önerisi (teslim dilimleri)

1. **Dilim 1 (bağımsız, düşük risk):** 3-a + 3-b diyalog ağaçları + 3-m fallback + iki yeni test aserti. (Analizin "yüksek" öncelikli sessiz-hata bug'ını da içerikle kapatır.)
2. **Dilim 2 (bildirim düzeltmesi sonrası):** 3-e, 3-f, 3-k bildirim kancaları + `humor.js` + `pickHumor` + `isHumorMuted`.
3. **Dilim 3:** 3-c uyandırma + 3-d durum etiketleri + 3-l başlangıç kusurları.
4. **Dilim 4:** 3-j başarım metinleri (tetik bağlama işi teknik planla ortak).
5. **Dilim 5 (world-marker onarımı sonrası):** 3-h, 3-i baloncuk sunumuna geçiş (v1'de bildirimle sınırlı).

Her dilim tek başına gönderilebilir küçük bir CL'dir; hiçbiri mevcut sistemleri yeniden yazmaz.
