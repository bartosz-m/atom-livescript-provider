module.exports =
    debug:
        type: 'boolean'
        default: false
    plugins:
        type: 'object'
        properties:
            transform-esm:
                type: 'object'
                title: "transform-esm"
                properties:
                    enable:
                        type: 'boolean'
                        title: 'enable'
                        description: 'es6 modules support'
                        default: true
                    format:
                        type: 'string'
                        title: 'format'
                        description: 'format of generated code'
                        default: 'esm'
                        enum:
                          * value: 'esm', description: 'ECMAScript modules'
                          * value: 'cjs', description: 'CommonJS modules'
            transform-object-create:
                type: 'boolean'
                title: "transform-object-create"
                description: 'converts `^^` operator to `Object.create`'
                default: true
            transform-implicit-async:
                type: 'boolean'
                title: "transform-implicit-async"
                description: 'detects usage of `await` and automatically mark function as `async`'
                default: true
