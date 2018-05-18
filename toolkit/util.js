/**
 * @title util.js
 * @description Basic server utilities.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const clockwork = require('clockwork')({ key: process.env.SMSKEY })
const micro = require('iomicro')


// [MIDDLEWARE]
micro.init({ appName: 'paper-world-' + process.env.WORLD })


// [UTIL]
const Util = function() {
    /**
     * @description Toolkit for engine developers.
     **/
    this.micro = micro
    this.log = micro.log
    this.log('Loading utilities...')
}
Util.prototype.getMS = function() {
    /**
     * @returns The current time since last epoch in MS.
     **/
    return new Date().getTime() 
}
Util.prototype.sendText = function(message, number) {
    /**
     * @purpose Send a text message.
     * @note Format: (555) 123-4567 = '15551234567'
     **/

    // Fallback phone number.
    number = number || process.env.PHONE

    // Wrapping text message operation in a Promise.
    return new Promise(function(resolve, reject) {
        clockwork.sendSms({ To: number.toString(), Content: message }, (err, res) => {
            // Running the Promise resolve or reject.
            err ? reject(err) : resolve(res)
            
            // Logging the text message response.
            err ? micro.error(err) : micro.log(JSON.stringify(res))
        })
    })
}


// [EXPORTS]
module.exports = new Util()
