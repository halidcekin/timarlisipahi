import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';
import { campaignBattleSystem } from './CampaignBattleSystem.js';

/**
 * HistoryEventSystem - Yıldırım Bayezid Devri Alternatif Tarih ve Sefer Simülatörü
 */
export class HistoryEventSystem {
  static getBattleSystem() {
    return campaignBattleSystem;
  }
  static joinActiveCampaign() {
    const campaign = gameState.activeCampaign;
    if (!campaign || campaign.isResolved) {
      gameState.addNotification('Şu anda aktif bir sefer fermanı bulunmuyor.', 'info');
      return null;
    }

    if (gameState.military.cebeluCount < campaign.reqCebelu) {
      gameState.addNotification(`⚠️ Sefere katılmak için en az ${campaign.reqCebelu} Cebelü teçhiz etmelisin!`, 'alert');
      return null;
    }

    soundManager.playWarDrum();

    // Sefer Türüne Göre Alternatif Tarih Sonuçları
    if (campaign.id === 'nigbolu_1396') {
      return this.simulateNigboluCampaign();
    } else if (campaign.id === 'karaman_1398') {
      return this.simulateKaramanCampaign();
    } else if (campaign.id === 'ankara_1402') {
      return this.simulateAnkaraCampaign();
    }

    return null;
  }

  static simulateNigboluCampaign() {
    gameState.activeCampaign.isResolved = true;
    const isBigVictory = gameState.military.cebeluCount >= 2 || Math.random() > 0.3;

    let result = {};
    if (isBigVictory) {
      const loot = 2200;
      gameState.timar.akce += loot;
      gameState.modifySancakReputation(35);
      gameState.modifySquadLoyalty(30);
      gameState.modifyReayaTrust(15);
      gameState.timar.annualIncome += 800; // Tımar genişletildi

      result = {
        title: '⚔️ Niğbolu Zafer-i Celîlesi!',
        subtitle: 'Haçlı Şövalyeleri Bozguna Uğratıldı! (M. 1396)',
        desc: `Sultan Yıldırım Bayezid Han'ın emriyle Tuna boyuna yetiştin! Senin cebelülerin ve Rumeli sipahileri, kibirli Fransız ve Macar şövalyelerini sahte ricat (Turan taktiği) ile pusuya düşürdü. Sultan seni bizzat huzuruna çağırıp gazanı tebrik etti ve tımar beratını genişletti.`,
        loot: [
          `💰 +${loot} Akçe Ganimet ve Bahşiş`,
          `📜 Tımar Yıllık Geliri +800 Akçe Arttırıldı (Büyük Tımar)`,
          `⚜️ Sancakbeyi ve Sultan İtibarı (+35)`,
          `🗡️ Şam Çeliği Murassa Kılıç Hediyesi`
        ]
      };
      soundManager.playVictoryJingle();
    } else {
      const loot = 900;
      gameState.timar.akce += loot;
      gameState.modifySancakReputation(15);
      gameState.modifySquadLoyalty(10);

      result = {
        title: '⚔️ Kanlı Niğbolu Meydanı',
        subtitle: 'Zafer Kazanıldı lakin Kayıplar Var',
        desc: `Haçlı zırhlıları karşısında çetin bir vuruşma yaşandı. Meydan Osmanlı ordusunun elinde kaldı, ancak cebelülerin yara aldı. Savaş sonrası yaralılarınla tımarına döndün.`,
        loot: [
          `💰 +${loot} Akçe Ganimet`,
          `⚜️ İtibar (+15)`
        ]
      };
    }

    return result;
  }

  static simulateKaramanCampaign() {
    gameState.activeCampaign.isResolved = true;
    const loot = 1800;
    gameState.timar.akce += loot;
    gameState.sipahi.reputation += 25;

    soundManager.playVictoryJingle();
    return {
      title: '⚔️ Konya ve Karaman Gazası',
      subtitle: 'Anadolu Türk Birliği Sağlandı (M. 1398)',
      desc: `Sultan Bayezid ile birlikte Konya ve Larende kaleleri fethedildi. Karamanoğlu beyleri itaat altına alındı. Tımarlı sipahiler Anadolu'da nizamı sağladı.`,
      loot: [
        `💰 +${loot} Akçe Sefer Bahşişi`,
        `🐎 1 Adet Soylu Türkmen Kısrağı`,
        `⚜️ Sancakbeyi Takdirnamesi`
      ]
    };
  }

  static simulateAnkaraCampaign() {
    gameState.activeCampaign.isResolved = true;
    // Alternatif Tarih Kararı Simülasyonu
    const loot = 3500;
    gameState.timar.akce += loot;
    gameState.sipahi.reputation += 50;

    soundManager.playVictoryJingle();
    return {
      title: '🌟 1402 Ankara Savaşı: TARİH YENİDEN YAZILDI!',
      subtitle: 'Çubuk Ovasında Timur Püskürtüldü! (Alternatif Tarih)',
      desc: `Senin önceden ulaştırdığın istihbarat ve tımarlı sipahilerin su kaynaklarını tutması sayesinde Timur'un fillerinin hücumu ormanlık vadide kırıldı! Kara Tatarların saf değiştirmesi engellendi. Sultan Yıldırım Bayezid Han meydandan muzaffer çıktı! Osmanlı Devleti Fetret Devri'ne girmeden İstanbul'un fethine doğru dev bir adım attı.`,
      loot: [
        `👑 Sultan Bayezid Beratı: Tımarın ZEAMET Beyliğine Yükseltildi!`,
        `💰 +${loot} Akçe Hazine İhsanı`,
        `🛡️ Gazi-i Ekber Unvanı`
      ]
    };
  }
}
