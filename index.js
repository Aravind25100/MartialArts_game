// Create game objects for canvas
let c = document.getElementById("game");
let ctx = c.getContext("2d");
let ctx1 = c.getContext("2d");
 
// This function will used to load the images
let loadImage = (src,callback) =>{
    let img=document.createElement("img");
    img.onload = () =>callback(img);
    img.src = src;
};

// This function will return the image path
let imagePath = (FrameNumber,animation) =>{
    return "images/"+ animation +"/"+FrameNumber+".png";
};

// Each moves has different number frames. So, i note the number of frames to load the images
let frames={
    idle:[1,2,3,4,5,6,7,8],
    kick:[1,2,3,4,5,6,7],
    punch:[1,2,3,4,5,6,7],
    backward:[1,2,3,4,5,6],
    block:[1,2,3,4,5,6,7,8,9],
    forward:[1,2,3,4,5,6]
}

// This function is used to store the loaded images into the images[moves] array.
let loadImages = (callback) =>{
    let images={idle:[],kick:[],punch:[],backward:[],block:[],forward:[]};
    let imagesToLoad=0;
    ["idle","kick","punch","backward","block","forward"].forEach((animation)=>{
        let animationFrames = frames[animation];
        imagesToLoad = imagesToLoad + animationFrames.length;
        animationFrames.forEach(frameNumber=>{
            let path = imagePath(frameNumber,animation);
            loadImage(path,(image)=>{
                images[animation][frameNumber-1]=image;
                imagesToLoad = imagesToLoad-1;
     
                if(imagesToLoad===0){
                    callback(images);
                }
             });
        });
    });
};

// This funtion is used to animate the user's move and the opponent's move. Then it will draw the images into the canvas 
let Animate = (ctx,ctx1,leftpos,rightpos,images,animation,move,Collision,callback) =>{
    // Sound for user's move
    if(animation==="kick" || animation==="punch"){
        actionSound = new sound("images/"+animation+".mp3");
        actionSound.play();
    }
    if((rightmove===6 || leftmove===6 || rightmove+leftmove===6) && (((animation==="kick" || animation==="punch") && move==="block")|| ((move==="kick" || move==="punch") && animation==="block"))){
        actionSound = new sound("images/shield.mp3");
        actionSound.play();
    }
    // Animate user's images
    images[animation].forEach((image,index)=>{
         setTimeout(()=>{
            let extraframe=500;
            if(Collision===6)
               extraframe=400;
            ctx1.clearRect(0,0,(leftpos+extraframe),500);
            ctx1.drawImage(image,leftpos,0,500,500);
         },index*100);
    });
    // Sound for opponent's move
    if(move==="kick" || move==="punch" ){
        actionSound = new sound("images/"+move+".mp3").play();
    }
    // Animate opponent's images
    images[move].forEach((image,index)=>{
        setTimeout(()=>{
           let extraframe=500;
           if(Collision===6)
               extraframe=320;
           else if(Collision+1===6)
               extraframe=350;
           ctx.clearRect((-(rightpos)-extraframe),0,extraframe+50,500);
           ctx.save(); // Save the current state
           ctx.scale(-1, 1); // Set scale to flip the image
           ctx.drawImage(image, rightpos, 0, 500, 500); // draw the image
           ctx.restore(); // Restore the last saved state
        },index*100);
   });
    //This will call the aux function after animating both the user's and opponent's images    
    setTimeout(callback,images[animation].length*100);
}

// This function is used to get a random integer 
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
};

let actionSound;

// This function is used to play the audio for the particular move.
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.autoplay=true;
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }  
};

// Standing positions for the user and opponent
let leftposition = [0];
let rightposition = [-1300];
let leftmove=0;
let rightmove=0;

// User and opponent's life span
let rightLife=100;
let leftLife=100;

loadImages((images)=>{
    let queuedAnimate=[];
    let moves;
    // This will used to call the animate function
    let aux = () =>{
        let selectedAnimate;
        // Used to get random moves for an opponent
        moves=["forward","backward","punch","kick","block"][getRndInteger(0,4)];
        // Set idle move if the user don't react ,else set the user's reaction as a move
        if(queuedAnimate.length===0){
            selectedAnimate = "idle";
        }else{
            selectedAnimate = queuedAnimate.shift();
        }
        // Used to move the opponent to the user
        if(leftmove+rightmove<5)
           moves="forward";

        // Here change the position according to the forward move
        if(moves==="forward"){
            if(leftmove==6 || leftmove+rightmove==6)
               rightposition[0]=rightposition[0]
            else if(leftmove<6){
                if(rightposition[0]+100<=700){
                   rightposition[0]=rightposition[0]+100
                   rightmove=rightmove+1;
                }
                else{
                    rightposition[0]=rightposition[0];
                }
            }
        }
        // Here change the position according to the backward move
        else if(moves==="backward"){
            if(rightposition[0]-100>=-1300){
                rightposition[0]=rightposition[0]-100;
                rightmove=rightmove-1;
            }
            else{
                rightposition[0]=rightposition[0];
            }
        }
        // Make shield sound if the player or user try to defense them when they are closer  
        else if(moves==="block" && (rightmove===6 || leftmove===6 || rightmove+leftmove===6) && (selectedAnimate==="punch" || selectedAnimate==="kick")){
            actionSound = new sound("images/shield.mp3");
            actionSound.play();
        }
        // Reduce life for the opponent when the user try to attack and the opponent is not using block move to protect
        if(leftmove===6){
            if((selectedAnimate==="kick" || selectedAnimate==="punch") && moves!="block"){
                 let redLife = document.getElementById("lifeRed");
                 setTimeout((rightLife=rightLife-10),1000);
                 (redLife.style.width = rightLife+"%");
            }
        }    
        // Reduce life for the user when the opponent try to attack and the user is not using block move to protect
        if(rightmove===6){
            if((moves==="kick" || moves==="punch") && selectedAnimate!="block"){
                 let greenLife = document.getElementById("lifeGreen");
                 setTimeout((leftLife=leftLife-10),1000);
                 (greenLife.style.width = leftLife+"%");
            }
        } 
        // Reduce life with respect to the player   
        if(rightmove+leftmove===6){
                if((selectedAnimate==="kick" || selectedAnimate==="punch") && (moves!="block" || moves!="backward")){
                     let redLife = document.getElementById("lifeRed");
                     setTimeout((rightLife=rightLife-10),1000);
                     (redLife.style.width = rightLife+"%");
            }
            if((moves==="kick" || moves==="punch") && (selectedAnimate!="block" || selectedAnimate!="backward")){
                 let greenLife = document.getElementById("lifeGreen");
                 setTimeout((leftLife=leftLife-10),1000);
                 (greenLife.style.width = leftLife+"%");
            }
        } 

        // It will animate the pictures if the players are not lose
        if(rightLife>0 && leftLife>0){
               ctx.clearRect(0,0,1300,500);
               Animate(ctx,ctx1,leftposition[0],rightposition[0],images,selectedAnimate,moves,rightmove+leftmove,aux);
        }
        // It will announce the player name who win the match
        else{
            let announcement="";
            if(rightLife<=0){
                announcement = "Player 1 win the match!";
            }
            else if(leftLife<=0){
                announcement = "Player 2 win the match!";
            }setTimeout(()=>{
                document.getElementById("result").innerHTML=announcement;
                document.getElementById("popup-1").classList.toggle("active");
            },200);
        }
    };
    aux();
    
    // using buttons to access the user game object
    document.getElementById("kick").onclick = ()=>{
        queuedAnimate.push("kick");
    };
    document.getElementById("punch").onclick = ()=>{
        queuedAnimate.push("punch");
     };
     document.getElementById("forward").onclick = ()=>{
        queuedAnimate.push("forward");
        if(rightmove==6 || leftmove+rightmove==6)
           leftposition[0]=leftposition[0];
        else if(rightmove+leftmove<6){
           if(leftposition[0]+100<=600){
               leftposition[0]=leftposition[0]+100;
               leftmove=leftmove+1              
            }
           else
               leftposition[0]=leftposition[0];
        }
    };
    document.getElementById("backward").onclick = ()=>{
        queuedAnimate.push("backward");
        if(leftposition[0]-100>=0){
            leftposition[0]=leftposition[0]-100;
            leftmove=leftmove-1; 
       }
        else{
            leftposition[0]=leftposition[0];
        }
     };
     document.getElementById("block").onclick = ()=>{
        queuedAnimate.push("block");
     };
     
     // using keyboard to access the user game object
     document.addEventListener("keydown",(event)=>{
        const key = event.key; //arrow right,left,up,down and letters
        if(key==="ArrowUp" || key==="w"){
            queuedAnimate.push("kick");
        }
        else if(key==="ArrowDown" || key==="x"){
            queuedAnimate.push("punch");
        }
        else if(key==="ArrowRight" || key==="s"){
            queuedAnimate.push("forward");
            if(rightmove==6 || leftmove+rightmove==6)
               leftposition[0]=leftposition[0];
            else if(rightmove+leftmove<6){
               if(leftposition[0]+100<=600){
                   leftposition[0]=leftposition[0]+100;
                   leftmove=leftmove+1              
                }
               else
                   leftposition[0]=leftposition[0];
            }
               
        }
        else if(key==="ArrowLeft" || key==="d"){
            queuedAnimate.push("backward");
            if(leftposition[0]-100>=0){
                leftposition[0]=leftposition[0]-100;
                leftmove=leftmove-1; 
           }
            else{
                leftposition[0]=leftposition[0];
            }
        }
        else if(event.code === "Space"){
            queuedAnimate.push("block");
        }
    });
});