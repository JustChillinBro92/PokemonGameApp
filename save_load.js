import { playerMonsters } from "./data/monsters.js";
import { playerItems } from "./data/playerBag.js";
import { gameState } from "./gameState.js";
import { background, foreground, boundaries, battleZones } from "./renderer.js";
import { health_tracker, health_width_tracker, exp_tracker, exp_width_tracker, status_tracker, status_color_tracker } from "./classes.js";

export let gameLoaded = false;

export function savegame() {
    const saveData = {
        background_position: background.position,
        foreground_position: foreground.position,
        // boundaries_position: boundaries.position,
        // battleZones_position: battleZones.position,
        party: playerMonsters,
        items: playerItems,
        health: health_tracker,
        healthBarWidth: health_width_tracker,
        exp: exp_tracker,
        expBarWidth: exp_width_tracker,
        status: status_tracker,
        statusColor: status_color_tracker,
    }
  
    localStorage.setItem("GameSave", JSON.stringify(saveData));
    console.log("Game Saved!");
  }
  
  export function loadgame() {
    const saveData = localStorage.getItem("GameSave");
    if(!saveData) {
        console.log("No Save Found!");
        return;
    }
    gameLoaded = true;
    console.log("Game Loaded!");
  
    const data = JSON.parse(saveData);

    //restore data
    gameState.background.position = data.background_position;
    gameState.foreground.position = data.foreground_position;
    // gameState.boundaries.position = data.boundaries_position;
    // gameState.battleZones.position = data.battleZones_position;
    gameState.playerMonsters = data.party;
    gameState.playerItems = data.items;
    gameState.health_tracker = data.health;
    gameState.health_width_tracker = data.healthBarWidth;
    gameState.exp_tracker = data.exp;
    gameState.exp_width_tracker = data.expBarWidth;
    gameState.status_tracker = data.status;
    gameState.status_color_tracker = data.statusColor;

    console.log(gameState);
    return gameLoaded;
  }