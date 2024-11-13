import { items } from './items.js'

export const playerItems = {
    bag: {
      restoratives: [
        { item: items.potion, quantity: 3 },
        { item: items.super_potion, quantity: 3 },
      ],
      status_heal : [
        { item: items.burn_heal, quantity: 3 },
        { item: items.paralyze_heal, quantity: 3 },
      ]
    },
  };

  export function UseItemFromButton(e, button) {
    const category = e.currentTarget.getAttribute("data-category");
    const itemName = e.currentTarget.getAttribute("data-item");

    const itemCategory = playerItems.bag[category];
    const itemUsed = itemCategory.find(i => i.item.name === itemName);

    if(itemUsed && itemUsed.quantity > 1) {
        itemUsed.quantity--;
        button.innerHTML = itemName + " x " + itemUsed.quantity;

        console.log(itemName + " from category: " + category + " used & Remaining: " + itemUsed.quantity);
    } else {
        button.remove();
    }

}

  