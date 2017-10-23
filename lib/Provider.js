var fs, livescript, MacroCompiler, allowUnsafeNewFunction, generateAst, transform, transformFile, methods, e;
fs = require('fs-extra');
livescript = require('livescript');
MacroCompiler = require('livescript/lib/MacroCompiler');
allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;
try {
  generateAst = async function(code){
    return livescript.ast(code);
  };
  transform = async function(code, arg$){
    var filePath, macros, options, result, compiler, ast, output, x$;
    filePath = arg$.filePath, macros = arg$.macros;
    options = {
      map: 'linked',
      bare: true,
      header: false,
      filename: filePath,
      outputFilename: filePath.replace(/.ls$/, '.js')
    };
    result = macros === true
      ? (compiler = new MacroCompiler, compiler.compileCode(code, options))
      : (ast = livescript.ast(code), output = ast.compileRoot(options), output.setFile(filePath), output.toStringWithSourceMap());
    x$ = result;
    x$.sourceMap = x$.map.toJSON();
    return x$;
  };
  transformFile = async function(filename){
    var code;
    code = (await fs.readFile(filename, 'utf8'));
    return transform(code, filename);
  };
  methods = {
    transform: transform,
    transformFile: transformFile,
    generateAst: generateAst
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
  process.send('error');
  process.send(e);
}
//# sourceMappingURL=Provider.js.map
