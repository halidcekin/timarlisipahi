/**
 * Mülk-i Osmanî - 1396 Sefer Havadisleri (HistoricalNews)
 * 
 * V2 Standartları & 03-tarih-egitimi.md Sözleşmesi:
 * - minDay ve afterQuest çift anahtarlıdır.
 * - Aynı havadis iki kez gösterilmez.
 */

export const HISTORICAL_NEWS = [
  {
    id: 'h1',
    minDay: 1,
    afterQuest: null,
    channel: 'dede',
    tag: 'A',
    codexUnlocks: ['rovine_1395'],
    text: 'Geçen yıl Eflak elinde, Rovine\'de çok kan döküldü; bizim safta vuruşan Kral Marko ile Konstantin Bey o meydanda kaldı. Sultanımız şimdi İstanbul\'u abluka altında tutar. Fırtına dindi sanma evlat; bulut sadece yer değiştirdi.'
  },
  {
    id: 'h2',
    minDay: 2,
    afterQuest: null,
    channel: 'hanci',
    tag: 'A',
    codexUnlocks: [],
    text: 'Kervandan duydum beyim: Macar kralı Frenk diyarına elçi üstüne elçi salmış. Papazlar kiliselerde \'Türk\'e karşı sefer\' vaaz ediyormuş. Bizim buralara kadar gelirler mi dersin?'
  },
  {
    id: 'h3',
    minDay: 4,
    afterQuest: 'quest_inspect',
    channel: 'hanci',
    tag: 'A',
    codexUnlocks: [],
    text: 'Batıdan gelen tüccar anlattı: Burgonya dükünün oğlu Jean, binlerce şövalyeyle yola çıkmış. Altın işlemeli çadırlar, ipek sancaklar, araba araba şarap... Düğünün kime kurulduğunu Tuna\'da görecekler.'
  },
  {
    id: 'h4',
    minDay: 7,
    afterQuest: null,
    channel: 'imam',
    tag: 'A',
    codexUnlocks: ['hacli_bilesimi'],
    text: 'Molla Şemseddin cemaate anlattı: Haçlı ordusu Buda şehrinde toplanmış. Macar, Fransız, Alman ve Rodos şövalyeleri tek sancak altında birleşmiş. Dualarımız gazilerimizle olsun.'
  },
  {
    id: 'h5',
    minDay: 10,
    afterQuest: 'quest_bandits',
    channel: 'guard',
    tag: 'B',
    codexUnlocks: [],
    text: 'Serhatten gelen ulaklar diyor ki Haçlı kolları Tuna boyunca iniyormuş; Demirkapı geçitlerini geçmişler. Sayıya bakma beyim — sen atının nalına, pusatının keskinliğine bak.'
  },
  {
    id: 'h6',
    minDay: 12,
    afterQuest: null,
    channel: 'messenger',
    tag: 'A',
    codexUnlocks: [],
    text: '📜 ULAK HABERİ: Vidin şehri Haçlı ordusuna kapılarını açtı! Bulgar kralı İvan Stratsimir direnmedi. Ordu Tuna boyunca doğuya, Rahova üzerine yürüyor.'
  },
  {
    id: 'h7',
    minDay: 14,
    afterQuest: null,
    channel: 'kethuda',
    tag: 'A',
    codexUnlocks: [],
    text: 'Beyim, acı haber: Rahova düşmüş. Kaleyi teslim almışlar, sonra ahaliye kılıç üşürmüşler. Kaçabilen canını Tuna\'nın öte yakasına atmış.'
  },
  {
    id: 'h8',
    minDay: 16,
    afterQuest: 'quest_castle',
    channel: 'dizdar',
    tag: 'A',
    codexUnlocks: ['dogan_bey'],
    text: '🏰 Niğbolu Hisarı kuşatıldı! Kale dizdarı Doğan Bey teslim çağrısını reddetmiş, burçlarda direniyormuş. Kale dayanırsa Sultana zaman kazandırır.'
  },
  {
    id: 'h9',
    minDay: 17,
    afterQuest: 'quest_castle',
    channel: 'messenger',
    tag: 'A',
    codexUnlocks: ['yildirim_bayezid'],
    text: '📜 SULTANIN FERMANI: Yıldırım Bayezid Han İstanbul ablukasını kaldırıp bütün ordusuyla Rumeli\'ye geçti! Sancağı altına çağrılan her tımarlı sipahi orduya koşsun!'
  },
  {
    id: 'h10',
    minDay: 18,
    afterQuest: 'quest_campaign',
    channel: 'imam',
    tag: 'B',
    codexUnlocks: [],
    text: 'Sultanımızın ordusu Tırnova dağ geçitlerini yıldırım gibi aştı. Haçlılar Türk ordusunun bu kadar çabuk geleceğini tahmin etmiyordu.'
  },
  {
    id: 'h11',
    minDay: 20,
    afterQuest: 'quest_campaign',
    channel: 'camp',
    tag: 'R',
    codexUnlocks: ['kazik_hatti'],
    text: 'Ordugâhta ateş başında eski bir akıncı anlatıyor: Gece Sultan tek başına sur dibine at sürüp Doğan Bey\'e \'Dayan Doğan!\' diye seslenmiş derler. Sabah kazık hattında gazâ başlayacak.'
  },
  {
    id: 'h12',
    minDay: 22,
    afterQuest: null,
    channel: 'battle',
    tag: 'A',
    codexUnlocks: ['nigbolu'],
    text: '25 Eylül 1396: Niğbolu Meydan Muharebesi başladı! Katmanlı savunma hattı kuruldu, okçular yay çekti, sipahiler hücum emrini bekliyor.'
  },
  {
    id: 'h13',
    minDay: 23,
    afterQuest: 'quest_campaign',
    channel: 'victory',
    tag: 'A',
    codexUnlocks: ['esir_fidyesi'],
    text: 'Zafer haberi tüm İslam âlemine yayıldı! Haçlı ordusu dağıtıldı, Kral Sigismund kaçtı. Sultan Yıldırım Bayezid Han Bursa\'da 20 kubbeli Ulu Cami\'yi inşa ettirmeye niyet eyledi.'
  }
];
