require! {
    \./components/WithTimeLimit : { WithTimeLimit }
    \./components/Creatable : { Creatable }
    \./components/Deferred : { Deferred }
    \./composition/init
    \./composition/import-all-properties
}

Task = Object.create null
    module.exports = ..
    import-all-properties .., Creatable, Deferred, WithTimeLimit
    ..[init] = (arg) !->
        Deferred.[init].call @, arg
        WithTimeLimit.[init].call @, arg
