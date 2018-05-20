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
    this.name = 'World'

    micro.log('['+this.name+'] Loading world...')

    // Loading the world socket
    this.socket = micro.socket({ port: meta.port, ssl: meta.options.ssl })
    this.players = []

    // Asynchronizing all functions in this prototype.
    util.asyncProto(this)

    return this
}
World.prototype.on = function(events, callback) {
    /**
     * @purpose Redefine wss library 'on' listener and wrapping in a Promise.
     * @justify wss splits up the request and socket into two different objects.
     *          Here, we merge them into one. This is best for player management.
     **/
    const self = this

    return this.socket.on(events, function(request, socket) {
        // Creating a new player with the request and socket from the world socket listener.
        const player = new Player(request, socket)

        // Kicking a player automatically on closed connection.
        // Defining it here before the <Player> is even passed through the
        // world.on('connection, fn(player)) since it will always happen for every world.
        // This is only necessary if the player exits without being kicked.
        request.on('close', function() { self.kick(player) })    

        // Running world listener and passing through the new player.
        callback(player)
    })
}
World.prototype.add = function(object) {
    /**
     * @purpose Add an object to the world state.
     **/
    if (object instanceof Player) {
        // Item was a player!
        micro.log('[World] '+object.username+' has logged in.')

        // Adding player to current player store.
        return this.players.push(object)
    }

    // if (item instanceof Object)
}
World.prototype.remove = World.prototype.kick = function(object) {
    /**
     * @purpose Remove an object from the world state.
     **/
    if (object instanceof Player) {
        // Object is Player; kicking
        // Removing player from current player store.
        this.players.splice(this.players.indexOf(object), 1)

        if (object.req.readyState < 3) { 
            // Player is either still connecting or connected when this was called, so KICKED
            // Letting player know they are about to be kicked if they are still here.
            object.send('You are about to be kicked!')
        } else {
            // Player decidedly logged out or was kicked.
            micro.log('[World] '+object.username+' has logged out.')
        }

        try {
            // Killing the player's socket.
            object.destroy()
            return 'success'
        } catch (e) {
            util.error(e)
            return 'error'
        }
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

// [EXPORTS]
module.exports = World
