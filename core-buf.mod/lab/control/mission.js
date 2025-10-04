function start() {
    log('[mission-control] starting the mission...')

    // TODO clean the port

    const core = lab.port.spawn( dna.Core )
    lab.port.follow(core, true)
}
