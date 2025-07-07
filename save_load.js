import { playerMonsters } from "./data/monsters.js";
import { playerItems } from "./data/playerBag.js";
import { gameState, gameLoaded } from "./gameState.js";
import {
  load_map,
  background,
  foreground,
  boundaries,
  battleZones,
  grass_tiles,
  map_campfire,
  street_light_tiles,
  offset,
  map_npcs,
  map_id,
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
import { maploaded } from "./main_menu.js";
import { all_npcs } from "./npc.js";
import {
  virtualSeconds,
  formattedHours,
  formattedMinutes,
  interval,
} from "./day_night.js";

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

// extracts necessary data from npc object
function serializeNpc(npc) {
  return {
    position: { x: npc.position.x, y: npc.position.y },
    npc_image_key: npc.npc_image_key,
  };
}

export function savegame() {
  gameLoaded.onload = false;
  // console.log(gameLoaded)

  // Clone the party and items to avoid any non-serializable properties
  const cleanParty = JSON.parse(
    JSON.stringify(playerMonsters, getCircularReplacer())
  );
  const cleanItems = JSON.parse(
    JSON.stringify(playerItems, getCircularReplacer())
  );

  const saveData = {
    map_loaded: maploaded,
    map_loaded_id: maploaded.data.id,
    background_position: background.position,
    foreground_position: foreground.position,
    offset_position: offset,
    global_time: virtualSeconds.value,
    time: { formattedHours, formattedMinutes, interval },
    map_npcs_details: map_npcs,
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

  // reload last saved map
  map_id.value = data.map_loaded_id;

  // Reset the maploaded.data
  Object.keys(maploaded.data).forEach((key) => delete maploaded.data[key]);
  Object.assign(maploaded.data, data.map_loaded.data);

  // update npc positions
  data.map_npcs_details.forEach((map_npc) => {
    let id = map_npc.id;

    let oneTime_available = map_npc.onetimeDialogue || false;
    let oneTime_tiggered;
    if(oneTime_available) oneTime_tiggered = oneTime_available.triggered;
    
    all_npcs.forEach((npc) => {
      if(npc.id === id) {
        npc.position = map_npc.position;
        npc.npc_image_key = map_npc.npc_image_key;

        let image_key = npc.npc_image_key;
        npc.image = npc.sprites[image_key];

        let oneTime = npc.onetimeDialogue || false;
        if(oneTime) npc.onetimeDialogue.triggered = oneTime_tiggered;
      } 
    })
  })


  load_map(maploaded.data);

  // update background related stuff
  const offset_changeX = background.position.x - data.background_position.x;
  const offset_changeY = background.position.y - data.background_position.y;


  boundaries.forEach((boundary) => {
    boundary.updateOffset(offset_changeX, offset_changeY);
  });

  battleZones.forEach((battlezones) => {
    battlezones.updateOffset(offset_changeX, offset_changeY);
  });

  grass_tiles.forEach((grass) => {
    grass.updateOffset(offset_changeX, offset_changeY);
  });

  map_campfire.forEach((campfire) => {
    campfire.updateOffset(offset_changeX, offset_changeY);
  });

  street_light_tiles.forEach((street_light) => {
    street_light.updateOffset(offset_changeX, offset_changeY);
  })

  background.position = data.background_position;
  foreground.position = data.foreground_position;


  // Update the players items
  for (const key in data.items) {
    if (playerItems[key]) {
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
