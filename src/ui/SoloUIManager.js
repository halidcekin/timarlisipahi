import * as THREE from 'three';
import { soloGameState } from '../core/SoloGameState.js';

/**
 * Solo Leveling Kullanıcı Arayüzü ve Sistem Mağazası Yöneticisi (SoloUIManager)
 */
export class SoloUIManager {
  constructor() {
    this.cacheElements();
    this.bindGameStateEvents();
    this.bindStoreEvents();
    this.updateHUD();
  }

  cacheElements() {
    this.rankBadge = document.getElementById('rank-badge');
    this.levelText = document.getElementById('player-level');
    this.goldText = document.getElementById('player-gold');
    this.shadowCountText = document.getElementById('shadow-count');
    this.daggerNameText = document.getElementById('dagger-name');
    this.daggerDmgText = document.getElementById('dagger-dmg');

    this.hpBar = document.getElementById('hp-fill');
    this.hpText = document.getElementById('hp-text');
    this.mpBar = document.getElementById('mp-fill');
    this.mpText = document.getElementById('mp-text');

    this.hpPotCount = document.getElementById('hp-pot-count');
    this.mpPotCount = document.getElementById('mp-pot-count');

    this.bossCard = document.getElementById('boss-card');
    this.bossName = document.getElementById('boss-name');
    this.bossHpFill = document.getElementById('boss-hp-fill');
    this.bossHpText = document.getElementById('boss-hp-text');

    this.dashCdOverlay = document.getElementById('dash-cd-overlay');
    this.dashCdText = document.getElementById('dash-cd-text');
    this.shadowCommandBadge = document.getElementById('shadow-command-badge');

    this.systemNotification = document.getElementById('system-modal');
    this.notifTitle = document.getElementById('system-title');
    this.notifDesc = document.getElementById('system-desc');
    this.floatingContainer = document.getElementById('floating-combat-container');

    this.promptText = document.getElementById('interaction-prompt-text');
    this.promptBox = document.getElementById('interaction-prompt-box');

    // Mağaza Elemanları
    this.storeModal = document.getElementById('store-modal');
    this.storeGoldVal = document.getElementById('store-gold-val');
    this.closeStoreBtn = document.getElementById('close-store-btn');
    this.storeBtn = document.getElementById('slot-store-btn');
  }

  bindGameStateEvents() {
    soloGameState.on('update', () => this.updateHUD());

    soloGameState.on('levelUp', (data) => {
      this.showSystemPopup(
        'SEVİYE ATLADINIZ! (LEVEL UP)',
        `Tebrikler! Seviye ${data.level} oldunuz. Tüm can ve mananız yenilendi!`
      );
    });

    soloGameState.on('rankUp', (data) => {
      this.showSystemPopup(
        '⚡ RANK YÜKSELDİ! (RANK UP)',
        `Gücünüz taştı! Artık [${data.newRank} RANK] bir avcısınız! Yeni portalların kilidi açıldı!`
      );
    });

    soloGameState.on('shadowReplaced', (data) => {
      this.showSystemPopup(
        '👑 GÜÇLÜ BOSS ORDUYA KATILDI!',
        `Ordu sınırına ulaşıldı. ${data.newName}, en zayıf asker olan ${data.oldName}'in yerini aldı!`
      );
    });

    soloGameState.on('shadowCaged', (bossName) => {
      this.showSystemPopup(
        '🔒 GÖLGE KAFESİ AKTİF',
        `Ordu dolu ve tüm askerleriniz güçlü! ${bossName} zindandaki Gölge Kafesinde bekletiliyor.`
      );
    });

    soloGameState.on('shadowCannotRespawn', (soldierName) => {
      this.showMiniToast(`⚠️ Yetersiz Mana! ${soldierName} dirilemedi. Köye dönünce tüm ordu canlanacak!`);
    });

    soloGameState.on('hubRested', () => {
      this.showSystemPopup(
        '🏡 KÖYDE DİNLENİLDİ',
        'Canınız ve mananız %100 doldu! Ölmüş tüm gölge askerleriniz yeniden ayağa kalktı!'
      );
    });

    soloGameState.on('daggerEquipped', (dagger) => {
      this.showSystemPopup(
        '🗡️ YENİ HANÇER KUŞANILDI',
        `${dagger.name} kuşanıldı! Temel hasarınız: +${dagger.damage}`
      );
    });

    soloGameState.on('dungeonCleared', (data) => {
      this.showSystemPopup(
        '🏆 ZİNDAN TEMİZLENDİ (DUNGEON CLEARED)',
        `Tüm düşmanlar ve Zindan Boss'u alt edildi! +${data.xp} XP ve ${data.dagger.name} kazanıldı!`
      );
    });

    soloGameState.on('shadowRespawned', (soldier) => {
      this.showMiniToast(`💜 ${soldier.name} mananızla dirildi! (-20 MP)`);
    });
  }

  bindStoreEvents() {
    if (this.closeStoreBtn) {
      this.closeStoreBtn.addEventListener('click', () => this.toggleStore(false));
    }
    if (this.storeBtn) {
      this.storeBtn.addEventListener('click', () => this.toggleStore(true));
    }

    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemKey = e.target.getAttribute('data-item');
        const res = soloGameState.buyStoreItem(itemKey);
        if (res.success) {
          this.showMiniToast(`🛒 Satın alma başarılı: ${itemKey.replace('_', ' ').toUpperCase()}!`);
        } else {
          this.showMiniToast(`❌ ${res.reason}`);
        }
      });
    });

    const hpSlot = document.getElementById('slot-hp-pot');
    if (hpSlot) {
      hpSlot.addEventListener('click', () => {
        if (soloGameState.useHpPotion()) {
          this.showMiniToast('🧪 Can İksiri İçildi! (+%60 HP)');
        } else {
          this.showMiniToast('❌ Can iksiriniz yok veya canınız dolu!');
        }
      });
    }

    const mpSlot = document.getElementById('slot-mp-pot');
    if (mpSlot) {
      mpSlot.addEventListener('click', () => {
        if (soloGameState.useMpPotion()) {
          this.showMiniToast('⚡ Mana İksiri İçildi! (+%70 MP)');
        } else {
          this.showMiniToast('❌ Mana iksiriniz yok veya mananız dolu!');
        }
      });
    }
  }

  toggleStore(forceOpen = null) {
    if (!this.storeModal) return;
    const shouldOpen = (forceOpen !== null) ? forceOpen : this.storeModal.classList.contains('hidden');

    if (shouldOpen) {
      this.storeModal.classList.remove('hidden');
      if (document.exitPointerLock) document.exitPointerLock();
    } else {
      this.storeModal.classList.add('hidden');
    }
  }

  updateHUD() {
    const s = soloGameState;

    if (this.rankBadge) {
      this.rankBadge.innerText = `${s.rank} RANK`;
      this.rankBadge.className = `rank-badge rank-${s.rank.toLowerCase()}`;
    }
    if (this.levelText) {
      this.levelText.innerText = `Seviye ${s.level}`;
    }
    if (this.goldText) {
      this.goldText.innerText = `${s.gold}`;
    }
    if (this.storeGoldVal) {
      this.storeGoldVal.innerText = `${s.gold}`;
    }
    if (this.shadowCountText) {
      const maxCap = s.getMaxShadowCapacity();
      this.shadowCountText.innerText = `${s.shadowSoldiersCount} / ${maxCap}`;
    }
    if (this.daggerNameText && s.currentDagger) {
      this.daggerNameText.innerText = s.currentDagger.name;
    }
    if (this.daggerDmgText) {
      this.daggerDmgText.innerText = `Hasar: ${s.getTotalAttack()}`;
    }

    if (this.hpPotCount) {
      this.hpPotCount.innerText = `x${s.inventory.hpPotions}`;
    }
    if (this.mpPotCount) {
      this.mpPotCount.innerText = `x${s.inventory.mpPotions}`;
    }

    if (this.hpBar && this.hpText) {
      const hpPct = Math.max(0, Math.min(100, (s.health / s.maxHealth) * 100));
      this.hpBar.style.width = `${hpPct}%`;
      this.hpText.innerText = `${Math.ceil(s.health)} / ${s.maxHealth}`;
    }
    if (this.mpBar && this.mpText) {
      const mpPct = Math.max(0, Math.min(100, (s.mana / s.maxMana) * 100));
      this.mpBar.style.width = `${mpPct}%`;
      this.mpText.innerText = `${Math.ceil(s.mana)} / ${s.maxMana}`;
    }

    if (this.shadowCommandBadge) {
      if (s.shadowCommand === 'attack') {
        this.shadowCommandBadge.innerText = '⚔️ HÜCUMDA';
        this.shadowCommandBadge.style.color = '#ef4444';
        this.shadowCommandBadge.style.borderColor = '#ef4444';
      } else {
        this.shadowCommandBadge.innerText = '🛡️ ARKADA';
        this.shadowCommandBadge.style.color = '#38bdf8';
        this.shadowCommandBadge.style.borderColor = '#38bdf8';
      }
    }
  }

  updateCombatHUD(player, boss, floatingTexts, camera) {
    if (this.dashCdOverlay && this.dashCdText) {
      if (player.dashCooldown > 0) {
        const pct = (player.dashCooldown / player.dashMaxCooldown) * 100;
        this.dashCdOverlay.style.height = `${pct}%`;
        this.dashCdText.innerText = player.dashCooldown.toFixed(1) + 's';
        this.dashCdText.style.display = 'block';
      } else {
        this.dashCdOverlay.style.height = '0%';
        this.dashCdText.style.display = 'none';
      }
    }

    if (this.bossCard) {
      if (boss && boss.alive) {
        this.bossCard.classList.remove('hidden');
        if (this.bossName) this.bossName.innerText = boss.name;

        const bossPct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
        if (this.bossHpFill) this.bossHpFill.style.width = `${bossPct}%`;
        if (this.bossHpText) this.bossHpText.innerText = `${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`;
      } else {
        this.bossCard.classList.add('hidden');
      }
    }

    this.renderFloatingCombatText(floatingTexts, camera);
  }

  renderFloatingCombatText(floatingTexts, camera) {
    if (!this.floatingContainer) return;
    this.floatingContainer.innerHTML = '';

    if (!floatingTexts || floatingTexts.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    floatingTexts.forEach((ft) => {
      const screenPos = ft.worldPos.clone().project(camera);

      if (screenPos.z < 1) {
        const x = (screenPos.x * 0.5 + 0.5) * width;
        const y = -(screenPos.y * 0.5 - 0.5) * height;

        const div = document.createElement('div');
        div.className = 'floating-dmg';
        div.innerText = ft.text;
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.color = ft.color;
        div.style.opacity = ft.opacity;
        this.floatingContainer.appendChild(div);
      }
    });
  }

  showInteractionPrompt(text) {
    if (this.promptBox && this.promptText) {
      this.promptText.innerText = text;
      this.promptBox.classList.remove('hidden');
    }
  }

  hideInteractionPrompt() {
    if (this.promptBox) {
      this.promptBox.classList.add('hidden');
    }
  }

  showSystemPopup(title, desc) {
    if (this.systemNotification && this.notifTitle && this.notifDesc) {
      this.notifTitle.innerText = title;
      this.notifDesc.innerText = desc;
      this.systemNotification.classList.remove('hidden');

      if (this.popupTimeout) clearTimeout(this.popupTimeout);
      this.popupTimeout = setTimeout(() => {
        this.systemNotification.classList.add('hidden');
      }, 4200);
    }
  }

  showMiniToast(text) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'mini-toast';
    toast.innerText = text;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }
}
