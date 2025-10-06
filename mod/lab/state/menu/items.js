// @depends(/res/txt/label)
const items = [
    {
        title: 'New Game',
        select: function(menu) {
            /*
            const levelOptions = menu.items[2]
            const idx = levelOptions.current || 0
            trap('game/level', {
                level: idx + 1,
            })
            */
            signal('mission/start')
        },
    },
    {
        title: 'Level',
        section: true,
    },
    {
        id:      'levels',
        options:  [],
    },
    {
        title: 'Options',
        submenu: 'options',
    },
    {
        title: 'Credits',
        select: function() {
            lab.control.state.transitTo('credits')
        }
    },
    {
        id:     'resume',
        hidden:  true,
        title:  'Resume Game',
        select: function() {
            lab.control.state.transitTo('cyberspace')
        },
    },
]
items.preservePos = true
items.title = res.txt.label.title
