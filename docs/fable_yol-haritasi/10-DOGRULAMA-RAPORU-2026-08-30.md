# 10 — Başlangıç Doğrulama Raporu

**Tarih:** 30 Ağustos 2026  
**Branch:** `docs/fable-roadmap-hardening`  
**Kapsam:** Belge revizyonu sonrası mevcut kod tabanının taze baseline kontrolleri  
**Kod değişikliği:** Yok

> Bu rapor mevcut kodun V2 hedeflerini karşıladığını söylemez. Yalnız devralan geliştiricinin başlayacağı gerçek baseline’ı ve görülen riskleri kaydeder.

## 1. Ortam

- Node.js: `v22.23.2`
- Paket kurulumu: `npm ci`
- Kurulum sonucu: exit 0; 26 paket eklendi
- Çalışma ağacı: yalnız bu yol haritası için dört yeni bağlayıcı belge + bu rapor untracked
- Commit/push: yapılmadı

## 2. Test

Komut:

```text
npm test
```

Sonuç: **exit 0 — 123/123 mevcut custom assertion geçti.**

Bu sonucun sınırları:

- Runner `tests/systems.test.js` içinde özel ve sıra bağımlı yapıdır; gerçek unit/integration ayrımı değildir.
- Save çağrılarının async tamamlanma/izolasyon sorunu teknik denetimde ayrıca tespit edilmiştir.
- Test, uygulamayı kapatıp yeni process açarak masaüstü kayıt kalıcılığını kanıtlamaz.
- Testler 1402 Ankara genişleme hattını ve V2’de kaldırılması gereken `martyrdom`, taşlanma/linç ve benzeri eski davranışları bugün “başarılı” saymaktadır.
- 123 sayısı kalite kapısı değildir; V2 davranış kimlikleriyle yeni test matrisi gerekir.

Dolayısıyla bu yeşil sonuç yalnız **değişiklik öncesi geriye dönük baseline** olarak korunur.

## 3. Production build

Komut:

```text
npm run build
```

Sonuç: **exit 0 — Vite production build başarılı.**

Ölçülen çıktı:

```text
dist/index.html                  16.82 kB │ gzip 5.30 kB
dist/assets/index-BXIIX88b.css   13.71 kB │ gzip 3.16 kB
dist/assets/index-DC3fumrN.js   961.34 kB │ gzip 286.22 kB
```

Uyarı: ana JS chunk 500 kB sınırını aşıyor. Bu yayın blocker’ı olarak otomatik değerlendirilmez; G0/G1 performans baseline’ı ve gerçek frame-time/memory ölçümüyle birlikte ele alınır.

## 4. Dependency güvenlik taraması

Komut:

```text
npm audit --json
```

Sonuç: **exit 1 — 2 açık bulgu: 1 high, 1 moderate.**

| Paket | Seviye | Durum |
|---|---|---|
| `vite` (direct) | high | `<=6.4.2`; Windows alternate path üzerinden `server.fs.deny` bypass dâhil üç advisory zinciri |
| `esbuild` (transitive) | moderate | `<=0.24.2`; development server request/response erişim açığı |

İlgili advisory’ler:

- <https://github.com/advisories/GHSA-fx2h-pf6j-xcff>
- <https://github.com/advisories/GHSA-v6wh-96g9-6wx3>
- <https://github.com/advisories/GHSA-4w7w-66w2-5vf9>
- <https://github.com/advisories/GHSA-67mh-4wv8-2f99>

`npm audit fix --force`, Vite `8.2.2` major yükseltmesi önerdiği için **çalıştırılmadı**. Kör major upgrade yapılmaz. G0’da ayrı dependency spike’ı:

1. Güncel Vite/Electron/Tauri ve Node uyum matrisi
2. Lockfile kontrollü yükseltme
3. Önce/sonra `npm test`, build, web/Electron-or-Tauri E2E
4. Windows path/security yeniden üretim testleri
5. Rollback kanıtı

High bulgu kapanmadan release artifact kabul edilmez. Development server güvenilmeyen ağ arayüzüne açılmaz.

## 5. Yeni belge yapısal kontrolleri

Kontrol edilen dosyalar:

- `00-00-ONCE-BUNU-OKU.md` — 113 satır
- `00-01-KAHKAHA-HEDEFI-EKI.md` — 574 satır
- `07-BAGLAYICI-V2-DEVIR-SOZLESMESI.md` — 1221 satır
- `08-MASAUSTU-RUNTIME-KARARI.md` — 311 satır

Sonuçlar:

- Markdown başlık seviye sıçraması: 0
- Dengesiz code fence: 0
- Açık `TODO`, `TBD`, `FIXME`, `???`: 0
- Toplam yeni bağlayıcı içerik: 2219 satır (bu rapor hariç)

İlmî doğruluk otomatik belge kontrolüyle kanıtlanmaz; `07`deki claim/source/review ve exact-build uzman kapıları zorunludur.

## 6. Başlangıç blocker listesi

G0 kapanmadan:

- [ ] Vite high ve esbuild moderate advisory’leri kontrollü yükseltmeyle kapatılacak.
- [ ] Tauri/Electron G0-00 A/B spike’ı tamamlanacak; tek runtime seçilecek.
- [ ] Legacy test async/isolation yapısı gerçek runner’a alınacak.
- [ ] Masaüstü process-restart save testi ve stable app-data backend’i kurulacak.
- [ ] Electron kalırsa rastgele localhost/repo-root/CORS/CSP riskleri kapatılacak.
- [ ] Runtime AI hüküm/stat yolu production kapsamından çıkarılacak.
- [ ] Clock/RNG/EffectRunner/save/content review sözleşmeleri testli tabana dönüşecek.
- [ ] Tarih ve Ehl-i Sünnet içerik politika kapısı isimli uzmanlarla onaylanacak.
- [ ] G1 tek günlük dikey kesit ve ilk kahkaha sahneleri kullanıcı testine çıkacak.

