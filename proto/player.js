/**
 * @title player.js
 * @description Player handler.
 * @author ethancrist
 **/

'use strict'

const Player = function(req, socket) {
    /**
     * @description A new player instance.
     **/

    // Request for the player. Contains event listeners and other things.
    this.req = req

    // Socket attached to this player, for usage convenience.
    this.socket = socket

    // Destroy the socket attached to the player. (Prevent memory leaks!)
    this.destroy = socket.destroy

    // Returning the player.
    return this
}
Player.prototype.send = function(message) {
    /**
     * @purpose Send a message to the player.
     **/

    // Assuming that the socket state is ready BEFORE sending.
    // Make sure that the player has connected before calling this function!
    this.socket.readyState = true

    // Sending the message.
    return this.req.send(message)
}
Player.prototype.on = function(eventName, callback) {
    /**
     * @purpose Listen for player events, i.e. 'command'.
     * @usage player.on([String eventName], [Function callback])
     **/
    this.req.on('message', function(message) {
        message = JSON.parse(message)
        Object.keys(message).forEach(function(type) {
            if (eventName === type && callback) callback(message[type])
        })
    })

    // Returning player instance for usage convenience.
    return this
}

module.exports = Player
