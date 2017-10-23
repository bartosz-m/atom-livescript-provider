var init, symbols, create, Creatable, ref$;
init = require('../../composition/init');
symbols = require('../../composition/symbols');
create = require('./symbols').create;
Creatable = module.exports = (ref$ = {}, ref$[symbols] = {
  create: create
}, ref$[create] = function(arg){
  var x$;
  x$ = Object.create(this);
  x$[init](arg);
  return x$;
}, ref$);
//# sourceMappingURL=components/Creatable/Creatable.js.map
