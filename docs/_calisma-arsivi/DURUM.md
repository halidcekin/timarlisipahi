# Yol Haritası Çalışması — Durum ve Devir Dosyası

Son güncelleme: 30 Ağustos 2026, 11:35

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

## Devam Eden — GÜNCEL DURUM (11:35 itibarıyla)
5. ✅ **3 eleştirmen tamamlandı** (sadelik/fizibilite, dinî-tarihî hassasiyet, deneyim-bütünlük). Üçü de "düzeltmeyle-onay" verdi. TÜM BULGULAR: `elestiri-bulgulari.json` (bu klasörde) — 18 engelleyici sorun + 30 iyileştirme. Öne çıkan engelleyiciler: P1-05 Gemini Kadı akışı hiçbir faza atanmamış; F2-02/F4-09 havadis-perde takvimi kilitlenmesi (g124-128); Ramazan Bayramı g98-100 atlama penceresine düşüyor ama F4-16 sahne istiyor; H6 hutbe dayanağı yanlış tahriçli (Müslim değil Taberânî/Hâkim); Jean de Nevers "Korkusuz" lakabı anakronik (lakap Niğbolu SONRASI); F0-01 "git init" varsayımı yanlış (repo zaten git); köprü collider bug'ı geç faza atılmış; ölçüm altyapısı (bot koşusu) bütçelenmemiş.
6. ✅ **Revizyonlar tamamlandı** (30 Ağustos, ~12:30): 01-05 dokümanlarının düzeltmeleri revizyon ajanlarınca uygulandı (hepsi büyüdü). 06'nın revizyon ajanı iki kez sessizce takıldığı için 06'nın 14 engelleyici düzeltmesi ana oturumda ELLE uygulandı: Ç16 (ferman gün-eşiği) + Ç17 (Ramazan Bayramı atlama kartı) eklendi, Ç5 grep listesi netleştirildi, F0-01 git varsayımı düzeltildi, F0-06'ya P1-13, F0-14 (köprü/nehir) ve F0-13'e 1ea86b2 notu eklendi, F2-14 (kadı akışı) + F2-15 (telemetri) eklendi, F2-05 taxPolicy tanımlandı, historicalEvents.js iptal, bot-koşusu kriterleri deterministikleştirildi, F3-07 reayaTrust formülü, efor 368-484 saat / ~17 hafta. Dip nota revizyon notu eklendi.
7. ✅ **00-GENEL-BAKIS.md yazıldı** (okuma kılavuzu + analiz-sonrası 2 commit uyarısı).
8. ✅ **Bağımsız son denetim tamamlandı** (30 Ağustos): 18 engelleyici bulgunun 16'sı tam / 2'si kısmen uygulanmış bulundu; analizdeki 27 kritik/yüksek bug'ın TAMAMI faz planına eşlenmiş; içerik kaybı yok; geçici yol kalıntısı yok. Denetçinin 4 tutarlılık düzeltmesi işlendi: (1) 05-teknik'ten historicalEvents.js kalıntısı silindi + P1-04 "kaldırma" kararına çevrildi, (2) 06 F5-04'ten köprü/nehir çifte kaydı düşüldü (F0-14 esas), (3) Bölüm 2 / §11.1 efor bantları eşitlendi (368-484 saat), (4) 01'deki yasaklı "zemzem" replik kalıntısı Ç4 kararıyla değiştirildi. Ek: F5-09 yayın kapısına git-geçmişi temizliği maddesi, F0 kabulüne Koca Yakub nesnel kontrolü eklendi.

## SONUÇ: TESLİMAT TAMAMLANDI ✅
`docs/yol-haritasi/` altında 7 doküman (00-06) nihai hâlinde; geliştirici 00-GENEL-BAKIS.md'den başlayarak uygulayabilir. Denetim, planı "GEÇTİ" seviyesinde onayladı. Sonraki adım (ayrı iş): geliştirme bittikçe fazların bu dokümanlara göre bağımsız kabul denetimi.

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
