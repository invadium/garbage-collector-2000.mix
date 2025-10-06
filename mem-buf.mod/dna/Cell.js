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

            links:      [],
            signal:     null,
            locked:     false,

            _lastTouch: 0,
            _visited:   0,
            _smellId:   0,

            log:        [],
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

    attachLink(link) {
        this.links.push(link)
        if (env.traceCells) this.log.push(`[${env.mtime}] added link [${link.name}]`)
    }

    detachLink(link) {
        const i = this.links.indexOf(link)
        if (i >= 0) {
            this.links.splice(i, 1)
            if (env.traceCells) this.log.push(`[${env.mtime}] detached link [${link.name}]`)
        }
    }

    freshLinks(excludeId) {
        return this.links.filter(l => l._smellId !== excludeId)
    }

    freshLinks(excludeId) {
        return this.links.filter(l => l._smellId === 0)
    }

    rawLinks() {
        return this.links.filter(l => l._smellId === 0)
    }

    walkConnected(fn) {
        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i]
            const linkedCell = link.origin === this? link.dest : link.origin
            fn(linkedCell)
        }
    }

    acceptSignal(signal) {
        if (this.signal) return false

        this.signal = signal
        signal.setHolder(this)

        return true
    }

    releaseSignal() {
        this.signal = null
    }

    isSignaling() {
        return (this.signal !== null)
    }

    isFree() {
        return (this.val === 0)
    }

    isAllocatable() {
        return (this.val === 0 && !this.locked)
    }

    allocate(pid) {
        if (this.val !== 0) return false

        this.val = 1
        this.sel = 0
        this.pid = pid || 0
        if (env.traceCells) this.log.push(`[${env.mtime}] allocated`)

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
        if (env.traceCells) this.log.push(`[${env.mtime}] free`)

        const bakLinks = this.links
        this.links = []
        bakLinks.forEach(link => link.kill())

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
                if ($.env.time - this._lastTouch < env.tune.doubleClickTimeout) {
                    this.allocate(0)
                }
            }

        } else if (!this.locked) {
            // mark
            if (this.sel === 0) this.sel = 1
            else if (this.sel === 1) this.sel = 2
            else this.sel = 0
        }
        this._lastTouch = $.env.time
    }

    /*
    kill() {
        if (this.val === 0 || this.locked) return false

        this.val = 0
        this.sel = 0

        if (this.signal) this.signal.kill()
        // TODO vfx and potential damage to the process (SEG_FAULT)
        // ...

        return true
    }
    */

    toString() {
        const v = this.val? '*' : ''
        let l = ''
        for (let i = 0; i < this.links.length; i++) l += '-'
        return `[${this.name}@${this.x}:${this.y}|${v}${l}]`
    }
}
