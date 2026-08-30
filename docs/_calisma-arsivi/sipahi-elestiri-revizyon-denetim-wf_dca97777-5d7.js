export const meta = {
  name: 'sipahi-elestiri-revizyon-denetim',
  description: 'Tasarım dokümanlarını 3 eleştirmenle denetle, düzeltmeleri uygulayarak repoya yayınla, son bütünlük denetimi yap',
  phases: [
    { title: 'Eleştiri', detail: 'sadelik, hassasiyet, deneyim denetçileri' },
    { title: 'Revizyon', detail: 'doküman başına düzeltme + repoya taşıma' },
    { title: 'Denetim', detail: 'son bütünlük kontrolü' },
  ],
}

const DIR = 'C:/Users/abdul/AppData/Local/Temp/claude/D--antigravity-sipahi/aaa9c9c1-5a69-435a-8b5e-78e5fcfec895/scratchpad/design'
const ANALIZ = 'C:/Users/abdul/AppData/Local/Temp/claude/D--antigravity-sipahi/aaa9c9c1-5a69-435a-8b5e-78e5fcfec895/scratchpad/analiz-tam.json'
const REPO = 'D:/antigravity/sipahi/docs/yol-haritasi'
const DOCS = [
  '01-akis-ve-tutundurma.md',
  '02-mizah-ve-diyalog.md',
  '03-tarih-egitimi.md',
  '04-islami-icerik.md',
  '05-teknik-plan.md',
  '06-fazlar-ve-kabul.md',
]
const ALL_FILES = DOCS.map((d) => `${DIR}/${d}`)

const COMMON = `Bağlam: "Mülk-i Osmanî: Tımarlı Sipahi 3D" (repo D:\\antigravity\\sipahi, Three.js+Vite+Electron, 1396 Niğbolu dönemi tımar simülasyonu) için 6 dokümanlık geliştirme yol haritası hazırlandı. İşveren hedefleri: (1) zamanın nasıl geçtiği anlaşılmayan akıcı oyun, (2) küçük nükte ve espriler, (3) oynarken Osmanlı/Türk tarihi ve İslami bilgiler öğretmek. SABİT KURALLAR: İslami içerik Ehl-i Sünnet çizgisinde (Hanefî fıkhı, Mâturîdî itikadı, sahih kaynak); din/ibadet/din adamı asla mizah nesnesi değil; kampanya 1396 → Niğbolu; A/B/C/R tarihsellik etiketleri; mevcut mimari korunur (solo geliştirici). 06-fazlar-ve-kabul.md içindeki Ç1-Ç15 çelişki kararları NİHAİDİR — diğer dokümanlarla çelişirse 06 kazanır. Dokümanları uygulayacak geliştirici soru soramayacak; sonra bağımsız denetçi işi bu dokümanlara göre kabul edecek.`

const CRIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'blockingIssues', 'improvements'],
  properties: {
    verdict: { type: 'string', enum: ['onay', 'düzeltmeyle-onay', 'red'] },
    blockingIssues: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['doc', 'issue', 'fix'], properties: { doc: { type: 'string', description: 'Hedef doküman dosya adı (ör. 02-mizah-ve-diyalog.md) veya GENEL' }, issue: { type: 'string' }, fix: { type: 'string', description: 'Somut, uygulanabilir düzeltme talimatı' } } } },
    improvements: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['doc', 'suggestion'], properties: { doc: { type: 'string' }, suggestion: { type: 'string' } } } },
  },
}

phase('Eleştiri')

const CRITICS = [
  {
    key: 'sadelik',
    brief: `SEN: Sadelik/fizibilite denetçisisin (Google Engineering Practices perspektifi). ACIMASIZCA ara: (1) over-engineering — solo geliştiricinin aylarca süreceği hayalci özellikler, speculative generality, tek kullanımlık abstraction; (2) YAGNI ihlalleri; (3) efor tahminlerinde gerçekçilik (plan 340-453 saat diyor — kalem kalem makul mü, hangi kalemler şişkin/eksik); (4) 'mevcut mimariyi koru' kuralının ihlalleri (gizli yeniden yazımlar); (5) fazlar gerçekten bağımsız teslim edilebilir mi; (6) kabul kriterleri gerçekten ölçülebilir mi yoksa muğlak mı ('çalışıyor' tarzı ifadeler). Varsayılan şüphe: bir özellik kesilebiliyorsa kesilmesini öner.`,
  },
  {
    key: 'hassasiyet',
    brief: `SEN: Kültürel/dinî/tarihî hassasiyet ve hukuk denetçisisin. ACIMASIZCA ara: (1) İslami içerikte Ehl-i Sünnet çizgisinden sapma, kaynaksız/uydurma rivayet riski, ibadetin kaba ödül döngüsüne indirgenmesi, din-mizah sınır ihlali — 02-mizah dokümanındaki ~150 örneğin HER BİRİNİ tek tek bu süzgeçten geçir; (2) tarihi yanlışlar ve anakronizmler — 03-tarih dokümanındaki tüm yıl/isim/olay iddialarını bilginle çapraz kontrol et (kodeks maddeleri, mezar kitabeleri, havadis takvimi, Niğbolu safha vinyetleri dahil); (3) 04-islami-icerik dokümanındaki ayet mealleri, hadisler, dualar ve ilmihal bilgilerinin sıhhati — şüpheli olanı işaretle; (4) hicri takvim çıpaları (Ramazan 798, Kurban Bayramı, 21 Zilhicce = Niğbolu) hesaben tutarlı mı; (5) etnik/dini topluluk temsillerinde adalet (Ceneviz/Bizans/Sırp/zimmî); (6) hukuki riskler tam kapatılmış mı (Stan Lee modeli, marka ibareleri, OBJ lisansları, Gemini API anahtarı, ezan kaydı lisansı); (7) şehitlik/gaza temalarının yaş kitlesine uygun dengesi.`,
  },
  {
    key: 'deneyim',
    brief: `SEN: Oyuncu deneyimi ve bütünlük denetçisisin. ÖNCE ${ANALIZ} dosyasını oku (7 ajanlık kod analizi: alanlar + playerTrace). SONRA 6 dokümanı oku ve ACIMASIZCA kontrol et: (1) İşverenin 3 hedefi plan tarafından GERÇEKTEN karşılanıyor mu — her hedef için kanıt zinciri kur; (2) BÜTÜNLÜK: analizdeki her 'kritik' ve her 'yüksek' bug 06-fazlar planındaki bir iş kalemine bağlanmış mı — TEK TEK eşleştir, açıkta kalanları doc='06-fazlar-ve-kabul.md' blockingIssue olarak listele; (3) playerTrace'teki her sürtünme noktasına planda cevap var mı; (4) fazların sırası oyuncu değerine göre doğru mu; (5) kabul kriteri eksik iş kalemi var mı.`,
  },
]

const critiques = await parallel(
  CRITICS.map((c) => () =>
    agent(
      `${COMMON}\n\n${c.brief}\n\nOKUNACAK DOSYALAR (tamamını oku, uzunlar — gerekirse offset ile devam et):\n${ALL_FILES.join('\n')}\n\nStructuredOutput ile bulgularını döndür. blockingIssues = uygulanırsa yanlış iş yaptıracak/amacı bozacak sorunlar; improvements = değerli ama opsiyonel. Her bulguda hedef dokümanın DOSYA ADINI ve bölümünü yaz. Türkçe.`,
      { label: `elestiri:${c.key}`, phase: 'Eleştiri', schema: CRIT_SCHEMA }
    )
  )
)

const critText = CRITICS.map((c, i) => {
  const r = critiques[i]
  if (!r) return `[${c.key}] SONUÇ YOK (ajan hata verdi — bu denetçinin bulgusu yok say)`
  return `[${c.key}] KARAR: ${r.verdict}\nENGELLEYICI SORUNLAR:\n${r.blockingIssues.map((b) => `- (${b.doc}) ${b.issue} → DÜZELTME: ${b.fix}`).join('\n') || '- yok'}\nİYİLEŞTİRMELER:\n${r.improvements.map((m) => `- (${m.doc}) ${m.suggestion}`).join('\n') || '- yok'}`
}).join('\n\n')

phase('Revizyon')

const REV_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'appliedFixes', 'skippedFixes'],
  properties: {
    file: { type: 'string' },
    appliedFixes: { type: 'array', items: { type: 'string' }, description: 'Uygulanan her düzeltmenin 1 cümlelik özeti' },
    skippedFixes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['fix', 'why'], properties: { fix: { type: 'string' }, why: { type: 'string' } } }, description: 'Uygulanmayan öneriler ve gerekçeleri' },
  },
}

const revisions = await parallel(
  DOCS.map((doc) => () =>
    agent(
      `${COMMON}\n\nSEN: "${doc}" dokümanının revizyon editörüsün. GÖREV:\n1. Bash ile hedef klasörü kur ve kaynağı kopyala: mkdir -p "${REPO}" ; cp "${DIR}/${doc}" "${REPO}/${doc}"\n2. "${REPO}/${doc}" dosyasını TAMAMEN oku.\n3. Aşağıdaki 3 denetçi raporundan SENİN dokümanını hedefleyen (doc alanı "${doc}" veya GENEL olan) maddeleri uygula:\n   - blockingIssues: ZORUNLU uygula (Edit tool ile cerrahi değişiklik).\n   - improvements: değer katıyorsa ve 06'daki Ç1-Ç15 kararlarıyla çelişmiyorsa uygula; uygulamadığını gerekçesiyle skippedFixes'e yaz.\n4. KURALLAR: içeriği KISALTMA/özetleme — bu bir revizyon, yeniden yazım değil; dokümanlar arası çapraz referanslar dosya adlarıyla kalsın (hepsi aynı klasöre taşınıyor); scratchpad/C:/Users gibi geçici mutlak yollar varsa repo-göreli hale getir; Türkçe.\n5. StructuredOutput döndür (file = repo yolu).\n\n=== DENETÇİ RAPORLARI ===\n${critText}`,
      { label: `revize:${doc.slice(0, 8)}`, phase: 'Revizyon', schema: REV_SCHEMA }
    )
  )
)

phase('Denetim')

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['pass', 'unmappedBugs', 'issues', 'stats'],
  properties: {
    pass: { type: 'boolean' },
    unmappedBugs: { type: 'array', items: { type: 'string' }, description: 'Plana bağlanmamış kritik/yüksek buglar (analiz referanslı)' },
    issues: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'issue', 'severity'], properties: { file: { type: 'string' }, issue: { type: 'string' }, severity: { type: 'string', enum: ['engelleyici', 'önemli', 'küçük'] } } } },
    stats: { type: 'string', description: 'Dosya sayısı/boyutları, faz sayısı, toplam iş kalemi, kaç bug eşlendi vb.' },
  },
}

const audit = await agent(
  `${COMMON}\n\nSEN: Son bütünlük denetçisisin. GÖREV:\n1. ${REPO}/ altındaki 6 dokümanın hepsini oku (Bash ile önce ls -la ve wc -c çalıştır; kaynak ${DIR}/ altındaki dosyalarla boyut karşılaştır — revizyon sırasında %20'den fazla küçülen dosya = içerik kaybı şüphesi, engelleyici sorun).\n2. ${ANALIZ} dosyasındaki TÜM 'kritik' ve 'yüksek' bugları çıkar; her birinin 06-fazlar-ve-kabul.md içindeki bir iş kalemiyle eşleştiğini doğrula; eşleşmeyenleri unmappedBugs'a yaz.\n3. Çapraz referans kontrolü: dokümanların birbirine verdiği referanslar (dosya adı + bölüm) gerçekten var mı.\n4. Kalıntı kontrol: geçici yol (scratchpad, C:/Users/...) kalmış mı; her fazda ölçülebilir kabul kriteri var mı; 04'te hassasiyet protokolü, 02'de mizah yasakları ve susturma sözleşmesi, 05'te P0/P1/P2 tablosu, 06'da Definition of Done duruyor mu.\n5. StructuredOutput döndür.`,
  { label: 'son-denetim', phase: 'Denetim', schema: AUDIT_SCHEMA }
)

return {
  critiques: Object.fromEntries(CRITICS.map((c, i) => [c.key, critiques[i]])),
  revisions: revisions.filter(Boolean),
  audit,
}