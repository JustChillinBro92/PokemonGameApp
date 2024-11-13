import { c } from "./canvas.js";
import { audio } from "./data/audio.js";
import { playerMonsters } from "./data/monsters.js";

export class Boundary {
  static width = 36;
  static height = 36;

  constructor({ position }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
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
}

export let health_tracker = playerMonsters.emby.health;
export let health_width_tracker = 98.5 + "%";

export let status_tracker = "NRML";
export let status_color_tracker = "#2a2a2a";

// export let enemy_status_tracker = "NRML";
// export let enemy_status_color_tracker = "#2a2a2a";

export class Monster extends Sprite {
  //all methods of Sprite class are available here as well
  constructor({
    isEnemy = false,
    isPartner = false,
    name,
    health,
    position,
    image,
    frames = { max: 1, hold: 25 },
    scale = 1,
    sprites,
    animate = false,
    rotation = 0,
    attack,
    status,
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
    // Store the initial position
    this.initialPosition = { x: position.x, y: position.y };
    this.health = health;
    this.maxHealth = this.health;
    this.name = name;
    this.isEnemy = isEnemy;
    this.isPartner = isPartner;
    this.attack = attack;
    this.status = status;
    this.current_status = status_tracker;
  }

  status_effect_nonDamage() {
    let attack_occur = true;

    if (this.status === "PRLZ" ||
      (this.status != "PRLZ" && status_tracker === "PRLZ")
    ) {
      let paralyzed = Math.random();

      if (paralyzed < 0.65) {
        attack_occur = false;
        audio.paralyzed.play();
        console.log(this.name + " is paralyzed! ");

        document.querySelector("#DialogueBox").innerHTML =
          this.name + " was paralyzed and couldn't move! ";
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
      console.log("status hurt => current hp: " + this.health);

      document.querySelector("#DialogueBox").innerHTML =
        this.name + " was hurt due to its burn! ";
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
            console.log("color change");

            if (this.health <= 25) {
              healthBarVisibility.style.backgroundColor = "red";
              console.log("color change");
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
        document.querySelector(target).style.color = "#2a2a2a";

        //specifically for player monster stat color
        if (target === "#playerStat" && status_tracker === "NRML") {
          status_color_tracker = "#2a2a2a";
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
          status_color_tracker = "#2a2a2a";
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
          status_color_tracker = "#2a2a2a";
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
    let healthBar = "#playerHealthBar";
    const healthBarVisibility = document.querySelector(healthBar);

    //console.log(ItemUsedBy);
    console.log("Current Health: " + this.health);
    console.log("Current Health: " + health_tracker);

    let diff = this.maxHealth - health_tracker;
    let potion_heal = ItemUsed.heal;

    switch (ItemUsed.name) {
      case "Potion":
        if (this.health < this.maxHealth || health_tracker < this.maxHealth) {
          if (diff < potion_heal) potion_heal = diff;

          this.health += potion_heal;
          health_tracker += potion_heal;
          console.log("Restored Health: " + this.health);
          console.log("Restored Health: " + health_tracker);

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
        if (this.health < this.maxHealth || health_tracker < this.maxHealth) {
          if (diff < potion_heal) potion_heal = diff;

          this.health += potion_heal;
          health_tracker += potion_heal;
          console.log(this.health);

          audio.potion.play();
          gsap.to(healthBar, {
            width: (this.health / this.maxHealth) * 98.5 + "%",
            duration: 0.8,
            onUpdate: () => {
              if (this.health <= 60) {
                healthBarVisibility.style.backgroundColor = "yellow";
                console.log("color change");

                if (this.health <= 25) {
                  healthBarVisibility.style.backgroundColor = "red";
                  console.log("color change");
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

    //attack dialogue update
    if (!this.isEnemy)
      document.querySelector("#DialogueBox").innerHTML =
        this.name + " used " + attack.name + "!";
    else
      document.querySelector("#DialogueBox").innerHTML =
        "The Opposing " + this.name + " used " + attack.name + "!";

    document.querySelector("#DialogueBox").style.display = "block";

    let healthBar = "#enemyHealthBar";
    if (this.isEnemy) healthBar = "#playerHealthBar";
    const healthBarVisibility = document.querySelector(healthBar);

    //health updates with each instance of attack being called
    recipient.health -= attack.damage;
    console.log(recipient.name + " health: " + recipient.health);

    //keeps track of player monster's current health for upcoming battles
    if (this.isEnemy) {
      health_tracker = recipient.health;
      console.log(health_tracker);

      health_width_tracker = (health_tracker / recipient.maxHealth) * 98.5 + "%";
    }

    // if(recipient.health < 0) {
    //   health_tracker = this.health;
    //   console.log("current hp: " + health_tracker);
    // }

    //healthbar width tracking
    // if(this.isEnemy) health_width_tracker = (this.health / this.maxHealth) * 98.5 + "%";

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

            if (recipient.isEnemy) {
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
              //status_tracker = this.current_status;
            } else {
              gsap.to(healthBar, {
                width: health_width_tracker,
                duration: 0.8,
                onComplete: () => {
                  this.healthbarColor(recipient);
                  if (recipient.health <= 0) {
                    healthBarVisibility.style.visibility = "hidden";
                  }
                },
              });
              //status_tracker = recipient.status;
            }
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

            if (recipient.isEnemy) {
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
              //status_tracker = this.status;
            } else {
              gsap.to(healthBar, {
                width: health_width_tracker,
                duration: 0.8,
                onComplete: () => {
                  this.healthbarColor(recipient);
                  if (recipient.health <= 0) {
                    healthBarVisibility.style.visibility = "hidden";
                  }
                },
              });
              //status_tracker = recipient.status;
            }
            //status_tracker = this.current_status;
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
                //status_tracker = this.current_status;
                //document.querySelector("#playerStat").style.color = "Orangered";
              } else {
                //document.querySelector("#enemyStat").style.color = "Orangered";
                document.querySelector("#playerStat").innerHTML = "BRND";
                status_tracker = "BRND";
              }
              this.status_color(recipient);
              console.log(" current: " + this.current_status);
              console.log(" track: " + status_tracker);
              console.log(" color: " + status_color_tracker);

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

              if (recipient.isEnemy) {
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
              } else {
                gsap.to(healthBar, {
                  width: health_width_tracker,
                  duration: 0.8,
                  onComplete: () => {
                    this.healthbarColor(recipient);
                    if (recipient.health <= 0) {
                      healthBarVisibility.style.visibility = "hidden";
                    }
                  },
                });
              }

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
    //console.log("faint");
    document.querySelector("#DialogueBox").innerHTML = this.name + " Fainted! ";
    if (this.isPartner) {
      health_tracker = this.maxHealth;
      health_width_tracker = 98.5 + "%";
      this.current_status = "NRML";
      //console.log(health_width_tracker);
    }

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
  }
}
