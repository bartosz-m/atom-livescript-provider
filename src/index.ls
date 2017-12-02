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
    apply: (method, args) ->
        task = Task[create]! <<<
            id: Date.now!
            method: method
            args: args
        tasks[task.id] = task
        runner.send task
        task
    call: (method, ...args) -> @apply method, args

log-task-id = 0


var runner
tasks = {}
process-message = (m) !->
    if m.event?
        console.log m.event
    else if m.method == 'console.log'
        console.log "runner:", ...m.args
    else if task = tasks[m.id]
        unless m.error
            task.resolve m.result
        else
            task.reject m.error
        delete tasks[m.id]
    else
        console.log "unregistered message ", m

module.exports =
    config: config
    activate: ->
        runner := fork __dirname +  \/Provider, stdio: 'ipc'
        runner.on \message process-message
        remote.call \loadConfig atom.config.get \atom-livescript-provider
        atom.config.on-did-change \atom-livescript-provider, ({new-value}) !~>
            runner.kill!
            tasks := {}
            runner := fork __dirname +  \/Provider, stdio: 'ipc'
            runner.on \message process-message
            remote.call \loadConfig new-value

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
            task = remote.apply \generateAst, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            task.promise

        transform: (code, options) ->
            macros = atom.config.get \atom-livescript-provider.enableMacros
            args = [code,{macros} <<< options]
            task = remote.apply \transform, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            task.promise


        transform-file: (filename) ->>
            macros = atom.config.get \atom-livescript-provider.enableMacros
            args = [filename,{macros} <<< options]
            task = remote.apply \transformFile, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            task.promise
