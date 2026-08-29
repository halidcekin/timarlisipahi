import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { ParticleSystem } from './core/ParticleSystem.js';
import { TownGenerator } from './entities/TownGenerator.js';
import { Player } from './entities/Player.js';
import { NPCManager } from './entities/NPCManager.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { UIManager } from './ui/UIManager.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { gameState } from './core/GameState.js';
import { questSystem } from './systems/QuestSystem.js';
import { petitionSystem } from './systems/PetitionSystem.js';
import { soundManager } from './core/AudioManager.js';
import { steamManager } from './core/SteamManager.js';

/**
 * Mülk-i Osmanî: Tımarlı Sipahi 3D - Mount & Blade II: Bannerlord Seviyesinde Açık Dünya Oyun Motoru
 */
export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    // 1. Render Motoru & Atmosfer
    this.engine = new Engine(this.canvas);
    this.input = new InputManager(this.canvas);

    // 2. Bannerlord Parçacık Sistemi (Duman, Kıvılcım, Köz, Toz)
    this.particles = new ParticleSystem(this.engine.scene);

    // 3. Prosedürel Kasaba, Zemin, Hayvanlar & Yataklar
    this.town = new TownGenerator(this.engine.scene);
    this.town.generateTown();

    // 4. Tımarlı Sipahi Oyuncu Kontrolcüsü
    this.player = new Player(this.engine.camera, this.engine.scene, this.town.colliders);
    if (this.town.horseEntity) {
      this.player.setHorse(this.town.horseEntity);
    }

    // 5. 24 Saat Yaşayan Köylüler, Zanaatkarlar ve Muhafızlar
    this.npcManager = new NPCManager(this.engine.scene);
    this.npcManager.initNPCs();

    // 6. Dövüş Sistemi
    this.combat = new CombatSystem(this.player, this.npcManager);

    // 7. Arayüz & Menüler
    this.ui = new UIManager();

    // Hızlı Seyahat Köprüsü
    this.ui.setFastTravelHandler((x, z, locationName) => {
      const h = TownGenerator.getTerrainHeight(x, z);
      this.player.position.set(x, h + 1.8, z);
      this.player.velocity.set(0, 0, 0);
      gameState.addNotification(`📍 Hızlı intikal tamamlandı: ${locationName}`, 'info');
      try { soundManager.playHorseHoof(); } catch (e) {}
    });

    this.lastTime = performance.now();
    this.isRunning = true;

    this.bindInputs();
    this.setupStartButton();
    this.startLoop();

    try {
      steamManager.setRichPresence('Tımar Köyü Teftişinde');
    } catch (e) {}
  }

  setupStartButton() {
    const startBtn = document.getElementById('btn-start-game');
    const startScreen = document.getElementById('start-screen');
    const randomizeBtn = document.getElementById('btn-randomize-world');
    const soundBtn = document.getElementById('btn-toggle-sound');

    if (soundBtn) {
      soundBtn.onclick = (e) => {
        e.preventDefault();
        try {
          const isUnmuted = soundManager.toggleMute();
          soundBtn.textContent = isUnmuted ? '🔊' : '🔇';
        } catch (err) {}
      };
    }

    if (randomizeBtn) {
      randomizeBtn.onclick = (e) => {
        e.preventDefault();
        try {
          gameState.reset();
          questSystem.syncWithGameState();
          if (this.ui) this.ui.updateStartScreenInfo();
        } catch (err) {}
      };
    }

    if (startBtn && startScreen) {
      startBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
        startScreen.style.visibility = 'hidden';
        startScreen.style.pointerEvents = 'none';

        try {
          soundManager.init();
          soundManager.playVictoryJingle();
        } catch (err) {}

        gameState.addNotification('⚔️ Mülk-i Osmanî\'ye Hoş Geldiniz! Tımar toprağınıza ayak bastınız.', 'success');

        if (this.canvas) {
          this.canvas.focus();
          try {
            this.canvas.requestPointerLock();
          } catch (err) {}
        }
      };
    }
  }

  bindInputs() {
    // Sol Tık: Kılıç Savurma & Saldırı
    this.input.onAttack = () => {
      if (this.player.triggerAttack()) {
        this.combat.processPlayerAttack();
      }
    };

    // Sağ Tık: Blok / Savunma
    this.input.onBlock = (isBlocking) => {
      this.player.setBlocking(isBlocking);
    };

    // F Tuşu: Ata Bin / İn
    this.input.onMountHorse = () => {
      this.player.toggleHorseMount();
      if (this.player.isRiding) {
        try { steamManager.unlockAchievement('ACH_HORSE_MASTER'); } catch (e) {}
      }
    };

    // V Tuşu: 1. Şahıs / 3. Şahıs Kamera
    this.input.onToggleCamera = () => {
      this.player.toggleCameraMode();
      gameState.addNotification(
        this.player.cameraMode === 'firstPerson' ? '🎥 1. Şahıs Görüşü' : '🎥 3. Şahıs Görüşü',
        'info'
      );
    };

    // TAB Tuşu: Tımar Defteri
    this.input.onToggleTimar = () => {
      this.ui.toggleTimarModal();
    };

    // J Tuşu: Görev Defteri
    this.input.onToggleQuests = () => {
      this.ui.toggleQuestModal();
    };

    // M Tuşu: Sancak Haritası
    this.input.onToggleMap = () => {
      this.ui.toggleMapModal();
    };

    // E Tuşu: Etkileşim
    this.input.onInteract = () => {
      const nearbyNPC = this.npcManager.getNearbyNPC(this.player.position, 4.2);
      if (nearbyNPC) {
        this.ui.openDialogue(nearbyNPC.dialogueId, nearbyNPC);
        return;
      }

      if (this.town.horseEntity) {
        const dist = this.player.position.distanceTo(this.town.horseEntity.position);
        if (dist < 4.0) {
          this.player.toggleHorseMount();
        }
      }
    };
  }

  startLoop() {
    const loop = () => {
      if (!this.isRunning) return;
      requestAnimationFrame(loop);

      const now = performance.now();
      const delta = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      try {
        // 1. Gün & Zaman Akışı (24 Saatlik Döngü)
        gameState.time.dayTimeHours = (gameState.time.dayTimeHours + delta * 0.1) % 24;

        // 2. Dinamik Gökyüzü, Güneş, Ay Döngüsü & Dinamik Gölge Takibi
        if (this.engine) {
          const playerPos = this.player ? this.player.position : null;
          this.engine.updateDayNight(gameState.time.dayTimeHours, playerPos);
        }

        // 3. Atmosferik Parçacık Motoru (Duman, Kıvılcım, Köz, Toz)
        if (this.particles && this.player) {
          this.particles.update(delta, this.player.position);
        }

        // 4. Çevre & Yeldeğirmeni Animasyonu
        if (this.town) {
          this.town.update(delta);
        }

        // 5. Oyuncu Fiziği ve Hareketi
        if (this.player && this.input) {
          this.player.update(delta, this.input);
        }

        // 6. 24 Saatlik Köylü Yaşam Döngüsü & Yapay Zeka
        if (this.npcManager && this.player) {
          this.npcManager.update(delta, this.player.position, gameState.time.dayTimeHours, this.particles);
        }

        // 7. Dövüş ve Vuruş Sistemi
        if (this.combat) {
          this.combat.update(delta);
        }

        // 8. HUD, Pusula ve Saat Güncellemesi
        if (this.ui && this.player && this.engine && this.npcManager) {
          this.ui.update(this.player.position, this.engine.camera, this.player.yaw, this.npcManager.npcs, this.npcManager.enemies);
        }

        // 9. Etkileşim İpucu Kontrolü
        this.updateInteractionPrompts();

        // 10. Arzuhal ve Dilekçe Sistemi Zamanlayıcısı
        petitionSystem.update(delta);
      } catch (err) {
        console.warn('Oyun mantığı döngü uyarısı:', err);
      }

      // 11. Render
      try {
        if (this.engine) {
          this.engine.render();
        }
      } catch (renderErr) {
        console.error('Render motoru hatası:', renderErr);
      }
    };

    requestAnimationFrame(loop);
  }

  updateInteractionPrompts() {
    const nearbyNPC = this.npcManager.getNearbyNPC(this.player.position, 4.2);
    if (nearbyNPC) {
      let stateDesc = '';
      if (nearbyNPC.ai) {
        switch (nearbyNPC.ai.currentState) {
          case 'SLEEPING': stateDesc = ' (Uyuyor 💤)'; break;
          case 'WORKING': stateDesc = ' (Çalışıyor ⚒️)'; break;
          case 'EATING': stateDesc = ' (Yemek Yiyor 🍲)'; break;
          case 'WANDERING': stateDesc = ' (Dolaşıyor 🚶)'; break;
        }
      }
      this.ui.showInteractionPrompt(`[E] ${nearbyNPC.name}${stateDesc} ile Görüş`);
      return;
    }

    if (this.town.horseEntity) {
      const dist = this.player.position.distanceTo(this.town.horseEntity.position);
      if (dist < 4.0 && !this.player.isRiding) {
        this.ui.showInteractionPrompt('[F] Karayağız Atına Bin');
        return;
      }
    }

    if (this.player.isRiding) {
      this.ui.showInteractionPrompt('[F] Attan İn');
      return;
    }

    this.ui.hideInteractionPrompt();
  }
}

// Oyunu Başlat
function initGame() {
  try {
    window.gameInstance = new Game();
  } catch (err) {
    console.error('Oyun başlatılırken hata oluştu:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
