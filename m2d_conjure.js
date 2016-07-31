var conjurer = {};

var World = {};

var g_bodIdx = 1;

conjurer.createBody = function () { 
  return {
    absolutes: { mass: 10 },
    dimensionals: [null, null],
    future: {
      absolutes: { mass: 10 },
      dimensionals: [null, null]
    },
    bodIdx: g_bodIdx++
  };
};

tester.addFunction('createBody', function () { return conjurer.createBody(); })

conjurer.bodyAttribs = {
  absolutes: [
    'mass'
  ],
  dimensionals: [
    'center',
    'expanseUp',
    'expanseDown',
    'velocity',
    'drawLowPt',
    'drawExpanse'
  ]
}

conjurer.initBody = function (center2D, radius, velocity2D) {
  var body = conjurer.createBody();

  // TODO: use Array.shallowCopy instead of duplicating work
  // directly

  for (var Ax = 0; Ax < Om; Ax++) {
    body.dimensionals[Ax] = {
      center: center2D[Ax],
      expanseUp: radius,
      expanseDown: radius,
      velocity: velocity2D[Ax],
      drawLowPt: null, // set by Painter
      drawExpanse: null // set by Painter
    };
    body.future.dimensionals[Ax] = {
      center: center2D[Ax],
      expanseUp: radius,
      expanseDown: radius,
      velocity: velocity2D[Ax],
      drawLowPt: null, // set by Painter
      drawExpanse: null // set by Painter
    }
  }

  return body;
};

tester.addFunction('conjurer.initBody', function () {
  return conjurer.initBody([200, 200], 8, [1, 1])
});

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

// This is an MVP hack function which should not be routinely
// invoked by a proper Mover or Animator
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

// This is an MVP hack function which should not be routinely
// invoked by a proper Mover or Animator
// conjurer.makeCopyWorld = function (someWorld) {
//   var sW = someWorld;
//   var cW = {
//     place: {
//       width: sW.place.width,
//       height: sW.place.height,
//       center: shallowCopyArray(sW.place.center)
//     },
//     dimensionals: [
//       { expanse: sW.dimensionals[0].expanse },
//       { expanse: sW.dimensionals[1].expanse }
//     ],
//     bodies: shallowCopyArray(sW.bodies)
//   };

//   // cW.bodies is now a seperate array, so
//   // push, pop, etc on sW.bodies and cW.bodies will not effect one another;
//   // HOWEVER, they point to the same objects,
//   // so permuting a body in one world will permute the body in all worlds! 
//   // to resolve this, walk over the copy world's bodies array
//   // and create copy bodies, placing them in the corresponding slots

//   for (var i = 0; i < cW.bodies.length; i++) {
//     cW.bodies[i] = this.makeCopyBody(cW.bodies[i]);
//   }

//   return cW;
// }


// It is currently the Tester which creates bodies to move,
// this is a bad pattern, eventually have the Director
// invoke the real workflow

// tester.runAll();

conjurer.initWorld = function (worldParams) {
  return worldParams;
}

tester.params.worldParams = {
  place: {
    width: 400,
    height: 300,
    center: [200, 150]
  },
  dimensionals: [
    { expanse: 400 },
    { expanse: 300 }
  ],
  bodies: [tester._results['conjurer.initBody']]
};

tester.addFunction('conjurer.initWorld', function () {
  return conjurer.initWorld(this.params.worldParams);
})