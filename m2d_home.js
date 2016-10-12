var X = 0;
var Y = 1;
var Z = 2;
var Om = 2;

var DOWN = 0;
var UP = 1;

var tester = {_names: [], _functions: {}, _results: {}, _ran: {}, params: {}};

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

// The tester currently does not test itself, so this runs all of 0 tests
// Add tester tests later

tester.runAll();