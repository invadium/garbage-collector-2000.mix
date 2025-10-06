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
        const ACTIVE = 4
        for (let i = 0; i < 16; i++) {
            const term = core.attachTerminal( new dna.Terminal() )
            if (i < ACTIVE) term.activate()
        }

        $.env.gameState = 'started'
    })
}

function evo(dt) {
    env.time = $.env.time
    this.time += dt
    env.mtime = '' + floor(this.time * 1000)/1000

    if (rnd() < env.tune.mission.activateTermFQ * dt) $.core.activateNextTerm()
}

function inProgress() {
    return ($.env.gameState === 'started')
}
