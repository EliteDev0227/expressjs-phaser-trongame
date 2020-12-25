var express = require("express");
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var DIRECTIONS = require("../common/direction.js");
var Bike = require("./bike.js");

var socketList = [];
var inputList = [];
var bikes = {};
global.foodList = [];

var rank_bikes = [];
var newBikes = [];

app.use(express.static("public"));
app.use(express.static("common"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socketList[socket.id] = socket;

  socket.on("disconnect", () => {
    console.log("user disconnected");
    destroyBike(socket.id);
    delete socketList[socket.id];
  });

  socket.on("PLAY", (msg) => {
    console.log("New User", msg);
    var b = new Bike(msg);
    b.rank = rank_bikes.length;
    bikes[socket.id] = b;
    rank_bikes.push(socket.id);

    //Send foods to new joined player
    var pos = [];
    for (var i = 0; i < foodList.length; i++) {
      if (foodList[i]) {
        pos.push(foodList[i].x);
        pos.push(foodList[i].y);
        pos.push(foodList[i].size);
      }
    }
    socket.emit("NEW_FOODS", JSON.stringify(pos));

    newBikes.push({
      id: socket.id,
      name: msg,
    });
  });

  socket.on("LEFT", (msg) => {
    console.log("LEFT", socket.id);
    if (!bikes[socket.id]) {
      console.log(socket.id, "You are alrady dead!");
      return;
    }
    if (!inputList[socket.id]) inputList[socket.id] = [];
    inputList[socket.id].push(DIRECTIONS.LEFT);
    // if (!bikes[socket.id].changeDirection(DIRECTIONS.LEFT))
    //   destroyBike(socket.id);
  });
  socket.on("RIGHT", (msg) => {
    console.log("RIGHT", socket.id);
    if (!bikes[socket.id]) {
      console.log(socket.id, "You are alrady dead!");
      return;
    }
    if (!inputList[socket.id]) inputList[socket.id] = [];
    inputList[socket.id].push(DIRECTIONS.RIGHT);
    // if (!bikes[socket.id].changeDirection(DIRECTIONS.RIGHT))
    //   destroyBike(socket.id);
  });
  socket.on("UP", (msg) => {
    console.log("UP", socket.id);
    if (!bikes[socket.id]) {
      console.log(socket.id, "You are alrady dead!");
      return;
    }
    if (!inputList[socket.id]) inputList[socket.id] = [];
    inputList[socket.id].push(DIRECTIONS.UP);
    // if (!bikes[socket.id].changeDirection(DIRECTIONS.UP))
    //   destroyBike(socket.id);
  });
  socket.on("DOWN", (msg) => {
    console.log("DOWN", socket.id);
    if (!bikes[socket.id]) {
      console.log(socket.id, "You are alrady dead!");
      return;
    }
    if (!inputList[socket.id]) inputList[socket.id] = [];
    inputList[socket.id].push(DIRECTIONS.DOWN);
    // if (!bikes[socket.id].changeDirection(DIRECTIONS.DOWN))
    //   destroyBike(socket.id);
  });
  socket.on("BOOST", (msg) => {
    console.log("BOOST", socket.id);
    if (!bikes[socket.id]) {
      console.log(socket.id, "You are alrady dead!");
      return;
    }
    bikes[socket.id].boost();
  });
});

function destroyBike(key) {
  if (!bikes[key]) {
    console.log("You are already dead");
    return;
  }
  console.log("Destroying bike");
  bikes[key].destroy();
  delete bikes[key];

  var index = rank_bikes.indexOf(key);
  if (index >= 0) rank_bikes.splice(index, 1);
  io.emit("BIKES_DEAD", key);
}

//Bike Update
setInterval(() => {
  //Sort bikes
  rank_bikes.sort((a, b) => {
    return bikes[b].bike_len - bikes[a].bike_len;
  });
  rank_bikes.forEach((element, index) => {
    bikes[element].rank = index;
  });

  //If there are new bikes, send INIT data first to each of them.
  if (newBikes.length > 0) {
    newBikes.forEach((element) => {
      var s = socketList[element.id];
      s.emit("BIKES_INIT", JSON.stringify(bikes));
    });
  }

  //Make update data
  var new_arr = {};
  var keys = Object.keys(bikes);
  keys.forEach((key) => {
    var el = bikes[key];
    if (el) {
      var ret = true;
      if (inputList[key]) {
        inputList[key].forEach((element) => {
          if (ret) ret = el.changeDirection(element);
        });
      } else {
        ret = el.step();
      }
      if (ret) {
        new_arr[key] = [el.rank, parseInt(el.x), parseInt(el.y), el.bike_len];
        new_arr[key] = new_arr[key].concat(el.sections);
      } else {
        destroyBike(key);
      }
    }
  });
  inputList = [];

  io.emit("BIKES_UPDATE", JSON.stringify(new_arr));
  // io.emit("UPDATE", JSON.stringify(bikes));

  //If there are new bikes, broadcast new bikes' names
  if (newBikes.length > 0) {
    io.emit("BIKES_NAMES", JSON.stringify(newBikes));
    newBikes = [];
  }

  if (newFoods.length > 0) {
    io.emit("NEW_FOODS", JSON.stringify(newFoods));
    newFoods = [];
  }

  if (deadFoods.length > 0) {
    io.emit("DEAD_FOODS", JSON.stringify(deadFoods));
    deadFoods = [];
  }

  if (movingFoods.length > 0) {
    io.emit("MOVE_FOODS", JSON.stringify(movingFoods));
    movingFoods = [];
  }
}, 101);

//Increase Length
setInterval(() => {
  var keys = Object.keys(bikes);
  keys.forEach((key) => {
    var el = bikes[key];
    if (el) {
      el.increaseLength();
    }
  });
}, 1000);

function isPositionAvailableForFood(x, y, size, myindex) {
  var left = parseInt(x) - size;
  var right = parseInt(x) + size;
  var top = parseInt(y) - size;
  var bottom = parseInt(y) + size;
  if (left < 0) left = 0;
  if (right >= width) right = width - 1;
  if (top < 0) top = 0;
  if (bottom >= height) bottom = height - 1;
  var c = 0;
  for (var i = left; i <= right; i++)
    for (var j = top; j <= bottom; j++) {
      if (grid[i][j] == 0) c++;
      else if (grid[i][j] == myindex) c++;
      else break;
    }

  if (c == (right - left + 1) * (bottom - top + 1)) return true;
  return false;
}

var maxFoodCount = 1000;
//Make foods
setInterval(() => {
  var pos = [];
  var keys = Object.keys(bikes);
  var validFoods = foodList.filter((value) => {
    return value != null;
  });
  if (validFoods.length > maxFoodCount) return;

  //Moving foods
  for (var i = 0; i < foodList.length; i++) {
    if (foodList[i] == null) continue;
    if (foodList[i].speedx == 0 && foodList[i].speedy == 0) continue;
    var oldx = foodList[i].x;
    var oldy = foodList[i].y;
    var newx = parseInt(foodList[i].x) + parseInt(foodList[i].speedx);
    var newy = parseInt(foodList[i].y) + parseInt(foodList[i].speedy);

    if (!isPositionAvailableForFood(newx, newy, foodList[i].size, i + 100))
      continue;

    if (newx == 0 || newx == width - 1)
      foodList[i].speedx = -foodList[i].speedx;
    if (newy == 0 || newy == height - 1)
      foodList[i].speedy = -foodList[i].speedy;

    grid[oldx][oldy] = 0;
    foodList[i].x = newx;
    foodList[i].y = newy;
    grid[newx][newy] = i + 100;

    // movingFoods.push(oldx);
    // movingFoods.push(oldy);
    // movingFoods.push(newx);
    // movingFoods.push(newy);

    deadFoods.push(oldx);
    deadFoods.push(oldy);

    newFoods.push(newx);
    newFoods.push(newy);
    newFoods.push(foodList[i].size);
  }
  //New foods
  for (var i = 0; i < keys.length; i++) {
    // while (1) {
    var x = (Math.random() * width * 0.9 + 5).toFixed(0);
    var y = (Math.random() * height * 0.9 + 5).toFixed(0);

    // var left = x - global.maxFoodSize;
    // var right = x + global.maxFoodSize;
    // var top = y - global.maxFoodSize;
    // var bottom = y + global.maxFoodSize;
    // if (left < 0) left = 0;
    // if (right >= width) right = width - 1;
    // if (top < 0) top = 0;
    // if (bottom >= height) bottom = height - 1;
    // var c = 0;
    // for (var i = left; i <= right; i++)
    //   for (var j = top; j <= bottom; j++) {
    //     if (grid[i][j] != 0) break;
    //     c++;
    //   }
    //   if (c == (right - left + 1) * (bottom - top + 1)) {
    if (isPositionAvailableForFood(x, y, global.maxFoodSize)) {
      // if (grid[x][y] == 0) {
      var item = {
        x: x,
        y: y,
        size: ((x + y) % global.maxFoodSize) + 1,
        speedx: (x % 3) - 1,
        speedy: (y % 3) - 1,
      };
      foodList.push(item);
      grid[x][y] = foodList.length - 1 + 100;
      newFoods.push(x);
      newFoods.push(y);
      newFoods.push(item.size);
      // break;
    }
    // }
  }

  //Decrease Food longevity
  // for (var i = 0; i < grid.length; i++) {
  //   for (var j = 0; j < grid[i].length; j++) {
  //     if (grid[i][j] > 2) {
  //       grid[i][j]--;
  //     } else if (grid[i][j] == 2) {
  //       grid[i][j] = 0;
  //       deadFoods.push(i);
  //       deadFoods.push(j);
  //     }

  //     if (grid[i][j] == 8) {
  //       movingFoods.push(i);
  //       movingFoods.push(j);
  //     }
  //   }
  // }
}, 1001);

http.listen(3000, () => {
  console.log("listening on *:3000");
});
