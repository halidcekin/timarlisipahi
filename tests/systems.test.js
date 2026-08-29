// Node.js mock ortamı
if (typeof document === 'undefined') {
  const noop = () => {};
  const mockCtx = new Proxy({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  }, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => ({ addColorStop: noop });
      }
      if (prop === 'getImageData') {
        return () => ({ data: new Uint8ClampedArray(4) });
      }
      return noop;
    }
  });

  global.document = {
    createElement: () => ({
      width: 512,
      height: 512,
      getContext: () => mockCtx
    })
  };
  global.window = {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: () => {}
  };
}

// LocalStorage Mock
if (typeof localStorage === 'undefined') {
  const storage = {};
  global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };
}

import * as THREE from 'three';
import { gameState } from '../src/core/GameState.js';
import { ModelBuilder } from '../src/entities/ModelBuilder.js';
import { TownGenerator } from '../src/entities/TownGenerator.js';
import { Player } from '../src/entities/Player.js';
import { NPCManager } from '../src/entities/NPCManager.js';
import { CombatSystem } from '../src/systems/CombatSystem.js';
import { ArcherySystem } from '../src/systems/ArcherySystem.js';
import { DialogueSystem } from '../src/systems/DialogueSystem.js';
import { questSystem } from '../src/systems/QuestSystem.js';
import { saveManager } from '../src/core/SaveManager.js';

console.log('🧪 ==========================================');
console.log('🧪 MÜLK-İ OSMANÎ: SİSTEMİK TEST SÜİTİ');
console.log('🧪 ==========================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✅ [BAŞARILI] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [BAŞARISIZ] ${testName}`);
  }
}

// -------------------------------------------------------------
// TEST 1: TownGenerator & Hamam & Hedef Tahtası & Kırılabilir Objeler
// -------------------------------------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const town = new TownGenerator(scene);
const townData = town.generateTown();

assert(townData.colliders.length > 0, 'Harita collider listesi oluşturuldu');
assert(town.damageables.length > 0, 'Kırılabilir nesneler ve hayvanlar damageables listesine eklendi');
assert(town.archeryTargets.length > 0, 'Kale okçuluk talim hedef tahtası başarıyla yerleştirildi');

const hasHamamColliders = town.colliders.some(c => c.minX >= 22 && c.maxX <= 42 && c.minZ >= 18 && c.maxZ <= 36);
assert(hasHamamColliders, 'Osmanlı Hamamı bina colliderları haritada mevcut');

// -------------------------------------------------------------
// TEST 2: Player Silah Kuşanma (Q) ve Hız Bonusu
// -------------------------------------------------------------
const player = new Player(camera, scene, town.colliders);
assert(gameState.sipahi.swordDrawn === true, 'Başlangıçta kılıç kınından çekilmiş durumda');

player.toggleWeapon();
assert(gameState.sipahi.swordDrawn === false, 'Q tuşuyla kılıç kınına sokuldu');
assert(player.triggerAttack() === false, 'Kılıç kınındayken saldırı engellendi');

player.toggleWeapon();
assert(gameState.sipahi.swordDrawn === true, 'Q tuşuyla kılıç tekrar kuşandı');

// -------------------------------------------------------------
// TEST 3: Tellak Hüseyin Ağa ve Kese-Köpük İyileşme Diyaloğu
// -------------------------------------------------------------
gameState.sipahi.health = 25;
gameState.sipahi.stamina = 10;
gameState.timar.akce = 100;

const tellakDialogue = DialogueSystem.getDialogueData('tellak_talk');
assert(tellakDialogue !== null, 'Tellak Hüseyin Ağa diyalog düğümü mevcut');

const buyKeseChoice = tellakDialogue.choices[0];
buyKeseChoice.action();

assert(gameState.sipahi.health === gameState.sipahi.maxHealth, 'Kese-köpük sonrası Can %100 doldu');
assert(gameState.sipahi.stamina === gameState.sipahi.maxStamina, 'Kese-köpük sonrası Kuvvet %100 doldu');
assert(gameState.timar.akce === 60, '40 Akçe tellak ücreti düşüldü (Kalan: 60 Akçe)');
assert(gameState.lastBathDay === gameState.time.dayCount, 'Son banyo günü başarıyla kaydedildi');

// -------------------------------------------------------------
// TEST 4: Evrensel Hasar Sistemi (Fıçı Kırma & Hayvan Hasarı)
// -------------------------------------------------------------
const npcManager = new NPCManager(scene);
npcManager.initNPCs();
const combat = new CombatSystem(player, npcManager, town);

const sampleBarrel = town.damageables.find(d => d.type === 'object');
assert(sampleBarrel !== undefined, 'Örnek ahşap fıçı bulundu');

player.position.set(sampleBarrel.mesh.position.x, sampleBarrel.mesh.position.y + 1.8, sampleBarrel.mesh.position.z + 1.5);
player.yaw = 0;
const initialHealth = sampleBarrel.health;

combat.processPlayerAttack();
assert(sampleBarrel.health < initialHealth, 'Kılıç vuruşu ile ahşap fıçı hasar aldı');

// -------------------------------------------------------------
// TEST 5: Okçuluk Sistemi (ArcherySystem) & Hedef Tahtası İsabeti
// -------------------------------------------------------------
const archery = new ArcherySystem(scene, camera, player, town);
assert(archery.isBowMode === false, 'Başlangıçta yay modu pasif');

archery.toggleBowMode();
assert(archery.isBowMode === true, 'R tuşu ile yay moduna geçildi');
assert(gameState.sipahi.swordDrawn === false, 'Yay moduna geçince kılıç kınına sokuldu');

archery.isDrawing = true;
archery.drawProgress = 1.0;

camera.position.set(175, 1.6, -10);
camera.lookAt(175, 1.6, -22);

const initialXP = gameState.military.cebeluExperience || 0;
archery.releaseArrow();
assert(archery.activeArrows.length === 1, 'Ok başarıyla fırlatıldı ve havada hareket ediyor');

for (let step = 0; step < 20; step++) {
  archery.update(0.05, { mouse: { leftDown: false } });
}

assert(gameState.military.cebeluExperience > initialXP, 'Ok hedef tahtasına isabet etti ve tecrübe puanı kazanıldı');

// -------------------------------------------------------------
// TEST 6: Takvim & Zaman Akışı Otoritesi (1396 İlkbahar)
// -------------------------------------------------------------
assert(gameState.time.year === 1396, 'Oyun başlangıç yılı 1396 olarak ayarlandı');
assert(gameState.time.hijriYear === 798, 'Hicri yıl 798 olarak senkronize edildi');
assert(gameState.time.seasonIndex === 0, 'Başlangıç mevsimi İlkbahar');

const initialDay = gameState.time.dayCount;
// 24 saatlik döngü simülasyonu (8:00 + 400 * 0.05 = 28:00 -> Gün döngüsü tamamlanır)
gameState.updateTime(400);
assert(gameState.time.dayCount > initialDay, 'updateTime() çağrısı gün sayacını artırdı');

// -------------------------------------------------------------
// TEST 7: 3 Eksenli İtibar & Sosyal Fraksiyonlar
// -------------------------------------------------------------
assert(gameState.reputation.reayaTrust === 75, 'Reaya Güveni başlangıç değeri 75');
assert(gameState.reputation.sancakReputation === 60, 'Sancak İtibarı başlangıç değeri 60');
assert(gameState.reputation.squadLoyalty === 80, 'Bölük Sadakati başlangıç değeri 80');

gameState.modifyReayaTrust(-10);
assert(gameState.reputation.reayaTrust === 65, 'Reaya Güveni azaltma metodu çalıştı');

gameState.modifyFaction('ulema', 10);
assert(gameState.factions.ulema === 95, 'Kadı & Ulema fraksiyonu artırıldı (Bilge rehberler)');

// -------------------------------------------------------------
// TEST 8: Çiftbozan (Erken Fail-State) Mekaniği
// -------------------------------------------------------------
assert(gameState.failState.isGameOver === false, 'Başlangıçta oyun devam ediyor');
gameState.modifyReayaTrust(-55); // 65 - 55 = 10 (Kritik eşik 15 altı)
assert(gameState.failState.isGameOver === true, 'Reaya güveni 15 altına düşünce Çiftbozan tetiklendi');
assert(gameState.failState.title.includes('ÇİFTBOZAN'), 'Çiftbozan azil fermanı başlığı üretildi');

// Test sonrası oyunu sıfırla
gameState.reset();

// -------------------------------------------------------------
// TEST 9: Veri Güdümlü Görev Durum Makinesi & Hedef Bilgisi
// -------------------------------------------------------------
const firstQuest = questSystem.getActiveQuest();
assert(firstQuest !== null && firstQuest.id === 'quest_inspect', 'İlk aktif görev quest_inspect');

const targetInfo = questSystem.getActiveTargetInfo(player.position);
assert(targetInfo !== null, 'getActiveTargetInfo() başarıyla veri döndürdü');
assert(targetInfo.questId === 'quest_inspect', 'Hedef bilgisi aktif görev ile eşleşti');
assert(typeof targetInfo.distance === 'number', 'Hedef mesafesi sayı olarak hesaplandı');

// Bölüm 1'i tamamla ve Bölüm 2 Su İhtilafı kilidinin açılmasını test et
const waterQuestBefore = questSystem.getQuestById('quest_water_dispute');
assert(waterQuestBefore.status === 'locked', 'Başlangıçta Su İhtilafı görevi kilitli');

questSystem.advanceObjective('quest_inspect', 0);
questSystem.advanceObjective('quest_inspect', 1);

const inspectQuestAfter = questSystem.getQuestById('quest_inspect');
assert(inspectQuestAfter.status === 'completed', 'quest_inspect başarıyla tamamlandı');

const waterQuestAfter = questSystem.getQuestById('quest_water_dispute');
assert(waterQuestAfter.status === 'available' || waterQuestAfter.status === 'active', 'quest_inspect bitince quest_water_dispute kilidi açıldı');

// -------------------------------------------------------------
// TEST 10: Silah & Zırh Hasar Matrisi (CombatSystem.calculateDamage)
// -------------------------------------------------------------
const swordCloth = CombatSystem.calculateDamage(50, 'slashing', 'cloth');
const swordPlate = CombatSystem.calculateDamage(50, 'slashing', 'plate');
assert(swordCloth > 50, `Kılıç kumaşa karşı yüksek hasar verdi (${swordCloth} > 50)`);
assert(swordPlate < 50, `Kılıç ağır plaka zırha karşı düşük hasar verdi (${swordPlate} < 50)`);

const macePlate = CombatSystem.calculateDamage(50, 'blunt', 'plate');
const maceCloth = CombatSystem.calculateDamage(50, 'blunt', 'cloth');
assert(macePlate > swordPlate, `Gürz plaka zırhı kılıçtan çok daha etkili deldi (${macePlate} > ${swordPlate})`);
assert(maceCloth <= 50, `Gürz kumaşa karşı normal/künt hasar verdi (${maceCloth} <= 50)`);

const spearMounted = CombatSystem.calculateDamage(50, 'piercing', 'plate', true);
const spearFoot = CombatSystem.calculateDamage(50, 'piercing', 'plate', false);
assert(spearMounted > spearFoot, `Mızrak atlı hücumda %60 daha fazla hasar verdi (${spearMounted} > ${spearFoot})`);

// -------------------------------------------------------------
// TEST 11: SaveManager Serileştirme & Deserialization
// -------------------------------------------------------------
gameState.timar.akce = 4321;
gameState.sipahi.name = 'Test Gazi Murad';
saveManager.saveGame('slot_1');

// Durumu değiştir
gameState.timar.akce = 100;
gameState.sipahi.name = 'Başka Biri';

// Kayıttan geri yükle
saveManager.loadGame('slot_1');
assert(gameState.timar.akce === 4321, 'SaveManager akçe miktarını başarıyla geri yükledi (4321)');
assert(gameState.sipahi.name === 'Test Gazi Murad', 'SaveManager sipahi ismini başarıyla geri yükledi');

// -------------------------------------------------------------
// TEST 12: Harami Ölüm Olayı (onEnemyDefeated) & Görev Entegrasyonu
// -------------------------------------------------------------
const banditQuest = questSystem.getQuestById('quest_bandits');
banditQuest.status = 'active';
banditQuest.banditsDefeated = 0;

questSystem.onEnemyKilled({ id: 'bandit_1', name: 'Harami Çapulcu' });
assert(banditQuest.banditsDefeated === 1, 'Harami öldürülünce banditsDefeated sayacı arttı (1/3)');

questSystem.onEnemyKilled({ id: 'bandit_2', name: 'Harami Okçu' });
questSystem.onEnemyKilled({ id: 'bandit_3', name: 'Harami Elebaşı' });
assert(banditQuest.status === 'completed', 'Tüm haramiler alt edilince quest_bandits tamamlandı');

console.log('\n🧪 ==========================================');
console.log(`🧪 TEST SONUCU: ${passedTests}/${totalTests} TEST BAŞARIYLA TAMAMLANDI!`);
console.log('🧪 ==========================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
