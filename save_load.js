import { playerMonsters } from "./data/monsters.js";
import { playerItems } from "./data/playerBag.js";
import { gameState, gameLoaded} from "./gameState.js";
import { 
  background,
  foreground,
  boundaries,
  battleZones,
  offset,
} from "./renderer.js";
import {
  health_tracker,
  health_width_tracker,
  exp_tracker,
  exp_width_tracker,
  status_tracker,
  status_color_tracker,
} from "./classes.js";

// Helper function to remove circular references
function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return; // Omit circular references
      seen.add(value);
    }
    return value;
  };
}

export function savegame() {
  // const cleanPosition = (position) => {
  //   return { x: position.x, y: position.y }; // Extract only the necessary properties
  // };

  // Clone the party and items to avoid any non-serializable properties
  const cleanParty = JSON.parse(JSON.stringify(playerMonsters, getCircularReplacer()));
  const cleanItems = JSON.parse(JSON.stringify(playerItems, getCircularReplacer()));

  const saveData = {
    background_position: background.position,
    foreground_position: foreground.position,
    party: cleanParty,
    items: cleanItems,
    health: parseFloat(health_tracker),
    healthBarWidth: parseFloat(health_width_tracker),
    exp: parseFloat(exp_tracker),
    expBarWidth: parseFloat(exp_width_tracker.style.width),
    status: status_tracker,
    statusColor: status_color_tracker,
  };

  try {
    localStorage.setItem("GameSave", JSON.stringify(saveData));
    console.log("Game Saved!");
    console.log(saveData);
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

// export let gameLoaded = false;

export function loadgame() {
  const saveData = localStorage.getItem("GameSave");
  if (!saveData) {
    console.log("No Save Found!");
    return;
  }
  // gameLoaded.onload = true;
  console.log("Game Loaded!");

  const data = JSON.parse(saveData);

  //restore data
  gameState.background.position = data.background_position;
  gameState.foreground.position = data.foreground_position;
  gameState.playerMonsters = data.party;
  gameState.playerItems = data.items;
  gameState.health_tracker = data.health;
  gameState.health_width_tracker = data.healthBarWidth;
  gameState.exp_tracker = data.exp;
  gameState.exp_width_tracker = data.expBarWidth;
  gameState.status_tracker = data.status;
  gameState.status_color_tracker = data.statusColor;

  
  background.position = gameState.background.position;
  foreground.position = gameState.foreground.position;

  const offset_changeX = gameState.background.position.x - offset.x;
  const offset_changeY = gameState.background.position.y - offset.y;

  boundaries.forEach((boundary) => {
    boundary.updateOffset(offset_changeX, offset_changeY);
  });

  battleZones.forEach((battlezones) => {
    battlezones.updateOffset(offset_changeX, offset_changeY);
  });

  // Update `playerMonsters`
  for (const key in data.party) {
    if (playerMonsters[key]) {
      Object.assign(playerMonsters[key], data.party[key]); // Merge properties
      playerMonsters[key].health = data.health;
    } else {
      playerMonsters[key] = data.party[key]; // Add new monsters
    }
  }

  // health_tracker = data.health;
  // health_width_tracker = data.healthBarWidth; // Restore plain value
  // exp_tracker = data.exp;
  // exp_width_tracker = data.expBarWidth;       // Restore plain value
  // status_tracker = data.status;
  // status_color_tracker = data.statusColor;

  // Update trackers and DOM elements
  updateTrackers();

  console.log(gameState);
  // return gameLoaded;
}


export function updateTrackers() {
  const currentMonster = playerMonsters.emby;

  // Update health tracker
  health_tracker = gameState.health_tracker;
  health_width_tracker = gameState.health_width_tracker;
  
  // const maxHealth = 150; // Replace this with your actual max health logic
  // health_width_tracker = (health_tracker / maxHealth) * 98.5 + "%";

  // Update the health bar's width
  const healthBar = document.querySelector("#playerHealthBar");
  if (healthBar) {
    healthBar.style.width = health_width_tracker;
  }

  // Update other trackers if necessary
  // exp_tracker = currentMonster.exp;
  // exp_width_tracker.style.width = (exp_tracker / currentMonster.max_exp) * 100 + "%";
  // status_tracker = gameState.status_tracker;
  // status_color_tracker = gameState.status_color_tracker;

  console.log("Trackers updated:");
  console.log("Health:", health_tracker, health_width_tracker);
  // console.log("Exp:", exp_tracker, exp_width_tracker.style.width);
  // console.log("Status:", status_tracker, status_color_tracker);
}
