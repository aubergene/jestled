const OSC = require('osc-js')

const options = {
    receiver: 'ws',         // @param {string} Where messages sent via 'send' method will be delivered to, 'ws' for Websocket clients, 'udp' for udp client
    udpServer: {
        host: '0.0.0.0',    // @param {string} Hostname of udp server to bind to
        // host: 'localhost',    // @param {string} Hostname of udp server to bind to
        // port: 57121,          // @param {number} Port of udp server to bind to
        port: 6449,          // @param {number} Port of udp server to bind to
        exclusive: false      // @param {boolean} Exclusive flag
    },
    udpClient: {
        host: '0.0.0.0',    // @param {string} Hostname of udp client for messaging
        // host: 'localhost',    // @param {string} Hostname of udp client for messaging
        port: 6448           // @param {number} Port of udp client for messaging
    },
    wsServer: {
        // host: '0.0.0.0',    // @param {string} Hostname of WebSocket server
        host: 'localhost',    // @param {string} Hostname of WebSocket server
        port: 8080           // @param {number} Port of WebSocket server
    }
}

const osc = new OSC({ plugin: new OSC.BridgePlugin(options) })

osc.on('open', () => {
    // console.log(`Listening on ${options.open.port} and sending on ${options.send.port}`)
    console.log(`Listening on `)
    console.log(osc.status())

    setInterval(() => {
        osc.send(new OSC.Message('/test', 123))
        console.log('sent')
    }, 1000)
})

osc.open()
