require! {
    child_process : { fork }
    \./config
    \../package : Package
}

var livescript,fs,allow-unsafe-new-function

init = Symbol \init
create = Symbol \create

import-all-properties = (target, ...sources) ->
    for source in sources
        descriptor = Object.get-own-property-descriptors source
        Object.define-properties target, descriptor
    target

Creatable =
    (create): (arg) ->
        Object.create @
            ..[init] arg

Deferred =
    (init): !->
        @promise = new Promise (@resolve, @reject) !~>

start-time = Symbol \Task::start-time
set-time-limit = Symbol \WithTimeLimit::set-time-limit

WithTimeLimit =
    (init): !->
        @[start-time] = Date.now!

    (set-time-limit): (limit) !->
        unless @[start-time]
            @[start-time] = Date.now!
        delta = limit - (Date.now! - @[start-time])
        set-timeout do
            !~>
                @reject new Error "Timeout"
            delta

Task = Object.create null
    import-all-properties .., Creatable, Deferred, WithTimeLimit
    ..[init] = (arg) !->
        Deferred.[init].call @, arg
        WithTimeLimit.[init].call @, arg


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
        runner.on \exit !->
            console.log \exited
        runner.on \close !->
            console.log \closed
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

        generate-ast: (code) ->
            livescript ?:= require \livescript-async
            livescript.ast code

        transform: (code, options) ->
            macros = atom.config.get \atom-livescript-provider.enableMacros
            args = [code,{macros} <<< options]
            transform-task = remote.call \transform, args
                ..[set-time-limit] 10000    # 10s to finish compilation
            transform-task.promise


        transform-file: (filename) ->>
            fs ?:= require \fs-extra
            code = await fs.read-file filename \utf8
            @transform code, filename
