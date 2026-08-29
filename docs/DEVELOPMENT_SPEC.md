# Mülk-i Osmanî: Yeni Özellik Geliştirme Talimatnamesi

> **Bu doküman, aşağıdaki 5 özelliğin sıfırdan uygulanması için bir geliştiriciye teslim edilecek teknik talimattır.**  
> Mevcut kod tabanı Three.js (WebGL) + Vite üzerine kuruludur. Tüm kaynak `src/` altındadır.  
> Oyunun çalışan son hali: `npm run dev` → `http://localhost:5173`

---

## 📁 Mevcut Dosya Haritası (Başlamadan Önce Oku)

| Dosya | Sorumluluk | Satır |
|---|---|---|
| [`src/main.js`](file:///c:/antigravity/yeni3d/src/main.js) | Oyun döngüsü, tüm sistemlerin bağlandığı ana orkestratör | ~306 |
| [`src/core/Engine.js`](file:///c:/antigravity/yeni3d/src/core/Engine.js) | Render motoru, post-processing, ışıklandırma | ~413 |
| [`src/core/InputManager.js`](file:///c:/antigravity/yeni3d/src/core/InputManager.js) | Klavye/fare event yakalayıcı. Callback tabanlı (ör: `onAttack`, `onInteract`) | ~112 |
| [`src/core/GameState.js`](file:///c:/antigravity/yeni3d/src/core/GameState.js) | Merkezi oyun durumu. `sipahi`, `timar`, `military`, `time` objeleri | ~207 |
| [`src/entities/Player.js`](file:///c:/antigravity/yeni3d/src/entities/Player.js) | Oyuncu hareketi, kamera, kılıç animasyonu, at binme | ~391 |
| [`src/entities/NPCManager.js`](file:///c:/antigravity/yeni3d/src/entities/NPCManager.js) | NPC oluşturma, köylü AI bağlama, düşman spawn | ~443 |
| [`src/entities/VillagerAI.js`](file:///c:/antigravity/yeni3d/src/entities/VillagerAI.js) | 24 saatlik köylü yaşam döngüsü state machine | ~200+ |
| [`src/entities/ModelBuilder.js`](file:///c:/antigravity/yeni3d/src/entities/ModelBuilder.js) | Tüm 3D modeller (insan, bina, silah, hayvan) prosedürel üretim | ~1597 |
| [`src/entities/TownGenerator.js`](file:///c:/antigravity/yeni3d/src/entities/TownGenerator.js) | Köy haritası, binalar, collider'lar, hayvanlar | ~689 |
| [`src/systems/CombatSystem.js`](file:///c:/antigravity/yeni3d/src/systems/CombatSystem.js) | Kılıç vuruş algılama, kan/toz parçacıkları, düşman ölümü | ~251 |
| [`src/systems/QuestSystem.js`](file:///c:/antigravity/yeni3d/src/systems/QuestSystem.js) | 11 bölümlük görev zinciri | ~415 |
| [`src/systems/DialogueSystem.js`](file:///c:/antigravity/yeni3d/src/systems/DialogueSystem.js) | NPC diyalog replikleri ve seçenekler | ~440 |
| [`src/ui/UIManager.js`](file:///c:/antigravity/yeni3d/src/ui/UIManager.js) | HUD, diyalog penceresi, modal yönetimi | ~500+ |
| [`src/core/ParticleSystem.js`](file:///c:/antigravity/yeni3d/src/core/ParticleSystem.js) | Duman, kıvılcım, köz, atmosferik toz | ~339 |

---

## ÖZELLİK 1: OSMANLI HAMAMI & TELLAK SİSTEMİ

### 1.1 Amaç
Köye otantik bir Osmanlı Hamamı binası eklenecektir. Hamamın içinde sıcak su buharı dumanı, ortada büyük sekizgen mermer bir **Göbek Taşı**, duvar kenarlarında **Mermer Kurnalar**, kurnalarda su döken ve göbek taşında terleyen peştemalli müşteriler ve Tellak Hüseyin Ağa yer alacaktır.
> ⚠️ **ÖNEMLİ KURAL:** Oyuncu tellakla salt konuştuğunda değil; diyalog menüsünden **"Kese ve Köpük Yaptır"** hizmetini satın alıp kese-köpük ritüeli tamamlandığında sıhhat (can) ve kuvveti (stamina) tamamen yenilenecektir.

### 1.2 Harita Yerleşimi
[`TownGenerator.js`](file:///c:/antigravity/yeni3d/src/entities/TownGenerator.js) dosyasında `generateTown()` metodu içine `this.buildHamam();` çağrısı eklenecektir.

**Konum:** `x: 32, z: 26` (Köy hanının kuzeydoğusu, mescid avlusunun doğusu).

---

### 1.3 Hamam Mimarisi & İç Detayları (`TownGenerator.js` → `buildHamam()`)
Aşağıdaki mimari bileşenler Three.js mesh'leri ile prosedürel olarak inşa edilecektir:

| Eleman | Geometri & Detay | Materyal | Pozisyon / Açıklama |
|---|---|---|---|
| **Ana Kubbe (Sıcaklık)** | `SphereGeometry(7, 24, 16, 0, Math.PI*2, 0, Math.PI/2)` cam gözlü (filgözü pencereli) kubbe | Kurşun/Mavi Tonlu Kubbe Materyali | `(32, 4.5, 26)` |
| **Hamam Duvarları** | `BoxGeometry(16, 5, 14)` içi girilebilir açık kapılı taş yapı | Taş Duvar Materyali | `(32, 2.5, 26)` |
| **Mermer Göbek Taşı** | `CylinderGeometry(2.8, 3.0, 0.6, 8)` (Sekizgen geniş beyaz mermer taş) | Cilalı Beyaz Mermer (`0xf0f0f5`, roughness: 0.2, metalness: 0.1) | `(32, 0.3, 26)` (Tam merkezde) |
| **Mermer Kurnalar (4 Adet)** | `BoxGeometry(0.8, 0.7, 0.8)` içi oyuk görünümlü kurna + pirinç musluk | Beyaz Mermer + Pirinç Musluk (`0xd4af37`) | 4 duvarda (Kuzey, Güney, Doğu, Batı duvar dipleri) |
| **Pirinç Hamam Tasları** | `CylinderGeometry(0.18, 0.12, 0.08, 12)` | Parlak Sarı Pirinç (`0xcca010`) | Kurnaların kenarında durur |
| **Sıcak Su Buharı / Duman** | `ParticleSystem` üzerinden hafif yukarı yükselen şeffaf beyaz buhar | Buhar Parçacığı (`opacity: 0.25`, beyaz) | Göbek taşı ve kurnaların üzerinden sürekli tüter |
| **Fener & Işıklandırma** | `PointLight(0xffb066, 1.8, 14)` | Sıcak kehribar hamam ışığı | Kubbenin tam altından ortalığı loş ve sıcak aydınlatır |

> **Collider:** `this.addCollider(32, 26, 16, 14)` (Giriş kapısı hariç dış duvarlara çarpışma kutusu).

---

### 1.4 Tellak & Peştemalli Müşteriler (`NPCManager.js` & `ModelBuilder.js`)
`ModelBuilder.js` dosyasına `createPestemalMan(skinTone, pestemalColor)` metodu eklenecektir:
- Üst gövde çıplak (cilt rengi), belde kırmızı-beyaz veya mavi ekose peştemal silindiri/kutusu, ayaklar çıplak/takunyalı (`takunya`).

**Eklenecek Karakterler:**
1. **Tellak Hüseyin Ağa (`id: 'tellak'`):**
   - Elinde kese/lif modeli, başında beyaz takke, belinde peştemal.
   - Konum: `(32, 0, 24.5)` (Göbek taşının hemen yanında bekler).
2. **Göbek Taşında Yatan Müşteri (`id: 'hamam_reaya_1'`):**
   - Göbek taşı üzerinde uzanmış (`rotation.z = Math.PI/2`), dinlenen peştemalli köylü.
3. **Kurna Başında Yıkanan Müşteri (`id: 'hamam_reaya_2'`):**
   - Kurna başında çömelmiş, hamam tasıyla yıkanma animasyonu yapan köylü.

---

### 1.5 Kese & Köpük Mekaniği ve İyileşme (`DialogueSystem.js`)
Tellak Hüseyin Ağa ile `[E]` tuşuna basıldığında açılan diyalog akışı:

```text
[Tellak Hüseyin Ağa]: 
"Sefa getirdin Sipahi Beyim! Gazalardan, talimlerden yorgun düşmüşsün. 
Mermer göbek taşımız sıcacıktır. Şöyle bir uzan da kemiklerini çatırdatıp, 
mis kokulu sabun köpüğü ve ak pak kese ile seni yenileyelim! (Hizmet Bedeli: 40 Akçe)"

Seçenek A: "Buyur Ağa, hakkındır 40 Akçe. Şöyle esaslı bir kese köpük yap."
   ↳ ŞART: gameState.timar.akce >= 40 olmalı.
   ↳ EYLEM (Kese-Köpük İyileşme):
       1. gameState.timar.akce -= 40;
       2. gameState.sipahi.health = gameState.sipahi.maxHealth; // Can %100 fullenir
       3. gameState.sipahi.stamina = gameState.sipahi.maxStamina; // Kuvvet %100 fullenir
       4. soundManager.playWaterSplash(); (veya şifa sesi)
       5. UIManager ekranı 1 saniyeliğine beyaz/buharlı köpük efektiyle yumuşatır.
       6. Bildirim: "🧖 Tellak Hüseyin Ağa kese ve köpükle seni pirüpak eyledi! Sıhhat ve kuvvetin kemale erdi."
       7. gameState.lastBathDay = gameState.time.dayCount; // Son banyo günü kaydedilir.

Seçenek B: "Şimdilik kalsın Hüseyin Ağa, bir teftişe gelmiştim."
   ↳ Diyalog kapanır, hiçbir can artışı OLMAZ.
```

### 1.6 Sefer/Talim Sonrası Hamam Hatırlatması
[`main.js`](file:///c:/antigravity/yeni3d/src/main.js) döngüsünde veya [`UIManager.js`](file:///c:/antigravity/yeni3d/src/ui/UIManager.js) içinde:

```javascript
// Eğer can %60'ın altındaysa VE son hamam ziyaretinden 3+ gün geçtiyse:
if (gameState.sipahi.health < 60 && 
    (gameState.time.dayCount - (gameState.lastBathDay || 0)) > 3) {
  // HUD'da küçük bir ikon veya metin göster:
  "🧖 Yorgun düştün! Hamama git, kese köpük yaptır."
}
```

---

## ÖZELLİK 2: GERÇEK HASAR SİSTEMİ (KILIÇLA HER ŞEYE VUR, HASAR GÖZÜKSÜN)

### 2.1 Amaç
Kılıçla (veya herhangi bir silahla) NPC'lere, düşmanlara, hayvanlara ve hatta objelere (fıçı, saman balyası) vurulabilecek. Vurulan varlık:
- Görsel olarak hasar alacak (renk kızarması, sarsılma, eğilme)
- HP bar'ı görünecek
- Yeterli hasar alınca ölecek / kırılacak

### 2.2 Evrensel Hasar Arayüzü (`Damageable`)
Yeni bir yapı oluştur. Her vuruş alabilecek objeye bu yapıyı bağla:

```javascript
// Önerilen konum: src/systems/DamageSystem.js (YENİ DOSYA)
export class DamageableEntity {
  constructor(mesh, maxHealth, name, type = 'npc') {
    this.mesh = mesh;           // Three.js Mesh veya Group
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.name = name;
    this.type = type;           // 'npc', 'enemy', 'animal', 'object'
    this.isDead = false;
    this.damageFlashTimer = 0;  // Kırmızı parlama süresi
    this.originalColors = [];   // Orijinal materyal renkleri (flash sonrası geri dön)
  }
}
```

### 2.3 Görsel Hasar Geri Bildirimi
Vuruş anında şu efektler tetiklenecektir:

1. **Kırmızı Parlama (Damage Flash):** Vurulan mesh'in tüm materyallerinin `emissive` değerini 0.3 saniye boyunca `0xff0000` yap, sonra orijinaline döndür.
2. **Sarsılma Animasyonu:** Vurulan objenin `mesh.position` veya `mesh.rotation`'ına küçük bir titreşim uygula (0.2s boyunca sinüsoidal).
3. **HP Bar:** Vurulan objenin üstünde (Y + 2.5 birim) bir `Sprite` veya `Plane` ile kırmızı/yeşil çubuk göster. Hasar aldıkça yeşil kısalır.

### 2.4 Mevcut `CombatSystem.js` Değişiklikleri
[`CombatSystem.js`](file:///c:/antigravity/yeni3d/src/systems/CombatSystem.js) satır 96-164 arasındaki `processPlayerAttack()` genişletilecek:

- **Mevcut düşman vuruş:** Zaten çalışıyor (`enemy.health -= baseDamage`). Üzerine görsel flash eklenecek.
- **Köylü NPC vuruşu:** Köylülere de vurulabilmeli. Ama köylüye vurmanın **sonuçları** olmalı: `gameState.timar.asayis -= 15` ve `gameState.timar.morale -= 20`. Bildirim: `"⚠️ Reayaya el kaldırdın! Asayiş ve köylü morali düştü!"`
- **Hayvan vuruşu:** Koyun ve tavuklara da vurulabilmeli. Hayvanlar 2-3 vuruşta ölsün.
- **Obje vuruşu:** Fıçı (`barrel`), saman balyası (`hayBale`) gibi objelere kılıç geldiğinde toz parçacığı saçılsın ve 3-4 vuruşta parçalansın (sahne'den `remove` et).

### 2.5 Ölüm / Yıkım Animasyonu
- **NPC / Düşman ölümü:** Mevcut `killEnemy()` zaten `mesh.rotation.x = Math.PI/2` ile yere düşürüyor. Aynı mantığı köylülere de uygula (ama köylü ölümünde çok ağır asayiş cezası ver).
- **Hayvan ölümü:** Mesh'i 90° yatır, 3 saniye sonra sahneden kaldır.
- **Obje kırılması:** Mesh'i küçülterek (scale → 0) kaybet veya parçacık patlaması yap.

---

## ÖZELLİK 3: OK TALİMİ & OKÇULUK SİSTEMİ

### 3.1 Amaç
Kale avlusundaki talim alanına (mevcut konum: `x:175, z:-10`) bir okçuluk poligonu eklenecek. Oyuncu poligona girdiğinde yay ekranında görünecek, açı ve güç ayarlanarak ok fırlatılacak, hedef panosunda nereye isabet ettiği gösterilecek.

### 3.2 Talim Alanı Kurulumu (`TownGenerator.js`)
Mevcut kale talim alanına (x:175, z:-10) eklenecek:

| Eleman | Açıklama | Pozisyon |
|---|---|---|
| Hedef panosu (saman disk) | `CylinderGeometry(1.5, 1.5, 0.3, 16)` sarı-kırmızı halka doku | `(175, 1.5, -20)` – oyuncudan 10 birim ilerde |
| İç halka (göbek) | Kırmızı daire (radius 0.3) | Aynı pozisyon, z: -0.16 offset |
| Dış halka | Sarı daire (radius 0.8) | Aynı pozisyon, z: -0.16 offset |
| Yer çizgisi (atış hattı) | İnce bir dikdörtgen zemine | `(175, 0.02, -10)` – oyuncunun durduğu nokta |

### 3.3 Okçuluk Mekaniği (Yeni: `src/systems/ArcherySystem.js`)

#### Tetikleme
- Oyuncu talim alanına girdiğinde (mesafe < 3 birim) ve silah kuşanmamışken, HUD'da `"[R] Yay Çek"` prompt'u göster.
- `R` tuşuna basınca okçuluk moduna gir.

#### Nişan Alma
- Ekranın ortasında bir crosshair (nişangah) göster.
- **Sol tık basılı tut:** Güç çubuğu dolsun (0% → 100%, 2 saniyede). Çubuk HUD'da yay simgesiyle görünsün.
- **Fare hareketi:** Açıyı ayarla (pitch/yaw kamerayı etkiler, ok bu açıyla fırlatılır).

#### Ok Fırlatma
- **Sol tık bırak:** Ok fırlasın.
- Ok objesi: `CylinderGeometry(0.02, 0.02, 1.0)` (ince uzun çubuk) + uçta koni (`ConeGeometry(0.04, 0.1)`). Materyal: `wood`.
- Fizik: Parabolik yörünge. `velocity = kameraYönü × güçÇarpanı`. Her karede `velocity.y -= 9.8 × delta` (yerçekimi).
- Ok sahneye eklenir, uçarken `lookAt(velocity)` ile yönüne döner.

#### İsabet Algılama
- Ok pozisyonu hedef panosunun AABB kutusuna girerse → isabet.
- Mesafe hesapla: `hedefMerkez.distanceTo(okPozisyonu)`:
  - `< 0.3` → **Göbek İsabet!** `+20 Tecrübe` 🎯
  - `< 0.8` → **İç Halka!** `+10 Tecrübe`
  - `< 1.5` → **Dış Halka!** `+5 Tecrübe`
  - Kaçırırsa → `"Ok hedefe isabet etmedi."`
- İsabet eden ok, panonun yüzeyine saplanıp orada kalsın (parent'ı panoya bağla).
- `gameState.military.cebeluExperience += kazanılanTecrübe`

#### Çıkış
- `Escape` veya `R` ile okçuluk modundan çık, normal FPS moduna dön.

### 3.4 InputManager Değişiklikleri
[`InputManager.js`](file:///c:/antigravity/yeni3d/src/core/InputManager.js) dosyasına ekle:

```javascript
this.onToggleBow = null; // R Tuşu
// setupListeners() içinde:
if (e.code === 'KeyR') {
  if (this.onToggleBow) this.onToggleBow();
}
```

### 3.5 Yay 1. Şahıs Modeli (`ModelBuilder.js`)
`createFirstPersonBow()` metodu ekle. Basit bir yay:
- Yay gövdesi: `TorusGeometry(0.6, 0.02, 8, 16, Math.PI)` kahverengi
- Kiriş (ip): İki uç arasında ince `Line` (beyaz)
- Ekranda kılıçla aynı konumlandırma: `camera.add(bowRig)`

---

## ÖZELLİK 4: SİLAH KUŞANMA / BIRAKMA & HAREKET HIZI

### 4.1 Amaç
Oyuncu `Q` tuşuyla kılıcı kuşanır veya bırakır. Silah bırakıldığında daha hızlı hareket eder, silah kuşanıldığında normal hıza döner.

### 4.2 GameState Değişikliği
[`GameState.js`](file:///c:/antigravity/yeni3d/src/core/GameState.js) → `sipahi` objesine:

```javascript
swordDrawn: true,  // Zaten var! (satır 44)
// Bu flag'ı Q tuşuyla toggle edeceğiz
```

### 4.3 Player.js Değişiklikleri
[`Player.js`](file:///c:/antigravity/yeni3d/src/entities/Player.js) satır 26-28'deki hız sabitleri:

```javascript
// Mevcut:
this.walkSpeed = 6.5;
this.runSpeed = 11.5;

// Silahsız hız bonusu (%30 daha hızlı):
this.unarmedWalkSpeed = 8.5;
this.unarmedRunSpeed = 15.0;
```

`update()` metodu içinde (satır ~158):

```javascript
if (this.isRiding) {
  currentSpeed = this.horseSpeed;
} else if (!gameState.sipahi.swordDrawn) {
  // Silahsız → hızlı hareket
  currentSpeed = isRunning ? this.unarmedRunSpeed : this.unarmedWalkSpeed;
} else if (isRunning && gameState.sipahi.stamina > 5) {
  currentSpeed = this.runSpeed;
}
```

### 4.4 Silah Toggle Metodu (`Player.js`)

```javascript
toggleWeapon() {
  gameState.sipahi.swordDrawn = !gameState.sipahi.swordDrawn;
  this.weaponRig.visible = gameState.sipahi.swordDrawn;
  
  if (gameState.sipahi.swordDrawn) {
    gameState.addNotification('⚔️ Kılıcını kuşandın.', 'info');
  } else {
    gameState.addNotification('🏃 Kılıcını kınına soktun. Daha hızlı hareket ediyorsun.', 'info');
  }
}
```

### 4.5 InputManager & main.js Bağlantısı

**InputManager.js:**
```javascript
this.onToggleWeapon = null; // Q Tuşu
// setupListeners() → keydown:
if (e.code === 'KeyQ') {
  if (this.onToggleWeapon) this.onToggleWeapon();
}
```

**main.js → bindInputs():**
```javascript
this.input.onToggleWeapon = () => {
  this.player.toggleWeapon();
};
```

### 4.6 Saldırı Engelleme
`Player.js` → `triggerAttack()` metodunun en başına:

```javascript
if (!gameState.sipahi.swordDrawn) {
  gameState.addNotification('⚔️ Önce kılıcını kuşan! (Q)', 'alert');
  return false;
}
```

---

## ÖZELLİK 5: HİKAYE HATIRLATMA & YÖNLENDİRME SİSTEMİ

### 5.1 Amaç
Oyuncu hikayeden saparsa (uzun süre görev yapmadan dolaşırsa) ekranda nazik hatırlatmalar gösterilecek. Aktif görevin yönü ve mesafesi HUD'da sürekli gösterilecek.

### 5.2 Görev Pusulası (HUD Yön Göstergesi)
[`UIManager.js`](file:///c:/antigravity/yeni3d/src/ui/UIManager.js) `update()` metodu içinde:

```javascript
// Aktif görevin hedef pozisyonunu al
const activeQuest = questSystem.getActiveQuest();
if (activeQuest && activeQuest.targetPos) {
  const dir = new THREE.Vector3().subVectors(activeQuest.targetPos, playerPos);
  const distance = dir.length();
  const angle = Math.atan2(dir.x, dir.z) - playerYaw;
  
  // HUD'da göster:
  // "📍 Koca Yakub → 45m  ↗" (yön oku ve mesafe)
  questIndicator.textContent = `📍 ${activeQuest.targetName} → ${Math.round(distance)}m`;
  questIndicator.style.transform = `rotate(${angle}rad)`;
}
```

### 5.3 Zamana Dayalı Hatırlatmalar
`main.js` döngüsünde bir zamanlayıcı:

```javascript
// Her 120 saniyede bir kontrol et
this.questReminderTimer = (this.questReminderTimer || 0) + delta;
if (this.questReminderTimer > 120) {
  this.questReminderTimer = 0;
  
  const activeQuest = questSystem.getActiveQuest();
  if (activeQuest && activeQuest.status === 'active') {
    const dist = playerPos.distanceTo(activeQuest.targetPos);
    if (dist > 40) {
      // Oyuncu hedeften çok uzakta
      gameState.addNotification(
        `📜 Hatırlatma: "${activeQuest.shortTitle}" görevi bekliyor! ${activeQuest.targetName} ile görüşmelisin.`, 
        'info'
      );
    }
  }
}
```

### 5.4 Bağlamsal Hatırlatmalar
Belirli olaylardan sonra otomatik yönlendirme:

| Tetikleyici | Hatırlatma Metni |
|---|---|
| Düşman öldürüldükten sonra | `"⚔️ Savaş bitti. Yaralarını sarmak için Hamama git veya Attar Mehmet'ten merhem al."` |
| Talim mankeni 3+ kez vurulunca | `"🎯 Kılıç talimin iyi gidiyor! Şimdi Ok Poligonunu da dene."` |
| Gece olunca (saat 21+) ve görev varsa | `"🌙 Gece çöktü. Yarın erkenden görevine devam edebilirsin."` |
| Oyun başladığında (ilk 30 saniye) | `"📜 Kethüda Koca Yakub seni köy meydanında bekliyor. Tımar teftişine başla!"` |
| Can %30'un altına düşünce | `"💔 Ağır yaralısın! Hamama git veya Attar'dan merhem al."` |

### 5.5 QuestSystem Değişikliği
[`QuestSystem.js`](file:///c:/antigravity/yeni3d/src/systems/QuestSystem.js)'e yeni metot:

```javascript
getActiveQuest() {
  return this.quests.find(q => q.status === 'active') || null;
}
```

---

## 🔧 ENTEGRASYON KONTROL LİSTESİ

Tüm özellikler eklendikten sonra şunları kontrol et:

- [ ] `npm run build` hatasız derlenmelidir.
- [ ] Hamam binası haritada görünmeli, içinde kurnalar ve göbek taşı olmalı, tellakla `[E]` ile konuşulabilmeli.
- [ ] Kese-köpük satın alındığında can ve stamina dolmalı.
- [ ] Kılıçla köylüye vurunca kırmızı flash ve asayiş düşüşü olmalı.
- [ ] Kılıçla fıçıya/saman balyasına vurunca toz saçılmalı ve kırılmalı.
- [ ] Ok talim poligonunda `R` ile yay çekilmeli, sol tık basılı tutarak güç ayarlanmalı, bırakınca ok fırlamalı.
- [ ] Okun hedef panosuna isabet ettiği halka belli olmalı ve tecrübe kazanılmalı.
- [ ] `Q` ile silah kuşanma/bırakma çalışmalı, silahsızken hız artmalı.
- [ ] Silahsızken sol tık'a basınca "Önce kılıcını kuşan" uyarısı gelmeli.
- [ ] HUD'da aktif görevin yönü ve mesafesi görünmeli.
- [ ] 2 dakika görev yapmadan dolaşınca hatırlatma bildirimi gelmeli.
- [ ] Can düşükken hamam hatırlatması gelmeli.
- [ ] Tüm yeni tuşlar (`Q`, `R`) `InputManager.js`'e eklenmiş olmalı.

---

## 📌 ÖNCELİK SIRASI

Geliştirme şu sırayla yapılmalıdır (bağımlılıklar yüzünden):

1. **Silah Kuşanma/Bırakma** (En basit, diğer sistemlere temel oluşturur)
2. **Evrensel Hasar Sistemi** (Combat'ın genişletilmesi, ok taliminden önce gerekli)
3. **Ok Talimi & Okçuluk** (Hasar sistemine bağımlı)
4. **Osmanlı Hamamı** (Bağımsız, ama hikaye hatırlatmaları bu özelliği referans edecek)
5. **Hikaye Hatırlatma Sistemi** (En son, çünkü tüm diğer sistemleri referans eder)
