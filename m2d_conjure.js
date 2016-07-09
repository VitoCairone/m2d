var conjurer = {};

var World = {};

World = {
  place: {
    width: 800,
    height: 400,
    center: [400, 200]
  },
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
  // hopefully this is a thing??
  return body.copy();
}

conjurer.makeCopyWorld = function (someWorld) {
  var sW = someWorld;
  var cW = {
    place: {
      width: sW.place.width,
      height: sW.place.height,
      center: shallowCopyArray(sW.place.center)
    },
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
}