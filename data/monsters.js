 import { attacks } from './attacks.js'

export const playerMonsters = {
  emby : {
    name: "Emby",
    image: {
      src: "./img/embySprite.png",
    },
    attack: [attacks.Tackle, attacks.FireBall,attacks.DragonBreath],
    frames: {
      max: 4,
      hold: 60,
    },
    scale: 1,
    animate: true,
    isPartner: true,
    health: 150,
    status: "BRN",
},
}

export const monsters = {
    emby2 : {
        name: "Emby",
        image: {
          src: "./img/embySprite2.png",
        },
        attack: [attacks.Tackle, attacks.FireBall,attacks.DragonBreath],
        frames: {
          max: 4,
          hold: 60,
        },
        scale: 0.88,
        animate: true,
        isEnemy: true,
        health: 170,
        status: "NRML",
      },
    draggle : {
          name: "Draggle",
          image: {
            src: "./img/draggleSprite.png",
          },
          attack: [attacks.Tackle, attacks.FireBall,attacks.DragonBreath],
          frames: {
            max: 4,
            hold: 70,
          },
          scale: 0.88,
          animate: true,
          isEnemy: true,
          health: 160,
          status: "NRML",
        },
      draggle2 : {
          name: "Draggle",
          image: {
            src: "./img/draggleSprite2.png",
          },
          attack: [attacks.Tackle, attacks.FireBall,attacks.DragonBreath],
          frames: {
            max: 4,
            hold: 70,
          },
          scale: 0.88,
          animate: true,
          isEnemy: true,
          health: 180,
          status: "NRML",
        },
      terradon: {
          name: "Terradon",
          image: {
            src: "./img/TerradonSprite.png",
          },
          attack: [attacks.Tackle, attacks.FireBall,attacks.DragonBreath],
          frames: {
            max: 4,
            hold: 70,
          },
          scale: 1,
          animate: true,
          isEnemy: true,
          health: 180,
          status: "NRML",
        },
}

export function setPlayerMonsterPositions() {
  for (const key in playerMonsters) {
    const playermonster = playerMonsters[key];
    playermonster.position = {x: 300, y: 320,}
  }
}
setPlayerMonsterPositions();

export function setEnemyMonsterPositions() {
  for (const key in monsters) {
    const monster = monsters[key];
    monster.position = {x: 800, y: 110,}
  }   
}
setEnemyMonsterPositions();

export function getRandomMonster() {
  const monsterKeys = Object.keys(monsters); //gets the keys of the monsters in "monsters" object and stores in an array
  const randomKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
  return monsters[randomKey]; //returns a random monster
}
