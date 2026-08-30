/**
 * Mülk-i Osmanî - Performans ve Teşhis Göstergesi (PerformanceOverlay)
 * 
 * V2 Performans Standartları (G0-10 / Bölüm 13):
 * - F3 tuşu ile açılıp kapanır
 * - Anlık FPS, Kare Süresi (Frame-Time), Draw Calls ve Bellek takibi
 */

export class PerformanceOverlay {
  constructor(renderer = null) {
    this.renderer = renderer;
    this.visible = false;
    this.fps = 60;
    this.frameTime = 16.6;
    this.frameHistory = [];
    this.maxHistory = 100;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.container = null;

    this._createDOM();
    this._bindHotkey();
  }

  _createDOM() {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'perf-overlay';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(10, 8, 6, 0.85);
      color: #00ff66;
      font-family: monospace;
      font-size: 11px;
      padding: 6px 10px;
      border: 1px solid rgba(0, 255, 102, 0.3);
      border-radius: 4px;
      z-index: 99999;
      pointer-events: none;
      display: none;
      line-height: 1.4;
      text-shadow: 0 0 2px rgba(0,0,0,0.8);
    `;

    document.body.appendChild(this.container);
  }

  _bindHotkey() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'F3') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.visible = !this.visible;
    if (this.container) {
      this.container.style.display = this.visible ? 'block' : 'none';
    }
  }

  update() {
    if (!this.visible && typeof document !== 'undefined') return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.frameTime = delta;

    this.frameHistory.push(delta);
    if (this.frameHistory.length > this.maxHistory) {
      this.frameHistory.shift();
    }

    this.frameCount++;
    if (this.frameCount % 10 === 0 && this.container && this.visible) {
      this._renderText();
    }
  }

  _renderText() {
    const avgDelta = this.frameHistory.reduce((a, b) => a + b, 0) / (this.frameHistory.length || 1);
    this.fps = Math.round(1000 / (avgDelta || 16.6));

    const sorted = [...this.frameHistory].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)]?.toFixed(1) || '0';
    const p99 = sorted[Math.floor(sorted.length * 0.99)]?.toFixed(1) || '0';

    let rendererStats = '';
    if (this.renderer?.info) {
      const calls = this.renderer.info.render.calls;
      const tris = this.renderer.info.render.triangles;
      rendererStats = `Draw Calls: ${calls} | Triangles: ${(tris / 1000).toFixed(1)}k<br>`;
    }

    let memoryStats = '';
    if (performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
      memoryStats = `JS Heap: ${usedMB} MB<br>`;
    }

    this.container.innerHTML = `
      <strong>[MÜLK-İ OSMANÎ PERF] (F3)</strong><br>
      FPS: <strong>${this.fps}</strong> (avg: ${avgDelta.toFixed(1)} ms)<br>
      p95: ${p95} ms | p99: ${p99} ms<br>
      ${rendererStats}
      ${memoryStats}
    `;
  }
}
