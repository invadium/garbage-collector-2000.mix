class Terminal {

    constructor(st) {
        augment(this, {
            name: 'terminal' + (++id.terminal)
        }, st)
    }

    spawnSignal() {
        if (this.cell.signal) return // can't spawn - another signal is already there

        // TODO base on mission time?
        const rate = .5 * (cos($.env.time / (TAU * 2)) + 1)
        const type = rnd() < rate? dry.ALLOC : dry.FREE

        const signal = this.__.attachSignal( new dna.Signal({
            type:   type,
            source: this,
            ttl:    7 + RND(20),
        }) )
        this.cell.signal = signal
        signal.cell = this.cell
        log(`[${this.name}] -> [${signal.name}:${signal.type}]`)
    }

    evo(dt) {
        if (math.rndf() < .25 * dt) this.spawnSignal()
    }

    draw() {
        const cell = this.cell

        const lw = 2
        lineWidth(lw)
        stroke( env.style.color.core.base )

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
    }

}
