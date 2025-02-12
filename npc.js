import { Sprite } from "./classes.js";
import { gameLoaded } from "./gameState.js";
import { player, background, offset } from "./renderer.js";

const npc1DownImage = new Image();
npc1DownImage.src = "./img/playerDown.png";

const npc1UpImage = new Image();
npc1UpImage.src = "./img/playerUp.png";

const npc1LeftImage = new Image();
npc1LeftImage.src = "./img/playerLeft.png";

const npc1RightImage = new Image();
npc1RightImage.src = "./img/playerRight.png";

export const direction_img = [npc1DownImage, npc1UpImage, npc1LeftImage, npc1RightImage];

export let npc1 = new Sprite({
  position: {
    x: 305,
    y: 120,
  },
  image: npc1DownImage,
  npc_image_key: "down",
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: npc1UpImage,
    left: npc1LeftImage,
    right: npc1RightImage,
    down: npc1DownImage,
  },
  dialogue: {
    text_1: "Joemama so phat she could split the Earth into two if she jumps!",
    text_2: "Joemama so phat she could eat the entire chain of Mc Donalds!", 
  },
  scale: 0.75,
});
export let Npc1_Dialogue_Available = {
  value: false,
  interact: false,
};

export const all_npcs = [npc1]

// console.log(gameLoaded)

export function npc_sprite_upon_interaction() {
  if (!Npc1_Dialogue_Available.interact) return;

  const dx = player.position.x - npc1.position.x;
  const dy = player.position.y - npc1.position.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Player is to the left or right of NPC
    if (dx > 0) {
      npc1.image = npc1RightImage; // Player is to the right
      npc1.npc_image_key = "right";
    } else {
      npc1.image = npc1LeftImage; // Player is to the left
      npc1.npc_image_key = "left";
    }
  } else {
    // Player is above or below NPC
    if (dy > 0) {
      npc1.image = npc1DownImage; // Player is below
      npc1.npc_image_key = "down";
    } else {
      npc1.image = npc1UpImage; // Player is above
      npc1.npc_image_key = "up";
    }
  }
}



var thenTime = Date.now();
var nowTime;

export function checkNpcInteraction() {
  nowTime = Date.now();
  var deltaTime = nowTime - thenTime;
  var fps = 1;

  if(deltaTime > 1000 / fps) {
    let initialPosNpc1 = {
      x: 305,
      y: 120,
    };
  
    let cameraOffset = {
      x: (offset.x - background.position.x),
      y: (offset.y - background.position.y)
    };
  
    if (cameraOffset.x !== 0 || cameraOffset.y !== 0) {
      initialPosNpc1.x -= cameraOffset.x;
      initialPosNpc1.y -= cameraOffset.y;
    }
  
    let Npc1collide = npc1.npc_movement(initialPosNpc1, npc1, player, Npc1_Dialogue_Available.interact);
    // console.log(gameLoaded)
    
    if (Npc1collide && !Npc1_Dialogue_Available.value) {
      console.log("Talk");
      Npc1_Dialogue_Available.value = true;
    }

    thenTime = nowTime;
  }
  requestAnimationFrame(checkNpcInteraction); // Continue the loop
}


// console.log("Npc pos: " + npc1.position.x + " " + npc1.position.y)

