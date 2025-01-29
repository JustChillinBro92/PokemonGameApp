// gameState.js
export const gameState = {
    background: { position: { x: 0, y: 0 } },
    foreground: { position: { x: 0, y: 0 } },
    offset: { position: { x: 0, y: 0 } },
    playerMonsters: {},
    playerItems: {},
    health_tracker: 150,
    health_width_tracker: 98.5,
    exp_tracker: 0,
    exp_width_tracker: 0,
    status_tracker: "",
    status_color_tracker: "",
};

export let gameLoaded = {
    onload: false
}