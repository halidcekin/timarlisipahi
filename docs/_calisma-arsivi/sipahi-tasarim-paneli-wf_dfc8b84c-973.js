export const meta = {
  name: 'sipahi-tasarim-paneli',
  description: 'Yol haritası tasarım paneli: 6 uzman tasarımcı paralel taslak yazar, sentezci fazlara böler, 3 eleştirmen denetler',
  phases: [
    { title: 'Tasarım', detail: '6 uzman tasarımcı paralel' },
    { title: 'Sentez', detail: 'faz planı ve kabul kriterleri' },
    { title: 'Eleştiri', detail: '3 çapraz denetçi' },
  ],
}

const DIR = 'C:/Users/abdul/AppData/Local/Temp/claude/D--antigravity-sipahi/aaa9c9c1-5a69-435a-8b5e-78e5fcfec895/scratchpad/design'
const ANALIZ = 'C:/Users/abdul/AppData/Local/Temp/claude/D--antigravity-sipahi/aaa9c9c1-5a69-435a-8b5e-78e5fcfec895/scratchpad/analiz-tam.json'

const COMMON = `Sen "Mülk-i Osmanî: Tımarlı Sipahi 3D" oyununun geliştirme yol haritasını hazırlayan tasarım ekibindesin. Repo: D:\\antigravity\\sipahi (Three.js + Vite + Electron, ~7000 satır, 1396 Niğbolu dönemi Osmanlı tımar simülasyonu).

İŞVEREN HEDEFLERİ (birebir): "insanların oynarken zamanın nasıl geçtiğini anlamayacağı, küçük nükte ve espirilerin olduğu akıcı bir oyun istiyorum. aynı zamanda oynarken osmanlı ve türk tarihini öğrenecekleri, islami şeyler öğrenecekleri bir kurgu istiyorum."

HEDEF KİTLE: Bu dokümanı senden sonra HİÇ SORU SORAMAYACAK bir geliştirici uygulayacak; sonra bağımsız bir denetçi işi bu dokümana göre kabul edecek. Her önerin (a) somut, (b) mevcut koda dosya:satır ile bağlı, (c) kabul kriteri yazılabilir olmalı.

ÖNCE OKU (tamamını):
1. ${ANALIZ} — 7 ajanlık derin kod analizi (alanlar: core, entities, narrative, gameplay, ui, docs + playerTrace). ~110 doğrulanmış bug ve tüm içerik envanteri burada.
2. D:\\antigravity\\sipahi\\docs\\TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md — mevcut 901 satırlık senaryo planı. ÇELİŞME, ÜZERİNE İNŞA ET.
3. D:\\antigravity\\sipahi\\docs\\DEVELOPMENT_SPEC.md — mevcut 5 özellik talimatnamesi.

DOĞRULANMIŞ GERÇEKLER: npm test 97/97 geçiyor; npm run build çalışıyor (tek chunk >500kB uyarısı); testler gerçek modülleri import eden gerçek entegrasyon testleri.

SABİT KARARLAR (tartışmasız uygula):
- Kampanya: 1396 ilkbahar başlangıcı → 25 Eylül 1396 Niğbolu finali (TARIHSEL doc 5. bölüm yapısı).
- Tarihsellik etiketi: A (belgeli olay) / B (kuvvetli yorum) / C (dramatik bileşim) / R (rivayet) sistemi kullanılacak.
- İSLAMİ İÇERİK EHL-İ SÜNNET ÇİZGİSİNDE OLACAK (işverenin açık talebi): Osmanlı bağlamına uygun olarak Hanefî fıkhı ve Mâturîdî itikadı esas; yalnız sahih/muteber kaynaklardan; uydurma rivayet, mezhep tartışması ve modern polemik YOK.
- Din adamları, ibadet ve dinî değerler ASLA mizah nesnesi olmaz (mevcut doc 18.1 kuralı). Mizah dünyevi hayatta yaşar: esnaf, köylü, hamam, çarşı, asker arası muhabbet.
- Mevcut mimari korunur: cerrahi değişiklik, aşamalı teslim; büyük yeniden yazım YOK (solo geliştirici gerçekliği).
- Tüm dokümanlar TÜRKÇE; kod/commit İngilizce kalır.

ÇIKTIN: Sana verilen dosya yolunu Write tool ile yaz (kapsamlı, markdown, Türkçe). Sonra StructuredOutput ile file/summary/keyDecisions döndür. Dokümanın başına 1 paragraf "Bu doküman ne için" özeti koy.`

const DESIGN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'summary', 'keyDecisions'],
  properties: {
    file: { type: 'string' },
    summary: { type: 'string', description: 'En fazla 250 kelimelik özet (Türkçe)' },
    keyDecisions: { type: 'array', items: { type: 'string' }, description: 'Diğer tasarımcıları/planı etkileyen ana kararlar' },
  },
}

phase('Tasarım')

const DESIGNERS = [
  {
    key: 'akis',
    file: `${DIR}/01-akis-ve-tutundurma.md`,
    brief: `SEN: Oyun akışı ve tutundurma (flow/retention) tasarımcısısın. "Zamanın nasıl geçtiğini anlamama" hissi senin işin. Dokümanın şunları İSTİSNASIZ içermeli:
1. FLOW TEORİSİ UYGULAMASI: net hedef + anlık geri bildirim + beceri-zorluk dengesi üçlüsünün bu oyundaki somut karşılıkları. İç içe hedef döngüleri tasarla: 1-3 dk (mikro eylem), 10-15 dk (görev/gün), 45-90 dk (perde/sefer hazırlığı), kampanya (Niğbolu).
2. ZAMAN SİSTEMİ YENİDEN DENGESİ: mevcut daySpeed=0.003 (1 gün ≈ 2.2 gerçek saat) oyunu öldürüyor. Yeni değer öner + gerekçe; gün yapısını oynanışa bağla (sabah divanı → saha işi → talim → akşam hesabı, TARIHSEL doc 6. bölümdeki ritim); uyku/zaman atlama mekaniği tasarla (sedir yataklar zaten modellenmiş ama evler katı blok — teknik plana bağımlılık notu düş). Ali'nin 3 günlük mühleti, mevsimler ve hicri takvim yeni tempoda nasıl çalışır — hesapla ve tablo ver.
3. İLK 15 DAKİKA YENİDEN TASARIMI: playerTrace bulgularına dakika dakika cevap veren yeni onboarding akışı (Su İhtilafı çıkmazı, ters pusula, sefer butonunun 1. dakikada basılabilmesi çözülmüş varsayımıyla sırala; bunların fix'i teknik planda).
4. GERİ BİLDİRİM/JUICE LİSTESİ: analizde tespit edilen tüm ölü geri bildirim kanallarının (bildirim animasyonu, cameraShake, playNotification/playCoinJingle, başarımlar, dünya işaretçileri) oyuncu hissine çevrilmiş öncelik listesi; vuruş hissi senkron sorunu (hasar mousedown'da, sarsıntı %75'te) için tasarım kararı.
5. KAYIT/OTURUM: otomatik kayıt anları, oturum kapanış-açılış ritüeli ("kaldığın yer" özeti), bildirim geçmişi/olay günlüğü ekranı.
6. GÖREV ÇEŞİTLİLİĞİ KALIPLARI: TARIHSEL doc 9.7'deki fiil çeşitliliğini (incele/al/taşı/onar/iz sür/mühürle) mevcut 13 göreve uygulanabilir somut varyantlara dönüştür; her göreve en az iki çözüm yolu ilkesini örnekle.
7. EKONOMİ BASKISI: tek yönlü gelir sorununa gider döngüsü tasarla (cebelü ücreti, yem, tamir, mevsimlik vergiler); sayısal başlangıç dengesi öner (tablo).
8. ÖLÇÜLEBİLİR BAŞARI: her tasarım kararının test edilebilir hedefi (ör. "ilk oturumda oyuncu 3 farklı fiil tipinde görev tamamlar").`,
  },
  {
    key: 'mizah',
    file: `${DIR}/02-mizah-ve-diyalog.md`,
    brief: `SEN: Mizah ve diyalog yazarısın (meddah/Nasreddin Hoca/Karagöz tınısı, dönem diliyle modern okunabilirlik dengesi). Dokümanın şunları İSTİSNASIZ içermeli:
1. ÜSLUP REHBERİ: nüktenin tanımı (kahkaha değil tebessüm; espri anlatı içinde saklı), dönem dili kuralları (hangi kelimeler kullanılır/kullanılmaz, cümle uzunluğu, hitaplar), YASAKLAR (din/ibadet/din adamı/ayet mizahı kesinlikle yok; etnik gruplara aşağılama yok; anakronik internet şakası yok; müstehcenlik yok).
2. KOMİK ROL HARİTASI: mevcut NPC kadrosundan (analiz narrative.contentInventory'de tam liste var) kimin hangi komik arketipi taşıyacağı: ör. Tellak Hüseyin (hamam muhabbeti), Saka İbrahim (sitemkâr sucu — diyaloğu zaten tanımsız, sıfırdan yazılacak), nöbetçiler (asker mizahı), kethüda (kaytaran köylü raporları). Her rol için karakter sesi tarifi.
3. KULLANIMA HAZIR İÇERİK — en az 60 replik/metin, kes-yapıştır kalitesinde, kategorilere ayrılmış: (a) saka_talk tam diyalog ağacı, (b) guard_talk tam diyalog ağacı, (c) uyuyan NPC uyandırma replikleri (10+), (d) NPC durum etiketi mizahları (main.js:326-331 switch'ine), (e) haramilerin son sözleri (killEnemy kancası), (f) vergi günü köylü tepkileri (morale'e göre 3 kademe), (g) hamam sohbeti/dedikodu havuzu, (h) demirci usta-çırak atışmaları (örs vuruş anı kancası), (i) meydan NPC-çifti baloncuk diyalogları, (j) mizahi ama saygılı başarım adları, (k) mevsim dönümü bildirimleri, (l) başlangıç ekranı prosedürel tımar kusurları ("değirmen taşı çatlak" tarzı).
4. SİSTEMİK MİZAH YERLEŞİMİ: hangi kod kancasına (analiz hooks listelerinden) hangi kategori bağlanır — dosya:satır ile.
5. VERİ FORMATI: geliştiricinin bu içeriği koyacağı JSON/JS veri yapısı önerisi (teknik planla uyumlu, ör. src/data/humor.js).
6. TON DENGESİ KURALI: dramatik anlarda (Ali'nin yarası, şehitlik, sefer) mizah tamamen susar — hangi durum bayrakları mizahı kapatır, listele.`,
  },
  {
    key: 'tarih',
    file: `${DIR}/03-tarih-egitimi.md`,
    brief: `SEN: Tarih eğitimi tasarımcısısın (Osmanlı erken dönem uzmanı). "Oynarken fark etmeden öğrenme" senin işin. Dokümanın şunları İSTİSNASIZ içermeli:
1. ÖĞRETİM FELSEFESİ: diegetik öğrenme (ders anlatma yok, dünyanın içinde yaşama); bilgi yoğunluğu kuralı (dakikada en fazla 1 yeni kavram); tekrar-pekiştirme döngüsü.
2. KODEKS ("MENÂKIBNÂME") TASARIMI: A/B/C/R etiketli oyun içi ansiklopedi — UI taslağı (mevcut parşömen temasıyla), madde açılma kuralları (görev/diyalog/keşifle unlock), madde şablonu (başlık, etiket, 2-3 cümle oyun bağlamı, 2-3 cümle gerçek tarih), İLK 40 MADDENİN TAM LİSTESİ VE METİNLERİ (kes-yapıştır kalitesinde): tımar/dirlik/berat/öşür/çift resmi/cebelü/çiftbozan/kadı/kethüda/ahilik/gaza/akıncı/Kosova 1389/Rovine 1395/Niğbolu 1396/Yıldırım Bayezid/Haçlı ordusu bileşimi/Doğan Bey/kazık hattı taktiği/esir fidyesi... 
3. TARİHİ OLAY AKIŞI: 1396 kampanya takviminin (ilkbahar→25 Eylül) oyun içi haber/vaaz/dedikodu olarak damla damla verilmesi — hangi oyun gününde hangi havadis (tablo); checkHistoricalEvents kancasının (GameState.js:271) kullanımı; Niğbolu 5 safhasının (CampaignBattleSystem.js:40-95 zaten data-driven) her safhasına A-etiketli tarih vinyeti metinleri (YAZ, hazır olsun).
4. MEVCUT İÇERİĞİN DOĞRULUK DENETİMİ: analizdeki envantere göre düzeltilecekler listesi (fes→börk anakronizmi ModelBuilder.js:842-858, "Cenevizli casus" etnik kimlik sorunu — TARIHSEL doc 3.2'deki eleştiriyle uyumlu çözüm, 72/72-97/97 README çelişkisi gibi metin hataları hariç — onlar teknik plan işi).
5. ÇEVRESEL ANLATI: mezar taşı kitabeleri (9 şahide hazır, TownGenerator.js:186-193) — 9 kitabe metnini YAZ (gerçek erken Osmanlı mezar taşı üslubuyla, R etiketli); Koca Dede'ye 3 yeni anı dalı (1361 Edirne, 1364 Sırpsındığı, 1371 Çirmen — metinleriyle); imam havadis bülteninin görev-durumuna bağlı 5 varyantı.
6. KAYNAKÇA VE DOĞRULUK PROTOKOLÜ: geliştiricinin yeni tarihi içerik eklerken uyacağı kontrol listesi; ana kaynak önerileri (İnalcık, Halaçoğlu, İslâm Ansiklopedisi TDV maddeleri vb.).
NOT: İslami içerik ayrı dokümanda — çakışma alanlarında (gaza ahlakı, vakıf, hicri takvim) "bkz. 04-islami-icerik" de ve kısa geç.`,
  },
  {
    key: 'islam',
    file: `${DIR}/04-islami-icerik.md`,
    brief: `SEN: İslami içerik tasarımcısısın. İşverenin açık talebi: içerik EHL-İ SÜNNET çizgisinde (Osmanlı bağlamına uygun: Hanefî fıkhı, Mâturîdî itikadı). Dokümanın şunları İSTİSNASIZ içermeli:
1. İLKELER: (a) yalnız sahih/muteber kaynak — Kur'an meali (Diyanet meali referans), Kütüb-i Sitte'den sahih hadisler, muteber ilmihal bilgisi (ör. Ömer Nasuhi Bilmen Büyük İslam İlmihali düzeyi); (b) uydurma rivayet/israiliyat YOK; (c) mezhep içi ihtilaflı konulara GİRME, herkesin ittifak ettiği temel bilgiler; (d) ibadet asla alay/mizah konusu değil; (e) ibadetin oyunlaştırılma ADABI: namaz kılmak "buff kazanmak" için araçsallaştırılmaz — tasarım çözümünü sen üret (ör. dünya simülasyonunun parçası olması, oyuncunun katılımının anlatısal/istikamet karşılığı olması ama "namaz = +10 can" tarzı kaba ödülleşme olmaması). Bu dengeyi açıkça tasarla ve gerekçelendir.
2. MEKANİKLER: (a) EZAN VE NAMAZ VAKİTLERİ: oyun saati sistemine (GameState.time.dayTimeHours) 5 vakit entegrasyonu — vakit hesabı basitleştirilmiş tablo (mevsime göre), ezan sesi tasarımı (AudioManager prosedürel mi, kayıt mı — öneri), köylülerin VillagerAI'ına PRAYING durumu (VillagerAI.js:85-119 kancası analiz raporunda hazır), mescide akış sahnesi; oyuncu katılımı OPSİYONEL ve teşvikli. (b) CUMA GÜNÜ: hicri takvim zaten HUD'da — cuma tespiti, cuma vaazı sahnesi (Molla Şemseddin'in mevcut vaaz içeriği genişler), köy rutini değişimi. (c) ZEKAT/SADAKA/İNFAK: tımar ekonomisine bağlı hayır mekaniği (kuraklıkta zekât arzuhali zaten kancada); kul hakkı kavramının reaya adaleti sistemine bağlanması (mevcut reayaTrust). (d) RAMAZAN/BAYRAM: hicri takvimde denk gelirse köy sahneleri (iftar sofrası, teravih, bayramlaşma) — kapsam küçük tutulabilir, öneri ver. (e) DUALAR: yolculuk, sefer öncesi, hasta ziyareti (Ali!) gibi anlarda kısa sahih dualar (Türkçe anlamıyla) — 15+ hazır metin.
3. ÖĞRETİM İÇERİĞİ: Kodeks'e girecek 20 İslami kavram maddesi (METİNLERİYLE, Ehl-i Sünnet çerçevesinde): abdest, namaz vakitleri, cuma, zekât, sadaka-i câriye, vakıf, ahilik ve fütüvvet, gaza-şehitlik-gazilik (aşırılıktan uzak, dengeli), kul hakkı, emanet, adalet (kadı sistemi), besmele, hicri takvim, ezan... Her maddede oyunla bağ.
4. ALİ'NİN HİKAYESİ: dua-tevekkül-tedavi dengesi (sebeplere sarılmak + tevekkül anlatısı) — imam/cerrah/attar diyalog zincirinin İslami çerçevesi; şehitlik ve gazilik kavramlarının mevcut fail-state metinleriyle uyumu denetimi.
5. HASSASİYET DENETİM LİSTESİ: geliştiricinin her yeni dini içerikte uygulayacağı kontrol protokolü; riskli kalıplar listesi (ör. ibadet-ödül döngüsü, ayetin bağlam dışı kullanımı, din adamının komik duruma düşürülmesi).
6. MEVCUT İÇERİK DENETİMİ: analiz envanterindeki dini metinlerin (imam vaazları, 'Elhamdülillah' geçen test metinleri, şehadet başlıkları, besmele kullanımı) Ehl-i Sünnet ve adap süzgecinden geçirilmesi — düzeltme gerekiyorsa listele.`,
  },
  {
    key: 'teknik',
    file: `${DIR}/05-teknik-plan.md`,
    brief: `SEN: Teknik mimar/lead developersin. Dokümanın şunları İSTİSNASIZ içermeli:
1. BUG BACKLOG P0/P1/P2: analizdeki ~110 bugı tek tabloda topla ve önceliklendir — P0 = ilk saati kurtaran cerrahi düzeltmeler (Su İhtilafı NPC bağlama, pusula 180° + questTitle undefined, bildirim render'ı, world-marker CSS, sefer butonu önkoşulu, çift event binding, ses butonu), P1 = döngü kıranlar (save bağlama, zaman/gün çift sayacı, vergi/mevsim bayrağı, checkHistoricalEvents sıralaması, Gemini kadı bağlama, CampaignBattleSystem bağlama, okçuluk-düşman çarpışması, cameraShake), P2 = cila. Her satır: dosya:satır, belirti, düzeltme tarifi (1-3 cümle), tahmini süre, doğrulama yöntemi (test/manuel adım).
2. ÖLÜ KOD KARARLARI: SoloGameState (257 satır, alakasız tema — SİL), AssetLoader, FBX dalı+Flying.fbx (10.6MB), createModernKethudaStanLee vb. — sil/tut kararları gerekçeli.
3. HUKUKİ/MARKA TEMİZLİĞİ: stanlee3d.obj Stan Lee modeli DEĞİŞTİRİLECEK (prosedürel NPC'yle ikame planı — createDetailedHumanNPC beyaz sakal config hazır); 'Mount & Blade ve Kingdom Come İlhamlı' ibaresi (index.html:359) kaldırılacak; 'traditional dancer' vb. OBJ'lerin lisans kontrol görevi; steamworks.js kararı (paket eklenecek mi, Electron builder pipeline'ı kurulacak mı — öneri + adımlar).
4. İÇERİK BORU HATTI REFAKTÖRÜ: mizah/tarih/kodeks/diyalog içeriğinin koda gömülü string yerine src/data/*.js veri modüllerine taşınma planı (diyalog ağacı formatı, kodeks madde formatı, bark havuzu formatı — diğer tasarımcıların veri formatı bölümleriyle uyumlu şema tanımla); mevcut DialogueSystem'in bu veriyi okuyacak asgari değişikliği.
5. PERFORMANS: PMREM 50 saniyede bir hitch (Engine.js:370), her kare DOM yeniden kurulumu (bildirim/marker/minimap), particle FPS bağımlılığı, mousemove birikimi, chunk >500kB code-splitting — her biri için çözüm tarifi + ölçüm yöntemi (FPS/frame time nasıl ölçülecek).
6. KAYIT SİSTEMİ BAĞLAMA PLANI: SaveManager'ın UI + otomatik kayıt entegrasyonu; serialize kapsam eksikleri (aliStatus, activeCampaign, currentPetition, quest durumları); geriye dönük uyumluluk kuralı.
7. TEST STRATEJİSİ: mevcut 97 assert korunacak (kırılgan metin-eşleme assert'lerinin sağlamlaştırılması dahil); her yeni sistem için test şablonu; 'her faz sonunda npm test + npm run build yeşil' kuralı; manuel duman testi listesi (10 adımlık oynanış senaryosu).
8. KOD STANDARTLARI: yeni geliştirici için kurallar (mevcut stile uy, singleton kalıbı, Türkçe oyuncu metni/İngilizce kod, magic number yasağı, her PR'da hangi dosyalara dokunulabileceği).
9. ELECTRON/PORT: electron-main 5173 vs vite 3000 uyumsuzluğu, preload steamworks kararıyla birlikte çözüm.`,
  },
]

const designs = await parallel(
  DESIGNERS.map((d) => () =>
    agent(`${COMMON}\n\n${d.brief}\n\nÇIKTI DOSYAN: ${d.file}`, {
      label: `tasarim:${d.key}`,
      phase: 'Tasarım',
      schema: DESIGN_SCHEMA,
    })
  )
)

phase('Sentez')

const designSummaries = designs
  .filter(Boolean)
  .map((d, i) => `--- ${d.file}\nÖZET: ${d.summary}\nANA KARARLAR:\n${(d.keyDecisions || []).map((k) => '- ' + k).join('\n')}`)
  .join('\n\n')

const plan = await agent(
  `${COMMON}\n\nSEN: Yapım planlayıcısısın (producer). 5 tasarımcı dokümanlarını yazdı — HEPSİNİ TAM OKU:\n${DESIGNERS.map((d) => d.file).join('\n')}\n\nTasarımcı özetleri (hızlı bağlam, yine de dosyaları tam oku):\n${designSummaries}\n\nGÖREVİN: Tüm tasarımı UYGULANABİLİR FAZLARA böl ve ${DIR}/06-fazlar-ve-kabul.md dosyasına yaz. İSTİSNASIZ içermeli:\n1. FAZ YAPISI (öneri, sen karar ver): Faz 0 'İlk Saati Kurtar' (P0 cerrahi düzeltmeler) → Faz 1 'Geri Bildirim ve Rehberlik' → Faz 2 'Çekirdek Döngü: zaman/ekonomi/kayıt' → Faz 3 'Niğbolu ve Kampanya' → Faz 4 'İçerik: mizah+tarih+İslami' → Faz 5 'Cila ve Dağıtım'. Her faz BAĞIMSIZ TESLİM EDİLEBİLİR olmalı (her faz sonunda oyun öncekinden iyi ve çalışır).\n2. HER FAZ İÇİN: amaç (1 paragraf), iş listesi (her iş: kimlik no [F0-01 gibi], başlık, dosya referansları, tarif, hangi tasarım dokümanının hangi bölümüne dayandığı, tahmini süre [saat], bağımlılıklar), KABUL KRİTERLERİ (ölçülebilir, denetçinin tek tek kontrol edeceği maddeler — 'çalışıyor' gibi muğlak ifade YASAK), test gereksinimleri (hangi yeni assertler), riskler.\n3. BAĞIMLILIK GRAFİĞİ: fazlar arası ve faz içi kritik yol (metin/mermaid).\n4. DEFINITION OF DONE (genel): her iş için geçerli evrensel kurallar (npm test yeşil, npm run build yeşil, yeni içerik veri dosyasında, oyuncu metni Türkçe, dini içerik 04 dokümanındaki protokolden geçmiş, tarihi içerik A/B/C/R etiketli...).\n5. TOPLAM EFOR ÖZETİ: faz bazında saat toplamları, önerilen sıra, solo geliştirici için takvim önerisi.\n6. ÇELİŞKİ ÇÖZÜMÜ: tasarım dokümanları arasında çelişki bulursan burada karara bağla ve hangi dokümanın hangi bölümünün geçerli olduğunu yaz.\nSonra StructuredOutput döndür.`,
  { label: 'sentez:fazlar', phase: 'Sentez', schema: DESIGN_SCHEMA }
)

phase('Eleştiri')

const CRIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'blockingIssues', 'improvements'],
  properties: {
    verdict: { type: 'string', enum: ['onay', 'düzeltmeyle-onay', 'red'] },
    blockingIssues: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['doc', 'issue', 'fix'], properties: { doc: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string', description: 'Somut düzeltme talimatı' } } } },
    improvements: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['doc', 'suggestion'], properties: { doc: { type: 'string' }, suggestion: { type: 'string' } } } },
  },
}

const ALL_FILES = [...DESIGNERS.map((d) => d.file), `${DIR}/06-fazlar-ve-kabul.md`]

const CRITICS = [
  {
    key: 'sadelik',
    brief: `SEN: Sadelik/fizibilite denetçisisin (Google Engineering Practices perspektifi). Tüm tasarım dokümanlarını ve faz planını oku. ACIMASIZCA ara: (1) over-engineering — solo geliştiricinin aylarca süreceği hayalci özellikler, speculative generality, tek kullanımlık abstraction; (2) YAGNI ihlalleri; (3) efor tahminlerinde gerçekçilik (toplam kaç saat? makul mü?); (4) 'mevcut mimariyi koru' sabit kararının ihlalleri (gizli yeniden yazımlar); (5) faz bağımsız teslim edilebilirliği gerçekten sağlanmış mı; (6) kabul kriterleri gerçekten ölçülebilir mi yoksa muğlak mı. Varsayılan şüphe: bir özellik kesilebiliyorsa kesilmesini öner.`,
  },
  {
    key: 'hassasiyet',
    brief: `SEN: Kültürel/dinî/tarihî hassasiyet ve hukuk denetçisisin. Tüm tasarım dokümanlarını ve faz planını oku. ACIMASIZCA ara: (1) İslami içerikte Ehl-i Sünnet çizgisinden sapma, kaynaksız/uydurma rivayet riski, ibadetin kaba ödül döngüsüne indirgenmesi, din-mizah sınır ihlali (02 mizah dokümanındaki HER örneği tek tek bu süzgeçten geçir); (2) tarihi yanlışlar ve anakronizmler (03 dokümanındaki tarih iddialarını bilginle çapraz kontrol et — yıllar, isimler, olaylar); (3) etnik/dini topluluk temsillerinde sorun (Ceneviz/Bizans/Sırp/zimmî tasvirlerinde adalet); (4) hukuki riskler tam kapatılmış mı (Stan Lee modeli, marka ibareleri, üçüncü parti OBJ lisansları, Gemini API anahtarı saklama); (5) şehitlik/gaza temalarının dengeli işlenmesi (oyunun yaş kitlesine uygunluk).`,
  },
  {
    key: 'deneyim',
    brief: `SEN: Oyuncu deneyimi ve bütünlük denetçisisin. Önce ${ANALIZ} dosyasındaki analizi (özellikle playerTrace ve tüm 'kritik'/'yüksek' buglar), sonra tüm tasarım dokümanlarını ve faz planını oku. ACIMASIZCA kontrol et: (1) İşverenin 3 hedefi (zaman su gibi aksın + nükte + tarih/İslam öğretimi) plan tarafından GERÇEKTEN karşılanıyor mu — her hedef için kanıt zinciri kur; (2) BÜTÜNLÜK: analizdeki her 'kritik' ve 'yüksek' bug faz planındaki bir işe bağlanmış mı — TEK TEK eşleştir, açıkta kalanları listele; (3) playerTrace'teki her sürtünme noktasına cevap var mı; (4) fazların sırası oyuncu değerine göre doğru mu (en büyük deneyim kazancı en önce mi); (5) planda hiçbir işin kabul kriteri eksik mi.`,
  },
]

const critiques = await parallel(
  CRITICS.map((c) => () =>
    agent(
      `${COMMON}\n\n${c.brief}\n\nOKUNACAK DOSYALAR (tamamı):\n${ALL_FILES.join('\n')}\n\nStructuredOutput ile bulgularını döndür. blockingIssues = uygulanırsa dokümanın amacını bozacak/yanlış iş yaptıracak sorunlar; improvements = değerli ama opsiyonel. Her bulguda hangi doküman ve hangi bölüm olduğunu yaz.`,
      { label: `elestiri:${c.key}`, phase: 'Eleştiri', schema: CRIT_SCHEMA }
    )
  )
)

return {
  designs: designs.filter(Boolean).map((d) => ({ file: d.file, summary: d.summary, keyDecisions: d.keyDecisions })),
  plan: plan ? { file: plan.file, summary: plan.summary, keyDecisions: plan.keyDecisions } : null,
  critiques: Object.fromEntries(CRITICS.map((c, i) => [c.key, critiques[i]])),
}