import { playerMonsters } from "./data/monsters.js";
import { playerItems } from "./data/playerBag.js";
import { gameState, gameLoaded} from "./gameState.js";
import { 
  background,
  foreground,
  boundaries,
  battleZones,
  grass_tiles,
  campfires,
  offset,
  npc_direction
} from "./renderer.js";
import {
  health_tracker,
  health_width_tracker,
  level_tracker,
  exp_tracker,
  exp_width_tracker,
  status_tracker,
  status_color_tracker,
} from "./classes.js";
import { npc1, all_npcs } from "./npc.js";

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
  gameLoaded.onload = false;
  // console.log(gameLoaded)

  // Clone the party and items to avoid any non-serializable properties
  const cleanParty = JSON.parse(JSON.stringify(playerMonsters, getCircularReplacer()));
  const cleanItems = JSON.parse(JSON.stringify(playerItems, getCircularReplacer()));

  const saveData = {
    background_position: background.position,
    foreground_position: foreground.position,
    offset_position: offset,
    npc_details: [npc1],
    party: cleanParty,
    items: cleanItems,
    health: parseFloat(health_tracker.value),
    healthBarWidth: parseFloat(health_width_tracker.value),
    lvl: level_tracker.value,
    exp: parseFloat(exp_tracker.value),
    expBarWidth: parseFloat(exp_width_tracker.value),
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
  gameLoaded.onload = true;
  console.log("Game Loaded!");

  const data = JSON.parse(saveData);
  console.log(data);

  for (let i = 0; i < all_npcs.length; i++) {
    npc_direction[i] = data.npc_details[i].npc_image_key;
  }
  // console.log(npc_direction);

  //restore data
  gameState.background.position = data.background_position;
  gameState.foreground.position = data.foreground_position;

  for (let i = 0; i < gameState.npc.length; i++) {
    gameState.npc[i] = data.npc_details[i];
  }

  gameState.offset.position = data.offset_position;

  gameState.playerMonsters = data.party;
  gameState.playerItems = data.items;
  gameState.health_tracker = data.health;
  gameState.health_width_tracker = data.healthBarWidth;
  gameState.level_tracker = data.lvl;
  gameState.exp_tracker = data.exp;
  gameState.exp_width_tracker = data.expBarWidth;
  gameState.status_tracker = data.status;
  gameState.status_color_tracker = data.statusColor;

  // console.log(gameState.background.position);
  const offset_changeX = background.position.x - gameState.background.position.x;
  const offset_changeY = background.position.y - gameState.background.position.y;

  background.position = gameState.background.position;
  foreground.position = gameState.foreground.position;
  
  npc1.position = gameState.npc[0].position;
  // console.log(direction_img);

  boundaries.forEach((boundary) => {
    boundary.updateOffset(offset_changeX, offset_changeY);
  });

  battleZones.forEach((battlezones) => {
    battlezones.updateOffset(offset_changeX, offset_changeY);
  });

  grass_tiles.forEach((grass) => {
    grass.updateOffset(offset_changeX, offset_changeY);
  });

  campfires.forEach((campfire) => {
    campfire.updateOffset(offset_changeX, offset_changeY);
  })

  
  // console.log("Offset After Setting:", offset);
  // console.log("Loaded Background Position:", gameState.background.position);
  // console.log("Offset Change:", offset_changeX, offset_changeY);

  // Update `playerMonsters`
  for (const key in data.party) {
    if (playerMonsters[key]) {
      Object.assign(playerMonsters[key], data.party[key]); // Merge properties
      playerMonsters[key].health = data.health;
    } else {
      playerMonsters[key] = data.party[key]; // Add new monsters
    }
  }

  // battle related stuff on load
  health_tracker.value = gameState.health_tracker;
  health_width_tracker.value = gameState.health_width_tracker + "%";

  level_tracker.value = gameState.level_tracker;
  exp_tracker.value = gameState.exp_tracker;
  exp_width_tracker.value = gameState.exp_width_tracker + "%";

  console.log(exp_tracker.value, exp_width_tracker.value);

  // status_tracker = data.status;
  // status_color_tracker = data.statusColor;

}

