/**
 * @title Commands Store
 * @description All static data for commands.
 * @author ethancrist
 **/

// [DEPENDENCIES]
var world

// [STORE]
const Store = {
    kickme: {
        tier: 2,
        handler: function(caller, args) {
            /**
             * @description Player requested to kick themself.
             **/
            return world.kick(caller)
        }
    },
    players: {
        tier: 3,
        handler: function(caller, args) {
            /**
             * @description Get the number of players currently connected.
             **/
            return caller.send(world.players.length, true)
        }
    },
    commands: {
        tier: 3,
        handler: function(caller, args) {
            /**
             * @description Player requested all of the commands available to them.
             **/
            const availCommands = Object.keys(commands.list)
            return caller.send(availCommands)
        }
    }
}

// [PROTOTYPE]
const Clerk = function(worldCaller) {
    /**
     * @purpose Access the store.
     **/
    world = worldCaller

    return Store
}

// [EXPORTS]
module.exports = Clerk
