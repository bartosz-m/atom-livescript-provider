module.exports = import-all-properties = (target, ...sources) ->
    for source in sources
        descriptor = Object.get-own-property-descriptors source
        Object.define-properties target, descriptor
    target
