var WithTimeLimit, Creatable, Deferred, init, importAllProperties, x$, Task;
WithTimeLimit = require('./components/WithTimeLimit').WithTimeLimit;
Creatable = require('./components/Creatable').Creatable;
Deferred = require('./components/Deferred').Deferred;
init = require('./composition/init');
importAllProperties = require('./composition/import-all-properties');
x$ = Task = Object.create(null);
module.exports = x$;
importAllProperties(x$, Creatable, Deferred, WithTimeLimit);
x$[init] = function(arg){
  Deferred[init].call(this, arg);
  WithTimeLimit[init].call(this, arg);
};
//# sourceMappingURL=Task.js.map
