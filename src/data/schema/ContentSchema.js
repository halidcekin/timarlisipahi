/**
 * Mülk-i Osmanî - İçerik, İddia, Kaynak ve Onay Veri Şemaları (ContentSchema)
 * V2 Devir Sözleşmesi Bölüm 9 Standartları
 */

export const HistoricalStatusEnum = ['A', 'B', 'C', 'R', 'not_applicable'];
export const ReligiousScopeEnum = ['sunni_shared', 'hanafi', 'maturidi', 'intra_sunni_disputed', 'ottoman_custom', 'not_applicable'];
export const StatementModeEnum = ['system_fact', 'character_view', 'dramatization', 'tradition_report'];
export const ReviewRoleEnum = ['history', 'fiqh', 'aqidah', 'hadith', 'editorial', 'legal', 'audio'];
export const ToneEnum = ['LIGHT', 'NEUTRAL', 'TENSE', 'SOLEMN'];
export const LifecycleEnum = ['draft', 'in_review', 'approved', 'published'];

export class ContentSchema {
  /**
   * ContentRecord Doğrulaması
   */
  static validateContentRecord(record) {
    const errors = [];
    if (!record.id || typeof record.id !== 'string') errors.push('Eksik/Geçersiz ID');
    if (!record.textTr && !record.body) errors.push('textTr veya body zorunludur');
    if (record.tone && !ToneEnum.includes(record.tone)) errors.push(`Geçersiz tone: ${record.tone}`);
    if (record.lifecycle && !LifecycleEnum.includes(record.lifecycle)) errors.push(`Geçersiz lifecycle: ${record.lifecycle}`);

    // Kural: SOLEMN sahnelerde mizah yasaktır
    if (record.tone === 'SOLEMN' && record.humor === true) {
      errors.push('Kural İhlali: SOLEMN (ağırbaşlı/kutsal) sahnelerde humor:true olamaz.');
    }

    // Kural: speechAct 'blessing' ise humor:false olmak zorundadır
    if (record.speechAct === 'blessing' && record.humor === true) {
      errors.push('Kural İhlali: Dua ve bereket (blessing) ifadeleri mizah öğesi yapılamaz (humor:false olmalıdır).');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * ClaimRecord Doğrulaması
   */
  static validateClaimRecord(claim) {
    const errors = [];
    if (!claim.id || typeof claim.id !== 'string') errors.push('Eksik/Geçersiz Claim ID');
    if (!claim.statement || typeof claim.statement !== 'string') errors.push('Eksik ifade (statement)');
    if (claim.historicalStatus && !HistoricalStatusEnum.includes(claim.historicalStatus)) {
      errors.push(`Geçersiz historicalStatus: ${claim.historicalStatus}`);
    }
    if (claim.religiousScope && !ReligiousScopeEnum.includes(claim.religiousScope)) {
      errors.push(`Geçersiz religiousScope: ${claim.religiousScope}`);
    }
    if (claim.statementMode && !StatementModeEnum.includes(claim.statementMode)) {
      errors.push(`Geçersiz statementMode: ${claim.statementMode}`);
    }

    // Kural: C ve R içerikler system_fact olamaz
    if ((claim.historicalStatus === 'C' || claim.historicalStatus === 'R') && claim.statementMode === 'system_fact') {
      errors.push('Kural İhlali: Rivayet veya dramatik unsurlar (C / R) sistem gerçeği (system_fact) olarak sunulamaz.');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * SourceRecord Doğrulaması
   */
  static validateSourceRecord(source) {
    const errors = [];
    if (!source.id || typeof source.id !== 'string') errors.push('Eksik/Geçersiz Source ID');
    if (!source.title || typeof source.title !== 'string') errors.push('Eksik kaynak başlığı (title)');
    if (!source.locator) errors.push('Eksik kaynak locator (sayfa/hadis no/paragraf)');
    return { valid: errors.length === 0, errors };
  }
}
