/**
 * Web Audio API tabanlı dinamik ses motoru.
 * Harici dosya indirme gerektirmeden prosedürel olarak ortam, at, kılıç ve atmosfer sesleri üretir.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientNodes = [];
    this.windNode = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInitialized = true;
      this.startAmbient();
    } catch (e) {
      console.warn('AudioContext başlatılamadı:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      if (this.isMuted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
    return !this.isMuted;
  }

  // Atmosferik rüzgar ve köy ambiyansı
  startAmbient() {
    if (!this.ctx || this.isMuted) return;

    // Rüzgar Simülatörü (Pembe gürültü + Filtre)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 350;
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.12;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start();

    // Rüzgar dalgalanması LFO
    setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const targetFreq = 200 + Math.random() * 400;
      filter.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 3);
    }, 4000);

    // Kuş cıvıltıları periyodik tetikleme
    setInterval(() => {
      if (Math.random() > 0.4 && !this.isMuted) {
        this.playBirdChirp();
      }
    }, 6000);
  }

  // Kuş cıvıltısı
  playBirdChirp() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(2600, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1900, now + 0.15);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Ayak sesi (Çimen / Toprak)
  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // At toynak sesi (Çift vuruş tık-tık)
  playHorseHoof() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // İlk toynak
    this._singleHoof(now, 160);
    // İkinci toynak
    this._singleHoof(now + 0.11, 140);
  }

  _singleHoof(time, freq) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.06);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  // Kılıç savurma (Whoosh)
  playSwordSwing() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Kılıç çarpışması / Metal tınlaması (Clang)
  playSwordClash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const freqs = [880, 1420, 2200, 3100];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.95, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    });
  }

  // Kös Davulu / Savaş borusu (Dönem Fermanı / Savaş Çağrısı)
  playWarDrum() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Derin kös darbesi
    const drum = this.ctx.createOscillator();
    const drumGain = this.ctx.createGain();
    drum.type = 'sine';
    drum.frequency.setValueAtTime(110, now);
    drum.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    drumGain.gain.setValueAtTime(0.4, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    drum.connect(drumGain);
    drumGain.connect(this.ctx.destination);
    drum.start(now);
    drum.stop(now + 0.75);

    // İkinci yankı
    const drum2 = this.ctx.createOscillator();
    const drumGain2 = this.ctx.createGain();
    drum2.type = 'sine';
    drum2.frequency.setValueAtTime(95, now + 0.35);
    drum2.frequency.exponentialRampToValueAtTime(30, now + 0.95);

    drumGain2.gain.setValueAtTime(0.35, now + 0.35);
    drumGain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    drum2.connect(drumGain2);
    drumGain2.connect(this.ctx.destination);
    drum2.start(now + 0.35);
    drum2.stop(now + 1.15);
  }

  // Zafer / Başarı Fanfarı
  playVictoryJingle() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((note, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }
}

export const soundManager = new AudioManager();
