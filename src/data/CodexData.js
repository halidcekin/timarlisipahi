/**
 * Mülk-i Osmanî - Menâkıbnâme (Kâtibin Defteri) Veri Havuzu
 * 
 * V2 Standartları & 03-tarih-egitimi.md Sözleşmesi:
 * - 4 Kategori: 'dirlik', 'asker', 'cemiyet', 'vakayi'
 * - Etiketler: 'A' (Belgeli), 'B' (Kuvvetli Yorum), 'C' (Oyun Kurgusu), 'R' (Rivayet)
 * - Her maddede "Defterde" (gameText) ve "Tarihte" (historyText) yer alır.
 */

export const CODEX_ENTRIES = [
  // =========================================================================
  // KATEGORİ 1: DİRLİK VE İDARE
  // =========================================================================
  {
    id: 'timar',
    category: 'dirlik',
    title: 'Tımar',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Beyim bu köyün sahibi değildir; Devlet-i Aliyye\'nin ona emanet ettiği gelirin bekçisidir. Köyün öşrünü toplar, karşılığında atıyla, pusatıyla ve cebelüsüyle sefere koşar. Emaneti kötü tutanın beratı elinden alınır.',
    historyText: 'Tımar, Osmanlı Devleti\'nin belirli bir bölgenin vergi gelirini, savaşta atlı asker (sipahi) hizmeti karşılığında bir kişiye tahsis etmesidir. Sipahi toprağın mülk sahibi değil, gelirin görevli tasarrufçusudur; hizmet aksarsa tımar geri alınır. Bu sistem Osmanlı taşra idaresinin ve ordusunun asıl omurgasıydı.',
    related: ['dirlik', 'berat', 'sipahi']
  },
  {
    id: 'dirlik',
    category: 'dirlik',
    title: 'Dirlik',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Kâtipler, devletin hizmet karşılığı dağıttığı her geçimliğe \'dirlik\' der. Beyimin tımarı da bir dirliktir; küçüğü tımar, büyüğü zeamet, en büyüğü has diye anılır.',
    historyText: 'Dirlik, Osmanlı\'da devlet hizmeti karşılığında tahsis edilen gelir kaynağının genel adıdır. Klasik dönemde yıllık geliri düşük olanlar tımar, orta olanlar zeamet, en yüksek olanlar has olarak sınıflanmıştır.',
    related: ['timar', 'sancak']
  },
  {
    id: 'berat',
    category: 'dirlik',
    title: 'Berat',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Beyimin sandığındaki en kıymetli kâğıt: üzerinde Sultanın tuğrası bulunan berat. Tımarın kime, hangi şartla verildiğini o söyler. Berat elden giderse tımar da gider.',
    historyText: 'Berat, padişahın tuğrasını taşıyan resmî tevcih belgesidir; bir görevin, gelirin veya imtiyazın kime hangi şartlarla verildiğini belgeler. Tımar sahipleri hak iddialarını beratla ispat ederdi.',
    related: ['timar', 'ciftbozan']
  },
  {
    id: 'osur',
    category: 'dirlik',
    title: 'Öşür',
    tag: 'A',
    unlock: { type: 'dialogue:kethuda_talk' },
    gameText: 'Harmandan kalkan her on ölçekten biri beyimindir — buna öşür denir. Kethüda Yakub Ağa \'öşür hakkıyla alınırsa bereket, zulümle alınırsa göç getirir\' der.',
    historyText: 'Öşür (aşar), Müslüman reayanın toprak mahsulünden alınan ve adını \'onda bir\'den alan şer\'î vergidir. Tımar sisteminde öşür, sipahinin başlıca gelir kalemiydi.',
    related: ['cift_resmi', 'reaya', 'timar']
  },
  {
    id: 'cift_resmi',
    category: 'dirlik',
    title: 'Çift Resmi',
    tag: 'A',
    unlock: { type: 'dialogue:kethuda_talk' },
    gameText: 'Defterde her hanenin yanında bir kayıt: bir çift öküzle sürülecek kadar toprağı olan, yılda bir kez akçe öder. Kâtipler buna çift resmi der; toprağı yarım olan yarım öder.',
    historyText: 'Çift resmi, bir çift öküzle işlenebilecek büyüklükteki aile çiftliği üzerinden Müslüman reayadan yılda bir alınan nakdî toprak vergisidir.',
    related: ['osur', 'reaya', 'zimmi']
  },
  {
    id: 'ciftbozan',
    category: 'dirlik',
    title: 'Çiftbozan',
    tag: 'B',
    unlock: { type: 'event:reaya_low' },
    gameText: 'Toprağını ekmeyi bırakıp kaçan köylüye çiftbozan denir. Reaya kaçarsa üretim durur, defter boş kalır; kabahat çoğu kez kaçanda değil, kaçırtandadır. Zulmüyle köyü boşaltan sipahinin beratı elinden alınır.',
    historyText: 'Çiftini terk edip toprağını işlemeyen reayadan doğan gelir kaybını tazmin için çiftbozan resmi alınırdı. Reayanın toprakta ve üretimde tutulması tımar düzeninin varlık şartıydı.',
    related: ['reaya', 'timar', 'osur']
  },
  {
    id: 'reaya',
    category: 'dirlik',
    title: 'Reaya',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Tarlayı süren, harmanı kaldıran, vergiyi ödeyen ahali: reaya. Beyim onların efendisi değil, koruyucusudur — kılıç taşımayan bu insanların hakkı yenirse devletin direği çürür.',
    historyText: 'Reaya, yönetici-askerî sınıfın dışında kalan, üretim yapan ve vergi ödeyen tebaanın genel adıdır; Müslüman ve gayrimüslim herkesi kapsar. Adalet dairesinin temel taşıdır.',
    related: ['osur', 'ciftbozan', 'zimmi']
  },
  {
    id: 'kethuda',
    category: 'dirlik',
    title: 'Kethüda',
    tag: 'A',
    unlock: { type: 'dialogue:kethuda_talk' },
    gameText: 'Koca Yakub, köyün kethüdası: ahali ile beyim arasındaki köprü. Defteri o bilir, haneleri o tanır, kimin harmanı yandı kimin oğlu askere yarar — hepsi onun dilinin ucundadır.',
    historyText: 'Kethüda, bir topluluğun (köy, mahalle, esnaf loncası) işlerini yürüten güvenilir temsilcidir. Vergi toplanmasında ve yerel taleplerin iletilmesinde idarenin muhatabıydı.',
    related: ['reaya', 'arzuhal']
  },
  {
    id: 'kadi',
    category: 'dirlik',
    title: 'Kadı ve Naib',
    tag: 'A',
    unlock: { type: 'dialogue:imam_talk' },
    gameText: 'Molla Şemseddin köyümüzde kadı naibidir: kazadaki kadı efendinin vekili. Beyim kılıcın sahibi olabilir ama hükmün sahibi değildir — dava kadıya gider, sipahi bile onun hükmü önünde eğilir.',
    historyText: 'Kadı, Osmanlı\'da hem şer\'î hukuku hem padişah kanunlarını (örfî hukuk) uygulayan yargıç ve mülkî denetçidir. Sipahi reayayı kendi başına cezalandıramaz; ceza kadı hükmü gerektirirdi.',
    related: ['arzuhal', 'zimmi', 'kethuda']
  },
  {
    id: 'arzuhal',
    category: 'dirlik',
    title: 'Arzuhal',
    tag: 'A',
    unlock: { type: 'event:petition' },
    gameText: 'Ahalinin derdi kâğıda döküldü mü adı arzuhal olur: \'değirmen ister, kuyu ister, çatısı akan mescidine onarım ister.\' Beyim dinlemezse köylü hakkını kadıda, olmadı Divan\'da arar.',
    historyText: 'Arzuhal, halkın yöneticilere ve mahkemelere sunduğu yazılı dilekçedir. Osmanlı tebaası şikâyet ve taleplerini doğrudan Divan-ı Hümâyun\'a kadar ulaştırabilirdi.',
    related: ['kadi', 'kethuda']
  },
  {
    id: 'zimmi',
    category: 'dirlik',
    title: 'Zimmî',
    tag: 'A',
    unlock: { type: 'quest:quest_water_dispute' },
    gameText: 'Defterde Müslüman haneler de yazar, zimmî haneler de. Zimmî — ahd ile korunan gayrimüslim demektir: canı, malı, ibadeti devletin güvencesindedir; buna karşılık cizye öder.',
    historyText: 'Zimmî, İslam devletinin koruma ahdi altındaki gayrimüslim tebaadır; askerlikten muaf tutulur ve cizye vergisi öderdi. Hakları şer\'î mahkemelerde tescil edilirdi.',
    related: ['reaya', 'kadi']
  },
  {
    id: 'sancak',
    category: 'dirlik',
    title: 'Sancak ve Sancakbeyi',
    tag: 'A',
    unlock: { type: 'quest:quest_castle' },
    gameText: 'Tımarımız Hüdavendigâr sancağına bağlıdır. Sancak hem bir bayrak hem bir memlekettir: sancakbeyi, o bayrağın altında toplanan bütün tımarlı sipahilerin sefer komutanıdır.',
    historyText: 'Sancak, Osmanlı taşra teşkilatının temel askerî-idarî birimidir. Sancakbeyi hem bölgenin mülkî âmiri hem de seferde tımarlı sipahilerin komutanıydı.',
    related: ['timar', 'yoklama', 'dizdar']
  },

  // =========================================================================
  // KATEGORİ 2: ASKERLİK
  // =========================================================================
  {
    id: 'sipahi',
    category: 'asker',
    title: 'Sipahi',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Beyim bir tımarlı sipahidir: barışta köyün nizamını gözetir, savaş borusu çalınca atına biner, zırhını kuşanır, cebelüsünü yanına alıp sancağının altına koşar.',
    historyText: 'Tımarlı sipahi, tımar geliri karşılığında sefere atı ve teçhizatıyla katılmakla yükümlü süvaridir. Klasik dönem Osmanlı ordusunun ana muharip omurgasını oluştururdu.',
    related: ['timar', 'cebelu', 'yoklama']
  },
  {
    id: 'cebelu',
    category: 'asker',
    title: 'Cebelü',
    tag: 'A',
    unlock: { type: 'dialogue:cebelu_talk' },
    gameText: 'Ali benim cebelümdür: tımarın geliriyle donattığım, zırhını benim aldığım, sefere benimle gelen asker. Gelir büyüdükçe kanun daha çok cebelü ister.',
    historyText: 'Cebelü (zırhlı nefer), tımar sahibinin gelirine göre bizzat donatıp sefere getirmekle yükümlü olduğu süvaridir.',
    related: ['sipahi', 'yoklama', 'akce']
  },
  {
    id: 'akinci',
    category: 'asker',
    title: 'Akıncı',
    tag: 'A',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Koca Dede gençliğinde akıncıymış: serhaddin öncüsü, düşman diyarının derinliğine dalan hafif atlı. \'Biz orduya yol açardık\' der, \'kılıçtan önce korkumuz varırdı.\'',
    historyText: 'Akıncılar, Osmanlı serhaddinde düşman topraklarına keşif ve yıpratma akınları yapan hafif süvari birlikleriydi. Mihaloğulları ve Evrenosoğulları gibi ocaklarca idare edilirdi.',
    related: ['sipahi', 'kazik_hatti']
  },
  {
    id: 'yoklama',
    category: 'asker',
    title: 'Yoklama',
    tag: 'A',
    unlock: { type: 'quest:quest_castle' },
    gameText: 'Dizdar Hamza Bey defteri açtı, adımızı okudu, atımıza, zırhımıza, cebelümüze baktı. Buna yoklama denir: sefere kim, ne ile geliyor — devlet bunu kâğıtta görmek ister.',
    historyText: 'Yoklama, sefer öncesinde sipahilerin mevcutlarının ve teçhizatlarının denetlenmesidir. Mazeretsiz katılmayanların tımarları iptal edilirdi.',
    related: ['sipahi', 'cebelu', 'sancak']
  },
  {
    id: 'dizdar',
    category: 'asker',
    title: 'Dizdar',
    tag: 'A',
    unlock: { type: 'dialogue:guard_talk' },
    gameText: 'Hamza Bey sancak kalesinin dizdarıdır: kapının, burçların, zahire ambarının ve zindanın emini. Kale onun namusudur — \'kale düşerse dizdar sağ çıkmaz\' derler.',
    historyText: 'Dizdar, kale muhafızlarının komutanı ve kale nizamının sorumlusudur. 1396 Niğbolu kuşatmasında kaleyi savunan meşhur komutan Doğan Bey\'dir.',
    related: ['sancak', 'dogan_bey']
  },
  {
    id: 'bork',
    category: 'asker',
    title: 'Börk ve Başlıklar',
    tag: 'B',
    unlock: { type: 'dialogue:demirci_talk' },
    gameText: 'Başlık, adamın kimliğidir: sipahinin kızıl börkü, ulemânın ak sarığı, köylünün keçe külahı. Rüstem Usta \'başa bakınca kim olduğunu bilirsin\' der.',
    historyText: 'Börk, erken Osmanlı askerinin keçe başlığıdır. Kırmızı fes bu devirde yoktur; orduya 19. yüzyılda girmiştir.',
    related: ['sipahi', 'ahilik']
  },
  {
    id: 'gurz',
    category: 'asker',
    title: 'Gürz ve Plaka Zırh',
    tag: 'B',
    unlock: { type: 'dialogue:demirci_talk' },
    gameText: 'Rüstem Usta\'nın dersi: \'Frenk şövalyesinin plaka zırhını kılıçla çizersin, gürzle çökertirsin.\' Kesici kesmeyeni ezmek gerek — demirin dili budur.',
    historyText: '14. yüzyıl sonunda Batı şövalyelerinin tam plaka zırhına karşı gürz ve savaş çekici gibi darbe silahları tercih edilirdi.',
    related: ['bork', 'kazik_hatti', 'hacli_bilesimi']
  },
  {
    id: 'akce',
    category: 'asker',
    title: 'Akçe',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Kesemizdeki gümüş sikkenin adı akçe. Öşür akçeyle hesaplanır, cebelü akçeyle donatılır, tımarın büyüklüğü yıllık akçesiyle ölçülür.',
    historyText: 'Akçe, Osmanlı\'nın temel gümüş sikkesidir; ilk kez Orhan Gazi döneminde basılmıştır. Tımar gelirleri ve vergiler akçe üzerinden tutulurdu.',
    related: ['timar', 'cebelu']
  },
  {
    id: 'kazik_hatti',
    category: 'asker',
    title: 'Kazık Hattı ve Harp Düzeni',
    tag: 'A',
    unlock: { type: 'quest:quest_campaign' },
    gameText: 'Niğbolu sabahı öncüler düşmanı üstümüze çekti; şövalye atları toprağa çakılı sivri kazıklara saplandı; okçularımız yağmur gibi ok yağdırdı. Savaş kat kat örülmüş bir düzenle kazanıldı.',
    historyText: 'Niğbolu\'da Osmanlı ordusu kademeli bir savunma hattı kurmuştur: önde kazık barikatları ve okçular, geride süvariler ve padişah ihtiyatı yer almıştır.',
    related: ['nigbolu', 'akinci', 'hacli_bilesimi']
  },

  // =========================================================================
  // KATEGORİ 3: CEMİYET VE GÜNDELİK HAYAT
  // =========================================================================
  {
    id: 'ahilik',
    category: 'cemiyet',
    title: 'Ahilik',
    tag: 'A',
    unlock: { type: 'dialogue:demirci_talk' },
    gameText: 'Rüstem Usta bir ahidir: çarşının hem ustası hem ahlak bekçisi. Ahiler çırağı yetiştirir, hileli malı çarşıdan kovar, misafiri doyurur. \'Eline, diline, beline sahip ol\' — ocaklarının kapısında yazan budur.',
    historyText: 'Ahilik, esnaf ve sanatkârları fütüvvet ahlakı çerçevesinde örgütleyen köklü bir teşkilattır. Piri Ahi Evran\'dır.',
    related: ['bork', 'han']
  },
  {
    id: 'gaza',
    category: 'cemiyet',
    title: 'Gaza ve Gazi',
    tag: 'A',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Koca Dede\'nin vasiyeti kulağımdadır: \'Gazâ ganimet için değil, milletin namusu ve mazlumun duası içindir.\' Serhadde savaşan ve sağ dönene gazi denir.',
    historyText: 'Gaza, serhat boylarında meşru müdafaa ve adalet uğruna verilen mücadeledir. Erken Osmanlı beyleri kendilerini gazi olarak tanımlamıştır.',
    related: ['akinci', 'kosova_1389']
  },
  {
    id: 'hamam',
    category: 'cemiyet',
    title: 'Hamam',
    tag: 'A',
    unlock: { type: 'dialogue:tellak_talk' },
    gameText: 'Tellak Hüseyin Ağa sorulunca göğsünü gerer: \'Burası vakıf malıdır beyim — hayır sahibi yaptırmış ki gelen geçen temizlensin, geliri de mescide aksın.\'',
    historyText: 'Hamam, İslam şehir ve kasaba hayatında temizliğin ve vakıf gelirlerinin merkezidir.',
    related: ['vakif', 'han']
  },
  {
    id: 'han',
    category: 'cemiyet',
    title: 'Han ve Kervan Ticareti',
    tag: 'A',
    unlock: { type: 'dialogue:hanci_talk' },
    gameText: 'Hancı İdris\'in kapısından her milletin yolcusu geçer: Bursa ipeği taşıyan tüccar, Ragusalı ulak, Cenevizli simsar. Han, yolcunun emniyeti ve havadisin pınarıdır.',
    historyText: 'Hanlar ve kervansaraylar ticaret yollarında güvenli konaklama sağlardı. 14. yüzyıl Osmanlısı uluslararası kervan yolları üzerindeydi.',
    related: ['ahilik', 'zimmi']
  },
  {
    id: 'attar',
    category: 'cemiyet',
    title: 'Attar ve Dönem Hekimliği',
    tag: 'B',
    unlock: { type: 'dialogue:attar_talk' },
    gameText: 'Attar Mehmet Efendi\'nin dükkânı bir koku deryası: kantaron yağı, çörek otu macunu, dağ kekiği. Kırığı sarar, ateşi düşürmeye şerbet kaynatır.',
    historyText: 'Attar, şifalı bitkiler ve geleneksel ilaçlar hazırlayan esnaftır; İbn Sînâ tıbbına dayanan pratiklerle halk hekimliğinin merkezidir.',
    related: ['hamam']
  },
  {
    id: 'hazire',
    category: 'cemiyet',
    title: 'Hazire ve Mezar Taşları',
    tag: 'B',
    unlock: { type: 'dialogue:imam_talk' },
    gameText: 'Mescidin yanındaki servili küçük mezarlığa hazire denir. Taşların her biri bir ömrün özetidir. Kâtip dedi ki: \'Taş okumasını bilene mezarlık, köyün ikinci defteridir.\'',
    historyText: 'Hazire, cami ve mescidlerin avlusundaki mezarlıklardır. Erken dönem şahideleri sade ve vakur dualar taşır.',
    related: ['hamam', 'vakif']
  },
  {
    id: 'vakif',
    category: 'cemiyet',
    title: 'Vakıf',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Hamamı yaptıran hayır sahibi, gelirini mescide bağlamış: buna vakıf denir — bir malı Allah rızası için ebediyen hayra adamak. Çeşme, köprü, han hep vakıf eseridir.',
    historyText: 'Vakıf, kamu hizmetlerinin ve bayındırlık işlerinin devlet hazinesine yük olmadan asırlarca sürdürülmesini sağlayan hukukî ve sosyal kurumdur.',
    related: ['hamam', 'han']
  },
  {
    id: 'hicri_takvim',
    category: 'cemiyet',
    title: 'Hicri Takvim',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Kâtip defteri iki tarihle tutar: Frenk hesabıyla 1396, bizim hesabımızla 798. Bizim yıl, Peygamber Efendimiz\'in hicretiyle başlar ve ay\'a göre sayılır.',
    historyText: 'Hicri takvim, 622 yılındaki Hicret\'i başlangıç alan kamerî takvimdir. 1396 yılı Hicri 798 yılına tekabül eder.',
    related: []
  },

  // =========================================================================
  // KATEGORİ 4: VAKĀYİ VE ŞAHISLAR
  // =========================================================================
  {
    id: 'edirne_1361',
    category: 'vakayi',
    title: 'Edirne\'nin Fethi (1361)',
    tag: 'B',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Koca Dede der ki: \'Sazlıdere\'de Rum ordusunu dağıttık, ardından Edirne kapılarını açtı.\' Şimdi o şehir Sultanın Rumeli\'deki tahtıdır.',
    historyText: 'Edirne, I. Murad döneminde fethedilerek Osmanlı\'nın Rumeli payitahtı hâline gelmiştir.',
    related: ['cirmen_1371', 'murad_hudavendigar']
  },
  {
    id: 'sirpsindigi_1364',
    category: 'vakayi',
    title: 'Sırpsındığı (1364)',
    tag: 'R',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Dede bu cengi anlatırken sesini alçaltır: \'Hacı İlbey bir gece baskınıyla haçlı ordusunu Meriç\'e döktü derler. Kâtipler bunu başka cenklerle karıştırır; sen yine de dinle.\'',
    historyText: 'Sırpsındığı zaferi Osmanlı kroniklerinde anlatılan, 1371 Çirmen zaferiyle birleşmiş olabileceği düşünülen rivayet kaynaklı bir muharebedir.',
    related: ['cirmen_1371', 'edirne_1361']
  },
  {
    id: 'cirmen_1371',
    category: 'vakayi',
    title: 'Çirmen Muharebesi (1371)',
    tag: 'A',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Meriç kenarında, Çirmen\'de sabaha karşı vurduk. Sırp kralları Vukaşin ile Uglyeşa ordularıyla Meriç\'e gömüldü. O günden sonra Makedonya\'nın yolu açıldı.',
    historyText: '26 Eylül 1371\'de Çirmen\'de Osmanlı öncüleri büyük Sırp ordusunu dağıtmış, Balkanlar\'daki fetihlerin önü açılmıştır.',
    related: ['sirpsindigi_1364', 'kosova_1389']
  },
  {
    id: 'kosova_1389',
    category: 'vakayi',
    title: 'I. Kosova Muharebesi (1389)',
    tag: 'A',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Koca Dede\'nin gözleri Kosova\'yı anlatırken buğulanır: \'Düşman safları demir duvar gibiydi. Zafer bizim oldu, ama Sultan Murad Han o meydanda şehit düştü.\'',
    historyText: '1389 I. Kosova Muharebesi\'nde Osmanlı ordusu Balkan ittifakını mağlup etmiş, Sultan I. Murad meydanda şehit düşmüştür.',
    related: ['murad_hudavendigar', 'yildirim_bayezid']
  },
  {
    id: 'murad_hudavendigar',
    category: 'vakayi',
    title: 'Murad Hüdavendigâr',
    tag: 'A',
    unlock: { type: 'dialogue:dede_talk' },
    gameText: 'Dede ona hep \'Hüdavendigâr\' der. \'Rumeli\'yi bize o yurt yaptı; Edirne\'yi o aldı, Kosova\'da o şehit düştü.\'',
    historyText: 'Sultan I. Murad, devleti Balkanlar\'da kökleştiren ve teşkilatlandıran hükümdardır.',
    related: ['kosova_1389', 'edirne_1361']
  },
  {
    id: 'rovine_1395',
    category: 'vakayi',
    title: 'Rovine Muharebesi (1395)',
    tag: 'A',
    unlock: { type: 'dialogue:messenger_talk' },
    gameText: 'Geçen yıl Eflak elinde, Rovine\'de çok kan döküldü. Bizim safta çarpışan Sırp beyleri Marko ile Konstantin o meydanda düştü.',
    historyText: '1395 Rovine Muharebesi\'nde Yıldırım Bayezid kuvvetleri Eflak voyvodası Mircea ile çarpışmıştır; Osmanlı saflarındaki Hristiyan vasallar da bu savaşta yer almıştır.',
    related: ['hacli_bilesimi', 'yildirim_bayezid']
  },
  {
    id: 'yildirim_bayezid',
    category: 'vakayi',
    title: 'Sultan Yıldırım Bayezid',
    tag: 'A',
    unlock: { type: 'auto' },
    gameText: 'Sultanımız Bayezid Han\'a \'Yıldırım\' derler; ordusuyla bir uçtan öbür uca beklenmedik süratle intikal eder de ondan.',
    historyText: 'I. Bayezid (1389-1402), sürati ve fütuhatı sebebiyle Yıldırım lakabını almış, 1396 Niğbolu Zaferi ile İslam dünyasında \'Sultân-ı İklîm-i Rûm\' unvanını kazanmıştır.',
    related: ['nigbolu', 'rovine_1395']
  },
  {
    id: 'nigbolu',
    category: 'vakayi',
    title: 'Niğbolu Zaferi (1396)',
    tag: 'A',
    unlock: { type: 'quest:quest_campaign' },
    gameText: 'Tuna kıyısında, Niğbolu kalesinin önünde Haçlı ordusunun sonu geldi. Frenk şövalyeleri kazık hattında kırıldı; Sultanın ihtiyat hücumuyla zafer tamamlandı.',
    historyText: '25 Eylül 1396 Niğbolu Meydan Muharebesi, Haçlı ittifakına karşı kazanılmış en büyük Osmanlı zaferlerinden biridir.',
    related: ['kazik_hatti', 'hacli_bilesimi', 'esir_fidyesi', 'dogan_bey']
  },
  {
    id: 'hacli_bilesimi',
    category: 'vakayi',
    title: 'Haçlı Ordusunun Bileşimi',
    tag: 'A',
    unlock: { type: 'quest:quest_campaign' },
    gameText: 'Karşımızdaki ordu tek bir millet değildi: Burgonya asilzadeleri, Macar süvarileri, Rodos şövalyeleri... Kâtip der ki: çoktular ama tek yürek olamadılar.',
    historyText: '1396 Haçlı ordusu Fransız, Burgonyalı, Macar, Alman ve Rodos şövalyelerinden oluşan çok uluslu bir koalisyondu.',
    related: ['nigbolu', 'kazik_hatti', 'esir_fidyesi']
  },
  {
    id: 'dogan_bey',
    category: 'vakayi',
    title: 'Doğan Bey ve Niğbolu Savunması',
    tag: 'R',
    unlock: { type: 'quest:quest_campaign' },
    gameText: 'Niğbolu dizdarı Doğan Bey kaleyi teslim etmedi; Sultan gece karanlığında sur dibine at sürüp \'Dayan Doğan!\' diye seslendi derler. Kâtip şerh düştü: rivayettir.',
    historyText: 'Niğbolu kalesini Haçlı kuşatmasına karşı kahramanca savunan kale dizdarı Doğan Bey\'dir.',
    related: ['dizdar', 'nigbolu']
  },
  {
    id: 'esir_fidyesi',
    category: 'vakayi',
    title: 'Esir Fidyesi ve Zaferin Ardı',
    tag: 'A',
    unlock: { type: 'quest:quest_campaign' },
    gameText: 'Meydanda esirler, yaralılar ve hesap kaldı. Frenk beylerinin canı fidyeyle satın alındı; Burgonya dükünün oğlu için dağlar kadar altın konuşuldu.',
    historyText: 'Niğbolu zaferi sonrası yüksek rütbeli Haçlı soyluları yüklü fidyeler karşılığı serbest bırakılmıştır.',
    related: ['nigbolu', 'hacli_bilesimi']
  }
];
