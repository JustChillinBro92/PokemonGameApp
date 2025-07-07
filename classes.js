import { c } from "./canvas.js";
import { audio } from "./data/audio.js";
import { playerMonsters, max_exp } from "./data/monsters.js";
import { queue } from "./initiateBattle.js";
import { gameState, gameLoaded } from "./gameState.js";
// import { gameLoaded } from "./save_load.js";

export const progress_gif = new Image();
progress_gif.src = "./img/animated_objects/progress.gif";

export class Boundary {
  static width = 36;
  static height = 36;

  constructor({ position, scale = 1 }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
    this.scale = scale;
  }
  // Method to update position based on new offsets
  updateOffset(deltaX, deltaY) {
    if (deltaX != 0 || deltaY != 0) {
      this.position.x -= deltaX;
      this.position.y -= deltaY;
    }
  }

  draw() {
    const frameWidth = this.width; // Single frame width
    const frameHeight = this.height; // Single frame height

    // Determine the scaling factor for rendering the player sprite (scale only the sprite)
    const scaledWidth = frameWidth * this.scale; // Scaled width of the frame
    const scaledHeight = frameHeight * this.scale; // Scaled height of the frame

    c.fillStyle = "rgba(255, 0, 0, 0)";
    c.fillRect(this.position.x, this.position.y, scaledWidth, scaledHeight);
  }
}

export class Sprite {
  constructor({
    id,
    position,
    map,
    image,
    npc_image_key,
    frames = { max: 1, hold: 25 },
    scale = 1,
    sprites,
    animate = false,
    isMoving = false,
    yes_no_choice = false,
    triggerTeleport = false,
    dialogue,
    onetimeDialogue = false,
    randomDialogue = false,
    dialogue_available,
    rotation = 0,
  }) {
    this.id = id;
    this.position = position;
    this.map = map;
    this.npc_image_key = npc_image_key;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.scale = scale;
    this.dialogue = dialogue;
    this.onetimeDialogue = onetimeDialogue;
    this.randomDialogue = randomDialogue;
    this.dialogue_available = dialogue_available;
    this.rotation = rotation;

    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * this.scale;
      this.height = this.image.height * this.scale;
      // console.log("Iamge Loaded:", this.image.src, this.width, this.height);
    };

    this.image.src = image.src;
    this.animate = animate;
    this.isMoving = isMoving;
    this.yes_no_choice = yes_no_choice;
    this.triggerTeleport = triggerTeleport;
    this.sprites = sprites;
    this.opacity = 1;
  }

  draw() {
    c.save(); //if any global property added btwn save and restore, it only affects the code inside them

    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );

    c.globalAlpha = this.opacity; //global property

    const frameWidth = this.image.width / this.frames.max; // Single frame width
    const frameHeight = this.image.height; // Single frame height

    // Determine the scaling factor for rendering the player sprite (scale only the sprite)
    const scaledWidth = frameWidth * this.scale; // Scaled width of the frame
    const scaledHeight = frameHeight * this.scale; // Scaled height of the frame

    c.drawImage(
      this.image,
      this.frames.val * frameWidth, //cropping the sprite-sheet of the player x axis
      0, //cropping the sprite-sheet of the player y axis
      frameWidth,
      frameHeight,
      this.position.x,
      this.position.y,
      scaledWidth,
      scaledHeight
    );
    c.restore();

    if (!this.animate) {
      this.frames.val = 0; // Reset to the first frame when animation stops
      return;
    }

    if (this.frames.max > 1) {
      // it means that a sprite-sheet for animation is present
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }

  // draw_light(x, y, radius, light_color, stroke_color) {
  //   c.save();
  //   c.globalCompositeOperation = "soft-light";
  //   c.fillStyle = light_color;
  //   c.beginPath();
  //   c.arc(x, y, radius, 0, Math.PI * 2);
  //   c.fill();

  //   c.globalCompositeOperation = "darken";
  //   c.shadowBlur = 40;
  //   c.lineWidth = 20;
  //   c.strokeStyle = stroke_color;
  //   c.beginPath(); 
  //   c.arc(x, y, radius + 10, 0, Math.PI * 2);
  //   c.stroke();
  //   c.restore();
  // }

  draw_light(x, y, radius, vibe, alpha) {
    const innerColor = "rgba(252, 122, 0, 0.66)";
    const outerColor = "rgba(0, 0, 0, 0.6)";
    const gradient = c.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, innerColor);     // Core bright light
    gradient.addColorStop(1, outerColor);     // Fades into transparency

    c.save();
    c.globalAlpha = alpha;
    c.globalCompositeOperation = vibe;   // Makes glows blend well
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2);
    c.fill();

      c.globalCompositeOperation = "darken";
      c.shadowBlur = 40;
      c.lineWidth = 25;
      c.strokeStyle = "rgba(24, 23, 20, 0.01)";
      c.beginPath(); 
      c.arc(x, y, radius-20, 0, Math.PI * 2);
      c.stroke();

    c.restore();
  }

  // Method to update position based on new offsets
  updateOffset(deltaX, deltaY) {
    if (deltaX != 0 || deltaY != 0) {
      this.position.x -= deltaX;
      this.position.y -= deltaY;
    }
  }

  // Method to simulate npc movement
  npc_movement(Npc, Player, initialPosNpc) {
    if (Npc.dialogue_available.interact) return;

    function RectangularCollision({ rectangle1, rectangle2 }) {
      return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
      );
    }

    const direction = ["left","right", "up","down"];
    const randomDirection =
      direction[Math.floor(Math.random() * direction.length)];


    const key = Npc.id;
    let initial_pos = initialPosNpc[key];

    let target_posX = initial_pos.x + 100;
    let target_posY = initial_pos.y + 20;

    let distance_moved = 16;
    let buffer = 3; // Extra space to avoid overlap

    let nextPosition = { x: this.position.x, y: this.position.y };

    if (randomDirection === "left" && this.position.x > initial_pos.x) {
      this.image = this.sprites.left;
      this.npc_image_key = "left";
      nextPosition.x -= distance_moved;
    } else if (randomDirection === "right" && this.position.x < target_posX) {
      this.image = this.sprites.right;
      this.npc_image_key = "right";
      nextPosition.x += distance_moved;
    } else if (randomDirection === "up" && this.position.y > initial_pos.y) {
      this.image = this.sprites.up;
      this.npc_image_key = "up";
      nextPosition.y -= distance_moved;
    } else if (randomDirection === "down" && this.position.y < target_posY) {
      this.image = this.sprites.down;
      this.npc_image_key = "down";
      nextPosition.y += distance_moved;
    }

    if (
      nextPosition.x === this.position.x &&
      nextPosition.y === this.position.y
    ) {
      // NPC is already at target position, stop animating
      this.animate = false;
      return false;
    }

    // let collision = false;
    if (
      !RectangularCollision({
        rectangle1: { ...Npc, position: nextPosition },
        rectangle2: {
          ...Player,
          position: {
            x: Player.position.x - buffer,
            y: Player.position.y - buffer,
          },
        },
      })
    ) {
      if (!Player.animate) {
        this.animate = true;

        gsap.to(this.position, {
          x: nextPosition.x,
          y: nextPosition.y,
          duration: 0.3,

          onComplete: () => {
            this.animate = false;
          },
        });
      }

      // // No collision, move and animate
      // this.position.x = nextPosition.x;
      // this.position.y = nextPosition.y;
      // this.animate = true;

      // setTimeout(() => {
      //   this.animate = false; // Reset animation after a short delay
      // }, 350); // Adjust time for animation duration
    }
  }
}

export let health_tracker = { value: playerMonsters.emby.health };
export let health_width_tracker = { value: 98.5 + "%" };

export let level_tracker = { value: playerMonsters.emby.level };

export let exp_tracker = { value: playerMonsters.emby.exp };
export let max_exp_tracker = { value: playerMonsters.emby.max_exp };
export let exp_width_tracker = { value: 0 + "%" };
export let excess_exp;
export let lvl_up = false;

export let status_tracker = { value: "NRML" };
export let status_color_tracker = { value: "rgb(211, 210, 210)" };

export let stats_tracker = playerMonsters.emby.stats;

export let Type_Check;

// export let enemy_status_tracker = "NRML";
// export let enemy_status_color_tracker = "#2a2a2a";

export class Monster extends Sprite {
  //all methods of Sprite class are available here as well
  constructor({
    isEnemy = false,
    isPartner = false,
    name,
    type,
    health,
    level,
    exp,
    max_exp,
    base_exp_yield,
    position,
    image,
    frames = { max: 1, hold: 25 },
    scale = 1,
    sprites,
    animate = false,
    rotation = 0,
    Atk_Mod = { stage: 0 },
    Def_Mod = { stage: 0 },

    Type_Effect = { normal: false, super: false, not_effective: false },
    attack,
    status,
    stats,
  }) {
    super({
      //all the assignment(this.position = position for example) of these properites depend on the parent class(Sprite)
      position,
      image,
      frames,
      scale,
      sprites,
      animate,
      rotation,
    });
    this.initialPosition = { x: position.x, y: position.y }; // Store the initial position
    this.health = health;
    this.type = type;
    this.level = level;
    this.exp = exp;
    this.max_exp = max_exp;
    this.base_exp_yield = base_exp_yield;
    this.maxHealth = this.health;
    this.name = name;
    this.isEnemy = isEnemy;
    this.isPartner = isPartner;
    this.attack = attack;

    this.Atk_Mod = { ...Atk_Mod, val: 1 }; // neutral by default
    this.Def_Mod = { ...Def_Mod, val: 1 }; // neutral by default

    this.Type_Effect = { ...Type_Effect, val: 1 }; // normal by default

    this.status = status;
    this.current_status = status_tracker.value;
    this.stats = stats;
  }

  status_effect_nonDamage(renderedSprites) {
    // console.log(this.name + ": " + this.status);
    let attack_occur = true;

    if (this.status === "PRLZ") {
      let paralyzed = Math.random();

      if (paralyzed < 0.45) {
        attack_occur = false;

        if (this.isPartner) {
          document.querySelector("#DialogueBox").innerHTML =
            this.name + " was paralyzed and couldn't move! ";
          document.querySelector("#DialogueBox").appendChild(progress_gif);
          document.querySelector("#DialogueBox").style.display = "block";
        }

        const paralyzeImg = new Image();
        paralyzeImg.src = "./img/Paralysis.png";

        const paralyze = new Monster({
          position: {
            x: this.position.x - 50,
            y: this.position.y - 60,
          },
          image: paralyzeImg,
          frames: {
            max: 2,
            hold: 4,
          },
          animate: true,
        });
        if (this.isPartner) renderedSprites.splice(2, 0, paralyze);
        else renderedSprites.splice(1, 0, paralyze);

        gsap.to(paralyze.position, {
          x: this.position.x - 50,
          y: this.position.y - 60,

          onComplete: () => {
            audio.paralyzed.play();

            if (this.isPartner) renderedSprites.splice(2, 1);
            else renderedSprites.splice(1, 1);
          },
        });
        // console.log(this.name + " is paralyzed! ");
      }
    }
    return attack_occur;
  }

  status_effect_damage(renderedSprites) {
    if (
      this.status === "BRND" ||
      (this.status != "BRND" && status_tracker.value === "BRND")
    ) {
      let dmg = Math.floor((1 / 8) * this.maxHealth);

      this.health -= dmg;
      if (this.isPartner) {
        health_tracker.value -= dmg;
        health_width_tracker.value =
          (health_tracker.value / this.maxHealth) * 98.5 + "%";
      }
      // console.log("status hurt => current hp: " + this.health);
      // console.log("status hurt => current hp: " + health_tracker.value);
      // console.log("status hurt => current hp_width: " + health_width_tracker.value);

      document.querySelector("#DialogueBox").innerHTML =
        this.name + " was hurt due to its burn! ";
      document.querySelector("#DialogueBox").appendChild(progress_gif);
      document.querySelector("#DialogueBox").style.display = "block";

      let healthBar = "#playerHealthBar";
      if (this.isEnemy) healthBar = "#enemyHealthBar";
      const healthBarVisibility = document.querySelector(healthBar);

      const burn = new Image();
      burn.src = "./img/Burn.png";

      const burn_dmg = new Monster({
        position: {
          x: this.position.x - 20,
          y: this.position.y + 25,
        },
        image: burn,
        frames: {
          max: 5,
          hold: 25,
        },
        animate: true,
      });
      if (this.isPartner) renderedSprites.splice(2, 0, burn_dmg);
      else renderedSprites.splice(1, 0, burn_dmg);

      gsap.to(burn_dmg.position, {
        x: this.position.x + 10,
        y: this.position.y + 25,

        onComplete: () => {
          audio.burn_damage.play();

          gsap.to(healthBar, {
            width: (this.health / this.maxHealth) * 98.5 + "%",
            duration: 0.8,
            onComplete: () => {
              // burn_dmg.animate = false;
              const health_percent = parseFloat(
                healthBarVisibility.style.width
              );

              if (health_percent <= 60) {
                healthBarVisibility.style.backgroundColor = "yellow";

                if (health_percent <= 20) {
                  healthBarVisibility.style.backgroundColor = "red";
                }
              } else
                healthBarVisibility.style.backgroundColor = "rgb(58, 227, 58)";
            },
          });
          if (this.isPartner) renderedSprites.splice(2, 1);
          else renderedSprites.splice(1, 1);
        },
      });
      // burn_dmg.draw();
    }
  }

  status_color(recipient) {
    let target = "#enemyStat";
    if (this.isEnemy) target = "#playerStat";

    // console.log(target)

    switch (recipient.status) {
      case "NRML":
        document.querySelector(target).style.color = "rgb(211, 210, 210)";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker.value === "NRML") {
          status_color_tracker.value = "rgb(211, 210, 210)";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        } else if (
          target === "#playerStat" &&
          status_tracker.value === "BRND"
        ) {
          status_color_tracker.value = "Orangered";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        } else if (
          target === "#playerStat" &&
          status_tracker.value === "PRLZ"
        ) {
          status_color_tracker.value = "yellow";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        }
        break;

      case "BRND":
        document.querySelector(target).style.color = "Orangered";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker.value === "BRND") {
          status_color_tracker.value = "Orangered";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        } else if (
          target === "#playerStat" &&
          status_tracker.value === "NRML"
        ) {
          status_color_tracker.value = "rgb(211, 210, 210)";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        } else if (
          target === "#playerStat" &&
          status_tracker.value === "PRLZ"
        ) {
          status_color_tracker.value = "yellow";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        }
        break;

      case "PRLZ":
        document.querySelector(target).style.color = "yellow";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker.value === "PRLZ") {
          status_color_tracker.value = "yellow";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        } else if (
          target === "#playerStat" &&
          status_tracker.value === "NRML"
        ) {
          status_color_tracker.value = "rgb(211, 210, 210)";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        } else if (
          target === "#playerStat" &&
          status_tracker.value === "BRND"
        ) {
          status_color_tracker.value = "Orangered";
          document.querySelector(target).style.color =
            status_color_tracker.value;
        }
        break;
    }
    // console.log(status_color_tracker);
  }

  healthbarColor() {
    let healthBar = "#enemyHealthBar"; //player attacks
    if (this.isEnemy) healthBar = "#playerHealthBar"; //enemy attacks or healing used by player

    const healthBarVisibility = document.querySelector(healthBar);
    const health_percent = parseFloat(healthBarVisibility.style.width);

    if (health_percent <= 60) {
      healthBarVisibility.style.backgroundColor = "yellow";
      //console.log("color change");

      if (health_percent <= 20) {
        healthBarVisibility.style.backgroundColor = "red";
        //console.log("color change");
      }
    } else healthBarVisibility.style.backgroundColor = "rgb(58, 227, 58)";
  }

  useItem({ ItemUsed }) {
    // document.querySelector("#DialogueBox").style.display = "block";
    let healthBar = "#playerHealthBar";
    const healthBarVisibility = document.querySelector(healthBar);

    //console.log(ItemUsedBy);
    //console.log("Current Health: " + this.health);
    //console.log("Current Health: " + health_tracker.value);

    let diff = this.maxHealth - health_tracker.value;
    let potion_heal = ItemUsed.heal;

    switch (ItemUsed.name) {
      case "Potion":
        if (
          this.health < this.maxHealth ||
          health_tracker.value < this.maxHealth
        ) {
          if (diff < potion_heal) potion_heal = diff;

          this.health += potion_heal;
          health_tracker.value += potion_heal;
          // console.log("Restored Health: " + this.health);
          // console.log("Restored Health: " + health_tracker.value);

          audio.potion.play();
          gsap.to(healthBar, {
            width: (this.health / this.maxHealth) * 98.5 + "%",
            duration: 0.8,
            onUpdate: () => {
              const health_percent = parseFloat(
                healthBarVisibility.style.width
              );

              if (health_percent <= 60) {
                healthBarVisibility.style.backgroundColor = "yellow";

                if (health_percent <= 20) {
                  healthBarVisibility.style.backgroundColor = "red";
                  //console.log("color change");
                }
              } else
                healthBarVisibility.style.backgroundColor = "rgb(58, 227, 58)";
            },
          });
        } else if (this.health === this.maxHealth) {
          // console.log("Not possible");
        }
        break;

      case "Super Potion":
        if (
          this.health < this.maxHealth ||
          health_tracker.value < this.maxHealth
        ) {
          if (diff < potion_heal) potion_heal = diff;

          this.health += potion_heal;
          health_tracker.value += potion_heal;
          // console.log(this.health);

          audio.potion.play();
          gsap.to(healthBar, {
            width: (this.health / this.maxHealth) * 98.5 + "%",
            duration: 0.8,
            onUpdate: () => {
              const health_percent = parseFloat(
                healthBarVisibility.style.width
              );

              if (health_percent <= 60) {
                healthBarVisibility.style.backgroundColor = "yellow";

                if (health_percent <= 20) {
                  healthBarVisibility.style.backgroundColor = "red";
                }
              } else
                healthBarVisibility.style.backgroundColor = "rgb(58, 227, 58)";
            },
          });
        } else if (this.health === this.maxHealth) console.log("Not possible");
        break;

      case "Burn Heal":
        audio.status_heal.play();

        if (this.status === "BRND" || status_tracker.value === "BRND") {
          this.Atk_Mod.stage = 0;
          this.status = "NRML";
          status_tracker.value = "NRML";
          document.querySelector("#playerStat").style.color =
            "rgb(211, 210, 210)";
        }
        document.querySelector("#playerStat").innerHTML = this.status;
        break;

      case "Paralyze Heal":
        audio.status_heal.play();

        if (this.status === "PRLZ" || status_tracker.value === "PRLZ") {
          this.status = "NRML";
          status_tracker.value = "NRML";
          document.querySelector("#playerStat").style.color =
            "rgb(211, 210, 210)";
        }
        document.querySelector("#playerStat").innerHTML = this.status;
        break;
    }
  }

  Update_Modifiers(recipient) {
    // console.log(this.name, "Atk: ", this.Atk_Mod, "Def: ", this.Def_Mod);
    // console.log(
    //   recipient.name,
    //   "Atk: ",
    //   recipient.Atk_Mod,
    //   "Def: ",
    //   recipient.Def_Mod
    // );
    // console.log("\n");

    // Attack Modifiers
    if (this.Atk_Mod.stage === -3) this.Atk_Mod.val = 0.4;
    else if (this.Atk_Mod.stage === -2) this.Atk_Mod.val = 0.5;
    else if (this.Atk_Mod.stage === -1) this.Atk_Mod.val = 0.66;
    else if (this.Atk_Mod.stage === 0) this.Atk_Mod.val = 1;
    else if (this.Atk_Mod.stage === 1) this.Atk_Mod.val = 1.5;
    else if (this.Atk_Mod.stage === 2) this.Atk_Mod.val = 2;
    else if (this.Atk_Mod.stage === 3) this.Atk_Mod.val = 2.5;

    if (recipient.Atk_Mod.stage === -3) recipient.Atk_Mod.val = 0.4;
    else if (recipient.Atk_Mod.stage === -2) recipient.Atk_Mod.val = 0.5;
    else if (recipient.Atk_Mod.stage === -1) recipient.Atk_Mod.val = 0.66;
    else if (recipient.Atk_Mod.stage === 0) recipient.Atk_Mod.val = 1;
    else if (recipient.Atk_Mod.stage === 1) recipient.Atk_Mod.val = 1.5;
    else if (recipient.Atk_Mod.stage === 2) recipient.Atk_Mod.val = 2;
    else if (recipient.Atk_Mod.stage === 3) recipient.Atk_Mod.val = 2.5;

    // Defence Modifiers

    // if (this.Def_Mod.stage === -3) this.Def_Mod.val = 0.4;
    // else if (this.Def_Mod.stage === -2) this.Def_Mod.val = 0.5;
    // else if (this.Def_Mod.stage === -1) this.Def_Mod.val = 0.66;
    // else if(this.Def_Mod.stage === 0) this.Def_Mod.val = 1;
    // else if (this.Def_Mod.stage === 1) this.Def_Mod.val = 1.5;
    // else if (this.Def_Mod.stage === 2) this.Def_Mod.val = 2;
    // else if (this.Def_Mod.stage === 3) this.Def_Mod.val = 2.5;

    if (recipient.Def_Mod.stage === -3) this.Def_Mod.val = 2.5;
    else if (recipient.Def_Mod.stage === -2) this.Def_Mod.val = 2;
    else if (recipient.Def_Mod.stage === -1) this.Def_Mod.val = 1.5;
    else if (recipient.Def_Mod.stage === 0) this.Def_Mod.val = 1;
    else if (recipient.Def_Mod.stage === 1) this.Def_Mod.val = 0.66;
    else if (recipient.Def_Mod.stage === 2) this.Def_Mod.val = 0.5;
    else if (recipient.Def_Mod.stage === 3) this.Def_Mod.val = 0.4;

    // neutral modifier condition
    if (
      this.Atk_Mod.stage != 0 &&
      recipient.Def_Mod.stage != 0 &&
      this.Atk_Mod.stage === recipient.Def_Mod.stage
    ) {
      this.Atk_Mod.val = 1;
      this.Def_Mod.val = 1;
    }
  }

  Check_Type(atk, opp_type) {
    if (atk.damage === 0) return;

    switch (atk.type) {
      case "Normal":
        if (opp_type === "Normal") this.Type_Effect.normal = true;
        if (opp_type === "Fire") this.Type_Effect.normal = true;
        if (opp_type === "Water") this.Type_Effect.normal = true;
        if (opp_type === "Grass") this.Type_Effect.normal = true;
        if (opp_type === "Dragon") this.Type_Effect.normal = true;
        if (opp_type === "Ground") this.Type_Effect.normal = true;
        if (opp_type === "Ice") this.Type_Effect.normal = true;
        break;
      case "Fire":
        if (opp_type === "Normal") this.Type_Effect.normal = true;
        if (opp_type === "Fire") this.Type_Effect.not_effective = true;
        if (opp_type === "Water") this.Type_Effect.not_effective = true;
        if (opp_type === "Grass") this.Type_Effect.super = true;
        if (opp_type === "Dragon") this.Type_Effect.not_effective = true;
        if (opp_type === "Ground") this.Type_Effect.normal = true;
        if (opp_type === "Ice") this.Type_Effect.super = true;
        break;
      case "Water":
        if (opp_type === "Normal") this.Type_Effect.normal = true;
        if (opp_type === "Fire") this.Type_Effect.super = true;
        if (opp_type === "Water") this.Type_Effect.not_effective = true;
        if (opp_type === "Grass") this.Type_Effect.not_effective = true;
        if (opp_type === "Dragon") this.Type_Effect.not_effective = true;
        if (opp_type === "Ground") this.Type_Effect.super = true;
        if (opp_type === "Ice") this.Type_Effect.not_effective = true;
        break;
      case "Dragon":
        if (opp_type === "Normal") this.Type_Effect.normal = true;
        if (opp_type === "Fire") this.Type_Effect.normal = true;
        if (opp_type === "Water") this.Type_Effect.normal = true;
        if (opp_type === "Grass") this.Type_Effect.normal = true;
        if (opp_type === "Dragon") this.Type_Effect.super = true;
        if (opp_type === "Ground") this.Type_Effect.normal = true;
        if (opp_type === "Ice") this.Type_Effect.normal = true;
        break;
      case "Ground":
        if (opp_type === "Normal") this.Type_Effect.normal = true;
        if (opp_type === "Fire") this.Type_Effect.super = true;
        if (opp_type === "Water") this.Type_Effect.normal = true;
        if (opp_type === "Grass") this.Type_Effect.normal = true;
        if (opp_type === "Dragon") this.Type_Effect.super = true;
        if (opp_type === "Ground") this.Type_Effect.normal = true;
        if (opp_type === "Ice") this.Type_Effect.normal = true;
        break;
      case "Ice":
        if (opp_type === "Normal") this.Type_Effect.normal = true;
        if (opp_type === "Fire") this.Type_Effect.normal = true;
        if (opp_type === "Water") this.Type_Effect.not_effective = true;
        if (opp_type === "Grass") this.Type_Effect.super = true;
        if (opp_type === "Dragon") this.Type_Effect.super = true;
        if (opp_type === "Ground") this.Type_Effect.super = true;
        if (opp_type === "Ice") this.Type_Effect.not_effective = true;
        break;
    }
  }

  Type_Value_Set(recipient, attack) {
    // check for type advantage/disadvantage
    this.Check_Type(attack, recipient.type);

    // Set type modifier values
    if (this.Type_Effect.normal) this.Type_Effect.val = 1;
    else if (this.Type_Effect.super) this.Type_Effect.val = 2.5;
    else if (this.Type_Effect.not_effective) this.Type_Effect.val = 0.5;
  }

  Crit_Modifier(attack) {
    let crit_prob = Math.random();
    switch (attack.crit_stage) {
      case 0:
        return crit_prob === 1 / 24 ? true : false;
        break;
      case 1:
        return crit_prob === 1 / 8 ? true : false;
        break;
      case 2:
        return crit_prob === 1 / 2 ? true : false;
        break;
      case 3:
        return true;
        break;
      default:
        return true;
    }
  }

  Attack({ attack, recipient, renderedSprites }) {
    // console.log(status_tracker);
    // console.log(status_color_tracker);
    //console.log(" current: " + this.current_status);
    // console.log("Reciever Type: " + recipient.type);

    document.querySelector("#attacksBox").style.opacity = "0";
    document.querySelector("#attacksBox").style.visibility = "hidden";
    document.querySelector("#attackTypeBox").style.opacity = "0";
    document.querySelector("#attackTypeBox").style.visibility = "hidden";

    //attack dialogue update
    if (!this.isEnemy)
      document.querySelector("#DialogueBox").innerHTML =
        this.name + " used " + attack.name + "!";
    else {
      document.querySelector("#DialogueBox").innerHTML =
        "The Opposing " + this.name + " used " + attack.name + "!";
    }

    document.querySelector("#DialogueBox").appendChild(progress_gif);
    document.querySelector("#DialogueBox").style.display = "block";

    let healthBar = "#enemyHealthBar";
    if (this.isEnemy) healthBar = "#playerHealthBar";
    const healthBarVisibility = document.querySelector(healthBar);

    this.Type_Value_Set(recipient, attack);
    this.Update_Modifiers(recipient);

    let A = attack.category === "Physical" ? this.stats.ATK : this.stats.SATK;
    let D = attack.category === "Physical" ? this.stats.DEF : this.stats.SDEF;
    let Level = this.isEnemy ? this.level : level_tracker.value;
    let Power = attack.damage;

    let AtkMod = this.Atk_Mod.val;
    let DefMod = this.Def_Mod.val;

    let random = Math.floor(Math.random() * 16 + 85) / 100;
    let Type = this.Type_Effect.val;
    let Crit = this.Crit_Modifier(attack) ? 1.5 : 1;
    let Stab = attack.type === this.type ? 1.25 : 1;
    let Burn = this.status === "BRND" ? 0.5 : 1;

    // console.log(this.name + " stage : " + this.Atk_Mod.stage + ", Atk: " + AtkMod);
    // console.log(this.name + " stage : " + this.Def_Mod.stage + ", Def: " + DefMod);

    // console.log(recipient.name + " stage : " + recipient.Atk_Mod.stage + ", Atk: " + recipient.Atk_Mod.val);
    // console.log(recipient.name + " stage : " + recipient.Def_Mod.stage + ", Def: " + recipient.Def_Mod.val);

    // console.log(AtkMod * DefMod);
    // console.log(this.Type_Effect);

    Type_Check = Type;
    console.log("Type Value : ", Type);

    let baseDamage = Math.floor(
      ((100 + A + 15 * Level) * Power) / (D + 50) / 5
    );
    let modMultiplier = AtkMod * DefMod;
    let finalMultiplier = random * Type * Crit * Stab * Burn;

    let DAMAGE = Math.floor(
      Math.floor(baseDamage * modMultiplier) * finalMultiplier
    );
    // console.log(DAMAGE);

    recipient.health -= DAMAGE;
    // console.log(recipient.name + " health: " + recipient.health);

    //keeps track of player monster's current health for upcoming battles
    if (this.isEnemy) {
      health_tracker.value = recipient.health;
      //console.log(health_tracker);

      health_width_tracker.value =
        (health_tracker.value / recipient.maxHealth) * 98.5 + "%";
    }

    //rotation for certain attacks
    let rotation = 1.2;
    if (this.isEnemy) rotation = -2.2;

    switch (attack.name) {
      case "Twister":
        const twisterImg = new Image();
        twisterImg.src = "./img/Twister.png";

        const twister = new Sprite({
          position: {
            x: recipient.position.x - 70,
            y: recipient.position.y - 100,
          },
          image: twisterImg,
          scale: 1.3,
          frames: {
            max: 12,
            hold: 8,
          },
          animate: true,
        });
        renderedSprites.splice(1, 0, twister); //'1' is the index of emby, we are not removing any element so '0' used, fireball gets inserted before emby so, index '1' is now fireball

        gsap.to(twister.position, {
          x: recipient.position.x - 90,
          y: recipient.position.y - 100,

          onComplete: () => {
            //enemy gets hit
            audio.TackleHit.play();

            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
              duration: 0.8,
              onComplete: () => {
                this.healthbarColor();
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker.value;
            this.status_color(recipient);

            if (this.Def_Mod.stage >= -3 && this.Def_Mod.stage < 3)
              this.Def_Mod.stage += 1;

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1); //removing the dragonbreath after hitting target
          },
        });
        break;

      case "DragonBreath":
        audio.initFireball.play();
        const dragonbreathImg = new Image();
        dragonbreathImg.src = "./img/dragonbreath.png";

        const dragonbreath = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: dragonbreathImg,
          frames: {
            max: 4,
            hold: 25,
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, dragonbreath); //'1' is the index of emby, we are not removing any element so '0' used, fireball gets inserted before emby so, index '1' is now fireball

        gsap.to(dragonbreath.position, {
          x: recipient.position.x,
          y: recipient.position.y,

          onComplete: () => {
            //enemy gets hit
            audio.FireballHit.play();

            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
              duration: 0.8,
              onComplete: () => {
                this.healthbarColor();
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker.value;
            this.status_color(recipient);

            // if (this.Def_Mod.stage >= -3 && this.Def_Mod.stage < 3)
            //   this.Def_Mod.stage += 1;

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1); //removing the dragonbreath after hitting target
          },
        });
        break;

      case "FireBall":
        audio.initFireball.play();
        const fireballImg = new Image();
        fireballImg.src = "./img/fireball.png";

        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: fireballImg,
          frames: {
            max: 4,
            hold: 25,
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, fireball); //'1' is the index of emby, we are not removing any element so '0' used, fireball gets inserted before emby so, index '1' is now fireball

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,

          onComplete: () => {
            //enemy gets hit
            audio.FireballHit.play();

            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
              duration: 0.8,
              onComplete: () => {
                this.healthbarColor();
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker.value;
            this.status_color(recipient);

            // if (this.Atk_Mod.stage >= -3 && this.Atk_Mod.stage < 3)
            //   this.Atk_Mod.stage += 1;

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1); //removing the fireball after hitting target
          },
        });
        break;

      case "WaterGun":
        // audio.initFireball.play();
        rotation = 0;
        if (this.isEnemy) rotation = -3.2;

        const watergunImg = new Image();
        watergunImg.src = "./img/WaterGun.png";

        const watergun = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: watergunImg,
          scale: 1.2,
          frames: {
            max: 5,
            hold: 16,
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, watergun); //'1' is the index of emby, we are not removing any element so '0' used, fireball gets inserted before emby so, index '1' is now fireball

        gsap.to(watergun.position, {
          x: recipient.position.x - 50,
          y: recipient.position.y + 10,

          onComplete: () => {
            //enemy gets hit
            audio.TackleHit.play();

            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
              duration: 0.8,
              onComplete: () => {
                this.healthbarColor();
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker.value;
            this.status_color(recipient);

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1); //removing the fireball after hitting target
          },
        });
        break;

      case "ThunderWave":
        let flagT = true;

        if (
          recipient.status != "NRML" ||
          (recipient.isPartner && status_tracker.value != "NRML") ||
          (recipient.isEnemy && recipient.status != "NRML")
        ) {
          document.querySelector("#DialogueBox").innerHTML =
            recipient.name + " is already under a status effect! ";
          flagT = false;
        }

        if (!flagT) return;

        const thunderWaveImg = new Image();
        thunderWaveImg.src = "./img/ThunderWave.png";

        const thunderWave = new Sprite({
          position: {
            x: recipient.position.x - 50,
            y: recipient.position.y - 60,
          },
          image: thunderWaveImg,
          frames: {
            max: 6,
            hold: 12,
          },
          animate: true,
        });
        renderedSprites.splice(1, 0, thunderWave);

        recipient.status = "PRLZ";
        if (this.isEnemy) this.current_status = "PRLZ";

        gsap.to(thunderWave.position, {
          x: recipient.position.x - 50,
          y: recipient.position.y - 60,

          onComplete: () => {
            //enemy gets hit
            audio.paralyzed.play();

            if (recipient.isEnemy) {
              document.querySelector("#enemyStat").innerHTML = "PRLZ";
            } else {
              document.querySelector("#playerStat").innerHTML = "PRLZ";
              status_tracker.value = "PRLZ";
            }
            this.status_color(recipient);

            // console.log(" current: " + this.current_status);
            // console.log(" track: " + status_tracker);
            // console.log(" color: " + status_color_tracker);

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });
        break;

      case "BurnUp":
        let flag = true;

        if (
          recipient.status != "NRML" ||
          (recipient.isPartner && status_tracker.value != "NRML") ||
          (recipient.isEnemy && recipient.status != "NRML")
        ) {
          document.querySelector("#DialogueBox").innerHTML =
            recipient.name + " is already under a status effect! ";
          flag = false;
        }

        if (flag) {
          audio.initFireball.play();
          const BurnUpImg = new Image();
          BurnUpImg.src = "./img/fireball.png";

          const burnUp = new Sprite({
            position: {
              x: this.position.x,
              y: this.position.y,
            },
            image: BurnUpImg,
            frames: {
              max: 4,
              hold: 25,
            },
            animate: true,
            rotation,
          });
          renderedSprites.splice(1, 0, burnUp);

          recipient.status = "BRND";
          if (this.isEnemy) this.current_status = "BRND";

          gsap.to(burnUp.position, {
            x: recipient.position.x,
            y: recipient.position.y,

            onComplete: () => {
              //enemy gets hit
              audio.FireballHit.play();

              if (recipient.isEnemy) {
                document.querySelector("#enemyStat").innerHTML = "BRND";
              } else {
                document.querySelector("#playerStat").innerHTML = "BRND";
                status_tracker.value = "BRND";
              }
              this.status_color(recipient);

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });

              gsap.to(recipient, {
                opacity: 0,
                yoyo: true,
                repeat: 3,
                duration: 0.08,
              });
              renderedSprites.splice(1, 1); //removing the fireball after hitting target
            },
          });
        }
        break;

      case "Bite":
        const biteImg = new Image();
        biteImg.src = "./img/Bite.png";

        const bite = new Sprite({
          position: {
            x: recipient.position.x - 50,
            y: recipient.position.y - 60,
          },
          image: biteImg,
          frames: {
            max: 4,
            hold: 18,
          },
          animate: true,
        });
        if (this.isPartner) renderedSprites.splice(1, 0, bite);
        else renderedSprites.splice(2, 0, bite);

        gsap.to(bite.position, {
          x: recipient.position.x - 50,
          y: recipient.position.y - 60,

          onComplete: () => {
            //enemy gets hit
            audio.TackleHit.play();

            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
              duration: 0.8,
              onComplete: () => {
                this.healthbarColor();
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker.value;
            this.status_color(recipient);

            if (this.Atk_Mod.stage >= -3 && this.Atk_Mod.stage < 3)
              this.Atk_Mod.stage += 1;

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.08,
            });
            if (this.isPartner) renderedSprites.splice(1, 1);
            else renderedSprites.splice(2, 1);
          },
        });
        break;

      case "Scratch":
        const tl = gsap.timeline(); //timeline object created using gsap library

        let movementDistance = 20;
        if (this.isEnemy) movementDistance = -20;

        const scratchImg = new Image();
        scratchImg.src = "./img/Scratch.png";

        const scratch = new Sprite({
          position: {
            x: recipient.position.x,
            y: recipient.position.y,
          },
          image: scratchImg,
          frames: {
            max: 4,
            hold: 40,
          },
          animate: true,
        });

        tl.to(this.position, {
          x: this.position.x - movementDistance,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,

            //enemy gets hit
            onComplete: () => {
              if (this.isPartner) renderedSprites.splice(1, 0, scratch);
              else renderedSprites.splice(2, 0, scratch);

              gsap.to(scratch.position, {
                x: recipient.position.x,
                y: recipient.position.y,
                duration: 0.5,

                onComplete: () => {
                  //enemy gets hit
                  audio.TackleHit.play();

                  gsap.to(healthBar, {
                    width:
                      (recipient.health / recipient.maxHealth) * 98.5 + "%",
                    duration: 0.8,
                    onComplete: () => {
                      this.healthbarColor();
                      if (recipient.health <= 0) {
                        healthBarVisibility.style.visibility = "hidden";
                      }
                    },
                  });

                  this.current_status = status_tracker.value;
                  this.status_color(recipient);

                  gsap.to(recipient.position, {
                    x: recipient.position.x + 10,
                    yoyo: true,
                    repeat: 5,
                    duration: 0.08,
                  });

                  gsap.to(recipient, {
                    opacity: 0,
                    yoyo: true,
                    repeat: 3,
                    duration: 0.08,
                  });
                },
              });
            },
          })
          .to(this.position, {
            //player monster sprite returns to original position
            x: this.position.x,

            onComplete: () => {
              if (this.isPartner) renderedSprites.splice(1, 1);
              else renderedSprites.splice(2, 1);
            },
          });
        break;

      case "Tackle":
        const tkl = gsap.timeline();

        let movement_Distance = 20;
        if (this.isEnemy) movement_Distance = -20;

        tkl
          .to(this.position, {
            x: this.position.x - movement_Distance,
          })
          .to(this.position, {
            x: this.position.x + movement_Distance * 2,
            duration: 0.1,

            //enemy gets hit
            onComplete: () => {
              //arrow function instead of noraml function given so that we can use/increase scope of 'this.health'
              audio.TackleHit.play();

              gsap.to(healthBar, {
                width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
                duration: 0.8,
                onComplete: () => {
                  this.healthbarColor();
                  if (recipient.health <= 0) {
                    healthBarVisibility.style.visibility = "hidden";
                  }
                },
              });

              this.current_status = status_tracker.value;
              this.status_color(recipient);

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });

              gsap.to(recipient, {
                opacity: 0,
                yoyo: true,
                repeat: 3,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            //player monster sprite returns to original position
            x: this.position.x,
          });
        break;
    }
  }

  faint() {
    document.querySelector("#DialogueBox").innerHTML = this.name + " Fainted! ";

    let Exp_Bar = document.querySelector("#ExpBar");

    //partner faints
    if (this.isPartner) {
      health_tracker.value = this.maxHealth;
      health_width_tracker.value = 98.5 + "%";
      this.current_status = "NRML";
      //console.log(health_width_tracker.value);
    } else {
      //enemy faints
      let exp_yield = Math.floor((this.base_exp_yield * this.level) / 4);
      console.log(exp_yield);
      exp_tracker.value += exp_yield;

      gsap.to(Exp_Bar, {
        width: (exp_tracker.value / max_exp_tracker.value) * 100 + "%",
        duration: 1.8,
        onUpdate: () => {
          let EXP_WIDTH = parseFloat(Exp_Bar.style.width);
          if (EXP_WIDTH >= 100) {
            if (!lvl_up) {
              level_tracker.value += 1;
              max_exp_tracker.value = max_exp(level_tracker.value);

              let marginal_exp_diff = max_exp_tracker.value - exp_tracker.value;
              excess_exp = exp_yield - marginal_exp_diff;

              exp_tracker.value = excess_exp;

              lvl_up = true;
            }
            document.querySelector("#ExpBar").style.width = "0%";
            document.querySelector("#player_lvl").innerHTML =
              level_tracker.value;
          }
        },
        onComplete: () => {
          if (lvl_up) {
            document.querySelector("#DialogueBox").innerHTML =
              playerMonsters.emby.name +
              " grew to Level " +
              level_tracker.value +
              " ! ";
            document.querySelector("#DialogueBox").appendChild(progress_gif);
          }

          gsap.to(Exp_Bar, {
            width: (exp_tracker.value / max_exp_tracker.value) * 100 + "%",
            duration: 1.8,
          });
          exp_width_tracker.value =
            (exp_tracker.value / max_exp_tracker.value) * 100 + "%";
          lvl_up = false;

          // if(exp_tracker >= max_exp_tracker) {
          //   exp_tracker = 0;
          //   max_exp_tracker = max_exp(level_tracker);
          // }
          stats_tracker.ATK += 1;
          stats_tracker.DEF += 1;
          stats_tracker.SPD += 1;
          stats_tracker.SDEF += 1;
          stats_tracker.SATK += 1;

          gsap.to(this.position, {
            y: this.position.y + 20,
          });

          gsap.to(this, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
              this.position.y = this.initialPosition.y;
            },
          });
          audio.battle.stop();
          audio.victory.play();
        },
      });
    }
  }
}
