import { Boundary, Sprite } from "./classes.js";
import { door_collisions } from "./data/door_collisions.js";
import { battleZonesData } from "./data/battlezones.js";
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

export function load_map(new_map_data) {
  maploaded.data = new_map_data;
  document.querySelector("#map_name").innerHTML = maploaded.data.name;

  gsap.to("#map_name", {
    top: 2 + "%",
    bottom: 85 + "%",
    duration: 0.6,
    onComplete: () => {
      gsap.to("#map_name", {
        opacity: 0,
        delay: 3,
      });
    },
  });

  offset.x = maploaded.data.camera.x;
  offset.y = maploaded.data.camera.y;

  background.position.x = maploaded.data.camera.x;
  background.position.y = maploaded.data.camera.y;
  background.image.src = maploaded.data.background_image;

  foreground.position.x = maploaded.data.camera.x;
  foreground.position.y = maploaded.data.camera.y;
  foreground.image.src = maploaded.data.foreground_image;

  collisionsMap = [];
  area_loaded = maploaded.data;
  area_map = area_loaded.map;
  collison_spread = area_loaded.width;

  for (let i = 0; i <= area_map.length; i += collison_spread) {
    collisionsMap.push(area_map.slice(i, collison_spread + i));
  }

  boundaries = [];
  collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
      if (symbol === 1025)
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width + maploaded.data.camera.x,
              y: i * Boundary.height + maploaded.data.camera.y,
            },
          })
        );
    });
  });
}

//LOAD OVERWORLD BACKPACK
load_backpack();

let collisionsMap = [];
let area_loaded = MAP.petalwood_island;
let area_map = area_loaded.map;
let collison_spread = area_loaded.width;

for (let i = 0; i <= area_map.length; i += collison_spread) {
  collisionsMap.push(area_map.slice(i, collison_spread + i));
}

// const door_collisionsMap = [];
// for (let i = 0; i <= door_collisions.length; i += 180) {
//   door_collisionsMap.push(door_collisions.slice(i, 180 + i));
// }

const battleZonesMap = [];
for (let i = 0; i <= battleZonesData.length; i += 180) {
  battleZonesMap.push(battleZonesData.slice(i, 180 + i)); //slicing the array of battlezones(acc to width of map 120 tiles) into sub-arrays and storing/pushing them in another Array
}

export let boundaries = [];
export let offset = { x: maploaded.data.camera.x, y: maploaded.data.camera.y };

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

export const door_boundaries = [];

// door_collisionsMap.forEach((row, i) => {
//   row.forEach((symbol, j) => {
//     if (symbol === 1025)
//       door_boundaries.push(
//         new Boundary({
//           position: {
//             x: j * Boundary.width + offset.x,
//             y: i * Boundary.height + offset.y,
//           },
//         })
//       );
//   });
// });

export const battleZones = [];
export const grass_tiles = [];

const grass = new Image();
grass.src = "./img/animated_objects/animated_grass.png";

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

const backgroundimage = new Image();
backgroundimage.src = maploaded.data.background_image;

const foregroundimage = new Image();
foregroundimage.src = maploaded.data.foreground_image;

const campfire = new Image();
campfire.src = "./img/animated_objects/campfire.png";

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

export const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: backgroundimage,
});

export const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundimage,
});

// load_map(MAP.evergrande_island);

// campfire positions set
export const campfires = [
  { x: offset.x + 1908, y: offset.y + 1719 },
  { x: offset.x + 1947, y: offset.y + 1719 },
].map(
  (position) =>
    new Sprite({
      position: position,
      image: campfire,
      scale: 0.93,
      frames: {
        max: 4,
        hold: 8,
      },
      animate: true,
    })
);

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

const movables = [
  dialogue_prompt,
  background,
  ...campfires,
  foreground,
  ...boundaries,
  // ...door_boundaries,
  ...battleZones,
  ...grass_tiles,
];

let map_npcs = [];
export let colliding_npc = [];

all_npcs.forEach((npc) => {
  let current_map = maploaded.data.name;

  if (npc.map === current_map) {
    movables.push(npc);
    map_npcs.push(npc);
  }
});
// console.log(map_npcs);

function RectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}

function DoorRectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >=
    (rectangle2.position.x + rectangle2.width) / 2
  );
}

export const battle = {
  initiated: false,
};

export let npc_collision = false;

let pause = false;
let load_transition = false;

let grassAudioPlay = false;
export let menu = false; // user menu

var then = Date.now();
var now;

export function animate() {
  now = Date.now();
  var deltaTime = now - then;
  var fps = 60;

  const global_time = Math.floor((virtualSeconds.value / 3600) % 24);

  // Animation logic...
  const animateId = window.requestAnimationFrame(animate);
  // console.log("aimate");

  if (pause) {
    window.cancelAnimationFrame(animateId);

    if (load_transition) {
      gsap.to("#OverlappingDiv", {
        opacity: 1,
        duration: 1,
        onComplete() {
          gsap.to("#OverlappingDiv", {
            opacity: 0,
          });
        },
      });
      load_transition = false;
    }

    setTimeout(() => {
      animate();
      pause = false;
    }, 800);
  }

  if (deltaTime > 1000 / fps) {
    background.draw();

    boundaries.forEach((boundary) => {
      boundary.draw();
    });

    // door_boundaries.forEach((door_Boundary) => {
    //   door_Boundary.draw();
    // });

    battleZones.forEach((battleZone) => {
      // battleZone.draw();
    });

    grass_tiles.forEach((grass) => {
      // grass.draw();
    });

    player.draw();

    for (let npc of all_npcs) {
      let current_map = maploaded.data.name;

      if (npc.map === current_map) {
        npc.draw();
        checkNpcInteraction();

        let prompt_Npc = colliding_npc[0] || false;
        if (prompt_Npc && prompt_Npc.dialogue_available.value)
          dialogue_prompt.draw();
      }
    }

    // all_npcs.forEach((npc) => {
    //   let current_map = maploaded.data.name;

    //   if (npc.map === current_map) {
    //     npc.draw();
    //     checkNpcInteraction();

    //     let prompt_Npc = colliding_npc[0] || false;
    //     if (prompt_Npc && prompt_Npc.dialogue_available.value)
    //       dialogue_prompt.draw();
    //   }
    // });

    foreground.draw();

    let angle = 0;
    if (global_time >= 19 || global_time <= 3) {
      campfires.forEach((campfire) => {
        campfire.draw();

        let radius = 90 + 10 * Math.sin(angle);
        campfire.draw_light(
          campfire.position.x + 20,
          campfire.position.y + 25,
          radius
        );
        // angle += 0.05;
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
          RectangularCollision({
            rectangle1: player,
            rectangle2: battleZone,
          }) &&
          OverlappingArea > (player.height * player.width) / 2
        ) {
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
            window.cancelAnimationFrame(animateId); //deactivates current animation loop
            audio.Map.stop(); //stops map music

            battle.initiated = true;
            keys_active.val = false;

            audio.initBattle.play(); //starts battle initialise music
            audio.battle.play(); //starts battle music

            //flashing animation on battle activation
            gsap.to("#OverlappingDiv", {
              opacity: 1,
              repeat: 3,
              yoyo: true, //smoothes out animation by bringing counter to 0 i.e., default state
              duration: 0.4,
              onComplete() {
                gsap.to("#OverlappingDiv", {
                  //keeps the canvas covered by the 'overlapping div' as no yoyo property present...done to change the canvas behind it to battle scene
                  opacity: 1,
                  duration: 0.4,
                  onComplete() {
                    //activate a new animation loop (battle sequence)
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
      }

      // for(let i = 0; i <= door_boundaries.length; i++) {
      //   const door_boundary = door_boundaries[i];

      //   if(DoorRectangularCollision({
      //     rectangle1: player,
      //     rectangle2: {
      //       ...door_boundary,
      //       position: {
      //         x: door_boundary.position.x - 3,
      //         y: door_boundary.position.y
      //       }
      //     }
      //   })
      // ) {
      //     console.log("DOOR");
      //   }
      // }

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

//loading the game
document.querySelector("#load").addEventListener("click", () => {
  loadgame();
  closeMenu();

  if (gameLoaded.onload) {
    pause = true;
    load_transition = true;

    // reload bag
    load_backpack();

    // npc sprite on load
    for (let i = 0; i < all_npcs.length; i++) {
      let image, direction;
      if (npc_direction[i] === "left") {
        image = all_npcs[i].sprites.left;
        direction = "left";
      } else if (npc_direction[i] === "right") {
        image = all_npcs[i].sprites.right;
        direction = "right";
      } else if (npc_direction[i] === "up") {
        image = all_npcs[i].sprites.up;
        direction = "up";
      } else {
        image = all_npcs[i].sprites.down;
        direction = "down";
      }

      all_npcs[i].image = image;
      all_npcs[i].npc_image_key = direction;
    }
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
function OpenDialogue(npc) {
  let interval;
  keys_active.val = false;

  let NpcDialogueBox = document.querySelector("#OverworldDialogueBoxContainer");
  let NpcDialogue = document.querySelector("#OverworldDialogueBox");

  let oneTime_available = npc.onetimeDialogue || false;
  let onetimeDialogue, onetimeDialogue_triggerd, onetimeDialogue_array;

  onetimeDialogue_triggerd = npc.onetimeDialogue?.triggered || false;
  // console.log(onetimeDialogue_triggerd);

  if (oneTime_available && !onetimeDialogue_triggerd) {
    onetimeDialogue = npc.onetimeDialogue.dialogue;
    onetimeDialogue_array = Object.values(onetimeDialogue);
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
    console.log("close");

    NpcDialogueBox.onclick = null; // Prevent additional clicks
    NpcDialogueBox.style.opacity = "0";
    keys_active.val = true;

    if (oneTime_available) npc.onetimeDialogue.triggered = true;
    npc.dialogue_available.value = false;
    npc.dialogue_available.interact = false;

    colliding_npc.pop();
  }

  function NextDialogue() {
    let onetime_char_array, char_array;

    // Before anything: check if we’re at the end
    if (oneTime_available && !onetimeDialogue_triggerd) {
      if (dialogue_index >= onetimeDialogue_array.length) {
        CloseDialogue();
        return;
      }
      onetime_char_array = onetimeDialogue_array[dialogue_index];
    } else {
      if (dialogue_index >= dialogue_array.length) {
        CloseDialogue();
        return;
      }
      char_array = dialogue_array[dialogue_index];
    }

    let char_index = 0;
    NpcDialogue.innerHTML = "";
    typing = true;

    interval = setInterval(() => {
      if (onetime_char_array) {
        if (char_index < onetime_char_array.length) {
          NpcDialogue.innerHTML += onetime_char_array[char_index];
          char_index++;
        } else {
          clearInterval(interval);
          typing = false;
          dialogue_index++;
        }
      } else if (char_array) {
        if (char_index < char_array.length) {
          NpcDialogue.innerHTML += char_array[char_index];
          char_index++;
        } else {
          clearInterval(interval);
          typing = false;
          dialogue_index++;
        }
      } else {
        // Defensive fallback
        clearInterval(interval);
        typing = false;
      }
    }, 20);
  }

  NpcDialogueBox.onclick = () => {
    if (!typing) {
      audio.button_press.play();
      NextDialogue();
    }
  };

  NextDialogue();
  NpcDialogueBox.style.opacity = "1";
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

animate();

// initBattle();     //maintaining this order of calling the two function is must
// animateBattle();
