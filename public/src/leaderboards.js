var leaderboard_length = 10;

function getColorString(c) {
  return "#" + c.toString(16);
}

var Leaderboard = function (ctx) {
  this.context = ctx;
  this.titleText = this.context.add.text(
    viewportWidth - 100,
    20,
    "Leaderboard",
    {
      fontSize: 20,
    }
  );
  this.titleText.setOrigin(0.5);
  this.titleText.setDepth(1);

  this.titleText.setScrollFactor(0, 0);

  this.rankTexts = [];
  this.nameTexts = [];
  this.lengthTexts = [];

  this.topBikes = [];

  var color = new Phaser.Display.Color();
  for (var i = 0; i < leaderboard_length; i++) {
    color.random(50, 200);
    var str = getColorString(color.color);
    var r = this.context.add.text(
      viewportWidth - 180,
      40 + 20 * i,
      "#" + (i + 1),
      {
        fontSize: 15,
        color: str,
      }
    );
    var n = this.context.add.text(
      viewportWidth - 160,
      40 + 20 * i,
      "Username12",
      {
        fontSize: 15,
        color: str,
      }
    );
    var l = this.context.add.text(viewportWidth - 30, 40 + 20 * i, "12345", {
      fontSize: 15,
      color: str,
    });
    r.setOrigin(0.5, 0);
    l.setOrigin(0.5, 0);

    r.setDepth(1);
    n.setDepth(1);
    l.setDepth(1);

    this.rankTexts.push(r);
    this.nameTexts.push(n);
    this.lengthTexts.push(l);

    r.setScrollFactor(0, 0);
    n.setScrollFactor(0, 0);
    l.setScrollFactor(0, 0);
  }
};

Leaderboard.prototype = {
  clear() {
    this.topBikes = [];
  },
  setRank(index, name, length) {
    this.topBikes[index] = { name: name, length: length };
  },
  update() {
    var i = 0;
    for (i = 0; i < this.topBikes.length && i < leaderboard_length; i++) {
      this.nameTexts[i].text = this.topBikes[i].name;
      this.lengthTexts[i].text = this.topBikes[i].length;

      this.rankTexts[i].visible = true;
      this.nameTexts[i].visible = true;
      this.lengthTexts[i].visible = true;
    }
    for (var j = i; j < leaderboard_length; j++) {
      this.rankTexts[j].visible = false;
      this.nameTexts[j].visible = false;
      this.lengthTexts[j].visible = false;
    }
    if (this.topBikes.length > 0) {
      this.titleText.visible = true;
    } else {
      this.titleText.visible = false;
    }
  },
};
