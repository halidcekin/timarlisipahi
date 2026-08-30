export const meta = {
  name: 'sipahi-derin-okuma',
  description: 'Tımarlı Sipahi 3D kod tabanını 7 paralel ajanla derin analiz: mimari, buglar, akış sorunları, içerik envanteri',
  phases: [
    { title: 'Derin Okuma', detail: 'her alt sistem için bir okuyucu ajan' },
  ],
}

phase('Derin Okuma')

const READ_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'architecture', 'bugs', 'engagement', 'contentInventory', 'hooks', 'techDebt'],
  properties: {
    summary: { type: 'string', description: 'Alanın 3-5 cümlelik özeti (Türkçe)' },
    architecture: { type: 'string', description: 'Nasıl çalışıyor: veri akışı, ana fonksiyonlar, sistemler arası bağlantılar. Dosya:satır referanslı, detaylı (Türkçe)' },
    bugs: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['where', 'what', 'severity'], properties: { where: { type: 'string', description: 'dosya:satır' }, what: { type: 'string' }, severity: { type: 'string', enum: ['kritik', 'yüksek', 'orta', 'düşük'] } } } },
    engagement: { type: 'array', items: { type: 'string' }, description: 'Oyun akışını/temposunu/bağlılığı bozan tasarım sorunları' },
    contentInventory: { type: 'string', description: 'Bu alandaki mevcut metin/diyalog/tarihi/dini içeriğin envanteri: hangi NPC ne diyor, hangi tarihi olaylar geçiyor, mizah var mı' },
    hooks: { type: 'array', items: { type: 'string' }, description: 'Mizah, tarih öğretimi veya İslami içerik eklemek için somut fırsat noktaları (dosya/sistem referanslı)' },
    techDebt: { type: 'array', items: { type: 'string' } },
  },
}

const COMMON = `Sen "Mülk-i Osmanî: Tımarlı Sipahi 3D" adlı Three.js + Vite + Electron oyununu analiz eden bir kod inceleme uzmanısın. Çalışma dizini: D:\\antigravity\\sipahi. Oyun 1396 Niğbolu dönemi Osmanlı tımar simülasyonu.

GÖREV: Aşağıda listelenen dosyaların TAMAMINI baştan sona oku (Read tool, gerekirse offset ile devam et — hiçbir dosyayı yarım bırakma). Sonra StructuredOutput şemasına göre raporla. Tüm metinler TÜRKÇE olsun. Her bug ve tespit için dosya:satır referansı ver. Tahmin etme; sadece kodda GÖRDÜĞÜNÜ raporla. Diğer sistemlere yapılan çağrıların gerçekten var olup olmadığını grep ile doğrula (ör. çağrılan metod karşı tarafta tanımlı mı).

Analiz perspektifin: (1) doğruluk — buglar, ölü kod, tanımsız çağrılar; (2) oyuncu deneyimi — akıcılık, tempo, geri bildirim eksikleri; (3) içerik — mevcut diyalog/tarih/din/mizah envanteri ve yeni içerik eklenebilecek kanca noktaları.`

const AREAS = [
  {
    key: 'core',
    files: 'src/main.js, src/core/Engine.js, src/core/GameState.js, src/core/InputManager.js, src/core/SaveManager.js, src/core/AssetLoader.js, src/core/AudioManager.js, src/core/ParticleSystem.js, src/core/SoloGameState.js, src/core/SteamManager.js',
    focus: 'Oyun döngüsü, zaman sistemi (updateTime kullanılıyor mu?), kayıt sistemi güvenilirliği, ses altyapısı, performans (her karede ne çalışıyor), SoloGameState ölü kod mu?',
  },
  {
    key: 'entities',
    files: 'src/entities/ModelBuilder.js, src/entities/TownGenerator.js, src/entities/NPCManager.js, src/entities/VillagerAI.js, src/entities/Player.js, src/entities/TextureGenerator.js',
    focus: 'Dünya üretimi, NPC yaşam döngüsü (24 saat rutini gerçekten çalışıyor mu), oyuncu hareketi/at binme hissi, prosedürel model kalitesi, public/models altındaki OBJ modellerin (stanlee3d, gobekli, demirci, saka) nerede/nasıl kullanıldığı — telif riski taşıyan model var mı',
  },
  {
    key: 'narrative',
    files: 'src/systems/QuestSystem.js, src/systems/DialogueSystem.js, src/systems/PetitionSystem.js, src/systems/HistoryEventSystem.js, src/services/GeminiService.js',
    focus: 'Görev zinciri yapısı ve çeşitliliği, TÜM diyalog metinlerinin envanteri (hangi NPC ne diyor, üslup nasıl), tarihi olay sistemi neyi ne zaman gösteriyor, Gemini API entegrasyonu (API key nasıl saklanıyor — güvenlik!), arzuhal sistemi akışı. contentInventory alanını bu ajan İSTİSNASIZ ÇOK detaylı doldursun: her görevin adı+akışı+ödülü, her NPC nin karakteri.',
  },
  {
    key: 'gameplay',
    files: 'src/systems/CombatSystem.js, src/systems/ArcherySystem.js, src/systems/TrainingSystem.js, src/systems/CampaignBattleSystem.js, src/systems/SupplySystem.js, src/systems/TimarSystem.js',
    focus: 'Dövüş hissi (vuruş geri bildirimi, hasar matrisi), okçuluk fiziği, talim mekaniği gerçek mi yoksa konuşunca bitiyor mu, Niğbolu sefer savaşı gerçekten oynanıyor mu yoksa metin mi, tımar ekonomisi döngüsü (gelir-gider dengesi çalışıyor mu), sistemler arası kopukluklar',
  },
  {
    key: 'ui',
    files: 'src/ui/UIManager.js, src/style.css, index.html',
    focus: 'HUD bilgi mimarisi, diyalog penceresi UX, modal yönetimi, getActiveTargetInfo gibi tanımsız çağrılar, başlangıç ekranı, bildirim sistemi, erişilebilirlik, görsel tutarlılık, Türkçe metin kalitesi',
  },
  {
    key: 'docs',
    files: 'docs/DEVELOPMENT_SPEC.md, docs/TARIHSEL_SENARYO_VE_GELISTIRME_PLANI.md, README.md, tests/systems.test.js, package.json, vite.config.js, electron-main.cjs, electron-preload.cjs',
    focus: 'Mevcut iki tasarım dokümanının TÜM karar ve planlarını damıt: hangi özellikler planlanmış, hangi buglar zaten biliniyor, hangi kampanya yapısı önerilmiş (perde/bölüm yapısı), A/B/C/R tarihsellik sınıflandırması nedir. Test dosyası gerçekte neyi test ediyor — gerçek modülleri mi import ediyor yoksa kopya/mock mantık mı test ediyor? contentInventory alanına dokümanlardaki önerilen kampanya yapısının tam özetini yaz.',
  },
]

const results = await parallel(
  AREAS.map((a) => () =>
    agent(
      `${COMMON}\n\nSENİN ALANIN: ${a.key}\nOKUNACAK DOSYALAR (tamamı): ${a.files}\nÖZEL ODAK: ${a.focus}`,
      { label: `oku:${a.key}`, phase: 'Derin Okuma', schema: READ_SCHEMA }
    )
  )
)

const TRACE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['timeline', 'frictionPoints', 'firstHourVerdict'],
  properties: {
    timeline: { type: 'string', description: 'Yeni oyuncunun ilk ~60 dakikasının dakika dakika simülasyonu: ne görür, ne yapar, ne öğrenir, ne zaman sıkılır. Koddan izlenerek, dosya referanslı (Türkçe)' },
    frictionPoints: { type: 'array', items: { type: 'string' }, description: 'Oyuncunun takılacağı/sıkılacağı/kafasının karışacağı somut anlar' },
    firstHourVerdict: { type: 'string', description: 'İlk saat deneyiminin dürüst değerlendirmesi: oyuncu neden devam eder / neden bırakır' },
  },
}

const trace = await agent(
  `${COMMON}\n\nSENİN GÖREVİN FARKLI: Kodu okuyarak YENİ BİR OYUNCUNUN ilk 60 dakikasını simüle et. Başlangıç ekranından başla (index.html), src/main.js akışını izle, QuestSystem'deki görev zincirini sırayla takip et, her görevde oyuncunun fiilen ne yaptığını (yürü, konuş, seç, savaş) ve ekranda ne gördüğünü çıkar. Oku: index.html, src/main.js, src/systems/QuestSystem.js, src/systems/DialogueSystem.js, src/ui/UIManager.js, src/core/GameState.js — gerektiği kadarını tam oku. Oyuncunun sıkılacağı, kafasının karışacağı, takılacağı anları acımasızca tespit et.`,
  { label: 'oyuncu-deneyimi-izi', phase: 'Derin Okuma', schema: TRACE_SCHEMA }
)

return {
  areas: Object.fromEntries(AREAS.map((a, i) => [a.key, results[i]])),
  playerTrace: trace,
}