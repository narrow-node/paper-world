/**
 * @title paper-world
 * @description Comprised of chat system, coordinate system, and request handlers.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const startMs = new Date().getTime()
const util = require(__dirname+'/toolkit/util')
global.__basedir = __dirname

// [PROTOTYPES]
const World = require('./proto/world')
const Player = require('./proto/player')
const CmdStore = require('./store/commands')
const Commands = require('./proto/commands')

// [START]
const world = new World();
const commands = new Commands();
const cmdStore = new CmdStore(world)

// [FUNCTIONS]
const ready = function() {
    /**
     * @purpose Run operations when world is ready to accept connections.
     **/
    util.log('['+world.name+'] ('+(util.getMS()- startMs)+'ms) The world is now online.')
}
const connection = function(player) {
    /**
     * @purpose Handle a new player connection.
     **/
    world.add(player)

    commands.register(player, ['kickme', 'getListeners', 'players', 'commands'])
        .then(function() {
            // Player is good to execute commands!
            player.send('Welcome!')
        })
}

// Adding all of the commands in Commands Store.
Object.keys(cmdStore).forEach(function(name) {
    commands.add(name, cmdStore[name].tier, cmdStore[name].handler)
})

// [LISTEN]
world.on('connection', connection) 
    .then(ready)







