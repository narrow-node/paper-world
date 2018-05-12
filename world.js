/**
 * @title Paperweight
 * @description Comprised of chat system, coordinate system, and request handlers.
 * @author ethancrist
 **/

'use strict'

// [DEPENDENCIES]
const meta = require('./meta')(true)
const util = require('./util')
const micro = util.micro


const socket = micro.socket({ port: meta.port, ssl: meta.options.ssl })

socket.on('connection', function connection(res) {
    res.on('message', function incoming(message) {
        console.log('received: %s', message);
    })

    res.send('something');
})

return



// [MIDDLEWARE]


// [ENDPOINTS]
micro.get('/', (req, res) => {
    /**
     * @purpose Render the game.
     **/

    // NOTE ON CACHING:
    // The 'cache' model variable below is added to all client-side files like this: client.js?_<cache-number>
    // Doing this forces the browser to treat different cache numbers as "new files", which will force refresh if the number is changed.
    // The cache number will be the MS timestamp that the server started up at: launchMS. 
    // This way, the cache will only update every time the server updates.
    // This ensures that a cache will always be used if possible, but not after a change (better for performance!)
    // P.S. On devMode, we'll never cache by updating the cache number on page load so the devs can always see things updated.
    res.render('skeleton.dot', { cache: meta.isDevMode ? util.getMS() : meta.startMS, world: process.env.WORLD })
})

micro.static('/res', meta.options.viewDir+'/res')

micro.get('/restart', (req, res) => {
    /**
     * @purpose Restart the world after a certain amount of ms.
     * @note Forever will automatically restart after process.exit.
     **/
    //if (!req.session.auth.match('owner|admin')) return;

    var timer = req.query.timer || 0

    res.end('World will restart in ' + timer + 'ms.')

    setTimeout(process.exit, timer)
}) 


// [START]
micro.listen(meta.port, meta.options).then(function() {
    // Application is booted.

    return;
    // Sending a text message in test and production.
    if (!meta.isDevMode) util.sendText('[Paperweight] ' + meta.getStartupMessage());
})


// [EXPORTS]
const World = function() {
    /**
     * @description A new world instance.
     **/
}

module.exports = new World()
