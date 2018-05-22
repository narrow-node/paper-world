/**
 * @title util.js
 * @description Basic server utilities.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const micro = require('iomicro')

// [MIDDLEWARE]
micro.init({ appName: 'paper-world-'+process.env.WORLD, logDir: '../logs/paper-world/W'+process.env.WORLD })

// [UTIL]
const Util = function() {
    /**
     * @description Toolkit for engine developers.
     **/
    this.name = 'Util'

    this.micro = micro
    this.log = micro.log

    this.log('['+this.name+'] Loading utilities...')

    // Asynchronizing all functions in this prototype.
    this.asyncProto(this)
}
Util.prototype.error = function(error) {
    /**
     * @purpose Handle errors globally.
     * @usage util.error(new Error('I am an error.'))
     **/
    
    // Forcing errors to be of the `Error` type.
    if (!error instanceof Error) error = new Error(error) 

    // Global default logic for all errors.
    micro.error(error.stack)
    //process.exit
}
Util.prototype.async = function(fn, callback) {
    /**
     * @purpose Make any function asynchronous.
     * @usage asyncFn = async(myFunction)
     **/
    return function() {
        // Storing arguments locally so they can be accessed out-of-scope below.
        const args = arguments;
        const self = this

        // Utilizing setTimeout with 0ms to run asynchronously. 
        setTimeout(function() {
            // For the setTimeout function, running the passed through function with its arguments.
            const returned = fn.apply(self, args)

            // The original synchronous function as just run; now running the optional callback
            if (callback) callback(returned) 
        }, 0)
    }
}
Util.prototype.promise = function(fn, customThis) {
    /**
     * @purpose Make a synchronous function async, then wrap in a standard Promise.
     * @usage promiseFn = promise(fn)
     *        promiseFn.then(resolveFn, rejectFn)
     * @justify Unified system for callbacks of asynchronous functions.
     **/
    const self = this

    return function() {
        // Storing arguments locally so they can be accessed out-of-scope below.
        const args = arguments
        const caller = this

        // The function passed will now return a Promise, allowing fn.then(resolveFn, rejectFn)
        return new Promise(function(resolve, reject) {
            // The callback argument
            var returned

            // Setting default reject.
            // As a fallback, it will always use the global Util.error handler.
            reject = self.error

            // If `this.error` is set inside the auto-promised function, running THAT as the reject.
            // This is nice, so that you can handle default errors for a function, and not have the same reject every call.
            // Failed to run original function; running reject callback.
            if (caller && typeof(caller.error) === 'function') reject = caller.error

            // By default, the callback will be the reject for the Promise.
            var callback = reject

            // Making the original asynchronous.
            self.async(
                // The first argument passed to async is the function to asynchronize.
                // Defining that as such:
                function() {
                    // Wrapping everything in a try--catch to prevent crashing on errors (if undesired).
                    // If crashing is more desirable, simply crash in the reject callback.
                    try {
                        // Running the original function with its arguments.
                        // Setting `returned` as the value returned from the function! :D
                        returned = fn.apply(customThis || this, args)

                        // The try succeeded; the callback to run afterwards is now the resolve.
                        callback = resolve
                    } catch (e) {
                        // Setting `returned` as the error stack
                        returned = e
                    }
                },
                // The second argument passed to async is the callback; here, that's the resolve callback for the Promise.
                // If the original function returned a value, it will be passed through the resolve.
                function() { callback(returned) }
            )()
        })
    }
}
Util.prototype.asyncProto = function(proto) {
    /**
     * @purpose Globally asynchronize every function in a prototype.
     * @funfact Whitelisted functions will be the only synchronous functions in the entire repo.
     **/
    // NOTE: this.log inherits micro.log, which is already async
    const blacklist = [ this.async, this.promise, this.asyncProto, this.log, this.getMS ]

    // Looping through all variables in the specified prototype.
    for (var name in proto) {
        // This function in the proto.
        const fn = proto[name]

        // Skipping non-functions and blacklisted functions.
        if (typeof(fn) !== 'function' || blacklist.indexOf(fn) > -1) continue 

        // Making this function an asynchronous promise.
        // Passing through `proto` for the `customThis` in `self.promise` so that when
        // a function in the prototype is later called, `this` can be accessed 
        proto[name] = this.promise(fn, proto)
    }

    this.log('[Util] Asynced with Promise all functions for '+proto.name)
}
Util.prototype.getMS = function() {
    /**
     * @returns The current time since last epoch in MS.
     **/
    return new Date().getTime() 
}

// [EXPORTS]
module.exports = new Util()
