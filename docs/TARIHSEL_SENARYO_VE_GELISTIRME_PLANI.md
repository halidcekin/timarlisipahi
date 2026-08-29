# Mülk-i Osmanî: Tarihsel Senaryo ve Geliştirme Planı

Tarih: 29 Ağustos 2026  
İncelenen sürüm: Mevcut `main` çalışma ağacı  
Ana dönem: I. Bayezid devri, 1396 Niğbolu Seferi

## 1. Kısa hüküm

Projenin iyi bir çekirdeği var: at binme, yakın dövüş, okçuluk, yaşayan köy, tımar ekonomisi, arzuhal, diyalog ve sefer haritası aynı temada birleşiyor. Fakat mevcut içerik henüz bir tarihsel RPG kampanyasından çok, birbirini izleyen NPC konuşmaları ve anlık kaynak ödülleri gibi çalışıyor.

En doğru yön, oyunu “köyde on bir kişiye uğra, sonra haritadan Niğbolu’ya tıkla” yapısından çıkarıp şu dramatik omurgaya taşımaktır:

> Bir sipahi, kendisine mülk olarak ait olmayan bir dirliğin gelirini ve düzenini geçici olarak emanet alır; reayanın hakkını, sefer yükümlülüğünü ve kendi itibarını aynı anda korumaya çalışır. 1396 yazında gelen çağrı, köyde verdiği bütün kararların sonucunu Gelibolu geçişinde, Rumeli yürüyüşünde ve Niğbolu meydanında önüne getirir.

Tarihsel sonuç değişmemelidir: 25 Eylül 1396'da Osmanlı ordusu kazanır. Oyuncunun değiştirdiği şey savaşın sonucu değil; kendi bölüğünün kaybı, köyün durumu, yanında götürdüğü insanların sadakati, edindiği itibar ve dönüşte karşılaştığı bedel olmalıdır.

## 2. Mevcut sürümde görülen güçlü yanlar

- Köy, kale, orman, hamam, han ve talimgâh tek bir oynanabilir mekânda toplanmış.
- Kılıç-kalkan, at, okçuluk ve hasar sistemleri temel bir savaş öğretisi kurmaya yeterli.
- Tımar geliri, cebelü, hububat, moral ve asayiş değerleri senaryoya bağlanabilecek durumda.
- Arzuhal sistemi, oyuncuyu yalnız savaşçı değil yerel düzenin sorumlusu yapabilecek doğru çekirdeğe sahip.
- NPC günlük rutinleri, görevleri saat ve mevsime bağlamak için uygun bir altyapı sunuyor.
- Test paketi 20/20 geçiyor ve üretim derlemesi tamamlanıyor.

## 3. Önce düzeltilmesi gereken mevcut sorunlar

### 3.1 Çalışmayı etkileyen sorunlar

1. `UIManager`, görev sisteminde bulunmayan `getActiveTargetInfo()` işlevini her karede çağırıyor. Bu hata HUD güncellemesini yarıda kesiyor; başlangıç ekranındaki rastgele sipahi ile oyun içindeki “Gazi Murad Bey” bilgisinin farklı kalmasının ve tarihin eski HTML değeri olan 1402 görünmesinin temel nedeni bu.
2. `CombatSystem`, harami öldüğünde `questSystem.onEnemyKilled()` çağırıyor; görev sistemi ise `onEnemyDefeated()` tanımlıyor. Bu nedenle harami görevinin normal oynanışta ilerlememesi beklenir.
3. `GameState.updateTime()` kullanılmıyor. Ana döngü yalnız saati 0–24 arasında çeviriyor; gün sayısı, mevsim ve zamana bağlı inşa/hamam mantıkları aynı takvime bağlı değil.
4. Niğbolu görevi “en az 2 cebelü” isterken aktif sefer ve arayüz “en az 1 cebelü” kabul ediyor.
5. Niğbolu savaşı oynanmıyor. Haritadaki noktaya tıklanınca asker sayısı ve rastgele sayıya göre sonuç metni veriliyor.
6. Görev ödülündeki `maxHealth`, azami sıhhati artırmak yerine mevcut sıhhati 100'e çekiyor.

### 3.2 Senaryo ve sunum sorunları

- README sabit “Gazi Murad Bey / Akçaoba” anlatırken oyun rastgele sipahi ve tımar üretiyor. Ya sabit dramatik kahraman ya da sistemik isimsiz sipahi yaklaşımı seçilmeli.
- Oyun durumu 1394'te başlıyor, Niğbolu seferi aynı anda aktif görünüyor, HTML ise 1402 yazıyor. Tek bir takvim otoritesi yok.
- Görevlerin çoğu aynı fiilden oluşuyor: hedefe git, konuş, iki seçenekten birini seç, ödül al.
- Cebelü talimi gerçek bir talim değil; Ali ile konuşmak görevi tamamlıyor.
- “Cenevizli Bizans casusu” etnik kimliği doğrudan suç kanıtı gibi kullanıyor. Dönemin Ceneviz-Bizans-Osmanlı ilişkileri bundan daha karmaşıktır; şüphe, belge ve davranış üzerinden kurulmalıdır.
- “Haramileri kılıçtan geçir” tek çözümdür. Yakalama, sorgulama, teslim alma, muhbir kullanma ve mağdurun zararını karşılama yoktur.
- Büyük köy hamamı 18–30 haneli her rastgele tımar için otomatik beliriyor. Erken Osmanlı hamamları tarihsel olarak mümkündür; fakat bu ölçekte yapı vakıf, kaplıca, menzil veya kasaba ekonomisiyle açıklanmalıdır.
- “Masöz”, “taktik radar”, “12'den vurmak” gibi ifadeler tarihsel atmosferi kırıyor.
- “Kazasker zırhı” bir teçhizat sınıfı değildir; kazasker adlî/idarî bir makamdır.
- Bursa harita açıklamasındaki Ulu Cami, Niğbolu öncesi tamamlanmış bir yapı gibi gösterilmemeli. Yapı 1396–1400 arasına tarihlenir.
- Sonuç metnindeki genel “sahte ricat/Turan taktiği” ifadesi, kaynaklarda anlatılan katmanlı savunma düzenini fazla basitleştiriyor.

## 4. Tarihsel omurga

### 4.1 Kesin kabul edilebilecek noktalar

- I. Bayezid 1389–1402 arasında hüküm sürdü.
- Osmanlılar 1394'ten itibaren Konstantinopolis üzerindeki baskıyı/ablukayı yoğunlaştırmıştı.
- Sigismund komutasındaki Haçlı ordusu Niğbolu Kalesi'ni kuşattı.
- Bayezid kuvvetlerini hızla Niğbolu'ya yöneltti ve savaş 25 Eylül 1396'da Osmanlı zaferiyle sonuçlandı.
- Haçlı ordusu tek parça değildi: Fransız-Burgonya şövalyeleri, Macarlar, Almanlar, Rodos şövalyeleri, Eflak ve Transilvanya kuvvetleri gibi farklı unsurlar ve farklı komuta öncelikleri vardı.
- Osmanlı ordusu da yalnız Müslüman Türklerden oluşmuyordu; Sırp vasalı Stefan Lazareviç'in kuvvetleri savaş düzeninin ihtiyat unsurları arasındaydı.
- Kaynaklar Osmanlı önünde düzensiz/öncü birlikler, kazıklarla korunan bir hat, okçular ve geride ihtiyat kuvvetleri bulunan katmanlı bir düzen tarif eder.
- Tımar, Batı Avrupa'daki kalıtsal malikâne ile aynı şey değildir. Sipahi toprağın sahibi gibi değil, belirli vergi gelirlerinin askerî hizmet karşılığı tahsis edildiği bir görevli olarak ele alınmalıdır.

### 4.2 Kaynak ihtilafı olan noktalar

Şu unsurlar oyunda “kesin gerçek” değil, rivayet veya yoruma açık bilgi diye sunulmalıdır:

- Orduların kesin mevcudu.
- Bayezid'in gece kale önüne tek başına yaklaşıp dizdar Doğan Bey ile konuşması.
- Muharebenin her safhasındaki kesin birlik sayıları ve süreler.
- Tek bir “sahte ricat” manevrasının savaşı açıklaması.
- Bütün Haçlı komutanlarının aynı niyet, disiplin ve davranışa sahip gösterilmesi.

Oyunun tarih kodeksinde her maddeye şu güven etiketi eklenebilir:

- **A — Belgelenmiş:** Tarih, kişi, ana sonuç veya birden çok kaynakta ortak olay.
- **B — Kuvvetli yorum:** Kaynakların çoğuyla uyumlu askerî/sosyal yeniden kurma.
- **C — Dramatik bileşim:** Oynanış için yaratılmış NPC, diyalog veya küçük olay.
- **R — Rivayet:** Dönem anlatısında geçen fakat doğruluğu tartışmalı hikâye.

## 5. Önerilen kampanya yapısı

### Tasarım kararı

Önerilen ana kampanya 1396 ilkbaharında başlar ve 25 Eylül 1396'da Niğbolu ile biter. Böylece oyuncu aylarca beklemeden hazırlık, hasat, sefer çağrısı ve yürüyüşü yaşar.

1394'te başlama fikri korunacaksa iki yıl birkaç görevle geçilmemeli; mevsimlik kararlar, kış, hasat ve 1395 Rovine haberleri olan daha uzun bir yönetim oyunu gerekir. Mevcut kapsam için 1396 başlangıcı daha güçlü ve ekonomiktir.

### Perde I — Emanet edilen dirlik

#### Bölüm 0: Beratın Mührü

Amaç: Hareket, etkileşim, defter ve temel dünya öğretisi.

- Oyuncu sancak kalesinde tımar beratını teslim alır.
- Dizdar veya sancak görevlisi, “toprağın sahibi değil, hizmet ve gelir hakkının mutasarrıfısın” fikrini açıklar.
- Oyuncu atını, mührünü ve yoklama listesini teslim alır.
- İlk karar: Tımara hızlı at sürüşü mü, güvenli kervan yolculuğu mu?
- Hızlı yol süre kazandırır fakat atı yorar; kervan yolu bir yol kesme olayına açılır.

Öğretilen sistemler: yürüme, at, harita, zaman, temel diyalog.

#### Bölüm 1: Defter ile tarla arasında

Amaç: Tımarı ilk kez gerçek bir idarî oyun alanı yapmak.

- Kethüda hane, tarla, değirmen ve hasat durumunu bildirir.
- Oyuncu üç haneyi fiziksel olarak ziyaret edip defter bilgisiyle sahadaki durumu karşılaştırır.
- Bir hane kuraklık, biri tohum borcu, biri eksik ölçüm iddiası taşır.
- Oyuncu hemen tahsilat yapabilir, süre verebilir veya kadı naibine kayıt gönderebilir.
- Seçim yalnız “akçe/moral” değiştirmez; ileride sefere verilecek erzak ve gönüllü sayısını etkiler.

Öğretilen sistemler: keşif, kanıt, kaynak kararı, reaya güveni.

#### Bölüm 2: Su hakkı

Amaç: Oyuncuya sipahinin sınırsız hâkim olmadığını göstermek.

- Müslüman ve zimmî iki hane, değirmen arkının kullanımı konusunda anlaşmazlığa düşer.
- Oyuncu tanık dinler, arkın kırık bölümünü inceler ve eski sınır taşını bulur.
- Nihai hükmü tek başına vermek yerine uzlaşma sağlar veya dosyayı kadı naibine götürür.
- Haksız ve hızlı karar kısa vadede vergi getirir, uzun vadede göç ve düşük üretim riski doğurur.

Öğretilen sistemler: soruşturma, çok seçenekli diyalog, gecikmeli sonuç.

#### Bölüm 3: Yoklama günü

Amaç: Teçhizat ve cebelü sistemini görünür hale getirmek.

- Sipahi, kendi zırhı, atı ve silahıyla yoklamaya girer.
- Cebelü adayları farklı becerilere sahiptir: iyi binici, iyi okçu, güçlü fakat disiplinsiz savaşçı.
- Gelire göre yükümlülük, tek bir evrensel sayı yerine oyunun seçtiği sancak/yıl kuralı olarak defterde gösterilir.
- Eksik teçhizat için satın alma, tamir, ödünç alma veya yükümlülüğü azaltmak için resmî başvuru seçenekleri sunulur.

Öğretilen sistemler: envanter, bakım, kadro, hazırlık puanı.

### Perde II — Talim ve yaklaşan fırtına

#### Bölüm 4: Cebelü Ali'nin gerçek talimi

Konuşma görevi yerine dört aşamalı oynanabilir ders:

1. **Kalkan ve mesafe:** Beş kontrollü darbeyi blokla; kuvvet tüketimini öğren.
2. **Kılıç geçişleri:** Baş, gövde ve açık hedefe doğru zamanlamayla vur.
3. **Atlı mızrak hattı:** Kazıklara çarpmadan üç hedefe geçiş saldırısı yap.
4. **Komut:** Ali'ye “yakın dur, açıl, geri çekil, hedef değiştir” emirleri ver.

Altın derece kusursuz savaş değil, Ali'yi yaralamadan ve atı yormadan talimi bitirmektir.

#### Bölüm 5: Yaylakta ok

Mevcut okçuluk sistemi bir skor oyunu olmaktan çıkarılıp üç tarihsel beceriye ayrılır:

- Sabit hedefe mesafe ve yay gerilimi.
- Hareketli saman hedefe atış.
- At üzerinde yavaş, sonra hızlı geçiş atışı.

Rüzgâr, yorgunluk ve atın ritmi devreye girer. “12'den vurmak” yerine “göbek”, “iç halka” ve “dış halka” kullanılır. Kazanılan değer yalnız genel XP değil, gerçek bir `archeryMastery` niteliği olur.

#### Bölüm 6: Harami değil, iz

- Kervan saldırısı sonrası kırık ok, nal izi ve satılmaya çalışılan mal araştırılır.
- Üç olası sonuç: çeteyi öldürmek, lideri yakalamak veya erzak karşılığı teslim almak.
- Yakalanan lider, Haçlı yürüyüşü hakkında duyduğu doğru/yanlış bir haber verebilir.
- Öldürmek hızlı ve ganimetlidir; yakalamak bilgi ve hukukî itibar sağlar; teslim almak tekrar suç riski taşır.

#### Bölüm 7: Hanın yabancısı

Mevcut “Cenevizli = Bizans casusu” kurgusunun yerine:

- Handa bir İtalyan tüccar, Rum tercüman ve Ragusalı ulak bulunur.
- Şüphe etnik kimlikten değil; farklı tarihler taşıyan iki geçiş kâğıdı, yanlış çizilmiş bir geçit ve gece gönderilen mesajdan doğar.
- Gerçek fail her oyunda değişebilir veya hiçbiri casus olmayabilir; bilgi kaçıran kişi yerli bir borçlu da olabilir.
- Oyuncu yanlış kişiyi tutuklarsa ticaret ve yerel zimmî güveni zarar görür.

Öğretilen sistemler: çapraz sorgu, belge karşılaştırma, güvenilirlik.

### Perde III — Ferman ve toplanma

#### Bölüm 8: Tuğ çağrısı

- Bir ulak, mühürlü sefer emrini getirir.
- Oyuncuya üç oyun günü verilir: erzak, yedek at, ok, nal, çadır ve cebelü hazırlığı.
- Köyde daha önce verilen kararlar şimdi sonuç üretir. Memnun haneler gönüllü araba ve zahire verir; baskı görenler kaçar, mal saklar veya yüksek bedel ister.
- Oyuncu bütün hububatı alamaz. Fazla erzak sefer güvenliği sağlar fakat köyü kışa zayıf bırakır.

#### Bölüm 9: Sancak yoklaması

- Kale avlusunda donanım ve mevcudiyet denetlenir.
- Eksik ok, hasta at veya tecrübesiz cebelü tespit edilir.
- Oyuncu utanma/itibar kaybını göze alıp eksik bildirebilir ya da saklayabilir.
- Saklanan eksik, Rumeli yürüyüşünde daha ağır kayıp üretir.

#### Bölüm 10: Gelibolu geçişi

- Anadolu tımarı seçildiyse oyuncu kervanla Gelibolu'ya ilerler.
- Seviye, yol güvenliği ve lojistik üzerine kuruludur; her düşman öldürülmez.
- İskele yoğunluğu, atların gemiye bindirilmesi, fırtına ve erzak kaybı küçük görevler oluşturur.
- Rumeli tımarı ileride eklenirse aynı bölüm farklı bir kara rotasına dönüşebilir.

### Perde IV — Rumeli yürüyüşü ve Niğbolu

#### Bölüm 11: Çok dilli ordugâh

- Oyuncu Edirne/Rumeli toplanma alanında akıncılar, kapıkulu unsurları, tımarlı süvariler ve Sırp vasal askerleriyle karşılaşır.
- Stefan Lazareviç'in varlığı doğrudan uzun bir ünlü kişi sahnesi olmak zorunda değildir; Sırp bölüğünün Osmanlı safında oluşu diyalog ve görsel anlatıyla gösterilir.
- Oyuncu, savaşın basit bir “iki dinin yekpare orduları” olmadığını öğrenir.
- Bir tercüman görevi, bir nal/erzak paylaşımı ve kamp disiplini olayı oynanır.

#### Bölüm 12: Tuna'ya zor yürüyüş

- At dayanıklılığı, kol düzeni, köprü/geçit, keşif ve erzak tüketimi gerçek sistemlere dönüşür.
- İyi hazırlanmış oyuncu kısa rotayı; zayıf hazırlanmış oyuncu ikmal rotasını seçer.
- Keşif kolu Haçlıların Vidin/Rahova yönündeki ilerleyişinin sonuçlarına rastlar; savaşın siviller üzerindeki maliyeti görünür olur.

#### Bölüm 13: Niğbolu gecesi

- Gece keşfiyle kale, kuşatma hattı ve arazi okunur.
- Bayezid ile dizdar Doğan Bey'in konuşması doğrudan kesin olay diye sahnelenmek yerine askerlerin anlattığı bir “bu gece böyle olmuş” rivayeti şeklinde sunulur.
- Oyuncu kazık hattı için arazi seçer, ok ve su dağıtır, atları geride tutar.
- Buradaki kararlar ertesi gün savaş alanını fiziksel olarak değiştirir.

#### Bölüm 14: Niğbolu Meydan Muharebesi

Savaş tek bir büyük kalabalık yerine performans dostu beş safha olarak tasarlanmalıdır:

1. **Öncü temas:** Oyuncu hafif birliklerle keşif ve taciz yapar; amacı öldürme sayısı değil düzeni bozmadan geri dönmektir.
2. **Kazık hattı:** Fransız-Burgonya hücumu yaklaşırken atlı okçular belirlenen koridorlardan çekilir. Yanlış koridor seçimi dost kaybı üretir.
3. **Yaya çarpışması:** Şövalyeler attan indikten sonra yakın dövüş yoğunlaşır. Oyuncu kalkan, stamina ve bölük komutlarını birlikte kullanır.
4. **İkinci hat:** Sigismund'un ana kuvveti gelir. Oyuncu kendi başına kahramanlık yapmak yerine hattı tutmak veya yaralı birliğini geri çekmek arasında karar verir.
5. **İhtiyat ve karşı hücum:** Bayezid'in ihtiyatı ve Sırp vasal kuvvetlerinin gelişi görünür biçimde savaşın dengesini değiştirir. Oyuncu takip, sancak koruma veya yaralı kurtarma görevi seçer.

Tarihsel sonuç sabittir; performans sonuçları değişir:

- Bölük kaybı
- Ali'nin yaşayıp yaşamaması veya yaralanması
- Ele geçirilen sancak/esir
- Kurtarılan dost ve sivil sayısı
- At ve teçhizat kaybı
- Sultan/sancakbeyi itibarı
- Köyde kalan zahire

#### Bölüm 15: Zaferin bedeli

- Meydan sonrası yalnız zafer jingle'ı çalmaz; yaralılar, esirler, kayıp atlar ve tahrip olmuş kale görülür.
- Esirlerin bir kısmının fidye değeri, sıradan askerlerin durumu ve infaz anlatıları kodekste kaynak ihtilafıyla ele alınır.
- Oyuncu tarihsel ana sonucu değiştirmez; yaralılarına bakma, ganimet peşine düşme, kale onarımına yardım etme veya kayıp cebelüyü arama önceliğini seçer.
- Dönüşte tımar genişlemesi otomatik olmaz. İyi hizmet bir berat, nakit ihsan, yeni gelir hissesi veya yalnız itibar sağlayabilir.

## 6. Ana oynanış döngüsü

Her oyun günü şu ritmi izlemelidir:

1. **Sabah divanı:** Kethüda raporu, arzuhal, hava ve aktif görev.
2. **Saha işi:** Teftiş, soruşturma, üretim veya NPC görevi.
3. **Talim/bakım:** Oyuncu ve cebelü becerisi, at ve teçhizat bakımı.
4. **Riskli faaliyet:** Devriye, yolculuk, av, eşkıya veya askerî görev.
5. **Akşam hesabı:** Harcanan erzak, köy güveni, yaralanma, söylenti ve ertesi gün kararı.

Bu döngü, açık dünyayı amaçsız dolaşımdan çıkarır; fakat her adımı zorunlu yapmamak gerekir. Oyuncu bir günü yalnız talimle veya yönetimle geçirebilmelidir.

## 7. İlerleme sistemi

Tek bir genel XP yerine beş ayrı ustalık önerilir:

| Ustalık | Nasıl gelişir | Oynanış etkisi |
|---|---|---|
| Binicilik | parkur, zor yürüyüş, at bakımı | daha az at yorgunluğu, keskin dönüş |
| Yay | mesafe, hareketli hedef, atlı atış | daha dengeli nişan, daha hızlı kurma |
| Mızrak | geçiş saldırısı, saf talimi | daha güvenli menzil, at üstü darbe |
| Kılıç-kalkan | kontrollü talim ve gerçek dövüş | blok maliyeti, toparlanma, kombo |
| İdare | adil karar, doğru kayıt, başarılı ikmal | daha doğru rapor, düşük maliyet, sadakat |

Ek olarak üç itibar ekseni olmalıdır:

- **Sancak itibarı:** Emir ve yoklama disiplini.
- **Reaya güveni:** Adalet, ölçülü vergi ve koruma.
- **Bölük sadakati:** Pay, bakım, risk ve komuta kalitesi.

Bir kararın üçünü birden yükseltmemesi oyunun temel gerilimini yaratır.

## 8. Talim tasarım tablosu

| Talim | Başlangıç hedefi | İleri hedef | Savaşta karşılığı |
|---|---|---|---|
| Kalkan | 5 darbeyi blokla | yönlü blok ve savuşturma | şövalye yaya safhası |
| Kılıç | 3 hedef bölgesi | dayanıklılık koruyarak seri | dar koridorda dövüş |
| Mızrak | sabit kukla | atlı geçiş ve formasyon | öncü temas/karşı hücum |
| Yay | 15–30 m hedef | hareketli ve atlı hedef | kazık hattına çekilme |
| At | slalom ve duruş | dar geçit, grup sürüşü | Rumeli yürüyüşü |
| Bölük komutu | takip/bekle | saf değişimi, kontrollü ricat | Niğbolu'nun tüm safhaları |
| Keşif | iz bul | görünmeden sayı/rota çıkar | gece keşfi |
| İkmal | listeyi tamamla | ağırlık-hız dengesi | sefer kayıpları |

Her talim bronz/gümüş/altın derece verebilir; fakat görevi yalnız altınla geçmek gerekmemelidir. Bronz oyuncuyu ilerletir, yüksek derece savaşta küçük ama hissedilir kolaylık sağlar.

## 9. Oynanış geliştirme planı

### 9.1 Hedef oyun hissi

Proje teknik ve görsel ölçekte doğrudan büyük AAA oyun stüdyolarının fotogerçekçi tarzıyla yarışmaya çalışmamalıdır. Daha gerçekçi hedef, sistemik bir tarihsel aksiyon-RPG ile sürükleyici bir köy/sefer simülasyonunun kesişimidir:

- Dövüş kolay öğrenilir, zamanlama ve mesafe ile ustalaşılır.
- At yalnız hızlı seyahat aracı değil, bakım isteyen savaş ortağıdır.
- Köy yönetimi menüde sayı çevirmekten ibaret değildir; alınan karar dünyada görünür.
- Görev başarısı yalnız öldürme sayısıyla ölçülmez.
- Tarihsel ağırlık, oyuncuyu yavaşlatan angarya değil anlamlı karar kaynağıdır.

### 9.2 Hareket ve kamera

Mevcut yürüme ve koşma hızları bir insan ölçeği için oldukça yüksek hissedebilir. Anlık hız değişimi de karaktere ağırlık vermiyor.

Yapılacaklar:

- Yürüme, hızlı yürüme ve koşmayı üç ayrı hız olarak düzenle.
- Hıza anında geçmek yerine ivmelenme ve yavaşlama ekle.
- Yokuş, çamur, taş yol, tarla ve kapalı mekân hız/kuvvet tüketimini değiştirsin.
- Zıplamayı sık kullanılan FPS hareketi olmaktan çıkar; engel aşma ve alçak tırmanma ekle.
- Birinci şahısta kafa sallanmasını hız, zemin ve yorgunluğa bağla; hassasiyet ve kapatma seçeneği ver.
- Üçüncü şahıs kamerada omuz değiştirme, duvar çarpışması ve yumuşak takip kullan.
- Kapı, merdiven, dar sokak ve NPC kalabalığında kamera ile gövdenin ayrışmasını engelle.
- Oyuncuya görüş açısı, sallanma, hareket bulanıklığı ve kamera sarsıntısı ayarı sun.

Kabul ölçütü: Oyuncu yürüyüş, koşu ve at sürüşünü yalnız ekran hızından değil kamera, ses ve animasyon ağırlığından ayırt edebilmeli.

### 9.3 Yakın dövüş

Mevcut sistem mesafe ve bakış açısı kontrolünden sonra sabit hasar uyguluyor. Tarihsel aksiyon oyunu için aşağıdaki katmanlar gerekir:

1. **Yönlü saldırı:** Sağ, sol, üst ve saplama.
2. **Yönlü savunma:** Kalkan genel koruma sağlar; silahla blok doğru yön ister.
3. **Hazırlık ve aktif vuruş karesi:** Silah her animasyon anında hasar vermemeli.
4. **Silah menzili:** Kılıç ucu, kabza ve mızrak ucu farklı sonuç vermeli.
5. **Zırh ilişkisi:** Kesme, delme ve künt hasar zırha göre değişmeli.
6. **Denge/direnç:** Her darbe karakteri aynı biçimde savurmamalı; ağır zırhlı hedefin direnci olmalı.
7. **Kısa vurgu:** Başarılı darbede 40–80 ms hit-stop, uygun ses, küçük kamera/VFX tepkisi.
8. **Yaralanma:** Kol, bacak ve gövde yaraları geçici oynanış etkisi oluşturmalı; aşırı parçalanma gerekmiyor.
9. **Teslim olma:** Düşük moralli düşman her zaman ölümüne dövüşmemeli.
10. **Dost vuruşu ve hukuk:** Köylüye veya dosta saldırının tanık, kaçış ve suç sonucu olmalı.

Hasar sayıları ekranda sürekli uçuşmamalıdır. Oyuncu darbeyi animasyon, ses, duruş, kan/giysi izi ve rakibin davranışından anlamalı; sayısal gösterim erişilebilirlik seçeneği olabilir.

### 9.4 At ve atlı savaş

- Atın yürüme, tırıs, dörtnal ve ani duruş durumları ayrı olsun.
- Dönüş yarıçapı hıza göre büyüsün; at motosiklet gibi kendi ekseninde dönmesin.
- Hız, binici ve silah doğrultusu atlı darbenin gücünü etkilesin.
- Mızrak geçiş saldırısı için doğru mesafe ve açı gereksin.
- Atın korku/ürküme değeri; ateş, kazık, bağırış ve kalabalıktan etkilensin.
- At yaralanabilsin fakat her çarpışmada oyuncuyu yere fırlatmasın.
- Binme/inme anlık görünmez geçiş yerine kısa animasyon ve güvenli konum kontrolü kullansın.
- Nal, yem, dinlenme ve yük, sefer hazırlığının parçası olsun.
- At NPC'lerin ve duvarların içinden geçmemeli; düşük hızda itme, yüksek hızda çarpışma sonucu üretmeli.

### 9.5 Okçuluk

Mevcut güç doldurma ve parabolik ok çekirdeği korunabilir. Geliştirme sırası:

- Yay tam çekimde sonsuza kadar tutulamasın; kol titremesi artsın.
- Ok türleri az ve anlamlı olsun: talim oku, savaş oku, sınırlı zırh delici uç.
- Ok hedefe yalnız AABB ile değil, gerçek çarpışma noktası ve yüzey normaliyle saplansın.
- Mesafe, rüzgâr ve at hareketi nişanı etkilesin.
- Crosshair her zaman görünmesin; yay çekilirken ve zorluk ayarına göre açılsın.
- Cephane fiziksel sadakta gösterilsin.
- NPC okçuları dostların içinden ateş etmesin; görüş hattı ve emniyet açısı kullansın.

### 9.6 Yapay zekâ

Mevcut köylüler saat durumuna göre hedef noktaya düz çizgide ilerliyor. Bu, yaşayan köy izlenimi başlatıyor fakat çarpışma ve sosyal tepki üretmiyor.

Köy AI katmanları:

- Navmesh veya düğüm tabanlı yol bulma.
- Dar kapı ve sokaklarda yerel kaçınma.
- Meslek için gerçek çalışma noktaları ve kısa iş animasyonları.
- Yağmur, gece, yangın, kavga ve saldırıya tepki.
- Oyuncunun çekili silahına bakma, uzaklaşma veya muhafıza haber verme.
- Tanık sistemi: Her suç bütün köy tarafından sihirli biçimde bilinmemeli.
- Hafıza: NPC son yardım, hakaret, borç veya saldırıyı hatırlamalı.
- Sosyal kümeler: Her NPC aynı meydanda rastgele dolaşmamalı; aile, meslek ve ibadet ilişkileri olmalı.

Savaş AI katmanları:

- Algılama, tehdit seçimi ve görüş hattı.
- Tek tek saldırmak yerine mesafe paylaşımı ve kuşatma sınırı.
- Kalkanlı, mızraklı ve okçu rollerinin farklı davranması.
- Moral, yaralanma, komutan kaybı ve geri çekilme.
- Bölük emri: takip, tut, açıl, toplan, kontrollü çekil, saldır.
- Uzak birliklerde sadeleştirilmiş istatistiksel simülasyon; oyuncuya yakın birliklerde tam animasyon/fizik.

### 9.7 Görev ve dünya etkileşimi

- Etkileşim yalnız `[E] konuş` olmamalı: incele, al, taşı, teslim et, onar, iz sür ve mühürle fiilleri eklenmeli.
- Görev işaretçisi doğrudan çözümü göstermemeli. Önce bölgeyi gösterip kanıt yaklaştığında daralmalı.
- Bir görevin savaş, ikna, ödeme, hukuk ve gizlilik çözümlerinden en az ikisini desteklemesi hedeflenmeli.
- Görev alanından çıkmak her zaman başarısızlık olmamalı; zaman veya dünya durumu ilerlemeli.
- Başarısızlık içerik üretmeli. Yanlış kişiyi suçlamak yeni bir güven/ticaret sorunu açmalı.
- Diyalog seçeneklerinde sonuç açıkça yazılmamalı; karakter bilgisi ve önceki kanıtlar doğru kararı kolaylaştırmalı.
- NPC'ler yalnız görev aktifken var olan eşya gibi davranmamalı; görev öncesi ve sonrası replik/durumları olmalı.

### 9.8 Ekonomi ve tımar yönetimi

Mevcut sistemde çok sayıda eylem anında akçe veya kalıcı gelir veriyor. Bu, kısa sürede para enflasyonu ve anlamsız ödül döngüsü yaratır.

- Akçe, zahire, hayvan, iş gücü ve itibar ayrı kaynaklar olarak korunmalı.
- Gelir mevsimsel olmalı; her görev doğrudan para vermemeli.
- Tamir, yem, ok, ilaç, yolculuk ve cebelü ücreti düzenli gider oluşturmalı.
- Hasat kararı kış stoku, pazar fiyatı ve sefer erzağı arasında çatışma yaratmalı.
- İnşaat yalnız yüzde artırmamalı; değirmen gerçekten üretim süresini ve köy görünümünü değiştirmeli.
- Fiyatlar NPC menüsünde sabit kalmak yerine kıtlık, yol güvenliği ve ilişkiye göre dar bir aralıkta değişmeli.
- Oyuncu reayadan sınırsız tahsilat yapamamalı; kayıtlı yükümlülük, gecikme ve itiraz bulunmalı.
- Ganimet doğrudan temiz akçe olmamalı; taşıma, bölüşme, hak iddiası ve satış gerektirmeli.

### 9.9 Kullanıcı arayüzü ve erişilebilirlik

Mevcut HUD ekranın büyük bölümünü dört koyu panel, kontrol yardım şeridi ve radar ile kaplıyor. Köyün ve savaşın görülmesi için arayüz bağlamsal hale gelmelidir.

- Normal keşifte yalnız küçük sıhhat/kuvvet, pusula ve bağlamsal etkileşim göster.
- Akçe, ambar, cebelü ve asayişi sürekli HUD yerine tımar defterine taşı.
- Aktif görev kartını birkaç saniye sonra tek satıra küçült.
- Kontrol yardımını yalnız ilk kullanımda ve ayarlar ekranında göster.
- Dairesel “taktik radar” yerine keşfedilmiş bilgiye dayalı sade kroki veya erişilebilirlik seçeneği kullan.
- Emoji ağırlığını azalt; tutarlı SVG/ikon seti oluştur.
- Cinzel benzeri başlık karakterini yalnız başlıklarda kullan; küçük metinde okunaklı yerel font kullan.
- Google fontlarını çevrimiçi yüklemek yerine uygulamayla paketle.
- Metin boyutu, altyazı, yüksek kontrast, renk körlüğü, ekran sarsıntısı ve tuş atama seçenekleri ekle.
- Görev, savaş ve ekonomi bildirimlerini ayrı önem seviyelerine böl; aynı anda en fazla üç bildirim göster.

### 9.10 Ses ve geri bildirim

Grafik kadar oyun hissini etkileyen ses katmanları:

- Taş, toprak, ahşap ve çamur için ayrı ayak/nal sesleri.
- Uzaklık ve mekâna göre demirci, pazar, hayvan, rüzgâr ve ibadet ambiyansı.
- Kılıcın havayı kesmesi, kalkana, kumaşa, ahşaba ve metale vurması için ayrı sesler.
- Kapalı hamam, mescid ve han için basit yankı bölgeleri.
- NPC konuşmasına tam seslendirme zorunlu değil; nefes, selamlama ve tepki sesleri yeterli olabilir.
- Müzik sürekli kahramanlık tonu taşımamalı; köy, yol, gerilim, yas ve savaş sonrası için ayrı duygu paleti olmalı.

## 10. Grafik ve teknik görsellik geliştirme planı

### 10.1 Mevcut görsel teşhis

Çalışan sürümde görülen başlıca problemler:

- Gündüz sahnesi fazla parlak ve düşük kontrastlı; beyaz duvarlar, zemin ve gökyüzü birbirine yaklaşıyor.
- Güçlü güneş, dolgu ışığı, çevresel yansıma ve bloom aynı anda sahneyi aydınlatıyor.
- Yapıların büyük kısmı keskin kutu/silindir geometrilerinden oluşuyor; kenar aşınması ve küçük siluet ayrıntıları yok.
- Altın renkli metal malzeme çok sık ve çok parlak kullanıldığı için değerli metal hissi yerine plastik/sarı yüzey hissi veriyor.
- Taş yol dokusu yüksek kontrastlı, çok düzenli ve geniş alanda tekrar ediyor.
- Köy ölçeği ile cami, hamam, kale ve yolların ölçeği birbiriyle yarışıyor.
- Zemin ile yapıların temasında kir, nem, çimen veya döküntü olmadığı için nesneler zemine oturmuyor.
- Bitki örtüsü seyrek; ufuk ve çevre “oyun alanı” sınırını hissettiriyor.
- Birinci şahıs kılıcı büyük ve ekranın önemli bir kısmını kaplıyor.
- NPC ve hayvanlar aynı prosedürel parça dilini taşıyor; yüz, kumaş ve animasyon çeşitliliği düşük.
- HUD, görsel dünyanın önüne geçiyor.

### 10.2 Sanat yönü kararı

Önerilen yön “kesin fotogerçekçi AAA grafikler” değil, **stilize fakat malzeme ve ölçeği inandırıcı tarihsel dünya** olmalıdır.

Bu yaklaşımın kuralları:

- Düşük/orta poligon siluetler korunabilir; fakat kenarlar bevel ve normal ile ışık yakalamalı.
- Renk paleti toprak, kireç, ahşap, yün, demir ve solmuş boya üzerine kurulmalı.
- Doygun altın, mavi ve kırmızı yalnız odak noktalarında kullanılmalı.
- Yapılar kusursuz simetrik ve yeni görünmemeli; küçük eğrilik, onarım ve malzeme farkı olmalı.
- Tarihsel doğruluk, her nesneyi kahverengi yapmak anlamına gelmemeli; boyalı dokuma, sancak, pazar ve baharat kontrollü renk kaynağı olabilir.

Bir sayfalık sanat anayasası hazırlanmalı: renk paleti, ölçek tablosu, yüzey örnekleri, ışık referansı, siluet dili ve yasaklanan anakronik biçimler.

### 10.3 Işıklandırma ve renk

İlk grafik işi yeni efekt eklemek değil mevcut ışığı kalibre etmektir.

- Nötr gri küre, beyaz/alçı yüzey, ten, ahşap ve metal içeren bir test sahnesi oluştur.
- Güneş, hemisphere ve fill ışığını ayrı ayrı ölçerek ayarla; her biri aynı gölgeyi doldurmamalı.
- Bloom yalnız güneş diski, ateş, çok parlak yansıma ve belirli VFX eşiklerinde görünmeli.
- Ton eşleme pozlamasını saat bazında küçük aralıkta değiştir; öğlen beyazlarını kırpma.
- Gölge rengini tamamen siyah yapma; fakat mevcut sisli beyaz görüntüden daha belirgin temas gölgesi üret.
- SSAO'yu büyük beyaz hale yerine köşe ve temas derinliği verecek düşük yarıçapta ayarla.
- İç/dış mekân geçişinde 0,5–1 saniyelik göz uyumu kullan.
- Sis yoğunluğu sabit olmamalı; sabah, yağmur, sıcak öğle ve gece için farklı değerler tanımla.
- Renk düzenlemeyi tek “sinematik LUT” ile ezmek yerine gündüz, gün batımı, gece ve iç mekân profillerine ayır.

Kabul ölçütü: Beyaz sıva üzerinde doku, gölgede yüz ayrıntısı ve metal üzerinde malzeme farkı aynı karede okunabilmeli.

### 10.4 Malzeme ve doku

- Her temel yüzey için base color, normal, roughness ve AO üret.
- Aynı taş/ahşap dokusunu bütün dünyaya yayma; 3–5 varyant ve vertex-color tonu kullan.
- Büyük yüzeylerde macro variation, yakında micro normal uygula.
- Yapı diplerine kir/nem, kapı çevresine el izi/aşınma, yola teker izi ve çamur decal'i ekle.
- Taş yoldaki derzleri daha az beyaz ve daha düzensiz yap.
- Metalness yalnız gerçek metallere verilmeli; boyalı sarı yüzey altın değildir.
- Kumaşta kaba normal, renk solması ve dikiş/kenar varyasyonu kullan.
- Trim sheet ve atlaslarla ev, kale ve atölye parçalarını ortaklaştır; draw call sayısını düşür.
- Doku çözünürlüğünü nesnenin ekrandaki önemine göre belirle; her küçük eşya 2K olmamalı.

### 10.5 Mimari ve çevre modelleme

Öncelik sırası:

1. Oyuncunun ilk gördüğü köy meydanı.
2. Sipahi konağı ve talim alanı.
3. Han/demirci/pazar görev ekseni.
4. Sancak kalesi.
5. Gelibolu ve Niğbolu özel sahneleri.
6. Hamam ve ikincil iç mekânlar.

Her yapı için:

- Gerçek insan, kapı, at ve araba ölçülerinden oluşan ortak ölçek cetveli kullan.
- Keskin 90 derece köşelere küçük bevel ekle.
- Çatı saçakları, taşıyıcı kiriş, oluk, eşik, menteşe ve baca gibi siluet ayrıntıları oluştur.
- Duvar/çatı birleşimini boş bırakma; ahşap hatıl veya sıva kırığı kullan.
- Aynı ev kitinden 8–12 görünür varyant üret: kat, çıkma, çatı yönü, sıva ve eklenti.
- İç mekânı dış kabuğun içine sonradan sıkıştırma; kapı/pencere ve dolaşım baştan birlikte tasarlansın.

### 10.6 Arazi ve bitki örtüsü

- Düz 550×550 zemin yerine oynanış rotalarını destekleyen yumuşak yükseklik, dere yatağı ve tarla terasları kullan.
- Zemin materyalini çimen/toprak/taş/çamur katmanları arasında yükseklik ve eğime göre karıştır.
- Çimen, çalı, saz ve küçük taşları `InstancedMesh` ile dağıt.
- Oyuncuya yakın bitkide rüzgâr hareketi, uzakta sade impostor/LOD kullan.
- Ağaçları eşit aralıkta rastgele koyma; su, yol, tarla sınırı ve orman ekolojisine göre kümelendir.
- Tarlayı sarı düzlem değil; sıra, ezilme, hasat durumu ve rüzgâr dalgasıyla göster.
- Ufku dağ konileriyle kapatmak yerine katmanlı arazi, uzak sis ve düşük maliyetli siluet kullan.

### 10.7 Karakterler ve animasyon

En büyük algısal kalite artışı post-process değil karakter animasyonundan gelecektir.

- Tüm insanlar için ortak humanoid iskelet ve yeniden hedeflenebilir animasyon yapısı kur.
- Temel set: idle, yürüme, koşma, dönüş, konuşma, oturma, uyuma, taşıma, çalışma, yaralanma, ölüm.
- Savaş seti silah tipine göre ayrılmalı: kılıç-kalkan, mızrak, yay ve silahsız.
- Ayak kaymasını azaltmak için hız ile animasyon adımını eşleştir.
- Baş/göz bakışı, NPC konuşmalarını büyük ölçüde canlandırır.
- Yüzde tam sinema kalitesi yerine birkaç kaş/ağız ifadesi ve konuşma çene hareketi yeterli olabilir.
- Vücut, yaş, ten, sakal, başlık ve kumaş parçalarını modüler yap; renk değiştirmek tek çeşitlilik yöntemi olmasın.
- Uzak NPC'lerde animasyon güncelleme hızını ve kemik sayısını düşüren LOD kullan.
- At için ayrı iskelet, dört hız animasyonu, dönüş, şahlanma, düşme ve binici bağlantı noktaları oluştur.

### 10.8 VFX ve hava

- Toz yalnız dekor değil zemin ve hıza bağlı olmalı.
- Yağmur, çamur ve ıslaklık materyal roughness değerini geçici değiştirmeli.
- Kar zorunlu değil; kampanya eylülde bittiği için yağmur, sis ve sıcak hava daha değerlidir.
- Kan miktarını sınırlı tut; zırh/kumaş üzerinde küçük leke ve darbede kısa parçacık yeterli.
- Ateş, duman ve kıvılcım rüzgâr yönüyle uyumlu hareket etmeli.
- Ok, kılıç, kalkan ve taş darbelerinde yüzeye özgü parçacık kullanılmalı.
- Niğbolu savaşında uzak toz bulutu ve ses, görünmeyen binlerce askerin ölçeğini ucuz biçimde hissettirebilir.

### 10.9 Arayüz görsel yenilemesi

- Koyu altın çerçeveli bütün panelleri aynı anda kullanma; ana HUD yarı saydam ve daha nötr olsun.
- Parşömen estetiğini yalnız defter, ferman, harita ve karar ekranlarında kullan.
- Görev işaretçisi emoji değil, sanat yönüne uygun sade sancak/mühür ikonu olsun.
- Dünya üstü işaretçileri duvar arkasından sürekli görünmesin; keşif ve mesafeye bağlı olsun.
- Sıhhat/kuvvet çubukları küçük, okunabilir ve hasar anında belirginleşen yapıda olsun.
- Diyalogta karakter adı, rol, metin ve seçenekler arasında güçlü hiyerarşi kur.
- Başlangıç ekranında rastgele karakter ile HUD aynı portre, ad ve tımarı kullanmalı.

### 10.10 Performans bütçesi

Hedef donanım kesinleştikten sonra sayılar profillemeyle güncellenmek üzere ilk bütçe:

| Kalem | Orta kalite ilk hedefi |
|---|---|
| Çözünürlük/kare | 1080p, kararlı 60 FPS |
| Ana köy draw call | tercihen 700 altında |
| Görünür üçgen | yaklaşık 1–1,5 milyon altında |
| Tam AI/animasyon NPC | oyuncu yakınında 20–30 |
| Sadeleştirilmiş NPC | 50–100 |
| Gölge veren hareketli varlık | önem ve mesafeye göre 100–150 altında |
| Dinamik noktasal ışık | aynı karede gölgeli olanlar çok sınırlı |
| Doku | atlas/trim ağırlıklı 1K–2K; kahraman varlıkta gerekirse daha yüksek |

Bu sayılar garanti değil başlangıç hedefidir. Her ana sahne için GPU süresi, CPU/AI süresi, draw call, üçgen, doku belleği ve gölge maliyeti kaydedilmelidir.

Teknik önlemler:

- Ev parçaları, bitki, yol taşı ve kalabalıkta instancing.
- Karakter, yapı ve bitkide en az üç LOD.
- Kamera dışında frustum, uzak bölgede mesafe ve mümkünse occlusion culling.
- Statik yapıların gölge/aydınlatmasında seçici bake veya düşük maliyetli çözümler.
- Post-process kalite kademeleri; SSAO ve bloom düşük ayarda kapatılabilmeli.
- Dinamik ışıkları oda/bölge bazında açıp kapatma.
- Büyük savaşta yakın simülasyon + uzak temsil ayrımı.
- `devicePixelRatio` için dinamik veya kullanıcı seçilebilir render ölçeği.

### 10.11 Grafik geliştirme sırası

#### Grafik A — Bir haftalık görünür iyileştirme

- Pozlama, güneş, fill ve bloom kalibrasyonu.
- HUD'un sadeleştirilmesi.
- Kılıç ekran kaplama oranının azaltılması.
- Taş yol kontrast/tekrar düzeltmesi.
- Altın materyal kullanımının azaltılması.
- Yapı diplerine basit kir/çimen decal'i.

#### Grafik B — Dört haftalık sanat dikey kesiti

- Köy meydanını yeni ölçek ve modüler kit ile yenile.
- Demirci, han ve bir ev için tam PBR materyal seti.
- Bir erkek, bir kadın ve bir cebelü için rig/animasyon standardı.
- Çimen/çalı/taş instancing ve zemin katmanları.
- Gündüz, gün batımı ve gece ışık profilleri.

#### Grafik C — Sekiz-on iki haftalık dünya geçişi

- Bütün köy yapılarının modüler dönüşümü.
- NPC çeşitlilik ve meslek animasyonları.
- At modeli/animasyonu ve atlı savaş görsel tepkileri.
- Hava, ıslaklık, yüzey VFX ve ortam sesi.
- Kale ve Gelibolu özel sanat geçişi.

#### Grafik D — Niğbolu üretimi

- Ayrı savaş alanı sanat seti.
- Uzak ordu impostor/animasyon sistemi.
- Kalabalık LOD ve savaş tozu.
- Sancak, birlik silueti ve dost/düşman okunabilirliği.
- Savaş öncesi gece, savaş sabahı ve savaş sonrası ışık profilleri.

## 11. Tarihsel atmosfer için sanat ve dil yönü

### Yerleşim

- 18–30 haneli köyü kent ölçeğinde anıtsal yapılarla doldurmak yerine kerpiç/ahşap evler, küçük mescid, çeşme/kuyu, harman, ağıl, ambar ve atölye öne çıkarılmalı.
- Büyük hamam “her köyde standart bina” olmamalı. Bir vakıf yapısı, eski kaplıca veya yol üzerindeki kasaba hamamı olarak özel yerleşime bağlanmalı.
- Kale ve Bursa gibi merkezler köyden belirgin ölçüde daha zengin olmalı.
- Bursa Ulu Cami 1396 kampanyasında “yeni inşa edilen/zafer sonrasında inşası süren yapı” olarak kullanılabilir; tamamlanmış tarihî dekor gibi kullanılmamalı.

### Teçhizat

- “Kazasker zırhı” kaldırılmalı.
- Seviye isimleri malzeme ve işçilik üzerinden kurulmalı: keçe/deri koruma, örme zırh, levha takviyeli örme, iyi işçilikli miğfer gibi.
- Süslü ve geç dönem silah biçimleri yerine 14. yüzyıl sonu Anadolu-Balkan görsel kaynakları esas alınmalı.
- “Şam çeliği her zırhı kâğıt gibi keser” türü efsanevî ifadeler yerine bakım, ağız, denge ve işçilik konuşulmalı.

### Dil

Karakterlerin dili anlaşılır modern Türkçe olmalı; yalnız terimler dönem hissi vermelidir. Aşırı yapay Osmanlıca ve sürekli dinî slogan, karakterleri birbirine benzetir.

Önerilen terim değişiklikleri:

- “Taktik radar” → “Keşif krokisi” veya yalnız “Harita”
- “Masöz” → “Tellak”
- “12'den vurmak” → “Göbek isabeti”
- “Kılıçtan geçir” → görev bağlamına göre “etkisiz hâle getir”, “yakala”, “dağıt”
- “Küffar” → yalnız bunu kullanması karakterine uygun belirli NPC'lerde; sistem anlatıcısında “Haçlı ordusu”

## 12. Teknik görev mimarisi önerisi

Görevleri doğrudan diyalog içinden tamamlamak yerine veri güdümlü bir durum makinesine taşımak gerekir.

Örnek görev verisi:

```js
{
  id: 'water_dispute',
  chapter: 2,
  historicalConfidence: 'C',
  state: 'available',
  prerequisites: ['timar_arrival'],
  deadline: { days: 2 },
  objectives: [
    { id: 'inspect_canal', type: 'inspect', target: 'canal_break' },
    { id: 'hear_witnesses', type: 'dialogue_set', targets: ['hane_a', 'hane_b'] },
    { id: 'decide', type: 'choice', options: ['mediate', 'refer_to_kadi', 'force'] }
  ],
  outcomes: {
    mediate: { reayaTrust: 8, time: -1 },
    refer_to_kadi: { legalStanding: 10, akce: -20 },
    force: { akce: 60, reayaTrust: -15, migrationRisk: 1 }
  }
}
```

Gerekli altyapı:

- Tek takvim otoritesi ve tarih çevirimi.
- `locked / available / active / resolved / failed` durumları.
- Önkoşul, son tarih ve birbirini dışlayan görev dalları.
- Diyalog, dövüş, talim ve keşiften olay alan bir event bus.
- Deterministik kayıt: rastgele sonuçlar seed ile saklanmalı.
- Görev başına tarih güven etiketi ve kodeks bağlantısı.
- Savaş için bölüm/karşılaşma yükleme sistemi; açık dünya sahnesine binlerce birim eklemeye çalışma.

## 13. Geliştirme yol haritası

Süreler bir ana geliştirici ve dönemsel sanat/ses desteği varsayımıdır.

### Aşama 0 — Sağlamlaştırma (1 hafta)

- Eksik görev hedef işlevini düzelt.
- Harami öldürme olay adını eşleştir.
- Takvimi tek sisteme bağla; 1396 başlangıç kararını uygula.
- Niğbolu cebelü gereksinimini tek değere indir.
- HUD ve prosedürel profil tutarlılığını düzelt.
- Kayıt/yükleme ve görev durumu için temel testler ekle.

Çıkış ölçütü: 30 dakika oyunda konsol hatası yok; gün değişir; görev ve HUD aynı kişiyi/tarihi gösterir.

### Aşama 1 — Dikey kesit: Dirlik (4–6 hafta)

- Bölüm 0–3'ü uygula.
- Bir kanıt inceleme görevi ve bir gecikmeli sonuç zinciri ekle.
- Reaya güveni, sancak itibarı ve bölük sadakati değerlerini ayır.
- Sabah/akşam günlük döngüsünü kur.

Çıkış ölçütü: Oyuncu savaşmadan 60–90 dakikalık anlamlı bir oturum oynayabilir; en az üç farklı tımar sonucu oluşur.

### Aşama 2 — Talim ve sefer hazırlığı (4–6 hafta)

- Kalkan, kılıç, mızrak, at ve bölük komut talimlerini tamamla.
- Mevcut okçuluğu ustalık sistemiyle bağla.
- Yoklama, teçhizat aşınması, at yorgunluğu ve ikmal listesini ekle.
- Bölüm 4–9'u uygula.

Çıkış ölçütü: Bütün talimler tekrar oynanabilir; düşük ve yüksek hazırlık Rumeli yürüyüşünde ölçülebilir fark üretir.

### Aşama 3 — Rumeli seferi (5–7 hafta)

- Gelibolu geçişi ve Rumeli ordugâhı sahnelerini yap.
- Çok dilli ordugâh NPC'leri ve tercüman diyaloglarını ekle.
- Yürüyüş, keşif ve ikmal karşılaşmalarını kur.
- Bölüm 10–13'ü tamamla.

Çıkış ölçütü: Tımardaki en az beş eski karar seferde yeni diyalog, kaynak veya risk olarak geri döner.

### Aşama 4 — Niğbolu savaş dikey kesiti (8–12 hafta)

- Beş safhalı savaş alanını kur.
- Bölük komutları, dost AI, hedef önceliği ve kontrollü geri çekilmeyi geliştir.
- Birim sayısı için LOD, instancing ve uzak savaş simülasyonu kullan.
- Safha bazlı checkpoint ve başarısızlık kurtarması ekle.
- Bölüm 14–15'i tamamla.

Çıkış ölçütü: Tarihsel sonuç her zaman Osmanlı zaferidir; oyuncu performansı en az altı kişisel/sefer sonucu üretir; savaş hedef donanımda kararlı kare hızında çalışır.

### Aşama 5 — Tarih, sanat, erişilebilirlik ve denge (4–6 hafta)

- Tarih danışmanı ile terim, mimari, teçhizat ve görev denetimi.
- Kodeks ve A/B/C/R kaynak etiketleri.
- Altyazı, renk körlüğü, tuş atama, hareket hassasiyeti ve zorluk ayarları.
- Ekonomi sömürüsü, görev kilitlenmesi ve kayıt uyumluluğu testleri.
- İlk 30 dakika ve Niğbolu savaşı için oyuncu testleri.

## 14. Öncelik sırası

### Hemen yapılmalı

1. Çalışma zamanı görev/HUD hataları.
2. 1396 takvim kararı.
3. Tıklamayla sonuçlanan Niğbolu finalinin kaldırılması.
4. Konuşmayla biten cebelü görevinin gerçek talime çevrilmesi.
5. Tek eksenli “moral/asayiş” yerine reaya, sancak ve bölük ilişkileri.

### Sonraki sürüm

1. Kanıt/soruşturma sistemi.
2. Yoklama ve ikmal.
3. Gelibolu-Rumeli ara sahneleri.
4. Safhalı Niğbolu savaşı.

### Ertelenebilir

- 1397 Karaman seferi.
- 1402 Ankara alternatif tarih senaryosu.
- Büyük kasaba hamamının ayrıntılı ritüel sistemi.
- Daha fazla rastgele tımar bölgesi.

1397 ve 1402, ana 1396 kampanyasına sıkıştırılmamalı. Ayrı bölüm veya genişleme olarak daha değerlidir. Özellikle 1402'de Timur'un yenildiği alternatif tarih, tarihsel ana oyunun tonu ve vaatlerinden açıkça ayrılmalıdır.

## 15. Geliştirmede özellikle dikkat edilmesi gereken noktalar

### Kapsam ve üretim

- Aynı anda köy simülasyonu, büyük savaş, yeni şehir, çok oyunculu ve fotogerçekçi grafik hedeflenmemeli. Önce tek bir kaliteli dikey kesit bitirilmeli.
- Her yeni özellik en az bir görevde gerçek karar veya beceri üretmiyorsa eklenmemeli. Yalnız özellik listesinde görünmesi yeterli değildir.
- Yüksek bütçeli AAA kalite beklentisi oluşturacak kıyaslar ekip ve oyuncu beklentisini yanlış büyütür. Projenin özgün gücü sistemik tımar/sefer bağlantısıdır.
- Kahraman varlıklar—oyuncu, at, cebelü, köy meydanı ve ana silah—yalnız prosedürel primitive modellerle bırakılmamalı.
- Tarih araştırması tamamlanmadan bütün sanat varlıkları üretilmemeli; yanlış bir mimari kararın onlarca modele yayılması pahalı olur.

### Sistem bütünlüğü

- Aynı veri iki farklı yerde tutulmamalı. Tarih, sipahi adı, aktif görev ve cebelü gereksinimi için tek kaynak olmalı.
- Diyalog sistemi doğrudan ekonomi ve görev durumunu gelişigüzel değiştirmemeli; bütün sonuçlar ortak olay/komut katmanından geçmeli.
- Rastgele sonuçlar kayıt dosyasına seed ve alınan kararlarla birlikte yazılmalı.
- Kayıt sürümü tutulmalı; görev veri yapısı değişince eski kayıtlar sessizce bozulmamalı.
- Ana görev çevrimiçi Gemini hizmetine bağlı olmamalı. Yapay zekâ değerlendirmesi kullanılacaksa çevrimdışı, deterministik ve test edilebilir yedek sonuç bulunmalı.
- Ölüm, görev eşyasının kaybı, NPC'nin yol bulamaması ve sahne dışına düşmesi için kurtarma yolu tasarlanmalı.

### Oynanış dengesi

- Tarihsel gerçekçilik her zaman daha çok sayaç demek değildir. Oyuncuya anlamlı bilgi vermeyen açlık, susuzluk ve bakım katmanları angaryaya dönüşür.
- Her sistemin karar sıklığı farklı olmalı: dövüş saniyelik, talim dakikalık, ikmal günlük, hasat mevsimlik karar üretir.
- İyi karar her değeri artırmamalı. Akçe, reaya güveni, sancak itibarı ve asker hazırlığı arasında gerçek bedel olmalı.
- Oyuncu tek bir talimi tekrar ederek bütün sefer hazırlığını aşamamalı; azalan getiri veya başarı eşiği kullanılmalı.
- Zorluk yalnız düşman canını artırmamalı; yapay zekâ koordinasyonu, zaman penceresi ve kaynak toleransı değişmeli.
- Büyük savaşta oyuncu “tek başına yüz düşman öldüren kahraman” olmamalı; saf, sancak, komut ve hayatta kalma önem taşımalı.

### Grafik ve performans

- Post-process, zayıf model ve malzemeyi saklamak için kullanılmamalı. Önce geometri, materyal, ışık; sonra efekt sırası izlenmeli.
- Her hareketli ışığa gölge verilmemeli. Özellikle hamam, meşale ve kale yolunda ışık bütçesi kontrol edilmeli.
- Büyük savaş için yüzlerce tam AI ve tam iskelet aynı anda çalıştırılmamalı; yakın/uzak simülasyon ayrımı daha ilk prototipte kurulmalı.
- Performans en sonda yapılacak temizlik değildir. Her sahne haftalık bütçe ölçümünden geçmeli.
- Yalnız güçlü geliştirme bilgisayarında test edilmemeli; hedef düşük/orta donanım erken belirlenmeli.
- Doku ve modellerin lisansları, kaynak dosyaları ve üretim notları varlıkla birlikte tutulmalı.
- Fontlar, temel sesler ve oyun için zorunlu varlıklar çevrimdışı Electron paketinde bulunmalı.

### Tarih, temsil ve ton

- Tek bir geç dönem kaynağındaki uygulama 1396 için otomatik gerçek kabul edilmemeli.
- Şüpheli veya tartışmalı olaylar kodekste rivayet/yorum olarak işaretlenmeli.
- Müslüman, Ortodoks, Katolik, Yahudi, Türk, Rum, Bulgar, Sırp, Eflaklı veya Cenevizli karakterler tek ahlâkî kalıba indirgenmemeli.
- Dinî mekânlar yalnız buff istasyonu; hamam yalnız iyileşme dükkânı; köylüler yalnız vergi kaynağı olmamalı.
- Savaş sonrası esir, yağma ve infaz konuları ya tamamen atlanmamalı ya da zafer gösterisine dönüştürülmemeli. Kaynak belirsizliği ve insanî sonuç birlikte gösterilmeli.
- Sistem anlatıcısı tarafsız ve açık olmalı; dönemsel sert ifadeler belirli karakterlerin dünya görüşü olarak kullanılmalı.

### Test ve kalite kapıları

Her ana sürüm şu kapılardan geçmeli:

1. **İşlev:** Görev başlangıçtan sona kilitlenmeden tamamlanıyor mu?
2. **Tutarlılık:** HUD, defter, dünya ve kayıt aynı veriyi mi gösteriyor?
3. **Oynanış:** Görev en az bir gerçek beceri veya karar istiyor mu?
4. **Tarih:** Kişi, tarih, terim, mimari ve sonuç kaynak etiketi aldı mı?
5. **Görsel:** Ölçek, ışık, malzeme ve animasyon hedef sanat yönüne uyuyor mu?
6. **Performans:** Hedef donanımda CPU/GPU ve bellek bütçesi içinde mi?
7. **Erişilebilirlik:** Görev işaretçisi, altyazı, kontrast ve tuşlar ayarlanabiliyor mu?
8. **Kayıt:** Bölüm öncesi, sırası ve sonrası kayıt/yükleme çalışıyor mu?

## 16. Araştırma kaynakları

Ana tarih çizgisi ve I. Bayezid dönemi:

- [TDV İslâm Ansiklopedisi — I. Bayezid](https://islamansiklopedisi.org.tr/bayezid-i)
- [TDV İslâm Ansiklopedisi — Niğbolu Savaşı](https://islamansiklopedisi.org.tr/nigbolu-savasi)
- [TDV İslâm Ansiklopedisi — Niğbolu](https://islamansiklopedisi.org.tr/nigbolu)
- [Cambridge History of Turkey — kronoloji ve dönem özeti](https://assets.cambridge.org/97805216/20932/frontmatter/9780521620932_frontmatter.htm)

Tımar ve cebelü:

- [TDV İslâm Ansiklopedisi — Tımar](https://islamansiklopedisi.org.tr/timar)
- [TDV İslâm Ansiklopedisi — Cebelü](https://islamansiklopedisi.org.tr/cebelu)
- [Nicoară Beldiceanu — Le timar dans l'État ottoman (XIVe–XVe siècles)](https://www.persee.fr/doc/efr_0000-0000_1980_act_44_1_1255)

Görsel ve mimari araştırma:

- [BnF — Jean Froissart Kronikleri ve Niğbolu tasvirleri](https://essentiels.bnf.fr/fr/livre-feuilleter/03e271f1-c313-4130-bb2f-f65edb3fde9d-jean-froissart-chroniques)
- [MIT OpenCourseWare — 14.–15. yüzyıl Anadolu dinî mimarisi](https://ocw.mit.edu/courses/4-614-religious-architecture-and-islamic-cultures-fall-2002/pages/lecture-notes/anatolia-turks/)
- [T.C. Kültür Portalı — Bursa Ulu Cami](https://kulturportali.gov.tr/turkiye/bursa/gezilecekyer/bursa-ulu-cami)
- [Erken Osmanlı Ortaköy Hamamı araştırması](https://dergipark.org.tr/en/pub/iusty/issue/24951/263373)

Kaynak kullanım notu: Froissart minyatürleri ve kronikleri Batılı bir anlatı geleneğinin ürünüdür; Osmanlı asker kıyafetini fotoğraf gibi kopyalamak için değil, savaşın Batı hafızasındaki sunumunu ve dönem görsel dilini karşılaştırmak için kullanılmalıdır.

## 17. Son tasarım ilkesi

Oyunun özgün vaadi “Osmanlı köyünde dolaşmak” değil, **emanet edilen bir dirliği savaş zamanı ayakta tutmak** olmalıdır. Her iyi görev şu üç sorudan en az ikisini oyuncuya sordurmalıdır:

1. Tarihsel rolüm benden ne istiyor?
2. Yanımdaki insanlar bunun bedelini nasıl ödüyor?
3. Bugün verdiğim karar seferde karşıma nasıl çıkacak?

Bu bağ kurulduğunda tımar defteri, talim alanı, yaşayan köy ve Niğbolu finali ayrı özellikler olmaktan çıkar; aynı oyunun birbirini besleyen parçaları hâline gelir.

## 18. Mimari ve Oyun Tasarımı Eklemeleri (Geliştirme Önerileri)

### 18.1. Dramatik Kanca (Hook) ve Yerel Antagonist (Muhalif)
Köy yönetiminde oyuncuyu kişisel bir hedefe bağlamak için erken bir muhalif karakter gereklidir. **Not:** Bu antagonist kesinlikle bir din adamı, ulema veya iyi niyetli bir Müslüman karakter olmayacaktır. Önerilen antagonist profilleri:
- Köye sızmış kılık değiştirmiş bir Bizans/Balkan casusu veya sabotajcısı.
- Akçaoba'ya dadanmış yabancı paralı askerler veya çapulcular.
- Köylüye eziyet eden ve oyuncunun tımarını baltalamak isteyen yozlaşmış bir yabancı tüccar.
Bu sayede ana tehdit Haçlı ordusu iken, yerel tehdit de dış veya fesat odaklı olur ve sipahinin koruyucu rolü (iyi yönetici) pekişir.

### 18.2. Zaman Sıkışması ve Zaman Atlama (Time-Skip)
1396 yazından Niğbolu'ya (Eylül) kadar olan süre oldukça kısadır. Hasat mevsiminin ve hazırlıkların oyuncuya "gelişim" hissi verebilmesi için zaman akışı asimetrik (bazı olaylarda haftalar atlanarak) işlenmelidir. Günlük rutinler ile mevsimsel (Ağustos hasadı gibi) dönüşümler arasında sert geçişler yapılmalıdır.

### 18.3. Fraksiyonlar ve Denge Sistemi
Tımar sadece "Köylüler" ve "Sipahi" ekseninde dönmemelidir. Sosyal fraksiyonlar kurulmalıdır:
- **Ulema/Kadı (Hukuk & Meşruiyet):** Adalet sistemini temsil ederler. Kararların hukuka (şer'i ve örfi) uygunluğu onların sipahiye desteğini belirler. (Her zaman iyi ve yol gösterici rehberler).
- **Ahiler/Esnaf:** Zanaat, pazar ekonomisi ve teçhizat tedariki.
- **Köylüler (Reaya):** İnsan gücü, tahıl ve tarım üretimi.
Oyuncu kararlarıyla bu grupların ihtiyaçlarını dengelemelidir.

### 18.4. Erken Yenilgi (Çiftbozan) Durumları
Oyuncu sadece savaş meydanında kaybetmemelidir. Eğer köydeki asayiş, adalet ve güvenlik çok kötü yönetilir ve "Reaya Güveni" dibe vurursa; köylülerin köyü terk ettiği "Çiftbozan" durumu tetiklenir. Tımar, sancakbeyinin fermanıyla oyuncunun elinden alınır ve bu erken bir "Game Over" (Başarısızlık) ekranı yaratır. 

### 18.5. Teçhizat Üçgeni (Zırh Delici vs. Kesici)
Fransız ve Macar ağır şövalyeleri (Plaka zırhlı) ile karşılaşıldığında kılıcın etkisi oldukça azalmalıdır. Oyuncu sefer öncesi köy demircisi/Ahilerden **Gürz veya Savaş Çekici (Zırh Delici/Künt)** temin etmeye zorlanmalıdır. Bu taktiksel derinlik (Hafif zırhlılara kılıç, Atlılara mızrak, Ağır zırhlı şövalyelere Gürz) oyunun savaş ekonomisini çok daha anlamlı hale getirecektir.

### 18.6. Teknik Mimari: Web Worker ve IndexedDB
Oyunun WebGL tabanlı yapısını korumak ve performansı yüksek seviyede tutmak için:
- **IndexedDB:** `localStorage` sınırı köylü yapay zekasının hafızası için yetersiz kalacaktır. RPG save sistemi IndexedDB üzerine kurulmalıdır.
- **Web Worker Kullanımı:** Niğbolu savaşı gibi çoklu birimlerin bulunduğu sahnelerde, düşman AI hesaplamaları (NavMesh yol bulma) ana iş parçacığını dondurmaması için arka plan Web Worker'larına devredilmelidir.
