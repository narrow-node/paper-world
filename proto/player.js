/**
 * @title player.js
 * @description Player handler.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const util = require(__basedir+'/toolkit/util')
const micro = util.micro

// [PROTOTYPES]
const Player = function(req, socket) {
    /**
     * @description A new player instance.
     **/
    micro.log('['+this.name+'] Initializing...')

    // For out-of-scope reference, i.e. inside functions.
    const self = this

    this.name = 'Player'

    // TODO: Grab player data from Users API.
    this.username = 'Moonlight'
    this.tier = 3

    // Request for the player. Contains event listeners and other things.
    this.req = req
    this.events = { }

    // Listening for player messages.
    this.req.on('message', function(message) {
        // Getting up to date events, in case some were added/removed since the listener started.
        self.getEvents().then(function(events) {
            // The message passed from the client will always be a JSON string.
            // For example: { command: 'kick', say: 'hi' } for multiple requests.
            message = JSON.parse(message)

            // So here, we are looping through each player request and running the event that matches the key.
            // In our example, events['command']('kick') would run, AKA Player.events.command('kick')
            Object.keys(message).forEach(function(type) {
                // Running the command(s) that were requested by the player.
                if (typeof(events[type]) === 'function') events[type](message[type])
            })
        })
    })

    // Socket attached to this player, for usage convenience.
    this.socket = socket

    // Destroy the socket attached to the player. (Prevent memory leaks!)
    this.destroy = socket.destroy

    // Asynchronizing all functions in this prototype.
    util.asyncProto(this)

    // Returning the player.
    return this
}
Player.prototype.getReadyState = function() {
    /**
     * @purpose Dynamically check the readyState for the request socket.
     * @return [0] CONNECTING
     *         [1] OPEN
     *         [2] CLOSING
     *         [3] CLOSED
     **/
    return this.req.readyState
}
Player.prototype.send = function(message, skipLog) {
    /**
     * @purpose Send a message to the player.
     * @options ##### `skipLog`
     *          Type: `Boolean` Default: `true`
     *          If true, will not add the event to server logs.
     **/
    //this.error = function(e) { micro.error('Could not send to player :(');micro.error(e) }

    // Sending the message to the player.
    this.req.send(typeof(message) === 'string' ? message : JSON.stringify(message))

    // Logging this event.
    if (!skipLog) micro.log('[Player]['+this.username+'] '+message)

    return message
}
Player.prototype.on = function(eventName, callback) {
    /**
     * @purpose Listen for player events, i.e. 'command'.
     * @usage player.on([String eventName], [Function callback])
     **/
    this.events[eventName] = callback
}
Player.prototype.off = function(eventName) {
    /**
     * @purpose Stop listening for player events, i.e. 'command'.
     * @usage player.off([String eventName])
     **/
    delete this.events[eventName]
}
Player.prototype.getEvents = function() {
    /**
     * @purpose Get up to date listeners attached to player.on('message', [Function callback])
     * @justify Listen for multiple events all via one listener.
     **/
    return this.events
}

// [EXPORTS]
module.exports = Player
