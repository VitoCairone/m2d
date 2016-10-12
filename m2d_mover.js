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

  var getCollidersClassesCode = function (bodyA, bodyB) {
    var getColliderCode = function (body) {
      switch (body.collideType) {
        case 'WALL': return 100;
        case 'FIGHTER': return 200;
        case 'BALL': return 300;
        case 'PEW': return 400;
        default: return 0;
      }
    }
    return 1000 * getColliderCode(bodyA) + getColliderCode(bodyB);
  };

  var firstIsMostByCenterAmong = function (pair, Ax)  {
    return pair[0].dimensionals[Ax].center > pair[1].dimensionals[Ax].center;
  };

  var getOldMin = function (body, Ax) {
    return body.dimensionals[Ax].center - body.dimensionals[Ax].expanseDown;
  };

  var getOldMax = function (body, Ax) {
    return body.dimensionals[Ax].center + body.dimensionals[Ax].expanseUp;
  };

  var getNewMax = function (body, Ax) {
    return body.future.dimensionals[Ax].center + body.dimensionals[Ax].expanseUp;
  };

  var getNewMin = function (body, Ax) {
    return body.future.dimensionals[Ax].center - body.dimensionals[Ax].expanseDown;
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

      var highOverlapLine = getNewMax(lesserBody, Ax);
      var lowOverlapLine = getNewMin(greaterBody, Ax);

      var collidersClassesCode = getCollidersClassesCode(A, B);
      // console.log("gCC = " + collidersClassesCode);
      var WALL_WALL = 100100;
      var WALL_FIGHTER = 100200;
      var FIGHTER_WALL = 200100;
      var FIGHTER_FIGHTER = 200200;

      switch (collidersClassesCode) {
        case WALL_WALL:
          // Illegal; walls should have exactly the same
          // edges and exactly the same velocity, ensuring
          // equality despite any computer math
          console.log("ERROR: Wall-wall pair "+A.bodIdx+"-"+B.bodIdx+" collided.")
          // prefer to halt here
          // current actual behavior is the to do nothing,
          // making Walls all actually phasic to one other
          break;

        case WALL_FIGHTER:
          ; //fallthrough
        case FIGHTER_WALL:
          console.log("WTF");
          var a = 1 / 0;
          break;
          // Wall is unchanged

          // Fighter is halted against the wall and set to
          // Wall's velocity so that they continue together
          var theFighter = A;
          var theWall = B;
          if (collidersClassesCode == WALL_FIGHTER) {
            theWall = A;
            theFighter = B;
          }

          var fighterFutureDims = theFighter.future.dimensionals[Ax];
          var wallFutureDims = theWall.future.dimensionals[Ax];

          // FUTURE ASSIGNMENT
          fighterFutureDims.velocity = wallFutureDims.velocity;
          if (theFighter == greaterBody) {
            moveToForceMin(theFighter, getNewMax(theWall, Ax), Ax);
          } else {
            moveToForceMax(theFighter, getNewMin(theWall, Ax), Ax);
          }

          // the old Vel is chosen because it seems more correct
          // then the free new Vel which is not actually reached
          var oldFighterVel = theFighter.dimensionals[Ax].velocity;
          var mass = theFighter.absolutes.mass || 1;

          var velocityChange = oldFighterVel - wallFutureDims.velocity;

          if (dealer != undefined) {
            if (dealer.isImpactVulernable(theFighter)) {
              // it is the Fighter's mass and velocity changed used
              // because it is that energy which is otherwise
              // observed to vanish from the system
              var damage = 1/2 * mass * velocityChange * velocityChange;
              dealer.dealDamage(theFighter, damage);
            }
          }
          break;

        case FIGHTER_FIGHTER:
          // two bodies colliding head-on retain their sum velocity

          // bodies colliding head-tail are slowed to the blocking
          // body's velocity

          var theFaster = A;
          var theSlower = B; 

          if (Math.abs(B.dimensionals[Ax].velocity) > Math.abs(A.dimensionals[Ax].velocity)) {
            theFaster = B;
            theSlower = A;
          }

          // again, this should really be interpolated to moment of
          // impact for better correctness
          var velocityA = A.future.dimensionals[Ax].velocity;
          var velocityB = B.future.dimensionals[Ax].velocity;

          var velocityDiff = velocityA - velocityB;
          // +60 +50 becomes 10 or -10
          // +60 -50 becomes 110 or -110

          var velocitySum = velocityA + velocityB;
          // +60 -50 becomes 10
          // +60 +50 becomes 110

          var fasterVelocity = theFaster.future.dimensionals[Ax].velocity;
          var slowerVelocity = theSlower.future.dimensionals[Ax].velocity;

          // when heading in the same direction, slow
          // the faster mover to match velocity, otherwise
          // set to the sum
          var newVelocity = slowerVelocity;
          if (velocityA * velocityB < 0) {
            newVelocity = velocitySum;
          }

          // feeling lazy
          var pretendImpactPoint = (getOldMin(greaterBody, Ax) + getOldMax(lesserBody, Ax))/2;

          // FUTURE ASSIGNMENT
          // set exactly matched velocities
          theFaster.future.dimensionals[Ax].velocity = newVelocity;
          theSlower.future.dimensionals[Ax].velocity = newVelocity;

          // FUTURE ASSIGNMENT
          // set adjacent at impact point
          moveToForceMin(greaterBody, pretendImpactPoint, Ax);
          moveToForceMax(lesserBody, pretendImpactPoint, Ax);

          // more correctly, bodies should continue after impact
          // together for the remaining portion of tock

          var massA = A.absolutes.mass || 1;
          var massB = B.absolutes.mass || 1;

          var velocityChangeA = newVelocity - velocityA;
          var velocityChangeB = newVelocity - velocityB;

          if (typeof dealer != 'undefined') {
            var damageToA = 1/2 * B.absolutes.mass * velocityChangeB * velocityChangeB;
            var damageToB = 1/2 * A.absolutes.mass * velocityChangeA * velocityChangeA;
            dealer.dealDamage(A, damageToA);
            dealer.dealDamage(B, damageToB);
          }

          break;

        default: 
          // FUTURE ASSIGNMENT
          // reverse velocities
          A.future.dimensionals[Ax].velocity = B.dimensionals[Ax].velocity;
          B.future.dimensionals[Ax].velocity = A.dimensionals[Ax].velocity;

          // FUTURE ASSIGNMENT
          // assign interior edges to lines of overlap
          moveToForceMin(greaterBody, highOverlapLine, Ax);
          moveToForceMax(lesserBody, lowOverlapLine, Ax);
          break;
      }
      // switch (collidersClassesCode) {
      //   case WALL_WALL:
      //     // Illegal; walls should have 0 velocity
      //     // and also share edges
      //     console.log("ERROR: Wall " + A.bodIdx + " colliding with Wall " + B.bodIx);
      //     break;

      //   case WALL_FIGHTER:
      //     // fallthrough to FIGHTER_WALL

      //   case FIGHTER_WALL:
      //     // Wall's velocity cannot be changed
      //     // Fighter is halted against wall,
      //     // and takes impact damage if vulnerable

      //     var theFighter = A;
      //     var theWall = B;
      //     if (isAWall(A)) {
      //       theWall = A;
      //       theFighter = B;
      //     }

      //     fighterFutureDims = theFighter.future.dimensionals[Ax];
      //     wallFutureDims = theWall.future.dimensionals[Ax];

      //     velocityDiff = fighterFutureDims.velocity - wallFutureDims.velocity;

      //     // FUTURE ASSIGNMENT
      //     // halt Fighter relative to Wall
      //     fighterFutureDims.velocity = wallFutureDims.velocity;

      //     // FUTURE ASSIGNMENT
      //     // place Fighter against Wall
      //     if (theFighter == greaterBody) {
      //       moveToForceMin(theFighter, getNewMax(theWall), Ax);
      //     } else {
      //       moveToForceMax(theFighter, getNewMin(theWall), Ax);
      //     }

      //     break;

      //   case FIGHTER_FIGHTER:
      //     var velocityA = A.future.dimensionals[Ax].velocity;
      //     var velocityB = B.future.dimensionals[Ax].velocity;


      //     if (velocityA * velocityB < 0) {
      //       // Both fighters push all their velocity in its direction
      //       // as damage, halting at a mutually agreeable zero,
      //       // which is ???.

      //       // FUTURE ASSIGNMENT
      //       // halt both fighters at 0 (???)
      //       A.future.dimensionals[Ax].velocity = 0;
      //       B.future.dimensionals[Ax].velocity = 0;

      //       // FUTURE ASSIGNMENT
      //       // place fighters adjacent at collision point
      //       moveToForceMin(greaterBody, collisionPoint, Ax);
      //       moveToForceMax(lesserBody, collisionPoint, Ax);

      //     } else {
      //       var smallerVelocity = velocityA;
      //       if (Math.abs(velocityB) < Math.abs(velocityA)) {
      //         smallerVelocity = velocityB;
      //       }
      //     }

      //     var newVelocity = smallerVelocity;
      //     if (velocityA * velocityB < 0) {
      //       newVelocity *= -1;
      //     }

      //     // FUTURE ASSIGNMENT
      //     // set both fighters at the smaller velocity
      //     A.future.dimensionals[Ax].velocity = newVelocity;
      //     B.future.dimensionals[Ax].velocity = newVelocity;

      //     break;

      //   default:
      //     // FUTURE ASSIGNMENT
      //     // reverse velocities
      //     A.future.dimensionals[Ax].velocity = B.dimensionals[Ax].velocity;
      //     B.future.dimensionals[Ax].velocity = A.dimensionals[Ax].velocity;

      //     // FUTURE ASSIGNMENT
      //     // assign interior edges to lines of overlap
      //     moveToForceMin(greaterBody, highOverlapLine, Ax);
      //     moveToForceMax(lesserBody, lowOverlapLine, Ax);
      // } // end collide-type switch
    } // end over Ax (note: refactor - should happen inside collide-type)
  } // end over collisions
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

  // this is a very simple 'numerical' method to applying gravity;
  // it is not precisely right in all circumstances, e.g.
  // this situation: If a ball at 0 velocity,
  // placed 1 unit above a wall,
  // gains a down gravity velocity of -5 units/tick,
  // then it rebounds off the wall beneath at 5,
  // and ends up placed 4 units above the wall with velocity +5;
  // In fact gravity would only accelerate the ball down
  // for a short time, and then be working against the movement
  // on the upward portion, so the ball should actually have
  // a velocity much less than 5 and be much less than
  // 4 up; in fact we know it could not end up any higher
  // than 1, since it was initially 1 away and moved
  // only by the gravity impart.

  // However, when gravity's velocity/tick is small, this is a
  // pretty good approximation which may be observed to work well;
  // we see it exhibit reasonably proper oscillating behavior.

  for (var i = 0; i < movers.length; i++) {
    A = movers[i];
    // console.log("Body " + i + " from " + A.dimensionals[Y].velocity);
    A.dimensionals[Y].velocity += 0.002;
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