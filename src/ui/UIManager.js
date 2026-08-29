import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { TimarSystem } from '../systems/TimarSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { HistoryEventSystem } from '../systems/HistoryEventSystem.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from '../systems/QuestSystem.js';
import { petitionSystem } from '../systems/PetitionSystem.js';
import { geminiService } from '../services/GeminiService.js';

/**
 * UIManager - Arayüz, HUD, Tımar Defteri, Görev Defteri, 3D İşaretçiler ve Mini-Harita Yönetimi
 */
export class UIManager {
  constructor() {
    this.dom = {
      // HUD Elemanları
      sipahiName: document.getElementById('sipahi-name'),
      timarRegion: document.getElementById('timar-region'),
      healthText: document.getElementById('health-text'),
      healthBar: document.getElementById('health-bar'),
      staminaText: document.getElementById('stamina-text'),
      staminaBar: document.getElementById('stamina-bar'),
      resAkce: document.getElementById('res-akce'),
      resCebelu: document.getElementById('res-cebelu'),
      resCebeluReq: document.getElementById('res-cebelu-req'),
      resAsayis: document.getElementById('res-asayis'),
      resGrain: document.getElementById('res-grain'),
      miladiDate: document.getElementById('miladi-date'),
      seasonName: document.getElementById('season-name'),
      timeClock: document.getElementById('time-clock'),
      hudQuestTitle: document.getElementById('hud-quest-title'),
      hudQuestDesc: document.getElementById('hud-quest-desc'),
      activeQuestPill: document.getElementById('active-quest-pill'),
      interactionPrompt: document.getElementById('interaction-prompt'),
      interactionText: document.getElementById('interaction-text'),
      notificationsContainer: document.getElementById('notifications-container'),
      compassTape: document.getElementById('compass-tape'),
      compassDegree: document.getElementById('compass-degree'),
      compassWaypointMarker: document.getElementById('compass-waypoint-marker'),
      compassWaypointText: document.getElementById('compass-waypoint-text'),

      // 3D Ekran Üstü İşaretçiler ve Mini-Harita
      worldMarkersContainer: document.getElementById('world-markers-container'),
      minimapCanvas: document.getElementById('minimap-canvas'),
      minimapCoords: document.getElementById('minimap-coords'),

      // Diyalog Modal
      dialogueModal: document.getElementById('dialogue-modal'),
      dialogueNpcIcon: document.getElementById('dialogue-npc-icon'),
      dialogueNpcName: document.getElementById('dialogue-npc-name'),
      dialogueNpcRole: document.getElementById('dialogue-npc-role'),
      dialogueText: document.getElementById('dialogue-text'),
      dialogueChoices: document.getElementById('dialogue-choices'),
      dialogueCloseBtn: document.getElementById('dialogue-close-btn'),

      // Tımar Defteri Modal
      timarModal: document.getElementById('timar-modal'),
      timarCloseBtn: document.getElementById('timar-close-btn'),
      tbHaneCount: document.getElementById('tb-hane-count'),
      tbGrainVal: document.getElementById('tb-grain-val'),
      tbSheepVal: document.getElementById('tb-sheep-val'),
      tbMiscVal: document.getElementById('tb-misc-val'),
      tbTotalIncome: document.getElementById('tb-total-income'),
      tbCebeluNeeded: document.getElementById('tb-cebelu-needed'),
      tbCebeluCount: document.getElementById('tb-cebelu-count'),
      tbEquipment: document.getElementById('tb-equipment'),
      tbHorseType: document.getElementById('tb-horse-type'),
      tbStanding: document.getElementById('tb-standing'),
      tbMorale: document.getElementById('tb-morale'),
      tbIrgatCount: document.getElementById('tb-irgat-count'),

      // Arzuhal (Petition) UI
      petitionSection: document.getElementById('petition-section'),
      petitionTitle: document.getElementById('petition-title'),
      petitionDesc: document.getElementById('petition-desc'),
      petitionCostAkce: document.getElementById('petition-cost-akce'),
      petitionCostIrgat: document.getElementById('petition-cost-irgat'),
      petitionTime: document.getElementById('petition-time'),
      btnAcceptPetition: document.getElementById('btn-accept-petition'),
      btnRejectPetition: document.getElementById('btn-reject-petition'),

      // Ret Gerekçesi & Kadı Hükmü Modalleri
      rejectionReasonModal: document.getElementById('rejection-reason-modal'),
      rejectionPetitionName: document.getElementById('rejection-petition-name'),
      rejectionReasonInput: document.getElementById('rejection-reason-input'),
      rejectionLoading: document.getElementById('rejection-loading'),
      btnSubmitRejection: document.getElementById('btn-submit-rejection'),
      btnCancelRejection: document.getElementById('btn-cancel-rejection'),
      rejectionCloseBtn: document.getElementById('rejection-close-btn'),

      kadiVerdictModal: document.getElementById('kadi-verdict-modal'),
      kadiVerdictBadge: document.getElementById('kadi-verdict-badge'),
      kadiVerdictText: document.getElementById('kadi-verdict-text'),
      kadiScoreText: document.getElementById('kadi-score-text'),
      kadiMoraleText: document.getElementById('kadi-morale-text'),
      btnCloseVerdict: document.getElementById('btn-close-verdict'),

      // Görev Defteri Modal (J Tuşu)
      questModal: document.getElementById('quest-modal'),
      questCloseBtn: document.getElementById('quest-close-btn'),
      questItemsList: document.getElementById('quest-items-list'),
      questDetailContent: document.getElementById('quest-detail-content'),

      // Butonlar
      btnCollectTax: document.getElementById('btn-collect-tax'),
      btnPatrolVillage: document.getElementById('btn-patrol-village'),
      btnFeastVillagers: document.getElementById('btn-feast-villagers'),
      btnTrainCebelu: document.getElementById('btn-train-cebelu'),
      btnBlacksmithArmor: document.getElementById('btn-blacksmith-armor'),
      btnHorseBreed: document.getElementById('btn-horse-breed'),

      // Harita Modal & Hızlı Seyahat
      mapModal: document.getElementById('map-modal'),
      mapCloseBtn: document.getElementById('map-close-btn'),
      campaignMapCanvas: document.getElementById('campaign-map-canvas'),
      campaignTitle: document.getElementById('campaign-title'),
      campaignDesc: document.getElementById('campaign-desc'),
      campaignReqCebelu: document.getElementById('campaign-req-cebelu'),
      btnJoinCampaign: document.getElementById('btn-join-campaign'),
      btnTravelVillage: document.getElementById('btn-travel-village'),
      btnTravelCastle: document.getElementById('btn-travel-castle'),
      btnTravelForest: document.getElementById('btn-travel-forest'),

      // Savaş Sonuç Modal
      battleResultModal: document.getElementById('battle-result-modal'),
      battleResultTitle: document.getElementById('battle-result-title'),
      battleResultSubtitle: document.getElementById('battle-result-subtitle'),
      battleResultDesc: document.getElementById('battle-result-desc'),
      battleLootList: document.getElementById('battle-loot-list'),
      btnBattleOk: document.getElementById('btn-battle-ok'),

      // Başlangıç Ekranı
      startScreen: document.getElementById('start-screen'),
      startProceduralInfo: document.getElementById('start-procedural-info'),
      btnRandomizeWorld: document.getElementById('btn-randomize-world'),
      btnStartGame: document.getElementById('btn-start-game'),
      btnToggleSound: document.getElementById('btn-toggle-sound')
    };

    this.selectedQuestId = 'quest_inspect';
    this.markerElementsPool = [];
    this.onFastTravel = null;

    this.bindEvents();
    this.updateStartScreenInfo();
  }

  setFastTravelHandler(handler) {
    this.onFastTravel = handler;
  }

  executeFastTravel(x, z, locationName) {
    this.toggleMapModal(false);
    if (this.onFastTravel) {
      this.onFastTravel(x, z, locationName);
    }
  }

  bindEvents() {
    // Ses Aç / Kapa
    this.dom.btnToggleSound.addEventListener('click', () => {
      const isUnmuted = soundManager.toggleMute();
      this.dom.btnToggleSound.textContent = isUnmuted ? '🔊' : '🔇';
    });

    // Başlangıç Ekranı Olayları
    this.dom.btnRandomizeWorld.addEventListener('click', () => {
      gameState.reset();
      questSystem.syncWithGameState();
      this.updateStartScreenInfo();
    });

    this.dom.btnStartGame.addEventListener('click', () => {
      try {
        soundManager.init();
      } catch (e) {
        console.warn('Audio init error:', e);
      }
      if (this.dom.startScreen) {
        this.dom.startScreen.classList.add('hidden');
        this.dom.startScreen.style.display = 'none';
      }
      gameState.addNotification('Mülk-i Osmanî\'ye Hoş Geldiniz! Tımar toprağınıza ayak bastınız.', 'success');
      try {
        soundManager.playVictoryJingle();
      } catch (e) {}

      // Canvas'a odaklanma
      const canvas = document.getElementById('webgl-canvas');
      if (canvas) {
        try {
          canvas.requestPointerLock();
        } catch (e) {}
      }
    });

    // Modalleri Kapatma Butonları
    this.dom.dialogueCloseBtn.addEventListener('click', () => this.closeDialogue());
    this.dom.timarCloseBtn.addEventListener('click', () => this.toggleTimarModal(false));
    this.dom.mapCloseBtn.addEventListener('click', () => this.toggleMapModal(false));
    this.dom.questCloseBtn.addEventListener('click', () => this.toggleQuestModal(false));
    this.dom.btnBattleOk.addEventListener('click', () => {
      this.dom.battleResultModal.classList.add('hidden');
    });

    // Aktif Görev Paneline Tıklanınca Görev Defterini Aç
    if (this.dom.activeQuestPill) {
      this.dom.activeQuestPill.addEventListener('click', () => {
        this.toggleQuestModal();
      });
    }

    // Tımar Defteri Buton Aksiyonları
    this.dom.btnCollectTax.addEventListener('click', () => {
      TimarSystem.collectAnnualTax();
      this.updateTimarBookUI();
    });

    this.dom.btnPatrolVillage.addEventListener('click', () => {
      TimarSystem.patrolVillage();
      this.updateTimarBookUI();
    });

    this.dom.btnFeastVillagers.addEventListener('click', () => {
      TimarSystem.feastVillagers();
      this.updateTimarBookUI();
    });

    this.dom.btnTrainCebelu.addEventListener('click', () => {
      TimarSystem.trainCebelu();
      this.updateTimarBookUI();
    });

    this.dom.btnBlacksmithArmor.addEventListener('click', () => {
      TimarSystem.upgradeArmorAndSword();
      this.updateTimarBookUI();
    });

    this.dom.btnHorseBreed.addEventListener('click', () => {
      TimarSystem.breedWarHorse();
      this.updateTimarBookUI();
    });

    // Arzuhal Butonları
    if (this.dom.btnAcceptPetition) {
      this.dom.btnAcceptPetition.addEventListener('click', () => {
        if (petitionSystem.acceptPetition()) {
          this.updateTimarBookUI();
        }
      });
    }

    if (this.dom.btnRejectPetition) {
      this.dom.btnRejectPetition.addEventListener('click', () => {
        this.openRejectionModal();
      });
    }

    // Ret Gerekçesi Modal Eventleri
    if (this.dom.btnSubmitRejection) {
      this.dom.btnSubmitRejection.addEventListener('click', () => {
        this.submitRejectionReason();
      });
    }

    if (this.dom.btnCancelRejection) {
      this.dom.btnCancelRejection.addEventListener('click', () => {
        this.dom.rejectionReasonModal.classList.add('hidden');
      });
    }

    if (this.dom.rejectionCloseBtn) {
      this.dom.rejectionCloseBtn.addEventListener('click', () => {
        this.dom.rejectionReasonModal.classList.add('hidden');
      });
    }

    if (this.dom.btnCloseVerdict) {
      this.dom.btnCloseVerdict.addEventListener('click', () => {
        this.dom.kadiVerdictModal.classList.add('hidden');
        this.updateTimarBookUI();
      });
    }

    // Hızlı Seyahat (Fast Travel) Butonları
    if (this.dom.btnTravelVillage) {
      this.dom.btnTravelVillage.addEventListener('click', () => {
        this.executeFastTravel(0, 15, 'Akçaoba Tımar Köyü');
      });
    }

    if (this.dom.btnTravelCastle) {
      this.dom.btnTravelCastle.addEventListener('click', () => {
        this.executeFastTravel(185, 0, 'Sancak Kalesi (Hisar)');
      });
    }

    if (this.dom.btnTravelForest) {
      this.dom.btnTravelForest.addEventListener('click', () => {
        this.executeFastTravel(-70, 60, 'Orman Harami Sığınağı');
      });
    }

    // Harita Canvas Tıklama Etkileşimi
    if (this.dom.campaignMapCanvas) {
      this.dom.campaignMapCanvas.addEventListener('click', (e) => {
        const rect = this.dom.campaignMapCanvas.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * this.dom.campaignMapCanvas.width;
        const clickY = ((e.clientY - rect.top) / rect.height) * this.dom.campaignMapCanvas.height;

        // Noktalara yakınlık kontrolü
        if (Math.hypot(clickX - 480, clickY - 320) < 35) {
          this.executeFastTravel(0, 15, 'Akçaoba Tımar Köyü');
        } else if (Math.hypot(clickX - 580, clickY - 300) < 35) {
          this.executeFastTravel(185, 0, 'Sancak Kalesi (Hisar)');
        } else if (Math.hypot(clickX - 420, clickY - 360) < 35) {
          this.executeFastTravel(-70, 60, 'Orman Harami Sığınağı');
        } else if (Math.hypot(clickX - 260, clickY - 100) < 35) {
          // Niğbolu Seferi
          const result = HistoryEventSystem.joinActiveCampaign();
          if (result) {
            this.toggleMapModal(false);
            this.showBattleResult(result);
            questSystem.advanceObjective('quest_campaign', 1);
          }
        }
      });
    }

    // Sefere Katılma Butonu
    this.dom.btnJoinCampaign.addEventListener('click', () => {
      const result = HistoryEventSystem.joinActiveCampaign();
      if (result) {
        this.toggleMapModal(false);
        this.showBattleResult(result);
        questSystem.advanceObjective('quest_campaign', 1);
      }
    });
  }

  updateStartScreenInfo() {
    this.dom.startProceduralInfo.innerHTML = `
      <div class="item"><strong>Sipahi:</strong> ${gameState.sipahi.name}</div>
      <div class="item"><strong>Tımar:</strong> ${gameState.timar.name}</div>
      <div class="item"><strong>Sancak:</strong> ${gameState.timar.sancak}</div>
      <div class="item"><strong>Arazi Yapısı:</strong> ${gameState.timar.terrain}</div>
      <div class="item"><strong>Hazine:</strong> ${gameState.timar.akce} Akçe</div>
      <div class="item"><strong>Reaya:</strong> ${gameState.timar.haneCount} Hane</div>
    `;
  }

  showInteractionPrompt(text) {
    this.dom.interactionPrompt.classList.remove('hidden');
    this.dom.interactionText.textContent = text;
  }

  hideInteractionPrompt() {
    this.dom.interactionPrompt.classList.add('hidden');
  }

  openDialogue(dialogueId) {
    const data = DialogueSystem.getDialogueData(dialogueId);
    if (!data) return;

    if (data.onOpen) {
      data.onOpen();
    }

    this.dom.dialogueNpcIcon.textContent = data.icon;
    this.dom.dialogueNpcName.textContent = data.npcName;
    this.dom.dialogueNpcRole.textContent = data.npcRole;
    this.dom.dialogueText.textContent = data.text;

    this.renderDialogueChoices(data.choices);
    this.dom.dialogueModal.classList.remove('hidden');
    document.exitPointerLock();
  }

  renderDialogueChoices(choices) {
    this.dom.dialogueChoices.innerHTML = '';
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => {
        if (choice.action) {
          const nextData = choice.action();
          if (nextData) {
            this.dom.dialogueText.textContent = nextData.text;
            this.renderDialogueChoices(nextData.choices);
          } else {
            this.closeDialogue();
          }
        } else {
          this.closeDialogue();
        }
      });
      this.dom.dialogueChoices.appendChild(btn);
    });
  }

  closeDialogue() {
    this.dom.dialogueModal.classList.add('hidden');
  }

  toggleTimarModal(forceState) {
    const isHidden = this.dom.timarModal.classList.contains('hidden');
    const newState = (forceState !== undefined) ? forceState : isHidden;

    if (newState) {
      this.updateTimarBookUI();
      this.dom.timarModal.classList.remove('hidden');
      document.exitPointerLock();
    } else {
      this.dom.timarModal.classList.add('hidden');
    }
  }

  toggleQuestModal(forceState) {
    const isHidden = this.dom.questModal.classList.contains('hidden');
    const newState = (forceState !== undefined) ? forceState : isHidden;

    if (newState) {
      this.renderQuestJournal();
      this.dom.questModal.classList.remove('hidden');
      document.exitPointerLock();
    } else {
      this.dom.questModal.classList.add('hidden');
    }
  }

  renderQuestJournal() {
    const quests = questSystem.getAllQuests();
    const activeQuest = questSystem.getActiveQuest();

    if (!this.selectedQuestId && activeQuest) {
      this.selectedQuestId = activeQuest.id;
    }

    // Sol Panel: Liste
    this.dom.questItemsList.innerHTML = '';
    quests.forEach(q => {
      const card = document.createElement('div');
      card.className = `quest-item-card ${q.status} ${q.id === this.selectedQuestId ? 'selected' : ''}`;
      
      let statusLabel = 'Mevcut';
      if (q.status === 'active') statusLabel = '⚡ Aktif';
      else if (q.status === 'completed') statusLabel = '✅ Tamamlandı';

      card.innerHTML = `
        <div class="quest-card-header">
          <h4>${q.icon} ${q.shortTitle || q.title}</h4>
          <span class="quest-status-badge ${q.status}">${statusLabel}</span>
        </div>
        <span class="quest-card-giver">Vazifedar: ${q.giver} (${q.giverRole})</span>
      `;

      card.addEventListener('click', () => {
        this.selectedQuestId = q.id;
        this.renderQuestJournal();
      });

      this.dom.questItemsList.appendChild(card);
    });

    // Sağ Panel: Detay
    const selected = questSystem.getQuestById(this.selectedQuestId) || activeQuest || quests[0];
    if (selected) {
      const objectivesHtml = selected.objectives.map(o => `
        <div class="objective-item ${o.completed ? 'done' : ''}">
          <span class="objective-check">${o.completed ? '✅' : '⚪'}</span>
          <span>${o.text}</span>
        </div>
      `).join('');

      let rewardsHtml = '';
      if (selected.rewards.akce) rewardsHtml += `<span class="reward-pill">💰 +${selected.rewards.akce} Akçe</span>`;
      if (selected.rewards.reputation) rewardsHtml += `<span class="reward-pill">👑 +${selected.rewards.reputation} İtibar</span>`;
      if (selected.rewards.asayis) rewardsHtml += `<span class="reward-pill">🛡️ +${selected.rewards.asayis} Asayiş</span>`;
      if (selected.rewards.morale) rewardsHtml += `<span class="reward-pill">🌾 +${selected.rewards.morale} Hoşnutluk</span>`;
      if (selected.rewards.cebeluExp) rewardsHtml += `<span class="reward-pill">⚔️ +${selected.rewards.cebeluExp} Cebelü Tecrübesi</span>`;
      if (selected.rewards.title) rewardsHtml += `<span class="reward-pill">⚜️ Terfi: ${selected.rewards.title}</span>`;

      this.dom.questDetailContent.innerHTML = `
        <div class="quest-detail-header">
          <h3>${selected.icon} ${selected.title}</h3>
          <span class="quest-giver-info">Vazife Sahibi: <strong>${selected.giver}</strong> • ${selected.giverRole}</span>
        </div>

        <div class="quest-desc-box">
          <p>"${selected.desc}"</p>
        </div>

        <div class="quest-objectives-box">
          <h4>Vazife Hedefleri</h4>
          ${objectivesHtml}
        </div>

        <div class="quest-rewards-box">
          <h4>Mükafat ve Hasılat</h4>
          <div class="reward-pills">
            ${rewardsHtml || '<span class="reward-pill">Şeref ve Hayır Dua</span>'}
          </div>
        </div>
      `;
    }
  }

  updateTimarBookUI() {
    this.dom.tbHaneCount.textContent = `${gameState.timar.haneCount} Hane (Müslüman & Zimmî)`;
    if (this.dom.tbIrgatCount) this.dom.tbIrgatCount.textContent = `${gameState.timar.irgatCount} Kişi`;
    this.dom.tbGrainVal.textContent = `${Math.floor(gameState.timar.annualIncome * 0.65)} Akçe`;
    this.dom.tbSheepVal.textContent = `${Math.floor(gameState.timar.annualIncome * 0.22)} Akçe`;
    this.dom.tbMiscVal.textContent = `${Math.floor(gameState.timar.annualIncome * 0.13)} Akçe`;
    this.dom.tbTotalIncome.textContent = `${gameState.timar.annualIncome} Akçe`;

    this.dom.tbCebeluNeeded.textContent = `${gameState.military.cebeluRequired} Asker`;
    this.dom.tbCebeluCount.textContent = `${gameState.military.cebeluCount} (${gameState.military.veteranSoldiers.join(', ')})`;
    this.dom.tbEquipment.textContent = `Kılıç Kademe ${gameState.sipahi.swordLevel}, Zırh Kademe ${gameState.sipahi.armorLevel}`;
    this.dom.tbHorseType.textContent = gameState.sipahi.horseType;

    if (this.dom.tbStanding) this.dom.tbStanding.textContent = gameState.sipahi.reputation > 50 ? 'Padişah Nezdinde Makbul' : 'Teftiş Altında';
    this.dom.tbMorale.textContent = `%${gameState.timar.morale} (${gameState.timar.morale > 70 ? 'Yüksek' : 'Vasat'})`;

    // Arzuhal Arayüzü Güncelleme
    if (this.dom.petitionSection) {
      const p = gameState.currentPetition;
      if (p) {
        this.dom.petitionSection.classList.remove('hidden');
        this.dom.petitionTitle.textContent = `📜 ${p.title}`;
        this.dom.petitionDesc.textContent = `"${p.desc}"`;
        this.dom.petitionCostAkce.textContent = `Maliyet: ${p.costAkce} Akçe`;
        this.dom.petitionCostIrgat.textContent = `Gereken Irgat: ${p.costIrgat}`;
        this.dom.petitionTime.textContent = `Süre: ${p.timeDays} Gün`;
      } else {
        this.dom.petitionSection.classList.add('hidden');
      }
    }
  }

  openRejectionModal() {
    const p = gameState.currentPetition;
    if (!p) return;

    if (this.dom.rejectionPetitionName) {
      this.dom.rejectionPetitionName.textContent = `${p.title} (Talep: ${p.desc})`;
    }
    if (this.dom.rejectionReasonInput) {
      this.dom.rejectionReasonInput.value = '';
    }
    if (this.dom.rejectionLoading) {
      this.dom.rejectionLoading.classList.add('hidden');
    }
    this.dom.rejectionReasonModal.classList.remove('hidden');
  }

  async submitRejectionReason() {
    const p = gameState.currentPetition;
    if (!p) {
      this.dom.rejectionReasonModal.classList.add('hidden');
      return;
    }

    const reason = this.dom.rejectionReasonInput ? this.dom.rejectionReasonInput.value : '';

    if (this.dom.rejectionLoading) {
      this.dom.rejectionLoading.classList.remove('hidden');
    }
    if (this.dom.btnSubmitRejection) {
      this.dom.btnSubmitRejection.disabled = true;
    }

    try {
      const result = await geminiService.evaluateRejection(p, reason);

      this.dom.rejectionReasonModal.classList.add('hidden');
      if (this.dom.rejectionLoading) this.dom.rejectionLoading.classList.add('hidden');
      if (this.dom.btnSubmitRejection) this.dom.btnSubmitRejection.disabled = false;

      // Asayiş & Hoşnutluk Güncellemesi
      if (result.moraleChange !== 0) {
        gameState.timar.asayis = Math.max(0, Math.min(100, gameState.timar.asayis + result.moraleChange));
        gameState.timar.morale = Math.max(0, Math.min(100, gameState.timar.morale + result.moraleChange));
      }

      // Arzuhali temizle
      gameState.currentPetition = null;
      gameState.hasPendingMessenger = false;

      this.showKadiVerdict(result);
    } catch (err) {
      console.error('Ret gerekçesi değerlendirilirken hata:', err);
      this.dom.rejectionReasonModal.classList.add('hidden');
      if (this.dom.rejectionLoading) this.dom.rejectionLoading.classList.add('hidden');
      if (this.dom.btnSubmitRejection) this.dom.btnSubmitRejection.disabled = false;
      gameState.currentPetition = null;
      this.updateTimarBookUI();
    }
  }

  showKadiVerdict(result) {
    if (!this.dom.kadiVerdictModal) return;

    if (this.dom.kadiVerdictBadge) {
      if (result.valid) {
        this.dom.kadiVerdictBadge.textContent = '✅ FERMAN HAKLI BULUNDU';
        this.dom.kadiVerdictBadge.style.color = '#1e6b2c';
      } else {
        this.dom.kadiVerdictBadge.textContent = '⚠️ FERMAN HAKSIZ / KEYFİ GÖRÜLDÜ';
        this.dom.kadiVerdictBadge.style.color = '#8b1e1e';
      }
    }

    if (this.dom.kadiVerdictText) {
      this.dom.kadiVerdictText.textContent = `"${result.verdict}"`;
    }

    if (this.dom.kadiScoreText) {
      this.dom.kadiScoreText.textContent = `${result.score} / 100 (${result.isAi ? 'Gemini AI Kadısı' : 'Kadı Naibi'})`;
    }

    if (this.dom.kadiMoraleText) {
      if (result.moraleChange >= 0) {
        this.dom.kadiMoraleText.textContent = '0 Asayiş Kaybı (Ahali İkna Oldu)';
        this.dom.kadiMoraleText.style.color = '#1e6b2c';
        try { soundManager.playVictoryJingle(); } catch (e) {}
      } else {
        this.dom.kadiMoraleText.textContent = `${result.moraleChange} Asayiş Kaybı (Ahali Gücendi)`;
        this.dom.kadiMoraleText.style.color = '#8b1e1e';
        try { soundManager.playNotification(); } catch (e) {}
      }
    }

    this.dom.kadiVerdictModal.classList.remove('hidden');
  }

  toggleMapModal(forceState) {
    const isHidden = this.dom.mapModal.classList.contains('hidden');
    const newState = (forceState !== undefined) ? forceState : isHidden;

    if (newState) {
      this.renderCampaignMap();
      this.dom.campaignTitle.textContent = gameState.activeCampaign.title;
      this.dom.campaignDesc.textContent = `"${gameState.activeCampaign.desc}"`;
      this.dom.campaignReqCebelu.textContent = `En az ${gameState.activeCampaign.reqCebelu} Cebelü (Mevcut: ${gameState.military.cebeluCount})`;

      this.dom.mapModal.classList.remove('hidden');
      document.exitPointerLock();
    } else {
      this.dom.mapModal.classList.add('hidden');
    }
  }

  renderCampaignMap() {
    const canvas = this.dom.campaignMapCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Zengin Parşömen Deniz & Kara Zemin
    ctx.fillStyle = '#18140f';
    ctx.fillRect(0, 0, w, h);

    // Denizler (Marmara, Karadeniz, Ege, Çanakkale Boğazı)
    ctx.fillStyle = '#122332';

    // Karadeniz (Kuzeydoğu)
    ctx.beginPath();
    ctx.ellipse(550, 90, 240, 75, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Marmara Denizi (Merkez)
    ctx.beginPath();
    ctx.ellipse(390, 270, 95, 45, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Ege Denizi & Adalar (Güneybatı)
    ctx.beginPath();
    ctx.ellipse(190, 380, 100, 120, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Boğazlar (İstanbul & Çanakkale Su Kanalları)
    ctx.strokeStyle = '#122332';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(460, 245); ctx.lineTo(480, 190); // İstanbul Boğazı
    ctx.moveTo(310, 305); ctx.lineTo(280, 345); // Çanakkale Boğazı
    ctx.stroke();

    // 2. Tuna Nehri (Mavi Su Şeridi)
    ctx.strokeStyle = '#2b6cb0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(60, 110);
    ctx.bezierCurveTo(180, 130, 300, 80, 480, 105);
    ctx.stroke();

    // 3. Bölge İsimleri & Hat Sanatı
    ctx.font = 'italic 12px Cinzel, Georgia, serif';
    ctx.fillStyle = 'rgba(230, 198, 110, 0.35)';
    ctx.fillText('R U M E L İ   B E Y L E R B E Y L İ Ğ İ', 130, 180);
    ctx.fillText('A N A D O L U   E Y A L E T İ', 540, 380);
    ctx.fillText('T U N A   B E H R İ ( D A N U B I U S )', 120, 85);
    ctx.fillText('B A H R - İ   S İ Y A H ( K A R A D E N İ Z )', 520, 50);

    // 4. Etkileşimli Şehirler, Tımar Köyü ve Sancak Kalesi
    const points = [
      { id: 'village', name: '🏡 Akçaoba Tımar Köyü (Konağın)', x: 480, y: 320, type: 'village', desc: 'Tımar Merkezi & Reaya' },
      { id: 'castle', name: '🏰 Sancak Kalesi (Hisar & Cebehane)', x: 580, y: 300, type: 'castle', desc: 'Hisar Muhafızı Dizdar Hamza Bey' },
      { id: 'forest', name: '🌲 Orman Harami Sığınağı', x: 420, y: 360, type: 'forest', desc: 'Harami Çetesi Yuvası' },
      { id: 'capital_edirne', name: '👑 Edirne (Payitaht-ı Âl-i Osman)', x: 340, y: 210, type: 'capital', desc: 'Sultan Yıldırım Bayezid Ordugâhı' },
      { id: 'capital_bursa', name: '🕌 Bursa (Hüdavendigâr)', x: 530, y: 400, type: 'capital', desc: 'Ulu Cami & İpek Pazarı' },
      { id: 'nigbolu', name: '⚔️ Niğbolu Kalesi (Haçlı Kuşatması)', x: 260, y: 100, type: 'battlefield', desc: 'Kral Sigismund ve Haçlı Ordusu' },
      { id: 'gelibolu', name: '⚓ Gelibolu Tersanesi', x: 310, y: 320, type: 'port', desc: 'Osmanlı Donanma Üssü' }
    ];

    // İntikal Yolları (Kesikli Altın Çizgiler)
    ctx.strokeStyle = 'rgba(230, 198, 110, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(480, 320); // Köy
    ctx.lineTo(580, 300); // Kale
    ctx.lineTo(480, 320);
    ctx.lineTo(340, 210); // Edirne
    ctx.lineTo(260, 100); // Niğbolu
    ctx.stroke();
    ctx.setLineDash([]);

    // Noktaları Çiz
    points.forEach(pt => {
      ctx.beginPath();

      if (pt.type === 'village') {
        ctx.fillStyle = '#22c55e';
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (pt.type === 'castle') {
        ctx.fillStyle = '#f59e0b';
        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (pt.type === 'battlefield') {
        ctx.fillStyle = '#ef4444';
        ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (pt.type === 'capital') {
        ctx.fillStyle = '#a855f7';
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e6c66e';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#64748b';
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Etiket
      ctx.font = 'bold 12px Cinzel, Georgia, serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(pt.name, pt.x + 14, pt.y + 4);
      ctx.shadowBlur = 0;
    });
  }

  showBattleResult(result) {
    this.dom.battleResultTitle.textContent = result.title;
    this.dom.battleResultSubtitle.textContent = result.subtitle;
    this.dom.battleResultDesc.textContent = `"${result.desc}"`;

    this.dom.battleLootList.innerHTML = result.loot
      .map(item => `<div class="data-row highlight"><span>${item}</span></div>`)
      .join('');

    this.dom.battleResultModal.classList.remove('hidden');
  }

  updateCompass(yaw) {
    if (!this.dom.compassTape || !this.dom.compassDegree) return;

    // Radyan -> Derece (0 - 360)
    let deg = Math.round((yaw * 180) / Math.PI) % 360;
    if (deg < 0) deg += 360;

    // Şerit Kaydırma Hesaplaması (900px genişliğinde şerit)
    const offsetPercent = (deg / 360) * 100;
    this.dom.compassTape.style.transform = `translateX(calc(-${offsetPercent}% + 160px))`;

    // Yön İsmi Tespiti
    let dirName = 'Kuzey (Konak)';
    if (deg >= 23 && deg < 68) dirName = 'Kuzeydoğu';
    else if (deg >= 68 && deg < 113) dirName = 'Doğu (Sancak Kalesi 🏰 & Mescid 🕌)';
    else if (deg >= 113 && deg < 158) dirName = 'Güneydoğu';
    else if (deg >= 158 && deg < 203) dirName = 'Güney (Demirci ⚔️)';
    else if (deg >= 203 && deg < 248) dirName = 'Güneybatı (Orman 🌲)';
    else if (deg >= 248 && deg < 293) dirName = 'Batı (Değirmen 🌾)';
    else if (deg >= 293 && deg < 338) dirName = 'Kuzeybatı';

    this.dom.compassDegree.textContent = `${deg}° (${dirName})`;
  }

  updateCompassWaypoint(playerPos, playerYaw) {
    if (!this.dom.compassWaypointMarker) return;

    const targetInfo = questSystem.getActiveTargetInfo(playerPos);
    if (!targetInfo) {
      this.dom.compassWaypointMarker.classList.add('hidden');
      return;
    }

    const dx = targetInfo.targetPos.x - playerPos.x;
    const dz = targetInfo.targetPos.z - playerPos.z;
    const angleToTarget = Math.atan2(dx, dz); // Radyan
    let angleDiff = angleToTarget - playerYaw;

    // Normalize -PI to PI
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Pusula merkezinde ofset piksel (320px genişlik, 90 derece görünüm)
    const pxOffset = (angleDiff / (Math.PI / 2)) * 140;

    if (Math.abs(pxOffset) < 145) {
      this.dom.compassWaypointMarker.classList.remove('hidden');
      this.dom.compassWaypointMarker.style.left = `calc(50% + ${pxOffset}px)`;
      this.dom.compassWaypointText.textContent = `${targetInfo.questTitle} (${targetInfo.distance}m)`;
    } else {
      // Kenara iğnele
      this.dom.compassWaypointMarker.classList.remove('hidden');
      const side = pxOffset > 0 ? 135 : -135;
      const arrow = pxOffset > 0 ? '▶' : '◀';
      this.dom.compassWaypointMarker.style.left = `calc(50% + ${side}px)`;
      this.dom.compassWaypointText.textContent = `${arrow} ${targetInfo.distance}m`;
    }
  }

  updateMinimap(playerPos, playerYaw, npcs = [], enemies = []) {
    if (!this.dom.minimapCanvas) return;

    const canvas = this.dom.minimapCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radarRange = 180; // 180m genişletilmiş radar menzili (Kale dahil)
    const scale = (w / 2) / radarRange;

    // Koordinatları yaz
    if (this.dom.minimapCoords) {
      this.dom.minimapCoords.textContent = `${Math.round(playerPos.x)}, ${Math.round(playerPos.z)}`;
    }

    // Temizle
    ctx.clearRect(0, 0, w, h);

    // Arka plan radar çemberleri
    ctx.fillStyle = 'rgba(15, 12, 10, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(230, 198, 110, 0.2)';
    ctx.lineWidth = 1;
    for (let r = 25; r < cx; r += 25) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Çapraz çizgiler
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.stroke();

    // Önemli Köy ve Kale Yapıları
    const landmarks = [
      { name: 'Konak', x: 0, z: -40, color: '#e6c66e' },
      { name: 'Mescid', x: 40, z: 15, color: '#38bdf8' },
      { name: 'Demirci', x: -25, z: 35, color: '#f97316' },
      { name: 'Değirmen', x: -55, z: -25, color: '#a3e635' },
      { name: 'Sancak Kalesi', x: 185, z: 0, color: '#f59e0b', isCastle: true }
    ];

    landmarks.forEach(lm => {
      const dx = lm.x - playerPos.x;
      const dz = lm.z - playerPos.z;
      const px = cx + dx * scale;
      const py = cy + dz * scale;

      if (Math.hypot(px - cx, py - cy) < cx - 4) {
        if (lm.isCastle) {
          // Kale İkonu (Görkemli Altın Hisar)
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px - 6, py - 6, 12, 12);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px - 6, py - 6, 12, 12);
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#fde68a';
          ctx.fillText('🏰 KALE', px - 14, py - 8);
        } else {
          ctx.fillStyle = lm.color;
          ctx.fillRect(px - 3, py - 3, 6, 6);
        }
      }
    });

    // Dost NPC'ler (Mavi/Cyan Noktalar)
    npcs.forEach(npc => {
      const dx = npc.position.x - playerPos.x;
      const dz = npc.position.z - playerPos.z;
      const px = cx + dx * scale;
      const py = cy + dz * scale;

      if (Math.hypot(px - cx, py - cy) < cx - 4) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Düşmanlar (Kırmızı Noktalar)
    enemies.forEach(enemy => {
      if (enemy.isDead) return;
      const dx = enemy.position.x - playerPos.x;
      const dz = enemy.position.z - playerPos.z;
      const px = cx + dx * scale;
      const py = cy + dz * scale;

      if (Math.hypot(px - cx, py - cy) < cx - 4) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Aktif Görev Hedefi (Yanıp Sönen Altın Yıldız)
    const targetInfo = questSystem.getActiveTargetInfo(playerPos);
    if (targetInfo) {
      const dx = targetInfo.targetPos.x - playerPos.x;
      const dz = targetInfo.targetPos.z - playerPos.z;
      let px = cx + dx * scale;
      let py = cy + dz * scale;

      // Çember dışındaysa kenara iğnele
      const distFromCenter = Math.hypot(px - cx, py - cy);
      if (distFromCenter > cx - 8) {
        const angle = Math.atan2(py - cy, px - cx);
        px = cx + Math.cos(angle) * (cx - 8);
        py = cy + Math.sin(angle) * (cx - 8);
      }

      // Yanıp sönen altın yıldız
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.008);
      ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + 0.6 * pulse})`;
      ctx.beginPath();
      ctx.arc(px, py, 6 + 2 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Oyuncu Pozisyonu & Yön Oku (Merkezde)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerYaw);

    // Yön Oku
    ctx.fillStyle = '#e6c66e';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();

    // Merkez çember
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  updateWorldMarkers(camera, playerPos, npcs = [], enemies = []) {
    const container = this.dom.worldMarkersContainer;
    if (!container) return;

    container.innerHTML = '';
    const activeTarget = questSystem.getActiveTargetInfo(playerPos);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const renderMarker = (worldPos, config) => {
      const dist = Math.round(playerPos.distanceTo(worldPos));
      if (dist > 110) return; // 110 metreden uzaktakileri gizle

      // 3D Dünya Koordinatını Ekrana İzdüşür
      const pos = worldPos.clone();
      pos.y += (config.heightOffset || 2.2); // Baş hizasının üstü

      pos.project(camera);

      // Kameranın arkasındaysa gösterme
      if (pos.z > 1.0) return;

      const sx = (pos.x * 0.5 + 0.5) * screenWidth;
      const sy = (-(pos.y * 0.5) + 0.5) * screenHeight;

      // Ekran sınırları kontrolü
      if (sx < 20 || sx > screenWidth - 20 || sy < 20 || sy > screenHeight - 20) return;

      const markerEl = document.createElement('div');
      markerEl.className = `world-marker ${config.type || ''}`;
      markerEl.style.left = `${sx}px`;
      markerEl.style.top = `${sy}px`;

      let hpBarHtml = '';
      if (config.showHp) {
        const hpPercent = Math.max(0, (config.hp / config.maxHp) * 100);
        hpBarHtml = `
          <div class="marker-hp-bar">
            <div class="marker-hp-fill" style="width: ${hpPercent}%;"></div>
          </div>
        `;
      }

      markerEl.innerHTML = `
        <div class="marker-badge">
          <span>${config.icon || '📍'}</span>
          <span>${config.title}</span>
          <span class="marker-dist">${dist}m</span>
        </div>
        ${hpBarHtml}
        <div class="marker-pointer"></div>
      `;

      container.appendChild(markerEl);
    };

    // 1. Dost NPC'ler
    npcs.forEach(npc => {
      const isQuestTarget = (activeTarget && activeTarget.targetId === npc.id);
      renderMarker(npc.position, {
        title: isQuestTarget ? `[GÖREV] ${npc.name}` : npc.name,
        icon: isQuestTarget ? '📜' : '👳‍♂️',
        type: isQuestTarget ? 'active-quest' : 'npc',
        heightOffset: 2.3
      });
    });

    // 2. Düşmanlar (Haramiler)
    enemies.forEach(enemy => {
      if (enemy.isDead) return;
      renderMarker(enemy.position, {
        title: enemy.name,
        icon: '💀',
        type: 'enemy',
        showHp: true,
        hp: enemy.health,
        maxHp: enemy.maxHealth,
        heightOffset: 2.1
      });
    });
  }

  update(playerPos = null, camera = null, playerYaw = 0, npcs = [], enemies = []) {
    this.updateHUD(playerYaw, camera, playerPos, npcs, enemies);
  }

  updateHUD(playerYaw = 0, camera = null, playerPos = null, npcs = [], enemies = []) {
    // 1. Pusula ve Pusula Hedef İğnesi
    this.updateCompass(playerYaw);
    if (playerPos) {
      this.updateCompassWaypoint(playerPos, playerYaw);
    }

    // 2. Taktik Mini-Harita (Radar)
    if (playerPos) {
      this.updateMinimap(playerPos, playerYaw, npcs, enemies);
    }

    // 3. 3D Dünya İşaretçileri (Waypoints)
    if (camera && playerPos) {
      this.updateWorldMarkers(camera, playerPos, npcs, enemies);
    }

    // 4. Can & Stamina
    const hpPercent = Math.max(0, (gameState.sipahi.health / gameState.sipahi.maxHealth) * 100);
    this.dom.healthBar.style.width = `${hpPercent}%`;
    this.dom.healthText.textContent = `${Math.ceil(gameState.sipahi.health)} / ${gameState.sipahi.maxHealth}`;

    const staPercent = Math.max(0, (gameState.sipahi.stamina / gameState.sipahi.maxStamina) * 100);
    this.dom.staminaBar.style.width = `${staPercent}%`;
    this.dom.staminaText.textContent = `${Math.ceil(gameState.sipahi.stamina)} / ${gameState.sipahi.maxStamina}`;

    // 5. Kaynaklar
    this.dom.resAkce.textContent = gameState.timar.akce.toLocaleString();
    this.dom.resCebelu.textContent = gameState.military.cebeluCount;
    this.dom.resCebeluReq.textContent = gameState.military.cebeluRequired;
    this.dom.resAsayis.textContent = `%${gameState.timar.asayis}`;
    this.dom.resGrain.textContent = gameState.timar.grain;

    // 6. Profil & Zaman
    this.dom.sipahiName.textContent = gameState.sipahi.name;
    this.dom.timarRegion.textContent = `${gameState.timar.name} Sahibi • ${gameState.timar.sancak}`;
    this.dom.miladiDate.textContent = `H. ${gameState.time.hijriYear} / M. ${gameState.time.year}`;
    this.dom.seasonName.textContent = gameState.time.season;

    const hour = Math.floor(gameState.time.dayTimeHours);
    const mins = Math.floor((gameState.time.dayTimeHours % 1) * 60);
    const pad = (n) => n < 10 ? '0' + n : n;
    this.dom.timeClock.textContent = `☀️ ${pad(hour)}:${pad(mins)}`;

    // 7. Aktif Görev
    const activeQuest = questSystem.getActiveQuest();
    if (activeQuest) {
      this.dom.hudQuestTitle.textContent = activeQuest.shortTitle || activeQuest.title;
      const nextObj = activeQuest.objectives.find(o => !o.completed) || activeQuest.objectives[0];
      this.dom.hudQuestDesc.textContent = nextObj ? nextObj.text : activeQuest.desc;
    } else {
      this.dom.hudQuestTitle.textContent = 'Vazifeler Tamamlandı';
      this.dom.hudQuestDesc.textContent = 'Sultanın yeni fermanı bekleniyor.';
    }

    // 8. Bildirimler
    this.renderNotifications();
  }

  renderNotifications() {
    this.dom.notificationsContainer.innerHTML = '';
    const now = Date.now();
    gameState.notifications.forEach(n => {
      if (now - n.time < 5000) {
        const item = document.createElement('div');
        item.className = `notification-item ${n.type}`;
        item.textContent = n.text;
        this.dom.notificationsContainer.appendChild(item);
      }
    });
  }
}
