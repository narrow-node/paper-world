/**
 * @title commands.js
 * @description Commands handler.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const util = require(__basedir+'/toolkit/util')
const micro = util.micro

// [PROTOTYPES]
const Commands = function() {
    /**
     * @description A new command set.
     **/
    this.name = 'Commands'

    util.log('['+this.name+'] Initializing...')

    // Initializing the list of commands.
    this.list = { }

    // Asynchronizing all functions in this prototype.
    util.asyncProto(this)
}
Commands.prototype.add = function(name, tier, handler) {
    /**
     * @purpose Add a command to the commands data store.
     * @options ##### `name`
     *          Type: `String`
     *          The name of the command to add.
     *          ##### `tier`
     *          Type: `Number` Tiers: `0` - Owner, `1` - Admin, `2` - Moderator, `3` - Any
     *          The privileges for the command.
     *          ##### `handler`
     *          Type: `Function`
     *          The function to be run when the command is executed.
     *          IMPORTANT: When calling this function add a return inside the handler!
     *          Reason: The string that returns in the handler is automatically logged as a response for the command.
     **/
    micro.log('[Commands] Added '+name+' command.')

    // FORMAT IN THE LIST: { <cmdName>: { tier: <tier>, handler: <handler> }, <cmd2>: { ... } }
    this.list[name] = {
        tier: tier,
        handler: handler
    }
}
Commands.prototype.register = function(player, commands) {
    /**
     * @purpose Listen for a set of commands for a player.
     * @usage commands.register(adminPlayer, ['adminCommand', 'ownerCommand'])
     *        commands.register(player, ['players', 'forum'])
     * @note IMPORTANT: If you don't specify any commands, all will be added!
     **/
    const self = this

    // Falling back on all commands if none were specified.
    commands = commands || Object.keys(this.list)

    // For every command queued for registry, set a player event for it.
    commands.forEach(function(registeredCmd) {
        if (!self.list[registeredCmd] || typeof(self.list[registeredCmd].handler) !== 'function') {
            // Skipping if the command registered was not added to the commands list first. (See: Commands.add)
            return micro.error('['+self.name+'] Command '+registeredCmd+' does not exist, so it was not registered.')
        }

        // Skipping if the command attempting to be registered exceeds the player's tier.
        if (self.list[registeredCmd].tier < player.tier) {
            return micro.error('['+self.name+'] Command '+registeredCmd+' exceeds the tier for '+player.username+'.')
        }

        // Logging that this command will be registered.
        micro.log('[Commands] Registered '+registeredCmd+' command for '+player.username+'.')
    })

    // Registering alls commands with the callback being self.list.<command>().
    // NOTE: This is called every time a player runs a command!
    player.on('command', function(calledCmd) {
        // Splitting each word of the command into an array so it can be parsed easily.
        const cmdWords = calledCmd.split(' ')

        // Command name is the first word typed in the command.
        // `kick` in `kick playername`
        const cmdName = cmdWords[0]

        // Parsing command arguments: every word after the first.
        // ['player1, 'player2'] in `kick player1 player2`
        const cmdArgs = cmdWords.splice(1, cmdWords.length)

        // The message to be logged for each command request.
        const cmdMessage = '['+player.username+']['+self.name+'] '+cmdName+(cmdArgs.length > 0 ? ' ['+cmdArgs+']' : '')

        // Using getList() instead of self.list so that it updates every time a command is called.
        self.getList().then(function(list) {
            // Skipping if:
            //     1) The command being called by the player is unregistered.
            //     2) The command being called exceeds the player's tier.
            if (commands.indexOf(cmdName) < 0 || list[cmdName].tier < player.tier) {
                micro.log(cmdMessage+' => unregistered')

                return player.send('Invalid command.') 
            }

            // Executing command in the list by running the registered handler for this command name.
            list[cmdName].handler(player, cmdArgs).then(function(cmdRes) {
                // Logging that command was executed.
                // FORMAT: [<username>][Commands] <cmdName> [<cmdArgs>] => cmdRes
                micro.log(cmdMessage+(cmdRes ? ' => '+cmdRes : ''))
            })
        })
   })
}
Commands.prototype.unregister = function(player, commands) {
    /**
     * @purpose Stop listening for a set of commands for a player.
     * @usage commands.unregister(player, ['adminCommand', 'ownerCommand'])
     *        commands.unregister(bannedPlayer, ['players', 'forum'])
     * @note IMPORTANT: If you don't specify any commands, all will be added!
     **/

    // Falling back on all commands if none were specified.
    commands = commands || Object.keys(this.list)

    // For every command in the list, set a player event for it.
    commands.forEach(function(command) {
        micro.log('[Commands] Unregistered '+command+' event for player.')

        // Setting player event for this command with the callback being self.list.<command>().
        player.off('command')
    })

}
Commands.prototype.getList = function() {
    /**
     * @purpose Get updated list of current commands that can be (un)registered.
     **/
    return this.list
}


// [EXPORTS]
module.exports = Commands
