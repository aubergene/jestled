const OSC = require('osc-js')

const options = {
    type: 'udp4',
    open: {
        // host: 'localhost',
        host: '0.0.0.0',
        port: 57121
    },
    send: {
        // host: 'localhost',
        host: '0.0.0.0',
        port: 6448
    }
}

const plugin = new OSC.DatagramPlugin(options)
const osc = new OSC({ plugin })

const outMsg = [null, null]

osc.on('/VMC/Ext/Con/Pos', msg => {
    // console.log(msg)

    if (msg.args[0] === 'OculusLeftController') {
        outMsg[0] = msg.args.slice(1)
    }
    if (msg.args[0] === 'OculusRightController') {
        outMsg[1] = msg.args.slice(1)
    }

    if (outMsg[0] && outMsg[1]) {
        const args = outMsg[0].concat(outMsg[1])
        osc.send(new OSC.Message('/wek/inputs', ...args))
        console.log("sending", args)
        outMsg[0] = outMsg[1] = null
    }
})

osc.open()

osc.on('open', () => {
    console.log(`Listening on ${options.open.port} and sending on ${options.send.port}`)
    console.log(osc.status())
})
