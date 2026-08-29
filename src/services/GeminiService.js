/**
 * GeminiService - Arzuhal Ret Gerekçelerini Kadı ve Ahali Heyeti Rolüyle Değerlendiren Yapay Zeka Servisi
 */
export class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }

  /**
   * Sipahi'nin ret fermanını Gemini API veya yerleşik Kadı Naibi algoritması ile değerlendirir
   */
  async evaluateRejection(petition, reason) {
    if (!reason || reason.trim().length < 5) {
      return {
        valid: false,
        score: 15,
        verdict: 'Kadı Hükmü: Sipahi Beyi gerekçe dahi beyan etmeden ferman buyurmuştur. Ahali bu keyfi muameleden ötürü teessür içindedir.',
        moraleChange: -12,
        isAi: false
      };
    }

    // 1. Eğer API Anahtarı varsa Gemini 2.5 Flash / Flash Lite modeline gönder
    if (this.apiKey && this.apiKey.trim().length > 10) {
      try {
        const aiResult = await this.callGeminiAPI(petition, reason);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('Gemini API çağrısı başarısız oldu, yerleşik Kadı Naibi devreye giriyor:', err);
      }
    }

    // 2. Offline / API Anahtarsız Yerleşik Kadı Naibi Değerlendirme Algoritması (Heuristic Fallback)
    return this.evaluateHeuristic(petition, reason);
  }

  async callGeminiAPI(petition, reason) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    const prompt = `
Rolün: 14. Yüzyıl Osmanlı Devleti Kadısı ve Ahali Heyeti Temsilcisi.
Bağlam: Tımarlı Sipahi Köyü. Ahalinin Arzuhali (Dilekçesi):
- Başlık: "${petition.title}"
- Talep: "${petition.desc}"
- Gereken Akçe: ${petition.costAkce} Akçe, Gereken Irgat: ${petition.costIrgat} Kişi.

Tımarlı Sipahi Beyi'nin Ret Gerekçesi / Fermanı:
"${reason}"

GÖREV:
Sipahi Beyi'nin ret gerekçesini Osmanlı hukuku, gaza hazırlıkları, hazine darlığı veya kamu yararı açısından değerlendir.
Eğer gerekçe makul, adil, mantıklı ve ikna ediciyse (örneğin sefer hazırlığı, akçelerin güvenliğe ayrılması, kış şartları, ordu levazımı vb.) ahalinin gönlü razı olsun (Asayiş düşmesin).
Eğer gerekçe saçma, bencil veya alaycıysa ahali gücensin.

Yalnızca aşağıdaki JSON formatında yanıt ver (Markdown bloğu olmadan, saf JSON):
{
  "valid": true,
  "score": 85,
  "verdict": "Kadı Efendi ve İhtiyar Heyeti hükmü: Beyimizin gazaya hazırlık ve cebelü donatma gerekçesi yerindedir...",
  "moraleChange": 0
}
(valid true ise moraleChange 0 veya +5 olmalı, valid false ise score < 50 ve moraleChange -8 ile -15 arası olmalı).
`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Boş API yanıtı');

    const parsed = JSON.parse(rawText);
    return {
      valid: !!parsed.valid,
      score: Number(parsed.score) || (parsed.valid ? 80 : 30),
      verdict: parsed.verdict || 'Kadı hükmü beyan edilmiştir.',
      moraleChange: Number(parsed.moraleChange) || (parsed.valid ? 0 : -10),
      isAi: true
    };
  }

  /**
   * Yerleşik Anlamsal Kadı Naibi Analiz Motoru
   */
  evaluateHeuristic(petition, reason) {
    const clean = reason.toLowerCase();
    
    // Geçerli kabul edilen devlet, ordu, hazine ve kamu kelimeleri
    const validKeywords = [
      'sefer', 'gaza', 'ordu', 'harp', 'savaş', 'cebelü', 'asker', 'muhafız',
      'akçe', 'hazine', 'darlık', 'kıtlık', 'kuraklık', 'kış', 'bahar', 'sonra',
      'sabır', 'devlet', 'asayiş', 'harami', 'eşkiya', 'güvenlik', 'inşallah',
      'öncelik', 'tahsis', 'vakit', 'mühlet', 'kaza', 'kader', 'padişah', 'sancak'
    ];

    // Saçma / olumsuz kelimeler
    const trollKeywords = [
      'banane', 'sanane', 'canım', 'keyfim', 'yok sana', 'boşver', 'yalan', 'saçma', 'defol', 'para mara yok'
    ];

    let matchCount = 0;
    validKeywords.forEach(k => {
      if (clean.includes(k)) matchCount++;
    });

    let trollMatch = false;
    trollKeywords.forEach(k => {
      if (clean.includes(k)) trollMatch = true;
    });

    if (trollMatch || clean.length < 12) {
      return {
        valid: false,
        score: 25,
        verdict: 'Kadı Naibi Hükmü: Sipahi Beyi ahalinin feryadına layık olmayan bir cevap vermiştir. Ahali meclisten boynu bükük ayrıldı.',
        moraleChange: -10,
        isAi: false
      };
    }

    if (matchCount >= 2 || (clean.length > 30 && matchCount >= 1)) {
      return {
        valid: true,
        score: Math.min(95, 65 + matchCount * 10),
        verdict: 'Kadı Naibi Hükmü: Sipahi Beyimizin fermanı haklı ve hikmetli bulunmuştur. Sefer ve asayiş önceliği sebebiyle ahali sabır göstermeye ikna olmuştur.',
        moraleChange: 0,
        isAi: false
      };
    }

    if (matchCount === 1) {
      return {
        valid: true,
        score: 60,
        verdict: 'Kadı Naibi Hükmü: Beyimizin mazereti kafi görülmüştür. Asayiş bozulmamıştır lakin ahali bir dahaki sefere müjdeli ferman bekler.',
        moraleChange: 0,
        isAi: false
      };
    }

    return {
      valid: false,
      score: 40,
      verdict: 'Kadı Naibi Hükmü: Beyimizin gerekçesi ahalinin derdine derman olmaya yetmemiştir. Köyde hafif bir hoşnutsuzluk baş gösterdi.',
      moraleChange: -6,
      isAi: false
    };
  }
}

export const geminiService = new GeminiService();
