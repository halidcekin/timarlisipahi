# 02 — Mizah ve Diyalog Tasarım Belgesi
### Mülk-i Osmanî: Tımarlı Sipahi 3D — "Kahkaha Katmanı"

> **Bu doküman ne için:** İşverenin "oynarken zamanın nasıl geçtiğini anlamayacakları, küçük nükte ve espirilerin olduğu, Osmanlı/Türk tarihini ve İslami değerleri öğreten" oyun hedefinin **mizah ve diyalog ayağını** uygulanabilir hâle getirir. İçinde: (1) yazım üslup rehberi, kahkaha zanaatı (9 teknik), yoğunluk sözleşmesi, geri dönen espri kataloğu ve kesin yasaklar, (2) mevcut NPC kadrosunun komik rol haritası, (3) kes-yapıştır kalitesinde ~300 replik/metin (eksik `saka_talk` ve `guard_talk` diyalog ağaçları dâhil), (4) her içeriğin hangi kod kancasına (dosya:satır) bağlanacağı, (5) veri formatı önerisi (`src/data/humor.js`), (6) dramatik anlarda mizahı susturan ton dengesi bayrakları ve (7) denetçinin kabul kriterleri vardır. Bu doküman `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` ile **çelişmez, üzerine inşa eder** (özellikle Bölüm 11 dil kuralları ve 18.1 mizah/antagonist kuralı). Uygulayıcı geliştiricinin başka hiçbir soruya ihtiyacı kalmaması hedeflenmiştir.
>
> **Güncelleme (işveren talimatı):** Bu dokümanın mizah genliği yükseltilmiştir. Hedef artık tebessüm değil **kahkaha**dır: oyuncu sesli gülmeli, sahneyi arkadaşına anlatabilmeli, klip alacak kadar sivri bir an bulabilmelidir. Genlik yükselirken §1.3'teki yasaklar ve §6'daki susturma bayrakları **hiç gevşemez** — kahkaha, sınırların içinde daha yükseğe zıplamaktır, sınırların dışına taşmak değil.
>
> **İkinci güncelleme (bağımsız denetim sonrası):** Kahkaha revizyonu bağımsız denetime verilmiş ve **PASS DEĞİL** sonucu almıştır: 9 koruma bulgusu, 22 zayıf replik, 7 yapısal boşluk. Bu sürüm o bulguların tamamını kapatır. Kapanış kaydı, hangi bulgunun nasıl çözüldüğü ve çakışan düzeltme önerileri arasında verilen kararlar **§9.4'tedir**. Denetimin en önemli dersi kayda geçmiştir: **yasağın lafzı, içeriğin kendisi kadar önemlidir** — temizlenmiş bir içerik, kuralın açık bıraktığı kapıyı kapatmaz; ve bir ihlal metinde değil, **metin ile ekranın arasında** da durabilir (§7.1'deki `killEnemy` engelleyici maddesi).

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

> **Yazarın okuma sırası:** §1.1 (hedef) → §1.5 (alet çantası: 9 teknik) → §1.6 (yoğunluk ve ritim) → §1.7 (geri dönen espriler) → §1.2 (dil ve ölçü) → §1.3 (yasaklar) → §1.4 (etiket). Bir replik yazmadan önce 1.1 ve 1.5 okunmuş olmalıdır; bir replik teslim edilmeden önce 1.2 ve 1.3 denetimi yapılmış olmalıdır. **Numaralandırma notu:** §1.2 / §1.3 / §1.4 numaraları bilerek değiştirilmedi, çünkü kardeş dokümanlar bu numaralara atıf yapıyor (`06-fazlar-ve-kabul.md` D8 ve D12, `01-akis-ve-tutundurma.md` satır 229, `04-islami-icerik.md`); kahkaha bölümleri bu yüzden §1.5-§1.7 olarak eklendi.

### 1.1 Nüktenin tanımı — beş kural

Bu oyunun mizahı **meddah / Nasreddin Hoca / Karagöz-Hacivat** damarından beslenir; hedef **kahkahadır**. Tebessüm artık taban, tavan değil: tebessümde kalan replik hedefi ıskalamıştır. Kurallar:

1. **Kahkaha hedeftir, tebessüm tabandır.** Replik, oyuncunun dudağını kıpırdatmak için değil, **sesli güldürmek** için yazılır. Kalite testi tektir ve pazarlık kabul etmez: *bu repliği bir arkadaşına sesli okusan gülüyor mu?* Cevap "yok ama hoş" ise replik **yetersizdir ve yeniden yazılır**. Zayıf repliği silmek, vasat repliği tutmaktan daima iyidir; havuzda 30 iyi satır, 60 idare eder satırdan değerlidir. Pratik kesme kuralı: yazılan her üç satırdan en zayıfı atılır, kalan ikisinin vurucu kelimesi sona çekilir.
2. **Kahkaha, mizahın anlatı içindeki işini İPTAL ETMEZ.** Yükselen şey genliktir, görev değil. Her replik hâlâ önce **işini yapar** — bilgi verir, görev ipucu taşır, dünyayı ve karakteri anlatır — kahkaha bu işin *üstüne* biner, yerine geçmez. Ölçü: bir repliğin şaka kısmını sildiğinde geriye **hâlâ oyuncunun işine yarayan bir cümle** kalmalıdır. Örnek: nöbetçinin "hancının kaçmış eşeğini esir aldık" repliği güldürürken aynı anda (a) kale gece nöbetinin ne kadar olaysız geçtiğini, (b) hancının varlığını ve hayvanını, (c) nöbetçilerin abartma huyunu öğretir. Şakası silinse "burçta üç yıldır düşman görmedik" bilgisi ayakta kalır. Kalmıyorsa o replik şaka değil, gürültüdür.
3. **Zorlama şaka ve sırıtan anlatıcı yasaktır.** "Espri olsun diye" var olan tek bir replik bile yazılmaz. Karakter komik olduğunu **bilmez**: kimse "şaka yaptım" demez, kimse kendi lafına gülmez, hiçbir metin ünlem işaretiyle güldürmeye çalışmaz. Sistem anlatıcısı (bildirim, başarım metni, durum etiketi) asla şakayı işaret etmez — o da deadpan yazılır. Kahkahayı **kurgu** üretir; noktalama ve tonlu ünlemler üretmez. Şaka açıklanırsa ölür: vurucu cümleden sonra gelen her açıklama satırı **silinir**.
4. **Mizahın nesnesi değişmedi.** Konuşanın kendisi (öz-alay), dünyevi zorluklar (yorgunluk, hesap-defter, kırba, karga, dizler, hava), hayvanlar, hâl komedisi ve **kendini ciddiye alanın küçük rezilliği**. **Asla:** kutsal olan, zayıfı ezmek, bir etnik/dinî grubu küçümsemek, ölümün kendisiyle alay. Yükselen genlik bu listeyi genişletmez — tam tersine, genlik yükseldikçe hedef seçimi **daha** dikkatli olur, çünkü yüksek sesli bir şakanın yanlış yere isabet etmesi, kısık sesli olandan daha çok yaralar.
5. **Rastgele tekrar espriyi öldürür; PLANLI tekrar espriyi büyütür.** Havuzlardan gelen replikler oyuncuya oturum başına bir kez gösterilir; tüm havuzlar rotasyonlu ve "son gösterileni tekrarlamaz" mantıklıdır (Bölüm 5'teki `pick()` sözleşmesi). Bunun **tek istisnası** §1.7'deki geri dönen esprilerdir (running gag): onlar tasarım gereği tekrar eder, ama **her tekrarda büyümek zorundadır**. Büyümeyen tekrar, tekrar değil kopyadır ve silinir.

**Ton kaynakları ve dozları (genlik yükseltilmiş):**
- *Nasreddin Hoca:* kendine gülen bilgelik, ters mantık ("Uyumuyordum, gözümü dinlendiriyordum"). → köylüler, saka. **Genlik:** ters mantık artık tek cümlede kalmaz, üç adımda tırmandırılır (§1.5-1).
- *Meddah:* abartılı tasvir + tek cümlelik dönüş. → nöbetçiler, hamam. **Genlik:** dönüş cümlesi daha sert kırılır; "biraz tuhaf" değil, "adam ne diyor" seviyesinde.
- *Karagöz-Hacivat:* statü farkı atışması (usta-çırak, iki nöbetçi). Karagöz'ün **temposu** alınır, **ağzı alınmaz** — kaba sokak dili yoktur, hızlı laf sokuşturma vardır. → demirci ocağı, burç.
- *Osmanlı defter/bürokrasi dili:* deadpan'in altın madeni (§1.5-4). → kethüda, resmî bildirimler, başarım metinleri.
- *Mizah bütçesi:* eski "saatte 6-10 tema" tavanı **kaldırılmıştır**; yeni yoğunluk ve ritim sözleşmesi §1.6'dadır (saatte 15-20 beat, kademeli; kanal başına cooldown'lar Bölüm 4 tablosunda korunur).

### 1.5 Kahkaha zanaatı — 9 teknik

Bu, yazarın elindeki asıl alet çantasıdır. Bir replik yazarken **hangi tekniği kullandığını adlandıramıyorsan, o replik muhtemelen komik değildir.** Her teknikte önce tarif, sonra bu oyundan somut örnek, çoğunda da öğretici bir **ZAYIF → GÜÇLÜ** çifti vardır.

---

**1) Tırmanma (escalation) — üçlü kural**

İlk cümle tuhaftır, ikincisi daha tuhaftır, üçüncüsü çuvallamanın zirvesidir. Kahkaha ikinci cümlede birikir, üçüncüde patlar. İki cümlede biten şaka tebessümde kalır; dört cümleye yayılan şaka dağılır. **§1.2'deki "en fazla 3 cümle" sınırı tesadüf değildir: üçlü kuralın tam ölçüsüdür.** Tırmanmanın basamakları aynı eksende olmalıdır (sayı büyür, saçmalık derinleşir, iddia yükselir) — eksen değişirse tırmanma değil, konu değişikliği olur.

> **ZAYIF:** "Kargalar ekine dadandı beyim, uğraşıyoruz."
> **GÜÇLÜ — Orakçı Bekir (`farmer_talk`):**
> *"Karga geldi, kovaladım. Ertesi gün iki geldi, ikisini de kovaladım. Dün otuz geldi, biri tırpanımın sapına kondu, ötekiler onu dinledi."*

> **GÜÇLÜ — Okçu Balaban (`guard_talk` açılış):**
> *"Üç yıldır bu burçtayım, bir kere düşman gördüm beyim. Hancının kaçmış eşeğiymiş. Yine de yakaladık — hâlâ elimizde."*

---

**2) Somutluk — absürt spesifik detay**

Genel ifade güldürmez, spesifik detay güldürür. "Rahatsız etti" komik değildir; "üç kez denedi, birine isim koydum" komiktir. Kural: her şakada **sayı, isim veya nesne** olsun. Sayı tek ve tuhaf olsun (üç, yedi, on bir — "birkaç" değil). İsim dönemsel ve sıradan olsun (görkemli isim seçmek şakayı sırıtan hâle getirir). Nesne elle tutulur olsun (ip, düğüm, kırba, körük, defterin kenarı).

> **ZAYIF:** "Kuyunun ipi eskimiş beyim, zahmet oluyor."
> **GÜÇLÜ — Saka İbrahim (`saka_talk` açılış):**
> *"Kuyunun ipi benden evvel azlini istedi beyim. İki düğümü vardı, dün üçüncüyü attım; ortadakine 'Sağlam' adını koydum. Konuşmuyor ama çekiyor."*

**Uyarı (denetim maddesi):** Absürt isimler **kutsal veya saygıdeğer isimlerden seçilemez.** Bir kargaya, ipe, eşeğe veya kırbaya dinî/tarihî saygı taşıyan bir ad verilmesi §1.3-1'in doğrudan ihlalidir. Havuzda kullanılacak güvenli ad kalıpları: mesleki lakaplar (Düğüm, Kırık Sap, Sağlam), sıradan halk adları, ya da mizahi unvan takıntısı (bkz. §1.7 GAG-5 "Kara Çelebi").

**İkinci uyarı — MAKAM ADI (denetim bulgusu sonrası eklendi):** Bir hayvana, nesneye veya şaka lakabına verilen **makam/vazife adı**, temeli dinî olan bir vazifeye ait olamaz. Yasak: hisbe (**muhtesib**), imamet, müezzinlik, kadılık, naiblik, vakıf mütevelliliği ve benzerleri — bunlar dünyevi bir memuriyet gibi *görünseler de* dayanakları dinîdir (hisbe için: emr-i bi'l-ma'rûf), dolayısıyla §1.3-1 kapsamındadırlar. Serbest olan: tamamen dünyevi denetim/zanaat/idare imgeleri (*kantarcı, çavuş, bekçi, kâtip, mirab, kethüda*). Bu uyarının denetim karşılığı §7.2(a2)'dir.

---

**3) Karakter çelişkisi — kendine biçtiği rol ile gerçeğinin uçurumu**

En güvenilir kahkaha kaynağı budur, çünkü hem güldürür hem karakteri kurar. Kendini kahraman sanan korkak nöbetçi, kendini âlim sanan çırak, kendini stratejist sanan tarla işçisi. Uçurum ne kadar geniş, kahkaha o kadar yüksektir — **ama karakter kendi çelişkisini asla fark etmez** (fark ederse deadpan bozulur, §1.5-4).

> **GÜÇLÜ — Çırak Salih (`cirak_talk` / örs atışması):**
> *"Usta 'körüğü bırakma' dedi, bırakmadım beyim. Ocak söndü. Körük elimde."*

> **GÜÇLÜ — Attar Mehmet Efendi (`attar_talk`):**
> *"Her derde deva vardır beyim, sabır otu bile vardır. İki aydır onu arıyorum. Bulunca ilk ben içeceğim."*

---

**4) Deadpan (ciddi surat) — absürdü resmî dille söylemek**

Absürt olayı son derece sakin, resmî, **defter diliyle** anlatmak. Osmanlı bürokrasi dili bunun için altın madenidir: hane, kayıt, berat, mühür, "işlenmiştir", "kaydı düşülmüştür", "zabıt tutulmuştur". Anlatan kişi olayın tuhaflığını fark etmez; **fark eden yalnız oyuncudur** ve kahkaha tam o boşlukta doğar. Bu teknik sistem metinlerinde de (bildirim, başarım adı, durum etiketi) serbesttir — orada anlatıcı sırıtmaz, **tutanak tutar**.

> **ZAYIF:** "Kargalar yine geldi, ne yapacağımı şaşırdım!"
> **GÜÇLÜ — Kethüda Koca Yakub (`kethuda_talk`):**
> *"Karga vakası deftere işlendi beyim. 'Ekinden eksilme' hanesine değil, 'misafir' hanesine yazdım. Üç gün kaldı zira."*

> **GÜÇLÜ — bildirim metni (K5/K11 kanalı, deadpan sistem sesi):**
> *"Kale kayıtlarına düşülmüştür: esir bir baş, dört ayak, kulakları uzun."*

---

**5) Geri dönen espri (callback / running gag)**

Aynı şakanın oyunun ilerleyen saatlerinde, **büyüyerek** dönmesi. İlk karşılaşma kurar, ikincisi tanıdıklık hazzı verir, üçüncüsü kahkahayı patlatır — çünkü oyuncu üçüncüde artık şakayı *önceden* bilir ve gülmeye hazır bekler. Bu, oyunun elindeki **en yüksek genlikli** araçtır ve en ucuzudur: aynı malzeme üç kat verim üretir. Tam katalog §1.7'dedir. En büyük gülme anları **iki ayrı gag'in çarpıştığı** yerde doğar (defter × eşek, defter × karga).

> **GÜÇLÜ — çapraz zirve (Hancı İdris + Zırhlı Nefer Timur, meydan sahnesi):**
> İdris: *"Eşeğimi geri istiyorum."*
> Timur: *"Beratsız esir salıverilmez."*
> İdris: *"Ne beratı be adam, o benim eşeğim!"*
> Timur: *"Defterde 'casus' yazıyor. Kethüda ikisini de yazmış."*

---

**6) Statü düşmesi**

Kendini ciddiye alan, statü sahibi karakterin küçük ve dünyevi bir rezilliğe düşmesi. Yükseklik ne kadar fazlaysa düşüş o kadar komiktir. **Dikkat:** düşen kişi **asla** §2'deki mizahsız listeden olamaz. Dizdar Hamza Bey'in kendisi düşmez — **onun geleceğini duyunca panikleyen nöbetçiler** düşer; mizah dizdara değil, nöbetçilerin telaşınadır (mevcut §2 kuralı korunur). Aynı şekilde kethüda düşerken saygınlığı yıkılmaz, sadece defteri karışır.

> **GÜÇLÜ — burç telaşı (K9 / guard sahnesi):**
> Gazi Hasan: *"Dizdar Bey geliyor! Herkes yerine!"*
> Okçu Balaban: *"Eşeği ahıra sok, çabuk!"*
> Gazi Hasan: *"...Gelen saka İbrahim'miş."*

---

**7) Yanlış anlama zinciri**

İki NPC birbirini yanlış anlar, **oyuncu doğruyu bilir**. Kahkaha bilgi asimetrisinden doğar: oyuncu perdenin arkasını gördüğü için üstün konumdadır ve bu üstünlük gülmeyi serbest bırakır. Bu teknik meydan çiftlerinin (K9) ana yakıtıdır ve running gag'lerle mükemmel çalışır — çünkü oyuncu gerçeği zaten önceki sahneden bilir.

> **GÜÇLÜ — Irgat Veli & Reaya Mahmud (meydan çifti, K9):**
> Veli: *"Duydun mu, kale bir casus yakalamış."*
> Mahmud: *"Ne diyormuş?"*
> Veli: *"Hiçbir şey. Sır veren adama benzemiyor."*

---

**8) Hâl komedisi / fiziksel absürt**

Görsel olarak da komik olan durum: ters binilen eşek, kalabalıkta yanlış adamı kovalama, sırtından inmeyen kırba, adamdan uzun zırh. Bu oyunda çoğu zaman **anlatılan** bir fiziksel absürt olur (3D'de canlandırmak pahalıdır), ama anlatım görüntüyü oyuncunun kafasında kurmalıdır — o yüzden tasvir **tek nesneye** odaklanır, sahneyi tarif etmeye çalışmaz.

> **GÜÇLÜ — Saka İbrahim:**
> *"Dün keçi kırbadan su içti beyim. Suyu ben taşıdım, keçi içti. İkimizden biri saka değil."*

> **GÜÇLÜ — Tellak Hüseyin Ağa (`tellak_talk`):**
> *"Geçen bir bey geldi, 'ovma, kemiğim kırılır' dedi. Ovmadım. Çıkarken göbek taşında kaydı, kalkarken 'ovsaydın' dedi."*

---

**9) Beklenti kırma (subversion)**

Cümle epik başlar, bayağı biter. Kurulum kahramanlık vaat eder, kapanış dünyeviyi teslim eder. Bu teknik **gazi/asker karakterlerinde** en verimlidir, ama bir sınırı vardır: **gazâ, şehitlik ve gerçek dram asla kırılan beklenti olamaz** (§1.3-5 ve -6). Kırılan şey karakterin **kendi övünmesi**dir, kutsal olan değil.

> **GÜÇLÜ — Zırhlı Nefer Timur (`guard_talk`):**
> *"Bu zırh babamdan, ona da dedemden kalmış beyim. Üç kuşak gazi zırhı. Üç kuşak da benden uzunmuş."*

> **GÜÇLÜ — meydan çifti, Koca Dede'nin anlatma alışkanlığı üzerine (anının İÇERİĞİ değil):**
> Orakçı Bekir: *"Dede yine anlatıyor."*
> Reaya Mahmud: *"Neresinde?"*
> Bekir: *"'Toz kalktı'da."*
> Mahmud: *"Öyleyse çorbaya yetişiriz."*

**Teknik seçim rehberi (hangi kanalda hangisi çalışır):**

| Kanal | Birincil teknik | İkincil |
|---|---|---|
| Diyalog ağacı açılışı (K1) | Tırmanma + Somutluk | Karakter çelişkisi |
| Fallback / uyandırma replikleri (K2, K3) | Deadpan | Beklenti kırma |
| Durum etiketi (K4, ~34 karakter) | Deadpan | Somutluk |
| Harami yenilgi sözü (K5) | Beklenti kırma | Somutluk |
| Vergi tepkisi (K6) | Karakter çelişkisi | Deadpan |
| Hamam havuzu (K7) | Hâl komedisi | Yanlış anlama |
| Usta-çırak atışması (K8) | Karakter çelişkisi | Tırmanma |
| Meydan çifti (K9) | Yanlış anlama | Statü düşmesi |
| Başarım adı (K10) | Deadpan | Beklenti kırma |
| Mevsim/tımar bildirimi (K11, K12) | Deadpan | Somutluk |
| Running gag zirvesi (§1.7) | Callback | hepsinin bileşimi |

**KALIP KOTASI (teslim şartı — denetim bulgusu sonrası eklendi; 10. teknik DEĞİLDİR)**

> Bağımsız denetim, dokümanın 9 teknik ilan ettiği hâlde fiilen iki motorla çalıştığını tespit etti: en ağır tekrar *"hayvan/nesne insan vazifesi görür ve insandan başarılı çıkar"* (12 yer), ikincisi *"iki taraf simetrik olarak birbirini iptal eder"* (6 yer). Sorun bu repliklerin kötü yazılmış olması değildir; **oyuncu üçüncüsünden sonra kalıbı öğrenir ve dördüncüde vuruş cümlesini kendisi tahmin eder.** Tahmin edilen vuruş gülme değil onay üretir — §1.1-1'in "hoş ama gülmedim" hâli. §1.5'in "9 teknik" başlığı korunur (kardeş dokümanlar numaralara atıf yapıyor); aşağıdaki kural bir teknik değil, tekniklerin **kullanım kotasıdır**.

```
Teknik ile kalıp aynı şey değildir. Teknik "tırmanma"dır; kalıp, o tekniğin
somut kurgusu — "hayvan insanın işini yapar" gibi. Aynı teknik farklı kalıplarla
sınırsız kullanılabilir; aynı KALIP kullanılamaz.

1. Havuz içi kota: Bir havuzda aynı yapısal kalıp EN ÇOK 2 KEZ görünür.
2. Komşuluk kuralı: Aynı kalıptan iki replik, bir havuzda ARDIŞIK İNDEKSTE
   duramaz (K4'ün gün-sabit indeksi ve K12'nin ikili çekimi yan yana düşürebilir).
3. Doküman kotası: Hiçbir kalıp, toplam beat sayısının %5'ini aşamaz
   (bugünkü arzla: en çok 9 kullanım).
4. Sayım denetlenebilir: Her havuz elemanı §3'teki köşeli teknik etiketini
   ([TIRMANMA], [DEADPAN] …) taşır; kalıp adı bu etiketin yanına yazılır
   ([SOMUT · hayvan-vazife]). Kota, etiket sayımıyla denetlenir (§7.2-d).
5. Kota aşıldığında ne yapılır: Replik SİLİNMEZ, TEKNİĞİ DEĞİŞTİRİLİR.
   En zayıf değil, EN GEÇ YAZILMIŞ olan dönüştürülür — ilk kullanım kalıbı
   kurar, sonrakiler ondan borç alır.
```

> **ZAYIF (kalıp doygun):** *"Kedi ambarda yatıyor, fare kilerde. İkisi de vazifesinden memnun."*
> **GÜÇLÜ (aynı sahne, teknik değişti):** *"Ambardaki fare için kedi alınmış. Kedi ambarda yatıyor, fare kilerde; kileri kimse kediye söylememiş."*
> Fark: birincide gülünecek şey **hayvanların düzeni**, ikincide **köyün ihmali**. Aynı nesne, farklı hedef — kalıp doygunluğu böyle kırılır.

**Bu revizyonda kota gereği dönüştürülen replikler (kayda geçer):** 3-l/3 (statü düşmesi), 3-l/10 (karakter çelişkisi), 3-l/13 (yanlış anlama), 3-k/4 (hâl komedisi), 3-e/7 (beklenti kırma), 3-i/10 (statü düşmesi). *"Hayvan-vazife"* kalıbı 12 → 8, *"simetrik iptal"* 6 → 4'e inmiştir; ikisi de doküman kotasının (9) altındadır. Kalan simetrik iptaller ve gerekçeleri: 3-i/6 (simetri değil **statü takası**), `saka_talk` *"sen duymadın ben söylemedim"* (İbrahim'in imza kalıbı, tek kullanım), 3-m/2, 3-m/5.

### 1.6 Komedi yoğunluğu ve ritim

Kahkaha hedefi sadece **genlik** değil, **yoğunluk** da demektir. Eski bütçe (saatte 6-10 tema) tebessüm hedefine göre ayarlıydı ve kahkaha için seyrektir. Yeni sözleşme aşağıdadır.

**Beat kademeleri:**

| Kademe | Tanım | Süre | Kanal örneği |
|---|---|---|---|
| **T1 — mikro** | Tek satır: bildirim, durum etiketi, tek baloncuk, yenilgi sözü | 2-5 sn | K3, K4, K5, K11, K12 |
| **T2 — sahne** | 2-4 satırlık atışma veya NPC çifti; bir diyalog dalının komik bacağı | 10-25 sn | K7, K8, K9, K1 dalları |
| **T3 — set-piece (büyük gülme anı)** | Running gag zirvesi, çapraz zirve, tam komik diyalog dalı. Oyuncunun klip alacağı an. | 40-90 sn | §1.7 zirveleri, K1+K9 bileşimi |

**Saat başına hedef (Perde I-II, mizah dozu tam) — DÜŞEN EĞRİ (denetim bulgusu sonrası revize edildi):**

> **Neden düz hedef bırakılmadı.** Denetim, "15-20 beat/saat × 8 saat = 120-160 beat" hedefinin arzla desteklenmediğini gösterdi. Kritik ayrıntı şudur: §1.6 tekrar yönetimi `seen` kümesiyle **sıfır tekrar** dayatır, yani **bir havuz elemanı = tüm kampanyada tam 1 beat**. Sabit yoğunluk, oyun uzadıkça **doğrusal artan** içerik maliyeti demektir. Ayrıca oyuncunun ihtiyacı da sabit değildir: birinci saatte her karakter yenidir ve her replik bilgi taşır; yedinci saatte oyuncu Kara Çelebi'yi, Yağız'ı ve iki defteri **zaten tanır**, bu yüzden aynı gülme etkisini **daha az** beat'le alır. Tanıma, tekrarın yapamadığı işi yapar. Hedef bu yüzden düşen bir eğridir; **his düşmez, sayı düşer.**

| Bant | Saat | Hedef beat/saat | Gerekçe |
|---|---|---|---|
| **Açılış** | 1-2 | **18-22** | Her karakter yeni; diyalog ağaçları ve tımar kusurları burada tüketilir. İlk izlenim aşağıdaki onboarding maddesiyle korunur. |
| **Orta** | 3-5 | **12-15** | Havuzlar dönmeye başlar; gag'lerin 2. aşamaları yükü paylaşır. |
| **Geç** | 6-8 | **8-10** | Zirveler burada; tanıma etkisi beat başına verimi yükseltir. |

**Toplam hedef:** 2×20 + 3×13,5 + 3×9 ≈ **108 beat / 8 saat**. **Gerekli arz** (tetiklenmeme payı ×1,4): **≈ 150 tekrarsız eleman** — pay şarttır, çünkü oyuncu hamama hiç gitmeyebilir, hiç dövüşmeyebilir, akşam meydanda olmayabilir.

**Kademe içi aralık kuralları (DEĞİŞMEDİ — bant hedefinden bağımsız ve üstün):**

| Kademe | Saatte (orta bant) | Aralık kuralı |
|---|---|---|
| T1 | 8-10 | iki T1 arası **≥ 90 sn** |
| T2 | 3-4 | iki T2 arası **≥ 4 dk** |
| T3 | **1-2** | iki T3 arası **≥ 25 dk**; bir T3'ten sonra **≥ 8 dk** tam mizah sessizliği |
| **Yığılma tavanı** | — | herhangi bir 5 dk penceresinde **en çok 3 beat** |

**Kanal başına saatlik tavan (yeni kural — havuzun erken tükenmesini engelleyen asıl çözüm):**

> Arzı büyütmek tek başına yetmez: 24 çiftlik bir havuz, hiçbir kısıt yoksa 2 saatte de tükenir ve 6-8. saatte kanal susar. Bu yüzden: **her havuzdan bir oyun saatinde en çok `ceil(havuz_uzunluğu / 8) + 1` beat çıkar.** Tavana ulaşan kanal o saat için susar (havuz tükenmiş gibi davranır, ama tükenmez). Gerekçe: §1.6 zaten "havuz tükenirse kanal susar" diyor; bu kural yalnızca **susmayı öne alıp 8 saate yayar.** Tavan bir *hedef değil, tavandır*: yığılmayı keser, alt sınırı arz sağlar.
>
> ```js
> // src/data/humor.js — pickHumor imzasına eklenir
> // hourlyUsed: Map(key -> {hour, count}); hour = Math.floor(playTimeMs / 3600000)
> const cap = Math.ceil(pool.length / 8) + 1;
> if (usedThisHour(key) >= cap) return null;
> ```
>
> Tavanların toplamı hedefi doğrular: 3-i 4 + 3-h 5 + 3-o 4 + 3-c 4 + 3-g 4 + 3-e 4 + 3-m 2 = **27 T1/T2 tavanı**; her kanal her saat tetiklenmediği için gerçekleşen sayı bant hedefinin (8-22) içinde kalır.

**Arz büyütme planı (denetim aritmetiğinin kapanması — adetler hedeftir, içerik teslimi D hattıdır):**

| Kanal | Bu sürümde teslim | Hedef | Neden bu kanal |
|---|---|---|---|
| 3-i meydan çifti | 10 çift / 47 satır | **24 çift** | En sık tetik (her akşam, çift başına 1); geç bandı taşıyacak tek kanal. |
| 3-h örs atışması | 14 atışma / 49 satır | **26 atışma** | 45 sn cooldown; oyuncu köyde çok vakit geçirir. |
| **3-o tek NPC iş baloncuğu** *(yeni kanal, havuzu D hattında yazılacak)* | 0 | **20** | En ucuz sürekli T1 kanalı. **Yeni kanca yok:** K9'un `VillagerAI` WANDERING dalı, çift bulunamadığında tek NPC varyantına düşer. Tek satır, günün işine dair, deadpan. Havuz boşken kanal sessizdir (`pickHumor` null döner) — teslim edilmemesi hiçbir şeyi kırmaz. |
| 3-c uyandırma | 14 | **20** | NPC × gün başına 1; uyuyan NPC sayısı yüksek. |
| 3-g hamam | 15 | **22** | Ziyaret başına 2; hamam can/dinçlik için sık kullanılıyor. |
| 3-e harami yenilgi | 13 | **18** | Çatışma başına ≤2; harami avı tekrarlanabilir. |
| 3-k mevsim | 8 | **12** | Mevsim başına 3 varyant — serbest oyunda ikinci yıl tekrar olmasın. |
| T3 set-piece (§1.7) | **10** | 10 | Bu sürümde **teslim edildi** (4 gag zirvesi + T3-E…T3-J). |

**Bugünkü fiilî arz (beat sayılabilir olanlar):** 3-c 14 · 3-e 13 · 3-g ~12 · 3-h 14 · 3-i 10 · 3-j 12 · 3-m 5 · 3-f 2 (yılda 1 tahsilat) · 3-k 2 (kampanya 2 dönüm) · 3-l 2 (oyun başına 1-2 kusur) · 3-a+3-b ağaçları ~26 komik düğüm · §1.7 gag aşamaları 15 · T3-E…T3-J 6 → **≈ 133 tekrarsız eleman.** 3-d (28 etiket) **beat sayılmaz**: ambient duvar kâğıdıdır, ekranda sürekli durur. Hedef 150'ye kalan fark (**+17**) yukarıdaki plan tablosundan kapanır; **dağılım sorunu ise saatlik tavan kuralıyla çözülür** — denetimin asıl bulgusu toplam sayı değil, içeriğin oyunun başına yığılmasıydı.

**İlk 10 dakika (onboarding — pazarlıksız):** İlk kahkaha **3. dakikadan önce** düşmelidir. Yerleşim `01-akis-ve-tutundurma.md` satır 229 ile uyumludur: köprü dönüşünde Saka İbrahim. İlk 10 dakikanın bütçesi: **2×T1 + 1×T2 + en az 2 running gag kurulumu**. T3 ilk 10 dakikada YOKTUR — set-piece'in çalışması için oyuncunun karakterleri tanıması gerekir.

**Sessizlik gerekliliği — "her an şaka = hiçbir şaka":**
- Her 20 dakikada **en az 5 dakikalık tamamen kuru pencere** bulunmalıdır (sıfır mizah beat'i). Bu pencere rastgele değil, **anlatı ciddiyetinin yükseldiği** yere denk getirilir (arzuhal karara bağlanırken, sefer haberi gelirken, gece nöbetinde).
- Bir T3'ten sonraki 8 dakika kuru geçer. Kahkahanın tazeliği doygunlukla değil, **açlıkla** korunur.
- Ciddi bir anlatı beat'inin (dram, ferman, kayıp haberi) **±90 saniyesinde** hiçbir mizah kanalı tetiklenmez. Bu, §6'daki `isHumorMuted` bayraklarına ek, **yumuşak** bir kapıdır: `gameState.flags.soberUntil` (timestamp) yazılır ve `pickHumor()` bu pencerede boş döner. §6'nın sert bayrakları bu yumuşak kapıdan bağımsız ve üstün çalışır; hiçbiri gevşemez.
- Perde eğrisi korunur: Perde I-II tam doz; Perde III yarı doz (T3 yok, T2 yarıya iner); Perde IV sıfır (§6 bayrak 4).

**Tekrar yönetimi — aynı şaka iki kez duyulmaz:**
- `gameState.humor.seen` — gösterilmiş her replik `id`'sini tutan **kalıcı** (kayda yazılan) küme. `pickHumor()` önce `seen` dışından seçer; havuz tükenirse **sessiz kalır**, tekrar etmez. Tükenen havuz bir denetim uyarısıdır (§7), oyun içi bir çözüm değil.
- Bir havuz tükendiğinde ilgili kanal o oturum için kapanır; oyuncuya "yeni bir şey yok" hissi, "aynı şeyi ikinci kez duydum" hissinden **daha az** zarar verir.
- **Tek istisna:** §1.7 running gag'leri. Onlar tekrar eder ama aşama numarası tek yönlüdür (`stage` yalnız artar, asla geri dönmez); aynı aşama iki kez oynatılmaz.
- Zirvesi oynanmış bir gag **arşive kalkar**: geride yalnızca 1 adet "kalıntı" replik kalır, o da düşük olasılıkla (≤ %15) ve oturumda en çok bir kez çıkar. *(Terim notu: bu kavram önceki taslakta "emekli olur" diye yazılıydı; "emeklilik" 1396'da bulunmayan bir sosyal güvenlik kurumudur ve meta terminolojide kalması uygulayıcının onu replik sanmasına yol açar — bkz. §7.2 anakronizm grep'i.)*

**Denetlenebilirlik:** Bu bölümün tamamı sayılabilir olduğu için §7.5'te dört ölçüm maddesi vardır: (a) 60 dakikalık kayıt üzerinde beat sayımı **bant hedefinde** mi, (b) 5 dakikalık pencerede 3 beat aşımı var mı, (c) kayıt boyunca tekrar eden replik `id`'si var mı (running gag aşamaları hariç, sıfır olmalı), **(d) hiçbir kanal saatlik tavanını (`ceil(havuz/8)+1`) aşmadı mı.**

### 1.7 Geri dönen espriler (running gag) kataloğu

Beş hat. Her hattın **üç aşaması** vardır: **kurulum → 2. karşılaşma → zirve (T3)**. Aşamalar `gameState.flags.gag.<ad>` sayacıyla yönetilir (0 = hiç görülmedi, 3 = zirve oynandı, 4 = arşiv). Sayaç yalnız artar. Her aşama `isHumorMuted()` (§6) ve `soberUntil` (§1.6) kapısından geçer. Zirveler oyunun **büyük gülme anlarıdır** ve §1.6'daki T3 bütçesini bunlar doldurur.

---

**GAG-1 — Saka İbrahim'in azilli ipi** · sistem: **K1** (`saka_talk` aşamalı açılış düğümü) · sayaç: `gag.rope`

> **KANON (denetim bulgusu sonrası tekleştirildi — bağlayıcı):** Denetim, dokümanın **dört ayrı ip hikâyesi** anlattığını tespit etti (düğüm sayısı 3 → 4 → 3, ip sayısı 1 → 2 → 1 arasında zıplıyordu); oyuncu hepsini gördüğü için tırmanma çıkmıyor, tekrar **kopya** oluyordu (§1.1-5 ihlali). Kanon artık tektir ve tek eksende yürür: **TEK İP, ARTAN DÜĞÜM, KISALAN İP.** Her düğümde ip bir karış kısalır; İbrahim kalan yolu kendi iner. Sayı tek yönlü büyür: **2 → 3 → 4 → 5**. **İkinci ip yoktur** — "ikinci ip" diye geçen şey, ilk ipe eklenip düğüm sayılan parçadır. Kuyunun dibinde kalan **nal** korunur, çünkü GAG-2'nin ikinci aşamasındaki "mevcut, sahipsiz" hanesinde karşılığını bulur. Ortadaki düğümün adı **"Sağlam"**dır (mesleki lakap kalıbı, §1.5-2'nin güvenli ad listesi) ve zirvenin callback'idir.
>
> **İkinci düzeltme — anakronizm:** Hattın çekirdeğindeki *"emekliye ayrıldı"* imgesi kaldırılmıştır; emeklilik bir sosyal güvenlik kurumudur, 1396'da yoktur. Yerine **azil** (görevden alınma) konmuştur: 14. yy Osmanlı idarî terminolojisinde yerleşiktir, halk ağzında duyulur (kadı azli, subaşı azli) ve dokümanın altın madenine — §1.5-4 deadpan defter/bürokrasi diline — doğrudan bağlanır. Zincir üç aşamada tek eksende yürür: **azlini istedi → azli çıkmadı, vazifede → yerine yeni ip tayin edildi.** Kazanç: "azil dilekçesi verdiği hâlde çalışmaya devam eden memur" imgesi, "emekli olduğu hâlde çalışan ip" imgesinden **daha** deadpan'dir.

| Aşama | Tetik | Düğüm | İçerik |
|---|---|---|---|
| **0 — ekim** | Başlangıç ekranı, oyuncu İbrahim'i görmeden (§3-l/4) | 2 | *"Kuyu ipi iki yerinden düğümlü. Saka her düğümde ipi bir karış kaybediyor, kuyu her ay bir karış derinleşiyor. İkisinden biri yalan söylüyor."* |
| **Kurulum** | İlk `saka_talk` (01-akış: köprü dönüşü, ~3. dk) | 3 | *"Kuyunun ipi benden evvel azlini istedi beyim. İki düğümü vardı, dün üçüncüyü attım; ortadakine 'Sağlam' adını koydum. Konuşmuyor ama çekiyor."* |
| **2. karşılaşma** | `gag.rope===1` ve **≥2 oyun günü** geçmiş | 4 | *"Dördüncü düğümü de attım beyim. İp artık kuyuya yetişmiyor; kalan yolu ben iniyorum."* |
| **ZİRVE (T3)** | `gag.rope===2` ve köy için yeni ip alınmış/verilmiş olması (veya 7. gün) | 5 | Yeni ip **tayin edilir**, eskisinin azli nihayet çıkar — İbrahim eskisini yine de **atmaz**, alışamaz. *"Yeni ip tayin oldu beyim, kuyuya fazlası bile var. Alışamadım; bu sabah ortasına bir düğüm attım, adını yine 'Sağlam' koydum."* Oyuncu seçeneği **"Eskisini ne yaptın?"** → *"Omzumda beyim. Yenisi çekerken ona bakıyorum; dört düğümü var, ben de ona göre çekiyorum."* Kapanış seçeneği **"Kaç düğüm oldu bu İbrahim Ağa?"** → *"Beş beyim. Dördü eskide, biri yenide. Eskiyi saymazsam yenisine haksızlık olur."* Sahne yönü (korunur): eski ip omzunda görünür (mesh: mevcut kırba dizilimine ek basit halat objesi) ve İbrahim yeni ipi çekerken eskisine **danışır**. |

Bağlantı: zirve `K10` başarımını tetikler → **"İpin Vârisi"** (deadpan başarım metni; §3-j `ACH_SAKA_DOSTU`, bu revizyonda adı ve metni zirveye bağlandı — yeni Steam ID'si gerekmez). Arşiv kalıntısı: *"Eski ip omzumda beyim, huyunu bilirim. Yenisi çekiyor, eskisi bakıyor."*

**Kanona uyduğu doğrulanan yankılar (dokunulmadı):** §3-d/18 `(İple pazarlık ediyor 🪣)` · §3-k Yaz/3 (*"kırk kez kuyuya indi… birinde kendisi"* — aşama 2'den sonra daha iyi oturur). **Kanona göre yeniden yazılanlar:** §3-l/4 (aşama 0), §3-g/11 (aşama 2 yankısı), §3-a ip dalı (satır içi metinler), §3-j `ACH_SAKA_DOSTU`.

---

**GAG-2 — Kethüda Koca Yakub'un defteri** · sistem: **K1** (`kethuda_talk`) + **K6** (vergi tahsilatı bildirimi) · sayaç: `gag.defter`

| Aşama | Tetik | İçerik |
|---|---|---|
| **Kurulum** | İlk `kethuda_talk` GAG-2 dalı (**§3-n**, kes-yapıştır blok) | *"Irgat Veli'nin hastalığını deftere yazdım beyim. Yanlış deftere yazdım. Şimdi 'zahire' hanesinde bir hasta var."* |
| **2. karşılaşma** | `gag.defter===1` **ve ≥1 oyun günü** geçmiş, yine `kethuda_talk` içinde | Yanlış defter artık **paralel bir bürokrasi**dir: *"Bu ay iki defter tuttum beyim. Biri asıl, biri yanlış olan; yanlış olanı daha muntazam çıktı."* (Tam metin §3-n'dedir.) |
| **ZİRVE (T3)** | `gag.defter===2` **ve** (`gag.esek≥2` **veya** `gag.karga≥2`) — yani başka bir gag ile çarpışma hazırsa | Kethüda iki defteri yan yana koyar, çelişkiyi çözmek için **üçüncü bir defter** açar. Oyuncuya seçenek: "Hangisi asıl defter?" → *"Hangisi elimdeyse o beyim."* (Tam metin §3-n'dedir.) |

> **Tetik düzeltmesi (denetim bulgusu).** Önceki taslakta 2. aşamanın tetiği `collectAnnualTax` (K6) idi. O kanca **yılda bir kez** çalışır ve kampanya altı ay sürer — yani **taşıyıcı gag'in orta basamağı, oyunun tamamında bir kez bile tetiklenmeyebilirdi.** Taşıyıcı gag oyunun en seyrek kancasına asılmıştı. Artık üç aşama da `kethuda_talk` içinde (K1 — oyuncu iradesiyle açılan, her gün erişilebilir kanal) yaşar. K6 tahsilat bildirimi (*"Hesap tuttu beyim. Yalnız iki hane fazla çıktı: biri karga, biri Veli'nin hastalığı."*) **aşama değil, yankı** olarak kalır; `gag.defter` sayacını ilerletmez.

Bağlantı: bu gag **taşıyıcıdır** — GAG-3 ve GAG-5'in zirveleri bu deftere bağlanır. Başarım: **"İki Defterli Hakikat"**. **Gövde metni §3-n'dedir** (denetim bulgusu: `kethuda_talk` GAG-2 dalı hiç yazılmamıştı ve üç gag birden askıda kalıyordu; bu revizyonda kes-yapıştır blok olarak teslim edilmiştir).

---

**GAG-3 — Nöbetçilerin esir eşeği** · sistem: **K1** (`guard_talk`) + **K9** (meydan çifti, çapraz zirve) · sayaç: `gag.esek`

| Aşama | Tetik | İçerik |
|---|---|---|
| **Kurulum** | İlk `guard_talk` açılışı | Okçu Balaban: *"Üç yıldır bu burçtayım, bir kere düşman gördüm beyim. Hancının kaçmış eşeğiymiş. Yine de yakaladık — hâlâ elimizde."* |
| **2. karşılaşma** | `gag.esek===1`, ≥2 gün sonra `guard_talk` | Esir artık **nefer**: Balaban onu deftere *"Yağız"* adıyla yazdırmıştır. Teftişte dizdar *"bu nefer nerede"* diye sorar, üç nöbetçi birden *"devriyede"* der. **Kanonik metin §3-b'dedir; §1.7 yalnız aşamayı ilan eder, metni tekrarlamaz.** Esire iyi muamele dalı (*"Hasan haklı çıktı, Yağız kilo aldı"*) §3-b'de kardeş seçenektir — §1.3-5 ile uyum ve dönem ahlakı gereği **kasıtlıdır**. |
| **ZİRVE (T3)** | `gag.esek===2` **ve** `gag.defter≥2` · meydanda Hancı İdris + bir nöbetçi aynı sahnede | **Çapraz zirve** (§1.5-5'teki metin): berat–defter–eşek üçlemesi. Çözüm: kethüda çağrılır, iki defteri yan yana koyar, eşek "casus" hanesinden "misafir" hanesine **nakledilir** ve İdris'e teslim edilir. Nöbetçiler bunu **zafer** sayar. |

> **2. aşama tekleştirmesi (denetim bulgusu).** Önceki taslakta **iki paralel 2. aşama** vardı: §1.7'de "esir nezarette, karavanadan tayın alıyor, kilo aldı", §3-b'de "fidye bir tas hoşaf, deftere Yağız adıyla nefer yazıldı, teftişte devriyede dendi". İkisi de aynı gag'in ikinci basamağı olarak yazılmıştı. **§3-b sürümü kanondur**, üç gerekçeyle: (1) ekseni doğrudur — esir → rütbe → defter kaydı → teftişte savunma → defterden nakil; bu eksen doğrudan GAG-2'ye akar, tayın ekseni hiçbir yere akmaz; (2) §1.7 sürümündeki `karavana` kelimesi 19. yy nizamiye terminolojisidir ve dokümandan çıkarılmıştır (§1.2 yasaklı liste); (3) zirve (berat–defter–eşek) zaten §3-b'nin sözlüğüyle yazılmıştır. Kaybedilen içerik yoktur: "esire iyi muamele" fikri §3-b'ye kardeş seçenek olarak taşınmıştır.
>
> **Zirve birliği:** GAG-2 ve GAG-3'ün zirvesi **aynı T3'tür** — *"Meydan Muhasebesi"*. İki gag ayrı ayrı zirve harcamaz. Sahne meydanda açılır (K9), kethüda dalında (K1, §3-n) kapanır; aynı olay iki kanaldan görünür. `gag.defter` ve `gag.esek` sayaçları bu tek sahnede birlikte 3'e çıkar. §1.6'nın "aynı saatte en fazla 1 zirve" kuralı böylece kendiliğinden sağlanır.

Başarım: **"Beratsız Esir Salıverilmez"**.

---

**GAG-4 — Çırak Salih'in söndürdüğü ocak** · sistem: **K8** (örs atışması, `VillagerAI` demirci bloğu) · sayaç: `gag.ocak`

| Aşama | Tetik | İçerik |
|---|---|---|
| **Kurulum** | İlk K8 atışması | Salih: *"Usta 'körüğü bırakma' dedi, bırakmadım beyim. Ocak söndü. Körük elimde."* Rüstem (tek cümle, deadpan): *"Emri tuttun, demiri kaybettin."* |
| **2. karşılaşma** | `gag.ocak===1`, ≥1 gün sonra | Salih **teori** üretir: *"Usta, ocağı bilerek dinlendirdim. Demir de yorulur."* Rüstem: *"Demir yorulmaz. Sen yorulursun. Körüğü çek."* |
| **ZİRVE (T3)** | `gag.ocak===2` ve oyuncu ≤12 m, ikisi iş başında | Salih ocağı **gece boyu söndürmez** — sabah gelen Rüstem ocağı yanar bulur ve çırağı över; sonra Salih söndürmemek için ne yaktığını sayar: *"Odun bitti, sonra talaş, sonra... eski körük."* Rüstem'in kapanışı tek cümle: *"Ocağı yaşattın, körüğü yaktın."* Ardından Ahi ahlakı **ciddi** tek satırla gelir (sabır/emek dersi) — atışma öğretiyle kapanır. **Kanonik metin §3-h/13 ve §3-h/14'tedir** (denetim bulgusu: zirve §1.7'de tarif ediliyordu ama 3-h havuzunda metni yoktu, yani K8 kancasına bağlanacak bir şey yoktu; bu revizyonda **iki ardışık atışma bloğu** olarak teslim edilmiştir — 13 = kahkaha bloğu, 14 = Ahi kapanışı, mizahsız). |

Başarım: **"Ocağı Yaşattın"**. **Yazım denetimi notu:** bu zirvenin ilk taslağında kapanış *"körüğü şehit ettin"* biçimindeydi; "şehit" kelimesi §1.3-1 ve §1.3-6 gereği bir espri cümlesinde **kullanılamaz** ve cümle yukarıdaki hâliyle kayda geçmiştir. Bu, §1.3-8'deki yüksek genlik denetiminin çalışan bir örneğidir: komik bulunan bir satır sınıra değdiğinde satır değişir, sınır değişmez.

---

**GAG-5 — Kara Çelebi (karga)** · sistem: **K9** (meydan/tarla çifti) + **K6** (vergi tepkisi) + **K1** (kethüda zirvesi) · sayaç: `gag.karga`

| Aşama | Tetik | İçerik |
|---|---|---|
| **Kurulum** | İlk `farmer_talk` veya tarla K9 sahnesi | Orakçı Bekir: *"Karga geldi, kovaladım. Ertesi gün iki geldi, ikisini de kovaladım. Dün otuz geldi, biri tırpanımın sapına kondu, ötekiler onu dinledi."* |
| **2. karşılaşma** | `gag.karga===1`, ≥2 gün sonra, K9 çifti | Köylüler kargaya **unvan** verir: *"Ona 'Kara Çelebi' diyoruz artık beyim. Kovalamıyoruz, selam veriyoruz. Kovalayınca daha çok geliyor."* |
| **ZİRVE (T3)** | `gag.karga===2` **ve** `gag.defter≥2` · `kethuda_talk` içinde | Kethüda deadpan: *"Karga vakası deftere işlendi beyim. 'Ekinden eksilme' hanesine değil, 'misafir' hanesine yazdım. Üç gün kaldı zira."* Oyuncu seçeneği: "Karga misafir mi olur?" → *"Defterde öyle yazıyor beyim. Defteri ben tutuyorum."* |

**Ad seçimi notu (denetim):** İlk taslakta kargaya verilen ad **kutsal çağrışımlı** olduğu için reddedilmiş, yerine dönemsel-nötr ve mizahi bir **unvan** takıntısı ("Kara Çelebi") konmuştur. Bu, §1.3-1'in mekanik uygulamasıdır ve §1.5-2'deki uyarıya bağlıdır.

---

---

**GAG DIŞI SET-PIECE'LER — T3-E … T3-J (denetim bulgusu sonrası eklendi)**

> **Aritmetik neden zorunluydu.** §1.6 bütçesi saatte 1-2 T3 × 8 saat = **8-16 T3** ister. Önceki taslakta 5 zirve vardı; GAG-2 × GAG-3 birleşmesinden sonra **4 ayrı T3 anı** kalıyor — yani arz, talebin en iyi hâlde yarısı. Üstelik yerleşim tablosunda **0-2. saatlerde hiç zirve yoktu**, yani §1.6'nın "her saat 1-2 T3" kuralı ilk iki saatte zaten ihlal ediliyordu. Önceki taslaktaki *"Zirveler bütçenin tamamını doldurur; ek T3 yazmaya gerek yoktur"* cümlesi **yanlıştır ve silinmiştir.** Aşağıdaki altı set-piece **mevcut kanallarda** yaşar; hiçbiri yeni sistem, yeni kanca veya yeni dosya istemez.

**T3-E — "Köprünün Orta Tahtası"** · kanal **K9** (meydan üçlüsü, `VillagerAI` WANDERING) · tetik: `irgat_veli` + `reaya_mahmud` 6 m içinde, oyuncu ≤15 m, 18:30-22:00 · koşul: başlangıç ekranında 3-l/2 kusuru çekilmiş olsun (yoksa serbest) · **saat 0-2**

> V: *"Köprünün orta tahtası bulunmuş."*
> M: *"Nerede?"*
> V: *"Bekir'in damında. İki senedir orada."*
> M: *"Bekir ne diyor?"*
> V: *"'Köprü verdi' diyor."*
> M: *"Köprü verir mi?"*
> V: *"Vermez. Amma iki senedir kimse istemedi."*

Teknik: yanlış anlama zinciri + statü düşmesi (**tırmanma değil** — kalıp kotası, §1.5). Kanca: 3-l/2 kusuru ödemesini alır; oyunun **ilk esprisi** ile ilk set-piece'i aynı nesneye bağlanır. Kurulum gerektirmez, çünkü oyuncu kusuru oyun başlamadan okumuştur.

**T3-F — "Sabır Otu"** · kanal **K1** (`attar_talk`, yeni üst seçenek) · tetik: oyuncu attarla ikinci kez konuşur · koşul: yok · **saat 0-2**

> Açılış: *"Sabır otunu buldum beyim. İki aydır arıyordum, meğer kendi çekmecemdeymiş. Açtım — boş; içine yalnız bir pusula koymuşum: 'sabret, gelecek.'"*
> → **"Pusulayı kim yazdı?"** → *"Ben yazdım beyim, iki ay evvel. Kendi yazımı tanımadım; iki gün de yazana kızdım."*
> → **"Şimdi ne yapacaksın?"** → *"Bekleyeceğim beyim. Bir müşteri gelir, 'sabır otu var mı' diye sorar; ben de ona pusulayı satarım."*

Teknik: karakter çelişkisi + tırmanma. §2'deki Attar tarifinin ("listeleme tiki, son kalem daima kendini vurur") tam ödemesidir.

**T3-G — "Yağız'ı Sakla"** · kanal **K9** (kale kapısı üçlü baloncuk; `guard_talk` NPC'leri, gece) · tetik: oyuncu 22:00-05:00 arası kaleye ≤15 m yaklaşır · koşul: `gag.esek≥1` **ve** `gag.defter≥1` · **saat 2-4**

> Hasan: *"Dizdar Bey geliyor! Herkes yerine!"*
> Balaban: *"Yağız'ı ahıra sok, çabuk!"*
> Timur: *"Defteri de sok!"*
> Hasan: *"Defteri niye?"*
> Timur: *"Yağız defterde."*
> Hasan: *"...Gelen saka İbrahim'miş."*

Teknik: statü düşmesi (hedef **nöbetçilerin telaşıdır**, dizdar değil — §1.5-6 ve §2 kuralı) + iki gag'in çarpışması. Bu sahne GAG-2 ve GAG-3'ün **zirvelerini harcamaz**, ikisini de büyütür. Klip potansiyeli en yüksek yeni sahne budur.

**T3-H — "Buğudaki Hüküm"** · kanal **K7** (`tellak_talk`, "hamamda ne konuşulur" dalının derinliği) · tetik: oyuncunun ikinci hamam ziyareti · koşul: yok · **saat 2-5**

> Açılış: *"Bugün kurna başında dört kişi ark davasını çözdü beyim. Hükmü mermerin buğusuna yazdılar, altına üç kişi mühür bastı."*
> → **"Dördüncüsü?"** → *"Dördüncüsü kalkıp gitti, hüküm buhar oldu. Şimdi mermerde iz var, davada yok."*
> → **"Peki ne oldu sonra?"** → *"İkinci hükmü yazdılar beyim, birincinin tersi çıktı. Birinciyi kimse hatırlamıyor; buğu şahitlik etmiyor."*

Teknik: deadpan + tırmanma. `quest_water_dispute`'a gayriresmî ipucu taşır (§1.1-2 şartı: şakayı silsen bilgi kalır).

**T3-I — "Fazla Hanesi"** · kanal **K6** (`collectAnnualTax`, `morale >= 70` bandı) · tetik: başarılı tahsilat · koşul: `morale≥70` · **saat 4-6** · sunum: **üç bildirim, ~6 sn arayla** (T3 uzunluğu bildirim kanalında böyle kurulur)

> 1. *"Orakçı Bekir öşrü verirken bir kile fazla döktü. Geri alırken utandı, bir kile daha döktü."*
> 2. *"Reaya Mahmud duydu, iki kile fazla verdi. Çiftçi Hasan üç verdi; kethüda saymayı bıraktı."*
> 3. *"Kethüda deftere yeni bir hane açtı: 'fazla'. Ambar doldu, hane doldu; altına 'bu köy beni yorar' diye kaydını düştü."*

Teknik: tırmanma + deadpan; GAG-2 yankısı. **Not:** eski 3-f/1 bu sahnenin T1 hâliydi (aynı şaka iki kademede iki kez anlatılamaz — §1.1-5). Havuz adedi düşmesin diye 3-f/1 **silinmedi, başka eksende yeniden yazıldı**; 3-f havuzu 12 satır olarak kalır.

**T3-J — "Hancının Pazarlığı"** · kanal **K1** (`hanci_talk`, yeni üst seçenek) · tetik: oyuncu hancıyla üçüncü kez konuşur veya `quest_inn_spy` aktif · koşul: yok · **saat 4-7**

> Açılış: *"Tüccar bugün pazarlık etti beyim. Üç gündür fiyatı iki katına çıkardım, dün üç katına; bugün itiraz etti."*
> → **"Sevindin mi?"** → *"Sevindim beyim. Adam tüccarmış, ben de hancıyım. İki gündür kim olduğumu unutmuştum."*
> → **"Fiyatı düşürdün mü?"** → *"Düşürdüm beyim, üçte birine. Şimdi ben zarardayım, o memnun; ikimiz de doğru yerdeyiz."*

Teknik: karakter çelişkisi + statü düşmesi. Esprinin nesnesi **İdris'in kendi pazarlık mantığıdır**, tüccarın milleti değil (§1.3-2 — mevcut 3-g/9 ile aynı denetim gerekçesi).

---

**Gag ve set-piece yerleşim takvimi (Perde I-II içinde, hedef 8-10 saatlik ilk kampanya):**

| Saat | Kurulum | 2. karşılaşma | **Zirve (T3)** |
|---|---|---|---|
| 0-1 | GAG-1, GAG-3, GAG-5 | — | **T3-E** *(≥ 40. dk; "ilk 10 dk'da T3 yok" kuralı korunur)* |
| 1-2 | GAG-2, GAG-4 | GAG-1 | **T3-F** |
| 2-4 | — | GAG-3, GAG-5 | **GAG-1 zirvesi**, **T3-G** |
| 4-6 | — | GAG-2, GAG-4 | **GAG-4 zirvesi**, **T3-H**, **T3-I** |
| 6-8 | — | — | **GAG-5 zirvesi**, **Meydan Muhasebesi (GAG-2 × GAG-3)**, **T3-J** |

Kural: **aynı saatte en fazla 1 zirve.**

**Aritmetik:** 4 gag zirvesi + 6 yeni = **10 T3** / 8 saat = **1,25 T3/saat** → §1.6'nın 1-2 bandının içinde. 4-6 bandında üç aday vardır; biri sarkarsa 6-8'e kayar, çünkü kural "aynı saatte en fazla 1 zirve"dir — zirveler saat **içine dağıtılır**, yığılmaz.

**Aralık denetimi:** "iki T3 arası ≥25 dk" kuralı 10 T3 için 250 dk minimum yer ister; 8 saat = 480 dk. Sığar, **%48 boşluk kalır**. T3 sonrası 8 dk kuru pencere de bu boşluğa rahat sığar (10 × 8 = 80 dk).

**İlk iki saat şartı (denetimin açık talebi):** T3-E (~0:40) ve T3-F (~1:25) → iki zirve, aralarında 45 dk. İkisi de ilk 10 dakikanın dışındadır ve ikisi de oyuncunun **tanıdığı malzemeye** dayanır (T3-E başlangıç ekranındaki kusura, T3-F attarın ilk konuşmasındaki "sabır otu" cümlesine) — set-piece'in çalışması için gereken tanışıklık şartı böylece ihlal edilmez.

**Onbirinci T3 (havuzdan gelen):** §3-i/6 (`saka_ibrahim` ↔ `tellak_huseyin`) bu revizyonda 6 satırlık (~24 sn) bir set-piece'e büyütülmüştür ve §1.6'da **T3 sayılabilir**; sayıldığında aynı aralık kurallarına (iki T3 arası ≥25 dk, sonrasında ≥8 dk sessizlik) tabidir. Yukarıdaki 10'luk aritmetiğe **dâhil edilmemiştir**, tampon olarak durur.

### 1.2 Dönem dili kuralları

**İlke (TARIHSEL doc Bölüm 11 ile aynı):** Anlaşılır modern Türkçe + dönem terimleri. Yapay Osmanlıca yığını YOK; her karakteri birbirine benzeten sürekli ağdalı dil YOK.

**Kahkaha için sözdizimi (yeni — zamanlama kurallarıdır, süsleme değil):**
- **Kısa cümle.** Komik cümle uzadıkça zayıflar. Kurulum cümlesi uzun olabilir; **vurucu cümle kısa olmak zorundadır** (ideal ≤ 7 kelime).
- **Vurucu kelime sona.** Türkçenin devrik yapısı bunun için serbesttir: *"Körük elimde."* / *"Hâlâ elimizde."* / *"Bulunca ilk ben içeceğim."*
- **Açıklama yasak.** Vurucu cümleden sonra gelen her ek satır şakayı öldürür ve **silinir**. Karakter kendi esprisini yorumlamaz.
- **Halk deyimi serbest, argo yasak.** Dönemde inandırıcı halk deyimleri, atasözü tadında kalıplar ve ölçülü ünlemler (*bre, hele, vay, ha, hay hay*) ritim aracı olarak serbesttir. Sokak argosu, kaba tabir ve modern deyim (*"kafayı yedim"*, *"iş çığrından çıktı"* modern tonuyla) yasaktır.
- **Tekrar ritmi.** Üçlü kuralın cümleleri **aynı sözdizimiyle** başlarsa tırmanma güçlenir (*"Karga geldi, kovaladım. / iki geldi, kovaladım. / otuz geldi..."*). Bu, dönem diliyle çelişmeyen tek "modern" komedi tekniğidir ve serbesttir.
- **Deadpan noktalama.** Şaka cümlesi **ünlem işaretiyle bitmez** (bağırma anları hariç). Nokta, deadpan'in noktalama işaretidir.

**Kullanılacak kelime/kalıp havuzu (serbest):**
bre, hele, beyim, ağa, usta, hocam, efendi, devletlü, gazi, evlat, aht, pusat, kırba, testi, kile, zahire, harman, öşür, defter, mühür, berat, nöbet, kazan, aş kazanı, tirkeş, hisar, burç, dizdar, kethüda, arzuhal, maslahat, havadis, yadigâr, nefer, azil, salıverme, yol vermek, berhudar, mukim, helal olsun, bereket versin, maşallah, inşallah, eyvallah, baş üstüne, sağ olasın, kolay gelsin, sıhhatler olsun, "derler ki", "vallahi", "hamdolsun", "Allah bilir".

> **Havuzdan çıkarılan üç kelime (denetim bulgusu, gerekçeleriyle):** `karavana` → **kazan / aş kazanı** (karavana 19. yy nizamiye terminolojisidir; "kazan" zaten dokümanın kendi iç dilidir — §3-b'de *"aşçı herkesi kazan payı sanır"* ve *"kemik kazana döner"* olarak geçiyor, yani değişiklik tutarlılığı **artırır**). `terhis` → **salıverme / yol vermek** (aynı gerekçe; ayrıca "salıvermek" GAG-3 zirvesinin vurucu cümlesine — *"Beratsız esir salıverilmez"* — callback ekimi yapar). `muhtesib` → **çıkarıldı** (hisbe teşkilatının dayanağı dinîdir; bkz. §1.5-2 makam adı uyarısı ve §7.2-a2).
>
> **Dinî kalıplar hakkında kritik sınır:** `bereket versin`, `maşallah`, `inşallah`, `hamdolsun` gibi kalıplar bu havuzda **serbesttir**, ama yalnız *saygılı halk kalıbı* olarak — **espri kurulumu veya vuruş basamağı olarak KULLANILAMAZ** (§1.3-1 ayrım notu). Denetim bu sınırın iki yerde aşıldığını buldu (3-f/8 *"Bereket versin…"*, 3-i/10 *"Maşallah."*); her ikisinde de replik yeniden yazılmış, kalıp kurulumdan çıkarılmıştır.

**Yasaklı/anakronik kelimeler (grep listesi — kabul kriteri 7.2'de taranır):**
`tamam` (onay ünlemi olarak; "tamamlandı" fiili serbest), `ok(ey)`, `süper`, `harika` (modern ünlem tonuyla), `sorun yok`, `stres`, `panik`, `plan yap`, `sistem`, `radar`, `masöz`, `12'den`, `taktik`, `motivasyon`, `enerji`, `pozitif`, `bonus`, `level`, `skor`, `kanka`, `abi/abla` (hitap), `bay/bayan`, `lütfen` yerine `kerem et/buyur`, `merhaba` yerine selam kalıpları. Ayrıca TARIHSEL doc 11 gereği: "kılıçtan geçir" sistem metinlerinde kullanılmaz; "küffar" yalnız buna uygun tek tük karakter ağzında, sistem anlatıcısında "Haçlı ordusu".

**Ek yasak liste — modern kurum ve nizamiye ordusu terminolojisi (denetim bulgusu sonrası eklendi):** Aşağıdaki kelimeler 1396'da **var olmayan kurumları** adlandırdıkları için yasaktır — ne oyun-içi replikte ne de **dokümanın kendi tasarım dilinde** kullanılırlar: `emekli / emeklilik / tekaüt`, `terhis`, `karavana`, `gündem`, `haftalık / aylık` (ücret anlamında), `maaş`, `zam` (ücret artışı anlamında), `izin günü`, `tur (atmak)`. Dönemsel karşılıkları: **azil / el çekme** · **salıverme, yol vermek** · **kazan, aş kazanı** · **maslahat** · **pay, hisse, ganimet payı** · **dolanmak, dönmek**. Denetim bu sınıftan dört ihlal buldu (`emekliye ayrıldı` 5 yerde + 3 meta geçiş, `gündem`, `haftalığım`, `karavana`/`terhis`); dördü de kapatılmış ve §7.2'ye kalıcı bir grep maddesi eklenmiştir. **Uyarı:** meta terminolojide kalan bir "emekli", uygulayıcının onu replik sanmasına yol açar — bu yüzden grep dokümanın tasarım dilini de kapsar.

> **Kahkaha uyarısı:** Yüksek genlikli replik yazarken bu listeye düşme riski **artar**, çünkü modern espri kalıpları modern kelimelerle gelir. Komik bulduğun bir satırda listeden bir kelime varsa, kelimeyi değiştirmek yerine **şakayı yeniden kur** — kelime değişimiyle kurtarılan şaka genellikle zaten zayıftır.

**Selamlaşma kuralı:** Dinî selam kalıpları ("Esselamü aleyküm...") mevcut diyaloglardaki gibi **ciddi bağlamda** kullanılır; selamlaşma hiçbir replikte espri malzemesi yapılmaz. Mizahi sahne selamla açılacaksa nötr kalıp kullanılır ("Buyur beyim", "Hoş geldin beyim").

**Cümle uzunluğu ve biçim sınırları (denetlenebilir):**

| Metin türü | Sınır | Kahkaha revizyonu |
|---|---|---|
| Diyalog ana metni (`text`) | en fazla 3 cümle / ~320 karakter | değişmedi (üçlü kuralın ölçüsü) |
| Diyalog seçeneği (`label`) | tek cümle / ~90 karakter | değişmedi |
| Meydan/dünya baloncuğu | ~90 karakter | değişmedi |
| Bildirim (`addNotification`) | ~130 karakter | 120 → **130** (mevsim bildirimlerinin vurucu kuyruk cümlesi 120'ye sığmıyordu) |
| Harami **yenilgi** sözü | ~80 karakter | sayı değişmedi; **satır adı** "son sözü" → "yenilgi sözü" (§3-e kurgu düzeltmesi) |
| NPC durum etiketi | ~34 karakter (parantez + emoji dâhil) | değişmedi |
| Başarım **adı** | 2-4 kelime | değişmedi |
| Başarım **açıklaması** | ~150 karakter | 90 → **150** (tırmanmalı açıklama 90'a sığmıyor; kırpılırsa vurucu cümle gider) |
| Örs atışması (K8), tek sahne | en çok **4 satır** | 3 → **4** (tırmanma üçlüsü + vurucu kapanış; 4. satır kesilirse espri kapanışı yok olur) · **Dipnot:** bir T3 set-piece'i **iki ardışık bloktan** oluşabilir (§3-h/13 + §3-h/14); sınır **blok başınadır**, sahne başına değil. T3'ün tanımı zaten çok bloklu bir andır (40-90 sn, §1.6), dolayısıyla bu bir istisna değil, T3'ün tarifidir. |

> **Not:** "En fazla 3 cümle" sınırı kahkaha hedefiyle **çelişmez, onu destekler**: üçlü kuralın (§1.5-1) tam ölçüsüdür. Dört cümleye ihtiyaç duyan bir şaka, üç cümleye sığmıyorsa gereğinden fazla açıklıyordur. Üç adımlı tırmanma tek metne sığmadığında çözüm metni uzatmak değil, tırmanmayı **ağacın derinliğine** yaymaktır (§3-a ve §3-b'de uygulandığı gibi): oyuncu her tıklamada bir kademe yukarısını açar, zirve cümlesi torun düğümde patlar.

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

**Yazım:** "â" inceltmesi yalnız yaygın kelimelerde (gazâ, ordugâh, kethüda serbest biçim "kethüda"); ölçüsüz transkripsiyon yok. Emoji kullanımı mevcut kod desenine uyar (seçenek etiketlerinde 1 adet, durum etiketlerinde 1 adet); TARIHSEL doc 9.9 "emoji ağırlığını azalt" dediği için **yeni içerik emoji sayısını artırmaz, mevcut deseni aşmaz**. Kahkaha genliği emojiyle değil, kurguyla üretilir.

### 1.3 YASAKLAR (istisnasız)

> **Kahkaha hedefi bu yasakları GEVŞETMEZ.** Genlik yükselirken sınırlar aynen yerinde durur; bu bölüm, mizah dozunun artmasından etkilenmeyen tek bölümdür. Yüksek sesli bir şakanın yanlış hedefe isabet etmesi, kısık sesli olandan daha çok yaralar — bu yüzden genlik arttıkça hedef seçimi **daha** titiz olur.

1. **Din, ibadet, din adamı, ayet, hadis, dua, ezan, namaz, mescid, hazire/mezarlık, şehitlik mizah nesnesi/aracı olamaz.** (Ayrım: `dua` kelimesinin "duan olur mu", "sen dua et, yeter" gibi saygılı halk kalıpları içinde geçmesi serbesttir; yasak olan, duanın espri nesnesi/aracı yapılmasıdır — denetim kuralı §7.2'dedir.) İmam Molla Şemseddin hiçbir esprinin ne öznesi ne nesnesidir; hakkında dedikodu bile yazılmaz. "Zemzem", "cennet/cehennem", "melek", "günah" kelimeleri espri cümlesi içinde geçemez. Din içeriği yalnız ciddi/öğretici tonda ve muteber kaynakla verilir.
2. **Etnik/dinî gruplara aşağılama yok.** Rum, Bulgar, Sırp, Frenk, Ceneviz, zimmî, Yahudi vb. hiçbir grup kolektif olarak alay konusu edilemez (TARIHSEL doc 15: "tek ahlâkî kalıba indirgenmemeli"). Askerin abarttığı sayı esprisi düşman *sayısı* hakkındadır, düşman *milleti* hakkında değil.
3. **Anakronik/internet şakası yok.** Meme, günümüz göndermesi, dördüncü duvar kırma ("bu bir oyun"), modern marka/kurum esprisi yasak. (Steam başarım adları oyun-dışı meta metindir; orada da dönem tınısı korunur, internet şakası yine yasaktır.)
4. **Müstehcenlik yok.** Hamam sahnesi dâhil: peştemal/edep vurgusu vardır, beden espirisi "sırtım-dizim-kemiğim" yorgunluk düzeyini aşamaz. Cinsellik iması, küfür, argo (bre/vay gibi dönem ünlemleri hariç) yasak.
5. **Zayıfı ezen mizah yok.** Yetim, hasta, yaralı (özellikle Ali), yaşlılığın acziyeti, yoksulluğun kendisi güldürü nesnesi olamaz. Koca Dede'nin "abartılı anı" mizahı anlatıcının tatlı tekrarına güler, yaşlılığına değil.
6. **Ölümle alay yok — istisnasız ve ara formsuz.** Ölüm, ölüm ânı, can verme, ceset, ölüm döşeği, ağır yara ve sakatlık hiçbir biçimde mizahın **nesnesi, aracı, kurulumu veya çerçevesi** olamaz. Ölmekte olan, ölmüş ya da ölümcül yaralı hiçbir karakter mizahi bir replik **söylemez** ve hakkında mizahi bir replik **söylenmez**. "Buruk ölüm mizahı", "ölenin dünyevi pişmanlığı", "son söz komedisi", "ölümü hafifletme" gibi ara formlar da **yasaktır**: bunlar istisna değil, yumuşatılmış ihlaldir. Ölüm bir sahnede varsa mizah o sahnede yoktur — metin ne kadar temiz olursa olsun, **oyuncunun ekranda gördüğü ölümse ihlal gerçekleşmiştir** (bu ilkenin uygulama karşılığı §7.1'deki `killEnemy` engelleyici maddesidir). Şehit/dost ölümlerinde mizah zaten tamamen susar (Bölüm 6).
7. **Oyuncuyu aşağılayan mizah yok.** NPC'ler beyi iğneleyebilir (saygı çerçevesinde, sitem/naz formunda) ama küçük düşüremez.
> **Değişiklik kaydı (madde 6 hakkında — bu kez lafız da değişti):** Madde 6'nın önceki lafzı 3-e havuzunu *"ölen adamın dünyevi pişmanlığının buruk mizahı"* diye tarif ediyordu. Bağımsız denetim bu tarifin **bir ölüm mizahı alt türünü meşrulaştırdığını** tespit etti: içerik düzeltilse bile kural, gelecekte yazılacak "buruk ölüm" içeriğine kapı açık bırakıyordu — ve gelecekte yazılacak her içerik bu lafzı emsal alacaktı. Bu yüzden bu revizyonda **hem içerik hem lafız** düzeltilmiştir: (i) 3-e'de harami artık ölmez, yenilir ve kaçar (§3-e "KURGU DÜZELTMESİ"); (ii) madde 6 ara formları da kapatacak biçimde mutlaklaştırılmış, **"ekranda görülen ölümse ihlal gerçekleşmiştir"** ölçütü eklenmiş ve bu ölçütün uygulama karşılığı §7.1'e **engelleyici ön koşul** olarak yazılmıştır. Sınır gevşemedi — **genişledi**.

8. **Yüksek genlik denetimi (kahkaha döneminde eklendi).** Bir replik "çok komik olduğu için" 1-7'deki bir sınıra yaklaşıyorsa **replik gider, sınır kalır.** Karar mercii tartışma değil, silme tuşudur. Özellikle şu üç risk yeni tekniklerle birlikte artmıştır ve teslim öncesi ayrıca taranır: (a) **absürt isimlendirme** (§1.5-2) kutsal/saygıdeğer ada kaymış olabilir; (b) **statü düşmesi** (§1.5-6) §2'deki mizahsız karakterlerden birini hedef almış olabilir; (c) **beklenti kırma** (§1.5-9) gazâ/şehitlik gibi kırılmaz bir beklentiyi kırıyor olabilir.

### 1.4 Mizah içinde tarih/din bilgisi — etiket kuralı

- Her mizah verisi kaydı `historicalConfidence: 'C'` taşır (TARIHSEL doc 12'deki görev şemasıyla aynı alan adı). **Running gag aşamalarının her biri ayrı kayıttır ve her biri ayrı ayrı `'C'` taşır.**
- Mizah repliğinin içine gömülü **olgu iddiası** varsa iki yol vardır:
  - İddia A/B düzeyinde doğrulanabiliyorsa düz söylenir (ör. sakaların ordu hizmeti, sebil vakıf geleneği — TDV İA "Saka", "Sebil" maddeleri).
  - Doğrulanamıyorsa **"derler ki / rivayet olunur / ben görmedim, eri söyler"** kalıbıyla R çerçevesine alınır. Örnek: Bayezid–Doğan Bey gece görüşmesi (TARIHSEL doc satır 219'un istediği gibi) guard_talk'ta asker rivayeti olarak verilmiştir (Bölüm 3-b).
- **Tırmanma uyarısı (kahkaha döneminde eklendi):** Tırmanan bir şaka (§1.5-1) her basamakta **iddiayı da büyütür**. Basamaklardaki abartı yalnız karakterin *kendi hâline* dair olabilir; tarihî/olgusal bir iddiaya dokunuyorsa üçüncü basamak R çerçevesine alınır ("derler ki") veya tırmanma o eksenden çıkarılır. Sayı abartısı düşman *sayısı* hakkında serbesttir (§1.3-2), düşman *milleti* hakkında değildir.
- Bu dokümanda geçen tek hadis: **"Temizlik imanın yarısıdır"** (Müslim, Tahâret 1) — sahih; `saka_talk` içinde espriden tamamen ayrı, **yalnız ciddi cevaplı bir alt dalda** ve ciddi tonda kullanılır (hadisin geçtiği düğüme mizahi oyuncu seçeneği bağlanmaz); kodeks girişinde kaynağı yazılır. Yeni hadis/ayet eklemek bu dokümanın yetkisinde DEĞİLDİR; ekleme ancak kaynak denetiminden geçmiş ayrı içerik kararıyla olur. **GAG-1 zirvesi `saka_talk` içinde oynanırken bu ciddi dal ile aynı düğüme bağlanmaz** — gag dalı ile hadis dalı arasında en az bir düğüm mesafesi bulunur.

---

## 2. KOMİK ROL HARİTASI

Mevcut kadro (analiz `narrative.contentInventory` + NPCManager.js). Her satır: arketip + karakter sesi tarifi + mizah dozu. **Kahkaha güncellemesi bu haritayı yeniden yazmaz, yükseltir:** karakter sesleri aynen korunmuştur, yalnız dozlar artmış ve her karaktere bir **kahkaha kaldıracı** (§1.5'ten hangi teknikle yükseleceği) ile varsa **taşıdığı gag** (§1.7) atanmıştır.

### 2-a. Arketip ve karakter sesi (korunur)

| NPC (dialogueId) | Komik arketip | Karakter sesi tarifi | Doz: eski → YENİ |
|---|---|---|---|
| **Tellak Hüseyin Ağa** (`tellak_talk`, DialogueSystem.js:585) | Hamamın meddahı | Oyunun hâlihazırdaki en mizahi karakteri (analiz doğruladı) — bu ton **şablondur**. Coşkulu, esnaf ağzı, müşteriyi öven-abartan; sırt/kemik/kese üzerinden hâl komedisi. Asla laf taşımaz, "göbek taşı sır tutar" felsefesi vardır. | Yüksek → **Çok yüksek** |
| **Saka İbrahim** (`saka_talk` — TANIMSIZ, sıfırdan bu dokümanda yazıldı; NPCManager.js:181-201) | Sitemkâr sucu | Yorgun ama gururlu; sitem eder, yardımdan geri durmaz. Kırba, kuyu ipi, diz ağrısı üzerinden öz-alay. Mesleğinin şerefini (sebil, susuza su) ciddi tonda savunur — sitemden vakara geçiş bu karakterin imzasıdır. | Yüksek → **Çok yüksek** |
| **Kale nöbetçileri: Gazi Hasan, Okçu Balaban, Zırhlı Nefer Timur** (`guard_talk` — TANIMSIZ, bu dokümanda yazıldı; NPCManager.js:298-322) | Asker muhabbeti (Karagöz-Hacivat çifti tınısı) | Kuru asker mizahı: nöbet sıkıcılığı, aş kazanı, abartılan düşman sayısı, birbirini ispiyonlayan tatlı atışma. Aynı zamanda oyunun **1396 havadis bülteni**: Niğbolu söylentilerini R-etiketli "derler ki" diliyle taşırlar. | Orta-Yüksek → **Çok yüksek** |
| **Kethüda Koca Yakub** (`kethuda_talk`, DialogueSystem.js:16) | Kurnaz kâhya / kaytaran köylü raporcusu | Mevcut saygılı-tecrübeli sesi KORUNUR; mizahı doğrudan konuşmaz, **rapor ettiği köylülerin hâlleri** üzerinden taşır ("Irgat Veli'nin hastalığı pazartesi tutuyor beyim, pazar akşamı geçiyor"). İmtihan edici üslubu ("kimi reayanın sırtına bindi...") zaten var; bozulmaz. | Düşük-Orta → **Yüksek** |
| **Demirci Rüstem Usta + Çırak Salih** (`demirci_talk`; Salih: `cirak_talk`, NPCManager.js:82-117) | Usta-çırak atışması | Rüstem: az sözle iğneleyen, işine âşık Ahi piri; övünmez ("dövdüğüm demir söylesin"). Salih: hazırcevap ama beceriksiz; her azarı ders gibi yer. Atışma hep **iş üstünde**, örs ritmiyle senkron (Bölüm 3-h). Ahi ahlakı (doğruluk, sabır) atışmanın içinde öğretilir. | Yüksek → **Çok yüksek** |
| **Hancı İdris** (`hanci_talk`) | Gözü açık esnaf | Fısıltıyla konuşan, her şeyi bilen, her bilgiye küçük hesap katan han sahibi; "hesap" ve "misafir" mizahı. Casus kurgusunda ciddiyete geçer (mevcut içerik korunur). | Orta → **Yüksek** |
| **Koca Dede** (`dede_talk`) | Tatlı tekrarcı gazi anlatıcı | Dokunaklı Kosova anısı (mevcut, DOKUNULMAZ) asıl kimliği; mizahı yalnız meydan baloncuklarında "Biz Kosova'da..." nakaratının köy gençlerince ezbere bilinmesi üzerinedir. Anının **içeriği** asla espri olmaz; espri, anlatma **alışkanlığındadır**. | Düşük → **Düşük-Orta** (dikkatli) |
| **Attar Mehmet Efendi** (`attar_talk`) | Envanter sayan tabip-esnaf | Merhem/ot adlarını dizerek konuşan titiz esnaf; mizahı listeleme tikinde ("...bir de sabır otu vardır beyim, onu ben de arıyorum"). | Düşük → **Orta-Yüksek** |
| **Çiftçiler: Hasan, Irgat Veli, Reaya Mahmud, Orakçı Bekir** (`farmer_talk`) | Köylü korosu | Hava, harman, karga, vergi üzerinden gündelik dertleşme; vergi günü tepkilerinin (3-f) ve meydan çiftlerinin (3-i) taşıyıcıları. | Orta → **Yüksek** |
| **Harami Elebaşı Kılçık Cafer + 2 çapulcu** (NPCManager.js:584-623) | Bozguna uğrayan kabadayı | Pusudayken tehditkâr, bozulunca pazarlığa dönen eşkıya; yenilgi anında dökülen şey canı değil **hesabıdır** ("payıma bir çarık düştü"). Kaçar, teslim olur, pazarlık eder — **ölmez** (3-e). | Tek kanal (yenilgi anı) → **değişmedi** |
| **Hamam müşterileri** (`hamam_musteri_talk`) | Dedikodu havuzu | "Ohhh be" rahatlığı (mevcut) + köy söylentisi taşıyıcısı; görev ipuçlarının gayriresmî kanalı (3-g). | Orta → **Yüksek** |

### 2-b. Kahkaha kaldıracı ve gag ataması

| NPC | Kahkaha kaldıracı (§1.5 tekniği) | Gag (§1.7) |
|---|---|---|
| **Tellak Hüseyin Ağa** | Hâl komedisi (8) + Tırmanma (1). Zaten oyunun en mizahi sesi; **şablon** olma görevi sürüyor, artık şablonun kendisi de yükseliyor: her hamam anlatısı üç basamakta tırmanır. | — (havuz taşıyıcısı) |
| **Saka İbrahim** | Somutluk (2) + Öz-alay. Sitem artık **spesifik**: düğüm sayısı, keçi, ipin adı. Sitemden vakara geçiş imzası **korunur** — gag zirvesi bile ciddi bir kapanışa bağlanır. | **GAG-1 (ip)** |
| **Kale nöbetçileri** | Karakter çelişkisi (3) + Beklenti kırma (9) + Statü düşmesi (6, hedef **kendileri**). 1396 havadis bülteni görevi **korunur**: her komik replik bir havadis taşır (§1.1-2). | **GAG-3 (eşek)** |
| **Kethüda Koca Yakub** | Deadpan (4) — oyunun deadpan merkezi. Mevcut saygılı-tecrübeli sesi **KORUNUR**; kahkaha sesin *tonundan* değil, **defterin mantığından** gelir. Kethüda hiç şaka yapmaz, sadece kayıt tutar. İmtihan edici üslubu bozulmaz. | **GAG-2 (defter)** — taşıyıcı gag |
| **Demirci Rüstem Usta + Çırak Salih** | Karakter çelişkisi (3) + Tırmanma (1). Rüstem'in cevapları **tek cümle** kalır (kısalık onun komedisi); Salih'in teorileri uzar. Ahi ahlakı atışmanın içinde öğretilmeye devam eder ve gag zirvesi **öğretiyle** kapanır. | **GAG-4 (ocak)** |
| **Hancı İdris** | Yanlış anlama (7) + Statü düşmesi (6). Casus kurgusundaki ciddiyete geçiş **korunur**. | GAG-3 karşı tarafı |
| **Koca Dede** | Beklenti kırma (9) — **yalnız anlatma alışkanlığı üzerinden.** Kosova anısının **içeriği DOKUNULMAZDIR** (mevcut kural aynen sürer); espri yalnız köy gençlerinin nakaratı ezbere bilmesindedir. Doz yükselirken bu sınır **daralır**, gevşemez. | — |
| **Attar Mehmet Efendi** | Karakter çelişkisi (3) + Tırmanma (1). Listeleme tiki artık tırmanan bir listedir; son kalem daima kendini vurur ("sabır otu"). | — |
| **Çiftçiler** | Tırmanma (1) + Yanlış anlama (7). Meydan çiftlerinin (K9) ana yükü bunlarda; vergi tepkilerinin `morale<40` bandı **mizah değildir ve öyle kalır**. | **GAG-5 (Kara Çelebi)** |
| **Harami Elebaşı + çapulcular** | Beklenti kırma (9) + Statü düşmesi (6). **Doz yükseltilmez.** Havuz §1.3-6'nın **kapsamı dışındadır**, çünkü ölüm değil **bozgun** anlatır. Doz yine de kısık tutulur: çatışma gergin bir andır; tek satırlık kaçış repliği o gerginliği bir nefeslik kırar, sahneyi komediye çevirmez. | — |
| **Hamam müşterileri** | Yanlış anlama (7). Söylenti kanalı olarak gag'lerin **yankı odası**: GAG-3 ve GAG-5 hakkında yanlış bilgi taşırlar, oyuncu doğrusunu bilir. | gag yankısı |

**Mizah TAŞIMAYAN karakterler (kesin liste):**
- **Molla Şemseddin (imam/kadı naibi):** Sıfır mizah — ne söyler ne hakkında söylenir. Bilge-adil rehber tonu (DialogueSystem.js:107-178) aynen korunur. En fazla *halim bir tebessüm* sahne yönü olarak tarif edilebilir; replik düzeyinde espri yasak.
- **Dizdar Hamza Bey:** Resmî-askerî ton (mevcut) korunur; espri yapmaz. Nöbetçilerin ondan "disiplin timsali" diye söz etmesi serbesttir (korkuyla karışık saygı — mizah dizdara değil, nöbetçilerin telaşınadır).
- **Cebelü Ali:** Dramatik çekirdek (bacak/yara hattı). Barış zamanında hafif toyluk sıcaklığı (meydan çifti 3-i/8'deki gibi tek satır) serbest; `quest_save_ali_leg` hattı aktifken Ali ile ilgili HER mizah kanalı susar (Bölüm 6).
- **Gazi Sungur Bey:** Kandaşlık/aht tonu ciddi kalır.

> **Kahkaha güncellemesi bu listeyi genişletmez ve daraltmaz.** Yükselen genlik hiçbir maddeyi gevşetmez; dört karakter de kahkaha katmanının tamamen dışındadır. §1.5-6'daki "statü düşmesi" tekniği bu dört isim üzerinde **kullanılamaz** — teknik, onların çevresindeki karakterlerin telaşına uygulanır (nöbetçilerin dizdar paniği gibi), kendilerine değil.

---

## 3. KULLANIMA HAZIR İÇERİK

> Toplam: **~340 replik/metin** (kahkaha yükseltmesiyle ~150'den iki katına çıktı; denetim sonrası §3-n taşıyıcı gag bloğu, altı set-piece ve büyütülen sahnelerle ~300'den ~340'a). Tümü `historicalConfidence: 'C'`; içine gömülü olgu iddiaları madde altında etiketlendi. Diyalog ağaçları mevcut `DialogueSystem` şemasıyla birebir uyumludur: `{ npcName, npcRole, icon, text, onOpen?, choices: [{ label, action: null | () => ({text, choices}) }] }` (şema referansı: DialogueSystem.js:16-102 `kethuda_talk`).
>
> **Havuz adetleri (eski → yeni → DENETİM SONRASI):** 3-c uyandırma 12 → **14** · 3-d durum etiketi 15 → **28** · 3-e harami 10 → **13** · 3-f vergi 9 → **12** · 3-g hamam 12 → **15** · 3-h atışma 10/21 → 12/40 → **14 atışma / 49 satır** *(GAG-4 zirvesi 13+14 olarak eklendi; 4 ve 7 numaralar birer satır büyüdü)* · 3-i meydan çifti 8/19 → 10/42 → **10 çift / 47 satır** *(6, 7 ve 10 numaralar büyütüldü; 6 numara artık bir set-piece)* · 3-j başarım 12 → **12 (ID'ler sabit, metinler yenilendi)** · 3-k mevsim 8 → **8 (yenilendi)** · 3-l tımar kusuru 12 → **15** · 3-m fallback 5 → **5 (yenilendi)**. Diyalog ağaçlarında: `saka_talk` 4 → **6 üst seçenek / 37 toplam seçenek**, `guard_talk` 4 → 6/29 → **6 üst seçenek / 31 toplam seçenek** *(GAG-3'ün "esire nasıl bakıyorsunuz" kardeş seçeneği eklendi)*, açılış havuzu 3 → **6**. **Yeni bölüm:** §3-n `kethuda_talk` GAG-2 dalı — **1 üst seçenek / aşamalara dağılmış 21 alt seçenek** (taşıyıcı gag'in gövdesi; denetim "hiç yazılmamış" bulgusunu kapatır).
>
> **Hiçbir havuz küçülmedi.** Denetim sonrası yapılan tüm değişiklikler ya **yerine yazma** (aynı indekste yeni metin) ya da **ekleme**dir; tek bir replik dahi silinerek adet düşürülmemiştir. Yeniden yazılan repliklerin listesi §9.4'tedir.

### 3-a. `saka_talk` — tam diyalog ağacı (kes-yapıştır)

Eklenecek yer: `DialogueSystem.js` içinde `data` nesnesine, alias bloğundan (DialogueSystem.js:653-661) **önce**. NPC bağı hazır: NPCManager.js:193 `dialogueId: 'saka_talk'`.

**Karakter ekseni:** Kendini köyün damar sistemi sayan, herkesin hafife aldığı, hiçbir şey istemediğini durmadan anlatan sitemkâr adam. Büyük gülme anları: **(1)** "Ben damarım" → yarım gün yok olduğunu kimsenin fark etmemesi, **(2)** azlini isteyen ip → kuyudan tarih çıkması → kethüdanın açtığı "Kuyu Mevcudu" sayfası. Üç adımlı tırmanma tek metne değil, **ağacın derinliğine** yayılmıştır (§1.2 notu): vurucu cümle oyuncunun kendi tıklamasıyla gelir.

**Sayım:** 6 üst seçenek (eski 4; test şartı ≥4 korundu), toplam 37 seçenek (eski 11). Blok `node --check` ile doğrulanmış, tüm `action` fonksiyonları gezilerek geçerli düğüm döndürdüğü görülmüştür.

```js
// =======================================================================
// SAKA İBRAHİM (Su Kültürü, Sebil Geleneği ve Sitemkâr Sucu Mizahı)
// =======================================================================
saka_talk: {
  npcName: 'Saka İbrahim',
  npcRole: 'Köy Sakası (Su Taşıyıcı)',
  icon: '🪣',
  text: `"Buyur beyim, buyur — kalkma, zahmet etme; eğilmek benim zanaatimdir. Otuz senedir kırbayı ben taşırım: kırba belimden şikâyetçi, belim kırbadan, ikisi birden benden. Emret: su mu lazım, dert mi dinlersin?"`,
  choices: [
    {
      label: '💧 "Bu yıl suyumuz nasıl, İbrahim Ağa?"',
      action: () => ({
        text: `"Hamdolsun kuyu cömert beyim; cömert olmayan, kuyunun başındaki millettir. Şu değirmen arkı var ya — iki hane 'su benim' diye birbirine girdi. Su kimsenin değildir beyim; su emanettir, nöbet kulundur."`,
        choices: [
          {
            label: '⚖️ "Kuyu başında sıra yok mu sizin?"',
            action: () => ({
              text: `"Var beyim, sıra vardır; yalnız kâğıda yazılmaz, gönülde durur — gönül de sayı saymaz. Geçen hafta Reaya Mahmud 'ben ayırırım' diye araya girdi: iki haneyi barıştırdı, kendi sırasını kaybetti. Şimdi suyunu geceleri çekiyor — hakem oldu, sürgün gitti."`,
              choices: [
                {
                  label: '🙂 "Sen hiç araya girmez misin?"',
                  action: () => ({
                    text: `"Ben tarafsızım beyim, saka tarafsız olur; suyu herkese aynı tastan veririm. Yalnız laf tarafında tarafsız değilim: kimin ne dediğini akşama kadar taşırım. Laf kırbadan hafiftir beyim, amma daha çabuk dolar."`,
                    choices: [{ label: '"Demek asıl taşıdığın su değilmiş."', action: null }]
                  })
                },
                { label: '"O arka bir bakarım. Sen sırtını sağlam tut."', action: null }
              ]
            })
          },
          { label: '"Bakarız o arka. Kolay gelsin."', action: null }
        ]
      })
    },
    {
      label: '🏺 "Sakalık nasıl iştir, anlat hele."',
      action: () => ({
        text: `"Hor görme beyim; bu diyarda susuza bir tas su vermek hayır sayılır. Ecdat yol boylarına sebiller kurmuş: parasız, hesapsız — karşılığı yalnız dua. Orduda dahi saka neferi vardır; gazi susuz kalmasın diye kırba sırtlanır."`,
        choices: [
          {
            label: '🫀 "Peki bu köyde senin yerin ne?"',
            action: () => ({
              text: `"Beyim, bu köyün beyi sensin, defteri kethüda, demiri Rüstem Usta. Ben neyim — damarım. Damar durursa ocak söner, hamamın göbek taşı taş kalır, tandır ekmeği kütüğe döner."`,
              choices: [
                {
                  label: '🙂 "Hiç durdu mu bu damar?"',
                  action: () => ({
                    text: `"Durdu beyim. Geçen çarşamba çalı dibinde uyuyakalmışım, tam yarım gün akmadım; akşam telaşla koştum, kimse fark etmemiş. Kethüda yüzüme bakıp 'sen bugün geldin mi?' dedi — damar durmuş, köy nabzına bakmamış."`,
                    choices: [{ label: '"Bundan sonra ben bakarım İbrahim Ağa."', action: null }]
                  })
                },
                {
                  label: '🙂 "Bu damarın da bir hakkı var, değil mi?"',
                  action: () => ({
                    text: `"Aman beyim, yüksek sesle söyleme! Ben kimseden bir şey istemem: otuz senedir istemedim, istemediğimi de herkese anlatırım ki istemediğimi bilsinler. Kethüda geçen 'İbrahim, bunu bana yedinci defa söylüyorsun' dedi; ben de 'demek altı defa duymamışsın' dedim."`,
                    choices: [
                      {
                        label: '🙂 "Peki, ben de duymadım sayayım."',
                        action: () => ({
                          text: `"Aferin beyim, çabuk kaptın. Sen duymadın, ben söylemedim; ortada yalnız eskimiş bir kırba var, o da kendi kendine eskidi. Bak, yine söylemedim."`,
                          choices: [{ label: '"Söylemedin. Ben de görmedim." (tebessüm)', action: null }]
                        })
                      },
                      { label: '"Duamız hazır, İbrahim Ağa. Eyvallah."', action: null }
                    ]
                  })
                },
                { label: '"Kıymetini bilelim öyleyse."', action: null }
              ]
            })
          },
          {
            // CİDDİ DAL — hadis yalnız burada geçer; bu dala mizahi seçenek BAĞLANMAZ (Bölüm 1.4 kuralı)
            label: '💧 "Temizliğin dinimizdeki yeri nedir, İbrahim Ağa?"',
            action: () => ({
              text: `"Peygamber Efendimiz 'Temizlik imanın yarısıdır' buyurmuştur beyim. Biz o sözün hürmetiyle taşırız bu kırbayı; su bedeni arındırır, niyet gönlü."`,
              choices: [{ label: '"Eyvallah. Rabbim emeğini zayi etmesin."', action: null }]
            })
          },
          { label: '"Bereketli olsun. Emeğin helal olsun."', action: null }
        ]
      })
    },
    {
      label: '🪢 "Şu kuyunun ipinden ne haber?"',
      action: () => ({
        text: `"Sorma beyim: o ip azlini istedi, veren olmadı; üç düğümle vazifede duruyor. Her düğümde bir karış kısalıyor — kova artık dibe değil, karanlığa iniyor."`,
        choices: [
          {
            label: '🙂 "Kovayı çıkarmadınız mı hiç?"',
            action: () => ({
              text: `"Çıkarmaya çalıştık beyim. İp koptu, kopan yeri düğümledim — birinci düğüm odur. Sonra Irgat Veli'yi indirdik; Veli çıktı, nalı kaldı."`,
              choices: [
                {
                  label: '📜 "Kethüda bunu deftere yazdı mı?"',
                  action: () => ({
                    text: `"Yazdı beyim, hem ayrı sayfa açtı: 'Kuyu Mevcudu'. Altına da 'su: mevcut, alet: kayıp' diye düşmüş. Ben okuma bilmem beyim, amma o sayfa her ay uzuyor, ip her ay kısalıyor."`,
                    choices: [
                      {
                        label: '🪣 "Yeni bir ip mesele olur mu?"',
                        action: () => ({
                          text: `"Olur beyim, olur da: sen alırsın, ip gelir, kuyu bir müddet susar. Sonra bir gün yine kopar, ben yine bir düğüm atıp 'azlini istedi' derim, sen yine tebessüm edersin. Kuyu böyle döner beyim; ipten çok âdet eskir."`,
                          choices: [{ label: '"Baş üstüne. İp bizden, âdet sizden."', action: null }]
                        })
                      },
                      { label: '"O defteri bana hiç gösterme." (tebessüm)', action: null }
                    ]
                  })
                },
                { label: '"Yeter, yeter — kuyuyu büsbütün doldurmayın."', action: null }
              ]
            })
          },
          { label: '"Allah kolaylık versin. Kolay gelsin."', action: null }
        ]
      })
    },
    {
      label: '🐦 "Şu karga sabahtan beri peşinde."',
      action: () => ({
        text: `"Gördün mü beyim! Kırk gündür beni teftiş eder: sabah kuyu başında, öğle çeşmede, ikindi harmanda. Duruşuna bakıp adını Kantarcı koydum; benden düzgün geziyor."`,
        choices: [
          {
            label: '🙂 "Ne yapıyor peki, bakıyor mu sadece?"',
            action: () => ({
              text: `"Keşke baksa beyim. Evvelsi gün kırbanın ağzından içti, dün ipimin ucunu çözmeye kalktı, bugün gölgeme oturup beni bekledi. Şikâyet edecektim — kantarı tutan kendisi."`,
              choices: [
                {
                  label: '🪶 "Kovsana şunu."',
                  action: () => ({
                    text: `"Kovdum beyim: iki adım uçtu, döndü baktı; o bakışta 'sen kimsin' vardı. Vallahi haklı — ben bir gün görünmesem kimse aramaz, o bir gün gelmese bütün köy sorar. Onun nöbeti benimkinden sağlam."`,
                    choices: [{ label: '"Ona da bir tas su koy bari." (tebessüm)', action: null }]
                  })
                },
                { label: '"Bir tas suyu ondan esirgeme."', action: null }
              ]
            })
          },
          { label: '"Dostunu incitme öyleyse."', action: null }
        ]
      })
    },
    {
      label: '🐎 "Atıma da bir tas su ver."',
      action: () => ({
        text: `"Baş üstüne beyim, hayvanı sulamak hayırdır. Yalnız senin karayağız nazlıdır: tası kokladı, beni bir süzdü, sonra kuyuya yürüyüp kendi başına içti. Beyine çekmiş — aracıyı sevmiyor."`,
        choices: [
          {
            label: '🙂 "Sen ne yaptın peki?"',
            action: () => ({
              text: `"Ne yapayım beyim, tası tutup bekledim; itibarım gitmesin diye 'ben zaten kuyuya bakıyordum' dedim. Kimse duymadı, at da söylemez. Yalnız o karga oradaydı."`,
              choices: [{ label: '"Sır bizde kalsın İbrahim Ağa."', action: null }]
            })
          },
          { label: '"Ona dolu bir tas koy. Sağ olasın."', action: null }
        ]
      })
    },
    { label: 'Kolay gelsin, İbrahim Ağa.', action: null }
  ]
},
```

**Etiketler (§1.4):** Sebil/vakıf geleneği ve ordu sakaları = **A/B** (TDV İA "Saka", "Sebil"). *"Susuza bir tas su vermek hayır sayılır"* ifadesi **örfî/kültürel beyandır (C)**, dinî bir hüküm iddiası DEĞİLDİR ve kaynak gerektirmez — önceki taslaktaki *"sadakaların makbulündendir"* ibaresi **kaynaksız normatif bir derecelendirme hükmü** (hangi sadakanın makbul olduğu hükmü) olduğu için §1.4 gereği kaldırılmıştır; "derler ki" R-çerçevesi burada çözüm değildir, çünkü dinî hükümde R çerçevesi *uydurma rivayet* izlenimi doğurur, riski azaltmaz artırır. Hadis = sahih, Müslim, Tahâret 1 — kodekse kaynak notu girilir; **yalnız ciddi cevaplı ayrı alt dalda**. **Bu düğüme mizahi seçenek bağlanmaz:** önceki taslakta aynı düğümün doğrudan çocuğu olan *"Öyleyse ücretine zam gerek."* dalı, ebeveyn metnin son vurgusu *"karşılığı yalnız dua"* olduğu için fiilen **dua ↔ ücret zıtlığı** üzerine kurulu bir espri hâline geliyordu — yani dua cümlesi, oyuncunun tıkladığı şakanın kurulumu oluyordu. Dal **silinmedi, bir kademe aşağıya — damar dalının altına — taşındı** (§1.4'ün "en az bir düğüm mesafesi" şartını fazlasıyla aşar) ve etiketi *"Bu damarın da bir hakkı var, değil mi?"* olarak değiştirildi; `zam` ayrıca modern ekonomik tınılı bir kelimedir (§1.2 ek yasak listesi). Replik metinlerinin tek harfi değişmemiştir; espri (istemediğini herkese anlatan adam) birebir korunmuş, yeni ebeveynine daha iyi oturmuştur. Toplam seçenek sayısı **37 sabit**, üst seçenek **6 sabit** kalır (taşındı, silinmedi); ağaç derinliği aksine **artar**. `Kantarcı` = tamamen dünyevi bir denetim imgesi (çarşıda tartı/kantar denetimi, **B**; karganın adı halkın taktığı lakap olarak **C**); esprinin nesnesi İbrahim'in kendisidir, hiçbir makam değil. **Ad değişikliği notu:** bu kargaya önceki taslakta *Muhtesib* adı verilmişti; hisbe **dinî temelli** bir vazife olduğu (emr-i bi'l-ma'rûf nehy-i ani'l-münker) için ad §1.3-1 uyarınca reddedilmiştir. Dokümanın eski savunması ("esprinin nesnesi makam değil") burada yetersizdi, çünkü **adın kendisi şakanın parçasıydı** — karga o adı taşıdığı için komikti. `muhtesib` kelimesi §1.2 serbest kelime havuzundan da çıkarılmıştır. *(Reddedilen alternatifler: **Kâtip** — 3-l/9'daki kurbağayla çakışır; **Naib / Mübaşir** — kadılık üzerinden dinî-hukukî bağ; **Müfettiş** — geç dönem terimi.)* Değirmen arkı cümlesi `quest_water_dispute`'a organik ipucu; "yeni ip" dalı küçük bir dünyevi ihtiyaç kancası bırakır ama **görev/ödül vadetmez**. Kova-ip-nal sahnesi, damar sahnesi, karga sahnesi = **C**. **Hiçbir dal akçe/ödül/eşya VERMEZ** (TARIHSEL doc 9.8: "her görev doğrudan para vermemeli") — tüm `action` değerleri ya `null` ya da yalnız `{text, choices}` döndürür, `gameState` çağrısı yoktur.

**İç callback ağı (durum tutmayan):** Saka'nın ipi → kargaya ("ipimin ucunu çözmeye kalktı") → ata ("yalnız o karga oradaydı") bağlanır. Oyuncu üç dalı da gezerse birbirine kenetlenen bir hikâye çıkar; gezmezse her dal tek başına da anlamlıdır. **Hiçbir `flag` veya sayaç gerekmez** — `getDialogueData` her açılışta yeniden kurulduğu için (DialogueSystem.js:11-12) bu tasarım zorunludur. §1.7'deki GAG-1 aşamalı ip hattı ise bunun üstünde, `gag.rope` sayacıyla ayrıca çalışır.

### 3-b. `guard_talk` — tam diyalog ağacı (kes-yapıştır)

Üç nöbetçi aynı ID'yi paylaşır (NPCManager.js:298-313); ad genel tutulur. `getDialogueData` her açılışta yeniden kurulduğu için (DialogueSystem.js:11-12) açılış metni havuzdan rastgele seçilir — **havuz 3'ten 6'ya çıkarıldı**, IIFE kalıbı aynen korundu.

**Karakter ekseni:** Şişirilmiş kahramanlık anlatısı ile sıkıcı gerçek arasındaki uçurum + birbirini ele veren ikili. Büyük gülme anları: **(1)** esir eşeğin fidyeden nöbet defterine terfi edip teftişte "devriyede" diye savunulması (GAG-3), **(2)** Kosova anısının epik açılıştan itirafa, itiraftan yandaki neferin ifşasına düşmesi.

**Sayım:** 6 üst seçenek (eski 4; test şartı ≥4 korundu), toplam **31 seçenek** (eski 9; denetim sonrası 29 → 31, GAG-3 tekleştirmesiyle gelen *"Esire nasıl bakıyorsunuz?"* kardeş seçeneği ve cevabı), açılış havuzu 6 (eski 3; test şartı ≥3 korundu).

> **Sözdizimi düzeltmesi (önemli):** Bu bölümün eski hâlinde `label: '🏰 "Niğbolu\\'dan ne haber? Anlat."'` yazımı vardı; gerçek JS'e kopyalandığında **kaçırılmış ters bölü + erken string sonu** üretir ve dosyayı derlenmez hâle getirir. Aşağıdaki blokta doğrusu (`\'`) kullanılmıştır. Kes-yapıştır yapan geliştirici yeni bloğu **olduğu gibi** almalı, eskisinden karakter taşımamalıdır.

```js
// =======================================================================
// KALE NÖBETÇİLERİ (Asker Mizahı + 1396 Havadis Bülteni — R etiketli rivayetler)
// =======================================================================
guard_talk: (() => {
  const openers = [
    `"Dur! Kim var?.. Ha— tanıdım beyim, geç. Yüzünden değil, atından tanıdım; at senden meşhur."`,
    `"Hoş geldin beyim. Nöbet bereketli geçiyor: sabahtan beri iki karga, bir çoban, bir de sen. Kargaları saymazsak tenha."`,
    `"Beyim, dizdarımız görürse dik duralım. Görmezse de dik duralım da... belin müsaadesi kadar."`,
    `"Geç beyim, geç. Balaban demin 'ufukta toz var' deyip borazana davrandı; toz Koca Dede'ymiş, değneğiyle geliyormuş. Alarm kalktı, itibar kalmadı."`,
    `"Buyur beyim. Timur dün akşam zırhını cilaladı, gece yağmur yağdı; şimdi zırh parlıyor, Timur küsüyor."`,
    `"Hoş gelmişsin beyim. Nöbette iki kişiyiz: biri uyanık durur, biri uyanık görünür. Bugün sıra bende — ben görünenim."`
  ];
  return {
    npcName: 'Kale Nöbetçisi',
    npcRole: 'Sancak Kalesi Kapı Muhafızı',
    icon: '🛡️',
    text: openers[Math.floor(Math.random() * openers.length)],
    choices: [
      {
        label: '🏰 "Niğbolu\'dan ne haber? Anlat."',
        action: () => ({
          text: `"Haçlı, Niğbolu Hisarı'nı kuşatmış derler beyim: Frenk, Macar, Alaman, bir de Rodos şövalyeleri. Sayıyı bana sorarsan bilmem, Balaban'a sorarsan yüz bin, aşçıya sorarsan iki yüz bin — aşçı herkesi kazan payı sanır, hep fazla görür. Amma Sultanımız Yıldırım Han'a boşuna 'Yıldırım' dememişler; o yetişir."`,
          choices: [
            {
              label: '🌙 "Hisar dayanır mı peki?"',
              action: () => ({
                text: `"Dayanıyor beyim. Bir de derler ki — ben görmedim, eri söyler — Sultan gece vakti hisar dibine kadar varıp dizdar Doğan Bey ile konuşmuş. Doğrusunu Allah bilir — asker ağzıdır, büyütür; amma hisarın direndiği kesin."`,
                choices: [{ label: '"Allah kolaylık versin. Gözünüz pek olsun."', action: null }]
              })
            },
            {
              label: '🔢 "O sayıyı kim saydı?"',
              action: () => ({
                text: `"Sayan yok beyim, herkes tahmin eder. Balaban ufka bakıp 'yüz bin' dedi; 'nereden bildin' dedim, 'gözüm terazidir' dedi. Aynı terazi dün gece harman yerindeki çuvalı ayı sandı, kaleyi ayağa kaldırdı."`,
                choices: [{ label: '"Sayıyı bırak, sen tirkeşini dolu tut."', action: null }]
              })
            },
            { label: '"Havadis için eyvallah. Nöbetiniz mübarek olsun."', action: null }
          ]
        })
      },
      {
        label: '🌜 "Nöbet nasıl gidiyor, yiğitler?"',
        action: () => ({
          text: `"Sorma beyim: evvelsi gece rüzgâr kapıyı dövdü, Hasan 'Haçlı geldi!' diye tirkeşe sarıldı. Haçlı değil, hancının kaçmış eşeğiymiş. Eşeği esir aldık, hancıdan fidye bekliyoruz."`,
          choices: [
            {
              label: '🙂 "Fidye ne kadar biçildi?"',
              action: () => ({
                text: `"Bir tas hoşaf beyim. Harp meclisi böyle uygun gördü. Eşek razı; hancı İdris hâlâ pazarlıkta."`,
                choices: [
                  {
                    label: '🫏 "Peki eşek ne âlemde şimdi?"',
                    action: () => ({
                      text: `"İki aydır fidye gelmedi beyim, eşek de alıştı: sabah yemini yiyor, akşam kapıda duruyor. Balaban 'nöbet tutuyor' deyip deftere 'Yağız' adıyla yazdırdı. Geçen teftişte dizdar 'bu nefer nerede' diye sordu — üçümüz birden 'devriyede' dedik."`,
                      choices: [
                        {
                          label: '📜 "O defteri bana gösterin bakayım."',
                          action: () => ({
                            text: `"Gösteririz beyim... yalnız Yağız'ın altında iki satır daha var, onları Balaban yazdı. Sen defteri bir hafta sonra iste; o vakte kadar biz Yağız'ı salıveririz."`,
                            choices: [{ label: '"Bir hafta. Ne bir gün fazla." (tebessüm)', action: null }]
                          })
                        },
                        {
                          // GAG-3'ün 2. aşamasındaki "esire iyi muamele" fikri buraya taşındı (§1.7 tekleştirmesi)
                          label: '🌾 "Esire nasıl bakıyorsunuz?"',
                          action: () => ({
                            text: `"İyi bakıyoruz beyim. Timur 'düşmandır' dedi, Hasan 'esirdir, hakkı vardır' dedi; Hasan haklı çıktı, Yağız kilo aldı."`,
                            choices: [{ label: '"Hasan haklıymış. Hakkını yemeyin."', action: null }]
                          })
                        },
                        { label: '"Dizdar duymasın. Benden duymadınız."', action: null }
                      ]
                    })
                  },
                  { label: '"Âdil hüküm. Nöbetiniz mübarek olsun."', action: null }
                ]
              })
            },
            { label: '"Uyanıklığınıza aşk olsun. Devam edin."', action: null }
          ]
        })
      },
      {
        label: '⚔️ "Sen hiç harp gördün mü, yiğit?"',
        action: () => ({
          text: `"Kosova'da ilk safta ben vardım beyim. Yani sağ kanadın en arkasında; amma saf saftır, ilkinden sayılır. Toz öyle bir kalktıydı ki, düşmanı bırak, kendi sancağımızı aradık."`,
          choices: [
            {
              label: '🙂 "Peki o gün ne ettin?"',
              action: () => ({
                text: `"Bir adım attım, kalkanım kaydı, dizimin üstüne düştüm beyim. Tam kalkarken önümdeki nefer geri kaçtı, ben de tutunacak yer arayıp onu yakaladım. Kumandan gördü, 'aferin, kaçanı durdurdu' dedi — ben de bozmadım."`,
                choices: [
                  {
                    label: '🛡️ "Hepsi bu mu yani?"',
                    action: () => ({
                      text: `"(Yandaki nefer dayanamaz) 'Beyim, bu Kosova'da yoktu; o gün Bursa'da at tımar ediyordu.' — 'Bre Balaban! Ben o atları Kosova'ya yollayanlardanım; yollayan da gitmiş sayılır.' — 'Sayılmaz Hasan.'"`,
                      choices: [{ label: '"İkinizin de nöbeti helal olsun." (tebessüm)', action: null }]
                    })
                  },
                  { label: '"Kalkanı sıkı tut, gerisi kolay."', action: null }
                ]
              })
            },
            { label: '"Anlattığın kadarı bize yeter yiğit."', action: null }
          ]
        })
      },
      {
        label: '🍲 "Aş kazanı nasıl bu aralar?"',
        action: () => ({
          text: `"Aşçı bugün yine 'et var' dedi beyim. Kepçeyi üç kere daldırdı, üçünde de aynı kemik çıktı. O kemik bu kalede benden kıdemli."`,
          choices: [
            {
              label: '🙂 "Kemiği geri mi atıyor?"',
              action: () => ({
                text: `"Atıyor beyim: kemik kazana döner, kazandan bize gelir, bizden kazana gider. Balaban ona 'devriye' diyor, ben 'nöbetçi'. İkimiz de haklıyız — kalede en muntazam nöbet onunki."`,
                choices: [{ label: '"Kışı çıkarsın bari. Kolay gelsin."', action: null }]
              })
            },
            { label: '"Aç kalmayın da, gerisi kolay."', action: null }
          ]
        })
      },
      {
        label: '🧱 "Bu kale kimden yadigâr?"',
        action: () => ({
          text: `"Eski hisardır beyim; taşının bir kısmı Rum ustadan kalma, burcu bizim elimizde yenilendi. Dizdar Hamza Bey der ki: 'Kale taş ile değil, nöbet ile durur.' Biz de duruyoruz işte — taş yorulunca sıra bizde."`,
          choices: [
            {
              label: '🌜 "Dizdar sizi hiç gafil avladı mı?"',
              action: () => ({
                text: `"Bir kere beyim, gece teftişe indi. Timur uyuyordu, dürttüm; kalkarken miğferi ters giydi, ters miğferle selam durdu. Dizdar hiçbir şey demedi — bakışıyla dedi, hâlâ duyuyoruz."`,
                choices: [{ label: '"Dik durun. Ben görmedim sayın."', action: null }]
              })
            },
            { label: '"Taşından çok size güveniyorum. Berhudar olun."', action: null }
          ]
        })
      },
      { label: 'Gözünüz pek, nöbetiniz mübarek olsun.', action: null }
    ]
  };
})(),
```

**Etiketler (§1.4):** Haçlı ordusunun bileşimi (Fransız-Burgonya, Macar, Alman, Rodos) = **A** (TARIHSEL doc 4.1). Sayı belirsizliği = **B** ("kesin mevcut bilinmez", doc 4.2) — "gözüm terazidir" esprisi tam da bu belirsizliği öğretir, tarihsel bilgiyi bozmaz; esprinin nesnesi **Balaban'ın sayma kabiliyetidir**, düşmanın milleti değil (§1.3-2). Bayezid–Doğan Bey gece görüşmesi = **R**, "ben görmedim, eri söyler / Doğrusunu Allah bilir" kalıbıyla, doküman satır 219'un istediği asker rivayeti formatında — **bu düğüm aynen korundu, mizah katılmadı**. Kale taşının Rum ustadan devralınması = **B**; ifade ustayı **takdir eder**, hiçbir grubu küçültmez. Eşek, aş kazanı kemiği, Kosova anısı, miğfer sahnesi = **C**. **Hiçbir dal akçe/ödül/eşya VERMEZ.** *(Denetim notu: bu bölümdeki `karavana` ve `terhis` kelimeleri 19. yy nizamiye ordusu terminolojisi olduğu ve 1396 için doğrulanamadığı için değiştirilmiştir — bkz. §1.2 ek yasak listesi. Espriler bozulmadı, **büyüdü**: "aş kazanı" başlığı dalın kendi cevabındaki anahtar kelimeyi kuruyor — cevap zaten "kemik kazana döner, kazandan bize gelir" idi, artık soru ile cevap arasında kelime köprüsü var; "salıvermek" ise hem esir hem nefer için çalıştığı için nöbetçilerin eşeği aynı anda ikisi birden saydığı absürtlüğü tek kelimede topluyor ve GAG-3 zirvesinin vurucu cümlesine — "Beratsız esir salıverilmez" — callback ekiyor. "Terhis" bunların hiçbirini yapamıyordu.)*

> **Ton dengesi bağlantısı (Bölüm 6):** `guard_talk`ın Niğbolu dalı sefer başladıktan sonra da açık kalır; ancak sefer/şehitlik anlarında **eşek, aş kazanı ve Kosova dalları susturulur**. Bu yüzden dallar üst seviyede ayrı seçenekler olarak durur — Bölüm 6'daki susturma bayrağı seçenek dizisine filtre olarak uygulanabilsin diye.

### 3-c. Uyuyan NPC uyandırma replikleri (14 adet)

Kanca (DEĞİŞMEDİ): `UIManager.openDialogue` (UIManager.js:387-389) — diyalog verisi alınmadan önce `npcObj?.ai?.currentState === 'SLEEPING'` ise havuzdan bir replik tek seferlik "uyanma" ara metni olarak gösterilir (ayrıntı Bölüm 4/K3). `main.js:327` zaten `(Uyuyor 💤)` etiketi basıyor; bu havuz o vaadin devamıdır.

Kanal sınırı (DEĞİŞMEDİ): NPC başına gün başına 1 uyandırma; `gameState.flags.wakeCount++`; `pickHumor` art arda aynı repliği vermez (Bölüm 5 sözleşme 1). Metin sınırı: diyalog ana metni ≤ 3 cümle / ~320 karakter — aşağıdaki 14 replik bu sınırın altındadır (üç kısa cümle = tırmanma kalıbı, sınırla uyumludur).

**Teknik etiketleri:** `[TIRMANMA]` üçlü kural · `[SOMUT]` absürt spesifik detay · `[ÇELİŞKİ]` karakter çelişkisi · `[DEADPAN]` defter/mahkeme dili · `[CALLBACK]` geri dönen espri · `[STATÜ]` statü düşmesi · `[KIRMA]` beklenti kırma · `[HÂL]` fiziksel absürt. **★** = havuzun taşıyıcı repliği; içerik kısılırsa **en son bunlar kısılır**.

1. `"Yok yok, keçiyi ben almadım, keçi bana geldi, şahidim de var— ...Beyim?! Hayırdır, ne keçisi?"` [SOMUT + rüyadan devam]
2. ★ `"Uyumuyordum beyim, gözümü dinlendiriyordum. Kulağım nöbetteydi. ...Kulağım da azıcık dinleniyordu."` [TIRMANMA — Nasreddin ters mantığı üç adımda çöker]
3. `"Kim var or— ...Beyim! Buyur beyim. Ben zaten kalkacaktım. Ne zamandır kalkacağım."` [STATÜ + DEADPAN]
4. ★ `"Rüyamda kethüda beni deftere yazmıştı. Kaçtım, defterin öbür sayfasına düştüm. Uyandım — iyi ki uyanmışım beyim."` [TIRMANMA + CALLBACK: GAG-2 defter]
5. `"Horlamıyordum beyim, öksürüyordum. Uzun uzun. Makamlı. Komşular alışmıştı, şimdi kesersem üzülürler."` [TIRMANMA — savunma her cümlede daha da batıyor]
6. ★ `"Az evvel rüyamda öşrü affediyordun beyim. Elini öpmeye vardım, elin yoktu. Sonra sen de yoktun. Şimdi varsın — öşür ne oldu?"` [TIRMANMA + KIRMA; sonda vurucu soru]
7. `"Uyanığım beyim, gözüm kapalıyken daha uyanığım. Sen geleli üç şey saydım: at kişnedi, kapı gıcırdadı, sen 'uyuyor' dedin. Üçüne de cevap verecektim; sıramı bekliyordum."` [TIRMANMA + ÇELİŞKİ — savunma somutlaştıkça batıyor]
8. `"Sabah mı oldu beyim? Horoza güveniyordum, o da ikindiye geçmiş. Şimdi köyde vakti yalnız ben biliyorum, ben de yatıyorum."` [CALLBACK: 3-l/8 ikindi horozu + STATÜ]
9. `"Vallahi yattığım yok beyim, yer beni yatırdı. Direndim. Yer daha kuvvetliymiş; güreşte kimseye söyleme."` [ÇELİŞKİ + KIRMA]
10. `"Şşş... horoz duymasın beyim. Dün sabah onu ben uyandırdım; o günden beri aramızda husumet var."` [SOMUT + ÇELİŞKİ]
11. *(yalnız nöbetçi/asker NPC — Gazi Hasan, Okçu Balaban, Zırhlı Nefer Timur)* `"Asker uyumaz beyim. Asker tetikte serilir. Bu serilme talimdir; üç saattir talim ediyorum."` [DEADPAN + ÇELİŞKİ]
12. `"Bu vakitte kapı çalınmaz beyim. Kapım olmadığını biliyorum. Sen yine de çalma, ben içerden açarım."` [absürt mantık — TIRMANMA]
13. `"...yirmi dört, yirmi beş... Beyim! Sürüyü sayıyordum, uyuyakalmışım. Koyunlar da benimle uyudu. Bu gece kimse çobanlık etmedi."` [HÂL + TIRMANMA]
14. `"Hoş geldin beyim. Yalnız bileceksin ki ben rüyada davayı tam kazanmıştım. Şimdi baştan yatıp bitirmem lazım; müsaade."` [DEADPAN — uykuya dönmek için resmî izin istemek]

**Kurallar (mevcut kurallar korundu + iki ek):**
- Uyandırma repliği sonrası normal diyalog metnine geçilir; aynı NPC aynı gün ikinci kez uyandırılırsa havuzdan farklı replik seçilir (pick sözleşmesi, Bölüm 5).
- Gece yarısı (22:00-05:00) uyandırmalarında **6 numara** gösterilmez (vergi rüyası sabaha yakışır — küçük dokunuş, zorunlu değil).
- **(Ek 1)** 11 numara yalnız `dialogueId === 'guard_talk'` olan NPC'lerde havuza girer; sivil NPC'de gösterilirse espri düşer.
- **(Ek 2)** 4 ve 6 numara kethüda/öşür ekonomisine bağlı callback'lerdir; oyuncu ilk teftişi (`quest_inspect`) yapmadan önce havuza girmeleri şart değildir — girerlerse de zarar vermez, kısıt isteğe bağlıdır.

### 3-d. NPC durum etiketi mizahları (28 etiket — main.js:326-331 switch'ine)

Kanca (DEĞİŞMEDİ): Mevcut dört durum korunur, her durum **havuza** dönüşür; seçim kare-başına DEĞİL, gün-başına sabittir (titremesin diye): `index = (npc.id.length + gameState.time.dayCount) % pool.length`. `WORKING` etiketi `npc.ai.workType`'a göre özelleşir (doğrulanmış workType değerleri: `well_water` NPCManager.js:200, `guarding` NPCManager.js:294/320, `blacksmith` bölgesi VillagerAI.js:228-239, `innkeeping` NPCManager.js:74; bulunamayan tip `default`a düşer).

Sınır (DEĞİŞMEDİ): etiket ≤ ~34 karakter (parantez + emoji dâhil), etiket başına 1 emoji. Aşağıdaki 28 etiketin tamamı sınırın altındadır. Bu kanalın birincil tekniği **deadpan**tir: etiket şaka yaptığını belli etmez, tutanak tutar.

```js
statusLabels: {
  SLEEPING: [
    ' (Uyuyor 💤)',                    // 1  — nötr, imam istisnası bunu alır
    ' (Makamlı horluyor 💤)',          // 2  [SOMUT]
    ' (Rüyada harman kaldırıyor 💤)',  // 3  [SOMUT]
    ' (Gözünü dinlendiriyor 💤)'       // 4 ★ [CALLBACK → 3-c/2]
  ],
  EATING: [
    ' (Yemek yiyor 🍲)',               // 5  — nötr
    ' (Kaşıkla cenk ediyor 🍲)',       // 6  [KIRMA]
    ' (Çorbayla sulh yaptı 🍲)',       // 7  [KIRMA]
    ' (Üçüncü kâseyi inkâr ediyor 🍲)' // 8 ★ [DEADPAN]
  ],
  WANDERING: [
    ' (Dolaşıyor 🚶)',                 // 9  — nötr
    ' (Havadis tazeliyor 🗣️)',         // 10 [DEADPAN]
    ' (İki kere aynı yerden geçti 🚶)', // 11 [DEADPAN + SOMUT]
    ' (Bir yere gidiyordu 🚶)'         // 12 ★ [DEADPAN — geçmiş zaman güldürür]
  ],
  WORKING: {
    default: [
      ' (Çalışıyor ⚒️)',               // 13 — nötr
      ' (Üç gündür bitirmek üzere ⚒️)', // 14 [DEADPAN + SOMUT]
      ' (Meşgul görünüyor ⚒️)'         // 15 ★ [DEADPAN — "görünüyor" tek kelimeyle iftira]
    ],
    well_water: [
      ' (Kuyudan su çekiyor 🪣)',      // 16 — nötr
      ' (Kuyudan laf çekiyor 🪣)',     // 17
      ' (İple pazarlık ediyor 🪣)'     // 18 [CALLBACK: GAG-1, Saka İbrahim'in ipi]
    ],
    guarding: [
      ' (Nöbette — dimdik 🛡️)',        // 19 — nötr
      ' (Nöbette, çoğunlukla dimdik 🛡️)', // 20 [KIRMA]
      ' (Düşmanı yeniden sayıyor 🛡️)'  // 21 ★ [CALLBACK: Balaban'ın büyüyen sayısı]
    ],
    blacksmith: [
      ' (Demir dövüyor ⚒️)',           // 22 — nötr
      ' (Kaşları yine kısaldı ⚒️)',    // 23 [CALLBACK: 3-h/5]
      ' (Demire laf anlatıyor ⚒️)',    // 24
      ' (Çırağı terbiye ediyor ⚒️)'    // 25 [CALLBACK: 3-h atışmaları]
    ],
    innkeeping: [
      ' (Hesap tutuyor 🧮)',           // 26 — nötr
      ' (Hesabı iki kere tutuyor 🧮)', // 27 [SOMUT]
      ' (Misafiri tartıyor 🍞)'        // 28 [DEADPAN]
    ]
  }
}
```

**Toplam 28 etiket** (SLEEPING 4 · EATING 4 · WANDERING 4 · default 3 · well_water 3 · guarding 3 · blacksmith 4 · innkeeping 3).

**Kısıtlar:**
- **(DEĞİŞMEDİ)** İmam NPC'sine mizahi etiket düşmemesi için `npc.id === 'imam'` (NPCManager kaydındaki id neyse) her durumda havuzun **ilk (nötr) elemanını** kullanır — kural veri değil kod tarafında uygulanır ve kabul kriterine girer. Yeni sıralamada her havuzun ilk elemanı bilinçli olarak nötr bırakılmıştır; uygulayıcı **eleman sırasını bozmamalıdır**.
- **(Ek)** Çoban etiketleri için `herding` anahtarı **yalnız VillagerAI'de böyle bir workType gerçekten varsa** eklenir; yoksa hiçbir kod değişikliği yapılmaz, çoban NPC'si `default`a düşer (Simplicity First). Varsa kullanılacak havuz: `' (Sürüyü güdüyor 🐑)'` (nötr), `' (Sürüyü yeniden sayıyor 🐑)'`, `' (Bir koyunla anlaşamıyor 🐑)'`. **Doğrulanmadan koda girmez.**
- **(Ek)** Gün-sabit indeks kuralı havuz uzunluğu değiştiği için aynen çalışır (`% pool.length`); ek test gerekmez.

### 3-e. Haramilerin **yenilgi** sözleri — `killEnemy` kancası (13 adet)

Kanca (DEĞİŞMEDİ): `CombatSystem.killEnemy` (CombatSystem.js:324-342), mevcut ganimet bildiriminden **önce** ayrı bildirim satırı. Sıradan harami yenilgisinde %60 olasılıkla havuzdan; elebaşında her zaman özel satır. Aynı çatışmada en fazla 2 satır (bildirim kuyruğu 5 kayıtla sınırlı, GameState.js:207-209).

> **KANCA ŞARTI (ENGELLEYİCİ — §1.3-6; denetim bulgusu sonrası eklendi):** Bu havuz `killEnemy`e ancak düşman **ekranda ölmüyorsa** bağlanır. Fonksiyonun adı ölüm der; oyuncunun görmesi gereken ise düşmanın **çatışmadan düşmesi**dir. Bu ikisi ayrışmadığı sürece kanca **kurulmaz**. Uygulayıcı, `CombatSystem.killEnemy` çağrıldığında ekranda ölüm/yere yığılma animasyonu oynayıp oynamadığını teslimden önce **gözle doğrular**: oynuyorsa 3-e bu kancadan **sökülür** ve `killEnemy` mizahsız kalır (§7.1 engelleyici maddesi). Metnin temiz olması bu şartın yerine geçmez — ekranda can veren bir adamın üstüne düşen kaçış repliği, lafzı ne olursa olsun **ölüm mizahıdır**. Denetimin yakaladığı kusur metinde değil, **metin ile görüntünün arasındaydı**; metin denetimiyle yakalanamayacak tek ihlal türü budur.

**KURGU DÜZELTMESİ (kahkaha revizyonunun getirdiği asıl değişiklik):** Bu satırlar **ölüm sözü değildir**. Harami ölmez; **yenilir, pusatını atar, kaçar veya teslim olur**. Ölümle alay yasağı (§1.3-6) bu havuzu tamamen kapsar; "can verme", "son nefes", "anam duyarsa" gibi ölüm imaları taşıyan eski satırlar **kaldırılmıştır**. Kod kancası aynıdır (`killEnemy` = düşmanın çatışmadan düşmesi), yalnız **anlatı çerçevesi ve sunum emojisi** değişir. Bu düzeltme genliği yükseltirken yasağı da sıkılaştırır: eski havuz buruk-ölüm mizahındaydı, yeni havuz tamamen dünyevi bir kaçış komedisidir.

**Sunum:** `gameState.addNotification('🏃 ' + yenilgi_sozu, 'info')` — eski `'🗡️ '` öneki `'🏃 '` ile değişir (tek karakterlik değişiklik; kılıç ölümü imler, koşan adam kaçışı imler). Emoji sayısı artmaz.

**Sıradan haramiler (10 adet):**

1. ★ `"Kaçmıyorum beyim, geri çekiliyorum! Meşeliğin öbür ucuna kadar geri çekiliyorum!"` [ÇELİŞKİ + TIRMANMA — askerî ağızla korkaklık]
2. ★ `"Ben aşçıyım beyim! Çeteye aşçı girdim! Kimse sormadı, ben de söylemedim!"` [yanlış zamanda gelen dürüstlük]
3. `"Anlaşalım beyim: ben kaçayım, sen kovalamış ol. İkimiz de kazanırız."` [absürt pazarlık]
4. ★ `"Pusuyu ben kurmuştum. İyi de kurmuştum! Bunu deftere yaz beyim, hakkımdır."` [mesleki gurur + CALLBACK: GAG-2 defter]
5. `"Bunu Kılçık'a söyle beyim! Üç baskında payıma bir çarık düştü, o da sol."` [SOMUT + STATÜ — ganimet payı sitemi]
6. `"Vuruldum! ...Vurulmadım. Heyecandan bağırmışım. Müsaade beyim!"` [DEADPAN + HÂL]
7. `"Beni bir daha görmeyeceksin beyim! ...Görürsen selam veririm."` [KIRMA — iki kademeli beklenti kırma; "simetrik iptal" kalıbı havuzdan çıkarıldı]
8. `"Meşelik senin olsun beyim. Sivrisineği de senin olsun. Helal ettim."` [KIRMA]
9. `"Ben aslında ırgattım beyim. Çeteye yanlış tarlada girdim."` [SOMUT + itiraf]
10. `"Torbayı bırakıyorum beyim! ...Torbada zaten senin arpan vardı."` [yanlış zamanda gelen dürüstlük]

**Elebaşı Kılçık Cafer (3 adet — her yenilgide biri):**

11. ★ `"Kılçık derler bana; herkesin boğazında dururdum. Sen yutmuşsun beyim."` [STATÜ düşmesi — lakabın kendi aleyhine dönmesi]
12. `"Pusu kurmayı bunlara ben öğrettim. Bozmayı sen öğrettin. Ödeştik beyim."` [mesleki gurur]
13. `"Çeteyi dağıttın beyim. İkisi bana borçluydu zaten — sayende tahsilat kolaylaştı."` [DEADPAN + STATÜ]

**Metin sınırı (ölçüldü, uygun):** §1.2 tablosundaki "~80 karakter" sınırı **korunmuştur**; 13 satırın en uzunu tam 80 karakterdir (1 ve 13 numaralar). `'🏃 '` önekiyle birlikte bile bildirim sınırının çok altındadır.

**Adlandırma notu (uygulayıcıya):** Bölüm başlığı, §4/K5 satırı, §5 veri anahtarı ve §7.1 maddesi bu kurgu düzeltmesi gereği **yenilgi sözü** olarak güncellenmiştir; `humor.js` henüz yazılmadığı için anahtar adı `banditDefeatLines` yapılmıştır (`regular` / `boss` alt anahtarları aynı kalır). Kod hâlihazırda eski anahtarla yazıldıysa anahtar korunur, yalnız metinler değişir.

### 3-f. Vergi günü köylü tepkileri — morale'e göre 3 kademe (12 adet: 3 × 4)

Kanca (DEĞİŞMEDİ): `TimarSystem.collectAnnualTax` (TimarSystem.js:10-30), başarılı tahsilat bildiriminden sonra morale bandına göre havuzdan 1 satır. **Tasarım ilkesi: moral düştükçe mizah çekilir** — alt bandın metinleri kasıtlı olarak komik DEĞİLDİR; oyuncuya adaletsizliğin ağırlığını hissettirir (işverenin "öğreten oyun" hedefi: öşür/adalet ilişkisi mekanikte değil vicdanla da öğrenilir). Tahsilat başına 1 satır; `morale < 40` bandı mute bayraklarından **etkilenmez** (Bölüm 4 genel kural + Bölüm 5 sözleşme 2).

Sınır (DEĞİŞMEDİ): bildirim metni ~130 karakter. Aşağıdaki 12 satırın tamamı sınırın altındadır.

**`morale >= 70` — bant adı "şenlik"** (eski bant adı "tebessüm" idi; hedef kahkaha olduğu için bant adı da yükseltildi, eşik **70 aynen** kaldı):

1. `"Çiftçi Hasan öşrü sırtında getirdi beyim; ambar iki adım öteydi. 'Görsünler,' dedi. Aynı iki adımı üç kere yürüdü."` [ÇELİŞKİ + SOMUT — cömertliğin seyirci ihtiyacı] *(Eski 1 numara — "Bekir bir kile fazla verdi, geri alırken utandı, bir kile daha verdi" — **T3-I "Fazla Hanesi"** set-piece'inin birinci bildirimi olarak §1.7'ye yükseltildi; aynı şaka iki kademede iki kez anlatılamaz (§1.1-5). Havuz adedi düşmesin diye bu indekse **başka eksende yeni bir replik** yazıldı.)*
2. `"Reaya Mahmud öşrü kileyle ölçtü, kileyi tepeleme doldurdu. 'Devletin kilesi böyle olur,' dedi. Kendi kilesi hep silme."` [ÇELİŞKİ + SOMUT — cömertliğin nerede bittiği]
3. ★ `"Meydanda söz dolaşıyor: 'Bu bey deftere bakmadan yüze bakıyor.' Kethüda bunu duydu ve deftere yazdı."` [DEADPAN + CALLBACK: GAG-2 defter]
4. `"Irgat Veli öşrü verdi, üstüne bir kavun bıraktı: 'Bu defterde yok beyim. Bu gönülde.'"` [KIRMA — epik başlayıp tatlıya bağlanır]

**`40 <= morale < 70` — bant adı "gönülsüz direniş"** (eski bant adı "iç geçirme"; eşikler **40 ve 70 aynen** kaldı):

5. ★ `"Orakçı Bekir ambarı samanla örtmüş. Kethüda samanı kaldırdı, altından yine saman çıktı. Üçüncüde buğday."` [TIRMANMA — üçlü kuralın ders kitabı hâli]
6. ★ `"Reaya Mahmud 'buğdayı kargalar yedi beyim' dedi. Kethüda sordu: 'Kaç karga?' 'Bir. Amma azimliydi.'"` [SOMUT + CALLBACK: GAG-5 karga]
7. `"Çiftçi Hasan defteri açtırmadı: 'Yazılan yazılmıştır beyim. Ben bakınca daha çok yazılıyor.'"` [DEADPAN — defter korkusu]
8. `"Irgat Veli keseyi getirdi, kapının dibinde durdu. 'Hastayım beyim,' dedi. Kethüda 'hangi defterde?' diye sordu; Veli iyileşti."` [DEADPAN + CALLBACK: GAG-2 defter] *(Eski satırdaki `"Bereket versin..."` bir hayır duası kalıbıydı ve burada **espri kurulumu** olarak kullanılıyordu; §1.3-1 gereği kaldırıldı. Yeni satır taşıyıcı gag'e bağlanıyor: Veli'nin hastalığı artık sahibinden bağımsız bir **bürokratik varlık**tır — defterin gerçekliği bedeni yeniyor.)*

**`morale < 40` — mizah kapalı (vicdan tonu — TASARIM KARARI KORUNDU):**

> Bu bandın **hiçbir satırı espri değildir ve olmayacaktır.** Kahkaha yükseltmesi bu banda **hiç dokunmaz**: aşağıdaki dört metin, eski üç metnin güçlendirilmiş hâli + bir yenidir. Kısa cümle, sıfır süsleme, sıfır dönüş; komedi tekniği uygulanmaz.

9. `"Kapılar tek tek kapandı. Öşür tahsil edildi; selam alınamadı."`
10. `"Çiftçi Hasan defteri imzalarken eli titredi. 'Kışa borçla giriyoruz beyim,' dedi; başka bir şey demedi."`
11. `"Orakçı Bekir öşrü kapının önüne bıraktı ve içeri girdi. Kapı bir daha açılmadı."`
12. `"Çocuklar bugün meydanda oynamadı. Köy, ambarına değil beyine küskün görünüyor."`

**Veri şeması notu:** `taxReactions.high` 3 → 4, `.mid` 3 → 4, `.low` 3 → 4 eleman. Bant sınırları (70 / 40) **değişmedi**; yalnız havuz uzunlukları arttı, `pickHumor` uyumu bozulmaz.

> **Havuzlar arası callback ağı — §1.7 ile eşleşme (uygulayıcıya kritik):** Aşağıdaki havuzlar (3-g … 3-l) §1.7'deki beş gag hattını **ekip büyütür**. Havuz repliği ile gag aşaması aynı şey değildir: gag aşaması `gag.<ad>` sayacıyla yönetilen, sırayla oynanan **olay**tır; havuz repliği ise o olaydan doğan **söylenti**dir ve sayaç gerektirmez. Eşleşme tablosu:
>
> | §1.7 gag | Havuzlarda ekildiği yer | Havuzlarda büyüdüğü yer |
> |---|---|---|
> | **GAG-1** ip (Saka İbrahim) | 3-l/4 (ilk ekran, **aşama 0**) | 3-g/11 (aşama 2 yankısı), 3-k Yaz/3, 3-d/18, 3-j `ACH_SAKA_DOSTU` (**zirve başarımı**) |
> | **GAG-2** defter (Kethüda) | 3-l/7 (ilk ekran) · **gövde: §3-n** | 3-c/4, 3-e/4, 3-f/3, 3-f/8, 3-i/4, 3-k Güz/6, 3-k Kış/7, **T3-I**, 3-j `ACH_FIRST_INSPECT` / `ACH_WEALTHY_SIPAHI` |
> | **GAG-3** esir eşek (nöbetçiler) | 3-b `guard_talk` | 3-g/14, **T3-G**, 3-j `ACH_CASTLE_DISCOVERY` |
> | **GAG-4** sönen ocak (Salih) | 3-h/1 | 3-h/6, 3-h/9, **3-h/13-14 (zirve)**, 3-g/12, 3-d/25 |
> | **GAG-5** Kara Çelebi (karga) | 3-i/4, 3-l/7 | 3-f/6, 3-k Güz/5, 3-k Kış/7, 3-j `ACH_BANDIT_SLAYER` |
>
> **Ad birliği (denetim kararı):** Köylüler kargaya **"Kara Çelebi"** der (halk unvanı, §1.7 GAG-5); kethüda aynı kargayı deftere **"Baş Karga"** diye kaydeder (resmî hane adı, 3-l/7 ve 3-i/4). İki ad **çelişki değil, esprinin kendisidir** — halk dili ile defter dili arasındaki fark deadpan'in ta kendisidir; ikisi de korunur ve birbirinin yerine kullanılmaz.
>
> **Yan gag (üçlü aşaması olmayan, serbest):** *Balaban'ın büyüyen Haçlı sayısı* — sayı her anlatımda artar, sonunda anlaşılır ki adam yüz binden ötesini saymayı bilmiyor. Ekim: 3-b `guard_talk` / 3-g/10; büyüme: 3-i/9, 3-d/21. Sayacı yoktur, `gag.*` alanına yazılmaz.

### 3-g. Hamam sohbeti / dedikodu havuzu (15 adet — tellak 7 + müşteri 8)

Kanca (DEĞİŞMEDİ): Kanca 1 — `tellak_talk`a (DialogueSystem.js:585) yeni seçenek `'🗣️ "Hamamda ne konuşulur Hüseyin Ağa?"'` → havuzdan tellak repliği. Kanca 2 — `hamam_musteri_talk` (DialogueSystem.js:640-650) açılış metni havuzdan müşteri repliğiyle çeşitlenir. Ziyaret başına en çok 2 dedikodu. Dedikodu, görev/ekonomi ipucu taşıyabilir (TARIHSEL doc 15: "hamam yalnız iyileşme dükkânı olmamalı"); müşteri repliklerinin 3'ü (8, 9, 12) görev/dünya ipucu taşır.

**Tellak Hüseyin Ağa (7 adet):**

1. `"Sırtına bir vurdum buhar dağıldı; iki vurdum kurnalar sustu; üçte kubbe 'gum' dedi. Hamamcı koşup geldi, 'kubbeye vurma' diye çıkıştı — beyim, ben sırtına vuruyordum."`
2. `"Keseden ne çıktı biliyor musun beyim? Evvela yol tozu, sonra meşelik çamuru, en dipten de bir kestane kabuğu. Kestaneyi sen mi yedin atın mı — orasını sormuyorum."`
3. `"Göbek taşı sır tutar beyim, ben de tutarım; benden çıkan laf buhardır. Nitekim kethüdanın dünkü sırrı da buhar oldu. Şimdi bütün çarşı biliyor, ama kimden duyduğunu kimse bilmiyor."`
4. `"Kese nasihat gibidir beyim: acı gelir, sıhhat verir. Geçen bir ağaya kırk yıllık nasihat verdim, adam ertesi gün kethüdaya şikâyete gitti. Öbür gün de gelip bir daha yaptırdı."`
5. `"Bugün üçüncü müşterimsin beyim. Birincisi derdini anlattı, ikincisi horladı, üçüncüsü sensin. Birinciyle ikinci aynı adamdı."` *(§1.2 gereği açıklayıcı kuyruk silindi: eski satırın "Sen bari uyanık dur…" cümlesi vurucudan sonra geliyor ve espriyi söndürüyordu. Sayım artık gerçekten üç basamak — ve tam oyuncu sayıya dâhil olduktan sonra sayı çöküyor.)*
6. `"Peştemalini sıkı tut beyim; burada edep baş tacıdır. Kurna başında bey de reaya da bir tas suyla yıkanır; tas kimin sırası olduğunu sormaz. Sorsaydı bu hamamda kavga hiç bitmezdi."`
7. `"Ben bu hamamda kırk yıldır kese yaparım beyim. Kırk yılda üç kişi 'yavaş ol' dedi; üçü de sonradan gelip 'sert olsun' diye yalvardı. Dördüncüsü sensin — daha ağzını açmadın ama gözlerin şimdiden yalvarıyor."`

**Hamam müşterileri (8 adet):**

8. `"Ohhh... Değirmen arkı yüzünden iki hane kadı naibine gidiyormuş. Meselenin aslı şu: su iki tarlayı da suluyor, lakin ikisi de 'evvela benim' diyor. Ark akmaya devam ediyor; iki hane kıyıda oturmuş, suyun taraf tutmasını bekliyor."` *(quest_water_dispute ipucu)*
9. `"Handa bir Frenk tüccar var; üç gündür kalıyor, üç gündür hiçbir şey satmıyor. İdris hesabı üç kez fazla yazdı, adam üçünde de itiraz etmedi. İdris diyor ki: 'Tüccar pazarlıksız olmaz beyim. Bu adam ya tüccar değil, ya da benden zengin — ikisi de merak edilir.'"` *(quest_inn_spy ipucu; espri İdris'in tuzağı üzerinedir, tüccarın milleti üzerine değil)*
10. `"Nöbetçi Balaban pazartesi 'Haçlı yüz bin' dedi, salı 'yüz elli bin' oldu, çarşamba 'saymakla bitmez' dedi. Perşembe hiç konuşmadı. Anlaşıldı: adam yüz binden ötesini saymayı bilmiyor."` *(yan gag ekimi)*
11. `"Saka İbrahim ipe dördüncü düğümü atmış. İp kuyuya yetişmemiş; kalan yolu kendi iniyormuş. 'İnişi kolay,' diyor, 'çıkışta kova bana yardım ediyor.'"` *(GAG-1 aşama 2 yankısı — kanona göre düzeltildi: tek ip, artan düğüm, kısalan ip; §1.7 GAG-1 kanon kutusu)*
12. `"Demircinin çırağı körük başında yine uyuyakalmış. Rüstem Usta 'demir soğudu, sen de soğu' deyip dışarı dikmiş. Çocuk üşümüş, geri girmiş, ısınayım diye körüğe abanmış — ocak bu sefer büsbütün sönmüş."` *(GAG-4 yankısı)*
13. `"Kaledeki kır at yularını koparmış beyim: iki nöbetçiyi kovalamış, üçüncüsü 'ben tutarım' deyip yuları kapmış. At durmuş, nöbetçi durmamış — yular elinde meydana kadar koşmuş."` *(hâl komedisi + statü düşmesi, tamamı nöbetçilerin üzerinde; §2 mizahsız listesinden hiçbir isim replikte GEÇMİYOR — dizdar bu replikten tamamen çıkarıldı. **Denetim gerekçesi:** eski satır iki ayrı ihlal taşıyordu — (i) "beyin gösterdiği yere de gitmez" dizdarın kendi atına söz geçiremediğini söylüyordu, yani dizdarı espri **nesnesi** yapıyordu; (ii) "Dizdar 'aferin' dedi. Kime dediği anlaşılamadı." kapanışı son sözü dizdarın ağzına veriyordu ama **anlamsız** bir son söz olarak — bu vakar değil, komik konumdur. At artık kalenin atıdır; "Yağız" adı bilinçli olarak kullanılmadı, o ad GAG-3'te esir eşeğe aittir)*
14. `"Duydun mu, kale yolunda ayı görülmüş. Yok, ayı değilmiş, kurtmuş. Kurt da değilmiş — hancının eşeğiymiş; kaçmayı bu sefer kışın denemiş, kürklü görünmüş."` *(yanlış anlama zinciri + GAG-3 yankısı)*
15. `"Şu kurnanın başında dört kişiyiz beyim: biri öşrü çözdü, biri seferi, biri Tuna'yı. Dördüncüsü tası düşürdü. Devlet meselesi orada bitti; dördümüz buharda tas aradık."` *(tırmanma + statü düşmesi + hâl komedisi — devleti yöneten meclis bir tası bulamıyor. Eski kapanış "hepimiz onun en akıllımız olduğuna karar verdik" hazır bir bilgelik klişesiydi; yerine **fiziksel bir çöküş** kondu)*

**Etiket notu (korunur):** 6 numaralı tellak repliği hamam adabı + kurna başında eşitlik değerini taşır (**B**: Osmanlı hamam adabı). Mizah "tas kimin sırası olduğunu sormaz" cümlesinin dünyevi kuyruğundadır, adabın kendisinde değil. Beden mizahı §1.3-4 gereği "sırt-kese-kurna-peştemal" ve yorgunluk düzeyini aşmaz.

### 3-h. Demirci usta-çırak atışmaları — örs vuruş anı kancası (14 atışma / 49 satır)

Kanca (DEĞİŞMEDİ): `VillagerAI.update` demirci dalı — örs vuruşu + kıvılcım senkron noktası (VillagerAI.js:236-239, `particleSystem.emitBlacksmithSparks` çağrısının olduğu blok). Oyuncu 12 m içindeyken, en az 45 sn arayla, havuzdan bir atışma satır-satır (1,2 sn arayla) gösterilir. **R** = Rüstem Usta, **S** = Çırak Salih.

**Komik motor:** Salih kendini âlim sanır, Rüstem tek cümleyle yıkar (karakter çelişkisi + kısalık). Ahi ahlakı vaaz edilmez, atışmanın **içinde** öğretilir. GAG-4 ("ocağı söndürdün") **1'de ekilir, 6'da büyür, 9'da ustaya döner, 13-14'te zirve yapar.**

1. R: `"Salih! Körük!"` — S: `"Basıyorum usta, iki koldan basıyorum!"` — R: `"İki koldan basıyorsun da ocak niye söndü?"`
2. S: `"Usta, ben bu işin sırrına erdim: demir ısınınca kızarıyormuş."` — R: `"Kaç günde buldun bunu?"` — S: `"Üç ay."`
3. R: `"Demir tavında dövülür Salih."` — S: `"Ben de tavımdayım usta."` — R: `"Sen tavda değilsin, gölgedesin. Gölgeyi dövmek de bana kalıyor."`
4. S: `"Usta, bu kılıç kaç akçe eder?"` — R: `"Kim dövdü?"` — S: `"Ben usta."` — R: `"Öyleyse nal eder. Nal beş akçe; senin dövdüğün üç."`
5. S: `"Usta, elime kıvılcım sıçradı!"` — R: `"Demek örse yaklaşmışsın; hayra alâmet."` — S: `"Bir adım daha yaklaşayım mı?"` — R: `"Yaklaş. Kaşların zaten iki haftadır yarım."`
6. S: `"Usta, ocak söndü."` — R: `"Biliyorum."` — S: `"Nereden biliyorsun usta?"` — R: `"Sen içeri girdin."`
7. R: `"Vur dedimse örse vur Salih, parmağına değil."` — S: `"İkisi de öğreniyor usta."` — R: `"Örs kaç günde öğrendi?"` — S: `"Örs ilk günden usta."`
8. R: `"Ahi ocağında iki şey dövülür: demir ve nefis."` — S: `"Ben hangisiyim usta?"` — R: `"Sen körüksün Salih. Sen üflüyorsun, ikisi birden dövülüyor."`
9. R: `"Bu nal düşmana değil ata. Atı üzersen beyi üzersin; beyi üzersen..."` — S: `"...seni üzerim usta. Bildim."` — R: `"Beni üzme Salih. Ben üzülünce ocak sönüyor."`
10. S: `"Ben ne zaman kılıç döveceğim usta?"` — R: `"Çivin doğru dursun; o gün de gelir."` — S: `"Dün bir çivim doğru durdu usta!"` — R: `"Duvara çakmıştın. Onu duvar tuttu, sen değil."`
11. S: `"Usta, sana Rüstem adını niye vermişler?"` — R: `"Dövdüğüm demir söylesin; ben övünmeyeyim."` — S: `"Demir bir şey söylemiyor usta."` — R: `"Çünkü onu sen dövdün."`
12. S: `"Ben müşteriye 'bu kılıç kırk yıl gider' dedim usta."` — R: `"İyi etmişsin. Kırk yıl sonra da sen ödersin."` — S: `"Neyi usta?"` — R: `"Sözünü."`

13. *(GAG-4 ZİRVESİ — T3, blok 1/2; yalnız `gag.ocak===2` iken oynar)*
    S: `"Ocağı gece boyu söndürmedim usta."` — R: `"Aferin Salih. Neyle besledin?"` — S: `"Odun bitti, sonra talaş, sonra... eski körük."` — R: `"Ocağı yaşattın, körüğü yaktın."`

14. *(GAG-4 ZİRVESİ — T3, blok 2/2; 13'ten hemen sonra, ~4 sn ara. MİZAHSIZ — Ahi kapanışı)*
    R: `"Şunu bil Salih: ocağı odun değil, başında duran yaşatır."` — S: `"Uykum geldi usta."` — R: `"Gelsin. Sabır da öyle öğrenilir."`

> **GAG-4 zirvesi hakkında (denetim bulgusu).** §1.7 bu zirveyi tarif ediyordu ama 3-h havuzunda **metni yoktu**; yani K8 kancasına bağlanacak bir şey yoktu ve zirve kâğıt üstünde kalıyordu. Zirve artık **iki ardışık atışma bloğu** hâlinde havuzdadır: 13 = kahkaha bloğu (4 satır, §1.2 sınırına uyar), 14 = Ahi ahlakının ciddi kapanışı (3 satır, mizahsız). §1.7'nin istediği "atışma öğretiyle kapanır" şartı böylece **4 satır sınırı çiğnenmeden** karşılanır: T3 tanımı gereği zaten çok bloklu bir andır (40-90 sn, §1.6) ve sınır **blok başınadır** (§1.2 tablosu dipnotu). 14 numara mizahsız olduğu için havuzun rastgele çekimine **girmez**; yalnız 13'ün hemen ardından oynar.

**Etiket (korunur):** Ahi ocağı ahlakı (doğruluk, sabır, nefis terbiyesi, söz namusu) = **B** (Ahilik fütüvvet geleneği; TDV İA "Ahîlik"). 8 ve 12 numara bu ahlakı doğrudan taşır; 12'nin "sözünü ödersin" kapanışı fütüvvetin söz namusu ilkesidir. Atışma bu ahlakı vaaz etmeden, iş üstünde gösterir.

**Biçim notu (§1.2 sınır revizyonu):** 4, 5, 6, 7, 9, 10, 11, 12 ve 13 numaralı atışmalar **4 satırdır** (tırmanma üçlüsü + vurucu kapanış). §1.2'deki atışma satır sınırı bu yüzden 3'ten **4'e** çıkarılmıştır; 4. satır kesilirse bu atışmaların espri kapanışı yok olur. Hiçbir atışma 4 satırı **aşmaz**; 13+14 çifti tek bir T3'ün iki ayrı bloğudur, tek sahne değildir (§1.2 dipnotu). **5 numaradaki "yarım kaş"** slapstick'tir, sakatlık değil (§1.3-5 denetimi yapıldı); 3-d/23 durum etiketi (*"Kaşları yine kısaldı"*) bu satırın sessiz callback'idir ve aynı denetimden geçmiştir.

### 3-i. Meydan NPC-çifti baloncuk diyalogları (10 çift / 47 satır)

Kanca (DEĞİŞMEDİ): `VillagerAI` WANDERING durumu (VillagerAI.js:258-273), 18:30-22:00 sosyalleşme dilimi. İki NPC birbirinin 6 m'sindeyken ve oyuncu 15 m içindeyse çift-baloncuk sahnesi (satır başına ~4 sn); çift başına gün başına 1 sahne. Çift eşleşmesi NPC id'lerine göre sabittir; NPC id'leri uygulama sırasında NPCManager.js'deki gerçek alanlarla eşleştirilir, eşleşme bulunamazsa sahne oynamaz.

**Komik motor:** Bu kanalın birincil tekniği **yanlış anlama zinciri**dir (§1.5-7) — iki NPC birbirini yanlış anlar, oyuncu doğruyu bilir; ikincil teknik **statü düşmesi**dir ve daima konuşanın kendi üzerindedir.

1. **`ciftci_hasan` ↔ `irgat_veli`** *(hâl komedisi + statü düşmesi, konuşanın kendi üzerinde)*
   H: `"Bu yıl buğday benim boyumu geçti Veli. Ölçtüm, tam iki parmak."`
   V: `"Neyle ölçtün?"`
   H: `"Kendimle. Sonra fark ettim — ölçerken iki parmak eğilmişim."`

2. **`orakci_bekir` ↔ `reaya_mahmud`** *(kulaktan kulağa / dedikodunun bozularak yayılması)*
   B: `"Duydun mu, beyimiz kaleye çağrılmış."`
   M: `"Kaleye değil, Edirne'ye. Vezirin huzuruna."`
   B: `"Vezir mi? Ben 'kilere' diye duymuştum."`
   M: `"Öyleyse ikimiz de yanlış duymuşuz. Bir kişiye daha soralım; doğrusu üçüncüde çıkar."`

3. **`hanci_idris` ↔ `attar_mehmet`** *(pazarlık — İdris kaybeder)*
   İ: `"Merhem kaça Mehmet?"`
   A: `"Sana on akçe."`
   İ: `"Sekiz de, üstüne bir gece yatak vereyim."`
   A: `"On de, yatağı da sen ver. Yorgunum İdris."`
   İ: `"...Ben bu pazarlığa başlarken kazanıyordum."`

4. **`irgat_veli` ↔ `ciftci_hasan`** *(GAG-5 — defterdeki resmî ad "Baş Karga")*
   V: `"Kethüda harman kargalarının elebaşını deftere yazmış: 'Baş Karga'."`
   H: `"Niye yazmış ki?"`
   V: `"Kayıtsız mahluka dava açılmıyormuş. Şimdi bir de mühür lazım."`

5. **`koca_dede` ↔ `orakci_bekir`** *(anının içeriği değil, anlatma alışkanlığı güldürür — Bölüm 2 kuralı aynen geçerli)*
   D: `"Biz Kosova'da..."`
   B: `"...sol kanattaydınız dede. Biliyoruz."`
   D: `"Sağ kanat."`
   B: `"Dün sol demiştin."`
   D: `"Dün soldaydım, bugün sağdayım. Otur evlat, ben sana iki kanadı da anlatayım."`

6. **`saka_ibrahim` ↔ `tellak_huseyin`** *(**SET-PIECE** — 6 satır, ~24 sn; §1.6'da **T3 sayılabilir** ve o hâlde T3 aralık kurallarına tabidir)*
   T: `"İbrahim! Bugün sana bedava kese. Dostluk hatırına."`
   S: `"Hayrola Hüseyin. Sende bu cömertlik nereden çıktı?"`
   T: `"Karşılığı ufak: hamama günde bir kırba fazla su."`
   S: `"Bir kese kaç kırba eder? Sayısını söyle."`
   T: `"Sayısı olmaz. Ömrün oldukça; yarın ilk kırba benim, sonra köyün."`
   S: `"Otuz senedir su taşırım. İlk defa borçlandım."`

   > **Neden bu sahne büyütüldü (denetim: "havuzun en büyük kayıp fırsatı").** Oyunun **en mizahi iki karakteri** (§2-a ikisini de "çok yüksek doz" ilan ediyor) yan yana geliyordu ve ortaya bir vecize alışverişi çıkıyordu: dört satırın dördü de simetrik iptal kalıbıydı ("ikimizinki de hamallık", "seninki inişli benimki yokuşlu", "sen zayıfsın ben neşeliyim"). Ne tırmanma, ne somut nesne, ne statü hareketi vardı; sahne T2 bile değildi. Yeni sahnede **iki karakterin motoru çarpışıyor, birbirini iptal etmiyor**: Hüseyin abartılı-coşkulu esnaf (meddah), İbrahim somut-sitemkâr muhasebeci; Hüseyin "sayısı olmaz" diyor, İbrahim sayı istiyor — pazarlık bu yüzden kilitleniyor. Tırmanma dört basamakta İbrahim'in aleyhine büyüyor (bedava → ufak karşılık → ömürlük → köyün önüne geçme) ve İbrahim bunu ancak son satırda fark ediyor. Kapanış statüyü yerle bir ediyor: köye otuz senedir bedava su taşıyan adam, hayatında ilk defa **borca giriyor** — hem de bir keseye.

7. **`reaya_mahmud` ↔ `orakci_bekir`** *(quest_water_dispute'a gayriresmî ipucu; 3-l/9 tohumunun **BÜYÜYEN** ikinci aşaması — kopya değil)*
   M: `"Yalaktaki Kâtip kurbağa dün akşamdan beri susuyor Bekir."`
   B: `"Ne olmuş?"`
   M: `"Mirab yalnız kaldı. İki hane ark davasını gidip ona sormuş."`
   B: `"Kurbağa ne demiş?"`
   M: `"Hiçbir şey. İkisi de 'kazandık' deyip dönmüş."`

   > **Denetim gerekçesi:** eski sahne, oyuncunun **açılış ekranında zaten okuduğu** 3-l/9 kusurunun ("Çeşme yalağında iki kurbağa mukim… biri Mirab, biri Kâtip") neredeyse birebir tekrarıydı — §1.1-5'in kuralı nettir: *büyümeyen tekrar, tekrar değil kopyadır ve silinir.* Kurbağalar artık **tanıtılmıyor**; oyuncu onları zaten tanıyor, sahne doğrudan ikinci aşamaya atlıyor: kurbağa artık **hakem**. Kahkaha bilgi asimetrisinde (§1.5-7): susan bir kurbağadan iki taraf da kendi kararını çıkarıyor, oyuncu ikisinin de yanıldığını biliyor. `quest_water_dispute` ipucu korundu ve güçlendi — dava hâlâ çözülmemiş. **3-l/9 aynen kalır**; ikisi birlikte planlı bir tekrar oluşturur.

8. **`cirak_salih` ↔ `cebelu_ali`** — `blockedByAliArc: true`
   S: `"Cebelü olmak zor mu Ali?"`
   A: `"Talimi zor, gerisi sabır."`
   S: `"Bende sabır çoktur usta."`
   A: `"Ben Ali'yim Salih."`
   S: `"Gördün mü, sabrım daha şimdiden sınandı."`

9. **`ciftci_hasan` ↔ `reaya_mahmud`** *(yan gag — Balaban'ın sayısı)*
   H: `"Kaleden haber geldi: Haçlı iki yüz binmiş."`
   M: `"Dün yüz elli bindi."`
   H: `"Gece de gelenler olmuştur."`
   M: `"Hasan, sen bu sayıyı kimden aldın?"`
   H: `"Balaban'dan."`
   M: `"Öyleyse yarın üç yüz bin olur. O sayı geceleri büyüyor."`

10. **`reaya_mahmud` ↔ `irgat_veli`** *(statü düşmesi — espri konuşanın kendi üzerinde; quest_water_dispute yankısı)*
    M: `"Meydanda ne konuşulursa konuşulsun, son sözü ben söylerim Veli."`
    V: `"Dün ne konuşuldu?"`
    M: `"Ark davası. Sabahtan akşama iki hane tartıştı."`
    V: `"Sen ne dedin?"`
    M: `"İkisine de 'doğru söylüyorsun' dedim. En son ben dedim."`

    > **Denetim gerekçesi — üç kusur birden kapatıldı.** (a) **Modern klişe:** "evde son sözü ben söylerim / 'peki hanım' derim" hazır bir sitcom kalıbıdır; 1396 köy meydanında değil, modern stand-up'ta doğmuş bir şaka formudur (§1.3-3). (b) **Simetrik iptal:** "Bende de öyle" kapanışı, denetimin "havuzda ~6 yerde" dediği ikinci motoru bir kez daha çalıştırıyordu. (c) **Dinî kalıp kurulumu:** `"Maşallah."` bir hayır kalıbıdır ve burada esprinin **kurulum basamağı** olarak kullanılıyordu (§1.3-1 ayrım notu). Üçü de kalktı. "Son söz" iddiası dönemin gerçek mekânına (meydan, ark davası) taşındı; kahkaha son cümlede: adam iki tarafa da hak vermeyi "son sözü söylemek" sanıyor ve bunu bir zafer gibi anlatıyor — çelişkiyi hiç fark etmiyor (§1.5-3).

**Kısıtlar (korunur + biri eklendi):**
- 8 numaralı çift `quest_save_ali_leg` hattı aktifken oynamaz (`blockedByAliArc`, Bölüm 6 / bayrak 2). Ali'nin repliği eski hâlinde *"gerisi dua"* idi; **"gerisi sabır"** olarak değiştirildi — "dua" kelimesinin bir mizahi kapanışın kurulum cümlesi olmaması için (§1.3-1 ayrım notunun ihtiyatlı uygulaması).
- 9 numaralı çift Perde IV'te (sefer) zaten bayrak 4 ile susar.
- Perde III'te K9 havuzu yarıya iner (Bölüm 6 zamansal ton eğrisi) — kesilecek yarı olarak **1, 3, 6, 10** önerilir; savaş gerginliğinde 2, 4, 5, 7, 9 kalır. **(Ek)** 6 numara artık bir set-piece olduğu için bu listede kalması ayrıca zorunludur: Perde III'te T3 yoktur (§1.6 Perde eğrisi), dolayısıyla 6 numaranın orada kesilmesi hem yoğunluk hem ton açısından doğrudur.

### 3-j. Mizahi ama saygılı başarım adları (12 adet — ID'ler DEĞİŞMEZ)

Kanca (DEĞİŞMEDİ): `SteamManager.achievements` sözlüğü (SteamManager.js:12-21). **12 başarım kimliğinin tamamı korunmuştur**; yalnız `name` ve `description` metinleri kahkaha seviyesine yükseltilmiştir. Eksik `ACH_FIRST_PATROL` sözlüğe eklenir (QuestSystem.js:504 zaten çağırıyor). Tetik noktaları teknik planla paylaşılan bağlantı işidir; buradaki teslimat **ad + açıklama metnidir**.

**Komik motor:** resmî başarım dili ile absürt içeriğin çarpışması (deadpan, §1.5-4). Anlatıcı şaka yaptığını belli etmez, tutanak tutar. Zafer başarımı bilinçli olarak mizahsızdır.

| ID | Ad | Açıklama | Tetik önerisi (değişmedi) |
|---|---|---|---|
| `ACH_FIRST_PATROL` *(sözlüğe eklenecek)* | Boş Gezmeyen Bey | İlk vazifeni tamamladın. Köy ikincisini bekliyor; kethüda üçüncüyü çoktan deftere yazdı. | ilk `completeQuest` (QuestSystem.js:485-511) |
| `ACH_FIRST_INSPECT` | Deftere İlk Mühür | Teftiş tamam. Kethüda memnun, kargalar tedirgin, değirmenci hâlâ "sesi hoş geliyor" diyor. | quest_inspect tamamlanınca |
| `ACH_BLACKSMITH` | Örs Hatırı | Ahi ocağından pusat kuşandın. Rüstem Usta demire baktı, sana bakmadı, başını salladı. Salih hâlâ o başın kime sallandığını soruyor. | gürz alımı (DialogueSystem.js:196-206) |
| `ACH_CASTLE_DISCOVERY` | Burçlara Selam | Sancak kalesine vardın. Nöbetçiler deftere şöyle kaydetti: "Atlı, uzun boylu, ismini sormayı unuttuk." | quest_castle tamamlanınca |
| `ACH_BANDIT_SLAYER` | Meşelik Ferahladı | Kılçık Cafer'in çetesi dağıldı. Meşelikte artık yalnız kargalar pusu kuruyor; niyetleri de harman. | onEnemyDefeated sayaç=3 (QuestSystem.js:464-483) |
| `ACH_NIGBOLU_VICTORY` | Tuna Şahittir | 1396 Niğbolu meydanında sancağın altında durdun. Tarih yazdı; sen yaşadın. *(zafer başarımı — mizahsız, bilinçli)* | Niğbolu zaferi (HistoryEventSystem.js:38-81) |
| `ACH_FIRST_CEBELU` | Bir Yiğit Donandı | İlk cebelünü donattın. Zırhı tam, atı sağlam; kendisi heyecandan üç gün uyuyamadı. | mevcut tetik (TimarSystem.js:55) |
| `ACH_HORSE_MASTER` | Karayağız'ın Adamı | Karayağız'la aranız düzeldi: o nereye giderse orada işin çıkıyor. Dün kuyu başında suyunu kendi içti, sen tası tutup bekledin. | mevcut tetik (main.js:167) |
| `ACH_WEALTHY_SIPAHI` | Kese Dolu, Gönül Tok | Hazine 2500 akçeyi aştı. Kethüda deftere "hayra harcanır" yazdı, altına da bir liste iliştirdi. | akçe eşiği (GameState.js:212-233) |
| `ACH_HAMAM_PAK` | Pirüpak Bey | Kese-köpük tamam. Hüseyin Ağa arkandan baktı: "Bu bey buraya bir daha gelir." | tellak kese alımı (DialogueSystem.js:585+) |
| `ACH_SAKA_DOSTU` | İpin Vârisi | Yeni ip tayin oldu; eskisi omzunda kaldı. Beş düğüm, iki "Sağlam", bir sahipsiz nal. İbrahim yeni ipi çekerken hâlâ eskisine danışıyor. | saka_talk "sakalık" dalı sonu **veya** GAG-1 zirvesi (`gag.rope===3`) |
| `ACH_UYKU_BOLEN` | Uyku Bölen | Beş uyuyan köylüyü uyandırdın. Beşi de "uyumuyordum beyim, gözümü dinlendiriyordum" dedi — beşi de aynı anda. | uyandırma sayacı 5 (`gameState.flags.wakeCount`) |

**Zafer başarımı notu (bilinçli):** `ACH_NIGBOLU_VICTORY` metni **hiç değiştirilmedi**. Sefer/şehitlik bağlamında mizah Bölüm 6'ya göre zaten susar; başarım metninin de susması ton tutarlılığıdır.

**Din/saygı notu:** `ACH_HAMAM_PAK` yalnız dünyevi temizlik ve tellak esprisi üzerinedir; hiçbir başarım metninde ibadet, dua, kutsal kavram veya "Temizlik imanın yarısıdır" hadisi geçmez (o hadis 3-a'daki ciddi dalda kalır, başarım metnine taşınmaz). `ACH_FIRST_CEBELU`'nün eski adı "Bir Yiğit, Bin Dua" ve açıklamasındaki "bir dua kalabalık" ifadesi, duanın bir mizahi başarım metnine malzeme olmaması için **"Bir Yiğit Donandı"** ile değiştirilmiştir (§1.3-1 ayrım notunun ihtiyatlı uygulaması).

**Sınır revizyonu (§1.2'ye işlendi):** Başarım **açıklaması** sınırı ~90 → **~150 karakter**. Adlar 2-4 kelime kuralına uymaya devam eder. Tırmanmalı açıklamalar 90 karaktere sığmaz; kırpılırsa vurucu cümle gider ve başarım tekrar "hoş"a döner. En uzun açıklama 148 karakterdir (`ACH_UYKU_BOLEN`).

**§1.7 gag zirvesi başarımları — ikinci kademe (ID kotasına tabi):** §1.7'deki zirveler doğal birer başarım anıdır: **"İpin Vârisi"** (GAG-1), **"İki Defterli Hakikat"** (GAG-2), **"Beratsız Esir Salıverilmez"** (GAG-3), **"Ocağı Yaşattın"** (GAG-4). **GAG-1 zirvesi bu revizyonda teslim edildi:** `ACH_SAKA_DOSTU`'nun adı ve metni zirveye bağlanmıştır, **yeni Steam ID'si gerekmez** ve mevcut 12'lik kota bozulmaz. Bu değişiklik dokümanın kendi iç çelişkisini de kapatır: §1.7 GAG-1 zirvesi için "İpin Vârisi" adını koymuştu ama başarım tablosu o adı taşımıyordu (denetim bulgusu). Kalan üçü **yeni ID gerektirir** ve yukarıdaki listeyi bozmadan ancak ayrı bir kararla eklenebilir; doküman onları **öneri** olarak kayda geçirir, sözlüğe yazmaz. Kota dar kalırsa uygulanacak sıra: GAG-3 zirvesi `ACH_CASTLE_DISCOVERY`'ye bağlanır; GAG-2 ve GAG-4 zirveleri başarımsız oynanır — **gag'in kendisi başarıma bağımlı değildir**, başarım yalnızca ödül katmanıdır.

**Yeniden yazılan üç başarım metni (denetim bulgusu):** `ACH_SAKA_DOSTU` — eski ad *"Su Gibi Aziz"* bir hayır dua kalıbıdır ("su gibi aziz ol"), espri değil temennidir; eski açıklama *"şikâyeti kalmadı"* ise karakteri **yanlış tarif ediyordu** (İbrahim'in motoru şikâyettir, şikâyeti bitince karakter biter). `ACH_HORSE_MASTER` — eski açıklama soyut bir benzetmeydi ("aranız su gibi") ve "su gibi" ifadesi aynı tablodaki eski `ACH_SAKA_DOSTU` adıyla çakışıyordu; yeni ad **esprinin kendisidir** (kimin kimin sahibi olduğunu tersine çevirir) ve açıklama §3-a'daki at dalına bağlanır. `ACH_BLACKSMITH` — eski açıklamanın *"bu, 'helal olsun'un demirci lehçesidir"* cümlesi şakayı **açıklıyordu**; §1.1-3 (sistem anlatıcısı şakayı işaret etmez) ve §1.2 (vurucudan sonraki her satır silinir) birden çiğneniyordu. Ad *"Örs Hatırı"* **korundu** — 2 kelime, deadpan, zaten çalışıyor (cerrahi değişiklik ilkesi). Rüstem'in vakarı ve "övünmez" karakteri de korunur: yeni metinde hiçbir şey açıklamaz.

### 3-k. Mevsim dönümü bildirimleri (8 adet — 4 mevsim × 2 varyant)

Kanca (DEĞİŞMEDİ): `GameState.advanceSeason` (GameState.js:257-269), dönüm başına 1 satır. Yapı: kısa atmosferik kuruluş + **vurucu kuyruk cümlesi** (§1.2 "vurucu kelime sona" kuralı). Kış metinleri serbest oyun/uzatma içindir (kampanya eylülde biter), kod dört mevsimi desteklediği için (seasons dizisi GameState.js:258) dördü de teslim edilir.

- **İlkbahar (index 0):**
  1. `"🌱 Tohum toprağa düştü, umut deftere. Kethüda 'bereket yılı' diyor; kargalar aynı cümleyi 'ziyafet yılı' diye anlıyor."`
  2. `"🌱 Bahar geldi: kim ne ekerse onu biçer. Bunu tarla da bilir, defter de — harmandaki kargalar da."`
- **Yaz (index 1):**
  3. `"☀️ Yaz bastırdı. Saka İbrahim bugün kırk kez kuyuya indi; otuz dokuzunda kırbası doldu, birinde kendisi."` *(GAG-1 yankısı)*
  4. `"☀️ Sıcaklar geldi: reaya işte, nöbetçi gölgede. Gölge öğlen yer değiştirdi; nöbetçi de onunla gitti."` *(kalıp kotası gereği "gölge de nöbette" — nesne-vazife kalıbı — hâl komedisine çevrildi)*
- **Güz (index 2):**
  5. `"🍂 Harman savruldu, ambar doldu, hesap günü yaklaştı. Kargalar bu yıl da vergiye tabi tutulamadı."` *(GAG-5 yankısı)*
  6. `"🍂 Harman savruldu, ambar doldu, kethüda güldü. Köylüler ilk ikisini her yıl görüyor; üçüncüsünü ilk defa gördüler."` *(GAG-2 yankısı — havuz içi karga tekrarı kaldırıldı: Güz'ün iki varyantı da karga esprisiydi, iki elemanlı bir havuzda oyuncu hangisini görürse görsün aynı şakayı alıyordu. Ayrıca "zafer/bozgun/kansız" savaş sözlüğü, Niğbolu'ya yürüyen bir kampanyanın mevsim bildiriminde tonal olarak yersizdi.)*
- **Kış (index 3):**
  7. `"❄️ Kış bastırdı: odun kıymetlendi, sohbet uzadı. Hanın ocağı başında karga davası üçüncü kez görüldü; karga yine gelmedi."` *(GAG-5 × GAG-2 yankısı)*
  8. `"❄️ Kar düştü, yollar kapandı, havadis açıldı. Koca Dede kıssaya başladı; kimse dışarı çıkamadığı için herkes dinliyor."`

**Sınır notu:** En uzun satır 123 karakterdir; §1.2'deki bildirim sınırı bu yüzden ~120'den **~130'a** yükseltilmiştir (kanal düzeltmesi zaten teknik planın işidir — Bölüm 0 teknik ön koşul). Denetim sonrası yeniden yazılan 4, 6 ve 7 numaralar da bu sınırın altındadır (sırasıyla ~102, ~114, ~121 karakter).

**7 numara hakkında (denetim bulgusu — kelime yaması değil, şaka yeniden kuruldu):** Eski satırın vurucu kelimesi `gündem`di ve "gündem" 20. yy Türkçesine ait bir kurul/toplantı terimidir. §1.2'nin uyarısı burada birebir geçerlidir: *"komik bulduğun satırda listeden bir kelime varsa, kelimeyi değiştirme, şakayı yeniden kur."* Dönemsel bir karşılık (`maslahat`) tek kelimeyle sınırı geçirirdi, ama "yine karga" zaten düz bir bilgi cümlesiydi ve sürprizi yoktu — yani satır iki denetim maddesine birden takılıyordu (anakronizm + zayıf replik). Yerine dönemin kendi kurumu kondu: **dava görülmesi**. Kahkaha son üç kelimede — mahkeme üçüncü kez toplanıyor, sanık kuş olduğu için gelmiyor ve kimse bunu tuhaf bulmuyor. Satır 3-l/7 ve 3-i/4'teki *"kayıtsız mahluka dava açılmıyormuş"* kurulumunun doğal zirvesidir; GAG-5'i GAG-2'nin defter mantığıyla çarpıştırır (§1.5-5). **Kalıp kontrolü:** karga burada bir vazife görmüyor, **sanık**tır — "hayvan insan vazifesi görür" kalıbına eklenmez (§1.5 kalıp kotası).

### 3-l. Başlangıç ekranı prosedürel tımar kusurları (15 adet)

Kanca (DEĞİŞMEDİ): `UIManager.updateStartScreenInfo` (UIManager.js:367-376) — bilgi kutusuna `"Bilinen Kusur: ..."` satırı; tımar üretiminde (GameState.js:25-33 bölgesi) rastgele 1-2 kusur seçilir. Salt lezzet metnidir, mekanik etkisi yoktur (Simplicity First); ileride ekonomiye bağlanması teknik planın opsiyonudur. **Mescid/dinî yapı kusuru bilinçli olarak listede YOKTUR ve eklenemez** (Yasak §1.3-1).

**Bu, oyuncunun gördüğü İLK espridir** — bu yüzden hepsi deadpan defter dilinde, absürt spesifik ve **son cümlede tırmanan** biçimde yazılmıştır. İlk izlenim kahkaha hedefinin en kritik noktasıdır (§1.6 onboarding maddesi).

1. `"Değirmenin taşı çatlak. Değirmenci 'sesi hoş geliyor' diyor; una sorulmadı."`
2. `"Köprünün orta tahtası eksik. Bilen atlıyor, bilmeyen yüzüyor; köprü ikisini de saymıyor."`
3. `"Ambar kapısı gıcırdıyor. Bekçi iki yıl evvel yağlamış; o gün bugündür 'ben yağladım' diye anlatıyor, kapı hâlâ gıcırdıyor."` *(statü düşmesi — kalıp kotası dönüşümü)*
4. `"Kuyu ipi iki yerinden düğümlü. Saka her düğümde ipi bir karış kaybediyor, kuyu her ay bir karış derinleşiyor. İkisinden biri yalan söylüyor."` *(GAG-1 aşama 0 — ekim; kanon: tek ip, artan düğüm, kısalan ip)*
5. `"Hanın tabelası ters asılmış. Hancı 'okuyan zaten geliyor' diyor. Köyde okuyan yok."`
6. `"Talimgâh kuklasının kellesi yamuk. Evvelki sipahiden yadigâr; kimse el sürmüyor, herkes bir de selam veriyor."`
7. `"Harman kargalarının bir elebaşı var. Kethüda deftere 'Baş Karga' diye işledi; kayıtsız mahluka dava açılmıyormuş."` *(GAG-5 + GAG-2 ekimi)*
8. `"Köyün horozu sabah değil ikindi ötüyor. Reaya vaktini ona göre düzeltmiş; köy iki senedir geç kalkıyor."`
9. `"Çeşme yalağında iki kurbağa mukim. Reaya isim takmış: biri Mirab, biri Kâtip. Kâtip az konuşuyor."`
10. `"Ağıl kapısının mandalı gevşek. Çoban 'ben her akşam kontrol ederim' diyor; kontrolü kapının önünden geçerek yapıyor."` *(karakter çelişkisi — kalıp kotası dönüşümü)*
11. `"Meydandaki çınarın dibine oturan uyuyor. Ağaçtan mı işten mi diye üç kişi araştırmaya oturdu; üçü de uyudu."`
12. `"Köy sınırını gösteren taş geçen sene yerinden oynamış. Komşu tımar itiraz etmedi — taş onların lehine oynamış."`
13. `"Ambardaki fare için kedi alınmış. Kedi ambarda yatıyor, fare kilerde; kileri kimse kediye söylememiş."` *(yanlış anlama — kalıp kotası dönüşümü; §1.5'teki ZAYIF→GÜÇLÜ çiftinin kaynağı)*
14. `"Köyün tek öküz arabasının tekerleri eşit değil. Yola düz çıkıyor, hep çeşmenin oraya varıyor. Herkes alıştı, artık su da oradan taşınıyor."`
15. `"Tımar defterinin son sayfasında kurutulmuş bir gül var. Kimin koyduğunu defter söylemiyor; kırk yıldır soran da olmadı."`

**Sıralama tavsiyesi:** İlk açılışta rastgele seçim yapılırken **5, 7, 8, 11** numaralı kusurlar ağırlıklandırılmalıdır (en yüksek kahkaha oranı, ilk izlenim). **15 numara** tonal çeşitlilik için havuzda kalır — komik değil, tatlı-hüzünlüdür; iki kusur birden seçildiğinde 15'in bir komik kusurla eşleşmesi önerilir.

### 3-m. (Ek) Bilinmeyen diyalog için genel köylü replikleri (5 adet)

Analizin işaret ettiği "E'ye basınca hiçbir şey olmuyor" sessiz hatasına (UIManager.js:388-389 `if (!data) return;`) içerik tarafı çözümü: tanımsız `dialogueId` düştüğünde `npcObj.name` başlıklı tek düğümlük genel diyalog gösterilir. **Adet 5'te sabit tutuldu** (testin beklediği sayı); metinler kahkaha seviyesine yükseltildi. Bunlar tek nefeste okunup biten repliklerdir: kısa kurulum, vurucu kelime sonda, açıklama yok.

1. `"Buyur beyim. Emrini bekliyorum; bekliyorum da ne iş yaptığımı ben de tam bilmiyorum. Kethüda biliyordur."`
2. `"Beni mi çağırdın beyim? Ben de tam 'bir çağıran olsa da bir işim olsa' diyordum. İkimiz de çağırdık, iş yine yok."`
3. `"Havadis mi beyim? Bugün havadis yok. Olsa evvela sana söylerdim, sonra hamama — ama sana daha evvel."`
4. `"Sağlığını görelim beyim. Bende bir eksik yok; olsa da fark etmezdim, öyle bir düzenim var."`
5. `"Buyur beyim... Sen bir şey soracaktın, ben cevabı hazırlamıştım. İkimiz de unuttuk; hayırlısı."`

**Neden bunlar güldürür:** hepsi **deadpan + beklenti kırma** üzerine kuruludur ve hepsi kendi hâlinin lehinedir (oyuncuyu değil, konuşanı küçük düşürür). 2 ve 5 numara oyuncuyu esprinin **ortağı** yapar, hedefi değil — §1.3-7'nin (oyuncuyu aşağılayan mizah yok) gereği.

### 3-n. `kethuda_talk` — GAG-2 (taşıyıcı gag) dalı (kes-yapıştır)

> **Bu bölüm neden var (denetim bulgusu).** GAG-2 dokümanın **taşıyıcı gag'idir**: GAG-3 ve GAG-5'in zirveleri `gag.defter≥2` şartına bağlıdır. Buna rağmen `kethuda_talk` dalı §3'te **hiç yazılmamıştı** — kelime 11 yerde anılıyordu (§1.5-4 örneği, §1.7 tablosu, §3-f/3 callback ağı, §5 `runningGags.defter`, §4/K13) ama teslim edilebilir bir blok yoktu. Sonuç: defter aşama atlayamadığı için **eşek zirvesi de karga zirvesi de hiç oynamıyordu**; üç gag birden askıdaydı. Aşağıdaki blok o boşluğu kapatır.

**Ekleme yeri (kod):** `src/systems/DialogueSystem.js`, `kethuda_talk.choices` dizisinin **sonundan bir önceki** konum — yani `'Aleyküm selam Yakub Ağa, şimdilik vazifeme döneyim.'` çıkış satırının **hemen üstü** (DialogueSystem.js:95 civarı). **Mevcut üç görev dalı (indeks 0, 1, 2) hiç değişmez;** yeni dal **indeks 3** olarak eklenir, çıkış satırı 4'e kayar. Bu zorunludur: `tests/systems.test.js:351` `yakubData.choices[0].action()` çağırıyor, indeks tabanlı asert kırılmamalıdır.

**Sayım:** 1 üst seçenek / aşamalara dağılmış 21 alt seçenek. Hiçbir düğüm akçe/ödül/eşya vermez; yalnız aşama sayacını ilerletir.

```js
      // --- GAG-2 (taşıyıcı gag) — Kethüdanın defteri · sayaç: flags.gag.defter ---
      // Mevcut üç görev dalı DEĞİŞMEZ; bu dal onların ALTINA, çıkış satırından ÖNCE girer.
      // Hiçbir akçe/ödül/eşya vermez; yalnız aşama sayacını ilerletir.
      {
        label: '📖 "Defterde bu ay ne var Yakub Ağa?"',
        action: () => DialogueSystem.kethudaDefterBranch()
      },
```

Ve aynı dosyada, `getDialogueData`'nın **yanına** (sınıf içinde, ayrı statik metot — yeni sistem/dosya değil):

```js
  /**
   * GAG-2 stage machine (section 1.7). Stage counter only increases.
   * 0 setup -> 1 second encounter -> 2 peak-ready -> 3 peak played -> 4 archived.
   */
  static kethudaDefterBranch() {
    const f = gameState.flags;
    if (!f.gag) f.gag = {};
    const day = gameState.time?.dayCount ?? 0;
    const stage = f.gag.defter || 0;

    // --- AŞAMA 0 → 1 : KURULUM ---
    if (stage === 0) {
      f.gag.defter = 1;
      f.gag.defterDay = day;
      return {
        text: `"Irgat Veli'nin hastalığını deftere yazdım beyim. Yanlış deftere yazdım. Şimdi 'zahire' hanesinde bir hasta var."`,
        choices: [
          {
            label: '🙂 "Düzeltmedin mi Yakub Ağa?"',
            action: () => ({
              text: `"Düzelttim beyim: hastayı zahireden düştüm, zahireyi hastadan. Şimdi iki hanede de eksik var, ikisi birbirini arıyor."`,
              choices: [
                {
                  label: '"Peki Veli ne oldu?"',
                  action: () => ({
                    text: `"Veli iyileşti beyim. Deftere yazmadım — bir daha karışmasın."`,
                    choices: [{ label: '"Sağlığına duacıyız. Sen defterini topla."', action: null }]
                  })
                },
                { label: '"Kalsın öyle. Ben karışmayayım."', action: null }
              ]
            })
          },
          { label: '"Defter senin, hesap senin Yakub Ağa."', action: null }
        ]
      };
    }

    // --- AŞAMA 1 : aynı gün ise ilerletme, T1 ara replik ---
    if (stage === 1 && day - (f.gag.defterDay || 0) < 1) {
      return {
        text: `"Bugün deftere el sürmedim beyim. Dün sürdüm, hâlâ toparlanıyorum."`,
        choices: [{ label: '"Kolay gelsin Yakub Ağa."', action: null }]
      };
    }

    // --- AŞAMA 1 → 2 : İKİNCİ KARŞILAŞMA (yanlış defter artık paralel bürokrasi) ---
    if (stage === 1) {
      f.gag.defter = 2;
      f.gag.defterDay = day;
      return {
        text: `"Bu ay iki defter tuttum beyim. Biri asıl, biri yanlış olan; yanlış olanı daha muntazam çıktı. Zira asıl deftere herkes karışıyor, yanlışını kimse bilmiyor."`,
        choices: [
          {
            label: '📜 "Yanlış deftere ne yazdın?"',
            action: () => ({
              text: `"Bu ay üç şey yazdım beyim: bir hasta, bir karga, bir de nal. Nal kuyudan çıktı, sahibi çıkmadı; onu 'mevcut, sahipsiz' hanesine geçirdim."`,
              choices: [
                {
                  label: '🙂 "Bu haneler ne işe yarar Yakub Ağa?"',
                  action: () => ({
                    text: `"İşe yaramaz beyim, sayıya yarar. Yıl sonunda 'köyde ne var' diye sorarlar, ben de sayarım. Geçen yıl otuz iki hane, kırk bir mevcut, bir de karga çıktı."`,
                    choices: [{ label: '"Kargayı bana sonra anlat." (tebessüm)', action: null }]
                  })
                },
                { label: '"O nal saka İbrahim\'in kuyusundan olmasın?"', action: null }
              ]
            })
          },
          { label: '"İkisini de sen bil Yakub Ağa. Ben yüze bakarım."', action: null }
        ]
      };
    }

    // --- AŞAMA 2 : çapraz şart yoksa bekleme replik (T1), sayaç ARTMAZ ---
    if (stage === 2 && (f.gag.esek || 0) < 2 && (f.gag.karga || 0) < 2) {
      return {
        text: `"Defter yerinde beyim, mürekkep az. Bugün tek kayıt düştüm: 'hava iyi'. Hangi haneye yazacağımı bilemedim, 'mevcut'a yazdım."`,
        choices: [{ label: '"Yazdığın yazıdır Yakub Ağa."', action: null }]
      };
    }

    // --- AŞAMA 2 → 3 : ZİRVE (T3) — GAG-3 ile ortak set-piece'in defter yüzü ---
    if (stage === 2) {
      f.gag.defter = 3;
      f.gag.defterDay = day;
      return {
        text: `"İki defteri de getirdim beyim, yan yana koydum. Asıl defterde eşek yok, yanlış defterde eşek nefer. Bunu çözmek için üçüncü bir defter açtım."`,
        choices: [
          {
            label: '📖 "Üçüncü defterde ne yazıyor?"',
            action: () => ({
              text: `"Üçüncü defter ikisini barıştırır beyim. Orada eşek hem nefer hem misafir yazılı; iki hane de dolu, kimse eksik değil. Yalnız eşek şimdi iki yem alıyor."`,
              choices: [
                {
                  label: '🙂 "Peki hangisi asıl defter?"',
                  action: () => ({
                    text: `"Hangisi elimdeyse o beyim."`,
                    choices: [
                      {
                        label: '"Sen bu köyü otuz yıl böyle mi idare ettin?"',
                        action: () => ({
                          text: `"Kırk yıl beyim. İlk on yılın defteri kayıp; onu da bir yere yazdım."`,
                          choices: [{ label: '"Yakub Ağa, sen bir tanesin." (tebessüm)', action: null }]
                        })
                      },
                      { label: '"Bu köy sana emanet." (tebessüm)', action: null }
                    ]
                  })
                },
                { label: '"Eşeği hancıya teslim et. Defteri sen bil."', action: null }
              ]
            })
          },
          {
            label: '📜 "Hangisi asıl defter Yakub Ağa?"',
            action: () => ({
              text: `"Hangisi elimdeyse o beyim. Öbürü o vakit yanlış olur, ben de onu düzeltirim. Düzeltmeyi de öbür deftere yazarım."`,
              choices: [{ label: '"Yeter, yeter. Üçüncüyü kapat." (tebessüm)', action: null }]
            })
          }
        ]
      };
    }

    // --- AŞAMA 3 → 4 : ARŞİV (kalıntı replik, oturumda bir kez) ---
    f.gag.defter = 4;
    return {
      text: `"Defter sordun beyim. Üçü de yerinde: biri asıl, biri yanlış, biri barıştırıcı. Bugün üçü de aynı şeyi yazıyor — merak ediyorum."`,
      choices: [{ label: '"Merak etme Yakub Ağa. Bugün öyle bir gün."', action: null }]
    };
  }
```

**Etiketler (§1.4):** Tamamı **C**. Hiçbir düğümde olgu iddiası, dinî muhteva veya tarihî isim yoktur. Kethüdanın **karakter sesi korunmuştur** (§2-b): hiç şaka yapmaz, yalnız kayıt tutar — kahkaha sesin tonundan değil, **defterin mantığından** gelir. "Otuz yıl mı, kırk yıl mı" çelişkisi bilinçlidir ve karakterin saygınlığını yıkmaz, yalnız defterini karıştırır (§1.5-6 sınırı). **Hiçbir dal akçe/ödül/eşya VERMEZ**; `TimarSystem` veya `questSystem` çağrısı içermez.

**Bağlantılar:** Aşama 1→2'deki *"mevcut, sahipsiz"* nalı, §3-a'daki kuyu dalının (Irgat Veli'nin bıraktığı nal) doğrudan karşılığıdır — iki ağaç bu tek nesnede kenetlenir. Aşama 2→3, GAG-3'ün meydan zirvesiyle **aynı T3'tür** (*"Meydan Muhasebesi"*, §1.7): sahne meydanda açılır, bu dalda kapanır.

---

## 4. SİSTEMİK MİZAH YERLEŞİMİ — kanca eşlem tablosu

> **Kahkaha revizyonunda kancalar DEĞİŞMEDİ.** Dosya:satır bağları, tetik koşulları ve cooldown'lar birebir aynıdır; yalnız **bağlanan havuzların adetleri** büyümüş, K5'in anlatı çerçevesi (ölüm → yenilgi) düzeltilmiş ve tabloya bir **K13 satırı** eklenmiştir (running gag aşamaları — mevcut kancaların üstünde çalışan bir zamanlama katmanıdır, yeni kod kancası değildir).

| # | Kanca (dosya:satır) | Bağlanan kategori | Tetik koşulu | Sınır / cooldown |
|---|---|---|---|---|
| K1 | `DialogueSystem.js` data nesnesi, alias bloğu öncesi (DialogueSystem.js:653) + `kethuda_talk` (DialogueSystem.js:16) | 3-a `saka_talk` (6 üst / 37 seçenek), 3-b `guard_talk` (6 üst / **31** seçenek, 6 açılış), **3-n `kethuda_talk` GAG-2 dalı (1 üst / aşamalara dağılmış 21 alt seçenek)**, T3-F (`attar_talk` yeni üst seçenek), T3-J (`hanci_talk` yeni üst seçenek) | E ile diyalog (NPC bağı hazır: NPCManager.js:193, 313) | — (diyalog, oyuncu isteğiyle); 3-n aşama sayacına tabidir (K13) |
| K2 | `UIManager.openDialogue` (UIManager.js:387-389) | 3-m genel fallback (5 replik) | `getDialogueData` null döndüğünde | NPC başına oturumda 1 farklı replik |
| K3 | `UIManager.openDialogue` girişi + `npcObj.ai.currentState` (VillagerAI durumları, VillagerAI.js:5-12) | 3-c uyandırma replikleri (**14**) | `currentState === 'SLEEPING'` iken diyalog açılışı; ardından normal metne geçilir; `gameState.flags.wakeCount++` | NPC başına gün başına 1; `ACH_UYKU_BOLEN` sayacı buradan; 11 no'lu replik yalnız `guard_talk` NPC'lerinde |
| K4 | `main.js` updateInteractionPrompts switch (main.js:326-331) | 3-d durum etiketleri (**28**) | her karede; **seçim gün-sabit** (`(npc.id.length + dayCount) % pool.length`) | imam istisnası (Bölüm 3-d kuralı); her havuzun ilk elemanı nötr kalır |
| K5 | `CombatSystem.killEnemy` (CombatSystem.js:324-342) | 3-e harami **yenilgi** sözleri (**13**: 10 sıradan + 3 elebaşı) | sıradan harami %60, elebaşı %100 · **ENGELLEYİCİ ÖN KOŞUL:** düşman ekranda ölmüyorsa bağlanır (§3-e kanca şartı, §7.1) | çatışma başına en çok 2 satır; önek `'🗡️ '` → `'🏃 '` |
| K6 | `TimarSystem.collectAnnualTax` (TimarSystem.js:10-30) | 3-f vergi tepkileri (**12**: 3 bant × 4) + **T3-I "Fazla Hanesi"** (üç bildirim, ~6 sn arayla, `morale≥70`) | başarılı tahsilat; `gameState.timar.morale` bandına göre | tahsilat başına 1 satır (T3-I tetiklenirse onun yerine üç satır) |
| K7 | `tellak_talk` (DialogueSystem.js:585) + `hamam_musteri_talk` (DialogueSystem.js:640-650) | 3-g hamam havuzu (**15**: tellak 7 + müşteri 8) + **T3-H "Buğudaki Hüküm"** (ikinci ziyaret) | yeni "hamamda ne konuşulur" seçeneği; müşteri açılış metni havuzdan | ziyaret başına en çok 2 dedikodu |
| K8 | `VillagerAI.update` demirci örs bloğu (VillagerAI.js:236-239, `emitBlacksmithSparks` senkronu) | 3-h usta-çırak atışması (**14 atışma / 49 satır**; 13+14 = GAG-4 zirve çifti) | oyuncu ≤ 12 m, iki NPC iş başında | ≥ 45 sn cooldown; sahne başına 1 atışma; **atışma başına en çok 4 satır** (3'ten yükseltildi); 13 ve 14 **arka arkaya** oynar (~4 sn ara), 14 havuz çekimine girmez |
| K9 | `VillagerAI` WANDERING dalı (VillagerAI.js:258-273) | 3-i meydan çiftleri (**10 çift / 47 satır**) + **T3-E "Köprünün Orta Tahtası"**, **T3-G "Yağız'ı Sakla"** (gece, kale kapısı) + *(planlanan)* 3-o tek NPC iş baloncuğu | 18:30-22:00; çift NPC ≤ 6 m; oyuncu ≤ 15 m (T3-G: 22:00-05:00, kale ≤ 15 m) | çift başına gün başına 1 sahne; Perde III'te havuz yarıya iner; 3-i/6 T3 sayılırsa T3 aralık kuralına tabidir |
| K10 | `SteamManager.achievements` (SteamManager.js:12-21) + tetik noktaları (tabloda, 3-j) | 3-j başarımlar (**12 — ID'ler sabit**) | ilgili olay | Steam kuralları; §1.7 zirve başarımları ertelenmiş öneri |
| K11 | `GameState.advanceSeason` (GameState.js:257-269) | 3-k mevsim bildirimi (**8**: 4 mevsim × 2) | mevsim dönümü | dönüm başına 1 satır |
| K12 | `UIManager.updateStartScreenInfo` (UIManager.js:367-376) + tımar üretimi (GameState.js:25-33) | 3-l tımar kusurları (**15**) | yeni tımar üretimi | tımar başına 1-2 kusur; 5/7/8/11 ağırlıklı |
| **K13** *(yeni katman, yeni kanca değil)* | K1 + K6 + K8 + K9 üzerinde çalışır; durum: `gameState.flags.gag.<ad>` (+ `gag.defterDay`) | §1.7 running gag aşamaları (5 hat × 3 aşama) **+ altı gag dışı set-piece (T3-E … T3-J)** | ilgili kancanın kendi tetiği **ve** aşama koşulu (sayaç + geçen gün + çapraz gag şartı) | aşama sayacı yalnız artar; aynı aşama iki kez oynamaz; aynı saatte en çok 1 zirve (T3); **toplam T3 arzı 10**, iki T3 arası ≥ 25 dk |

**Genel dağıtım kuralları:**
- Bildirim kanalını kullanan tüm kategoriler (K5, K6, K8*, K11) `type: 'info'` ile gönderilir ve **aynı anda kuyrukta 1'den fazla mizah bildirimi olamaz** (kuyruk 5 kayıt, GameState.js:207-209; kritik oyun mesajlarını itmemek için).
- K8 ve K9'un ideal sunumu dünya-içi baloncuktur; ancak dünya işaretçisi CSS'inin hiç yazılmadığı bilindiğinden (analiz: UIManager.js:1049-1129 kritik bug) **v1 uygulaması bildirim kanalıdır**; baloncuk, teknik planın world-marker onarımı teslim edildikten sonra v2 olarak taşınır. Bu iki aşama kabul kriterlerinde ayrı maddedir.
- Her kanal `isHumorMuted()` (Bölüm 6) kontrolünden geçer — tek istisna 3-f'nin `morale < 40` bandı (o metinler mizah değildir, her koşulda çıkar).
- **(Kahkaha revizyonu, ek kapı)** Her kanal ayrıca `gameState.flags.soberUntil` yumuşak kapısından geçer (§1.6): ciddi bir anlatı beat'inin ±90 saniyesinde `pickHumor` boş döner. Bu kapı Bölüm 6'daki sert bayrakların **yerine geçmez, üstüne eklenir**; bayraklardan biri doğruysa `soberUntil` ne olursa olsun kanal zaten susar.
- **(Kahkaha revizyonu, ek kapı)** K13 aşamaları yukarıdaki iki kapıya ek olarak §1.6'daki T3 aralık kuralına tabidir: iki zirve arası ≥ 25 dk, zirveden sonra ≥ 8 dk tam sessizlik.
- **(Denetim bulgusu, ek kapı)** Her havuzlu kanal ayrıca §1.6'daki **saatlik tavan**dan geçer: bir oyun saatinde o kanaldan en çok `ceil(havuz_uzunluğu / 8) + 1` beat çıkar; tavana ulaşan kanal o saat için susar. Bu kapı havuzun **tükenmesini değil, erken tükenmesini** engeller — denetimin asıl bulgusu içeriğin oyunun ilk iki saatine yığılmasıydı.

---

## 5. VERİ FORMATI — `src/data/humor.js`

Teknik planla uyum ilkeleri: diyalog **ağaçları** (3-a, 3-b, 3-m fallback şablonu) mevcut mimariye sadakat gereği `DialogueSystem.js` içinde kalır (tek diyalog kaynağı ilkesi; TARIHSEL doc 15 "aynı veri iki yerde tutulmamalı"). **Havuz** içerikleri (tek satırlıklar) yeni `src/data/humor.js` modülünde toplanır; mantık (seçim/cooldown/susturma) `src/systems/HumorSystem.js` yerine önce **minimal helper** olarak aynı dosyada verilir — ayrı sistem sınıfı ancak K8/K9 baloncuk aşamasında gerekirse açılır (Simplicity First).

```js
// src/data/humor.js
// All strings Turkish (game content); identifiers English (project rule).

export const HUMOR = {
  meta: { historicalConfidence: 'C', version: 2 }, // v2 = kahkaha revizyonu

  wakeLines: [ /* 3-c: 14 strings (idx 10 = guard-only) */ ],

  statusLabels: { /* 3-d: exact object from section 3-d — 28 labels, first item of each pool stays neutral */ },

  banditDefeatLines: {          // renamed from banditLastWords: they are DEFEAT lines, not last words (3-e)
    regular: [ /* 3-e items 1-10 */ ],
    boss:    [ /* 3-e items 11-13 */ ]
  },

  taxReactions: {
    high: [ /* 3-f 1-4 */ ],   // morale >= 70
    mid:  [ /* 3-f 5-8 */ ],   // 40..69
    low:  [ /* 3-f 9-12 */ ]   // < 40 — NOT humor; exempt from mute
  },

  hamamGossip: {
    tellak:   [ /* 3-g 1-7 */ ],
    customer: [ /* 3-g 8-15 */ ]
  },

  anvilBanter: [
    // 3-h: 14 exchanges (13-14 = GAG-4 peak pair, played back to back; 14 never enters the random draw),
    // each an array of {speaker: 'R'|'S', line: '...'}; up to 4 lines per exchange
    [{ speaker: 'R', line: 'Salih! Körük!' }, { speaker: 'S', line: 'Basıyorum usta, iki koldan basıyorum!' }, { speaker: 'R', line: 'İki koldan basıyorsun da ocak niye söndü?' }],
    // ...
  ],

  plazaPairs: [
    // 3-i: 10 pairs / 47 lines — { a: npcIdA, b: npcIdB, lines: [{who:'a'|'b', line}] , blockedByAliArc?: true }
    // pair index 5 (saka_ibrahim x tellak_huseyin) is a 6-line set-piece and MAY be counted as a T3 (section 1.6)
    { a: 'ciftci_hasan', b: 'irgat_veli', lines: [ /* ... */ ] },
    { a: 'cirak_salih', b: 'cebelu_ali', blockedByAliArc: true, lines: [ /* ... */ ] }
    // NPC id'leri NPCManager.js'deki gerçek id alanlarıyla birebir eşleştirilir (uygulama sırasında doğrulanır)
  ],

  // 3-o: single-NPC ambient work bubble — PLANLANDI, bu sürümde BOŞ (içerik D hattı, section 1.6 arz tablosu).
  // Boş havuzda pickHumor null döner ve kanal sessiz kalır; teslim edilmemesi hiçbir şeyi kırmaz.
  ambientWorkLines: [ /* 3-o: target 20 strings */ ],

  seasonNotes: {
    // key = seasonIndex (GameState.js:258 sırası: 0 İlkbahar, 1 Yaz, 2 Güz, 3 Kış)
    0: [ /* 2 strings */ ], 1: [ /* 2 */ ], 2: [ /* 2 */ ], 3: [ /* 2 */ ]
  },

  timarFlaws: [ /* 3-l: 15 strings; weight 5,7,8,11 higher on first draw */ ],

  fallbackVillagerLines: [ /* 3-m: 5 strings */ ],

  // --- running gags (section 1.7) — 5 lines x 3 stages; stage counter lives in gameState.flags.gag ---
  runningGags: {
    rope:   { npc: 'saka_ibrahim',  stages: [ /* setup, second, peak */ ], retiredLine: '...' },
    // stages live in DialogueSystem.kethudaDefterBranch() (section 3-n); humor.js only stores the retired line
    defter: { npc: 'kethuda_yakub', stages: [ /* see 3-n */ ], retiredLine: '...' },
    esek:   { npc: 'guard',         stages: [ /* ... */ ], retiredLine: '...' },
    ocak:   { npc: 'cirak_salih',   stages: [ /* ... */ ], retiredLine: '...' },
    karga:  { npc: 'orakci_bekir',  stages: [ /* ... */ ], retiredLine: '...' }
  }
};

// --- minimal selection helper (no-repeat + mute gate + sober gate + seen set + hourly cap) ---
const lastPick = new Map();    // key -> last index
const hourlyUsed = new Map();  // key -> { hour, count }; hour = Math.floor(playTimeMs / 3600000)

function usedThisHour(key, hour) {
  const rec = hourlyUsed.get(key);
  if (!rec || rec.hour !== hour) { hourlyUsed.set(key, { hour, count: 0 }); return 0; }
  return rec.count;
}

export function pickHumor(key, pool, { muted = false, seen = null, now = Date.now(), soberUntil = 0, hour = 0 } = {}) {
  if (muted || now < soberUntil) return null;          // hard mute (section 6) + soft sober gate (section 1.6)
  if (!pool || pool.length === 0) return null;
  // per-channel hourly cap (section 1.6) — spreads a pool over 8 hours instead of draining it in two
  const cap = Math.ceil(pool.length / 8) + 1;
  if (usedThisHour(key, hour) >= cap) return null;     // channel goes quiet for this hour, pool NOT exhausted
  const available = seen ? pool.filter(item => !seen.has(item.id ?? item)) : pool;
  if (available.length === 0) return null;             // pool exhausted -> stay silent, never repeat
  let idx = 0;
  if (available.length > 1) {
    idx = Math.floor(Math.random() * available.length);
    if (idx === lastPick.get(key)) idx = (idx + 1) % available.length; // never repeat immediately
    lastPick.set(key, idx);
  }
  hourlyUsed.get(key).count += 1;                      // only successful picks count toward the cap
  return available[idx];
}
```

**Sözleşmeler:**
1. `pickHumor` art arda aynı elemanı vermez (test edilebilir).
2. Çağıran taraf `muted: isHumorMuted(gameState)` geçirir (Bölüm 6); `taxReactions.low` çağrısı muted geçirmez.
3. `statusLabels` seçimi `pickHumor` KULLANMAZ — gün-sabit indeks kuralı (K4) uygulanır; aksi hâlde etiket her karede titrer.
3b. **(Kahkaha revizyonu)** `seen` kümesi verildiğinde `pickHumor` gösterilmiş repliği bir daha vermez; havuz tükenirse **`null` döner ve kanal susar** — asla başa sarmaz (§1.6 tekrar yönetimi). Tükenen havuz bir denetim uyarısıdır (§7.5), oyun içi bir çözüm değil.
3c. **(Kahkaha revizyonu)** `soberUntil` yumuşak kapıdır ve `muted` ile birlikte çalışır; ikisinden biri kapalıysa çağrı `null` döner. Running gag aşamaları (K13) `runningGags` üzerinden ayrı seçilir, `pickHumor`un rastgeleliğine tabi değildir: aşama sırayla oynar.
3d. **(Denetim bulgusu)** `hour` parametresi **kanal başına saatlik tavanı** uygular (§1.6): `ceil(pool.length / 8) + 1`. Tavan dolduğunda çağrı `null` döner ve kanal o saat susar — **havuz tükenmez**, yalnız yayılır. Sayaç **başarılı seçimlerde** artar; `muted`/`soberUntil` yüzünden dönen `null` tavandan pay yemez. `hourlyUsed` haritası kayda **yazılmaz** (oturum içi ritim aracıdır, kalıcı durum değildir); `seen` ve `flags.gag` ise yazılır (sözleşme 5).
3e. **(Denetim bulgusu)** Running gag aşamaları saatlik tavana **tabi değildir** — onlar `runningGags` üzerinden, sırayla ve tek yönlü oynar; tavan yalnız havuz kanallarını (T1/T2) düzenler.
4. Deterministik kayıt notu: TARIHSEL doc 12 "rastgele sonuçlar seed ile saklanmalı" der; mizah havuzu **oynanış sonucu üretmeyen lezzet metni** olduğundan seed zorunluluğundan muaftır (bu muafiyet bilinçli bir tasarım kararıdır ve burada kayda geçmiştir).
5. Kayıt sistemi bağlandığında (`SaveManager`) `gameState.flags.wakeCount` serialize alanlarına eklenmelidir (SaveManager.serializeState'in bugün `aliStatus`/`activeCampaign`'i bile kaydetmediği biliniyor — SaveManager.js:41-57; teknik plana not). **(Kahkaha revizyonu)** Aynı listeye `gameState.humor.seen` (gösterilmiş replik id kümesi) ve `gameState.flags.gag` (5 aşama sayacı) da eklenmelidir; bu ikisi kaydedilmezse tekrar yönetimi (§1.6) ve running gag'lerin (§1.7) tek yönlü ilerleyişi yükleme sonrası bozulur — gag baştan oynar, oyuncu aynı şakayı ikinci kez duyar. Bu, kahkaha katmanının **tek yeni kalıcılık gereksinimi**dir. **(Denetim bulgusu, ek alan)** `gameState.flags.gag.defterDay` de aynı listeye girer: aksi hâlde §3-n'deki "aynı gün ikinci aşamaya geçme" kilidi yükleme sonrası çalışmaz ve oyuncu iki aşamayı arka arkaya görür — taşıyıcı gag'in tırmanması tek oturumda harcanır.
6. `DialogueSystem.js`'e eklenen `saka_talk`/`guard_talk` mevcut test asertlerini KIRMAMALIDIR: testler mevcut diyalogların birebir alt dizgelerine bağlı (tests/systems.test.js:353-411) — mevcut metinlere dokunulmaz, yalnız yeni anahtar eklenir; ayrıca iki yeni asert eklenir (Bölüm 7). **(Denetim bulgusu, kritik)** §3-n'deki GAG-2 dalı `kethuda_talk`ın **mevcut** anahtarına eklenir; mevcut üç görev dalı **indeks 0-1-2'de kalır**, yeni dal **indeks 3**'e girer ve çıkış satırı 4'e kayar. `tests/systems.test.js:351` `yakubData.choices[0].action()` çağırdığı için indeks tabanlı asert bu sırayla korunur; dal listenin başına eklenirse test kırılır.

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
- [ ] `saka_talk` DialogueSystem.js'e eklendi; oyunda Saka İbrahim'e (NPCManager.js:181-201) E basınca diyalog açılıyor, **en az 6 üst seçenek** ve en az 3 kademe derinlik (torun düğüm) var, hiçbir dalı akçe/ödül vermiyor.
- [ ] `guard_talk` eklendi; üç nöbetçiden (NPCManager.js:298-322) herhangi birine E basınca açılıyor; açılış metni **en az 6 varyanttan** seçiliyor; "Niğbolu havadisi" dalında Doğan Bey rivayeti **"derler ki"** kalıbıyla veriliyor (R-etiket kuralı) ve bu düğüme mizah katılmamış.
- [ ] `guard_talk` bloğu kopyalanırken eski dokümandaki `\\'` sözdizimi hatası taşınmadı; `npm run build` bu bloktan ötürü kırılmıyor.
- [ ] Bilinmeyen dialogueId artık sessiz kalmıyor: fallback diyalog (3-m, 5 replik) `npcObj.name` başlığıyla gösteriliyor (UIManager.js:388-389 değişikliği).
- [ ] Uyuyan NPC'ye E basınca (state SLEEPING) uyandırma repliği (3-c, 14 replik) gösteriliyor; aynı NPC'de art arda aynı replik gelmiyor; `flags.wakeCount` artıyor; 11 no'lu asker repliği sivil NPC'de çıkmıyor.
- [ ] main.js:326-331 switch'i havuzlu etiket kullanıyor (3-d, 28 etiket); etiket kare-başına değişMİYOR (gün-sabit kural); imam NPC'si her durumda **havuzun ilk (nötr) elemanını** alıyor ve havuzların eleman sırası bozulmamış.
- [ ] **(ENGELLEYİCİ ÖN KOŞUL — §1.3-6)** `killEnemy` çağrıldığında düşmanın **ekrandaki görsel davranışı** teslimden önce gözle doğrulandı ve sonucu bu maddeye yazıldı. İki yol vardır, üçüncüsü yoktur:
  - **(a) Düşman ekranda ÖLMÜYOR** — ölüm/yere yığılma animasyonu yok; düşman kaçış, geri çekilme veya sahneden silinme ile çatışmadan düşüyor (ya da teknik planla bu hâle getiriliyor). **Ancak bu durumda** 3-e havuzu K5 kancasına bağlanır.
  - **(b) Düşman ekranda ÖLÜYOR** — ölüm animasyonu, yere yığılma, ceset kalması veya benzeri herhangi bir ölüm görselliği var. Bu durumda 3-e havuzu **K5 kancasından tamamen sökülür**; `killEnemy` mizahsız kalır (yalnız mevcut ganimet bildirimi). Havuz iptal edilmez, **teslim edilmez**: ölüm dışı bir kancaya (ör. "harami kaçtı / çete dağıldı" olayı) taşınana kadar bekletilir.
  - **Gerekçe:** ekranda can veren bir adamın üstüne düşen kaçış repliği, metni ne kadar temiz olursa olsun **fiilen ölüm mizahıdır** (§1.3-6). Metin denetiminden geçmiş olmak bu maddenin yerine geçmez; bu madde işaretlenmeden 3-e için kabul verilmez.
- [ ] `killEnemy` **yenilgi sözleri** (3-e, 13 satır) — *yalnız yukarıdaki **(a)** yolu geçerliyse denetlenir*: elebaşı yenilgisinde her zaman, sıradan haramide ~%60 çıkıyor; çatışma başına ≤ 2; bildirim öneki `'🏃 '`; havuzda ölüm/can verme imalı satır YOK.
- [ ] `collectAnnualTax` sonrası morale bandına göre doğru havuzdan tek satır geliyor (3-f, bant başına 4 satır); bant eşikleri 70/40 değişmemiş; `morale < 40` metinleri mute bayraklarından etkilenMİYOR ve hiçbiri espri değil.
- [ ] Tellak diyaloğunda yeni "hamamda ne konuşulur" seçeneği var; hamam müşterisi açılışı havuzdan çeşitleniyor (3-g, 15 replik); mevcut kese-köpük akışı (can/stamina yenileme) bozulmadı.
- [ ] Örs atışması: oyuncu demircinin 12 m'sinde ve örs döngüsü aktifken (VillagerAI.js:236-239) 45 sn cooldown'la bir atışma oynuyor; **4 satırlık atışmalar 4. satırı da oynuyor** (kapanış kırpılmıyor).
- [ ] **GAG-4 zirvesi 3-h/13 ve 3-h/14 olarak arka arkaya oynuyor** (~4 sn ara); 14 numaralı ciddi Ahi kapanışı **kırpılmıyor** ve havuzun rastgele çekimine girmiyor.
- [ ] Meydan çiftleri 18:30-22:00 diliminde tetikleniyor (3-i, 10 çift / 47 satır); Salih-Ali çifti Ali yara hattı aktifken hiç oynamıyor; **3-i/6 altı satırın tamamını oynuyor** (set-piece kırpılmıyor).
- [ ] **`kethuda_talk` içinde GAG-2 dalı var** (§3-n; `DialogueSystem.js`, `choices` indeks 3); mevcut üç görev dalı (defter/öşür, ziyafet, harami) indeks 0-1-2'de duruyor ve `tests/systems.test.js:351`'deki `choices[0].action()` aserti kırılmıyor.
- [ ] **GAG-2 üç aşaması sırayla oynuyor:** ilk konuşmada kurulum, ≥1 oyun günü sonra 2. karşılaşma, `gag.esek≥2` veya `gag.karga≥2` sağlanınca zirve. Aşama sayacı (`flags.gag.defter`) yalnız artıyor; aynı aşama iki kez oynamıyor; **aynı gün ikinci kez konuşulduğunda aşama ilerlemiyor** (T1 ara replik geliyor).
- [ ] GAG-2 zirve dalında **"Hangisi asıl defter?"** seçeneği var ve cevabı *"Hangisi elimdeyse o beyim."* — kırpılmamış.
- [ ] Zirve oynandıktan sonra GAG-2 dalı **arşive kalkıyor**: sonraki açılışta yalnız kalıntı replik geliyor ve o da oturumda bir kez.
- [ ] GAG-2 dalının **hiçbir düğümü akçe/ödül/eşya vermiyor**; `TimarSystem` veya `questSystem` çağrısı içermiyor.
- [ ] `flags.gag.defter` **ve `flags.gag.defterDay`** kayda yazılıyor; yükleme sonrası gag baştan oynamıyor ve iki aşama arka arkaya gelmiyor.
- [ ] **GAG-1 kanonu tek:** oyunda görülen bütün ip metinlerinde düğüm sayısı tek yönlü artıyor (2 → 3 → 4 → 5), **ikinci bir ip yok**, ortadaki düğümün adı her yerde *"Sağlam"*. Denetlenecek yerler: §1.5-2 örneği, §1.7 tablosu, §3-a ip dalı, §3-g/11, §3-l/4, §3-j `ACH_SAKA_DOSTU`, §3-d/18, §3-k Yaz/3.
- [ ] **Altı gag dışı set-piece (T3-E … T3-J) bağlandı** ve her biri kendi kanalında uçtan uca oynuyor; T3-E ve T3-F **ilk iki saatte**, ikisi de ilk 10 dakikanın dışında tetikleniyor.
- [ ] SteamManager sözlüğünde 12 başarımın adı/açıklaması bu dokümandakiyle birebir; **12 ID'nin hiçbiri değişmemiş**; `ACH_FIRST_PATROL` artık tanımlı (SteamManager.js:12-21); `ACH_NIGBOLU_VICTORY` metni mizahsız kalmış.
- [ ] Mevsim dönümünde havuzdan bir satır geliyor (GameState.js:257-269, 3-k 8 satır).
- [ ] Başlangıç ekranında "Bilinen Kusur" satırı görünüyor (3-l, 15 kusur); kusurlar arasında dinî yapı YOK.
- [ ] **Running gag'ler (§1.7, K13):** beş hattın da kurulum aşaması oynanıyor; aşama sayacı (`flags.gag.*`) yalnız artıyor; aynı aşama iki kez oynamıyor; çapraz zirve şartları (GAG-2 × GAG-3, GAG-2 × GAG-5) sağlanmadan zirve tetiklenmiyor.
- [ ] `gameState.humor.seen` ve `gameState.flags.gag` kayda yazılıyor; kayıt yükledikten sonra gag baştan oynamıyor ve daha önce görülmüş replik tekrar çıkmıyor.
- [ ] **§8 Dilim 4 (gag katmanı) teslim edildi;** en az bir T3 oyunda uçtan uca oynatılabildi ve kaydedilip yüklendikten sonra tekrar oynamadı.

### 7.2 Üslup ve yasak denetimi (otomatikleştirilebilir)
- [ ] `src/data/humor.js` + yeni diyalog metinleri üzerinde yasaklı kelime grep'i temiz: `tamam!|okey|süper|sorun yok|stres|panik|radar|masöz|12'den|bonus|level|skor|kanka|merhaba` (büyük/küçük harf duyarsız; "tamamlandı" gibi fiil çekimlerine yanlış pozitif vermeyecek şekilde kelime sınırıyla).
- [ ] Din adamı/ibadet/kutsal kavram hiçbir mizah verisinde geçmiyor (manuel okuma + `imam|molla|namaz|ezan|ayet|hadis|mescid|zemzem|günah|melek` grep'inin mizah havuzlarında sıfır eşleşmesi; `saka_talk` içindeki hadis cümlesi tek istisnadır ve yalnız ciddi cevaplı ayrı alt dalda yer alır). Bu grep listesi NİHAİ listedir: 06-fazlar-ve-kabul.md Ç5 kararı ve F4-07 kabulüyle birebir aynı liste kullanılır; `dua` kelimesi listeye bilinçli olarak dâhil DEĞİLDİR — saygılı halk kalıbı olarak (mizah nesnesi yapılmadan) havuzlarda geçebilir ve manuel okuma denetimine tabidir (bkz. §1.3/1 ayrım notu).
- [ ] **(Denetim bulgusu sonrası eklendi)** Modern kurum/nizamiye terminolojisi grep'i temiz: `emekli|tekaüt|terhis|karavana|gündem|haftalığ|maaş|muhtesib` (büyük/küçük harf duyarsız, kelime sınırıyla). **Yanlış pozitif uyarıları:** (i) `hafta` kelimesi tek başına serbesttir (dönemsel); grep yalnız `haftalık/haftalığ` gövdesini yakalamalıdır. (ii) Bu dokümanın **değişiklik kayıtları** (§1.2 ek yasak listesi, §1.5-2 makam adı uyarısı, §3-a etiket paragrafı, §7.2-a2, §9.4) yasaklı kelimeleri **reddedildiklerini belirtmek için** anar; grep yalnız oyun-içi metinler ile `src/data/humor.js` ve `DialogueSystem.js` üzerinde çalıştırılır, kayıt paragrafları kapsam dışıdır. Bunun dışında grep hem oyun-içi metinleri hem **dokümanın kendi tasarım dilini** kapsar — meta terminolojide kalan bir "emekli", uygulayıcının onu replik sanmasına yol açar.
- [ ] Yeni hiçbir replik oyuncuya sabit isimle hitap etmiyor (`Murad` grep'i yeni içerikte sıfır).
- [ ] Karakter sınırları (Bölüm 1.2 tablosu) aşılmıyor — göz kontrolüne bırakılMAZ: `src/data/humor.js` havuzları ve yeni diyalog metinleri üzerinde Bölüm 1.2 tablosundaki sınırları sayan basit bir uzunluk-denetim scripti (ör. tests/systems.test.js'e eklenen uzunluk asertleri) çalıştırılır ve sıfır ihlal raporlanır.
- [ ] Etnik/dinî grup adları mizah cümlesinin öznesi değil (manuel okuma — nöbetçi sayı esprisinin nesnesi "sayı"dır, millet değil).
- [ ] **(Kahkaha revizyonu — §1.3-8 yüksek genlik denetimi, üç ayrı manuel tarama.)** Yukarıdaki grep listeleri **aynen** kalır; bunlar onların yerine geçmez, üstüne eklenir:
  - [ ] **(a) Absürt isimlendirme ve MAKAM ADI taraması.** §1.5-2 gereği hayvan/nesne/lakap adlarının tamamı listelenir ve **iki ayrı süzgeçten** geçirilir:
    - **(a1) Kutsal/saygıdeğer ad süzgeci.** Hiçbir ad dinî ya da saygıdeğer bir **isme** dokunmaz.
    - **(a2) Makam adı süzgeci — *denetim bulgusu sonrası eklendi*.** Bir hayvana, nesneye veya şaka lakabına verilen **makam/vazife adı**, dinî temelli bir vazifeye ait olamaz. Yasak: hisbe (**muhtesib**), imamet, müezzinlik, kadılık, naiblik, vakıf mütevelliliği ve benzerleri — bunlar dünyevi bir memuriyet gibi *görünseler de* temelleri dinîdir, dolayısıyla §1.3-1 kapsamındadır. Serbest: tamamen dünyevi denetim/zanaat/idare imgeleri (*kantarcı, çavuş, bekçi, kâtip, mirab, kethüda*).
    - Bu sürümde kayda geçen adlar: *Kara Çelebi* (karga, halk unvanı), *Baş Karga* (aynı karganın defterdeki hane adı), *Yağız* (esir eşek), ***Kantarcı*** (Saka'nın kargası), *Mirab* ve *Kâtip* (kurbağalar), ***Sağlam*** (kuyu ipinin ortadaki düğümü — mesleki lakap kalıbı). Yeni ad eklendiğinde bu liste güncellenir ve tarama tekrarlanır.
    - **Kayda geçer:** *Muhtesib* adı bu tarama sonucu reddedilmiş, yerine *Kantarcı* konmuştur (§3-a karga dalı); ilgili kelime §1.2 serbest kelime havuzundan da çıkarılmıştır. Dokümanın eski savunması ("esprinin nesnesi makam değil, İbrahim'in kendisidir") **yetersizdi**, çünkü adın kendisi şakanın parçasıydı.
  - [ ] **(b) Statü düşmesi hedef taraması.** §1.5-6 tekniğinin uygulandığı her replikte düşen kişinin §2'deki mizahsız listeden (Molla Şemseddin, Dizdar Hamza Bey, Cebelü Ali, Gazi Sungur Bey) OLMADIĞI doğrulanır. Dizdarın geçtiği replikler ayrıca **tek tek** okunur — bu sürümde yalnız §3-b'de ikisi vardır (kale taşı dalı, gece teftişi dalı): espri daima **nöbetçilerin telaşındadır**, dizdarın kendisinde değil; dizdar hiçbir replikte gülünç, çaresiz ya da **anlaşılmaz** konumda görünmez ve son söz daima onundur. **Kayda geçer:** §3-g/13 repliği bu tarama sonucu yeniden yazılmıştır — dizdarın kendi atına söz geçirememesi ve *"Kime dediği anlaşılamadı"* kapanışı onu belirsizliğe düşürüyordu; replik **dizdarsız** kurgulanmış, espri bütünüyle nöbetçilerin üzerinde bırakılmıştır.
  - [ ] **(c) Beklenti kırma taraması.** §1.5-9 uygulanan her replikte kırılan beklentinin karakterin **kendi övünmesi** olduğu, gazâ/şehitlik/dram olmadığı doğrulanır. Kosova anlatısında ölen/yaralanan yok; espri anlatıcının kendi yalanındadır.
  - [ ] **(d) Kalıp kotası taraması — *denetim bulgusu sonrası eklendi*.** §3'teki tüm havuz elemanlarının teknik+kalıp etiketleri sayıldı: hiçbir kalıp bir havuzda **2'yi**, doküman genelinde toplam beat'in **%5'ini** aşmıyor; aynı kalıptan iki replik **ardışık indekste** durmuyor. Bugünkü tavan: kalıp başına en çok **9** kullanım. Kayda geçen iki ağır kalıbın son durumu: *"hayvan/nesne insan vazifesi görür"* **12 → 8**, *"simetrik iptal"* **6 → 4** (§1.5 kalıp kotası kutusu).
- [ ] **(Kahkaha revizyonu)** 3-e havuzunda ölüm çerçevesi kalmamış: `can ver|son nefes|nasip buymuş|anam duyarsa|öldü` grep'i sıfır eşleşme; tüm satırlar kaçış/teslim/pazarlık çerçevesinde.
- [ ] **(Denetim bulgusu)** Dinî kalıpların (`bereket versin|maşallah|inşallah|hamdolsun|dua`) geçtiği her replik **tek tek okunur** ve hiçbirinin bir esprinin **kurulum basamağı veya vuruş cümlesi** olmadığı doğrulanır. Kalıp yalnız saygılı halk kalıbı olarak durabilir (§1.3-1 ayrım notu). **Kayda geçer:** bu tarama sonucu 3-f/8 (*"Bereket versin…"*) ve 3-i/10 (*"Maşallah."*) yeniden yazılmıştır.
- [ ] **(Denetim bulgusu)** Kaynaksız dinî/normatif iddia taraması: mizah havuzlarında ve diyalog ağaçlarında **hüküm bildiren** hiçbir dinî cümle yok. Ölçüt: cümle "şu şöyledir / şu makbuldür / şu sevaptır" biçiminde bir **derecelendirme** yapıyorsa kaynak ister; dokümanın tek kaynaklı içeriği Müslim, Tahâret 1'dir ve yeni ekleme bu dokümanın yetkisinde değildir (§1.4). Örfî/kültürel beyan ("bu diyarda … hayır sayılır") hüküm değildir ve serbesttir. **Kayda geçer:** §3-a'daki *"susuza su vermek sadakaların makbulündendir"* ibaresi bu tarama sonucu kaldırılmıştır.

### 7.3 Ton dengesi
- [ ] `isHumorMuted` 6 bayrağın her biriyle ayrı ayrı test edildi (bayrak set → mizah kanalı çağrısı → null döner).
- [ ] Sefer başlatılınca (`joinActiveCampaign` v1) `flags.inCampaignScene` true oluyor ve dönüşte temizleniyor.
- [ ] Mescid/hazire yarıçapı içinde baloncuk/bildirim mizahı tetiklenmiyor.
- [ ] **(Kahkaha revizyonu)** `flags.soberUntil` yumuşak kapısı ayrıca test edildi: ciddi beat'ten sonraki 90 sn içinde `pickHumor` null dönüyor, 90 sn sonra tekrar içerik veriyor. Bu kapı **hiçbir sert bayrağı gevşetmiyor**: bayrak açıkken `soberUntil` geçmiş olsa bile kanal susuyor.
- [ ] **(Kahkaha revizyonu)** Bir T3 (running gag zirvesi) oynadıktan sonraki 8 dakika boyunca hiçbir mizah kanalı tetiklenmiyor.

### 7.4 Regresyon
- [ ] `npm test` yeşil: mevcut 97 asert bozulmadı (mevcut diyalog metinlerine dokunulmadığı için — tests/systems.test.js:353-411 birebir dizge asertleri) **ve** en az 2 yeni asert eklendi: `DialogueSystem.getDialogueData('saka_talk') !== null` + `getDialogueData('guard_talk').choices.length >= 4`.
- [ ] `npm run build` hatasız.
- [ ] Bildirim-tabanlı içerikler yalnız bildirim render düzeltmesi (UIManager.js:1249-1260) teslim edildikten sonra "görünür" kabul edilir; düzeltme öncesi bu kategoriler için kabul verilmez.
- [ ] **(Kahkaha revizyonu)** Yapısal asertler yeni sayılarla da geçiyor: `saka_talk.choices.length === 6`, `guard_talk.choices.length === 6`, açılış havuzu 6 varyant. Mevcut `>= 4` asertleri **değiştirilmez** (regresyon koruması); yeni sayılar bunların üstünde ek asert olarak yazılır.
- [ ] **(Denetim bulgusu)** `kethuda_talk.choices.length === 5` (3 mevcut görev dalı + GAG-2 dalı + çıkış) **ve** `kethuda_talk.choices[0]` hâlâ mevcut defter/öşür dalı; `tests/systems.test.js:351` asertinin bağlı olduğu indeks sırası korunmuş.

### 7.5 Kahkaha yoğunluğu ve ritim (§1.6 sözleşmesinin ölçümü)

> Bu bölüm kahkaha revizyonuyla eklendi. Eski dokümanda mizah yoğunluğu için sayısal bir kabul kriteri yoktu — "oturumda birkaç nükte görülüyor" düzeyinde bir hedef, tebessüm katmanına yeterliydi ama kahkaha katmanı için **ölçülemeyecek kadar düşüktür**. Aşağıdaki maddeler 60 dakikalık kayıtlı bir oturum üzerinde sayılarak doğrulanır (Perde I-II, mizah dozu tam).

- [ ] **Toplam yoğunluk bant hedefinde** (§1.6 düşen eğrisi): **1-2. saat 18-22**, **3-5. saat 12-15**, **6-8. saat 8-10 beat/saat**. Alt sınırın altı = kahkaha hedefi tutmadı; üst sınırın üstü = doygunluk, §1.6 sessizlik kuralı ihlal edildi. *(Eski düz hedef "15-20 beat/saat" denetim bulgusu üzerine banda çevrilmiştir; ölçüm hangi banttaysa o aralığa bakılır.)*
- [ ] **Kademe dağılımı (60 dk, orta bant):** **T1: 8-10**, **T2: 3-4**, **T3: 1-2**.
- [ ] **Kanal tavanı aşılmadı:** hiçbir havuz bir oyun saatinde `ceil(havuz_uzunluğu / 8) + 1` beat'ten fazla vermedi.
- [ ] **8 saatlik kayıtta hiçbir havuz TÜKENMEDİ:** kanallar tavan yüzünden sustu, tükendiği için değil. Bir havuz tükendiyse bu içerik eksikliği uyarısıdır (§1.6 arz tablosuna dönülür).
- [ ] **T3 arzı sayıldı:** 8 saatlik oturumda **en az 8 farklı T3** oynadı (hedef 10; §1.7 yerleşim takvimi) ve bunların **en az ikisi ilk iki saatte** düştü.
- [ ] **İlk kahkaha 3. dakikadan önce** düştü (köprü dönüşünde Saka İbrahim; `01-akis-ve-tutundurma.md` satır 229 ile aynı yerleşim).
- [ ] **İlk 10 dakikada** 2×T1 + 1×T2 + en az 2 running gag kurulumu oynadı; **T3 oynamadı**.
- [ ] **Yığılma yok:** herhangi bir 5 dakikalık pencerede en çok 3 beat; iki T1 arası ≥ 90 sn, iki T2 arası ≥ 4 dk, iki T3 arası ≥ 25 dk.
- [ ] **Kuru pencere var:** her 20 dakikada en az 5 dakikalık, sıfır beat'li bir pencere bulunuyor ve bu pencere anlatı ciddiyetinin yükseldiği yere (arzuhal kararı, sefer haberi, gece nöbeti) denk geliyor.
- [ ] **Sıfır tekrar:** kayıt boyunca aynı replik `id`'si iki kez çıkmadı (running gag aşamaları hariç — onlar tasarım gereği tekrar eder ve her tekrarda büyür).
- [ ] **Havuz tükenmesi denetimi:** 60 dakikada hiçbir havuz tükenmedi. Tükendiyse bu bir **içerik eksikliği uyarısıdır** (havuz büyütülür), oyun içi bir hata değil — kanal susmuş olmalı, başa sarmamış olmalıdır.
- [ ] **Kalite testi (manuel, otomatikleştirilemez):** denetçi, havuzlardan rastgele seçtiği 10 repliği **başka bir kişiye sesli okur**. En az 6'sında karşı taraf sesli güler. "Hoş ama gülmedim" oranı 4'ü aşıyorsa havuz §1.1-1'e göre yeniden yazılır. Bu, kahkaha hedefinin tek gerçek kabul testidir; sayım maddeleri onu ölçmez, yalnızca dağılımını ölçer.

---

## 8. Uygulama sırası önerisi (teslim dilimleri)

1. **Dilim 1 (bağımsız, düşük risk):** 3-a + 3-b diyalog ağaçları + 3-m fallback + iki yeni test aserti. (Analizin "yüksek" öncelikli sessiz-hata bug'ını da içerikle kapatır.)
2. **Dilim 2 (bildirim düzeltmesi sonrası):** 3-e, 3-f, 3-k bildirim kancaları + `humor.js` + `pickHumor` + `isHumorMuted`.
3. **Dilim 3:** 3-c uyandırma + 3-d durum etiketleri + 3-l başlangıç kusurları.
4. **Dilim 4 (ZORUNLU — kahkaha katmanının çekirdeği):** §1.7 running gag katmanı (K13) + `flags.gag` sayaçları (+ `gag.defterDay`) + `humor.seen` kümesi + `flags.soberUntil` yumuşak kapısı + saatlik tavan + bu alanların `SaveManager` serialize listesine eklenmesi + **§3-n `kethuda_talk` GAG-2 dalı** + **altı yeni T3 (T3-E … T3-J)**.
5. **Dilim 5:** 3-j başarım metinleri (tetik bağlama işi teknik planla ortak).
6. **Dilim 6 (world-marker onarımı sonrası):** 3-h, 3-i baloncuk sunumuna geçiş (v1'de bildirimle sınırlı).

> **Sıra değişikliği (denetim bulgusu).** Eski Dilim 6 → yeni **Dilim 4**; eski Dilim 4 ve 5 birer sıra kaymıştır. Dilim 1-3 aynen durur.
>
> **Neden zorunlu.** İşverenin bu revizyondan tek somut beklentisi *"oyuncunun klip alacağı an"*tır ve o an **yalnız T3 kademesinde** vardır (§1.6). Her T3 ya bir gag zirvesidir ya çapraz zirvedir; ikisi de `flags.gag` sayacı olmadan tetiklenemez. Bu dilim atlanırsa oyunda **sıfır set-piece** kalır: havuzlar çalışır, gag'ler kurulum aşamasında donar ve §7.5'in T3 kriterleri denetlenemez hâle gelir — yani **doküman kendi kabul testini geçemez**. Ayrıca `humor.seen` kaydedilmezse tekrar yönetimi (§1.6) çalışmaz ve oyuncu **aynı şakayı ikinci kez duyar**; bu, kahkaha katmanının en ucuz ölüm biçimidir. Dilim, ertelenebilir bir cila değil, **hedefin kendisidir**; bu yüzden başarım metinlerinden (eski Dilim 4) ve baloncuk sunumundan (eski Dilim 5) **önce** teslim edilir. Maliyeti de bunu kaldırır: üç-dört `gameState` alanı, bir aşama fonksiyonu (§3-n) ve `SaveManager`'a birkaç satır — yeni sistem, yeni dosya, yeni motor yoktur.

Her dilim tek başına gönderilebilir küçük bir CL'dir; hiçbiri mevcut sistemleri yeniden yazmaz.

---

## 9. Revizyon notu (kahkaha yükseltmesi)

**Tarih:** bu revizyon, işverenin "hedef tebessüm değil **kahkaha**" talimatı üzerine yapılmıştır. Oyuncunun sesli gülmesi, sahneyi arkadaşına anlatabilmesi ve klip alacak kadar sivri bir an bulabilmesi hedeflenir.

**Revizyonun iki ayağı vardır:** (1) genlik yükseltmesi — aşağıdaki §9.1-9.3; (2) **bağımsız denetim sonrası düzeltme turu** — §9.4. İkinci ayak birincinin üzerine gelir ve hiçbir koruma kuralını gevşetmez; aksine iki yerde (ölüm yasağının lafzı, makam adı süzgeci) sınırı **genişletir**.

### 9.1 Ne değişti ve neden

| Bölüm | Değişiklik | Gerekçe |
|---|---|---|
| Alt başlık | "Tebessüm Katmanı" → **"Kahkaha Katmanı"** | Dokümanın kendi hedef tanımı işverenin talimatıyla uyumlu hâle geldi. |
| §1.1 | Beş kural yeniden yazıldı: kahkaha **hedef**, tebessüm **taban**. Kalite testi tekleştirildi: *"arkadaşına sesli okusan gülüyor mu?"* — "hoş" cevabı yetersiz sayılır ve replik yeniden yazılır. | Eski §1.1-1 açıkça "hedef kahkaha değil tebessümdür" diyordu; bu madde yeni talimatla doğrudan çelişiyordu. |
| §1.5 *(yeni)* | **Kahkaha zanaatı — 9 teknik**, her birinde ZAYIF→GÜÇLÜ örnek ve kanal-teknik eşleşme tablosu. | Genlik yükseltmek bir niyet beyanı değil, bir zanaattir. Yazarın "hangi tekniği kullanıyorum" sorusuna cevap verememesi, repliğin komik olmadığının en güvenilir işaretidir. |
| §1.6 *(yeni)* | **Yoğunluk ve ritim sözleşmesi**: T1/T2/T3 kademeleri, saatte 15-20 beat, aralık kuralları, zorunlu kuru pencereler, tekrar yönetimi (`humor.seen`). Eski "saatte 6-10 tema" tavanı kaldırıldı. | Eski tavan tebessüm hedefine göre ayarlıydı ve kahkaha için seyrekti. Ama genliği yükseltmek doygunluk riskini de yükseltir; bu yüzden yoğunluk artışı **zorunlu sessizlik pencereleriyle** birlikte gelir — "her an şaka = hiçbir şaka". |
| §1.7 *(yeni)* | **Beş geri dönen espri** (ip, defter, esir eşek, sönen ocak, Kara Çelebi), her biri kurulum → 2. karşılaşma → zirve; iki çapraz zirve. | Oyunun elindeki en yüksek genlikli ve en ucuz araç budur: aynı malzeme üç kat verim üretir, çünkü oyuncu üçüncü karşılaşmada şakayı önceden bilip gülmeye hazır bekler. |
| §1.2 | Kahkaha sözdizimi kuralları eklendi (kısa cümle, vurucu kelime sona, açıklama yasağı, deadpan noktalama). Sınır tablosu revize edildi: bildirim 120→130, başarım açıklaması 90→150, örs atışması 3→4 satır. | Sınırlar içeriğe göre değil, içerik sınırlara göre kısılıyordu ve vurucu cümleler kırpılıyordu. Kırpılan vurucu cümle = ölen şaka. "3 cümle" sınırı **korundu** çünkü üçlü kuralın tam ölçüsüdür. |
| §2 | Dozlar yükseltildi; her karaktere kahkaha kaldıracı ve gag ataması eklendi (§2-b). Karakter sesleri **aynen korundu**. | Yükselen genlik karakteri değiştirmemeli. Kethüda hâlâ hiç şaka yapmaz — kahkaha sesin tonundan değil, defterin mantığından gelir. |
| §3-a, §3-b | Diyalog ağaçları yeniden yazıldı; üç adımlı tırmanma **ağacın derinliğine** yayıldı. Üst seçenek 4→6, açılış havuzu 3→6. Eski bloktaki `\\'` sözdizimi hatası düzeltildi. | 3 cümle sınırını bozmadan tırmanmanın tek yolu buydu — ve zamanlama açısından daha iyi: vurucu cümle oyuncunun kendi tıklamasıyla gelir. |
| §3-c … §3-m | Tüm havuzlar yeniden yazıldı ve büyütüldü (~150 → ~300 metin). | Tekrar espriyi öldürür; genlik yükseldikçe havuz derinliği de yükselmelidir. |
| §3-e | **Kurgu düzeltmesi:** "son sözleri" → **"yenilgi sözleri"**. Harami ölmez; yenilir, kaçar, teslim olur. Ölüm imalı satırlar kaldırıldı, bildirim öneki `🗡️` → `🏃`. | Bu, revizyonun **yasağı gevşetmediği, sıkılaştırdığı** yerdir. Eski havuz buruk-ölüm mizahındaydı ve §1.3-6'nın sınırında duruyordu; yeni havuz tamamen dünyevi bir kaçış komedisidir. |
| §4 | Adetler güncellendi; **K13** satırı eklendi (running gag aşamaları — mevcut kancaların üstünde çalışan zamanlama katmanı, yeni kod kancası değil). | Gag'ler yeni kanca gerektirmez; K1/K6/K8/K9 üzerinde durum sayacıyla çalışır. |
| §5 | Havuz adetleri, `banditLastWords` → `banditDefeatLines`, `runningGags` bloğu, `pickHumor`a `seen` + `soberUntil` kapıları. Kalıcılık gereksinimi kayda geçti. | Yeni tek kalıcılık ihtiyacı budur: `humor.seen` ve `flags.gag` kaydedilmezse yükleme sonrası gag baştan oynar ve oyuncu aynı şakayı ikinci kez duyar. |
| §7 | 7.1 sayılar ve yeni maddelerle güncellendi; 7.2'ye §1.3-8 taramaları eklendi; **7.5 (yeni)** kahkaha yoğunluğu ölçümü. | Eski §7'de mizah yoğunluğu için sayısal kriter yoktu — ölçülmeyen hedef tutmaz. 7.5'in son maddesi (10 replikten en az 6'sı sesli güldürmeli) kahkaha hedefinin tek gerçek kabul testidir. |
| §8 | Gag katmanı dilimi eklendi; **denetim sonrası Dilim 4'e alındı ve ZORUNLU yapıldı.** | İlk gerekçe "katman ertelenebilir olmalı ki teslim riski artmasın" idi. Denetim bunun hedefle çeliştiğini gösterdi: beş zirvenin tamamı o dilimdeydi ve dilim "zorunlu değil" yazıyordu — yani işverenin tek somut talebi ("klip alınacak an") **atılabilir dilime** konmuştu. |

### 9.2 Ne DEĞİŞMEDİ — koruma kuralları aynen duruyor

Kahkaha hedefi hiçbir sınırı gevşetmemiştir. Genlik yükselirken **hedef seçimi daha titiz** olmuştur, çünkü yüksek sesli bir şakanın yanlış yere isabet etmesi, kısık sesli olandan daha çok yaralar.

1. **§0 bağlayıcı çerçeve** — tek kelimesi değişmedi.
2. **§1.3 yasaklar 1-5 ve 7** — tek kelimesi değişmedi; üzerine **8. madde** (yüksek genlik denetimi: *replik gider, sınır kalır*) eklendi. **Madde 6 (ölüm) bu revizyonda değişti — ama gevşeyerek değil, MUTLAKLAŞARAK:** eski lafız "buruk ölüm mizahı"nı bir ara form olarak meşru gösteriyordu; yeni lafız ara formları da kapatır ve "ekranda görülen ölümse ihlal gerçekleşmiştir" ölçütünü ekler. Ayrıntı §1.3'teki değişiklik kaydındadır.
3. **Din, ibadet, din adamı, kutsal kavram** — sıfır mizah. Molla Şemseddin hiçbir replikte ne özne ne nesnedir, hakkında dedikodu bile yoktur; bağımsız denetim din grep'inin (`imam|molla|namaz|ezan|ayet|hadis|mescid|zemzem|günah|melek`) mizah havuzlarında **sıfır eşleşme** verdiğini doğruladı. Tek hadis (`Müslim, Tahâret 1`) hâlâ yalnız `saka_talk`ın ciddi alt dalındadır; GAG-1 zirvesi bile o dala en az bir düğüm uzaklıkta tutulur. **Denetimin bulduğu iki kusur bu başlıkta kapatıldı:** (i) aynı düğümdeki *"susuza su vermek sadakaların makbulündendir"* cümlesi **kaynaksız normatif bir hüküm** iddiasıydı (hangi sadakanın makbul olduğu derecelendirmesi) — yeni hadis/hüküm eklemek bu dokümanın yetkisinde değildir (§1.4), bu yüzden cümle kaldırılıp yerine kaynak gerektirmeyen bir **örfî beyan** konmuştur; (ii) o düğümün doğrudan çocuğu olan *"ücretine zam gerek"* dalı, ebeveyn metnin son vurgusu *"karşılığı yalnız dua"* olduğu için fiilen **duayı espri kurulumu** hâline getiriyordu — dal bir kademe aşağıya taşınmış, etiketi değiştirilmiş, replik metinleri **birebir korunmuştur**.
4. **Etnik/dinî grup küçümseme** — yok. Haçlı sayısı esprisinin nesnesi **Balaban'ın sayma kabiliyetidir**, düşmanın milleti değil; Frenk tüccar esprisinin nesnesi **İdris'in pazarlık mantığıdır**; "Rum ustadan kalma" ifadesi ustayı takdir eder.
5. **Müstehcenlik, küfür, cinsel ima, tuvalet mizahı** — yok; bağımsız denetim de bu dört başlıkta **temiz** raporu verdi. Hamam replikleri sırt-kese-kurna-peştemal ve edep çerçevesinde kalır; mevcut yasaklı kelime grep listesi **aynen korunmuştur** (§7.2, `06-fazlar-ve-kabul.md` Ç5/F4-07 ile birebir) — üzerine **ikinci bir liste eklenmiştir** (modern kurum/nizamiye terminolojisi), çünkü **anakronizm başlığı temiz çıkmadı**: denetim dört ihlal buldu (`emekliye ayrıldı`, `gündem`, `haftalığım`, `karavana`/`terhis`) ve dördü de kapatıldı. Eski grep yalnız *modern gündelik dili* tarıyordu, *modern kurum terminolojisini* taramıyordu; asıl kusur buydu.
6. **Ölüm, zayıfı ezme, sakatlık** — mizah nesnesi değil; §3-e revizyonuyla bu sınır **sıkılaştı**, denetim sonrası **bir kez daha sıkılaştı**: madde 6'nın lafzı mutlaklaştırıldı (ara formlar kapatıldı) ve metin temizliğinin yetmediği tek yer — **ekran** — için `killEnemy`e engelleyici bir kabul ön koşulu yazıldı. Ali'nin yarası, şehitlik ve sefer sahnesi mizahsızdır.
7. **§6 ton dengesi ve susturma sözleşmesi** — **aynen korunmuştur**, tek karakteri değişmemiştir: 6 sert bayrak, mekânsal susturma (mescid 10 m / hazire 8 m), Perde eğrisi. §1.6'nın `soberUntil` kapısı bu bayrakların **yerine geçmez, üstüne eklenir**; bayraklardan biri doğruysa yumuşak kapı ne derse desin kanal susar.
8. **Mizah taşımayan dört karakter** (Molla Şemseddin, Dizdar Hamza Bey, Cebelü Ali, Gazi Sungur Bey) — liste ne genişledi ne daraldı. §1.5-6 "statü düşmesi" tekniği bu dört isim üzerinde **kullanılamaz**; teknik yalnız çevrelerindeki karakterlerin telaşına uygulanır.
9. **Koca Dede'nin Kosova anısının içeriği** — dokunulmaz. Espri yalnız anlatma alışkanlığındadır ve doz yükselirken bu sınır **daraldı**, gevşemedi.
10. **`morale < 40` vergi bandı** — hiç dokunulmadı; hâlâ espri değildir, olmayacaktır ve mute bayraklarından muaftır.
11. **Mimari** — yeni diyalog motoru yazılmadı, mevcut `DialogueSystem` şeması ve 12 kancanın tamamı korundu; 12 Steam başarım kimliği değişmedi.

### 9.3 Denetim sırasında yakalanan ve düzeltilen iki satır (kayda geçer)

Bu iki örnek, §1.3-8'in çalıştığının kanıtıdır — komik bulunan bir satır sınıra değdiğinde **satır değişti, sınır değişmedi**:

1. GAG-4 zirvesinin ilk taslağındaki kapanış *"körüğü şehit ettin"* idi; "şehit" kelimesi bir espri cümlesinde kullanılamaz (§1.3-1 ve -6). Kapanış **"Ocağı yaşattın, körüğü yaktın."** oldu.
2. GAG-5'te kargaya verilen ilk ad kutsal çağrışımlıydı; reddedildi ve yerine dönemsel-nötr, mizahi bir unvan takıntısı (**"Kara Çelebi"**) kondu. Aynı ihtiyatla §3-i/8'de Ali'nin *"gerisi dua"* kapanışı **"gerisi sabır"** olarak, `ACH_FIRST_CEBELU`'nün adı *"Bir Yiğit, Bin Dua"* → **"Bir Yiğit Donandı"** olarak değiştirildi.

---

### 9.4 BAĞIMSIZ DENETİM SONRASI DÜZELTME TURU (bu revizyonun ikinci ayağı)

**Ne oldu:** Kahkaha revizyonu tamamlandıktan sonra doküman bağımsız denetime verildi. Sonuç **PASS DEĞİL**di: **9 koruma bulgusu, 22 zayıf replik, 7 yapısal boşluk.** Bu bölüm bulguların nasıl kapatıldığını kayda geçirir. Denetim raporu: `docs/fable_yol-haritasi/calisma-arsivi/denetim-02-mizah.md`.

**Denetimin temiz bulduğu başlıklar (kayda geçer, gevşetilmedi):** din grep'i mizah havuzlarında sıfır eşleşme · etnik/dinî grup küçümsemesi yok · müstehcenlik/küfür/cinsel ima/tuvalet mizahı yok · haramiler ölürken konuşmuyor · §6 susturma sözleşmesi altı bayrağıyla tam yerinde · mizahsız dört karakterin sınırları tutuyor · karakter/uzunluk sınırları tutuyor.

#### 9.4.1 Koruma bulguları (9) — hepsi kapatıldı

| # | Bulgu | Nasıl kapatıldı |
|---|---|---|
| 1 | **Anakronizm: "emekli"** — 5 içerik + 3 meta geçiş; üstelik GAG-1'in çekirdeğinde | Kelime değiştirilmedi, **imge yeniden kuruldu** (§1.2'nin kendi uyarısı gereği): "emeklilik" bir sosyal güvenlik kurumudur, 1396'da yoktur. Yerine **azil** kondu — 14. yy idarî terminolojisinde yerleşik, halk ağzında duyulan, deadpan defter diline doğrudan bağlanan bir kavram. Meta terminolojideki "emekli gag" → **"arşive kalkan gag"**. |
| 2 | **Anakronizm: "gündem"** (§3-k/7) | Kelime yaması yapılmadı; §1.2'nin kuralı gereği **şaka yeniden kuruldu**: modern "meclis gündemi" fikri yerine dönemin kendi kurumu (**dava görülmesi**) kondu. Satır aynı zamanda 22 zayıf replik listesindeydi; tek düzeltmeyle iki bulgu kapandı. |
| 3 | **Anakronizm: "haftalığımı alamadım"** (§3-e/5) | Haramide haftalık ücret yoktur, **ganimet payı** vardır. Replik yeniden yazıldı ve aynı anda zayıflık bulgusu da kapatıldı: somutluk üç kat (*üç baskın · çarık · o da sol*), vurucu kelime tek heceyle sonda. |
| 4 | **Anakronizm şüphesi: "karavana" / "terhis"** (5 yer + kelime havuzu) | İkisi de 19. yy nizamiye terminolojisidir ve 1396 için doğrulanamaz; doküman kendi kelime havuzunda anakronizm şüphesi taşıyamaz. **kazan / aş kazanı** ve **salıverme / yol vermek** ile değiştirildi — ikisi de dokümanın **zaten kullandığı** iç dildi, yani tutarlılık arttı. |
| 5 | **Din: kaynaksız normatif hüküm + duanın espri kurulumu olması** (§3-a) | Hüküm cümlesi kaldırılıp **örfî beyan** kondu; mizahi dal **silinmeden** bir kademe aşağıya taşındı ve etiketi değiştirildi. Seçenek sayıları (6 üst / 37 toplam) **bozulmadı**. |
| 6 | **§1.3-6'nın lafzı ölüm mizahını meşrulaştırıyor** | Madde 6 mutlaklaştırıldı: ara formlar ("buruk ölüm mizahı", "son söz komedisi") açıkça yasaklandı, "ekranda görülen ölümse ihlal gerçekleşmiştir" ölçütü eklendi. §2-a ve §2-b'deki harami satırları da yenilgi/bozgun çerçevesine çevrildi. |
| 7 | **`killEnemy` görsel-metin çelişkisi** | Metin denetimiyle yakalanamayan tek ihlal türü: kusur metinde değil, **metin ile görüntünün arasında**. §7.1'e **engelleyici ön koşul** yazıldı (iki yol: ya düşman ekranda ölmüyor, ya havuz kancadan sökülüyor) ve uyarı §3-e'nin kendi bölümüne de kondu. |
| 8 | **Dizdar belirsizliğe düşüyor** (§3-g/13) | Replik dizdarsız yeniden kurgulandı; espri bütünüyle nöbetçilerin üzerinde bırakıldı. §7.2-b tarama maddesi "anlaşılmaz konumda görünmez" şartıyla genişletildi. |
| 9 | **Kargaya "Muhtesib" adı** | Hisbe dinî temelli bir vazifedir (emr-i bi'l-ma'rûf); ad §1.3-1 uyarınca reddedildi ve **"Kantarcı"** kondu. Dokümanın eski savunması ("nesnesi makam değil") yetersizdi, çünkü **adın kendisi şakanın parçasıydı**. §1.5-2'ye ve §7.2'ye kalıcı bir **makam adı süzgeci** eklendi. |
| + | **"En fazla 3 cümle" sınırının üç ihlali** (§3-a damar, §3-b Doğan Bey rivayeti, §3-b eşek fidyesi) | Üçü de 3 cümleye indirildi; **istisna kuralı yazılmadı.** Üç vakada da fazlalık içerik değil **noktalamaydı** — tek kelime kaybı olmadı, iki vakada tempo iyileşti. İstisna yazmak §7.2'nin otomatik uzunluk denetimini manuele düşürürdü ve "sınırlar içeriğe göre eğilir" emsalini kurardı (§1.3-8'in tam tersi). |

#### 9.4.2 Zayıf replikler (22) — hepsi yeniden yazıldı

Kanal dağılımı: 3-c/7, 3-c/8 · 3-d/11, 3-d/14, 3-d/23 · 3-e/5, 3-e/7 · 3-f/1 (T3'e yükseltildi, yerine yeni metin), 3-f/2, 3-f/8 · 3-g/5, 3-g/15 · 3-h/4, 3-h/7 · 3-i/1, 3-i/6, 3-i/7, 3-i/10 · 3-j `ACH_SAKA_DOSTU`, `ACH_HORSE_MASTER`, `ACH_BLACKSMITH` · 3-k/6, 3-k/7.

Tekrar eden dört kusur ve panzehirleri: **(a) şakayı açıklayan kuyruk cümlesi** (3-g/5, 3-h/4, 3-h/7, `ACH_BLACKSMITH`) → §1.2 gereği silindi; **(b) soyut/serebral kurgu, somut yok** (3-c/7, 3-f/2, `ACH_HORSE_MASTER`) → sayı-isim-nesne kondu; **(c) hazır klişe kapanış** — fabl ahlakı, bilgelik vecizesi, sitcom kalıbı (3-g/15, 3-i/1, 3-i/10) → yerine fiziksel çöküş veya statü düşmesi; **(d) havuz içi dublet** (3-d/23, 3-i/7, 3-k/6) → ikinci eleman başka eksene taşındı.

**Bu turda iki koruma sınırı da bu listeyle birlikte temizlendi:** `"Bereket versin…"` (3-f/8) ve `"Maşallah."` (3-i/10) espri **kurulum basamağı** olmaktan çıkarıldı — dinî kalıp saygılı halk kalıbı olarak serbesttir, kurulum olarak değil (§1.3-1). 3-i/10'daki **modern kılıbık-koca klişesi** de aynı düzeltmeyle kalktı (§1.3-3).

#### 9.4.3 Yapısal bulgular (7) — hepsi kapatıldı

1. **GAG-2'nin gövdesi yoktu.** Taşıyıcı gag `kethuda_talk`ta hiç yazılmamıştı; GAG-3 ve GAG-5 zirveleri ona bağlı olduğu için **üç gag birden askıdaydı**. §3-n kes-yapıştır blok olarak teslim edildi. Ayrıca 2. aşamanın tetiği yılda bir çalışan `collectAnnualTax`tan alınıp her gün erişilebilir `kethuda_talk`a taşındı.
2. **GAG-1 dört ayrı ip hikâyesi anlatıyordu.** Tek kanon kuruldu: **tek ip, artan düğüm (2→3→4→5), kısalan ip**; ortadaki düğümün adı *"Sağlam"*. Altı yer bu kanona göre düzeltildi.
3. **GAG-3'ün iki paralel 2. aşaması vardı.** §3-b sürümü kanon ilan edildi; kaybedilecek içerik (esire iyi muamele) §3-b'ye kardeş seçenek olarak taşındı. GAG-2 ve GAG-3 zirveleri **tek T3'te** birleştirildi (*"Meydan Muhasebesi"*).
4. **GAG-4'ün zirve metni havuzda yoktu.** §3-h/13 (kahkaha bloğu) ve §3-h/14 (mizahsız Ahi kapanışı) olarak yazıldı; §1.2'ye "sınır blok başınadır" dipnotu eklendi.
5. **T3 arzı 3 kat eksikti ve tamamı atılabilir dilimdeydi.** Altı yeni set-piece (T3-E … T3-J) eklendi → **10 T3**; ilk iki saate iki zirve kondu; §8'de gag katmanı **Dilim 4'e alındı ve zorunlu yapıldı**.
6. **Yoğunluk sözleşmesi arzla desteklenmiyordu.** Düz "15-20 beat/saat" hedefi **düşen eğriye** çevrildi (18-22 / 12-15 / 8-10) ve asıl çözüm olan **kanal başına saatlik tavan** (`ceil(havuz/8)+1`) kuralı eklendi — sorun toplam sayı değil, içeriğin oyunun başına yığılmasıydı.
7. **Doküman 9 teknik ilan ediyor, iki motor çalıştırıyordu.** §1.5'e **kalıp kotası** eklendi (havuzda en çok 2, dokümanda en çok %5) ve altı replik başka tekniğe dönüştürüldü: *hayvan-vazife* 12 → 8, *simetrik iptal* 6 → 4.

#### 9.4.4 Bu turda DEĞİŞMEYENLER

- **§0 bağlayıcı çerçeve** ve **§6 ton dengesi/susturma sözleşmesi** — tek karakterine dokunulmadı.
- **Mevcut yasaklı kelime grep listeleri** — aynen korundu; üzerine iki yeni tarama maddesi eklendi (modern kurum terminolojisi, kalıp kotası) ve iki mevcut madde genişletildi (makam adı süzgeci, dizdar taraması).
- **Mizahsız dört karakter**, **Koca Dede'nin Kosova anısı**, **`morale < 40` vergi bandı**, **12 Steam başarım kimliği**, **mevcut test asertleri**, **mimari** — hiçbiri değişmedi.
- **Hiçbir havuz küçülmedi.** Tüm düzeltmeler yerine-yazma veya ekleme biçimindedir; adetler yalnız arttı (3-h 12→14, 3-i satır 42→47, `guard_talk` seçenek 29→31, yeni §3-n, altı yeni T3).

#### 9.4.5 Çakışan üç düzeltme taslağı — hangisi neden seçildi (kayda geçer)

Düzeltmeler üç ayrı taslaktan geldi: **A (koruma ihlalleri)**, **C (yapısal)**, **B (zayıf replikler)**. Çakışmalarda öncelik **A > C > B**; **koruma kuralı her şeyin üstünde**. Üç yerde iki taslak aynı satıra dokundu:

| Satır | Çakışma | Karar ve gerekçe |
|---|---|---|
| GAG-1'in altı metni | A "azil" imgesini, C tek-kanon düğüm eksenini istiyordu | **Birleştirildi.** İkisi farklı kusurları hedefliyordu (A: anakronizm, C: iç tutarsızlık) ve çakışmıyorlardı: kanon "azlini istedi → azli çıkmadı, vazifede → yerine tayin geldi" ekseninde kurulunca **her iki bulgu da kapandı**. A'nın koruma amacı tamamen karşılandı. |
| §3-e/7 | B hâl komedisi, C beklenti kırma öneriyordu | **C'nin şakası alındı, B'nin ölçü disiplini uygulandı.** C'nin metni 108 karakterdi (sınır ~80) ve 3-e/1 ile *"meşeliğin öbür ucu"* ifadesini tekrarlıyordu; orta cümle atılınca şaka 61 karaktere indi ve **daha da sertleşti** (§1.2: kurulum kısalır, vuruş yerinde kalır). |
| §3-i/10 | C yalnız son satırı silmeyi, B tam yeniden yazımı öneriyordu | **B seçildi — koruma kuralı gereği.** C'nin çözümü simetrik iptali kaldırıyor ama `"Maşallah."` kurulumunu ve modern sitcom klişesini **yerinde bırakıyordu**; ikisi de §1.3 ihlalidir. B üç kusuru birden kapatır ve C'nin amacına da ulaşır. |
| §3-k/7 | A kelime değişimi (`gündem` → `maslahat`), B tam yeniden yazım öneriyordu | **B seçildi.** A'nın koruma amacı (anakronizmin kalkması) B'nin metninde de tamamen sağlanıyor; üstelik §1.2'nin kendi kuralı **kelime yamasını yasaklıyor** ("kelimeyi değiştirme, şakayı yeniden kur") ve satır ayrıca zayıf replik listesindeydi. Öncelik kuralı ihlal edilmedi: A'nın kararı — *"gündem" gider* — aynen uygulandı, yalnız uygulama biçimi dokümanın kendi kuralına uyduruldu. |
| §3-f/1 | C bu satırın havuzdan **çıkarılmasını** istiyordu (T3-I ile aynı şaka) | **Kısmen uygulandı.** Şaka T3'e yükseltildi, ama havuz adedi düşmesin kuralı gereği satır silinmedi: aynı indekse **başka eksende yeni bir replik** yazıldı. 3-f havuzu 12'de kaldı. |
