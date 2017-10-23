var init, symbols, ref$, startTime, setTimeLimit, WithTimeLimit;
init = require('../../composition/init');
symbols = require('../../composition/symbols');
ref$ = require('./symbols'), startTime = ref$.startTime, setTimeLimit = ref$.setTimeLimit;
WithTimeLimit = (ref$ = {}, ref$[symbols] = {
  startTime: startTime,
  setTimeLimit: setTimeLimit
}, ref$[init] = function(){
  this[startTime] = Date.now();
}, ref$[setTimeLimit] = function(limit){
  var delta, this$ = this;
  if (!this[startTime]) {
    this[startTime] = Date.now();
  }
  delta = limit - (Date.now() - this[startTime]);
  setTimeout(function(){
    this$.reject(new Error("Timeout"));
  }, delta);
}, ref$);
module.exports = WithTimeLimit;
//# sourceMappingURL=components/WithTimeLimit/WithTimeLimit.js.map
