class Process {

    constructor(st) {
        extend(this, {
            pid:  0,
        }, st)
        this.name = 'process' + this.pid
    }

    spawnSignal() {
        const __ = this.__
        if (__.cell.signal) return // can't spawn - another signal is already there

        // TODO base on mission time?
        const rate = .5 * (cos($.env.time / (TAU * 2)) + 1)
        const type = rnd() < rate? dry.ALLOC : dry.FREE

        const signal = new dna.Signal({
            type:    type,
            source:  __,
            process: this,
            pid:     this.pid,
            ttl:     7 + RND(20),
        })
        const emitted = __.emitSignal(signal)

        // signal.cell = this.cell
        //log(`[${this.name}] -> [${signal.name}:${signal.type}]`)
    }

    evo(dt) {
        if (math.rndf() < .25 * dt) this.spawnSignal()
    }

}
