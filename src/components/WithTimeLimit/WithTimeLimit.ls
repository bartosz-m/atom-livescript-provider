require! {
    \../../composition/init
    \../../composition/symbols
    \./symbols : { start-time, set-time-limit }
}

WithTimeLimit =
    (symbols): {start-time, set-time-limit}
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

module.exports = WithTimeLimit
