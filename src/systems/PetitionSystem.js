import { gameState } from '../core/GameState.js';
import { soundManager } from '../core/AudioManager.js';

/**
 * PetitionSystem - Köylülerin (Reaya) Sipahi'ye sunduğu Arzuhalleri (İnşaat, İzin) yönetir
 */
export class PetitionSystem {
  constructor() {
    this.timer = 0;
    this.eventInterval = 45; // 45 saniyede bir dilekçe kontrolü
    this.unansweredTimer = 0; // Cevapsız geçen süre
    this.messengerDispatched = false;
    
    this.activeConstructions = []; // { id, name, daysLeft, irgatCount, reward }

    this.petitionPool = [
      {
        id: 'build_mill',
        title: 'Su Değirmeni İnşası',
        desc: 'Dere boyundaki eski değirmen yıkıldı Beyim. Yenisini yaparsak yıllık hasılatımız ziyadesiyle artar.',
        costAkce: 400,
        costIrgat: 3,
        timeDays: 4,
        reward: { type: 'income', value: 800, text: '+800 Yıllık Hasılat' }
      },
      {
        id: 'fix_mosque',
        title: 'Köy Mescidinin Onarımı',
        desc: 'Şiddetli lodos mescidin çatısını uçurdu. Tez elden tamir edilsin ki ahali cemaatle saf tutabilsin.',
        costAkce: 250,
        costIrgat: 2,
        timeDays: 2,
        reward: { type: 'morale', value: 20, text: '+20 Hoşnutluk (Moral)' }
      },
      {
        id: 'new_farmland',
        title: 'Yeni Buğday Tarlası Açmak',
        desc: 'Nüfusumuz artıyor Sipahi Beyim. Orman sınırındaki çalılıkları temizleyip tarla açmak için izninizi ve desteğinizi isteriz.',
        costAkce: 150,
        costIrgat: 4,
        timeDays: 5,
        reward: { type: 'income', value: 450, text: '+450 Yıllık Hasılat' }
      },
      {
        id: 'water_well',
        title: 'Köy Meydanına Kuyu Kazılması',
        desc: 'Yaz kurak geçti, kadınlarımız suya hasret kaldı. Meydana derin bir kuyu vurdurursak asayişimiz ferahlar.',
        costAkce: 100,
        costIrgat: 1,
        timeDays: 1,
        reward: { type: 'asayis', value: 15, text: '+15 Asayiş' }
      }
    ];
  }

  update(delta) {
    this.timer += delta;

    // Her 45 saniyede bir yeni arzuhal üretme şansı (Eğer bekleyen arzuhal yoksa)
    if (this.timer > this.eventInterval) {
      this.timer = 0;
      
      // Oyunda gün atlaması (1 gün = 45 saniye simülasyonu)
      gameState.daysPassed += 1;
      this.processConstructions();

      if (!gameState.currentPetition) {
        // %40 ihtimalle yeni bir dilekçe gelir
        if (Math.random() < 0.4) {
          this.generatePetition();
        }
      }
    }

    // Cevapsız kalan arzuhal takibi (60 saniye sonra köylü koşarak gelir)
    if (gameState.currentPetition) {
      this.unansweredTimer += delta;
      if (this.unansweredTimer >= 60 && !this.messengerDispatched) {
        this.messengerDispatched = true;
        gameState.hasPendingMessenger = true;
        try { soundManager.playNotification(); } catch (e) {}
        gameState.addNotification('🏃 Bir köylü nefes nefese sana doğru koşuyor: "Beyim, arzuhalimiz bekler!"', 'alert');
      }
    } else {
      this.unansweredTimer = 0;
      this.messengerDispatched = false;
      gameState.hasPendingMessenger = false;
    }
  }

  generatePetition() {
    // Havuzdan rastgele bir dilekçe seç
    const randIndex = Math.floor(Math.random() * this.petitionPool.length);
    const selected = this.petitionPool[randIndex];

    gameState.currentPetition = {
      ...selected
    };

    try { soundManager.playNotification(); } catch (e) {}
    gameState.addNotification('📜 Kethüda\'ya yeni bir Arzuhal (Dilekçe) geldi. TAB (Tımar Defteri) menüsünden incele.', 'alert');
  }

  processConstructions() {
    // Gün geçtikçe inşaatların süresini düşür
    for (let i = this.activeConstructions.length - 1; i >= 0; i--) {
      const cons = this.activeConstructions[i];
      cons.daysLeft -= 1;

      if (cons.daysLeft <= 0) {
        // İnşaat bitti! Ödülü ver ve ırgatları geri al
        gameState.timar.irgatCount += cons.irgatCount;

        if (cons.reward.type === 'income') {
          gameState.timar.annualIncome += cons.reward.value;
        } else if (cons.reward.type === 'morale') {
          gameState.timar.morale = Math.min(100, gameState.timar.morale + cons.reward.value);
        } else if (cons.reward.type === 'asayis') {
          gameState.timar.asayis = Math.min(100, gameState.timar.asayis + cons.reward.value);
        }

        try { soundManager.playVictoryJingle(); } catch (e) {}
        gameState.addNotification(`✅ İNŞAAT TAMAMLANDI: ${cons.name}. İrfan eden ameleler boşa çıktı.`, 'success');
        
        this.activeConstructions.splice(i, 1);
      }
    }
  }

  acceptPetition() {
    const p = gameState.currentPetition;
    if (!p) return false;

    if (gameState.timar.akce < p.costAkce) {
      gameState.addNotification(`❌ Yeterli Akçen yok! (Gereken: ${p.costAkce})`, 'alert');
      return false;
    }

    if (gameState.timar.irgatCount < p.costIrgat) {
      gameState.addNotification(`❌ Köyde yeterli boş Irgat yok! (Gereken: ${p.costIrgat})`, 'alert');
      return false;
    }

    // Harcama yap
    gameState.timar.akce -= p.costAkce;
    gameState.timar.irgatCount -= p.costIrgat;

    // İnşaata başla
    this.activeConstructions.push({
      id: p.id,
      name: p.title,
      daysLeft: p.timeDays,
      irgatCount: p.costIrgat,
      reward: p.reward
    });

    gameState.currentPetition = null;
    try { soundManager.playCoinJingle(); } catch (e) {}
    gameState.addNotification(`🔨 İNŞAAT BAŞLADI: ${p.title} (${p.timeDays} Gün sürecek)`, 'success');
    return true;
  }

  rejectPetition() {
    if (!gameState.currentPetition) return;
    
    // Dilekçe reddedilirse moral/asayiş azıcık düşer
    gameState.timar.morale = Math.max(0, gameState.timar.morale - 5);
    gameState.currentPetition = null;
    gameState.addNotification(`📜 Arzuhali reddettin. Ahali biraz gücendi.`, 'alert');
  }
}

export const petitionSystem = new PetitionSystem();
