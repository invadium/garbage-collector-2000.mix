function over(e) {
    if (env.state === 'cyberspace' || !$.mission.inProgress()) return

    log('=== GAME OVER ===')
    lab.control.state.transitTo('gameOver', {
        next: function() {
            $.mission.over()
        }
    })
}
