/**
 * Mülk-i Osmanî - İnşaat ve Tımar İmar Sistemi (ConstructionSystem)
 * 
 * V2 Devir Sözleşmesi Bölüm 15 (G3 Standartları):
 * - Tımar arazisinde su bendi, talimgâh, at tavlası, gözetleme kulesi imarı.
 * - Çok günlük inşaat süreci ve gün dönümü ilerleme takibi.
 * - Tamamlanınca kalıcı dirlik ve askeri bonuslar.
 */

import { gameState } from '../core/GameState.js';
import { effectRunner } from '../core/EffectRunner.js';
import { consequenceSystem } from './ConsequenceSystem.js';

export const BUILDINGS = {
  water_bent: {
    id: 'water_bent',
    name: 'Taş Su Bendi & Arkı',
    desc: 'Değirmen suyunun düzenli akmasını ve tarlaların sulanmasını sağlar.',
    costAkce: 150,
    requiredDays: 2,
    icon: '🌊',
    effects: [
      { type: 'modifyStat', stat: 'reayaTrust', value: 15 },
      { type: 'modifyStat', stat: 'akce', value: 50 }
    ]
  },
  training_ground: {
    id: 'training_ground',
    name: 'Gelişmiş Cebelü Talimgâhı',
    desc: 'Ok hedefleri ve kalkan siperleri ile askerlerin talim kalitesini artırır.',
    costAkce: 200,
    requiredDays: 3,
    icon: '🛡️',
    effects: [
      { type: 'modifyStat', stat: 'squadLoyalty', value: 20 },
      { type: 'modifyStat', stat: 'sancakReputation', value: 10 }
    ]
  },
  horse_stable: {
    id: 'horse_stable',
    name: 'Konağın At Tavlası',
    desc: 'Savaş atlarının bakımı ve tımarı için korunaklı ahır.',
    costAkce: 180,
    requiredDays: 2,
    icon: '🐎',
    effects: [
      { type: 'modifyStat', stat: 'squadLoyalty', value: 10 }
    ]
  },
  watchtower: {
    id: 'watchtower',
    name: 'Ahşap Gözetleme Kulesi',
    desc: 'Köy sınırlarını haramilere karşı gözetleyen nöbet kulesi.',
    costAkce: 250,
    requiredDays: 3,
    icon: '🏰',
    effects: [
      { type: 'modifyStat', stat: 'asayis', value: 25 }
    ]
  }
};

export class ConstructionSystem {
  constructor() {
    this.projects = {}; // { [buildingId]: { status: 'not_started'|'in_progress'|'completed', daysRemaining: 0 } }
    this.initProjects();
  }

  initProjects() {
    for (const key of Object.keys(BUILDINGS)) {
      this.projects[key] = {
        status: 'not_started',
        daysRemaining: BUILDINGS[key].requiredDays
      };
    }
  }

  /**
   * İnşaatı başlatır
   */
  startConstruction(buildingId) {
    const building = BUILDINGS[buildingId];
    if (!building) return false;

    const proj = this.projects[buildingId];
    if (!proj || proj.status !== 'not_started') {
      gameState.addNotification('⚠️ Bu inşaat zaten başlamış veya tamamlanmış!', 'alert');
      return false;
    }

    if (gameState.timar.akce < building.costAkce) {
      gameState.addNotification(`⚠️ Yetersiz akçe! (${building.costAkce} Akçe gerekli)`, 'alert');
      return false;
    }

    const txId = `construct:start:${buildingId}`;
    const result = effectRunner.runTransaction(txId, [
      { type: 'modifyStat', stat: 'akce', value: -building.costAkce }
    ]);

    if (result.ok) {
      proj.status = 'in_progress';
      proj.daysRemaining = building.requiredDays;
      gameState.addNotification(`🏗️ İNŞAAT BAŞLADI: ${building.name} (${building.requiredDays} gün sürecek)`, 'success');
      return true;
    }
    return false;
  }

  /**
   * Gün dönümünde inşaatların ilerlemesini kontrol eder
   */
  checkDailyProgress(dayCount) {
    for (const [id, proj] of Object.entries(this.projects)) {
      if (proj.status === 'in_progress') {
        proj.daysRemaining--;
        if (proj.daysRemaining <= 0) {
          proj.status = 'completed';
          const building = BUILDINGS[id];
          if (building) {
            // Etkileri uygula
            effectRunner.runTransaction(`construct:finish:${id}`, building.effects);
            gameState.addNotification(`🏛️ İNŞAAT TAMAMLANDI: ${building.name} hizmete girdi!`, 'success');

            // Vakayinameye kaydet
            consequenceSystem.chronicle.push({
              day: dayCount,
              title: `${building.name} Tamamlandı`,
              desc: `${building.name} imar edilerek dirlik arazisine kazandırıldı.`,
              date: `H. 798 / Gün ${dayCount}`
            });
          }
        }
      }
    }
  }

  isCompleted(buildingId) {
    return this.projects[buildingId]?.status === 'completed';
  }

  serialize() {
    return {
      projects: this.projects
    };
  }

  deserialize(data) {
    if (!data) return;
    this.projects = data.projects || this.projects;
  }
}

export const constructionSystem = new ConstructionSystem();
