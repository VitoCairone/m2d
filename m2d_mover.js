var makeDimensionedArr = function (initVal) {
  var dimensionedArr = new Array(Om);
  for (var Ax = 0; Ax < Om; Ax++) { dimensionedArr[Ax] = initVal; }
  return dimensionedArr;
}

var mover = {
  overlapArr: makeDimensionedArr([]),
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
//var moverCount = movers.length;
//var bodiesCount = bodies.length;

// var dimCodes = new Array(Om);
// for (var i = 0; i < Om; i++) {
//   dimCodes[i] = i;
// }

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


mover.findAllOverlaps = function () {
  for (var Ax = 0; Ax < Om; Ax++) {
    for (var i = 0; i < moverCount; i++) {
      A = movers[i];
      var testAgainst = movers;
      for (var i2 = i + 1; i2 < testAgainst.length; i2++) {
        B = testAgainst[i2];
        if (bodiesOverlap(A, B)) {
          var pair = [A, B];
          this.overlappArr[Ax].push(pair);

          pairCode = this.makePairCode(pair);
          if (masterPairCodeDict[pairCode] == undefined) {
            this.masterPairCodeList.push(pairCode);
            this.masterPairDict[pairCode] = pair;
          }
        }
      }
    }
  }
  console.log("masterPairCodeList >")
  console.log(masterPairCodeList)
}

// step three: Find out by how many and which dimensions
// each pair overlaps

mover.findOverlapDimensions = function () {
  var overlapDimsArrDict = {};
  var pair = null;
  var pairCode = null;

  for (var Ax = 0; Ax < Om; Ax++) {
    for (var i = 0; i < overlapArr[Ax].length; i++) {
      pairCode = makePairCode(overlapArr[Ax][i]);
      if (overlapDimsArrDict[pairCode] == undefined) {
        overlapDimsArrDict[pairCode] = [Ax];
      } else {
        overlapDimsArrDict[pairCode].push(Ax);
      }
    }
  }

  return overlapDimsArrDict;
}

// step four: find all pairs which overlap in every dimension,
// these being the pairs which overlap in space

mover.findOmniOverlappers = function () {
  var spaceOverlapPairs = [];

  for (var i = 0; i < masterPairCodeList.length; i++) {
    pairCode = masterPairCodeList[i];
    if (overlapDimsArrDict[pairCode].length == Om) {
      spaceOverlapPairs.push(masterPairCodeDict[pairCode]);
    }
  }

  return spaceOverlapPairs;
}

// step six: check for illegal conditions and note legal
// collisions

mover.determinCollisionList = function () {
  var collisionsArr = [];

  // NEED TO MAKE THIS WORK
  var oldOverlapDimsArrDict = W.overlapDimsArrDict;

  var uniqAx = null;
  var axises = null;
  var collision = null;

  for (var i = 0; i < spaceOverlapPairs.length; i++) {
    pair = spaceOverlapPairs[i];
    pairCode = makePairCode(pair);
    oldOverlapDimArr = oldOverlapDimsArrDict[pairCode];
    if (oldOverlapDimsArr != undefined) {
      

      if (oldOverlapDimsArr.length == Om) {
        // body was already spaceOverlapping, continue to allow
        ;
      } else {
        var collision = {
          pair: pair,
          pairCode: pairCode,
          axises: dimCodes.missingInArr(oldOverlapDimsArr)
        }

        if (oldOverlapDimsArr.length == Om - 1) {
          // surface collision
          collision.face = true;
        } else {
          // corner collision
          collision.face = false;
        }

        collisionsArr.push(collision);
      }
    }
  }

  return collisionsArr;
}


// step six-opt: determine moments of collision

mover.determineCollisionMoments = function () {
  // same-sign (rear-end) collision, speed is |velocity difference|
  // for opp-sign (head-on) collision, speed is |velA| + |velB|
}

// step seven: resolve basic overlaps by compaction or ricochet

// step seven MVP hack (all balls): resolve collision by trading
// velocity and placing body interiors at lines of overlap at
// end of tick

// takes nothing, returns nothing
// alters no determinations
// ASSIGNS FUTURE
mover.resolveCollisions = function () {

  var firstIsMostByCenterAmong = function (arr, Ax)  {
    // MVP hack exploits fact that arr is always a pair
    return arr[0].dimensionals[Ax].center > arr[1]/dimensionals[Ax].center;
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
    body.future.dimensionals[Ax].center = place + body.dimensionals[Ax].expanseDown;
  };

  var moveToForceMax = function (body, point, Ax) {
    body.future.dimensionals[Ax].center = place - body.dimensionals[Ax].expanseUp;
  };

  var Ax = collision.axises;
  var time = 0;
  var collision = null;
  for (var i = 0; i < collisionsArr.length; i++) {
    collision = collisionsArr[i];
    A = collisionsArr[i].pair[0];
    B = collisionsArr[i].pair[1];
    for (var iAx = 0, Ax = 0; iAx < collision.axises; iAx++) {
      Ax = collision.axises[iAx];

      var signOfA = Math.sign(A.dimensionals[Ax].velocity);
      var signOfB = Math.sign(B.dimensionals[Ax].velocity);

      var greaterBody = B;
      var lesserBody = A;
      var AisGreater = firstIsMostByCenterAmong([A, B], Ax);
      if (AisGreater) {
        greaterBody = A;
        lesserBody = B;
      }

      if (signOfA == signOfB) {
        // rear-end collision

        // note: this actually may model a 'crash' type collision
        // moreso than properly a rear-end one; doesn't a slow billiard
        // struck by a fast one take all of the fast one's energy,
        // moving forward at greater speed, and halting the one
        // which struck it ??

        // anyway, in this current version
        // rear object slows to push forward object ahead faster
        // velocities are averaged and particles continue
        // together, sharing a border at the point of impact

        var averageVelocity = (A.dimensionals[Ax].velocity
                               + B.dimensionals[Ax].velocity) / 2;

        // FUTURE ASSIGNMENT
        // average velocities
        A.future.dimensionals[Ax].velocity = averageVelocity;
        B.future.dimensionals[Ax].velocity = averageVelocity;

        var impactTime = getImpactTime([A, B], Ax);

        var impactPlace = lesserBody.dimensionals[Ax].center
                          + lesserBody.dimensionals[Ax].expanseUp
                          + lesserBody.dimensionals[Ax].velocity * impactTime;

        // FUTURE ASSIGNMENT
        // set adjacency to point of collision
        moveToForceMin(greaterBody, impactPlace, Ax);
        moveToForceMax(lesserBody, impactPlace, Ax);

      } else {
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
}







