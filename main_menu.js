import { audio } from "./data/audio.js";
import { MAP } from "./data/map.js";
import { scenes } from "./data/scenes.js";
import { load_map, OpenSceneDialogue } from "./renderer.js";

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
  gsap.to("#main_menu", {
    display: "none",
    duration: 0.05,
    onComplete: () => {
      gsap.to("#OverlappingDiv", {
        opacity: 1,
        onComplete: () => {
          setTimeout(() => {
            OpenSceneDialogue(scenes.petalwood_island.sailor, true);
            document.addEventListener("start_anim", load_map(maploaded.data));
          }, 1200)
        },
      });
    },
  });
});
