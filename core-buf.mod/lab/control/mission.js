function start() {
    log('[mission-control] starting the mission...')

    // TODO clean the port

    lab.port.spawn( dna.Core )
}
