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
import { trainingSystem } from '../src/systems/TrainingSystem.js';
import { supplySystem } from '../src/systems/SupplySystem.js';
import { campaignBattleSystem } from '../src/systems/CampaignBattleSystem.js';
import { evidenceSystem } from '../src/systems/EvidenceSystem.js';
import { BattlefieldScene } from '../src/entities/BattlefieldScene.js';
import { BattlefieldCinematics } from '../src/systems/BattlefieldCinematics.js';

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
// 24 saatlik döngü simülasyonu (8:00 + 6000 * 0.003 = 26:00 -> Gün döngüsü tamamlanır)
gameState.updateTime(6000);
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

// -------------------------------------------------------------
// TEST 13: TrainingSystem (Kalkan, Kılıç, Mızrak ve Bölük Komut Talimleri)
// -------------------------------------------------------------
assert(trainingSystem.startDrill('shield') === true, 'Kalkan talimi başlatıldı');
assert(trainingSystem.activeDrill === 'shield', 'Aktif talim shield olarak ayarlandı');

for (let i = 0; i < 5; i++) {
  trainingSystem.processShieldBlock(true); // 5 mükemmel blok
}
assert(trainingSystem.activeDrill === null, '5 blok sonrası kalkan talimi başarıyla tamamlandı');

assert(trainingSystem.startDrill('squad') === true, 'Cebelü bölük komut talimi başlatıldı');
trainingSystem.issueSquadOrder('FOLLOW');
trainingSystem.issueSquadOrder('HOLD');
trainingSystem.issueSquadOrder('CHARGE');
trainingSystem.issueSquadOrder('FALL_BACK');
assert(trainingSystem.currentSquadOrder === 'FALL_BACK', 'Son verilen bölük emri FALL_BACK olarak kaydedildi');
assert(trainingSystem.activeDrill === null, 'Bölük talimi tamamlandı ve sadakat puanı kazanıldı');

// -------------------------------------------------------------
// TEST 14: SupplySystem (Teçhizat Aşınması, Bakım, At Yemleme & Yoklama)
// -------------------------------------------------------------
assert(supplySystem.durability.sword === 100, 'Başlangıçta kılıç dayanıklılığı %100');
supplySystem.reduceDurability('sword', 30);
assert(supplySystem.durability.sword === 70, '30 puan aşınma sonrası kılıç dayanıklılığı %70');

gameState.timar.akce = 200;
assert(supplySystem.repairItem('sword', 30) === true, 'Demirci Rüstem Usta kılıcı 30 akçeye tamir etti');
assert(supplySystem.durability.sword === 100, 'Tamir sonrası kılıç dayanıklılığı tekrar %100 oldu');

gameState.timar.grain = 20;
assert(supplySystem.feedHorse() === true, 'At başarıyla yemlendi ve tımardan geçti');
assert(supplySystem.horse.stamina === 100, 'At staminası %100');

const inspectionResult = supplySystem.conductInspection();
assert(inspectionResult !== null, 'Sancak Kalesi askeri yoklama teftişi yapıldı');
assert(typeof inspectionResult.score === 'number', 'Yoklama puanı başarıyla hesaplandı');
assert(inspectionResult.grade.length > 0, 'Yoklama notu ve takdirname verildi');

// -------------------------------------------------------------
// TEST 15: CampaignBattleSystem (1396 Niğbolu Meydan Muharebesi 5 Safhası)
// -------------------------------------------------------------
const battleStart = campaignBattleSystem.startNicopolisBattle();
assert(campaignBattleSystem.isBattleActive === true, 'Niğbolu Meydan Muharebesi başladı');
assert(campaignBattleSystem.currentPhase === 1, '1. Safha: Öncü Temas aktif');

// 1. Safha: Kazık koridoruna taktik çekilme
campaignBattleSystem.executePhaseAction('tactical_retreat');
assert(campaignBattleSystem.currentPhase === 2, '2. Safha: Kazık Hattı & Okçu Barajına geçildi');

// 2. Safha: Zırh delici ok yaylımı
campaignBattleSystem.executePhaseAction('arrow_rain');
assert(campaignBattleSystem.currentPhase === 3, '3. Safha: Yaya Ağır Şövalye Çarpışmasına geçildi');

// 3. Safha: Gürz ile plaka zırhları ezme
campaignBattleSystem.executePhaseAction('use_mace');
assert(campaignBattleSystem.currentPhase === 4, '4. Safha: Macar Kralı Sigismund Ana Kuvvetine geçildi');

// 4. Safha: Sahte ricat pususu
campaignBattleSystem.executePhaseAction('feigned_retreat');
assert(campaignBattleSystem.currentPhase === 5, '5. Safha: İhtiyat & Sırp Vasal Karşı Hücumuna geçildi');

// 5. Safha: Nihai hücum ve zafer
const finalOutcome = campaignBattleSystem.executePhaseAction('final_charge');
assert(campaignBattleSystem.isBattleActive === false, '5 safha sonunda Niğbolu Muharebesi zaferle bitti');
assert(gameState.activeCampaign.isResolved === true, 'Niğbolu Seferi fermanı başarıyla sonuçlandırıldı');
assert(finalOutcome.lootAkce > 0, 'Zafer ganimeti ve padişah bahşişi kazanıldı');

// -------------------------------------------------------------
// TEST 16: Çok Katmanlı Dallanan Diyalog Ağaçları ve Soruşturma Testi
// -------------------------------------------------------------
// 1. Koca Yakub (Kethüda) Alt Diyalog Dalı
const yakubData = DialogueSystem.getDialogueData('kethuda_talk');
assert(yakubData !== null, 'Koca Yakub diyalog düğümü mevcut');
const yakubDefterBranch = yakubData.choices[0].action(); // Defter kayıtları dalı
assert(yakubDefterBranch !== null && yakubDefterBranch.choices.length >= 2, 'Koca Yakub defter ve öşür alt dallanması başarılı');

const yakubAffetChoice = yakubDefterBranch.choices[0]; // Yetimleri affetme kararı
const yakubSonuc = yakubAffetChoice.action();
assert(yakubSonuc !== null && yakubSonuc.text.includes('Hızır yoldaşın olsun'), 'Yakub Ağa adaletli kararı onayladı');

// 2. Molla Şemseddin (Kadı Naibi) Ferman ve Gazâ Fıkhı Dalı
const imamData = DialogueSystem.getDialogueData('imam_talk');
const imamFermanBranch = imamData.choices[2].action();
assert(imamFermanBranch !== null && imamFermanBranch.text.includes('Niğbolu Hisarı'), 'Molla Şemseddin Haçlı kuşatması havadisini aktardı');

// 3. Ahi Demirci Rüstem Usta - Gürz ve Zırh Delme Sırrı
const demirciData = DialogueSystem.getDialogueData('demirci_talk');
const demirciGürzBranch = demirciData.choices[0].action();
assert(demirciGürzBranch.choices.length === 2, 'Demirci Rüstem Gürz vs Kılıç seçimi sundu');
const gurzAlChoice = demirciGürzBranch.choices[0].action();
assert(gameState.sipahi.equippedWeapon === 'mace', 'Sipahi ağır şövalyeler için Gürz kuşandı');

// 4. Hancı İdris - Casusluk Soruşturması ve Belge Ele Geçirme
const hanciData = DialogueSystem.getDialogueData('hanci_talk');
const hanciCasusBranch = hanciData.choices[0].action();
assert(hanciCasusBranch.text.includes('parşömene çizer') || hanciCasusBranch.text.includes('kroki'), 'Han casusunun parşömen haritası ele geçirildi');

// 5. Koca Dede - 1389 Kosova Gazâ Vasiyeti
const dedeData = DialogueSystem.getDialogueData('dede_talk');
const dedeKosovaBranch = dedeData.choices[0].action();
assert(dedeKosovaBranch.text.includes('Kosova') && dedeKosovaBranch.text.includes('Murad Han'), 'Koca Dede 1389 Kosova gazâ vasiyetini aktardı');

// -------------------------------------------------------------
// TEST 17: Cebelü Ali Kopan Bacak & Taşlanma Fail-State Testi
// -------------------------------------------------------------
gameState.aliStatus.legSevered = true;
gameState.aliStatus.isSaved = false;
gameState.aliStatus.isDead = false;
gameState.aliStatus.daysRemaining = 1;
gameState.failState = { isGameOver: false };

// 1 gün daha geçsin -> Ali vefat eder ve taşlanma linci tetiklenir
gameState.updateTime(8000);
assert(gameState.aliStatus.isDead === true, 'Gazi Ali ihmal nedeniyle vefat etti');
assert(gameState.failState.isGameOver === true, 'Taşlanma linci Game Over tetiklendi');
assert(gameState.failState.reason === 'stoning_linch', 'Fail-state sebebi stoning_linch olarak kaydedildi');

// Ali'yi kurtarma akışını test et
gameState.aliStatus.isDead = false;
gameState.aliStatus.isSaved = false;
gameState.aliStatus.legSevered = true;
gameState.failState.isGameOver = false;

const attarData = DialogueSystem.getDialogueData('attar_talk');
const kantaronChoice = attarData.choices[0]; // Dağlama yağı seçeneği
gameState.timar.akce = 100;
kantaronChoice.action();

const demirciDataAli = DialogueSystem.getDialogueData('demirci_talk');
const koltukDegnegiChoice = demirciDataAli.choices[1]; // Koltuk değneği seçeneği
koltukDegnegiChoice.action();

const imamDataAli = DialogueSystem.getDialogueData('imam_talk');
const aliKurtarChoice = imamDataAli.choices[0]; // Yarasını sarma ve ayağa kaldırma
const aliKurtarSonuc = aliKurtarChoice.action();
assert(gameState.aliStatus.isSaved === true, 'Gazi Cebelü Ali dualarla ve koltuk değneğiyle hayatta kaldı');
assert(aliKurtarSonuc.text.includes('Elhamdülillah'), 'Molla Şemseddin Ali\'nin kurtulduğunu müjdeledi');

// -------------------------------------------------------------
// TEST 18: 4 Kademeli Kılıç Animasyon ve Kombo Akışı
// -------------------------------------------------------------
player.comboStep = 0;
player.comboResetTimer = 2.0;
gameState.sipahi.stamina = 100;

player.isAttacking = false;
player.triggerAttack();
assert(player.comboStep === 1, '1. Darbe sonrası 2. Saldırı (Dik Savurma) hazırlandı');

gameState.sipahi.stamina = 100;
player.isAttacking = false;
player.triggerAttack();
assert(player.comboStep === 2, '2. Darbe sonrası 3. Saldırı (Çapraz Güçlü Vuruş) hazırlandı');

gameState.sipahi.stamina = 100;
player.isAttacking = false;
player.triggerAttack();
assert(player.comboStep === 3, '3. Darbe sonrası 4. Saldırı (Dik Batırma/Saplama) hazırlandı');

gameState.sipahi.stamina = 100;
player.isAttacking = false;
player.triggerAttack();
assert(player.comboStep === 0, '4. Darbe sonrası 1. Saldırıya (Yan Savurma) başa dönüldü');

// -------------------------------------------------------------
// TEST 19: Güçlendirilmiş Harami Çetesi Özellikleri
// -------------------------------------------------------------
const toughBandits = npcManager.enemies.filter(e => e.id.startsWith('bandit_'));
assert(toughBandits.length === 3, '3 adet harami düşman mevcut');
const bossBandit = toughBandits.find(b => b.id === 'bandit_2');
assert(bossBandit.maxHealth >= 200, 'Harami Elebaşı Kılçık Cafer canı en az 200 (Güçlendirildi)');
assert(bossBandit.attackDamage >= 25, 'Harami Elebaşı saldırı gücü en az 25');

// -------------------------------------------------------------
// TEST 20: Demirci Binası Açık Kapı & Collider Doğrulaması
// -------------------------------------------------------------
const solidBlacksmithBox = town.colliders.some(c => c.minX === -68 && c.maxX === -56 && c.minZ === 3 && c.maxZ === 13);
assert(!solidBlacksmithBox, 'Demirci atölyesi tek parça katı collider engeli kaldırıldı');
const blacksmithWalls = town.colliders.filter(c => Math.abs(c.minX - (-67.5)) < 1 || Math.abs(c.maxX - (-56.5)) < 1 || Math.abs(c.maxZ - (12.4)) < 1);
assert(blacksmithWalls.length >= 2, 'Demirci atölyesi duvarları ayrı ayrı korundu ve kapı girişi açıldı');

// -------------------------------------------------------------
// TEST 21: Niğbolu Şehitlik Fail-State Doğrulaması
// -------------------------------------------------------------
campaignBattleSystem.handlePlayerMartyrdom();
assert(gameState.failState.isGameOver === true, 'Şehitlik durumunda Game Over tetiklendi');
assert(gameState.failState.reason === 'martyrdom', 'Fail-state sebebi martyrdom olarak kaydedildi');
assert(gameState.failState.title.includes('ŞEHİT'), 'Şehadet başlığı doğru üretildi');

// -------------------------------------------------------------
// TEST 22: Gazi Sungur Bey Dönüş Trajedisi & Cinayet İftirası ile Asayiş Kilidi (%40)
// -------------------------------------------------------------
gameState.failState = { isGameOver: false };
campaignBattleSystem.startNicopolisBattle();
campaignBattleSystem.battleScore = 150;
const nigboluEndOutcome = campaignBattleSystem.concludeBattle();

assert(gameState.murderCase.hasSungurDied === true, 'Gazi Sungur Bey dönüş yolunda şehit düştü');
assert(gameState.murderCase.isAccused === true, 'Yabancı Dimitri cinayet iftirasında bulundu');
assert(gameState.murderCase.isAsayisLocked === true, 'Köy asayişi %40 seviyesine kilitlendi');

// Asayiş artırma denemesi (Kilitliyken engellenmeli)
gameState.modifyAsayis(30);
assert(gameState.reputation.asayis === 40, 'Asayiş kilitliyken %40 üzerine çıkarılamaz');

// -------------------------------------------------------------
// TEST 23: İpucusuz Dünya Dedektifliği & Kanıt Toplama Testi
// -------------------------------------------------------------
assert(!gameState.hasSufficientEvidence(), 'Başlangıçta yeterli delil yok');

// 1. Sungur Bey'in Atının Kesik Kolanını Bul (x: 14, z: -38)
const strapItem = evidenceSystem.collectNearbyEvidence(new THREE.Vector3(14, 0, -38));
assert(strapItem !== null && strapItem.key === 'severedStrap', 'Kesik eyer kolanı başarıyla bulundu ve envantere alındı');
assert(gameState.murderCase.evidence.severedStrap === true, 'Kesik kolan delili kaydedildi');

// 2. Köy Hanı Arkasındaki Frenk Casus Mektubunu Bul (x: -21, z: 32)
const letterItem = evidenceSystem.collectNearbyEvidence(new THREE.Vector3(-21, 0, 32));
assert(letterItem !== null && letterItem.key === 'spyLetter', 'Venedik dükası ve Haçlı casus mektubu başarıyla bulundu');
assert(gameState.murderCase.evidence.spyLetter === true, 'Casus mektubu delili kaydedildi');
assert(gameState.hasSufficientEvidence() === true, 'Beraat için yeterli temel deliller tamamlandı');

// -------------------------------------------------------------
// TEST 24: Şer'i Mahkeme & Kanıtsız İdam Fail-State Testi (trial_execution)
// -------------------------------------------------------------
gameState.murderCase.evidence.severedStrap = false;
gameState.murderCase.evidence.spyLetter = false;
gameState.failState = { isGameOver: false };

const courtTrialData = DialogueSystem.getDialogueData('court_trial_talk');
assert(courtTrialData !== null, 'Molla Şemseddin Şer\'i Mahkeme divanı mevcut');

const trialNoEvidenceChoice = courtTrialData.choices[1]; // Delil sunamama seçeneği
trialNoEvidenceChoice.action();
assert(gameState.failState.isGameOver === true, 'Kanıtsız yargılamada İdam Game Over tetiklendi');
assert(gameState.failState.reason === 'trial_execution', 'Fail-state sebebi trial_execution olarak kaydedildi');

// -------------------------------------------------------------
// TEST 25: Şer'i Mahkeme & Kanıtlı Beraat, Dimitri Tutuklanması & Asayiş Kilidi Kalkışı
// -------------------------------------------------------------
gameState.failState = { isGameOver: false };
gameState.murderCase.evidence.severedStrap = true;
gameState.murderCase.evidence.spyLetter = true;

const trialWithEvidenceChoice = courtTrialData.choices[0]; // Delilleri sunma seçeneği
const beraatOutcome = trialWithEvidenceChoice.action();
assert(gameState.murderCase.trialStatus === 'acquitted', 'Sipahi Murad Bey mahkemede beraat etti');
assert(gameState.murderCase.isAsayisLocked === false, 'Mahkeme sonrası Asayiş kilidi kalktı');
assert(gameState.murderCase.banditRaidsActive === true, 'Harami baskınları aktifleşti');
assert(beraatOutcome.text.includes('müfteri Frenk ajanı derhal zindana atıla'), 'Dimitri suçüstü yakalanıp zindana atıldı');

// Asayiş kilidi kalktığı için artık asayiş yükseltilebilir
gameState.modifyAsayis(45);
assert(gameState.reputation.asayis > 40, 'Asayiş kilidi kalktıktan sonra asayiş yükseltilebildi');

// -------------------------------------------------------------
// TEST 26: Saray Ulağı Havadisleri & 1402 Ankara Savaşı
// -------------------------------------------------------------
const messengerData = DialogueSystem.getDialogueData('messenger_talk');
assert(messengerData !== null, 'Saray Ferman Ulağı diyalogu mevcut');
const messengerNews = messengerData.choices[0].action();
assert(messengerNews.text.includes('SAVAŞ FİLLERİYLE'), 'Ulak Timur\'un zırhlı savaş fillerini haber verdi');

// -------------------------------------------------------------
// TEST 27: 1402 Ankara Savaşı & Timur'un Savaş Fili Altında Şehadet Testi
// -------------------------------------------------------------
campaignBattleSystem.startAnkaraBattle();
assert(campaignBattleSystem.currentBattleType === 'ankara', '1402 Ankara Meydan Muharebesi başladı');

// 1. 2. 3. safhalar geçilir
campaignBattleSystem.executePhaseAction('shield_circle');
campaignBattleSystem.executePhaseAction('hold_hill');
campaignBattleSystem.executePhaseAction('aim_eyes');

// 4. Safha: Savaş filine cansiperane hücum ve filin ayağı altında ezilme
gameState.failState = { isGameOver: false };
campaignBattleSystem.executePhaseAction('heroic_charge');
assert(gameState.failState.isGameOver === true, 'Fil ayağı altında ezilerek Şehadet Game Over tetiklendi');
assert(gameState.failState.reason === 'elephant_martyrdom', 'Fail-state sebebi elephant_martyrdom olarak kaydedildi');
assert(gameState.failState.title.includes('SAVAŞ FİLİ'), 'Fil şehadeti başlığı doğru üretildi');

// -------------------------------------------------------------
// TEST 28: Muharebe Mağlubiyeti & Yeniden Başlatma Testi
// -------------------------------------------------------------
campaignBattleSystem.handleBattleDefeat();
assert(gameState.failState.isGameOver === true, 'Muharebe mağlubiyeti Game Over tetiklendi');
assert(gameState.failState.reason === 'battle_defeat', 'Fail-state sebebi battle_defeat olarak kaydedildi');

// -------------------------------------------------------------
// TEST 29: 3D Harp Meydanı, Savaş Modelleri ve Işınlanma Sinematikleri Testi
// -------------------------------------------------------------
const mockScene = new THREE.Scene();
const battlefieldScene = new BattlefieldScene(mockScene);
assert(battlefieldScene !== null, '3D Harp Meydanı sahnesi oluşturuldu');
assert(battlefieldScene.stakes.length > 0, 'Kazık hattı savunma barikatları inşa edildi');
assert(battlefieldScene.ottomanUnits.length > 0, 'Osmanlı sipahi süvari birlikleri hazırlandı');
assert(battlefieldScene.crusaderUnits.length > 0, 'Haçlı ağır plaka şövalye birlikleri hazırlandı');
assert(battlefieldScene.warElephant !== null, 'Emir Timur\'un 3D Zırhlı Savaş Fili inşa edildi');

// Niğbolu ve Ankara mod geçiş testi
battlefieldScene.setMode('ankara');
assert(battlefieldScene.warElephant.parent.visible === true, 'Ankara modunda Savaş Fili ve Timur ordusu görünür oldu');
assert(battlefieldScene.crusaderGroup.visible === false, 'Ankara modunda Haçlı ordusu gizlendi');

battlefieldScene.setMode('nigbolu');
assert(battlefieldScene.crusaderGroup.visible === true, 'Niğbolu modunda Haçlı ordusu görünür oldu');

// Işınlanma sinematiği testi
const mockCamera = new THREE.PerspectiveCamera();
const mockPlayer = new Player(mockCamera, mockScene, []);
const battlefieldCinematics = new BattlefieldCinematics(mockScene, mockCamera, mockPlayer, battlefieldScene, null);

battlefieldCinematics.teleportToBattlefield('nigbolu');
assert(battlefieldCinematics.isInBattle === true, '3D Harp Meydanına geçiş yapıldı');
assert(mockPlayer.position.x === 400 && mockPlayer.position.z === 375, 'Oyuncu savaş meydanındaki Osmanlı sancağının önüne ışınlandı');

battlefieldCinematics.teleportBackToVillage();
assert(battlefieldCinematics.isInBattle === false, 'Savaş sonrası köye dönüldü');
assert(mockPlayer.position.x === 0 && mockPlayer.position.z === 12, 'Oyuncu başarıyla köydeki önceki konumuna geri ışınlandı');

console.log('\n🧪 ==========================================');
console.log(`🧪 TEST SONUCU: ${passedTests}/${totalTests} TEST BAŞARIYLA TAMAMLANDI!`);
console.log('🧪 ==========================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
