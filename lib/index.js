var Package, livescript, fs, allowUnsafeNewFunction;
Package = require('../package');
module.exports = {
  activate: function(){},
  deactivate: function(){},
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
      transform: function(code, arg$){
        var filePath, options, result;
        filePath = arg$.filePath;
        livescript == null && (livescript = require('livescript-async'));
        allowUnsafeNewFunction == null && (allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction);
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
        fs == null && (fs = require('fs-extra'));
        code = (await fs.readFile(filename('utf8')));
        return this.transform(code, filename);
      }
    };
  }
};
//# sourceMappingURL=/home/bartek/Projekty/atom/atom-livescript-provider/lib/index.js.map
