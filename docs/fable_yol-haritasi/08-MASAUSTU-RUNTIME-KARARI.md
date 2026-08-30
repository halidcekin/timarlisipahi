# 08 — Masaüstü Runtime Seçim Kararı: Tauri 2 / Electron

**Durum:** `07` için bağlayıcı masaüstü eki  
**Tarih:** 30 Ağustos 2026  
**Dar öncelik:** Bu belge yalnız masaüstü kabuğu, paketleme, yerel kayıt ve Steam entegrasyonu konularında `07` ve önceki belgeleri geçersiz kılar. Diğer konularda `07` geçerlidir.

> Kullanıcı kararı: Electron’dan daha optimum bir masaüstü çözümü varsa uygulanacaktır. Bu, doğrudan framework değiştirme emri değildir; “optimum” aşağıdaki ölçütlerle kanıtlanacaktır. Kod değişikliği bu belge kapsamında yapılmaz; devralan geliştirici G0-00 spike’ını yürütür.

---

## 1. Bağlayıcı karar

**Tauri 2 tercih hipotezidir; Electron güvenli fallback’tir.** Geliştirici iki runtime’ı 16–24 saatlik aynı-build A/B spike’ında ölçer:

- Tauri bütün hard gate’leri geçer ve anlamlı kaynak/dağıtım kazancı üretirse **Tauri 2 seçilir**, Electron aynı milestone içinde kaldırılır.
- Tek bir hard gate başarısızsa veya sonuç 24 saat sonunda belirsizse **Electron seçilir**, Tauri spike branch’i kapatılır.
- İki production kabuğu birlikte bakıma alınmaz.
- Neutralino, Wails, NW.js veya oyun motoru rewrite’ı bu spike’a girmez; Bölüm 3’teki gerekçelerle elenir.
- Seçim geliştiricinin kişisel tercihiyle değil `docs/desktop-runtime-spike.md` kanıtıyla yapılır.

Bu karar, `07` üst bilgisindeki “Electron birincil hedef” ve Electron’a özel tüm mutlak ifadeleri şu şekilde değiştirir: **“Windows masaüstü birincil hedef; G0-00 sonunda tek runtime.”**

---

## 2. Neden Tauri aday, neden otomatik kazanan değil?

Tauri 2 mevcut Vite çıktısını statik web içeriği olarak kullanabilir ve Windows’ta Chromium tabanlı WebView2 üzerinde çalışır. Ayrı Chromium/Node runtime’ı paketlememesi genellikle daha küçük kurulum ve daha dar native yetki yüzeyi sağlayabilir. Capability/permission modeli renderer’ın yerel yetkilerini açıkça sınırlar.

Ancak bu proje sıradan bir form uygulaması değildir:

- Sürekli WebGL/Three.js GPU yükü vardır.
- Pointer lock, fullscreen, audio autoplay, gamepad ve focus/alt-tab davranışı kritiktir.
- Steam Overlay grafik aygıtı oluşturulmadan önce Steam API başlangıcını gerektirir.
- Sistem WebView2’nin otomatik güncellenmesi güvenlik avantajı olmakla birlikte QA sırasında renderer sürümü değişkenliği doğurabilir.
- Tauri, Rust/MSVC toolchain ve Steamworks için native wrapper/paketleme sorumluluğu ekler.

Bu yüzden “Tauri daha küçük” tek başına geçiş gerekçesi değildir. Oyunun kare süresi, overlay’i, kayıt güvenliği veya geliştirilebilirliği kötüleşiyorsa optimum değildir.

---

## 3. Aday eleme matrisi

| Aday | Artı | Ana risk | V2 kararı |
|---|---|---|---|
| **Tauri 2 + WebView2** | Vite uyumu, daha küçük host ihtimali, Rust command + capability sınırı, sabit app-data | Steam Overlay belirsizliği; Rust/MSVC; WebView2 sürüm varyansı | **A/B spike adayı** |
| **Electron** | Mevcut kabuk, sabit Chromium, WebGL ve Steam overlay ekosistemi daha öngörülebilir, yalnız JS/CJS | Daha büyük paket/RAM, Chromium güncelleme yükü, IPC/security sertleştirmesi | **Fallback ve A/B baseline** |
| Neutralinojs | Çok küçük host | Steam/native ekosistem ve ağır WebGL oyun QA’sı zayıf | Elendi |
| Wails | Sistem WebView + Go | Steamworks köprüsü ve mevcut ekip/toolchain için ek özel iş | Elendi |
| NW.js | Chromium/Node ve Steam oyunlarında kullanılabilir | Electron’a göre belirgin paket/runtime avantajı kanıtı yok; ikinci Chromium kabuğu | Elendi |
| Özel C++/WebView2 host | En dar Windows host ve resmî C++ Steamworks yolu mümkün | Kendi framework, IPC, updater, paketleme ve güvenlik katmanını yazma maliyeti | V1 için elendi |
| Godot/Unity/native motor rewrite | Oyun odaklı export/Steam ekosistemi | Mevcut Three.js oyununun büyük ölçüde yeniden yazılması | Kapsam dışı |

Tauri’nin deneysel CEF yolu stable karar değildir; spike yalnız stable Tauri 2 + Windows WebView2 hattını ölçer. CEF kullanılırsa Tauri’nin paket boyutu avantajı büyük ölçüde kaybolur ve yeni deneysel risk eklenir.

---

## 4. G0-00 spike kapsamı

### 4.1 Aynı frontend kuralı

Electron ve Tauri aynı `npm run build` ile üretilmiş `dist/**` dosyasını açar. Spike sırasında gameplay/UI kaynak koduna runtime’a özel koşul eklenmez. Yalnız aşağıdaki adapter arayüzü değişebilir:

```js
desktopRuntime.getInfo()
desktopRuntime.save.write(slot, bytes)
desktopRuntime.save.read(slot)
desktopRuntime.save.list()
desktopRuntime.steam.getStatus()
desktopRuntime.steam.unlockAchievement(id)
desktopRuntime.window.setFullscreen(enabled)
```

Web/dev fallback aynı arayüzü IndexedDB ve no-op Steam adapter ile uygular. Gameplay hiçbir yerde `window.electron`, `window.__TAURI__` veya doğrudan native API çağırmaz.

### 4.2 Test makineleri

En az iki gerçek Windows profili:

1. Referans cihaz: i5-8400/Ryzen 3 3100, 8 GB, GTX 1050 Ti 4 GB, Windows 10/11.
2. Güncel orta sınıf cihaz: 16 GB RAM ve güncel ayrık veya tümleşik GPU.

VM sonucu GPU/overlay hard gate kanıtı değildir. Her ölçümde OS build, GPU/driver, WebView2 veya Chromium sürümü ve build hash kaydedilir.

### 4.3 Sabit test sahnesi

- Production build, 1920×1080 Medium
- Aynı save fixture ve simulation seed
- 60 saniye warm-up
- 10 dakika aynı rota: meydan → mescid çevresi → değirmen → köprü → harami kampı → modal → save
- 3 tekrar; medyan ve en kötü koşu raporlanır
- DevTools kapalı; profiler yalnız ayrı teşhis koşusunda

---

## 5. Hard gate’ler

Tauri’nin seçilebilmesi için aşağıdakilerin **tamamı** geçmelidir.

### H1 — WebGL ve kullanıcı girdisi eşdeğerliği

- Three.js sahnesi, shader, gölge, texture, PMREM, parçacık ve fontlar görsel regresyon eşiğinde eş.
- Hardware acceleration aktiftir; software renderer kabul edilmez.
- Pointer lock, fare hassasiyeti, klavye rollover, gamepad, fullscreen ve çoklu DPI çalışır.
- Alt-tab, ekran kilidi, sleep/resume, pencere resize ve ikinci monitörden dönüş crash/state kaybı üretmez.
- Audio autoplay yalnız açık kullanıcı etkileşimiyle başlar; mute/unmute ve focus kaybı iki runtime’da eş.
- IME/Türkçe karakter, clipboard gerekmeyen metin alanları ve accessibility tree çalışır.

### H2 — Performans regresyonu yok

Tauri, Electron baseline’a göre her iki cihazda:

- median FPS’de %5’ten fazla kötüleşmez;
- p95/p99 frame time’da %5’ten fazla kötüleşmez;
- `>50 ms` hitch sayısını artırmaz;
- ilk açılışı %10’dan fazla yavaşlatmaz;
- 30 dakikada crash, GPU reset veya sürekli memory artışı üretmez.

### H3 — Anlamlı optimizasyon kazancı

Geçiş maliyetini haklı çıkarmak için aşağıdakilerden en az ikisi:

- Aynı aktif sahnede process-tree peak working set en az %20 düşük.
- Steam depot/kurulum boyutu en az %25 düşük **ve en az 30 MB mutlak kazanç**.
- Cold start en az %15 hızlı.
- Güvenlik sınırında genel filesystem/shell yetkisi tamamen kaldırılmış ve native attack surface denetiminde daha az high-risk capability.

Windows’ta zaten paylaşılan WebView2 dosyaları kurulum boyutuna dahil değilse bu açıkça raporlanır. Offline WebView2 runtime’ı paketleniyorsa gerçek artifact boyutu ayrıca ölçülür; rakam seçilerek sunulmaz.

### H4 — Steam temel özellikleri

Steam istemcisinden başlatılan gerçek packaged build’de:

- Steam API başarıyla başlar veya capability açıkça `unavailable` olur; oyun yine açılır.
- Shift+Tab Overlay hem menüde hem aktif WebGL sahnesinde görünür; aç/kapa sonrası input/focus bozulmaz.
- Test achievement bir kez açılır, geçersiz/izin dışı achievement ID reddedilir.
- Steam kapalıyken oyun offline açılır ve save çalışır.
- AppID `480` yalnız spike/test config’inde bulunur; production bundle/config’te yasaktır.
- Native DLL/crate yoksa uygulama sessiz siyah ekran yerine güvenli capability hatası üretir.

Steam Overlay bu proje için hard gate’tir. “Achievement çalıştı, overlay sonra çözülür” Tauri seçimi için yeterli değildir.

### H5 — Kayıt kalıcılığı ve Steam Cloud yolu

- Save, runtime’a özgü app-data dizininde `07` Bölüm 11 şemasıyla atomik yazılır.
- Uygulamayı tam kapatıp yeni process’te açınca canonical hash aynıdır.
- Update/uninstall-reinstall simülasyonunda tanımlı veri koruma politikası uygulanır.
- Slot dosyalarının yolu Steam Auto-Cloud ile eşlenebilir; gameplay native Cloud API’ye bağımlı değildir.
- Cloud conflict’te revision/checksum/recovery politikası çalışır; eski geçerli kayıt otomatik ezilmez.

Steam’in Auto-Cloud özelliği yalnız dosya yolu yapılandırmasıyla çalışabildiğinden, V1’de save için native Steam Cloud API zorunlu değildir. Achievement/Overlay native entegrasyonu ayrı capability’dir.

### H6 — Güvenlik ve yetki sınırı

Tauri için:

- Tek local main window; remote URL capability yok.
- Genel `fs`, `shell`, process-spawn ve arbitrary path izni yok.
- Yalnız `save_read`, `save_write`, `save_list`, `runtime_info` ve seçildiyse allowlist’li Steam command’leri.
- Her command slot enum’u, payload boyutu, schema ve path confinement doğrular.
- CSP `default-src 'self'`; dış navigation/new window reddedilir.

Electron için eşdeğer baseline:

- `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`, `webSecurity:true`.
- Sabit `app://game` veya test edilmiş `loadFile`; rastgele localhost yok.
- Dar preload IPC; genel filesystem/shell yok.
- Navigation, new-window ve permission varsayılan deny.

Security testlerinden biri başarısız olan runtime seçilemez.

### H7 — Paketleme ve bakım

- Tek komut clean Windows CI’da imzalanabilir installer/depot artifact üretir.
- Artifact internet olmadan açılır. Tauri’de WebView2’nin eksik olduğu koşul için `embedBootstrapper`/offline prerequisite kararı ve test kanıtı vardır.
- Crash logu güvenli app-data dizininde, secret/save payload içermeden alınır.
- Playwright veya eşdeğer automation başlangıç, save/restart, security ve a11y smoke’u çalıştırabilir.
- Yeni toolchain lock’ları sabittir; Tauri seçilirse Rust stable toolchain ve MSVC prerequisites runbook’ta bulunur.

---

## 6. Otomatik seçim algoritması

```text
if any(H1..H7 == FAIL):
    select Electron
else if meaningful_gain_count(H3) < 2:
    select Electron
else:
    select Tauri 2
```

Ek kurallar:

- `NOT_TESTED` = `FAIL`; “sonra bakılır” yok.
- Yalnız bir geliştirici cihazında geçen overlay/performance yeterli değil.
- Sonuçlar %5 ölçüm gürültüsü içindeyse daha düşük migration riski nedeniyle Electron kalır.
- Tauri kazanırsa seçim `DEC-DESKTOP-001` olarak kaydedilir ve Electron G0 bitmeden silinir.
- Electron kazanırsa Tauri bağımlılıkları/`src-tauri` spike çıktısı ana branch’e girmez; yalnız ölçüm raporu kalır.

---

## 7. Tauri 2 seçilirse uygulama sözleşmesi

### 7.1 Yapı

```text
src/platform/DesktopRuntime.js       // runtime-nötr frontend adapter
src/platform/WebRuntime.js
src-tauri/Cargo.toml
src-tauri/rust-toolchain.toml
src-tauri/tauri.conf.json
src-tauri/capabilities/main.json
src-tauri/src/lib.rs
src-tauri/src/save.rs
src-tauri/src/steam.rs                // yalnız H4 geçtiyse
```

- `frontendDist` mevcut `../dist` olur; dev server yalnız development’ta kullanılır.
- Production’da remote content ve development URL fallback’i yoktur.
- Tauri JS global’i açılmaz; yalnız import edilen dar invoke adapter’ı kullanılır.
- Canonical save için genel store/fs plugin’i renderer’a açılmaz. Rust command atomik temp-write + checksum + rename uygular.
- Secret olmadığı için save Stronghold’a konmaz; şifreleme doğruluk/checksum yerine kullanılmaz.

### 7.2 Steam

- Save için öncelik Steam Auto-Cloud’dur; app-data slot dosyaları Steamworks panelinde eşlenir.
- Native Rust Steamworks wrapper yalnız achievement ve overlay H4’ü geçtiyse eklenir.
- `SteamAPI_Init` grafik aygıtından önce gerçekleşme koşulu packaged build’de kanıtlanır.
- DLL redistributable, lisans ve target architecture paketleme testine girer.
- JS tarafı yalnız allowlist’li achievement ID gönderir; Cloud path veya key seçemez.

### 7.3 Kaldırma

Parity sonrası aynı PR/milestone’da:

- `electron-main.cjs`, `electron-preload.cjs` ve Electron devDependency kaldırılır.
- `desktop`/`package:desktop` script’leri Tauri’ye çevrilir.
- Electron güvenlik ve E2E maddeleri Tauri eşdeğeriyle dokümante edilir.
- Eski Electron kayıtları bir kez Tauri app-data dizinine checksum’lı migration ile alınır; kaynak kopya recovery için korunur.

---

## 8. Electron seçilirse uygulama sözleşmesi

Electron’un kalması “mevcut hâli uygundur” demek değildir:

- Rastgele portlu local HTTP server kaldırılır.
- Production yalnız paketlenmiş `dist/**` açar; repo-root fallback ve wildcard CORS yoktur.
- Kayıt browser storage değil `app.getPath('userData')` altındaki main-process repository’dir.
- Preload yalnız `DesktopRuntime` adapter’ının sabit slot/achievement API’sini açar.
- Steamworks paketi gerçekten dependency değilse özellik sunulmuş gibi gösterilmez.
- AppID environment/build config’inden gelir; `480` production’da validator hatasıdır.
- Electron güncelleme cadence’i, Forge/builder seçimi, code signing ve Windows artifact testleri G0/G6’da belgelenir.

---

## 9. Spike rapor şablonu

`docs/desktop-runtime-spike.md` şu bölümleri taşır:

```text
Build hash / frontend dist hash
Windows, GPU, driver, runtime sürümleri
Electron ve Tauri exact config/commit
H1-H7: PASS/FAIL + kanıt linki
3 koşunun ham FPS/frame-time/memory/startup/size değerleri
Steam launch/overlay/achievement/offline videosu
Save process-restart ve Cloud path sonucu
Security/a11y/E2E raporu
Toolchain ve CI süresi
Migration tahmini ve açık riskler
meaningful_gain_count
Otomatik algoritma sonucu
DEC-DESKTOP-001
```

Rapor sonuçtan sonra yazılmaz; ölçüm script’i ham JSON/CSV’yi üretir, rapor onları referanslar.

---

## 10. Yol haritası etkisi

`07` G0’a ilk iş olarak eklenir:

- `G0-00 Desktop runtime A/B spike`: **16–24 saat**.
- Tauri seçilirse parity + migration + CI: ek **24–40 saat**.
- Electron seçilirse security/save/package hardening: **16–28 saat**.
- İki bant birlikte toplanmaz.

G1 dikey kesit, tek runtime seçilip diğerinin bağımlılıkları kaldırılmadan başlamaz. `07` toplam 700–1000 saat bandı bu seçimi kapsayacak kadar tamponludur; G1 sonunda yine yeniden tahmin edilir.

---

## 11. Resmî dayanaklar

- Tauri, Vite/static frontend uyumu: <https://v2.tauri.app/start/frontend/> ve <https://v2.tauri.app/start/frontend/vite/>
- Tauri Windows/WebView2 prerequisites: <https://v2.tauri.app/start/prerequisites/>
- Tauri WebView sürümleri: <https://v2.tauri.app/reference/webview-versions/>
- Tauri capability/permission sınırı: <https://v2.tauri.app/reference/acl/capability/>
- Tauri IPC command modeli: <https://v2.tauri.app/concept/inter-process-communication/>
- Tauri Windows installer ve WebView2 dağıtımı: <https://v2.tauri.app/distribute/windows-installer/>
- Microsoft WebView2 performans/GPU ilkeleri: <https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/performance>
- Microsoft WebView2 dağıtım seçenekleri: <https://learn.microsoft.com/microsoft-edge/webview2/concepts/distribution>
- Electron mimarisi ve Chromium/Node bundling: <https://www.electronjs.org/docs/latest/>
- Electron güvenlik checklist’i: <https://www.electronjs.org/docs/latest/tutorial/security>
- Steamworks API genel bakış: <https://partner.steamgames.com/doc/sdk/api>
- Steam Overlay başlangıç şartı: <https://partner.steamgames.com/doc/features/overlay?l=english>
- Steam Cloud ve Auto-Cloud: <https://partner.steamgames.com/doc/features/cloud>

Framework tanıtımındaki “küçük/hızlı/güvenli” ifadeler benchmark kanıtı değildir. Nihai karar yalnız bu proje ve aynı build üzerinde H1–H7 ile verilir.

