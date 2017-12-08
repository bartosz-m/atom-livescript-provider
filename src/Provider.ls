log = (...args)-> process.send method: 'console.log', args: args

process.on \unhandledRejection, (reason, p) -> log reason
try
    require! {
        \fs-extra : fs
        \livescript : livescript
        \livescript/lib/lexer
        \livescript-compiler/lib/livescript/Compiler
        loophole : { allow-unsafe-new-function }
    }

    compiler = Compiler.create livescript: livescript with {lexer}

    load-config = (config) ->>
        log \config config
        if config.plugins.transform-esm.enable
            transform-esm = require \livescript-transform-esm/lib/plugin
            transform-esm.install compiler, format: config.plugins.transform-esm.format
        if config.plugins.transform-object-create
            transform = require \livescript-transform-object-create/lib/plugin
            transform.install compiler
        if config.plugins.transform-implicit-async
            transform = require \livescript-transform-implicit-async/lib/plugin
            transform.install compiler

    generate-ast = (code) ->>
        livescript.ast code

    transform = (code, {file-path,macros}) ->>
        log \transforming file-path
        options =
            map: 'linked'
            bare: false
            header: false
            filename: file-path
            output-filename: file-path.replace /.ls$/ '.js'

        result = compiler.compile code, options
        delete result.ast #ast contains circural references
            # if macros == true
            #     compiler = new MacroCompiler
            #     compiler.compile-code code, options
            # else
            #     ast = livescript.ast code
            #     log \got-ast, ast
            #     output = ast.compile-root options
            #     log \compiled
            #     output.set-file file-path
            #     output.to-string-with-source-map!

        result
            ..source-map = ..map.to-JSON!

        #
        # result = allow-unsafe-new-function -> livescript.compile code, options
        #     ..source-map = ..map.to-JSON!

    transform-file =  (filename) ->>
        code = await fs.read-file filename, \utf8
        transform code, filename

    send-event = (event) !-> process.send {event}

    set-interval do
        !-> send-event type: \heartbeet
        5000

    methods = {transform, transform-file, generate-ast, load-config}


    process.on \message (m) !->>
        try
            if method-name = m.method
                if method = methods[method-name]
                    try
                        result = await method ...m.args
                        process.send do
                            id: m.id
                            result: result
                    catch
                        log \error, e{message}, "#{e.stack}"
                        process.send do
                            id : m.id
                            error: e{message,stack}
                else
                    process.send do
                        id: m.id
                        error: "unregistered method #{m.method}"
            else
                process.send do
                    id: m.id
                    error: "missing method name"
        catch
            log 'error', e{message,stack}

    process.on \exit !-> process.send \exit
catch
    log 'error', e{message,stack}
