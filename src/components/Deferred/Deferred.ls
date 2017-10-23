require! <[ ../../composition/symbols ../../composition/init ]>

Deferred = module.exports =
    (symbols): {}
    (init): !->
        @promise = new Promise (@resolve, @reject) !~>
