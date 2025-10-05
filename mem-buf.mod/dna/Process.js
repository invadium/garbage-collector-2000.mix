class Process {

    constructor(st) {
        extend(this, {
            pid:  0,

            sysCallFQ: .25,
        }, st)
        this.name = 'process' + this.pid
    }

    spawnSignal(type) {
        const __ = this.__
        if (__.cell.signal) return // can't spawn - another signal is already there

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

    sysAlloc() {
        this.spawnSignal(dry.ALLOC)
    }

    sysRelease() {
        this.spawnSignal(dry.RELEASE)
    }

    sysFree() {
        this.spawnSignal(dry.FREE)
    }

    sysCall() {
        // TODO base on mission time?
        const rate = .5 * (cos($.env.time / (TAU * 2)) + 1)
        const type = rnd() < rate? dry.ALLOC : dry.FREE

        switch(type) {
            case dry.ALLOC:   this.sysAlloc();   break;
            case dry.RELEASE: this.sysRelease(); break;
            case dry.FREE:    this.sysFree();    break;
        }
        //this.spawnSignal(type)
    }

    evo(dt) {
        if (math.rndf() < this.sysCallFQ * dt) this.sysCall()
    }

}
