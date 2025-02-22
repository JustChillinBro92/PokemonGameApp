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
  npc_direction,
  player,
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
import { virtualSeconds, formattedHours, formattedMinutes, interval } from "./day_night.js";

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
    global_time: virtualSeconds.value,
    time: { formattedHours, formattedMinutes, interval },
    npc_details: [npc1],
    party: cleanParty,
    items: cleanItems,
    health: parseFloat(health_tracker.value),
    healthBarWidth: parseFloat(health_width_tracker.value),
    lvl: level_tracker.value,
    exp: parseFloat(exp_tracker.value),
    expBarWidth: parseFloat(exp_width_tracker.value),
    status: status_tracker.value,
    statusColor: status_color_tracker.value,
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

  // update the game-state
  gameState.time = data.time;
  gameState.playerMonsters = data.party;


  // time update on load
  virtualSeconds.value = data.global_time;

  // background related stuff on load
  const offset_changeX = background.position.x - data.background_position.x
  const offset_changeY = background.position.y - data.background_position.y;

  background.position = data.background_position;
  foreground.position = data.foreground_position;
  
  for (let i = 0; i < all_npcs.length; i++) {
    npc_direction[i] = data.npc_details[i].npc_image_key;
  }
  // console.log(npc_direction);

  npc1.position = data.npc_details[0].position;
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


  // Update the players items
  for (const key in data.items) {
    if(playerItems[key]) {
      Object.assign(playerItems, data.items);
    } else playerItems = data.items;
  }


  // Update playerMonsters
  for (const key in data.party) {
    if (playerMonsters[key]) {
      Object.assign(playerMonsters, data.party); // Merge properties
    } else playerMonsters = data.party;
  }

  // battle related stuff on load
  health_tracker.value = data.health;
  health_width_tracker.value = data.healthBarWidth + "%";

  level_tracker.value = data.lvl;
  exp_tracker.value = data.exp;
  exp_width_tracker.value = data.expBarWidth + "%";

  status_tracker.value = data.status;
  status_color_tracker.value = data.statusColor;

  // console.log(status_tracker.value , status_color_tracker.value)

  // console.log(exp_tracker.value, exp_width_tracker.value);

  // status_tracker = data.status;
  // status_color_tracker = data.statusColor;

}

