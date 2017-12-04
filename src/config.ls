module.exports =
    debug:
        type: 'boolean'
        default: false
    modules:
        type: 'object'
        properties:
            enable:
                type: 'boolean'
                default: true
            format:
                type: 'string'
                default: 'esm'
                enum:
                  * value: 'esm', description: 'ECMAScript modules.'
                  * value: 'cjs', description: 'CommonJS modules.'
