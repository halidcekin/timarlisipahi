# 00-02 — Oyun Öncelikli Dinî Temsil ve Şehitlik Kararı

**Durum:** Bağlayıcı kullanıcı kararı / önceki ihtiyatlı maddeleri geçersiz kılan ek  
**Tarih:** 30 Ağustos 2026  
**Kapsam:** Muharebede ölüm ekranı, namaz animasyonu, ilgili teknik iş ve testler

> Bu bir ilmihal simülatörü değildir; akıcı bir tarihî macera oyunudur. Dinî hayat görünür, sıcak ve doğal biçimde dünyanın içinde yaşar. Oyuncu-facing metinler ihtiyat dipnotlarıyla boğulmaz. Bununla birlikte göze çarpan ve kolayca önlenebilen yanlışlar da kodlanmaz.

---

## 0. Öncelik ve geçersiz kılınan eski kararlar

Bu dosya, aşağıdaki konularda klasördeki bütün önceki belgeleri ezer:

1. Muharebede ölen oyuncuya **ŞEHİT OLDUN** denir.
2. Namaz yalnız uzaktaki silüet veya kararma ile geçiştirilmez; NPC ve isteğe bağlı oyuncu animasyonu görünür biçimde oynatılır.
3. Namaz animasyonu bütün vakitlerde körlemesine dört kez tekrar etmez; farz rekât sayısı vakte göre doğru veriden okunur.
4. Genel gündelik dinî temsil için ağır claim/reviewer bürokrasisi uygulanmaz. Yaygın Hanefî namaz koreografisi tek, yetkin bir danışmanla bir defa görsel olarak kontrol edilir.
5. Oyuncuya ölüm ekranında veya namaz sahnesinde teolojik ihtiyat metni, fetva uyarısı ya da akademik dipnot gösterilmez.

Özellikle şu eski maddeler bu kapsamda yürürlükten kalkmıştır:

- 00-00 Bölüm 3 içindeki “Sistem anlatıcısının ‘şehit oldun’ dememesi” yasağı
- 00-00 Bölüm 7 içindeki savaş olayı adının zorunlu olarak battle_death olması
- 07 V2-04’ün namazı yalnız silüet/kararma ile sınırlaması
- 07 V2-09 ve 8.5’in sistemin “şehit” ifadesi kullanmasını yasaklaması
- 07 Bölüm 8.6’nın bu basit oyun konvansiyonu için ayrı itikad/şehitlik uzmanı zorunluluğu
- 04 Bölüm 2.1.3 içindeki bütün vakitler için sabit “4 tekrar” tarifi

Geçersiz kılınmayan korumalar:

- Dinî ibadet can, hasar, XP, ganimet veya savaş buff’ı vermez.
- Oyuncu namaza katılmadığı için ceza, görev kilidi veya ayıplama görmez.
- Namazın kendisi slapstick animasyon veya punchline yapılmaz.
- Ezan varsa sentetik ses kullanılmaz; lisanslı insan kaydı kullanılır.
- Doğrudan âyet/hadis alıntısı ayrıca kaynak ve metin kontrolü ister.

---

## 1. Ürün kararı

### 1.1 Muharebe ölümü

Ana kampanyada oyuncu tanımlı bir muharebe karşılaşmasında ölürse oyun ekranının ana başlığı tam olarak:

> **ŞEHİT OLDUN**

olur.

Bu ifade oyun dünyasının ve anlatı tonunun bilinçli konvansiyonudur. Ölüm ekranına “nihai hükmü Allah bilir”, “yalnız temsildir” veya benzeri bir ihtiyat paragrafı eklenmez.

Başlığın altında bağlama göre kısa bir alt metin bulunur:

> Niğbolu Meydan Muharebesi’nde şehit düştün. Sancağın yere değmeden silah arkadaşların devraldı.

Başlık kısa ve değişmezdir; savaş adı ve ölüm bağlamı alt metne taşınır.

### 1.2 Namazın dünyadaki yeri

Namaz:

- köylü rutininin görünür bir parçasıdır,
- mescide yürüyüş, saf düzeni, imam-cemaat senkronu ve namaz duruşlarıyla canlandırılır,
- oyuncunun isterse cemaate katıldığı kısa, akıcı bir dünya sahnesidir,
- zorunlu öğretici, tuş ezberi veya ödül sistemi değildir,
- normal oynanışı uzun süre kesmez.

Oyuncu namaz sırasında bütün ayrıntıları öğrenmek zorunda bırakılmaz. Doğru temel ritim gösterilir; ayrıntılı kıraat, dualar ve fıkhî farklılıklar simüle edilmez.

---

## 2. Mevcut kod gerçekliği ve korunacak davranış

Belgenin yazıldığı tarihte kodda şehitlik kaldırılmış değildir:

- src/core/GameState.js içinde triggerMartyrdom() vardır.
- Aynı dosyada triggerElephantMartyrdom() vardır.
- tests/systems.test.js içindeki “Niğbolu Şehitlik Fail-State” testi martyrdom sebebini doğrular.
- UIManager.checkFailState() şehitlik fail-state’ini tam ekran gösterir.

Dolayısıyla geliştirici bu akışı silmeyecek veya battle_death adı altında görünmez hâle getirmeyecektir. Yapılacak iş:

1. mevcut davranışı tek bir açık sunum sözleşmesine bağlamak,
2. başlığı tam olarak “ŞEHİT OLDUN” şeklinde standardize etmek,
3. savaş dışı ölümleri ayrı tutmak,
4. mevcut innerHTML tabanlı dinamik metin üretimini güvenli DOM/textContent kullanımına çevirmek,
5. test kapsamını sınıflandırma ve yeniden başlatma yollarıyla genişletmektir.

Mevcut martyrdom ve elephant_martyrdom save/reason kimlikleri legacy uyumluluk için okunmaya devam eder. Yeni yazımda tercih edilen kanonik sebep battle_martyrdom’dır; migration eski iki değeri kayıpsız eşler.

---

## 3. Muharebe ölümü teknik sözleşmesi

### 3.1 Sınıflandırma

Tek bir saf fonksiyon ölüm sunumunu seçer:

~~~js
getDeathPresentation({
  cause,
  encounterType,
  battleId,
  battleName,
  killerType
})
~~~

Muharebe şehitliği için gerekli koşul:

~~~text
encounterType == "battle"
AND cause in ["hostile_damage", "battle_hazard", "scripted_battle_death"]
~~~

Örnekler:

| Durum | Sunum |
|---|---|
| Niğbolu’da düşman darbesiyle can sıfır | ŞEHİT OLDUN |
| Tanımlı meydan muharebesinde savaş fili altında ölüm | ŞEHİT OLDUN |
| Muharebe sırasında script’li son savunmada ölüm | ŞEHİT OLDUN |
| Köyde düşme, açlık, hastalık veya kaza | Bağlama uygun normal ölüm |
| Mahkeme idamı | İdam fail-state’i |
| Muharebe kaybedildi fakat oyuncu hayatta/esir | Mağlubiyet/esaret; şehitlik değil |

Sadece activeBattleId var diye her ölüm otomatik şehitlik sayılmaz. Ölüm olayı battle context ve battle cause değerlerini birlikte taşır. Bu ayrım, önceki muharebenin state’i temizlenmediğinde köy kazasının yanlış başlık göstermesini engeller.

### 3.2 Kanonik veri

~~~js
{
  isGameOver: true,
  reason: "battle_martyrdom",
  title: "ŞEHİT OLDUN",
  battleId: "battle_nicopolis_1396",
  battleName: "Niğbolu Meydan Muharebesi",
  cause: "hostile_damage",
  descriptionKey: "death.battle_martyrdom.nicopolis",
  occurredAt: { day, dayTimeHours }
}
~~~

Kurallar:

- title alanı yerelleştirme anahtarından üretilebilir; Türkçe çıktı birebir “ŞEHİT OLDUN” olmalıdır.
- Savaş adı title’a eklenmez; subtitle/description alanındadır.
- description en fazla iki kısa cümledir.
- Cennet, bağışlanma veya uhrevî ödül garantisi anlatan ilave metin yazılmaz. Buna kullanıcı-facing uyarı da eklenmez; ekran yalnız oyun sonucunu anlatır.
- Bildirim metni kısa olabilir: “Niğbolu’da şehit düştün.”

### 3.3 UI davranışı

Ölüm ekranı:

- oyuncu kontrolünü ve savaş simülasyonunu durdurur,
- başlığı ilk odak hedefi yapar,
- “Son Kayıttan Devam Et” ve “Ana Menü” seçeneklerini gösterir,
- varsa “Muharebeyi Yeniden Başlat” seçeneğini son encounter checkpoint’ine bağlar,
- keyboard/gamepad ile tamamen kullanılabilir,
- yalnız renkle anlam taşımaz,
- title ve description için innerHTML kullanmaz.

Dinamik battleName, description veya mod içeriği textContent ile yazılır. Sabit ikon/dekor ayrı DOM düğümleridir.

### 3.4 Save ve yeniden başlatma

- Game-over ekranı save dosyasına yeni bir oynanabilir checkpoint diye yazılmaz.
- Son geçerli save, ölüm olayından önceki state’tir.
- “Muharebeyi Yeniden Başlat” aynı battle seed ve başlangıç snapshot’ını yükler.
- Yüklemeden sonra failOverlayActive, activeBattleId ve ölüm nedeni eski ekrandan sızmaz.
- Legacy reason değerleri martyrdom ve elephant_martyrdom yüklenirse aynı “ŞEHİT OLDUN” sunumuna map edilir.

### 3.5 Ölüm ekranı kabul kriterleri

- [ ] D-01: triggerMartyrdom() sonrasında görünen h1 metni birebir “ŞEHİT OLDUN”.
- [ ] D-02: triggerElephantMartyrdom() aynı başlığı gösterir; alt metin Ankara/fil bağlamını korur.
- [ ] D-03: trial_execution, stoning_linch ve savaş dışı ölüm bu başlığı göstermez.
- [ ] D-04: Muharebe mağlubiyeti ama hayatta kalma, şehitlik olarak sınıflanmaz.
- [ ] D-05: Önceki savaş state’i temizlenmeden köye dönme regression testinde köy kazası yanlış başlık üretmez.
- [ ] D-06: Son kaydı yükleyince overlay kapalı, input açık ve activeBattleId doğrudur.
- [ ] D-07: Başlık, açıklama ve butonlar keyboard-only ile okunur ve kullanılabilir.
- [ ] D-08: Dinamik battleName içinde HTML karakterleri bulunsa dahi DOM çalıştırılmaz.

---

## 4. Namaz animasyonu teknik sözleşmesi

### 4.1 V1 kapsamı

V1 animasyonu cemaatle kılınan **farz namazın sadeleştirilmiş beden akışını** temsil eder. Sünnet ve nafile rekâtlar ayrı ayrı oynatılmaz. Bu karar sahneyi kısa tutar ve oyuncuya bütün vakitleri dört rekâtmış gibi yanlış göstermez.

Kanonik veri:

~~~js
export const PRAYER_DEFINITIONS = {
  fajr:   { label: "Sabah",   obligatoryRakahs: 2 },
  dhuhr:  { label: "Öğle",    obligatoryRakahs: 4 },
  asr:    { label: "İkindi",  obligatoryRakahs: 4 },
  maghrib:{ label: "Akşam",   obligatoryRakahs: 3 },
  isha:   { label: "Yatsı",   obligatoryRakahs: 4 },
  jumuah: { label: "Cuma",    obligatoryRakahs: 2, requiresKhutbah: true }
};
~~~

Bu tablo tek otoritedir. VillagerAI, UI veya görev kodu kendi rekât sabitini taşımaz.

### 4.2 Rekât state-machine’i

PrayerSequence görsel akışı veri ve state ile yürütür; kare sayısına bağlı if/else zinciri kullanılmaz.

~~~text
ASSEMBLING
  -> OPENING_TAKBIR
  -> STANDING
  -> RUKU
  -> STANDING_AFTER_RUKU
  -> SUJUD_FIRST
  -> SITTING_BETWEEN_SUJUD
  -> SUJUD_SECOND
  -> RAKAH_BOUNDARY
       -> INTERMEDIATE_SITTING  (ikinci rekât, fakat son değilse)
       -> FINAL_SITTING         (son rekâtsa)
       -> STANDING              (diğer durumlarda)
  -> SALAM_RIGHT
  -> SALAM_LEFT
  -> COMPLETE
  -> LEAVING
~~~

Geçiş kuralı:

~~~js
const isSecondRakah = currentRakah === 2;
const isFinalRakah = currentRakah === definition.obligatoryRakahs;

if (isFinalRakah) next = "FINAL_SITTING";
else if (isSecondRakah) next = "INTERMEDIATE_SITTING";
else next = "STANDING";
~~~

Önemli örnekler:

- Sabah: 1. rekât -> 2. rekât -> final sitting -> selam.
- Akşam: 1 -> 2 -> ara oturuş -> 3 -> final sitting -> selam.
- Öğle/ikindi/yatsı: 1 -> 2 -> ara oturuş -> 3 -> 4 -> final sitting -> selam.
- Cuma: kısa hutbe sahnesinden sonra 2 rekât farz -> final sitting -> selam.

### 4.3 Görsel süre bütçesi

Hedef, sahneyi hissedilir fakat ağır olmayan bir uzunlukta tutmaktır:

| Adım | Yaklaşık gerçek süre |
|---|---:|
| Opening takbir | 0.8 sn |
| Standing hold | 1.4 sn |
| Rükû geçiş + hold | 1.5 sn |
| Rükûdan doğrulma | 0.8 sn |
| Birinci secde geçiş + hold | 1.5 sn |
| İki secde arası oturuş | 0.7 sn |
| İkinci secde geçiş + hold | 1.5 sn |
| Ara oturuş | 1.3 sn |
| Son oturuş | 1.8 sn |
| Sağ + sol selam | toplam 1.2 sn |

Hedef toplamlar:

- 2 rekât: yaklaşık 16–20 saniye
- 3 rekât: yaklaşık 23–28 saniye
- 4 rekât: yaklaşık 29–35 saniye

Geçişler easing ile akıcıdır. 1.2 saniyelik katı alt sınır her harekete uygulanmaz; ani zıplama, teleport veya ragdoll görüntüsü oluşmaması esastır.

### 4.4 İmam ve cemaat senkronu

- İmam her adımı önce başlatır.
- Cemaat 150–250 ms sonra aynı adıma geçer.
- Gecikme NPC kimliğinden üretilen deterministik küçük bir offset’tir; her yüklemede aynıdır.
- Bütün katılımcılar aynı currentRakah ve prayerId içinde kalır.
- Katılımcı listesi sahne başında dondurulur; ortada rastgele NPC eklenmez.
- Saf slotları sabit NPC ID sıralamasından atanır; çakışma ve üst üste binme olmaz.
- Kıble yönü keyfî Vector3 sabiti değildir. Haritanın kanonik kuzeyi, mescid mihrabı ve saf yönü aynı world-orientation verisini okur.
- Namaz bitince LEAVING state’i NPC’leri önce saf dışına, sonra günlük rutin hedeflerine yollar; karakterler birbirinin içinden geçmez.

### 4.5 Pose/animasyon kalite kuralları

PrayerPoseController şu pozları açıkça destekler:

- opening takbir,
- ayakta eller bağlı sade duruş,
- rükû,
- rükûdan doğrulma,
- secde,
- iki secde arası oturuş,
- son oturuş,
- sağa ve sola selam.

Tek bir gövdeyi rotation.x ile yere yatırmak kabul edilmez. Diz, kalça, omurga, baş ve kol düğümleri birlikte pozlanır. Mevcut prosedürel karakter rig’i bunu desteklemiyorsa, geliştirici namaz için gerekli ek pivot/joint’leri önce modele ekler.

Animasyon sırasında:

- ayak kayması olmaz,
- baş/kol mesh’i zemine gömülmez,
- silah, kalkan ve büyük el prop’ları sahne öncesi güvenli attachment’a alınır,
- kılıç kınında kalır,
- NPC collision namaz sırasında saf slotunda kilitlenir,
- düşük FPS’te state atlanmaz; elapsed time bir sonraki state’e artığıyla devredilir.

### 4.6 Oyuncunun katılması

Katılım gönüllüdür.

Prompt:

> **[E] Cemaate Katıl**

Prompt yalnız şu koşullarda çıkar:

- oyuncu mescid giriş/avlu alanındadır,
- cemaat ASSEMBLING durumundadır,
- oyuncu savaşta, diyalogda veya başka modal sahnede değildir,
- uygun boş saf slotu vardır.

E basınca:

1. hareket girdisi kilitlenir,
2. oyuncu kısa path/kararma ile ayrılan slota yerleşir,
3. silah/prop güvenli hâle gelir,
4. aynı PrayerSequence’e participant olarak katılır,
5. kamera sabit geniş açıya geçer,
6. COMPLETE sonrasında kontrol geri verilir.

Sahne başladıktan sonra geç kalan oyuncuya animasyon ortasından katılma yaptırılmaz; “Namaz kılınıyor” kısa çevre bildirimi görünür.

Katılım:

- sağlık, stamina, akçe, XP, itibar veya hasar değiştirmez,
- achievement streak oluşturmaz,
- ana görev kapısı değildir,
- kodeks açılması için tek zorunlu yol değildir.

### 4.7 Zaman, pause ve skip

Oyuncu katılırsa:

- ana GameClock durur,
- PrayerSequence unscaled scene time ile ilerler,
- düşman AI, ekonomi ve görev sayaçları ilerlemez,
- sahne bitince saat kaldığı yerden devam eder.

Oyuncu yalnız izliyorsa dünya saati ve NPC arka plan sahnesi normal akar.

İlk iki saniyeden sonra ekranda küçük bir:

> **[Space basılı tut] Sahneyi geç**

seçeneği çıkar. Bir saniye basılı tutunca 250 ms kararma olur, sequence deterministik olarak COMPLETE/LEAVING durumuna alınır ve kontrol geri verilir. Skip, ödül veya ceza üretmez.

### 4.8 Save/load ve determinism

Aktif sahne serialize edilebilir:

~~~js
{
  schemaVersion: 1,
  prayerId: "dhuhr",
  sequenceId: "day-12-dhuhr",
  currentRakah: 2,
  phase: "INTERMEDIATE_SITTING",
  phaseElapsedMs: 420,
  participantIds: ["imam_01", "villager_03"],
  playerParticipating: true,
  slotByParticipantId: { /* stable mapping */ },
  startedAt: { day: 12, dayTimeHours: 12.25 }
}
~~~

Yüklemede:

- PrayerSequence aynı state ve elapsed değerinden devam eder,
- participant listesi yeniden rastgele seçilmez,
- saf slotları korunur,
- input lock ve kamera playerParticipating değerine göre yeniden kurulur,
- bozuk/missing NPC ID sahneyi çökertmez; o katılımcı atlanır ve kayıt warning log’una yazılır,
- COMPLETE olmuş sahne ikinci kez tetiklenmez.

### 4.9 Kamera, ses ve erişilebilirlik

- Kamera geniş, sabit ve sakin kadraj kullanır; secdede karakterleri kesmez.
- Camera shake, hızlandırılmış zoom ve komik ses efekti yoktur.
- Kritik bilgi yalnız ezan sesine dayanmaz; vakit bildirimi metin olarak da görünür.
- Ezan/tekbir sesi kullanılırsa lisanslı insan kaydıdır. V1’de namaz içi kıraati seslendirmek zorunlu değildir.
- Mute hâlinde bütün sahne anlaşılır kalır.
- Reduced motion açıkken kamera geçişi cross-fade olur; hızlı pan yapılmaz.
- Skip, keyboard ve gamepad ile erişilebilirdir.
- Prompt ve scene label i18n anahtarından gelir; Türkçe metin hardcode edilmez.

### 4.10 Mizahın sahneye entegrasyonu

Bu bölüm gereksiz ölçüde ciddi veya steril oynanmayacaktır. Köy hayatının mizahı namazdan önce ve sonra devam eder:

- ASSEMBLING öncesindeki gündelik telaşta karakter mizahı olabilir.
- LEAVING sonrasında ayakkabı, dükkân, sıra, unutkanlık veya karakter huyu üzerinden kısa replik gelebilir.
- Mizahın hedefi ibadetin hareketleri, Allah, Kur’an, ezan veya secde değildir.
- Namaz animasyonu sırasında punchline, kahkaha efekti veya sakarlık animasyonu tetiklenmez.

Örnek çevre replikleri:

> Demirci: “Örsü dükkânda bıraktım. Çekiç benden ayrılmaya henüz razı değil.”

> Hüsam: “Çarığım kaybolmadı; ikisini de aynı ayağa giymişim.”

Bu replikler dinî hüküm değildir ve ağır review zinciri istemez; normal editoryal/mizah kontrolü yeterlidir.

---

## 5. Kod iş paketleri

### P-01 — Namaz tanımları

**Hedef dosya:** src/data/prayerDefinitions.js  
**Teslim:** PRAYER_DEFINITIONS ve veri doğrulayıcısı  
**Doğrulama:** Beş vakit + cuma farz rekât tablosu unit testleri

Yasak:

- VillagerAI içinde repeat: 4
- UI katmanında rekât sayısı
- vakte göre dağılmış magic number

### P-02 — PrayerSequence

**Hedef dosya:** src/systems/PrayerSequence.js  
**Teslim:** Saf, serialize edilebilir state-machine  
**API:**

~~~js
start(definition, participants, context)
update(unscaledDeltaMs)
skipToComplete()
serialize()
restore(snapshot)
isActive()
~~~

PrayerSequence DOM, Three.js mesh veya AudioManager bilmez. Yalnız state ve phase-change event üretir.

### P-03 — PrayerPoseController

**Hedef dosya:** src/entities/PrayerPoseController.js  
**Teslim:** State’i avatar pozuna çevirme, blend/easing, prop güvenliği  
**Doğrulama:** Görsel pose sheet + düşük FPS testi + mesh clipping kontrolü

### P-04 — NPC rutini ve saf düzeni

**Hedef dosyalar:** src/entities/VillagerAI.js, src/entities/NPCManager.js  
**Teslim:**

- PRAYING/ASSEMBLING/LEAVING durumları
- authored attendanceSchedule
- stable saf slot assignment
- imam-cemaat phase offset
- günlük rutine temiz dönüş

devout/regular/rare gibi oyuncuya ahlâk derecesi ima eden adlar kullanılmaz. Veri yalnız sahne planlama sıklığını anlatır.

### P-05 — Oyuncu katılımı ve UI

**Hedef dosyalar:** src/main.js, src/ui/UIManager.js  
**Teslim:**

- “[E] Cemaate Katıl” prompt’u
- input/camera lock yaşam döngüsü
- hold-to-skip
- mute/reduced-motion/gamepad
- bütün çıkış yollarında input restore

Escape, skip, load ve scene completion aynı cleanup fonksiyonunu çağırır.

### P-06 — Muharebe ölümü standardizasyonu

**Hedef dosyalar:** src/core/GameState.js, src/ui/UIManager.js  
**Teslim:**

- getDeathPresentation saf sınıflandırıcısı
- battle_martyrdom kanonik reason
- legacy reason migration
- tam “ŞEHİT OLDUN” başlığı
- textContent tabanlı güvenli overlay
- restart/checkpoint temizliği

triggerMartyrdom() geriye uyumluluk facade’ı olarak kalabilir; içerde kanonik triggerBattleMartyrdom(context) çağırır.

### P-07 — Save

**Hedef dosya:** src/core/SaveManager.js  
**Teslim:**

- PrayerSequence snapshot schema
- legacy death reason migration
- aktif sahne restore cleanup’ı
- bozuk participant toleransı

### P-08 — Testler

**Hedef:** tests/systems.test.js; test runner ayrıştırıldıktan sonra tests/prayer-sequence.test.js ve tests/battle-death.test.js  
**Teslim:** Bölüm 6’daki otomatik test matrisi ve kısa manuel görsel kontrol senaryosu

---

## 6. Zorunlu test matrisi

### 6.1 Unit

- PRAYER_DEFINITIONS değerleri: 2/4/4/3/4 ve cuma 2.
- 2 rekât akışı ara oturuşa sapmadan final oturuşa ulaşır.
- 3 rekât akışı ikinci rekâtta ara, üçüncüde final oturuş üretir.
- 4 rekât akışı yalnız ikinci rekâtta ara, dördüncüde final oturuş üretir.
- Her rekâtta bir rükû, iki secde vardır.
- Selam yalnız final oturuştan sonra gelir.
- update büyük delta aldığında state atlamaz veya duplicate event üretmez.
- skipToComplete idempotent’tir.
- serialize -> restore -> devam, kesintisiz koşuyla aynı final state hash’ini üretir.
- getDeathPresentation battle + hostile_damage için battle_martyrdom döndürür.
- Savaş dışı ve hayatta kalınan mağlubiyet için battle_martyrdom döndürmez.
- legacy martyrdom ve elephant_martyrdom aynı sunuma migrate edilir.

### 6.2 Integration

- Vakit başladığında uygun NPC’ler stable slotlara yürür.
- Gayrimüslim veya açıkça başka rutinde olan NPC yanlışlıkla yönlendirilmez.
- İmam phase-change’i cemaatten önce oluşur.
- Demirci prop’u namazdan önce güvenli hâle gelir; sonra işi geri yüklenir.
- Oyuncu katılımında ana clock/AI durur, PrayerSequence ilerler.
- İzleyici durumunda dünya clock’u durmaz.
- Player katılımı statları değiştirmez.
- Diyalog, combat veya başka modal açıkken katılım prompt’u çıkmaz.
- Skip ve normal completion aynı cleanup sonucunu verir.
- Mid-prayer save/load kamera ve input lock’u doğru geri kurar.
- “Muharebeyi Yeniden Başlat” eski fail overlay/state taşımadan aynı seed’i yükler.

### 6.3 UI/a11y

- Başlık birebir “ŞEHİT OLDUN”.
- Dynamic description HTML olarak çalıştırılmaz.
- Prompt, skip ve death buttons keyboard/gamepad ile erişilir.
- Mute hâlinde vakit ve sahne durumu anlaşılır.
- Reduced motion hâlinde hızlı kamera hareketi yoktur.
- 200% UI scale’de ölüm ekranı butonları viewport dışına taşmaz.

### 6.4 Görsel/manual

Her pose için ön/yan/45 derece ekran görüntüsü:

- opening takbir,
- standing,
- rükû,
- rükûdan doğrulma,
- secde,
- oturuş,
- selam.

Ayrıca 2, 3 ve 4 rekâtlık sequence videosu alınır. Görsel kabulte şu blocker’lar sıfır olmalıdır:

- mesh zemine giriyor,
- ayakta kayma,
- saf üst üste binmesi,
- imamdan önce hareket eden cemaat,
- silahtan/prop’tan clipping,
- sahne bitince yerde kalan veya eğik yürüyen NPC,
- skip/load sonrası kilitli kalan input.

### 6.5 Performans

- PrayerPoseController update içinde frame başına yeni array/object üretmez.
- 12 görünür katılımcı ve 24 çevre NPC ile referans cihazda frame-time bütçesi önceki köy baseline’ından p95 +2 ms’den fazla bozulmaz.
- Uzak katılımcılarda pose LOD uygulanabilir; state-machine tek otorite kalır.

---

## 7. Hafifletilmiş içerik kontrolü

Bu iki özellik için devir süreci şu kadar olmalıdır:

### Normal, tek kontrol yeterli

- “ŞEHİT OLDUN” oyun konvansiyonu
- beş vaktin farz rekât sayıları
- namazın temel pose sırası
- saf, imam ve cemaat görselleştirmesi
- namaz öncesi/sonrası gündelik mizah

Namaz koreografisi, Hanefî uygulamasını bilen tek yetkin dinî danışmana pose sheet ve 2/3/4 rekât video üzerinden bir kez gösterilir. Blocker düzeltmeleri işlenir; her küçük easing veya kamera değişikliğinde yeniden teolojik kurul toplanmaz.

### Ek kontrol gereken içerik

- birebir âyet veya hadis alıntısı,
- Arapça kıraat/dua seslendirmesi,
- mezhepler arası ihtilaf anlatısı,
- cennet, bağışlanma veya belirli kişinin ahiretteki hâli üzerine ilave kesin iddia,
- ayrıntılı abdest/namaz öğreticisi,
- gerçek hayatta fetva veya ibadet vakti kaynağı gibi sunulan ekran.

Bu ayrım oyunu rahat bırakır, fakat bariz yanlışın da geliştirici varsayımıyla üretime girmesini önler.

---

## 8. Kaynak çıpası

Animasyonun V1 farz rekât tablosu ve temel duruş sırası için başlangıç kaynağı:

- Diyanet İşleri Başkanlığı, Temel Dinî Bilgiler / namaz bölümü: https://dijital.diyanet.gov.tr/File/Download?id=4218&path=4218_1.pdf
- Diyanet İşleri Başkanlığı, Namaz İlmihali: https://namaz.diyanet.gov.tr/namaz/html/kutuphane/HTML/NamazIlmihali/
- Din İşleri Yüksek Kurulu, “Cuma namazı kaç rek’attır?”: https://kurul.diyanet.gov.tr/tr/fetva/cuma-namazi-kac-rekattir/0193c42d-59f1-76b1-cf51-62306d2ea597

Kaynaklar geliştiriciye animasyon state-machine’inin rekât sayısını doğrulamak içindir. Oyuncuya bu bağlantılar modal uyarı olarak gösterilmez.

---

## 9. Faz ve tahmin etkisi

Bu karar yeni bir büyük sistem eklemekten çok, daha önce planlanmış fakat silüete indirgenmiş namaz sistemini görünür animasyona yükseltir.

| İş | Tahmin |
|---|---:|
| P-01 + P-02 veri/state-machine | 8–12 saat |
| P-03 pose rig ve blend | 14–24 saat |
| P-04 NPC saf/ritim entegrasyonu | 8–14 saat |
| P-05 oyuncu katılımı/kamera/skip | 8–14 saat |
| P-06 şehitlik standardizasyonu | 4–8 saat |
| P-07 save/migration | 5–9 saat |
| P-08 otomatik + görsel test | 10–16 saat |
| Danışman görsel kontrolü ve düzeltme | 3–6 saat |
| **Toplam** | **60–103 saat** |

Sıra:

1. P-01 ve P-02
2. P-03 ile P-06 paralel
3. P-04
4. P-05
5. P-07
6. P-08 ve danışman videosu

G1 dikey kesit kabulü:

- Niğbolu muharebesinde “ŞEHİT OLDUN” ekranı,
- bir 2 rekât ve bir 4 rekât PrayerSequence,
- 6 NPC + imam safı,
- oyuncunun katılması, skip ve temiz kontrol dönüşü,
- unit/integration testleri.

G2 ölçekleme:

- akşamın 3 rekât akışı,
- beş vakit tanımları,
- cuma/hutbe geçişi,
- 12 NPC performansı,
- save/load ve accessibility tamamlaması.

---

## 10. Nihai kabul

Bu özellik ancak aşağıdakilerin tamamı sağlanınca bitmiş sayılır:

- [ ] Muharebede ölüm başlığı tam “ŞEHİT OLDUN”.
- [ ] Savaş dışı ölüm yanlışlıkla aynı başlığı almıyor.
- [ ] Mevcut martyrdom legacy kayıtları bozulmadan açılıyor.
- [ ] Sabah 2, öğle 4, ikindi 4, akşam 3, yatsı 4, cuma farzı 2 rekât.
- [ ] Genel repeat: 4 veya her vakte tek kör animasyon yok.
- [ ] Namazda rükû, iki secde, gerekli ara/son oturuş ve selam sırası doğru.
- [ ] Oyuncu katılabiliyor, geçebiliyor ve kontrol her çıkışta geri geliyor.
- [ ] Katılım stat/ödül/ceza üretmiyor.
- [ ] NPC’ler üst üste binmiyor ve normal rutinlerine dönüyor.
- [ ] Save/load sequence’i deterministik sürdürüyor.
- [ ] Mute, reduced motion, keyboard ve gamepad yolları çalışıyor.
- [ ] Namaz koreografisi tek yetkin danışman tarafından pose sheet + video üzerinden kontrol edilmiş.
- [ ] Test, build ve ilgili görsel kontrol raporları yeşil.

Bu maddelerden biri eksikse “namaz sistemi tamamlandı” veya “muharebe ölüm ekranı tamamlandı” denmez.

---

## 11. Devralan geliştiriciye son talimat

Bu dosyanın amacı sistemi ağırlaştırmak değil, yoruma açık iki noktayı kapatmaktır:

- Savaşta ölürsen oyuncuya açıkça **ŞEHİT OLDUN** denecek.
- Namaz dünya içinde gerçekten görülecek ve doğru rekât akışıyla canlandırılacak.

Eski belgelerde bunun tersini söyleyen cümleleri uygulama. Bu yeni kararı sessizce “daha güvenli” bir silüet veya “battle death” metnine geri çevirme. Teknik sadelik için PrayerSequence’i veri güdümlü ve test edilebilir tut; oyuncu deneyimini ise hafif, akıcı ve doğal bırak.
