import { audio } from "./data/audio.js";
import { MAP } from "./data/map.js";
import { all_npcs } from "./npc.js";

// MAIN MENU LOADING ANIMATION

gsap.to("#menu_box", {
  delay: 2,
  opacity: 1,
  height: 80 + "%",
  duration: 0.8,
  onComplete: () => {
    gsap.to("#menu_options", {
      opacity: 1,
      width: 50 + "%",
      duration: 0.6,
      onComplete: () => {
        gsap.to("#menu_btn", {
          opacity: 1,
          duration: 0.05,
        });
      },
    });
  },
});

export let maploaded = {
  data: MAP.petalwood_island,
};

document.querySelector("#map_name").innerHTML = maploaded.data.name;

document.querySelector(".new_game").addEventListener("click", () => {
  document.querySelector("#main_menu").style.display = "none";
  audio.Map.play();


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
});
