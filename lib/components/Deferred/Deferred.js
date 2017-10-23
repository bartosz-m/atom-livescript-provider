var symbols, init, Deferred, ref$;
symbols = require('../../composition/symbols');
init = require('../../composition/init');
Deferred = module.exports = (ref$ = {}, ref$[symbols] = {}, ref$[init] = function(){
  var this$ = this;
  this.promise = new Promise(function(resolve, reject){
    this$.resolve = resolve;
    this$.reject = reject;
  });
}, ref$);
//# sourceMappingURL=components/Deferred/Deferred.js.map
