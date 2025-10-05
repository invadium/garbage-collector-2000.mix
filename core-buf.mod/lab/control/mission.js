function start() {
    log('[mission-control] starting the mission...')

    lab.port._ls.forEach(node => kill(node))
    id.reset()

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
