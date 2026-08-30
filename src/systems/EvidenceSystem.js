import * as THREE from 'three';
import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';

/**
 * EvidenceSystem - İpucusuz Dünya Dedektifliği ve Kanıt Toplama Motoru
 * Ekranda hiçbir açık görev oku veya yönlendirme olmadan, oyuncunun dünyadaki şüpheli
 * noktaları kendi dikkatiyle keşfetmesini sağlar.
 */
export class EvidenceSystem {
  constructor() {
    this.evidenceLocations = [
      {
        id: 'severedStrap',
        key: 'severedStrap',
        name: 'Kesik Eğer Kolanı (Sabotaj Kanıtı)',
        icon: '🔪',
        pos: new THREE.Vector3(14, 0, -38), // Kuzey Tavlası Sungur Bey'in Atının Eğeri
        desc: 'Gazi Sungur Bey\'in eyerinin alt kolanı. Kaza ile kopmamış; Frenk yapımı ince hançerle kasten yarıya kadar kesilip zayıflatılmış!',
        prompt: '[E] At Eyerini ve Kolanı İncele 🔍'
      },
      {
        id: 'spyLetter',
        key: 'spyLetter',
        name: 'Venedik Dükası & Haçlı Casus Mektubu',
        icon: '📜',
        pos: new THREE.Vector3(-21, 0, 32), // Köy Hanı Arka Taş Duvar Dibi
        desc: 'Üzerinde Rodos Şövalyeleri ve Venedik mührü olan gizli mektup. Dimitri adındaki ajana Tımarlı Sipahileri birbirine düşürmesi için 300 Venedik altını vadedildiğini belgeliyor!',
        prompt: '[E] Han Arkasındaki Gizli Bölmeyi İncele 🔍'
      },
      {
        id: 'poisonNeedle',
        key: 'poisonNeedle',
        name: 'Frenk İmalâtı Zehirli İğne',
        icon: '💉',
        pos: new THREE.Vector3(-12, 0, 12), // Pazar Yeri Tezgâh Arkası
        desc: 'Atın derisine batırılan ve dağ geçidinde hayvanı çıldırtarak uçuruma sürükleyen zehirli ince çelik iğne!',
        prompt: '[E] Yere Düşmüş Şüpheli Cismi İncele 🔍'
      }
    ];
  }

  getNearbyEvidence(playerPos, radius = 3.8) {
    if (!gameState.murderCase.isAccused && !gameState.murderCase.hasSungurDied) {
      return null;
    }

    for (const item of this.evidenceLocations) {
      if (!gameState.murderCase.evidence[item.key]) {
        const dist = playerPos.distanceTo(item.pos);
        if (dist <= radius) {
          return item;
        }
      }
    }
    return null;
  }

  collectNearbyEvidence(playerPos, radius = 3.8) {
    const item = this.getNearbyEvidence(playerPos, radius);
    if (!item) return null;

    gameState.murderCase.evidence[item.key] = true;

    try { soundManager.playVictoryJingle(); } catch (e) {}

    gameState.addNotification(`🔍 KANIT BULUNDU: ${item.name}!`, 'success');
    gameState.addNotification(`📜 ${item.desc}`, 'info');

    // Görev ilerlemesi
    const trialQuest = questSystem.getQuestById('quest_murder_trial');
    if (trialQuest && trialQuest.status === 'active') {
      if (gameState.hasSufficientEvidence()) {
        questSystem.advanceObjective('quest_murder_trial', 0);
        gameState.addNotification('⚖️ Mahkemede kendini aklayacak yeterli delile ulaştın! Molla Şemseddin\'in divanına çıkabilirsin.', 'alert');
      }
    }

    return item;
  }

  getCollectedCount() {
    let count = 0;
    if (gameState.murderCase.evidence.severedStrap) count++;
    if (gameState.murderCase.evidence.spyLetter) count++;
    if (gameState.murderCase.evidence.poisonNeedle) count++;
    return count;
  }
}

export const evidenceSystem = new EvidenceSystem();
