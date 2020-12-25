var DIRECTIONS = require("../common/direction.js");

global.grid = [];
var square_size = 6;
global.width = 3000 / square_size;
global.height = 3000 / square_size;
global.deadFoods = [];
global.movingFoods = [];
global.newFoods = [];
global.maxFoodSize = 3;

for (var i = 0; i < width; i++) {
  grid[i] = [];
  for (var j = 0; j < height; j++) grid[i].push(0);
}

function Bike(name) {
  this.speed = 1;
  this.name = name;
  this.rank = 0;
  this.x = (Math.random() * width * 0.9 + 5).toFixed(0);
  this.y = (Math.random() * height * 0.9 + 5).toFixed(0);
  this.bike_len = 10;
  this.sections = [];
  for (var i = 0; i < this.bike_len; i++) this.sections.push(DIRECTIONS.UP);
  this.grids = [];
  for (var i = 0; i < this.bike_len; i++) {
    this.grids.push(this.x);
    this.grids.push(this.y + i);
    grid[this.x][this.y + i] = 1;
  }
}

Bike.prototype = {
  stepHead(dir) {
    if (dir == DIRECTIONS.LEFT) {
      this.x--;
    }
    if (dir == DIRECTIONS.UP) {
      this.y--;
    }
    if (dir == DIRECTIONS.RIGHT) {
      this.x++;
    }
    if (dir == DIRECTIONS.DOWN) {
      this.y++;
    }
    if (this.x < 0 || this.x == width || this.y < 0 || this.y == height) {
      console.log("Out of board!");
      return false;
    }
    if (grid[this.x][this.y] == 1) {
      console.log("You hit other's bike", this.x, this.y, this.bike_len);
      console.log(grid[this.x]);
      return false;
    }
    this.grids.unshift(this.y);
    this.grids.unshift(this.x);

    // if (grid[this.x][this.y] >= 2) {
    //   //You eat food
    //   deadFoods.push(this.x);
    //   deadFoods.push(this.y);
    //   this.increaseLength();
    // }
    var left = this.x - global.maxFoodSize;
    var right = this.x + global.maxFoodSize;
    var top = this.y - global.maxFoodSize;
    var bottom = this.y + global.maxFoodSize;
    if (left < 0) left = 0;
    if (right >= width) right = width - 1;
    if (top < 0) top = 0;
    if (bottom >= height) bottom = height - 1;
    for (var i = left; i <= right; i++)
      for (var j = top; j <= bottom; j++) {
        if (grid[i][j] >= 100) {
          var foodIndex = grid[i][j] - 100;
          var size = foodList[foodIndex].size;
          var dist = Math.sqrt(
            (i - this.x) * (i - this.x) + (j - this.y) * (j - this.y)
          );
          if (dist <= size) {
            grid[i][j] = 0;
            deadFoods.push(i);
            deadFoods.push(j);
            foodList[foodIndex] = null;
            for (var k = 0; k < size; k++) this.increaseLength();
          }
        }
      }

    grid[this.x][this.y] = 1;
    return true;
  },

  changeDirection: function (dir) {
    if (dir == this.sections[0]) return true;
    if (Math.abs(dir - this.sections[0]) == 2) return true;

    if (!this.stepHead(dir)) return false;

    this.sections.unshift(dir);
    this.sections.pop();
    var ty = this.grids.pop();
    var tx = this.grids.pop();

    grid[tx][ty] = 0;
    return true;
  },
  boost: function () {
    if (this.speed >= 10) return;

    if (this.bike_len > 10) {
      this.speed++;
    }
  },

  step() {
    var c = this.speed;
    while (c >= 1) {
      if (!this.stepHead(this.sections[0])) return false;

      this.sections.unshift(this.sections[0]);
      this.sections.pop();
      var ty = this.grids.pop();
      var tx = this.grids.pop();
      grid[tx][ty] = 0;
      if (c > 1) {
        c--;
      } else break;
    }
    if (this.speed > 1) {
      this.speed--;
      this.decreaseLength();
    }

    return true;
  },

  increaseLength() {
    this.sections.push(this.sections[this.bike_len - 1]);
    this.bike_len++;
    var tx = this.grids[this.grids.length - 2];
    var ty = this.grids[this.grids.length - 1];

    var dir = this.sections[this.bike_len - 1];
    if (dir == DIRECTIONS.LEFT) {
      tx++;
    }
    if (dir == DIRECTIONS.UP) {
      ty++;
    }
    if (dir == DIRECTIONS.RIGHT) {
      tx--;
    }
    if (dir == DIRECTIONS.DOWN) {
      ty--;
    }
    this.grids.push(tx);
    this.grids.push(ty);

    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      grid[tx][ty] = 1;
    }
  },

  decreaseLength() {
    this.bike_len--;
    this.sections.splice(this.sections.length - 1, 1);
    var ty = this.grids.pop();
    var tx = this.grids.pop();
    grid[tx][ty] = 0;
  },

  destroy() {
    for (var i = 0; i < this.bike_len; i++) {
      var tx = this.grids[i * 2];
      var ty = this.grids[i * 2 + 1];
      if (i % 10 == 0) {
        // grid[tx][ty] = 10;
        // newFoods.push(tx);
        // newFoods.push(ty);
        var item = {
          x: tx,
          y: ty,
          size: ((tx + ty) % global.maxFoodSize) + 1,
          speedx: 0,
          speedy: 0,
        };
        foodList.push(item);
        grid[tx][ty] = foodList.length - 1 + 100;
        newFoods.push(tx);
        newFoods.push(ty);
        newFoods.push(item.size);
      } else grid[tx][ty] = 0;
    }
  },
};

module.exports = Bike;
