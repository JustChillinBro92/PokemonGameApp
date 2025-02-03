import { Sprite } from "./classes.js";
import { player, background, offset } from "./renderer.js";

const npc1DownImage = new Image();
npc1DownImage.src = "./img/playerDown.png";

const npc1UpImage = new Image();
npc1UpImage.src = "./img/playerUp.png";

const npc1LeftImage = new Image();
npc1LeftImage.src = "./img/playerLeft.png";

const npc1RightImage = new Image();
npc1RightImage.src = "./img/playerRight.png";

export const npc1 = new Sprite({
  position: {
    x: 305,
    y: 120,
  },
  image: npc1DownImage,
  frames: {
    max: 4,
    hold: 25,
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
  value: false
};

setInterval(() => {
    let initialPosNpc1 = {
      x: 305,
      y: 120,
    }

    let cameraOffset = {
      x: (offset.x - background.position.x),
      y: (offset.y - background.position.y)
    }

    if(cameraOffset.x != 0 || cameraOffset.y != 0) {
      initialPosNpc1.x -= cameraOffset.x;
      initialPosNpc1.y -= cameraOffset.y;
    }

   
    let Npc1collide = npc1.npc_movement(initialPosNpc1, npc1, player);
    console.log(Npc1collide)

    if(Npc1collide) {
      console.log("Talk");
      Npc1_Dialogue_Available.value = true;
    }

    // console.log("Offset: " + offset.x + " " + offset.y)
    // console.log("Background: " + background.position.x + " " + background.position.y)
    // console.log("Delta: " + cameraOffset.x + " " + cameraOffset.y)
}, 2000); // Moves every 2 second

// console.log("Npc pos: " + npc1.position.x + " " + npc1.position.y)

