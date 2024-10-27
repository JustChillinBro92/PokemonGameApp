import { Sprite } from "./classes.js";
import { renderedSprites } from "./initiateBattle.js";

const BattleBackgroundImg = new Image();
BattleBackgroundImg.src = "./img/battleBackground.png";

const BattleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: BattleBackgroundImg,
});


export let animateBattleId;

export function animateBattle() {
  animateBattleId = window.requestAnimationFrame(animateBattle);
  //console.log("animating battle sequence");
  BattleBackground.draw();

  //rendering all the monsters and their attacks
  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}
