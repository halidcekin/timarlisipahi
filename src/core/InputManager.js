/**
 * InputManager - Tımarlı Sipahi 3D Klavye, Fare ve Pointer Lock Kontrolleri
 * WASD (Hareket), Space (Zıpla/Dörtnal), Shift (Koş), Sol Tık (Kılıç Saldırısı),
 * Sağ Tık (Blok), E (Etkileşim/Konuş), F (Ata Bin/İn), TAB (Tımar Defteri),
 * J (Görev Defteri), M (Sancak Haritası), V (Kamera Değiştir)
 */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = {
      movementX: 0,
      movementY: 0,
      isLocked: false,
      leftDown: false,
      rightDown: false
    };

    this.onAttack = null;        // Sol Tık (Kılıç)
    this.onBlock = null;         // Sağ Tık (Kalkan / Kılıç Savunması)
    this.onInteract = null;      // E Tuşu
    this.onMountHorse = null;    // F Tuşu
    this.onToggleCamera = null;  // V Tuşu
    this.onToggleTimar = null;   // TAB Tuşu
    this.onToggleQuests = null;  // J Tuşu
    this.onToggleMap = null;     // M Tuşu
    this.onToggleEvening = null; // K Tuşu (Akşam Hesabı)
    this.onToggleCodex = null;   // N Tuşu (Menâkıbnâme / Kâtibin Defteri)

    this.onToggleWeapon = null;  // Q Tuşu (Kılıcı Kına Koy / Kuşan)
    this.onToggleBow = null;     // R Tuşu (Okçuluk / Yay Çek)

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyE') {
        if (this.onInteract) this.onInteract();
      } else if (e.code === 'KeyQ') {
        if (this.onToggleWeapon) this.onToggleWeapon();
      } else if (e.code === 'KeyR') {
        if (this.onToggleBow) this.onToggleBow();
      } else if (e.code === 'KeyF') {
        if (this.onMountHorse) this.onMountHorse();
      } else if (e.code === 'KeyV') {
        if (this.onToggleCamera) this.onToggleCamera();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        if (this.onToggleTimar) this.onToggleTimar();
      } else if (e.code === 'KeyJ') {
        if (this.onToggleQuests) this.onToggleQuests();
      } else if (e.code === 'KeyM') {
        if (this.onToggleMap) this.onToggleMap();
      } else if (e.code === 'KeyK') {
        if (this.onToggleEvening) this.onToggleEvening();
      } else if (e.code === 'KeyN') {
        if (this.onToggleCodex) this.onToggleCodex();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('click', () => {
      if (document.getElementById('fail-state-overlay')) return;
      if (!this.mouse.isLocked) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.mouse.isLocked = (document.pointerLockElement === this.canvas);
    });

    document.addEventListener('mousemove', (e) => {
      if (this.mouse.isLocked) {
        this.mouse.movementX = e.movementX || 0;
        this.mouse.movementY = e.movementY || 0;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.mouse.isLocked) return;
      if (e.button === 0) {
        this.mouse.leftDown = true;
        if (this.onAttack) this.onAttack();
      } else if (e.button === 2) {
        e.preventDefault();
        this.mouse.rightDown = true;
        if (this.onBlock) this.onBlock(true);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.leftDown = false;
      } else if (e.button === 2) {
        this.mouse.rightDown = false;
        if (this.onBlock) this.onBlock(false);
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (this.mouse.isLocked) e.preventDefault();
    });
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  getMouseDelta() {
    const delta = {
      x: this.mouse.movementX,
      y: this.mouse.movementY
    };
    this.mouse.movementX = 0;
    this.mouse.movementY = 0;
    return delta;
  }
}
