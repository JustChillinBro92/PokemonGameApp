import { attacks } from "./attacks.js";

export let playerMonsters = {
  emby: {
    name: "Emby",
    image: {
      src: "./img/embySprite.png",
    },
    attack: [
      attacks.Tackle,
      attacks.ThunderWave,
      attacks.Twister,
      attacks.BurnUp,
    ],
    frames: {
      max: 4,
      hold: 60,
    },
    scale: 1.2,
    animate: true,
    isPartner: true,
    health: 45,
    type: 'Fire',
    level: 5,
    exp: 0,
    max_exp: max_exp(5),
    status: "NRML",
    stats: {
      ATK: 25,
      DEF: 20,
      SPD: 25,
      SDEF: 20,
      SATK: 30
    }
  },
};

export const monsters = {
  emby2: {
    name: "Emby",
    image: {
      src: "./img/embySprite2.png",
    },
    attack: [
      attacks.Tackle,
      attacks.FireBall,
      attacks.DragonBreath,
      attacks.BurnUp,
    ],
    frames: {
      max: 4,
      hold: 60,
    },
    scale: 1,
    animate: true,
    isEnemy: true,
    health: 45,
    type: 'Fire',
    level: getRandomLevel(5,11),
    base_exp_yield: 90,
    status: "NRML",
    stats: {
      ATK: 25,
      DEF: 20,
      SPD: 25,
      SDEF: 20,
      SATK: 30
    }
  },
  draggle: {
    name: "Draggle",
    image: {
      src: "./img/draggleSprite.png",
    },
    attack: [
      // attacks.Tackle,
      attacks.ThunderWave,
      // attacks.DragonBreath,
      // attacks.BurnUp,
    ],
    frames: {
      max: 4,
      hold: 70,
    },
    scale: 1,
    animate: true,
    isEnemy: true,
    health: 50,
    type: 'Dragon',
    level: getRandomLevel(5,11),
    base_exp_yield: 90,
    status: "NRML",
    stats: {
      ATK: 25,
      DEF: 20,
      SPD: 25,
      SDEF: 20,
      SATK: 30
    }
  },
  draggle2: {
    name: "Draggle",
    image: {
      src: "./img/draggleSprite2.png",
    },
    attack: [
      attacks.Tackle,
      attacks.FireBall,
      attacks.DragonBreath,
      attacks.BurnUp,
    ],
    frames: {
      max: 4,
      hold: 70,
    },
    scale: 1,
    animate: true,
    isEnemy: true,
    health: 55,
    type: 'Dragon',
    level: getRandomLevel(5,11),
    base_exp_yield: 90,
    status: "NRML",
    stats: {
      ATK: 25,
      DEF: 20,
      SPD: 25,
      SDEF: 20,
      SATK: 30
    }
  },
  terradon: {
    name: "Terradon",
    image: {
      src: "./img/TerradonSprite.png",
    },
    attack: [
      attacks.Tackle,
      attacks.FireBall,
      attacks.DragonBreath,
      attacks.BurnUp,
      ],
    frames: {
      max: 4,
      hold: 70,
    },
    scale: 1,
    animate: true,
    isEnemy: true,
    health: 65,
    type: 'Ground',
    level: getRandomLevel(5,11),
    base_exp_yield: 90,
    status: "NRML",
    stats: {
      ATK: 25,
      DEF: 20,
      SPD: 25,
      SDEF: 20,
      SATK: 30
    }
  },
};

export function setPlayerMonsterPositions() {
  for (const key in playerMonsters) {
    const playermonster = playerMonsters[key];
    playermonster.position = { x: 480, y: 470 };
  }
}
setPlayerMonsterPositions();

export function setEnemyMonsterPositions() {
  for (const key in monsters) {
    const monster = monsters[key];
    monster.position = { x: 1225, y: 190 };
  }
}
setEnemyMonsterPositions();

export function getRandomMonster() {
  const monsterKeys = Object.keys(monsters); //gets the keys of the monsters in "monsters" object and stores in an array
  const randomKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
  return monsters[randomKey]; //returns a random monster
}

function getRandomLevel(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; //Adding min shifts the range to start at min.
}

export function max_exp(current_level) {
  let L = current_level;
  return Math.floor(1.2*(L^3) - 15*(L^2) + 100*L - 140);
}