# 00 — Genel Bakış ve Okuma Kılavuzu

> **Bu klasör ne için:** "Mülk-i Osmanî: Tımarlı Sipahi 3D" oyununu bugünkü hâlinden, işverenin tarif ettiği oyuna taşıyacak **devir dokümanı setidir**. Bu dokümanları uygulayacak geliştirici soru soramayacak; iş bittiğinde bağımsız bir denetçi kabulü bu dokümanlara göre yapacaktır. Okumaya BU dosyadan başla.

## 1. Hedef (işverenin birebir talebi)

1. **Akış:** "İnsanların oynarken zamanın nasıl geçtiğini anlamayacağı, akıcı bir oyun."
2. **Nükte:** "Küçük nükte ve espirilerin olduğu" bir üslup.
3. **Öğretim:** "Oynarken Osmanlı ve Türk tarihini öğrenecekleri, İslami şeyler öğrenecekleri bir kurgu." — **İslami içerik Ehl-i Sünnet çizgisinde** (Hanefî fıkhı, Mâturîdî itikadı; yalnız sahih/muteber kaynak).

## 2. Doküman haritası ve okuma sırası

| Sıra | Dosya | Ne anlatır | Ne zaman okunur |
|---|---|---|---|
| 1 | `00-GENEL-BAKIS.md` (bu dosya) | Harita, kurallar, süreç | İlk gün |
| 2 | **`06-fazlar-ve-kabul.md`** | **UYGULAMA PLANI**: 6 faz, iş kimlikleri (F#-##), saat tahminleri, bağımlılıklar, kabul kriterleri, Definition of Done, Ç1-Ç17 çelişki kararları | İlk gün — çalışma sırası buradan yürür |
| 3 | `05-teknik-plan.md` | ~110 bug'ın P0/P1/P2 backlog'u (dosya:satır + düzeltme tarifi), ölü kod kararları, hukuk paketi, içerik boru hattı, performans, kayıt, test stratejisi | Faz 0-2 boyunca sürekli |
| 4 | `01-akis-ve-tutundurma.md` | Zaman/tempo tasarımı (daySpeed 1/60, 1396 takvimi), ilk 15 dakika, juice listesi, oturum ritüeli, ekonomi dengesi, görev fiil varyantları, 18 KPI | Faz 1-3'te ilgili işlerde |
| 5 | `02-mizah-ve-diyalog.md` | Üslup rehberi + YASAKLAR, ~150 kes-yapıştır replik, saka/guard tam diyalog ağaçları, humor.js şeması, mizah susturma sözleşmesi | Faz 0 (F0-10/11) ve Faz 4A'da |
| 6 | `03-tarih-egitimi.md` | Menâkıbnâme kodeksi (40 madde, metinleriyle), 13 havadis, 9 mezar kitabesi, doğruluk düzeltmeleri, kaynakça ve doğruluk protokolü | Faz 4B'de |
| 7 | `04-islami-icerik.md` | Namaz/ezan/cuma/Ramazan/zekât tasarımı, 20 İlmihal maddesi, 18 dua, P1-P10 hassasiyet protokolü, R1-R14 kara listesi | Faz 4C'de + HER dinî içerik dokunuşunda |

**Çelişki kuralı:** Dokümanlar arasında çelişki görürsen **06'nın Bölüm 1'i (Ç1-Ç17) kazanır.** Orada da yoksa: sessiz seçim yapma, Bölüm 1'e gerekçeli satır ekle.

## 3. Tartışılmaz kurallar (özet — tam liste 06 Bölüm "Sabit kararlar" + Definition of Done D1-D12)

- Kampanya: **1 Nisan 1396 → 25 Eylül 1396 Niğbolu**; tek zaman ekseni `time.dayCount`.
- Tarihsel/dinî her içerik **A/B/C/R etiketi** taşır (A belgeli / B kuvvetli yorum / C dramatik bileşim / R rivayet — R içerik "derler ki" kalıbıyla).
- **Din adamları, ibadet ve dinî değerler ASLA mizah nesnesi olmaz**; mizah dünyevi hayatta yaşar. İbadet hiçbir sayısal stat'a yazmaz.
- İslami içerik `04` §5.1 **P1-P10 süzgecinden** geçmeden ve `docs/ISLAMIC_CONTENT_AUDIT.md`'ye satır yazılmadan oyuna giremez.
- Mevcut mimari korunur: cerrahi değişiklik; büyük yeniden yazım yok; her denge sayısı `src/data/balance.js`'te.
- Her faz kapanışında `npm test` (assert sayısı azalamaz) + `npm run build` yeşil.
- Oyuncu metinleri Türkçe; kod/commit İngilizce; her commit bir iş kimliğine (F#-##) bağlı.

## 4. Çalışma ve kabul süreci

1. Fazlar sıralı: **Faz 0 → 1 → 2 → 3 → 4 (4A/4B/4C) → 5.** Faz atlamak yok; faz içi işler bağımlılıklara uyarak paralel yürüyebilir.
2. Her iş kaleminin kabulü, 06'daki fazın **kabul kriterleri listesi** + ilgili tasarım dokümanının kendi kabul bölümüyle yapılır; PR açıklamasına doğrulama kanıtı yazılır ("çalışıyor olmalı" kabul edilmez).
3. İş bitti demek = 06 Bölüm 10'daki **D1-D12'nin tamamı** sağlandı demek.
4. Faz kapanışları ve yayın kapısı **bağımsız denetimle** onaylanır (denetim bu dokümanlara göre, madde madde yapılacaktır — 06 Bölüm 12).

## 5. Doğrulanmış başlangıç durumu (30 Ağustos 2026)

- `npm test` → **97/97 yeşil**; `npm run build` → başarılı (tek uyarı: >500kB chunk — F5-03'ün konusu).
- Depo GitHub'a bağlı git deposudur (`halidcekin/timarlisipahi`) — 05-teknik'teki "git init" varsayımı geçersizdir (06 F0-01 düzeltilmiş hâli esas).
- **Analizden SONRA gelen 2 commit:** `65feebc` (Attar Mehmet'e yeni 3D model — F0-09 varlık/lisans denetimi bu modeli de kapsamalı) ve `1ea86b2` (Electron port izolasyonu — F0-13'ü kısmen/tamamen çözmüş olabilir, önce doğrula). Dokümanlardaki dosya:satır referansları bu iki commit'ten eski koda göredir; `NPCManager.js` ve `electron-main.cjs` satır numaraları kaymış olabilir — referanslar satır yerine fonksiyon/desen ile aranmalıdır.

## 6. Yardımcı klasörler

- `docs/fable_yol-haritasi/calisma-arsivi/` — bu setin üretim arşivi: 7 ajanlık **kod analizi** (`analiz-tam.json`: ~110 bug, oyuncu ilk-60-dakika simülasyonu) ve bağımsız denetçi bulguları (`elestiri-bulgulari.json`). Uygulama sırasında bağlayıcı DEĞİLDİR; arka plan/gerekçe kaynağıdır.
- `docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md` — senaryo temeli (perde/bölüm kurgusu, A/B/C/R tanımı). Bu set onunla çelişmez; onu uygulanabilir plana çevirir.
- `docs/DEVELOPMENT_SPEC.md` — eski 5-özellik talimatnamesi; tarihî referanstır (F5-06'da "uygulandı" bandı eklenecek).
