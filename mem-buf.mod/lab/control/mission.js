function init() {
    // pin to global
    $.mission = this
}

function clean() {
    // unpin all
    $.core      = null
    $.terminals = null
}

function reset() {
    this.time = 0
}

function start() {
    log('[mission-control] starting...')
    $.env.gameState = 'starting'

    lab.port._ls.forEach(node => kill(node))
    ids.reset()
    this.clean()
    this.reset()

    defer(() => {
        const core = lab.port.spawn( dna.Core )
        $.core = core
        $.terminals = core.terminals
        lab.port.follow(core, true)

        // spawn some terminals
        //const ACTIVE = 4
        const ACTIVE = 1
        for (let i = 0; i < 16; i++) {
            const term = core.attachTerminal( new dna.Terminal() )
            if (i < ACTIVE) term.activate()
        }

        $.env.gameState = 'started'
    })
}

function pause() {
    lab.port.pause()
    lab.control.pause()
    env.pauseTimestamp = env.realTime
    log('[mission-control] paused')
}

function resume() {
    lab.port.resume()
    lab.control.resume()
    log('[mission-control] resumed')
}

function evo(dt) {
    this.time += dt
    env.mtime = '' + floor(this.time * 1000)/1000

    if (rnd() < env.tune.mission.activateTermFQ * dt) $.core.activateNextTerm()
}

function inProgress() {
    return ($.env.gameState === 'started')
}

function over() {
    // TODO gather stats etc...
    // ...
    
    $.env.gameState = 'gameover'
}

