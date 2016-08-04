painter.repainting = true;

var animater = {};
World.tick = 0;
var haltTick = 0;

animater.animationLoop = setInterval(
  function () { 
    if (haltTick == 0 || World.tick < haltTick) {
      World.tick++;
      if (World.lastTiming == undefined) {
        World.lastTiming = performance.now();
      }

      if(World.tick % 60 == 0) {
        console.log(World.tick);
        console.log(performance.now() - World.lastTiming);
        World.lastTiming = performance.now();
        console.log(World.bodies);
      }

      // var body;
      // for (var i = 0; i < World.bodies.length; i++) {
      //   body = World.bodies[i];
      //   for (var Ax = 0; Ax < Om; Ax++) {
      //     if (World.tick % 300 < 150) {
      //       body.dimensionals[Ax].center += 0.5;
      //     } else {
      //       body.dimensionals[Ax].center -= 0.5;
      //     }
      //   }
      // }

      mover.impartGravity();

      mover.freeMovement();

      mover.reflectOOBBodies();

      mover.moveOverlappers();

      mover.completeMovement();

      painter.paintAll();
    }
  },

  1000 / 60
);