import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { steamManager } from '../core/SteamManager.js';

/**
 * QuestSystem - Osmanlı Tımarlı Sipahi Çok Aşamalı Görev ve Hedef Yöneticisi
 */
export class QuestSystem {
  constructor() {
    this.quests = [
      {
        id: 'quest_inspect',
        title: '1. Tımar Teftişi & Kethüda Görüşmesi',
        shortTitle: 'Tımar Teftişi',
        giver: 'Koca Yakub',
        giverRole: 'Köy Kethüdası',
        desc: 'Akçaoba köy meydanına git ve köy kethüdası Koca Yakub ile görüş. Bu yılın hasılatını, öşür vergisini ve köyün asayiş durumunu müzakere et.',
        targetType: 'npc',
        targetId: 'kethuda',
        targetName: 'Koca Yakub (Kethüda)',
        targetPos: new THREE.Vector3(-4, 0, 8),
        icon: '📜',
        objectives: [
          { text: 'Köy meydanındaki Koca Yakub ile görüş', completed: false },
          { text: 'Öşür vergisini tahsil et veya köylüye ziyafet ver', completed: false }
        ],
        rewards: {
          akce: 250,
          reputation: 10,
          asayis: 10
        },
        status: 'active' // 'available', 'active', 'completed'
      },
      {
        id: 'quest_blacksmith',
        title: '2. Pusat ve Zırh Teftişi',
        shortTitle: 'Demirci Ziyareti',
        giver: 'Demirci Rüstem Usta',
        giverRole: 'Zırh ve Kılıç Ustası',
        desc: 'Köyün güneybatı tarafındaki ocak başında çalışan Demirci Rüstem Usta\'yı ziyaret et. Kılıcını bilet, zırhını kontrol ettir veya yeni bir Cebelü donatımı için sipariş ver.',
        targetType: 'npc',
        targetId: 'demirci',
        targetName: 'Demirci Rüstem Usta',
        targetPos: new THREE.Vector3(-24, 0, 34),
        icon: '⚒️',
        objectives: [
          { text: 'Demirci Rüstem Usta\'nın ocağına git', completed: false },
          { text: 'Kılıcını bilet veya yeni bir Cebelü takımı sipariş et', completed: false }
        ],
        rewards: {
          akce: 150,
          reputation: 10,
          maxHealth: 15
        },
        status: 'available'
      },
      {
        id: 'quest_imam',
        title: '3. Mescid Ziyareti & Hayır Dua',
        shortTitle: 'Mescid ve Kadı Naibi',
        giver: 'Molla Şemseddin',
        giverRole: 'Köy İmamı ve Şer\'i Naib',
        desc: 'Köyün doğusundaki mescid avlusuna git. Molla Şemseddin ile görüşüp yaklaşan gazalar için hayır dua al ve Rumeli\'deki Haçlı fermanı hakkında haberleri öğren.',
        targetType: 'npc',
        targetId: 'imam',
        targetName: 'Molla Şemseddin (İmam)',
        targetPos: new THREE.Vector3(34, 0, 16),
        icon: '🕌',
        objectives: [
          { text: 'Doğudaki mescid avlusuna git', completed: false },
          { text: 'Molla Şemseddin\'den hayır dua al ve ferman haberlerini dinle', completed: false }
        ],
        rewards: {
          reputation: 15,
          morale: 15
        },
        status: 'available'
      },
      {
        id: 'quest_cebelu',
        title: '4. Sadık Cebelü Ali\'nin Talimi',
        shortTitle: 'Cebelü Talimi',
        giver: 'Toy Cebelü Ali',
        giverRole: 'Sipahinin Sadık Çırağı',
        desc: 'Konağın arka bahçesinde kılıç ve kalkan talimi yapan genç Cebelü Ali\'nin yanına git. Muharebe taktiklerini öğret ve onu sefere hazırla.',
        targetType: 'npc',
        targetId: 'cebelu',
        targetName: 'Toy Cebelü Ali',
        targetPos: new THREE.Vector3(-8, 0, -38),
        icon: '🛡️',
        objectives: [
          { text: 'Konağın arkasındaki talim alanına git', completed: false },
          { text: 'Ali ile konuş ve talim gayretini teftiş et', completed: false }
        ],
        rewards: {
          akce: 100,
          cebeluExp: 20
        },
        status: 'available'
      },
      {
        id: 'quest_neighbor',
        title: '5. Sancak İttifakı & Gazi Sungur Bey',
        shortTitle: 'Sipahi İttifakı',
        giver: 'Gazi Sungur Bey',
        giverRole: 'Komşu Çakırlı Tımarı Sahibi',
        desc: 'Kuzey yolunda bekleyen komşu tımarlı sipahi Gazi Sungur Bey ile buluş. Sultan\'ın sefer fermanı geldiğinde cebelülerinizi birleştirme anlaşması yapın.',
        targetType: 'npc',
        targetId: 'neighbor',
        targetName: 'Gazi Sungur Bey',
        targetPos: new THREE.Vector3(18, 0, -10),
        icon: '⚔️',
        objectives: [
          { text: 'Kuzey yolundaki Gazi Sungur Bey ile görüş', completed: false },
          { text: 'Seferde ortak sancak altında vuruşma sözü al', completed: false }
        ],
        rewards: {
          reputation: 20,
          cebeluExp: 15
        },
        status: 'available'
      },
      {
        id: 'quest_bandits',
        title: '6. Köy Asayişi: Orman Harami Baskını',
        shortTitle: 'Haramileri Defet',
        giver: 'Halk & Kethüda',
        giverRole: 'Köy Güvenliği',
        desc: 'Köyün güneybatısındaki karanlık meşelik ve kayalıklarda pusu kuran 3 harami çapulcuyu bul ve kılıçtan geçir. Tımar arazisinin asayişini sağla.',
        targetType: 'enemy_group',
        targetId: 'bandits',
        targetName: 'Harami Çetesi Sığınağı',
        targetPos: new THREE.Vector3(-75, 0, 70),
        icon: '💀',
        objectives: [
          { text: 'Güneybatıdaki orman sınırına intikal et', completed: false },
          { text: 'Ormandaki 3 haramiyi kılıçtan geçir (Kalan: 3)', completed: false }
        ],
        banditCount: 3,
        banditsDefeated: 0,
        rewards: {
          akce: 500,
          asayis: 25,
          reputation: 25
        },
        status: 'available'
      },
      {
        id: 'quest_campaign',
        title: '7. Ferman-ı Hümayun: Büyük Niğbolu Seferi',
        shortTitle: 'Niğbolu Seferi',
        giver: 'Sultan Yıldırım Bayezid',
        giverRole: 'Padişah-ı Âl-i Osman',
        desc: 'Tüm hazırlıklar tamamlandı! Harita menüsünü (M tuşu) aç, Cebelülerinle birlikte Edirne ordugâhına katıl ve Haçlı ordusuna karşı gazaya çık!',
        targetType: 'map',
        targetId: 'campaign_map',
        targetName: 'Sancak Haritası (M Tuşu)',
        targetPos: new THREE.Vector3(0, 0, 0),
        icon: '👑',
        objectives: [
          { text: 'En az 1 hazır Cebelü askeri donat', completed: false },
          { text: 'M tuşuna basıp Sancak Haritasından sefere katıl', completed: false }
        ],
        rewards: {
          akce: 1800,
          reputation: 40,
          title: 'Gazi Sipahibaşı'
        },
        status: 'available'
      }
    ];

    this.activeQuestIndex = 0;
    this.syncWithGameState();
  }

  syncWithGameState() {
    // Dinamik Gereksinim Kontrolleri (Otomatik Asker / Envanter Taraması)
    this.checkDynamicObjectives();

    const activeQ = this.getActiveQuest();
    if (activeQ) {
      gameState.currentQuest = {
        id: activeQ.id,
        title: activeQ.title,
        shortTitle: activeQ.shortTitle,
        desc: activeQ.desc,
        isCompleted: activeQ.status === 'completed'
      };
    }
  }

  /**
   * Dinamik Görev Şartı Kontrolleri (Cebelü sayısı, akçe, zırh vb.)
   */
  checkDynamicObjectives() {
    const hasCebelu = (gameState.military && gameState.military.cebeluCount >= 1);

    // 1. Sefer Görevi (quest_campaign) Cebelü Kontrolü
    const campaignQuest = this.getQuestById('quest_campaign');
    if (campaignQuest && campaignQuest.status === 'active' && hasCebelu) {
      if (!campaignQuest.objectives[0].completed) {
        campaignQuest.objectives[0].completed = true;
        gameState.addNotification('✅ Ordu Şartı Sağlandı: 1 Cebelü sefere hazır!', 'success');
      }
    }

    // 2. Cebelü Talimi & Donatımı Görevi (quest_cebelu) Kontrolü
    const cebeluQuest = this.getQuestById('quest_cebelu');
    if (cebeluQuest && cebeluQuest.status === 'active' && hasCebelu) {
      if (!cebeluQuest.objectives[0].completed || !cebeluQuest.objectives[1].completed) {
        cebeluQuest.objectives[0].completed = true;
        cebeluQuest.objectives[1].completed = true;
        this.completeQuest('quest_cebelu');
      }
    }
  }

  getActiveQuest() {
    return this.quests.find(q => q.status === 'active') || null;
  }

  getAllQuests() {
    return this.quests;
  }

  getQuestById(id) {
    return this.quests.find(q => q.id === id);
  }

  advanceObjective(questId, objectiveIndex = 0) {
    const quest = this.getQuestById(questId);
    if (!quest) return;

    // Eğer görev henüz available ise otomatik aktif et
    if (quest.status === 'available') {
      quest.status = 'active';
    }

    if (quest.objectives && quest.objectives[objectiveIndex]) {
      if (!quest.objectives[objectiveIndex].completed) {
        quest.objectives[objectiveIndex].completed = true;
        soundManager.playVictoryJingle();
        gameState.addNotification(`✅ Hedef Tamamlandı: ${quest.objectives[objectiveIndex].text}`, 'success');
      }
    }

    const allCompleted = quest.objectives.every(o => o.completed);
    if (allCompleted) {
      this.completeQuest(questId);
    } else {
      this.syncWithGameState();
    }
  }

  onEnemyKilled(enemy) {
    const banditQuest = this.getQuestById('quest_bandits');
    if (!banditQuest || banditQuest.status !== 'active') return;

    banditQuest.banditsDefeated = (banditQuest.banditsDefeated || 0) + 1;
    const remaining = Math.max(0, banditQuest.banditCount - banditQuest.banditsDefeated);
    banditQuest.objectives[0].completed = true;
    banditQuest.objectives[1].text = `Ormandaki 3 haramiyi kılıçtan geçir (Kalan: ${remaining})`;

    if (remaining === 0) {
      banditQuest.objectives[1].completed = true;
      this.completeQuest('quest_bandits');
    } else {
      gameState.addNotification(`⚔️ Harami alt edildi! Kalan harami sayısı: ${remaining}`, 'info');
      this.syncWithGameState();
    }
  }

  completeQuest(questId) {
    const quest = this.getQuestById(questId);
    if (!quest || quest.status === 'completed') return;

    quest.status = 'completed';
    quest.objectives.forEach(o => o.completed = true);

    // Ödülleri dağıt
    if (quest.rewards.akce) {
      gameState.timar.akce += quest.rewards.akce;
    }
    if (quest.rewards.reputation) {
      gameState.sipahi.reputation = Math.min(100, gameState.sipahi.reputation + quest.rewards.reputation);
    }
    if (quest.rewards.asayis) {
      gameState.timar.asayis = Math.min(100, gameState.timar.asayis + quest.rewards.asayis);
    }
    if (quest.rewards.morale) {
      gameState.timar.morale = Math.min(100, gameState.timar.morale + quest.rewards.morale);
    }
    if (quest.rewards.cebeluExp) {
      gameState.military.cebeluExperience += quest.rewards.cebeluExp;
    }

    soundManager.playVictoryJingle();
    gameState.addNotification(`🏆 GÖREV TAMAMLANDI: "${quest.title}"! Ödüller hazinene eklendi.`, 'success');

    // Sonraki görevi aktif et
    const nextQuest = this.quests.find(q => q.status === 'available');
    if (nextQuest) {
      nextQuest.status = 'active';
      gameState.addNotification(`📜 Yeni Görev Aktif: "${nextQuest.title}"`, 'alert');
    }

    this.syncWithGameState();
  }

  getActiveTargetInfo(playerPos) {
    const activeQuest = this.getActiveQuest();
    if (!activeQuest) return null;

    let targetPos = activeQuest.targetPos.clone();
    let distance = playerPos ? Math.round(playerPos.distanceTo(targetPos)) : 0;

    return {
      questId: activeQuest.id,
      questTitle: activeQuest.shortTitle || activeQuest.title,
      targetName: activeQuest.targetName,
      targetPos: targetPos,
      distance: distance,
      icon: activeQuest.icon,
      targetType: activeQuest.targetType,
      targetId: activeQuest.targetId
    };
  }
}

export const questSystem = new QuestSystem();
