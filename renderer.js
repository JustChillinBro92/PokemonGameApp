import { Boundary, Sprite, stats_tracker } from "./classes.js";
import { audio } from "./data/audio.js";
import { initBattle } from "./initiateBattle.js";
import { animateBattle } from "./battlescene.js";
import { load_backpack } from "./backpack.js";
import { gameState, gameLoaded } from "./gameState.js";
import { savegame, loadgame } from "./save_load.js";
import { virtualSeconds } from "./day_night.js";
import {
  all_npcs,
  checkNpcInteraction,
  npc_sprite_upon_interaction,
} from "./npc.js";
import { maploaded } from "./main_menu.js";
import { MAP } from "./data/map.js";

//LOAD OVERWORLD BACKPACK
load_backpack();

let collisionsMap = [];
let area_loaded = MAP.petalwood_island;
let area_map = area_loaded.map;
let map_width = area_loaded.width;

let interactablesCollisionsMap = [];
let interactable_map = area_loaded.interactables;

let battleZonesMap = [];
let grass_map = area_loaded.grass;

export let boundaries = [];
export let interactables_boundaries = [];
export let offset = { x: maploaded.data.camera.x, y: maploaded.data.camera.y };

export let battleZones = [];
export let grass_tiles = [];

const grass = new Image();
grass.src = "./img/animated_objects/animated_grass.png";

const campfire = new Image();
campfire.src = "./img/animated_objects/campfire.png";

const street_light = new Image();
street_light.src = "./img/animated_objects/street_light3.png";

// <-------------------- BACKGROUND & FOREGROUND ------------------------ //

const backgroundimage = new Image();
backgroundimage.src = maploaded.data.background_image;

const foregroundimage = new Image();
foregroundimage.src = maploaded.data.foreground_image;

// ------------------------------------------------------------------> //

// <----------------- PLAYER SPRITE -------------------------------- //

const playerDownImage = new Image();
playerDownImage.src = "./img/characters/player/player_downV2.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/characters/player/player_upV2.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/characters/player/player_leftV2.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/characters/player/player_rightV2.png";

const playerRight_HalfImage = new Image();
playerRight_HalfImage.src = "./img/playerRight_Half.png";

const playerLeft_HalfImage = new Image();
playerLeft_HalfImage.src = "./img/playerLeft_Half.png";

const playerDown_HalfImage = new Image();
playerDown_HalfImage.src = "./img/playerDown_Half.png";

const playerUp_HalfImage = new Image();
playerUp_HalfImage.src = "./img/playerUp_Half.png";

// -----------------------------------------------------------------> //

export const player = new Sprite({
  position: {
    x: 704.8,
    y: 270,
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
  scale: 0.65,
});

export let background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: backgroundimage,
});

export let foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundimage,
});

const dialogue_prompt_img = new Image();
dialogue_prompt_img.src = "./img/animated_objects/dialogue_prompt.png";

export const dialogue_prompt = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: dialogue_prompt_img,
  frames: {
    max: 4,
    hold: 24,
  },
  animate: true,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  Enter: {
    pressed: false,
  },
  e: {
    pressed: false,
  },
};

let movables = [
  dialogue_prompt,
  background,
  foreground,
  ...boundaries,
  ...interactables_boundaries,
  ...battleZones,
  ...grass_tiles,
];

export let map_npcs = [];
export let colliding_npc = [];

let animated_objects = maploaded.data?.animated_objects || false;
// console.log(animated_objects);

export let map_campfire = [];
let street_lightMap = [];
export let street_light_tiles = [];

// console.log(movables);

function RectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y + rectangle1.height / 2 <=
      rectangle2.position.y + rectangle2.height
  );
}

function GrassRectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width / 2 >= rectangle2.position.x &&
    rectangle1.position.x + rectangle1.width / 2 <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height / 2 >= rectangle2.position.y &&
    rectangle1.position.y + rectangle1.height <=
      rectangle2.position.y + rectangle2.height
  );
}

export const battle = {
  initiated: false,
};

export let npc_collision = false;

let pause = false;

let grassAudioPlay = false;
export let menu = false; // user menu

var then = Date.now();
var now;

let animateId;

load_map(MAP.petalwood_island);

export function animate() {
  now = Date.now();
  var deltaTime = now - then;
  var fps = 90;

  const global_time = Math.floor((virtualSeconds.value / 3600) % 24);

  // Animation logic...
  animateId = window.requestAnimationFrame(animate);
  // console.log("animate");

  if (pause) {
    window.cancelAnimationFrame(animateId);

    gsap.to("#OverlappingDiv", {
      opacity: 1,
      duration: 0.04,
      onComplete() {
        pause = false;

        gsap.to("#OverlappingDiv", {
          opacity: 0,
          delay: 0.4,
        });
        animate();
      },
    });
  }

  if (deltaTime > 1000 / fps) {
    background.draw();

    boundaries.forEach((boundary) => {
      boundary.draw();
    });

    interactables_boundaries.forEach((interactable_Boundary) => {
      interactable_Boundary.draw();
    });

    battleZones.forEach((battleZone) => {
      battleZone.draw();
    });

    grass_tiles.forEach((grass) => {
      grass.draw();
    });

    for (let npc of map_npcs) {
      npc.draw();
      checkNpcInteraction();

      let prompt_Npc = colliding_npc[0] || false;
      if (prompt_Npc && prompt_Npc.dialogue_available.value)
        dialogue_prompt.draw();
    }

    player.draw();

    foreground.draw();

    // light source animated objects

    let radius, vibe, alpha;
    if (global_time >= 19 || global_time <= 3) {
      if (map_campfire) {
        map_campfire.forEach((campfire) => {
          (radius = 50), (vibe = "screen"), (alpha = 1);
          campfire.draw_light(
            campfire.position.x + 20,
            campfire.position.y + 25,
            radius,
            vibe,
            alpha
          );

          campfire.draw();
        });
      }

      street_light_tiles.forEach((street_light) => {
        (radius = 130), (vibe = "lighter"), (alpha = 0.7);
        street_light.draw_light(
          street_light.position.x + 45,
          street_light.position.y + 45,
          radius,
          vibe,
          alpha
        );

        street_light.draw();
      });
    }

    let moving = true; // for collison blocks
    player.animate = false; // for player movement animation

    if (battle.initiated) return;

    let inGrass = false;
    // if (!inGrass) {
    //   player.sprites.right = playerRightImage;
    //   player.sprites.left = playerLeftImage;
    //   player.sprites.down = playerDownImage;
    //   player.sprites.up = playerUpImage;
    // }

    //activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
      for (let i = 0; i < battleZones.length; i++) {
        const battleZone = battleZones[i];

        const OverlappingArea =
          (Math.min(
            player.position.x + player.width,
            battleZone.position.x + battleZone.width
          ) -
            Math.max(player.position.x, battleZone.position.x)) *
          (Math.min(
            player.position.y + player.height,
            battleZone.position.y + battleZone.height
          ) -
            Math.max(player.position.y, battleZone.position.y));

        if (
          GrassRectangularCollision({
            rectangle1: player,
            rectangle2: battleZone,
          })
        ) {
          console.log("Grass");

          // inGrass = true;
          // player.sprites.right = playerRight_HalfImage;
          // player.sprites.left = playerLeft_HalfImage;
          // player.sprites.down = playerDown_HalfImage;
          // player.sprites.up = playerUp_HalfImage;

          if (!grassAudioPlay) {
            grassAudioPlay = true;
            audio.grass.play();
          }

          setTimeout(() => {
            grassAudioPlay = false;
          }, 100);

          let encounter_rate = Math.random();
          // console.log(encounter_rate);

          if (encounter_rate < 0.02) {
            //console.log("battleZone Activate");
            window.cancelAnimationFrame(animateId);
            audio[maploaded.data.id].stop();

            battle.initiated = true;
            keys_active.val = false;

            audio.initBattle.play();
            audio.battle.play();

            //flashing animation on battle activation
            gsap.to("#OverlappingDiv", {
              opacity: 1,
              repeat: 3,
              yoyo: true, //smoothes out animation by bringing counter to 0 i.e., default state
              duration: 0.4,
              onComplete() {
                gsap.to("#OverlappingDiv", {
                  opacity: 1,
                  duration: 0.4,
                  onComplete() {
                    initBattle();
                    animateBattle();

                    gsap.to("#OverlappingDiv", {
                      opacity: 0,
                      duration: 0.4,
                    });
                  },
                });
              },
            });
            break;
          }
        }
      }
    }

    if (keys.w.pressed && lastkey === "w") {
      player.animate = true;
      player.image = player.sprites.up;

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        //regular collision check
        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y + 3,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      //door collision check
      for (let i = 0; i < interactables_boundaries.length; i++) {
        const interactable_boundary = interactables_boundaries[i];

        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...interactable_boundary,
              position: {
                x: interactable_boundary.position.x,
                y: interactable_boundary.position.y + 3,
              },
            },
          })
        ) {
          console.log(interactable_boundary.id);
          moving = false;
          break;
        }
      }

      //npc collision check
      for (let npc of map_npcs) {
        const isColliding = RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...npc,
            position: {
              x: npc.position.x,
              y: npc.position.y + 3,
            },
          },
        });

        if (isColliding) {
          npc_collision = true;
          colliding_npc[0] = npc;

          moving = false;
          break;
        }
      }

      if (moving === true) {
        npc_collision = false;
        colliding_npc.length = 0;

        movables.forEach((movable) => {
          movable.position.y += 3;
        });
      }
    } else if (keys.a.pressed && lastkey === "a") {
      player.animate = true;
      player.image = player.sprites.left;

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        //regular collision check
        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x + 3,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      //door collision check
      for (let i = 0; i < interactables_boundaries.length; i++) {
        const interactable_boundary = interactables_boundaries[i];

        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...interactable_boundary,
              position: {
                x: interactable_boundary.position.x + 3,
                y: interactable_boundary.position.y,
              },
            },
          })
        ) {
          console.log(interactable_boundary.id);
          moving = false;
          break;
        }
      }

      //npc collision check
      for (let npc of map_npcs) {
        const isColliding = RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...npc,
            position: {
              x: npc.position.x + 3,
              y: npc.position.y,
            },
          },
        });

        if (isColliding) {
          npc_collision = true;
          colliding_npc[0] = npc;

          moving = false;
          break;
        }
      }

      if (moving === true) {
        npc_collision = false;
        colliding_npc.length = 0;

        movables.forEach((movable) => {
          movable.position.x += 3;
        });
      }
    } else if (keys.s.pressed && lastkey === "s") {
      player.animate = true;
      player.image = player.sprites.down;

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        //regular collision check
        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y - 3,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      //door collision check
      for (let i = 0; i < interactables_boundaries.length; i++) {
        const interactable_boundary = interactables_boundaries[i];

        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...interactable_boundary,
              position: {
                x: interactable_boundary.position.x,
                y: interactable_boundary.position.y - 3,
              },
            },
          })
        ) {
          console.log(interactable_boundary.id);
          moving = false;
          break;
        }
      }

      //npc collision check
      for (let npc of map_npcs) {
        const isColliding = RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...npc,
            position: {
              x: npc.position.x,
              y: npc.position.y - 3,
            },
          },
        });

        if (isColliding) {
          npc_collision = true;
          colliding_npc[0] = npc;

          moving = false;
          break;
        }
      }

      if (moving === true) {
        npc_collision = false;
        colliding_npc.length = 0;

        movables.forEach((movable) => {
          movable.position.y -= 3;
        });
      }
    } else if (keys.d.pressed && lastkey === "d") {
      player.animate = true;
      player.image = player.sprites.right;

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        //regular collision check
        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x - 3,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      //door collision check
      for (let i = 0; i < interactables_boundaries.length; i++) {
        const interactable_boundary = interactables_boundaries[i];

        if (
          RectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...interactable_boundary,
              position: {
                x: interactable_boundary.position.x - 3,
                y: interactable_boundary.position.y,
              },
            },
          })
        ) {
          console.log(interactable_boundary.id);
          moving = false;
          break;
        }
      }

      //npc collision check
      for (let npc of map_npcs) {
        const isColliding = RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...npc,
            position: {
              x: npc.position.x - 3,
              y: npc.position.y,
            },
          },
        });

        if (isColliding) {
          npc_collision = true;
          colliding_npc[0] = npc;

          moving = false;
          break;
        }
      }

      if (moving === true) {
        npc_collision = false;
        colliding_npc.length = 0;

        movables.forEach((movable) => {
          movable.position.x -= 3;
        });
      }
    }

    then = now;
  }
}

let lastkey = "";
export let keys_active = { val: true };
let bag_open = false;

// Handle opening the menu
function openMenu() {
  if (bag_open) return; // Prevent opening the menu if the bag is open
  audio.button_press.play();

  menu = true;
  keys_active.val = false;

  gsap.from("#MenuBox", {
    opacity: 0,
    duration: 0.3,
  });
  document.querySelector("#MenuBox").style.display = "block";
  document.querySelector("#clockContainer").style.display = "block";
}

// Handle closing the menu
function closeMenu() {
  if (bag_open) return; // Prevent closing the menu if the bag is open
  audio.button_press.play();

  menu = false;
  keys_active.val = true;
  lastkey = "";

  document.querySelector("#MenuBox").style.display = "none";
  document.querySelector("#clockContainer").style.display = "none";
}

//saving the game
document.querySelector("#save").addEventListener("click", () => {
  savegame();
});

export let npc_direction = [];
export let map_id = {
  value: maploaded.data.id,
};

//loading the game
document.querySelector("#load").addEventListener("click", () => {
  loadgame();
  closeMenu();

  if (gameLoaded.onload) {
    pause = true;

    // reload bag
    load_backpack();
  }
});

// Handle opening the bag
document.querySelector("#menu-bag").addEventListener("click", () => {
  if (!menu) return;
  if (bag_open) return;

  bag_open = true;

  document.querySelector("#Interface").style.display = "block";
  document.querySelector("#backBox").style.opacity = "1";
  document.querySelector("#player_health").style.opacity = "0";
  document.querySelector("#enemy_health").style.opacity = "0";

  gsap.from("#backpack", {
    opacity: 0.6,
    duration: 0.3,
  });
  document.querySelector("#backpack").style.display = "block";

  // Close the bag and return to the overworld
  document.querySelector("#back_overworld").addEventListener("click", () => {
    bag_open = false;

    document.querySelector("#backpack").style.display = "none";

    if (battle.initiated) return;
    document.querySelector("#Interface").style.display = "none";
  });
});

// Handle exiting the menu
document.querySelector("#menu-exit").addEventListener("click", () => {
  if (!bag_open) closeMenu(); // Only close the menu if the bag is not open
});

// Handle opening and closing of dialogue
let randomDialogue_flag = false;

function OpenDialogue(npc) {
  let interval;
  keys_active.val = false;

  let NpcDialogueBox = document.querySelector("#OverworldDialogueBoxContainer");
  let NpcDialogue = document.querySelector("#OverworldDialogueBox");
  let YesNo_ChoiceBox = document.querySelector("#yes_no_Box");
  let yes = document.querySelector("#yes");
  let no = document.querySelector("#no");

  document.querySelectorAll(".npc_name").forEach((e) => {
    e.textContent = npc.name;
  });

  if (npc.name.length < 7) NpcDialogue.style.left = 14 + "%";
  else NpcDialogue.style.left = 20 + "%";

  let teleport = npc.triggerTeleport?.area || false;

  let oneTime_available = npc.onetimeDialogue;
  let onetimeDialogue, onetimeDialogue_triggerd, onetimeDialogue_array;
  onetimeDialogue_triggerd = npc.onetimeDialogue?.triggered || false;

  if (oneTime_available && !onetimeDialogue_triggerd) {
    onetimeDialogue = npc.onetimeDialogue.dialogue;
    onetimeDialogue_array = Object.values(onetimeDialogue);
  }

  let NpcRandomDialogueBox, NpcRandomDialogue;
  let randomDialogue_available = npc.randomDialogue;
  let randomDialogue_array_total, randomDialogue, randomDialogue_array;
  let randomDialogue_triggered;

  if (randomDialogue_available && !randomDialogue_flag) {
    NpcRandomDialogueBox = document.querySelector(
      "#OverlappingDialogueBoxContainer"
    );
    NpcRandomDialogue = document.querySelector("#OverlappingDialogueBox");

    if (npc.name.length < 10) NpcRandomDialogue.style.left = 14 + "%";
    else NpcRandomDialogue.style.left = 20 + "%";

    randomDialogue_triggered = npc.randomDialogue.triggered;

    randomDialogue = npc.randomDialogue.dialogue;
    randomDialogue_array_total = Object.values(randomDialogue);

    randomDialogue_array = [
      randomDialogue_array_total[
        Math.floor(Math.random() * randomDialogue_array_total.length)
      ],
    ];
  }

  let dialogue = npc.dialogue;
  let dialogue_array = Object.values(dialogue);

  let dialogue_index = 0;
  let typing = false;

  function CloseDialogue() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    NpcDialogueBox.onclick = null; // Prevent additional clicks
    NpcDialogueBox.style.display = "none";

    keys_active.val = true;

    if (NpcRandomDialogueBox) {
      NpcRandomDialogueBox.onclick = null;
      NpcRandomDialogueBox.style.display = "none";
      document.querySelector("#OverlappingDiv").style.pointerEvents = "none";
    }

    if (oneTime_available) npc.onetimeDialogue.triggered = true;

    npc.dialogue_available.value = false;
    npc.dialogue_available.interact = false;

    colliding_npc.pop();
  }

  function startRandomDialogue() {
    if (!randomDialogue_available) return;
    randomDialogue_flag = true;

    dialogue_index = 0;
    NpcRandomDialogue.innerHTML = "";
    NpcRandomDialogueBox.style.display = "flex";
    document.querySelector("#OverlappingDiv").style.pointerEvents = "auto";

    NpcRandomDialogueBox.onclick = () => {
      if (!typing) {
        audio.button_press.play();
        NextDialogue();
      }
    };
    NextDialogue();
  }

  function NextDialogue() {
    let current_text = null;

    // Handle one-time dialogue
    if (onetimeDialogue_array && !onetimeDialogue_triggerd) {
      if (dialogue_index >= onetimeDialogue_array.length) {
        CloseDialogue();
        return;
      }
      current_text = onetimeDialogue_array[dialogue_index];
    }

    // Handle normal dialogue
    else if (!randomDialogue_flag) {
      if (dialogue_index >= dialogue_array.length) {
        CloseDialogue();
        if (randomDialogue_available && randomDialogue_triggered)
          startRandomDialogue();
        return;
      }
      current_text = dialogue_array[dialogue_index];
    }

    // Handle random dialogue
    else if (randomDialogue_flag) {
      if (dialogue_index >= randomDialogue_array.length) {
        CloseDialogue();
        randomDialogue_flag = false;
        document.dispatchEvent(new Event("disable_overlay"));
        return;
      }
      current_text = randomDialogue_array[dialogue_index];
    }

    // Reset and type the current_text
    let char_index = 0;
    typing = true;
    NpcDialogue.innerHTML = "";

    interval = setInterval(() => {
      if (char_index < current_text.length) {
        if (randomDialogue_flag) {
          NpcRandomDialogue.innerHTML += current_text[char_index];
        } else {
          NpcDialogue.innerHTML += current_text[char_index];
        }
        char_index++;
      } else {
        clearInterval(interval);
        typing = false;
        dialogue_index++;

        // Handle Yes/No choice after full text
        if (
          !randomDialogue_flag &&
          !onetimeDialogue_array &&
          npc.yes_no_choice
        ) {
          YesNo_ChoiceBox.style.display = "flex";

          yes.onclick = () => {
            YesNo_ChoiceBox.style.display = "none";
            randomDialogue_triggered = true;

            clearInterval(interval);
            typing = false;
            dialogue_index++;
            NextDialogue();

            if (teleport) {
              audio[maploaded.data.id].stop();
              load_map(teleport);
            }
            randomDialogue_triggered = false;
          };

          no.onclick = () => {
            YesNo_ChoiceBox.style.display = "none";
            randomDialogue_triggered = false;

            clearInterval(interval);
            typing = false;
            dialogue_index++;
            NextDialogue();
          };
          return;
        }
      }
    }, 20);
  }

  // Initial click binding
  NpcDialogueBox.onclick = () => {
    if (!typing) {
      audio.button_press.play();
      NextDialogue();
    }
  };

  NpcDialogueBox.style.display = "flex";
  NextDialogue();
}

export function OpenSceneDialogue(speaker, newGame) {
  let interval;
  keys_active.val = false;

  let DialogueBox = document.querySelector("#OverworldDialogueBoxContainer");
  let Dialogue = document.querySelector("#OverworldDialogueBox");

  let OverlapDialogueBox = document.querySelector(
    "#OverlappingDialogueBoxContainer"
  );
  let OverlapDialogue = document.querySelector("#OverlappingDialogueBox");

  document.querySelectorAll(".npc_name").forEach((e) => {
    e.textContent = speaker.name;
  });

  if (speaker.name.length < 7) OverlapDialogue.style.left = 14 + "%";
  else OverlapDialogue.style.left = 20 + "%";

  let dialogue_type = speaker.dialogue_type;
  let dialogue = speaker.dialogue;
  let dialogue_array = Object.values(dialogue);

  let dialogue_index = 0;
  let typing = false;

  function CloseDialogue() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    if (dialogue_type === "overlap") {
      OverlapDialogueBox.onclick = null; // Prevent additional clicks
      OverlapDialogueBox.style.display = "none";
      document.querySelector("#OverlappingDiv").style.pointerEvents = "none";
      document.dispatchEvent(new Event("disable_overlay"));

      if (newGame) document.dispatchEvent(new Event("start_anim"));
    } else {
      DialogueBox.onclick = null; // Prevent additional clicks
      DialogueBox.style.display = "none";
    }

    keys_active.val = true;
  }

  function NextDialogue() {
    let current_text = null;

    if (dialogue_index >= dialogue_array.length) {
      CloseDialogue();
      return;
    }
    current_text = dialogue_array[dialogue_index];

    let char_index = 0;
    typing = true;
    if (dialogue_type === "overlap") OverlapDialogue.innerHTML = "";
    else Dialogue.innerHTML = "";

    interval = setInterval(() => {
      if (char_index < current_text.length) {
        if (dialogue_type === "overlap")
          OverlapDialogue.innerHTML += current_text[char_index];
        else Dialogue.innerHTML += current_text[char_index];

        char_index++;
      } else {
        clearInterval(interval);
        typing = false;
        dialogue_index++;
      }
    }, 20);
  }

  // Initial click binding
  OverlapDialogueBox.onclick = () => {
    if (!typing) {
      audio.button_press.play();
      NextDialogue();
    }
  };

  DialogueBox.onclick = () => {
    if (!typing) {
      audio.button_press.play();
      NextDialogue();
    }
  };

  if (dialogue_type === "overlap") {
    OverlapDialogueBox.style.display = "flex";
    document.querySelector("#OverlappingDiv").style.pointerEvents = "auto";
  } else DialogueBox.style.display = "flex";
  NextDialogue();
}

// LOADING MAP FUNCTION

export function load_map(new_map_data) {
  maploaded.data = new_map_data;

  if (!gameLoaded.onload) {
    window.cancelAnimationFrame(animateId);
    let overlayListenerAdded = false;

    gsap.to("#OverlappingDiv", {
      opacity: 1,
      duration: 0.3,
      onComplete: () => {
        //Attach listener ONLY ONCE after fade-in completes
        // if (!overlayListenerAdded) {
        //   document.addEventListener("disable_overlay", handleOverlayDisable);
        //   overlayListenerAdded = true;
        // }
        handleOverlayDisable();
      },
    });

    function handleOverlayDisable() {
      animate();
      gsap.to("#OverlappingDiv", {
        opacity: 0,
        duration: 0.2,
        delay: 1,
        onComplete: () => {
          audio[maploaded.data.id].play();
          document.querySelector("#map_name").innerHTML = maploaded.data.name;

          gsap.to("#map_name", {
            top: "2%",
            bottom: "85%",
            duration: 0.6,
            onComplete: () => {
              gsap.to("#map_name", {
                top: "-20%",
                bottom: "101%",
                delay: 3,
              });
            },
          });
          document.removeEventListener("disable_overlay", handleOverlayDisable);
        },
      });
    }
  }

  // console.log(new_map_data);

  offset.x = maploaded.data.camera.x;
  offset.y = maploaded.data.camera.y;

  collisionsMap.length = 0;
  area_loaded = maploaded.data;
  area_map = area_loaded.map;
  map_width = area_loaded.width;

  interactablesCollisionsMap.length = 0;
  interactable_map = area_loaded.interactables;

  battleZonesMap.length = 0;
  grass_map = area_loaded.grass;

  for (let i = 0; i <= area_map.length; i += map_width) {
    collisionsMap.push(area_map.slice(i, map_width + i));
    interactablesCollisionsMap.push(interactable_map.slice(i, map_width + i));
    battleZonesMap.push(grass_map.slice(i, map_width + i));
  }

  // for (let i = 0; i <= grass_map.length; i += map_width) {
  //   battleZonesMap.push(grass_map.slice(i, map_width + i));
  // }

  boundaries.length = 0;
  interactables_boundaries.length = 0;

  collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
      if (symbol === 1025)
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
          })
        );
    });
  });

  let interactable_id = 1;
  interactablesCollisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
      if (symbol === 1025) {
        interactables_boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
            id: interactable_id,
          })
        );

        if (row[j + 1] != 1025) interactable_id += 1;
      }
    });
  });

  battleZones.length = 0;
  grass_tiles.length = 0;

  battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
      if (symbol === 1025) {
        battleZones.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
          })
        );

        grass_tiles.push(
          new Sprite({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
            image: grass,
            frames: {
              max: 8,
              hold: 8,
            },
            animate: true,
            scale: 1.2,
          })
        );
      }
    });
  });

  background.position.x = offset.x;
  background.position.y = offset.y;

  foreground.position.x = offset.x;
  foreground.position.y = offset.y;

  background.image.src = maploaded.data.background_image;
  foreground.image.src = maploaded.data.foreground_image;

  movables.length = 0;

  movables = [
    dialogue_prompt,
    background,
    foreground,
    ...boundaries,
    ...interactables_boundaries,
    ...battleZones,
    ...grass_tiles,
  ];

  map_npcs.length = 0;
  all_npcs.forEach((npc) => {
    let current_map = maploaded.data.name;

    if (npc.map === current_map) {
      movables.push(npc);
      map_npcs.push(npc);
    }
  });

  animated_objects = maploaded.data?.animated_objects || false;

  map_campfire.length = 0;
  (street_lightMap.length = 0), (street_light_tiles.length = 0);

  Object.keys(animated_objects).forEach((object) => {
    if (object === "campfire") {
      map_campfire = animated_objects[object].position;

      map_campfire = map_campfire.map(
        (position) =>
          new Sprite({
            position: { x: offset.x + position.x, y: offset.y + position.y },
            image: campfire,
            scale: 1,
            frames: {
              max: 4,
              hold: 8,
            },
            animate: true,
          })
      );

      map_campfire.forEach((campfire) => {
        movables.push(campfire);
      });
    } else if (object === "street_light") {
      let map_streetLight = animated_objects[object];

      for (let i = 0; i <= map_streetLight.length; i += map_width) {
        street_lightMap.push(map_streetLight.slice(i, map_width + i));
      }
    }
  });

  if (street_lightMap.length) {
    street_lightMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          street_light_tiles.push(
            new Sprite({
              position: {
                x: j * Boundary.width + offset.x - 27,
                y: i * Boundary.height + offset.y - 60,
              },
              image: street_light,
              frames: {
                max: 6,
                hold: 8,
              },
              animate: true,
              scale: 1,
            })
          );
        }
      });
    });

    street_light_tiles.forEach((street_light) => {
      movables.push(street_light);
    });
  }
}

// Handle keydown events
window.addEventListener("keydown", (e) => {
  if (menu) {
    if (bag_open) return; // Prevent actions while the bag is open

    if (e.key === "Enter") closeMenu(); // Close the menu if Enter is pressed
    return;
  }

  if (!keys_active.val) return;

  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastkey = "w";
      break;

    case "a":
      keys.a.pressed = true;
      lastkey = "a";
      break;

    case "s":
      keys.s.pressed = true;
      lastkey = "s";
      break;

    case "d":
      keys.d.pressed = true;
      lastkey = "d";
      break;

    case "Enter":
      openMenu(); // Open the menu if it's not already open

      keys.w.pressed = false;
      keys.a.pressed = false;
      keys.s.pressed = false;
      keys.d.pressed = false;

      break;

    case "e":
      let npc = colliding_npc[0] || false;
      if (!npc) return;

      if (npc.dialogue_available.value) {
        audio.button_press.play();

        npc.dialogue_available.interact = true;
        npc_sprite_upon_interaction(npc);
        OpenDialogue(npc);
      }
      break;
  }
});

window.addEventListener("keyup", (e) => {
  if (menu) return;
  // console.log("active");
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;

    case "s":
      keys.s.pressed = false;
      break;

    case "d":
      keys.d.pressed = false;
      break;
  }

  if (keys.w.pressed) lastkey = "w";
  else if (keys.a.pressed) lastkey = "a";
  else if (keys.s.pressed) lastkey = "s";
  else if (keys.d.pressed) lastkey = "d";
});

// let clicked = false;
// addEventListener("click", () => {
//   if (!clicked) {
//     audio.Map.play();
//     clicked = true;
//   }
// });

// animate();

// initBattle();     //maintaining this order of calling the two function is must
// animateBattle();
