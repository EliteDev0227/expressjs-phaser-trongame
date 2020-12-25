var bikes = [];
var width = 3000;
var height = 3000;
var viewportWidth = window.innerWidth - 5;
var viewportHeight = window.innerHeight - 5;

var config = {
  type: Phaser.AUTO,
  width: viewportWidth,
  height: viewportHeight,
  parent: "phaser-tron",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  dom: {
    createContainer: true,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var square_size = 6;

var game = new Phaser.Game(config);
var context = null;

var foods;
var leaderboard;
var button;
var buttonText;
var buttonContainer;
var keyContainer;
var domInput;
var lengthText;
var rankText;
var boostState = false;

var GAME_STATE = {
  INIT: 0,
  PLAYING: 1,
  STOPPED: 2,
};
var state = GAME_STATE.INIT;

function preload() {
  this.load.html("inputform", "assets/input-form.html");
  this.load.image("sky", "assets/sky1.png");
  this.load.image("bike", "assets/motor1.png");
  this.load.image("button", "assets/button.png");
  this.load.image("key", "assets/key.png");
}

function create() {
  var bg = this.add.image(width / 2, height / 2, "sky");
  bg.setScale(width / bg.displayWidth, height / bg.displayHeight);

  this.cameras.main.setBounds(0, 0, width, height);
  // console.log(this.cameras.main.deadzone);
  // this.cameras.main.setDeadzone(viewportWidth / 2, viewportHeight / 2);
  // console.log(this.cameras.main.deadzone);

  foods = new Foods(this);

  //leaderboard
  leaderboard = new Leaderboard(this);
  leaderboard.clear();
  leaderboard.update();

  //Input name and play button
  domInput = this.add
    .dom(viewportWidth / 2, viewportHeight / 2 - 80)
    .createFromCache("inputform");

  button = this.add.image(0, 0, "button").setInteractive();
  button.on("pointerup", actionOnClick, this);
  buttonText = this.add.text(0, 0, "PLAY", {
    fontSize: 50,
  });
  buttonText.setOrigin(0.5);
  buttonContainer = this.add.container(viewportWidth / 2, viewportHeight / 2, [
    button,
    buttonText,
  ]);

  buttonContainer.setDepth(1);

  //Key buttons
  var leftKey = this.add.image(-75, 0, "key").setInteractive();
  leftKey.on("pointerdown", actionOnLeft, this);
  var rightKey = this.add.image(75, 0, "key").setInteractive();
  rightKey.on("pointerdown", actionOnRight, this);
  var upKey = this.add.image(0, -75, "key").setInteractive();
  upKey.on("pointerdown", actionOnUp, this);
  var downKey = this.add.image(0, 75, "key").setInteractive();
  downKey.on("pointerdown", actionOnDown, this);
  var boostKey = this.add.image(0, 0, "key").setInteractive().setScale(0.7);
  boostKey.on(
    "pointerdown",
    function () {
      boostState = true;
    },
    this
  );
  boostKey.on(
    "pointerup",
    function () {
      boostState = false;
    },
    this
  );
  keyContainer = this.add.container(0, 0, [
    leftKey,
    rightKey,
    upKey,
    downKey,
    boostKey,
  ]);
  keyContainer.setScale(0.6);
  keyContainer.setDepth(1);
  keyContainer.visible = false;

  //Top Left, length and rank
  lengthText = this.add.text(10, 10, "Length : 0", {
    fontSize: 25,
  });
  rankText = this.add.text(10, 40, "Rank : 1", {
    fontSize: 25,
  });
  lengthText.setDepth(1);
  rankText.setDepth(1);
  lengthText.visible = false;
  rankText.visible = false;
  lengthText.setScrollFactor(0, 0);
  rankText.setScrollFactor(0, 0);

  //  Input Events
  this.input.keyboard.on("keyup_LEFT", function (event) {
    actionOnLeft();
  });
  this.input.keyboard.on("keyup_RIGHT", function (event) {
    actionOnRight();
  });
  this.input.keyboard.on("keyup_UP", function (event) {
    actionOnUp();
  });
  this.input.keyboard.on("keyup_DOWN", function (event) {
    actionOnDown();
  });
  this.input.keyboard.on("keydown_SPACE", function (event) {
    actionOnBoost();
  });

  context = this;

  this.graphics = this.add.graphics({
    lineStyle: { width: 2, color: 0x00ff00 },
    fillStyle: { color: 0xff0000 },
  });
}
function update() {
  keyContainer.x = this.cameras.main.scrollX + 100;
  keyContainer.y = this.cameras.main.scrollY + viewportHeight - 100;

  if (boostState) {
    actionOnBoost();
  }

  // console.log(this.cameras.main.deadzone);
  // this.graphics.clear();
  // this.graphics.strokeRect(
  //   this.cameras.main.deadzone.x,
  //   this.cameras.main.deadzone.y,
  //   this.cameras.main.deadzone.width,
  //   this.cameras.main.deadzone.height
  // );
}

function actionOnLeft() {
  console.log("LEFT!");
  if (state != GAME_STATE.PLAYING) {
    console.log("Game is not started yet.");
    return;
  }
  socket.emit("LEFT", "");
}
function actionOnRight() {
  console.log("RIGHT!");
  if (state != GAME_STATE.PLAYING) {
    console.log("Game is not started yet.");
    return;
  }
  socket.emit("RIGHT", "");
}
function actionOnUp() {
  console.log("UP!");
  if (state != GAME_STATE.PLAYING) {
    console.log("Game is not started yet.");
    return;
  }
  socket.emit("UP", "");
}
function actionOnDown() {
  console.log("DOWN!");
  if (state != GAME_STATE.PLAYING) {
    console.log("Game is not started yet.");
    return;
  }
  socket.emit("DOWN", "");
}

var lastBoost = new Date();
function actionOnBoost() {
  console.log("BOOST!");
  if (state != GAME_STATE.PLAYING) {
    console.log("Game is not started yet.");
    return;
  }
  var now = new Date();
  if (now.getTime() - lastBoost.getTime() > 30) {
    socket.emit("BOOST", "");
    lastBoost = now;
  }
}

function actionOnClick() {
  console.log("Button clicked");
  var username = domInput.getChildByName("username").value;
  if (!username && username.length == 0) {
    return;
  }

  buttonContainer.visible = false;
  domInput.visible = false;
  rankText.visible = true;
  lengthText.visible = true;
  keyContainer.visible = true;
  console.log("username", username);
  state = GAME_STATE.PLAYING;

  socket.emit("PLAY", username);
}
