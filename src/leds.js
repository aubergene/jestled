const net = require('net');
const { performance } = require('perf_hooks');
const Point = require('./Point');
const d3 = require('d3')

const RPI_HOST = '10.0.1.7'
const RPI_PORT = 9999
const NUM_LEDS = 300
const INVERT = 0
const MAX_BRIGHTNESS = 255
// const MAX_BRIGHTNESS = 50
const GAMMA = 0.2

const RENDER_TIMEOUT = 20

const client = new net.Socket();

const p1 = new Point(0.25)
const p2 = new Point(0.75)

let blobSize = 6
let color = randomColor()
console.log(p1, p2)

module.exports = {
    setLeftHandTarget,
    setRightHandTarget
}

function setLeftHandTarget(t) {
    p1.target = t
    // blobSize = Math.floor(1 + Math.random() * 3) * 2
    // color = randomColor()
    console.log('setLeftHandTarget', t, ' blobSize', blobSize)
}

function setRightHandTarget(t) {
    p2.target = t
    // blobSize = Math.floor(1 + Math.random() * 3) * 2
    // color = randomColor()
    console.log('setRightHandTarget', t)
}

if (require.main === module) {
    // When running directly from command line
    // make random points
    testLoop()
}

function testLoop() {
    // setLeftHandTarget(0.5 + Math.random() / 5)
    setLeftHandTarget(Math.random())
    setRightHandTarget(Math.random())
    setTimeout(testLoop, 5000)
}


let lastTick = performance.now()

mainLoop()
function mainLoop() {
    const now = performance.now()
    const delta = now - lastTick
    lastTick = now
    p1.update(delta)
    p2.update(delta)

    // setTimeout(mainLoop, 1000)
    setImmediate(mainLoop)
}

client.connect(RPI_PORT, RPI_HOST, () => {
    console.log('Connected');

    const cmds = [
        `setup 1,${NUM_LEDS},3,${INVERT},${MAX_BRIGHTNESS}`,
        'init',
        'fill 1,FF0000',
        'render',
        'delay 100',
        'fill 1,00FF00',
        'render',
        'delay 100',
        'fill 1,0000FF',
        'render'
    ]

    client.write(cmds.join(';\n') + ';\n');


    // const interpolator = d3.interpolateRgb.gamma(GAMMA)("#FF0000", "#0000FF")
    const interpolator = d3.piecewise(d3.interpolateRgb.gamma(GAMMA), ["red", "green", "blue", "#f90"])
    // const interpolator = d3.piecewise(d3.interpolateCubehelix.gamma(GAMMA), ["red", "green", "blue"])
    // const interpolator = d3.interpolateCubehelix.gamma(GAMMA)("#ff0000", "#0000FF")
    // const interpolator = d3.interpolateCubehelixLong.gamma(GAMMA)("#ff0000", "#0000FF")
    const getColor = (i) => d3.color(interpolator(i / NUM_LEDS)).formatHex().slice(1).toUpperCase()

    const cmds2 = []
    for (let i = 0; i < NUM_LEDS; i++) {
        cmds2[i] = `fill 1,${getColor(i)},${i},1`
    }
    cmds2.push('render')
    cmds2.push('delay 500')
    console.log(cmds2)

    client.write(cmds2.join(';\n') + ';\n');

    renderLoop()

    function renderLoop() {
        setTimeout(renderLoop, RENDER_TIMEOUT)

        const cmds = [
            'fill 1,000000',
            drawPoint(p1, 0),
            drawPoint(p2, 1),
            `render`,
        ]
        const out = cmds.join(';\n') + ';\n'
        // console.log(out)
        client.write(out);
    }

})

function makeGradient(x, size, thing) {
    const interpolator = d3.interpolateCubehelix.gamma(GAMMA)("#FF0000", "#000011")
    const getColor = (i) => d3.color(interpolator(i / size)).formatHex().slice(1).toUpperCase()
    const out = []

    // const combine = thing ? "AND" : "="
    const combine = "OR"

    for (let i = 0; i < size; i++) {
        out.push(`fill 1,${getColor(i)},${x - i},1,${combine}`)
        out.push(`fill 1,${getColor(i)},${x + i},1,${combine}`)
    }

    return out.join(";")
}


function drawPoint(p, thing) {
    const x = Math.floor(p.x * (NUM_LEDS - 1))
    const tx = Math.floor(p.target * (NUM_LEDS - 1))

    return makeGradient(x, blobSize, thing);
}

function randomColor() {
    return ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
}