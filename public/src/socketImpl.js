var socket = io();

//socket.emit("chat message", $("#m").val());

socket.on("BIKES_INIT", function (msg) {
  if (state != GAME_STATE.PLAYING) return;

  console.log("bikes init", msg);

  var new_bikes = JSON.parse(msg);

  var keys = Object.keys(new_bikes);
  keys.forEach((key) => {
    var el = new_bikes[key];

    var rank = el.rank;
    var x = el.x;
    var y = el.y;
    var bike_len = el.bike_len;
    var sections = el.sections;
    var name = el.name;

    // bikes[key] = new Bike(context, x * square_size, y * square_size, name);
    // bikes[key].setSections(sections);

    if (bikes[key]) {
      bikes[key].setPosition(x * square_size, y * square_size);
      bikes[key].setSections(sections);
    } else {
      bikes[key] = new Bike(context, x * square_size, y * square_size, name);
      bikes[key].setSections(sections);
    }
  });
});

socket.on("BIKES_NAMES", function (msg) {
  if (state != GAME_STATE.PLAYING) return;

  var new_bikes = JSON.parse(msg);
  new_bikes.forEach((element) => {
    if (bikes[element.id]) {
      bikes[element.id].setName(element.name);
    }
  });
});

socket.on("BIKES_UPDATE", function (msg) {
  if (state != GAME_STATE.PLAYING) return;

  var new_bikes = JSON.parse(msg);

  leaderboard.clear();

  var keys = Object.keys(new_bikes);
  keys.forEach((key) => {
    var el = new_bikes[key];

    var rank = el[0];
    var x = el[1];
    var y = el[2];
    var bike_len = el[3];
    var sections = el.slice(4);
    if (bikes[key]) {
      bikes[key].setPosition(x * square_size, y * square_size);
      bikes[key].setSections(sections);
    } else {
      bikes[key] = new Bike(context, x * square_size, y * square_size, "");
      bikes[key].setSections(sections);
    }

    //Mine
    if (key == socket.id) {
      lengthText.text = "Length : " + bike_len;
      rankText.text = "Rank : " + (rank + 1);
      context.cameras.main.startFollow(bikes[key].head, true);
    }

    if (rank < leaderboard_length) {
      leaderboard.setRank(rank, bikes[key].name, bike_len);
    }
  });

  leaderboard.update();
});

socket.on("BIKES_DEAD", function (id) {
  //Mine
  if (socket.id == id) {
    context.cameras.main.stopFollow();
    context.cameras.main.setScroll(0.5, 0.5);
    console.log("Stopping Follow and Set Origin to center");

    state = GAME_STATE.STOPPED;
    buttonContainer.visible = true;
    buttonText.text = "RETRY";
    keyContainer.visible = false;
    foods.clearFoods();
    var keys = Object.keys(bikes);
    keys.forEach((key) => {
      if (bikes[key]) {
        bikes[key].destroy();
        delete bikes[key];
      }
    });
  } else {
    if (bikes[id]) {
      bikes[id].destroy();
      delete bikes[id];
    }
  }
});

socket.on("NEW_FOODS", function (msg) {
  if (state != GAME_STATE.PLAYING) return;

  var pos = JSON.parse(msg);
  foods.addFoods(pos);
});

socket.on("DEAD_FOODS", function (msg) {
  if (state != GAME_STATE.PLAYING) return;

  var pos = JSON.parse(msg);
  foods.deleteFoods(pos);
});
socket.on("MOVE_FOODS", function (msg) {
  if (state != GAME_STATE.PLAYING) return;

  var pos = JSON.parse(msg);
  foods.moveFoods(pos);
});
