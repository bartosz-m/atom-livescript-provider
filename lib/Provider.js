var fs, livescript, lexer, MacroCompiler, Compiler, allowUnsafeNewFunction, log, plugins, compiler, ref$, e, i$, len$, plugin, loadConfig, generateAst, transform, transformFile, sendEvent, methods;
fs = require('fs-extra');
livescript = require('livescript');
lexer = require('livescript/lib/lexer');
MacroCompiler = require('livescript/lib/MacroCompiler');
Compiler = require('livescript-compiler/lib/livescript/Compiler');
allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;
log = function(){
  var args, res$, i$, to$;
  res$ = [];
  for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
    res$.push(arguments[i$]);
  }
  args = res$;
  return process.send({
    method: 'console.log',
    args: args
  });
};
try {
  plugins = [require('livescript-transform-object-create/lib/plugin'), require('livescript-transform-implicit-async/lib/plugin')];
  compiler = Compiler.create({
    livescript: (ref$ = clone$(livescript), ref$.lexer = lexer, ref$)
  });
} catch (e$) {
  e = e$;
  log("Error " + e.message);
}
try {
  for (i$ = 0, len$ = plugins.length; i$ < len$; ++i$) {
    plugin = plugins[i$];
    plugin.install(livescript);
  }
  loadConfig = async function(config){
    var transformEsm;
    log('config', config);
    if (config.modules.enable) {
      transformEsm = require('livescript-transform-esm/lib/plugin');
      return transformEsm.install(compiler, {
        format: config.modules.format
      });
    }
  };
  generateAst = async function(code){
    return livescript.ast(code);
  };
  transform = async function(code, arg$){
    var filePath, macros, options, result, x$;
    filePath = arg$.filePath, macros = arg$.macros;
    log('transforming', filePath);
    options = {
      map: 'linked',
      bare: false,
      header: false,
      filename: filePath,
      outputFilename: filePath.replace(/.ls$/, '.js')
    };
    result = compiler.compile(code, options);
    delete result.ast;
    x$ = result;
    x$.sourceMap = x$.map.toJSON();
    return x$;
  };
  transformFile = async function(filename){
    var code;
    code = (await fs.readFile(filename, 'utf8'));
    return transform(code, filename);
  };
  sendEvent = function(event){
    process.send({
      event: event
    });
  };
  setInterval(function(){
    sendEvent({
      type: 'heartbeet'
    });
  }, 5000);
  methods = {
    transform: transform,
    transformFile: transformFile,
    generateAst: generateAst,
    loadConfig: loadConfig
  };
  process.on('message', async function(m){
    var methodName, method, result, e;
    try {
      if (methodName = m.method) {
        if (method = methods[methodName]) {
          try {
            result = (await method.apply(null, m.args));
            process.send({
              id: m.id,
              result: result
            });
          } catch (e$) {
            e = e$;
            log('error', {
              message: e.message
            }, e.stack + "");
            process.send({
              id: m.id,
              error: {
                message: e.message,
                stack: e.stack
              }
            });
          }
        } else {
          process.send({
            id: m.id,
            error: "unregistered method " + m.method
          });
        }
      } else {
        process.send({
          id: m.id,
          error: "missing method name"
        });
      }
    } catch (e$) {
      e = e$;
      process.send({
        message: e.message,
        stack: e.stack
      });
    }
  });
  process.on('exit', function(){
    process.send('exit');
  });
} catch (e$) {
  e = e$;
  process.send("Error " + e.message);
}
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
}
//# sourceMappingURL=Provider.js.map
