# Yol Haritası Çalışması — Durum ve Devir Dosyası

Son güncelleme: 30 Ağustos 2026, 11:10

## Görev
Oyun için devredilebilir, çok detaylı geliştirme yol haritası üretmek. İşveren hedefleri:
1. Zamanın nasıl geçtiği anlaşılmayan akıcı oyun (flow)
2. Küçük nükte ve espriler
3. Oynarken Osmanlı/Türk tarihi ve İslami bilgiler öğretmek — **İslami içerik Ehl-i Sünnet çizgisinde** (Hanefî fıkhı, Mâturîdî itikadı, sahih kaynak)

Dokümanları başka bir geliştirici uygulayacak; sonra bağımsız denetim yapılacak.

## Tamamlananlar
1. ✅ **Doğrulama:** `npm test` 97/97 geçti, `npm run build` başarılı (tek uyarı: >500kB chunk).
2. ✅ **Derin kod analizi** (7 paralel ajan): `analiz-tam.json` — alanlar: core, entities, narrative, gameplay, ui, docs + playerTrace (ilk 60 dk simülasyonu). ~110 dosya:satır referanslı bug.
3. ✅ **5 tasarım dokümanı** (bu klasördeki 01–05 taslakları): akış/tutundurma, mizah/diyalog (~150 hazır replik), tarih eğitimi (40 kodeks maddesi), İslami içerik (Ehl-i Sünnet ilkeleri + hassasiyet protokolü), teknik plan (P0/P1/P2 bug backlog).
4. ✅ **Sentez/faz planı** (06 taslağı): 6 faz, 340–453 saat, Ç1–Ç15 çelişki kararları (NİHAİ — diğer dokümanlarla çelişirse 06 kazanır), Definition of Done, denetçi kabul prosedürü.

## Devam Eden (kesintiye uğrarsa yeniden çalıştırılabilir)
- 🔄 **Eleştiri → Revizyon → Denetim workflow'u** (`sipahi-elestiri-revizyon-denetim-wf_dca97777-5d7.js`):
  - 3 eleştirmen (sadelik/fizibilite, dinî-tarihî hassasiyet, deneyim-bütünlük)
  - 6 revizyon editörü: taslakları düzeltmeleri uygulayarak `docs/yol-haritasi/` altına kopyalar
  - 1 son bütünlük denetçisi (kritik/yüksek bugların faz planına eşlendiğini doğrular)

## Kalanlar
1. Workflow bitince: eleştiri/denetim sonuçlarını gözden geçir, kalan sorunları düzelt.
2. `docs/yol-haritasi/00-GENEL-BAKIS.md` yaz (giriş/okuma kılavuzu: vizyon, doküman haritası, geliştiricinin okuma sırası, denetim süreci).
3. Son teslim raporu + (istenirse) commit/push.

## Sıfırdan Devam Talimatı (yeni makine/oturum için)
1. Repo'yu klonla, `npm install`.
2. Bu klasördeki `DURUM.md` + `analiz-tam.json` + 6 taslağı oku.
3. `docs/yol-haritasi/` yoksa veya eksikse: `sipahi-elestiri-revizyon-denetim-*.js` workflow script'ini (bu klasörde) Workflow tool ile yeniden çalıştır — script kendi başına yeterlidir; içindeki `DIR` ve `ANALIZ` yollarını bu klasöre (`docs/_calisma-arsivi/`) göre güncelle.
4. "Kalanlar" listesini tamamla.

## Sabit Kararlar (tartışmasız)
- Kampanya: 1 Nisan 1396 → 25 Eylül 1396 Niğbolu finali; A/B/C/R tarihsellik etiketleri.
- İslami içerik Ehl-i Sünnet çizgisinde; din/ibadet/din adamı asla mizah nesnesi olmaz; ibadet stat ödülüne bağlanmaz.
- Mevcut mimari korunur (cerrahi değişiklik, solo geliştirici gerçekliği); mizah dünyevi alanda yaşar.
- daySpeed 1/60 (1 gerçek sn = 1 oyun dk); tek zaman otoritesi GameState.updateTime.
