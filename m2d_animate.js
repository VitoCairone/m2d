painter.repainting = true;

var animater = {};

animater.animationLoop = setInterval(
  function () { 
    World.tick++;
    if(World.tick % 60 == 0) {
      console.log(World.tick);
    }

    mover.freeMovement();
    mover.reflectOOBBodies();
    mover.completeMovement();

    painter.paintAll();
  },

  1000 / 60
);