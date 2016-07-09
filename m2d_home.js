var X = 0;
var Y = 1;
var Z = 2;
var Om = 2;

var tester = {_names: [], _functions: {}, _results: {}, _ran: {}};

tester.addFunction = function (name, fxn) {
  this._names.push(name);
  this._functions[name] = fxn;
  this._results[name] = null;
  this._ran[name] = false;
}

tester.runAll = function () {
  var name;
  for (var i = 0; i < this._names.length; i++) {
    name = this._names[i];
    if (this._ran[name]) {
      console.log('Skipping' + name);
    } else {
      console.log('Starting ' + name);
      this._results[name] = this._functions[name]();
      console.log(this._results[name]);
    }
  }
}

tester.reset = function () {
  var name;
  for (var i = 0; i < this._names.length; i++) {
    name = this._names[i];
    this._ran[name] = false;
    this._results[name] = null;
  }
  console.log("Tester reset");
}

var createBody = function () { 
  return {
    mass: 0,
    dimensionals: [null, null]
  };
};

tester.addFunction('createBody', function () { return createBody(); })

var initBody = function (center2D, radius, velocity2D) {
  var body = createBody();

  for (var A = X; A < Z; A++) {
    body.dimensionals[A] = {
      center: center2D.oneD[A],
      expanseUp: radius,
      expanseDown: radius,
      velocity: velocity2D[A]
    };
  }

  return body;
};

tester.addFunction('initBody', function () {
  return initBody({oneD: [200, 200]}, 8, [1, 1])
});

tester.runAll();