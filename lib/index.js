var fork, config, Package, livescript, fs, allowUnsafeNewFunction, init, create, importAllProperties, Creatable, ref$, Deferred, startTime, setTimeLimit, WithTimeLimit, x$, Task, remote, runner, tasks, processMessage, this$ = this;
fork = require('child_process').fork;
config = require('./config');
Package = require('../package');
init = Symbol('init');
create = Symbol('create');
importAllProperties = function(target){
  var sources, res$, i$, to$, len$, source, descriptor;
  res$ = [];
  for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
    res$.push(arguments[i$]);
  }
  sources = res$;
  for (i$ = 0, len$ = sources.length; i$ < len$; ++i$) {
    source = sources[i$];
    descriptor = Object.getOwnPropertyDescriptors(source);
    Object.defineProperties(target, descriptor);
  }
  return target;
};
Creatable = (ref$ = {}, ref$[create] = function(arg){
  var x$;
  x$ = Object.create(this);
  x$[init](arg);
  return x$;
}, ref$);
Deferred = (ref$ = {}, ref$[init] = function(){
  var this$ = this;
  this.promise = new Promise(function(resolve, reject){
    this$.resolve = resolve;
    this$.reject = reject;
  });
}, ref$);
startTime = Symbol('Task::start-time');
setTimeLimit = Symbol('WithTimeLimit::set-time-limit');
WithTimeLimit = (ref$ = {}, ref$[init] = function(){
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
x$ = Task = Object.create(null);
importAllProperties(x$, Creatable, Deferred, WithTimeLimit);
x$[init] = function(arg){
  Deferred[init].call(this, arg);
  WithTimeLimit[init].call(this, arg);
};
remote = {
  call: function(method, args){
    var task, ref$;
    task = (ref$ = Task[create](), ref$.id = Date.now(), ref$.method = method, ref$.args = args, ref$);
    tasks[task.id] = task;
    runner.send(task);
    return task;
  }
};
processMessage = function(m){
  var task;
  if (task = tasks[m.id]) {
    if (!m.error) {
      task.resolve(m.result);
    } else {
      task.reject(m.error);
    }
    delete tasks[m.id];
  } else {
    console.log("unregistered message " + m);
  }
};
module.exports = {
  config: config,
  activate: function(){
    runner = fork(__dirname + '/Provider', {
      stdio: 'ipc'
    });
    runner.on('message', processMessage);
    runner.on('exit', function(){
      console.log('exited');
    });
    runner.on('close', function(){
      console.log('closed');
    });
    return tasks = {};
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
      generateAst: function(code){
        livescript == null && (livescript = require('livescript-async'));
        return livescript.ast(code);
      },
      transform: function(code, options){
        var macros, args, x$, transformTask;
        macros = atom.config.get('atom-livescript-provider.enableMacros');
        args = [
          code, import$({
            macros: macros
          }, options)
        ];
        x$ = transformTask = remote.call('transform', args);
        x$[setTimeLimit](10000);
        return transformTask.promise;
      },
      transformFile: async function(filename){
        var code;
        fs == null && (fs = require('fs-extra'));
        code = (await fs.readFile(filename('utf8')));
        return this.transform(code, filename);
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
