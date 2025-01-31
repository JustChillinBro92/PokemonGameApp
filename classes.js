import { c } from "./canvas.js";
import { audio } from "./data/audio.js";
import { playerMonsters, max_exp } from "./data/monsters.js";
import { gameState, gameLoaded } from "./gameState.js";
// import { gameLoaded } from "./save_load.js";

export const progress_gif = new Image();
progress_gif.src = "./img/progress.gif";

export class Boundary {
  static width = 36;
  static height = 36;

  constructor({ position }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }

  // Method to update position based on new offsets
  updateOffset(deltaX, deltaY) {
    this.position.x += deltaX;
    this.position.y += deltaY;
  }

  draw() {
    c.fillStyle = "rgba(255, 0, 0, 0)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 25 },
    scale = 1,
    sprites,
    animate = false,
    rotation = 0,
  }) {
    this.position = position;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.scale = scale;
    this.rotation = rotation;

    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * this.scale;
      this.height = this.image.height * this.scale;
      // console.log("Iamge Loaded:", this.image.src, this.width, this.height);
    };

    this.image.src = image.src;
    this.animate = animate;
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

    if (!this.animate) return; // if player is not moving we do not call the following code

    if (this.frames.max > 1) {
      // it means that a sprite-sheet for animation is present
      this.frames.elapsed++;
    }
    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }

  npc_movement(pos, cameraOffset) {
    let left, right, up, down
    const direction = ["left", "right", "up", "down"]

    const randomDirection = direction[Math.floor(Math.random() * direction.length)]

    let initial_pos = pos;
    let current_pos = this.position;
    let target_posX = initial_pos.x + 100;
    let target_posY = initial_pos.y + 70;

    if(randomDirection === "left" && current_pos.x > initial_pos.x) {
      this.image = this.sprites.left;
      this.position.x -= 15;
    }
  
    if(randomDirection === "right" && current_pos.x < target_posX) {
      this.image = this.sprites.right;
      this.position.x += 15;
    }
  
    if(randomDirection === "up" && current_pos.y > initial_pos.y) {
      this.image = this.sprites.up;
      this.position.y -= 15;
    }

    if(randomDirection === "down" && current_pos.y < target_posY) {
      this.image = this.sprites.down;
      this.position.y += 15;
    }

    console.log(randomDirection);
    console.log("CameraOffset: " + cameraOffset.x + " " + cameraOffset.y)
    console.log("Initial Position: " + initial_pos.x + " " + initial_pos.y);
    console.log("Target: " + target_posX + " " + target_posY);
    // console.log("current pos: " + this.position.x + " " + this.position.y);
    // console.log("initial pos: " + pos.x + " " + pos.y);
  }
}

// export class Sprite {
//   constructor({
//     position,
//     image,
//     frames = { max: 1, hold: 25 },
//     scale = 1,
//     sprites,
//     animate = false,
//     rotation = 0,
//   }) {
//     this.position = position;
//     this.targetPosition = { x: position.x, y: position.y }; // Smooth movement target
//     this.image = new Image();
//     this.frames = { ...frames, val: 0, elapsed: 0 };
//     this.scale = scale;
//     this.rotation = rotation;

//     this.image.onload = () => {
//       this.width = (this.image.width / this.frames.max) * this.scale;
//       this.height = this.image.height * this.scale;
//     };

//     this.image.src = image.src;
//     this.animate = animate;
//     this.sprites = sprites;
//     this.opacity = 1;
//     this.speed = 1.5; // Lower speed for smoother movement
//   }

//   draw() {
//     c.save();
//     c.translate(
//       this.position.x + this.width / 2,
//       this.position.y + this.height / 2
//     );
//     c.rotate(this.rotation);
//     c.translate(
//       -this.position.x - this.width / 2,
//       -this.position.y - this.height / 2
//     );

//     c.globalAlpha = this.opacity;

//     const frameWidth = this.image.width / this.frames.max;
//     const frameHeight = this.image.height;
//     const scaledWidth = frameWidth * this.scale;
//     const scaledHeight = frameHeight * this.scale;

//     c.drawImage(
//       this.image,
//       this.frames.val * frameWidth,
//       0,
//       frameWidth,
//       frameHeight,
//       this.position.x,
//       this.position.y,
//       scaledWidth,
//       scaledHeight
//     );
//     c.restore();

//     if (!this.animate) return;

//     if (this.frames.max > 1) {
//       this.frames.elapsed++;
//     }
//     if (this.frames.elapsed % this.frames.hold === 0) {
//       if (this.frames.val < this.frames.max - 1) this.frames.val++;
//       else this.frames.val = 0;
//     }

//     this.smoothMove(); // Call smooth movement logic
//   }

//   smoothMove() {
//     const dx = this.targetPosition.x - this.position.x;
//     const dy = this.targetPosition.y - this.position.y;
//     const distance = Math.sqrt(dx * dx + dy * dy);

//     if (distance > 0.5) {
//       this.position.x += (dx / distance) * this.speed;
//       this.position.y += (dy / distance) * this.speed;
//     } else {
//       this.animate = false; // Stop animating when reaching the target
//     }
//   }

//   npc_movement(pos) {
//     const directions = ["left", "right", "up", "down"];
//     const randomDirection = directions[Math.floor(Math.random() * directions.length)];

//     if (randomDirection === "left" && this.position.x > pos.x) {
//       this.image = this.sprites.left;
//       this.targetPosition.x = this.position.x - 15;
//       this.animate = true;
//     }

//     if (randomDirection === "right" && this.position.x < pos.x + 100) {
//       this.image = this.sprites.right;
//       this.targetPosition.x = this.position.x + 15;
//       this.animate = true;
//     }

//     if (randomDirection === "up" && this.position.y > pos.y) {
//       this.image = this.sprites.up;
//       this.targetPosition.y = this.position.y - 15;
//       this.animate = true;
//     }

//     if (randomDirection === "down" && this.position.y < pos.y + 70) {
//       this.image = this.sprites.down;
//       this.targetPosition.y = this.position.y + 15;
//       this.animate = true;
//     }
//   }
// }


export let health_tracker = { value:playerMonsters.emby.health }

export let health_width_tracker = { value: 98.5 + "%" }

export let level_tracker = playerMonsters.emby.level;

export let exp_tracker = playerMonsters.emby.exp;
export let max_exp_tracker = playerMonsters.emby.max_exp;

export let excess_exp;

export let exp_width_tracker = document.querySelector("#ExpBar");

export let lvl_up = false;

export let status_tracker = "NRML";
export let status_color_tracker = "rgb(211, 210, 210)";

export let stats_tracker = playerMonsters.emby.stats;

// if(gameLoaded.onload === true) {
//   health_tracker = gameState.health_tracker;
//   health_width_tracker = gameState.health_width_tracker + "%";
//   gameLoaded.onload = false;
// }

// export let enemy_status_tracker = "NRML";
// export let enemy_status_color_tracker = "#2a2a2a";

export class Monster extends Sprite {
  //all methods of Sprite class are available here as well
  constructor({
    isEnemy = false,
    isPartner = false,
    name,
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
    this.level = level;
    this.exp = exp;
    this.max_exp = max_exp;
    this.base_exp_yield = base_exp_yield;
    this.maxHealth = this.health;
    this.name = name;
    this.isEnemy = isEnemy;
    this.isPartner = isPartner;
    this.attack = attack;
    this.status = status;
    this.current_status = status_tracker;
    this.stats = stats;
  }

  status_effect_nonDamage() {
    let attack_occur = true;

    if (
      this.status === "PRLZ" ||
      (this.status != "PRLZ" && status_tracker === "PRLZ")
    ) {
      let paralyzed = Math.random();

      if (paralyzed < 0.65) {
        attack_occur = false;
        audio.paralyzed.play();
        console.log(this.name + " is paralyzed! ");

        document.querySelector("#DialogueBox").innerHTML =
          this.name + " was paralyzed and couldn't move! ";
        document.querySelector("#DialogueBox").appendChild(progress_gif);
        document.querySelector("#DialogueBox").style.display = "block";
      }
    }
    return attack_occur;
  }

  status_effect_damage() {
    if (
      this.status === "BRND" ||
      (this.status != "BRND" && status_tracker === "BRND")
    ) {
      this.health -= 25;
      if (this.isPartner) {
        health_tracker.value -= 25;
        health_width_tracker.value = (health_tracker.value / this.maxHealth) * 98.5 + "%";
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

      audio.burn_damage.play();

      gsap.to(healthBar, {
        width: (this.health / this.maxHealth) * 98.5 + "%",
        duration: 0.8,
        onComplete: () => {
          //console.log("check");
          if (this.health <= 60) {
            healthBarVisibility.style.backgroundColor = "yellow";
            //console.log("color change");

            if (this.health <= 25) {
              healthBarVisibility.style.backgroundColor = "red";
              //console.log("color change");
            }
          } else healthBarVisibility.style.backgroundColor = "rgb(58, 227, 58)";
        },
      });
    }
  }

  status_color(recipient) {
    let target = "#enemyStat";
    if (this.isEnemy) target = "#playerStat";

    switch (recipient.status) {
      case "NRML":
        document.querySelector(target).style.color = "rgb(211, 210, 210)";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker === "NRML") {
          status_color_tracker = "rgb(211, 210, 210)";
          document.querySelector(target).style.color = status_color_tracker;
        } else if (target === "#playerStat" && status_tracker === "BRND") {
          status_color_tracker = "Orangered";
          document.querySelector(target).style.color = status_color_tracker;
        } else if (target === "#playerStat" && status_tracker === "PRLZ") {
          status_color_tracker = "yellow";
          document.querySelector(target).style.color = status_color_tracker;
        }
        break;
      case "BRND":
        document.querySelector(target).style.color = "Orangered";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker === "BRND") {
          status_color_tracker = "Orangered";
          document.querySelector(target).style.color = status_color_tracker;
        } else if (target === "#playerStat" && status_tracker === "NRML") {
          status_color_tracker = "rgb(211, 210, 210)";
          document.querySelector(target).style.color = status_color_tracker;
        } else if (target === "#playerStat" && status_tracker === "PRLZ") {
          status_color_tracker = "yellow";
          document.querySelector(target).style.color = status_color_tracker;
        }
        break;
      case "PRLZ":
        document.querySelector(target).style.color = "yellow";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker === "PRLZ") {
          status_color_tracker = "yellow";
          document.querySelector(target).style.color = status_color_tracker;
        } else if (target === "#playerStat" && status_tracker === "NRML") {
          status_color_tracker = "rgb(211, 210, 210)";
          document.querySelector(target).style.color = status_color_tracker;
        } else if (target === "#playerStat" && status_tracker === "BRND") {
          status_color_tracker = "Orangered";
          document.querySelector(target).style.color = status_color_tracker;
        }
        break;
    }
  }

  healthbarColor(recipient) {
    let healthBar = "#enemyHealthBar"; //player attacks
    if (this.isEnemy) healthBar = "#playerHealthBar"; //enemy attacks or healing used by player

    const healthBarVisibility = document.querySelector(healthBar);

    //const healthBarPercentage = (recipient.health/recipient.maxHealth) * 98.5
    if (recipient.health <= 60) {
      healthBarVisibility.style.backgroundColor = "yellow";
      //console.log("color change");

      if (recipient.health <= 25) {
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
        if (this.health < this.maxHealth || health_tracker.value < this.maxHealth) {
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
              //console.log("check");
              if (this.health <= 60) {
                healthBarVisibility.style.backgroundColor = "yellow";
                //console.log("color change");

                if (this.health <= 25) {
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
        if (this.health < this.maxHealth || health_tracker.value < this.maxHealth) {
          if (diff < potion_heal) potion_heal = diff;

          this.health += potion_heal;
          health_tracker.value += potion_heal;
          // console.log(this.health);

          audio.potion.play();
          gsap.to(healthBar, {
            width: (this.health / this.maxHealth) * 98.5 + "%",
            duration: 0.8,
            onUpdate: () => {
              if (this.health <= 60) {
                healthBarVisibility.style.backgroundColor = "yellow";
                // console.log("color change");

                if (this.health <= 25) {
                  healthBarVisibility.style.backgroundColor = "red";
                  // console.log("color change");
                }
              } else
                healthBarVisibility.style.backgroundColor = "rgb(58, 227, 58)";
            },
          });
        } else if (this.health === this.maxHealth) console.log("Not possible");
        break;

      case "Burn Heal":
        audio.status_heal.play();

        if (this.status === "BRND" || status_tracker === "BRND") {
          this.status = "NRML";
          status_tracker = "NRML";
          document.querySelector("#playerStat").style.color = "#2a2a2a";
        }
        document.querySelector("#playerStat").innerHTML = this.status;
        break;

      case "Paralyze Heal":
        audio.status_heal.play();

        if (this.status === "PRLZ" || status_tracker === "PRLZ") {
          this.status = "NRML";
          status_tracker = "NRML";
          document.querySelector("#playerStat").innerHTML = this.status;
        }
        break;
    }
  }

  Attack({ attack, recipient, renderedSprites }) {
    // console.log(status_tracker);
    // console.log(status_color_tracker);
    //console.log(" current: " + this.current_status);

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

      // document.querySelector("#attacksBox").style.opacity = "1";
      // document.querySelector("#attacksBox").style.visibility = "visible";
      // document.querySelector("#attackTypeBox").style.opacity = "1";
      // document.querySelector("#attackTypeBox").style.visibility = "visible";
    }
      

    document.querySelector("#DialogueBox").appendChild(progress_gif);

    document.querySelector("#DialogueBox").style.display = "block";

    let healthBar = "#enemyHealthBar";
    if (this.isEnemy) healthBar = "#playerHealthBar";
    const healthBarVisibility = document.querySelector(healthBar);

    //health updates with each instance of attack being called
    recipient.health -= attack.damage;
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
      case "DragonBreath":
        audio.initFireball.play();
        const dragonbreathImg = new Image();
        dragonbreathImg.src = "./img/dragonbreath.png";

        const dragonbreath = new Monster({
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
                this.healthbarColor(recipient);
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker;
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
            renderedSprites.splice(1, 1); //removing the dragonbreath after hitting target
          },
        });
        break;

      case "FireBall":
        audio.initFireball.play();
        const fireballImg = new Image();
        fireballImg.src = "./img/fireball.png";

        const fireball = new Monster({
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
                this.healthbarColor(recipient);
                if (recipient.health <= 0) {
                  healthBarVisibility.style.visibility = "hidden";
                }
              },
            });

            this.current_status = status_tracker;
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
            renderedSprites.splice(1, 1); //removing the fireball after hitting target
          },
        });
        break;

      case "BurnUp":
        let flag = true;

        if (
          recipient.status != "NRML" ||
          (recipient.isPartner && status_tracker != "NRML") ||
          (recipient.isEnemy && recipient.status != "NRML")
        ) {
          document.querySelector("#DialogueBox").innerHTML =
            recipient.name + " is already under a status effect! ";
          flag = false;
        }

        if (flag) {
          // document.querySelector("#DialogueBox").innerHTML =
          //   recipient.name + " has been burned! ";

          audio.initFireball.play();
          const BurnUpImg = new Image();
          BurnUpImg.src = "./img/fireball.png";

          const burnUp = new Monster({
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
                status_tracker = "BRND";
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
              renderedSprites.splice(1, 1); //removing the fireball after hitting target
            },
          });
        }
        break;

      case "Tackle":
        const tl = gsap.timeline(); //timeline object created using gsap library

        let movementDistance = 20;
        if (this.isEnemy) movementDistance = -20;

        tl.to(this.position, {
          x: this.position.x - movementDistance,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,

            //enemy gets hit
            onComplete: () => {
              //arrow function instead of noraml function given so that we can use/increase scope of 'this.health'
              audio.TackleHit.play();

              gsap.to(healthBar, {
                width: (recipient.health / recipient.maxHealth) * 98.5 + "%",
                duration: 0.8,
                onComplete: () => {
                  this.healthbarColor(recipient);
                  if (recipient.health <= 0) {
                    healthBarVisibility.style.visibility = "hidden";
                  }
                },
              });

              this.current_status = status_tracker;
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

    //partner faints
    if (this.isPartner) {
      health_tracker.value = this.maxHealth;
      health_width_tracker.value = 98.5 + "%";
      this.current_status = "NRML";
      //console.log(health_width_tracker.value);
    } else {
      //enemy faints
      let exp_yield = Math.floor((this.base_exp_yield * this.level) / 7);
      exp_tracker += exp_yield;

      gsap.to(exp_width_tracker, {
        width: (exp_tracker / max_exp_tracker) * 100 + "%",
        duration: 1,
        onUpdate: () => {
          let EXP_WIDTH = parseFloat(exp_width_tracker.style.width);
          if (EXP_WIDTH >= 100) {
            if (!lvl_up) {
              level_tracker += 1;
              max_exp_tracker = max_exp(level_tracker);

              let marginal_exp_diff = max_exp_tracker - exp_tracker;
              excess_exp = exp_yield - marginal_exp_diff;

              exp_tracker = excess_exp;

              lvl_up = true;
              //document.querySelector("#DialogueBox").innerHTML = playerMonsters.emby.name + " grew to Level " + level_tracker + " ! ";
            }
            document.querySelector("#ExpBar").style.width = "0%";
            document.querySelector("#player_lvl").innerHTML = level_tracker;
          }
        },
        onComplete: () => {
          if (lvl_up) {
            document.querySelector("#DialogueBox").innerHTML =
              playerMonsters.emby.name +
              " grew to Level " +
              level_tracker +
              " ! ";
            document.querySelector("#DialogueBox").appendChild(progress_gif);
          }

          gsap.to(exp_width_tracker, {
            width: (exp_tracker / max_exp_tracker) * 100 + "%",
            duration: 1,
          });
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
