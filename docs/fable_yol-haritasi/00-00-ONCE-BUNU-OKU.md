# 00-00 — Önce Bunu Oku: V2 Devir Giriş Kapısı

**Durum:** Klasördeki ilk ve zorunlu okuma  
**Tarih:** 30 Ağustos 2026

> Uygulamayı devralan geliştirici: `01–06` içindeki herhangi bir işi doğrudan kodlamadan önce bu dosyayı, `07-BAGLAYICI-V2-DEVIR-SOZLESMESI.md` ve `08-MASAUSTU-RUNTIME-KARARI.md` dosyalarını tamamen oku. Eski dosyalarda hâlâ bulunan tarih, saat, şema veya hazır metin tek başına bağlayıcı değildir.

## 1. Bağlayıcı okuma sırası

1. **Bu giriş kapısı**
2. **`07-BAGLAYICI-V2-DEVIR-SOZLESMESI.md`** — ürün, içerik, teknik mimari, test, faz ve kabul otoritesi
3. **`08-MASAUSTU-RUNTIME-KARARI.md`** — yalnız masaüstü kabuğu/Steam/save/paketleme konusunda `07`yi dar biçimde ezer
4. `06-fazlar-ve-kabul.md` — eski backlog ve kod kancası kaynağı; faz sırası/tahmin otoritesi değil
5. `05-teknik-plan.md`
6. `01-akis-ve-tutundurma.md`
7. `02-mizah-ve-diyalog.md`
8. `03-tarih-egitimi.md`
9. `04-islami-icerik.md`

Öncelik: güncel kullanıcı talebi → `08`in dar masaüstü kapsamı → `07` → uzman onay manifesti → geçersiz kılınmamış eski ayrıntılar → mevcut kod.

## 2. Devir olgunluğu hükmü

Bu klasör artık **geliştirmeye hazırlık ve G0 yürütmesi için yeterlidir**. Şu anlamda henüz “hazır içerik paketi” değildir:

- Tarihî ve dinî oyuncu metinleri uzman onayına kadar `DRAFT`tır.
- İsimli tarih/fıkıh/itikad/hadis/editoryal onay ve content hash gelmeden hassas içerik production bundle’a giremez.
- Tauri/Electron seçimi G0-00 ölçümünden önce kesinleşmiş sayılmaz.
- Gerçek Steam AppID, ses/asset lisansı ve imzalı Windows artifact dış bağımlılıktır.
- `npm test`in bugünkü yeşil görünmesi save/async/Electron process restart kanıtı değildir.

Başka deyişle: geliştirici neyi kuracağını ve nasıl doğrulayacağını sormadan anlayabilir; fakat uzman yerine dinî/tarihî hüküm veya lisans kararı veremez.

## 3. Geliştirme başlamadan kırmızı çizgiler

Aşağıdaki eski gereksinimler yürürlükten kalkmıştır. Kaynak dosyada görülürse **uygulanmaz**:

- `1 Mart 1396`, 209 günlük kampanya veya buna bağlı eski perde tablosu
- Sabit oyun saatlerini gerçek namaz vakti gibi gösterme
- Her namaz için kıyam/rükû/secde/oturuşu “4 tekrar” canlandırma
- `floor(max(0, akce - NISAB) * 0.025)` veya başka eksik zekât hesaplayıcısı
- Oyuncu/NPC dindarlığını `devout`, `regular`, `rare`, `istikamet` gibi sınıflandırma
- Sistem anlatıcısının “şehit oldun” veya uhrevî sonuç hükmü vermesi
- `killEnemy` üzerinde komik son söz
- Dua, bereket, sevap veya ibadeti ödeme/başarı/verim punchline’ı yapma
- A/B/C/R etiketini dinî doğruluk/onay ekseni olarak kullanma
- Tek `reviewed:true` ile tarih ve din onayını birleştirme
- Runtime Gemini/AI’ın “Kadı hükmü”, skor veya stat değişimi üretmesi
- Keyfî `setFlag(path,value)` ile state yazma
- Objective index’i veya görünen metni save kimliği yapma
- Rastgele localhost origin’ini masaüstü kayıt otoritesi yapma
- Yalnız “97 assert azalmadı” ile kalite kapısı geçme
- 368–484 saat / 17 hafta planını güncel tahmin sayma
- Oturum süresini uzatmayı veya her 60 saniyede uyaranı akış KPI’ı yapma

Kanonik karşılıkların tamamı `07` Bölüm 4’te V2-00–V2-25 olarak yazılıdır.

## 4. Değiştirilemez başlangıç sırası

1. Task branch/worktree ve clean/dirty envanteri
2. Mevcut build/test/save/Electron kod gerçekliği raporu
3. `08` G0-00 Tauri/Electron A/B spike’ı ve `DEC-DESKTOP-001`
4. Test isolation, async runner, CI ve content validator
5. Clock/Calendar/RNG/EffectRunner/save schema güvenli temeli
6. Content/claim/source/review policy kapısı ve uzman randevuları
7. Ortak modal/a11y/performance baseline
8. `07` G1 tek günlük 30–45 dakikalık dikey kesit

Geliştirici 150 replik, 40 tarih kartı, 20 dinî madde veya 13 görev ölçeklemesine G1 playtesti geçmeden başlamaz.

## 5. Her işe başlamadan kontrol

- İş `07` Bölüm 17 şablonuyla yazılmış mı?
- Gözlenebilir kullanıcı davranışı ve kapsam dışı belli mi?
- Dosya yanında symbol/fonksiyon adı doğrulanmış mı?
- Save/migration, determinism, offline, security ve a11y etkisi değerlendirildi mi?
- İçerik claim/source/reviewer rolleri tanımlı mı?
- Önce kırmızı test veya tekrarlanabilir baseline var mı?
- Normal, negative ve gerekiyorsa process-restart yolu yazılı mı?

Bir cevap yoksa sessiz varsayım yapılmaz; iş `blocked-ready` kalır. Bu, geliştiricinin rutin kod tercihleri için sürekli kullanıcıya soru sorması anlamına gelmez.

## 6. Hızlı kabul özeti

Faz/iş bitti demek için en az:

- `npm run check` ve ilgili E2E/a11y/simulation gate’leri yeşil
- Aynı seed + command log aynı canonical hash
- Effects atomik/exactly-once
- Save legacy fixture ve masaüstü tam process restart yeşil
- Dış ağ olmadan ana oyun tam çalışır
- Onaysız/stale hassas content production bundle’da sıfır
- Electron/Tauri security hard gate’leri yeşil
- Keyboard-only akış ve axe critical/serious bulgusu sıfır
- Referans cihaz performans bütçesi içinde
- Asset/audio lisansı ve exact-build uzman hash’i açık

Detaylı ve tek bağlayıcı DoD, `07` Bölüm 19’dadır.

## 7. Terim düzeltmeleri

- Genel kodeks: **Kâtibin Defteri**
- Tarih sekmesi: **Vakalar ve Şahıslar**
- Rivayet sekmesi: **Menkıbeler ve Rivayetler**
- Din sekmesi: **Dinî Hayat ve Âdâb**; fetva/gerçek vakit kaynağı değildir
- `Cuma Duası` görev adı: bağlama göre **Cuma Namazı** veya “Cuma Vakti”
- Savaş sonu sistem olayı: `battle_death`, “martyrdom” değil
- Oynanabilir gönüllü yardım: sadaka/infak/vakıf; zekât hesaplayıcısı değil

## 8. Denetçiye not

Kabulü eski dokümandaki satır sayısı, replik adedi veya assert sayısıyla yapma. Exact artifact üzerinde davranış, kaynak/onay hash’i, security/save kanıtı, erişilebilirlik, performans ve playtest sonucu ara. `07`/`08` ile çelişen eski bir cümlenin uygulanmış olması kabul gerekçesi değil blocker’dır.

