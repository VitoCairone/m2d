// common use vars

Array.prototype.diffSimple = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

var A; // the first or only body
var B; // the second body
var W = World; // the true world body

var FW = conjurer.makeCopyWorld(W); // the hypothetical future world body

// // shorthands

// var bodies = FW.bodies;
// var movers = FW.movers();
// var statics = FW.statics();
// var moverCount = movers.length;
// var bodiesCount = bodies.length;

// var makeDimensional = function (initval) {
//   var dimensional = new Array(Om);
//   for (var Ax = 0; Ax < Om; Ax++) {
//     dimensional[Ax] = initval;
//   }
//   return dimensional;
// }

// var dimCodes = new Array(Om);
// for (var i = 0; i < Om; i++) {
//   dimCode[i] = i;
// }

// for (var i = 0; i < bodies.length; i++) {
//   A = bodies[i];
//   A.bodIdx = i;
// }

// // step one: Move all movers freely as if the rest of space were empty

// mover.freeMovement = function () {
//   for (var Ax = 0; Ax < Om; Ax++) {
//     for (var i = 0; i < moverCount; i++) {
//       A = movers[i];
//       A.center[Ax] += A.velocity[Ax];
//       A.min = A.center[Ax] - A.expanseDown[Ax];
//       A.max[Ax] = A.center[Ax] + A.expanseUp[Ax];
//     }
//   }
// }

// tester.addFunction('mover.freeMovement')

// // // step two: Find all pairs which overlap each other

// // var overlapArr = makeDimensional([]);

// // var makePairCode = function(pair) {
// //   return pair[0].bodIdx + '_' + pair[1].bodIdx;
// // }

// // var masterPairCodeDict = {};
// // var masterPairCodeList = [];

// // for (var Ax = 0; Ax < Om; Ax++) {
// //   for (var i = 0; i < moverCount; i++) {
// //     A = movers[i];
// //     var testAgainst = movers + statics;
// //     for (var i2 = i + 1; i2 < testAgainst.length; i2++) {
// //       B = testAgainst[i2];
// //       if (bodiesOverlap(A, B)) {
// //         var pair = [A, B];
// //         overlappArr[Ax].push(pair);

// //         pairCode = makePairCode(pair);
// //         if (masterPairCodeDict[pairCode] == undefined) {
// //           masterPairCodeList.push(pairCode);
// //           masterPairDict[pairCode] = pair;
// //         }
// //       }
// //     }
// //   }
// // }

// // // step three: Find out by how many and which dimensions
// // // each pair overlaps

// // var overlapDimsArrDict = {};
// // var pair = null;
// // var pairCode = null;

// // for (var Ax = 0; Ax < Om; Ax++) {
// //   for (var i = 0; i < overlapArr[Ax].length; i++) {
// //     pairCode = makePairCode(overlapArr[Ax][i]);
// //     if (overlapDimsArrDict[pairCode] == undefined) {
// //       overlapDimsArrDict[pairCode] = [Ax];
// //     } else {
// //       overlapDimsArrDict[pairCode].push(Ax);
// //     }
// //   }
// // }

// // // step four: find all pairs which overlap in every dimension,
// // // these being the pairs which overlap in space

// // var spaceOverlapPairs = [];

// // for (var i = 0; i < masterPairCodeList.length; i++) {
// //   pairCode = masterPairCodeList[i];
// //   if (overlapDimsArrDict[pairCode].length == Om) {
// //     spaceOverlapPairs.push(masterPairCodeDict[pairCode]);
// //   }
// // } 

// // // step six: check for illegal conditions and note legal
// // // collisions

// // var oldOverlapDimsArrDict = W.overlapDimsArrDict;
// // var oldOverlapDimsArr = null;
// // var uniqAx = null;
// // var axises = null;
// // var collision = null;
// // var collisionsArr = [];

// // for (var i = 0; i < spaceOverlapPairs.length; i++) {
// //   pair = spaceOverlapPairs[i];
// //   pairCode = makePairCode(pair);
// //   oldOverlapDimArr = oldOverlapDimsArrDict[pairCode];
// //   if (oldOverlapDimsArr != undefined) {
// //     if (oldOverlapDimsArr.length == Om) {
// //       // body was already spaceOverlapping, continue to allow
// //       ;
// //     } else if (oldOverlapDimsArr.length == Om - 1) {
// //       // surface collision
// //       uniqAx = dimCodes.diffSimple(oldOverlapDimsArr)[0];
// //       collision = {
// //         face: true,
// //         pair: pair,
// //         pairCode: pairCode,
// //         axis: uniqAx
// //       };
// //       collisionsArr.push(pair);
// //     } else {
// //       // corner collision
// //       axises = dimCodes.diffSimple(oldOverlapDimsArr);
// //       collision = {
// //         face: false,
// //         pair: pair,
// //         pairCode: pairCode,
// //         axises: axises
// //       };
// //       collisionsArr.push(pair);
// //     }
// //   }
// // }

// // // step seven: resolve basic overlaps by compaction or ricochet

// // for (var i = 0; i < collisionsArr.length; i++) {
// //   A = collisionsArr[i][0];
// //   B = collisionsArr[i][1];
// //   if (!(A.collisionsOverride(B) || B.collisionsOverride(A))) {

// //   }
// // }
