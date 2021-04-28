// Create game objects
let canvas = document.getElementById("game");
let opponentCanvas = canvas.getContext("2d");
let playerCanvas = canvas.getContext("2d");

// Standing positions for the user and opponent
let playerPosition = [0];
let opponentPosition = [-1300];
let playerMoves = 0;
let opponentMoves = 0;

// User and opponent's life span
let opponentLife = 100;
let playerLife = 100;

// declaration for audio 
let actionSound;

// This function will used to load the images
let loadImage = (src, callback) => {
    let img = document.createElement("img");
    img.onload = () => callback(img);
    img.src = src;
};

// This function will return the image path
let imagePath = (frameNumber, animation) => {
    return "images/" + animation + "/" + frameNumber + ".png";
};

// Each moves has different number frames. So, i note the number of frames to load the images
let frames = {
    idle: [1, 2, 3, 4, 5, 6, 7, 8],
    kick: [1, 2, 3, 4, 5, 6, 7],
    punch: [1, 2, 3, 4, 5, 6, 7],
    backward: [1, 2, 3, 4, 5, 6],
    block: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    forward: [1, 2, 3, 4, 5, 6]
}

// This function is used to store the loaded images into the images[moves] array.
let loadImages = (callback) => {
    let images = {
        idle: [],
        kick: [],
        punch: [],
        backward: [],
        block: [],
        forward: []
    };
    let imagesToLoad = 0;
    ["idle", "kick", "punch", "backward", "block", "forward"].forEach((animation) => {
        let animationFrames = frames[animation];
        imagesToLoad = imagesToLoad + animationFrames.length;
        animationFrames.forEach(frameNumber => {
            let path = imagePath(frameNumber, animation);
            loadImage(path, (image) => {
                images[animation][frameNumber - 1] = image;
                imagesToLoad = imagesToLoad - 1;

                if (imagesToLoad === 0) {
                    callback(images);
                }
            });
        });
    });
};

// This funtion is used to animate the user's move and the opponent's move. Then it will draw the images into the canvas 
let Animate = (opponentCanvas, playerCanvas, leftpos, rightpos, images, animation, move, collision, callback) => {
    // Sound for user's move
    if (animation === "kick" || animation === "punch") {
        actionSound = new sound("images/" + animation + ".mp3");
        actionSound.play();
    }
    if ((opponentMoves === 6 || playerMoves === 6 || opponentMoves + playerMoves === 6) && (((animation === "kick" || animation === "punch") && move === "block") || ((move === "kick" || move === "punch") && animation === "block"))) {
        actionSound = new sound("images/shield.mp3");
        actionSound.play();
    }
    // Animate user's images
    images[animation].forEach((image, index) => {
        setTimeout(() => {
            let extraFrame = 500;
            if (collision === 6)
                extraFrame = 400;
            playerCanvas.clearRect(0, 0, (leftpos + extraFrame), 500);
            playerCanvas.drawImage(image, leftpos, 0, 500, 500);
        }, index * 100);
    });
    // Sound for opponent's move
    if (move === "kick" || move === "punch") {
        actionSound = new sound("images/" + move + ".mp3").play();
    }
    // Animate opponent's images
    images[move].forEach((image, index) => {
        setTimeout(() => {
            let extraFrame = 500;
            if (collision === 6)
                extraFrame = 320;
            else if (collision + 1 === 6)
                extraFrame = 350;
            opponentCanvas.clearRect((-(rightpos) - extraFrame), 0, extraFrame + 50, 500);
            opponentCanvas.save(); // Save the current state
            opponentCanvas.scale(-1, 1); // Set scale to flip the image
            opponentCanvas.drawImage(image, rightpos, 0, 500, 500); // draw the image
            opponentCanvas.restore(); // Restore the last saved state
        }, index * 100);
    });
    //This will call the aux function after animating both the user's and opponent's images    
    setTimeout(callback, images[animation].length * 100);
}

// This function is used to get a random integer 
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// This function is used to play the audio for the particular move.
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.autoplay = true;
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
};

loadImages((images) => {
    let queuedAnimate = [];
    let moves;
    // This will used to call the animate function
    let aux = () => {
        let selectedAnimate;
        // Used to get random moves for an opponent
        moves = ["forward", "backward", "punch", "kick", "block"][getRndInteger(0, 4)];
        // Set idle move if the user don't react ,else set the user's reaction as a move
        if (queuedAnimate.length === 0) {
            selectedAnimate = "idle";
        } else {
            selectedAnimate = queuedAnimate.shift();
        }
        // Used to move the opponent to the user
        if (playerMoves + opponentMoves < 5)
            moves = "forward";

        // Here change the position according to the forward move
        // The player can move only 6 steps forward/backward
        // The player before doing any action like kick or punch should reach very close to the another player to reduce his life
        if (moves === "forward") {
            if (playerMoves == 6 || playerMoves + opponentMoves == 6)
                opponentPosition[0] = opponentPosition[0]
            else if (playerMoves < 6) {
                if (opponentPosition[0] + 100 <= 700) {
                    opponentPosition[0] = opponentPosition[0] + 100
                    opponentMoves = opponentMoves + 1;
                } else {
                    opponentPosition[0] = opponentPosition[0];
                }
            }
        }
        // Here change the position according to the backward move
        else if (moves === "backward") {
            if (opponentPosition[0] - 100 >= -1300) {
                opponentPosition[0] = opponentPosition[0] - 100;
                opponentMoves = opponentMoves - 1;
            } else {
                opponentPosition[0] = opponentPosition[0];
            }
        }
        // Make shield sound if the player or user try to defense them when they are closer  
        else if (moves === "block" && (opponentMoves === 6 || playerMoves === 6 || opponentMoves + playerMoves === 6) && (selectedAnimate === "punch" || selectedAnimate === "kick")) {
            actionSound = new sound("images/shield.mp3");
            actionSound.play();
        }
        // Reduce life for the opponent when the user try to attack and the opponent is not using block move to protect
        // while using block move a player's life wont reduce.
        if (playerMoves === 6) {
            if ((selectedAnimate === "kick" || selectedAnimate === "punch") && moves != "block") {
                let redLife = document.getElementById("lifeRed");
                setTimeout((opponentLife = opponentLife - 10), 1000);
                (redLife.style.width = opponentLife + "%");
            }
        }
        // Reduce life for the user when the opponent try to attack and the user is not using block move to protect
        // while using block move a player's life wont reduce.
        if (opponentMoves === 6) {
            if ((moves === "kick" || moves === "punch") && selectedAnimate != "block") {
                let greenLife = document.getElementById("lifeGreen");
                setTimeout((playerLife = playerLife - 10), 1000);
                (greenLife.style.width = playerLife + "%");
            }
        }
        // Reduce life with respect to the player   
        if (opponentMoves + playerMoves === 6) {
            if ((selectedAnimate === "kick" || selectedAnimate === "punch") && (moves != "block")) {
                let redLife = document.getElementById("lifeRed");
                setTimeout((opponentLife = opponentLife - 10), 1000);
                (redLife.style.width = opponentLife + "%");
            }
            if ((moves === "kick" || moves === "punch") && (selectedAnimate != "block")) {
                let greenLife = document.getElementById("lifeGreen");
                setTimeout((playerLife = playerLife - 10), 1000);
                (greenLife.style.width = playerLife + "%");
            }
        }

        // As long as life is not equal to 0 the animate function will work otherwise it will go to the else condition
        if (opponentLife > 0 && playerLife > 0) {
            opponentCanvas.clearRect(0, 0, 1300, 500);
            Animate(opponentCanvas, playerCanvas, playerPosition[0], opponentPosition[0], images, selectedAnimate, moves, opponentMoves + playerMoves, aux);
        }
        else {
            let announcement = "";
            if (opponentLife <= 0) {
                announcement = "Player 1 win the match!";
            } else if (playerLife <= 0) {
                announcement = "Player 2 win the match!";
            }
            // It will announce the player's name who wins the match
            setTimeout(() => {
                document.getElementById("result").innerHTML = announcement;
                document.getElementById("popup-1").classList.toggle("active");
            }, 200);
        }
    };
    aux();

    // using buttons to access the player moves
    document.getElementById("kick").onclick = () => {
        queuedAnimate.push("kick");
    };
    document.getElementById("punch").onclick = () => {
        queuedAnimate.push("punch");
    };
    document.getElementById("forward").onclick = () => {
        queuedAnimate.push("forward");
        if (opponentMoves == 6 || playerMoves + opponentMoves == 6)
            playerPosition[0] = playerPosition[0];
        else if (opponentMoves + playerMoves < 6) {
            if (playerPosition[0] + 100 <= 600) {
                playerPosition[0] = playerPosition[0] + 100;
                playerMoves = playerMoves + 1
            } else
                playerPosition[0] = playerPosition[0];
        }
    };
    document.getElementById("backward").onclick = () => {
        queuedAnimate.push("backward");
        if (playerPosition[0] - 100 >= 0) {
            playerPosition[0] = playerPosition[0] - 100;
            playerMoves = playerMoves - 1;
        } else {
            playerPosition[0] = playerPosition[0];
        }
    };
    document.getElementById("block").onclick = () => {
        queuedAnimate.push("block");
    };

    // using keyboard to access the player moves
    document.addEventListener("keydown", (event) => {
        const key = event.key; //arrow right,left,up,down and letters
        if (key === "ArrowUp" || key === "w") {
            queuedAnimate.push("kick");
        } else if (key === "ArrowDown" || key === "x") {
            queuedAnimate.push("punch");
        } else if (key === "ArrowRight" || key === "s") {
            queuedAnimate.push("forward");
            if (opponentMoves == 6 || playerMoves + opponentMoves == 6)
                playerPosition[0] = playerPosition[0];
            else if (opponentMoves + playerMoves < 6) {
                if (playerPosition[0] + 100 <= 600) {
                    playerPosition[0] = playerPosition[0] + 100;
                    playerMoves = playerMoves + 1
                } else
                    playerPosition[0] = playerPosition[0];
            }

        } else if (key === "ArrowLeft" || key === "d") {
            queuedAnimate.push("backward");
            if (playerPosition[0] - 100 >= 0) {
                playerPosition[0] = playerPosition[0] - 100;
                playerMoves = playerMoves - 1;
            } else {
                playerPosition[0] = playerPosition[0];
            }
        } else if (event.code === "Space") {
            queuedAnimate.push("block");
        }
    });
});
