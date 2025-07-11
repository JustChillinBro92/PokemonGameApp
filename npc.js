import { Sprite } from "./classes.js";
import {
  player,
  background,
  offset,
  dialogue_prompt,
  npc_collision,
  colliding_npc,
} from "./renderer.js";
import { MAP } from "./data/map.js";

// <------------- NPC SPRITES ---------------- //

const sailorDownImage = new Image();
sailorDownImage.src = "./img/characters/npc/sailor/sailor_down.png";

const sailorUpImage = new Image();
sailorUpImage.src = "./img/characters/npc/sailor/sailor_up.png";

const sailorLeftImage = new Image();
sailorLeftImage.src = "./img/characters/npc/sailor/sailor_left.png";

const sailorRightImage = new Image();
sailorRightImage.src = "./img/characters/npc/sailor/sailor_right.png";

const fatGuyDownImage = new Image();
fatGuyDownImage.src = "./img/characters/npc/fat_guy/fat_guy_down.png";

const fatGuyUpImage = new Image();
fatGuyUpImage.src = "./img/characters/npc/fat_guy/fat_guy_up.png";

const fatGuyLeftImage = new Image();
fatGuyLeftImage.src = "./img/characters/npc/fat_guy/fat_guy_left.png";

const fatGuyRightImage = new Image();
fatGuyRightImage.src = "./img/characters/npc/fat_guy/fat_guy_right.png";

const oldManDownImage = new Image();
oldManDownImage.src = "./img/characters/npc/grandpa/grandpa_down.png";

const oldManUpImage = new Image();
oldManUpImage.src = "./img/characters/npc/grandpa/grandpa_up.png";

const oldManLeftImage = new Image();
oldManLeftImage.src = "./img/characters/npc/grandpa/grandpa_left.png";

const oldManRightImage = new Image();
oldManRightImage.src = "./img/characters/npc/grandpa/grandpa_right.png";

const oldLadyDownImage = new Image();
oldLadyDownImage.src = "./img/characters/npc/grandma/grandma_down.png";

const oldLadyUpImage = new Image();
oldLadyUpImage.src = "./img/characters/npc/grandma/grandma_up.png";

const oldLadyLeftImage = new Image();
oldLadyLeftImage.src = "./img/characters/npc/grandma/grandma_left.png";

const oldLadyRightImage = new Image();
oldLadyRightImage.src = "./img/characters/npc/grandma/grandma_right.png";

// -----------------------------------------> //

let oldman1 = new Sprite({
  id: "oldman1",
  name: "Mr. White",
  map: MAP.petalwood_island.name,
  position: {
    x: -2100,
    y: -123,
  },
  image: oldManRightImage,
  npc_image_key: "right",
  isMoving: false,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: oldManUpImage,
    left: oldManLeftImage,
    right: oldManRightImage,
    down: oldManDownImage,
  },
  dialogue: {
    text_1:
      "Quietly sitting out in the open while taking in nature's beauty is truly the bliss of old age!",
    text_2:
      "It's not like I was forced to accompany my wife or anything! Hahahaha...haha...ha...",
    text_3:
      "...shouldn't have stolen those cookies...*sigh*",
  },
  dialogue_available: {
    value: false,
    interact: false,
  },
  scale: 0.65,
});

let oldlady1 = new Sprite({
  id: "oldlady1",
  name: "Mrs. White",
  map: MAP.petalwood_island.name,
  position: {
    x: -1960,
    y: -123,
  },
  image: oldLadyLeftImage,
  npc_image_key: "left",
  isMoving: false,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: oldLadyUpImage,
    left: oldLadyLeftImage,
    right: oldLadyRightImage,
    down: oldLadyDownImage,
  },
  dialogue: {
    text_1:
      "Oh now that's a new face! We haven't gotten any new folks on this small island for a while now.",
    text_2:
      "My grandaughter would probably be around your age if she were around. Make yourself home kid!",
  },
  dialogue_available: {
    value: false,
    interact: false,
  },
  scale: 0.65,
});

let fatGuy1 = new Sprite({
  id: "fatGuy1",
  name: "Jeremy",
  map: MAP.petalwood_island.name,
  position: {
    x: -1850,
    y: -840,
  },
  image: fatGuyDownImage,
  npc_image_key: "down",
  isMoving: true,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: fatGuyUpImage,
    left: fatGuyLeftImage,
    right: fatGuyRightImage,
    down: fatGuyDownImage,
  },
  dialogue: {
    text_1:
      "I just caught my first pokemon the other day! So, I am thinking about challenging the Evergrande gym.",
    text_2:
      "I heard the gym specializes in ghost type pokemon! You would probably have a hard time without a psychic or a ghost type.",
  },
  dialogue_available: {
    value: false,
    interact: false,
  },
  scale: 0.65,
});

let sailor1 = new Sprite({
  id: "sailor1",
  name: "Sailor",
  map: MAP.petalwood_island.name,
  position: {
    x: -2300,
    y: 90,
  },
  image: sailorDownImage,
  npc_image_key: "down",
  isMoving: false,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: sailorUpImage,
    left: sailorLeftImage,
    right: sailorRightImage,
    down: sailorDownImage,
  },
  dialogue: {
    text_1:
      "Sorry kid the water around these parts have been pretty hefty lately. So, the boat to Trinity Island is not available right now!",
    text_2:
      "You should come back later! Maybe try visiting Evergrande Island in the meantime?",
  },
  dialogue_available: {
    value: false,
    interact: false,
  },
  scale: 0.65,
});

let sailor2 = new Sprite({
  id: "sailor2",
  name: "Sailor",
  map: MAP.petalwood_island.name,
  position: {
    x: -1325,
    y: 90,
  },
  image: sailorDownImage,
  npc_image_key: "down",
  isMoving: false,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: sailorUpImage,
    left: sailorLeftImage,
    right: sailorRightImage,
    down: sailorDownImage,
  },
  dialogue_available: {
    value: false,
    interact: false,
  },
  onetimeDialogue: {
    dialogue: {
      text_1:
        "Heya lil fella whats with the face? Ye seem to be pretty lost about moving further eh?",
      text_2:
        "Well worry not son cuz this nice old man can take ye for a ride to the next island!",
      text_3:
        "But how about ye explore around these parts here first? Might find something interesting!",
    },
    triggered: false,
  },
  randomDialogue: {
    dialogue: {
      text_1:
        "Hold tight pal we are on a tight schedule today. Reaching Evergrande in a minute.",
      text_2:
        "So how's yer day been lad? Enjoyin the weather here? Maybe try getting a tan next time eh?",
      text_3:
        "Rumour has it ye can spot a ghost sometimes in Evergrande! Be careful at night lil fella.",
      text_4:
        "If you run into mah brothers on yer way make sure to say hi. Can't miss em, they look just like me.",
    },
    triggered: false,
  },
  dialogue: {
    text_1: "Would ye like me to take ye to Evergrande Island now lil fella?",
  },
  yes_no_choice: true,
  triggerTeleport: {
    area: MAP.evergrande_island,
  },
  scale: 0.65,
});

let sailor3 = new Sprite({
  id: "sailor3",
  name: "Sailor",
  map: MAP.petalwood_island.name,
  position: {
    x: 800,
    y: 272,
  },
  image: sailorDownImage,
  npc_image_key: "down",
  isMoving: false,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: sailorUpImage,
    left: sailorLeftImage,
    right: sailorRightImage,
    down: sailorDownImage,
  },
  dialogue_available: {
    value: false,
    interact: false,
  },
  randomDialogue: {
    dialogue: {
      text_1:
        "Hold tight pal we are on a tight schedule today. Reaching Evergrande in a minute.",
      text_2:
        "So how's yer day been lad? Enjoyin the weather here? Maybe try getting a tan next time eh?",
      text_3:
        "Rumour has it ye can spot a ghost sometimes in Evergrande! Be careful at night lil fella.",
      text_4:
        "If you run into mah brothers on yer way make sure to say hi. Can't miss em, they look just like me.",
    },
    triggered: false,
  },
  dialogue: {
    text_1: "Would ye like me to take ye to Evergrande Island now lil fella?",
  },
  yes_no_choice: true,
  triggerTeleport: {
    area: MAP.evergrande_island,
  },
  scale: 0.65,
});

export const all_npcs = [oldman1, oldlady1, fatGuy1, sailor1, sailor2, sailor3];

export function npc_sprite_upon_interaction(npc) {
  if (!npc.dialogue_available.interact) return;

  const dx = player.position.x - npc.position.x;
  const dy = player.position.y - npc.position.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      npc.image = npc.sprites.right; // Player is to the right
      npc.npc_image_key = "right";
    } else {
      npc.image = npc.sprites.left; // Player is to the left
      npc.npc_image_key = "left";
    }
  } else {
    if (dy > 0) {
      npc.image = npc.sprites.down; // Player is below
      npc.npc_image_key = "down";
    } else {
      npc.image = npc.sprites.up; // Player is above
      npc.npc_image_key = "up";
    }
  }
}

var thenTime = Date.now();
var nowTime;

export function checkNpcInteraction() {
  nowTime = Date.now();
  var deltaTime = nowTime - thenTime;

  if (deltaTime > 1000) {
    let initialPosNpc = {
      fatGuy1: {
        x: -1850,
        y: -840,
      },
    };

    let cameraOffset = {
      x: offset.x - background.position.x,
      y: offset.y - background.position.y,
    };

    if (cameraOffset.x !== 0 || cameraOffset.y !== 0) {
      initialPosNpc.fatGuy1.x -= cameraOffset.x;
      initialPosNpc.fatGuy1.y -= cameraOffset.y;
    }

    for (let Npc of all_npcs) {
      let movement_flag = Npc.isMoving;

      if (movement_flag) Npc.npc_movement(Npc, player, initialPosNpc);

      if (npc_collision) {
        // gsap.to(dialogue_prompt.position, {
        //   x: Npc.position.x + 2,
        //   y: Npc.position.y - 35,
        // });

        let collidingNpcExist = colliding_npc[0] || false;
        if (collidingNpcExist) {
          dialogue_prompt.position.x = collidingNpcExist.position.x + 6;
          dialogue_prompt.position.y = collidingNpcExist.position.y - 35;
        }

        Npc.dialogue_available.value = true;
      } else Npc.dialogue_available.value = false;
    }
    thenTime = nowTime;
  }
}
// console.log("Npc pos: " + npc1.position.x + " " + npc1.position.y)
