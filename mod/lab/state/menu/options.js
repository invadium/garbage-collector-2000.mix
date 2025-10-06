function syncIn(opt) {
    opt[1].current = env.opt.music? 0 : 1
    opt[3].current = env.opt.sfx?   0 : 1
}

function syncOut(opt) {
    const mopt = opt[1]
    env.opt.music = (!!(mopt.options[mopt.current] === 'on'))

    const sopt = opt[3]
    env.opt.sfx = (!!(sopt.options[sopt.current] === 'on'))

    log('music: ' + env.opt.music)
    log('sfx: '   + env.opt.sfx)
}

const options = [
    {
        section: true,
        title: 'music',
        onShow: function() {
            log('syncing in MUSIC')
            syncIn(this.__.items)
        },
        onHide: function() {
            //log('preserving MUSIC settings')
        },
    },
    {
        options: [ 'on', 'off' ],
    },
    {
        section: true,
        title: 'sound',
    },
    {
        options: [ 'on', 'off' ],
    },
    {
        title: 'Back',
        select: function() {
            syncOut(this.__.items)
            this.__.returnBack(true)
            //this.__.focusOn('Credits')
        },
    },
    /*
    {
        title: 'Cancel',
        select: function() {
            this.__.returnBack(true)
            this.__.focusOn('Credits')
        },
    },
    */
]
options.title = 'Options'
options.preservePos = true
