/**
 * @title world.js
 * @description World handler.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const meta = require(__basedir+'/toolkit/meta')(true)
const util = require(__basedir+'/toolkit/util')
const micro = util.micro


// [PROTOTYPES]
const Player = require('./player')
const World = function() {
    /**
     * @description A new world instance.
     **/
    micro.log('The world is now online.')

    this.socket = micro.socket({ port: meta.port, ssl: meta.options.ssl })
    this.players = []

    //if (!meta.isDevMode) util.sendText('[Paperweight] ' + meta.getStartupMessage());
    return this
}
World.prototype.on = function(events, callback) {
    /**
     * @purpose Redefine wss library 'on' listener and wrapping in a Promise.
     * @justify wss splits up the request and socket into two different objects.
     *          Here, we merge them into one. This is best for player management.
     **/
    return this.socket.on(events, function(request, socket) {
        // Creating a new player with the request and socket from the world socket listener.
        callback(new Player(request, socket))
    })
}
World.prototype.add = function(item) {
    /**
     * @purpose Add an item to the world state.
     **/
    if (item instanceof Player) {
        // Item was a player!
        micro.log('A player has connected!')

        // Adding player to current player store.
        return this.players.push(item)
    }

    // if (item instanceof Object)
}
World.prototype.remove = World.prototype.kick = function(item) {
    /**
     * @purpose Remove an item from the world state.
     **/
    if (item instanceof Player) {
        // Item was a player; kicking
        micro.log('A player has disconnected.')

        // Removing player from current player store.
        this.players.splice(this.players.indexOf(item), 1)

        // Killing the player's socket.
        item.destroy()
    }
}
World.prototype.yell = function(message, whitelist) {
    /**
     * @purpose Broadcast to whitelisted array of players in this world.
     * @note Send through players array to broadcast to all players. 
     **/

    // Falling back to all players.
    whitelist = whitelist || this.players

    // Sending the message to each player.
    whitelist.forEach(function(player) {
        player.send(message)
    })
}


// Exporting for shiggles
module.exports = World
