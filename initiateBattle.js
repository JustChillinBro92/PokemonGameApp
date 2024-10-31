import { Monster } from "./classes.js";
// import { battle } from "./renderer.js";
// import { animate } from "./renderer.js";
import { animateBattleId } from "./battlescene.js";
import { audio } from "./data/audio.js";
import { playerMonsters, getRandomMonster } from "./data/monsters.js";
import { attacks } from "./data/attacks.js";
import { playerItems, UseItemFromButton } from "./data/playerBag.js";
import { items } from "./data/items.js";

//creating the monster sprites
let enemy;
let partner;
let Items;
export let renderedSprites; //array for storing rendered out projectile attacks
let queue; //queue for pushing enemy attacks
let variable = false;

export function initBattle() {
  document.querySelector("#Interface").style.display = "block";
  document.querySelector("#encounterBox").style.display = "block";
  document.querySelector("#BattleBox").style.display = "flex";

  document.querySelector("#DialogueBox").style.display = "none";
  document.querySelector("#enemyHealthBar").style.display = "block";
  document.querySelector("#playerHealthBar").style.display = "block";
  document.querySelector("#enemyHealthBar").style.backgroundColor =
    "rgb(58, 227, 58)";
  document.querySelector("#playerHealthBar").style.backgroundColor =
    "rgb(58, 227, 58)";

  document.querySelector("#enemyHealthBar").style.width = "98.5%";
  document.querySelector("#playerHealthBar").style.width = "98.5%";
  document.querySelector("#restorativeBox").replaceChildren();
  document.querySelector("#attacksBox").replaceChildren(); //removes the appended attack buttons with each battle

  enemy = new Monster(getRandomMonster());
  partner = new Monster(playerMonsters.emby);
  enemy.health = enemy.maxHealth;
  partner.health = partner.maxHealth;

  //enemy encounter text
  document.querySelector("#encounterBox").innerHTML =
    "A Wild " + enemy.name + " Appeared! ";

  //VERY IMPORTANT
  document.querySelector("#encounterBox").addEventListener("click", () => {
    //console.log("box clicked")
    document.querySelector("#BattleBox").style.opacity = "1";
    document.querySelector("#BattleBox").style.visibility = "visible";
  });

  //fight option implement
  document.querySelector("#fight").addEventListener("click", () => {
    if (document.querySelector("#BattleBox").style.visibility === "visible") {
      // Hide `BattleBox` and show `attacksBox`
      document.querySelector("#DialogueBox").style.display = "none";
      document.querySelector("#encounterBox").style.display = "none";

      document.querySelector("#BattleBox").style.opacity = "0";
      document.querySelector("#BattleBox").style.visibility = "hidden";

      document.querySelector("#attackTypeBox").style.opacity = "1";
      document.querySelector("#attackTypeBox").style.visibility = "visible";

      document.querySelector("#attacksBox").style.opacity = "1";
      document.querySelector("#attacksBox").style.visibility = "visible";
    }
  });

  //bag option implement
  document.querySelector("#bag").addEventListener("click", () => {
    // document.querySelector("#BattleBox").style.opacity = "0";
    // document.querySelector("#BattleBox").style.visibility = "hidden";
    document.querySelector("#backpack").style.display = "block";
    document.querySelector("#backBox").style.opacity = "1";
    document.querySelector("#backBox").style.visibility = "visible";
  });

  //back button implement
  document.querySelectorAll(".back").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#BattleBox").style.opacity = "1";
      document.querySelector("#BattleBox").style.visibility = "visible";
      // document.querySelector("#itemBox").style.opacity = "0";
      // document.querySelector("#itemBox").style.visibility = "hidden";
      document.querySelector("#backpack").style.display = "none";
      document.querySelector("#backBox").style.opacity = "0";
      document.querySelector("#backBox").style.visibility = "hidden";
      document.querySelector("#attackTypeBox").style.opacity = "0";
      document.querySelector("#attackTypeBox").style.visibility = "hidden";
    });
  });

  //run option implement
  document.querySelector("#run").addEventListener("click", () => {
    document.querySelector("#BattleBox").style.visibility = "hidden";
    document.querySelector("#encounterBox").style.display = "none";
    document.querySelector("#DialogueBox").innerHTML = " Ran away safely! ";
    document.querySelector("#DialogueBox").style.display = "block";

    audio.run.volume = 0.15;
    audio.run.currentTime = 0;

    if (!audio.run.paused) {
      audio.run.play();
      audio.run.pause();
    }

    queue.push(() => {
      gsap.to("#OverlappingDiv", {
        opacity: 1,
        OnComplete: () => {
          window.cancelAnimationFrame(animateBattleId);
          animate();

          document.querySelector("#Interface").style.display = "none";

          gsap.to("#OverlappingDiv", {
            opacity: 0,
          });

          battle.initiated = false;
          audio.battle.stop();
          audio.Map.play();
        },
      });
    });
  });

  document.querySelector("#enemyMon").innerHTML = enemy.name;
  document.querySelector("#playerMon").innerHTML = partner.name;

  renderedSprites = [enemy, partner];
  queue = [];

  partner.attack.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attacksBox").append(button);

    button.addEventListener("mouseenter", () => {
      document.querySelector("#AttackTypeBox").innerHTML = attack.type;
      document.querySelector("#AttackTypeBox").style.color = attack.color;
    });

    //event listeners for our attack buttons
    button.addEventListener("click", (e) => {
      //console.log(e.currentTarget.innerHTML);
      //console.log(attacks[e.currentTarget.innerHTML]);
      const selectedAttack = attacks[e.currentTarget.innerHTML];

      partner.Attack({
        attack: selectedAttack,
        recipient: enemy,
        renderedSprites,
      });

      if (enemy.health <= 0) {
        queue.push(() => {
          enemy.faint();
        });
        queue.push(() => {
          gsap.to("#OverlappingDiv", {
            opacity: 1,
            OnComplete: () => {
              window.cancelAnimationFrame(animateBattleId);
              animate();
              document.querySelector("#Interface").style.display = "none";

              gsap.to("#OverlappingDiv", {
                opacity: 0,
              });
              battle.initiated = false;
              audio.victory.stop();
              audio.Map.play();
            },
          });
        });
      }

      //enemy attacks
      const randomAttack =
        enemy.attack[Math.floor(Math.random() * enemy.attack.length)];

      queue.push(() => {
        enemy.Attack({
          attack: randomAttack,
          recipient: partner,
          renderedSprites,
        });

        //console.log(queue.length);

        if (partner.health <= 0) {
          // after each enemy attack check player monster's health
          queue.push(() => {
            partner.faint();
          });
          queue.push(() => {
            gsap.to("#OverlappingDiv", {
              opacity: 1,
              OnComplete: () => {
                window.cancelAnimationFrame(animateBattleId);
                animate();
                document.querySelector("#Interface").style.display = "none";

                gsap.to("#OverlappingDiv", {
                  opacity: 0,
                });
                battle.initiated = false;
                audio.victory.stop();
                audio.Map.play();
              },
            });
          });
        }
      });
    });
  });

  //loads the category objects from the player's bag
  let ItemCategories = playerItems.bag;
  let categoryId;

  //loops through the category objects in player's bag
  Object.keys(ItemCategories).forEach((categoryKey) => {
    const category = ItemCategories[categoryKey];

    //loops through the items in each category in player's bag and creates button for them
    category.forEach((ITEM) => {
      // Check for the current category for example "restoratives"
      if (categoryKey === "restoratives") categoryId = "#restorativeBox"
      else if (categoryKey === "status_heal" ) categoryId = "#statusHealBox"

        const item_button = document.createElement("button");
        item_button.innerHTML = ITEM.item.name + " x " + ITEM.quantity;

        // Set data attributes
        item_button.setAttribute("data-category", categoryKey);
        item_button.setAttribute("data-item", ITEM.item.name);
        item_button.setAttribute("data-item-object", JSON.stringify(ITEM.item)); // Store the entire item object

        // Append the button only to the #restorativeBox
        document.querySelector(categoryId).append(item_button);

        // Checks which item is used and takes action accordingly
        item_button.addEventListener("click", (e) => {
          UseItemFromButton(e, item_button);
          variable = true;

          document.querySelector("#backpack").style.display = "none";
          document.querySelector("#encounterBox").style.display = "none";
          document.querySelector("#BattleBox").style.opacity = "0";
          document.querySelector("#BattleBox").style.visibility = "hidden";

          document.querySelector("#DialogueBox").innerHTML =
            partner.name + " recovered HP! ";
          document.querySelector("#DialogueBox").style.display = "block";

          // Retrieves the entire item object that is selected
          const selectedItemObject = JSON.parse(
            e.currentTarget.getAttribute("data-item-object")
          );

          partner.useItem({
            ItemUsed: selectedItemObject,
          });

          if (partner.health > 0) {
            const randomAttackV2 =
              enemy.attack[Math.floor(Math.random() * enemy.attack.length)];

            // Enemy attacks upon using items
            queue.push(() => {
              enemy.Attack({
                attack: randomAttackV2,
                recipient: partner,
                renderedSprites,
              });

              if (partner.health <= 0) {
                // After each enemy attack check player monster's health
                queue.push(() => {
                  partner.faint();
                });
                queue.push(() => {
                  gsap.to("#OverlappingDiv", {
                    opacity: 1,
                    onComplete: () => {
                      window.cancelAnimationFrame(animateBattleId);
                      animate();
                      document.querySelector("#Interface").style.display =
                        "none";

                      gsap.to("#OverlappingDiv", {
                        opacity: 0,
                      });
                      battle.initiated = false;
                      audio.victory.stop();
                      audio.Map.play();
                    },
                  });
                });
              }
            });
            //console.log(queue);
          }
        });

        document.querySelector("#rest").addEventListener("click", (e) => {
          document.querySelector("#statusHealBox").style.opacity = "0";
          document.querySelector("#statusHealBox").style.visibility = "hidden";
        })
       
        document.querySelector("#stat").addEventListener("click", (e) => {
          document.querySelector("#statusHealBox").style.opacity = "1";
          document.querySelector("#statusHealBox").style.visibility = "visible";
        })
    });
  });
}

document.querySelector("#DialogueBox").addEventListener("click", (e) => {
  console.log("clicked");
  if (variable) {
    //for attack turn while player uses an item
    if (queue.length > 0) {
      queue[0]();
      queue.shift();
    } else {
      variable = false;

      // Only when queue is empty after item usage, show #BattleBox
      document.querySelector("#BattleBox").style.opacity = "1";
      document.querySelector("#BattleBox").style.visibility = "visible";
    }
  } else {
    // for normal attack turns
    if (queue.length > 0) {
      queue[0](); //calling the 0th index of queue i.e., the attack that was pushed in enemy queue
      queue.shift(); //popping the attack from enemy attack queue
    } else e.currentTarget.style.display = "none";
  }
});
