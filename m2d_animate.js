painter.repainting = true;

var animater = {};
World.tick = 0;
var haltTick = 500;

animater.animationLoop = setInterval(
  function () { 
    if (haltTick == 0 || World.tick < haltTick) {
      World.tick++;
      if (World.lastTiming == undefined) {
        World.lastTiming = performance.now();
      }

      if(World.tick % 60 == 0) {
        console.log("Tick: " + World.tick);
        console.log("realTime equivalent: "+ Math.round(60.0 / 1000.0 * (performance.now() - World.lastTiming),0));
        World.lastTiming = performance.now();
        //console.log(World.bodies);
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

      //mover.impartGravity();

      mover.impartRepulsion();

      mover.freeMovement();

      mover.reflectOOBBodies();

      mover.moveOverlappers();

      mover.completeMovement();

      painter.paintAll();
    }
  },

  1000 / 60
);