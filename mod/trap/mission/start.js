function start(st) {
    log('=== NEW MISSION ===')
    log('jumping into cyberspace...')
    lab.control.state.transitTo('cyberspace', extend({
        next: function() {
            $.mem.lab.control.mission.start()
        },
    }, st))
}
