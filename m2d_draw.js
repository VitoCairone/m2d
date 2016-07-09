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
  }

  var name;
  for (var i = 0; i < this._names.length; i++) {
    name = this._names[i];
    if (painter.logging) {
      console.log('Starting to paint ' + name);
    }
    this._paintings[name](ctx);
  }
}

painter.addPainting('drawBodies', function (ctx) {
  var body;
  var bodiesDrawn = 0;
  var x, y, w, h;

  for (var i = 0; i < World.bodies.length; i++) {
    body = World.bodies[i];

    // compute the coordinates and parameters in drawing space
    body.place = {
      center: [body.dimensionals[X].center, body.dimensionals[Y].center],
      width: body.dimensionals[X].expanseUp + body.dimensionals[X].expanseDown, 
      height: body.dimensionals[Y].expanseUp + body.dimensionals[Y].expanseDown 
    }
    body.drawLoX = body.place.center[X] - body.place.width / 2;
    body.drawLoY = body.place.center[Y] - body.place.height / 2;
    x = body.drawLoX;
    y = body.drawLoY;
    w = body.place.width;
    h = body.place.height;

    // set the fill color
    if (i == 0) {
      ctx.fillStyle = "#00FF00"; //green
    } else if (i < 10) {
      ctx.fillStyle = "#00FFFF"; //cyan
    } else {
      ctx.fillStyle = "#FFFF00"; //yellow
    }

    // draw the Axis-Aligned Bounding Box (AABB) as a filled rectangle
    ctx.fillRect(x, y, body.place.width, body.place.height);

    bodiesDrawn += 1;
  }

  return bodiesDrawn;
});

painter.addPainting('drawBounds', function (ctx) {
  ctx.strokeStyle = "#000000";
  ctx.rect(0, 0, World.place.width - 1, World.place.height - 1);
  ctx.stroke();

  ctx.strokeStyle = "#555555";
  ctx.rect(10, 10, World.place.width - 20, World.place.height - 20);
  ctx.stroke();
  return true;
});

painter.paintAll();