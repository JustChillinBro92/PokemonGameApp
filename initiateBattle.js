import { Monster, health_tracker, health_width_tracker, status_tracker, status_color_tracker,exp_tracker, max_exp_tracker, level_tracker, lvl_up} from "./classes.js";
import { battle, animate, menu } from "./renderer.js";
import { animateBattleId } from "./battlescene.js";
import { audio } from "./data/audio.js";
import { playerMonsters, getRandomMonster } from "./data/monsters.js";
import { attacks } from "./data/attacks.js";
// import { load_backpack } from "./backpack.js";
import { playerItems, UseItemFromButton } from "./data/playerBag.js";

// Select all buttons on the page
const buttons = document.querySelectorAll("button");

// Add an event listener to each button
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    audio.button_press.play();
  });
});

//creating the monster sprites
export let enemy;
export let partner;
export let renderedSprites; //array for storing rendered out projectile attacks
export let queue; //queue for pushing enemy attacks

let item_used = false;

export function initBattle() {
  // console.log(status_tracker);
  // console.log(status_color_tracker);
  console.log("lvl: " + level_tracker);
  console.log("max exp: " + max_exp_tracker);

  document.querySelector("#Interface").style.display = "block";
  document.querySelector("#encounterBox").style.display = "block";
  document.querySelector("#BattleBox").style.display = "flex";

  document.querySelector("#DialogueBox").style.display = "none";

  document.querySelector("#enemyHealthBar").style.display = "block";
  document.querySelector("#playerHealthBar").style.display = "block";
  
  document.querySelector("#enemyHealthBar").style.backgroundColor =
    "rgb(58, 227, 58)";
  document.querySelector("#enemyHealthBar").style.visibility = "visible";
  
  if(health_tracker <= 60) {
    document.querySelector("#playerHealthBar").style.backgroundColor = "yellow";
     if(health_tracker <= 25) document.querySelector("#playerHealthBar").style.backgroundColor = "red";
  } else document.querySelector("#playerHealthBar").style.backgroundColor =
  "rgb(58, 227, 58)";
  
  document.querySelector("#playerHealthBar").style.visibility = "visible";

  document.querySelector("#enemyHealthBar").style.width = "98.5%";
  document.querySelector("#playerHealthBar").style.width = health_width_tracker;

  document.querySelector("#enemyStat").innerHTML = getRandomMonster().status;
  document.querySelector("#enemyStat").style.color = "#2a2a2a";

  document.querySelector("#playerStat").innerHTML = status_tracker;
  document.querySelector("#playerStat").style.color = status_color_tracker;

  document.querySelector("#restorativeBox").replaceChildren();
  document.querySelector("#statusHealBox").replaceChildren();

  document.querySelector("#attacksBox").replaceChildren(); //removes the appended attack buttons with each battle

  enemy = new Monster(getRandomMonster());
  partner = new Monster(playerMonsters.emby);

  document.querySelector("#enemy_lvl").innerHTML = enemy.level;
  document.querySelector("#player_lvl").innerHTML = level_tracker;

  console.log(partner);
  console.log(enemy);

  // console.log(exp_tracker);

  enemy.health = enemy.maxHealth;
  partner.health = health_tracker;
  //console.log(" status: " + partner.status);

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
    document.querySelector("#DialogueBox").innerHTML = " Got away safely! ";
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
    button.addEventListener("click", (e) => 
      {
      //console.log(e.currentTarget.innerHTML);
      //console.log(attacks[e.currentTarget.innerHTML]);
      const selectedAttack = attacks[e.currentTarget.innerHTML];

      let attack_happen_player = partner.status_effect_nonDamage();

      if (attack_happen_player) {    
        partner.Attack({
          attack: selectedAttack,
          recipient: enemy,
          renderedSprites,
        });
        console.log(queue.length);
        battle_end_check(enemy);

        //enemy attacks
        enemy_attacks(enemy);
      } else {
        //enemy attacks
        enemy_attacks(enemy);
      }
    });
  });

  // //loads the category objects from the player's bag
  let ItemCategories = playerItems.bag;
  let categoryId;

  //loops through the category objects in player's bag
  Object.keys(ItemCategories).forEach((categoryKey) => {
    const category = ItemCategories[categoryKey];

    //loops through the items in each category in player's bag and creates button for them
    category.forEach((ITEM) => {
      // Check for the current category for example "restoratives"
      if (categoryKey === "restoratives") categoryId = "#restorativeBox";
      else if (categoryKey === "status_heal") categoryId = "#statusHealBox";

      //let initial_item_quantity = ITEM.quantity;

      const item_button = document.createElement("button");
      item_button.innerHTML = ITEM.item.name + " x " + ITEM.quantity;

      // Set data attributes
      item_button.setAttribute("data-category", categoryKey);
      item_button.setAttribute("data-item", ITEM.item.name);
      item_button.setAttribute("data-item-object", JSON.stringify(ITEM.item)); // Store the entire item object

      // Append the button only to the #restorativeBox
      document.querySelector(categoryId).append(item_button);

      item_button.addEventListener("mouseenter", () => {
        document.querySelector("#description").innerHTML =
          ITEM.item.description;
      });

      // Checks which item is used and takes action accordingly
      item_button.addEventListener("click", (e) => {
        if(menu) return;
        if (
          categoryKey === "restoratives" &&
          partner.health < partner.maxHealth || categoryKey === "restoratives" &&
          health_tracker < partner.maxHealth
        )
          item_used = true;
        else if (
          item_button.getAttribute("data-item") === "Burn Heal" &&
          partner.status === "BRND" || item_button.getAttribute("data-item") === "Burn Heal" &&
          status_tracker === "BRND"
        )
          item_used = true;
        else if (
          item_button.getAttribute("data-item") === "Paralyze Heal" &&
          partner.status === "PRLZ" || item_button.getAttribute("data-item") === "Burn Heal" &&
          status_tracker === "PRLZ"
        )
          item_used = true;

        //console.log(item_button.getAttribute("data-item"))
        //console.log(item_used);

        if (item_used) {
          UseItemFromButton(e, item_button); //reduces quantity of item used

          document.querySelector("#backpack").style.display = "none";
          document.querySelector("#encounterBox").style.display = "none";
          document.querySelector("#BattleBox").style.opacity = "0";
          document.querySelector("#BattleBox").style.visibility = "hidden";

          if (categoryKey === "restoratives")
            document.querySelector("#DialogueBox").innerHTML =
              partner.name + "'s" + " HP has been restored! ";

          if (categoryKey === "status_heal")
            document.querySelector("#DialogueBox").innerHTML =
              partner.name + "'s" + " status has been restored! ";

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
            enemy_attacks(enemy);
          }
        } else {
          document.querySelector("#description").innerHTML =
            "There is a time and place for each item!";
        }
      });

      document.querySelector("#rest").addEventListener("click", (e) => {
        document.querySelector("#statusHealBox").style.opacity = "0";
        document.querySelector("#statusHealBox").style.visibility = "hidden";
      });

      document.querySelector("#stat").addEventListener("click", (e) => {
        document.querySelector("#statusHealBox").style.opacity = "1";
        document.querySelector("#statusHealBox").style.visibility = "visible";
      });
    });
  });
}

document.querySelector("#DialogueBox").addEventListener("click", (e) => {
  // console.log(item_used);
  // console.log("clicked");
  // console.log(queue.length);
  // console.log(queue);

  if (item_used) {
    //for attack turn while player uses an item
    if (queue.length > 0) {
      queue[0]();
      queue.shift();
    } else {
      item_used = false;

      // Only when queue is empty after item usage, show #BattleBox
      document.querySelector("#BattleBox").style.opacity = "1";
      document.querySelector("#BattleBox").style.visibility = "visible";

      //e.currentTarget.style.display = queue.length > 0 ? "block" : "none";
    }
  } else {
    if (queue.length > 0) {
      queue[0](); //calling the 0th index of queue i.e., the attack that was pushed in enemy queue
      queue.shift(); //popping the attack from enemy attack queue
    } else { e.currentTarget.style.display = queue.length > 0 ? "block" : "none"; }
  }
  //console.log(queue.length);
});

export function enemy_attacks(e) {
  let attack_happen_enemy = e.status_effect_nonDamage();

  if (attack_happen_enemy) {
    const randomAttack = e.attack[Math.floor(Math.random() * e.attack.length)];

    queue.push(() => {
      e.Attack({
        attack: randomAttack,
        recipient: partner,
        renderedSprites,
      });
      battle_end_check(partner);
      // console.log(queue.length);

      //check for status effect(damage type) at the end of both side attack
      if (partner.status === "BRND" || status_tracker === "BRND") {
        queue.push(() => {
          partner.status_effect_damage();
          battle_end_check(partner);
        });
      } 
      if (e.status === "BRND") {
        queue.push(() => {
          e.status_effect_damage();
          battle_end_check(e);
        });
      }
    });
  }
  //console.log("current: " + queue.length);
}

export function battle_end_check(e) {
  if (e.health <= 0) {
    // after each enemy attack check player monster's health
    queue.push(() => {
      e.faint();
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
}
