import { canvas } from "./canvas.js";
import { Boundary, Sprite } from "./classes.js";
import { npc1 } from "./npc.js";
import { collisions } from "./data/collisions.js";
import { battleZonesData } from "./data/battlezones.js";
import { audio } from "./data/audio.js";
import { initBattle } from "./initiateBattle.js";
import { animateBattle } from "./battlescene.js";
import { load_backpack } from "./backpack.js";
import { savegame, loadgame } from "./save_load.js";

// import { gameState } from "./save_load.js";

//import { playerItems } from "./data/playerBag";

//console.log(gsap)
//console.log(battleZonesData);

// console.log('Canvas Width:', canvas.width);
// console.log('Canvas Height:', canvas.height);

const collisionsMap = [];
for (let i = 0; i <= collisions.length; i += 180) {
  collisionsMap.push(collisions.slice(i, 180 + i)); //slicing the array of collisons(acc to width of map 120 tiles) into sub-arrays and storing/pushing them in another Array
}
//console.log(collisionsMap)

const battleZonesMap = [];
for (let i = 0; i <= battleZonesData.length; i += 180) {
  battleZonesMap.push(battleZonesData.slice(i, 180 + i)); //slicing the array of battlezones(acc to width of map 120 tiles) into sub-arrays and storing/pushing them in another Array
}
//console.log(battlezonesMap);

export const boundaries = [];
export const offset = {
  x: -1150,
  y: -712,
};

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
//console.log(boundaries);

export const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});
//console.log(battleZones);

const image = new Image();
image.src = "./img/PetalwoodTown.png"; //html element i.e. the image(map)

const foregroundimage = new Image();
foregroundimage.src = "./img/ForegroundObjects.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/playerDown.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/playerUp.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/playerRight.png";

const player = new Sprite({
  position: {
    x: 704.8,
    y: 280.8
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 25,
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
  scale: 0.75,
});

export const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

export const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundimage,
});
// loadgame()

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
};

load_backpack();

const movables = [npc1, background, foreground, ...boundaries, ...battleZones];

function RectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}

export const battle = {
  initiated: false,
};

let grassAudioPlay = false;
export let menu = false; // user menu

export function animate() {
  // Animation logic...
  const animateId = window.requestAnimationFrame(animate);
  // console.log("aimate");

  if (menu) return;

  background.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();
  npc1.draw();
  //console.log(player.position);
  foreground.draw();

  let moving = true; // for collison blocks
  player.animate = false; // for player movement animation

  if (battle.initiated) return;

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
        if (!grassAudioPlay) {
          grassAudioPlay = true;
          audio.grass.play();
        }

        setTimeout(() => {
          grassAudioPlay = false;
        }, 100);
      }

      if (
        RectangularCollision({
          rectangle1: player,
          rectangle2: battleZone,
        }) &&
        OverlappingArea > (player.height * player.width) / 2 &&
        Math.random() < 0.01
      ) {
        //console.log("battleZone Activate");
        window.cancelAnimationFrame(animateId); //deactivates current animation loop
        audio.Map.stop(); //stops map music

        battle.initiated = true;

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

  if (keys.w.pressed && lastkey === "w") {
    player.animate = true;
    player.image = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 1,
            },
          },
        })
      ) {
        moving = false;
        console.log("colliding");
        break;
      }
    }
    if (moving === true) {
      movables.forEach((movable) => {
        movable.position.y += 1;
      });
    }
  } else if (keys.a.pressed && lastkey === "a") {
    player.animate = true;
    player.image = player.sprites.left;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 1,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        console.log("colliding");
        break;
      }
    }
    if (moving === true) {
      movables.forEach((movable) => {
        movable.position.x += 1;
      });
    }
  } else if (keys.s.pressed && lastkey === "s") {
    player.animate = true;
    player.image = player.sprites.down;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 1,
            },
          },
        })
      ) {
        moving = false;
        console.log("colliding");
        break;
      }
    }
    if (moving === true) {
      movables.forEach((movable) => {
        movable.position.y -= 1;
      });
    }
  } else if (keys.d.pressed && lastkey === "d") {
    player.animate = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        RectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 1,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        console.log("colliding");
        break;
      }
    }
    if (moving === true) {
      movables.forEach((movable) => {
        movable.position.x -= 1;
      });
    }
  }
}

const timeElement = document.querySelector("#clock");

let virtualSeconds = 8 * 3600; // Start at 8:00 AM
let lastUpdate = performance.now(); // High-precision timestamp

function updateClock() {
  let now = performance.now(); // Get current high-precision time
  let elapsedRealSeconds = (now - lastUpdate) / 1000; // Calculate elapsed real seconds
  lastUpdate = now; // Update lastUpdate timestamp

  virtualSeconds += elapsedRealSeconds * 48; // Scale real seconds to virtual time

  // Convert virtual time into hours and minutes
  let hours = Math.floor((virtualSeconds / 3600) % 24);
  let minutes = Math.floor((virtualSeconds % 3600) / 60);

  let interval = hours >= 12 ? "PM" : "AM";
  hours = (hours % 12) || 12; // Convert to 12-hour format (12 instead of 0)

  let formattedHours = hours.toString().padStart(2, "0");
  let formattedMinutes = minutes.toString().padStart(2, "0");

  timeElement.innerHTML = formattedHours + ":" + formattedMinutes + " " + interval;

  requestAnimationFrame(updateClock); // More precise than `setTimeout()`
}

// Start the clock
updateClock();


let lastkey = "";
let keys_active = true;
let bag_open = false;

// Handle opening the menu
function openMenu() {
  if(bag_open) return; // Prevent opening the menu if the bag is open

  menu = true;
  keys_active = false;

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

  menu = false;
  keys_active = true;
  lastkey = "";

  document.querySelector("#MenuBox").style.display = "none";
  document.querySelector("#clockContainer").style.display = "none";
}

//saving the game
document.querySelector("#save").addEventListener("click", () => {
  savegame();
})

//loading the game
document.querySelector("#load").addEventListener("click", () => {
  loadgame();
  closeMenu();
})

// Handle opening the bag
document.querySelector("#menu-bag").addEventListener("click", () => {
  if(!menu) return;
  if(bag_open) return;

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
    
    if(battle.initiated) return;
    document.querySelector("#Interface").style.display = "none";
  });
});

// Handle exiting the menu
document.querySelector("#menu-exit").addEventListener("click", () => {
  if (!bag_open) closeMenu(); // Only close the menu if the bag is not open
});

// Handle keydown events
window.addEventListener("keydown", (e) => {
  if(menu) {
    if(bag_open) return; // Prevent actions while the bag is open

    if(e.key === "Enter") closeMenu(); // Close the menu if Enter is pressed
    return;
  }

  // console.log("keysActive");
  if (!keys_active) return;

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

if (keys.Enter.pressed) {
}

let clicked = false;
addEventListener("click", () => {
  if (!clicked) {
    audio.Map.play();
    clicked = true;
  }
});

animate();
// initBattle();     //maintaining this order of calling the two function is must
// animateBattle();
