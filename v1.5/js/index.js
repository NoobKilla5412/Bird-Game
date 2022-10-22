let version = 1.5;
let changes = { "v1_4": { "title": "v1.4: ", "content": "Make the obsticles thicker" }, "v1_5": { "title": "v1.5: ", "content": "Fix bugs" } };
let changeLogTop = changes.v1_5.title + changes.v1_5.content + "<br>" + changes.v1_4.title + changes.v1_4.content;
// let version += " Beta";
// let version += " Alpha";
function setCookie(cname, cvalue, exdays) { // Try to set the cookie
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=";
}
function getCookie(cname) { // Try to get the cookie
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
// Declaring the variables
var myGamePiece;
var myObstacles = [];
var myScore;
var isPaused = false;
var pauseGame;
var lengthOfGap = 150;
var maxLengthOfHole = 100;
var minLengthOfHole = 200;
var oBSSpeed = -1.3;
var controlMethod = 0;
let highScore = getCookie("highScore");
var BlockSpeed = 1.5; // Speed for arrow use only
function startGame() { // Start the game using mouse
  myGamePiece = new component(30, 30, "red", 50, 120); // Spwan the player
  myScore = new component("30px", "Consolas", "black", 280, 40, "text"); // Score
  winScore = new component("30px", "Consolas", "black", 450, 200, "text");
  myGameArea.start();
  document.getElementById('start').style.display = 'none';
  document.getElementById('controls').style.display = 'none';
}
function useArrows() { // Start the game using arrows
  controlMethod = 1;
  myGamePiece = new component(30, 30, "red", 50, 120); // Spwan the player
  myScore = new component("30px", "Consolas", "black", 280, 40, "text"); // Score
  winScore = new component("30px", "Consolas", "black", 450, 200, "text");
  myGameArea.start();
  document.getElementById('start').style.display = 'none';
  document.getElementById('controls').style.display = 'none';
}

var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = 1000;
    this.canvas.height = 400;
    if (controlMethod === 0) {
      this.canvas.style.cursor = "none"; //hide the original cursor
    }
    this.canvas.id = 'gameScreen';
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea);
    window.addEventListener('keydown', function (e) {
      myGameArea.keys = (myGameArea.keys || [])
      myGameArea.keys[e.keyCode] = true;
    })
    window.addEventListener('keyup', function (e) {
      myGameArea.keys[e.keyCode] = false;
    })
    window.addEventListener('mousemove', function (e) {
      myGameArea.x = e.pageX;
      myGameArea.y = e.pageY;
    })
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    if (controlMethod == 0) {
      this.canvas.style.cursor = "default"; //Show the original cursor
    }
    setCookie("highScore", ((myObstacles.length / 2) - 1), 0); // Try to set the highScore var
    clearInterval(this.interval); // Stop the game
  }
}

function component(width, height, color, x, y, type) {
  this.type = type;
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    if (this.type == "text") {
      ctx.font = this.width + " " + this.height;
      ctx.fillStyle = color;
      ctx.fillText(this.text, this.x, this.y);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  this.newPos = function () { // Make the game elements move
    this.x += this.speedX;
    this.y += this.speedY;
    this.hitRight();
    this.hitLeft();
  }
  this.hitRight = function () { // check if the player hits the right wall
    var rockright = myGameArea.canvas.width - this.width;
    if (this.x > rockright) {
      this.x = rockright;
    }
  }
  this.hitLeft = function () { // check if the player hits the left wall
    var rockleft = 0;
    if (myGamePiece.x < rockleft) {
      this.x = 0;
    }
  }
  this.crashWith = function (otherobj) { // check if the player hits an obstacle
    var myleft = this.x;
    var myright = this.x + (this.width);
    var mytop = this.y;
    var mybottom = this.y + (this.height);
    var otherleft = otherobj.x;
    var otherright = otherobj.x + (otherobj.width);
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + (otherobj.height);
    var crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}

function updateGameArea() { // a function to update the game area
  var x, height, gap, minHeight, maxHeight, minGap, maxGap;
  for (i = 0; i < myObstacles.length; i += 1) { // check if you have ran into an obstacle
    if (myGamePiece.crashWith(myObstacles[i])) {
      myGameArea.stop();
      return;
    }
  }
  myGameArea.clear(); // clear the canvas
  if (everyInterval(lengthOfGap * 10)) { // make it harder each level
    oBSSpeed -= .1;
    lengthOfGap -= 10;
  }
  if (lengthOfGap < 10) {
    lengthOfGap = 10
  }
  if (/*myGameArea.frameNo == 1 || */everyInterval(lengthOfGap)) { // genarte the obstacles
    x = myGameArea.canvas.width;
    minHeight = 100;
    maxHeight = 200;
    height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    minGap = minLengthOfHole;
    maxGap = maxLengthOfHole;
    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    myObstacles.push(new component(15, height, "green", x, 0));
    myObstacles.push(new component(15, x - height - gap, "green", x, height + gap));
    //myObstacles.push(new component(10, 201, "green", x, 0));
    //myObstacles.push(new component(10, x - height, "green", x, height));
  }

  //myScore.text = "SCORE: " + Math.floor(myGameArea.frameNo/100);// + ", OBSTACLES: " + myObstacles.length / 2;
  //myScore.text = "OBSTACLES: " + myObstacles.length / 2;
  myGamePiece.speedX = 0; // reset the player's X speed
  myGamePiece.speedY = 0; // reset the player's Y speed
  if (controlMethod === 1 && !isPaused) { // if using arrows and not paused
    if (myGameArea.keys && myGameArea.keys[37]) { // Up arrow
                /* Left */ myGamePiece.speedX = -BlockSpeed;
    }
    if (myGameArea.keys && myGameArea.keys[39]) { // Right arrow
                /* Right */ myGamePiece.speedX = BlockSpeed;
    }
    if (myGameArea.keys && myGameArea.keys[38]) { // Up arrow
                /* Up */ myGamePiece.speedY = -BlockSpeed;
    }
    if (myGameArea.keys && myGameArea.keys[40]) { // Down arrow
                /* Down */ myGamePiece.speedY = BlockSpeed;
    }
    /*
    if (myGameArea.keys && myGameArea.keys[16]) { // Shift
        BlockSpeed = -1.5;
    }*/
    // BlockSpeed = 1.5;
  } else if (controlMethod === 0 && !isPaused) { // if using mouse and not paused
    if (myGameArea.x && myGameArea.y) {
      myGamePiece.x = myGameArea.x;
      myGamePiece.y = myGameArea.y;
    }
  }
  if (myGameArea.keys && myGameArea.keys[192]) { // check if ` is pressed
    if (!isPaused) {
      pauseGame = true; // pause the game
      isPaused = true;
    }
  }
  if (myGameArea.keys && myGameArea.keys[49]) { // check if 1 is pressed
    if (isPaused) {
      pauseGame = false; // unpause the game
      isPaused = false;
    }
  }
  if (pauseGame) { // pause the game
    for (i = 0; i < myObstacles.length; i += 1) {
      myObstacles[i].speedX = 0;
      myObstacles[i].newPos();
      myObstacles[i].update();
    }
  } else { // normal game
    for (i = 0; i < myObstacles.length; i += 1) {
      myObstacles[i].speedX = oBSSpeed;
      myObstacles[i].newPos();
      myObstacles[i].update();
    }
    myGameArea.frameNo += 1; // count the frames
    myGamePiece.newPos(); // move the player
  }
  myGamePiece.update(); // redraw the player
  // see if you have won:
  if (controlMethod == 0 && ((myObstacles.length / 2) - 1) >= 100) {
    winScore.text = "You Win! :D";
    myGameArea.clear();
    winScore.update();
    myGameArea.stop();
  } else { // normal
    // update the text of the scoreboard:
    myScore.text = "SCORE: " + ((myObstacles.length / 2) - 1) + " LEVEL: " + (Math.trunc((((myObstacles.length / 2) - 1) / 10)) + 1) + " HIGH SCORE: " + highScore;
    // document.getElementById('speed').innerHTML = "Speed: " + Math.round(10 * oBSSpeed) / 10;
    myScore.update(); // update the scoreboard
  }
  // win if using the arrows:
  if (controlMethod == 1 && ((myObstacles.length / 2) - 1) >= 80) {
    winScore.text = "You Win! :D";
    myGameArea.clear();
    winScore.update();
    myGameArea.stop();
  } else { // normal
    // update the text of the scoreboard:
    myScore.text = "SCORE: " + ((myObstacles.length / 2) - 1) + " LEVEL: " + (Math.trunc((((myObstacles.length / 2) - 1) / 10)) + 1) + " HIGH SCORE: " + highScore;
    myScore.update(); // update the scoreboard
  }
}


function everyInterval(n) { // timings function
  if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
  return false;
}