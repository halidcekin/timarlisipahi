import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';
import { steamManager } from '../core/SteamManager.js';

/**
 * VillageSystem - Köy Yönetimi, Öşür Vergisi, Asayiş ve Cebelü Donatımı
 */
export class VillageSystem {
  static collectAnnualTax() {
    if (gameState.timar.taxCollectedThisYear) {
      gameState.addNotification('Bu yılın öşür ve cizye vergisi zaten tahsil edildi!', 'alert');
      return false;
    }

    // Hasat ve hane sayısına göre hasılat
    const baseRevenue = gameState.timar.annualIncome;
    const moraleMultiplier = gameState.timar.morale / 100;
    const totalCollected = Math.floor(baseRevenue * (0.85 + moraleMultiplier * 0.3));

    gameState.timar.akce += totalCollected;
    gameState.timar.taxCollectedThisYear = true;

    // Fazla vergi köylü moralini hafif düşürür
    gameState.timar.morale = Math.max(30, gameState.timar.morale - 5);

    gameState.addNotification(`🌾 Öşür ve rüsum tahsil edildi: +${totalCollected} Akçe hazineye eklendi.`, 'success');
    soundManager.playVictoryJingle();
    return true;
  }

  static trainCebelu() {
    const cost = 800;
    if (gameState.timar.akce < cost) {
      gameState.addNotification(`Yetersiz Akçe! Yeni bir Cebelü donatmak için en az ${cost} Akçe gerekir.`, 'alert');
      return false;
    }

    gameState.timar.akce -= cost;
    gameState.military.cebeluCount += 1;
    const soldierNames = ['Sunguroğlu Mustafa', 'Gazi Murat', 'Demirci Çırağı Hamza', 'Yaycı Mehmet'];
    const newName = soldierNames[Math.floor(Math.random() * soldierNames.length)];
    gameState.military.veteranSoldiers.push(newName);

    gameState.addNotification(`⚔️ Yeni Cebelü donatıldı ve orduya katıldı: ${newName} (-${cost} Akçe)`, 'success');
    soundManager.playWarDrum();

    // Görev İlerlemelerini Anında Tetikle
    questSystem.advanceObjective('quest_campaign', 0);
    questSystem.advanceObjective('quest_cebelu', 0);
    questSystem.advanceObjective('quest_cebelu', 1);
    questSystem.advanceObjective('quest_blacksmith', 1);

    // Steam Başarımı
    steamManager.unlockAchievement('ACH_FIRST_CEBELU');
    return true;
  }

  static patrolVillage() {
    if (gameState.sipahi.stamina < 30) {
      gameState.addNotification('Yorgunluktan dizlerin titriyor! Devriyeye çıkmak için dinlenmelisin.', 'alert');
      return false;
    }

    gameState.sipahi.stamina -= 30;
    gameState.timar.asayis = Math.min(100, gameState.timar.asayis + 15);
    gameState.sipahi.reputation = Math.min(100, gameState.sipahi.reputation + 5);

    gameState.addNotification('🛡️ Köy arazisinde devriye gezildi. Köy asayişi ve güvenliği arttı (%+15).', 'success');
    return true;
  }

  static feastVillagers() {
    const cost = 150;
    if (gameState.timar.akce < cost) {
      gameState.addNotification('Ziyafet vermek için akçen yetersiz!', 'alert');
      return false;
    }

    gameState.timar.akce -= cost;
    gameState.timar.morale = Math.min(100, gameState.timar.morale + 20);
    gameState.relations.kethuda = Math.min(100, gameState.relations.kethuda + 15);

    gameState.addNotification('🍞 Köy meydanında kazanlar kaynatıldı, reayaya ziyafet verildi. Köylü sevgisi arttı (+%20).', 'success');
    soundManager.playVictoryJingle();
    return true;
  }

  static upgradeArmorAndSword() {
    const cost = 300;
    if (gameState.timar.akce < cost) {
      gameState.addNotification(`Demircide teçhizat biletmek için ${cost} Akçe gerekir!`, 'alert');
      return false;
    }

    gameState.timar.akce -= cost;
    gameState.sipahi.swordLevel += 1;
    gameState.sipahi.maxHealth += 20;
    gameState.sipahi.health = gameState.sipahi.maxHealth;

    gameState.addNotification('🗡️ Demirci Rüstem Usta kılıcını biledi, zırhını pekiştirdi! (Sıhhat +20)', 'success');
    soundManager.playSwordClash();
    return true;
  }

  static breedWarHorse() {
    const cost = 500;
    if (gameState.timar.akce < cost) {
      gameState.addNotification(`Savaş atı yetiştirmek için ${cost} Akçe gerekir!`, 'alert');
      return false;
    }

    gameState.timar.akce -= cost;
    gameState.sipahi.horseType = 'Soylu Türkmen Savaş Atı';
    gameState.addNotification('🐎 Ahırda güçlü bir Türkmen savaş atı yetiştirildi! Sürat ve kudret arttı.', 'success');
    soundManager.playHorseHoof();
    return true;
  }
}
