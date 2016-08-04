var painter = {
  _names: [],
  _paintings: {},
  canvas: document.getElementById('watcher-canvas'),
  repainting: false,
  logging: true
}

painter.ctx = painter.canvas.getContext("2d");

painter.addPainting = function (name, fxn) {
  this._names.push(name);
  this._paintings[name] = fxn;
}

painter.paintAll = function () {
  var ctx = this.ctx;
  var canvas = this.canvas;
  if (this.repainting) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, World.place.width - 1, World.place.height - 1);
  }

  var name;
  for (var i = 0; i < this._names.length; i++) {
    name = this._names[i];
    // if (painter.logging) {
    //   console.log('Starting to paint ' + name);
    // }
    this._paintings[name](ctx);
  }
}

painter.addPainting('drawBodies', function (ctx) {
  var body;
  var bodiesDrawn = 0;
  var x, y, w, h;

  for (var i = 0; i < World.bodies.length; i++) {

    //console.log("draw:: World.bodies");
    //console.log(World.bodies);

    ctx.beginPath();

    for (var Ax = 0; Ax < Om; Ax++) {
      body = World.bodies[i];
      
      body.dimensionals[Ax].drawExpanse = body.dimensionals[Ax].expanseUp
                                        + body.dimensionals[Ax].expanseDown;

      body.dimensionals[Ax].drawLowPt = body.dimensionals[Ax].center
                                      - body.dimensionals[Ax].expanseDown;
    }

    // set the fill color
    if (i == 0) {
      ctx.fillStyle = "#FFFF00"; //green
    } else if (i < 10) {
      ctx.fillStyle = "#00FFFF"; //cyan
    } else {
      ctx.fillStyle = "#00FF00"; //yellow
    }

    x = body.dimensionals[X].drawLowPt;
    y = body.dimensionals[Y].drawLowPt;
    w = body.dimensionals[X].drawExpanse;
    h = body.dimensionals[X].drawExpanse;

    ctx.fillRect(x, y, w, h);
    bodiesDrawn += 1;
  }

  return bodiesDrawn;
});

painter.addPainting('drawBounds', function (ctx) {

  // beginPath() before every stroke() to avoid memory leaks
  
  ctx.beginPath();
  ctx.strokeStyle = "#000000";
  ctx.rect(0, 0, World.place.width - 1, World.place.height - 1);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#555555";
  ctx.rect(10, 10, World.place.width - 20, World.place.height - 20);
  ctx.stroke();

  return true;
});

painter.addPainting('foo', function (ctx) {
  if (World.paintNo == undefined) {
    World.paintNo = 0;
  } else {
    World.paintNo++;
  }
  if (World.paintNo % 1000 == 0) {
    console.log("@@@@@@@@@@@ paintNo " + World.paintNo + " @@@@@@@@@@!");
  }
});

painter.paintAll();