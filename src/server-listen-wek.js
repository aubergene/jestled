const OSC = require('osc-js')
const { setLeftHandTarget, setRightHandTarget } = require('./leds')

const options = {
    type: 'udp4',
    open: {
        // host: 'localhost',
        host: '0.0.0.0',
        // port: 57121
        port: 12000
    }
}

const plugin = new OSC.DatagramPlugin(options)
const osc = new OSC({ plugin })

let prevLeftHandX, prevRightHandX

osc.on('/wek/outputs', msg => {
    // console.log(msg)
    let [leftHandX, rightHandX, blah3, blah4, blah5] = msg.args

    leftHandX = leftHandX.toFixed(3)
    if (prevLeftHandX !== leftHandX) {
        setLeftHandTarget(leftHandX)
        prevLeftHandX = leftHandX
    }

    rightHandX = rightHandX.toFixed(3)
    if (prevRightHandX !== rightHandX) {
        setRightHandTarget(rightHandX)
        prevRightHandX = rightHandX
    }
})

osc.open()

osc.on('open', () => {
    console.log(`Listening for Wek on`, options.open.port)
    // console.log(osc.status())
})

