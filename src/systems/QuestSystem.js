import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { steamManager } from '../core/SteamManager.js';

/**
 * QuestSystem - Mülk-i Osmanî: Tımarlı Sipahi 3D Çok Aşamalı Epik Hikaye & Görev Sistemi
 * 1396 Niğbolu Seferi, Bizans Casusluk Vakaları, Köy İhtilafları, Harami Avı ve Sancakbeyi Fermanları
 */
export class QuestSystem {
  constructor() {
    this.quests = [
      // =======================================================================
      // BÖLÜM 1: TIMAR TEFTİŞİ & KÖY DİRLİĞİ
      // =======================================================================
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
        targetPos: new THREE.Vector3(0, 0, 8),
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
        status: 'active'
      },

      // =======================================================================
      // BÖLÜM 2: PUSAT, ÖRS & ŞAM ÇELİĞİ
      // =======================================================================
      {
        id: 'quest_blacksmith',
        title: '2. Pusat ve Zırh Teftişi',
        shortTitle: 'Demirci Ziyareti',
        giver: 'Demirci Rüstem Usta',
        giverRole: 'Zırh ve Kılıç Ustası',
        desc: 'Köyün batı tarafındaki ocak başında çalışan Demirci Rüstem Usta\'yı ziyaret et. Kılıcını bilet, zırhını kontrol ettir veya yeni bir Cebelü donatımı için sipariş ver.',
        targetType: 'npc',
        targetId: 'demirci',
        targetName: 'Demirci Rüstem Usta',
        targetPos: new THREE.Vector3(-58, 0, 6.8),
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

      // =======================================================================
      // BÖLÜM 3: ŞER'İ HÜKÜM & CUMA DUASI
      // =======================================================================
      {
        id: 'quest_imam',
        title: '3. Mescid Ziyareti & Hayır Dua',
        shortTitle: 'Mescid ve Kadı Naibi',
        giver: 'Molla Şemseddin',
        giverRole: 'Köy İmamı ve Şer\'i Naib',
        desc: 'Mavi kubbeli Ulu Mescid avlusuna git. Molla Şemseddin ile görüşüp yaklaşan gazalar için hayır dua al ve Rumeli\'deki Haçlı fermanı hakkında haberleri öğren.',
        targetType: 'npc',
        targetId: 'imam',
        targetName: 'Molla Şemseddin (İmam)',
        targetPos: new THREE.Vector3(10, 0, 2),
        icon: '🕌',
        objectives: [
          { text: 'Mavi kubbeli Ulu Mescid avlusuna git', completed: false },
          { text: 'Molla Şemseddin\'den hayır dua al ve ferman haberlerini dinle', completed: false }
        ],
        rewards: {
          reputation: 15,
          morale: 15
        },
        status: 'available'
      },

      // =======================================================================
      // BÖLÜM 4: CEBELÜ TALİMİ
      // =======================================================================
      {
        id: 'quest_cebelu',
        title: '4. Sadık Cebelü Ali\'nin Talimi',
        shortTitle: 'Cebelü Talimi',
        giver: 'Toy Cebelü Ali',
        giverRole: 'Sipahinin Sadık Çırağı',
        desc: 'Konağın yanındaki talimgâhta kılıç ve kalkan talimi yapan genç Cebelü Ali\'nin yanına git. Muharebe taktiklerini öğret ve onu sefere hazırla.',
        targetType: 'npc',
        targetId: 'cebelu',
        targetName: 'Toy Cebelü Ali',
        targetPos: new THREE.Vector3(14, 0, -26),
        icon: '🛡️',
        objectives: [
          { text: 'Talimgâhtaki Ali\'nin yanına git', completed: false },
          { text: 'Ali ile konuş ve talim gayretini teftiş et', completed: false }
        ],
        rewards: {
          akce: 100,
          cebeluExp: 20
        },
        status: 'available'
      },

      // =======================================================================
      // BÖLÜM 5: KÖY HANI & CASUSLUK ENTRİKASI
      // =======================================================================
      {
        id: 'quest_inn_spy',
        title: '5. Köy Hanında Şüpheli Casus',
        shortTitle: 'Han Casusu',
        giver: 'Hancı İdris',
        giverRole: 'Köy Hanı Sahibi',
        desc: 'Hancı İdris, handa konaklayan Cenevizli bir tüccarın Bizans adına Osmanlı tımar düzeni hakkında harita çıkardığından şüpheleniyor. Hana git ve durumu teftiş et.',
        targetType: 'npc',
        targetId: 'hanci_idris',
        targetName: 'Hancı İdris',
        targetPos: new THREE.Vector3(-14, 0, 26),
        icon: '🕵️',
        objectives: [
          { text: 'Köy Hanı\'na git ve Hancı İdris ile görüş', completed: false },
          { text: 'Şüpheli tüccarın izini sür ve handa sıcak bir ziyafet çek', completed: false }
        ],
        rewards: {
          akce: 300,
          reputation: 20
        },
        status: 'available'
      },

      // =======================================================================
      // BÖLÜM 6: ŞİFALI KANTARON MERHEMİ & HEZARFEN ATTAR
      // =======================================================================
      {
        id: 'quest_attar',
        title: '6. Savaş İçin Şifalı Merhemler',
        shortTitle: 'Şifalı İksirler',
        giver: 'Attar Mehmet Efendi',
        giverRole: 'Çarşı Baharatçısı & Tabip',
        desc: 'Çarşıdaki Attar Mehmet Efendi\'yi ziyaret et. Yaklaşan muharebe için yara kapatıcı kantaron yağı ve şifalı otlar tedarik et.',
        targetType: 'npc',
        targetId: 'attar_mehmet',
        targetName: 'Attar Mehmet Efendi',
        targetPos: new THREE.Vector3(-10, 0, 15.5),
        icon: '🌿',
        objectives: [
          { text: 'Pazar yerindeki Attar tezgahına git', completed: false },
          { text: 'Mehmet Efendi\'den şifalı merhem satın al', completed: false }
        ],
        rewards: {
          akce: 100,
          maxHealth: 20
        },
        status: 'available'
      },

      // =======================================================================
      // BÖLÜM 7: KOCA DEDE'NİN KOSOVA ZAFER SANCAĞI
      // =======================================================================
      {
        id: 'quest_dede_flag',
        title: '7. Koca Dede\'nin 1389 Kosova Hatırası',
        shortTitle: 'Gazi Öğüdü',
        giver: 'Koca Dede',
        giverRole: 'Köyün Asırlık Gazisi',
        desc: 'Meydandaki çınarın altında oturan 90 yaşındaki gazi Koca Dede\'nin yanına git. 1389 I. Kosova Meydan Muharebesi\'ndeki kahramanlık hikayesini dinle ve duasını al.',
        targetType: 'npc',
        targetId: 'koca_dede',
        targetName: 'Koca Dede',
        targetPos: new THREE.Vector3(-6, 0, 5),
        icon: '👴',
        objectives: [
          { text: 'Meydandaki Koca Dede ile görüş', completed: false },
          { text: 'Gazi duasını al ve itibarını artır', completed: false }
        ],
        rewards: {
          reputation: 25,
          morale: 20
        },
        status: 'available'
      },

      // =======================================================================
      // BÖLÜM 8: KOMŞU SİPAHİ İLE KAN KARDEŞLİĞİ
      // =======================================================================
      {
        id: 'quest_neighbor',
        title: '8. Sancak İttifakı & Gazi Sungur Bey',
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

      // =======================================================================
      // BÖLÜM 9: HARAMİ AVİ & KILÇIK CAFER ÇETESİ
      // =======================================================================
      {
        id: 'quest_bandits',
        title: '9. Köy Asayişi: Orman Harami Baskını',
        shortTitle: 'Haramileri Defet',
        giver: 'Halk & Kethüda',
        giverRole: 'Köy Güvenliği',
        desc: 'Kuzeybatıdaki ormanlık alanda kamp kuran ve kervanları soyan harami çapulcularını bul ve kılıçtan geçir. Tımar arazisinin asayişini sağla.',
        targetType: 'enemy_group',
        targetId: 'bandits',
        targetName: 'Harami Çetesi Kampı',
        targetPos: new THREE.Vector3(-80, 0, -80),
        icon: '💀',
        objectives: [
          { text: 'Kuzeybatıdaki orman kampına intikal et', completed: false },
          { text: 'Kamptaki haramileri kılıçtan geçir (Kalan: 3)', completed: false }
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

      // =======================================================================
      // BÖLÜM 10: SANCAK KALESİ GARNİZONU & CEBEHANE
      // =======================================================================
      {
        id: 'quest_castle',
        title: '10. Sancak Kalesi Teftişi & Dizdar Bey',
        shortTitle: 'Sancak Kalesi',
        giver: 'Dizdar Hamza Bey',
        giverRole: 'Sancak Kalesi Dizdarı',
        desc: 'Doğu taş yolunu takip ederek Sancak Kalesi\'ne git. Dizdar Hamza Bey ile hisar burçlarını, cebehaneyi teftiş et ve kaleden zırhlı tecrübeli muhafız donat.',
        targetType: 'npc',
        targetId: 'dizdar',
        targetName: 'Dizdar Hamza Bey',
        targetPos: new THREE.Vector3(185, 0, 0),
        icon: '🏰',
        objectives: [
          { text: 'Doğu yolundan Sancak Kalesi\'ne ulaş', completed: false },
          { text: 'Dizdar Hamza Bey ile görüşüp garnizonu teftiş et', completed: false }
        ],
        rewards: {
          akce: 400,
          reputation: 30,
          asayis: 20
        },
        status: 'available'
      },

      // =======================================================================
      // FİNAL: 1396 NİĞBOLU HAÇLI SEFERİ ÇAĞRISI
      // =======================================================================
      {
        id: 'quest_campaign',
        title: '11. Sultan Yıldırım Bayezid Han\'ın Fermanı: 1396 Niğbolu Seferi',
        shortTitle: 'Niğbolu Seferi',
        giver: 'Sultan Fermanı & Sancakbeyi',
        giverRole: 'Devlet-i Aliyye',
        desc: 'Sultanımız Yıldırım Bayezid Han Rumeli\'ye tuğ çekmiştir! Macar Kralı Sigismund ve Fransız şövalyelerinden oluşan dev Haçlı ordusuna karşı Tuna boyunda şanlı meydan muharebesine katıl!',
        targetType: 'campaign',
        targetId: 'campaign_start',
        targetName: 'Tuna Seferi Alayı',
        targetPos: new THREE.Vector3(0, 0, 75),
        icon: '🚩',
        objectives: [
          { text: 'Tüm cebelülerini ve silahlarını hazırla (En az 2 Cebelü)', completed: false },
          { text: 'Köy çıkışındaki kapıdan Sancakbeyi alayına katıl', completed: false }
        ],
        rewards: {
          akce: 2000,
          reputation: 100,
          title: 'Gazi Sancakbeyi Naibi'
        },
        status: 'available'
      }
    ];

    this.activeQuestIndex = 0;
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

  advanceObjective(questId, objectiveIndex) {
    const quest = this.getQuestById(questId);
    if (!quest) return;

    if (quest.status === 'available') {
      quest.status = 'active';
    }

    if (quest.objectives[objectiveIndex]) {
      if (!quest.objectives[objectiveIndex].completed) {
        quest.objectives[objectiveIndex].completed = true;
        try { soundManager.playVictoryJingle(); } catch (e) {}
        gameState.addNotification(`🎯 Görev İlerlemesi: ${quest.objectives[objectiveIndex].text}`, 'success');

        const allCompleted = quest.objectives.every(o => o.completed);
        if (allCompleted) {
          this.completeQuest(questId);
        } else {
          this.syncWithGameState();
        }
      }
    }
  }

  onEnemyDefeated(enemyId) {
    const banditQuest = this.getQuestById('quest_bandits');
    if (banditQuest && (banditQuest.status === 'active' || banditQuest.status === 'available')) {
      banditQuest.status = 'active';
      banditQuest.banditsDefeated = (banditQuest.banditsDefeated || 0) + 1;
      const remaining = Math.max(0, banditQuest.banditCount - banditQuest.banditsDefeated);
      
      banditQuest.objectives[0].completed = true;
      banditQuest.objectives[1].text = `Kamptaki haramileri kılıçtan geçir (Kalan: ${remaining})`;

      gameState.addNotification(`⚔️ Harami bertaraf edildi! Kalan eşkıya: ${remaining}`, 'alert');

      if (remaining === 0) {
        banditQuest.objectives[1].completed = true;
        this.completeQuest('quest_bandits');
      } else {
        this.syncWithGameState();
      }
    }
  }

  completeQuest(questId) {
    const quest = this.getQuestById(questId);
    if (!quest || quest.status === 'completed') return;

    quest.status = 'completed';

    // Ödülleri Dağıt
    if (quest.rewards.akce) gameState.timar.akce += quest.rewards.akce;
    if (quest.rewards.reputation) gameState.sipahi.reputation += quest.rewards.reputation;
    if (quest.rewards.asayis) gameState.timar.asayis = Math.min(100, gameState.timar.asayis + quest.rewards.asayis);
    if (quest.rewards.morale) gameState.timar.morale = Math.min(100, gameState.timar.morale + quest.rewards.morale);
    if (quest.rewards.maxHealth) gameState.sipahi.health = 100;
    if (quest.rewards.cebeluExp) gameState.military.cebeluExperience += quest.rewards.cebeluExp;

    try {
      soundManager.playVictoryJingle();
      steamManager.unlockAchievement('ACH_FIRST_PATROL');
    } catch (e) {}

    gameState.addNotification(`🏆 VAZİFE TAMAMLANDI: ${quest.title}`, 'success');

    // Sonraki görevi aktif et
    const nextQuest = this.quests.find(q => q.status === 'available');
    if (nextQuest) {
      nextQuest.status = 'active';
      gameState.addNotification(`📜 Yeni Vazife Açıldı: ${nextQuest.title}`, 'info');
    }

    this.syncWithGameState();
  }

  syncWithGameState() {
    const active = this.getActiveQuest();
    if (active) {
      gameState.quest.currentTitle = active.title;
      gameState.quest.currentDescription = active.desc;
      gameState.quest.objectives = active.objectives.map(o => o.text);
      gameState.quest.targetPosition = active.targetPos ? { x: active.targetPos.x, y: active.targetPos.y, z: active.targetPos.z } : null;
    } else {
      gameState.quest.currentTitle = 'Tüm Vazifeler Tamamlandı';
      gameState.quest.currentDescription = 'Köyünüz huzur içinde, ordunuz sefere hazır!';
      gameState.quest.objectives = ['Sultanın yeni fermanını bekle'];
      gameState.quest.targetPosition = null;
    }
  }
}

export const questSystem = new QuestSystem();
