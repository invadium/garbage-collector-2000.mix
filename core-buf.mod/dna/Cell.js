class Cell {

    constructor(st) {
        extend(this, {
            id:  0,
            x:   0,
            y:   0,
            v:   0,
            sel: 0,

            signal:    null,
            lastTouch: 0,
            locked:    false,
        }, st)

        this.adjustDir()
    }

    // adjust the edge flag and direction setting
    adjustDir() {
        const { x, y } = this
        const { cw, ch } = this.__

        if (x === 0 && y !== 0 && y !== ch - 1) {
            this.edge = true
            this.dir  = dry.WEST
        }
        if (x === cw - 1 && y !== 0 && y !== ch - 1) {
            this.edge = true
            this.dir  = dry.EAST
        }
        if (y === 0 && x !== 0 && x !== cw - 1) {
            this.edge = true
            this.dir  = dry.NORTH
        }
        if (y === cw - 1 && x !== 0 && x !== cw - 1) {
            this.edge = true
            this.dir  = dry.SOUTH
        }
    }

    isAllocatable() {
        return (this.v === 0 && !this.locked)
    }

    allocate() {
        if (this.v !== 0) return false

        this.v   = 1
        this.sel = 0

        return true
    }

    isFreeable() {
        return (this.v !== 0 && !this.locked)
    }

    free() {
        if (this.v === 0 || this.locked) return false

        this.v   = 0
        this.sel = 0

        return true
    }

    lock() {
        if (this.v === 0) return false

        this.locked = true

        return true
    }

    poke() {
        // log(`touching @[${ix}:${iy}]`)

        if (this.v === 0) {
            // === free cell ===
            if (env.probeAlloc) {
                // DEBUG create a cell on LMB double click
                if ($.env.time - this.lastTouch < env.tune.doubleClickTimeout) {
                    this.allocate()
                }
            }

        } else if (!this.locked) {
            // mark
            if (this.sel === 0) this.sel = 1
            else if (this.sel === 1) this.sel = 2
            else this.sel = 0
        }
        this.lastTouch = $.env.time
    }
}
