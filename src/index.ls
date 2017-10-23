require! {
    child_process : { fork }
    \./config
    \../package : Package
    \./components/WithTimeLimit : { WithTimeLimit, symbols: {start-time, set-time-limit} }
    \./components/Creatable : { Creatable, symbols: {create} }
    \./components/Deferred : { Deferred }
    \./composition/init
    \./Task
}

remote =
    call: (method, args) ->
        task = Task[create]! <<<
            id: Date.now!
            method: method
            args: args
        tasks[task.id] = task
        runner.send task
        task

var runner,tasks
process-message = (m) !->
    if task = tasks[m.id]
        unless m.error
            task.resolve m.result
        else
            task.reject m.error
        delete tasks[m.id]
    else
        console.log "unregistered message #{m}"

module.exports =
    config: config
    activate: ->
        runner := fork __dirname +  \/Provider, stdio: 'ipc'
        runner.on \message process-message
        tasks := {}

    deactivate: ->
        runner?kill!
        runner = null

    provide: ~>
        name: Package.name
        description: Package.description
        from-grammar-name: 'LiveScript'
        from-scope-name: 'source.livescript'
        to-scope-name: 'source.js'

        generate-ast: (code,options) ->
            macros = atom.config.get \atom-livescript-provider.enableMacros
            args = [code,{macros} <<< options]
            task = remote.call \generateAst, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            task.promise

        transform: (code, options) ->
            macros = atom.config.get \atom-livescript-provider.enableMacros
            args = [code,{macros} <<< options]
            task = remote.call \transform, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            task.promise


        transform-file: (filename) ->>
            macros = atom.config.get \atom-livescript-provider.enableMacros
            args = [filename,{macros} <<< options]
            task = remote.call \transformFile, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            task.promise
