/**
 * Mülk-i Osmanî - Deterministik Rastgelelik Servisi (RandomService)
 * 
 * Üç bağımsız PRNG akışı sunar:
 * 1. simulation: Ekonomi, muharebe, görev sonuçları (Save state'e girer)
 * 2. content: Replik, havadis, diyalog varyasyonları (Save state'e girer)
 * 3. cosmetic: Parçacık, yaprak dökümü, ses pitch varyasyonları (Kayıt dışı kalabilir)
 */

class PRNG {
  constructor(seed = 13960401) {
    this.initialSeed = seed;
    this.state = this._hash(seed);
  }

  _hash(s) {
    let h = 0xdeadbeef;
    if (typeof s === 'string') {
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
      }
    } else {
      h = Math.imul(h ^ (s >>> 0), 2654435761);
    }
    return (h ^ (h >>> 16)) >>> 0;
  }

  // Mulberry32 algoritması
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // [min, max) aralığında float
  range(min, max) {
    return min + this.next() * (max - min);
  }

  // [min, max] aralığında tamsayı (inclusive)
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // Diziden rastgele eleman seç
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.int(0, array.length - 1)];
  }

  // Diziyi karıştır (Fisher-Yates)
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Olasılık zarı (0.0 - 1.0 arası şans)
  chance(probability) {
    return this.next() < probability;
  }

  getState() {
    return {
      initialSeed: this.initialSeed,
      state: this.state
    };
  }

  setState(savedState) {
    if (savedState) {
      this.initialSeed = savedState.initialSeed ?? this.initialSeed;
      this.state = savedState.state ?? this.state;
    }
  }
}

export class RandomService {
  constructor(masterSeed = 'nigbolu_1396') {
    this.masterSeed = masterSeed;
    this.streams = {
      simulation: new PRNG(`${masterSeed}_sim`),
      content: new PRNG(`${masterSeed}_content`),
      cosmetic: new PRNG(`${masterSeed}_cosmetic`)
    };
  }

  get simulation() {
    return this.streams.simulation;
  }

  get content() {
    return this.streams.content;
  }

  get cosmetic() {
    return this.streams.cosmetic;
  }

  setMasterSeed(seed) {
    this.masterSeed = seed;
    this.streams.simulation = new PRNG(`${seed}_sim`);
    this.streams.content = new PRNG(`${seed}_content`);
    this.streams.cosmetic = new PRNG(`${seed}_cosmetic`);
  }

  getState() {
    return {
      masterSeed: this.masterSeed,
      simulation: this.streams.simulation.getState(),
      content: this.streams.content.getState()
    };
  }

  setState(savedState) {
    if (!savedState) return;
    if (savedState.masterSeed) this.masterSeed = savedState.masterSeed;
    if (savedState.simulation) this.streams.simulation.setState(savedState.simulation);
    if (savedState.content) this.streams.content.setState(savedState.content);
  }
}

export const randomService = new RandomService();
