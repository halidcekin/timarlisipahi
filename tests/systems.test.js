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

import * as THREE from 'three';
import { gameState } from '../src/core/GameState.js';
import { ModelBuilder } from '../src/entities/ModelBuilder.js';
import { TownGenerator } from '../src/entities/TownGenerator.js';
import { Player } from '../src/entities/Player.js';
import { NPCManager } from '../src/entities/NPCManager.js';
import { CombatSystem } from '../src/systems/CombatSystem.js';
import { ArcherySystem } from '../src/systems/ArcherySystem.js';
import { DialogueSystem } from '../src/systems/DialogueSystem.js';

console.log('🧪 ==========================================');
console.log('🧪 MÜLK-İ OSMANÎ: SİSTEM TESTLERİ');
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

console.log('\n🧪 ==========================================');
console.log(`🧪 TEST SONUCU: ${passedTests}/${totalTests} TEST BAŞARIYLA TAMAMLANDI!`);
console.log('🧪 ==========================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
