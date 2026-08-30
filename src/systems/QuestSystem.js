import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { steamManager } from '../core/SteamManager.js';

/**
 * QuestSystem - Mülk-i Osmanî: Tımarlı Sipahi 3D Veri Güdümlü Görev ve Olay Durum Makinesi
 * Durumlar: 'locked', 'available', 'active', 'completed', 'failed'
 */
export class QuestSystem {
  constructor() {
    this.initQuests();
  }

  initQuests() {
    this.quests = [
      // =======================================================================
      // BÖLÜM 1: TIMAR TEFTİŞİ & KETHÜDA GÖRÜŞMESİ
      // =======================================================================
      {
        id: 'quest_inspect',
        chapter: 1,
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
        prerequisites: [],
        objectives: [
          { text: 'Köy meydanındaki Koca Yakub ile görüş', completed: false },
          { text: 'Öşür vergisini adil belirle veya köylüye ziyafet ver', completed: false }
        ],
        rewards: {
          akce: 250,
          reayaTrust: 10,
          sancakReputation: 5,
          asayis: 10
        },
        status: 'active'
      },

      // =======================================================================
      // BÖLÜM 2: SU HAKKI & DEĞİRMEN ARKI İHTİLAFI (Aşama 1 Kanıt & Hukuk)
      // =======================================================================
      {
        id: 'quest_water_dispute',
        chapter: 1,
        title: '2. Su Hakkı ve Değirmen Arkı İhtilafı',
        shortTitle: 'Su İhtilafı',
        giver: 'Reaya Temsilcisi',
        giverRole: 'Köy Çiftçileri',
        desc: 'Değirmen arkının kullanımı konusunda iki komşu hane arasında ihtilaf çıktı. Meseleyi yerinde incele, tanıkları dinle ve Kadı Naibi Molla Şemseddin ile istişare ederek adil bir hüküm ver.',
        targetType: 'location',
        targetId: 'water_mill',
        targetName: 'Su Değirmeni Arkı',
        targetPos: new THREE.Vector3(-45, 0, 22),
        icon: '💧',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Su değirmeni arkındaki kırık seti incele', completed: false },
          { text: 'Kadı Naibi Molla Şemseddin ile şer\'i ve örfi çözümü kararlaştır', completed: false }
        ],
        rewards: {
          akce: 150,
          reayaTrust: 15,
          sancakReputation: 10,
          factionUlema: 15
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 3: PUSAT, ÖRS & AHİLER OCAĞI
      // =======================================================================
      {
        id: 'quest_blacksmith',
        chapter: 1,
        title: '3. Pusat ve Zırh Teftişi (Ahi Ocağı)',
        shortTitle: 'Demirci Ziyareti',
        giver: 'Demirci Rüstem Usta',
        giverRole: 'Ahi Zırh ve Kılıç Ustası',
        desc: 'Köyün batı tarafındaki ocak başında çalışan Demirci Rüstem Usta\'yı ziyaret et. Ağır zırhlı düşmanlar için Gürz/Çekiç donanımını incele ve Cebelü teçhizatını tamamla.',
        targetType: 'npc',
        targetId: 'demirci',
        targetName: 'Demirci Rüstem Usta',
        targetPos: new THREE.Vector3(-58, 0, 6.8),
        icon: '⚒️',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Demirci Rüstem Usta\'nın ocağına git', completed: false },
          { text: 'Kılıcını bilet, gürz siparişi ver veya Cebelü takımı edin', completed: false }
        ],
        rewards: {
          akce: 150,
          sancakReputation: 10,
          squadLoyalty: 10,
          factionAhiler: 15,
          maxHealth: 15
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 4: ŞER'İ HÜKÜM & CUMA DUASI
      // =======================================================================
      {
        id: 'quest_imam',
        chapter: 1,
        title: '4. Mescid Ziyareti & Hayır Dua',
        shortTitle: 'Mescid ve Kadı Naibi',
        giver: 'Molla Şemseddin',
        giverRole: 'Köy İmamı ve Şer\'i Naib (Bilge & Adil)',
        desc: 'Mavi kubbeli Ulu Mescid avlusuna git. Molla Şemseddin ile görüşüp yaklaşan gazalar için hayır dua al ve Rumeli\'deki Haçlı fermanı hakkında haberleri öğren.',
        targetType: 'npc',
        targetId: 'imam',
        targetName: 'Molla Şemseddin (İmam)',
        targetPos: new THREE.Vector3(10, 0, 2),
        icon: '🕌',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Mavi kubbeli Ulu Mescid avlusuna git', completed: false },
          { text: 'Molla Şemseddin\'den hayır dua al ve adalet öğüdünü dinle', completed: false }
        ],
        rewards: {
          sancakReputation: 15,
          reayaTrust: 15,
          factionUlema: 20
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 5: CEBELÜ TALİMİ
      // =======================================================================
      {
        id: 'quest_cebelu',
        chapter: 2,
        title: '5. Sadık Cebelü Ali\'nin Talimi',
        shortTitle: 'Cebelü Talimi',
        giver: 'Toy Cebelü Ali',
        giverRole: 'Sipahinin Sadık Çırağı',
        desc: 'Konağın yanındaki talimgâhta kılıç ve kalkan talimi yapan genç Cebelü Ali\'nin yanına git. Muharebe taktiklerini öğret ve onu sefere hazırla.',
        targetType: 'npc',
        targetId: 'cebelu',
        targetName: 'Toy Cebelü Ali',
        targetPos: new THREE.Vector3(14, 0, -26),
        icon: '🛡️',
        prerequisites: ['quest_blacksmith'],
        objectives: [
          { text: 'Talimgâhtaki Ali\'nin yanına git', completed: false },
          { text: 'Ali ile talim yap ve bölük komutlarını öğret', completed: false }
        ],
        rewards: {
          akce: 100,
          squadLoyalty: 25,
          cebeluExp: 20
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 6: KÖY HANI & ŞÜPHELİ CASUS SORUŞTURMASI
      // =======================================================================
      {
        id: 'quest_inn_spy',
        chapter: 2,
        title: '6. Köy Hanında Şüpheli Casus',
        shortTitle: 'Han Casusu',
        giver: 'Hancı İdris',
        giverRole: 'Köy Hanı Sahibi',
        desc: 'Hancı İdris, handa konaklayan yabancı bir tüccarın Osmanlı tımar düzeni hakkında gizlice harita çıkardığından şüpheleniyor. Hana git ve durumu teftiş et.',
        targetType: 'npc',
        targetId: 'hanci_idris',
        targetName: 'Hancı İdris',
        targetPos: new THREE.Vector3(-10, 0, 22.5),
        icon: '🕵️',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Köy Hanı\'na git ve Hancı İdris ile görüş', completed: false },
          { text: 'Şüpheli tüccarın izini sür ve handa kanıtları topla', completed: false }
        ],
        rewards: {
          akce: 300,
          sancakReputation: 20,
          asayis: 15
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 7: ŞİFALI KANTARON MERHEMİ & HEZARFEN ATTAR
      // =======================================================================
      {
        id: 'quest_attar',
        chapter: 2,
        title: '7. Savaş İçin Şifalı Merhemler',
        shortTitle: 'Şifalı İksirler',
        giver: 'Attar Mehmet Efendi',
        giverRole: 'Çarşı Baharatçısı & Tabip',
        desc: 'Çarşıdaki Attar Mehmet Efendi\'yi ziyaret et. Yaklaşan muharebe için yara kapatıcı kantaron yağı ve şifalı otlar tedarik et.',
        targetType: 'npc',
        targetId: 'attar_mehmet',
        targetName: 'Attar Mehmet Efendi',
        targetPos: new THREE.Vector3(-10, 0, 15.5),
        icon: '🌿',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Pazar yerindeki Attar tezgahına git', completed: false },
          { text: 'Mehmet Efendi\'den şifalı merhem satın al', completed: false }
        ],
        rewards: {
          akce: 100,
          reayaTrust: 10,
          factionAhiler: 10,
          maxHealth: 20
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 8: KOCA DEDE'NİN KOSOVA ZAFER SANCAĞI
      // =======================================================================
      {
        id: 'quest_dede_flag',
        chapter: 2,
        title: '8. Koca Dede\'nin 1389 Kosova Hatırası',
        shortTitle: 'Gazi Öğüdü',
        giver: 'Koca Dede',
        giverRole: 'Köyün Asırlık Gazisi',
        desc: 'Meydandaki çınarın altında oturan 90 yaşındaki gazi Koca Dede\'nin yanına git. 1389 I. Kosova Meydan Muharebesi\'ndeki kahramanlık hikayesini dinle ve duasını al.',
        targetType: 'npc',
        targetId: 'koca_dede',
        targetName: 'Koca Dede',
        targetPos: new THREE.Vector3(-6, 0, 5),
        icon: '👴',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Meydandaki Koca Dede ile görüş', completed: false },
          { text: 'Gazi duasını al ve itibarını artır', completed: false }
        ],
        rewards: {
          sancakReputation: 20,
          squadLoyalty: 15,
          reayaTrust: 15
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 9: KOMŞU SİPAHİ İLE İTTİFAK
      // =======================================================================
      {
        id: 'quest_neighbor',
        chapter: 2,
        title: '9. Sancak İttifakı & Gazi Sungur Bey',
        shortTitle: 'Sipahi İttifakı',
        giver: 'Gazi Sungur Bey',
        giverRole: 'Komşu Çakırlı Tımarı Sahibi',
        desc: 'Kuzey yolunda bekleyen komşu tımarlı sipahi Gazi Sungur Bey ile buluş. Sultan\'ın sefer fermanı geldiğinde cebelülerinizi birleştirme anlaşması yapın.',
        targetType: 'npc',
        targetId: 'neighbor',
        targetName: 'Gazi Sungur Bey',
        targetPos: new THREE.Vector3(18, 0, -10),
        icon: '⚔️',
        prerequisites: ['quest_cebelu'],
        objectives: [
          { text: 'Kuzey yolundaki Gazi Sungur Bey ile görüş', completed: false },
          { text: 'Seferde ortak sancak altında vuruşma sözü al', completed: false }
        ],
        rewards: {
          sancakReputation: 20,
          squadLoyalty: 15,
          cebeluExp: 15
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 10: HARAMİ BASKINI
      // =======================================================================
      {
        id: 'quest_bandits',
        chapter: 2,
        title: '10. Köy Asayişi: Orman Harami Baskını',
        shortTitle: 'Haramileri Defet',
        giver: 'Halk & Kethüda',
        giverRole: 'Köy Güvenliği',
        desc: 'Kuzeybatıdaki ormanlık alanda kamp kuran ve kervanları soyan harami çapulcularını bul ve bertaraf et. Tımar arazisinin asayişini sağla.',
        targetType: 'enemy_group',
        targetId: 'bandits',
        targetName: 'Harami Çetesi Kampı',
        targetPos: new THREE.Vector3(-80, 0, -80),
        icon: '💀',
        prerequisites: ['quest_inspect'],
        objectives: [
          { text: 'Kuzeybatıdaki orman kampına intikal et', completed: false },
          { text: 'Kamptaki haramileri bertaraf et (Kalan: 3)', completed: false }
        ],
        banditCount: 3,
        banditsDefeated: 0,
        rewards: {
          akce: 500,
          asayis: 25,
          reayaTrust: 20,
          sancakReputation: 20
        },
        status: 'locked'
      },

      // =======================================================================
      // BÖLÜM 11: SANCAK KALESİ GARNİZONU
      // =======================================================================
      {
        id: 'quest_castle',
        chapter: 3,
        title: '11. Sancak Kalesi Teftişi & Dizdar Bey',
        shortTitle: 'Sancak Kalesi',
        giver: 'Dizdar Hamza Bey',
        giverRole: 'Sancak Kalesi Dizdarı',
        desc: 'Doğu taş yolunu takip ederek Sancak Kalesi\'ne git. Dizdar Hamza Bey ile hisar burçlarını, cebehaneyi teftiş et ve kaleden zırhlı tecrübeli muhafız donat.',
        targetType: 'npc',
        targetId: 'dizdar',
        targetName: 'Dizdar Hamza Bey',
        targetPos: new THREE.Vector3(185, 0, 0),
        icon: '🏰',
        prerequisites: ['quest_neighbor'],
        objectives: [
          { text: 'Doğu yolundan Sancak Kalesi\'ne ulaş', completed: false },
          { text: 'Dizdar Hamza Bey ile görüşüp garnizonu teftiş et', completed: false }
        ],
        rewards: {
          akce: 400,
          sancakReputation: 30,
          asayis: 20
        },
        status: 'locked'
      },

      // =======================================================================
      // FİNAL: 1396 NİĞBOLU HAÇLI SEFERİ ÇAĞRISI
      // =======================================================================
      {
        id: 'quest_campaign',
        chapter: 4,
        title: '12. Sultan Yıldırım Bayezid Han\'ın Fermanı: 1396 Niğbolu Seferi',
        shortTitle: 'Niğbolu Seferi',
        giver: 'Sultan Fermanı & Sancakbeyi',
        giverRole: 'Devlet-i Aliyye',
        desc: 'Sultanımız Yıldırım Bayezid Han Rumeli\'ye tuğ çekmiştir! Macar Kralı Sigismund ve Fransız şövalyelerinden oluşan dev Haçlı ordusuna karşı Tuna boyunda şanlı meydan muharebesine katıl!',
        targetType: 'campaign',
        targetId: 'campaign_start',
        targetName: 'Tuna Seferi Alayı',
        targetPos: new THREE.Vector3(0, 0, 75),
        icon: '🚩',
        prerequisites: ['quest_castle'],
        objectives: [
          { text: 'Tüm cebelülerini ve silahlarını hazırla (En az 1 Cebelü)', completed: false },
          { text: 'Köy çıkışındaki kapıdan Sancakbeyi alayına katıl', completed: false }
        ],
        rewards: {
          akce: 2000,
          sancakReputation: 100,
          squadLoyalty: 50,
          title: 'Gazi Sancakbeyi Naibi'
        },
        status: 'locked'
      },

      // 13. GAZİ CEBELÜ ALİ'Yİ KURTARMA (ZAMAN KISITLI ACİL VAZİFE)
      {
        id: 'quest_save_ali_leg',
        title: '13. Can Yoldaşım: Gazi Cebelü Ali\'yi Hayatta Tut',
        shortTitle: 'Gazi Ali\'yi Kurtar',
        giver: 'Sadık Cebelü Ali (Yaralı)',
        giverRole: 'Gazi Silahdar',
        desc: 'Niğbolu\'da sana inen kılıca kendini siper edip bacağını kaybeden Sadık Cebelü Ali ölüm döşeğinde! 3 gün içinde merhem, koltuk değneği ve hekim bulamazsan vefat edecek ve ahali vefasızlığa isyan edecek!',
        targetType: 'npc',
        targetId: 'attar',
        targetName: 'Attar Mehmet Efendi & Demirci Rüstem',
        targetPos: new THREE.Vector3(-12, 0, 18),
        icon: '🩹',
        prerequisites: ['quest_campaign'],
        objectives: [
          { text: 'Attar Mehmet\'ten sarı kantaron dağlama yağı temin et', completed: false },
          { text: 'Demirci Rüstem\'den demir tabanlı koltuk değneği sipariş et', completed: false },
          { text: 'Molla Şemseddin ve hekimle Ali\'nin yarasını sarıp ayağa kaldır', completed: false }
        ],
        rewards: {
          akce: 500,
          reayaTrust: 30,
          squadLoyalty: 40,
          title: 'Vefakâr Gazi Sipahi'
        },
        status: 'locked'
      }
    ];

    this.syncAvailableQuests();
    this.syncWithGameState();
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

  getActiveTargetInfo(playerPos) {
    const active = this.getActiveQuest();
    if (!active || !active.targetPos) return null;

    const distance = playerPos ? Math.round(playerPos.distanceTo(active.targetPos)) : 0;
    return {
      questId: active.id,
      title: active.title,
      shortTitle: active.shortTitle || active.title,
      targetPos: active.targetPos,
      targetName: active.targetName || 'Hedef Noktası',
      icon: active.icon || '📍',
      distance
    };
  }

  advanceObjective(questId, objectiveIndex) {
    const quest = this.getQuestById(questId);
    if (!quest) return;

    if (quest.status === 'available' || quest.status === 'locked') {
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

  onEnemyKilled(enemy) {
    const enemyId = enemy?.id || 'bandit';
    this.onEnemyDefeated(enemyId);
  }

  onEnemyDefeated(enemyId) {
    const banditQuest = this.getQuestById('quest_bandits');
    if (banditQuest && (banditQuest.status === 'active' || banditQuest.status === 'available')) {
      banditQuest.status = 'active';
      banditQuest.banditsDefeated = (banditQuest.banditsDefeated || 0) + 1;
      const remaining = Math.max(0, banditQuest.banditCount - banditQuest.banditsDefeated);
      
      banditQuest.objectives[0].completed = true;
      banditQuest.objectives[1].text = `Kamptaki haramileri bertaraf et (Kalan: ${remaining})`;

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
    if (quest.rewards.reayaTrust) gameState.modifyReayaTrust(quest.rewards.reayaTrust);
    if (quest.rewards.sancakReputation) gameState.modifySancakReputation(quest.rewards.sancakReputation);
    if (quest.rewards.squadLoyalty) gameState.modifySquadLoyalty(quest.rewards.squadLoyalty);
    if (quest.rewards.factionUlema) gameState.modifyFaction('ulema', quest.rewards.factionUlema);
    if (quest.rewards.factionAhiler) gameState.modifyFaction('ahiler', quest.rewards.factionAhiler);
    if (quest.rewards.asayis) gameState.timar.asayis = Math.min(100, gameState.timar.asayis + quest.rewards.asayis);
    if (quest.rewards.maxHealth) gameState.sipahi.health = gameState.sipahi.maxHealth;
    if (quest.rewards.cebeluExp) gameState.military.cebeluExperience += quest.rewards.cebeluExp;

    try {
      soundManager.playVictoryJingle();
      steamManager.unlockAchievement('ACH_FIRST_PATROL');
    } catch (e) {}

    gameState.addNotification(`🏆 VAZİFE TAMAMLANDI: ${quest.title}`, 'success');

    this.syncAvailableQuests();
    this.syncWithGameState();
  }

  syncAvailableQuests() {
    this.quests.forEach(q => {
      if (q.status === 'locked') {
        const canUnlock = q.prerequisites.every(prereqId => {
          const prereqQuest = this.getQuestById(prereqId);
          return prereqQuest && prereqQuest.status === 'completed';
        });
        if (canUnlock) {
          q.status = 'available';
        }
      }
    });

    // Eğer aktif görev yoksa ilk 'available' olanı aktif yap
    if (!this.getActiveQuest()) {
      const next = this.quests.find(q => q.status === 'available');
      if (next) {
        next.status = 'active';
        gameState.addNotification(`📜 Yeni Vazife Açıldı: ${next.title}`, 'info');
      }
    }
  }

  syncWithGameState() {
    const active = this.getActiveQuest();
    if (active) {
      gameState.quest.currentTitle = active.title;
      gameState.quest.currentDescription = active.desc;
      gameState.quest.objectives = active.objectives.map(o => o.text);
      gameState.quest.targetPosition = active.targetPos ? { x: active.targetPos.x, y: active.targetPos.y, z: active.targetPos.z } : null;
      gameState.currentQuest = {
        id: active.id,
        title: active.title,
        desc: active.desc,
        isCompleted: false
      };
    } else {
      gameState.quest.currentTitle = 'Tüm Vazifeler Tamamlandı';
      gameState.quest.currentDescription = 'Köyünüz huzur içinde, ordunuz sefere hazır!';
      gameState.quest.objectives = ['Sultanın yeni fermanını bekle'];
      gameState.quest.targetPosition = null;
      gameState.currentQuest = {
        id: 'completed_all',
        title: 'Tüm Vazifeler Tamamlandı',
        desc: 'Köyünüz huzur içinde, ordunuz sefere hazır!',
        isCompleted: true
      };
    }
  }

  serializeQuests() {
    return this.quests.map(q => ({
      id: q.id,
      status: q.status,
      banditsDefeated: q.banditsDefeated || 0,
      objectives: q.objectives.map(o => ({ completed: o.completed, text: o.text }))
    }));
  }

  deserializeQuests(savedQuests) {
    if (!Array.isArray(savedQuests)) return;

    savedQuests.forEach(sq => {
      const q = this.getQuestById(sq.id);
      if (q) {
        q.status = sq.status;
        if (sq.banditsDefeated !== undefined) q.banditsDefeated = sq.banditsDefeated;
        if (Array.isArray(sq.objectives)) {
          sq.objectives.forEach((so, idx) => {
            if (q.objectives[idx]) {
              q.objectives[idx].completed = so.completed;
              if (so.text) q.objectives[idx].text = so.text;
            }
          });
        }
      }
    });

    this.syncAvailableQuests();
    this.syncWithGameState();
  }
}

export const questSystem = new QuestSystem();
