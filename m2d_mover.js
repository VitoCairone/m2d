var makeDimensionedArr = function (initVal) {
  var dimensionedArr = new Array(Om);
  for (var Ax = 0; Ax < Om; Ax++) { dimensionedArr[Ax] = initVal; }
  return dimensionedArr;
}

var mover = {
  overlapDimsArrDict: {},
  masterPairCodeDict: {},
  masterPairCodeList: []
};

// Array.prototype.diffSimple = function(a) {
//   return this.filter(function(i) {return a.indexOf(i) < 0;});
// };

// common use vars

var A; // the first or only body
var B; // the second body
var W = World; // the true world body

console.log("mover:: W = " + W);

// make the future world draft

// var FW = conjurer.makeCopyWorld(W); // the hypothetical future world body

// shorthands

//var bodies = W.bodies;
var movers = W.bodies; // MVP hack
//var statics = []; // MVP hack
//var bodiesCount = bodies.length;

var dimCodes = new Array(Om);
for (var i = 0; i < Om; i++) {
  dimCodes[i] = i;
}

// for (var i = 0; i < bodies.length; i++) {
//   A = bodies[i];
//   A.bodyIdx = i;
//   A.min = makeDimensionedArr(null);
//   A.max = makeDimensionedArr(null);
// }

mover.overwriteBodyPresentWithFuture = function (body) {
  var attribs = conjurer.bodyAttribs;
  var attrib;
  for (var i = 0; i < attribs.absolutes.length; i++) {
    attrib = attribs.absolutes[i];
    body.absolutes[i] = body.future.absolutes[i];
  }
  for (var i = 0; i < attribs.dimensionals.length; i++) {
    for (var Ax = 0; Ax < Om; Ax++) {
      attrib = attribs.dimensionals[i];
      body.dimensionals[Ax][attrib] = body.future.dimensionals[Ax][attrib];
    }
  }
}

// step one: Move all movers freely as if the rest of space were empty

mover.freeMovement = function () {
  for (var Ax = 0; Ax < Om; Ax++) {
    for (var i = 0; i < movers.length; i++) {
      A = movers[i];

      A.future.dimensionals[Ax].center = A.dimensionals[Ax].center
                                       + A.dimensionals[Ax].velocity;

      A.future.dimensionals[Ax].velocity = A.dimensionals[Ax].velocity;
    }
  }
};

// step two MVP hack: check bodies out of bounds and reflect back in bounds

mover.reflectOOBBodies = function (body, Ax) {
  var min, max;
  for (var Ax = 0; Ax < Om; Ax++) {
    for (var i = 0; i < movers.length; i++) {
      A = movers[i];

      min = A.future.dimensionals[Ax].center
            - A.future.dimensionals[Ax].expanseDown;
      max = A.future.dimensionals[Ax].center
            + A.future.dimensionals[Ax].expanseUp;

      // console.log("min, max " + min + ", " + max + " vs 0," + W.dimensionals[Ax].expanse);

      if (min < 0) {

        A.future.dimensionals[Ax].center += -(min * 2);
        A.future.dimensionals[Ax].velocity *= -1;

      } else if (max > W.dimensionals[Ax].expanse) {

        var overExtent = max - W.dimensionals[Ax].expanse;
        A.future.dimensionals[Ax].center -= overExtent * 2;
        A.future.dimensionals[Ax].velocity *= -1;

      }
    }
  }
};

// step omega: complete movement

mover.completeMovement = function () {
  for (var i = 0; i < movers.length; i++) {
    A = movers[i];
    mover.overwriteBodyPresentWithFuture(A);
  }
};

// tester.addFunction('mover.freeMovement')

// step two: Find all pairs which overlap each other

// ***************************************************************************
// COLLISION SECTION
// ***************************************************************************
mover.makePairCode = function (pair) {
  return pair[0].bodIdx + '_' + pair[1].bodIdx;
};


mover.bodiesOverlap = function (bodyPair, Ax) {
  var A = bodyPair[0];
  var B = bodyPair[1];

  var Amin = A.dimensionals[Ax].center - A.dimensionals[Ax].expanseDown;
  var Amax = A.dimensionals[Ax].center + A.dimensionals[Ax].expanseUp;

  var Bmin = B.dimensionals[Ax].center - B.dimensionals[Ax].expanseDown;
  var Bmax = B.dimensionals[Ax].center + B.dimensionals[Ax].expanseUp;

  if ((Amin > Bmax) || (Bmin > Amax)) {
    return false;
  }

  return true;
}

mover.findAllOverlaps = function () {
  // console.log(this.overlapDimsArrDict);
  // // reset before rebuilding
  // for (var i = 0; i < this.masterPairCodeList.length; i++) {
  //   if (this.overlapDimsArrDict[pairCode] != undefined) {
  //     this.overlapDimsArrDict[pairCode].length = 0;
  //   }
  // }
  // this.masterPairCodeList.length = 0;
  // console.log(this.overlapDimsArrDict);

  // dirty memory version
  this.overlapDimsArrDict = {};
  this.masterPairCodeList = [];
  this.masterPairCodeDict = {};

  var testAgainst = movers;
  for (var Ax = 0; Ax < Om; Ax++) {
    for (var i = 0; i < movers.length; i++) {
      A = movers[i];    
      for (var i2 = i + 1; i2 < testAgainst.length; i2++) {
        //console.log("Testing Ax="+Ax+" i="+i+" i2="+i2);
        B = testAgainst[i2];
        var pair = [A, B];
        if (this.bodiesOverlap(pair, Ax)) {
          //console.log("COLLISION")
          pairCode = this.makePairCode(pair);
          if (this.masterPairCodeDict[pairCode] == undefined) {
            this.masterPairCodeList.push(pairCode);
            this.masterPairCodeDict[pairCode] = pair;
            this.overlapDimsArrDict[pairCode] = [Ax];
          } else {
            this.overlapDimsArrDict[pairCode].push(Ax);
          }          
          //console.log(this.overlapDimsArrDict[pairCode]);
        } else {
          //console.log("pass")
        }
      }
    }
  }

  // console.log("this.masterPairCodeList> ")
  // console.log(this.masterPairCodeList)
  // console.log("this.masterPairCodeDict> ")
  // console.log(this.masterPairCodeDict);
  // console.log("<@<@");
}

// step four: find all pairs which overlap in every dimension,
// these being the pairs which overlap in space

mover.findOmniOverlappers = function () {
  var spaceOverlapPairs = [];

  for (var i = 0; i < this.masterPairCodeList.length; i++) {
    pairCode = this.masterPairCodeList[i];
    if (this.overlapDimsArrDict[pairCode].length == Om) {
      spaceOverlapPairs.push(this.masterPairCodeDict[pairCode]);
    }
  }

  return spaceOverlapPairs;
}

// step six: check for illegal conditions and note legal
// collisions

mover.dimCodesMissingFromArr = function (arr) {
    //prefer conversion to sets and set difference
    //if arr is large; in practice it should always be
    //very small and generally smaller tham dimCodes,
    //i.e., length 0, 1, or 2.

    var missing = [];
    
    for (var i = 0; i < dimCodes.length; i++) {
      var found = false;

      for (var i2 = 0; i2 < arr.length; i2++) {
        if (i == arr[i2]) {
          found = true;
          break;
        }
      }

      if (!found) {
        missing.push(i);
      }
    }

    return missing;
  }

mover.determineCollisionList = function () {
  var collisionsArr = [];

  var oldOverlapDimsArrDict = W.overlapDimsArrDict || {};

  var uniqAx = null;
  var axises = null;
  var collision = null;
  var oldOverlapDimsArr = null;

  for (var i = 0; i < this.spaceOverlapPairs.length; i++) {
    pair = this.spaceOverlapPairs[i];
    pairCode = this.makePairCode(pair);

    var collision = {
      pair: pair,
      pairCode: pairCode
    }

    oldOverlapDimsArr = oldOverlapDimsArrDict[pairCode];
    if (oldOverlapDimsArr == undefined) {
      // corner collision
      collision.axises = dimCodes.concat([]);
    } else {
      // face collision
      if (oldOverlapDimsArr.length == Om) {
        // was already colliding, ignore
        continue;
      } else {
        // the new axis to collide
        // is the axis of the collision
        collision.axises = this.dimCodesMissingFromArr(oldOverlapDimsArr);
      }
    }

    // ??
    // if (oldOverlapDimsArr.length == Om - 1) {
    //   // surface collision
    //   collision.face = true;
    // } else {
    //   // corner collision
    //   collision.face = false;
    // }

    collisionsArr.push(collision);
  } // end overlap pairs loop

  return collisionsArr;
}


// step six-opt: determine moments of collision

mover.collisionTimeOfOrderedPair = function ([lesserBody, greaterBody], Ax) {
  var bodyLdims = lesserBody.dimensionals[Ax];
  var bodyGdims = greaterBody.dimensionals[Ax];

  var speed = Math.abs(bodyLdims.velocity - bodyGdims.velocity);

  var loMax = bodyLdims.center - bodyLdims.expanseDown;
  var hiMin = bodyGdims.center + bodyGdims.expanseUp;

  var seperation = hiMin - loMax;

  return seperation / speed;
}

// step seven: resolve basic overlaps by compaction or ricochet

// step seven MVP hack (all balls): resolve collision by trading
// velocity and placing body interiors at lines of overlap at
// end of tick

// takes nothing, returns nothing
// alters no determinations
// ASSIGNS FUTURE
mover.resolveCollisions = function () {

  var firstIsMostByCenterAmong = function (pair, Ax)  {
    return pair[0].dimensionals[Ax].center > pair[1].dimensionals[Ax].center;
  };

  var getMin = function (body, Ax) {
    return body.dimensionals[Ax].center - body.dimensionals[Ax].expanseDown;
  };

  var getMax = function (body, Ax) {
    return body.dimensionals[Ax].center + body.dimensionals[Ax].expanseUp;
  };

  var getExpanse = function (body, Ax) {
    return body.dimensionals[Ax].expanseDown + body.dimensionals[Ax].expanseUp;
  };

  var moveToForceMin = function (body, point, Ax) {
    body.future.dimensionals[Ax].center = point + body.dimensionals[Ax].expanseDown;
  };

  var moveToForceMax = function (body, point, Ax) {
    body.future.dimensionals[Ax].center = point - body.dimensionals[Ax].expanseUp;
  };

  var collision = null;
  for (var i = 0; i < this.collisionsArr.length; i++) {
    collision = this.collisionsArr[i];
    A = collision.pair[0];
    B = collision.pair[1];
    for (var iAx = 0, Ax = 0; iAx < collision.axises.length; iAx++) {
      Ax = collision.axises[iAx];

      var greaterBody = B;
      var lesserBody = A;
      var AisGreater = firstIsMostByCenterAmong([A, B], Ax);
      if (AisGreater) {
        greaterBody = A;
        lesserBody = B;
      }

      var signOfA = Math.sign(A.dimensionals[Ax].velocity);
      var signOfB = Math.sign(B.dimensionals[Ax].velocity);

      // head-on collision
      // cases where a velocity is 0 should also obey this rule ??

      // FUTURE ASSIGNMENT
      // reverse velocities
      A.future.dimensionals[Ax].velocity = B.dimensionals[Ax].velocity;
      B.future.dimensionals[Ax].velocity = A.dimensionals[Ax].velocity;

      // Determine orientation of colliders and lines of overlap

      var greaterBody = B;
      var lesserBody = A;
      var AisGreater = firstIsMostByCenterAmong([A, B], Ax);
      if (AisGreater) {
        greaterBody = A;
        lesserBody = B;
      }

      var highOverlapLine = getMax(lesserBody, Ax);
      var lowOverlapLine = getMin(greaterBody, Ax);

      // FUTURE ASSIGNMENT
      // assign interior edges to lines of overlap
      moveToForceMin(greaterBody, highOverlapLine, Ax);
      moveToForceMax(lesserBody, lowOverlapLine, Ax);
    }
  }
}

mover.moveOverlappers = function () {
  //console.log("Entering moveOverlappers, step zero of five");

  // populates this.masterPairCodeList
  //           and this.masterPairCodeDict
  // console.log(this.overlapDimsArrDict);
  this.findAllOverlaps();
  //console.log("Finished step one of five");
  //console.log("upon leaving this.findAllOverlaps, this.overlapDimsArrDict >")
  //console.log(this.overlapDimsArrDict);

  // uses masterPairCodeList/Dict
  // returns a a spaceOverLapPairs it creates
  this.spaceOverlapPairs = this.findOmniOverlappers();
  if (this.spaceOverlapPairs.length > 0) {
    console.log("[" + W.tick + "] upon leaving mover.findOmniOverlappers, mover.spaceOverlapPairs >");
    console.log(this.spaceOverlapPairs);
  }

  // uses spaceOverlapPairs and
  //      and W.overlapDimsArrDict
  // returns a collisionsArr it creates
  this.collisionsArr = this.determineCollisionList();
  if (this.collisionsArr.length > 0) {
    console.log("[" + W.tick + "] upon leaving mover.determineCollisionList, mover.COLLISIONSARR >");
    console.log(this.collisionsArr)
  }

  // Uses this.collisionsArr
  // alters .future of movers
  if (this.collisionsArr.length > 0) {
    mover.resolveCollisions();
    console.log("[" + W.tick + "] left mover.resolveCollisions");
  }

  // this should really be done at the start
  // of the next tick
  W.overlapDimsArrDict = this.overlapDimsArrDict;

  // Because mover has no handling for a body being squeezed between
  // two approachers, objects will slip over others incorrectly
  // in this case; need to handle compressing collisions.
  // This is a more critical issue than second-pass
  // overlap, which currently is wrongly caught just one
  // tick after as a new collision. But, not what's needed
  // next for platformer demo -- next item needed there
  // is proper diverse collision handling, e.g. stopping,
  // destroy-and-alter.
};

mover.impartGravity = function () {
  //console.log("@@@ m.iG")
  //return;
  for (var i = 0; i < movers.length; i++) {
    A = movers[i];
    // console.log("Body " + i + " from " + A.dimensionals[Y].velocity);
    A.dimensionals[Y].velocity += 0.025;
    // console.log("to " + A.dimensionals[Y].velocity);
  }
};

mover.impartRepulsion = function () {

  var electroMoveDirection = dimCodes.concat([]);
  var netElectroForce = dimCodes.concat([]);

  var distance, distance2, distance2sum;

  for (var i = 0; i < movers.length; i++) {
    A = movers[i];

    for (var Ax = 0; Ax < Om; Ax++) {
      netElectroForce[Ax] = 0;
    }

    //console.log("@@@@ nEF=" + netElectroForce);

    // check the relative draws from all other repulsors
    for (var i2 = 0; i2 < movers.length; i2++) {
      if (i == i2) continue;
      
      B = movers[i2];
      distance2sum = 0;

      for (var Ax = 0; Ax < Om; Ax++) {
        distance = A.dimensionals[Ax].center - B.dimensionals[Ax].center;
        distance2 = distance * distance;

        //console.log("For " + i + " vs " + i2 + " dist=" + distance);

        var shouldRepelDown = (B.dimensionals[Ax].center > A.dimensionals[Ax].center);
        if (!shouldRepelDown) {
          electroMoveDirection[Ax] = -Math.abs(distance);
        } else {
          electroMoveDirection[Ax] = Math.abs(distance);
        }
        distance2sum += distance2;
      }

      var spaceDistance = Math.sqrt(distance2sum);

      for (var Ax = 0; Ax < Om; Ax++) {
        // the force in this direction is divided by the
        // distance2 to normalize it; so this is 1 in
        // the direction when all motion is in in that direction,
        // and 0 when no motion is in the direction.
        electroMoveDirection[Ax] /= spaceDistance;

        // the strength of the force, however, is not 1 overall;
        // force strength also drops off proportional to
        // distance2. We assume all charges are 1, so their
        // product is also 1.

        // apply force constant
        electroMoveDirection[Ax] *= 0.5;

        electroMoveDirection[Ax] /= distance2sum;

        netElectroForce[Ax] += electroMoveDirection[Ax];
      }

    }


    // having finished surveying all other movers,
    // impart netElectroForce as impulse on the body

    // console.log("For body " + i + " nEF=" + netElectroForce);
    for (var Ax = 0; Ax < Om; Ax++) {
      A.dimensionals[Ax].velocity += netElectroForce[Ax];
    }


  } // end A loop

  return;
};