import { gameState } from '../core/GameState.js';
import { TimarSystem } from './TimarSystem.js';
import { soundManager } from '../core/AudioManager.js';
import { questSystem } from './QuestSystem.js';

/**
 * DialogueSystem - Döneme Uygun Osmanlıca/Türkçe Dallanan Diyalog Ağacı
 */
export class DialogueSystem {
  static getDialogueData(dialogueId) {
    const data = {
      // 1. KÖY KETHÜDASI KOCA YAKUB
      kethuda_talk: {
        npcName: 'Köy Kethüdası Koca Yakub',
        npcRole: 'Akçaoba Tımar Reayası Temsilcisi',
        icon: '👳‍♂️',
        text: `"Esselamü aleyküm ve rahmetullah Sipahi Beyim! Hamdolsun buğdaylar harmana çekildi, değirmenimiz döner. Lakin güney dağlarındaki haramiler reayanın huzurunu kaçırır. Emriniz nedir?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_inspect', 0);
        },
        choices: [
          {
            label: '🌾 "Bu yılın öşür vergisini ve mahsul hesaplarını çıkar Yakub Ağa."',
            action: () => {
              if (TimarSystem.collectAnnualTax()) {
                questSystem.advanceObjective('quest_inspect', 1);
                return {
                  text: `"Baş üstüne beyim! Deftere kaydettik, öşür zahiresi ambara taşındı. Padişahımızın ömrü uzun olsun."`,
                  choices: [{ label: 'Eyvallah, işinin başına dön.', action: null }]
                };
              }
              return null;
            }
          },
          {
            label: '🍞 "Köylünün gönlünü hoş tutalım; bu akşam meydanda ziyafet verilsin (-150 Akçe)."',
            action: () => {
              if (TimarSystem.feastVillagers()) {
                questSystem.advanceObjective('quest_inspect', 1);
                return {
                  text: `"Allah senden razı olsun cömert beyim! Köylü sana dua eder, bağlılığımız tamdır."`,
                  choices: [{ label: 'Afiyet olsun, bereketli olsun.', action: null }]
                };
              }
              return null;
            }
          },
          {
            label: '🛡️ "Haramilerin haddini bildireceğim, siz işinize bakın."',
            action: () => {
              questSystem.advanceObjective('quest_inspect', 1);
              const banditQuest = questSystem.getQuestById('quest_bandits');
              if (banditQuest && banditQuest.status === 'available') {
                banditQuest.status = 'active';
                questSystem.syncWithGameState();
                gameState.addNotification('📜 Harami Avı Görevi Aktif Edildi!', 'alert');
              }
              return {
                text: `"Kılıcın keskin olsun beyim! Güneybatıdaki meşelik alanda pusu kurarlar, aman dikkatli olasın."`,
                choices: [{ label: 'Gaza vaktidir.', action: null }]
              };
            }
          },
          {
            label: 'Aleyküm selam Yakub Ağa, şimdilik bir diyeceğim yok.',
            action: null
          }
        ]
      },

      // 2. KÖY İMAMI MOLLA ŞEMSEDDİN
      imam_talk: {
        npcName: 'Molla Şemseddin (Kadı Naibi)',
        npcRole: 'Köy İmamı ve Şer\'i Naib',
        icon: '🕌',
        text: `"Ve aleyküm selam Gazi Bey! Sultanımız Yıldırım Bayezid Han adaletle hükmeder. Tımar toprağında hak ve adaleti gözetmek, zayıfı güçlüye ezdirmemek sana emanettir."`,
        onOpen: () => {
          questSystem.advanceObjective('quest_imam', 0);
        },
        choices: [
          {
            label: '🤲 "Hocam, ordumuz ve seferimiz için hayır dua eyle."',
            action: () => {
              gameState.sipahi.reputation += 10;
              soundManager.playVictoryJingle();
              questSystem.advanceObjective('quest_imam', 1);
              return {
                text: `"Cenab-ı Hak kılıcınızı küffara ve zalimlere karşı keskin, gazanızı mübarek eylesin! Melekler ardınızda saf tutsun."`,
                choices: [{ label: 'Âmin hocam, Allah razı olsun.', action: null }]
              };
            }
          },
          {
            label: '📜 "Sultanımızın fermanı ve Rumeli\'deki gazalar hakkında ne haberler var?"',
            action: () => {
              questSystem.advanceObjective('quest_imam', 1);
              return {
                text: `"Duyduk ki Frenk kralları ve Macar Kralı Sigismund büyük bir Haçlı ordusuyla Tuna boyuna inmiş. Sultanımız fırtına gibi Edirne\'ye ilerlemekte. Hazırlıklı ol beyim!"`,
                choices: [{ label: 'Ferman geldiğinde kılıcımız kınında durmaz.', action: null }]
              };
            }
          },
          {
            label: 'Hayırlı günler dilerim hocam.',
            action: null
          }
        ]
      },

      // 3. DEMİRCİ RÜSTEM USTA
      demirci_talk: {
        npcName: 'Demirci Rüstem Usta',
        npcRole: 'Tımar Demircisi & Zırh Ustası',
        icon: '⚒️',
        text: `"Hoş geldin Sipahi Beyim! Körük yanar, örs çınlar. Kılıcına su mu verelim, yoksa cebelülerine kalkan ve zırh mı dövelim?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_blacksmith', 0);
        },
        choices: [
          {
            label: '🗡️ "Kılıcımı bile, zırhımı berkirt Rüstem Usta (-300 Akçe)."',
            action: () => {
              if (TimarSystem.upgradeArmorAndSword()) {
                questSystem.advanceObjective('quest_blacksmith', 1);
                return {
                  text: `"İşte böyle! Şam çeliği gibi parladı. Düşman zırhını kağıt gibi keser."`,
                  choices: [{ label: 'Eline sağlık usta.', action: null }]
                };
              }
              return null;
            }
          },
          {
            label: '🛡️ "Yeni bir Cebelü donatmak için takım sipariş etmek isterim (-800 Akçe)."',
            action: () => {
              if (TimarSystem.trainCebelu()) {
                questSystem.advanceObjective('quest_blacksmith', 1);
                return {
                  text: `"Hemen bir göğüslük, kalkan ve kargı hazırlıyorum. Askerin sefere hazırdır!"`,
                  choices: [{ label: 'Gaza için hayırlı olsun.', action: null }]
                };
              }
              return null;
            }
          },
          {
            label: 'Kolay gelsin Rüstem Usta, sonra uğrarım.',
            action: () => {
              questSystem.advanceObjective('quest_blacksmith', 1);
              return null;
            }
          }
        ]
      },

      // 4. KOMŞU SİPAHİ GAZİ SUNGUR BEY
      neighbor_talk: {
        npcName: 'Gazi Sungur Bey',
        npcRole: 'Komşu Çakırlı Tımarı Sahibi',
        icon: '⚔️',
        text: `"Vakt-i şerifler hayrola komşu! Sınır boylarımızda sulh sükun var şükür. Lakin kulağıma gelir ki Sultanımız Bayezid Han tuğ çekmiş. Sefere birlikte omuz omuza gidelim derim!"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_neighbor', 0);
        },
        choices: [
          {
            label: '🤝 "Elbette Sungur Bey! Cebelülerimizi birleştirip sancakbeyinin alayına katılalım."',
            action: () => {
              gameState.relations.neighbor += 20;
              gameState.military.cebeluExperience += 15;
              soundManager.playVictoryJingle();
              questSystem.advanceObjective('quest_neighbor', 1);
              return {
                text: `"Yiğidin sözü senettir! Birlikte vuruştuğumuzda sırtımız yere gelmez."`,
                choices: [{ label: 'Gazamız kutlu olsun.', action: null }]
              };
            }
          },
          {
            label: '🐎 "Senin alaca at pek heybetli durur Sungur Bey, nereden edindin?"',
            action: () => {
              questSystem.advanceObjective('quest_neighbor', 1);
              return {
                text: `"Karamanoğlu seferinde ganimet düşmüştü. Lakin senin yağız at da fırtına gibidir maşallah."`,
                choices: [{ label: 'Sağ olasın komşu.', action: null }]
              };
            }
          },
          {
            label: 'Görüşmek üzere Gazi Bey.',
            action: null
          }
        ]
      },

      // 5. SADIK CEBELÜ ALİ
      cebelu_talk: {
        npcName: 'Toy Cebelü Ali',
        npcRole: 'Sipahinin Sadık Çırağı',
        icon: '🛡️',
        text: `"Beyim! Talimimi hiç aksatmadım. Kılıç savurmayı, kalkan tutmayı her gün çalışırım. Sefere çıkacağımız günü sabırsızlıkla beklerim!"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_cebelu', 0);
        },
        choices: [
          {
            label: '⚔️ "Aferin Ali! Gayretin gözümden kaçmaz, kılıcın keskin olsun."',
            action: () => {
              gameState.military.cebeluExperience += 10;
              questSystem.advanceObjective('quest_cebelu', 1);
              return {
                text: `"Emrindeyim Beyim! Uğruna canımı vermekten çekinmem."`,
                choices: [{ label: 'Var ol yiğidim.', action: null }]
              };
            }
          },
          {
            label: 'Talime devam et Ali.',
            action: () => {
              questSystem.advanceObjective('quest_cebelu', 1);
              return null;
            }
          }
        ]
      },

      // 6. SANCAK KALESİ DİZDARI HAMZA BEY
      dizdar_talk: {
        npcName: 'Dizdar Hamza Bey',
        npcRole: 'Sancak Kalesi Muhafızı & Dizdarı',
        icon: '🏰',
        text: `"Devletlü Sipahi Beyim, Sancak Kalesi'ne hoş geldin! Hisar burçlarımız berk, cebehanemiz silah doludur. Mancınıklarımız ve nöbetçilerimiz sınır boylarını gözler. Bir emrin var mıdır?"`,
        onOpen: () => {
          questSystem.advanceObjective('quest_castle', 0);
        },
        choices: [
          {
            label: '🏰 "Hisarın cebehanesini ve garnizon askerlerini teftiş etmeye geldim Dizdar Bey."',
            action: () => {
              gameState.sipahi.reputation += 15;
              gameState.timar.asayis = Math.min(100, gameState.timar.asayis + 15);
              questSystem.advanceObjective('quest_castle', 1);
              soundManager.playVictoryJingle();
              return {
                text: `"Emrin başım üstüne Beyim! Kale avlusundaki talim mankenlerinde kılıç talimi yapabilir, cebehanemizden yeni mızrak ve kalkan donatabilirsin."`,
                choices: [{ label: 'Var ol Dizdar Bey, kaleniz daim olsun.', action: null }]
              };
            }
          },
          {
            label: '🛡️ "Sultanımızın fermanı için kaleden tecrübeli 1 muhafız cebelü talep ederim (-600 Akçe)."',
            action: () => {
              if (gameState.timar.akce >= 600) {
                gameState.timar.akce -= 600;
                gameState.military.cebeluCount += 1;
                gameState.military.veteranSoldiers.push('Kale Muhafızı Timur');
                soundManager.playWarDrum();
                questSystem.advanceObjective('quest_castle', 1);
                questSystem.advanceObjective('quest_cebelu', 0);
                questSystem.advanceObjective('quest_cebelu', 1);
                questSystem.advanceObjective('quest_campaign', 0);
                return {
                  text: `"Derhal! Kale muhafızlarımızdan Çelik Zırhlı Timur emrine verilmiştir. Cebelülerin sefere hazır!"`,
                  choices: [{ label: 'Eksik olma Hamza Bey.', action: null }]
                };
              } else {
                gameState.addNotification('Yetersiz Akçe! Kaleden muhafız donatmak için 600 Akçe gerekir.', 'alert');
                return null;
              }
            }
          },
          {
            label: 'Kalenin asayişi size emanettir Dizdar Bey, kolay gelsin.',
            action: () => {
              questSystem.advanceObjective('quest_castle', 1);
              return null;
            }
          }
        ]
      },

      // 7. KALE NÖBETÇİSİ
      guard_talk: {
        npcName: 'Kale Kapı Nöbetçisi',
        npcRole: 'Sancak Kalesi Muhafız Neferi',
        icon: '🛡️',
        text: `"Selam olsun Sipahi Beyim! Kalemizin kapıları tımarlı sipahilerimize ve Sultanımızın ordusuna daima açıktır. İç avluda Dizdar Hamza Bey seni beklemektedir."`,
        choices: [
          {
            label: 'Kolay gelsin yiğidim, gözünü sınırdan ayırma.',
            action: null
          }
        ]
      }
    };

    return data[dialogueId] || null;
  }
}
