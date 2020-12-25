var Foods = function (ctx) {
  this.context = ctx;
  this.foods = [];
  for (var i = 0; i < width; i++) {
    this.foods[i] = [];
    for (var j = 0; j < height; j++) {
      this.foods[i][j] = null;
    }
  }
};

Foods.prototype = {
  addFoods(pos) {
    for (var i = 0; i < pos.length; i += 3) {
      var x = pos[i] * square_size;
      var y = pos[i + 1] * square_size;
      var sz = pos[i + 2] * 2 + 1;

      var color = new Phaser.Display.Color();
      color.random(50);

      this.foods[pos[i]][pos[i + 1]] = this.context.add.ellipse(
        x,
        y,
        square_size * sz,
        square_size * sz,
        0x996633,
        0.5
      );

      //   this.graphics.fillRect(
      //     x - square_size / 2,
      //     y - square_size / 2,
      //     square_size,
      //     square_size
      //   );
    }
  },

  deleteFoods(pos) {
    for (var i = 0; i < pos.length; i += 2) {
      var x = pos[i];
      var y = pos[i + 1];

      if (this.foods[x][y] != null) {
        this.foods[x][y].destroy();
        this.foods[x][y] = null;
      }
    }
  },

  moveFoods(pos) {
    for (var i = 0; i < pos.length; i += 4) {
      var oldx = pos[i];
      var oldy = pos[i + 1];
      var newx = pos[i + 2];
      var newy = pos[i + 3];
      this.foods[oldx][oldy].x = newx * square_size;
      this.foods[oldx][oldy].x = newy * square_size;
      this.foods[newx][newy] = this.foods[oldx][oldy];
      this.foods[oldx][oldy] = null;
    }
  },

  fadeFoods(pos) {
    for (var i = 0; i < pos.length; i += 2) {
      var x = pos[i];
      var y = pos[i + 1];

      this.context.tweens.add({
        targets: this.foods[x][y],
        alpha: 0.2,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  },

  clearFoods() {
    this.foods.forEach((element) => {
      element.forEach((el) => {
        if (el != null) {
          el.destroy();
          el = null;
        }
      });
    });
  },

  destroy() {
    this.graphics.clear();
  },
};
