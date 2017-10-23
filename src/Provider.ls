require! {
    \fs-extra : fs
    \livescript : livescript
    \livescript/lib/MacroCompiler
    loophole : { allow-unsafe-new-function }
}

try
    generate-ast = (code) ->>
        livescript.ast code

    transform = (code, {file-path,macros}) ->>
        options =
            map: 'linked'
            bare: true
            header: false
            filename: file-path
            output-filename: file-path.replace /.ls$/ '.js'

        result =
            if macros == true
                compiler = new MacroCompiler
                compiler.compile-code code, options
            else
                ast = livescript.ast code
                output = ast.compile-root options
                output.set-file file-path
                output.to-string-with-source-map!
        result
            ..source-map = ..map.to-JSON!

        #
        # result = allow-unsafe-new-function -> livescript.compile code, options
        #     ..source-map = ..map.to-JSON!

    transform-file =  (filename) ->>
        code = await fs.read-file filename, \utf8
        transform code, filename

    methods = {transform, transform-file, generate-ast}


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
            process.send e{message,stack}

    process.on \exit !-> process.send \exit
catch
    process.send \error
    process.send e
