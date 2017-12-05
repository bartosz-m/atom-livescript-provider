module.exports =
    debug:
        type: 'boolean'
        default: false
    plugins:
        type: 'object'
        properties:
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
            transform-object-create:
                type: 'boolean'
                default: true
            transform-implicit-async:
                type: 'boolean'
                default: true
