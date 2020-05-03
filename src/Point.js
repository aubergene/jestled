const MAX_V = 0.02
const MAX_A = 0.004

module.exports = class Point {
    x = 0.5;
    vx = 0;
    ax = 0;
    target = 0.5;
    size = 1;
    hue = 1;

    constructor(x) {
        this.x = x
    }

    update(delta) {
        // console.log(deltas, this)

        const dist = this.target - this.x
        // console.log(dist)
        this.ax = dist * 0.005 * delta
        this.ax = Math.min(MAX_A, this.ax)
        this.ax = Math.max(-MAX_A, this.ax)

        // this.ax = 0.001
        // if (this.target < this.x) this.ax *= -1
        this.vx += this.ax
        this.vx = Math.min(MAX_V, this.vx)
        this.vx = Math.max(-MAX_V, this.vx)

        // this.x += this.vx
        this.x += this.ax

        this.x = Math.max(this.x, 0)
        this.x = Math.min(this.x, 1)
    }


}