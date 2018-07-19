window.onload = init;

var slideWidth = 80, slideHeight = 10, TICK_RATE = 1, slideGap = 30, ballRadius = 7, ballSpeed = 5, LIFE = 3;

var shadowWidth = 4, timeOut = 3;

var canvas, ctx, w, h;

var slide, ball;

//color: blue, green, yellow, orange, red
var colorArray = ['#00a2ff', '#00ff00', 'yellow', 'orange', '#ff2600'];
var lightShadowArray = ['#7ed0ff', '#82ff82', 'ffff9b', '#ffd381', '#ff806a']
var heavyShadowArray = ['#0076bb', '#00a000', '#a8a800', '#ce8600', '#bb1c00']

var keyDown = {};

var brick = [];

var lifeBall = [];

function init() {
    document.querySelector("#title").style.opacity = "1";
    setTimeout(function() {document.querySelector("#discription").style.opacity = "1";}, 2000);
    setTimeout(function() {document.querySelector("#buttonHolder").style.opacity = "1";}, 4000);
    var button = document.querySelector("#startButton");
    button.addEventListener('click', gameStart);
} 

function gameStart() {
    var title = document.querySelector("#title");
    title.style.display = 'none';
    var discription = document.querySelector("#discription");
    discription.style.display = "none";
    var button = document.querySelector("#buttonHolder");
    button.style.display = 'none';
    canvas = document.querySelector("#myCanvas");
    var canvasHolder = document.querySelector("#canvasHolder");
    canvasHolder.style.display = 'block';
    w = canvas.width;
    h = canvas.height;
    ctx = canvas.getContext('2d');
    
    slide = {
    x: (w-slideWidth)/2,
    y: h-slideGap-slideHeight,
    width: slideWidth,
    height: slideHeight,
    color: '#0000aa'
    }
     
    ball = {
    x: w/2,
    y: h-slideGap-slideHeight-ballRadius,
    radius: ballRadius,
    color: 'gray',
    xSpeed: 0,
    ySpeed: 0
    }
    
    generateBricks();
    generateLifeBall();
  
    window.addEventListener('keydown', function(evt) {keyDown[evt.keyCode] = true;});
    window.addEventListener('keyup', function(evt) {keyDown[evt.keyCode] = false;});
    window.addEventListener('keypress', ballLaunch);
    
    setInterval(moveSlide, TICK_RATE);

    mainLoop();
} 

function mainLoop() {
    ctx.clearRect(0, 0, w, h);

    //draw the slide
    drawFilledRectangle(slide);

    //draw the ball
    drawFilledCirc(ball);
  
    //draw bricks
    drawAllBricks();
  
    //draw life bar
    drawLifeBar();
  
    //move ball
    moveBall(ball); 
  
    if (lifeBall.length > 0 && brick.length > 0) {
        window.requestAnimationFrame(mainLoop);
    } 
    //allow the animation to last a little bit longer
    else if (timeOut > 0) {
        window.requestAnimationFrame(mainLoop);
        timeOut--;
    }
    else if (lifeBall.length > 0){
        showMessage("Congratulations!", w/2-115);
    }
}  

function generateBricks() {
    for (var i=0; i<5; i++) {
        for (var j=0; j<4; j++) {
          var b = {
            x: 75 + 100*j,
            y: 50 + 25*i,
            width: 50,
            height: 25,
            color: colorArray[i],
            lightShadow: lightShadowArray[i],
            heavyShadow: heavyShadowArray[i]
          };
      
          brick.push(b);
        }
    }
}    

function drawAllBricks() {
    
    brick.forEach(function(b) {
      drawBrick(b);
    });
}

function generateLifeBall() {
    for (var i=0; i<LIFE; i++) {
        var life = {
            x: (3+4*i)*ballRadius,
            y: 3*ballRadius,
            color: 'gray',
            radius: ballRadius
        }
        
        lifeBall.push(life);
    }
}

function drawLifeBar() {
    lifeBall.forEach(function(life) {
        drawFilledCirc(life);
    });
}

//smooth keypress event handling
function moveSlide() {
    var ballStill = (ball.ySpeed === 0);
    if (keyDown[37]) {
        if (slide.x > 0) {
            if (ballStill) {
              ball.x = ball.x - 1;
            }
            slide.x = slide.x - 1;
        }
    }
  
    else if (keyDown[39]) {
        if (slide.x < w-slide.width) {
            if (ballStill) {
              ball.x = ball.x + 1;
            }
            slide.x = slide.x + 1;
        }
    }     
}

function ballLaunch(evt) {
    if (evt.keyCode === 32) {
        ball.ySpeed = -ballSpeed;
        window.removeEventListener('keypress', ballLaunch);
    }
}

function moveBall(ball) {
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
  
    //test collision with wall
    testCollisionWithWall(ball); 
  
    //test collision with bricks
    brick.forEach(function(b, index) {testCollisionWithBrick(b, index);});
  
    //test collision with slide
    testCollisionWithSlide(ball);
  
}

 
function circRectOverlap(c, r) {
    var rectCenterX = r.x + r.width/2;
    var rectCenterY = r.y + r.height/2;
    
    //to store the edge of collision, vertical 0, horizontal 1
    var position;
    if (Math.abs(c.x-rectCenterX) <= (c.radius+r.width/2)) {
        position = 0;
    }
    if (Math.abs(c.y-rectCenterY) <= (c.radius+r.height/2)) {
        position = 1;
    }
  
    distanceX = Math.abs(c.x - rectCenterX);
    distanceY = Math.abs(c.y - rectCenterY);
    if (distanceX > (r.width/2 + c.radius)) {
        return [false, position];
    }
    if (distanceY > (r.height/2 + c.radius)) {
        return [false, position];
    } 
    if (distanceX <= r.width/2) {
        return [true, position];
    }
    if (distanceY <= r.height/2) {
        return [true, position]; 
    }
    var connerDistanceSq = (distanceX - r.width/2)*(distanceX - r.width/2) +
                         (distanceY - r.height/2)*(distanceY - r.height/2);
    return [(connerDistanceSq <= (c.radius*c.radius)), position];
}

function testCollisionWithSlide(ball) {
    var ballMoving = ball.ySpeed !== 0;
    if (Math.abs(ball.x-(slide.x+slide.width/2)) < slide.width/2 && ballMoving) {
        if (ball.y + ball.radius > slide.y) {
            var theta = Math.PI/6 + (ball.x-slide.x)*2*Math.PI/(3*slide.width);
            ball.xSpeed = -Math.cos(theta)*ballSpeed;
            ball.ySpeed = -Math.sin(theta)*ballSpeed;
            ball.y = slide.y - ball.radius;
            
        }
    }
    //else if ((slide.x-ball.x))
} 

function testCollisionWithBrick(b, index) {
    if (circRectOverlap(ball, b)[0]) {
        if (circRectOverlap(ball, b)[1] === 1) {
            ball.ySpeed = -ball.ySpeed;
        }
        if (circRectOverlap(ball, b)[1] === 0) {
            ball.xSpeed = -ball.xSpeed;
        }
        brick.splice(index, 1);
    } 
} 
 
function testCollisionWithWall(ball) {
    
    if (ball.x+ball.radius > w) {
        ball.xSpeed = -ball.xSpeed;
        //put the ball at collision point
        ball.x = w - ball.radius;
    }
    else if (ball.x-ball.radius < 0) {
        ball.xSpeed = -ball.xSpeed;
        ball.x = ball.radius;
    }
  
    else if (ball.y-ball.radius < 0) {
        ball.ySpeed = -ball.ySpeed;
        ball.y = ball.radius;
    }
    else if (ball.y > h) {
        lifeBall.pop();
        if (lifeBall.length === 0) {
            showMessage("You failed!", w/2-70);
        }
        else {
            ball.xSpeed = 0;
            ball.ySpeed = 0;
            ball.x = slide.x + slide.width/2;
            ball.y = slide.y - ball.radius;
            window.addEventListener('keypress', ballLaunch);
        }
    } 
} 

function drawFilledRectangle(r) {
    //save the context, use 2d transformation
    ctx.save();

    ctx.translate(r.x, r.y);

    ctx.fillStyle = r.color;

    ctx.fillRect(0, 0, r.width, r.height);

    //restore the context
    ctx.restore();
}

function drawRectangle(r) {
    ctx.save();
    cts.translate(r.x, r.y);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = r.lineWidth;
    ctx.strokeRect(0, 0, r.width, r.height);
    ctx.restore();
}

function drawFilledCirc(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(0, 0, c.radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
}

function drawBrick(b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    //draw the light shadow
    ctx.fillStyle = b.lightShadow;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(shadowWidth, shadowWidth);
    ctx.lineTo(b.width-shadowWidth, shadowWidth);
    ctx.lineTo(b.width-shadowWidth, b.height-shadowWidth);
    ctx.lineTo(b.width, b.height);
    ctx.lineTo(b.width, 0);
    ctx.lineTo(0, 0);
    ctx.fill();

    //draw the heavy shadow
    ctx.fillStyle = b.heavyShadow;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, b.height);
    ctx.lineTo(b.width, b.height);
    ctx.lineTo(b.width-shadowWidth, b.height-shadowWidth);
    ctx.lineTo(shadowWidth, b.height-shadowWidth);
    ctx.lineTo(shadowWidth, shadowWidth);
    ctx.lineTo(0, 0);
    ctx.fill();
  
    //draw the brick itself
    ctx.fillStyle = b.color;
    ctx.fillRect(shadowWidth, shadowWidth, b.width-2*shadowWidth, b.height-2*shadowWidth);
    
    ctx.restore();  
}

function showMessage(text, xPosition) {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(text, xPosition, h/2);
}