require! {
    \../package : Package
}
var livescript,fs,allow-unsafe-new-function

module.exports =
    activate: ->

    deactivate: ->

    provide: ->
        name: Package.name
        description: Package.description
        from-grammar-name: 'LiveScript'
        from-scope-name: 'source.livescript'
        to-scope-name: 'source.js'

        generate-ast: (code) ->
            livescript ?:= require \livescript-async
            livescript.ast code

        transform: (code, {file-path}) ->
            livescript ?:= require \livescript-async
            {allow-unsafe-new-function} ?:= require \loophole
            options =
                map: 'linked'
                bare: true
                header: false
                filename: file-path
                output-filename: file-path.replace /.ls$/ '.js'


            result = allow-unsafe-new-function -> livescript.compile code, options
                ..source-map = ..map.to-JSON!

        transform-file: (filename) ->>
            fs ?:= require \fs-extra
            code = await fs.read-file filename \utf8
            @transform code, filename
