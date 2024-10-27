import { items } from './items.js'

export const playerItems = {
    bag: {
      restorative: [
        { item: items.potion, quantity: 3 },
        { item: items.super_potion, quantity: 3 },
      ],
    },
  };

  export function UseItemFromButton(event, button) {
    const category = event.currentTarget.getAttribute("data-category");
    const itemName = event.currentTarget.getAttribute("data-item");

    const itemCategory = playerItems.bag[category];
    const itemUsed = itemCategory.find(i => i.item.name === itemName);

    if(itemUsed && itemUsed.quantity > 0) {
        itemUsed.quantity--;
        button.innerHTML = itemName + " x " + itemUsed.quantity;
        console.log(itemName + " from category: " + category + " used & Remaining: " + itemUsed.quantity);
    } else {
        console.log(" No " + itemName + " left in category: " + category); 
    }
}

  