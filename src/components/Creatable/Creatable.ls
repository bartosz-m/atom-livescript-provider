require! {
    \../../composition/init
    \../../composition/symbols
    \./symbols : { create }
}

Creatable = module.exports =
    (symbols): {create}
    (create): (arg) ->
        Object.create @
            ..[init] arg
