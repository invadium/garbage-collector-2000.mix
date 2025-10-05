class Cell {

    constructor(st) {
        const id = ++ids.cell
        extend(this, {
            name: 'cell' + id,
            id:    id,
            pid:   0,
            x:     0,
            y:     0,
            val:   0,
            sel:   0,

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

    attachTerminal(term) {
        if (this.term || this.locked) return false

        this.term = term
        term.cell = this

        this.allocate(term.pid)
        this.lock()

        return true
    }

    isAllocatable() {
        return (this.val === 0 && !this.locked)
    }

    allocate(pid) {
        if (this.val !== 0) return false

        this.val = 1
        this.sel = 0
        this.pid = pid || 0

        return true
    }

    isFreeable() {
        return (this.val !== 0 && !this.locked)
    }

    free() {
        if (this.val === 0 || this.locked) return false

        this.val = 0
        this.sel = 0
        this.pid = 0

        return true
    }

    lock() {
        if (this.val === 0) return false

        this.locked = true

        return true
    }

    poke() {
        // log(`touching @[${ix}:${iy}]`)

        if (this.val === 0) {
            // === free cell ===
            if (env.probeAlloc) {
                // DEBUG create a cell on LMB double click
                if ($.env.time - this.lastTouch < env.tune.doubleClickTimeout) {
                    this.allocate(0)
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

    kill() {
        if (this.val === 0 || this.locked) return false

        this.val = 0
        this.sel = 0

        if (this.signal) this.signal.kill()
        // TODO vfx and potential damage to the process (SEG_FAULT)
        // ...

        return true
    }
}
