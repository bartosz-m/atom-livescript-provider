require! {
    \loophole : { allow-unsafe-new-function }
    \fs-extra : fs
}

module.exports =
    activate: ->

    deactivate: ->

    provide: ->
        from-grammar-name: 'LiveScript'
        from-scope-name: 'source.livescript'
        to-scope-name: 'source.js'

        transform: (code, {file-path}) ->
            options =
                map: 'linked'
                bare: true
                header: false
                filename: file-path
                output-filename: file-path.replace /.ls$/ '.js'


            result = allow-unsafe-new-function -> livescript.compile code, options
                ..source-map = ..map.to-JSON!

        transform-file: (filename) ->>
            code = await fs.read-file filename \utf8
            @transform code, filename
