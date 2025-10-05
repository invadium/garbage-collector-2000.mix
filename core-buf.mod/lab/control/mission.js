function start() {
    log('[mission-control] starting the mission...')

    // TODO clean the port
    // ...

    const core = lab.port.spawn( dna.Core )
    _.core = core
    lab.port.follow(core, true)

    // spawn some terminals
    for (let i = 0; i < 4; i++) {
        core.attachTerminal( new dna.Terminal() )
    }
}
