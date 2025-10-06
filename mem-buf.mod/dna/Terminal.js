class Terminal {

    constructor(st) {
        const pid = ++ids.terminal
        augment(this, {
            pid:   pid,
            name: 'terminal' + pid,

            stat: {
                signals:     0,
                allocations: 0,
                releases:    0,
                free:        0,
            },

            dead: false,
        }, st)
        this.process = new dna.Process({
            __:  this,
            pid: this.pid,
        })
        this.disable()
    }

    memUsage() {
        return this.__.memUsage(this)
    }

    liveSignals() {
        return this.__.liveSignals(this.pid)
    }

    activate() {
        this.disabled = false
    }

    halt(cause) {
        this.error = true
        this.disabled = true
    }

    disable() {
        this.disabled = true
    }

    emitSignal(signal) {
        if (!signal) return false

        const emitted = this.cell.acceptSignal(signal)
        if (emitted) {
            this.__.attachSignal(signal)
            this.stat.signals++
            switch(signal.type) {
                case dry.ALLOC:   this.stat.allocations++; break;
                case dry.RELEASE: this.stat.releases++;    break;
                case dry.FREE:    this.stat.free++;        break;
            }
        }

        return emitted
    }

    evo(dt) {
        this.process.evo(dt)
    }

    draw() {
        const cell = this.cell

        const lw = 2
        lineWidth(lw)
        if (this.error) stroke(env.color.core.error)
        else if (this.disabled) stroke( env.color.core.disabled )
        else stroke( env.color.core.base )

        const cx = this.__.cx( cell.x ),
              cy = this.__.cy( cell.y )
        let dx = 0, dy = 0
        switch(cell.dir) {
            case dry.NORTH:
                dy = -1
                break
            case dry.WEST:
                dx = -1
                break
            case dry.SOUTH:
                dy = 1
                break
            case dry.EAST:
                dx = 1
                break
        }
        const linkLen = ctx.width
        line(cx, cy, cx + dx * linkLen, cy + dy * linkLen)

        if (env.probeResUtil && !this.disabled) {
            const __ = this.__,
                  blocksAllocated = __.memAllocated(this.pid),
                  blocksUsed      = __.memUsage(this),
                  liveSignals     = __.liveSignals(this.pid),
                  usage           = `'${blocksAllocated}/${blocksUsed}[${liveSignals}]`

            fill('#ff8000')
            baseMiddle()
            alignCenter()
            font(env.style.font.memDebug.head)

            const shift = 2 * this.__.cellSize
            text(`#${this.pid}:${usage}`, cx + dx*shift, cy + dy*shift)
        }
    }

}
