module.exports = {

    onShow: function() {
        log('showing menu')
    },

    onSelect: function(item, i) {
        // catch all selecting events
        log('selected: ' + this.__.itemTitle(item))
    },

    onSwitch: function(item, i) {
        log('switching to: ' + this.__.itemTitle(item))
    },

    onIdle: function() {
        log('user is idle')
    },

    onHide: function() {
        log('hiding menu')
    }, 

    select: function(item, i) {
        // handle select event
        log('handling: ' + this.__.itemTitle(item))
    },

    resize() {
        this.__.adjust()
    },

    mouseDown(e) {
        this.__.mouseSelect()
    },
}
