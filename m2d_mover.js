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

  // NEED TO MAKE THIS WORK
  var oldOverlapDimsArrDict = W.overlapDimsArrDict || {};

  var uniqAx = null;
  var axises = null;
  var collision = null;
  var oldOverlapDimsArr = null;

  for (var i = 0; i < this.spaceOverlapPairs.length; i++) {
    pair = this.spaceOverlapPairs[i];
    pairCode = this.makePairCode(pair);
    oldOverlapDimsArr = oldOverlapDimsArrDict[pairCode];
    if (oldOverlapDimsArr != undefined) {
      if (oldOverlapDimsArr.length == Om) {
        // body was already spaceOverlapping, continue to allow
        ;
      } else {
        var collision = {
          pair: pair,
          pairCode: pairCode,
          axises: this.dimCodesMissingFromArr(oldOverlapDimsArr)
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

        var orderedPair = [lesserBody, greaterBody];
        var impactTime = this.collisionTimeOfOrderedPair(orderedPair, Ax);

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
    console.log("upon leaving mover.findOmniOverlappers, mover.spaceOverlapPairs >");
    console.log(this.spaceOverlapPairs);''
  }

  // uses spaceOverlapPairs and
  //      and W.overlapDimsArrDict
  // returns a collisionsArr it creates
  this.collisionsArr = this.determineCollisionList();
  if (this.collisionsArr.length > 0) {
    console.log("upon leaving mover.determineCollisionList, mover.collisionsArr >");
    console.log(this.collisionsArr)
  }

  // Uses this.collisionsArr
  // alters .future of movers
  if (this.collisionsArr.length > 0) {
    mover.resolveCollisions();
    console.log("left mover.resolveCollisions");
  }

  // this should really be done at the start
  // of the next tick
  W.overlapDimsArrDict = this.overlapDimsArrDict;
}