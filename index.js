let c = document.getElementById("game");
let ctx = c.getContext("2d");
let ctx1 = c.getContext("2d");
 
//mirror the image

// this function will load the image
let loadImage = (src,callback) =>{
    let img=document.createElement("img");
    img.onload = () =>callback(img);
    img.src = src;
};

// this function will return the image path
let imagePath = (FrameNumber,animation) =>{
    return "images/"+ animation +"/"+FrameNumber+".png";
};

let frames={
    idle:[1,2,3,4,5,6,7,8],
    kick:[1,2,3,4,5,6,7],
    punch:[1,2,3,4,5,6,7],
    backward:[1,2,3,4,5,6],
    block:[1,2,3,4,5,6,7,8,9],
    forward:[1,2,3,4,5,6]
}

// this function will return the image path
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

// this function is uses to animate the images
let Animate = (ctx,ctx1,leftpos,rightpos,images,animation,move,Collision,callback) =>{
    images[animation].forEach((image,index)=>{
         setTimeout(()=>{
            let extraframe=500;
            if(Collision===6)
               extraframe=400;
            ctx1.clearRect(0,0,(leftpos+extraframe),500);
            ctx1.drawImage(image,leftpos,0,500,500);
         },index*100);
    });
    images[move].forEach((image,index)=>{
        setTimeout(()=>{
           let extraframe=500;
           if(Collision===6)
               extraframe=320;
           else if(Collision+1===6)
               extraframe=350
           ctx.clearRect((-(rightpos)-extraframe),0,extraframe+50,500);
           ctx.save(); // Save the current state
           ctx.scale(-1, 1); // Set scale to flip the image
           ctx.drawImage(image, rightpos, 0, 500, 500); // draw the image
           ctx.restore(); // Restore the last saved state
        },index*100);
   });
    setTimeout(callback,images[animation].length*100);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
};

let actionSound;

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }  
};

let leftposition = [0];
let rightposition = [-1300];
let leftmove=0;
let rightmove=0;
let rightLife=100;
let leftLife=100;
loadImages((images)=>{
    let queuedAnimate=[];
    let moves;
    let aux = () =>{
        let selectedAnimate;
        moves=["forward","backward","punch","kick","block"][getRndInteger(0,4)];
        if(queuedAnimate.length===0){
            selectedAnimate="idle";
        }else{
            selectedAnimate = queuedAnimate.shift();
        }
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
        else if(moves==="backward"){
            if(rightposition[0]-100>=-1300){
                rightposition[0]=rightposition[0]-100;
                rightmove=rightmove-1;
            }
            else{
                rightposition[0]=rightposition[0];
            }
        }
        else if(moves==="kick"){
            setTimeout(()=>{actionSound = new sound("images/kick.mp3");
            actionSound.play()},400);
        }
        else if(moves==="punch"){
            setTimeout(()=>{actionSound = new sound("images/punch.mp3");
            actionSound.play()},400);
        }
        else if(moves==="block" && (rightmove===6 || leftmove===6 || rightmove+leftmove===6) && (selectedAnimate==="punch" || selectedAnimate==="kick")){
            setTimeout(()=>{actionSound = new sound("images/shield.mp3");
            actionSound.play()},400);
        }

        if(leftmove===6){
            if((selectedAnimate==="kick" || selectedAnimate==="punch") && moves!="block"){
                 let redLife = document.getElementById("lifeRed");
                 setTimeout((rightLife=rightLife-10),500);
                 (redLife.style.width = rightLife+"%");
            }
        }    
        if(rightmove===6){
            if((moves==="kick" || moves==="punch") && selectedAnimate!="block"){
                 let greenLife = document.getElementById("lifeGreen");
                 setTimeout((leftLife=leftLife-10),500);
                 (greenLife.style.width = leftLife+"%");
            }
        }    
        if(rightmove+leftmove===6){
                if((selectedAnimate==="kick" || selectedAnimate==="punch") && moves!="block"){
                     let redLife = document.getElementById("lifeRed");
                     setTimeout((rightLife=rightLife-10),500);
                     (redLife.style.width = rightLife+"%");
            }
            if((moves==="kick" || moves==="punch") && (selectedAnimate!="block" || selectedAnimate!="backward")){
                 let greenLife = document.getElementById("lifeGreen");
                 setTimeout((leftLife=leftLife-10),500);
                 (greenLife.style.width = leftLife+"%");
            }
        } 
        if(rightLife>0 && leftLife>0){
               setTimeout((Animate(ctx,ctx1,leftposition[0],rightposition[0],images,selectedAnimate,moves,rightmove+leftmove,aux)),500);
        }
        else{
            let announcement="";
            if(rightLife<=0){
                announcement = "Player 1 win the match!";
            }
            else if(leftLife<=0){
                announcement = "Player 2 win the match!";
            }
            document.getElementById("result").innerHTML=announcement;
            document.getElementById("popup-1").classList.toggle("active");
        }
    };
    aux();

    document.getElementById("kick").onclick = ()=>{
        setTimeout(queuedAnimate.push("kick"),3000);
        setTimeout(()=>{actionSound = new sound("images/kick.mp3");
        actionSound.play()},400);
    };
    document.getElementById("punch").onclick = ()=>{
        setTimeout(queuedAnimate.push("punch"),3000);
        setTimeout(()=>{actionSound = new sound("images/punch.mp3");
        actionSound.play()},400);
     };
     document.getElementById("forward").onclick = ()=>{
        setTimeout(queuedAnimate.push("forward"),3000);
        leftposition[0]+100<=550?leftposition[0]=leftposition[0]+100:leftposition[0]=leftposition[0];
    };
    document.getElementById("backward").onclick = ()=>{
        setTimeout(queuedAnimate.push("backward"),3000);
        leftposition[0]-100>=0?leftposition[0]=leftposition[0]-100:leftposition[0]=leftposition[0];
     };
     document.getElementById("block").onclick = ()=>{
        setTimeout(queuedAnimate.push("block"),3000);
        setTimeout(()=>{actionSound = new sound("images/shield.mp3");
        actionSound.play()},400);
     };

     document.addEventListener("keydown",(event)=>{
        const key = event.key; //arrow right,left,up,down and letters
        if(key==="ArrowUp" || key==="w"){
            setTimeout(queuedAnimate.push("kick"),3000);
            setTimeout(()=>{actionSound = new sound("images/kick.mp3");
            actionSound.play()},800);
        }
        else if(key==="ArrowDown" || key==="x"){
            setTimeout(queuedAnimate.push("punch"),3000);
            setTimeout(()=>{actionSound = new sound("images/punch.mp3");
            actionSound.play()},800);
        }
        else if(key==="ArrowRight" || key==="s"){
            setTimeout(queuedAnimate.push("forward"),3000);
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
            setTimeout(queuedAnimate.push("backward"),3000);
            if(leftposition[0]-100>=0){
                leftposition[0]=leftposition[0]-100;
                leftmove=leftmove-1; 
           }
            else{
                leftposition[0]=leftposition[0];
            }
        }
        else if(event.code === "Space"){
            setTimeout(queuedAnimate.push("block"),3000);
            if(rightmove===6 || leftmove===6 || rightmove+leftmove===6){
                setTimeout(()=>{actionSound = new sound("images/shield.mp3");
                actionSound.play()},400);
            }
        }
    });
});