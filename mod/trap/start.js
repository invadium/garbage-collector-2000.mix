function start() {
    log('=== STARTED ===')

    if (env.config.warp) {
        // jump directly into the game
        // signal('mission/start')
        trap('mission/start', {
            fadein: 0,
        })
    } else {
        lab.control.state.transitTo('title', {
            fadein: 0,
        })
    }
}
