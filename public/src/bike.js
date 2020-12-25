var Bike = function (ctx, x, y, name) {
  this.name = name;
  this.context = ctx;
  this.x = x;
  this.y = y;
  this.sections = [];
  this.direction = 1;
  this.bike_len = 10;
  this.head = null;

  var color = new Phaser.Display.Color();
  color.random(50);
  this.graphics = this.context.add.graphics({
    lineStyle: { width: 2, color: 0x00ff00 },
    fillStyle: { color: color.color },
  });

  for (var i = 0; i < this.bike_len; i++) {
    this.sections.push(DIRECTIONS.UP);
  }
  this.draw();
  this.head = this.context.add.image(this.x, this.y, "bike").setScale(0.3);
  // this.head.visible = false;

  this.nameText = this.context.add.text(this.x, this.y, this.name, {
    fontSize: 15,
  });
  this.nameText.setOrigin(0.5);
};

Bike.prototype = {
  setName: function (msg) {
    this.name = msg;
    this.nameText.text = msg;
  },
  draw: function () {
    this.graphics.clear();
    var x = this.x,
      y = this.y;
    for (var i = 0; i < this.bike_len; i++) {
      this.graphics.fillRect(
        x - square_size / 2,
        y - square_size / 2,
        square_size,
        square_size
      );
      if (this.sections[i] == DIRECTIONS.LEFT) {
        x += square_size;
      }
      if (this.sections[i] == DIRECTIONS.UP) {
        y += square_size;
      }
      if (this.sections[i] == DIRECTIONS.RIGHT) {
        x -= square_size;
      }
      if (this.sections[i] == DIRECTIONS.DOWN) {
        y -= square_size;
      }
    }
  },
  step: function () {
    this.changeDirectionAndStep(this.sections[0]);
  },
  stepHead(dir) {
    var distV = square_size;
    if (dir == DIRECTIONS.LEFT) {
      this.x -= distV;
    }
    if (dir == DIRECTIONS.UP) {
      this.y -= distV;
    }
    if (dir == DIRECTIONS.RIGHT) {
      this.x += distV;
    }
    if (dir == DIRECTIONS.DOWN) {
      this.y += distV;
    }
    this.head.x = this.x;
    this.head.y = this.y;
    this.nameText.x = this.x;
    this.nameText.y = this.y;
  },
  changeDirection: function (dir) {
    if (dir == this.sections[0]) return;
    if (Math.abs(dir - this.sections[0]) == 2) return;
    this.changeDirectionAndStep(dir);
  },
  changeDirectionAndStep: function (dir, dist) {
    // this.sections.unshift(dir);
    // this.sections.pop();
    // this.stepHead(dir, dist);
    this.draw();
    this.head.setRotation((3.14 * (this.sections[0] - 2)) / 2);
    this.head.setOrigin(0.5, 0.3);
  },
  increaseLength() {
    this.sections.push(this.sections[this.bike_len - 1]);
    this.bike_len++;
  },
  setSections(sections) {
    this.sections = sections;
    this.bike_len = sections.length;
    this.changeDirectionAndStep(this.sections[0]);
    if (sections[0] == DIRECTIONS.LEFT) {
      this.nameText.setOrigin(0.1, 0.5);
    } else if (sections[0] == DIRECTIONS.RIGHT) {
      this.nameText.setOrigin(0.9, 0.5);
    } else if (sections[0] == DIRECTIONS.UP) {
      this.nameText.setOrigin(0.5, 0.2);
    } else if (sections[0] == DIRECTIONS.DOWN) {
      this.nameText.setOrigin(0.5, 0.8);
    }
  },
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.head.x = x;
    this.head.y = y;
    this.nameText.x = this.x;
    this.nameText.y = this.y;
  },

  destroy() {
    this.graphics.clear();
    this.head.destroy();
    this.nameText.destroy();
  },
};
