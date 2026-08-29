import { gameState } from '../core/GameState.js';
import { TimarSystem } from './TimarSystem.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';

/**
 * DialogueSystem - 14. Yüzyıl Osmanlı Dönemi Çok Katmanlı Dallanan Dramatik Diyalog Ağacı
 * - Zengin karakter diyalogları, ahlaki ikilemler, tanık sorguları ve gazâ felsefesi
 */
export class DialogueSystem {
  static getDialogueData(dialogueId) {
    const data = {
      // =======================================================================
      // 1. KÖY KETHÜDASI KOCA YAKUB (Tımar İdaresi, Reaya Dertleri ve Borçlar)
      // =======================================================================
      kethuda_talk: {
        npcName: 'Köy Kethüdası Koca Yakub',
        npcRole: 'Akçaoba Tımar Reayası Temsilcisi (40 Yıllık Köy İhtiyarı)',
        icon: '👳‍♂️',
        text: `"Esselamü aleyküm ve rahmetullah Gazi Beyim! Hoş safa getirdin konağımıza. Yıllardır bu topraklarda nice sipahiler gördüm; kimi reayanın sırtına bindi, kimi adaletiyle köyümüzü gülzâr eyledi. Hamdolsun buğdaylar harmana çekildi, lakin köyün içinde çözülecek mühim ahval vardır. Nereden başlayalım beyim?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_inspect', 0);
        },
        choices: [
          {
            label: '📜 "Köyün defter kayıtlarını, yetimleri ve borçlu haneleri anlat Yakub Ağa."',
            action: () => ({
              text: `"Beyim, geçen kış sert geçti; iki hanenin öküzü kırıldı, Çiftçi Hasan'ın tarlası tohuma muhtaç kaldı. Öte yanda değirmenimiz tıkır tıkır işler. Öşür vergisini nasıl takdir edersin?"`,
              choices: [
                {
                  label: '⚖️ "Yetim ve muhtaç hanelerin öşrü affedilsin, diğerlerinden kanun üzere tahsil edilsin."',
                  action: () => {
                    TimarSystem.collectAnnualTax();
                    gameState.modifyReayaTrust(15);
                    gameState.modifyFaction('ulema', 10);
                    gameState.modifyFaction('reaya', 15);
                    questSystem.advanceObjective('quest_inspect', 1);
                    return {
                      text: `"Hızır yoldaşın olsun Gazi Beyim! Adaletin köylünün yüreğine su serpti. Reaya sana canla başla dua eder."`,
                      choices: [{ label: 'Hak ne ise o olsun Yakub Ağa. Sen defteri mühürle.', action: null }]
                    };
                  }
                },
                {
                  label: '🌾 "Tüm hasılatı deftere kaydet, kanuni öşür tam tahsil edilsin."',
                  action: () => {
                    TimarSystem.collectAnnualTax();
                    gameState.modifySancakReputation(10);
                    gameState.modifyReayaTrust(5);
                    questSystem.advanceObjective('quest_inspect', 1);
                    return {
                      text: `"Ferman sizindir beyim. Deftere harfiyen işlendi, ambarımız doldu. Padişahımızın hazinesi var olsun."`,
                      choices: [{ label: 'Bereketli olsun.', action: null }]
                    };
                  }
                }
              ]
            })
          },
          {
            label: '🍞 "Bu akşam köy meydanında koca bir kazan kurulsun, ahaliye ziyafet verilsin (-150 Akçe)."',
            action: () => {
              if (TimarSystem.feastVillagers()) {
                questSystem.advanceObjective('quest_inspect', 1);
                return {
                  text: `"Cömert beyim! Akçaoba ahalisi genciyle ihtiyarıyla meydanda toplanır. Birliğimiz ve dirliğimiz pekişti."`,
                  choices: [{ label: 'Afiyet olsun, cümlenize helal olsun.', action: null }]
                };
              }
              return null;
            }
          },
          {
            label: '🛡️ "Dağdaki haramilerden ve yol kesen çapulculardan ne haber vardır?"',
            action: () => ({
              text: `"Beyim, Kılçık Cafer namındaki harami güneybatı meşeliğinde pusu kurar. Kervanların tuzunu zahiresini yağmalar. Köylü dağa oduna çıkamaz oldu!"`,
              choices: [
                {
                  label: '⚔️ "Pusatımı kuşanıp ocağımı hazır edeyim, o çapulcuları bu topraktan sileceğim."',
                  action: () => {
                    questSystem.advanceObjective('quest_inspect', 1);
                    const banditQuest = questSystem.getQuestById('quest_bandits');
                    if (banditQuest && banditQuest.status === 'available') {
                      banditQuest.status = 'active';
                      questSystem.syncWithGameState();
                      gameState.addNotification('📜 Harami Avı Vazifesi Başlatıldı!', 'alert');
                    }
                    return {
                      text: `"Kılıcın keskin, bileğin bükülmez olsun beyim! Meşeliğe doğru dikkatle ilerleyin."`,
                      choices: [{ label: 'Allah yardımcımız olsun.', action: null }]
                    };
                  }
                }
              ]
            })
          },
          {
            label: 'Aleyküm selam Yakub Ağa, şimdilik vazifeme döneyim.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 2. KÖY İMAMI & KADI NAİBİ MOLLA ŞEMSEDDİN (Şer'i ve Örfi Hukuk, Gazâ Ahlakı)
      // =======================================================================
      imam_talk: {
        npcName: 'Molla Şemseddin (Kadı Naibi & İmam)',
        npcRole: 'Şer\'i Hukuk ve Adalet Temsilcisi (Bilge & Adil Alim)',
        icon: '🕌',
        text: `"Ve aleyküm selam ve rahmetullahi ve berekâtüh Gazi Murad Bey! Hoş geldin mescidimize. Bilesin ki kılıç fetihler açar, lakin o fethi ayakta tutan ancak adalettir. Sultanımız Yıldırım Bayezid Han dahi kadının hükmü önünde baş eğer. Ne danışmak istersin?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_imam', 0);
        },
        choices: [
          {
            label: '🩹 "Hocam, kantaron merhemini ve koltuk değneğini getirdim; hekimlerle Gazi Ali\'nin bacağını sarıp ayağa kaldıralım!"',
            action: () => {
              gameState.aliStatus.isSaved = true;
              gameState.modifySquadLoyalty(40);
              gameState.modifyReayaTrust(30);
              gameState.modifyFaction('ulema', 25);
              questSystem.advanceObjective('quest_save_ali_leg', 2);
              questSystem.completeQuest('quest_save_ali_leg');
              soundManager.playVictoryJingle();
              return {
                text: `"Elhamdülillah! Yarasını dağladık, temiz sargılarla sardık ve koltuk değneğini teslim ettik. Ali evladımız gözlerini açtı, sana canı pahasına dua eder! Reaya vefa ve merhametini ayakta alkışlar!"`,
                choices: [{ label: 'Çok şükür Ya Rabbi! Gazi yoldaşımız hayatta kaldı.', action: null }]
              };
            }
          },
          {
            label: '🤲 "Hocam, ordumuz, cebelülerimiz ve yaklaşan gazâlar için hayır dua ve nasihat eyle."',
            action: () => {
              gameState.modifySancakReputation(10);
              gameState.modifyFaction('ulema', 15);
              soundManager.playVictoryJingle();
              questSystem.advanceObjective('quest_imam', 1);
              return {
                text: `"Cenab-ı Hak seni ve askerlerini gazâ meydanında muzaffer kılsın! Bilesin ki gazâ kibir için değil, mazlumu zalimden korumak ve nizam-ı âlemi tesis etmek içindir. Haksız yere kan dökmekten, reayanın malına el uzatmaktan sakınasın."`,
                choices: [{ label: 'Âmin hocam. Bu nasihati başımın üstünde taşırım.', action: null }]
              };
            }
          },
          {
            label: '📜 "Rumeli\'den, Tuna boyundan ve Sultanımızın fermanından gelen son havadisler nelerdir?"',
            action: () => {
              questSystem.advanceObjective('quest_imam', 1);
              return {
                text: `"Ulaklar haber getirdi: Macar Kralı Sigismund, Fransız asilzadeleri ve Rodos şövalyelerinden yüz binlik bir Haçlı ordusu toplayıp Niğbolu Hisarı\'nı muhasara eylemiş. Sultan Bayezid Han Edirne\'den Tuna\'ya yıldırım gibi yürümektedir. Hazırlıklarını tam eyle beyim!"`,
                choices: [
                  {
                    label: '⚔️ "Günü geldiğinde Sultanımızın sancağı altında saf tutmaya hazırız."',
                    action: () => ({
                      text: `"Maaşallah! Gazânız şimdiden mübarek olsun. Rabbim seni korusun."`,
                      choices: [{ label: 'Sağ olasın hocam.', action: null }]
                    })
                  }
                ]
              };
            }
          },
          {
            label: '⚖️ "Köydeki ihtilafların şer\'i ve örfi halli hususunda görüşün nedir?"',
            action: () => ({
              text: `"Reayanın su ve sınır davalarında asla taraf tutmayasın. Müslim olsun zimmî olsun, hak kimin ise ona teslim edilsin. Bir haksızlık görürsen bana haber et, mahkeme defterine kaydedelim."`,
              choices: [{ label: 'Adaletinden feyiz aldım hocam.', action: null }]
            })
          },
          {
            label: 'Hayırlı günler dilerim hocam, duanızı eksik etmeyin.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 3. AHİ DEMİRCİ RÜSTEM USTA (Pusat, Zırh Sırları & Gürz Kullanımı)
      // =======================================================================
      demirci_talk: {
        npcName: 'Demirci Rüstem Usta (Ahi Piri)',
        npcRole: 'Ahi Teşkilatı Zırh ve Kılıç Ustası',
        icon: '⚒️',
        text: `"Sefa geldin Sipahi Beyim! Körük harlar, örs çınlar. Ahi Evran ocağından feyiz almışız; dövdüğümüz pusat düşmanın zırhını biçer, dostun canını siperler. Nasıl bir teçhizat istersin?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_blacksmith', 0);
        },
        choices: [
          {
            label: '🔨 "Duyduk ki Frenk şövalyeleri tepeden tırnağa kalın plaka zırh kuşanırmış. Kılıç işler mi onlara?"',
            action: () => ({
              text: `"Güzel sual ettin beyim! Frenklerin dökme çelik göğüslüğüne kılıç çalsan kayar gider, kılıcın ağzı kırılır. Onların ilacı ağır döküm 'Gürz' ve 'Savaş Çekici'dir! Bir darbede kaburgasını ezer, zırhın içinde nefesini kesersin."`,
              choices: [
                {
                  label: '⚔️ "Bana ve cebelülerime zırh delen bir Gürz donat Usta."',
                  action: () => {
                    gameState.sipahi.equippedWeapon = 'mace';
                    gameState.sipahi.weaponType = 'blunt';
                    gameState.modifyFaction('ahiler', 15);
                    questSystem.advanceObjective('quest_blacksmith', 1);
                    return {
                      text: `"Hayırlı olsun beyim! İşte som çelikten dövülmüş altı dilimli Osmanlı Gürzü. Plaka zırhlı şövalyenin başına indirdin mi feleğini şaşırtır."`,
                      choices: [{ label: 'Eline sağlık Rüstem Usta, pusatımız şereflendi.', action: null }]
                    };
                  }
                },
                {
                  label: '🗡️ "Ben yine de atadan kalma yalmanlı kılıcımdan şaşmam."',
                  action: () => {
                    gameState.sipahi.equippedWeapon = 'sword';
                    gameState.sipahi.weaponType = 'slashing';
                    questSystem.advanceObjective('quest_blacksmith', 1);
                    return {
                      text: `"Kılıcın pirdir beyim! Ağzını kıldan ince biledim, çeliğine yağda su verdim. Hafif piyadeye aman vermez."`,
                      choices: [{ label: 'Var ol usta.', action: null }]
                    };
                  }
                }
              ]
            })
          },
          {
            label: '🩼 "Gazi Cebelü Ali için sağlam gürgenden demir tabanlı bir koltuk değneği yap Rüstem Usta (-40 Akçe)."',
            action: () => {
              if (gameState.timar.akce < 40) {
                gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
                return null;
              }
              gameState.timar.akce -= 40;
              gameState.modifyFaction('ahiler', 15);
              questSystem.advanceObjective('quest_save_ali_leg', 1);
              return {
                text: `"Can feda Ali oğlumuza! Demir tabanlı, oymalı gürgen ağacından taş gibi bir koltuk değneği yaptım. Gazi kardeşimiz ayağa kalkacaktır!"`,
                choices: [{ label: 'Var ol Rüstem Usta!', action: null }]
              };
            }
          },
          {
            label: '🛡️ "Aşınan kılıç ve kalkanlarımızı tamir eyle (Maliyet: 30 Akçe)."',
            action: () => {
              if (gameState.timar.akce < 30) {
                gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
                return null;
              }
              gameState.timar.akce -= 30;
              gameState.sipahi.health = gameState.sipahi.maxHealth;
              gameState.modifyFaction('ahiler', 10);
              soundManager.playSwordClash();
              questSystem.advanceObjective('quest_blacksmith', 1);
              return {
                text: `"Pusatların çapakları alındı, kalkanın perçinleri sıkılandı. Gaza meydanında seni mahcup etmez."`,
                choices: [{ label: 'Eline sağlık usta.', action: null }]
              };
            }
          },
          {
            label: 'Kolay gelsin Rüstem Usta, ocağın daim tütsün.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 4. SADIK CEBELÜ ALİ (Savaş Heyecanı, Talim ve Sadakat)
      // =======================================================================
      cebelu_talk: {
        npcName: 'Toy Cebelü Ali',
        npcRole: 'Sipahinin Sadık Çırağı & Silahdarı',
        icon: '🛡️',
        text: `"Sipahi Beyim! Emrindeyim. Talimgâhta kalkan tuttum, kılıç savurdum. Lakin geceleri gözüme uyku girmez; Tuna boyundaki Haçlıların devasa zırhlarından, şövalyelerin mızrak hücumlarından bahsederler. Bana savaşı öğret beyim!"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_cebelu', 0);
        },
        choices: [
          {
            label: '🥋 "Korku tabidir Ali, lakin cesaret korkuya rağmen safı bozmamaktır. Gel kalkan talimi yapalım."',
            action: () => {
              gameState.military.cebeluExperience = (gameState.military.cebeluExperience || 0) + 25;
              gameState.modifySquadLoyalty(20);
              questSystem.advanceObjective('quest_cebelu', 1);
              return {
                text: `"Baş üstüne beyim! Darbeleri kalkanın kenarıyla saptırmayı, nefesimi tutmayı öğrendim. Yanında vuruşmaktan onur duyarım."`,
                choices: [
                  {
                    label: '🚩 "Sana bölük komutlarını öğreteceğim: Saf Tut, Hücum Et ve Düzenli Çekil."',
                    action: () => ({
                      text: `"Emirlerinize harfiyen uyacağım beyim. Sancak düşmedikçe Ali geri adım atmaz!"`,
                      choices: [{ label: 'Aferin Ali, gayretin daim olsun.', action: null }]
                    })
                  }
                ]
              };
            }
          },
          {
            label: '🏹 "At üstünde ok atmayı ve hızlanırken yay germeyi ihmal etme."',
            action: () => {
              gameState.military.cebeluExperience = (gameState.military.cebeluExperience || 0) + 15;
              gameState.modifySquadLoyalty(15);
              questSystem.advanceObjective('quest_cebelu', 1);
              return {
                text: `"Haklısın beyim, atlı okçuluk Türkün kadim sanatıdır. Hedef tahtasında temrenlerimi deneyeceğim."`,
                choices: [{ label: 'Çalışmaya devam et.', action: null }]
              };
            }
          },
          {
            label: 'Dinlen Ali, vakti gelince gazâ meydanında görüşeceğiz.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 5. KOCA DEDE (1389 I. Kosova Meydan Muharebesi Hatırası & Gazâ Vasiyeti)
      // =======================================================================
      dede_talk: {
        npcName: 'Koca Dede (90 Yaşında Gazi)',
        npcRole: '1389 I. Kosova Muharebesi Gazisi',
        icon: '👴',
        text: `"Gel oğul, otur şu ulu çınarın gölgesine... Yaşım doksanı aştı. Ben 1389\'da Kosova sahrasında Sultan Murad Hüdavendigâr\'ın ardında at sürdüm. O gün gök gürledi, yer sarsıldı. Şehitler verdik, lakin sancağı yere düşürmedik. Söyle bakalım genç sipahi, gazânın manasını bilir misin?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_dede_flag', 0);
        },
        choices: [
          {
            label: '📜 "Anlat Koca Dede, Kosova sahrasında ve Sultan Murad Han\'ın huzurunda neler gördün?"',
            action: () => {
              gameState.modifySancakReputation(20);
              gameState.modifySquadLoyalty(20);
              gameState.modifyReayaTrust(15);
              questSystem.advanceObjective('quest_dede_flag', 1);
              return {
                text: `"1389 Kosova sahrasında düşman safları demir duvar gibiydi. Murad Han gece secdede \'Ya Rabbi, beni bu millet yoluna şehit eyle\' diye niyaz etti. Zafer kazandık, sultanımız şehadet şerbetini içti. Oğul! Niğbolu\'da Bayezid Han\'ın ardında vuruşurken bunu hatırla: Gazâ ganimet için değil, milletin namusu ve mazlumun duası içindir!"`,
                choices: [
                  {
                    label: '🤲 "Bu gazâ vasiyetini kanımla koruyacağım Koca Dede, hayır duanı ver."',
                    action: () => ({
                      text: `"Cenab-ı Hak kılıcını keskin, atını berk, sancağını muzaffer eylesin evladım. Yolun açık, alnın ak olsun!"`,
                      choices: [{ label: 'Ellerinden öperim gazi dedem.', action: null }]
                    })
                  }
                ]
              };
            }
          },
          {
            label: 'Sağlığın ve duaların başımızın tacıdır gazi dedem.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 6. SU HAKKI VE DEĞİRMEN ARKI İHTİLAFI (Kanıt, Tanık ve Hakemlik)
      // =======================================================================
      water_dispute_talk: {
        npcName: 'Değirmenci & Reaya Temsilcisi',
        npcRole: 'Değirmen Arkı İhtilaf Heyeti',
        icon: '💧',
        text: `"Sipahi Beyim! Üst tarladaki komşu değirmen arkının bendini izinsiz kapatmış, suyumuz kesildi. Değirmen çarkı dönmez, unumuz öğütülmez oldu. Üst komşu ise \'Ekinlerim kuruyor, su önce tarlanın hakkıdır\' der. Adaletle bir hüküm ver!"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_water_dispute', 0);
        },
        choices: [
          {
            label: '⚖️ "Molla Şemseddin\'in hakemliğinde su nöbeti takvimi kurulsun; gündüz tarlaya, gece değirmene aksın."',
            action: () => {
              gameState.modifyReayaTrust(20);
              gameState.modifyFaction('ulema', 20);
              gameState.modifyFaction('reaya', 20);
              questSystem.advanceObjective('quest_water_dispute', 1);
              return {
                text: `"Allah adaletinden razı olsun Gazi Bey! Su sırayla salınacak, ne değirmen duracak ne ekin kuruyacak. İki taraf da razı oldu."`,
                choices: [{ label: 'Hak yerini bulsun, dirlik daim olsun.', action: null }]
              };
            }
          },
          {
            label: '💰 "Bendi hemen açın, zararı olan çiftçiye tımar sandığından 50 Akçe tohum tazminatı verilsin."',
            action: () => {
              if (gameState.timar.akce >= 50) {
                gameState.timar.akce -= 50;
                gameState.modifyReayaTrust(25);
                gameState.modifySquadLoyalty(10);
                questSystem.advanceObjective('quest_water_dispute', 1);
                return {
                  text: `"Cömert ve âdil sipahimiz! Zararımız karşılandı, bendi elbirliğiyle onarırız."`,
                  choices: [{ label: 'Hayırlı işler ola.', action: null }]
                };
              }
              gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
              return null;
            }
          },
          {
            label: 'Şimdilik incelemem sürüyor, sükuneti koruyun.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 7. KÖY HANI & CASUSLUK SORUŞTURMASI (Hancı İdris & Kanıt Arama)
      // =======================================================================
      hanci_talk: {
        npcName: 'Hancı İdris',
        npcRole: 'Köy Hanı Sahibi (Gözü Açık Esnaf)',
        icon: '🏨',
        text: `"Hoş safa getirdin Sipahi Beyim! Sıcak çorbamız, temiz döşeğimiz vardır. Lakin kulağına fısıldamam gereken mühim bir vukuat var... Üst kattaki Cenevizli kumaş tüccarı geceleri gizlice kandil yakıp köyün yollarını, ambarlarını ve hisar geçitlerini parşömene çizer!"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_inn_spy', 0);
        },
        choices: [
          {
            label: '🕵️ "Tüccarın odasını teftiş edelim, parşömen haritayı ve belgeleri ele geçir İdris."',
            action: () => {
              gameState.modifySancakReputation(20);
              gameState.modifyFaction('ahiler', 15);
              questSystem.advanceObjective('quest_inn_spy', 1);
              return {
                text: `"İşte beyim! Yastık altından çıkan kroki: Niğbolu\'ya giden ikmal yollarını ve Akçaoba ambarlarını işaretlemiş. Yanında da Haçlı karargahına yazılmış mühürlü mektup var! Casusluk belgelendi."`,
                choices: [
                  {
                    label: '📜 "Belgeleri Sancak Kalesi Dizdarı Hamza Bey\'e teslim edin, casusu gözetim altına alın."',
                    action: () => ({
                      text: `"Derhal beyim! Muhafızlara teslim ettim. Sancakbeyi bu hizmetini takdir edecektir."`,
                      choices: [{ label: 'Vatan toprağında hain barınamaz.', action: null }]
                    })
                  }
                ]
              };
            }
          },
          {
            label: '🍖 "Şimdilik handa sıcak bir ziyafet çekip soluklanalım (-30 Akçe)."',
            action: () => {
              if (gameState.timar.akce >= 30) {
                gameState.timar.akce -= 30;
                gameState.sipahi.health = gameState.sipahi.maxHealth;
                gameState.sipahi.stamina = gameState.sipahi.maxStamina;
                gameState.addNotification('🍖 Handa sıcak ziyafet çekildi, can ve kuvvet tazelendi.', 'success');
                return {
                  text: `"Afiyet şifa olsun Gazi Beyim! Ocağımız şenlendi."`,
                  choices: [{ label: 'Eline sağlık İdris.', action: null }]
                };
              }
              gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
              return null;
            }
          },
          {
            label: 'Gözünü dört aç İdris, şüpheli bir şey olursa hemen bildir.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 8. ATTAR MEHMET EFENDİ (Şifalı Kantaron Merhemi & Tababet)
      // =======================================================================
      attar_talk: {
        npcName: 'Attar Mehmet Efendi',
        npcRole: 'Çarşı Tabibi & Şifalı Otlar Ustası',
        icon: '🌿',
        text: `"Sefa geldin Sipahi Beyim! Dükkânımızda sarı kantaron yağı, çörek otu macunu, dağ kekiği ve yaraları iltihapsız kapatan mürver merhemi bulunur. Muharebe meydanında can kurtarır bu merhemler."`,
        onOpen: () => {
          questSystem.advanceObjective('quest_attar', 0);
        },
        choices: [
          {
            label: '🩹 "Gazi Cebelü Ali\'nin bacağı koptu, acil sarı kantaron ve dağlama yağı ver Mehmet Efendi! (-30 Akçe)"',
            action: () => {
              if (gameState.timar.akce < 30) {
                gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
                return null;
              }
              gameState.timar.akce -= 30;
              gameState.modifyFaction('ahiler', 15);
              questSystem.advanceObjective('quest_save_ali_leg', 0);
              return {
                text: `"Aman beyim tez yetiştir! İşte hakiki sarı kantaron ve dağlama macunu. İltihabı kurutur, kanı durdurur. Hemen bacağına sarın!"`,
                choices: [{ label: 'Eyvallah Mehmet Efendi, dualarınızı eksik etmeyin!', action: null }]
              };
            }
          },
          {
            label: '🧪 "Savaş için yara kapatıcı sarı kantaron yağı ve merhem tedarik et (-40 Akçe)."',
            action: () => {
              if (gameState.timar.akce >= 40) {
                gameState.timar.akce -= 40;
                gameState.sipahi.health = gameState.sipahi.maxHealth;
                gameState.modifyFaction('ahiler', 10);
                gameState.modifyReayaTrust(10);
                questSystem.advanceObjective('quest_attar', 1);
                return {
                  text: `"Şifalar ola beyim! İşte kılıç ve ok yarasını tez zamanda kurutan hakiki kantaron özü. Çantanda bulunsun."`,
                  choices: [{ label: 'Allah razı olsun Mehmet Efendi.', action: null }]
                };
              }
              gameState.addNotification('⚠️ Yetersiz akçe!', 'alert');
              return null;
            }
          },
          {
            label: 'Kolay gelsin Mehmet Efendi, şifalı günler.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 9. KOMŞU SİPAHİ GAZİ SUNGUR BEY (Sancak İttifakı & Taktik Birliği)
      // =======================================================================
      neighbor_talk: {
        npcName: 'Gazi Sungur Bey',
        npcRole: 'Komşu Çakırlı Tımarı Sahibi (Tecrübeli Akıncı)',
        icon: '⚔️',
        text: `"Selamünaleyküm komşu beyim! Çakırlı tımarından at sürüp geldim. Duyduk ki Sultanımızın sefer fermanı eli kulağında. Rumeli\'ye geçerken birliklerimizi birleştirip ortak sancak altında yürümeye ne dersin?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_neighbor', 0);
        },
        choices: [
          {
            label: '🤝 "İttifakımız tamdır Sungur Bey! Cebelülerimiz tek saf olsun, seferde sırt sırta verelim."',
            action: () => {
              gameState.modifySancakReputation(20);
              gameState.modifySquadLoyalty(20);
              questSystem.advanceObjective('quest_neighbor', 1);
              return {
                text: `"Ahtımız aht olsun! Çakırlı ve Akçaoba sipahileri tek yumruk gibi Tuna\'ya varacak. Gazamız mübarek olsun!"`,
                choices: [{ label: 'Yolumuz açık olsun kandaşım.', action: null }]
              };
            }
          },
          {
            label: 'Allah birliğimizi daim eylesin Sungur Bey, seferde görüşürüz.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 10. SANCAK KALESİ DİZDARI HAMZA BEY (Cebehane, Yoklama & Ferman)
      // =======================================================================
      dizdar_talk: {
        npcName: 'Dizdar Hamza Bey',
        npcRole: 'Sancak Kalesi Muhafızı & Cebehane Emini',
        icon: '🏰',
        text: `"Gazi Murad Bey! Hoş geldin hisarımıza. Burçlarımız tahkim edildi, cebehanemiz mızrak ve kalkanla donatıldı. Sultan Yıldırım Bayezid Han\'ın tuğları Gelibolu\'dan Tuna boyuna doğru çekildi. Cebelülerin ve zahiren sefere hazır mıdır?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_castle', 0);
        },
        choices: [
          {
            label: '📜 "Sipahi beratımızı ve yoklama defterimizi teftişe arz ederim Dizdar Bey."',
            action: () => {
              gameState.modifySancakReputation(30);
              gameState.modifySquadLoyalty(20);
              questSystem.advanceObjective('quest_castle', 1);
              return {
                text: `"Maaşallah! Tımarınızın intizamı, cebelülerinizin talimi tamdır. Sancakbeyi adına takdirnameni mühürledim. Tuna alayında yeriniz ön saflardır!"`,
                choices: [
                  {
                    label: '🚩 "Sultan Fermanı başımızın tacıdır, Tuna gazasına hazırız!"',
                    action: () => ({
                      text: `"Uğurlar olsun Gazi Bey! Niğbolu zaferiyle dönmenizi niyaz ederiz."`,
                      choices: [{ label: 'Gaza vaktidir!', action: null }]
                    })
                  }
                ]
              };
            }
          },
          {
            label: 'Cebehaneyi teftiş edip hazırlıklarımı tamamlayayım.',
            action: null
          }
        ]
      },

      // =======================================================================
      // 11. TELLAK HÜSEYİN AĞA (OSMANLI HAMAMI)
      // =======================================================================
      tellak_talk: {
        npcName: 'Tellak Hüseyin Ağa',
        npcRole: 'Hamam Tellak Başı',
        icon: '🧖‍♂️',
        text: `"Sefa getirdin Sipahi Beyim! Gazalardan, talimlerden yorgun düşmüşsün. Mermer göbek taşımız sıcacıktır. Şöyle bir uzan da kemiklerini çatırdatıp, mis kokulu sabun köpüğü ve ak pak kese ile seni yenileyelim! (Hizmet Bedeli: 40 Akçe)"`,
        choices: [
          {
            label: '🧖 "Buyur Ağa, hakkındır 40 Akçe. Şöyle esaslı bir kese köpük yap."',
            action: () => {
              if (gameState.timar.akce < 40) {
                gameState.addNotification('⚠️ Yeterli Akçen yok! (Gereken: 40 Akçe)', 'alert');
                return {
                  text: `"Beyim canın sağ olsun, lakin kesende akçe kalmamış. Sonra yine bekleriz."`,
                  choices: [{ label: 'Sonra gelirim.', action: null }]
                };
              }

              gameState.timar.akce -= 40;
              gameState.sipahi.health = gameState.sipahi.maxHealth;
              gameState.sipahi.stamina = gameState.sipahi.maxStamina;
              gameState.lastBathDay = gameState.time.dayCount;

              try { soundManager.playVictoryJingle(); } catch (e) {}
              gameState.addNotification('🧖 Tellak Hüseyin Ağa kese ve köpükle seni pirüpak eyledi! Sıhhat ve kuvvetin kemale erdi.', 'success');

              return {
                text: `"Ohhh, yarasın beyime! Kuş gibi hafifledin, yorgunluktan eser kalmadı. Gazalarda kılıcın keskin, sıhhatin daim olsun!"`,
                choices: [{ label: 'Eline sağlık Hüseyin Ağa, çok makbule geçti.', action: null }]
              };
            }
          },
          {
            label: '🚿 "Şimdilik bir teftişe gelmiştim Hüseyin Ağa, kolay gelsin."',
            action: null
          }
        ]
      },

      // =======================================================================
      // 12. DİĞER AHALİ VE ESNAF DÜĞÜMLERİ
      // =======================================================================
      farmer_talk: {
        npcName: 'Tımar Reayası (Çiftçi Hasan)',
        npcRole: 'Buğday Irgatı & Köy Çiftçisi',
        icon: '🌾',
        text: `"Sipahi Beyim çok yaşa! Hamdolsun buğdaylar harmana çekilir. Sayende köyümüzde dirlik düzenlik vardır, haramilere aman verme!"`,
        choices: [
          {
            label: '🌾 "Emeğiniz zayi olmaz Hasan Ağa, bereketli hasatlar ola."',
            action: null
          }
        ]
      },

      hamam_musteri_talk: {
        npcName: 'Hamam Müşterisi',
        npcRole: 'Yıkanan Köylü',
        icon: '🧼',
        text: `"Ohhh be! Sıcak göbek taşı bütün bel ağrılarımı aldı götürdü. Hamamımız köyümüzün bereketidir beyim, Allah razı olsun."`,
        choices: [
          {
            label: 'Sıhhatler olsun.',
            action: null
          }
        ]
      }
    };

    // Alias ve Ek Görev Tanımları
    data.bakkal_talk = data.attar_talk;
    data.kadi_talk = data.imam_talk;
    data.seyis_talk = data.cebelu_talk;
    data.cirak_talk = data.cebelu_talk;
    data.muhafiz_talk = data.dizdar_talk;
    data.hanci_idris = data.hanci_talk;
    data.koca_dede = data.dede_talk;
    data.attar_mehmet = data.attar_talk;

    return data[dialogueId] || null;
  }
}
