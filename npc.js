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

// <------------- SAILOR ---------------- //
const sailorDownImage = new Image();
sailorDownImage.src = "./img/characters/npc/sailor/sailor_down.png";

const sailorUpImage = new Image();
sailorUpImage.src = "./img/characters/npc/sailor/sailor_up.png";

const sailorLeftImage = new Image();
sailorLeftImage.src = "./img/characters/npc/sailor/sailor_left.png";

const sailorRightImage = new Image();
sailorRightImage.src = "./img/characters/npc/sailor/sailor_right.png";

// -----------------------------------------> //

export const direction_img = [
  sailorDownImage,
  sailorUpImage,
  sailorLeftImage,
  sailorRightImage,
];

export let sailor1 = new Sprite({
  map: MAP.petalwood_island.name,
  position: {
    x: 508,
    y: 1212,
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

export let sailor2 = new Sprite({
  map: MAP.petalwood_island.name,
  position: {
    x: 1480,
    y: 1212,
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
  dialogue_available: {
    value: false,
    interact: false,
  },
  dialogue: {
    text_1: "Would ye like me to take ye to Evergrande Island now lil fella?",
  },
  scale: 0.65,
});

export const all_npcs = [sailor1, sailor2];

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
    let initialPos = {
      npc1: {
        x: 305,
        y: 120,
      },
    };

    let cameraOffset = {
      x: offset.x - background.position.x,
      y: offset.y - background.position.y,
    };

    if (cameraOffset.x !== 0 || cameraOffset.y !== 0) {
      initialPos.npc1.x -= cameraOffset.x;
      initialPos.npc1.y -= cameraOffset.y;
    }

    all_npcs.forEach((Npc) => {
      let movement_flag = Npc.isMoving;
      if (movement_flag) Npc.npc_movement(initialPos.npc1, Npc, player);

      if (npc_collision) {
        // gsap.to(dialogue_prompt.position, {
        //   x: Npc.position.x + 2,
        //   y: Npc.position.y - 35,
        // });

        let collidingNpcExist = colliding_npc[0] || false;
        if (collidingNpcExist) {
          dialogue_prompt.position.x = colliding_npc[0].position.x + 2;
          dialogue_prompt.position.y = colliding_npc[0].position.y - 35;
        }

        Npc.dialogue_available.value = true;
      } else Npc.dialogue_available.value = false;
    });

    thenTime = nowTime;
  }
}
// console.log("Npc pos: " + npc1.position.x + " " + npc1.position.y)
