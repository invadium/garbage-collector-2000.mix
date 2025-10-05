function clean() {
    // unpin all
    _.core      = null
    _.terminals = null
}

function reset() {
    this.time = 0
}

function start() {
    log('[mission-control] starting the mission...')

    lab.port._ls.forEach(node => kill(node))
    ids.reset()
    this.clean()
    this.reset()

    defer(() => {
        const core = lab.port.spawn( dna.Core )
        _.core = core
        _.terminals = core.terminals
        lab.port.follow(core, true)

        // spawn some terminals
        const ACTIVE = 4
        for (let i = 0; i < 16; i++) {
            const term = core.attachTerminal( new dna.Terminal() )
            if (i < ACTIVE) term.activate()
        }
    })
}

function evo(dt) {
    env.time = $.env.time
    this.time += dt
    env.mtime = '' + floor(this.time * 1000)/1000
}
