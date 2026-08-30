/**
 * Mülk-i Osmanî - Tarih ve Takvim Servisi (CalendarService)
 * 
 * 1396 Niğbolu Seferi takvim çıpası:
 * Gün 1 = 1 Nisan 1396 (Hicri: 21 Receb 798)
 * Gün 178 = 25 Eylül 1396 (Hicri: 22 Zilhicce 798) - Niğbolu Meydan Muharebesi
 * 
 * Ritim pencereleri: dawn, midday, afternoon, sunset, night
 * Not: Bu ritimler oyun içi toplumsal atmosfer içindir; fetva veya ibadet vakti kaynağı değildir.
 */

export class CalendarService {
  constructor(clock) {
    this.clock = clock;
    this.anchorMiladi = { year: 1396, month: 4, day: 1 }; // 1 Nisan 1396
    this.anchorHicri = { year: 798, month: 7, day: 21 };   // 21 Receb 798
  }

  // Aktif ordinal gün (1..178)
  get currentDay() {
    return this.clock ? this.clock.dayCount : 1;
  }

  // Miladi Tarih Bilgisi
  getMiladiDate(dayCount = this.currentDay) {
    // 1 Nisan 1396'dan itibaren gün ekleme
    const daysInMonths1396 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNamesTr = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    let currentMonth = 4; // Nisan (1-indexed)
    let currentDayInMonth = dayCount;

    while (currentDayInMonth > daysInMonths1396[currentMonth - 1]) {
      currentDayInMonth -= daysInMonths1396[currentMonth - 1];
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
      }
    }

    return {
      day: currentDayInMonth,
      month: currentMonth,
      monthName: monthNamesTr[currentMonth - 1],
      year: 1396,
      formatted: `${currentDayInMonth} ${monthNamesTr[currentMonth - 1]} 1396`
    };
  }

  // Hicri Tarih Bilgisi (798)
  getHicriDate(dayCount = this.currentDay) {
    const hicriMonths = [
      'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
      'Cemaziyelevvel', 'Cemaziyelahir', 'Receb', 'Şaban',
      'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
    ];

    // 21 Receb 798 başlangıç (7. ay)
    let hMonth = 7;
    let hDay = 21 + (dayCount - 1);
    let hYear = 798;

    while (hDay > 30) {
      hDay -= 30; // Ay/kameri ortalama 30 gün
      hMonth++;
      if (hMonth > 12) {
        hMonth = 1;
        hYear++;
      }
    }

    return {
      day: hDay,
      month: hMonth,
      monthName: hicriMonths[hMonth - 1],
      year: hYear,
      formatted: `${hDay} ${hicriMonths[hMonth - 1]} ${hYear}`
    };
  }

  // Mevsim (İlkbahar: gün 1-60, Yaz: gün 61-150, Sonbahar: gün 151+)
  getSeason(dayCount = this.currentDay) {
    if (dayCount <= 60) {
      return { id: 'spring', nameTr: 'İlkbahar', icon: '🌱' };
    } else if (dayCount <= 150) {
      return { id: 'summer', nameTr: 'Yaz', icon: '☀️' };
    } else {
      return { id: 'autumn', nameTr: 'Sonbahar', icon: '🍂' };
    }
  }

  // Gündelik Toplumsal Ritim Penceresi
  getRhythmWindow(hours = this.clock?.dayTimeHours ?? 6) {
    if (hours >= 4.5 && hours < 7.0) {
      return {
        id: 'dawn',
        nameTr: 'Sabah Vakti (Fecr / Şafak)',
        npcBehavior: 'mescide_yöneliş_ve_sofra',
        isDaylight: true
      };
    } else if (hours >= 7.0 && hours < 13.0) {
      return {
        id: 'midday',
        nameTr: 'Kuşluk & Öğle',
        npcBehavior: 'tarla_ve_çarşı_işleri',
        isDaylight: true
      };
    } else if (hours >= 13.0 && hours < 18.0) {
      return {
        id: 'afternoon',
        nameTr: 'İkindi & İntikal',
        npcBehavior: 'talim_ve_hasat',
        isDaylight: true
      };
    } else if (hours >= 18.0 && hours < 20.5) {
      return {
        id: 'sunset',
        nameTr: 'Akşam (Gurub)',
        npcBehavior: 'akşam_sofrası_ve_divan',
        isDaylight: false
      };
    } else {
      return {
        id: 'night',
        nameTr: 'Yatsı & Gece İstirahati',
        npcBehavior: 'han_ve_istihrac',
        isDaylight: false
      };
    }
  }

  // Tam UI Tarih/Saat Formatı
  getFormattedHeader() {
    const miladi = this.getMiladiDate();
    const hicri = this.getHicriDate();
    const hours = Math.floor(this.clock?.dayTimeHours ?? 6);
    const minutes = Math.floor(((this.clock?.dayTimeHours ?? 6) % 1) * 60);
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return {
      miladi: miladi.formatted,
      hicri: hicri.formatted,
      time: timeStr,
      dayCount: this.currentDay,
      rhythm: this.getRhythmWindow()
    };
  }
}
