var importAllProperties;
module.exports = importAllProperties = function(target){
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
//# sourceMappingURL=composition/import-all-properties.js.map
