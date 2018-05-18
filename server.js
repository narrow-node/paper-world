/**
 * @title paper-world
 * @description Comprised of chat system, coordinate system, and request handlers.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
global.__basedir = __dirname

// [PROTOTYPES]
const World = require('./proto/world')
const Player = require('./proto/player')

// [START]
const world = new World();
world.on('connection', function(player) {
    world.add(player)
    
    player.on('command', function(message) {
        world.yell('Fuckwit commanded: '+message)
    })

    player.on('close', function() {
        world.kick(player)
    })
})


