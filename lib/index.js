var allowUnsafeNewFunction, fs;
allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;
fs = require('fs-extra');
module.exports = {
  activate: function(){},
  deactivate: function(){},
  provide: function(){
    return {
      fromGrammarName: 'LiveScript',
      fromScopeName: 'source.livescript',
      toScopeName: 'source.js',
      transform: function(code, arg$){
        var filePath, options, result;
        filePath = arg$.filePath;
        options = {
          map: 'linked',
          bare: true,
          header: false,
          filename: filePath,
          outputFilename: filePath.replace(/.ls$/, '.js')
        };
        return result = allowUnsafeNewFunction(function(){
          var x$;
          x$ = livescript.compile(code, options);
          x$.sourceMap = x$.map.toJSON();
          return x$;
        });
      },
      transformFile: async function(filename){
        var code;
        code = (await fs.readFile(filename('utf8')));
        return this.transform(code, filename);
      }
    };
  }
};
//# sourceMappingURL=/home/bartek/Projekty/atom/atom-livescript-provider/lib/index.js.map
