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
const GAMMA = 0.3

const RENDER_TIMEOUT = 50

const client = new net.Socket();

const p1 = new Point(0.25)
const p2 = new Point(0.75)

// I reverse the range just because my LEDs are arrange with 0 on right hand side due to location of the power supply
const xScale = d3.scaleLinear().range([NUM_LEDS - 1, 0])
const sizeScale = d3.scaleLinear().range([1, 42]).clamp(true)

const colorScale1 = d3.interpolateCubehelix.gamma(GAMMA)("red", "green")
const colorScale2 = d3.interpolateCubehelix.gamma(GAMMA)("green", "violet")

console.log(p1)

module.exports = {
    setLeftHand,
    setRightHand
}

function setPoint(p, { x, size, hue }) {
    p.target = x
    p.size = size
    p.hue = hue
}

function setLeftHand(x, size, hue) {
    setPoint(p1, { x, size, hue })
    // console.log('setLeftHand', p1)
}

function setRightHand(x, size, hue) {
    setPoint(p2, { x, size, hue })
    // console.log('setRightHand', p2)
}

if (require.main === module) {
    // When running directly from command line
    // make random points
    testLoop()
}

function testLoop() {
    setLeftHand({
        x: 0.5 + 0.5 * Math.random(),
        size: Math.random(),
        hue: Math.random(),
        // x: 0.7,
        // size: 0.5,
        // hue: 1,
    })

    setRightHand({
        // x: 0.9,
        // size: 0.5,
        // hue: 1,
        x: 0.5 + 0.5 * Math.random(),
        size: Math.random(),
        hue: Math.random(),
    })

    setTimeout(testLoop, 4000)
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

    // renderConnectionPattern()
    // renderD3Interpolate()
    renderLoop()

    function renderLoop() {
        const cmds = [
            'fill 1,000000',
            renderPoint(p1, 0),
            renderPoint(p2, 1),
            `render`,
        ]
        const out = cmds.join(';\n') + ';\n'
        // console.log(out)
        client.write(out);

        setTimeout(renderLoop, RENDER_TIMEOUT)
    }

})

function formatColor(c) {
    return d3.color(c).formatHex().slice(1).toUpperCase()
}


function renderPoint(p, index) {
    const x = xScale(p.x)
    const size = sizeScale(p.size)

    const colorScale = index ? colorScale2 : colorScale1
    const color = colorScale(p.hue)
    const background = index ? "green" : "red"

    const interpolator = d3.interpolateCubehelix.gamma(GAMMA)(color, background)
    const getColor = (i) => formatColor(interpolator(i / size))
    const out = []

    const combine = "OR"

    for (let i = 0; i < size; i++) {
        out.push(`fill 1,${getColor(i)},${x - i},1,${combine}`)
        out.push(`fill 1,${getColor(i)},${x + i},1,${combine}`)
    }

    return out.join(";")
}

function randomColor() {
    return ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
}

function renderConnectionPattern() {
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
}

function renderD3Interpolate() {
    // const interpolator = d3.interpolateRgb.gamma(GAMMA)("#FF0000", "#0000FF")
    const interpolator = d3.piecewise(d3.interpolateRgb.gamma(GAMMA), ["blue", "green", "red"])
    // const interpolator = d3.piecewise(d3.interpolateCubehelix.gamma(GAMMA), ["red", "green", "blue"])
    // const interpolator = d3.interpolateCubehelix.gamma(GAMMA)("#ff0000", "#0000FF")
    // const interpolator = d3.interpolateCubehelixLong.gamma(GAMMA)("#ff0000", "#0000FF")
    const getColor = (i) => d3.color(interpolator(i / NUM_LEDS)).formatHex().slice(1).toUpperCase()

    const cmds = []
    for (let i = 0; i < NUM_LEDS; i++) {
        cmds[i] = `fill 1,${getColor(i)},${i},1`
    }
    cmds.push('render')
    cmds.push('delay 2000')
    // console.log(cmds)

    client.write(cmds.join(';\n') + ';\n');
}