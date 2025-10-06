const style = {

    color: {
        title:      '#4c60aa',
        background: '#32313b',

        // background: '#463c5e',

        core: {
            low:      hsl(.6,  .4, .35),
            base:     hsl(.6,  .5, .5),
            disabled: hsl(.6,  .15, .4),

            //alloc:    hsl(.6,  .75, .75),
            //release:  hsl(.15, .7,  .65),
            //free:     hsl(.01, .7,  .65),

            // DEBUG highlight signals
            alloc:   '#00ffff',
            release: '#ffff00',
            free:    '#ff8000',

            locked:   hsl(.6,  .25, .25),
            marked:   hsl(.2,  .6, .4),
            focused:  hsl(.01, .6, .4),
        },

        credits: {
            front: '#5efdf7',
            back:  '#4593a5'
        },

        menu: {
            title: '/core/base',
        },

        chasm: [
            '#85daeb',
            '#5fc9e7',
            '#5fa1e7',
            '#5f6ee7',
            '#4c60aa',
            '#444774',
            '#32313b',
            '#463c5e',
            '#5d4776',
            '#855395',
            '#ab58a8',
            '#ca60ae',
            '#f3a787',
            '#f5daa7',
            '#8dd894',
            '#5dc190',
            '#4ab9a3',
            '#4593a5',
            '#5efdf7',
            '#ff5dcc',
            '#fdfe89',
            '#ffffff',
        ],
    },

    font: {
        main: {
            family: 'basis33',
            size:   24,
        },
        titleBar: {
            family: 'basis33',
            size:   32,
        },
        title: {
            family: 'basis33',
            size:   64,
        },
        menu: {
            family: 'basis33',
            size:   32,
        },
        menuHigh: {
            family: 'basis33',
            size:   36,
        },
        credits: {
            family: 'basis33',
            size:   48,
        },

        debug: {
            family: 'basis33',
            size: 24,
        },
        coreDebug: {
            family: 'basis33',
            size: 8,
        },
        memDebug: {
            family: 'basis33',
            size: 14,
        },
    }
}

function classifyFonts() {
    for (let id in style.font) {
        const font = style.font[id]
        font.id = id
        font.head = font.size + 'px ' + font.family
    }
}

function walk(node, fn, path) {
    path = path ?? ''
    Object.keys(node).forEach(key => {
        const val = node[key]
        if (isObj(val)) {
            walk(val, fn, path + '/' + key)
        } else {
            fn(key, val, path, node)
        }
    })
}

function unfoldColors() {
    const colorExt = {
        id:  {},
        loc: {}
    }

    // build catalog
    walk(style.color, (key, val, path, node) => {
        if (isStr(val) && val.startsWith('#')) {
            colorExt.id[key] = val
            colorExt.loc[path + '/' + key] = val
        }
    })

    // resolve
    walk(style.color, (key, val, path, node) => {
        if (isStr(val)) {
            if (val.startsWith('.')) {
                // resolve id
                const id = val.substring(1)
                const cval = colorExt.id[id]
                if (!cval) throw `can't resolve color for [${path}/${key}]: ${val}`

                node[key] = cval
                colorExt.loc[path + '/' + key] = cval

            } else if (val.startsWith('/')) {
                // resolve locator
                const cval = colorExt.loc[val]
                if (!cval) throw `can't resolve color for [${path}/${key}]: ${val}`

                node[key] = cval
                colorExt.loc[path + '/' + key] = cval
            }
        } 
    })

    extend(style.color, colorExt)
}

(function setupStyles() {
    classifyFonts()
    unfoldColors()
})()

