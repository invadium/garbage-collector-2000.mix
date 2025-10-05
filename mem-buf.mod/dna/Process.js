class Process {

    constructor(st) {
        extend(this, {
            pid:  0,

            // TODO increasing sygnal frequency should increase complexity
            sysCallFQ:   .5,

            // TODO increasing target memory usage should increase complexity
            tarMemUsage:  32,
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
        const memUsage = this.__.memUsage()

        let primaryType, secondaryType
        if (memUsage < this.tarMemUsage) {
            // give priority on allocations
            primaryType   = dry.ALLOC
            secondaryType = dry.RELEASE
        } else {
            // give priority on release
            primaryType   = dry.RELEASE
            secondaryType = dry.ALLOC
        }

        let type

        // TODO shortening the gap between primary and secondary should increase chaos and complexity
        //      reduce the gap over time!
        const n = rnd()
        if (n < .8) type = primaryType
        else if (n < .95) type = secondaryType
        else type = dry.FREE

        this.spawnSignal(type)
    }

    evo(dt) {
        if (math.rndf() < this.sysCallFQ * dt) this.sysCall()
    }

}
