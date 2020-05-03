const OSC = require('osc-js')
const fs = require('fs')

const writeBuffer = false // write all the data to a CSV on exit
const buffer = []

const options = {
    type: 'udp4',
    open: {
        // host: 'localhost',
        host: '0.0.0.0',
        // port: 57121
        port: 39540
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

// const OSC_ADDRESS = '/VMC/Ext/Con/Pos/Local'
const OSC_ADDRESS = '/VMC/Ext/Con/Pos'

osc.on(OSC_ADDRESS, msg => {
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
        // console.log("sending", args)
        if (writeBuffer) {
            args.unshift(new Date().toISOString())
            buffer.push(args)
        }
        outMsg[0] = outMsg[1] = null
    }
})

osc.open()

osc.on('open', () => {
    console.log(`Listening for Oculus on`, options.open.port, `and sending to Wek on`, options.send.port)
    // console.log(osc.status())
})

const headers = `timestamp lpx lpy lpz lrx lry lrz lrw rpx rpy rpz rrx rry rrz rrw`.split(' ')

process.on('SIGINT', function () {
    console.log('Ctrl-C...');
    if (writeBuffer) {
        buffer.unshift(headers)
        const data = buffer.map(rows => rows.join(",")).join("\n")
        const filename = `${__dirname}/data.csv`
        fs.writeFileSync(filename, data, { encoding: "utf8" })
        console.log(`Written ${filename}`)
    }
    process.exit(2);
});

