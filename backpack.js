import { playerItems, UseItemFromButton } from "./data/playerBag.js";
import { partner, enemy, enemy_attacks } from "./initiateBattle.js";


//let item_used_bag = false;

export function load_backpack() {
  document.querySelector("#restorativeBox").replaceChildren();
  document.querySelector("#statusHealBox").replaceChildren();

  //loads the category objects from the player's bag
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

    //   document.querySelector("#back_overworld").addEventListener("click", () => {
    //     document.querySelector("#backpack").style.display = "none";
    //     document.querySelector("#Interface").style.display = "none";
    //   })

    //// Checks which item is used and takes action accordingly
    //   item_button.addEventListener("click", (e) => {
    //     if (
    //       categoryKey === "restoratives" &&
    //       partner.health < partner.maxHealth
    //     )
    //       item_used_bag = true;
    //     else if (
    //       item_button.getAttribute("data-item") === "Burn Heal" &&
    //       partner.status === "BRND"
    //     )
    //       item_used_bag = true;
    //     else if (
    //       item_button.getAttribute("data-item") === "Paralyze Heal" &&
    //       partner.status === "PRLZ"
    //     )
    //       item_used_bag = true;

    //     //console.log(item_button.getAttribute("data-item"))
    //     //console.log(item_used_bag);

    //     if (item_used_bag) {
    //       UseItemFromButton(e, item_button); //reduces quantity of item used

    //       document.querySelector("#backpack").style.display = "none";
    //       document.querySelector("#encounterBox").style.display = "none";
    //       document.querySelector("#BattleBox").style.opacity = "0";
    //       document.querySelector("#BattleBox").style.visibility = "hidden";

    //       if (categoryKey === "restoratives")
    //         document.querySelector("#DialogueBox").innerHTML =
    //           partner.name + "'s" + " HP has been restored! ";

    //       if (categoryKey === "status_heal")
    //         document.querySelector("#DialogueBox").innerHTML =
    //           partner.name + "'s" + " status has been restored! ";

    //       document.querySelector("#DialogueBox").style.display = "block";

    //       // Retrieves the entire item object that is selected
    //       const selectedItemObject = JSON.parse(
    //         e.currentTarget.getAttribute("data-item-object")
    //       );

    //       partner.useItem({
    //         ItemUsed: selectedItemObject,
    //       });

    //       if (partner.health > 0) {
    //         const randomAttackV2 =
    //           enemy.attack[Math.floor(Math.random() * enemy.attack.length)];

    //         // Enemy attacks upon using items
    //         enemy_attacks(enemy);
    //       }
    //     } else {
    //       document.querySelector("#description").innerHTML =
    //         "There is a time and place for each item!";
    //     }
    //   });

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
  //return item_used_bag;
}
