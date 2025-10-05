function reset() {
    this.time = 0
}

function start() {
    log('[mission-control] starting the mission...')

    lab.port._ls.forEach(node => kill(node))
    ids.reset()
    this.reset()

    defer(() => {
        const core = lab.port.spawn( dna.Core )
        _.core = core
        lab.port.follow(core, true)

        // spawn some terminals
        for (let i = 0; i < 4; i++) {
            core.attachTerminal( new dna.Terminal() )
        }
    })
}

function evo(dt) {
    env.time = $.env.time
    this.time += dt
    env.mtime = '' + floor(this.time * 1000)/1000
}
