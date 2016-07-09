var conjurer = {};

var World = {};

World = {
  place: {
    width: 800,
    height: 400,
    center: [400, 200]
  },
  dimensionals: [
    { expanse: 800 },
    { expanse: 400 }
  ],
  bodies: [tester._results['initBody']]
};

var shallowCopyArray = function (arr) {
  // verbose version for clarity
  // newArr = new Array(arr.length);
  // for (var i = 0; i < arr.length; i++) {
  //   newArr[i] = arr[i];
  // }
  // return newArr;

  // succinct version for speed
  return arr.concat([]);
}

conjurer.makeCopyBody = function (body) {
  // MVP hack
  // TODO: lookup how to copy an object
  var copyBody = {
    mass: body.mass,
    dimensionals: [
      {
        center: body.dimensionals[0].center,
        expanseUp: body.dimensionals[0].expanseUp,
        expanseDown: body.dimensionals[0].expanseDown,
        velocity: body.dimensionals[0].velocity,
      },
      {
        center: body.dimensionals[1].center,
        expanseUp: body.dimensionals[1].expanseUp,
        expanseDown: body.dimensionals[1].expanseDown,
        velocity: body.dimensionals[1].velocity,
      }
    ]
  };

  return copyBody;
}

conjurer.makeCopyWorld = function (someWorld) {
  var sW = someWorld;
  var cW = {
    place: {
      width: sW.place.width,
      height: sW.place.height,
      center: shallowCopyArray(sW.place.center)
    },
    dimensionals: [
      { expanse: sW.dimensionals[0].expanse },
      { expanse: sW.dimensionals[1].expanse }
    ],
    bodies: shallowCopyArray(sW.bodies)
  };

  // cW.bodies is now a seperate array, so
  // push, pop, etc on sW.bodies and cW.bodies will not effect one another;
  // HOWEVER, they point to the same objects,
  // so permuting a body in one world will permute the body in all worlds! 
  // to resolve this, walk over the copy world's bodies array
  // and create copy bodies, placing them in the corresponding slots

  for (var i = 0; i < cW.bodies.length; i++) {
    cW.bodies[i] = this.makeCopyBody(cW.bodies[i]);
  }

  return cW;
}