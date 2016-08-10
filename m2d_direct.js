var director = {};

var bodyA = conjurer.initBody([200, 200], 8, [1, 1]);
var bodyB = conjurer.initBody([256, 309], 20, [0.5, 2]);

director.worldParams = {
  place: {
    width: 400,
    height: 300,
    center: [200, 150]
  },
  dimensionals: [
    { expanse: 400 },
    { expanse: 300 }
  ],
  bodies: [bodyA, bodyB] // may be overwritten
};

// bodies overwrite:
// Rectilinear Block Spread
director.worldParams.bodies = [];
for (var i = 0; i < 5; i++) {
  for (var j = 0; j < 5; j++) {
    director.worldParams.bodies.push(
      conjurer.initBody([80 + i * 40, 20 + j * 40], 8, [0, 0])
    );
  }
}

// // bodies overwrite:
// // 2 Corner Colliders
// director.worldParams.bodies = [];
// director.worldParams.bodies.push(
//   conjurer.initBody([30, 30], 8, [1, 1])
// );
// director.worldParams.bodies.push(
//   conjurer.initBody([300, 300], 8, [-1, -1])
// );

// // bodies overwrite:
// // 2 Horizontal Colliders
// director.worldParams.bodies = [];
// director.worldParams.bodies.push(
//   conjurer.initBody([30, 30], 8, [0.2, 0])
// );
// director.worldParams.bodies.push(
//   conjurer.initBody([300, 30], 8, [-0.2, -0])
// );

var World = conjurer.initWorld(director.worldParams);

console.log("World > ");
console.log(World);

