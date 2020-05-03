const MAX_V = 0.02
const MAX_A = 0.004

module.exports = class Point {
    constructor(x) {
        this._x = x
        this.vx = 0
        this.ax = 0
        this._target = x
        this._size = 0
    }

    get x() {
        return this._x
    }

    get target() {
        return this._target
    }

    set target(t) {
        // console.log(this)
        this._target = t
    }

    set size(d) {
        this._size = d
    }

    update(delta) {
        // console.log(deltas, this)
        // console.log(delta)

        const dist = this._target - this._x
        // console.log(dist)
        this.ax = dist * 0.005 * delta
        this.ax = Math.min(MAX_A, this.ax)
        this.ax = Math.max(-MAX_A, this.ax)

        // this.ax = 0.001
        // if (this._target < this._x) this.ax *= -1
        this.vx += this.ax
        this.vx = Math.min(MAX_V, this.vx)
        this.vx = Math.max(-MAX_V, this.vx)

        // this._x += this.vx
        this._x += this.ax

        this._x = Math.max(this._x, 0)
        this._x = Math.min(this._x, 1)
    }


}