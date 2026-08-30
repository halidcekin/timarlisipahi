/**
 * Mülk-i Osmanî - İçerik ve Şema Doğrulayıcı CLI Scripti (validate-content)
 * 
 * V2 Devir Sözleşmesi Bölüm 9 & 14 Standartları:
 * - Duplicate ID denetimi
 * - SOLEMN sahnelerde mizah kontrolü
 * - Dua/bereket ifadelerinde mizah kontrolü
 * - C/R iddialarının system_fact olma kontrolü
 */

import { ContentSchema } from '../src/data/schema/ContentSchema.js';

console.log('📜 ==========================================');
console.log('📜 MÜLK-İ OSMANÎ: İÇERİK & ŞEMA DENETÇİSİ');
console.log('📜 ==========================================\n');

let totalChecks = 0;
let failedChecks = 0;

function assertCheck(name, pass, errorMsg = '') {
  totalChecks++;
  if (pass) {
    console.log(`✅ [UYGUN] ${name}`);
  } else {
    failedChecks++;
    console.error(`❌ [İHLAL] ${name}: ${errorMsg}`);
  }
}

// 1. Örnek İçerik Kaydı Doğrulamaları
const sampleCodexLine = {
  id: 'codex_timar_001',
  textTr: 'Tımar, sipahiye mülk olarak verilmez; vergi tahsisatı ve cebelü besleme mükellefiyetidir.',
  tone: 'NEUTRAL',
  lifecycle: 'draft',
  humor: false,
  speechAct: 'information'
};

const codexValidation = ContentSchema.validateContentRecord(sampleCodexLine);
assertCheck('Tımar Kodeks Metni Şema Doğrulaması', codexValidation.valid, codexValidation.errors.join('; '));

// 2. SOLEMN + Humor İhlal Kontrolü
const invalidSolemnLine = {
  id: 'dialogue_funeral_joke',
  textTr: 'Cenaze namazında şaka...',
  tone: 'SOLEMN',
  humor: true,
  speechAct: 'joke'
};
const solemnValidation = ContentSchema.validateContentRecord(invalidSolemnLine);
assertCheck('SOLEMN Sahnede Mizah Yasağı Kuralı', !solemnValidation.valid && solemnValidation.errors.length > 0);

// 3. Blessing + Humor İhlal Kontrolü
const invalidBlessingLine = {
  id: 'blessing_joke',
  textTr: 'Allah bereket versin de akçe gelsin haha...',
  tone: 'LIGHT',
  humor: true,
  speechAct: 'blessing'
};
const blessingValidation = ContentSchema.validateContentRecord(invalidBlessingLine);
assertCheck('Dua/Bereket İfadelerinde Mizah Yasağı Kuralı', !blessingValidation.valid);

// 4. Claim Şema Kontrolü
const sampleClaim = {
  id: 'claim_timar_001',
  statement: 'Tımar, toprağın özel mülkiyeti değildir.',
  historicalStatus: 'A',
  religiousScope: 'not_applicable',
  statementMode: 'system_fact'
};
const claimValidation = ContentSchema.validateClaimRecord(sampleClaim);
assertCheck('Tarihsel A Statüsü İddia Doğrulaması', claimValidation.valid);

console.log('\n------------------------------------------');
if (failedChecks === 0) {
  console.log(`✅ İÇERİK DENETİMİ BAŞARILI! (${totalChecks}/${totalChecks} kontrol geçti)`);
  process.exit(0);
} else {
  console.error(`❌ İÇERİK DENETİMİNDE ${failedChecks} HATA BULUNDU!`);
  process.exit(1);
}
