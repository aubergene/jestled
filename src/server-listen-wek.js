const OSC = require('osc-js')
const { setLeftHand, setRightHand } = require('./leds')

const options = {
    type: 'udp4',
    open: {
        // host: 'localhost',
        host: '0.0.0.0',
        port: 12000 // default out from Wekinator
    }
}

const plugin = new OSC.DatagramPlugin(options)
const osc = new OSC({ plugin })

osc.on('/wek/outputs', msg => {
    console.log(msg)
    let [lX, lSize, lHue, rX, rSize, rHue] = msg.args

    setLeftHand(lX, lSize, lHue)
    setRightHand(rX, rSize, rHue)
})

osc.open()

osc.on('open', () => {
    console.log(`Listening for Wek on`, options.open.port)
    // console.log(osc.status())
})

