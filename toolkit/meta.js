/**
 * @title meta.js
 * @description Server metadata.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const util = require('./util')

// [DATA]
const Meta = function(isStart) {
    /**
     * @description Metadata for this world.
     **/
    this.name = 'Meta'

    util.log('['+this.name+'] Loading world metadata...')

    // Setting static prototype variables.
    this.port = this.getPort()
    this.isDevMode = process.env.WORLD === 'development'

    this.options.hello = this.getStartupMessage()

    // Metadata is being loaded from application start; storing startMS time.
    if (isStart) this.startMS = util.getMS()

    // Asynchronizing all functions in this prototype.
    util.asyncProto(this)
}
//Meta.prototype.getCache = function() { return this.isDevMode ? util.getMS() : meta.startMS },
Meta.prototype.getPort = function() {
    /**
     * @description The port the server is running on.
     **/
    return process.env.PORT || 3000
}
Meta.prototype.getStartupMessage = function() {
    /**
     * @description The message that logs when the application starts listening.
     **/
    return 'World is now online on port ' + this.port + '.'
}
Meta.prototype.options = {
    /**
     * @description The start options passed through to iomicro on .listen()
     **/
    appName: 'Paperweight-W' + process.env.WORLD,
    viewDir: '../client'
} 
if (process.env.SSLKEY && process.env.SSLCERT) {
    Meta.prototype.options.ssl = {
        key: process.env.SSLKEY,
        cert: process.env.SSLCERT
    }
}

// [EXPORTS]
module.exports = function(isStart) {
    return new Meta(isStart)
}
