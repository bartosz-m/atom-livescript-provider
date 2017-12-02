var fork, config, Package, ref$, WithTimeLimit, ref1$, startTime, setTimeLimit, Creatable, create, Deferred, init, Task, remote, logTaskId, runner, tasks, processMessage, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);}, this$ = this;
fork = require('child_process').fork;
config = require('./config');
Package = require('../package');
ref$ = require('./components/WithTimeLimit'), WithTimeLimit = ref$.WithTimeLimit, ref1$ = ref$.symbols, startTime = ref1$.startTime, setTimeLimit = ref1$.setTimeLimit;
ref$ = require('./components/Creatable'), Creatable = ref$.Creatable, create = ref$.symbols.create;
Deferred = require('./components/Deferred').Deferred;
init = require('./composition/init');
Task = require('./Task');
remote = {
  apply: function(method, args){
    var task, ref$;
    task = (ref$ = Task[create](), ref$.id = Date.now(), ref$.method = method, ref$.args = args, ref$);
    tasks[task.id] = task;
    runner.send(task);
    return task;
  },
  call: function(method){
    var args, res$, i$, to$;
    res$ = [];
    for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
      res$.push(arguments[i$]);
    }
    args = res$;
    return this.apply(method, args);
  }
};
logTaskId = 0;
tasks = {};
processMessage = function(m){
  var task;
  if (m.event != null) {
    console.log(m.event);
  } else if (m.method === 'console.log') {
    console.log.apply(console, ["runner:"].concat(arrayFrom$(m.args)));
  } else if (task = tasks[m.id]) {
    if (!m.error) {
      task.resolve(m.result);
    } else {
      task.reject(m.error);
    }
    delete tasks[m.id];
  } else {
    console.log("unregistered message ", m);
  }
};
module.exports = {
  config: config,
  activate: function(){
    var this$ = this;
    runner = fork(__dirname + '/Provider', {
      stdio: 'ipc'
    });
    runner.on('message', processMessage);
    remote.call('loadConfig', atom.config.get('atom-livescript-provider'));
    return atom.config.onDidChange('atom-livescript-provider', function(arg$){
      var newValue;
      newValue = arg$.newValue;
      runner.kill();
      tasks = {};
      runner = fork(__dirname + '/Provider', {
        stdio: 'ipc'
      });
      runner.on('message', processMessage);
      remote.call('loadConfig', newValue);
    });
  },
  deactivate: function(){
    var runner;
    if (runner != null) {
      runner.kill();
    }
    return runner = null;
  },
  provide: function(){
    return {
      name: Package.name,
      description: Package.description,
      fromGrammarName: 'LiveScript',
      fromScopeName: 'source.livescript',
      toScopeName: 'source.js',
      generateAst: function(code, options){
        var macros, args, x$, task;
        macros = atom.config.get('atom-livescript-provider.enableMacros');
        args = [
          code, import$({
            macros: macros
          }, options)
        ];
        x$ = task = remote.apply('generateAst', args);
        x$[setTimeLimit](10000);
        return task.promise;
      },
      transform: function(code, options){
        var macros, args, x$, task;
        macros = atom.config.get('atom-livescript-provider.enableMacros');
        args = [
          code, import$({
            macros: macros
          }, options)
        ];
        x$ = task = remote.apply('transform', args);
        x$[setTimeLimit](10000);
        return task.promise;
      },
      transformFile: async function(filename){
        var macros, args, x$, task;
        macros = atom.config.get('atom-livescript-provider.enableMacros');
        args = [
          filename, import$({
            macros: macros
          }, options)
        ];
        x$ = task = remote.apply('transformFile', args);
        x$[setTimeLimit](10000);
        return task.promise;
      }
    };
  }
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
//# sourceMappingURL=index.js.map
